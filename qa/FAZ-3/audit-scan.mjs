// FAZ_3 3.10 QA — Audit KOD TARAMASI: repodaki HER D1 yazma ifadesi (INSERT/UPDATE/DELETE) için withAudit/auditStatement kapsamı.
// Yöntem: kaynakta yazma SQL'i bul → aynı fonksiyon bloğunda (±14 satır) withAudit( | auditStatement( | writeAudit( ara.
// Çıkış kodu 1 = açıklanmamış (allowlist dışı) kapsamsız yazma var. Çalıştır: node qa/FAZ-3/audit-scan.mjs
import fs from "node:fs";
import path from "node:path";

const ROOT = path.resolve(import.meta.dirname, "../..");
const DIRS = ["app", "workers/api/src", "workers/cron-analytics/src"];
const WRITE = /(INSERT\s+(OR\s+\w+\s+)?INTO\s+(\w+)|UPDATE\s+(\w+)\s+SET|DELETE\s+FROM\s+(\w+))/i;
const AUDIT = /withAudit\(|auditStatement\(|writeAudit\(/;
// Bilinçli istisnalar: (dosya, tablo) → gerekçe. Yeni yazma noktası buraya EKLENMEDEN geçemez.
const ALLOW = {
  "workers/api/src/apply.ts|partners": "PUBLIC self-servis başvuru (admin aktörü yok); approved=0 sabit, Turnstile+rate-limit+KVKK rızası; KVKK rıza kaydı satırın kendisidir",
  "workers/cron-analytics/src/sync.ts|analytics_daily": "sistem cron'u (insan aktörü yok); idempotent upsert; kaynak verisi, yönetici kararı değil",
  "app/admin/audit.ts|admin_actions": "audit tablosunun kendisi",
};

function walk(d, out = []) {
  for (const e of fs.readdirSync(d, { withFileTypes: true })) {
    if (e.name === "node_modules" || e.name === ".next") continue;
    const p = path.join(d, e.name);
    if (e.isDirectory()) walk(p, out);
    else if (/\.(ts|tsx)$/.test(e.name) && !/\.test\./.test(e.name) && !/\.d\.ts$/.test(e.name)) out.push(p);
  }
  return out;
}

const rows = [];
for (const dir of DIRS) for (const f of walk(path.join(ROOT, dir))) {
  const rel = path.relative(ROOT, f).split(path.sep).join("/");
  const lines = fs.readFileSync(f, "utf8").split("\n");
  lines.forEach((ln, i) => {
    if (/^\s*(\/\/|\*)/.test(ln)) return;
    const m = ln.match(WRITE);
    if (!m) return;
    const table = m[3] ?? m[4] ?? m[5];
    const win = lines.slice(Math.max(0, i - 14), i + 15).join("\n");
    const covered = AUDIT.test(win);
    const allow = ALLOW[`${rel}|${table}`];
    rows.push({ file: rel, line: i + 1, table, op: m[0].split(/\s+/)[0].toUpperCase(), covered, allow });
  });
}

let bad = 0;
console.log("DOSYA:SATIR | İŞLEM | TABLO | AUDIT-KAPSAMI");
for (const r of rows) {
  const status = r.covered ? "✔ withAudit/writeAudit yakınında" : r.allow ? `○ İSTİSNA — ${r.allow}` : "✘ KAPSAMSIZ";
  if (!r.covered && !r.allow) bad++;
  console.log(`${r.file}:${r.line} | ${r.op} | ${r.table} | ${status}`);
}
// aksiyon adları
const actions = new Map();
for (const dir of DIRS) for (const f of walk(path.join(ROOT, dir))) {
  const src = fs.readFileSync(f, "utf8");
  for (const m of src.matchAll(/action:\s*"([a-z_]+)"/g)) actions.set(m[1], path.relative(ROOT, f).split(path.sep).join("/"));
}
console.log("\nAUDIT AKSİYON ADLARI (kodda): " + [...actions].map(([a, f]) => `${a} (${f})`).join(", "));
console.log(`\nToplam yazma noktası: ${rows.length} · kapsamlı: ${rows.filter((r) => r.covered).length} · istisna: ${rows.filter((r) => !r.covered && r.allow).length} · KAPSAMSIZ: ${bad}`);
process.exit(bad ? 1 : 0);
