// FAZ_3 3.10 QA — SQL enjeksiyon STATİK taraması: SQL içeren HER şablon dizesindeki ${...} enterpolasyonu (inline .prepare(`…`) VE
// `const sql = \`…\`` ile değişkende kurulanlar) + '+' ile birleştirme. Her nokta elle sınıflandırılmıştır (REVIEWED): enterpole edilen
// parça sabit / beyaz liste / yer tutucu ('?') olmalı; değerler daima .bind() ile. Gerekçesiz nokta = FAIL (çıkış kodu 1).
// Çalıştır: node qa/FAZ-3/sqli-static-scan.mjs
import fs from "node:fs";
import path from "node:path";

const ROOT = path.resolve(import.meta.dirname, "../..");
const DIRS = ["app", "workers/api/src", "workers/cron-analytics/src"];

// [dosya, enterpolasyon içinde aranan parça, gerekçe] — gerekçeler kaynak okunarak doğrulandı (rapor §5 tablosu)
const REVIEWED = [
  ["app/admin/leads/handler.ts", "COLS", "sabit kolon listesi (modül sabiti)"],
  ["app/admin/leads/handler.ts", "where.length", "where parçaları yalnız 'status = ?' ve ${k} = ? (k ∈ sabit ['locale','source_page','channel_pref']); değerler bind"],
  ["app/admin/leads/handler.ts", "LIST_LIMIT", "sayısal sabit"],
  ["app/admin/leads/handler.ts", "k} = ?", "k yalnız ['locale','source_page','channel_pref'] sabit dizisinden"],
  ["app/admin/partners/handler.ts", "PARTNER_COLS", "sabit kolon listesi"],
  ["app/admin/partners/handler.ts", "REJECTED_EXPR", "sabit SQL ifadesi"],
  ["app/admin/partners/handler.ts", "where", "where = 4 sabit dizeden biri (ternary); status LIST_STATUSES beyaz listesinden"],
  ["app/admin/partners/handler.ts", "LIST_LIMIT", "sayısal sabit"],
  ["app/admin/partners/handler.ts", "set.join", "set parçaları `${col} = ?`; col yalnız EDITABLE=[sector,certs,capacity,export_history] beyaz listesinden (lib.ts validatePatch; FORBIDDEN/bilinmeyen alan 400)"],
  ["app/admin/partners/handler.ts", "col} = ?", "col validatePatch izinli anahtarlarından (certs→certs_json)"],
  ["app/admin/content/service.ts", "set", "set = 2 sabit dizeden biri (status=? | status=?, published_at=datetime('now')); değerler bind"],
  ["app/admin/audit.ts", "AUDIT_COLS", "sabit INSERT başlığı (modül sabiti)"],
  ["app/admin/content/service.ts", "inList(", "inList = '?,?,?' yer tutucu üretir; id'ler bind"],
  ["workers/api/src/read.ts", 'statuses.map(() => "?")', "yalnız '?' yer tutucuları; statuses beyaz listeden"],
  ["workers/api/src/read.ts", 'locale ? "AND locale = ?"', "sabit dize; locale bind"],
  ["workers/api/src/read.ts", 'cursor ? "AND id > ?"', "sabit dize; cursor bind"],
  ["workers/api/src/read.ts", "where.length", "sabit where parçaları + ?"],
  ["workers/api/src/read.ts", "cols", "iki sabit kolon listesinden biri (ternary, tier'a göre)"],
];

function walk(d, out = []) {
  for (const e of fs.readdirSync(d, { withFileTypes: true })) {
    if (e.name === "node_modules" || e.name === ".next") continue;
    const p = path.join(d, e.name);
    if (e.isDirectory()) walk(p, out);
    else if (/\.(ts|tsx)$/.test(e.name) && !/\.test\./.test(e.name) && !/\.d\.ts$/.test(e.name)) out.push(p);
  }
  return out;
}

const TEMPLATE = new RegExp("`((?:[^`\\\\]|\\\\.)*)`", "gs");
const INTERP = new RegExp("\\$\\{((?:[^{}]|\\{[^{}]*\\})*)\\}", "g");
const SQLWORD = /\b(SELECT\s|INSERT\s+INTO|UPDATE\s+\w+\s+SET|DELETE\s+FROM)/i;
const CONCAT = new RegExp("([\"'])(?:SELECT|INSERT|UPDATE|DELETE)[^\"'\\n]*\\1\\s*\\+\\s*[A-Za-z_]", "g");

let unreviewed = 0, total = 0, sqlLiterals = 0;
for (const dir of DIRS) {
  for (const f of walk(path.join(ROOT, dir))) {
    const rel = path.relative(ROOT, f).split(path.sep).join("/");
    const src = fs.readFileSync(f, "utf8");
    for (const m of src.matchAll(TEMPLATE)) {
      const body = m[1];
      if (!SQLWORD.test(body)) continue;
      sqlLiterals++;
      const line = src.slice(0, m.index).split("\n").length;
      for (const it of body.matchAll(INTERP)) {
        total++;
        const rv = REVIEWED.find(([ff, frag]) => ff === rel && it[1].includes(frag));
        if (!rv) unreviewed++;
        console.log(`${rv ? "✔" : "✘"} ${rel}:${line} \${${it[1].slice(0, 64).replace(/\s+/g, " ")}}${rv ? " — " + rv[2] : " — GEREKÇESİZ"}`);
      }
    }
    for (const m of src.matchAll(CONCAT)) {
      unreviewed++;
      console.log(`✘ ${rel}:${src.slice(0, m.index).split("\n").length} '+' ile SQL birleştirme: ${m[0].slice(0, 60)}`);
    }
  }
}
console.log(`\nSQL içeren şablon dizesi: ${sqlLiterals} · enterpolasyon noktası: ${total} · gerekçesiz: ${unreviewed}`);
process.exit(unreviewed ? 1 : 0);
