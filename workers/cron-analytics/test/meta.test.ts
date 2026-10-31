// FAZ_6 6.5 — cron-analytics tarafı: zamanlanmış çalışma Meta durumunu yazar (token yok → unconfigured), ağ çağrısı yapmaz, hat düşmez.
// Uçtan uca D1 (gerçek SQL) + rapor testleri: workers/api/test/meta-ads.test.ts.
import { describe, it, expect, vi, afterEach } from "vitest";
import worker from "../src/index";
import { recordMetaStatus, STATUS_SQL } from "../src/status";
import { metaSyncStatus } from "../src/sync";

afterEach(() => vi.unstubAllGlobals());

function db() {
  const writes: { sql: string; args: unknown[] }[] = [];
  const stmt = (sql: string) => ({
    bind(...args: unknown[]) {
      return { async run() { writes.push({ sql, args }); return {}; }, async all() { return { results: [] }; }, async first() { return null; } };
    },
    async all() { return { results: [] }; },
    async first() { return null; },
  });
  return { d: { prepare: stmt, async batch() { throw new Error("veri yokken yazım YAPILMAMALI"); } }, writes };
}

describe("Meta durumu (integration_status)", () => {
  it("scheduled: credential yok → yalnız integration_status upsert ('meta','unconfigured'); ağ çağrısı YOK; analytics_daily yazılmaz", async () => {
    vi.spyOn(console, "warn").mockImplementation(() => {});
    vi.spyOn(console, "log").mockImplementation(() => {});
    const net = vi.fn(async () => new Response("{}"));
    vi.stubGlobal("fetch", net);
    const { d, writes } = db();
    let p: Promise<unknown> = Promise.resolve();
    await worker.scheduled({ scheduledTime: Date.parse("2026-10-30T00:00:00Z") } as ScheduledController, { DB: d as never }, { waitUntil: (x: Promise<unknown>) => { p = x; } } as unknown as ExecutionContext);
    await p;
    expect(net).not.toHaveBeenCalled();
    expect(writes.map((w) => w.sql)).toEqual([STATUS_SQL.upsert]);
    expect(writes[0].args.slice(0, 2)).toEqual(["meta", "unconfigured"]);
    expect(writes[0].args[3]).toBe("2026-10-29");
    expect(writes[0].args[5]).toBeNull(); // başarısız kontrol last_ok_at'i ezmez (COALESCE)
  });

  it("durum eşlemesi: kampanya var → ok · boş gün → passive · hata metni aynen (kısa)", () => {
    const data = { spend: 0, impressions: 0, clicks: 0, campaigns: [] };
    expect(metaSyncStatus({ status: "ok", data })).toEqual({ status: "passive", detail: "yayında kampanya yok (harcama 0)" });
    expect(metaSyncStatus({ status: "ok", data: { ...data, spend: 1, campaigns: [{ id: "1", name: "a", spend: 1, impressions: 1, clicks: 0 }], truncated: true } })).toEqual({ status: "ok", detail: "1 kampanya (sayfa sınırı — kısmi)" });
    expect(metaSyncStatus({ status: "auth_error", error: "HTTP 400 code 190" })).toEqual({ status: "auth_error", detail: "HTTP 400 code 190" });
  });

  it("recordMetaStatus fırlatmaz (D1 düşük → false); meta yoksa yazmaz", async () => {
    vi.spyOn(console, "error").mockImplementation(() => {});
    expect(await recordMetaStatus({ DB: { prepare() { throw new Error("D1 down"); } } as never }, { status: "ok", detail: null }, "2026-10-29")).toBe(false);
    const { d, writes } = db();
    expect(await recordMetaStatus({ DB: d as never }, undefined, "2026-10-29")).toBe(false);
    expect(writes).toHaveLength(0);
  });
});
