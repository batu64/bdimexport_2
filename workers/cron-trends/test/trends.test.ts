// FAZ_4 4.3 kabul testleri — GERÇEK SQL (0001–0003) + fetch mock (cron-rss test yardımcıları).
// (1) 3 geo test çekimi · (2) dedup (aynı gün) · (3) 7 gün penceresi (8 gün sonra yeniden) · (4) hata izolasyonu
// (5) admin B sekmesi sorgusunda görünürlük (app/admin/content/service.ts ile aynı SQL) · (6) normalizasyon (İ/i)
import { describe, it, expect, afterEach } from "vitest";
import { vi } from "vitest";
import { runTrends, normPhrase, trendsUrl, sourceLabel, TRENDS_CRON, TRENDS_DEDUP_DAYS } from "../src/trends";
import { makeEnv, mockFeeds, rss2 } from "../../cron-rss/test/helpers";

afterEach(() => vi.unstubAllGlobals());

const NOW = new Date("2026-10-20T06:00:00.000Z");
const DAY = 86_400_000;

const FEEDS = {
  TR: rss2([
    { title: "Çelik Kapı", link: "https://trends.google.com/trends/explore?q=celik+kapi&geo=TR" },
    { title: "Mobilya", link: "https://trends.google.com/trends/explore?q=mobilya&geo=TR" },
  ]),
  RU: rss2([{ title: "Одежда", link: "https://trends.google.com/trends/explore?q=odezhda&geo=RU" }]),
  DE: rss2([{ title: "Möbel", link: "https://trends.google.com/trends/explore?q=mobel&geo=DE" }]),
};

const routes = () => ({
  [trendsUrl("TR")]: FEEDS.TR,
  [trendsUrl("RU")]: FEEDS.RU,
  [trendsUrl("DE")]: FEEDS.DE,
});

const sqlNow = (d: Date) => d.toISOString().slice(0, 19).replace("T", " ");

describe("3 geo test çekimi", () => {
  it("TR/RU/DE üçü de çekilir; her biri kendi kaynak etiketiyle rss_news'e yazılır", async () => {
    const { calls } = mockFeeds(routes());
    const { env, raw } = makeEnv();
    const s = await runTrends(env, NOW);
    expect(s.results.map((r) => [r.geo, r.status, r.fetched, r.inserted])).toEqual([
      ["TR", "ok", 2, 2],
      ["RU", "ok", 1, 1],
      ["DE", "ok", 1, 1],
    ]);
    expect(calls[trendsUrl("TR")]).toBe(1);
    expect(calls[trendsUrl("RU")]).toBe(1);
    expect(calls[trendsUrl("DE")]).toBe(1);
    const src = raw.prepare("SELECT source, COUNT(*) AS n FROM rss_news GROUP BY source ORDER BY source").all() as any[];
    expect(src).toEqual([
      { source: "Trends DE", n: 1 },
      { source: "Trends RU", n: 1 },
      { source: "Trends TR", n: 2 },
    ]);
    // ayrı etiket: RSS kaynağı değil, tags_json.kind = trends
    const tags = raw.prepare("SELECT tags_json FROM rss_news WHERE source = 'Trends TR' LIMIT 1").get() as any;
    expect(JSON.parse(tags.tags_json)).toEqual({ kind: "trends", geo: "TR", locale: "tr" });
  });

  it("keywords: her geo kendi locale'iyle; dedup anahtarı normalize edilmiş", async () => {
    mockFeeds(routes());
    const { env, raw } = makeEnv();
    await runTrends(env, NOW);
    const kw = raw.prepare("SELECT phrase, locale, status FROM keywords ORDER BY locale, phrase").all() as any[];
    expect(kw).toEqual([
      { phrase: "möbel", locale: "de", status: "queued" },
      { phrase: "одежда", locale: "ru", status: "queued" },
      { phrase: "mobilya", locale: "tr", status: "queued" },
      { phrase: "çelik kapı", locale: "tr", status: "queued" },
    ]);
  });
});

describe("dedup — 7 gün penceresi", () => {
  it("aynı gün ikinci çekim hiçbir yeni keyword/rss yazmaz; duplicates = fetched", async () => {
    mockFeeds(routes());
    const { env, raw } = makeEnv();
    await runTrends(env, NOW);
    const second = await runTrends(env, new Date(NOW.getTime() + 3_600_000));
    expect(second.results.map((r) => [r.inserted, r.duplicates])).toEqual([[0, 2], [0, 1], [0, 1]]);
    expect((raw.prepare("SELECT COUNT(*) AS n FROM keywords").get() as any).n).toBe(4);
  });

  it(`${TRENDS_DEDUP_DAYS + 1} gün sonra aynı terim yeniden kaydedilir (pencere geçti)`, async () => {
    mockFeeds(routes());
    const { env, raw } = makeEnv();
    await runTrends(env, NOW);
    const later = await runTrends(env, new Date(NOW.getTime() + (TRENDS_DEDUP_DAYS + 1) * DAY));
    expect(later.results.map((r) => r.inserted)).toEqual([2, 1, 1]);
    expect((raw.prepare("SELECT COUNT(*) AS n FROM keywords").get() as any).n).toBe(8);
  });

  it("Türkçe büyük İ: 'MOBİLYA' ve 'mobilya' aynı anahtar", () => {
    expect(normPhrase("MOBİLYA")).toBe(normPhrase("mobilya"));
    expect(normPhrase("  Çelik   Kapı ")).toBe("çelik kapı");
  });
});

describe("hata izolasyonu", () => {
  it("RU 500 verirse RU düşer, TR/DE akar", async () => {
    mockFeeds({
      ...routes(),
      [trendsUrl("RU")]: () => new Response("boom", { status: 500 }),
    });
    const { env, raw } = makeEnv();
    const s = await runTrends(env, NOW);
    const ru = s.results.find((r) => r.geo === "RU")!;
    expect(ru.status).toBe("error");
    expect(ru.error).toBe("http_5xx");
    expect(s.results.find((r) => r.geo === "TR")!.status).toBe("ok");
    expect(s.results.find((r) => r.geo === "DE")!.status).toBe("ok");
    expect((raw.prepare("SELECT COUNT(*) AS n FROM rss_news WHERE source = 'Trends RU'").get() as any).n).toBe(0);
    expect((raw.prepare("SELECT COUNT(*) AS n FROM rss_news WHERE source = 'Trends TR'").get() as any).n).toBe(2);
  });
});

describe("admin B sekmesinde görünürlük", () => {
  it("app/admin/content/service.ts listeleme sorgusu trend kayıtlarını döndürür", async () => {
    mockFeeds(routes());
    const { env, raw } = makeEnv();
    await runTrends(env, NOW);
    // service.ts: SELECT … FROM rss_news WHERE expires_at > ? ORDER BY expires_at ASC LIMIT 200
    const rows = raw
      .prepare("SELECT id, source, title, url, tags_json FROM rss_news WHERE expires_at > ? ORDER BY expires_at ASC LIMIT 200")
      .all(sqlNow(NOW)) as any[];
    expect(rows.length).toBe(4);
    expect(new Set(rows.map((r) => r.source))).toEqual(new Set(["Trends TR", "Trends RU", "Trends DE"]));
    expect(rows.every((r) => JSON.parse(r.tags_json).kind === "trends")).toBe(true);
  });
});

describe("zamanlama", () => {
  it("cron 06:00 UTC; kaynak etiketi ve URL sözleşmesi", () => {
    expect(TRENDS_CRON).toBe("0 6 * * *");
    expect(sourceLabel("TR")).toBe("Trends TR");
    expect(trendsUrl("DE")).toBe("https://trends.google.com/trending/rss?geo=DE");
  });
});
