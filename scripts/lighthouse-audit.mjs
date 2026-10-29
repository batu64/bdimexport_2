// Tasarım QA (D9) — Lighthouse toplu ölçüm: node scripts/lighthouse-audit.mjs <lighthouse/cli/index.js> <base-url> [çıktı.json] [desktop]
// Statik export'u scripts/serve-static.mjs ile sunun. Varsayılan profil: mobil (Lighthouse varsayılanı: yavaş 4G + 4× CPU).
// Tarayıcı: CHROME_PATH (yoksa Edge varsayılan yolu). Çıktı: kategori puanları + LCP/CLS/TBT özeti (tam rapor yazılmaz).
import { execFileSync } from "node:child_process";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";

const [bin, base, out = "qa/TASARIM/lighthouse.json", mode = "mobile"] = process.argv.slice(2);
const CHROME = process.env.CHROME_PATH ?? "C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe";
const PAGES = ["/", "/en", "/de", "/zh", "/ithalat/tedarik", "/en/products/olive-oil", "/en/ar"];
const tmp = fs.mkdtempSync(path.join(os.tmpdir(), "lh-"));
const rows = [];
for (const p of PAGES) {
  const file = path.join(tmp, "r.json");
  const args = [`${base}${p}`, "--quiet", "--output=json", `--output-path=${file}`, "--chrome-flags=--headless --no-first-run",
    "--only-categories=performance,accessibility,best-practices,seo"];
  if (mode === "desktop") args.push("--preset=desktop");
  // kabuk YOK: --chrome-flags içindeki boşluklar bölünmesin (cli doğrudan node ile)
  execFileSync(process.execPath, [bin, ...args], { env: { ...process.env, CHROME_PATH: CHROME }, stdio: ["ignore", "ignore", "inherit"] });
  const r = JSON.parse(fs.readFileSync(file, "utf8"));
  const c = r.categories, a = r.audits;
  const fails = Object.values(a).filter((x) => x.score !== null && x.score < 0.9 && ["binary", "numeric"].includes(x.scoreDisplayMode) && x.details?.type !== "debugdata")
    .map((x) => x.id).slice(0, 8);
  rows.push({
    page: p,
    performance: Math.round(c.performance.score * 100), accessibility: Math.round(c.accessibility.score * 100),
    bestPractices: Math.round(c["best-practices"].score * 100), seo: Math.round(c.seo.score * 100),
    lcp_ms: Math.round(a["largest-contentful-paint"].numericValue), cls: +a["cumulative-layout-shift"].numericValue.toFixed(3),
    tbt_ms: Math.round(a["total-blocking-time"].numericValue), fcp_ms: Math.round(a["first-contentful-paint"].numericValue),
    lowAudits: fails,
  });
  console.log(JSON.stringify(rows.at(-1)));
}
fs.writeFileSync(out, JSON.stringify({ mode, base, date: new Date().toISOString(), lighthouse: "13.5.0", rows }, null, 2) + "\n");
