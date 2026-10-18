// FAZ_3 3.4 — admin guard (/admin/api/*) + API key çekirdeği (cache/revoke/audit) + key yaşam döngüsü e2e
import { describe, it, expect, beforeAll, beforeEach, vi } from "vitest";
import { createHash } from "node:crypto";
import worker from "../src/index";
import { makeEnv } from "./helpers";
import { _resetJwksCache } from "../../../app/admin/middleware";

type Ctx = ReturnType<typeof makeEnv>;
const TEAM = "bdimexport.cloudflareaccess.com";
const AUD = "a".repeat(64);
const ACCESS = { ACCESS_TEAM_DOMAIN: TEAM, ACCESS_AUD: AUD, ADMIN_EMAILS: "boss@example.com", VIEWER_EMAILS: "view@example.com" };
const call = (r: Request, c: Ctx) => worker.fetch(r, c.env);
const NOW = Math.floor(Date.now() / 1000);

// ---- Access JWT üretimi (test anahtarı; JWKS fetch stub'ı bu anahtarı döner) ----
let priv: CryptoKey;
let jwk: JsonWebKey & { kid: string };
const b64 = (o: object) => Buffer.from(JSON.stringify(o)).toString("base64url");
async function jwt(claims: Record<string, unknown> = {}, key = priv): Promise<string> {
  const h = b64({ alg: "RS256", kid: "k1", typ: "JWT" });
  const p = b64({ iss: `https://${TEAM}`, aud: [AUD], exp: NOW + 600, iat: NOW, email: "boss@example.com", sub: "u1", ...claims });
  const sig = await crypto.subtle.sign("RSASSA-PKCS1-v1_5", key, new TextEncoder().encode(`${h}.${p}`));
  return `${h}.${p}.${Buffer.from(sig).toString("base64url")}`;
}
const gen = () =>
  crypto.subtle.generateKey({ name: "RSASSA-PKCS1-v1_5", modulusLength: 2048, publicExponent: new Uint8Array([1, 0, 1]), hash: "SHA-256" }, true, ["sign", "verify"]) as Promise<CryptoKeyPair>;
beforeAll(async () => {
  const kp = await gen();
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
const adminReq = (path: string, token?: string, init: RequestInit = {}) =>
  new Request("https://bdimexport.pages.dev/admin/api" + path, {
    ...init,
    headers: { "cf-connecting-ip": "7.7.7.7", ...(token ? { "cf-access-jwt-assertion": token } : {}), ...((init.headers as Record<string, string>) ?? {}) },
  });
const codeOf = async (r: Response) => ((await r.json()) as { code?: string }).code;

describe("/admin/api guard (3.1 guard'ı kullanır)", () => {
  it("token yok → 401; olmayan yol da 401 (rota keşfi yok)", async () => {
    const c = makeEnv(ACCESS);
    expect((await call(adminReq("/me"), c)).status).toBe(401);
    const r = await call(adminReq("/olmayan-yol"), c);
    expect(r.status).toBe(401);
    expect(await codeOf(r)).toBe("no_access_token");
  });
  it("sahte imza / yanlış aud / expire / başka team → 403", async () => {
    const c = makeEnv(ACCESS);
    const other = (await gen()).privateKey;
    for (const [t, code] of [
      [await jwt({}, other), "bad_signature"],
      [await jwt({ aud: ["b".repeat(64)] }), "bad_aud"],
      [await jwt({ exp: NOW - 120 }), "expired"],
      [await jwt({ iss: "https://evil.cloudflareaccess.com" }), "bad_iss"],
    ] as const) {
      const r = await call(adminReq("/me", t), c);
      expect(r.status, code).toBe(403);
      expect(await codeOf(r)).toBe(code);
    }
  });
  it("allowlist dışı → 403; ADMIN_EMAILS secret girilmemiş → 403 (fail-closed); AUD boş → 403", async () => {
    expect(await codeOf(await call(adminReq("/me", await jwt({ email: "x@example.com" })), makeEnv(ACCESS)))).toBe("not_allowlisted");
    expect((await call(adminReq("/me", await jwt()), makeEnv({ ...ACCESS, ADMIN_EMAILS: undefined }))).status).toBe(403);
    expect(await codeOf(await call(adminReq("/me", await jwt()), makeEnv({ ...ACCESS, ACCESS_AUD: undefined })))).toBe("misconfigured");
  });
  it("GET /me → admin {email, role}; viewer → role=viewer; viewer mutasyon → 403", async () => {
    const c = makeEnv(ACCESS);
    const a = await call(adminReq("/me", await jwt({ email: "Boss@Example.com" })), c);
    expect(a.status).toBe(200);
    expect(await a.json()).toEqual({ email: "boss@example.com", role: "admin" });
    expect(a.headers.get("cache-control")).toBe("no-store");
    const v = await call(adminReq("/me", await jwt({ email: "view@example.com" })), c);
    expect(await v.json()).toEqual({ email: "view@example.com", role: "viewer" });
    const vp = await call(adminReq("/me", await jwt({ email: "view@example.com" }), { method: "POST" }), c);
    expect(await codeOf(vp)).toBe("viewer_read_only");
  });
  it("kimlikli ama olmayan yol → 404", async () => {
    expect((await call(adminReq("/yok", await jwt()), makeEnv(ACCESS))).status).toBe(404);
  });
});

describe("GET /admin/api/dashboard/summary", () => {
  it("boş DB → sıfırlar + analytics null", async () => {
    const r = await call(adminReq("/dashboard/summary", await jwt()), makeEnv(ACCESS));
    expect(r.status).toBe(200);
    expect(await r.json()).toEqual({
      leads: { new: 0, contacted: 0, qualified: 0, closed: 0, last7d: 0 },
      contents: { draft: 0, approved: 0, published: 0 },
      partners: { pending: 0, approved: 0 },
      analytics: null,
    });
  });
  it("veriyle doğru sayılar; viewer okuyabilir; çıktıda PII YOK", async () => {
    const c = makeEnv(ACCESS);
    const L = c.raw.prepare("INSERT INTO leads (id,source_page,locale,payload_json,status,created_at) VALUES (?,?,?,?,?,?)");
    L.run("L1", "/", "tr", '{"email":"pii@ornek.com"}', "new", "2000-01-01 00:00:00");
    L.run("L2", "/", "tr", "{}", "new", new Date().toISOString().replace("T", " ").slice(0, 19));
    L.run("L3", "/", "tr", "{}", "closed", new Date().toISOString().replace("T", " ").slice(0, 19));
    const C = c.raw.prepare("INSERT INTO contents (id,slug,locale,page_type,title,body_md,status) VALUES (?,?,?,?,?,?,?)");
    C.run("C1", "a", "tr", "article", "t", "b", "draft");
    C.run("C2", "b", "tr", "article", "t", "b", "published");
    c.raw.prepare("INSERT INTO partners (id,name,approved,contact_json) VALUES (?,?,?,?)").run("P1", "A", 0, '{"phone":"+90"}');
    c.raw.prepare("INSERT INTO analytics_daily (day,locale,ga4_json,gsc_json) VALUES (?,?,?,?)").run("2026-10-16", "all", '{"sessions":42}', '{"clicks":7,"impressions":900}');
    const r = await call(adminReq("/dashboard/summary", await jwt({ email: "view@example.com" })), c);
    expect(r.status).toBe(200);
    const body = await r.json();
    expect(body).toEqual({
      leads: { new: 2, contacted: 0, qualified: 0, closed: 1, last7d: 2 },
      contents: { draft: 1, approved: 0, published: 1 },
      partners: { pending: 1, approved: 0 },
      analytics: { day: "2026-10-16", sessions: 42, clicks: 7, impressions: 900 },
    });
    expect(JSON.stringify(body)).not.toMatch(/pii@|\+90/);
  });
  it("bozuk analytics JSON → null alanlar (500 değil)", async () => {
    const c = makeEnv(ACCESS);
    c.raw.prepare("INSERT INTO analytics_daily (day,locale,ga4_json,gsc_json) VALUES (?,?,?,?)").run("2026-10-16", "all", "{bozuk", null);
    const body = (await (await call(adminReq("/dashboard/summary", await jwt()), c)).json()) as { analytics: unknown };
    expect(body.analytics).toEqual({ day: "2026-10-16", sessions: null, clicks: null, impressions: null });
  });
});

// ---- API key çekirdeği ----
const api = (path: string, key?: string, init: RequestInit = {}) =>
  new Request("https://api.bdimexport.com" + path, {
    ...init,
    headers: { "cf-connecting-ip": "8.8.8.8", ...(key ? { authorization: `Bearer ${key}` } : {}), ...((init.headers as Record<string, string>) ?? {}) },
  });
function seedAdmin(c: Ctx, id = "ADMIN00000000000000000000A") {
  const key = "bdx_" + Buffer.from(crypto.getRandomValues(new Uint8Array(32))).toString("base64url");
  c.raw.prepare("INSERT INTO api_keys (id,name,key_hash,tier) VALUES (?,?,?,?)").run(id, "boot", createHash("sha256").update(key).digest("hex"), "admin-internal");
  return key;
}
const hashOf = (k: string) => createHash("sha256").update(k).digest("hex");
async function mint(c: Ctx, admin: string, body: object) {
  const r = await call(api("/api/v1/keys", admin, { method: "POST", body: JSON.stringify(body), headers: { "content-type": "application/json" } }), c);
  return (await r.json()) as { id: string; key: string };
}

describe("API key: cache + revoke + audit", () => {
  it("admin-internal key KV'ye HİÇ yazılmaz; enjekte edilmiş admin cache girdisine güvenilmez", async () => {
    const c = makeEnv();
    const admin = seedAdmin(c);
    expect((await call(api("/api/v1/keys", admin), c)).status).toBe(200);
    expect(await c.env.CACHE.get(`ak:${hashOf(admin)}`)).toBeNull();
    // saldırgan/eski cache: var olmayan admin key'i için sahte girdi → yine D1'e gider → 401
    const fake = "bdx_" + "Z".repeat(43);
    await c.env.CACHE.put(`ak:${hashOf(fake)}`, JSON.stringify({ id: "X", tier: "admin-internal", rate_limit: 999 }));
    expect((await call(api("/api/v1/keys", fake), c)).status).toBe(401);
  });
  it("admin key revoke → başka colo'da bile ANINDA 401 (cache yok)", async () => {
    const c = makeEnv();
    const a1 = seedAdmin(c, "ADMIN00000000000000000000A");
    // F-02: ikinci admin-internal key API'den üretilemez → bootstrap yoluyla (doğrudan D1) eklenir
    const a2 = seedAdmin(c, "ADMIN00000000000000000000B");
    expect((await call(api("/api/v1/keys", a2), c)).status).toBe(200);
    const id2 = "ADMIN00000000000000000000B";
    expect((await call(api(`/api/v1/keys/${id2}`, a1, { method: "DELETE" }), c)).status).toBe(200);
    expect((await call(api("/api/v1/keys", a2), c)).status).toBe(401);
  });
  it("read-only key: aynı colo'da revoke anında; BİLİNEN SINIR — bayat KV girdisi olan colo'da ≤ TTL geçer", async () => {
    const c = makeEnv();
    const admin = seedAdmin(c);
    const m = await mint(c, admin, { name: "ro", tier: "read-only" });
    await call(api("/api/v1/partners", m.key), c); // cache ısınır
    const stale = await c.env.CACHE.get(`ak:${hashOf(m.key)}`);
    expect(stale).not.toBeNull();
    await call(api(`/api/v1/keys/${m.id}`, admin, { method: "DELETE" }), c);
    expect((await call(api("/api/v1/partners", m.key), c)).status).toBe(401);
    await c.env.CACHE.put(`ak:${hashOf(m.key)}`, stale!); // başka colo'nun henüz silinmemiş kopyası
    expect((await call(api("/api/v1/partners", m.key), c)).status).toBe(200); // ≤ KEY_CACHE_TTL_S (60 sn) — dokümante
  });
  it("create + revoke audit: atomik, actor api_key:<id>, ham key/hash audit'te YOK; çift revoke → tek audit", async () => {
    const c = makeEnv();
    const admin = seedAdmin(c);
    const m = await mint(c, admin, { name: "audit-test" });
    await call(api(`/api/v1/keys/${m.id}`, admin, { method: "DELETE" }), c);
    const again = await call(api(`/api/v1/keys/${m.id}`, admin, { method: "DELETE" }), c);
    expect(again.status).toBe(200);
    const rows = c.raw.prepare("SELECT actor, action, entity_id, old_value, new_value FROM admin_actions ORDER BY rowid").all() as Record<string, string>[];
    expect(rows.map((r) => r.action)).toEqual(["create_key", "revoke_key"]);
    expect(rows.every((r) => r.actor === "api_key:ADMIN00000000000000000000A" && r.entity_id === m.id)).toBe(true);
    const dump = JSON.stringify(rows);
    expect(dump).not.toContain(m.key);
    expect(dump).not.toContain(hashOf(m.key));
  });
  it("F-02: admin-internal API'den ÜRETİLEMEZ (403 tier_not_mintable, kayıt/audit yok); read-only + partner üretilebilir", async () => {
    const c = makeEnv();
    const admin = seedAdmin(c);
    const r = await call(api("/api/v1/keys", admin, { method: "POST", body: JSON.stringify({ name: "x", tier: "admin-internal" }), headers: { "content-type": "application/json" } }), c);
    expect(r.status).toBe(403);
    expect(((await r.json()) as { error: { code: string } }).error.code).toBe("tier_not_mintable");
    expect(c.raw.prepare("SELECT count(*) n FROM api_keys").get()).toEqual({ n: 1 }); // yalnız bootstrap
    expect(c.raw.prepare("SELECT count(*) n FROM admin_actions").get()).toEqual({ n: 0 });
    for (const tier of ["read-only", "partner"]) {
      const ok = await call(api("/api/v1/keys", admin, { method: "POST", body: JSON.stringify({ name: tier, tier }), headers: { "content-type": "application/json" } }), c);
      expect(ok.status, tier).toBe(201);
    }
    const bad = await call(api("/api/v1/keys", admin, { method: "POST", body: JSON.stringify({ name: "y", tier: "superuser" }), headers: { "content-type": "application/json" } }), c);
    expect(bad.status).toBe(400);
  });
  it("audit yazılamazsa key de OLUŞMAZ (atomik batch)", async () => {
    const c = makeEnv();
    const admin = seedAdmin(c);
    c.raw.exec("CREATE TRIGGER t_fail BEFORE INSERT ON admin_actions BEGIN SELECT RAISE(ABORT,'audit down'); END;");
    const r = await call(api("/api/v1/keys", admin, { method: "POST", body: JSON.stringify({ name: "x" }), headers: { "content-type": "application/json" } }), c);
    expect(r.status).toBe(500);
    expect(c.raw.prepare("SELECT count(*) n FROM api_keys").get()).toEqual({ n: 1 }); // yalnız bootstrap
  });
});

describe("key yaşam döngüsü e2e", () => {
  it("üret → geçerli 200 → limit 429 → revoke → 401; geçersiz 401; CORS dışı 403", async () => {
    const c = makeEnv();
    const admin = seedAdmin(c);
    const m = await mint(c, admin, { name: "n8n", tier: "read-only", rate_limit: 3 });
    expect(m.key).toMatch(/^bdx_[A-Za-z0-9_-]{43}$/);
    const list = JSON.stringify(await (await call(api("/api/v1/keys", admin), c)).json());
    expect(list).not.toContain(m.key); // tek-sefer gösterim: listede ham key yok
    for (let i = 0; i < 3; i++) expect((await call(api("/api/v1/partners", m.key), c)).status).toBe(200);
    expect((await call(api("/api/v1/partners", m.key), c)).status).toBe(429);
    await call(api(`/api/v1/keys/${m.id}`, admin, { method: "DELETE" }), c);
    expect((await call(api("/api/v1/partners", m.key), c)).status).toBe(401);
    expect((await call(api("/api/v1/partners", "bdx_" + "q".repeat(43)), c)).status).toBe(401);
    const cors = await call(api("/api/v1/partners", admin, { headers: { origin: "https://evil.example" } }), c);
    expect(cors.status).toBe(403);
    expect(cors.headers.get("access-control-allow-origin")).toBeNull();
    const ok = await call(api("/api/v1/contents", undefined, { headers: { origin: "https://bdimexport.com" } }), c);
    expect(ok.headers.get("access-control-allow-origin")).toBe("https://bdimexport.com");
  });
});
