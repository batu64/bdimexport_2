// FAZ_4 4.9 QA — TAM HAT e2e (bağımsız): RSS haber → özet/etiket → ai_jobs → üretim → draft → 👤 onay → yayın.
// İki yol: KALICI (makale → PR → merge → "yayınlandı") ve GEÇİCİ (news_card → edge). Gerçek kod, gerçek SQL (tüm migration'lar),
// sahte RSS + sahte GitHub. Runtime AI = mock/stub (gerçek Gemini E3'te doğrulanacak).
import { afterEach, describe, expect, it, vi } from "vitest";
import { makeEnv, mockFeeds, rss2, setSources } from "../../workers/cron-rss/test/helpers";
import { runIngest } from "../../workers/cron-rss/src/ingest";
import { runEnrich } from "../../workers/cron-rss/src/enrich";
import { runArticleJobs } from "../../workers/cron-rss/src/jobs";
import { MockArticleModel, type ArticleModel } from "../../workers/cron-rss/src/article-model";
import { createContentService } from "../../app/admin/content/service";
import { githubClient, type FetchLike } from "../../workers/api/src/publish/github";
import apiWorker from "../../workers/api/src/index";

afterEach(() => { vi.unstubAllGlobals(); vi.restoreAllMocks(); });
const NOW = new Date("2026-10-27T10:00:00Z");
const ADMIN = "boss@example.com";
const quiet = () => { for (const k of ["log", "warn", "error"] as const) vi.spyOn(console, k).mockImplementation(() => {}); };
const FEED = "https://feeds.example.com/trade.xml";

/** Gerçek-dışı ama "mock" OLMAYAN üretim modeli (E3 öncesi gerçek Gemini yerine): mock çıktısı, farklı ad. */
const stubGemini = (): ArticleModel => { const inner = new MockArticleModel(); return { name: "stub-gemini", generate: (r) => inner.generate(r) }; };

function fakeGitHub() {
  const state = { merged: false, files: new Map<string, string>() };
  const res = (status: number, data: unknown = {}) => ({ ok: status < 300, status, json: async () => data });
  const f: FetchLike = async (url, init) => {
    const p = url.replace("https://api.github.com/repos/batu64/bdimexport", "");
    if (init.method === "GET" && p.startsWith("/contents/")) return res(404);
    if (p === "/git/ref/heads/main") return res(200, { object: { sha: "S" } });
    if (p === "/git/refs") return res(201);
    if (init.method === "PUT") { state.files.set(decodeURIComponent(p.slice(10)), JSON.parse(init.body!).content); return res(201); }
    if (p === "/pulls" && init.method === "POST") return res(201, { number: 11, html_url: "https://github.com/batu64/bdimexport/pull/11" });
    if (p === "/pulls/11") return res(200, { state: state.merged ? "closed" : "open", merged: state.merged });
    return res(404);
  };
  return { gh: githubClient({ token: "github_pat_QA", repo: "batu64/bdimexport", base: "main" }, f), state };
}

/** Public API (workers/api) aynı D1 üzerinde — "yayında mı?" sorusunun dış dünyadan cevabı. */
async function publicList(env: { DB: unknown }, q = "") {
  const kv = new Map<string, string>();
  const apiEnv = { DB: env.DB, CACHE: { get: async (k: string) => kv.get(k) ?? null, put: async (k: string, v: string) => void kv.set(k, v), delete: async (k: string) => void kv.delete(k) }, ALLOWED_ORIGINS: "", TURNSTILE_HOSTNAMES: "", KVKK_VERSIONS: "" };
  const r = await apiWorker.fetch(new Request(`https://api.bdimexport.com/api/v1/contents${q}`, { headers: { "cf-connecting-ip": "9.9.9.9" } }), apiEnv as never);
  return ((await r.json()) as { data: { id: string; status?: string }[] }).data.map((d) => d.id);
}

describe("tam hat e2e", () => {
  it("haber → özet → ai_jobs (B) → MOCK taslak → onay → mock HİÇBİR yoldan yayına çıkamaz (güvenlik kemeri)", async () => {
    const { env, raw } = makeEnv({ ENRICH_MODE: "mock", ARTICLE_MODE: "mock" });
    quiet();
    setSources(raw, [{ id: "s1", name: "Ticaret Haberleri", url: FEED, enabled: true }]);
    mockFeeds({ [FEED]: rss2([{ title: "Turkish hazelnut exports to Germany rise", link: "https://news.example.com/h1" }, { title: "Marble quarries expand capacity", link: "https://news.example.com/m1" }]) });
    expect((await runIngest(env, NOW)).inserted).toBe(2);
    expect((await runEnrich(env, NOW)).enriched).toBe(2);
    const news = raw.prepare("SELECT id, summary, tags_json, expires_at FROM rss_news ORDER BY url").all() as { id: string; summary: string; expires_at: string }[];
    expect(news.every((n) => n.summary.startsWith("[MOCK]"))).toBe(true);
    const svc = createContentService(env.DB as never, ADMIN, () => NOW.getTime(), null);
    const { job_id } = await svc.submitJob({ input: "B", news_ids: news.map((n) => n.id), locales: ["en"], page_type: "article" });
    expect((await runArticleJobs(env, NOW)).drafts).toBe(1);
    const [d] = await svc.listDrafts("draft");
    expect([d.model, d.title.startsWith("[MOCK]"), d.source_job_id]).toEqual(["mock", true, job_id]);
    expect((await svc.approve([d.id])).changed).toEqual([d.id]);
    expect((await svc.publish([d.id])).skipped[0].reason).toBe("pr_required");
    expect((await svc.preparePublication(d.id)).error).toBe("mock_not_publishable");
    expect(await publicList(env)).toEqual([]);
  });

  it("KALICI yol: haber → üretim (stub-gemini) → draft → onay (public'te YOK) → PR → merge → 'yayınlandı' → public'te VAR", async () => {
    const { env, raw } = makeEnv({ ENRICH_MODE: "mock" });
    quiet();
    setSources(raw, [{ id: "s1", name: "Ticaret", url: FEED, enabled: true }]);
    mockFeeds({ [FEED]: rss2([{ title: "Olive oil prices stabilise after harvest", link: "https://news.example.com/o1" }]) });
    await runIngest(env, NOW); await runEnrich(env, NOW);
    const nid = (raw.prepare("SELECT id FROM rss_news").get() as { id: string }).id;
    const g = fakeGitHub();
    const svc = createContentService(env.DB as never, ADMIN, () => NOW.getTime(), g.gh);
    await svc.submitJob({ input: "B", news_ids: [nid], locales: ["en"], page_type: "article" });
    expect((await runArticleJobs(env, NOW, stubGemini(), null)).drafts).toBe(1);
    const [d] = await svc.listDrafts("draft");
    expect([d.model, d.title.startsWith("[MOCK]")]).toEqual(["stub-gemini", false]);
    await svc.approve([d.id]);
    expect(await publicList(env)).toEqual([]); // ONAY ≠ YAYIN
    const p = await svc.preparePublication(d.id);
    expect(p).toMatchObject({ ok: true, state: "pr_open", pr_url: "https://github.com/batu64/bdimexport/pull/11" });
    expect([...g.state.files.keys()].every((k) => k.startsWith("content/en/global/insights/"))).toBe(true);
    expect((await svc.markPublished(d.id)).error).toBe("pr_not_merged");
    expect(await publicList(env)).toEqual([]);
    g.state.merged = true; // 👤 GitHub'da merge
    expect(await svc.markPublished(d.id)).toMatchObject({ ok: true, state: "live", verified: true });
    expect(await publicList(env)).toEqual([d.id]);
    const log = raw.prepare("SELECT action FROM admin_actions WHERE entity_id = ? ORDER BY rowid").all(d.id).map((r) => (r as { action: string }).action);
    expect(log).toEqual(["create_draft", "approve_content", "publish_pr_opened", "publish_content"]);
  });

  it("GEÇİCİ yol: news_card taslağı → onay → 'Yayınla (edge)' → public ?page_type=news_card'da anında; PR açılmaz", async () => {
    const { env, raw } = makeEnv();
    quiet();
    const g = fakeGitHub();
    const svc = createContentService(env.DB as never, ADMIN, () => NOW.getTime(), g.gh);
    await svc.submitJob({ input: "A", text: "Hazelnut harvest in the Black Sea region finished early this year according to producers.", locales: ["en"], page_type: "news_card" });
    await runArticleJobs(env, NOW, stubGemini(), null);
    const [d] = await svc.listDrafts("draft");
    expect(d.page_type).toBe("news_card");
    await svc.approve([d.id]);
    expect(await publicList(env, "?page_type=news_card")).toEqual([]);
    expect((await svc.publish([d.id])).changed).toEqual([d.id]);
    expect(await publicList(env, "?page_type=news_card")).toEqual([d.id]);
    expect(g.state.files.size).toBe(0);
    const pubs = raw.prepare("SELECT kind, state FROM publications").all().map((r) => ({ ...r }));
    expect(pubs).toEqual([{ kind: "edge", state: "live" }]); // iki yol AYRI log: publications.kind + audit kind
  });
});
