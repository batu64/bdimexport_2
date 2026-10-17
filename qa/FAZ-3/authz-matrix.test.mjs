// FAZ_3 3.10 QA — Yetkilendirme matrisi (kod düzeyi). Her admin handler × her kimlik; GERÇEK guard + GERÇEK RS256 JWT.
// KANIT KURALI: reddedilen kimlikte veritabanına/KV'ye HİÇ dokunulmamalı (probe sayacı = 0) → guard her zaman DB'den ÖNCE.
// Çalıştır: node --experimental-strip-types --test qa/FAZ-3/authz-matrix.test.mjs
import test from "node:test";
import assert from "node:assert/strict";
import { handleLeads } from "../../app/admin/leads/handler.ts";
import { handlePartners } from "../../app/admin/partners/handler.ts";
import { handleContent } from "../../app/admin/content/handler.ts";
import { handleSettings } from "../../app/admin/settings/handler.ts";
import { handleAnalyticsSummary } from "../../app/admin/analytics/handler.ts";
import { handleRateLimitView } from "../../app/admin/settings/ratelimit-view.ts";
import { makeIssuer, baseEnv } from "./lib/jwt.mjs";

const JSON_H = { "content-type": "application/json" };
// Erişim sayacı olan, her çağrıda patlayan DB/KV: "dokunuldu mu?" sorusunun kanıtı
function probes() {
  const t = { n: 0 };
  const boom = () => { t.n++; throw new Error("PROBE_TOUCHED"); };
  const db = { prepare: boom, batch: boom };
  const kv = { list: boom, get: boom };
  return { t, env: baseEnv({ DB: db, MEDIA: { put: boom, delete: boom }, CACHE: kv }) };
}

const URLBASE = "https://qa.test";
// [ad, handler, İSTEK (method, path, body)]
const ROUTES = [
  ["leads GET liste", handleLeads, "GET", "/admin/api/leads"],
  ["leads POST status", handleLeads, "POST", "/admin/api/leads/L1/status", { from: "new", to: "contacted" }],
  ["leads POST reveal (PII)", handleLeads, "POST", "/admin/api/leads/L1/reveal", {}],
  ["partners GET liste", handlePartners, "GET", "/admin/api/partners"],
  ["partners POST approve", handlePartners, "POST", "/admin/api/partners/P1/approve", {}],
  ["content GET drafts", handleContent, "GET", "/admin/api/content/drafts"],
  ["content POST drafts/approve", handleContent, "POST", "/admin/api/content/drafts/approve", { ids: ["a1"] }],
  ["settings GET", handleSettings, "GET", "/admin/api/settings"],
  ["settings PUT", handleSettings, "PUT", "/admin/api/settings", { key: "contacts", value: {} }],
  ["analytics GET", handleAnalyticsSummary, "GET", "/admin/api/analytics/summary"],
  ["rate-limit görünümü GET", handleRateLimitView, "GET", "/admin/api/settings/rate-limits"],
];

const rows = []; // rapora yazdırılacak matris

test("yetkilendirme matrisi: 11 admin rotası × 7 kimlik (77 hücre)", async () => {
  const { identities, opts } = await makeIssuer();
  const ids = await identities();
  let cells = 0;
  for (const [name, handler, method, path, body] of ROUTES) {
    const line = { name };
    for (const [who, spec] of Object.entries(ids)) {
      const { t, env } = probes();
      const headers = { ...(body ? JSON_H : {}), ...(spec.token ? { "cf-access-jwt-assertion": spec.token } : {}) };
      const req = new Request(URLBASE + path, { method, headers, body: body ? JSON.stringify(body) : undefined });
      let status, threw = false;
      try { status = (await handler(req, env, opts)).status; } catch (e) { threw = String(e.message).includes("PROBE_TOUCHED"); if (!threw) throw e; }
      cells++;
      if (spec.expect === "admin") {
        // admin: guard geçti → handler DB/KV'ye ulaşmalı (probe patladı) ya da kendi iş mantığı yanıtı (401/403 DEĞİL)
        assert.ok(threw || (status !== 401 && status !== 403), `${name}/admin: guard'dan geçmeli (status=${status})`);
        line[who] = threw ? "izin (DB'ye ulaştı)" : `izin (${status})`;
      } else if (spec.expect === "viewer") {
        assert.equal(status, 403, `${name}/viewer 403 olmalı (tüm admin modülleri admin-only; viewer yalnız Dashboard)`);
        assert.equal(t.n, 0, `${name}/viewer: DB'ye dokunulmamalı`);
        line[who] = "403";
      } else {
        assert.equal(status, spec.expect, `${name}/${who}: ${spec.expect} beklenir (gelen ${status})`);
        assert.equal(t.n, 0, `${name}/${who}: DB'ye dokunulmamalı (fail-closed, guard önce)`);
        line[who] = String(status);
      }
    }
    rows.push(line);
  }
  assert.equal(cells, 77);
  console.log("MATRIS_BEGIN\n" + JSON.stringify(rows) + "\nMATRIS_END");
});

test("fail-closed yapılandırma: ACCESS_AUD / ADMIN_EMAILS boşsa admin bile 403 (her handler)", async () => {
  const { identities, opts } = await makeIssuer();
  const admin = (await identities()).admin.token;
  for (const [name, handler, method, path, body] of ROUTES) {
    for (const broken of [{ ACCESS_AUD: "" }, { ADMIN_EMAILS: "", VIEWER_EMAILS: "" }, { ACCESS_TEAM_DOMAIN: "" }]) {
      const { t, env } = probes();
      const req = new Request(URLBASE + path, { method, headers: { ...(body ? JSON_H : {}), "cf-access-jwt-assertion": admin }, body: body ? JSON.stringify(body) : undefined });
      const res = await handler(req, { ...env, ...broken }, opts);
      assert.equal(res.status, 403, `${name} ${JSON.stringify(broken)} → 403`);
      assert.equal(t.n, 0);
    }
  }
});
