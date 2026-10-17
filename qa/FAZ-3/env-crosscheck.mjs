// FAZ_3 3.10 QA — secret/env envanteri ÇAPRAZ KONTROLÜ: kodun gerçekten OKUDUĞU değişkenler ↔ docs/secret-envanteri.md.
// Kaynaklar: Env/AdminEnv arayüz alanları (workers + app/admin), process.env.X (app, lib, scripts, workers), wrangler.toml var adları,
// .github/workflows `secrets.X`. İki yön: kodda var/envanterde yok (EKSİK KAYIT) · envanterde var/kodda yok (HAYALET KAYIT).
// Çalıştır: node qa/FAZ-3/env-crosscheck.mjs
import fs from "node:fs";
import path from "node:path";

const ROOT = path.resolve(import.meta.dirname, "../..");
const read = (f) => fs.readFileSync(path.join(ROOT, f), "utf8");
const walk = (d, out = []) => {
  if (!fs.existsSync(path.join(ROOT, d))) return out;
  for (const e of fs.readdirSync(path.join(ROOT, d), { withFileTypes: true })) {
    if (["node_modules", ".next", "out", ".wrangler"].includes(e.name)) continue;
    const rel = path.posix.join(d, e.name);
    if (e.isDirectory()) walk(rel, out);
    else if (/\.(ts|tsx|mjs|js|toml|yml|yaml)$/.test(e.name) && !/\.test\./.test(e.name) && !/\.d\.ts$/.test(e.name)) out.push(rel);
  }
  return out;
};

const BINDINGS = new Set(["DB", "MEDIA", "CACHE"]); // wrangler binding'leri: secret değil
const code = new Map(); // ad → [kaynaklar]
const add = (n, src) => { if (BINDINGS.has(n)) return; code.set(n, [...(code.get(n) ?? []), src]); };

// 1) Env arayüzleri
for (const f of ["workers/api/src/types.ts", "workers/cron-analytics/src/types.ts"]) {
  const src = read(f);
  const body = src.slice(src.indexOf("export interface Env"));
  for (const m of body.slice(0, body.indexOf("\n}\n")).matchAll(/^\s+([A-Z][A-Z0-9_]+)\??:/gm)) add(m[1], f);
}
for (const f of walk("app/admin")) {
  const src = read(f);
  for (const m of src.matchAll(/interface\s+\w*Env\b[^{]*\{([^}]*)\}/g)) for (const x of m[1].matchAll(/^\s*([A-Z][A-Z0-9_]+)\??:/gm)) add(x[1], f);
}
// 2) process.env.X
for (const d of ["app", "lib", "scripts", "workers/api/src", "workers/api/scripts", "workers/cron-analytics/src", "workers/cron-analytics/scripts", "next.config.ts"]) {
  for (const f of d.endsWith(".ts") ? [d] : walk(d)) for (const m of read(f).matchAll(/process\.env\.([A-Z][A-Z0-9_]+)/g)) add(m[1], f);
}
// 3) wrangler.toml [vars]
for (const f of ["workers/api/wrangler.toml", "workers/cron-analytics/wrangler.toml", "wrangler.toml"]) {
  if (!fs.existsSync(path.join(ROOT, f))) continue;
  for (const m of read(f).matchAll(/^([A-Z][A-Z0-9_]+)\s*=\s*/gm)) add(m[1], f);
}
// 4) GitHub Actions secrets
for (const f of walk(".github/workflows")) for (const m of read(f).matchAll(/secrets\.([A-Z][A-Z0-9_]+)/g)) add(m[1], f);

// Envanter: backtick içindeki UPPER_CASE adlar (ve `A`, `B`, `C_*` sözdizimi)
const doc = read("docs/secret-envanteri.md");
const docNames = new Set();
for (const m of doc.matchAll(/`([^`]+)`/g)) for (const t of m[1].split(/[,\s/]+/)) { const n = t.replace(/[^A-Z0-9_*]/g, ""); if (/^[A-Z][A-Z0-9_]{2,}\*?$/.test(n)) docNames.add(n); }
const inDoc = (n) => docNames.has(n) || [...docNames].some((d) => d.endsWith("*") && n.startsWith(d.slice(0, -1)));

// Kod tarafında olup envanterin amacı dışında kalan (ortam/derleme değişkeni) adlar
const NOT_SECRET_ENV = new Set(["NODE_ENV", "CI", "GITHUB_TOKEN", "GITHUB_ACTIONS", "NEXT_TELEMETRY_DISABLED", "NODE_OPTIONS", "PORT", "CRON_ANALYTICS_URL", "CF_PAGES_PROJECT"]);

const missing = [...code].filter(([n]) => !inDoc(n) && !NOT_SECRET_ENV.has(n));
const ghost = [...docNames].filter((n) => !n.endsWith("*") && !code.has(n) && !/^(CLOUDFLARE_API_TOKEN|GEMINI_API_KEY|RESEND_API_KEY|BREVO_API_KEY|GITHUB_TOKEN)$/.test(n));

console.log(`Kodda okunan ad: ${code.size} · envanterde geçen ad: ${docNames.size}`);
console.log("\nKODDA VAR / ENVANTERDE YOK (EKSİK KAYIT):" + (missing.length ? "" : " yok ✔"));
for (const [n, src] of missing) console.log(`  ✘ ${n}  ← ${[...new Set(src)].join(", ")}`);
console.log("\nENVANTERDE VAR / KODDA YOK (hayalet kayıt; bilinçli ertelenenler hariç):" + (ghost.length ? "" : " yok ✔"));
for (const n of ghost) console.log(`  ? ${n}`);
console.log("\nBilinçli ertelenen (kodda referansı olmaması BEKLENEN): GEMINI_API_KEY (AGENTS §9), RESEND_API_KEY/BREVO_API_KEY (E5, FAZ 8)");
const exp = ["RESEND_API_KEY", "BREVO_API_KEY", "GEMINI_API_KEY"].filter((n) => code.has(n));
console.log(exp.length ? `  ✘ ertelenen ad kodda BULUNDU: ${exp.join(",")}` : "  ✔ ertelenen adların hiçbiri kodda yok (envanter 'kodda referans YOK' iddiası doğru)");
console.log("\nTÜM KOD ADLARI: " + [...code.keys()].sort().join(", "));
process.exit(missing.length ? 1 : 0);
