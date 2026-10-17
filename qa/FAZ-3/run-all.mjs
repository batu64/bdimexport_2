// FAZ_3 3.10 QA — tüm paketleri sırayla koşar, SAYIM tablosu basar (kaç/kaç). Çalıştır (repo kökünden): node qa/FAZ-3/run-all.mjs [--smoke]
// --smoke: staging salt-okunur smoke da koşar (ağ gerekir). Çıkış kodu = beklenmeyen kırmızı sayısı (bilinen bulgular "BULGU" olarak sayılır).
import { spawnSync } from "node:child_process";
import path from "node:path";

const ROOT = path.resolve(import.meta.dirname, "../..");
const smoke = process.argv.includes("--smoke");
const run = (cmd, args, cwd = ROOT) => spawnSync(cmd, args, { cwd, encoding: "utf8", shell: process.platform === "win32" && !/^node/.test(cmd), maxBuffer: 1 << 26 });
const NODE = ["--experimental-strip-types", "--test"];
const num = (s, re) => Number((s.match(re) ?? [])[1] ?? 0);

const rows = [];
const nodeSuite = (label, file) => {
  const r = run("node", [...NODE, file]);
  const o = r.stdout + r.stderr;
  rows.push({ label, kind: "node:test", total: num(o, /# tests (\d+)/), pass: num(o, /# pass (\d+)/), fail: num(o, /# fail (\d+)/), todo: num(o, /# todo (\d+)/) });
};
const vitest = (label, cwd, extra = []) => {
  const r = run("npx", ["vitest", "run", ...extra], path.join(ROOT, cwd));
  const o = (r.stdout + r.stderr).replace(/\u001b\[[0-9;]*m/g, "");
  const line = (o.match(/Tests\s+(.*)/) ?? [])[1] ?? "";
  const passed = num(line, /(\d+) passed/), failed = num(line, /(\d+) failed/), xfail = num(line, /(\d+) expected fail/);
  rows.push({ label, kind: "vitest", total: passed + failed + xfail, pass: passed, fail: failed, todo: xfail });
};
const script = (label, file, knownFinding = "") => {
  const r = run("node", [file]);
  rows.push({ label, kind: "script", total: 1, pass: r.status === 0 ? 1 : 0, fail: r.status === 0 || knownFinding ? 0 : 1, todo: r.status === 0 ? 0 : knownFinding ? 1 : 0, note: r.status === 0 ? "" : knownFinding });
};

// — dev'in kendi testleri (regresyon)
for (const f of ["app/admin/e2e/access.test.mjs", "app/admin/leads/leads.test.mjs", "app/admin/partners/partners.test.mjs", "app/admin/content/e2e/content.test.mjs",
  "app/admin/content/e2e/handler.test.mjs", "app/admin/analytics/analytics.test.mjs", "app/admin/settings/settings.test.mjs", "app/admin/settings/settings.ext.test.mjs", "app/admin/_lib/nav.test.mjs"]) nodeSuite("dev  " + f, f);
vitest("dev  workers/api (vitest)", "workers/api");
vitest("dev  workers/cron-analytics (vitest)", "workers/cron-analytics");
// — QA'nın BAĞIMSIZ paketleri
nodeSuite("QA   yetkilendirme matrisi (77 hücre)", "qa/FAZ-3/authz-matrix.test.mjs");
nodeSuite("QA   audit davranış (gerçek SQL)", "qa/FAZ-3/audit-behavior.test.mjs");
vitest("QA   api: key/tier/CORS/rate-limit/SQLi fuzz", "workers/api", ["--config", "../../qa/FAZ-3/vitest.api.config.mjs"]);
script("QA   audit kod taraması", "qa/FAZ-3/audit-scan.mjs", "F-03 (2 kapsamsız yazma: seedMockDraftForJob)");
script("QA   SQLi statik tarama", "qa/FAZ-3/sqli-static-scan.mjs");
script("QA   secret taraması (gitleaks eşdeğeri)", "qa/FAZ-3/secret-scan.mjs");
script("QA   env/secret envanter çapraz kontrol", "qa/FAZ-3/env-crosscheck.mjs", "F-05 (3 eksik kayıt)");
if (smoke) script("QA   staging salt-okunur smoke", "qa/FAZ-3/staging-smoke.mjs");

let T = 0, P = 0, F = 0, X = 0;
console.log("PAKET | TÜR | TOPLAM | GEÇTİ | KIRMIZI | BULGU(todo/expected-fail)");
for (const r of rows) {
  T += r.total; P += r.pass; F += r.fail; X += r.todo;
  console.log(`${r.label} | ${r.kind} | ${r.total} | ${r.pass} | ${r.fail} | ${r.todo}${r.note ? " — " + r.note : ""}`);
}
console.log(`\nTOPLAM: ${T} · geçti ${P} · KIRMIZI ${F} · bilinen bulgu (todo/expected-fail) ${X}`);
process.exit(F ? 1 : 0);
