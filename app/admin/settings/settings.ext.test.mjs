// FAZ_3 3.8 — genişletilmiş ayarlar: secret reddi (KRİTİK), yeni doğrulayıcılar, kanal linkleri, handler yetkisi, rate-limit görünümü.
// Çalıştır: node --experimental-strip-types --test app/admin/settings/settings.ext.test.mjs
import test from "node:test";
import assert from "node:assert/strict";
import {
  assertNoSecrets, validateContacts, validateExperts, validateWebhooks, validateRssSources, validateTurnstile, publicHttpsUrl, ValidationError, SETTING_KEYS, DEFAULTS,
} from "./schema.ts";
import { channelHref, reachableChannels, publicChannelConfig } from "./channels.ts";
import { loadSettings, updateSetting } from "./store.ts";
import { handleSettings } from "./handler.ts";
import { handleRateLimitView, maskId, parseKey } from "./ratelimit-view.ts";
import { _resetJwksCache } from "../middleware.ts";

// ---- sahte D1 (settings + admin_actions, atomik batch) ----
function fakeDb() {
  const settings = new Map();
  const audit = [];
  const stmt = (sql, args = []) => ({
    sql, args,
    bind: (...a) => stmt(sql, a),
    all: async () => ({ results: [...settings].map(([key, value_json]) => ({ key, value_json })) }),
  });
  return {
    settings, audit,
    prepare: (sql) => stmt(sql),
    batch: async (ss) => {
      for (const s of ss) {
        if (s.sql.startsWith("INSERT INTO settings")) settings.set(s.args[0], s.args[1]);
        else if (s.sql.startsWith("INSERT INTO admin_actions")) audit.push(s.args);
      }
      return [];
    },
  };
}

// ---- Access JWT yardımcıları (analytics.test ile aynı desen) ----
const TEAM = "bdimexport.cloudflareaccess.com", AUD = "test-aud-tag", NOW = 1_800_000_000_000;
const b64u = (b) => Buffer.from(b).toString("base64url");
const mk = async () => {
  const kp = await crypto.subtle.generateKey({ name: "RSASSA-PKCS1-v1_5", modulusLength: 2048, publicExponent: new Uint8Array([1, 0, 1]), hash: "SHA-256" }, true, ["sign", "verify"]);
  return { kp, jwk: { ...(await crypto.subtle.exportKey("jwk", kp.publicKey)), kid: "k1" } };
};
const sign = async (kp, claims) => {
  const h = b64u(JSON.stringify({ alg: "RS256", kid: "k1" })), p = b64u(JSON.stringify(claims));
  const s = await crypto.subtle.sign("RSASSA-PKCS1-v1_5", kp.privateKey, new TextEncoder().encode(`${h}.${p}`));
  return `${h}.${p}.${b64u(new Uint8Array(s))}`;
};
const claims = (email) => ({ iss: `https://${TEAM}`, aud: [AUD], exp: NOW / 1000 + 600, iat: NOW / 1000, email, sub: "u1" });
const baseEnv = (extra = {}) => ({ ACCESS_TEAM_DOMAIN: TEAM, ACCESS_AUD: AUD, ADMIN_EMAILS: "boss@example.com", VIEWER_EMAILS: "view@example.com", ...extra });

async function asUser(email) {
  _resetJwksCache();
  const { kp, jwk } = await mk();
  return { token: await sign(kp, claims(email)), opts: { now: NOW, fetcher: async () => ({ keys: [jwk] }) } };
}
const req = (method, token, body) =>
  new Request("https://bdimexport.com/admin/api/settings", { method, headers: { "cf-access-jwt-assertion": token, "content-type": "application/json" }, body: body ? JSON.stringify(body) : undefined });

// ───────────────────────── SECRET YAZMA REDDİ (kritik) ─────────────────────────
test("assertNoSecrets: yasak ALAN ADI her derinlikte reddedilir", () => {
  for (const bad of [{ TURNSTILE_SECRET: "x" }, { a: { b: { apiKey: "x" } } }, [{ password: "x" }], { privateKey: "x" }, { access_token: "x" }, { webhook_url: "x" }, { Authorization: "x" }, { client_secret: "x" }]) {
    assert.throws(() => assertNoSecrets(bad, "t"), ValidationError, JSON.stringify(bad));
  }
  assert.doesNotThrow(() => assertNoSecrets({ name: "Ayşe", locale: "tr" }));
});

test("assertNoSecrets: secret BİÇİMLİ değer reddedilir (PEM, JWT, Slack/Discord webhook, GitHub/AWS/Google/Stripe, uzun hex)", () => {
  const bad = [
    "-----BEGIN PRIVATE KEY-----\nabc", "eyJhbGciOiJSUzI1NiJ9.eyJzdWIiOiJ1MSJ9.c2lnbmF0dXJl", "https://hooks.slack.com/services/T0/B0/xxxx",
    "https://discord.com/api/webhooks/1/abc", "ghp_" + "a".repeat(36), "AKIA" + "A".repeat(16), "AIza" + "a".repeat(35), "sk_live_" + "a".repeat(20), "f".repeat(40),
  ];
  for (const v of bad) assert.throws(() => assertNoSecrets({ note: v }), ValidationError, v.slice(0, 20));
});

test("updateSetting: HER ayar anahtarında secret alanı → reddedilir, ne ayar ne audit yazılır", async () => {
  const good = {
    channelPrefs: { byLocale: {}, fallback: ["email"] },
    turnstile: { enabled: false, siteKey: "" },
    rateLimits: { formPerMin: 10, apiPerMin: 60, adminPerMin: 120 },
    contacts: { whatsapp: "", telegram: "", wechat: "", email: "" },
    experts: [], webhooks: [], rssSources: [],
  };
  for (const key of SETTING_KEYS) {
    const db = fakeDb();
    const poisoned = Array.isArray(good[key]) ? [...good[key], { turnstile_secret: "x" }] : { ...good[key], TURNSTILE_SECRET: "0x4AAAAAAAsecret" };
    await assert.rejects(updateSetting(db, "boss@example.com", key, poisoned), ValidationError, key);
    assert.equal(db.settings.size, 0, `${key}: ayar yazılmamalı`);
    assert.equal(db.audit.length, 0, `${key}: audit yazılmamalı`);
  }
});

test("turnstile: secret alanı reddedilir; site-key (secret ile aynı biçim) alan adı dışında bloklanmaz", () => {
  assert.throws(() => validateTurnstile({ enabled: true, siteKey: "1x00000000000000000000AA", secret: "x" }), /secret/i);
  assert.throws(() => validateTurnstile({ enabled: true, siteKey: "1x00000000000000000000AA", TURNSTILE_SECRET_KEY: "x" }), ValidationError);
  assert.deepEqual(validateTurnstile({ enabled: true, siteKey: "1x00000000000000000000AA" }).enabled, true);
});

test("webhooks: URL panele GİRMEZ — yalnız Workers secret ADI", () => {
  const ok = [{ id: "ops", name: "Ops kanalı", envVar: "ANALYTICS_ALERT_WEBHOOK_URL", events: ["analytics_error"] }];
  assert.deepEqual(validateWebhooks(ok), ok);
  assert.throws(() => validateWebhooks([{ ...ok[0], url: "https://example.com/hook" }]), /bilinmeyen alan/);
  assert.throws(() => validateWebhooks([{ ...ok[0], envVar: "https://hooks.slack.com/services/T/B/x" }]), ValidationError);
  assert.throws(() => validateWebhooks([{ ...ok[0], name: "https://hooks.slack.com/services/T/B/x" }]), ValidationError);
  assert.throws(() => validateWebhooks([{ ...ok[0], envVar: "OPS_KEY" }]), /_WEBHOOK_URL/);
  assert.throws(() => validateWebhooks([{ ...ok[0], events: ["bogus"] }]), ValidationError);
  assert.throws(() => validateWebhooks([ok[0], ok[0]]), /tekrar/);
});

// ───────────────────────── yeni alanlar ─────────────────────────
test("contacts: biçim doğrulama; boş = tanımsız; uydurma varsayılan yok", () => {
  assert.deepEqual(DEFAULTS.contacts, { whatsapp: "", telegram: "", wechat: "", email: "" });
  assert.deepEqual(validateContacts({ whatsapp: "+905551112233", telegram: "@bdim_export", wechat: "bdim_export", email: "Info@Bdimexport.com" }),
    { whatsapp: "+905551112233", telegram: "bdim_export", wechat: "bdim_export", email: "info@bdimexport.com" });
  assert.throws(() => validateContacts({ whatsapp: "0555 111 22 33" }), ValidationError);
  assert.throws(() => validateContacts({ telegram: "ab" }), ValidationError);
  assert.throws(() => validateContacts({ email: "x@" }), ValidationError);
});

test("experts: isim/locale/foto; javascript:/data:/http/iç adres foto reddedilir; /media/ ve https kabul", () => {
  const e = (photoUrl) => [{ id: "ahmet-ru", name: "Ahmet Y.", locale: "en-ru", photoUrl }];
  assert.equal(validateExperts(e("/media/experts/ahmet.webp"))[0].photoUrl, "/media/experts/ahmet.webp");
  assert.equal(validateExperts(e("https://cdn.example.com/a.jpg"))[0].photoUrl, "https://cdn.example.com/a.jpg");
  assert.equal(validateExperts(e(""))[0].photoUrl, "");
  for (const bad of ["javascript:alert(1)", "data:text/html,x", "http://cdn.example.com/a.jpg", "https://127.0.0.1/a.jpg", "https://localhost/a.jpg", "//cdn.example.com/a.jpg", "/media/../etc/passwd", "https://u:p@cdn.example.com/a.jpg"]) {
    assert.throws(() => validateExperts(e(bad)), ValidationError, bad);
  }
  assert.throws(() => validateExperts([{ id: "x1", name: "<script>", locale: "tr", photoUrl: "" }]), ValidationError);
  assert.throws(() => validateExperts([{ id: "x1", name: "Ali Veli", locale: "TR", photoUrl: "" }]), ValidationError);
});

test("rssSources: https + genel alan adı; SSRF/iç adres, kimlik bilgisi, secret sorgusu reddedilir; tekrar yok", () => {
  const ok = [{ id: "reuters-trade", name: "Reuters Trade", url: "https://example.com/feed.xml", enabled: true }];
  assert.equal(validateRssSources(ok)[0].url, "https://example.com/feed.xml");
  for (const bad of ["http://example.com/f", "https://127.0.0.1/f", "https://10.0.0.5/f", "https://[::1]/f", "https://metadata.internal/f", "https://localhost/f", "https://example.com:8443/f",
    "https://user:pw@example.com/f", "https://example.com/f?api_key=abc", "https://example.com/f?token=abc", "ftp://example.com/f", "not a url"]) {
    assert.throws(() => validateRssSources([{ ...ok[0], url: bad }]), ValidationError, bad);
  }
  assert.throws(() => validateRssSources([ok[0], { ...ok[0], id: "other" }]), /tekrar/);
  assert.throws(() => publicHttpsUrl("https://169.254.169.254/latest", "u"), ValidationError);
});

test("updateSetting: contacts/experts/webhooks/rssSources yazılır, audit eski/yeni ile düşer", async () => {
  const db = fakeDb();
  await updateSetting(db, "boss@example.com", "contacts", { whatsapp: "+905551112233", telegram: "", wechat: "", email: "" });
  await updateSetting(db, "boss@example.com", "rssSources", [{ id: "a1", name: "Kaynak A", url: "https://example.com/f.xml", enabled: false }]);
  const s = await loadSettings(db);
  assert.equal(s.contacts.whatsapp, "+905551112233");
  assert.equal(s.rssSources[0].enabled, false);
  assert.equal(db.audit.length, 2);
  assert.deepEqual(db.audit.map((a) => a[2] + ":" + a[4]), ["update_setting:contacts", "update_setting:rssSources"]);
});

// ───────────────────────── kanal değişimi (ortak lib) ─────────────────────────
test("kanal linkleri yalnız ayardan üretilir; boş kanal düşer; değişiklik anında yansır", () => {
  const prefs = { byLocale: { "en-ru": ["telegram", "whatsapp", "wechat"] }, fallback: ["email"] };
  const none = { channelPrefs: prefs, contacts: DEFAULTS.contacts };
  assert.deepEqual(reachableChannels("en-ru", none), []); // numara girilmemiş → uydurma link yok
  const set = { channelPrefs: prefs, contacts: { whatsapp: "+905551112233", telegram: "bdim_export", wechat: "", email: "" } };
  assert.deepEqual(reachableChannels("en-ru", set).map((c) => [c.id, c.href]), [["telegram", "https://t.me/bdim_export"], ["whatsapp", "https://wa.me/905551112233"]]);
  const changed = { ...set, contacts: { ...set.contacts, telegram: "yeni_kullanici" } };
  assert.equal(reachableChannels("en-ru", changed)[0].href, "https://t.me/yeni_kullanici");
  assert.equal(channelHref("wechat", changed.contacts), null);
  assert.equal(reachableChannels("en-ru", { ...set, contacts: { ...set.contacts, wechat: "bdim_wx" } }).at(-1).handle, "bdim_wx");
});

test("publicChannelConfig: yalnız allowlist (webhook/rss/turnstile/rateLimits SIZMAZ)", () => {
  const pub = publicChannelConfig({ ...DEFAULTS, webhooks: [{ id: "x1", name: "n", envVar: "A_WEBHOOK_URL", events: ["lead_new"] }] });
  assert.deepEqual(Object.keys(pub).sort(), ["channelPrefs", "contacts", "experts"]);
});

// ───────────────────────── handler yetkisi ─────────────────────────
test("handleSettings: Access'siz 401; viewer GET/PUT 403; admin GET 200", async () => {
  const db = fakeDb();
  const env = baseEnv({ DB: db });
  assert.equal((await handleSettings(new Request("https://x/s"), env)).status, 401);
  const v = await asUser("view@example.com");
  assert.equal((await handleSettings(req("GET", v.token), env, v.opts)).status, 403);
  assert.equal((await handleSettings(req("PUT", v.token, { key: "contacts", value: {} }), env, v.opts)).status, 403);
  const a = await asUser("boss@example.com");
  const res = await handleSettings(req("GET", a.token), env, a.opts);
  assert.equal(res.status, 200);
  const body = await res.json();
  assert.equal(body.turnstileSecretConfigured, false);
  assert.ok(!JSON.stringify(body).includes("TURNSTILE_SECRET\":"), "secret değeri yanıtta olmamalı");
});

test("handleSettings PUT: secret içeren gövde 422 + yazılmaz; geçerli gövde 200 + audit; bilinmeyen anahtar 400", async () => {
  const db = fakeDb();
  const env = baseEnv({ DB: db, TURNSTILE_SECRET: "super-secret-value-do-not-leak" });
  const a = await asUser("boss@example.com");

  let res = await handleSettings(req("PUT", a.token, { key: "turnstile", value: { enabled: true, siteKey: "1x00000000000000000000AA", secret: "0x4AAAAAAAxxxxxxxxxxxxxxxx" } }), env, a.opts);
  assert.equal(res.status, 422);
  assert.equal(db.settings.size + db.audit.length, 0);

  res = await handleSettings(req("PUT", a.token, { key: "webhooks", value: [{ id: "ops", name: "Ops", envVar: "OPS_WEBHOOK_URL", events: ["lead_new"], url: "https://hooks.slack.com/services/T/B/x" }] }), env, a.opts);
  assert.equal(res.status, 422);
  assert.equal(db.settings.size + db.audit.length, 0);

  res = await handleSettings(req("PUT", a.token, { key: "bogus", value: {} }), env, a.opts);
  assert.equal(res.status, 400);

  res = await handleSettings(req("PUT", a.token, { key: "contacts", value: { whatsapp: "+905551112233", telegram: "", wechat: "", email: "" } }), env, a.opts);
  assert.equal(res.status, 200);
  assert.equal(db.audit.length, 1);

  const get = await (await handleSettings(req("GET", a.token), env, a.opts)).json();
  assert.equal(get.turnstileSecretConfigured, true); // yalnız VARLIK raporlanır
  assert.ok(!JSON.stringify(get).includes("super-secret-value-do-not-leak"), "secret değeri ASLA dönmez");
});

// ───────────────────────── rate-limit görünümü ─────────────────────────
function fakeKv(entries) {
  return {
    list: async ({ prefix }) => ({ keys: Object.keys(entries).filter((k) => k.startsWith(prefix)).map((name) => ({ name })), list_complete: true }),
    get: async (k) => entries[k] ?? null,
  };
}

test("maskId/parseKey: IP maskelenir, IPv6 anahtarı doğru ayrışır", () => {
  assert.equal(maskId("ip", "203.0.113.77"), "203.0.113.x");
  assert.equal(maskId("ip", "2001:db8:85a3:8d3:1319:8a2e:370:7344"), "2001:db8:85a3:…");
  assert.deepEqual(parseKey("rl:ip:2001:db8::1:29000000"), { scope: "ip", id: "2001:db8::1", win: 29000000 });
  assert.equal(parseKey("other:x:1"), null);
});

test("handleRateLimitView: admin-only, salt-okunur, güncel pencere, IP maskeli, eski pencere dışı", async () => {
  const cur = Math.floor(NOW / 60_000);
  const kv = fakeKv({
    [`rl:apply:203.0.113.77:${cur}`]: "4",
    [`rl:ip:198.51.100.9:${cur}`]: "30",
    [`rl:ip:198.51.100.9:${cur - 1}`]: "10",
    [`rl:ip:192.0.2.1:${cur - 5}`]: "99", // eski pencere → listelenmez
  });
  const env = baseEnv({ CACHE: kv });
  const v = await asUser("view@example.com");
  assert.equal((await handleRateLimitView(req("GET", v.token), env, v.opts)).status, 403);
  const a = await asUser("boss@example.com");
  assert.equal((await handleRateLimitView(req("POST", a.token), env, a.opts)).status, 405);
  const body = await (await handleRateLimitView(req("GET", a.token), env, a.opts)).json();
  assert.deepEqual(body.rows.map((r) => [r.scope, r.id, r.count, r.window]), [["ip", "198.51.100.x", 30, "current"], ["ip", "198.51.100.x", 10, "previous"], ["apply", "203.0.113.x", 4, "current"]]);
  assert.equal(body.byScope.ip, 40);
  assert.ok(!JSON.stringify(body).includes("203.0.113.77"), "ham IP dönmemeli");
  const empty = await (await handleRateLimitView(req("GET", a.token), baseEnv({ CACHE: fakeKv({}) }), a.opts)).json();
  assert.deepEqual(empty.rows, []);
});
