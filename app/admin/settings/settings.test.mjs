// FAZ_3 3.8 test — node --experimental-strip-types --test app/admin/settings/settings.test.mjs
import test from "node:test";
import assert from "node:assert/strict";
import { validateChannelPrefs, validateTurnstile, validateRateLimits, ValidationError } from "./schema.ts";
import { resolveChannels, primaryChannel } from "./channels.ts";
import { loadSettings, updateSetting } from "./store.ts";

// Sahte D1: settings + admin_actions bellekte; batch atomik (hata → hiçbiri uygulanmaz)
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
      const snap = new Map(settings), n = audit.length;
      try {
        for (const s of ss) {
          if (s.sql.startsWith("INSERT INTO settings")) settings.set(s.args[0], s.args[1]);
          else if (s.sql.startsWith("INSERT INTO admin_actions")) audit.push(s.args);
          else throw new Error("unexpected sql");
        }
      } catch (e) { settings.clear(); snap.forEach((v, k) => settings.set(k, v)); audit.length = n; throw e; }
      return [];
    },
  };
}

test("channel resolve: locale → fallback, lead pref öne alınır", () => {
  const prefs = { byLocale: { "en-ru": ["telegram", "whatsapp"] }, fallback: ["email"] };
  assert.deepEqual(resolveChannels("en-ru", prefs), ["telegram", "whatsapp"]);
  assert.deepEqual(resolveChannels("de", prefs), ["email"]);
  assert.equal(primaryChannel("en-ru", prefs, "whatsapp"), "whatsapp");
  assert.deepEqual(resolveChannels("en-ru", prefs, "bogus"), ["telegram", "whatsapp"]);
});

test("validator: kanal/rate/turnstile sınırları", () => {
  assert.throws(() => validateChannelPrefs({ byLocale: { xx_: ["email"] }, fallback: ["email"] }), ValidationError);
  assert.throws(() => validateChannelPrefs({ byLocale: {}, fallback: ["sms"] }), ValidationError);
  assert.throws(() => validateChannelPrefs({ byLocale: {}, fallback: ["email", "email"] }), ValidationError);
  assert.throws(() => validateRateLimits({ formPerMin: 0, apiPerMin: 60, adminPerMin: 120 }), ValidationError);
  assert.throws(() => validateRateLimits({ formPerMin: 5.5, apiPerMin: 60, adminPerMin: 120 }), ValidationError);
  assert.throws(() => validateTurnstile({ enabled: true, siteKey: "" }), ValidationError);
  assert.throws(() => validateTurnstile({ enabled: false, siteKey: "", secret: "x" }), /Workers secret/);
  assert.deepEqual(validateTurnstile({ enabled: true, siteKey: "1x00000000000000000000AA" }), { enabled: true, siteKey: "1x00000000000000000000AA" });
});

test("updateSetting: değer yazılır + audit (eski/yeni) aynı batch'te", async () => {
  const db = fakeDb();
  await updateSetting(db, "boss@example.com", "rateLimits", { formPerMin: 20, apiPerMin: 60, adminPerMin: 120 });
  assert.equal((await loadSettings(db)).rateLimits.formPerMin, 20);
  assert.equal(db.audit.length, 1);
  const [, actor, action, etype, eid, oldV, newV] = db.audit[0];
  assert.deepEqual([actor, action, etype, eid], ["boss@example.com", "update_setting", "settings", "rateLimits"]);
  assert.equal(JSON.parse(oldV).formPerMin, 10);
  assert.equal(JSON.parse(newV).formPerMin, 20);
});

test("updateSetting: geçersiz değer → ne ayar ne audit", async () => {
  const db = fakeDb();
  await assert.rejects(updateSetting(db, "a@b.c", "rateLimits", { formPerMin: 9999, apiPerMin: 60, adminPerMin: 120 }), ValidationError);
  assert.equal(db.settings.size, 0);
  assert.equal(db.audit.length, 0);
});

test("loadSettings: bozuk satır varsayılana düşer", async () => {
  const db = fakeDb();
  db.settings.set("rateLimits", "{not json");
  assert.equal((await loadSettings(db)).rateLimits.formPerMin, 10);
});
