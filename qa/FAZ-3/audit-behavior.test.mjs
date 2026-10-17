// FAZ_3 3.10 QA — Audit bütünlüğü, DAVRANIŞ kanıtı: GERÇEK handler'lar + GERÇEK SQL (node:sqlite, repodaki migration'lar 0001–0003)
// + GERÇEK Access JWT. Her mutasyon aksiyonu için admin_actions satırı sayılır; reddedilen/bayat istekte satır OLMAZ.
// Çalıştır: node --experimental-strip-types --test qa/FAZ-3/audit-behavior.test.mjs
import test from "node:test";
import assert from "node:assert/strict";
import { handleLeads } from "../../app/admin/leads/handler.ts";
import { handlePartners } from "../../app/admin/partners/handler.ts";
import { handleContent } from "../../app/admin/content/handler.ts";
import { handleSettings } from "../../app/admin/settings/handler.ts";
import { makeIssuer, baseEnv } from "./lib/jwt.mjs";
import { makeD1, auditRows } from "./lib/d1.mjs";

const { identities, opts } = await (async () => {
  const i = await makeIssuer();
  return { identities: await i.identities(), opts: i.opts };
})();
const ADMIN = identities.admin.token;
const VIEWER = identities.viewer.token;
const J = { "content-type": "application/json" };
const call = (h, env, method, path, token, body, headers = J) =>
  h(new Request("https://qa.test" + path, { method, headers: { ...headers, "cf-access-jwt-assertion": token }, body: body === undefined ? undefined : JSON.stringify(body) }), env, opts);

function world() {
  const { d1, raw } = makeD1();
  const env = baseEnv({ DB: d1, MEDIA: { put: async () => {}, delete: async () => {} }, CONTENT_MOCK_PRODUCE: "" });
  return { raw, env };
}
const seedLead = (raw, id = "L1", status = "new") =>
  raw.prepare("INSERT INTO leads (id, source_page, locale, payload_json, status, channel_pref) VALUES (?,?,?,?,?,?)")
    .run(id, "/en/services/sourcing", "en", JSON.stringify({ name: "Jane Buyer", email: "jane.buyer@example.org", whatsapp: "+4915112345678", product: "olive oil" }), status, "email");
const seedPartner = (raw, id = "P1", consent = "v1") =>
  raw.prepare("INSERT INTO partners (id, name, sector, kvkk_consent_version, consent_logo_en) VALUES (?,?,?,?,1)").run(id, "Test Tekstil", "tekstil", consent);
const seedDraft = (raw, id = "C1") =>
  raw.prepare("INSERT INTO contents (id, slug, locale, page_type, title, body_md, status) VALUES (?,?,?,?,?,?, 'draft')").run(id, "s-" + id, "en", "article", "T", "B");
const lastAudit = (raw) => auditRows(raw).at(-1);

test("LEADS status geçişi: audit (eski/yeni, actor=admin e-postası); bayat 'from' → 409 + audit YOK", async () => {
  const { raw, env } = world(); seedLead(raw);
  const ok = await call(handleLeads, env, "POST", "/admin/api/leads/L1/status", ADMIN, { from: "new", to: "contacted" });
  assert.equal(ok.status, 200);
  assert.equal(raw.prepare("SELECT status FROM leads WHERE id='L1'").get().status, "contacted");
  const a = auditRows(raw);
  assert.equal(a.length, 1);
  assert.deepEqual([a[0].actor, a[0].action, a[0].entity_type, a[0].entity_id], ["admin@qa.test", "lead_status_change", "lead", "L1"]);
  assert.deepEqual([JSON.parse(a[0].old_value), JSON.parse(a[0].new_value)], [{ status: "new" }, { status: "contacted" }]);
  const stale = await call(handleLeads, env, "POST", "/admin/api/leads/L1/status", ADMIN, { from: "new", to: "closed" });
  assert.equal(stale.status, 409);
  assert.equal(auditRows(raw).length, 1, "bayat istekte yeni audit satırı olmamalı");
  assert.equal(raw.prepare("SELECT status FROM leads WHERE id='L1'").get().status, "contacted");
});

test("LEADS maske-açma (reveal): audit ÖNCE yazılır, DEĞER audit'e girmez; liste maskeli; viewer 403 + iz yok", async () => {
  const { raw, env } = world(); seedLead(raw);
  const list = await (await call(handleLeads, env, "GET", "/admin/api/leads", ADMIN)).text();
  assert.ok(!list.includes("jane.buyer@example.org") && !list.includes("+4915112345678"), "liste ham e-posta/telefon İÇERMEMELİ");
  const v = await call(handleLeads, env, "POST", "/admin/api/leads/L1/reveal", VIEWER, {});
  assert.equal(v.status, 403);
  assert.equal(auditRows(raw).length, 0);
  const rv = await call(handleLeads, env, "POST", "/admin/api/leads/L1/reveal", ADMIN, {});
  assert.equal(rv.status, 200);
  const a = lastAudit(raw);
  assert.equal(a.action, "lead_pii_reveal");
  assert.ok(!JSON.stringify(a).includes("jane.buyer") && !JSON.stringify(a).includes("4915112345678"), "audit'te PII DEĞERİ olmamalı (yalnız alan adları)");
  assert.ok(JSON.parse(a.new_value).fields.length >= 1);
});

test("LEADS fail-closed audit: audit INSERT düşerse reveal veri DÖNMEZ, status değişmez (mutasyon+audit atomik)", async () => {
  const { raw, env } = world(); seedLead(raw);
  raw.exec("CREATE TRIGGER qa_audit_fail BEFORE INSERT ON admin_actions BEGIN SELECT RAISE(ABORT,'qa: audit down'); END");
  let revealed = null;
  try { const r = await call(handleLeads, env, "POST", "/admin/api/leads/L1/reveal", ADMIN, {}); revealed = await r.text(); } catch { revealed = null; }
  assert.ok(!revealed || !revealed.includes("jane.buyer@example.org"), "audit yazılamadıysa PII dönmemeli");
  let st = null;
  try { st = (await call(handleLeads, env, "POST", "/admin/api/leads/L1/status", ADMIN, { from: "new", to: "contacted" })).status; } catch { st = "throw"; }
  assert.notEqual(st, 200);
  assert.equal(raw.prepare("SELECT status FROM leads WHERE id='L1'").get().status, "new", "audit düştüyse mutasyon GERİ ALINMALI");
});

test("PARTNERS onay/red: audit; KVKK rızasız onay 422 + iz yok; çift onay 409 + ikinci iz yok; reddetme gerekçe ister", async () => {
  const { raw, env } = world(); seedPartner(raw, "P1", "v1"); seedPartner(raw, "P2", null); raw.exec("UPDATE partners SET kvkk_consent_version = NULL WHERE id='P2'");
  assert.equal((await call(handlePartners, env, "POST", "/admin/api/partners/P2/approve", ADMIN, {})).status, 422);
  assert.equal(auditRows(raw).length, 0);
  assert.equal((await call(handlePartners, env, "POST", "/admin/api/partners/P1/approve", ADMIN, {})).status, 200);
  const a = lastAudit(raw);
  assert.deepEqual([a.actor, a.action, a.entity_id], ["admin@qa.test", "approve_partner", "P1"]);
  assert.equal(raw.prepare("SELECT approved FROM partners WHERE id='P1'").get().approved, 1);
  assert.equal((await call(handlePartners, env, "POST", "/admin/api/partners/P1/approve", ADMIN, {})).status, 409);
  assert.equal(auditRows(raw).length, 1);
  seedPartner(raw, "P3", "v1");
  assert.equal((await call(handlePartners, env, "POST", "/admin/api/partners/P3/reject", ADMIN, {})).status, 400, "gerekçesiz red olmaz");
  assert.equal((await call(handlePartners, env, "POST", "/admin/api/partners/P3/reject", ADMIN, { reason: "Eksik belge" })).status, 200);
  assert.equal(lastAudit(raw).action, "reject_partner");
  assert.equal(JSON.parse(lastAudit(raw).new_value).reason, "Eksik belge");
});

test("PARTNERS: consent_logo_en admin tarafından DEĞİŞTİRİLEMEZ (PATCH 400, değer ve audit değişmez); viewer onaylayamaz", async () => {
  const { raw, env } = world(); seedPartner(raw, "P1", "v1"); raw.exec("UPDATE partners SET consent_logo_en = 0 WHERE id='P1'");
  const r = await call(handlePartners, env, "PATCH", "/admin/api/partners/P1", ADMIN, { consent_logo_en: 1 });
  assert.equal(r.status, 400);
  assert.equal(raw.prepare("SELECT consent_logo_en FROM partners WHERE id='P1'").get().consent_logo_en, 0);
  const r2 = await call(handlePartners, env, "PATCH", "/admin/api/partners/P1", ADMIN, { approved: 1 });
  assert.equal(r2.status, 400);
  assert.equal(raw.prepare("SELECT approved FROM partners WHERE id='P1'").get().approved, 0);
  assert.equal((await call(handlePartners, env, "POST", "/admin/api/partners/P1/approve", VIEWER, {})).status, 403);
  assert.equal(auditRows(raw).length, 0);
});

test("CONTENT: onay ≠ yayın (draft→published doğrudan YOK), her geçiş audit'li", async () => {
  const { raw, env } = world(); seedDraft(raw);
  const pub = await call(handleContent, env, "POST", "/admin/api/content/drafts/publish", ADMIN, { ids: ["C1"] });
  assert.equal(raw.prepare("SELECT status FROM contents WHERE id='C1'").get().status, "draft", `draft doğrudan yayına alınmamalı (status ${pub.status})`);
  assert.equal(auditRows(raw).length, 0, "yayın reddedildi → audit yok");
  assert.equal((await call(handleContent, env, "POST", "/admin/api/content/drafts/approve", ADMIN, { ids: ["C1"] })).status, 200);
  assert.equal(raw.prepare("SELECT status FROM contents WHERE id='C1'").get().status, "approved");
  assert.equal((await call(handleContent, env, "POST", "/admin/api/content/drafts/publish", ADMIN, { ids: ["C1"] })).status, 200);
  assert.equal(raw.prepare("SELECT status FROM contents WHERE id='C1'").get().status, "published");
  const acts = auditRows(raw).map((a) => a.action);
  assert.equal(acts.length, 2);
  assert.ok(acts.every((x) => /approve|publish/.test(x)), acts.join(","));
});

test("SETTINGS: değişiklik audit'li (eski/yeni); secret içeren istek 422 + ayar/audit YOK; viewer 403", async () => {
  const { raw, env } = world();
  const put = (token, body) => call(handleSettings, env, "PUT", "/admin/api/settings", token, body);
  assert.equal((await put(ADMIN, { key: "contacts", value: { whatsapp: "+905551112233", telegram: "", wechat: "", email: "" } })).status, 200);
  const a = lastAudit(raw);
  assert.deepEqual([a.actor, a.action, a.entity_type, a.entity_id], ["admin@qa.test", "update_setting", "settings", "contacts"]);
  assert.equal(JSON.parse(a.new_value).whatsapp, "+905551112233");
  const n = auditRows(raw).length;
  for (const bad of [
    { key: "turnstile", value: { enabled: false, siteKey: "", TURNSTILE_SECRET: "x" } },
    { key: "webhooks", value: [{ id: "ops", name: "Ops", envVar: "OPS_WEBHOOK_URL", events: ["lead_new"], url: "https://hooks.slack.com/services/T/B/x" }] },
    { key: "channelPrefs", value: { byLocale: {}, fallback: ["email"], apiKey: "abc" } },
    { key: "rssSources", value: [{ id: "r1", name: "R", url: "https://example.com/f?token=abc", enabled: true }] },
  ]) assert.equal((await put(ADMIN, bad)).status, 422, JSON.stringify(bad).slice(0, 60));
  assert.equal((await put(VIEWER, { key: "contacts", value: {} })).status, 403);
  assert.equal(auditRows(raw).length, n, "reddedilen isteklerde audit satırı artmamalı");
  assert.equal(raw.prepare("SELECT COUNT(*) c FROM settings").get().c, 1, "yalnız geçerli ayar yazılmış olmalı");
});

test("admin_actions APPEND-ONLY: UPDATE/DELETE trigger ile reddedilir (kurcalama koruması)", async () => {
  const { raw, env } = world(); seedLead(raw);
  await call(handleLeads, env, "POST", "/admin/api/leads/L1/status", ADMIN, { from: "new", to: "contacted" });
  assert.throws(() => raw.exec("UPDATE admin_actions SET actor='x'"), /append-only/);
  assert.throws(() => raw.exec("DELETE FROM admin_actions"), /append-only/);
  assert.equal(auditRows(raw).length, 1);
});

test("CSRF: lead/partner/content mutasyonu JSON olmayan content-type ile 415, mutasyon+audit YOK", async () => {
  const { raw, env } = world(); seedLead(raw); seedPartner(raw); seedDraft(raw);
  const form = { "content-type": "application/x-www-form-urlencoded" };
  const cases = [
    [handleLeads, "/admin/api/leads/L1/status"], [handleLeads, "/admin/api/leads/L1/reveal"],
    [handlePartners, "/admin/api/partners/P1/approve"], [handleContent, "/admin/api/content/drafts/approve"],
  ];
  for (const [h, p] of cases) {
    const r = await h(new Request("https://qa.test" + p, { method: "POST", headers: { ...form, "cf-access-jwt-assertion": ADMIN }, body: "from=new&to=closed" }), env, opts);
    assert.equal(r.status, 415, p);
  }
  assert.equal(auditRows(raw).length, 0);
  assert.equal(raw.prepare("SELECT status FROM leads WHERE id='L1'").get().status, "new");
});

// BULGU F-03 (LOW, yalnız staging/dev): mock-produce mutasyonu (seedMockDraftForJob → db.batch) ile audit (writeAudit) AYRI batch'lerde.
// İstenen davranış: audit düşerse mutasyon da düşmeli. Bugün düşmüyor → todo (düzeltilene kadar rapor "BULGU"; testi kırmızı yapmaz).
test("F-03: mock-produce audit düşerse draft de oluşmamalı (atomik)", { todo: "F-03 — seedMockDraftForJob + writeAudit tek batch değil" }, async () => {
  const { raw, env } = world();
  raw.prepare("INSERT INTO ai_jobs (id, type, payload_json, status) VALUES ('J1','article',?, 'pending')").run(JSON.stringify({ locales: ["en"], phrase: "qa topic" }));
  raw.exec("CREATE TRIGGER qa_audit_fail BEFORE INSERT ON admin_actions BEGIN SELECT RAISE(ABORT,'qa: audit down'); END");
  try { await call(handleContent, { ...env, CONTENT_MOCK_PRODUCE: "1" }, "POST", "/admin/api/content/jobs/J1/mock-produce", ADMIN, {}); } catch { /* beklenen: audit hatası */ }
  assert.equal(raw.prepare("SELECT COUNT(*) c FROM contents").get().c, 0, "audit yazılamadıysa üretilen draft kalmamalı");
});
