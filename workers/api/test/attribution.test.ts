// FAZ_6 6.1 kabul testleri — GERÇEK SQL (migration 0001–0006, node:sqlite) + GERÇEK worker router/guard. Veri = test FIXTURE'ı (canlı veri yok — E4);
// şema + sorgu + atıf mantığı gerçek. Kabul: (1) lead doğru sayfaya atfedilir (2) 30 gün dışı atfedilmez (3) ANONİM JOIN kanıtı (4) expand/contract migration
// (5) 6.2 veri sözleşmesi (alan adları) (6) bilinmeyen = null (uydurma metrik yok).
import { beforeAll, beforeEach, describe, expect, it, vi } from "vitest";
import { DatabaseSync } from "node:sqlite";
import { readFileSync, readdirSync } from "node:fs";
import { resolve } from "node:path";
import worker from "../src/index";
import { ATTRIBUTION_SQL, attributeLead, computeAttribution, normalizePage, pageLocale, parseTs, productSlug, sanitizeTouch, utmToken, WINDOW_DAYS } from "../src/attribution";
import type { AttributionReport } from "../src/attribution-contract";
import { makeEnv } from "./helpers";
import { _resetJwksCache } from "../../../app/admin/middleware";

type Raw = ReturnType<typeof makeEnv>["raw"];
const NOW = new Date("2026-10-30T12:00:00Z");
const MIG_DIR = resolve(__dirname, "../../../db/migrations");

let seq = 0;
const lead = (raw: Raw, o: { source_page?: string; created_at: string; locale?: string; utm?: object | string | null; payload?: object; partner?: string | null }) =>
  raw.prepare("INSERT INTO leads (id, source_page, locale, form_type, channel_pref, payload_json, status, partner_id, utm_json, consent_version, consent_at, created_at) VALUES (?,?,?,?,?,?, 'new', ?,?,?,?,?)").run(
    "L" + ++seq, o.source_page ?? "", o.locale ?? "en", "lead", "email",
    JSON.stringify(o.payload ?? { name: "Jane Secret", email: "jane.secret@example.org", phone: "+4915112345678", message: "private message" }),
    o.partner ?? null, o.utm === undefined || o.utm === null ? null : typeof o.utm === "string" ? o.utm : JSON.stringify(o.utm), "v1", o.created_at, o.created_at,
  );
const analytics = (raw: Raw, day: string, ga4: unknown, gsc: unknown = null, locale = "all") =>
  raw.prepare("INSERT INTO analytics_daily (day, locale, ga4_json, gsc_json) VALUES (?,?,?,?)").run(day, locale, ga4 === null ? null : typeof ga4 === "string" ? ga4 : JSON.stringify(ga4), gsc === null ? null : typeof gsc === "string" ? gsc : JSON.stringify(gsc));
const report = (env: ReturnType<typeof makeEnv>["env"], q = {}) => computeAttribution(env.DB as never, q, NOW);

// ───────────────────────── saf mantık ─────────────────────────
describe("saf yardımcılar", () => {
  it("normalizePage: host/sorgu/hash/çift-slash/sondaki slash/büyük harf normalize; boş/direct/geçersiz → null", () => {
    expect(normalizePage("https://bdimexport.com/en/products/Olive-Oil/?utm_source=x#top")).toBe("/en/products/olive-oil");
    expect(normalizePage("/EN//services///sourcing/")).toBe("/en/services/sourcing");
    expect(normalizePage("/")).toBe("/");
    expect(normalizePage("")).toBeNull();
    expect(normalizePage("  ")).toBeNull();
    expect(normalizePage("direct")).toBeNull();
    expect(normalizePage("Direct")).toBeNull();
    expect(normalizePage("javascript:alert(1)")).toBeNull();
    expect(normalizePage("/a b")).toBeNull();
    expect(normalizePage("/a\u0000b")).toBeNull();
    expect(normalizePage("x".repeat(400))).toBeNull();
    expect(normalizePage(null)).toBeNull();
  });

  it("pageLocale / productSlug", () => {
    expect([pageLocale("/"), pageLocale("/ithalat/x"), pageLocale("/en"), pageLocale("/en/services/sourcing"), pageLocale("/en/ru"), pageLocale("/en/ar/services/sourcing"), pageLocale("/de/kontakt"), pageLocale("/zh")])
      .toEqual(["tr", "tr", "en", "en", "en-ru", "en-ar", "de", "zh"]);
    expect(productSlug("/en/products/olive-oil")).toBe("olive-oil");
    expect(productSlug("/en/products/category/food")).toBeNull();
    expect(productSlug("/en/products")).toBeNull();
    expect(productSlug("/tr/ithalat")).toBeNull();
  });

  it("utmToken: dar karakter kümesi; yoksa (none), geçersiz/enjeksiyon (other)", () => {
    expect([utmToken("Google"), utmToken(undefined), utmToken(""), utmToken("<script>alert(1)</script>"), utmToken("a".repeat(60)), utmToken(5), utmToken("news_letter-1.2")])
      .toEqual(["google", "(none)", "(none)", "(other)", "(other)", "(other)", "news_letter-1.2"]);
  });

  it("parseTs: D1 biçimi ve ISO; saçma değer null", () => {
    expect(parseTs("2026-10-28 09:00:00")).toBe(Date.parse("2026-10-28T09:00:00Z"));
    expect(parseTs("2026-10-28T09:00:00Z")).toBe(Date.parse("2026-10-28T09:00:00Z"));
    expect(parseTs("2026-10-28T09:00:00+03:00")).toBe(Date.parse("2026-10-28T06:00:00Z"));
    for (const bad of ["yesterday", "2026-13-45", "", null, 5, "2026-10-28"]) expect(parseTs(bad as never), String(bad)).toBeNull();
  });
});

it("lead sorgu üst sınırı sabiti ile SQL LIMIT tutarlı (20000 + 1 → kesilme tespiti)", () => {
  expect(ATTRIBUTION_SQL.leads).toMatch(/LIMIT 20001$/);
});

describe("kabul 1+2 — atıf: son tıklama, 30 gün pencere", () => {
  const created = "2026-10-28 09:00:00";
  const at = (touch: string | undefined, page: string | null = "/en/products/olive-oil") => attributeLead({ created_at: created, source_page: page, touch_at: touch });

  it("test lead'i DOĞRU sayfaya atfedilir (touch_at yok → tıklama = lead anı; URL varyantları aynı sayfa)", () => {
    expect(at(undefined)).toEqual({ kind: "attributed", page: "/en/products/olive-oil" });
    expect(at(undefined, "https://bdimexport.com/en/products/olive-oil/?utm_source=google#x")).toEqual({ kind: "attributed", page: "/en/products/olive-oil" });
    expect(at("2026-10-27T10:00:00Z")).toEqual({ kind: "attributed", page: "/en/products/olive-oil" }); // dün gelen tıklama
  });

  it("PENCERE SINIRI: tam 30 gün ATFEDİLİR; 30 gün + 1 sn ATFEDİLMEZ (direct/window_expired); 29g23sa atfedilir", () => {
    expect(WINDOW_DAYS).toBe(30);
    expect(at("2026-09-28T09:00:00Z").kind).toBe("attributed"); // tam 30g
    expect(at("2026-09-28T08:59:59Z")).toEqual({ kind: "direct", reason: "window_expired" }); // 30g + 1sn
    expect(at("2026-09-28T10:00:00Z").kind).toBe("attributed"); // 29g23sa
    expect(at("2025-01-01T00:00:00Z")).toEqual({ kind: "direct", reason: "window_expired" });
  });

  it("source_page boş/'direct' → direct/no_source; bozuk veya gelecek touch_at → direct/invalid_touch (atfedilmez)", () => {
    expect(at(undefined, "")).toEqual({ kind: "direct", reason: "no_source" });
    expect(at(undefined, "direct")).toEqual({ kind: "direct", reason: "no_source" });
    expect(at(undefined, null)).toEqual({ kind: "direct", reason: "no_source" });
    expect(at("dün")).toEqual({ kind: "direct", reason: "invalid_touch" });
    expect(at("2026-11-15T00:00:00Z")).toEqual({ kind: "direct", reason: "invalid_touch" }); // gelecek
    expect(at("2026-10-29T08:00:00Z").kind).toBe("attributed"); // <1 gün saat sapması toleransı
    expect(attributeLead({ created_at: "bozuk", source_page: "/x" })).toEqual({ kind: "direct", reason: "invalid_touch" });
  });

  it("sanitizeTouch (lead yazıcısı için yazma sözleşmesi): yalnız utm_*/touch_at; enjeksiyon ve aralık dışı touch atılır", () => {
    const now = NOW.getTime();
    const j = JSON.parse(sanitizeTouch({ utm_source: "Google", utm_medium: "CPC", utm_campaign: "Q4 Launch", touch_at: "2026-10-25T10:00:00Z", email: "x@y.z", ip: "1.2.3.4", fbclid: "abc" }, now)!);
    expect(j).toEqual({ utm_source: "google", utm_medium: "cpc", utm_campaign: "q4 launch", touch_at: "2026-10-25T10:00:00.000Z" });
    expect(JSON.parse(sanitizeTouch({ utm_source: "<img onerror=1>", touch_at: "2020-01-01T00:00:00Z" }, now) ?? "{}")).toEqual({});
    expect(sanitizeTouch({}, now)).toBeNull();
    expect(sanitizeTouch({ touch_at: "2027-01-01T00:00:00Z" }, now)).toBeNull(); // gelecek
  });
});

describe("rapor — gerçek SQL üzerinde sayfa bazlı atıf + huni (fixture veri)", () => {
  function fixture() {
    const w = makeEnv();
    const { raw } = w;
    // GA4 sayfa trafiği (3.7 cron biçimi: topPages günlük en çok N) + GSC tam URL'li sayfalar
    analytics(raw, "2026-10-25", { sessions: 920, topPages: [{ pagePath: "/en/products/olive-oil", sessions: 100 }, { pagePath: "/ithalat/", sessions: 300 }, { pagePath: "/de", sessions: 150 }], formStarts: [{ pagePath: "/en/products/olive-oil", count: 10 }, { pagePath: "/ithalat", count: 15 }] },
      { clicks: 40, impressions: 1500, topPages: [{ page: "https://bdimexport.com/en/products/olive-oil/", clicks: 12, impressions: 400 }] });
    analytics(raw, "2026-10-26", { sessions: 970, topPages: [{ pagePath: "/en/products/olive-oil?x=1", sessions: 120 }, { pagePath: "/ithalat", sessions: 200 }, { pagePath: "/de", sessions: 150 }], formStarts: [{ pagePath: "/en/products/olive-oil", count: 14 }] },
      { clicks: 30, impressions: 1200, topPages: [{ page: "/en/products/olive-oil", clicks: 8, impressions: 300 }] });
    // leadler (created_at dönem içinde: 2026-10-01..10-30)
    lead(raw, { source_page: "/en/products/olive-oil", created_at: "2026-10-26 10:00:00", locale: "en", utm: { utm_source: "google", utm_medium: "cpc", touch_at: "2026-10-26T09:50:00Z" } });
    lead(raw, { source_page: "https://bdimexport.com/en/products/olive-oil/", created_at: "2026-10-27 11:00:00", locale: "en", utm: { utm_source: "google", utm_medium: "cpc" } });
    lead(raw, { source_page: "/en/products/olive-oil", created_at: "2026-10-28 08:00:00", locale: "de" });
    lead(raw, { source_page: "/ithalat", created_at: "2026-10-27 12:00:00", locale: "tr", utm: { utm_source: "newsletter", utm_medium: "email" } });
    lead(raw, { source_page: "", created_at: "2026-10-27 13:00:00", locale: "tr" }); // direct (no_source)
    lead(raw, { source_page: "/ithalat", created_at: "2026-10-27 14:00:00", locale: "tr", utm: { touch_at: "2026-09-01T00:00:00Z" } }); // 56 gün önce → atfedilmez
    lead(raw, { source_page: "/de", created_at: "2026-10-27 15:00:00", locale: "de", utm: { touch_at: "geçersiz" } }); // invalid_touch
    lead(raw, { source_page: "/en/products/olive-oil", created_at: "2026-09-20 10:00:00", locale: "en" }); // dönem DIŞI (30g penceresi 10-01'den başlar)
    return w;
  }

  it("DOĞRU SAYFAYA ATIF: olive-oil 3 submit; /ithalat 1; 30 gün dışı ve direct sayfaya YAZILMAZ; totals tutarlı", async () => {
    const { env } = fixture();
    const r = await report(env);
    const olive = r.pages.find((p) => p.page === "/en/products/olive-oil")!;
    const ith = r.pages.find((p) => p.page === "/ithalat")!;
    expect(olive.submits).toBe(3);
    expect(ith.submits).toBe(1); // 2 lead vardı: biri 56 gün eski dokunuş → atfedilmedi
    expect(r.pages.find((p) => p.page === "/de")!.submits).toBe(0); // invalid_touch → /de'ye atfedilmedi
    expect(r.totals).toMatchObject({ leads_in_period: 7, attributed: 4, direct: 3, direct_no_source: 1, direct_window_expired: 1, direct_invalid_touch: 1 });
    expect(r.totals.attributed + r.totals.direct).toBe(r.totals.leads_in_period);
    expect(r.pages.reduce((a, p) => a + p.submits, 0)).toBe(r.totals.attributed); // sayfalara dağılan = atfedilen (kayıp/çift yok)
  });

  it("JOIN: GA4 oturumları (path varyantları birleşir), GSC (tam URL → path), form_starts sayfaya eşlenir; oranlar hesaplanır", async () => {
    const { env } = fixture();
    const r = await report(env);
    const olive = r.pages.find((p) => p.page === "/en/products/olive-oil")!;
    expect(olive).toMatchObject({ sessions: 220, gsc_clicks: 20, gsc_impressions: 700, form_starts: 24, submits: 3, days_with_traffic: 2, locale: "en", product_slug: "olive-oil" });
    expect(olive.session_to_submit_rate).toBeCloseTo(3 / 220, 4);
    expect(olive.session_to_start_rate).toBeCloseTo(24 / 220, 4);
    expect(olive.start_to_submit_rate).toBeCloseTo(3 / 24, 4);
    const ith = r.pages.find((p) => p.page === "/ithalat")!; // "/ithalat/" ve "/ithalat" tek sayfa
    expect(ith).toMatchObject({ sessions: 500, form_starts: 15, locale: "tr" });
    const de = r.pages.find((p) => p.page === "/de")!;
    expect(de).toMatchObject({ sessions: 300, form_starts: null, start_to_submit_rate: null, session_to_start_rate: null }); // /de için form_start olayı gelmedi → null (0 değil)
    expect(r.data_status).toMatchObject({ form_start_tracking: true, search_data: true, traffic: "partial", analytics_days_with_data: 2 });
  });

  it("SAYFA SIRALAMASI: submits azalan → sessions azalan → page; rank 1..N; top_converting yalnız sessions>=min_sessions", async () => {
    const { env } = fixture();
    const r = await report(env);
    expect(r.pages.map((p) => [p.rank, p.page, p.submits])).toEqual([[1, "/en/products/olive-oil", 3], [2, "/ithalat", 1], [3, "/de", 0]]);
    // oran: ithalat 1/500=0.002, olive 3/220=0.0136, de 0/300=0 → olive > ithalat > de
    expect(r.top_converting.map((p) => p.page)).toEqual(["/en/products/olive-oil", "/ithalat", "/de"]);
    const strict = await report(env, { min_sessions: 400 });
    expect(strict.top_converting.map((p) => p.page)).toEqual(["/ithalat"]); // yalnız ≥400 oturum (olive 220, de 300 elendi)
    expect(strict.min_sessions).toBe(400);
  });

  it("huni + kaynak dağılımı + ürün + locale + günlük seri", async () => {
    const { env } = fixture();
    const r = await report(env);
    expect(r.funnel.stages.map((s) => [s.id, s.value])).toEqual([["sessions", 1890], ["form_start", 39], ["submit", 7]]);
    expect(r.sources.find((s) => s.source === "google" && s.medium === "cpc")).toMatchObject({ leads: 2, share: +(2 / 7).toFixed(4) });
    expect(r.sources.find((s) => s.source === "(none)")!.leads).toBe(4); // utm'siz 4 lead (direct, expired, invalid dahil)
    expect(r.products).toEqual([{ product_slug: "olive-oil", leads: 3 }]);
    expect(r.by_locale.find((l) => l.locale === "tr")).toMatchObject({ leads: 3, sessions: 500 });
    expect(r.by_locale.find((l) => l.locale === "en")).toMatchObject({ leads: 2, sessions: 220 });
    expect(r.by_locale.find((l) => l.locale === "zh")).toMatchObject({ leads: 0, sessions: null });
    expect(r.daily).toHaveLength(30);
    expect(r.daily.find((d) => d.day === "2026-10-25")).toMatchObject({ sessions: 920, gsc_clicks: 40, gsc_impressions: 1500, leads: 0 });
    expect(r.daily.find((d) => d.day === "2026-10-27")).toMatchObject({ sessions: null, gsc_clicks: null, leads: 5 });
    expect(r.daily.find((d) => d.day === "2026-10-01")).toMatchObject({ sessions: null, leads: 0 });
  });

  it("locale filtresi: yalnız o locale'in lead'leri ve sayfaları; günlük oturum sayfa-toplamından", async () => {
    const { env } = fixture();
    const r = await report(env, { locale: "tr" });
    expect(r.totals.leads_in_period).toBe(3);
    expect(r.pages.map((p) => p.page)).toEqual(["/ithalat"]);
    expect(r.daily.find((d) => d.day === "2026-10-25")!.sessions).toBe(300);
    expect(r.by_locale.map((l) => l.locale)).toEqual(["tr"]);
  });

  it("dönem: days=7 → eski lead'ler dahil değil; days sınırı 1..90", async () => {
    const { env } = fixture();
    expect((await report(env, { days: 7 })).period).toMatchObject({ from: "2026-10-24", to: "2026-10-30", days: 7 });
    expect((await report(env, { days: 7 })).totals.leads_in_period).toBe(7);
    expect((await report(env, { days: 90 })).totals.leads_in_period).toBe(8); // 09-20'deki lead artık dönemde
    expect((await report(env, { days: 1000 })).period.days).toBe(90);
  });

  it("kaynak çeşidi >10 → ilk 10 + '(other)'; UTM enjeksiyonu '(other)' olur ve ham metin yanıtta YOK", async () => {
    const w = makeEnv();
    for (let i = 0; i < 12; i++) lead(w.raw, { source_page: "/x" + i, created_at: "2026-10-27 10:0" + (i % 10) + ":00", utm: { utm_source: "src" + i, utm_medium: "m" } });
    lead(w.raw, { source_page: "/y", created_at: "2026-10-27 11:00:00", utm: { utm_source: "<script>alert(1)</script>", utm_medium: "'; DROP TABLE leads;--" } });
    const r = await report(w.env);
    expect(r.sources.length).toBeLessThanOrEqual(11);
    expect(r.sources.some((s) => s.source === "(other)")).toBe(true);
    expect(r.sources.reduce((a, s) => a + s.leads, 0)).toBe(13);
    expect(JSON.stringify(r)).not.toMatch(/<script|DROP TABLE/);
  });

  it("bozuk JSON (analytics_daily ga4/gsc, leads.utm_json) sorguyu/görünümü PATLATMAZ", async () => {
    const w = makeEnv();
    analytics(w.raw, "2026-10-27", "{bozuk", "[1,2");
    analytics(w.raw, "2026-10-28", { topPages: "değil-dizi" }, { topPages: [{ page: 5 }] });
    lead(w.raw, { source_page: "/en/services/sourcing", created_at: "2026-10-27 10:00:00", utm: "{not json" });
    const r = await report(w.env);
    expect(r.totals).toMatchObject({ leads_in_period: 1, attributed: 1 });
    expect(r.pages.find((p) => p.page === "/en/services/sourcing")).toMatchObject({ submits: 1, sessions: null });
  });
});

describe("kabul 6 — UYDURMA METRİK YOK: veri yoksa null", () => {
  it("analytics_daily BOŞ (E4: canlı veri yok) → trafik alanları null, oranlar null, data_status none + açıklayıcı not; lead sayıları gerçek", async () => {
    const w = makeEnv();
    lead(w.raw, { source_page: "/en/products/olive-oil", created_at: "2026-10-27 10:00:00" });
    const r = await report(w.env);
    expect(r.data_status).toMatchObject({ traffic: "none", analytics_days_with_data: 0, search_data: false, form_start_tracking: false });
    expect(r.data_status.note).toMatch(/E4/);
    expect(r.data_status.note).toMatch(/Form-başladı/);
    expect(r.totals).toMatchObject({ leads_in_period: 1, attributed: 1, sessions: null, gsc_clicks: null, gsc_impressions: null, form_starts: null });
    expect(r.pages[0]).toMatchObject({ page: "/en/products/olive-oil", submits: 1, sessions: null, session_to_submit_rate: null, session_to_start_rate: null, start_to_submit_rate: null, days_with_traffic: 0 });
    expect(r.top_converting).toEqual([]);
    expect(r.daily.every((d) => d.sessions === null && d.gsc_clicks === null && d.gsc_impressions === null)).toBe(true);
    expect(r.funnel.stages.map((s) => s.value)).toEqual([null, null, 1]);
    expect(r.by_locale.every((l) => l.sessions === null)).toBe(true);
  });

  it("tamamen boş DB: 200-uyumlu boş rapor (sayfa yok, lead 0), sayısal uydurma yok", async () => {
    const r = await report(makeEnv().env);
    expect(r).toMatchObject({ contract: "attribution.v1", pages: [], sources: [], products: [], totals: { leads_in_period: 0, attributed: 0, direct: 0, sessions: null } });
    expect(r.daily).toHaveLength(30);
  });

  it("GA4 var ama formStarts YOK → form_start null (0 değil), tracking=false; tüm günler dolu → traffic 'ok'", async () => {
    const w = makeEnv();
    for (let d = 1; d <= 7; d++) analytics(w.raw, `2026-10-${String(24 + d - 1).padStart(2, "0")}`, { sessions: 10, topPages: [{ pagePath: "/de", sessions: 10 }] });
    const r = await report(w.env, { days: 7 });
    expect(r.data_status).toMatchObject({ traffic: "ok", analytics_days_with_data: 7, form_start_tracking: false });
    expect(r.totals.form_starts).toBeNull();
    expect(r.pages[0].form_starts).toBeNull();
  });
});

describe("kabul 3 — ANONİM JOIN kanıtı (KVKK)", () => {
  function pii() {
    const w = makeEnv();
    lead(w.raw, { source_page: "/en/products/olive-oil", created_at: "2026-10-27 10:00:00", utm: { utm_source: "google" }, partner: null,
      payload: { name: "Jane Secret", email: "jane.secret@example.org", phone: "+4915112345678", message: "very private text", company: "ACME Gizli GmbH" } });
    analytics(w.raw, "2026-10-27", { sessions: 50, topPages: [{ pagePath: "/en/products/olive-oil", sessions: 50 }] });
    return w;
  }
  const PII = ["jane.secret", "Jane Secret", "+4915112345678", "very private", "ACME Gizli", "example.org"];

  it("GÖRÜNÜM YAPISAL OLARAK ANONİM: attribution_leads_v kolonları tam 8 tane (id/payload/partner/kanal/rıza YOK); yasak kolon seçimi HATA verir", () => {
    const w = pii();
    const cols = (w.raw.prepare("PRAGMA table_info(attribution_leads_v)").all() as { name: string }[]).map((c) => c.name);
    expect(cols).toEqual(["created_at", "locale", "form_type", "source_page", "utm_source", "utm_medium", "utm_campaign", "touch_at"]);
    for (const forbidden of ["id", "payload_json", "partner_id", "channel_pref", "consent_version", "consent_at", "double_optin_at", "status"]) {
      expect(() => w.raw.prepare(`SELECT ${forbidden} FROM attribution_leads_v`).all(), forbidden).toThrow(/no such column/);
    }
  });

  it("atıf sorguları YALNIZ görünümleri okur: çalışan SQL metinlerinde `leads` tablosu / PII kolonu YOK (SQL gözlemcisi)", async () => {
    const w = pii();
    const seen: string[] = [];
    const spy = { prepare: (sql: string) => (seen.push(sql), (w.env.DB as never as { prepare(s: string): unknown }).prepare(sql)) };
    await computeAttribution(spy as never, {}, NOW);
    expect(seen.length).toBe(5);
    for (const sql of seen) {
      expect(sql).not.toMatch(/\bFROM\s+leads\b|\bJOIN\s+leads\b|payload_json|partner_id|consent_|channel_pref|double_optin|\bemail\b|\bphone\b|\bid\b\s*,|SELECT\s+\*/i);
      expect(sql).toMatch(/attribution_(leads|page_traffic|page_search|page_formstart)_v|analytics_daily/);
    }
    expect(Object.values(ATTRIBUTION_SQL).every((s) => !/FROM\s+leads\b/i.test(s))).toBe(true);
    // kaynak dosyada da: leads tablosuna doğrudan erişim yok
    const src = readFileSync(resolve(__dirname, "../src/attribution.ts"), "utf8").split("\n").filter((l) => !l.trim().startsWith("//")).join("\n");
    expect(src).not.toMatch(/FROM\s+leads\b|payload_json|partner_id/i);
  });

  it("ÇIKTI anonim: PII metni yanıtta YOK; yanıtta id/e-posta/telefon/ad/mesaj anahtarı YOK; satır-satır lead dizisi YOK", async () => {
    const w = pii();
    const r = await report(w.env);
    const text = JSON.stringify(r);
    for (const p of PII) expect(text, p).not.toContain(p);
    const keys = new Set<string>();
    const walk = (o: unknown) => {
      if (Array.isArray(o)) o.forEach(walk);
      else if (o && typeof o === "object") for (const [k, v] of Object.entries(o)) { keys.add(k); walk(v); }
    };
    walk(r);
    for (const k of ["lead_id", "email", "phone", "name", "message", "payload", "payload_json", "partner_id", "company", "ip", "user_id", "created_at", "channel_pref"]) expect(keys.has(k), k).toBe(false);
    // "id" anahtarı yalnız huni aşama kimliğidir (sessions|form_start|submit) — lead kimliği DEĞİL
    expect(r.funnel.stages.map((s) => s.id)).toEqual(["sessions", "form_start", "submit"]);
    expect(JSON.stringify({ ...r, funnel: undefined })).not.toMatch(/"id"\s*:/);
    // yalnız agregat: dönen en ince lead kırılımı sayfa/utm/locale/gün SAYIMIdır
    expect(r.totals.leads_in_period).toBe(1);
  });

  it("anonimlik lead'in içeriğinden bağımsızdır: payload/partner değişse de çıktı AYNI (bağımlılık yok)", async () => {
    const a = makeEnv(), b = makeEnv();
    lead(a.raw, { source_page: "/en/x", created_at: "2026-10-27 10:00:00", payload: { email: "a@a.a" } });
    b.raw.prepare("INSERT INTO partners (id, name) VALUES ('P1','Test Partner')").run();
    lead(b.raw, { source_page: "/en/x", created_at: "2026-10-27 10:00:00", payload: { email: "zzz@zzz.zz", name: "Başka Kişi" }, partner: "P1" });
    const ra = await report(a.env), rb = await report(b.env);
    expect({ ...ra, generated_at: "" }).toEqual({ ...rb, generated_at: "" });
  });
});

describe("kabul 4 — migration 0006: EXPAND-ONLY (geri alınabilir, veri/tablo değişmez)", () => {
  const files = () => readdirSync(MIG_DIR).filter((f) => f.endsWith(".sql")).sort();
  const apply = (db: DatabaseSync, only: (f: string) => boolean) => { for (const f of files().filter(only)) db.exec(readFileSync(resolve(MIG_DIR, f), "utf8")); };
  const snapshot = (db: DatabaseSync) => ({
    tables: db.prepare("SELECT name, sql FROM sqlite_master WHERE type='table' AND name NOT LIKE 'sqlite_%' ORDER BY name").all(),
    indexes: db.prepare("SELECT name FROM sqlite_master WHERE type='index' AND name NOT LIKE 'sqlite_%' ORDER BY name").all(),
    triggers: db.prepare("SELECT name FROM sqlite_master WHERE type='trigger' ORDER BY name").all(),
  });

  it("0006 yalnız VIEW ekler: tablo/kolon/index/trigger BİREBİR aynı; yıkıcı ifade (DROP TABLE/ALTER/DELETE/UPDATE/INSERT) yok", () => {
    const sql = readFileSync(resolve(MIG_DIR, "0006_attribution_views.sql"), "utf8").replace(/--.*$/gm, "");
    expect(sql).not.toMatch(/\b(DROP\s+TABLE|ALTER\s+TABLE|DELETE\s+FROM|UPDATE\s|INSERT\s|CREATE\s+TABLE|CREATE\s+INDEX|CREATE\s+TRIGGER)\b/i);
    expect([...sql.matchAll(/CREATE\s+VIEW\s+IF\s+NOT\s+EXISTS\s+(\w+)/gi)].map((m) => m[1])).toEqual(["attribution_leads_v", "attribution_page_traffic_v", "attribution_page_search_v", "attribution_page_formstart_v"]);
    const db = new DatabaseSync(":memory:");
    apply(db, (f) => f < "0006");
    db.prepare("INSERT INTO leads (id, source_page, locale, payload_json, created_at) VALUES ('L1','/x','en','{}','2026-10-27 10:00:00')").run();
    const before = snapshot(db);
    const leadsBefore = db.prepare("SELECT * FROM leads").all();
    apply(db, (f) => f === "0006_attribution_views.sql");
    expect(snapshot(db)).toEqual(before);
    expect(db.prepare("SELECT * FROM leads").all()).toEqual(leadsBefore);
    expect((db.prepare("SELECT name FROM sqlite_master WHERE type='view' ORDER BY name").all() as { name: string }[]).map((v) => v.name)).toEqual(["attribution_leads_v", "attribution_page_formstart_v", "attribution_page_search_v", "attribution_page_traffic_v"]);
  });

  it("idempotent (IF NOT EXISTS: yeniden uygulama hata vermez) ve GERİ ALINABİLİR (DROP VIEW → eski şema, veri korunur)", () => {
    const db = new DatabaseSync(":memory:");
    apply(db, (f) => f <= "0006_attribution_views.sql");
    expect(() => apply(db, (f) => f === "0006_attribution_views.sql")).not.toThrow();
    const dataTables = snapshot(db).tables;
    db.prepare("INSERT INTO leads (id, source_page, locale, payload_json, created_at) VALUES ('L1','/x','en','{}','2026-10-27 10:00:00')").run();
    for (const v of ["attribution_leads_v", "attribution_page_traffic_v", "attribution_page_search_v", "attribution_page_formstart_v"]) db.exec(`DROP VIEW ${v}`);
    expect(snapshot(db).tables).toEqual(dataTables);
    expect(db.prepare("SELECT COUNT(*) c FROM leads").get()).toEqual({ c: 1 });
    expect(files().filter((f) => f.startsWith("0006"))).toEqual(["0006_attribution_views.sql"]); // tek 0006
  });

  it("eski kod etkilenmez: mevcut sorgular (Dashboard/analytics özeti: leads, analytics_daily) 0006'dan ÖNCE ve SONRA aynı sonucu verir", () => {
    const run = (withView: boolean) => {
      const db = new DatabaseSync(":memory:");
      apply(db, (f) => (withView ? true : f < "0006"));
      db.prepare("INSERT INTO leads (id, source_page, locale, payload_json, status, created_at) VALUES ('L1','/x','en','{}','new','2026-10-27 10:00:00')").run();
      db.prepare("INSERT INTO analytics_daily (day, locale, ga4_json) VALUES ('2026-10-27','all','{\"sessions\":5}')").run();
      return [db.prepare("SELECT status, COUNT(*) n FROM leads GROUP BY status").all(), db.prepare("SELECT day, ga4_json FROM analytics_daily ORDER BY day DESC LIMIT 1").all()];
    };
    expect(run(true)).toEqual(run(false));
  });
});

describe("endpoint: GET /admin/api/analytics/attribution (guard + admin-only + sözleşme)", () => {
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
      throw new Error("beklenmeyen ağ çağrısı: " + u);
    });
  });
  const get = (c: ReturnType<typeof makeEnv>, qs: string, token?: string) =>
    worker.fetch(new Request("https://bdimexport.pages.dev/admin/api/analytics/attribution" + qs, { headers: { "cf-connecting-ip": "6.6.6.6", ...(token ? { "cf-access-jwt-assertion": token } : {}) } }), c.env);

  it("anon 401 · viewer 403 (lead-türevi → admin-only) · admin 200 + sözleşme alanları (6.2 okur)", async () => {
    const c = makeEnv(ACCESS);
    lead(c.raw, { source_page: "/en/products/olive-oil", created_at: new Date(Date.now() - 86_400_000).toISOString().slice(0, 19).replace("T", " ") });
    expect((await get(c, "")).status).toBe(401);
    expect((await get(c, "", await jwt("view@example.com"))).status).toBe(403);
    const ok = await get(c, "?days=30", await jwt("boss@example.com"));
    expect(ok.status).toBe(200);
    expect(ok.headers.get("cache-control")).toBe("no-store");
    const body = (await ok.json()) as AttributionReport;
    expect(Object.keys(body).sort()).toEqual(["by_locale", "contract", "daily", "data_status", "funnel", "generated_at", "min_sessions", "pages", "period", "products", "sources", "top_converting", "totals"]);
    expect(body.contract).toBe("attribution.v1");
    expect(body.period).toMatchObject({ days: 30, attribution_window_days: 30, model: "last_click" });
    expect(body.pages[0]).toMatchObject({ rank: 1, page: "/en/products/olive-oil", submits: 1, sessions: null });
    expect(Object.keys(body.pages[0]).sort()).toEqual(["days_with_traffic", "form_starts", "gsc_clicks", "gsc_impressions", "locale", "page", "product_slug", "rank", "session_to_start_rate", "session_to_submit_rate", "sessions", "start_to_submit_rate", "submits"]);
    expect(Object.keys(body.data_status).sort()).toEqual(["analytics_days_with_data", "form_start_tracking", "leads_truncated", "note", "pages_truncated", "search_data", "traffic", "traffic_basis"]);
  });

  it("parametre doğrulaması: days 0/91/abc, locale bilinmeyen, min_sessions negatif → 400; geçerli locale + days → 200", async () => {
    const c = makeEnv(ACCESS);
    const t = await jwt("boss@example.com");
    for (const qs of ["?days=0", "?days=91", "?days=abc", "?days=1e3", "?locale=xx", "?locale=tr%27%20OR%201=1", "?min_sessions=-1"]) expect((await get(c, qs, t)).status, qs).toBe(400);
    expect((await get(c, "?days=90&locale=en-ru&min_sessions=0", t)).status).toBe(200);
  });

  it("POST/DELETE bu uca → 404 (yalnız GET; yazma yolu yok)", async () => {
    const c = makeEnv(ACCESS);
    const t = await jwt("boss@example.com");
    for (const m of ["POST", "PUT", "DELETE", "PATCH"]) {
      const r = await worker.fetch(new Request("https://bdimexport.pages.dev/admin/api/analytics/attribution", { method: m, headers: { "cf-connecting-ip": "6.6.6.6", "cf-access-jwt-assertion": t, "content-type": "application/json" }, body: "{}" }), c.env);
      expect(r.status, m).toBe(404);
    }
  });
});
