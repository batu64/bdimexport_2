// FAZ_4 4.9 QA — STATİK KONTROLLER (bağımsız; kod çalıştırmaz, kaynağı okur). Çalıştır (repo kökünden): node qa/FAZ-4/static-checks.mjs
// S1 prod D1 izolasyonu · S2 yayın kapısı (content status yazanlar) · S3 üretim tüketicisi yalnız draft · S4 runtime AI = yalnız Gemini · S5 E3 stub işaretleri.
// Çıkış kodu 1 = en az bir KIRMIZI. Her kontrol kanıt satırlarını basar (kanıtsız pass yok).
import fs from "node:fs";
import path from "node:path";

const ROOT = path.resolve(import.meta.dirname, "../..");
const rd = (p) => fs.readFileSync(path.join(ROOT, p), "utf8");
const walk = (dir, out = []) => {
  const abs = path.join(ROOT, dir);
  if (!fs.existsSync(abs)) return out;
  for (const e of fs.readdirSync(abs, { withFileTypes: true })) {
    if (["node_modules", ".next", "out", ".wrangler", "evidence"].includes(e.name)) continue;
    const rel = path.posix.join(dir, e.name);
    if (e.isDirectory()) walk(rel, out);
    else out.push(rel);
  }
  return out;
};
const isTest = (f) => /\.test\.|\/test\/|^qa\//.test(f);
const SRC = ["workers", "app", "lib"].flatMap((d) => walk(d)).filter((f) => /\.(ts|tsx|mjs|js)$/.test(f) && !isTest(f));
const grep = (files, re) => files.flatMap((f) => rd(f).split("\n").map((l, i) => ({ f, n: i + 1, l })).filter((x) => re.test(x.l)));

const results = [];
const check = (id, title, pass, evidence) => results.push({ id, title, pass, evidence });

// S1 — prod D1 izolasyonu: cron worker'larında production env YOK; test/QA/paket betiklerinde prod D1'e uzak yazım YOK
const PROD_DB_ID = (rd("workers/api/wrangler.toml").match(/\[\[env\.production\.d1_databases\]\][\s\S]*?database_id\s*=\s*"([^"]+)"/) ?? [])[1];
check("S1a", "api wrangler'da prod D1 id bulundu (referans)", !!PROD_DB_ID, [`prod database_id = ${PROD_DB_ID ? PROD_DB_ID.slice(0, 8) + "…" : "YOK"}`]);
for (const w of ["cron-rss", "cron-trends", "cron-analytics"]) {
  const t = rd(`workers/${w}/wrangler.toml`);
  const ids = [...t.matchAll(/database_id\s*=\s*"([^"]+)"/g)].map((m) => m[1]);
  check(`S1-${w}`, `${w}: [env.production] yok + prod D1 id yok`, !/\[env\.production/.test(t) && !ids.includes(PROD_DB_ID), [`env blokları: ${[...t.matchAll(/^\[env\.([a-z]+)\]/gm)].map((m) => m[1]).join(",") || "—"}`, `database_id: ${ids.join(", ")}`]);
}
const testFiles = [...walk("qa"), ...walk("workers").filter((f) => /\/test\//.test(f)), ...walk("app").filter((f) => /\.test\./.test(f))].filter((f) => /\.(m?[jt]s|mts)$/.test(f) && f !== "qa/FAZ-4/static-checks.mjs");
const pkgs = ["package.json", ...fs.readdirSync(path.join(ROOT, "workers")).map((w) => `workers/${w}/package.json`).filter((p) => fs.existsSync(path.join(ROOT, p)))];
const remoteProd = grep([...testFiles, ...pkgs], /--remote[\s\S]*production|--env[= ]production[\s\S]*--remote/).concat(PROD_DB_ID ? grep([...testFiles, ...pkgs], new RegExp(PROD_DB_ID)) : []);
check("S1b", `test/QA (${testFiles.length} dosya) + package.json betikleri (${pkgs.length}): prod uzak yazım/prod D1 id YOK`, remoteProd.length === 0, remoteProd.length ? remoteProd.map((x) => `${x.f}:${x.n}`) : ["0 eşleşme"]);

// S2 — yayın kapısı: contents.status'u 'published' yapan TEK yer publish.ts; her UPDATE 'approved' + publications 'live' koşullu
const pubWrites = grep(SRC, /UPDATE contents SET status\s*=\s*'published'/);
check("S2a", "contents→'published' yazımı yalnız workers/api/src/publish/publish.ts", pubWrites.length > 0 && pubWrites.every((x) => x.f === "workers/api/src/publish/publish.ts"), pubWrites.map((x) => `${x.f}:${x.n}`));
check("S2b", "her 'published' UPDATE: WHERE status='approved' AND publications.state='live'", pubWrites.every((x) => /status = 'approved' AND EXISTS \(SELECT 1 FROM publications WHERE id = \? AND state = 'live'\)/.test(x.l)), pubWrites.map((x) => `${x.f}:${x.n}`));
const dyn = grep(SRC, /UPDATE contents SET \$\{/);
const callers = grep(["app/admin/content/service.ts"], /bulkTransition\(ids/).filter((x) => !/async function/.test(x.l));
check("S2c", "dinamik status UPDATE (service.bulkTransition) yalnız draft→approved için çağrılıyor", dyn.length === 1 && callers.length === 1 && /"draft", "approved"/.test(callers[0].l), [...dyn, ...callers].map((x) => `${x.f}:${x.n}: ${x.l.trim().slice(0, 110)}`));
const patchRO = /READ_ONLY|field_read_only/.test(rd("app/admin/content/service.ts") + rd("app/admin/content/handler.ts"));
check("S2d", "PATCH status/published_at alanları salt-okunur (field_read_only) kodda mevcut", patchRO, ["service/handler: field_read_only"]);
const readTs = rd("workers/api/src/read.ts");
check("S2e", "public GET /v1/contents: anahtarsız/partner → yalnız published; başka durum yalnız admin-internal tier", /key\?\.tier === "admin-internal" && st \? \[st\] : \["published"\]/.test(readTs), grep(["workers/api/src/read.ts"], /published/).map((x) => `${x.f}:${x.n}: ${x.l.trim().slice(0, 100)}`));

// S3 — üretim tüketicisi (cron worker'ları) içerik durumunu yalnız 'draft' yazar; approved/published literali hiç yok
const cronSrc = SRC.filter((f) => /^workers\/cron-/.test(f));
const ins = grep(cronSrc, /INSERT INTO contents/);
const lit = grep(cronSrc, /['"](approved|published)['"]/);
check("S3", `cron worker'ları (${cronSrc.length} dosya): contents INSERT hep 'draft'; approved/published literali 0`, ins.length > 0 && ins.every((x) => /'draft'/.test(x.l)) && lit.length === 0, [...ins.map((x) => `${x.f}:${x.n} INSERT … 'draft'`), `approved/published literali: ${lit.length}`]);

// S4 — runtime AI = yalnız Gemini (AGENTS §3/§8.6): başka sağlayıcı SDK/uç nokta/binding yok (yorumlar hariç)
const code = (l) => l.replace(/\/\/.*$/, "").replace(/^\s*\*.*$/, "").replace(/#.*$/, "");
const PROV = /openai|anthropic|api\.mistral|cohere|ollama|deepseek|dashscope|bigmodel|zhipu|replicate|together\.ai|@cf\/|\benv\.AI\b|workers-ai/i;
const prov = [...SRC, ...walk("workers").filter((f) => /wrangler\.toml$/.test(f))].flatMap((f) => rd(f).split("\n").map((l, i) => ({ f, n: i + 1, l })).filter((x) => PROV.test(code(x.l)) || (/wrangler\.toml$/.test(x.f) && /^\s*\[ai\]/.test(x.l))));
const gem = grep(SRC, /generativelanguage\.googleapis\.com/);
check("S4", "runtime AI: Gemini dışı sağlayıcı 0 (kod satırı) · Gemini uç noktası mevcut", prov.length === 0 && gem.length > 0, [...prov.map((x) => `İHLAL ${x.f}:${x.n}`), ...gem.map((x) => `gemini: ${x.f}:${x.n}`)]);

// S5 — E3 stub işaretleri: gerçek Gemini çağrısı yazılmadan önce yerler işaretli + çağrılırsa ModelNotConfigured
const e3 = grep(cronSrc, /TODO\(E3/);
const nc = grep(cronSrc, /throw new ModelNotConfigured/);
check("S5", "TODO(E3) işaretleri + yapılandırılmamış Gemini → ModelNotConfigured (sessiz başarı yok)", e3.length >= 2 && nc.length >= 2, [...e3, ...nc].map((x) => `${x.f}:${x.n}`));

let red = 0;
for (const r of results) {
  if (!r.pass) red++;
  console.log(`${r.pass ? "PASS" : "KIRMIZI"}  ${r.id}  ${r.title}`);
  for (const e of r.evidence) console.log(`        · ${e}`);
}
console.log(`\nSONUÇ: ${results.length - red}/${results.length} PASS · KIRMIZI ${red}`);
process.exit(red ? 1 : 0);
