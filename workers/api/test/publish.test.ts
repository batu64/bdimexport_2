// FAZ_4 4.6 — onay → yayın hattı (PR / edge hibrit). Gerçek SQL (tüm migration'lar) + sahte GitHub API.
import { describe, it, expect } from "vitest";
import worker from "../src/index";
import { makeEnv } from "./helpers";
import { routeFor, renderArticle, type ContentRow } from "../src/publish/render";
import { preparePublication, markPublished, publishEdge, latestPublications } from "../src/publish/publish";
import { githubClient, type FetchLike } from "../src/publish/github";
import { githubFromEnv } from "../src/publish/env";

type Ctx = ReturnType<typeof makeEnv>;
const TOKEN = "github_pat_TEST_GIZLI_0123456789";
const ACTOR = "boss@example.com";
const db = (c: Ctx) => c.env.DB as never;

const BODY = "# Turkish Hazelnut Exporters to Germany\n\nTurkish hazelnut exporters supply German importers with kernels.\n\n## Why Turkey\n\nText.\n";
const SCHEMA = JSON.stringify({ "@context": "https://schema.org", "@graph": [
  { "@type": "Article", headline: "Turkish Hazelnut Exporters to Germany", description: "How German buyers source Turkish hazelnut kernels: grades, checks and shipping. Free quotation in 24h from Bdimexport." },
  { "@type": "FAQPage", mainEntity: [] },
  { "@type": "BreadcrumbList", itemListElement: [{ position: 1 }, { position: 2 }, { position: 3 }] },
] });
function seed(c: Ctx, o: Partial<ContentRow> & { id: string }) {
  const r: ContentRow = { slug: "turkish-hazelnut-exporters-germany", locale: "en", page_type: "article", title: "Turkish Hazelnut Exporters to Germany",
    body_md: BODY, target_keyword: "turkish hazelnut exporters", schema_json: SCHEMA, status: "approved", model: "gemini-x", source_job_id: "J1", ...o };
  c.raw.prepare("INSERT INTO contents (id,slug,locale,page_type,title,body_md,target_keyword,schema_json,status,model,source_job_id) VALUES (?,?,?,?,?,?,?,?,?,?,?)")
    .run(r.id, r.slug, r.locale, r.page_type, r.title, r.body_md, r.target_keyword, r.schema_json, r.status, r.model, r.source_job_id);
}
const status = (c: Ctx, id: string) => (c.raw.prepare("SELECT status, published_at FROM contents WHERE id=?").get(id) as { status: string; published_at: string | null });
const pubs = (c: Ctx) => c.raw.prepare("SELECT kind, state, pr_number, pr_url, branch, files_json, error FROM publications ORDER BY rowid").all() as Record<string, unknown>[];
const audits = (c: Ctx) => c.raw.prepare("SELECT action, new_value FROM admin_actions ORDER BY rowid").all() as { action: string; new_value: string }[];

/** Sahte GitHub: istekleri kaydeder, senaryoya göre yanıt verir. */
function fakeGitHub(o: { existing?: string[]; failOn?: string; pr?: { state: "open" | "closed"; merged: boolean } } = {}) {
  const calls: { method: string; url: string; body?: Record<string, unknown>; auth: string }[] = [];
  let prState = o.pr ?? { state: "open", merged: false };
  const files = new Map<string, string>();
  const res = (status: number, data: unknown = {}) => ({ ok: status < 300, status, json: async () => data });
  const fetchImpl: FetchLike = async (url, init) => {
    const body = init.body ? JSON.parse(init.body) : undefined;
    calls.push({ method: init.method, url, body, auth: init.headers.authorization });
    const path = url.replace("https://api.github.com/repos/batu64/bdimexport", "");
    const op = `${init.method} ${path.split("?")[0]}`;
    if (o.failOn && op.startsWith(o.failOn)) return res(500);
    if (init.method === "GET" && path.startsWith("/contents/")) {
      const p = decodeURIComponent(path.slice(10).split("?")[0]);
      return (o.existing ?? []).includes(p) ? res(200, { sha: "x" }) : res(404);
    }
    if (op === "GET /git/ref/heads/main") return res(200, { object: { sha: "BASESHA" } });
    if (op === "POST /git/refs") return res(201, {});
    if (init.method === "PUT" && path.startsWith("/contents/")) { files.set(decodeURIComponent(path.slice(10)), new TextDecoder().decode(Uint8Array.from(atob(body.content), (ch) => ch.charCodeAt(0)))); return res(201, {}); }
    if (op === "POST /pulls") return res(201, { number: 42, html_url: "https://github.com/batu64/bdimexport/pull/42" });
    if (op === "GET /pulls/42") return res(200, prState);
    if (op === "PATCH /pulls/42") { prState = { state: "closed", merged: false }; return res(200, {}); }
    return res(404);
  };
  return { gh: githubClient({ token: TOKEN, repo: "batu64/bdimexport", base: "main" }, fetchImpl), calls, files, setPr: (p: typeof prState) => { prState = p; } };
}

describe("render (deterministik dosya üretimi)", () => {
  it("rotalar: tr /makaleler · en /en/insights · en-ru /en/ru/insights · de/zh FAZ 5'e kadar YOK", () => {
    expect(routeFor("tr")?.urlBase).toBe("/makaleler");
    expect(routeFor("en")?.dir).toBe("content/en/global/insights");
    expect(routeFor("en-ar")?.urlBase).toBe("/en/ar/insights");
    expect([routeFor("de"), routeFor("zh"), routeFor("en-xx"), routeFor("fr")]).toEqual([null, null, null, null]);
  });
  it("md + schema: META güvenli, tek H1, kaynak izi; breadcrumb gerçek URL'ler", () => {
    const r = renderArticle({ id: "C1", slug: "a-b", locale: "en", page_type: "product", title: 'Say "hi" --> now', body_md: "<!-- gizli -->\nGövde.", target_keyword: null, schema_json: SCHEMA, status: "approved", model: "gemini-x", source_job_id: null }, { approvedBy: ACTOR, preparedAt: "2026-10-27T00:00:00Z" });
    if ("error" in r) throw new Error(r.error);
    const [md, schema] = r.files;
    expect(md.path).toBe("content/en/global/insights/a-b.md"); // ürün tipi bile olsa ürün sayfasının ÜZERİNE YAZILMAZ
    expect(md.content).toMatch(/^<!-- META: title="Say ”hi” —> now \| Bdimexport" desc="[^"]+" -->/);
    expect((md.content.match(/^# /gm) ?? []).length).toBe(1);
    expect(md.content).not.toContain("gizli");
    expect(md.content).toContain("<!-- PUBLISH: content_id=C1 locale=en page_type=product model=gemini-x");
    const ld = JSON.parse(schema.content);
    const crumbs = ld["@graph"].find((n: { "@type": string }) => n["@type"] === "BreadcrumbList").itemListElement;
    expect(crumbs.map((x: { item: string }) => x.item)).toEqual(["https://bdimexport.com/en", "https://bdimexport.com/en/insights", "https://bdimexport.com/en/insights/a-b"]);
  });
  it("reddedilenler: mock, news_card, kötü slug, de/zh", () => {
    const base = { id: "C", slug: "ok", locale: "en", page_type: "article", title: "T", body_md: "x", target_keyword: null, schema_json: null, status: "approved", model: "m", source_job_id: null };
    const m = { approvedBy: ACTOR, preparedAt: "t" };
    expect(renderArticle({ ...base, model: "mock" }, m)).toEqual({ error: "mock_not_publishable" });
    expect(renderArticle({ ...base, title: "[MOCK] T" }, m)).toEqual({ error: "mock_not_publishable" });
    expect(renderArticle({ ...base, page_type: "news_card" }, m)).toEqual({ error: "use_edge" });
    expect(renderArticle({ ...base, slug: "../etc/passwd" }, m)).toEqual({ error: "bad_slug" });
    expect(renderArticle({ ...base, locale: "de" }, m)).toEqual({ error: "route_pending", detail: "de" });
  });
});

describe("kalıcı yol: PR", () => {
  it("token YOK → DRY-RUN: plan kaydı + audit, ağ çağrısı yok, içerik approved KALIR", async () => {
    const c = makeEnv(); seed(c, { id: "C1" });
    const r = await preparePublication(db(c), null, "C1", ACTOR);
    expect(r).toMatchObject({ ok: true, state: "dry_run", files: ["content/en/global/insights/turkish-hazelnut-exporters-germany.md", "content/en/global/insights/turkish-hazelnut-exporters-germany.schema.json"] });
    expect(status(c, "C1").status).toBe("approved");
    expect(pubs(c)).toMatchObject([{ kind: "pr", state: "dry_run", pr_number: null }]);
    expect(audits(c).map((a) => a.action)).toEqual(["publish_dry_run"]);
    expect(githubFromEnv({})).toBeNull();
  });
  it("token VAR → dal + 2 dosya + PR; içerik HÂLÂ approved (onay ≠ yayın); main'e doğrudan yazım yok", async () => {
    const c = makeEnv(); seed(c, { id: "C1" });
    const f = fakeGitHub();
    const r = await preparePublication(db(c), f.gh, "C1", ACTOR);
    expect(r).toMatchObject({ ok: true, state: "pr_open", pr_url: "https://github.com/batu64/bdimexport/pull/42" });
    expect(status(c, "C1").status).toBe("approved");
    const writes = f.calls.filter((x) => x.method !== "GET");
    expect(writes.map((x) => x.method + " " + x.url.split("/bdimexport/")[1].split("/")[0])).toEqual(["POST git", "PUT contents", "PUT contents", "POST pulls"]);
    expect(writes[0].body).toMatchObject({ sha: "BASESHA" }); // dal main'in ucundan açılır; main'e yazım YOK
    expect(writes.filter((x) => x.method === "PUT").every((x) => String(x.body?.branch).startsWith("publish/turkish-hazelnut-exporters-germany-"))).toBe(true);
    expect(writes.find((x) => x.method === "POST" && x.url.endsWith("/pulls"))?.body).toMatchObject({ base: "main" });
    expect(f.files.get("content/en/global/insights/turkish-hazelnut-exporters-germany.md")).toContain("# Turkish Hazelnut Exporters to Germany");
    expect(f.calls.every((x) => x.auth === `Bearer ${TOKEN}`)).toBe(true);
    expect(pubs(c)).toMatchObject([{ state: "pr_open", pr_number: 42 }]);
    expect(audits(c).map((a) => a.action)).toEqual(["publish_pr_opened"]);
    expect(JSON.stringify(audits(c)) + JSON.stringify(pubs(c))).not.toContain(TOKEN);
  });
  it("ikinci 'Yayına hazırla' → pr_already_open, ikinci PR AÇILMAZ", async () => {
    const c = makeEnv(); seed(c, { id: "C1" });
    const f = fakeGitHub();
    await preparePublication(db(c), f.gh, "C1", ACTOR);
    const n = f.calls.length;
    expect(await preparePublication(db(c), f.gh, "C1", ACTOR)).toMatchObject({ ok: false, error: "pr_already_open", http: 409 });
    expect(f.calls.length).toBe(n);
  });
  it("aynı yol repoda VAR → 409 file_exists; dal açılmaz (üzerine yazma yok)", async () => {
    const c = makeEnv(); seed(c, { id: "C1" });
    const f = fakeGitHub({ existing: ["content/en/global/insights/turkish-hazelnut-exporters-germany.md"] });
    expect(await preparePublication(db(c), f.gh, "C1", ACTOR)).toMatchObject({ ok: false, error: "file_exists" });
    expect(f.calls.filter((x) => x.method !== "GET")).toEqual([]);
    expect(pubs(c)).toEqual([]);
  });
  it("GitHub hatası → failed kaydı + publish_failed audit, 502; hata metninde token YOK", async () => {
    const c = makeEnv(); seed(c, { id: "C1" });
    const r = await preparePublication(db(c), fakeGitHub({ failOn: "PUT /contents" }).gh, "C1", ACTOR);
    expect(r).toMatchObject({ ok: false, error: "github_error", http: 502, detail: "put_file:500" });
    expect(pubs(c)).toMatchObject([{ state: "failed", error: "put_file:500" }]);
    expect(JSON.stringify(r) + JSON.stringify(audits(c))).not.toContain(TOKEN);
  });
  it("draft / published / mock / de içerik → PR yok", async () => {
    const c = makeEnv();
    seed(c, { id: "D", status: "draft" }); seed(c, { id: "P", slug: "p", status: "published" });
    seed(c, { id: "M", slug: "m", model: "mock", title: "[MOCK] x" }); seed(c, { id: "G", slug: "g", locale: "de" });
    const f = fakeGitHub();
    expect((await preparePublication(db(c), f.gh, "D", ACTOR) as { error: string }).error).toBe("not_approved");
    expect((await preparePublication(db(c), f.gh, "P", ACTOR) as { error: string }).error).toBe("not_approved");
    expect((await preparePublication(db(c), f.gh, "M", ACTOR) as { error: string }).error).toBe("mock_not_publishable");
    expect((await preparePublication(db(c), f.gh, "G", ACTOR) as { error: string }).error).toBe("route_pending");
    expect(f.calls).toEqual([]);
  });
});

describe("kalıcı yol: 'Yayınlandı işaretle' (merge sonrası, admin elle)", () => {
  it("PR açık ama merge edilmedi → 409 pr_not_merged, içerik approved kalır", async () => {
    const c = makeEnv(); seed(c, { id: "C1" }); const f = fakeGitHub();
    await preparePublication(db(c), f.gh, "C1", ACTOR);
    expect(await markPublished(db(c), f.gh, "C1", ACTOR)).toMatchObject({ ok: false, error: "pr_not_merged" });
    expect(status(c, "C1").status).toBe("approved");
  });
  it("merge DOĞRULANDI → published + publications live + audit (merge_verified=true)", async () => {
    const c = makeEnv(); seed(c, { id: "C1" }); const f = fakeGitHub();
    await preparePublication(db(c), f.gh, "C1", ACTOR);
    f.setPr({ state: "closed", merged: true });
    expect(await markPublished(db(c), f.gh, "C1", ACTOR)).toMatchObject({ ok: true, state: "live", verified: true });
    expect(status(c, "C1")).toMatchObject({ status: "published" });
    expect(status(c, "C1").published_at).toBeTruthy();
    expect(pubs(c)[0].state).toBe("live");
    const last = audits(c).at(-1)!;
    expect([last.action, JSON.parse(last.new_value).merge_verified]).toEqual(["publish_content", true]);
    expect(await markPublished(db(c), f.gh, "C1", ACTOR)).toMatchObject({ ok: false, error: "not_approved" }); // tekrar yok
  });
  it("PR merge EDİLMEDEN kapatıldı → publications closed, içerik approved; yeniden 'hazırla' mümkün", async () => {
    const c = makeEnv(); seed(c, { id: "C1" }); const f = fakeGitHub();
    await preparePublication(db(c), f.gh, "C1", ACTOR);
    f.setPr({ state: "closed", merged: false });
    expect(await markPublished(db(c), f.gh, "C1", ACTOR)).toMatchObject({ ok: false, error: "pr_closed" });
    expect([pubs(c)[0].state, status(c, "C1").status]).toEqual(["closed", "approved"]);
    f.setPr({ state: "open", merged: false });
    expect(await preparePublication(db(c), f.gh, "C1", ACTOR)).toMatchObject({ ok: true, state: "pr_open" });
  });
  it("açık PR yok (yalnız dry-run) → işaretlenemez", async () => {
    const c = makeEnv(); seed(c, { id: "C1" });
    await preparePublication(db(c), null, "C1", ACTOR);
    expect(await markPublished(db(c), null, "C1", ACTOR)).toMatchObject({ ok: false, error: "no_open_pr" });
    expect(status(c, "C1").status).toBe("approved");
  });
  it("token sonradan kaldırıldı (PR açık) → işaretlenebilir ama merge_verified=false audit'e yazılır", async () => {
    const c = makeEnv(); seed(c, { id: "C1" });
    await preparePublication(db(c), fakeGitHub().gh, "C1", ACTOR);
    expect(await markPublished(db(c), null, "C1", ACTOR)).toMatchObject({ ok: true, verified: false });
    expect(JSON.parse(audits(c).at(-1)!.new_value).merge_verified).toBe(false);
  });
});

describe("geçici yol: edge (news_card)", () => {
  it("approved news_card → anında published + edge live; PR/ağ yok", async () => {
    const c = makeEnv(); seed(c, { id: "N1", slug: "n1", page_type: "news_card" });
    expect(await publishEdge(db(c), "N1", ACTOR)).toMatchObject({ ok: true, kind: "edge", state: "live" });
    expect(status(c, "N1").status).toBe("published");
    expect(pubs(c)).toMatchObject([{ kind: "edge", state: "live" }]);
    expect(await latestPublications(db(c), ["N1", "YOK"])).toMatchObject({ N1: { kind: "edge", state: "live" } });
  });
  it("article edge'den yayınlanamaz; draft/mock news_card da yayınlanamaz", async () => {
    const c = makeEnv();
    seed(c, { id: "A" }); seed(c, { id: "ND", slug: "nd", page_type: "news_card", status: "draft" }); seed(c, { id: "NM", slug: "nm", page_type: "news_card", model: "mock" });
    expect((await publishEdge(db(c), "A", ACTOR) as { error: string }).error).toBe("not_news_card");
    expect((await publishEdge(db(c), "ND", ACTOR) as { error: string }).error).toBe("not_approved");
    expect((await publishEdge(db(c), "NM", ACTOR) as { error: string }).error).toBe("mock_not_publishable");
    expect(pubs(c)).toEqual([]);
  });
});

describe("public API: yalnız published (onay ≠ yayın)", () => {
  it("approved içerik public'te YOK; published var; ?page_type=news_card edge bloğu; geçersiz page_type 400", async () => {
    const c = makeEnv();
    seed(c, { id: "01A" }); seed(c, { id: "01N", slug: "n", page_type: "news_card" });
    await publishEdge(db(c), "01N", ACTOR);
    const get = async (q: string) => worker.fetch(new Request(`https://api.bdimexport.com/api/v1/contents${q}`, { headers: { "cf-connecting-ip": "1.1.1.1" } }), c.env);
    expect(((await (await get("")).json()) as { data: { id: string }[] }).data.map((d) => d.id)).toEqual(["01N"]);
    expect(((await (await get("?page_type=news_card&locale=en")).json()) as { data: { id: string }[] }).data.map((d) => d.id)).toEqual(["01N"]);
    expect(((await (await get("?page_type=article")).json()) as { data: unknown[] }).data).toEqual([]);
    expect((await get("?page_type=evil")).status).toBe(400);
  });
});
