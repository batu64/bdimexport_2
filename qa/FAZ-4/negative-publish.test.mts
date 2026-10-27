// FAZ_4 4.9 QA — ONAYSIZ YAYIN NEGATİF TESTİ (bağımsız). Değişmez kural: hiçbir AI metni insan onayı olmadan `draft` dışına
// çıkmaz; onay da yayın değildir. Taslağı (ve onaylı-ama-yayınlanmamış içeriği) yayına zorlamanın BİLİNEN HER YOLU denenir.
import { afterEach, describe, expect, it, vi } from "vitest";
import { makeEnv } from "../../workers/cron-rss/test/helpers";
import { runArticleJobs } from "../../workers/cron-rss/src/jobs";
import { MockArticleModel, type ArticleModel } from "../../workers/cron-rss/src/article-model";
import { createContentService } from "../../app/admin/content/service";
import { handleContent } from "../../app/admin/content/handler";
import { preparePublication, markPublished, publishEdge } from "../../workers/api/src/publish/publish";
import { githubClient, type FetchLike } from "../../workers/api/src/publish/github";
import { _resetJwksCache } from "../../app/admin/middleware";
import apiWorker from "../../workers/api/src/index";

afterEach(() => { vi.unstubAllGlobals(); vi.restoreAllMocks(); });
const NOW = new Date("2026-10-27T10:00:00Z");
const TEAM = "t.cloudflareaccess.com", AUD = "a".repeat(64);
const quiet = () => { for (const k of ["log", "warn", "error"] as const) vi.spyOn(console, k).mockImplementation(() => {}); };
const stub = (): ArticleModel => { const i = new MockArticleModel(); return { name: "stub-gemini", generate: (r) => i.generate(r) }; };

let kp: CryptoKeyPair | null = null;
let jwk: JsonWebKey | null = null;
async function jwt(): Promise<string> {
  kp ??= (await crypto.subtle.generateKey({ name: "RSASSA-PKCS1-v1_5", modulusLength: 2048, publicExponent: new Uint8Array([1, 0, 1]), hash: "SHA-256" }, true, ["sign", "verify"])) as CryptoKeyPair;
  jwk ??= { ...((await crypto.subtle.exportKey("jwk", kp.publicKey)) as JsonWebKey), kid: "k", alg: "RS256", use: "sig" } as JsonWebKey;
  const b = (o: object) => Buffer.from(JSON.stringify(o)).toString("base64url");
  const h = b({ alg: "RS256", kid: "k" }), p = b({ iss: `https://${TEAM}`, aud: [AUD], exp: Math.floor(Date.now() / 1000) + 600, email: "boss@example.com", sub: "u" });
  return `${h}.${p}.${Buffer.from(await crypto.subtle.sign("RSASSA-PKCS1-v1_5", kp.privateKey, new TextEncoder().encode(`${h}.${p}`))).toString("base64url")}`;
}
// Hata KODLARI expect.soft (bilgi), son DURUM sert: bir katman bozulsa bile asıl iddia (draft kalır, publications boş) ayrıca raporlanır.
// Her durumda "merge edildi" diyen GitHub — kötü niyetli/hatalı bir onay iddiası bile içerik durumunu atlatamamalı
const alwaysMerged: FetchLike = async (url, init) => {
  const ok = (s: number, d: unknown = {}) => ({ ok: s < 300, status: s, json: async () => d });
  if (init.method === "GET" && url.includes("/contents/")) return ok(404);
  if (url.endsWith("/git/ref/heads/main")) return ok(200, { object: { sha: "S" } });
  if (url.endsWith("/pulls") && init.method === "POST") return ok(201, { number: 5, html_url: "https://github.com/batu64/bdimexport/pull/5" });
  if (url.includes("/pulls/")) return ok(200, { state: "closed", merged: true });
  return ok(201);
};

async function draftWorld() {
  const { env, raw } = makeEnv();
  quiet();
  const svc = createContentService(env.DB as never, "boss@example.com", () => NOW.getTime());
  await svc.submitJob({ input: "C", phrase: "turkish marble slabs", locales: ["en"], page_type: "article" });
  await svc.submitJob({ input: "C", phrase: "hazelnut harvest news", locales: ["en"], page_type: "news_card" });
  await runArticleJobs(env, NOW, stub(), null);
  const drafts = await svc.listDrafts("draft");
  expect(drafts.length).toBe(2);
  return { env, raw, svc, art: drafts.find((d) => d.page_type === "article")!.id, card: drafts.find((d) => d.page_type === "news_card")!.id };
}
const statusOf = (raw: ReturnType<typeof makeEnv>["raw"], id: string) => (raw.prepare("SELECT status FROM contents WHERE id=?").get(id) as { status: string }).status;
async function publicIds(env: { DB: unknown }, q = "") {
  const kv = new Map<string, string>();
  const e = { DB: env.DB, CACHE: { get: async (k: string) => kv.get(k) ?? null, put: async (k: string, v: string) => void kv.set(k, v), delete: async () => {} }, ALLOWED_ORIGINS: "", TURNSTILE_HOSTNAMES: "", KVKK_VERSIONS: "" };
  const r = await apiWorker.fetch(new Request(`https://api.bdimexport.com/api/v1/contents${q}`, { headers: { "cf-connecting-ip": "1.2.3.4" } }), e as never);
  return ((await r.json()) as { data: { id: string }[] }).data.map((d) => d.id);
}

describe("onaysız yayın — tüm yollar KAPALI", () => {
  it("DRAFT: servis (publish/prepare/mark), çekirdek (publishEdge/preparePublication/markPublished — 'merge edildi' diyen GitHub ile bile) → hepsi red", async () => {
    const { env, raw, svc, art, card } = await draftWorld();
    const gh = githubClient({ token: "t", repo: "batu64/bdimexport", base: "main" }, alwaysMerged);
    expect.soft((await svc.publish([art, card])).changed).toEqual([]);
    expect.soft((await svc.preparePublication(art)).error).toBe("not_approved");
    expect.soft((await svc.markPublished(art)).error).toBe("not_approved");
    expect.soft((await publishEdge(env.DB as never, card, "x")).ok).toBe(false);
    expect.soft((await preparePublication(env.DB as never, gh, art, "x")).ok).toBe(false);
    expect.soft((await markPublished(env.DB as never, gh, art, "x")).ok).toBe(false);
    expect([statusOf(raw, art), statusOf(raw, card)]).toEqual(["draft", "draft"]);
    expect(raw.prepare("SELECT COUNT(*) n FROM publications").get()).toEqual({ n: 0 });
  });

  it("DRAFT: admin HTTP uçları (publish, prepare-pr, mark-published, PATCH status/published_at) → red; durum değişmez", async () => {
    const { env, raw, art, card } = await draftWorld();
    const token = await jwt();
    const aenv = { ...env, ACCESS_TEAM_DOMAIN: TEAM, ACCESS_AUD: AUD, ADMIN_EMAILS: "boss@example.com", GITHUB_PUBLISH_TOKEN: "t" } as never;
    const call = async (path: string, method: string, body: unknown) => {
      _resetJwksCache();
      const r = await handleContent(new Request(`https://bdimexport.pages.dev/admin/api/content${path}`, { method, headers: { "cf-access-jwt-assertion": token, "content-type": "application/json" }, body: JSON.stringify(body) }), aenv, { fetcher: async () => ({ keys: [jwk!] }), githubFetch: alwaysMerged }, () => NOW.getTime());
      return { status: r.status, body: await r.json() };
    };
    expect.soft((await call("/drafts/publish", "POST", { ids: [art, card] })).body.changed).toEqual([]);
    expect.soft((await call(`/drafts/${art}/prepare-pr`, "POST", {})).body.error).toBe("not_approved");
    expect.soft((await call(`/drafts/${art}/mark-published`, "POST", {})).body.error).toBe("not_approved");
    for (const patch of [{ status: "published" }, { status: "approved" }, { published_at: "2026-01-01" }, { title: "x", status: "published" }]) {
      expect.soft((await call(`/drafts/${art}`, "PATCH", patch)).body.error, JSON.stringify(patch)).toBe("field_read_only");
    }
    expect([statusOf(raw, art), statusOf(raw, card)]).toEqual(["draft", "draft"]);
  });

  it("APPROVED (onaylı ama yayınlanmamış): public API'de YOK; makale PR'sız/merge'süz 'yayınlandı' yapılamaz", async () => {
    const { env, raw, svc, art, card } = await draftWorld();
    await svc.approve([art, card]);
    expect(await publicIds(env)).toEqual([]);
    expect(await publicIds(env, "?status=approved")).toEqual([]); // status parametresi anahtarsız yok sayılır
    expect((await svc.markPublished(art)).error).toBe("no_open_pr");
    expect((await svc.publish([art])).skipped[0].reason).toBe("pr_required");
    expect(statusOf(raw, art)).toBe("approved");
  });

  it("üretim tüketicisi (4.5) asla draft dışı yazamaz: önceden approved/published olan içerik değişmez, yeni satırlar hep draft", async () => {
    const { env, raw } = makeEnv();
    quiet();
    raw.prepare("INSERT INTO contents (id,slug,locale,page_type,title,body_md,status) VALUES ('P','p','en','article','t','b','published'),('A','a','en','article','t','b','approved')").run();
    const svc = createContentService(env.DB as never, "boss@example.com", () => NOW.getTime());
    for (const ph of ["olive oil export", "steel pipes export", "denim mills"]) await svc.submitJob({ input: "C", phrase: ph, locales: ["en", "de"], page_type: "article" });
    await runArticleJobs(env, NOW, stub(), null);
    const rows = raw.prepare("SELECT id, status FROM contents ORDER BY id").all().map((r) => ({ ...r })) as { id: string; status: string }[];
    expect(rows.find((r) => r.id === "P")?.status).toBe("published");
    expect(rows.find((r) => r.id === "A")?.status).toBe("approved");
    expect(rows.filter((r) => !["P", "A"].includes(r.id)).every((r) => r.status === "draft")).toBe(true);
    expect(rows.length).toBe(2 + 6);
  });
});
