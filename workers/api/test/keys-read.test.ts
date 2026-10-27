import { describe, it, expect } from "vitest";
import { createHash } from "node:crypto";
import worker from "../src/index";
import { makeEnv } from "./helpers";

type E = ReturnType<typeof makeEnv>["env"];
const req = (path: string, init: RequestInit & { headers?: Record<string, string> } = {}) =>
  new Request("https://api.bdimexport.com" + path, { ...init, headers: { "cf-connecting-ip": "5.5.5.5", ...(init.headers ?? {}) } });
const auth = (k: string) => ({ authorization: `Bearer ${k}` });
const call = (r: Request, e: E) => worker.fetch(r, e);

async function bootstrapAdmin(env: E, raw: ReturnType<typeof makeEnv>["raw"]) {
  const key = "bdx_" + Buffer.from(crypto.getRandomValues(new Uint8Array(32))).toString("base64url");
  const hash = createHash("sha256").update(key).digest("hex");
  raw.prepare("INSERT INTO api_keys (id,name,key_hash,tier) VALUES (?,?,?,?)").run("ADMIN00000000000000000000A", "boot", hash, "admin-internal");
  return key;
}
async function mint(env: E, adminKey: string, body: object) {
  const r = await call(req("/api/v1/keys", { method: "POST", body: JSON.stringify(body), headers: { ...auth(adminKey), "content-type": "application/json" } }), env);
  return { status: r.status, body: (await r.json()) as Record<string, unknown> };
}

describe("API key yaşam döngüsü", () => {
  it("anahtarsız / geçersiz / biçimsiz → 401", async () => {
    const { env } = makeEnv();
    expect((await call(req("/api/v1/partners"), env)).status).toBe(401);
    expect((await call(req("/api/v1/partners", { headers: auth("bdx_" + "A".repeat(43)) }), env)).status).toBe(401);
    expect((await call(req("/api/v1/partners", { headers: auth("junk") }), env)).status).toBe(401);
  });

  it("mint → ham key yalnız bir kez; D1'de yalnız hash; valid key 200", async () => {
    const { env, raw } = makeEnv();
    const admin = await bootstrapAdmin(env, raw);
    const m = await mint(env, admin, { name: "n8n", tier: "read-only" });
    expect(m.status).toBe(201);
    const key = m.body.key as string;
    expect(key).toMatch(/^bdx_/);
    const stored = JSON.stringify(raw.prepare("SELECT * FROM api_keys").all());
    expect(stored).not.toContain(key);
    expect(stored).toContain(createHash("sha256").update(key).digest("hex"));
    expect((await call(req("/api/v1/partners", { headers: auth(key) }), env)).status).toBe(200);
    // liste yanıtında ham key / hash yok
    const list = await (await call(req("/api/v1/keys", { headers: auth(admin) }), env)).text();
    expect(list).not.toContain(key);
    expect(list).not.toContain("key_hash");
  });

  it("revoke anında geçer — cache'lenmiş key bile 401", async () => {
    const { env, raw } = makeEnv();
    const admin = await bootstrapAdmin(env, raw);
    const m = await mint(env, admin, { name: "x" });
    const key = m.body.key as string;
    expect((await call(req("/api/v1/partners", { headers: auth(key) }), env)).status).toBe(200); // cache'i ısıt
    const rv = await call(req(`/api/v1/keys/${m.body.id}`, { method: "DELETE", headers: auth(admin) }), env);
    expect(rv.status).toBe(200);
    expect((await call(req("/api/v1/partners", { headers: auth(key) }), env)).status).toBe(401);
    const acts = raw.prepare("SELECT action FROM admin_actions ORDER BY rowid").all();
    expect(acts).toEqual([{ action: "create_key" }, { action: "revoke_key" }]);
  });

  it("cache: ikinci istek D1'e gitmez", async () => {
    const { env, raw } = makeEnv();
    const admin = await bootstrapAdmin(env, raw);
    const key = (await mint(env, admin, { name: "c" })).body.key as string;
    await call(req("/api/v1/partners", { headers: auth(key) }), env);
    let lookups = 0;
    const orig = env.DB.prepare.bind(env.DB);
    env.DB.prepare = ((s: string) => { if (s.includes("FROM api_keys WHERE key_hash")) lookups++; return orig(s); }) as never;
    await call(req("/api/v1/partners", { headers: auth(key) }), env);
    expect(lookups).toBe(0);
  });

  it("scope: read-only key /leads, /keys → 403; key üretemez", async () => {
    const { env, raw } = makeEnv();
    const admin = await bootstrapAdmin(env, raw);
    const key = (await mint(env, admin, { name: "ro" })).body.key as string;
    expect((await call(req("/api/v1/leads", { headers: auth(key) }), env)).status).toBe(403);
    expect((await call(req("/api/v1/keys", { method: "POST", body: "{}", headers: auth(key) }), env)).status).toBe(403);
    expect((await call(req("/api/v1/leads", { headers: auth(admin) }), env)).status).toBe(200);
  });

  it("key bazlı rate limit: limit üstü → 429", async () => {
    const { env, raw } = makeEnv();
    const admin = await bootstrapAdmin(env, raw);
    const key = (await mint(env, admin, { name: "lim", rate_limit: 3 })).body.key as string;
    const codes: number[] = [];
    for (let i = 0; i < 5; i++) codes.push((await call(req("/api/v1/partners", { headers: auth(key) }), env)).status);
    expect(codes).toEqual([200, 200, 200, 429, 429]);
  });

  it("geçersiz key brute-force freni → 429", async () => {
    const { env } = makeEnv({ RL_BAD_AUTH_PER_MIN: "3" });
    const codes: number[] = [];
    for (let i = 0; i < 5; i++) codes.push((await call(req("/api/v1/partners", { headers: auth("bdx_" + "B".repeat(43)) }), env)).status);
    expect(codes).toEqual([401, 401, 401, 429, 429]);
  });

  it("CORS: izinsiz origin key geçerli olsa bile red", async () => {
    const { env, raw } = makeEnv();
    const admin = await bootstrapAdmin(env, raw);
    const r = await call(req("/api/v1/keys", { headers: { ...auth(admin), origin: "https://evil.example" } }), env);
    expect(r.status).toBe(403);
  });
});

describe("read endpoint'leri", () => {
  it("GET /contents anahtarsız: YALNIZ published (draft + approved HARİÇ); admin status=draft görebilir", async () => {
    const { env, raw } = makeEnv();
    const ins = raw.prepare("INSERT INTO contents (id,slug,locale,page_type,title,body_md,status) VALUES (?,?,?,?,?,?,?)");
    ins.run("01A", "a", "tr", "article", "A", "x", "draft");
    ins.run("01B", "b", "tr", "article", "B", "x", "published");
    ins.run("01C", "c", "tr", "article", "C", "x", "approved");
    const pub = (await (await call(req("/api/v1/contents"), env)).json()) as { data: { id: string }[] };
    expect(pub.data.map((d) => d.id)).toEqual(["01B"]); // FAZ_4 4.6: approved ≠ published — onaylı ama yayınlanmamış (01C) public'te YOK
    const admin = await bootstrapAdmin(env, raw);
    const drafts = (await (await call(req("/api/v1/contents?status=draft", { headers: auth(admin) }), env)).json()) as { data: { id: string }[] };
    expect(drafts.data.map((d) => d.id)).toEqual(["01A"]);
    // status paramı anahtarsız yok sayılır
    const sneaky = (await (await call(req("/api/v1/contents?status=draft"), env)).json()) as { data: { id: string }[] };
    expect(sneaky.data.map((d) => d.id)).toEqual(["01B"]);
  });

  it("GET /contents anahtarsız IP rate limit → 429", async () => {
    const { env } = makeEnv({ RL_PUBLIC_READ_PER_MIN: "2" });
    const c: number[] = [];
    for (let i = 0; i < 4; i++) c.push((await call(req("/api/v1/contents"), env)).status);
    expect(c).toEqual([200, 200, 429, 429]);
  });

  it("GET /partners read-only: yalnız onaylı, PII yok, rızasız logo gizli; admin hepsini görür", async () => {
    const { env, raw } = makeEnv();
    const ins = raw.prepare("INSERT INTO partners (id,name,logo_r2_key,consent_logo_en,approved,contact_json,tax_id) VALUES (?,?,?,?,?,?,?)");
    ins.run("P1", "Onaylı+rıza", "k1", 1, 1, '{"email":"a@b.c"}', "1111111111");
    ins.run("P2", "Onaylı-rızasız", "k2", 0, 1, '{"email":"d@e.f"}', "2222222222");
    ins.run("P3", "Bekleyen", null, 0, 0, null, "3333333333");
    const admin = await bootstrapAdmin(env, raw);
    const ro = (await mint(env, admin, { name: "ro" })).body.key as string;
    const r = await call(req("/api/v1/partners", { headers: auth(ro) }), env);
    const txt = await r.text();
    const data = (JSON.parse(txt) as { data: Record<string, unknown>[] }).data;
    expect(data.map((d) => d.id)).toEqual(["P1", "P2"]);
    expect(data[0].logo_r2_key).toBe("k1");
    expect(data[1].logo_r2_key).toBeNull();
    for (const leak of ["contact_json", "tax_id", "a@b.c", "1111111111"]) expect(txt).not.toContain(leak);
    const all = (await (await call(req("/api/v1/partners", { headers: auth(admin) }), env)).json()) as { data: unknown[] };
    expect(all.data).toHaveLength(3);
  });

  it("sayfalama: limit>100 → 400; cursor çalışır", async () => {
    const { env, raw } = makeEnv();
    const admin = await bootstrapAdmin(env, raw);
    for (const i of ["L1", "L2", "L3"]) raw.prepare("INSERT INTO leads (id,source_page,locale,payload_json) VALUES (?,?,?,?)").run(i, "/", "tr", "{}");
    expect((await call(req("/api/v1/leads?limit=101", { headers: auth(admin) }), env)).status).toBe(400);
    const p1 = (await (await call(req("/api/v1/leads?limit=2", { headers: auth(admin) }), env)).json()) as { data: { id: string }[]; next_cursor: string };
    expect(p1.next_cursor).toBe("L2");
    const p2 = (await (await call(req("/api/v1/leads?limit=2&cursor=L2", { headers: auth(admin) }), env)).json()) as { data: { id: string }[] };
    expect(p2.data.map((d) => d.id)).toEqual(["L3"]);
  });

  it("SQL injection denemesi parametre ile etkisiz", async () => {
    const { env, raw } = makeEnv();
    const admin = await bootstrapAdmin(env, raw);
    const r = await call(req("/api/v1/leads?status=new'%20OR%201=1--", { headers: auth(admin) }), env);
    expect(r.status).toBe(400);
  });
});
