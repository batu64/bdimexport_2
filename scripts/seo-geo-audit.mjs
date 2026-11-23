// Deterministik SEO + GEO + Hreflang + Sitemap + ABM Teklif Doğrulama Denetçisi (2026/2027).
// Kullanım (pnpm build sonrasında): node scripts/seo-geo-audit.mjs
import fs from "node:fs";
import path from "node:path";
import assert from "node:assert/strict";

const ROOT = process.cwd();
const OUT = path.join(ROOT, "out");
const SITE = "https://bdimexport.com";

function readOut(rel) {
  const full = path.join(OUT, rel);
  assert.ok(fs.existsSync(full), `EKSİK ÇIKTI: out/${rel}`);
  return fs.readFileSync(full, "utf8");
}

function urlToOutPath(url) {
  assert.ok(url.startsWith(SITE), `Dış URL bulundu: ${url}`);
  const p = url.slice(SITE.length).replace(/^\//, "");
  if (!p) return "index.html";
  if (p.endsWith(".xml") || p.endsWith(".txt") || p.endsWith(".json")) return p;
  return `${p}.html`;
}

console.log("=== BDIMEXPORT 2026/2027 ASYMMETRIC SEO + GEO AUDIT ===");

// 1. GEO & Agentic Discovery Endpoints
const robots = readOut("robots.txt");
assert.ok(robots.includes("OAI-SearchBot") && robots.includes("PerplexityBot") && robots.includes("Disallow: /admin/"), "robots.txt AI bot / admin kuralları eksik");
const llms = readOut("llms.txt");
const llmsFull = readOut("llms-full.txt");
assert.ok(llms.length > 1500 && llmsFull.length > 8000, "llms.txt / llms-full.txt içeriği beklenenden kısa");
const entityGraph = JSON.parse(readOut("entity-graph.json"));
assert.equal(entityGraph["@context"], "https://schema.org", "entity-graph.json @context hatalı");
assert.ok(Array.isArray(entityGraph["@graph"]) && entityGraph["@graph"].length >= 6, "entity-graph.json @graph eksik");
console.log(`✔ GEO uçları doğrulandı: llms.txt (${llms.length} B), llms-full.txt (${llmsFull.length} B), entity-graph.json (${entityGraph["@graph"].length} düğüm)`);

// 2. Sitemap Index & 6 Split Sitemaps — 0 Kırık Link (404=0) + 0 Geçersiz Hreflang
const sitemaps = [
  "sitemap.xml",
  "sitemaps/sitemap-index.xml",
  "sitemaps/sitemap-tr.xml",
  "sitemaps/sitemap-en.xml",
  "sitemaps/sitemap-markets.xml",
  "sitemaps/sitemap-de.xml",
  "sitemaps/sitemap-zh.xml",
];
let totalLocs = 0;
for (const sm of sitemaps) {
  const xml = readOut(sm);
  assert.ok(!/en-(AR|SQ|FR|RU|NL|ES|FI|PL|RO|IT)\b/.test(xml), `${sm}: eski/geçersiz en-XX hreflang kodu sızmış!`);
  const locs = [...xml.matchAll(/<loc>([^<]+)<\/loc>/g)].map((m) => m[1]);
  assert.ok(locs.length > 0, `${sm}: <loc> boş`);
  for (const loc of locs) {
    const target = urlToOutPath(loc);
    assert.ok(fs.existsSync(path.join(OUT, target)), `${sm}: kırık URL (out/${target} yok) -> ${loc}`);
  }
  if (sm === "sitemap.xml") totalLocs = locs.length;
}
console.log(`✔ Sitemap mimarisi doğrulandı: ${sitemaps.length} XML dosyası · ana sitemap ${totalLocs} canlı URL · kırık hedef = 0`);

// 3. 14 Ana Sayfa %100 Karşılıklı BCP-47 Hreflang Seti
const homePages = [
  "index.html",
  "en.html",
  "en/us.html",
  "de.html",
  "zh.html",
  ...["ru", "fr", "nl", "es", "ar", "fi", "sq", "pl", "ro", "it"].map((v) => `en/${v}.html`),
];
const extractAlternates = (html) =>
  [...html.matchAll(/<link[^>]*rel="alternate"[^>]*hrefLang="([^"]+)"[^>]*href="([^"]+)"/gi)]
    .map((m) => `${m[1]}=${m[2]}`)
    .sort();

const refAlt = extractAlternates(readOut("index.html"));
assert.ok(refAlt.some((x) => x === `x-default=${SITE}/en`), "Ana sayfa x-default=/en olmalı");
assert.ok(refAlt.some((x) => x === `ar=${SITE}/en/ar`), "Ana sayfa ar=/en/ar olmalı");
assert.ok(refAlt.some((x) => x === `sq=${SITE}/en/sq`), "Ana sayfa sq=/en/sq olmalı");
for (const hp of homePages) {
  const rawHp = readOut(hp);
  const cur = extractAlternates(rawHp);
  assert.deepEqual(cur, refAlt, `${hp}: ana sayfa hreflang karşılıklılığı bozuldu!`);
  assert.ok(rawHp.includes("https://www.googletagmanager.com/gtag/js?id=G-1PXMK93V3F"), `${hp}: GA4 G-1PXMK93V3F etiketi eksik!`);
}
console.log(`✔ Hreflang karşılıklılığı & GA4 (G-1PXMK93V3F) doğrulandı: 14/14 dil merkezi tam uyumlu`);

// 4. Ülke Koridorları + Hedefli İş Teklifi Sayfaları (Canonical + H1 + OG + JSON-LD)
const mustAuditPages = [
  "en/wooden-utility-poles.html",
  "en/ar/wooden-utility-poles.html",
  "en/us.html",
  "en/us/china-plus-turkey-sourcing.html",
  "en/us/turkey-sourcing-agent-for-us-companies.html",
  "en/us/china-sourcing-and-procurement-partner.html",
  "en/us/pre-shipment-and-container-loading-inspection.html",
  "en/us/hospitality-furniture-and-construction-sourcing.html",
  "en/us/textile-apparel-and-home-goods-manufacturing.html",
  "en/us/customs-hts-landed-cost-and-supplier-verification.html",
  "en/proposals/us-procurement-partner.html",
  "en/markets.html",
  "en/markets/united-states.html",
  "en/markets/united-kingdom.html",
  "en/markets/germany.html",
  "en/markets/saudi-arabia.html",
  "en/markets/united-arab-emirates.html",
  "en/proposals.html",
  "en/proposals/dual-hub-sourcing.html",
  "en/proposals/container-loading-audit.html",
  "en/proposals/private-label-manufacturing.html",
  "en/proposals/trade-intelligence-due-diligence.html",
  "ihracat/pazarlar.html",
  "ihracat/pazarlar/almanya-ihracat-pazarlama.html",
  "ihracat/pazarlar/abd-ihracat-ve-sirketlesme.html",
  "teklif.html",
  "teklif/ihracat-buyume-sistemi.html",
  "teklif/konteyner-yukleme-denetimi.html",
  "de/angebot/lieferantenpruefung-beschaffung.html",
  "zh/fangan/tuerqi-bendi-tuandui.html",
];

for (const rel of mustAuditPages) {
  const h = readOut(rel);
  const expectedCanonical = `${SITE}/${rel.replace(/\.html$/, "")}`;
  const canonical = h.match(/<link rel="canonical" href="([^"]+)"/)?.[1];
  assert.equal(canonical, expectedCanonical, `${rel}: canonical hatalı (${canonical} != ${expectedCanonical})`);
  const vis = h.replace(/<script[\s\S]*?<\/script>/g, "");
  const h1Count = (vis.match(/<h1[ >]/g) ?? []).length;
  assert.equal(h1Count, 1, `${rel}: tek <h1> olmalı (bulunan: ${h1Count})`);
  assert.ok(/property="og:image"/.test(h), `${rel}: og:image eksik`);
  const ldMatches = [...h.matchAll(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/g)];
  assert.ok(ldMatches.length >= 1, `${rel}: JSON-LD eksik`);
  for (const m of ldMatches) {
    const parsed = JSON.parse(m[1]);
    assert.equal(parsed["@context"], "https://schema.org", `${rel}: JSON-LD @context hatalı`);
  }
}
console.log(`✔ ${mustAuditPages.length} kritik ülke koridoru & hedefli B2B teklif sayfasında canonical, H1=1, OG ve JSON-LD doğrulandı`);

// 5. Elektrik Direği Hunileri: EN <-> AR Karşılıklı Hreflang + Sıfır Üçüncü Taraf Marka/Telefon Sızıntısı
const enPolesHtml = readOut("en/wooden-utility-poles.html");
const arPolesHtml = readOut("en/ar/wooden-utility-poles.html");
const enPolesAlt = extractAlternates(enPolesHtml);
const arPolesAlt = extractAlternates(arPolesHtml);
assert.deepEqual(enPolesAlt, arPolesAlt, "wooden-utility-poles EN <-> AR hreflang karşılıklılığı bozuk!");
assert.ok(enPolesAlt.includes(`ar=${SITE}/en/ar/wooden-utility-poles`), "wooden-utility-poles ar hreflang eksik!");
assert.ok(enPolesAlt.includes(`en=${SITE}/en/wooden-utility-poles`), "wooden-utility-poles en hreflang eksik!");
for (const [name, content] of [["en/wooden-utility-poles.html", enPolesHtml], ["en/ar/wooden-utility-poles.html", arPolesHtml]]) {
  assert.ok(!/semita[sş]|320\s*8169|326\s*20\s*40|657\s*91\s*34/i.test(content), `${name}: üçüncü taraf marka/telefon sızıntısı bulundu!`);
  assert.ok(content.includes("905394147854"), `${name}: resmi WhatsApp hattı (+90 539 414 78 54) eksik!`);
  assert.ok(content.includes("data-clarity-event=") && content.includes("zhsd81zz12"), `${name}: Clarity tıklama noktaları veya etiketi eksik!`);
}
console.log("✔ Elektrik direği EN/AR hunileri doğrulandı: karşılıklı hreflang, resmi WhatsApp hattı ve sıfır marka sızıntısı");
console.log("=== TÜM SEO + GEO + ABM KONTROLLERİ BAŞARIYLA GEÇTİ ===");
