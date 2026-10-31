// FAZ_6 6.3 — cron-analytics tarafı: GSC sorgu×sayfa çekimi (keyword motoru girdisi) + motor tetikleyicisi. Ağ MOCK (canlı OAuth yok — E4).
import { describe, it, expect, vi, afterEach } from "vitest";
import { fetchGscAnalytics, fetchGscQueryPages, queryRowLimit } from "../src/google";
import { runKeywordEngine } from "../src/keywords";
import type { Env } from "../src/types";

afterEach(() => vi.unstubAllGlobals());

const GSC_URL = "https://www.googleapis.com/webmasters/v3/sites/x/searchAnalytics/query";
const row = (keys: unknown[], o: Record<string, unknown> = {}) => ({ keys, clicks: 2, impressions: 100, ctr: 0.02, position: 7.5, ...o });

describe("GSC sorgu × sayfa (gsc_json.queries)", () => {
  it("satırları eşler; e-posta/telefon/URL benzeri sorgu ve sayısı eksik satır YAZILMAZ (0 uydurulmaz); istek dimensions=[query,page]", async () => {
    const f = vi.fn(async (_u: string, _i: RequestInit) => new Response(JSON.stringify({ rows: [
      row(["  Olive  Oil Supplier ", "https://bdimexport.com/en/products/olive-oil"]),
      row(["ali@veli.com", "https://bdimexport.com/"]),
      row(["0532 123 45 67", "https://bdimexport.com/"]),
      row(["www.rakip.com", "https://bdimexport.com/"]),
      row(["eksik pozisyon", "https://bdimexport.com/en"], { position: undefined }),
      row(["sayfa yok"]),
    ] })));
    vi.stubGlobal("fetch", f);
    const out = await fetchGscQueryPages(GSC_URL, "tok", "2026-10-20", 500);
    expect(out).toEqual([{ query: "olive oil supplier", page: "https://bdimexport.com/en/products/olive-oil", clicks: 2, impressions: 100, ctr: 0.02, position: 7.5 }]);
    expect(JSON.parse(String(f.mock.calls[0][1].body))).toEqual({ startDate: "2026-10-20", endDate: "2026-10-20", dimensions: ["query", "page"], rowLimit: 500 });
  });

  it("HTTP hatası / ağ hatası → null (sync düşmez)", async () => {
    vi.stubGlobal("fetch", vi.fn(async () => new Response("no", { status: 403 })));
    expect(await fetchGscQueryPages(GSC_URL, "t", "2026-10-20", 10)).toBeNull();
    vi.stubGlobal("fetch", vi.fn(async () => { throw new Error("net"); }));
    expect(await fetchGscQueryPages(GSC_URL, "t", "2026-10-20", 10)).toBeNull();
  });

  it("queryRowLimit: varsayılan 500, üst sınır 5000, geçersiz → varsayılan", () => {
    expect([queryRowLimit(undefined), queryRowLimit(""), queryRowLimit("abc"), queryRowLimit("0"), queryRowLimit("50"), queryRowLimit("99999")]).toEqual([500, 500, 500, 500, 50, 5000]);
  });

  it("fetchGscAnalytics: üst düzey toplamlar DEĞİŞMEZ (ilk istek), queries ayrı istekten eklenir; ikinci istek düşerse queries alanı YOK", async () => {
    const env: Env = { DB: {} as never, GSC_SITE_URL: "https://bdimexport.com" };
    const first = { rows: [{ keys: ["a"], clicks: 3, impressions: 30, ctr: 0.1, position: 4 }] };
    vi.stubGlobal("fetch", vi.fn(async (_u: string, i: RequestInit) =>
      JSON.parse(String(i.body)).dimensions.length === 1 ? new Response(JSON.stringify(first)) : new Response(JSON.stringify({ rows: [row(["b", "https://bdimexport.com/en"])] }))));
    const r = await fetchGscAnalytics(env, "2026-10-20", "tok");
    expect(r).toMatchObject({ clicks: 3, impressions: 30, topQueries: [{ query: "a", clicks: 3, impressions: 30, ctr: 0.1, position: 4 }] });
    expect(r?.queries).toHaveLength(1);
    vi.stubGlobal("fetch", vi.fn(async (_u: string, i: RequestInit) =>
      JSON.parse(String(i.body)).dimensions.length === 1 ? new Response(JSON.stringify(first)) : new Response("x", { status: 500 })));
    const r2 = await fetchGscAnalytics(env, "2026-10-20", "tok");
    expect(r2).toMatchObject({ clicks: 3, impressions: 30 });
    expect(r2 && "queries" in r2).toBe(false);
  });
});

describe("runKeywordEngine (sync sonrası)", () => {
  const db = (rows: unknown[]) => ({
    prepare: () => ({ bind() { return this; }, async all() { return { results: rows }; }, async first() { return null; }, async run() { return {}; } }),
    async batch() { throw new Error("veri yokken yazım YAPILMAMALI"); },
  });

  it("GSC sorgu verisi yok → no_data, yazım yok, AI çağrısı yok (varsayılan off)", async () => {
    const net = vi.fn(async () => new Response("{}"));
    vi.stubGlobal("fetch", net);
    const r = await runKeywordEngine({ DB: db([]) as never }, new Date("2026-10-30T00:05:00Z"));
    expect(r).toMatchObject({ status: "no_data", rows: 0, insights: "off" });
    expect(net).not.toHaveBeenCalled();
  });

  it("motor hatası fırlatmaz → null + alert (log)", async () => {
    const warn = vi.spyOn(console, "warn").mockImplementation(() => {});
    const err = vi.spyOn(console, "error").mockImplementation(() => {});
    const bad = { prepare() { throw new Error("D1 down"); } };
    expect(await runKeywordEngine({ DB: bad as never }, new Date())).toBeNull();
    expect(warn.mock.calls.some((c) => String(c[0]).includes("Keyword Engine Error"))).toBe(true);
    warn.mockRestore();
    err.mockRestore();
  });
});
