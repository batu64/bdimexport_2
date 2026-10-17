// FAZ_3 3.10 QA — STAGING SALT-OKUNUR smoke (yalnız GET/OPTIONS; hiçbir yazma/POST yok; ~12 istek → rate-limit'e takılmaz).
// Çalıştır (sen / CI): node qa/FAZ-3/staging-smoke.mjs   [STAGING_URL=https://… ile başka hedef]
// PRODUCTION'A KARŞI ÇALIŞTIRMA gerekirse yalnız bu aynı salt-okunur set (yazma yok) kullanılır.
const BASE = (process.env.STAGING_URL ?? "https://bdimexport-api-staging.banazcepte.workers.dev").replace(/\/+$/, "");
const OK_ORIGIN = process.env.OK_ORIGIN ?? "https://staging.bdimexport.com";
const results = [];
const t = async (name, fn) => {
  try { const r = await fn(); results.push({ name, ok: r === true, detail: r === true ? "" : String(r) }); }
  catch (e) { results.push({ name, ok: false, detail: "İSTİSNA: " + (e?.message ?? e) }); }
};
const get = (p, init = {}) => fetch(BASE + p, { redirect: "manual", ...init });
const eq = (a, b, what) => (a === b ? true : `${what}: beklenen ${b}, gelen ${a}`);

await t("GET /api/v1/health → 200 {ok:true}", async () => { const r = await get("/api/v1/health"); const j = await r.json(); return r.status === 200 && j.ok === true || `status ${r.status}`; });
await t("health yanıtında x-content-type-options: nosniff", async () => eq((await get("/api/v1/health")).headers.get("x-content-type-options"), "nosniff", "header"));
await t("GET /api/v1/contents (anahtarsız) → 200, draft YOK", async () => {
  const r = await get("/api/v1/contents?limit=100"); if (r.status !== 200) return `status ${r.status}`;
  const j = await r.json(); return (Array.isArray(j.data) && j.data.every((c) => c.status !== "draft")) || "draft sızıyor veya data dizisi yok";
});
await t("GET /api/v1/partners anahtarsız → 401", async () => eq((await get("/api/v1/partners")).status, 401, "status"));
await t("GET /api/v1/partners geçersiz key → 401", async () => eq((await get("/api/v1/partners", { headers: { authorization: "Bearer bdx_" + "A".repeat(43) } })).status, 401, "status"));
await t("GET /api/v1/leads anahtarsız → 401 (PII ucu)", async () => eq((await get("/api/v1/leads")).status, 401, "status"));
await t("GET /api/v1/keys anahtarsız → 401", async () => eq((await get("/api/v1/keys")).status, 401, "status"));
await t("GET /admin/api/me Access JWT'siz → 401", async () => eq((await get("/admin/api/me")).status, 401, "status"));
await t("GET /admin/api/me sahte JWT → 403 (fail-closed)", async () => eq((await get("/admin/api/me", { headers: { "cf-access-jwt-assertion": "a.b.c" } })).status, 403, "status"));
await t("GET /admin/api/dashboard/summary JWT'siz → 401 (PII yok, rota keşfi yok)", async () => eq((await get("/admin/api/dashboard/summary")).status, 401, "status"));
await t("CORS: izinsiz origin → 403, ACAO yok", async () => {
  const r = await get("/api/v1/health", { headers: { origin: "https://evil.example" } });
  return (r.status === 403 && r.headers.get("access-control-allow-origin") === null) || `status ${r.status} acao=${r.headers.get("access-control-allow-origin")}`;
});
await t(`CORS preflight: izinli origin (${OK_ORIGIN}) → 204 + ACAO yansır`, async () => {
  const r = await get("/api/v1/contents", { method: "OPTIONS", headers: { origin: OK_ORIGIN, "access-control-request-method": "GET" } });
  return (r.status === 204 && r.headers.get("access-control-allow-origin") === OK_ORIGIN) || `status ${r.status} acao=${r.headers.get("access-control-allow-origin")}`;
});
await t("bilinmeyen rota → 404 JSON, yığın izi/ham hata YOK", async () => {
  const r = await get("/api/v1/yok"); const txt = await r.text();
  return (r.status === 404 && !/at .*\.(ts|js):\d+|stack|SQLITE|D1_ERROR/i.test(txt)) || `status ${r.status}: ${txt.slice(0, 80)}`;
});

let fail = 0;
for (const r of results) { if (!r.ok) fail++; console.log(`${r.ok ? "✔" : "✘"} ${r.name}${r.detail ? " — " + r.detail : ""}`); }
console.log(`\nHedef: ${BASE}\nSonuç: ${results.length - fail}/${results.length} geçti`);
process.exit(fail ? 1 : 0);
