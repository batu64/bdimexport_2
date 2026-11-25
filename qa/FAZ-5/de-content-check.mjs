// FAZ_5 5.4/5.7 — /de içerik kontrolü (deterministik, model yok): node qa/FAZ-5/de-content-check.mjs
// Ölçütler: hizmet sayfası ≥1200 kelime (Quellen hariç) · META title ≤60 / desc ≤160 · FAQ ≥5 · formal Sie (du/dich/dir/dein*/euch/euer* = red) ·
// I18N_RULES §3 DE sözlüğü (terim sayfada geçmeli) · UWG: üstünlük/garanti iddiası yok · ≥2 /de iç link · linkli kaynak · uydurma yorum yok.
import fs from "node:fs";
import path from "node:path";

const ROOT = path.resolve(import.meta.dirname, "../..");
const DIR = path.join(ROOT, "content", "de");
// informal hitap (büyük/küçük harf duyarsız; "ihr" belirsiz → kontrol dışı)
const DU = /\b(du|dich|dir|dein|deine|deinen|deinem|deiner|deines|euch|euer|eure|euren|eurem|eurer)\b/gi;
// UWG / CONTENT_STYLE: kanıtsız üstünlük ve garanti (alıntı içindeki "Was wir nicht tun" listesi hariç tutulur)
const SUPER = /\b(die besten?|beste[nrs]?|Marktführer|garantiert|100\s?%|einzigartig|weltweit führend)\b/gi;
// I18N_RULES §3.1 — her hizmet sayfası kendi sözlük terimini kullanmalı
const TERM = {
  beschaffung: "Beschaffung",
  "china-einkauf": "Beschaffung",
  lohnfertigung: "Lohnfertigung",
  "textilproduktion-tuerkei": "Textilproduktion",
  werkspruefung: "Werksprüfung",
  "qualitaetskontrolle-china": "Werksprüfung",
  logistik: "Logistik",
  zollabwicklung: "Zollabwicklung",
};
const REVIEW = /(„[^“]{20,}“\s*[–-]\s*[A-ZÄÖÜ][a-zäöüß]+)|\b\d(,\d)?\s?(von 5|\/5)\s?Sterne/; // alıntı + isim veya yıldız puanı

const files = [
  ...fs.readdirSync(path.join(DIR, "services")).filter((x) => x.endsWith(".md")).sort().map((f) => `services/${f}`),
  "vertrauen.md",
];
let fail = 0;
const rows = [];
for (const rel of files) {
  const raw = fs.readFileSync(path.join(DIR, rel), "utf8");
  const slug = path.basename(rel, ".md");
  const service = rel.startsWith("services/");
  const meta = raw.match(/<!-- META: title="([^"]+)" desc="([^"]+)" -->/);
  const body = raw.replace(/<!--[\s\S]*?-->/g, "").replace(/\]\([^)]+\)/g, "]");
  const text = body.replace(/^## Quellen[\s\S]*$/m, "");
  const words = text.split(/\s+/).filter((w) => /[\p{L}\p{N}]/u.test(w)).length;
  const faqBlock = raw.split(/^## Häufig gestellte Fragen\s*$/m)[1]?.split(/^## /m)[0] ?? "";
  const faq = (faqBlock.match(/^### /gm) ?? []).length;
  const du = [...new Set((body.match(DU) ?? []).map((m) => m.toLowerCase()))];
  const sup = (body.replace(/^## Was wir nicht tun[\s\S]*?(?=^## )/m, "").match(SUPER) ?? []);
  const internal = (raw.match(/\]\(\/de[^)]*\)/g) ?? []).length;
  const sources = (raw.split(/^## Quellen\s*$/m)[1]?.match(/\]\(https:\/\/[^)]+\)/g) ?? []).length;
  const term = service ? new RegExp(TERM[slug]).test(body) : true;
  const review = REVIEW.test(body);
  const r = { file: rel, words, title: meta?.[1].length ?? null, desc: meta?.[2].length ?? null, faq, du: du.join(","), superlatives: sup.length, term, internal, sources, review };
  const ok = (!service || (words >= 1200 && faq >= 5 && sources >= 1))
    && r.title !== null && r.title <= 60 && r.desc <= 160 && !du.length && !sup.length && term && internal >= 2 && !review;
  if (!ok) fail++;
  rows.push({ ...r, ok });
}
console.table(rows);
console.log(`sayfa: ${rows.length} · kırmızı: ${fail}`);
process.exit(fail ? 1 : 0);
