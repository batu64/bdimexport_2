// FAZ_4 4.9 QA — tüm paketleri sırayla koşar, SAYIM tablosu basar. Çalıştır (repo kökünden): node qa/FAZ-4/run-all.mjs
// Çıkış kodu = beklenmeyen kırmızı var mı (bilinen bulgular "BULGU" sayılır). Runtime AI = mock/stub (gerçek Gemini E3'te doğrulanacak).
import { spawnSync } from "node:child_process";
import path from "node:path";

const ROOT = path.resolve(import.meta.dirname, "../..");
const run = (cmd, args, cwd = ROOT) => spawnSync(cmd, args, { cwd, encoding: "utf8", shell: process.platform === "win32" && !/^node/.test(cmd), maxBuffer: 1 << 26 });
const num = (s, re) => Number((s.match(re) ?? [])[1] ?? 0);
const rows = [];
const vitest = (label, cwd, extra = []) => {
  const r = run("npx", ["vitest", "run", ...extra], path.join(ROOT, cwd));
  const line = ((r.stdout + r.stderr).replace(/\u001b\[[0-9;]*m/g, "").match(/Tests\s+(.*)/) ?? [])[1] ?? "";
  const passed = num(line, /(\d+) passed/), failed = num(line, /(\d+) failed/), xfail = num(line, /(\d+) expected fail/);
  rows.push({ label, kind: "vitest", total: passed + failed + xfail, pass: passed, fail: failed || (passed ? 0 : 1), todo: xfail });
};
const script = (label, file, args = [], knownFinding = "") => {
  const r = run("node", [file, ...args]);
  const ok = r.status === 0;
  rows.push({ label, kind: "script", total: 1, pass: ok ? 1 : 0, fail: ok || knownFinding ? 0 : 1, todo: ok ? 0 : knownFinding ? 1 : 0, note: ok ? "" : knownFinding });
};

// — dev'in kendi testleri (regresyon)
vitest("dev  workers/api", "workers/api");
vitest("dev  workers/cron-rss", "workers/cron-rss");
vitest("dev  workers/cron-trends", "workers/cron-trends");
vitest("dev  workers/cron-analytics", "workers/cron-analytics");
// — QA'nın BAĞIMSIZ FAZ-4 paketleri
vitest("QA   FAZ-4 e2e + onaysız yayın + otomasyon", "workers/cron-rss", ["--config", "../../qa/FAZ-4/vitest.config.mjs"]);
script("QA   FAZ-4 statik kontroller (S1–S5)", "qa/FAZ-4/static-checks.mjs");
// — FAZ-3 güvenlik QA regresyonu (admin node testleri dahil)
script("QA   FAZ-3 run-all (regresyon)", "qa/FAZ-3/run-all.mjs");

let T = 0, P = 0, F = 0, X = 0;
console.log("PAKET | TÜR | TOPLAM | GEÇTİ | KIRMIZI | BULGU(todo/expected-fail)");
for (const r of rows) {
  T += r.total; P += r.pass; F += r.fail; X += r.todo;
  console.log(`${r.label} | ${r.kind} | ${r.total} | ${r.pass} | ${r.fail} | ${r.todo}${r.note ? " — " + r.note : ""}`);
}
console.log(`\nTOPLAM: ${T} · geçti ${P} · KIRMIZI ${F} · bilinen bulgu ${X}  (FAZ-3 run-all ayrıntısı: qa/FAZ-4/evidence/regression-faz3-run-all.txt)`);
process.exit(F ? 1 : 0);
