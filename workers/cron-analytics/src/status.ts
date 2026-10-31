// FAZ_6 6.5 — kaynak entegrasyon durumu (migration 0008 integration_status). Admin API (meta-ads.v1) "bağlı değil / pasif / hata" ayrımını
// buradan okur; analytics_daily'de satır olmaması tek başına bu ayrımı yapamaz. Değer/sır İÇERMEZ (yalnız durum + kısa açıklama).
import type { Env } from "./types";
import type { MetaSyncStatus } from "./sync";
import { sendAlert } from "./alert";

export const STATUS_SQL = {
  upsert: `INSERT INTO integration_status (source, status, detail, last_day, checked_at, last_ok_at) VALUES (?, ?, ?, ?, ?, ?)
           ON CONFLICT(source) DO UPDATE SET status = excluded.status, detail = excluded.detail, last_day = excluded.last_day,
             checked_at = excluded.checked_at, last_ok_at = COALESCE(excluded.last_ok_at, integration_status.last_ok_at)`,
} as const;

const sqlTs = (d: Date) => d.toISOString().slice(0, 19).replace("T", " ");

/** Cron çalışması başına bir kez (dünün sonucu). Fırlatmaz; auth/hata durumunda alert. `meta` yoksa (sync istisnası) yazmaz. */
export async function recordMetaStatus(env: Env, meta: MetaSyncStatus | undefined, day: string, now: Date = new Date()): Promise<boolean> {
  if (!meta) return false;
  try {
    const ok = meta.status === "ok" || meta.status === "passive";
    await env.DB.prepare(STATUS_SQL.upsert).bind("meta", meta.status, meta.detail?.slice(0, 200) ?? null, day, sqlTs(now), ok ? sqlTs(now) : null).run();
    if (meta.status === "auth_error") await sendAlert(env, "Meta Token Error", `Meta Insights yetki hatası (${meta.detail ?? "-"}) — token yenilenmeli (E4).`);
    else if (meta.status === "error") await sendAlert(env, "Meta Insights Error", `${day}: ${meta.detail ?? "-"}`);
    return true;
  } catch (e) {
    console.error("recordMetaStatus failed:", e instanceof Error ? e.message : String(e));
    return false;
  }
}
