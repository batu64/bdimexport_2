// FAZ_6 6.3 kabul testleri — keyword motoru. GERÇEK SQL (tüm migration'lar, node:sqlite) + GERÇEK worker router/guard + GERÇEK 4.7 kota hattı (cron-rss/quota.ts).
// Veri = test FIXTURE'ı (canlı GSC sorgu verisi yok — E4); şema + skor + akış gerçek, veri mock. Kabul: (1) skor fixture'la (2) Gemini stub gerçek çağrı yapmaz,
// anahtarsız çalışır, kotayla uyumlu (3) D1'e yazım + veri yoksa null/data_status (sahte metrik yok) (4) migration 0007 expand-only + geri alınabilir
// (5) keywords.v1 sözleşmesi + uç (admin-only) (6) 10 keyword → ai_jobs payload'u (gerekçeli).
import { beforeAll, beforeEach, describe, expect, it, vi } from "vitest";
import { DatabaseSync } from "node:sqlite";
import { readFileSync, readdirSync } from "node:fs";
import { resolve } from "node:path";
import worker from "../src/index";
import { bandOf, isSafeQuery, normalizeQuery, pageTypeFor, positionBucket, proximity, scoreOpportunities, toJobPayload, type GscQueryRow, type ScoredOpportunity } from "../src/keyword-score";
import { buildInsightsRequest, directRunner, GeminiKeywordModel, generateKeywordInsights, parseInsights, StubKeywordModel } from "../src/keyword-insights";
import { computeKeywordReport, KEYWORD_SQL, keywordWindow, parseKeywordQuery, refreshKeywordOpportunities } from "../src/keywords";
import type { KeywordReport } from "../src/keyword-contract";
import { callWithQuota } from "../../cron-rss/src/quota";
import { CONTENT_LOCALES, PAGE_TYPES } from "../../../app/admin/content/types";
import { _resetJwksCache } from "../../../app/admin/middleware";
import { makeEnv } from "./helpers";

type Raw = ReturnType<typeof makeEnv>["raw"];
const NOW = new Date("2026-10-30T12:00:00Z"); // pencere: 2026-10-02 … 2026-10-29
const MIG_DIR = resolve(__dirname, "../../../db/migrations");
const D1 = "2026-10-20", D2 = "2026-10-21";

/** 10 test keyword'ü (+ atılması gereken gürültü/PII/bozuk satırlar). GSC satır biçimi: {query,page,clicks,impressions,ctr,position}. */
const q = (day: string, query: string, page: string, impressions: number, clicks: number, position: number): GscQueryRow =>
  ({ day, query, page, impressions, clicks, ctr: impressions ? clicks / impressions : 0, position });
const FIXTURE: GscQueryRow[] = [
  q(D1, "Çin'den ithalat", "https://bdimexport.com/ithalat/cin/", 600, 6, 9), // A: iki gün → 1000 gösterim, ort. 11.0
  q(D2, "çin'den  ithalat", "/ithalat/cin", 400, 4, 14),
  q(D1, "olive oil supplier turkey", "/en/products/olive-oil", 500, 2, 6), // B: near (ürün)
  q(D1, "turkish towels wholesale", "/en/products/towels", 300, 1, 2), // C: ilk 3, CTR çok düşük → snippet
  q(D1, "bdimexport", "/", 400, 60, 1.5), // D: ilk 3, sağlıklı → monitor
  q(D1, "textile sourcing germany", "/de/leistungen/sourcing", 250, 0, 28), // E: long_shot → new_page
  q(D1, "hazelnut exporter", "/en/products/hazelnut", 200, 3, 8), // F: iki sayfa yarışıyor (yamyamlaşma)
  q(D1, "hazelnut exporter", "/en/industries/food", 100, 0, 15),
  q(D1, "土耳其橄榄油", "/zh/products/olive-oil", 120, 1, 7), // K: zh
  q(D1, "مورد تركي", "/en/ar/services/sourcing", 80, 0, 18), // L: en-ar hizmet
  q(D1, "ihracat danışmanlık", "/ihracat/danismanlik", 150, 2, 4), // M: tr hizmet, sınır pozisyon 4
  q(D1, "import aus der türkei", "/de/leistungen/logistics", 90, 1, 22), // N: de long_shot
  // atılacaklar
  q(D1, "az gösterim", "/en", 5, 0, 9), // minImpressions altı
  q(D1, "çok uzak", "/en", 900, 0, 60), // maxPosition üstü
  q(D1, "info@firma.com", "/", 300, 3, 5), // PII: e-posta
  q(D1, "+90 532 123 45 67", "/", 300, 3, 5), // PII: telefon
  q(D1, "www.rakip.com", "/", 300, 3, 5), // URL
  q(D1, "bozuk tıklama", "/en", 50, 80, 5), // clicks > impressions
  q(D1, "bozuk sayfa", "javascript:alert(1)", 50, 1, 5),
  { day: D1, query: "metin sayı", page: "/en", impressions: "100" as unknown as number, clicks: 1, position: 5 },
];
const TEN = ["çin'den ithalat", "olive oil supplier turkey", "turkish towels wholesale", "bdimexport", "textile sourcing germany", "hazelnut exporter", "土耳其橄榄油", "مورد تركي", "ihracat danışmanlık", "import aus der türkei"];
const by = (xs: ScoredOpportunity[], query: string) => xs.find((x) => x.query === query)!;

// ───────────────────────── (1) deterministik skor ─────────────────────────
describe("kabul 1 — skor (kw-score.v1) fixture'la", () => {
  const out = scoreOpportunities(FIXTURE);

  it("yalnız 10 geçerli keyword skorlanır; gürültü/PII/bozuk satırlar atılır", () => {
    expect(out.map((o) => o.query).sort()).toEqual([...TEN].sort());
    for (const bad of ["az gösterim", "çok uzak", "info@firma.com", "+90 532 123 45 67", "www.rakip.com", "bozuk tıklama", "bozuk sayfa", "metin sayı"]) expect(out.some((o) => o.query === bad)).toBe(false);
  });

  it("agregasyon: aynı sorgu (büyük/küçük harf, boşluk, URL varyantı) tek satır; gösterim ağırlıklı pozisyon", () => {
    const a = by(out, "çin'den ithalat");
    expect(a).toMatchObject({ locale: "tr", page: "/ithalat/cin", pages_count: 1, impressions: 1000, clicks: 10, ctr: 0.01, position: 11, days_with_data: 2 });
  });

  it("elle hesaplanan skorlar: A=80 (D=1, P=1, G=0) · D=50.9 (log talep, P=0.25, CTR sağlıklı)", () => {
    // A: maxImp=1000 → D=1; pos 11 → P=1; ref(11-20)=4/580 < ctr 0.01 → G=0 → 100·(0.5+0.3)=80
    expect(by(out, "çin'den ithalat").score).toBe(80);
    expect(by(out, "çin'den ithalat").ref_ctr).toBe(Math.round((4 / 580) * 1e4) / 1e4);
    // D: D=log10(401)/log10(1001), P=0.25, G=0 → 100·(0.5·D+0.075)
    expect(by(out, "bdimexport").score).toBe(Math.round(1000 * (0.5 * (Math.log10(401) / Math.log10(1001)) + 0.075)) / 10);
  });

  it("bant + karar: near→update_page · snippet→improve_snippet · top→monitor · long_shot→new_page", () => {
    const m = Object.fromEntries(out.map((o) => [o.query, [o.band, o.action]]));
    expect(m).toEqual({
      "çin'den ithalat": ["near", "update_page"], "olive oil supplier turkey": ["near", "update_page"], "turkish towels wholesale": ["snippet", "improve_snippet"],
      bdimexport: ["top", "monitor"], "textile sourcing germany": ["long_shot", "new_page"], "hazelnut exporter": ["near", "update_page"],
      "土耳其橄榄油": ["near", "update_page"], "مورد تركي": ["near", "update_page"], "ihracat danışmanlık": ["near", "update_page"], "import aus der türkei": ["long_shot", "new_page"],
    });
    expect(by(out, "مورد تركي").locale).toBe("en-ar");
    expect(by(out, "土耳其橄榄油").locale).toBe("zh");
  });

  it("gerekçe: hesaplanmış sayılar + karar; yamyamlaşma uyarısı; en çok gösterim alan sayfa seçilir", () => {
    const f = by(out, "hazelnut exporter");
    expect(f).toMatchObject({ page: "/en/products/hazelnut", pages_count: 2, impressions: 300 });
    expect(f.reason).toMatch(/yamyamlaşma/);
    const a = by(out, "çin'den ithalat");
    expect(a.reason).toContain("/ithalat/cin sorguda ort. 11. sırada; 1000 gösterim, 10 tıklama, CTR %1");
    expect(a.reason).toMatch(/mevcut sayfayı/);
    for (const o of out) expect(o.reason.length).toBeGreaterThan(20);
  });

  it("long_shot (20+) hiçbir yakın fırsatın üstüne çıkmaz: 20+ sırada CTR açığı sayılmaz (G=0)", () => {
    const e = by(out, "textile sourcing germany");
    // D=log10(251)/log10(1001), P(28)=0.6−0.5·8/30, G=0 → 100·(0.5·D+0.3·P)
    expect(e.score).toBe(Math.round(1000 * (0.5 * (Math.log10(251) / Math.log10(1001)) + 0.3 * (0.6 - 0.5 * (8 / 30)))) / 10);
    expect(out[0].query).toBe("çin'den ithalat");
    // L: 80 gösterim, 0 tıklama, 18. sıra — beklenen tık = ref·80 ≈ 0.55 < 5 → açık güvenle sönümlenir; A'nın (1000 gösterim) üstüne çıkamaz
    const l = by(out, "مورد تركي"), refL = l.ref_ctr!;
    expect(l.score).toBe(Math.round(1000 * (0.5 * (Math.log10(81) / Math.log10(1001)) + 0.3 + 0.2 * Math.min(1, (refL * 80) / 5))) / 10);
    expect(l.score).toBeLessThan(by(out, "çin'den ithalat").score);
    expect(out.filter((o) => o.band === "long_shot").every((l) => out.some((n) => n.band === "near" && n.impressions >= l.impressions && n.score > l.score))).toBe(true);
  });

  it("deterministik: girdi sırası değişse çıktı birebir aynı; sıralama skor↓ gösterim↓ sorgu↑", () => {
    const rev = scoreOpportunities([...FIXTURE].reverse());
    expect(rev).toEqual(out);
    for (let i = 1; i < out.length; i++) expect(out[i - 1].score > out[i].score || (out[i - 1].score === out[i].score && out[i - 1].impressions >= out[i].impressions)).toBe(true);
    for (const o of out) expect(o.score >= 0 && o.score <= 100).toBe(true);
  });

  it("referans CTR: kovada yeterli gösterim yoksa null → ağırlıklar yeniden dağıtılır (ceza yok)", () => {
    const one = scoreOpportunities([q(D1, "tek", "/en/x", 100, 1, 12)]);
    expect(one[0].ref_ctr).toBeNull();
    expect(one[0].score).toBe(100); // D=1, P=1, G yok → 100·(0.5+0.3)/0.8
    expect(scoreOpportunities([])).toEqual([]);
  });

  it("yardımcılar: proximity sürekli/sınırlı · kovalar · bant sınırları · sorgu güvenliği", () => {
    expect([proximity(1), proximity(3), proximity(8), proximity(20), proximity(50), proximity(51)]).toEqual([0.25, 0.25, 1, 1, expect.closeTo(0.1, 10), 0]);
    expect(proximity(3.0001)).toBeCloseTo(0.5, 3); // bilinçli basamak: ilk 3 = zaten kazanılmış
    expect(proximity(19.999)).toBe(1);
    expect(proximity(20.001)).toBeCloseTo(0.6, 3); // bilinçli basamak: 20+ = uzak hedef, "yakın fırsat" platosunun altında
    for (let p = 4; p < 50; p += 0.5) if (p >= 20.5) expect(proximity(p + 0.5)).toBeLessThan(proximity(p));
    expect([positionBucket(3), positionBucket(3.1), positionBucket(10), positionBucket(20.5)]).toEqual(["1-3", "4-10", "4-10", "21-50"]);
    expect([bandOf(3.9, 0.01, 0.1), bandOf(3.9, 0.06, 0.1), bandOf(3.9, 0, null), bandOf(4, 0, 0.1), bandOf(20, 0, null), bandOf(20.1, 0, null)]).toEqual(["snippet", "top", "top", "near", "near", "long_shot"]);
    expect(normalizeQuery("  Çin'den   İTHALAT ")).toBe("çin'den i̇thalat".normalize("NFC"));
    expect([normalizeQuery(""), normalizeQuery("a\u0000b"), normalizeQuery("x".repeat(201)), normalizeQuery(5)]).toEqual([null, null, null, null]);
    expect([isSafeQuery("ali@veli.com"), isSafeQuery("0532 123 45 67"), isSafeQuery("12345678901"), isSafeQuery("http://x.y"), isSafeQuery("iso 9001 belgesi"), isSafeQuery("hs code 0509")]).toEqual([false, false, false, false, true, true]);
  });
});

// ───────────────────────── (6) 10 keyword → ai_jobs (FAZ 4 4.5 hattı, input C) ─────────────────────────
describe("kabul 6 — 10 test keyword'ü → ai_jobs payload'u (gerekçeli, 4.5 tüketici sözleşmesi)", () => {
  const out = scoreOpportunities(FIXTURE);
  it("monitor dışındaki 9 fırsat geçerli input-C payload'u üretir; her kayıtta gerekçe; monitor → iş YOK", () => {
    const payloads = TEN.map((t) => toJobPayload(by(out, t), t === "olive oil supplier turkey" ? "KW1" : null));
    expect(payloads.filter((p) => p === null)).toHaveLength(1);
    expect(toJobPayload(by(out, "bdimexport"))).toBeNull();
    for (const p of payloads.filter((x) => x !== null)) {
      // jobs.ts parsePayload kuralları: input C + phrase string + locales ⊂ CONTENT_LOCALES (1–9) + page_type ∈ PAGE_TYPES
      expect(p.input).toBe("C");
      expect(typeof p.phrase).toBe("string");
      expect(p.locales.length).toBe(1);
      expect((CONTENT_LOCALES as readonly string[]).includes(p.locales[0])).toBe(true);
      expect((PAGE_TYPES as readonly string[]).includes(p.page_type)).toBe(true);
      expect(p.reason.length).toBeGreaterThan(20);
      expect(p).toMatchObject({ source: "gsc_opportunity", score_version: "kw-score.v1" });
    }
    expect(payloads[1]).toMatchObject({ keyword_id: "KW1", page_type: "product", action: "update_page", target_page: "/en/products/olive-oil" });
    expect(toJobPayload(by(out, "textile sourcing germany"))).toMatchObject({ page_type: "article", action: "new_page", target_page: null, locales: ["de"] });
    expect(toJobPayload(by(out, "مورد تركي"))).toMatchObject({ page_type: "service", locales: ["en-ar"] });
    expect(pageTypeFor({ page: "/en/industries/food", action: "update_page" })).toBe("industry");
  });
});

// ───────────────────────── (2) Gemini STUB ─────────────────────────
describe("kabul 2 — generateKeywordInsights(): stub gerçek çağrı yapmaz, anahtarsız çalışır, 4.7 kota hattıyla uyumlu", () => {
  const items = [{ query: "olive oil supplier turkey", locale: "en", position: 6, impressions: 500, band: "near" }, { query: "土耳其橄榄油", locale: "zh", position: 7, impressions: 120, band: "near" }];
  let net: ReturnType<typeof vi.fn>;
  beforeEach(() => {
    net = vi.fn(async () => { throw new Error("AĞ ÇAĞRISI YASAK"); });
    vi.stubGlobal("fetch", net);
  });

  it("off (varsayılan) → çağrı yok, boş", async () => {
    const run = vi.fn(directRunner) as unknown as typeof directRunner;
    expect(await generateKeywordInsights({}, items, run)).toEqual({ status: "off", model: null, insights: [] });
    expect(run).not.toHaveBeenCalled();
    expect(net).not.toHaveBeenCalled();
  });

  it("stub → yer tutucu: niyet/küme/öneri NULL (sahte içgörü yok), ağ çağrısı yok, anahtar gerekmez", async () => {
    const r = await generateKeywordInsights({ KEYWORD_INSIGHTS_MODE: "stub" }, items);
    expect(r).toEqual({ status: "stub", model: "stub", insights: items.map((i) => ({ query: i.query, locale: i.locale, intent: null, cluster: null, suggestion: null })) });
    expect(net).not.toHaveBeenCalled();
  });

  it("gemini, anahtar yok → unconfigured (fail-closed); sahte anahtarla bile E3 kodu yazılmadığından çağrı YOK", async () => {
    expect(await generateKeywordInsights({ KEYWORD_INSIGHTS_MODE: "gemini" }, items)).toMatchObject({ status: "unconfigured", insights: [] });
    expect(await generateKeywordInsights({ KEYWORD_INSIGHTS_MODE: "gemini", GEMINI_API_KEY: "test-not-a-key", GEMINI_MODEL: "gemini-test" }, items)).toMatchObject({ status: "unconfigured", insights: [] });
    expect(await generateKeywordInsights({ KEYWORD_INSIGHTS_MODE: "bilinmeyen" }, items)).toMatchObject({ status: "unconfigured" });
    await expect(new GeminiKeywordModel("k", "m").insights(buildInsightsRequest(items))).rejects.toThrow(/E3/);
    expect(net).not.toHaveBeenCalled();
  });

  it("GERÇEK callWithQuota (cron-rss 4.7) ile: stub çağrısı ai_usage_daily'ye sayılır; kota doluysa quota_paused + model çağrılmaz", async () => {
    const { env, raw } = makeEnv({ AI_DAILY_LIMIT: "1" } as never);
    const runner = ((p, f, inv) => callWithQuota(env as never, NOW, p, f, inv)) as Parameters<typeof generateKeywordInsights>[2];
    expect((await generateKeywordInsights({ KEYWORD_INSIGHTS_MODE: "stub" }, items, runner)).status).toBe("stub");
    expect(raw.prepare("SELECT model, calls, failures FROM ai_usage_daily").all()).toEqual([{ model: "stub", calls: 1, failures: 0 }]);
    const spy = vi.spyOn(StubKeywordModel.prototype, "insights");
    expect(await generateKeywordInsights({ KEYWORD_INSIGHTS_MODE: "stub" }, items, runner)).toEqual({ status: "quota_paused", model: null, insights: [] }); // 1/1 → %80 eşiği aşıldı, yedek yok
    expect(spy).not.toHaveBeenCalled();
    spy.mockRestore();
    expect(net).not.toHaveBeenCalled(); // webhook tanımsız → alert yalnız log/audit
  });

  it("model hatası skor hattını durdurmaz → status error (fırlatmaz)", async () => {
    const boom = (async () => { throw new Error("x"); }) as Parameters<typeof generateKeywordInsights>[2];
    expect(await generateKeywordInsights({ KEYWORD_INSIGHTS_MODE: "stub" }, items, boom)).toMatchObject({ status: "error", insights: [] });
  });

  it("parseInsights: güvenilmez çıktı süzülür (istenmeyen sorgu, bilinmeyen niyet, HTML/kontrol, uzunluk, tekrar)", () => {
    const raw = [
      { query: "olive oil supplier turkey", locale: "en", intent: "commercial", cluster: "<b>olive</b>\u0000 oil", suggestion: "x".repeat(300) },
      { query: "olive oil supplier turkey", locale: "en", intent: "transactional", cluster: "dup", suggestion: null },
      { query: "uydurma sorgu", locale: "en", intent: "commercial", cluster: "c", suggestion: "s" },
      { query: "土耳其橄榄油", locale: "zh", intent: "BUY NOW", cluster: "", suggestion: 5 },
      "metin", null,
    ];
    expect(parseInsights(raw, items)).toEqual([
      { query: "olive oil supplier turkey", locale: "en", intent: "commercial", cluster: "b olive /b oil", suggestion: "x".repeat(200) },
      { query: "土耳其橄榄油", locale: "zh", intent: null, cluster: null, suggestion: null },
    ]);
    expect(parseInsights({ not: "array" }, items)).toEqual([]);
    expect(JSON.parse(buildInsightsRequest(items).data).items).toHaveLength(2);
  });
});

// ───────────────────────── (3) D1 yazım + rapor ─────────────────────────
const gsc = (raw: Raw, day: string, queries: unknown, extra: object = {}) =>
  raw.prepare("INSERT INTO analytics_daily (day, locale, gsc_json) VALUES (?, 'all', ?)").run(day, typeof queries === "string" ? queries : JSON.stringify({ clicks: 1, impressions: 2, ...extra, queries }));
const strip = ({ day: _d, ...r }: GscQueryRow) => r;
// "metin sayı" satırı saf fonksiyonun tip katılığı içindir; D1 görünümü (0006 ile aynı) CAST eder → seed'e girmez.
const SEEDABLE = FIXTURE.filter((r) => typeof r.impressions === "number");
const seed = (raw: Raw) => {
  gsc(raw, D1, SEEDABLE.filter((r) => r.day === D1).map(strip));
  gsc(raw, D2, SEEDABLE.filter((r) => r.day === D2).map(strip));
};

describe("kabul 3 — D1 anlık görüntü (keyword_opportunities) + veri yoksa null/data_status", () => {
  it("GSC sorgu verisi YOK → no_data; anlık görüntüye dokunulmaz; rapor null + 'none' + E4 notu (sahte sayı yok)", async () => {
    const { env, raw } = makeEnv();
    expect(await refreshKeywordOpportunities(env.DB, NOW)).toMatchObject({ status: "no_data", rows: 0 });
    expect(raw.prepare("SELECT COUNT(*) AS n FROM keyword_opportunities").get()).toEqual({ n: 0 });
    const r = await computeKeywordReport(env.DB, {}, NOW);
    expect(r.data_status).toMatchObject({ query_data: "none", query_days_with_data: 0, window_days: 28, computed_at: null, stale: false, insights: null });
    expect(r.data_status.note).toMatch(/E4/);
    expect(r.totals).toEqual({ opportunities: 0, near: 0, snippet: 0, new_page: 0, impressions: null, clicks: null });
    expect(r.window).toBeNull();
    expect(r.items).toEqual([]);
    expect(r.pipeline).toEqual({ queued: 0, analyzed: 0, job_created: 0, done: 0 });
  });

  it("fixture → 10 satır yazılır; değerler skorla birebir; PII sorgu D1'de YOK; keyword_id eşleşir; AI kapalı → insights 'off', alanlar NULL", async () => {
    const { env, raw } = makeEnv();
    seed(raw);
    raw.prepare("INSERT INTO keywords (id, phrase, locale, status) VALUES ('KW1', 'Olive Oil Supplier Turkey', 'en', 'queued'), ('KW2', 'başka', NULL, 'done')").run();
    const res = await refreshKeywordOpportunities(env.DB, NOW);
    expect(res).toMatchObject({ status: "written", rows: 10, window: { from: "2026-10-02", to: "2026-10-29", days: 28 }, insights: "off" });
    const rows = raw.prepare("SELECT * FROM keyword_opportunities ORDER BY score DESC, impressions DESC, query").all() as Record<string, unknown>[];
    expect(rows.map((r) => r.query)).toEqual(scoreOpportunities(FIXTURE).map((o) => o.query));
    expect(rows.find((r) => r.query === "olive oil supplier turkey")).toMatchObject({ keyword_id: "KW1", insights_status: "off", insight_intent: null, insight_model: null, score_version: "kw-score.v1", computed_at: "2026-10-30 12:00:00" });
    const dump = JSON.stringify(raw.prepare("SELECT * FROM keyword_opportunities").all());
    for (const pii of ["info@firma.com", "532", "rakip"]) expect(dump).not.toContain(pii);
    // volume kolonu yok (uydurma hacim yasak) — yalnız GSC gösterim/tıklama
    expect((raw.prepare("PRAGMA table_info(keyword_opportunities)").all() as { name: string }[]).some((c) => /volume/.test(c.name))).toBe(false);
  });

  it("stub modu: yalnız iş üreten satırlar (monitor hariç) AI'ya gider → 'stub' + model 'stub'; monitor 'skipped'; alanlar NULL", async () => {
    const { env, raw } = makeEnv();
    seed(raw);
    await refreshKeywordOpportunities(env.DB, NOW, { KEYWORD_INSIGHTS_MODE: "stub" });
    const st = raw.prepare("SELECT query, insights_status, insight_model, insight_intent FROM keyword_opportunities").all() as Record<string, unknown>[];
    expect(st.find((r) => r.query === "bdimexport")).toMatchObject({ insights_status: "skipped", insight_model: null });
    expect(st.filter((r) => r.insights_status === "stub")).toHaveLength(9);
    expect(st.every((r) => r.insight_intent === null)).toBe(true);
  });

  it("yeniden çalışma görüntüyü ATOMİK değiştirir (eski satır kalmaz); veri kaybolursa görüntü KORUNUR", async () => {
    const { env, raw } = makeEnv();
    seed(raw);
    await refreshKeywordOpportunities(env.DB, NOW);
    raw.prepare("DELETE FROM analytics_daily").run();
    gsc(raw, D1, [strip(q(D1, "yeni sorgu", "/en/x", 100, 1, 9))]);
    await refreshKeywordOpportunities(env.DB, new Date("2026-10-31T12:00:00Z"));
    expect(raw.prepare("SELECT query FROM keyword_opportunities").all()).toEqual([{ query: "yeni sorgu" }]);
    raw.prepare("DELETE FROM analytics_daily").run();
    expect((await refreshKeywordOpportunities(env.DB, new Date("2026-11-01T12:00:00Z"))).status).toBe("no_data");
    expect(raw.prepare("SELECT query FROM keyword_opportunities").all()).toEqual([{ query: "yeni sorgu" }]);
    // rapor: eski görüntü + yeni veri yok → not; 48 saatten eski → stale
    const r = await computeKeywordReport(env.DB, {}, new Date("2026-11-03T12:00:00Z"));
    expect(r.data_status).toMatchObject({ query_data: "none", stale: true });
    expect(r.data_status.note).toMatch(/eski veriden/);
  });

  it("bozuk GSC JSON görünümü/motoru PATLATMAZ (geçersiz JSON, queries dizi değil, metin öğe, eksik alan)", async () => {
    const { env, raw } = makeEnv();
    raw.prepare("INSERT INTO analytics_daily (day, locale, gsc_json) VALUES ('2026-10-10','all','{bozuk'), ('2026-10-11','all','{\"queries\":\"x\"}'), ('2026-10-12','all','{\"queries\":[\"metin\", 5, null, {\"query\":\"q\"}]}')").run();
    raw.prepare("INSERT INTO analytics_daily (day, locale, gsc_json) VALUES ('2026-10-13','tr', ?)").run(JSON.stringify({ queries: [strip(q(D1, "locale=tr satırı okunmaz", "/en/x", 100, 1, 9))] }));
    expect(raw.prepare("SELECT * FROM gsc_query_v").all()).toEqual([]);
    expect((await refreshKeywordOpportunities(env.DB, NOW)).status).toBe("no_data");
  });

  it("rapor (keywords.v1): sözleşme alanları, toplamlar, bant/locale kırılımı, pipeline, filtre + limit, sıralama", async () => {
    const { env, raw } = makeEnv();
    seed(raw);
    raw.prepare("INSERT INTO keywords (id, phrase, locale, status) VALUES ('a','x','en','queued'),('b','y','en','job_created'),('c','z','tr','job_created')").run();
    await refreshKeywordOpportunities(env.DB, NOW);
    const r = await computeKeywordReport(env.DB, {}, NOW);
    expect(Object.keys(r).sort()).toEqual(["by_band", "by_locale", "contract", "data_status", "generated_at", "items", "limit", "pipeline", "score_version", "totals", "window"]);
    expect(Object.keys(r.data_status).sort()).toEqual(["computed_at", "insights", "note", "query_basis", "query_data", "query_days_with_data", "stale", "window_days"]);
    expect(Object.keys(r.items[0]).sort()).toEqual(["action", "band", "clicks", "ctr", "impressions", "insights", "keyword_id", "locale", "page", "pages_count", "position", "query", "rank", "reason", "ref_ctr", "score"]);
    expect(r).toMatchObject({ contract: "keywords.v1", score_version: "kw-score.v1", window: { from: "2026-10-02", to: "2026-10-29", days: 28 }, limit: 50 });
    expect(r.data_status).toMatchObject({ query_data: "partial", query_days_with_data: 2, computed_at: "2026-10-30 12:00:00", stale: false, insights: "off", note: null });
    const imp = scoreOpportunities(FIXTURE).reduce((a, o) => a + o.impressions, 0);
    expect(r.totals).toEqual({ opportunities: 10, near: 6, snippet: 1, new_page: 2, impressions: imp, clicks: scoreOpportunities(FIXTURE).reduce((a, o) => a + o.clicks, 0) });
    expect(r.by_band).toEqual([{ band: "near", count: 6 }, { band: "snippet", count: 1 }, { band: "top", count: 1 }, { band: "long_shot", count: 2 }]);
    expect(r.by_locale.find((l) => l.locale === "en")).toEqual({ locale: "en", opportunities: 3, near: 2, impressions: 1100 });
    expect(r.pipeline).toEqual({ queued: 1, analyzed: 0, job_created: 2, done: 0 });
    expect(r.items.map((i) => i.rank)).toEqual([1, 2, 3, 4, 5, 6, 7, 8, 9, 10]);
    expect(r.items[0]).toMatchObject({ query: "çin'den ithalat", score: 80, insights: { status: "off", intent: null, cluster: null, suggestion: null, model: null } });
    const de = await computeKeywordReport(env.DB, { locale: "de" }, NOW);
    expect(de.items.map((i) => i.query)).toEqual(["textile sourcing germany", "import aus der türkei"]);
    expect((await computeKeywordReport(env.DB, { band: "near", limit: 2 }, NOW)).items.map((i) => i.band)).toEqual(["near", "near"]);
    expect((await computeKeywordReport(env.DB, { locale: "zh", band: "long_shot" }, NOW)).totals).toMatchObject({ opportunities: 0, impressions: null });
  });

  it("pencere: dünden geriye 28 gün (GSC gecikmesi; bugün dahil değil)", () => {
    expect(keywordWindow(NOW)).toEqual({ from: "2026-10-02", to: "2026-10-29", days: 28 });
  });

  it("SQL: şablon enterpolasyonu yok; leads tablosuna erişim yok", () => {
    for (const s of Object.values(KEYWORD_SQL)) {
      expect(s).not.toMatch(/\$\{/);
      expect(s).not.toMatch(/\bleads\b/);
    }
  });
});

// ───────────────────────── (4) migration 0007 ─────────────────────────
describe("kabul 4 — migration 0007: EXPAND-ONLY + geri alınabilir", () => {
  const files = () => readdirSync(MIG_DIR).filter((f) => f.endsWith(".sql")).sort();
  const apply = (db: DatabaseSync, only: (f: string) => boolean) => { for (const f of files().filter(only)) db.exec(readFileSync(resolve(MIG_DIR, f), "utf8")); };
  const schema = (db: DatabaseSync) => db.prepare("SELECT type, name, sql FROM sqlite_master WHERE name NOT LIKE 'sqlite_%' ORDER BY type, name").all();
  const F = "0007_keyword_opportunities.sql";
  const body = () => readFileSync(resolve(MIG_DIR, F), "utf8");

  it("yalnız 1 VIEW + 1 TABLO + 2 INDEX ekler; mevcut tüm nesneler (0006 view'ları dahil) BİREBİR aynı; yıkıcı ifade yok", () => {
    const sql = body().replace(/--.*$/gm, "");
    expect(sql).not.toMatch(/\b(DROP|ALTER|DELETE|UPDATE|INSERT|REPLACE)\b/i);
    const db = new DatabaseSync(":memory:");
    apply(db, (f) => f < "0007");
    const before = schema(db);
    db.exec("INSERT INTO analytics_daily (day, locale, gsc_json) VALUES ('2026-10-01','all','{\"clicks\":1}')");
    apply(db, (f) => f === F);
    const after = schema(db) as { type: string; name: string }[];
    expect(after.filter((o) => !(before as { name: string }[]).some((b) => b.name === o.name)).map((o) => `${o.type}:${o.name}`).sort())
      .toEqual(["index:idx_kwopp_band", "index:idx_kwopp_locale", "table:keyword_opportunities", "view:gsc_query_v"]);
    expect(after.filter((o) => (before as { name: string }[]).some((b) => b.name === o.name))).toEqual(before);
    expect(db.prepare("SELECT day, gsc_json FROM analytics_daily").all()).toEqual([{ day: "2026-10-01", gsc_json: "{\"clicks\":1}" }]);
  });

  it("idempotent (iki kez uygulanır) + başlıktaki GERİ ALMA ifadeleri şemayı 0007 öncesine döndürür; tek 0007 dosyası", () => {
    const db = new DatabaseSync(":memory:");
    apply(db, (f) => f < "0007");
    const before = schema(db);
    apply(db, (f) => f === F);
    expect(() => apply(db, (f) => f === F)).not.toThrow();
    const rollback = body().split("\n").filter((l) => /^--\s+DROP /.test(l)).map((l) => l.replace(/^--\s+/, "")).join("\n");
    expect(rollback).toMatch(/DROP TABLE IF EXISTS keyword_opportunities/);
    db.exec(rollback);
    expect(schema(db)).toEqual(before);
    expect(files().filter((f) => f.startsWith("0007"))).toEqual([F]);
  });

  it("şema kuralları: bilinmeyen bant/karar/locale/AI durumu ve aralık dışı skor REDDEDİLİR", () => {
    const { raw } = makeEnv();
    const ins = (o: Record<string, unknown>) => () => raw.prepare(KEYWORD_SQL.insert).run(...Object.values({
      query: "q", locale: "en", page: "/en", pages_count: 1, impressions: 10, clicks: 1, ctr: 0.1, position: 5, ref_ctr: null, score: 50, band: "near", action: "update_page",
      reason: "r", sv: "kw-score.v1", wf: "2026-10-01", wt: "2026-10-28", d: 1, kw: null, st: "off", it: null, cl: null, sg: null, m: null, at: "2026-10-30 12:00:00", ...o,
    }) as never[]);
    expect(ins({})).not.toThrow();
    for (const bad of [{ query: "q2", band: "hot" }, { query: "q3", action: "publish" }, { query: "q4", locale: "fr" }, { query: "q5", st: "done" }, { query: "q6", score: 101 }, { query: "q7", ctr: 2 }, { query: "q8", it: "navigational" }, { query: "q9", reason: "" }])
      expect(ins(bad), JSON.stringify(bad)).toThrow();
  });
});

// ───────────────────────── (5) uç ─────────────────────────
describe("kabul 5 — GET /admin/api/analytics/keywords (guard + admin-only + keywords.v1)", () => {
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
  const URL0 = "https://bdimexport.pages.dev/admin/api/analytics/keywords";
  const get = (c: ReturnType<typeof makeEnv>, qs: string, token?: string) =>
    worker.fetch(new Request(URL0 + qs, { headers: { "cf-connecting-ip": "6.6.6.6", ...(token ? { "cf-access-jwt-assertion": token } : {}) } }), c.env);

  it("anon 401 · viewer 403 · admin 200 + no-store + keywords.v1 (boş D1 → none, null toplamlar)", async () => {
    const c = makeEnv(ACCESS);
    expect((await get(c, "")).status).toBe(401);
    expect((await get(c, "", await jwt("view@example.com"))).status).toBe(403);
    const ok = await get(c, "", await jwt("boss@example.com"));
    expect(ok.status).toBe(200);
    expect(ok.headers.get("cache-control")).toBe("no-store");
    const body = (await ok.json()) as KeywordReport;
    expect(body).toMatchObject({ contract: "keywords.v1", data_status: { query_data: "none" }, totals: { impressions: null, clicks: null }, items: [] });
  });

  it("parametre doğrulaması → 400; geçerli filtre → 200 ve uygulanır; yazma metotları → 404", async () => {
    const c = makeEnv(ACCESS);
    seed(c.raw);
    await refreshKeywordOpportunities(c.env.DB, new Date());
    const t = await jwt("boss@example.com");
    for (const qs of ["?locale=xx", "?band=hot", "?limit=0", "?limit=201", "?limit=abc", "?locale=tr%27%20OR%201=1"]) expect((await get(c, qs, t)).status, qs).toBe(400);
    const r = await get(c, "?locale=de&band=long_shot&limit=1", t);
    expect(r.status).toBe(200);
    expect(((await r.json()) as KeywordReport).items.map((i) => [i.locale, i.band])).toEqual([["de", "long_shot"]]);
    for (const m of ["POST", "PUT", "DELETE", "PATCH"]) {
      const w = await worker.fetch(new Request(URL0, { method: m, headers: { "cf-connecting-ip": "6.6.6.6", "cf-access-jwt-assertion": t, "content-type": "application/json" }, body: "{}" }), c.env);
      expect(w.status, m).toBe(404);
    }
    expect(parseKeywordQuery(new URL(URL0 + "?limit=200"))).toEqual({ limit: 200 });
  });
});
