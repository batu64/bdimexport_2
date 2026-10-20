// FAZ_4 4.2 kabul testleri — GERÇEK SQL (0001–0003) üzerinde: TTL yaş testi (71s durur / 73s silinir),
// lead retention (C3) + audit, ai_jobs kesimi, audit-yoksa-silme-yok, haftalık rapor günü, cron yönlendirme.
import { describe, it, expect, vi } from "vitest";
import { runMaintenance, isNightly, LEAD_RETENTION_DAYS, AI_JOB_RETENTION_DAYS, NIGHTLY_CRON } from "../src/maintenance";
import { sqlTime, TTL_HOURS } from "../src/ingest";
import { makeEnv } from "./helpers";

const HOUR = 3_600_000;
const DAY = 86_400_000;
// 2026-10-18 Pazar 23:00 UTC = 2026-10-19 Pazartesi 02:00 TR → haftalık rapor günü
const NIGHT_MON_TR = new Date("2026-10-18T23:00:00.000Z");
// 2026-10-19 Pazartesi 23:00 UTC = Salı 02:00 TR → haftalık rapor YOK
const NIGHT_TUE_TR = new Date("2026-10-19T23:00:00.000Z");

function rss(raw: any, id: string, ageHours: number, now: Date) {
  const fetched = now.getTime() - ageHours * HOUR;
  // ingest.ts ile aynı sözleşme: expires_at = fetched_at + TTL_HOURS
  const expires = fetched + TTL_HOURS * HOUR;
  raw.prepare("INSERT INTO rss_news (id, source, title, url, fetched_at, expires_at) VALUES (?, 's', 't', ?, ?, ?)").run(
    id,
    `https://x.example/${id}`,
    sqlTime(fetched),
    sqlTime(expires),
  );
}

function lead(raw: any, id: string, ageDays: number, now: Date, payload = `{"name":"PII-${id}","email":"pii-${id}@example.com"}`) {
  raw.prepare("INSERT INTO leads (id, source_page, locale, payload_json, created_at) VALUES (?, '/en', 'en', ?, ?)").run(
    id,
    payload,
    sqlTime(now.getTime() - ageDays * DAY),
  );
}

function job(raw: any, id: string, status: string, ageDays: number, now: Date) {
  raw.prepare("INSERT INTO ai_jobs (id, type, payload_json, status, created_at) VALUES (?, 'summarize_news', '{}', ?, ?)").run(
    id,
    status,
    sqlTime(now.getTime() - ageDays * DAY),
  );
}

const ids = (raw: any, t: string) => (raw.prepare(`SELECT id FROM ${t} ORDER BY id`).all() as { id: string }[]).map((r) => r.id);
const audits = (raw: any, action: string) => raw.prepare("SELECT * FROM admin_actions WHERE action = ?").all(action) as any[];

describe("4.2 TTL — rss_news (yaş testi: 71s durur / 73s silinir)", () => {
  it("71 saat yaşındaki kayıt durur, 73 saat yaşındaki silinir; silme audit'li", async () => {
    const { env, raw } = makeEnv();
    rss(raw, "keep71", 71, NIGHT_MON_TR);
    rss(raw, "del73", 73, NIGHT_MON_TR);
    const s = await runMaintenance(env, NIGHT_MON_TR);
    expect(ids(raw, "rss_news")).toEqual(["keep71"]);
    const p = s.purges.find((x) => x.table === "rss_news")!;
    expect(p.deleted).toBe(1);
    expect(p.audited).toBe(true);
    const a = audits(raw, "ttl_purge");
    expect(a).toHaveLength(1);
    expect(a[0].actor).toBe("system");
    expect(JSON.parse(a[0].new_value)).toEqual({ deleted: 1, table: "rss_news" });
  });

  it("sınır: TTL_HOURS = 72 (ingest ile aynı)", () => {
    expect(TTL_HOURS).toBe(72);
  });
});

describe("4.2 lead retention (C3) — 365 gün, audit'li, PII audit'e girmez", () => {
  it("364 gün yaşındaki lead durur, 366 gün yaşındaki silinir", async () => {
    const { env, raw } = makeEnv();
    lead(raw, "keep364", 364, NIGHT_MON_TR);
    lead(raw, "del366", 366, NIGHT_MON_TR);
    await runMaintenance(env, NIGHT_MON_TR);
    expect(ids(raw, "leads")).toEqual(["keep364"]);
    expect(LEAD_RETENTION_DAYS).toBe(365);
  });

  it("lead silme audit satırı var; audit'te payload/PII YOK", async () => {
    const { env, raw } = makeEnv();
    lead(raw, "del1", 400, NIGHT_MON_TR);
    await runMaintenance(env, NIGHT_MON_TR);
    const a = audits(raw, "lead_retention_purge");
    expect(a).toHaveLength(1);
    expect(a[0].entity_type).toBe("leads");
    expect(JSON.parse(a[0].new_value)).toEqual({ deleted: 1, table: "leads" });
    const dump = JSON.stringify(raw.prepare("SELECT * FROM admin_actions").all());
    expect(dump).not.toContain("PII-del1");
    expect(dump).not.toContain("pii-del1@example.com");
  });
});

describe("4.2 ai_jobs — yalnız tamamlanmış ve eski kayıtlar", () => {
  it(`done/failed/blocked ve >${AI_JOB_RETENTION_DAYS} gün silinir; pending/running ve yeni kayıtlar kalır`, async () => {
    const { env, raw } = makeEnv();
    job(raw, "done-old", "done", AI_JOB_RETENTION_DAYS + 1, NIGHT_MON_TR);
    job(raw, "failed-old", "failed", 60, NIGHT_MON_TR);
    job(raw, "pending-old", "pending", 60, NIGHT_MON_TR);
    job(raw, "running-old", "running", 60, NIGHT_MON_TR);
    job(raw, "done-new", "done", 5, NIGHT_MON_TR);
    await runMaintenance(env, NIGHT_MON_TR);
    expect(ids(raw, "ai_jobs")).toEqual(["done-new", "pending-old", "running-old"]);
    expect(audits(raw, "retention_purge")).toHaveLength(1);
  });
});

describe("audit-yoksa-silme-yok", () => {
  it("silinecek satır yoksa hiçbir purge audit yazılmaz", async () => {
    const { env, raw } = makeEnv();
    rss(raw, "fresh", 1, NIGHT_MON_TR);
    lead(raw, "fresh", 1, NIGHT_MON_TR);
    const s = await runMaintenance(env, NIGHT_MON_TR);
    expect(s.purges.every((p) => p.deleted === 0 && p.audited === false)).toBe(true);
    expect(raw.prepare("SELECT COUNT(*) AS n FROM admin_actions WHERE action LIKE '%purge%' OR action LIKE '%retention%'").get()).toEqual({ n: 0 });
  });
});

describe("haftalık D1 satır raporu", () => {
  it("TR Pazartesi gecesi rapor üretilir, Salı gecesi üretilmez", async () => {
    const { env } = makeEnv();
    expect((await runMaintenance(env, NIGHT_MON_TR)).weekly_report).not.toBeNull();
    expect((await runMaintenance(env, NIGHT_TUE_TR)).weekly_report).toBeNull();
  });

  it("rapor tüm tabloları satır sayısıyla içerir", async () => {
    const { env } = makeEnv();
    const s = await runMaintenance(env, NIGHT_MON_TR);
    expect(Object.keys(s.weekly_report!).sort()).toEqual(
      ["admin_actions", "ai_jobs", "analytics_daily", "contents", "keywords", "leads", "partners", "rss_news", "settings"],
    );
  });
});

describe("cron yönlendirme", () => {
  it("gece cron'u bakım, saatlik cron ingest", () => {
    expect(isNightly(NIGHTLY_CRON)).toBe(true);
    expect(isNightly("0 * * * *")).toBe(false);
  });
});
