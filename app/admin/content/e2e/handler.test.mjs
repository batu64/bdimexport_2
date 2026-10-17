// FAZ_3 3.6 — İçerik Fabrikası handler (sunucu) güvenlik + akış testleri.
// Çalıştır: node --experimental-strip-types --test app/admin/content/e2e/handler.test.mjs
import test from "node:test";
import assert from "node:assert/strict";
import { DatabaseSync } from "node:sqlite";
import { readFileSync } from "node:fs";
import { handleContent } from "../handler.ts";
import { createContentService } from "../service.ts";
import { _resetJwksCache } from "../../middleware.ts";

const TEAM = "t.cloudflareaccess.com", AUD = "a".repeat(64);
const NOW = Date.parse("2026-10-10T12:00:00Z");
const kp = await crypto.subtle.generateKey({ name: "RSASSA-PKCS1-v1_5", modulusLength: 2048, publicExponent: new Uint8Array([1, 0, 1]), hash: "SHA-256" }, true, ["sign", "verify"]);
const jwk = { ...(await crypto.subtle.exportKey("jwk", kp.publicKey)), kid: "k1", alg: "RS256", use: "sig" };
const b64 = (o) => Buffer.from(JSON.stringify(o)).toString("base64url");
async function jwt(email) {
  const h = b64({ alg: "RS256", kid: "k1" }), p = b64({ iss: `https://${TEAM}`, aud: [AUD], exp: Math.floor(NOW / 1000) + 600, email, sub: "u" });
  return `${h}.${p}.${Buffer.from(await crypto.subtle.sign("RSASSA-PKCS1-v1_5", kp.privateKey, new TextEncoder().encode(`${h}.${p}`))).toString("base64url")}`;
}
const opts = { now: NOW, fetcher: async () => ({ keys: [jwk] }) };

function makeEnv(extra = {}) {
  const raw = new DatabaseSync(":memory:");
  for (const f of ["0001_init.sql", "0002_admin_audit_integrity.sql"]) raw.exec(readFileSync(new URL(`../../../../db/migrations/${f}`, import.meta.url), "utf8"));
  const stmt = (sql, args = []) => ({ bind: (...a) => stmt(sql, a), first: async () => raw.prepare(sql).get(...args) ?? null, all: async () => ({ results: raw.prepare(sql).all(...args) }), _run: () => ({ meta: { changes: Number(raw.prepare(sql).run(...args).changes) } }) });
  const DB = { prepare: (s) => stmt(s), batch: async (sts) => { raw.exec("BEGIN"); try { const o = sts.map((s) => s._run()); raw.exec("COMMIT"); return o; } catch (e) { raw.exec("ROLLBACK"); throw e; } } };
  return { raw, DB, env: { ACCESS_TEAM_DOMAIN: TEAM, ACCESS_AUD: AUD, ADMIN_EMAILS: "boss@example.com", VIEWER_EMAILS: "view@example.com", DB, ...extra } };
}
async function call(env, path, { email = "boss@example.com", method = "GET", body, ct = "application/json" } = {}) {
  _resetJwksCache();
  const headers = { "cf-access-jwt-assertion": await jwt(email) };
  if (body !== undefined) headers["content-type"] = ct;
  const r = await handleContent(new Request(`https://bdimexport.pages.dev/admin/api/content${path}`, { method, headers, body: body === undefined ? undefined : JSON.stringify(body) }), env, opts, () => NOW);
  return { status: r.status, body: await r.json() };
}
const actions = (raw) => raw.prepare("SELECT action FROM admin_actions ORDER BY rowid").all().map((r) => r.action);

test("yetki: token yok 401; viewer okuma + yazma 403", async () => {
  const { env } = makeEnv();
  _resetJwksCache();
  assert.equal((await handleContent(new Request("https://x/admin/api/content/jobs"), env, opts)).status, 401);
  assert.equal((await call(env, "/jobs", { email: "view@example.com" })).body.error, "admin_only");
  assert.equal((await call(env, "/jobs", { email: "view@example.com", method: "POST", body: { input: "C", phrase: "abc", locales: ["tr"] } })).status, 403);
});

test("E2E (mock üretim): keyword → ai_jobs (model NULL) → mock → draft → ONAY = approved (yayın DEĞİL) → ayrı YAYIN → published; her adım audit", async () => {
  const { env, raw } = makeEnv({ CONTENT_MOCK_PRODUCE: "1" });
  const j = await call(env, "/jobs", { method: "POST", body: { input: "C", phrase: "turkish hazelnut exporter to germany", intent: "commercial", volume: 300, locales: ["en", "de"] } });
  assert.equal(j.status, 201);
  const job = raw.prepare("SELECT status, model FROM ai_jobs WHERE id=?").get(j.body.job_id);
  assert.deepEqual({ ...job }, { status: "pending", model: null }); // model alanı FAZ 4'te (Gemini) dolar
  const mp = await call(env, `/jobs/${j.body.job_id}/mock-produce`, { method: "POST", body: {} });
  assert.equal(mp.body.content_ids.length, 2);
  assert.equal(raw.prepare("SELECT model FROM ai_jobs WHERE id=?").get(j.body.job_id).model, "mock");
  const drafts = (await call(env, "/drafts?status=draft")).body;
  assert.equal(drafts.length, 2);
  const ids = drafts.map((d) => d.id);

  const ap = await call(env, "/drafts/approve", { method: "POST", body: { ids } });
  assert.deepEqual(ap.body.changed.sort(), [...ids].sort());
  assert.equal((await call(env, "/drafts?status=approved")).body.length, 2);
  assert.equal((await call(env, "/drafts?status=published")).body.length, 0); // ONAY YAYINLAMAZ
  assert.ok(raw.prepare("SELECT published_at FROM contents").all().every((r) => r.published_at === null));
  // onaylı içerik tekrar onaylanmaz / taslak doğrudan yayınlanmaz
  assert.equal((await call(env, "/drafts/approve", { method: "POST", body: { ids } })).body.changed.length, 0);

  const pb = await call(env, "/drafts/publish", { method: "POST", body: { ids: [ids[0]] } });
  assert.deepEqual(pb.body.changed, [ids[0]]);
  assert.equal((await call(env, "/drafts?status=published")).body.length, 1);
  assert.deepEqual(actions(raw), ["create_ai_job", "mock_produce", "approve_content", "approve_content", "publish_content"]);
});

test("taslak doğrudan yayınlanamaz (draft → publish atlanır)", async () => {
  const { env } = makeEnv({ CONTENT_MOCK_PRODUCE: "1" });
  const j = await call(env, "/jobs", { method: "POST", body: { input: "A", text: "ham metin", locales: ["tr"] } });
  await call(env, `/jobs/${j.body.job_id}/mock-produce`, { method: "POST", body: {} });
  const [d] = (await call(env, "/drafts")).body;
  const r = await call(env, "/drafts/publish", { method: "POST", body: { ids: [d.id] } });
  assert.deepEqual([r.body.changed, r.body.skipped], [[], [{ id: d.id, reason: "status_is_draft" }]]);
});

test("mock üretim VARSAYILAN KAPALI (prod): 404 mock_disabled, job pending kalır", async () => {
  const { env, raw } = makeEnv();
  const j = await call(env, "/jobs", { method: "POST", body: { input: "C", phrase: "abc def", locales: ["tr"] } });
  const r = await call(env, `/jobs/${j.body.job_id}/mock-produce`, { method: "POST", body: {} });
  assert.deepEqual([r.status, r.body.error], [404, "mock_disabled"]);
  assert.equal(raw.prepare("SELECT status FROM ai_jobs").get().status, "pending");
});

test("YARIŞ: okuma ile yazma arasında başka admin onayladı → 'stale' atlanır, ikinci audit YOK", async () => {
  const { raw, DB } = makeEnv();
  raw.prepare("INSERT INTO contents (id,slug,locale,page_type,title,body_md,status) VALUES ('C1','s','tr','article','t','b','draft')").run();
  let flipped = false;
  const racy = { ...DB, prepare: (sql) => {
    const s = DB.prepare(sql);
    if (!flipped && sql.startsWith("SELECT * FROM contents WHERE id IN")) {
      return { ...s, bind: (...a) => { const b = s.bind(...a); return { ...b, all: async () => { const r = await b.all(); flipped = true; raw.exec("UPDATE contents SET status='approved'"); return r; } }; } };
    }
    return s;
  } };
  const r = await createContentService(racy, "b@example.com", () => NOW).approve(["C1"]);
  assert.deepEqual([r.changed, r.skipped], [[], [{ id: "C1", reason: "stale" }]]);
  assert.equal(actions(raw).length, 0);
});

test("TTL: kalan saat + <24s uyarı + süresi dolan listelenmez (tek saat kaynağı)", async () => {
  const { env, raw } = makeEnv();
  const iso = (h) => new Date(NOW + h * 3_600_000).toISOString().slice(0, 19).replace("T", " ");
  const ins = raw.prepare("INSERT INTO rss_news (id, source, title, url, expires_at) VALUES (?,?,?,?,?)");
  ins.run("n1", "TİM", "kısa", "https://a", iso(23.9)); ins.run("n2", "TİM", "sınır", "https://b", iso(24)); ins.run("n3", "TİM", "bitti", "https://c", iso(-0.1));
  const news = (await call(env, "/news")).body;
  assert.deepEqual(news.map((n) => [n.id, n.hours_left, n.ttl_warning]), [["n1", 23, true], ["n2", 24, false]]);
});

test("CSRF/doğrulama: JSON olmayan 415; PATCH status/model alanı 400; bad status 400; bilinmeyen yol 404", async () => {
  const { env, raw } = makeEnv();
  raw.prepare("INSERT INTO contents (id,slug,locale,page_type,title,body_md,status) VALUES ('C1','s','tr','article','t','b','draft')").run();
  assert.equal((await call(env, "/jobs", { method: "POST", body: { input: "C", phrase: "abc", locales: ["tr"] }, ct: "text/plain" })).status, 415);
  assert.equal((await call(env, "/drafts/C1", { method: "PATCH", body: { status: "published" } })).body.error, "field_read_only");
  assert.equal((await call(env, "/drafts/C1", { method: "PATCH", body: { title: "yeni", model: "x" } })).body.error, "field_read_only");
  assert.equal(raw.prepare("SELECT status FROM contents").get().status, "draft");
  assert.equal((await call(env, "/drafts?status=deleted")).status, 400);
  assert.equal((await call(env, "/yok")).status, 404);
  assert.equal((await call(env, "/jobs", { method: "POST", body: { input: "A", locales: ["tr"] } })).status, 400); // text yok
  assert.equal(actions(raw).length, 0);
});
