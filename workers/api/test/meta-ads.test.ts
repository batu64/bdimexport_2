// FAZ_6 6.5 kabul testleri — Meta Marketing API ölçümü. GERÇEK SQL (tüm migration'lar, node:sqlite) + GERÇEK cron yazıcısı (cron-analytics sync/meta/status)
// + GERÇEK worker router/guard. Veri = Insights yanıtı FIXTURE'ı (canlı token yok — E4); şema + dönüşüm gerçek, veri mock. Kabul: (1) Meta sync fixture'la
// (2) token yokken unconfigured, ağ çağrısı yok, hat düşmez, sahte harcama yok (3) migration 0008 expand-only + geri alınabilir (4) meta-ads.v1 + anonim lead eşlemesi + CAC.
import { beforeAll, beforeEach, describe, expect, it, vi, afterEach } from "vitest";
import { createHmac } from "node:crypto";
import { DatabaseSync } from "node:sqlite";
import { readFileSync, readdirSync } from "node:fs";
import { resolve } from "node:path";
import worker from "../src/index";
import { computeMetaAdsReport, META_ADS_SQL, META_TOUCH_WINDOW_DAYS, parseMetaAdsQuery, parseMetaDay } from "../src/meta-ads";
import type { MetaAdsReport } from "../src/meta-ads-contract";
import { WINDOW_DAYS } from "../src/attribution";
import { fetchMetaInsights, leadsFromActions, metaConfig, parseCampaignRow } from "../../cron-analytics/src/meta";
import { syncAnalyticsDay, syncWithBackfill } from "../../cron-analytics/src/sync";
import { recordMetaStatus } from "../../cron-analytics/src/status";
import type { Env as CronEnv } from "../../cron-analytics/src/types";
import { _resetJwksCache } from "../../../app/admin/middleware";
import { makeEnv } from "./helpers";

type Raw = ReturnType<typeof makeEnv>["raw"];
const NOW = new Date("2026-10-30T12:00:00Z"); // pencere (30 gün, dün biter): 2026-09-30 … 2026-10-29
const MIG_DIR = resolve(__dirname, "../../../db/migrations");
const D1 = "2026-10-20", D2 = "2026-10-21", D3 = "2026-10-22";
// Test sahte değerleri: gerçek credential DEĞİL (yalnız "tanımlı mı" dalını açar; fetch mock'lanır).
const META = { META_ACCESS_TOKEN: "test-not-a-secret", META_AD_ACCOUNT_ID: "act_123" };
const C1 = "120000000000001", C2 = "120000000000002";

/** Insights FIXTURE (Graph API biçimi: sayılar METİN). D2 iki sayfa; D3 teslimat yok (pasif gün). */
const INSIGHTS: Record<string, unknown[][]> = {
  [D1]: [[
    { campaign_id: C1, campaign_name: "TR İthalat Lead", objective: "OUTCOME_LEADS", spend: "40.00", impressions: "10000", clicks: "200", inline_link_clicks: "150", reach: "8000", account_currency: "TRY",
      actions: [{ action_type: "lead", value: "4" }, { action_type: "offsite_conversion.fb_pixel_lead", value: "3" }] }, // "lead" toplamdır → 4 (7 değil)
    { campaign_id: C2, campaign_name: "EN  Olive Oil\u0007", objective: "OUTCOME_TRAFFIC", spend: "10.50", impressions: "5000", clicks: "50", inline_link_clicks: "40", reach: "4500", account_currency: "TRY" }, // actions yok → null
    { campaign_id: "abc", campaign_name: "bozuk", spend: "x", impressions: "1", clicks: "1" }, // atılır
    { campaign_id: "120000000000009", campaign_name: "eksik harcama", impressions: "100", clicks: "1" }, // spend yok → atılır (0 uydurulmaz)
  ]],
  [D2]: [
    [{ campaign_id: C1, campaign_name: "TR İthalat Lead", objective: "OUTCOME_LEADS", spend: "20", impressions: "4000", clicks: "80", inline_link_clicks: "60", reach: "3500", account_currency: "TRY",
      actions: [{ action_type: "offsite_conversion.fb_pixel_lead", value: "1" }, { action_type: "onsite_conversion.lead_grouped", value: "2" }] }], // bileşen toplamı → 3
    [{ campaign_id: C2, campaign_name: "EN Olive Oil", objective: "OUTCOME_TRAFFIC", spend: "9.5", impressions: "3000", clicks: "30", inline_link_clicks: "25", reach: "2800", account_currency: "TRY",
      actions: [{ action_type: "link_click", value: "25" }] }], // dizi var, lead tipi yok → gerçek 0
  ],
  [D3]: [[]],
};

type Call = { url: URL; auth: string | null };
function metaFetch(calls: Call[], pages = INSIGHTS) {
  return vi.fn(async (u: string, init?: RequestInit) => {
    const url = new URL(String(u));
    calls.push({ url, auth: new Headers(init?.headers).get("authorization") });
    if (url.hostname !== "graph.facebook.com") throw new Error("beklenmeyen ağ çağrısı: " + url.hostname);
    const day = JSON.parse(url.searchParams.get("time_range") ?? "{}").since as string;
    const p = Number(url.searchParams.get("after") ?? 0);
    const set = pages[day] ?? [[]];
    const next = p + 1 < set.length ? `https://graph.facebook.com/v21.0/act_123/insights?${new URLSearchParams({ ...Object.fromEntries(url.searchParams), after: String(p + 1) })}` : undefined;
    return new Response(JSON.stringify({ data: set[p], ...(next ? { paging: { next } } : {}) }));
  });
}
const cronEnv = (env: { DB: D1Database }, over: Partial<CronEnv> = {}): CronEnv => ({ DB: env.DB, ...META, ...over }) as CronEnv;

/** Anonim lead seed'i (payload sahte; rapor onu OKUMAZ — attribution_leads_v'de kolon yok). */
function seedLeads(raw: Raw) {
  const ins = raw.prepare("INSERT INTO leads (id, source_page, locale, payload_json, utm_json, created_at) VALUES (?, '/ithalat', 'tr', '{\"email\":\"x@example.com\"}', ?, ?)");
  const utm = (s: string, m?: string, c?: string, touch?: string) => JSON.stringify({ utm_source: s, ...(m ? { utm_medium: m } : {}), ...(c ? { utm_campaign: c } : {}), ...(touch ? { touch_at: touch } : {}) });
  ins.run("L1", utm("facebook", "paid_social", C1), "2026-10-20 10:00:00"); // C1 (kimlik)
  ins.run("L2", utm("fb", "cpc", C1, "2026-10-19T08:00:00.000Z"), "2026-10-21 09:00:00"); // C1 (kimlik, dokunuş pencere içi)
  ins.run("L3", utm("instagram", "cpc", "en olive oil"), "2026-10-22 11:00:00"); // C2 (benzersiz ad)
  ins.run("L4", utm("fb", "cpc"), "2026-10-23 12:00:00"); // ücretli, kampanyasız → unmatched
  ins.run("L5", utm("facebook", "social"), "2026-10-23 13:00:00"); // organik paylaşım → CAC'a girmez
  ins.run("L6", utm("google", "cpc", C1), "2026-10-23 14:00:00"); // Meta değil → yok sayılır
  ins.run("L7", utm("facebook", "paid_social", C1, "2026-09-10T00:00:00.000Z"), "2026-10-24 10:00:00"); // dokunuş 30 günden eski → yok sayılır
  ins.run("L8", utm("facebook", "paid_social", C1), "2026-09-20 10:00:00"); // pencere dışı
  ins.run("L9", null, "2026-10-24 10:00:00"); // utm yok
}

async function syncFixture(env: { DB: D1Database }, over: Partial<CronEnv> = {}) {
  const calls: Call[] = [];
  vi.stubGlobal("fetch", metaFetch(calls));
  for (const d of [D1, D2, D3]) {
    const r = await syncAnalyticsDay(cronEnv(env, over), d);
    expect(r.success, d).toBe(true);
    await recordMetaStatus(cronEnv(env, over), r.meta, d, NOW);
  }
  return calls;
}

afterEach(() => vi.unstubAllGlobals());

// ───────────────────────── (1) Meta sync fixture'la ─────────────────────────
describe("kabul 1 — Meta Insights → analytics_daily.meta_json (fixture)", () => {
  it("satır dönüşümü: METİN sayılar → sayı; lead = 'lead' toplamı, yoksa bileşenler; actions yok → null; geçersiz satır ATILIR", () => {
    expect(parseCampaignRow(INSIGHTS[D1][0][0])).toEqual({ id: C1, name: "TR İthalat Lead", objective: "OUTCOME_LEADS", spend: 40, impressions: 10000, clicks: 200, link_clicks: 150, reach: 8000, leads: 4, currency: "TRY" });
    expect(parseCampaignRow(INSIGHTS[D1][0][1])).toMatchObject({ name: "EN Olive Oil", leads: null, spend: 10.5 });
    expect(parseCampaignRow(INSIGHTS[D1][0][2])).toBeNull();
    expect(parseCampaignRow(INSIGHTS[D1][0][3])).toBeNull();
    expect(parseCampaignRow({ campaign_id: C1, spend: "-5", impressions: "1", clicks: "1" })).toBeNull();
    expect([leadsFromActions(undefined), leadsFromActions([]), leadsFromActions([{ action_type: "onsite_conversion.lead_grouped", value: "2" }]), leadsFromActions([{ action_type: "lead", value: "abc" }])]).toEqual([null, 0, 2, 0]);
  });

  it("3 gün sync: D1 (2 geçerli kampanya), D2 (2 sayfa, paging izlenir), D3 (teslimat yok → spend 0 = pasif) — 3.7 alanları korunur", async () => {
    const { env, raw } = makeEnv();
    const calls = await syncFixture(env);
    expect(calls).toHaveLength(4); // D1 + D2×2 + D3
    for (const c of calls) {
      expect(c.auth).toBe("Bearer test-not-a-secret"); // token YALNIZ başlıkta
      expect(c.url.searchParams.has("access_token")).toBe(false);
      expect(c.url.pathname).toBe("/v21.0/act_123/insights");
      expect(c.url.searchParams.get("level")).toBe("campaign");
    }
    const rows = raw.prepare("SELECT day, meta_json FROM analytics_daily ORDER BY day").all() as { day: string; meta_json: string }[];
    expect(rows.map((r) => r.day)).toEqual([D1, D2, D3]);
    const m = rows.map((r) => JSON.parse(r.meta_json));
    expect(m[0]).toMatchObject({ schema: "meta-insights.v1", spend: 50.5, impressions: 15000, clicks: 250, link_clicks: 190, leads: 4, currency: "TRY", truncated: false });
    expect(m[0].campaigns.map((c: { id: string }) => c.id)).toEqual([C1, C2]);
    expect(m[1]).toMatchObject({ spend: 29.5, impressions: 7000, clicks: 110, link_clicks: 85, leads: 3 });
    expect(m[2]).toMatchObject({ spend: 0, impressions: 0, clicks: 0, link_clicks: null, leads: null, currency: null, campaigns: [] });
    // /analytics/summary (3.7) yalnız `meta.spend` toplar → alan adı korunur
    expect(m.reduce((a, x) => a + x.spend, 0)).toBe(80);
    // 0008 view kampanyaları açar
    expect(raw.prepare("SELECT day, campaign_id, spend, leads FROM meta_campaign_v ORDER BY day, campaign_id").all()).toEqual([
      { day: D1, campaign_id: C1, spend: 40, leads: 4 }, { day: D1, campaign_id: C2, spend: 10.5, leads: null },
      { day: D2, campaign_id: C1, spend: 20, leads: 3 }, { day: D2, campaign_id: C2, spend: 9.5, leads: 0 },
    ]);
    expect(raw.prepare("SELECT source, status, detail, last_day, last_ok_at FROM integration_status").all()).toEqual([
      { source: "meta", status: "passive", detail: "yayında kampanya yok (harcama 0)", last_day: D3, last_ok_at: "2026-10-30 12:00:00" },
    ]);
  });

  it("META_APP_SECRET varsa appsecret_proof = HMAC-SHA256(token); hesap kimliği act_ öneki eklenir; paging başka host'a İZLENMEZ; sayfa sınırı → truncated", async () => {
    const calls: Call[] = [];
    vi.stubGlobal("fetch", metaFetch(calls));
    const r = await fetchMetaInsights({ DB: {} as never, META_ACCESS_TOKEN: "test-not-a-secret", META_AD_ACCOUNT_ID: "123", META_APP_SECRET: "test-app-secret" }, D1);
    expect(r.status).toBe("ok");
    expect(calls[0].url.pathname).toBe("/v21.0/act_123/insights");
    expect(calls[0].url.searchParams.get("appsecret_proof")).toBe(createHmac("sha256", "test-app-secret").update("test-not-a-secret").digest("hex"));

    const evil = vi.fn(async () => new Response(JSON.stringify({ data: [], paging: { next: "https://evil.example/steal" } })));
    vi.stubGlobal("fetch", evil);
    expect((await fetchMetaInsights({ DB: {} as never, ...META }, D1)).status).toBe("ok");
    expect(evil).toHaveBeenCalledTimes(1);

    const many = Object.fromEntries([[D1, Array.from({ length: 7 }, (_x, i) => [{ campaign_id: String(100 + i), spend: "1", impressions: "1", clicks: "0" }])]]);
    const c2: Call[] = [];
    vi.stubGlobal("fetch", metaFetch(c2, many));
    const t = await fetchMetaInsights({ DB: {} as never, ...META }, D1);
    expect(c2).toHaveLength(5);
    expect(t.status === "ok" && t.data).toMatchObject({ truncated: true, spend: 5 });
  });

  it("hata yolları: token geçersiz (code 190) → auth_error + alert · 500 → error · biçim bozuk → error; hiçbiri FIRLATMAZ ve meta_json YAZMAZ", async () => {
    const warn = vi.spyOn(console, "warn").mockImplementation(() => {});
    const err = vi.spyOn(console, "error").mockImplementation(() => {});
    const { env, raw } = makeEnv();
    const cases: [Response, string][] = [
      [new Response(JSON.stringify({ error: { message: "Error validating access token", type: "OAuthException", code: 190 } }), { status: 400 }), "auth_error"],
      [new Response("x", { status: 500 }), "error"],
      [new Response(JSON.stringify({ nope: 1 })), "error"],
    ];
    for (const [res, want] of cases) {
      vi.stubGlobal("fetch", vi.fn(async () => res));
      const r = await syncAnalyticsDay(cronEnv(env), D1);
      expect(r).toMatchObject({ success: false, skipped: "no_data", meta: { status: want } });
      await recordMetaStatus(cronEnv(env), r.meta, D1, NOW);
      expect(raw.prepare("SELECT status FROM integration_status").get()).toEqual({ status: want });
    }
    vi.stubGlobal("fetch", vi.fn(async () => { throw new Error("net down"); }));
    expect((await fetchMetaInsights(cronEnv(env), D1)).status).toBe("error");
    expect(raw.prepare("SELECT COUNT(*) AS n FROM analytics_daily").get()).toEqual({ n: 0 });
    expect(warn.mock.calls.some((c) => String(c[0]).includes("Meta Token Error"))).toBe(true);
    // log/alert metinlerinde token YOK
    expect(JSON.stringify([...warn.mock.calls, ...err.mock.calls])).not.toContain("test-not-a-secret");
    warn.mockRestore();
    err.mockRestore();
  });

  it("geçici Meta hatası daha önce yazılmış GERÇEK meta_json'u null ile EZMEZ (COALESCE); başarılı yeniden sync günceller", async () => {
    vi.spyOn(console, "error").mockImplementation(() => {});
    const { env, raw } = makeEnv();
    await syncFixture(env);
    const before = (raw.prepare("SELECT meta_json FROM analytics_daily WHERE day = ?").get(D1) as { meta_json: string }).meta_json;
    // CF (ga4 yedeği) başarılı, Meta 500 → satır güncellenir (ga4_json yeni) ama meta_json korunur
    const cfBody = { data: { viewer: { accounts: [{ pagesProjectsAdaptiveGroups: [{ sum: { requests: 9, pageViews: 7 } }] }] } } };
    vi.stubGlobal("fetch", vi.fn(async (u: string) => (String(u).includes("graph.facebook.com") ? new Response("x", { status: 500 }) : new Response(JSON.stringify(cfBody)))));
    const r = await syncAnalyticsDay(cronEnv(env, { CF_ACCOUNT_ID: "test-acct", CF_API_TOKEN: "test-not-a-secret-cf" }), D1);
    expect(r).toMatchObject({ success: true, meta: { status: "error" } });
    const row = raw.prepare("SELECT ga4_json, meta_json FROM analytics_daily WHERE day = ?").get(D1) as { ga4_json: string; meta_json: string };
    expect(JSON.parse(row.ga4_json)).toMatchObject({ sessions: 7 });
    expect(row.meta_json).toBe(before);
  });
});

// ───────────────────────── (2) token yok → unconfigured ─────────────────────────
describe("kabul 2 — token yokken unconfigured (anahtarsız çalışır, hat düşmez, sahte harcama yok)", () => {
  it("credential yok: ağ çağrısı SIFIR, analytics_daily yazılmaz, integration_status = unconfigured; rapor null + not", async () => {
    vi.spyOn(console, "warn").mockImplementation(() => {});
    const net = vi.fn(async () => new Response("{}"));
    vi.stubGlobal("fetch", net);
    const { env, raw } = makeEnv();
    const c = { DB: env.DB } as CronEnv;
    expect(await fetchMetaInsights(c, D1)).toEqual({ status: "unconfigured", reason: "META_ACCESS_TOKEN / META_AD_ACCOUNT_ID tanımlı değil (E4)" });
    const res = await syncWithBackfill(c, NOW);
    const y = res["2026-10-29"];
    expect(y).toMatchObject({ success: true, skipped: "no_credentials", meta: { status: "unconfigured" } });
    expect(await recordMetaStatus(c, y.meta, "2026-10-29", NOW)).toBe(true);
    expect(net).not.toHaveBeenCalled();
    expect(raw.prepare("SELECT COUNT(*) AS n FROM analytics_daily").get()).toEqual({ n: 0 });
    expect(raw.prepare("SELECT status, last_ok_at FROM integration_status WHERE source = 'meta'").get()).toEqual({ status: "unconfigured", last_ok_at: null });

    const rep = await computeMetaAdsReport(env.DB, {}, NOW);
    expect(rep.data_status).toMatchObject({ integration: "unconfigured", spend_days_with_data: 0, currency: null });
    expect(rep.totals).toEqual({ spend: null, impressions: null, clicks: null, link_clicks: null, ctr: null, cpc: null, cpm: null, meta_reported_leads: null, site_leads: 0, cac: null });
    expect(rep.data_status.note).toMatch(/bağlı değil.*E4/);
    expect(rep.cac_text).toBe("Meta bağlı değil — harcama ve CAC hesaplanamaz.");
  });

  it("biçimi bozuk hesap kimliği / API sürümü → unconfigured (ağ çağrısı yok)", async () => {
    const net = vi.fn();
    vi.stubGlobal("fetch", net);
    for (const over of [{ META_AD_ACCOUNT_ID: "act_12x" }, { META_AD_ACCOUNT_ID: "../me" }, { META_API_VERSION: "latest" }])
      expect(metaConfig({ DB: {} as never, ...META, ...over }).ok, JSON.stringify(over)).toBe(false);
    expect((await fetchMetaInsights({ DB: {} as never, ...META, META_AD_ACCOUNT_ID: "act_12x" }, D1)).status).toBe("unconfigured");
    expect(net).not.toHaveBeenCalled();
  });

  it("cron durumu hiç yazılmamış (unknown) ve 0008 öncesi boş D1 → rapor patlamaz", async () => {
    const { env } = makeEnv();
    const rep = await computeMetaAdsReport(env.DB, { days: 7 }, NOW);
    expect(rep).toMatchObject({ contract: "meta-ads.v1", period: { from: "2026-10-23", to: "2026-10-29", days: 7 }, data_status: { integration: "unknown" }, campaigns: [], daily: [] });
  });
});

// ───────────────────────── (3) migration 0008 ─────────────────────────
describe("kabul 3 — migration 0008: EXPAND-ONLY + geri alınabilir", () => {
  const files = () => readdirSync(MIG_DIR).filter((f) => f.endsWith(".sql")).sort();
  const apply = (db: DatabaseSync, only: (f: string) => boolean) => { for (const f of files().filter(only)) db.exec(readFileSync(resolve(MIG_DIR, f), "utf8")); };
  const schema = (db: DatabaseSync) => db.prepare("SELECT type, name, sql FROM sqlite_master WHERE name NOT LIKE 'sqlite_%' ORDER BY type, name").all();
  const F = "0008_meta_ads.sql";
  const body = () => readFileSync(resolve(MIG_DIR, F), "utf8");

  it("yalnız 1 VIEW + 1 TABLO ekler; mevcut tüm nesneler (0006/0007 dahil) BİREBİR aynı; yıkıcı ifade yok; veri korunur", () => {
    expect(body().replace(/--.*$/gm, "")).not.toMatch(/\b(DROP|ALTER|DELETE|UPDATE|INSERT|REPLACE)\b/i);
    const db = new DatabaseSync(":memory:");
    apply(db, (f) => f < "0008");
    const before = schema(db) as { name: string }[];
    db.exec("INSERT INTO analytics_daily (day, locale, meta_json) VALUES ('2026-10-01','all','{\"spend\":1}')");
    apply(db, (f) => f === F);
    const after = schema(db) as { type: string; name: string }[];
    expect(after.filter((o) => !before.some((b) => b.name === o.name)).map((o) => `${o.type}:${o.name}`).sort()).toEqual(["table:integration_status", "view:meta_campaign_v"]);
    expect(after.filter((o) => before.some((b) => b.name === o.name))).toEqual(before);
    expect(db.prepare("SELECT meta_json FROM analytics_daily").all()).toEqual([{ meta_json: "{\"spend\":1}" }]);
  });

  it("idempotent + başlıktaki GERİ ALMA ifadeleri şemayı 0008 öncesine döndürür; tek 0008 dosyası", () => {
    const db = new DatabaseSync(":memory:");
    apply(db, (f) => f < "0008");
    const before = schema(db);
    apply(db, (f) => f === F);
    expect(() => apply(db, (f) => f === F)).not.toThrow();
    const rollback = body().split("\n").filter((l) => /^--\s+DROP /.test(l)).map((l) => l.replace(/^--\s+/, "")).join("\n");
    expect(rollback).toMatch(/DROP TABLE IF EXISTS integration_status/);
    db.exec(rollback);
    expect(schema(db)).toEqual(before);
    expect(files().filter((f) => f.startsWith("0008"))).toEqual([F]);
  });

  it("view bozuk JSON / dizi olmayan campaigns / skaler öğe / eksik alan ile PATLAMAZ; tablo CHECK'leri bilinmeyen değeri REDDEDER", () => {
    const { raw } = makeEnv();
    const ins = raw.prepare("INSERT INTO analytics_daily (day, locale, meta_json) VALUES (?, 'all', ?)");
    ins.run("2026-10-01", "{bozuk");
    ins.run("2026-10-02", JSON.stringify({ spend: 1, campaigns: "x" }));
    ins.run("2026-10-03", JSON.stringify({ spend: 1, campaigns: ["metin", 5, null, { id: "1" }, { id: "2", spend: 3, impressions: 10, clicks: 1 }] }));
    expect(raw.prepare("SELECT day, campaign_id, spend FROM meta_campaign_v").all()).toEqual([{ day: "2026-10-03", campaign_id: "2", spend: 3 }]);
    const st = (o: Record<string, unknown>) => () => raw.prepare("INSERT INTO integration_status (source, status, detail, last_day, checked_at) VALUES (?, ?, ?, ?, '2026-10-30 00:00:00')")
      .run(...(Object.values({ source: "meta", status: "ok", detail: null, last_day: D1, ...o }) as never[]));
    expect(st({})).not.toThrow();
    for (const bad of [{ source: "tiktok" }, { source: "gsc", status: "fine" }, { source: "ga4", detail: "x".repeat(201) }, { source: "cf", last_day: "dün" }]) expect(st(bad), JSON.stringify(bad)).toThrow();
    // gün ayrıştırıcı da aynı savunmayı uygular
    expect([parseMetaDay("d", "{bozuk"), parseMetaDay("d", "[]"), parseMetaDay("d", JSON.stringify({ spend: "5", impressions: 1, clicks: 1 }))]).toEqual([null, null, null]);
  });
});

// ───────────────────────── (4) meta-ads.v1 raporu + uç ─────────────────────────
describe("kabul 4 — meta-ads.v1: kampanya → lead eşlemesi (anonim) + CAC", () => {
  it("fixture'dan elle hesaplanan toplamlar, kampanya CAC'ı ve CAC metni", async () => {
    const { env, raw } = makeEnv();
    await syncFixture(env);
    seedLeads(raw);
    const r = await computeMetaAdsReport(env.DB, {}, NOW);
    expect(r.period).toEqual({ from: "2026-09-30", to: "2026-10-29", days: 30 });
    expect(r.data_status).toMatchObject({ integration: "passive", spend_days_with_data: 3, window_days: 30, currency: "TRY", mixed_currency: false, truncated_days: 0 });
    // harcama 40+10.5+20+9.5 = 80 · gösterim 22000 · tıklama 360 · site lead'i: L1+L2 (C1) + L3 (C2) + L4 (eşlenmemiş ücretli) = 4
    expect(r.totals).toEqual({ spend: 80, impressions: 22000, clicks: 360, link_clicks: 275, ctr: 0.0164, cpc: 0.22, cpm: 3.64, meta_reported_leads: 7, site_leads: 4, cac: 20 });
    expect(r.campaigns).toEqual([
      { campaign_id: C1, name: "TR İthalat Lead", objective: "OUTCOME_LEADS", days_active: 2, spend: 60, impressions: 14000, clicks: 280, link_clicks: 210, ctr: 0.02, cpc: 0.21, meta_reported_leads: 7, site_leads: 2, cac: 30 },
      { campaign_id: C2, name: "EN Olive Oil", objective: "OUTCOME_TRAFFIC", days_active: 2, spend: 20, impressions: 8000, clicks: 80, link_clicks: 65, ctr: 0.01, cpc: 0.25, meta_reported_leads: 0, site_leads: 1, cac: 20 },
    ]);
    expect([r.unmatched_site_leads, r.organic_meta_leads]).toEqual([1, 1]);
    expect(r.daily).toEqual([
      { day: D1, spend: 50.5, impressions: 15000, clicks: 250, campaigns: 2 }, { day: D2, spend: 29.5, impressions: 7000, clicks: 110, campaigns: 2 }, { day: D3, spend: 0, impressions: 0, clicks: 0, campaigns: 0 },
    ]);
    expect(r.data_status.note).toBe("Meta verisi 3/30 günde var (eksik günler bilinmiyor, 0 sayılmadı).");
    expect(r.cac_text).toBe("Son 30 gün: 80.00 TRY harcama · 4 Meta kaynaklı site lead'i → CAC 20.00 TRY. En düşük CAC: \"EN Olive Oil\" (20.00 TRY, 1 lead). 1 lead kampanyaya eşlenemedi (reklam URL'sinde utm_campaign={{campaign.id}} önerilir).");
  });

  it("ANONİM: yanıtta lead kimliği/payload/e-posta YOK; lead sorgusu yalnız attribution_leads_v + GROUP BY; dokunuş penceresi atıfla aynı", async () => {
    const { env, raw } = makeEnv();
    await syncFixture(env);
    seedLeads(raw);
    const s = JSON.stringify(await computeMetaAdsReport(env.DB, {}, NOW));
    for (const leak of ["x@example.com", "\"L1\"", "payload", "email"]) expect(s).not.toContain(leak);
    expect(META_ADS_SQL.leads).toMatch(/FROM attribution_leads_v/);
    expect(META_ADS_SQL.leads).toMatch(/GROUP BY/);
    for (const q of Object.values(META_ADS_SQL)) { expect(q).not.toMatch(/\b(FROM|JOIN)\s+leads\b/i); expect(q).not.toMatch(/\$\{/); }
    expect(META_TOUCH_WINDOW_DAYS).toBe(WINDOW_DAYS);
    expect(META_ADS_SQL.leads).toContain(`<= ${WINDOW_DAYS} `);
  });

  it("pasif dönem (yalnız teslimatsız gün) → 'entegre ama pasif' metni; harcama 0 gerçek, CAC null", async () => {
    const { env } = makeEnv();
    vi.stubGlobal("fetch", metaFetch([]));
    const r0 = await syncAnalyticsDay(cronEnv(env), "2026-10-28"); // fixture'da gün yok → boş data (teslimat yok)
    await recordMetaStatus(cronEnv(env), r0.meta, "2026-10-28", NOW);
    const r = await computeMetaAdsReport(env.DB, { days: 7 }, NOW);
    expect(r.totals).toMatchObject({ spend: 0, impressions: 0, cpc: null, cpm: null, cac: null });
    expect(r.cac_text).toBe("Meta entegre ama pasif: son 7 günde yayında kampanya yok (harcama 0).");
    expect(r.data_status.integration).toBe("passive");
  });

  it("birden çok para birimi → para alanları null (toplanmaz) + not; aynı adlı iki kampanya ad ile EŞLENMEZ", async () => {
    const { env, raw } = makeEnv();
    const ins = raw.prepare("INSERT INTO analytics_daily (day, locale, meta_json) VALUES (?, 'all', ?)");
    const camp = (id: string, name: string) => ({ id, name, spend: 10, impressions: 100, clicks: 5 });
    ins.run(D1, JSON.stringify({ spend: 20, impressions: 200, clicks: 10, currency: "TRY", campaigns: [camp("1", "Aynı"), camp("2", "aynı")] }));
    ins.run(D2, JSON.stringify({ spend: 10, impressions: 100, clicks: 5, currency: "EUR", campaigns: [camp("1", "Aynı")] }));
    raw.prepare("INSERT INTO leads (id, source_page, locale, payload_json, utm_json, created_at) VALUES ('X1','/','tr','{}',?, '2026-10-21 10:00:00')").run(JSON.stringify({ utm_source: "facebook", utm_medium: "cpc", utm_campaign: "aynı" }));
    const r = await computeMetaAdsReport(env.DB, {}, NOW);
    expect(r.data_status).toMatchObject({ mixed_currency: true, currency: null });
    expect(r.totals).toMatchObject({ spend: null, cpc: null, cac: null, impressions: 300, site_leads: 1 });
    expect(r.campaigns.every((c) => c.spend === null && c.site_leads === 0)).toBe(true);
    expect(r.unmatched_site_leads).toBe(1);
    expect(r.data_status.note).toMatch(/EUR, TRY/);
    expect(r.cac_text).toBe("Birden çok para birimi — CAC toplanmadı.");
  });

  it("token sonradan kaldırıldı (unconfigured) ama eski veri var → veri gösterilir + not; harcama var lead yok → CAC hesaplanamaz", async () => {
    const { env, raw } = makeEnv();
    await syncFixture(env);
    await recordMetaStatus({ DB: env.DB } as CronEnv, { status: "unconfigured", detail: "x" }, "2026-10-29", NOW);
    const r = await computeMetaAdsReport(env.DB, {}, NOW);
    expect(r.data_status.integration).toBe("unconfigured");
    expect(r.data_status.last_ok_at).toBe("2026-10-30 12:00:00"); // COALESCE: son başarılı kontrol korunur
    expect(r.data_status.note).toMatch(/önceden çekilmiş veri/);
    expect(r.cac_text).toBe("Son 30 gün: 80.00 TRY harcama · henüz Meta kaynaklı site lead'i yok → CAC hesaplanamaz.");
    expect(raw.prepare("SELECT COUNT(*) AS n FROM leads").get()).toEqual({ n: 0 });
  });
});

describe("kabul 4b — GET /admin/api/analytics/meta (guard + admin-only + meta-ads.v1)", () => {
  const TEAM = "bdimexport.cloudflareaccess.com";
  const AUD = "a".repeat(64);
  const ACCESS = { ACCESS_TEAM_DOMAIN: TEAM, ACCESS_AUD: AUD, ADMIN_EMAILS: "boss@example.com", VIEWER_EMAILS: "view@example.com" };
  const EPOCH = Math.floor(Date.now() / 1000);
  let priv: CryptoKey;
  let jwk: JsonWebKey & { kid: string };
  const b64 = (o: object) => Buffer.from(JSON.stringify(o)).toString("base64url");
  async function jwt(email: string): Promise<string> {
    const h = b64({ alg: "RS256", kid: "k1", typ: "JWT" });
    const p = b64({ iss: `https://${TEAM}`, aud: [AUD], exp: EPOCH + 600, iat: EPOCH, email, sub: "u1" });
    const sig = await crypto.subtle.sign("RSASSA-PKCS1-v1_5", priv, new TextEncoder().encode(`${h}.${p}`));
    return `${h}.${p}.${Buffer.from(sig).toString("base64url")}`;
  }
  beforeAll(async () => {
    const kp = (await crypto.subtle.generateKey({ name: "RSASSA-PKCS1-v1_5", modulusLength: 2048, publicExponent: new Uint8Array([1, 0, 1]), hash: "SHA-256" }, true, ["sign", "verify"])) as CryptoKeyPair;
    priv = kp.privateKey;
    jwk = { ...((await crypto.subtle.exportKey("jwk", kp.publicKey)) as JsonWebKey), kid: "k1", alg: "RS256", use: "sig" };
  });
  beforeEach(() => {
    _resetJwksCache();
    vi.stubGlobal("fetch", async (u: string) => {
      if (String(u) === `https://${TEAM}/cdn-cgi/access/certs`) return new Response(JSON.stringify({ keys: [jwk] }));
      throw new Error("beklenmeyen ağ çağrısı (uç canlı Meta çağırmamalı): " + u);
    });
  });
  const URL0 = "https://bdimexport.pages.dev/admin/api/analytics/meta";
  const get = (c: ReturnType<typeof makeEnv>, qs: string, token?: string) =>
    worker.fetch(new Request(URL0 + qs, { headers: { "cf-connecting-ip": "6.6.6.6", ...(token ? { "cf-access-jwt-assertion": token } : {}) } }), c.env);

  it("anon 401 · viewer 403 · admin 200 + no-store + meta-ads.v1 (boş D1 → unknown, null toplamlar)", async () => {
    const c = makeEnv(ACCESS);
    expect((await get(c, "")).status).toBe(401);
    expect((await get(c, "", await jwt("view@example.com"))).status).toBe(403);
    const ok = await get(c, "", await jwt("boss@example.com"));
    expect(ok.status).toBe(200);
    expect(ok.headers.get("cache-control")).toBe("no-store");
    const body = (await ok.json()) as MetaAdsReport;
    expect(body).toMatchObject({ contract: "meta-ads.v1", data_status: { integration: "unknown" }, totals: { spend: null, cac: null, site_leads: 0 }, campaigns: [] });
  });

  it("days doğrulaması → 400; geçerli → 200; yazma metotları → 404", async () => {
    const c = makeEnv(ACCESS);
    const t = await jwt("boss@example.com");
    for (const qs of ["?days=0", "?days=91", "?days=abc", "?days=7%27%20OR%201=1", "?days=-1"]) expect((await get(c, qs, t)).status, qs).toBe(400);
    const r = await get(c, "?days=7", t);
    expect(r.status).toBe(200);
    expect(((await r.json()) as MetaAdsReport).period.days).toBe(7);
    for (const m of ["POST", "PUT", "DELETE", "PATCH"]) {
      const w = await worker.fetch(new Request(URL0, { method: m, headers: { "cf-connecting-ip": "6.6.6.6", "cf-access-jwt-assertion": t, "content-type": "application/json" }, body: "{}" }), c.env);
      expect(w.status, m).toBe(404);
    }
    expect([parseMetaAdsQuery(new URL(URL0)), parseMetaAdsQuery(new URL(URL0 + "?days=90"))]).toEqual([{}, { days: 90 }]);
  });
});
