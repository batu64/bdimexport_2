// FAZ_4 4.2 — gece bakım job'ı: TTL silme (rss_news, ai_jobs) + lead retention (C3) + haftalık satır sayısı raporu.
// DETERMİNİSTİK: AI/model çağrısı YOK. Her silme `withAudit` ile audit satırıyla AYNI D1 batch'inde çalışır;
// hiç satır silinmediyse ne silme ne audit yazılır (boş audit = sahte kayıt).
// Audit değerleri PII taşımaz: yalnız sayı + kesim tarihi (lead payload'u asla audit'e girmez).
import { withAudit, type D1Like, type D1PreparedLike } from "../../../app/admin/audit";
import type { Env } from "./types";
import { sqlTime } from "./ingest";

/** rss_news satırı expires_at (fetched_at + 72h) geçtiğinde silinir — ingest.ts TTL_HOURS ile aynı kural. */
export const RSS_TTL_HOURS = 72;
/** lead saklama süresi — C3. KVKK metni sonra eşitlenecek; şimdilik 365 gün varsayım (ERTELENEN C3). */
export const LEAD_RETENTION_DAYS = 365;
/** Tamamlanmış (done/failed/blocked) ai_jobs kayıtları bu kadar gün sonra silinir. ai_jobs'ta expires_at YOK; varsayım. */
export const AI_JOB_RETENTION_DAYS = 30;

/** Yalnız gece job'ını tetikleyen cron ifadesi (02:00 TR = 23:00 UTC). Diğer cron'lar ingest'e gider. */
export const NIGHTLY_CRON = "0 23 * * *";

const DAY_MS = 86_400_000;
const TR_OFFSET_MS = 3 * 3_600_000;

export interface PurgeResult {
  table: string;
  deleted: number;
  cutoff: string;
  audited: boolean;
}

export interface MaintenanceSummary {
  started_at: string;
  purges: PurgeResult[];
  weekly_report: Record<string, number> | null;
}

/**
 * Tek bir kesim-silme: önce sayım, sonra mutasyon + audit AYNI batch'te (withAudit).
 * Sayım ile silme arasında yeni satır eklenirse bile eklenenler kesimden yeni olduğu için sayıma girmez → sayı kararlı.
 * Sayı 0 ise hiçbir şey yazılmaz.
 */
async function purge(
  d1: D1Database,
  table: string,
  countSql: string,
  deleteSql: string,
  cutoff: string,
  entity: { type: string; id: string; action: string },
  nowIso: string,
): Promise<PurgeResult> {
  const row = await d1.prepare(countSql).bind(cutoff).first<{ n: number }>();
  const n = Number(row?.n ?? 0);
  if (n === 0) return { table, deleted: 0, cutoff, audited: false };
  const stmt = d1.prepare(deleteSql).bind(cutoff) as unknown as D1PreparedLike;
  const applied = await withAudit(d1 as unknown as D1Like, [stmt], {
    actor: "system",
    action: entity.action,
    entity_type: entity.type,
    entity_id: `${entity.id}:${nowIso.slice(0, 10)}`,
    old_value: { cutoff },
    new_value: { deleted: n, table },
  });
  return { table, deleted: applied ? n : 0, cutoff, audited: applied };
}

/** Haftalık D1 satır sayısı raporu (boyut proxy'si — D1 SQL'den bayt boyutu vermez). */
const REPORT_TABLES = ["partners", "leads", "contents", "rss_news", "keywords", "ai_jobs", "analytics_daily", "admin_actions", "settings"] as const;
async function weeklyReport(d1: D1Database): Promise<Record<string, number>> {
  const out: Record<string, number> = {};
  for (const t of REPORT_TABLES) {
    const r = await d1.prepare(`SELECT COUNT(*) AS n FROM ${t}`).first<{ n: number }>();
    out[t] = Number(r?.n ?? 0);
  }
  return out;
}

/**
 * Gece bakım. `now` enjekte edilir (yaş testi için). Her silme kendi batch'inde atomiktir;
 * biri hata verirse exception yukarı çıkar (sessiz yutulmaz).
 */
export async function runMaintenance(env: Env, now = new Date()): Promise<MaintenanceSummary> {
  const nowIso = now.toISOString();
  const d1 = env.DB;
  const purges: PurgeResult[] = [];

  // 1) rss_news TTL: expires_at < şimdi  (fetched_at + 72h → 71 saat yaşta durur, 73 saat yaşta silinir)
  purges.push(
    await purge(
      d1,
      "rss_news",
      "SELECT COUNT(*) AS n FROM rss_news WHERE expires_at < ?",
      "DELETE FROM rss_news WHERE expires_at < ?",
      sqlTime(now.getTime()),
      { type: "rss_news", id: "ttl", action: "ttl_purge" },
      nowIso,
    ),
  );

  // 2) ai_jobs: yalnız tamamlanmış (done/failed/blocked) ve created_at'i eski olanlar. pending/running SİLİNMEZ.
  purges.push(
    await purge(
      d1,
      "ai_jobs",
      "SELECT COUNT(*) AS n FROM ai_jobs WHERE status IN ('done','failed','blocked') AND created_at < ?",
      "DELETE FROM ai_jobs WHERE status IN ('done','failed','blocked') AND created_at < ?",
      sqlTime(now.getTime() - AI_JOB_RETENTION_DAYS * DAY_MS),
      { type: "ai_jobs", id: "retention", action: "retention_purge" },
      nowIso,
    ),
  );

  // 3) leads retention (C3): created_at < şimdi − 365 gün. Silme audit'li; payload audit'e GİRMEZ.
  purges.push(
    await purge(
      d1,
      "leads",
      "SELECT COUNT(*) AS n FROM leads WHERE created_at < ?",
      "DELETE FROM leads WHERE created_at < ?",
      sqlTime(now.getTime() - LEAD_RETENTION_DAYS * DAY_MS),
      { type: "leads", id: "retention", action: "lead_retention_purge" },
      nowIso,
    ),
  );

  // 4) Haftalık D1 satır raporu — Türkiye saatine göre Pazartesi'nin gece job'ında (Pazartesi 02:00 TR).
  const trDay = new Date(now.getTime() + TR_OFFSET_MS).getUTCDay();
  const weekly = trDay === 1 ? await weeklyReport(d1) : null;
  if (weekly) console.log(JSON.stringify({ event: "d1_row_report", at: nowIso, rows: weekly }));
  for (const p of purges) console.log(JSON.stringify({ event: "purge", at: nowIso, ...p }));

  return { started_at: nowIso, purges, weekly_report: weekly };
}

/** Cron ifadesine göre yönlendirme: gece job'ı → bakım, diğerleri → ingest (saatlik). */
export function isNightly(cron: string): boolean {
  return cron.trim() === NIGHTLY_CRON;
}
