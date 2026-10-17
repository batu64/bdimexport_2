import { describe, it, expect, vi, afterEach } from "vitest";
import { syncAnalyticsDay, getYesterdayString, findMissingDays, syncWithBackfill, configuredSources } from "../src/sync";
import worker from "../src/index";
import type { Env } from "../src/types";

/** D1 sahtesi: yazılan SQL/bind kaydı + analytics_daily'de var sayılan günler. */
function mockDb(existingDays: string[] = []) {
  const writes: { sql: string; args: unknown[] }[] = [];
  const db: any = {
    prepare(sql: string) {
      return {
        bind(...args: unknown[]) {
          return {
            async run() {
              writes.push({ sql, args });
              return { success: true };
            },
            async all() {
              return { results: existingDays.map((day) => ({ day })) };
            },
          };
        },
      };
    },
  };
  return { db, writes };
}

// Test sahte değerleri: gerçek credential DEĞİL (yalnız "tanımlı mı" dalını açar; fetch mock'lanır).
const META = { META_ACCESS_TOKEN: "test-not-a-secret", META_AD_ACCOUNT_ID: "123" };
const metaOk = () =>
  vi.stubGlobal("fetch", vi.fn(async () => new Response(JSON.stringify({ data: [{ campaign_id: "1", campaign_name: "c", spend: "5", impressions: "10", clicks: "2" }] }))));

afterEach(() => vi.unstubAllGlobals());

describe("cron-analytics sync", () => {
  it("getYesterdayString returns correct format YYYY-MM-DD", () => {
    expect(getYesterdayString(new Date("2026-10-10T12:00:00Z"))).toBe("2026-10-09");
  });

  it("credential yok (stub) → D1'e YAZILMAZ, skipped:no_credentials", async () => {
    const { db, writes } = mockDb();
    const res = await syncAnalyticsDay({ DB: db }, "2026-10-09");
    expect(res).toEqual({ success: true, skipped: "no_credentials" });
    expect(writes.length).toBe(0);
    expect(configuredSources({ DB: db })).toEqual([]);
  });

  it("credential var + veri geldi → analytics_daily upsert", async () => {
    metaOk();
    const { db, writes } = mockDb();
    const res = await syncAnalyticsDay({ DB: db, ...META }, "2026-10-09");
    expect(res.success).toBe(true);
    expect(writes.length).toBe(1);
    expect(writes[0].sql).toContain("INSERT INTO analytics_daily");
    expect(writes[0].sql).toContain("ON CONFLICT(day, locale)");
    expect(writes[0].args[0]).toBe("2026-10-09");
    expect(JSON.parse(writes[0].args[3] as string).spend).toBe(5);
  });

  it("credential var ama tüm kaynaklar boş/hatalı → mevcut satır null ile EZİLMEZ", async () => {
    vi.stubGlobal("fetch", vi.fn(async () => new Response("err", { status: 500 })));
    const { db, writes } = mockDb();
    const res = await syncAnalyticsDay({ DB: db, ...META }, "2026-10-09");
    expect(res.success).toBe(false);
    expect(res.skipped).toBe("no_data");
    expect(writes.length).toBe(0);
  });

  it("findMissingDays: son 7 günde D1'de olmayan günleri bulur (bugün hariç)", async () => {
    const now = new Date("2026-10-10T00:00:00Z");
    const { db } = mockDb(["2026-10-09", "2026-10-07"]);
    expect(await findMissingDays({ DB: db }, now, 7)).toEqual(["2026-10-03", "2026-10-04", "2026-10-05", "2026-10-06", "2026-10-08"]);
  });

  it("syncWithBackfill: dün + en fazla `cap` eksik gün (en yeniden eskiye)", async () => {
    metaOk();
    const now = new Date("2026-10-10T00:00:00Z");
    const { db, writes } = mockDb(["2026-10-07"]);
    const res = await syncWithBackfill({ DB: db, ...META }, now, 7, 2);
    expect(Object.keys(res)).toEqual(["2026-10-09", "2026-10-08", "2026-10-06"]);
    expect(writes.map((w) => w.args[0])).toEqual(["2026-10-09", "2026-10-08", "2026-10-06"]);
  });

  it("syncWithBackfill: credential yok → hiç yazma/çağrı yok", async () => {
    const f = vi.fn();
    vi.stubGlobal("fetch", f);
    const { db, writes } = mockDb();
    const res = await syncWithBackfill({ DB: db }, new Date("2026-10-10T00:00:00Z"));
    expect(Object.values(res)[0].skipped).toBe("no_credentials");
    expect(writes.length + f.mock.calls.length).toBe(0);
  });
});

describe("/sync uç noktası yetkisi", () => {
  const call = (env: Partial<Env>, init: RequestInit = {}) =>
    worker.fetch(new Request("https://x.workers.dev/sync?day=2026-10-09", init), { DB: mockDb().db, ...env } as Env);

  it("SYNC_TOKEN tanımsız → kapalı (403)", async () => {
    expect((await call({}, { method: "POST", headers: { authorization: "Bearer a" } })).status).toBe(403);
  });
  it("token yok / yanlış / GET → 403", async () => {
    const env = { SYNC_TOKEN: "tok-123" };
    expect((await call(env, { method: "POST" })).status).toBe(403);
    expect((await call(env, { method: "POST", headers: { authorization: "Bearer tok-124" } })).status).toBe(403);
    expect((await call(env, { method: "GET", headers: { authorization: "Bearer tok-123" } })).status).toBe(403);
  });
  it("doğru token + POST → 200 (credential yoksa skipped)", async () => {
    const res = await call({ SYNC_TOKEN: "tok-123" }, { method: "POST", headers: { authorization: "Bearer tok-123" } });
    expect(res.status).toBe(200);
    expect((await res.json()) as any).toMatchObject({ success: true, skipped: "no_credentials" });
  });
});
