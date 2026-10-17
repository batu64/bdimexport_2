// FAZ_3 3.7 test — node --experimental-strip-types --test app/admin/analytics/analytics.test.mjs
import test from "node:test";
import assert from "node:assert/strict";
import { handleAnalyticsSummary } from "./handler.ts";
import { _resetJwksCache } from "../middleware.ts";

const TEAM = "bdimexport.cloudflareaccess.com";
const AUD = "test-aud-tag";
const NOW = 1_800_000_000_000;

const b64u = (b) => Buffer.from(b).toString("base64url");
const mk = async () => {
  const kp = await crypto.subtle.generateKey(
    { name: "RSASSA-PKCS1-v1_5", modulusLength: 2048, publicExponent: new Uint8Array([1, 0, 1]), hash: "SHA-256" },
    true,
    ["sign", "verify"]
  );
  const jwk = { ...(await crypto.subtle.exportKey("jwk", kp.publicKey)), kid: "k1" };
  return { kp, jwk };
};

const sign = async (kp, claims, header = { alg: "RS256", kid: "k1" }) => {
  const h = b64u(JSON.stringify(header)), p = b64u(JSON.stringify(claims));
  const s = await crypto.subtle.sign("RSASSA-PKCS1-v1_5", kp.privateKey, new TextEncoder().encode(`${h}.${p}`));
  return `${h}.${p}.${b64u(new Uint8Array(s))}`;
};

const good = (o = {}) => ({
  iss: `https://${TEAM}`,
  aud: [AUD],
  exp: NOW / 1000 + 600,
  iat: NOW / 1000,
  email: "boss@example.com",
  sub: "u1",
  ...o,
});

function fakeDb(historyRows = [], leadsRows = []) {
  return {
    prepare(sql) {
      return {
        bind(...args) {
          return {
            all: async () => {
              if (sql.includes("FROM analytics_daily")) {
                return { results: historyRows };
              }
              if (sql.includes("FROM leads")) {
                return { results: leadsRows };
              }
              return { results: [] };
            },
            first: async () => null,
          };
        },
        all: async () => {
          if (sql.includes("FROM analytics_daily")) {
            return { results: historyRows };
          }
          if (sql.includes("FROM leads")) {
            return { results: leadsRows };
          }
          return { results: [] };
        },
      };
    },
  };
}

test("handleAnalyticsSummary: unauthenticated request returns 401", async () => {
  const db = fakeDb();
  const env = {
    DB: db,
    ACCESS_TEAM_DOMAIN: TEAM,
    ACCESS_AUD: AUD,
    ADMIN_EMAILS: "boss@example.com",
  };

  const req = new Request("https://bdimexport.com/admin/api/analytics/summary", { method: "GET" });
  const res = await handleAnalyticsSummary(req, env);
  assert.equal(res.status, 401);
});

test("handleAnalyticsSummary: authenticated admin gets aggregated analytics", async () => {
  const { kp, jwk } = await mk();
  const token = await sign(kp, good());

  const historyRows = [
    {
      day: "2026-10-09",
      locale: "all",
      ga4_json: JSON.stringify({
        sessions: 150,
        screenPageViews: 300,
        topPages: [
          { pagePath: "/en/products/olive-oil", sessions: 80 },
          { pagePath: "/tr/ihracat", sessions: 50 },
        ],
      }),
      gsc_json: JSON.stringify({
        clicks: 45,
        impressions: 600,
      }),
      meta_json: JSON.stringify({
        spend: 25.5,
      }),
    },
  ];

  const leadsRows = [
    { source_page: "/tr/ihracat", utm_json: JSON.stringify({ utm_source: "google" }) },
    { source_page: "/tr/ihracat", utm_json: JSON.stringify({ utm_source: "google" }) },
    { source_page: "/en/products/olive-oil", utm_json: null },
  ];

  const db = fakeDb(historyRows, leadsRows);
  const env = {
    DB: db,
    ACCESS_TEAM_DOMAIN: TEAM,
    ACCESS_AUD: AUD,
    ADMIN_EMAILS: "boss@example.com",
  };

  const req = new Request("https://bdimexport.com/admin/api/analytics/summary", {
    method: "GET",
    headers: { "cf-access-jwt-assertion": token },
  });

  const res = await handleAnalyticsSummary(req, env, {
    now: NOW,
    fetcher: async () => ({ keys: [jwk] }),
  });

  assert.equal(res.status, 200);
  const data = await res.json();
  assert.equal(data.summary.totalSessions, 150);
  assert.equal(data.summary.totalClicks, 45);
  assert.equal(data.summary.totalImpressions, 600);
  assert.equal(data.summary.totalSpend, 25.5);
  assert.equal(data.history.length, 1);
  assert.equal(data.topPages[0].page, "/en/products/olive-oil");
  assert.equal(data.topPages[0].sessions, 80);
  assert.equal(data.leadSources[0].source, "google");
  assert.equal(data.leadSources[0].count, 2);
});

test("handleAnalyticsSummary: viewer rolü 403 (admin-only), veri yoksa admin için boş diziler", async () => {
  _resetJwksCache(); // önceki testin JWKS önbelleği (farklı anahtar) imzayı bozmasın
  const { kp, jwk } = await mk();
  const opts = { now: NOW, fetcher: async () => ({ keys: [jwk] }) };
  const base = { DB: fakeDb(), ACCESS_TEAM_DOMAIN: TEAM, ACCESS_AUD: AUD, ADMIN_EMAILS: "boss@example.com", VIEWER_EMAILS: "view@example.com" };
  const call = async (email) =>
    handleAnalyticsSummary(
      new Request("https://bdimexport.com/admin/api/analytics/summary", { headers: { "cf-access-jwt-assertion": await sign(kp, good({ email })) } }),
      base,
      opts,
    );

  const v = await call("view@example.com");
  assert.equal(v.status, 403);
  assert.equal((await v.json()).error, "admin_only");

  const a = await call("boss@example.com");
  assert.equal(a.status, 200);
  const d = await a.json();
  assert.deepEqual([d.history, d.leadSources, d.topPages], [[], [], []]);
  assert.equal(d.summary.totalSessions, 0);
});
