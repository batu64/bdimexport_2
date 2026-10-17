// FAZ_3 3.10 QA — SECRET TARAMASI (gitleaks eşdeğeri kural seti; gitleaks ikilisi bu makinede KURULU DEĞİL — CI'daki gitleaks-action asıl kapı).
// Kapsam: (A) çalışma ağacı = git'in izlediği + izlenmeyen-ama-ignore-edilmeyen dosyalar; (B) TÜM git geçmişi, TÜM dallar (eklenen satırlar).
// Bulgular iki sınıfa ayrılır: ALLOW (gerekçeli, bilinen public/test değer) ve FINDING. Çıkış kodu 1 = FINDING var.
// Çalıştır: node qa/FAZ-3/secret-scan.mjs
import { execFileSync, spawn } from "node:child_process";
import fs from "node:fs";
import path from "node:path";
import readline from "node:readline";

const ROOT = path.resolve(import.meta.dirname, "../..");
const git = (...a) => execFileSync("git", a, { cwd: ROOT, encoding: "utf8", maxBuffer: 1 << 28 });

const RULES = [
  ["private-key-block", /-----BEGIN [A-Z ]*PRIVATE KEY-----/],
  ["aws-access-key", /\b(AKIA|ASIA)[0-9A-Z]{16}\b/],
  ["github-token", /\bgh[pousr]_[0-9A-Za-z]{30,}\b/],
  ["slack-token", /\bxox[abprs]-[0-9A-Za-z-]{10,}/],
  ["slack-webhook", /hooks\.slack\.com\/services\/T[0-9A-Z]+\/B[0-9A-Z]+\/[0-9A-Za-z]+/],
  ["discord-webhook", /discord(app)?\.com\/api\/webhooks\/\d+\/[\w-]{20,}/],
  ["google-api-key", /\bAIza[0-9A-Za-z_-]{35}\b/],
  ["google-oauth-token", /\bya29\.[0-9A-Za-z_-]{20,}/],
  ["stripe-key", /\b(sk|rk)_(live|test)_[0-9A-Za-z]{16,}/],
  ["meta-token", /\bEAA[0-9A-Za-z]{40,}/],
  ["jwt", /\beyJ[A-Za-z0-9_-]{10,}\.[A-Za-z0-9_-]{10,}\.[A-Za-z0-9_-]{10,}/],
  ["bdx-api-key", /\bbdx_[A-Za-z0-9_-]{43}\b/],
  ["turnstile-secret", /\b0x4AAAAAAA[A-Za-z0-9_-]{20,}/],
  ["cloudflare-token-assign", /(CLOUDFLARE_API_TOKEN|CF_API_TOKEN|api[_-]?token)["']?\s*[:=]\s*["'][A-Za-z0-9_-]{35,45}["']/i],
  ["generic-secret-assign", /(secret|passw(or)?d|api[_-]?key|access[_-]?token|private[_-]?key)["']?\s*[:=]\s*["'][A-Za-z0-9/+_=.-]{20,}["']/i],
  ["long-hex-64", /\b[0-9a-f]{64}\b/],
];

// Bilinen ve GEREKÇELİ değerler (gitleaks.toml allowlist karşılığı). Anahtar: kural|dosya-deseni|değer-parçası
const ALLOW = [
  { rule: "long-hex-64", file: /wrangler\.toml$|docs\/(access-setup|deploy|secret-envanteri)\.md$|\.template\.json$|FAZ_3_AJAN_PANOSU\.md$|ERTELENEN/, why: "ACCESS_AUD = Cloudflare Access AUD etiketi: PUBLIC config (JWT doğrulama girdisi; tek başına erişim vermez — wrangler.toml yorumunda belgeli)" },
  { rule: "long-hex-64", file: /(\.test\.|\/test\/|qa\/FAZ-3\/)/, why: "test sabiti / türetilmiş SHA-256 örneği" },
  { rule: "long-hex-64", file: /\.env\.example$/, why: ".env.example'daki ACCESS_AUD = PUBLIC config (diğer tüm secret alanları boş; anahtar adı + public değer referansı)" },
  { rule: "long-hex-64", file: /app\/admin\/leads\/fixtures\.ts$/, why: "KVKK_V1_SHA256 = YAYIMLANMIŞ rıza metninin SHA-256'sı (public sürüm kimliği; 'v1 (47ac2ef0a5b43264)' etiketinin kaynağı) — secret değil" },
  { rule: "private-key-block", file: /(\.test\.|\/test\/|qa\/FAZ-3\/)/, why: "secret-reddi testi için kasıtlı sahte PEM başlığı (anahtar gövdesi yok)" },
  { rule: "slack-webhook", file: /(\.test\.|\/test\/|qa\/FAZ-3\/)/, why: "secret-reddi testi için kasıtlı sahte webhook (T0/B0 yer tutucu)" },
  { rule: "long-hex-64", file: /pnpm-lock\.yaml$|package-lock/, why: "bütünlük hash'i (integrity) — secret değil" },
  { rule: "jwt", file: /(\.test\.|\/test\/|qa\/FAZ-3\/)/, why: "test için üretilen sahte JWT" },
  { rule: "generic-secret-assign", file: /(\.test\.|\/test\/|qa\/FAZ-3\/)/, why: "test sahte değeri" },
  { rule: "bdx-api-key", file: /(\.test\.|\/test\/|qa\/FAZ-3\/)/, why: "test için üretilen sahte key" },
  { rule: "turnstile-secret", file: /(\.test\.|\/test\/|qa\/FAZ-3\/)/, why: "test sahte secret'ı (red testi)" },
];
const isAllowed = (rule, file) => ALLOW.find((a) => a.rule === rule && a.file.test(file));

const findings = [];
const allowed = new Map();
function check(file, line, where) {
  if (line.length > 4000) return; // minified/blob
  for (const [rule, re] of RULES) {
    if (re.test(line)) {
      const al = isAllowed(rule, file);
      if (al) allowed.set(`${rule}|${al.why}`, (allowed.get(`${rule}|${al.why}`) ?? 0) + 1);
      else findings.push({ rule, where, file, snippet: line.trim().slice(0, 12) + "…(" + line.trim().length + " karakter, değer gizlendi)" });
    }
  }
}

// (A) çalışma ağacı
const files = git("ls-files", "-co", "--exclude-standard", "-z").split("\0").filter(Boolean)
  .filter((f) => !/\.(png|jpe?g|webp|gif|ico|woff2?|pdf|zip|mp4|svg)$/i.test(f))
  .filter((f) => !f.startsWith("out/") && !f.includes("node_modules/"));
let wtLines = 0;
for (const f of files) {
  let txt;
  try { txt = fs.readFileSync(path.join(ROOT, f), "utf8"); } catch { continue; }
  if (txt.includes("\u0000")) continue;
  txt.split("\n").forEach((l, i) => { wtLines++; check(f.split(path.sep).join("/"), l, `ağaç:${f}:${i + 1}`); });
}

// (B) tüm geçmiş (eklenen satırlar)
const commits = Number(git("rev-list", "--all", "--count").trim());
let histLines = 0;
await new Promise((resolve) => {
  const p = spawn("git", ["log", "--all", "-p", "--no-color", "--no-ext-diff", "--format=@@COMMIT %h"], { cwd: ROOT });
  const rl = readline.createInterface({ input: p.stdout, crlfDelay: Infinity });
  let commit = "?", file = "?";
  rl.on("line", (l) => {
    if (l.startsWith("@@COMMIT ")) { commit = l.slice(9); return; }
    if (l.startsWith("+++ b/")) { file = l.slice(6); return; }
    if (l.startsWith("+") && !l.startsWith("+++")) { histLines++; check(file, l.slice(1), `geçmiş:${commit}:${file}`); }
  });
  rl.on("close", resolve);
});

// (C) izlenmeyen + ignore edilen yerel gizli dosyalar: yalnız VARLIK raporlanır (içerik OKUNMAZ)
const ignoredLocal = ["keys.md", "keys.txt", ".env", ".env.local", "workers/api/.dev.vars"].filter((f) => fs.existsSync(path.join(ROOT, f)))
  .map((f) => `${f} (${fs.statSync(path.join(ROOT, f)).size} bayt; git: ${git("check-ignore", f).trim() ? "IGNORE" : "İZLENİYOR!"}; izlenen mi: ${git("ls-files", f).trim() ? "EVET" : "hayır"})`);

console.log(`Çalışma ağacı: ${files.length} dosya, ${wtLines} satır · Geçmiş: ${commits} commit (tüm dallar), ${histLines} eklenen satır`);
console.log(`Kural sayısı: ${RULES.length} · gerekçeli istisna gruplarının tetiklenmesi:`);
for (const [k, n] of allowed) console.log(`  ○ ${k.split("|")[0]} ×${n} — ${k.split("|")[1]}`);
console.log(`Yerel ignore'lu gizli dosyalar (içerik OKUNMADI): ${ignoredLocal.join("; ") || "yok"}`);
console.log(`\nBULGU (açıklanmamış): ${findings.length}`);
const seen = new Set();
for (const f of findings) { const k = f.rule + f.where; if (seen.has(k)) continue; seen.add(k); console.log(`  ✘ [${f.rule}] ${f.where} — ${f.snippet}`); }
process.exit(findings.length ? 1 : 0);
