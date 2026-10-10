// FAZ_3 3.1 e2e — çalıştır: node --experimental-strip-types --test app/admin/e2e/access.test.mjs
// Gerçek RS256 imzalı JWT üretir, sahte JWKS ile guard'ı uçtan uca sınar (ağ yok).
import test from "node:test";
import assert from "node:assert/strict";
import { guardAdminRequest, _resetJwksCache } from "../middleware.ts";
import { withAudit, writeAudit, redact } from "../audit.ts";

const TEAM = "bdimexport.cloudflareaccess.com";
const AUD = "test-aud-tag";
const env = { ACCESS_TEAM_DOMAIN: TEAM, ACCESS_AUD: AUD, ADMIN_EMAILS: "Boss@Example.com", VIEWER_EMAILS: "view@example.com" };
const NOW = 1_800_000_000_000;

const b64u = (b) => Buffer.from(b).toString("base64url");
const mk = async () => {
  const kp = await crypto.subtle.generateKey(
    { name: "RSASSA-PKCS1-v1_5", modulusLength: 2048, publicExponent: new Uint8Array([1, 0, 1]), hash: "SHA-256" }, true, ["sign", "verify"]);
  const jwk = { ...(await crypto.subtle.exportKey("jwk", kp.publicKey)), kid: "k1" };
  return { kp, jwk };
};
const sign = async (kp, claims, header = { alg: "RS256", kid: "k1" }) => {
  const h = b64u(JSON.stringify(header)), p = b64u(JSON.stringify(claims));
  const s = await crypto.subtle.sign("RSASSA-PKCS1-v1_5", kp.privateKey, new TextEncoder().encode(`${h}.${p}`));
  return `${h}.${p}.${b64u(new Uint8Array(s))}`;
};
const good = (o = {}) => ({ iss: `https://${TEAM}`, aud: [AUD], exp: NOW / 1000 + 600, iat: NOW / 1000, email: "boss@example.com", sub: "u1", ...o });
const req = (tok, method = "GET") => new Request("https://bdimexport.com/admin", { method, headers: tok ? { "cf-access-jwt-assertion": tok } : {} });

let K, other;
test.before(async () => { K = await mk(); other = await mk(); });
test.beforeEach(() => _resetJwksCache());
const run = (tok, method, e = env) => guardAdminRequest(req(tok, method), e, { now: NOW, fetcher: async () => ({ keys: [K.jwk] }) });

test("Access'siz istek → 401", async () => {
  const r = await run(null);
  assert.equal(r.ok, false); assert.equal(r.response.status, 401);
});
test("geçerli JWT + allowlist → ok (admin, e-posta küçük harf)", async () => {
  const r = await run(await sign(K.kp, good()));
  assert.equal(r.ok, true); assert.equal(r.identity.role, "admin"); assert.equal(r.identity.email, "boss@example.com");
});
test("imzasız / çöp token → 403", async () => {
  for (const t of ["abc", "a.b.c", `${b64u('{"alg":"none"}')}.${b64u("{}")}.x`]) {
    const r = await run(t); assert.equal(r.ok, false); assert.equal(r.response.status, 403);
  }
});
test("alg:none ve HS256 → 403 (alg confusion)", async () => {
  for (const alg of ["none", "HS256"]) {
    const r = await run(await sign(K.kp, good(), { alg, kid: "k1" })); assert.equal(r.response.status, 403);
  }
});
test("yanlış anahtarla imzalı → 403 bad_signature", async () => {
  const r = await run(await sign(other.kp, good()));
  assert.equal(r.response.status, 403); assert.equal((await r.response.json()).code, "bad_signature");
});
test("payload kurcalanmış → 403", async () => {
  const t = (await sign(K.kp, good())).split(".");
  t[1] = b64u(JSON.stringify(good({ email: "evil@x.com" })));
  const r = await run(t.join(".")); assert.equal(r.response.status, 403);
});
test("expire JWT → 403 expired", async () => {
  const r = await run(await sign(K.kp, good({ exp: NOW / 1000 - 3600 })));
  assert.equal(r.response.status, 403); assert.equal((await r.response.json()).code, "expired");
});
test("yanlış aud / iss → 403", async () => {
  assert.equal((await run(await sign(K.kp, good({ aud: ["x"] })))).response.status, 403);
  assert.equal((await run(await sign(K.kp, good({ iss: "https://evil.com" })))).response.status, 403);
});
test("allowlist dışı e-posta → 403 not_allowlisted", async () => {
  const r = await run(await sign(K.kp, good({ email: "rando@x.com" })));
  assert.equal((await r.response.json()).code, "not_allowlisted");
});
test("viewer: GET ok, POST 403", async () => {
  const t = await sign(K.kp, good({ email: "view@example.com" }));
  assert.equal((await run(t, "GET")).ok, true);
  assert.equal((await run(t, "POST")).response.status, 403);
});
test("fail-closed: yapılandırma eksik / JWKS erişilemez → 403", async () => {
  const t = await sign(K.kp, good());
  assert.equal((await run(t, "GET", { ...env, ACCESS_AUD: "" })).response.status, 403);
  _resetJwksCache();
  const r = await guardAdminRequest(req(t), env, { now: NOW, fetcher: async () => { throw new Error("net"); } });
  assert.equal(r.ok, false); assert.equal(r.response.status, 403);
});

// --- audit ---
const fakeDb = () => {
  const log = { batches: [] };
  return { log, prepare: (sql) => ({ sql, vals: [], bind(...v) { this.vals = v; return this; } }), batch: async (s) => { log.batches.push(s); return []; } };
};
test("withAudit: mutasyon + audit aynı batch'te, audit son", async () => {
  const db = fakeDb();
  const m = db.prepare("UPDATE partners SET approved=1 WHERE id=?").bind("p1");
  await withAudit(db, [m], { actor: "boss@example.com", action: "approve_partner", entity_type: "partner", entity_id: "p1", old_value: { approved: 0 }, new_value: { approved: 1, api_key: "zzz" } });
  const [b] = db.log.batches; assert.equal(b.length, 2);
  assert.match(b[1].sql, /INSERT INTO admin_actions/);
  assert.equal(b[1].vals[1], "boss@example.com");
  assert.equal(b[1].vals[0].length, 26);
  assert.ok(b[1].vals[6].includes("[REDACTED]") && !b[1].vals[6].includes("zzz"));
});
test("audit girdisi eksikse mutasyon hiç çalışmaz", async () => {
  const db = fakeDb();
  await assert.rejects(withAudit(db, [db.prepare("DELETE FROM leads")], { actor: "", action: "x", entity_type: "lead", entity_id: "1" }));
  assert.equal(db.log.batches.length, 0);
});
test("writeAudit + redact", async () => {
  const db = fakeDb(); await writeAudit(db, { actor: "system", action: "a", entity_type: "t", entity_id: "1" });
  assert.equal(db.log.batches.length, 1);
  assert.deepEqual(redact({ a: { password: "p", b: 1 } }), { a: { password: "[REDACTED]", b: 1 } });
});
