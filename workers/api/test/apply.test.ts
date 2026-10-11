import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import worker from "../src/index";
import { applyForm, makeEnv, PDF, post } from "./helpers";

// Turnstile siteverify mock'u — gerçek ağ yok
type Verdict = { success: boolean; hostname?: string; action?: string };
let verdict: Verdict;
let verifyCalls: string[];
beforeEach(() => {
  verdict = { success: true, hostname: "bdimexport.com", action: "partner_apply" };
  verifyCalls = [];
  vi.stubGlobal("fetch", async (_u: string, init: { body: URLSearchParams }) => {
    verifyCalls.push(init.body.get("response") ?? "");
    return new Response(JSON.stringify(verdict));
  });
});
afterEach(() => vi.unstubAllGlobals());

const call = (req: Request, env: ReturnType<typeof makeEnv>["env"]) => worker.fetch(req, env);

describe("POST /api/v1/partners/apply", () => {
  it("başarılı: 201, approved=0, consent_logo_en kaydı, R2 key media/tr/katalog/{id}/", async () => {
    const { env, raw, r2 } = makeEnv();
    const res = await call(post(applyForm({ logoConsent: "true" }, { bytes: PDF(2048) })), env);
    expect(res.status).toBe(201);
    const { id } = (await res.json()) as { id: string };
    const row = raw.prepare("SELECT * FROM partners WHERE id=?").get(id) as Record<string, unknown>;
    expect(row.approved).toBe(0);
    expect(row.consent_logo_en).toBe(1);
    expect(row.logo_r2_key).toBeNull();
    expect(row.catalog_r2_key).toBe(`media/tr/katalog/${id}/katalog.pdf`);
    expect(row.kvkk_consent_version).toBe("v1 (47ac2ef0a5b43264)");
    expect(r2.objs.get(row.catalog_r2_key as string)?.ct).toBe("application/pdf");
  });

  it("logo rızası verilmezse consent_logo_en=0 (KVKK rızası ayrı)", async () => {
    const { env, raw } = makeEnv();
    const res = await call(post(applyForm()), env);
    expect(res.status).toBe(201);
    const { id } = (await res.json()) as { id: string };
    expect((raw.prepare("SELECT consent_logo_en c FROM partners WHERE id=?").get(id) as { c: number }).c).toBe(0);
  });

  it("client approved=1 göndermeye çalışırsa yok sayılır", async () => {
    const { env, raw } = makeEnv();
    const res = await call(post(applyForm({ approved: "1" })), env);
    const { id } = (await res.json()) as { id: string };
    expect((raw.prepare("SELECT approved a FROM partners WHERE id=?").get(id) as { a: number }).a).toBe(0);
  });

  it.each([
    ["alan yok", null],
    ["false", "false"],
    ["boş değil ama geçersiz", "yes"],
  ])("KVKK rızasız → 400 (%s) ve kayıt YOK", async (_n, v) => {
    const { env, raw } = makeEnv();
    const res = await call(post(applyForm({ kvkkConsent: v })), env);
    expect(res.status).toBe(400);
    expect(((await res.json()) as { error: { code: string } }).error.code).toBe("validation_failed");
    expect(raw.prepare("SELECT count(*) n FROM partners").get()).toEqual({ n: 0 });
  });

  it("e-posta yok → 400 (başvuru sonucu bildirilemez) ve kayıt YOK", async () => {
    const { env, raw } = makeEnv();
    const res = await call(post(applyForm({ contactEmail: null })), env);
    expect(res.status).toBe(400);
    const body = (await res.json()) as { error: { details: { field: string }[] } };
    expect(body.error.details.map((d) => d.field)).toContain("contactEmail");
    expect(raw.prepare("SELECT count(*) n FROM partners").get()).toEqual({ n: 0 });
  });

  it("tanınmayan KVKK sürümü → 400", async () => {
    const { env } = makeEnv();
    expect((await call(post(applyForm({ kvkkVersion: "v0-eski" })), env)).status).toBe(400);
  });

  it("26MB dosya → 413 (R2/D1'e yazılmaz)", async () => {
    const { env, raw, r2 } = makeEnv();
    const res = await call(post(applyForm({}, { bytes: PDF(26 * 1024 * 1024) })), env);
    expect(res.status).toBe(413);
    expect(r2.objs.size).toBe(0);
    expect(raw.prepare("SELECT count(*) n FROM partners").get()).toEqual({ n: 0 });
  });

  it("tam 25MB PDF kabul edilir", async () => {
    const { env } = makeEnv();
    expect((await call(post(applyForm({}, { bytes: PDF(25 * 1024 * 1024) })), env)).status).toBe(201);
  });

  it("chunked/Content-Length'siz 26MB gövde de 413", async () => {
    const { env } = makeEnv();
    const big = await post(applyForm({}, { bytes: PDF(26 * 1024 * 1024) })).arrayBuffer();
    const ct = "multipart/form-data; boundary=x";
    const stream = new ReadableStream({ start(c) { c.enqueue(new Uint8Array(big)); c.close(); } });
    const req = new Request("https://api.bdimexport.com/api/v1/partners/apply", {
      method: "POST", body: stream, headers: { "content-type": ct, "cf-connecting-ip": "9.9.9.9" }, duplex: "half",
    } as RequestInit);
    expect((await call(req, env)).status).toBe(413);
  });

  it("PDF olmayan mime → 400; sahte mime (içerik PDF değil) → 400", async () => {
    const { env } = makeEnv();
    expect((await call(post(applyForm({}, { bytes: PDF(100), type: "image/png" })), env)).status).toBe(400);
    expect((await call(post(applyForm({}, { bytes: new Uint8Array(100).fill(65) })), env)).status).toBe(400);
  });

  it("multipart olmayan istek → 415", async () => {
    const { env } = makeEnv();
    const req = new Request("https://api.bdimexport.com/api/v1/partners/apply", { method: "POST", body: "{}", headers: { "content-type": "application/json" } });
    expect((await call(req, env)).status).toBe(415);
  });

  it("geçersiz vergi no / e-posta → 400, yanıtta girdi değeri YANKILANMAZ", async () => {
    const { env } = makeEnv();
    const res = await call(post(applyForm({ vergiNo: "12ab", contactEmail: "pii-sizinti@x" })), env);
    expect(res.status).toBe(400);
    const t = await res.text();
    expect(t).not.toContain("pii-sizinti");
    expect(t).not.toContain("12ab");
  });

  it("mükerrer vergi no → 409", async () => {
    const { env } = makeEnv();
    expect((await call(post(applyForm()), env)).status).toBe(201);
    expect((await call(post(applyForm()), env)).status).toBe(409);
  });
});

describe("Turnstile bağlama", () => {
  it("token yok → 403 (siteverify çağrılmaz, kayıt yok)", async () => {
    const { env, raw } = makeEnv();
    const res = await call(post(applyForm({ turnstileToken: null })), env);
    expect(res.status).toBe(403);
    expect(verifyCalls).toHaveLength(0);
    expect(raw.prepare("SELECT count(*) n FROM partners").get()).toEqual({ n: 0 });
  });

  it("siteverify success=false → 403", async () => {
    const { env } = makeEnv();
    verdict = { success: false };
    expect((await call(post(applyForm()), env)).status).toBe(403);
  });

  it("action uyuşmaz (başka formdan token) → 403", async () => {
    const { env } = makeEnv();
    verdict = { success: true, hostname: "bdimexport.com", action: "login" };
    expect((await call(post(applyForm()), env)).status).toBe(403);
  });

  it("hostname beyaz listede değil (başka sitede üretilmiş token) → 403", async () => {
    const { env } = makeEnv();
    verdict = { success: true, hostname: "evil.example", action: "partner_apply" };
    expect((await call(post(applyForm()), env)).status).toBe(403);
  });

  it("replay: aynı token ikinci kez → 403", async () => {
    const { env } = makeEnv();
    const t = "tek-kullanimlik";
    expect((await call(post(applyForm({ turnstileToken: t })), env)).status).toBe(201);
    const r2 = await call(post(applyForm({ turnstileToken: t, vergiNo: "9876543210" })), env);
    expect(r2.status).toBe(403);
    expect(((await r2.json()) as { error: { code: string } }).error.code).toBe("turnstile_replay");
    expect(verifyCalls).toHaveLength(1);
  });

  it("siteverify ağ hatası → fail-closed 403", async () => {
    const { env } = makeEnv();
    vi.stubGlobal("fetch", async () => { throw new Error("net"); });
    expect((await call(post(applyForm()), env)).status).toBe(403);
  });
});

describe("rate limit", () => {
  it("IP başına limit üstü → 429 + retry-after", async () => {
    const { env } = makeEnv({ RL_APPLY_PER_MIN: "3" });
    for (let i = 0; i < 3; i++) await call(post(applyForm({ vergiNo: String(1000000000 + i) })), env);
    const res = await call(post(applyForm({ vergiNo: "2000000000" })), env);
    expect(res.status).toBe(429);
    expect(res.headers.get("retry-after")).toBeTruthy();
  });
});

describe("CORS", () => {
  it("izinli origin → ACAO yansır", async () => {
    const { env } = makeEnv();
    const res = await call(new Request("https://api.bdimexport.com/api/v1/health", { headers: { origin: "https://bdimexport.com" } }), env);
    expect(res.headers.get("access-control-allow-origin")).toBe("https://bdimexport.com");
  });
  it("izinsiz origin → 403, ACAO yok; preflight de red", async () => {
    const { env } = makeEnv();
    const h = { origin: "https://evil.example" };
    const res = await call(new Request("https://api.bdimexport.com/api/v1/health", { headers: h }), env);
    expect(res.status).toBe(403);
    expect(res.headers.get("access-control-allow-origin")).toBeNull();
    const pre = await call(new Request("https://api.bdimexport.com/api/v1/partners/apply", { method: "OPTIONS", headers: h }), env);
    expect(pre.status).toBe(403);
  });
});
