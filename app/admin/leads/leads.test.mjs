// FAZ_3 3.3 — Lead Kanban KVKK/güvenlik testleri.
// Çalıştır: node --experimental-strip-types --test app/admin/leads/leads.test.mjs
// Gerçek migration'lar (0001 + 0002 audit append-only) node:sqlite üzerinde; Access JWT test anahtarıyla imzalanır.
import test from "node:test";
import assert from "node:assert/strict";
import { DatabaseSync } from "node:sqlite";
import { readFileSync } from "node:fs";
import { handleLeads } from "./handler.ts";
import { buildChannelAction } from "./channel.ts";
import { changeLeadStatus, toMaskedLead, parseLeadRow } from "./lib.ts";
import { DEMO_LEADS } from "./fixtures.ts";
import { _resetJwksCache } from "../middleware.ts";

const TEAM = "t.cloudflareaccess.com";
const AUD = "a".repeat(64);
const NOW = 1_800_000_000;
const ENV0 = { ACCESS_TEAM_DOMAIN: TEAM, ACCESS_AUD: AUD, ADMIN_EMAILS: "boss@example.com", VIEWER_EMAILS: "view@example.com" };

const kp = await crypto.subtle.generateKey({ name: "RSASSA-PKCS1-v1_5", modulusLength: 2048, publicExponent: new Uint8Array([1, 0, 1]), hash: "SHA-256" }, true, ["sign", "verify"]);
const jwk = { ...(await crypto.subtle.exportKey("jwk", kp.publicKey)), kid: "k1", alg: "RS256", use: "sig" };
const b64 = (o) => Buffer.from(JSON.stringify(o)).toString("base64url");
async function jwt(email) {
  const h = b64({ alg: "RS256", kid: "k1" });
  const p = b64({ iss: `https://${TEAM}`, aud: [AUD], exp: NOW + 600, email, sub: "u" });
  const s = Buffer.from(await crypto.subtle.sign("RSASSA-PKCS1-v1_5", kp.privateKey, new TextEncoder().encode(`${h}.${p}`))).toString("base64url");
  return `${h}.${p}.${s}`;
}
const opts = { now: NOW * 1000, fetcher: async () => ({ keys: [jwk] }) };

function makeDb() {
  const raw = new DatabaseSync(":memory:");
  for (const f of ["0001_init.sql", "0002_admin_audit_integrity.sql"]) raw.exec(readFileSync(new URL(`../../../db/migrations/${f}`, import.meta.url), "utf8"));
  const stmt = (sql, args = []) => ({
    bind: (...a) => stmt(sql, a),
    first: async () => raw.prepare(sql).get(...args) ?? null,
    all: async () => ({ results: raw.prepare(sql).all(...args) }),
    _run: () => ({ meta: { changes: Number(raw.prepare(sql).run(...args).changes) } }),
  });
  const db = {
    prepare: (sql) => stmt(sql),
    batch: async (sts) => {
      raw.exec("BEGIN");
      try { const out = sts.map((s) => s._run()); raw.exec("COMMIT"); return out; } catch (e) { raw.exec("ROLLBACK"); throw e; }
    },
  };
  const ins = raw.prepare("INSERT INTO leads (id,source_page,locale,form_type,channel_pref,payload_json,status,created_at,consent_version,consent_at) VALUES (?,?,?,?,?,?,?,?,?,?)");
  for (const l of DEMO_LEADS) {
    const { consent, ...payload } = l.payload;
    ins.run(l.id, l.source_page, l.locale, l.form_type, l.channel_pref, JSON.stringify(payload), l.status, l.created_at, consent ? "v1 (47ac2ef0a5b43264)" : null, consent?.at ?? null);
  }
  return { raw, env: { ...ENV0, DB: db } };
}
async function call(env, path, { email = "boss@example.com", method = "GET", body, ct = "application/json", token } = {}) {
  _resetJwksCache();
  const headers = { "cf-access-jwt-assertion": token ?? (await jwt(email)) };
  if (body !== undefined) headers["content-type"] = ct;
  const r = await handleLeads(new Request(`https://bdimexport.pages.dev/admin/api/leads${path}`, { method, headers, body: body === undefined ? undefined : JSON.stringify(body) }), env, opts, new Date(NOW * 1000));
  return { status: r.status, body: await r.json() };
}
const audits = (raw) => raw.prepare("SELECT actor, action, entity_id, old_value, new_value FROM admin_actions ORDER BY rowid").all();
const PII = ["ayse@ornek-tekstil.example", "+905550000001", "905550000001", "Ayşe Örnek", "@ivan_demo", "ivan_demo", "demo_wx_0001", "claire@exemple-sarl.example", "hans@beispiel.example"];

test("yetki: token yok 401; viewer liste + status + reveal → 403 admin_only (maskeli bile göremez)", async () => {
  const { env, raw } = makeDb();
  _resetJwksCache();
  const r = await handleLeads(new Request("https://x/admin/api/leads"), env, opts);
  assert.equal(r.status, 401);
  assert.equal((await call(env, "", { email: "view@example.com" })).body.error, "admin_only");
  assert.equal((await call(env, "/L-DEMO-001/status", { email: "view@example.com", method: "POST", body: { from: "new", to: "closed" } })).status, 403);
  assert.equal((await call(env, "/L-DEMO-001/reveal", { email: "view@example.com", method: "POST", body: {} })).status, 403);
  assert.equal(audits(raw).length, 0);
});

test("liste MASKELİ: yanıtta hiçbir ham kişisel veri yok; maskeli alanlar + rıza/saklama rozetleri var", async () => {
  const { env } = makeDb();
  const { status, body } = await call(env, "");
  assert.equal(status, 200);
  assert.equal(body.data.length, 5);
  const dump = JSON.stringify(body);
  for (const p of PII) assert.ok(!dump.includes(p), `sızıntı: ${p}`);
  const a = body.data.find((l) => l.id === "L-DEMO-001");
  assert.equal(a.masked.email, "a***@o***.example");
  assert.equal(a.masked.whatsapp, "+90•••••01");
  assert.equal(a.masked.name, "A••• Ö•••");
  assert.deepEqual(a.consent, { ok: true, text: "Rıza v1 (47ac2ef0a5b43264)" });
  assert.equal(body.data.find((l) => l.id === "L-DEMO-005").consent.ok, false); // rızasız kayıt kırmızı rozet
  assert.ok(!("payload" in a) && !("contact" in a));
});

test("filtreler: locale / source_page / channel_pref / status — sunucu SQL ile doğru sonuç", async () => {
  const { env } = makeDb();
  const ids = async (q) => (await call(env, q)).body.data.map((l) => l.id).sort();
  assert.deepEqual(await ids("?locale=en-ru"), ["L-DEMO-002"]);
  assert.deepEqual(await ids("?source_page=%2Fzh%2F"), ["L-DEMO-004"]);
  assert.deepEqual(await ids("?channel_pref=email"), ["L-DEMO-003", "L-DEMO-005"]);
  assert.deepEqual(await ids("?channel_pref=email&locale=de"), ["L-DEMO-005"]);
  assert.deepEqual(await ids("?status=new"), ["L-DEMO-001", "L-DEMO-005"]);
  assert.deepEqual(await ids("?locale=x' OR '1'='1"), []); // parametreli — enjeksiyon etkisiz
  assert.equal((await call(env, "?status=spam")).status, 400);
});

test("status geçişi (drag&drop): DB güncellenir + audit kim/ne/eski→yeni", async () => {
  const { env, raw } = makeDb();
  const r = await call(env, "/L-DEMO-001/status", { method: "POST", body: { from: "new", to: "contacted" } });
  assert.deepEqual([r.status, r.body], [200, { id: "L-DEMO-001", status: "contacted" }]);
  assert.equal(raw.prepare("SELECT status FROM leads WHERE id='L-DEMO-001'").get().status, "contacted");
  const [a] = audits(raw);
  assert.deepEqual(
    { ...a, old_value: JSON.parse(a.old_value), new_value: JSON.parse(a.new_value) },
    { actor: "boss@example.com", action: "lead_status_change", entity_id: "L-DEMO-001", old_value: { status: "new" }, new_value: { status: "contacted" } },
  );
});

test("bayat UI (from ≠ güncel) → 409 + güncel durum; DB ve audit değişmez", async () => {
  const { env, raw } = makeDb();
  const r = await call(env, "/L-DEMO-002/status", { method: "POST", body: { from: "new", to: "closed" } });
  assert.deepEqual([r.status, r.body], [409, { error: "stale", current: "contacted" }]);
  assert.equal(raw.prepare("SELECT status FROM leads WHERE id='L-DEMO-002'").get().status, "contacted");
  assert.equal(audits(raw).length, 0);
});

test("yarış: iki admin aynı anda → biri uygulanır, diğeri false; tek audit (lib)", async () => {
  const { env, raw } = makeDb();
  const [x, y] = [await changeLeadStatus(env.DB, "a@example.com", { id: "L-DEMO-001", status: "new" }, "contacted"),
                  await changeLeadStatus(env.DB, "b@example.com", { id: "L-DEMO-001", status: "new" }, "closed")];
  assert.deepEqual([x, y], [true, false]);
  assert.equal(raw.prepare("SELECT status FROM leads WHERE id='L-DEMO-001'").get().status, "contacted");
  assert.equal(audits(raw).length, 1);
});

test("POST json olmadan → 415 (form/CSRF taklidi); geçersiz status 400; bilinmeyen id 404", async () => {
  const { env, raw } = makeDb();
  assert.equal((await call(env, "/L-DEMO-001/status", { method: "POST", body: { from: "new", to: "closed" }, ct: "application/x-www-form-urlencoded" })).status, 415);
  assert.equal((await call(env, "/L-DEMO-001/status", { method: "POST", body: { from: "new", to: "won" } })).status, 400);
  assert.equal((await call(env, "/YOK/status", { method: "POST", body: { from: "new", to: "closed" } })).status, 404);
  assert.equal((await call(env, "/L-DEMO-001/status", { method: "GET" })).status, 405);
  assert.equal(audits(raw).length, 0);
});

test("reveal: audit ÖNCE (alan adları, DEĞER YOK) → ham iletişim + kanal linki", async () => {
  const { env, raw } = makeDb();
  const r = await call(env, "/L-DEMO-001/reveal", { method: "POST", body: {} });
  assert.equal(r.status, 200);
  assert.equal(r.body.contact.email, "ayse@ornek-tekstil.example");
  assert.equal(r.body.channel.href, `https://wa.me/905550000001?text=${encodeURIComponent("Merhaba Ayşe Örnek, Pamuklu kumaş talebiniz hakkında yazıyoruz.")}`);
  const [a] = audits(raw);
  assert.equal(a.action, "lead_pii_reveal");
  assert.equal(a.actor, "boss@example.com");
  assert.deepEqual(JSON.parse(a.new_value), { fields: ["name", "email", "whatsapp"], channel_pref: "whatsapp" });
  for (const p of PII) assert.ok(!JSON.stringify(a).includes(p), `audit'e PII sızdı: ${p}`);
});

test("reveal: audit yazılamazsa ham veri DÖNMEZ (fail-closed)", async () => {
  const { env, raw } = makeDb();
  raw.exec("CREATE TRIGGER t_fail BEFORE INSERT ON admin_actions BEGIN SELECT RAISE(ABORT,'audit down'); END;");
  await assert.rejects(call(env, "/L-DEMO-001/reveal", { method: "POST", body: {} }), /audit down/);
});

test("kanal YALNIZ channel_pref'ten: whatsapp bilgisi olsa da pref=email → mailto; pref yok → link yok", async () => {
  const c = { name: "X", email: "x@example.com", whatsapp: "+905551112233", product: "P" };
  assert.match(buildChannelAction("email", "en", c).href, /^mailto:x@example\.com\?/);
  assert.equal(buildChannelAction(null, "tr", c), null);
  assert.equal(buildChannelAction("sms", "tr", c), null);
  assert.equal(buildChannelAction("telegram", "tr", c), null); // telegram bilgisi yok → whatsapp'a DÜŞMEZ
  const w = buildChannelAction("wechat", "zh", { wechat: "wx_id" });
  assert.deepEqual([w.href, w.copyValue], [null, "wx_id"]);
});

test("wa.me Proje.md §5.1 formatı; yerel numaraya ülke kodu TAHMİN EDİLMEZ; mailto enjeksiyonu engellenir", async () => {
  const wa = (n) => buildChannelAction("whatsapp", "tr", { name: "Ali", whatsapp: n, product: "Fındık" })?.href ?? null;
  const t = encodeURIComponent("Merhaba Ali, Fındık talebiniz hakkında yazıyoruz.");
  assert.equal(wa("+90 555 111 22 33"), `https://wa.me/905551112233?text=${t}`);
  assert.equal(wa("0090 555 111 22 33"), `https://wa.me/905551112233?text=${t}`);
  assert.equal(wa("0555 111 22 33"), null);
  assert.equal(wa("12345"), null);
  assert.equal(buildChannelAction("email", "tr", { email: "a@b.com?cc=evil@x.com" }), null);
  assert.equal(buildChannelAction("email", "tr", { email: "a@b.com&bcc=evil@x.com" }), null);
});

test("toMaskedLead saf: ham alan kopyalanmaz; bozuk payload çökmez", () => {
  const m = toMaskedLead(parseLeadRow({ id: "X", source_page: "/", locale: "tr", status: "new", created_at: "2026-10-01 00:00:00", payload_json: "{bozuk" }), new Date(NOW * 1000));
  assert.equal(m.masked.email, "—");
  assert.equal(m.consent.ok, false);
});
