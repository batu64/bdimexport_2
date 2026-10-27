// FAZ_4 4.7 — hata izleme / fallback / kota. Kabul: kota tükenme simülasyonu → fallback; kalıcı hata → alert + ai_jobs blocked;
// alert spam önleme (aynı hata 1 saatte 1). Gerçek SQL (tüm migration'lar) + sahte webhook. Runtime Gemini = stub (E3).
import { afterEach, describe, expect, it, vi } from "vitest";
import { runArticleJobs, MAX_RETRIES } from "../src/jobs";
import { runEnrich } from "../src/enrich";
import { runMaintenance } from "../src/maintenance";
import { MockArticleModel, type ArticleModel } from "../src/article-model";
import { MockGeminiModel, type EnrichModel } from "../src/model";
import { callWithQuota, decide, QuotaExceeded, QuotaPaused } from "../src/quota";
import { sendAlert } from "../src/alert";
import { createContentService } from "../../../app/admin/content/service";
import { makeEnv } from "./helpers";

afterEach(() => { vi.unstubAllGlobals(); vi.restoreAllMocks(); });

const NOW = new Date("2026-10-27T09:00:00Z");
const HOOK = "https://hooks.slack.com/services/T000/B000/XXXXXXXXXXXXXXXX";
const quiet = () => { vi.spyOn(console, "log").mockImplementation(() => {}); vi.spyOn(console, "warn").mockImplementation(() => {}); vi.spyOn(console, "error").mockImplementation(() => {}); };
type Raw = ReturnType<typeof makeEnv>["raw"];
const world = (over = {}) => {
  const w = makeEnv({ ARTICLE_MODE: "mock", ...over });
  return { ...w, svc: createContentService(w.env.DB as never, "admin@example.com", () => NOW.getTime()) };
};
const named = (name: string, inner: ArticleModel = new MockArticleModel()): ArticleModel & { calls: number } => {
  const m = { name, calls: 0, generate: async (r: Parameters<ArticleModel["generate"]>[0]) => { m.calls++; return inner.generate(r); } };
  return m;
};
const usage = (raw: Raw) => raw.prepare("SELECT model, calls, failures, exhausted FROM ai_usage_daily ORDER BY model").all().map((r) => ({ ...r }));
const alerts = (raw: Raw) => raw.prepare("SELECT entity_id, new_value FROM admin_actions WHERE action='pipeline_alert' ORDER BY rowid").all() as { entity_id: string; new_value: string }[];
const job = (raw: Raw, id: string) => raw.prepare("SELECT status, retries, last_error, model FROM ai_jobs WHERE id=?").get(id) as { status: string; retries: number; last_error: string | null; model: string | null };
const seedUsage = (raw: Raw, model: string, calls: number, exhausted = 0, day = "2026-10-27") =>
  raw.prepare("INSERT INTO ai_usage_daily (day, model, calls, exhausted) VALUES (?,?,?,?)").run(day, model, calls, exhausted);
function hook() {
  const posts: { url: string; body: { text: string; content: string } }[] = [];
  vi.stubGlobal("fetch", async (url: string, init: RequestInit) => { posts.push({ url: String(url), body: JSON.parse(String(init.body)) }); return new Response("ok"); });
  return posts;
}

describe("kota → fallback (yalnız Gemini ailesi; başka sağlayıcı yok)", () => {
  it("ana model günlük limitin %80'inde → yedek modele geçilir; taslağın model alanı YEDEĞİ gösterir; alert 1 kez", async () => {
    const { env, raw, svc } = world({ AI_DAILY_LIMIT: "10", PIPELINE_ALERT_WEBHOOK_URL: HOOK });
    const posts = hook(); quiet();
    seedUsage(raw, "gemini-main", 8); // 8/10 = %80
    const main = named("gemini-main"), fb = named("gemini-flash");
    const j1 = await svc.submitJob({ input: "C", phrase: "olive oil private label", locales: ["en"], page_type: "article" });
    const j2 = await svc.submitJob({ input: "C", phrase: "marble slabs export", locales: ["en"], page_type: "article" });
    const r = await runArticleJobs(env, NOW, main, fb);
    expect(r).toMatchObject({ done: 2, drafts: 2 });
    expect([main.calls, fb.calls]).toEqual([0, 2]);
    expect(job(raw, j1.job_id).model).toBe("gemini-flash");
    expect(raw.prepare("SELECT DISTINCT model FROM contents").all().map((x) => (x as { model: string }).model)).toEqual(["gemini-flash"]);
    expect(usage(raw)).toEqual([{ model: "gemini-flash", calls: 2, failures: 0, exhausted: 0 }, { model: "gemini-main", calls: 8, failures: 0, exhausted: 0 }]);
    expect(posts.length).toBe(1); // iki iş, tek uyarı (spam yok)
    expect(posts[0].body.text).toMatch(/yedek modele geçildi/);
    expect(job(raw, j2.job_id).status).toBe("done");
  });
  it("sağlayıcı 429 (QuotaExceeded) → model o gün 'tükendi' işaretlenir, AYNI istek yedekle tamamlanır", async () => {
    const { env, raw, svc } = world();
    quiet();
    const fb = named("gemini-flash");
    const main = { name: "gemini-main", calls: 0, generate: async () => { main.calls++; throw new QuotaExceeded("429"); } } as ArticleModel & { calls: number };
    const j = await svc.submitJob({ input: "C", phrase: "denim fabric export", locales: ["en"], page_type: "article" });
    await runArticleJobs(env, NOW, main, fb);
    expect(job(raw, j.job_id)).toMatchObject({ status: "done", retries: 0, model: "gemini-flash" });
    expect(usage(raw).find((u) => (u as { model: string }).model === "gemini-main")).toMatchObject({ calls: 1, exhausted: 1 });
    // ertesi istek ana modeli HİÇ denemez (tükendi)
    await svc.submitJob({ input: "C", phrase: "steel pipes export", locales: ["en"], page_type: "article" });
    await runArticleJobs(env, NOW, main, fb);
    expect(main.calls).toBe(1);
  });
  it("ana + yedek dolu → kuyruk DURUR: model çağrılmaz, iş pending kalır, deneme hakkı YANMAZ; ertesi gün kendiliğinden devam", async () => {
    const { env, raw, svc } = world({ AI_DAILY_LIMIT: "10", AI_FALLBACK_DAILY_LIMIT: "5" });
    quiet();
    seedUsage(raw, "gemini-main", 10); seedUsage(raw, "gemini-flash", 5);
    const main = named("gemini-main"), fb = named("gemini-flash");
    const j = await svc.submitJob({ input: "C", phrase: "kitchenware export", locales: ["en"], page_type: "article" });
    const r = await runArticleJobs(env, NOW, main, fb);
    expect(r).toMatchObject({ done: 0, model_error: "quota_paused" });
    expect([main.calls, fb.calls]).toEqual([0, 0]);
    expect(job(raw, j.job_id)).toMatchObject({ status: "pending", retries: 0 });
    expect(alerts(raw).map((a) => a.entity_id)).toEqual(["quota_paused"]);
    const next = new Date("2026-10-28T00:30:00Z"); // UTC gün değişti → sayaçlar sıfır
    expect(await runArticleJobs(env, next, main, fb)).toMatchObject({ done: 1 });
    expect(main.calls).toBe(1);
  });
  it("limit tanımlı değilse yalnız sağlayıcı 429'u belirler; yedek yoksa 429 → QuotaPaused", async () => {
    const { env } = makeEnv();
    const m = { name: "solo" };
    expect(await decide(env, NOW, m, null)).toMatchObject({ role: "primary" });
    quiet();
    await expect(callWithQuota(env, NOW, m, null, async () => { throw new QuotaExceeded(); })).rejects.toBeInstanceOf(QuotaPaused);
    expect(await decide(env, NOW, m, null)).toBeNull();
  });
  it("enrich: kota dolu → batch gönderilmez, özet yazılmaz", async () => {
    const { env, raw } = makeEnv({ ENRICH_MODE: "mock", AI_DAILY_LIMIT: "1" });
    quiet();
    raw.prepare("INSERT INTO rss_news (id, source, title, url, fetched_at, expires_at) VALUES ('n1','K','Hazelnut prices rise','https://e.example.com/a','2026-10-27 08:00:00','2026-10-30 08:00:00')").run();
    seedUsage(raw, "mock", 1);
    let calls = 0;
    const m: EnrichModel = { name: "mock", enrich: async (r) => { calls++; return new MockGeminiModel().enrich(r); } };
    const out = await runEnrich(env, NOW, m, null);
    expect([out.model_error, out.enriched, calls]).toEqual(["quota_paused", 0, 0]);
    expect((raw.prepare("SELECT summary FROM rss_news").get() as { summary: string | null }).summary).toBeNull();
  });
});

describe("kalıcı hata → BLOCKED + alert; spam önleme", () => {
  it(`model hatası ${MAX_RETRIES} denemede (1 + 2 retry) → blocked + webhook alert (iş kodu, metin/PII yok)`, async () => {
    const { env, raw, svc } = world({ PIPELINE_ALERT_WEBHOOK_URL: HOOK });
    const posts = hook(); quiet();
    const down: ArticleModel = { name: "gemini-main", generate: async () => { throw new Error("503 upstream"); } };
    const j = await svc.submitJob({ input: "C", phrase: "ceramic tiles for gulf buyers", locales: ["en"], page_type: "article" });
    const seen: string[] = [];
    for (let i = 0; i < 3; i++) { await runArticleJobs(env, new Date(NOW.getTime() + i * 60_000), down, null); seen.push(job(raw, j.job_id).status); }
    expect(seen).toEqual(["pending", "pending", "blocked"]);
    expect(job(raw, j.job_id).last_error).toBe("retries_exhausted:model_call_failed");
    expect(posts.map((p) => p.url)).toEqual([HOOK]);
    expect(posts[0].body.text).toContain("blocked");
    expect(posts[0].body.content).toBe(posts[0].body.text); // Slack + Discord
    expect(posts[0].body.text).not.toMatch(/ceramic|gulf|503 upstream/i); // görev metni / ham hata yok
    expect(raw.prepare("SELECT action FROM admin_actions WHERE action LIKE 'ai_job_%' ORDER BY rowid").all().map((x) => (x as { action: string }).action))
      .toEqual(["ai_job_retry", "ai_job_retry", "ai_job_blocked"]);
  });
  it("aynı hata 1 saat içinde 2. kez → BASTIRILIR; 61 dk sonra yeniden gönderilir; farklı hata ayrı bildirilir", async () => {
    const { env, raw } = makeEnv({ PIPELINE_ALERT_WEBHOOK_URL: HOOK });
    const posts = hook(); quiet();
    const a = { key: "ai_job_blocked:retries_exhausted:model_call_failed", level: "error" as const, title: "t", details: "d" };
    expect(await sendAlert(env, NOW, a)).toBe("sent");
    expect(await sendAlert(env, new Date(NOW.getTime() + 30 * 60_000), a)).toBe("suppressed");
    expect(await sendAlert(env, new Date(NOW.getTime() + 30 * 60_000), { ...a, key: "ai_job_failed:bad_payload" })).toBe("sent");
    expect(await sendAlert(env, new Date(NOW.getTime() + 61 * 60_000), a)).toBe("sent");
    expect(posts.length).toBe(3);
    expect(alerts(raw).length).toBe(3); // bastırılan kayıt da oluşturmaz
  });
  it("webhook tanımsız → yalnız log + audit (yine tekilleştirilir); geçersiz webhook (http / iç adres) → ÇAĞRILMAZ", async () => {
    quiet();
    const posts = hook();
    const none = makeEnv();
    expect(await sendAlert(none.env, NOW, { key: "k", level: "warn", title: "t", details: "d" })).toBe("logged");
    expect(await sendAlert(none.env, NOW, { key: "k", level: "warn", title: "t", details: "d" })).toBe("suppressed");
    for (const bad of ["http://hooks.slack.com/x", "https://localhost/hook", "https://10.0.0.1/hook", "https://user:pass@hooks.example.com/x"]) {
      const w = makeEnv({ PIPELINE_ALERT_WEBHOOK_URL: bad });
      await sendAlert(w.env, NOW, { key: "k", level: "warn", title: "t", details: "d" });
    }
    expect(posts).toEqual([]);
  });
  it("alert metni URL / e-posta maskelenir; webhook düşse bile hat durmaz", async () => {
    const { env } = makeEnv({ PIPELINE_ALERT_WEBHOOK_URL: HOOK });
    quiet();
    const posts: string[] = [];
    vi.stubGlobal("fetch", async (_u: string, init: RequestInit) => { posts.push(String(init.body)); throw new Error("network"); });
    expect(await sendAlert(env, NOW, { key: "x", level: "error", title: "Hata https://evil.example.com/a", details: "kişi ali@example.com" })).toBe("error");
    expect(posts[0]).not.toMatch(/evil\.example|ali@example/);
    expect(posts[0]).toMatch(/\[url\]/);
  });
});

describe("gece hat raporu", () => {
  it("son 24 saatin sayıları + günün AI kullanımı → log + günde 1 webhook; 90 günden eski kota satırı silinir", async () => {
    const { env, raw, svc } = world({ PIPELINE_ALERT_WEBHOOK_URL: HOOK });
    const posts = hook(); quiet();
    raw.prepare("INSERT INTO rss_news (id, source, title, url, summary, fetched_at, expires_at) VALUES ('n1','K','A','https://e.example.com/1','özet','2026-10-27 05:00:00','2026-10-30 05:00:00')").run();
    raw.prepare("INSERT INTO rss_news (id, source, title, url, fetched_at, expires_at) VALUES ('n2','K','B','https://e.example.com/2','2026-10-27 06:00:00','2026-10-30 06:00:00')").run();
    await svc.submitJob({ input: "C", phrase: "hazelnut kernels export", locales: ["en"], page_type: "article" });
    await runArticleJobs(env, NOW, named("gemini-main"), null); // 1 iş done + 1 taslak
    seedUsage(raw, "gemini-main", 3, 0, "2026-07-01"); // 118 gün önce → silinir
    const at = new Date("2026-10-27T23:00:00Z");
    const s = await runMaintenance(env, at);
    expect(s.day_report).toMatchObject({ rss_fetched: 2, rss_enriched: 1, jobs_done: 1, jobs_blocked: 0, drafts_created: 1 });
    expect(s.day_report.ai_usage).toEqual([{ model: "gemini-main", calls: 1, failures: 0, exhausted: 0 }]);
    expect(s.purges.find((p) => p.table === "ai_usage_daily")?.deleted).toBe(1);
    const reports = posts.filter((p) => p.body.text.includes("Günlük içerik hattı raporu"));
    expect(reports.length).toBe(1);
    expect(reports[0].body.text).toMatch(/RSS 2 yeni · özet 1/);
    await runMaintenance(env, new Date(at.getTime() + 10 * 60_000)); // aynı gün ikinci koşu
    expect(posts.filter((p) => p.body.text.includes("Günlük içerik hattı raporu")).length).toBe(1);
  });
});
