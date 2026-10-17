// FAZ_3 3.5 — Partner CRUD + logo onay güvenlik testleri.
// Çalıştır: node --experimental-strip-types --test app/admin/partners/partners.test.mjs
import test from "node:test";
import assert from "node:assert/strict";
import { DatabaseSync } from "node:sqlite";
import { readFileSync } from "node:fs";
import { handlePartners } from "./handler.ts";
import { toPublicPartner, PARTNER_COLS } from "./lib.ts";
import { _resetJwksCache } from "../middleware.ts";

const TEAM = "t.cloudflareaccess.com", AUD = "a".repeat(64), NOW = 1_800_000_000;
const ENV0 = { ACCESS_TEAM_DOMAIN: TEAM, ACCESS_AUD: AUD, ADMIN_EMAILS: "boss@example.com", VIEWER_EMAILS: "view@example.com" };
const kp = await crypto.subtle.generateKey({ name: "RSASSA-PKCS1-v1_5", modulusLength: 2048, publicExponent: new Uint8Array([1, 0, 1]), hash: "SHA-256" }, true, ["sign", "verify"]);
const jwk = { ...(await crypto.subtle.exportKey("jwk", kp.publicKey)), kid: "k1", alg: "RS256", use: "sig" };
const b64 = (o) => Buffer.from(JSON.stringify(o)).toString("base64url");
async function jwt(email) {
  const h = b64({ alg: "RS256", kid: "k1" }), p = b64({ iss: `https://${TEAM}`, aud: [AUD], exp: NOW + 600, email, sub: "u" });
  return `${h}.${p}.${Buffer.from(await crypto.subtle.sign("RSASSA-PKCS1-v1_5", kp.privateKey, new TextEncoder().encode(`${h}.${p}`))).toString("base64url")}`;
}
const opts = { now: NOW * 1000, fetcher: async () => ({ keys: [jwk] }) };

// FAZ 1 başvuru endpoint'inin (workers/api/src/apply.ts) yazdığı satırla aynı kolonlar
const APPLY_SQL = `INSERT INTO partners (id, name, sector, certs_json, capacity, catalog_r2_key, consent_logo_en, approved,
  contact_json, tax_id, export_history, kvkk_consent_version, kvkk_consent_at) VALUES (?,?,?,?,?,?,?,0,?,?,?,?,?)`;
function makeEnv() {
  const raw = new DatabaseSync(":memory:");
  for (const f of ["0001_init.sql", "0002_admin_audit_integrity.sql", "0002_partners_apply.sql"]) raw.exec(readFileSync(new URL(`../../../db/migrations/${f}`, import.meta.url), "utf8"));
  const stmt = (sql, args = []) => ({ bind: (...a) => stmt(sql, a), first: async () => raw.prepare(sql).get(...args) ?? null, all: async () => ({ results: raw.prepare(sql).all(...args) }), _run: () => ({ meta: { changes: Number(raw.prepare(sql).run(...args).changes) } }) });
  const DB = { prepare: (s) => stmt(s), batch: async (sts) => { raw.exec("BEGIN"); try { const o = sts.map((s) => s._run()); raw.exec("COMMIT"); return o; } catch (e) { raw.exec("ROLLBACK"); throw e; } } };
  const r2 = new Map();
  const MEDIA = { put: async (k, v, o) => { r2.set(k, { bytes: v.byteLength, ct: o?.httpMetadata?.contentType }); }, delete: async (k) => { r2.delete(k); } };
  const apply = (id, { logo = 0, kvkk = "v1 (47ac2ef0a5b43264)", tax = "1234567890" } = {}) =>
    raw.prepare(APPLY_SQL).run(id, `Firma ${id}`, "Tekstil", '["CE"]', "5000/ay", null, logo,
      '{"name":"Ayşe Örnek","email":"ayse@ornek.example","phone":"+905550000001"}', tax, "DE 2024", kvkk, kvkk ? "2026-10-12T10:00:00Z" : null);
  return { raw, r2, apply, env: { ...ENV0, DB, MEDIA } };
}
async function call(env, path, { email = "boss@example.com", method = "GET", body, headers = {} } = {}) {
  _resetJwksCache();
  const h = { "cf-access-jwt-assertion": await jwt(email), ...headers };
  let b;
  if (body instanceof FormData) b = body;
  else if (body !== undefined) { b = JSON.stringify(body); h["content-type"] ??= "application/json"; }
  const r = await handlePartners(new Request(`https://bdimexport.pages.dev/admin/api/partners${path}`, { method, headers: h, body: b }), env, opts);
  return { status: r.status, body: await r.json() };
}
const audits = (raw) => raw.prepare("SELECT action, actor, entity_id, old_value, new_value FROM admin_actions ORDER BY rowid").all();
const pub = (raw, id) => toPublicPartner({ ...raw.prepare(`SELECT ${PARTNER_COLS} FROM partners WHERE id=?`).get(id) }, "https://media.bdimexport.com");
const PNG = (n = 64) => { const b = new Uint8Array(n); b.set([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]); return b; };
const logoForm = (bytes, type) => { const fd = new FormData(); fd.set("logo", new File([bytes], "l", { type })); return fd; };

test("yetki: token yok 401; viewer TÜM uçlarda 403 admin_only", async () => {
  const { env, apply } = makeEnv(); apply("P1");
  _resetJwksCache();
  assert.equal((await handlePartners(new Request("https://x/admin/api/partners"), env, opts)).status, 401);
  for (const [p, m, b] of [["", "GET"], ["/P1", "GET"], ["/P1/approve", "POST", {}], ["/P1", "PATCH", { sector: "x" }]]) {
    const r = await call(env, p, { email: "view@example.com", method: m, body: b });
    assert.equal(r.status, 403, `${m} ${p}`); // GET: handler admin_only · mutasyon: 3.1 guard viewer_read_only
    assert.ok(r.body.error === "admin_only" || r.body.code === "viewer_read_only", JSON.stringify(r.body));
  }
});

test("bekleyen liste: başvuru görünür; iletişim + vergi no MASKELİ; consent_logo_en salt-okunur alan olarak döner", async () => {
  const { env, apply } = makeEnv(); apply("P1");
  const r = await call(env, "?status=pending");
  assert.equal(r.status, 200);
  const [p] = r.body.data;
  assert.deepEqual([p.id, p.status, p.consent_logo_en, p.tax_id], ["P1", "pending", false, "12••••••90"]);
  const dump = JSON.stringify(r.body);
  for (const pii of ["ayse@ornek.example", "+905550000001", "Ayşe Örnek", "1234567890"]) assert.ok(!dump.includes(pii), `sızıntı: ${pii}`);
});

test("ONAY: KVKK rızasız → 422; rızalı → approved=1 + audit + public görünümde; ikinci onay 409", async () => {
  const { env, raw, apply } = makeEnv(); apply("NOKVKK", { kvkk: null, tax: "1111111111" }); apply("P1");
  assert.deepEqual([(await call(env, "/NOKVKK/approve", { method: "POST", body: {} })).status, raw.prepare("SELECT approved a FROM partners WHERE id='NOKVKK'").get().a], [422, 0]);
  assert.equal(pub(raw, "P1"), null); // onaysız → public'te YOK
  const r = await call(env, "/P1/approve", { method: "POST", body: {} });
  assert.deepEqual([r.status, r.body.status], [200, "approved"]);
  assert.ok(raw.prepare("SELECT approved_at FROM partners WHERE id='P1'").get().approved_at);
  assert.deepEqual(pub(raw, "P1"), { id: "P1", name: "Firma P1", sector: "Tekstil", logoUrl: null, verified: true });
  assert.equal((await call(env, "/P1/approve", { method: "POST", body: {} })).status, 409);
  const a = audits(raw);
  assert.deepEqual(a.map((x) => [x.action, x.actor, x.entity_id]), [["approve_partner", "boss@example.com", "P1"]]);
});

test("RED: gerekçe şart; red → rejected sekmesinde, pending'den çıkar, public'te YOK; onaylıyı reddetmek 409", async () => {
  const { env, raw, apply } = makeEnv(); apply("P1"); apply("P2", { tax: "2222222222" });
  assert.equal((await call(env, "/P1/reject", { method: "POST", body: { reason: "x" } })).body.error, "reason_required");
  const r = await call(env, "/P1/reject", { method: "POST", body: { reason: "Kapasite doğrulanamadı" } });
  assert.deepEqual([r.status, r.body.status], [200, "rejected"]);
  assert.deepEqual((await call(env, "?status=pending")).body.data.map((p) => p.id), ["P2"]);
  assert.deepEqual((await call(env, "?status=rejected")).body.data.map((p) => p.id), ["P1"]);
  assert.equal(pub(raw, "P1"), null);
  assert.equal((await call(env, "/P1/approve", { method: "POST", body: {} })).body.error, "not_pending"); // reddedilen tekrar onaylanmaz (yeni başvuru)
  await call(env, "/P2/approve", { method: "POST", body: {} });
  assert.equal((await call(env, "/P2/reject", { method: "POST", body: { reason: "geç kalan red" } })).status, 409);
  assert.equal(JSON.parse(audits(raw).find((x) => x.action === "reject_partner").new_value).reason, "Kapasite doğrulanamadı");
});

test("ONAY GERİ ALMA: gerekçeli; approved 1→0, public'ten düşer, audit", async () => {
  const { env, raw, apply } = makeEnv(); apply("P1");
  await call(env, "/P1/approve", { method: "POST", body: {} });
  const r = await call(env, "/P1/unapprove", { method: "POST", body: { reason: "Partner talebi" } });
  assert.deepEqual([r.status, r.body.status], [200, "pending"]);
  assert.equal(pub(raw, "P1"), null);
  assert.deepEqual(audits(raw).map((x) => x.action), ["approve_partner", "unapprove_partner"]);
});

test("consent_logo_en ADMIN DEĞİŞTİREMEZ: PATCH 400 consent_read_only, DB + audit değişmez; diğer korumalı alanlar da red", async () => {
  const { env, raw, apply } = makeEnv(); apply("P1", { logo: 0 });
  for (const v of [1, true, "1"]) {
    const r = await call(env, "/P1", { method: "PATCH", body: { consent_logo_en: v } });
    assert.deepEqual([r.status, r.body.error], [400, "consent_read_only"]);
  }
  const mixed = await call(env, "/P1", { method: "PATCH", body: { sector: "Gıda", consent_logo_en: 1 } }); // geçerli alanla karıştırılsa da
  assert.equal(mixed.body.error, "consent_read_only");
  for (const f of ["approved", "kvkk_consent_version", "tax_id", "contact_json", "logo_r2_key"]) {
    assert.equal((await call(env, "/P1", { method: "PATCH", body: { [f]: "x" } })).body.error, "field_read_only", f);
  }
  assert.deepEqual({ ...raw.prepare("SELECT consent_logo_en c, sector s FROM partners WHERE id='P1'").get() }, { c: 0, s: "Tekstil" });
  assert.equal(audits(raw).length, 0);
});

test("PATCH sector/certs/capacity/export_history → güncellenir + audit eski/yeni; geçersiz değer 400; JSON olmayan 415", async () => {
  const { env, raw, apply } = makeEnv(); apply("P1");
  const r = await call(env, "/P1", { method: "PATCH", body: { sector: "Gıda", certs: ["ISO 9001", "CE", "CE"], capacity: "10 ton/ay" } });
  assert.deepEqual([r.status, r.body.sector, r.body.certs, r.body.capacity], [200, "Gıda", ["ISO 9001", "CE"], "10 ton/ay"]);
  const [a] = audits(raw);
  assert.deepEqual([a.action, JSON.parse(a.old_value), JSON.parse(a.new_value)], ["update_partner",
    { sector: "Tekstil", certs: ["CE"], capacity: "5000/ay" }, { sector: "Gıda", certs: ["ISO 9001", "CE"], capacity: "10 ton/ay" }]);
  assert.equal((await call(env, "/P1", { method: "PATCH", body: { certs: "CE" } })).status, 400);
  assert.equal((await call(env, "/P1", { method: "PATCH", body: { website: "x" } })).body.error, "unknown_field");
  assert.equal((await call(env, "/P1", { method: "PATCH", body: { sector: "x" }, headers: { "content-type": "text/plain" } })).status, 415);
});

test("LOGO sunucu kontrolleri: CSRF başlığı, multipart, SVG red, beyan≠içerik red, sahte imza red, >1MB 413 (chunked dahil)", async () => {
  const { env, raw, r2, apply } = makeEnv(); apply("P1");
  const up = (fd, headers = { "x-bdx-admin": "1" }) => call(env, "/P1/logo", { method: "POST", body: fd, headers });
  assert.equal((await up(logoForm(PNG(), "image/png"), {})).body.error, "csrf_header_required");
  assert.equal((await call(env, "/P1/logo", { method: "POST", body: {}, headers: { "x-bdx-admin": "1" } })).body.error, "multipart_required");
  assert.equal((await up(logoForm(new TextEncoder().encode("<svg onload=alert(1)>"), "image/svg+xml"))).body.error, "invalid_logo_type");
  assert.equal((await up(logoForm(PNG(), "image/jpeg"))).body.error, "invalid_logo_type"); // beyan jpeg, içerik png
  assert.equal((await up(logoForm(new TextEncoder().encode("not an image at all"), "image/png"))).body.error, "invalid_logo_type");
  assert.equal((await up(logoForm(PNG(1024 * 1024 + 1), "image/png"))).status, 413);
  // Content-Length'siz akış
  _resetJwksCache();
  const big = new ReadableStream({ start(c) { for (let i = 0; i < 20; i++) c.enqueue(new Uint8Array(64 * 1024)); c.close(); } });
  const rq = new Request("https://x/admin/api/partners/P1/logo", { method: "POST", body: big, duplex: "half", headers: { "cf-access-jwt-assertion": await jwt("boss@example.com"), "x-bdx-admin": "1", "content-type": "multipart/form-data; boundary=x" } });
  assert.equal((await handlePartners(rq, env, opts)).status, 413);
  assert.equal(r2.size, 0);
  assert.equal(raw.prepare("SELECT logo_r2_key k FROM partners").get().k, null);
  assert.equal(audits(raw).length, 0);
});

test("LOGO geçerli PNG → R2 sürümlü anahtar + DB + audit; ikinci yükleme eski sürümü siler", async () => {
  const { env, raw, r2, apply } = makeEnv(); apply("P1");
  const r = await call(env, "/P1/logo", { method: "POST", body: logoForm(PNG(), "image/png"), headers: { "x-bdx-admin": "1" } });
  assert.equal(r.status, 200);
  const k1 = raw.prepare("SELECT logo_r2_key k FROM partners").get().k;
  assert.match(k1, /^media\/partners\/P1\/logo-[0-9A-Z]{26}\.png$/);
  assert.deepEqual(r2.get(k1), { bytes: 64, ct: "image/png" });
  await call(env, "/P1/logo", { method: "POST", body: logoForm(PNG(), "image/png"), headers: { "x-bdx-admin": "1" } });
  const k2 = raw.prepare("SELECT logo_r2_key k FROM partners").get().k;
  assert.notEqual(k1, k2); assert.ok(!r2.has(k1)); assert.ok(r2.has(k2));
  assert.deepEqual(audits(raw).map((a) => a.action), ["upload_partner_logo", "upload_partner_logo"]);
});

test("consent_logo_en=0: onaylı + logo yüklü olsa da public logoUrl NULL (ad + sektör görünür); rıza=1 → URL", async () => {
  const { env, raw, apply } = makeEnv(); apply("NOLOGO", { logo: 0, tax: "3333333333" }); apply("YESLOGO", { logo: 1, tax: "4444444444" });
  for (const id of ["NOLOGO", "YESLOGO"]) {
    await call(env, `/${id}/logo`, { method: "POST", body: logoForm(PNG(), "image/png"), headers: { "x-bdx-admin": "1" } });
    await call(env, `/${id}/approve`, { method: "POST", body: {} });
  }
  assert.deepEqual(pub(raw, "NOLOGO"), { id: "NOLOGO", name: "Firma NOLOGO", sector: "Tekstil", logoUrl: null, verified: true });
  assert.match(pub(raw, "YESLOGO").logoUrl, /^https:\/\/media\.bdimexport\.com\/media\/partners\/YESLOGO\/logo-.+\.png$/);
});
