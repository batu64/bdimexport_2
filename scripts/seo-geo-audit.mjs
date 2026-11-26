// Deterministik SEO + GEO + Hreflang + Sitemap + Teknik Bütünlük Denetçisi (2026/2027).
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

function decodeHtml(s) {
  return s
    .replace(/&amp;/g, "&")
    .replace(/&#x27;/g, "'")
    .replace(/&#39;/g, "'")
    .replace(/&quot;/g, '"')
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">");
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
assert.ok(llms.includes("14-977-6743") && llmsFull.includes("14-977-6743") && JSON.stringify(entityGraph).includes("149776743"), "D-U-N-S #14-977-6743 GEO / Knowledge Graph kaydı eksik");
assert.ok(llms.includes("BNO-100000188010374") && llmsFull.includes("BNO-100000188010374") && JSON.stringify(entityGraph).includes("BNO-100000188010374"), "SAP Ariba BNO-100000188010374 GEO / Knowledge Graph kaydı eksik");
console.log(`✔ GEO uçları doğrulandı: llms.txt (${llms.length} B), llms-full.txt (${llmsFull.length} B), entity-graph.json (${entityGraph["@graph"].length} düğüm)`);

// 2. Sitemap Index & 6 Split Sitemaps — 0 Kırık Link + 0 noindex sızıntısı + 0 >60 kr başlık
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
    if (target.endsWith(".html")) {
      const html = fs.readFileSync(path.join(OUT, target), "utf8");
      assert.ok(!/<meta[^>]+name="robots"[^>]+content="[^"]*noindex/i.test(html), `${sm}: noindex sayfası haritaya sızmış -> ${loc}`);
      const title = decodeHtml((html.match(/<title>([^<]*)<\/title>/i)?.[1] ?? "").trim());
      assert.ok(title.length > 0 && title.length <= 60, `${sm}: başlık > 60 kr (${title.length}: "${title}") -> ${loc}`);
    }
  }
  if (sm === "sitemap.xml") totalLocs = locs.length;
}
console.log(`✔ Sitemap mimarisi doğrulandı: ${sitemaps.length} XML dosyası · ana sitemap ${totalLocs} temiz/indexable URL · noindex=0 · title>60=0`);

// 3. Kırık İç Bağlantı (404) = 0 Kontrolü (tüm public HTML çıktıları)
function walkHtml(dir, acc = []) {
  for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
    const p = path.join(dir, e.name);
    if (e.isDirectory()) walkHtml(p, acc);
    else if (e.name.endsWith(".html")) acc.push(p);
  }
  return acc;
}
const allHtml = walkHtml(OUT);
const builtRoutes = new Set(
  allHtml.map((f) => {
    const rel = path.relative(OUT, f).replace(/\\/g, "/");
    if (rel === "index.html") return "/";
    if (rel.endsWith("/index.html")) return "/" + rel.slice(0, -"/index.html".length);
    return "/" + rel.slice(0, -".html".length);
  }),
);
for (const f of allHtml) {
  const rel = path.relative(OUT, f).replace(/\\/g, "/");
  if (rel.startsWith("admin") || rel === "404.html" || rel === "_not-found.html" || rel.endsWith("/_yok.html")) continue;
  const raw = fs.readFileSync(f, "utf8");
  const links = [...raw.matchAll(/href="(\/[^"#?]*)"/g)]
    .map((m) => m[1].replace(/\/+$/, "") || "/")
    .filter((u) => !u.startsWith("/_next") && !u.startsWith("/media") && !/\.(xml|json|txt|ico|png|svg|webp|jpg|mp4|pdf)$/i.test(u));
  for (const l of links) {
    assert.ok(builtRoutes.has(l), `Kırık iç bağlantı (${rel} -> ${l} [404])`);
  }
  const pdfLinks = [...raw.matchAll(/href="(\/[^"#?]+\.pdf)"/gi)].map((m) => m[1].replace(/^\//, ""));
  for (const pdfRel of pdfLinks) {
    assert.ok(fs.existsSync(path.join(OUT, pdfRel)), `Kırık PDF bağlantısı (${rel} -> /${pdfRel} [404])`);
  }
}
console.log("✔ İç bağlantı bütünlüğü doğrulandı: tüm public sayfalarda kırık iç bağlantı (404) = 0");

// 4. 14 Ana Sayfa %100 Karşılıklı BCP-47 Hreflang Seti
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
console.log("✔ Hreflang karşılıklılığı & GA4 (G-1PXMK93V3F) doğrulandı: 14/14 dil merkezi tam uyumlu");

// 5. Ülke Koridorları + Yeni Yüksek Getirili Küme Sayfaları + ABM Teklif Sayfaları (Canonical + H1=1 + JSON-LD)
const mustAuditPages = [
  "en/wooden-utility-poles.html",
  "en/ar/wooden-utility-poles.html",
  "en/fr/wooden-utility-poles.html",
  "ithalat/cin-gumruk-vergisi-hesaplama.html",
  "ithalat/danismanlik-ucretleri.html",
  "ihracat/ihracat-danismanligi.html",
  "de/leistungen/china-einkauf.html",
  "de/leistungen/qualitaetskontrolle-china.html",
  "de/leistungen/textilproduktion-tuerkei.html",
  "de/ratgeber/import-tuerkei-zoll-atr.html",
  "de/ratgeber/import-aus-china-zoll-kosten.html",
  "en/insights/import-from-turkey-to-usa-tariffs.html",
  "en/insights/import-duty-from-turkey-to-uk-atr.html",
  "en/insights/how-to-verify-turkish-suppliers.html",
  "makaleler/kanton-fuari-ve-cinden-mal-getirme-rehberi.html",
  "makaleler/cbam-mikro-ihracat-ve-devlet-destekleri-rehberi.html",
  "zh/insights/tuerqi-chukou-qingguan-zhinan.html",
  "en/us.html",
  "en/us/china-plus-turkey-sourcing.html",
  "en/us/turkey-sourcing-agent-for-us-companies.html",
  "en/us/china-sourcing-and-procurement-partner.html",
  "en/us/pre-shipment-and-container-loading-inspection.html",
  "en/us/hospitality-furniture-and-construction-sourcing.html",
  "en/us/textile-apparel-and-home-goods-manufacturing.html",
  "en/us/customs-hts-landed-cost-and-supplier-verification.html",
  "en/markets.html",
  "en/markets/united-states.html",
  "en/markets/united-kingdom.html",
  "en/markets/germany.html",
  "en/markets/saudi-arabia.html",
  "en/markets/united-arab-emirates.html",
  "ihracat/pazarlar.html",
  "ihracat/pazarlar/almanya-ihracat-pazarlama.html",
  "ihracat/pazarlar/abd-ihracat-ve-sirketlesme.html",
];

for (const rel of mustAuditPages) {
  const h = readOut(rel);
  const expectedCanonical = `${SITE}/${rel.replace(/\.html$/, "")}`;
  const canonical = h.match(/<link rel="canonical" href="([^"]+)"/)?.[1];
  assert.equal(canonical, expectedCanonical, `${rel}: canonical hatalı (${canonical} != ${expectedCanonical})`);
  const vis = h.replace(/<script[\s\S]*?<\/script>/g, "");
  const h1Count = (vis.match(/<h1[ >]/g) ?? []).length;
  assert.equal(h1Count, 1, `${rel}: tek <h1> olmalı (bulunan: ${h1Count})`);
  const ldMatches = [...h.matchAll(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/g)];
  assert.ok(ldMatches.length >= 1, `${rel}: JSON-LD eksik`);
  for (const m of ldMatches) {
    const parsed = JSON.parse(m[1]);
    assert.equal(parsed["@context"], "https://schema.org", `${rel}: JSON-LD @context hatalı`);
  }
}
console.log(`✔ ${mustAuditPages.length} kritik ticari merkez, hesaplayıcı, rehber ve ülke koridorunda canonical, H1=1 ve JSON-LD doğrulandı`);

// 6. Elektrik Direği Hunileri: EN <-> AR <-> FR Üçlü Karşılıklı Hreflang + Sıfır Üçüncü Taraf Marka/Telefon Sızıntısı
const enPolesHtml = readOut("en/wooden-utility-poles.html");
const arPolesHtml = readOut("en/ar/wooden-utility-poles.html");
const frPolesHtml = readOut("en/fr/wooden-utility-poles.html");
const enPolesAlt = extractAlternates(enPolesHtml);
const arPolesAlt = extractAlternates(arPolesHtml);
const frPolesAlt = extractAlternates(frPolesHtml);
assert.deepEqual(enPolesAlt, arPolesAlt, "wooden-utility-poles EN <-> AR hreflang karşılıklılığı bozuk!");
assert.deepEqual(enPolesAlt, frPolesAlt, "wooden-utility-poles EN <-> FR hreflang karşılıklılığı bozuk!");
assert.ok(enPolesAlt.includes(`ar=${SITE}/en/ar/wooden-utility-poles`), "wooden-utility-poles ar hreflang eksik!");
assert.ok(enPolesAlt.includes(`fr=${SITE}/en/fr/wooden-utility-poles`), "wooden-utility-poles fr hreflang eksik!");
assert.ok(enPolesAlt.includes(`en=${SITE}/en/wooden-utility-poles`), "wooden-utility-poles en hreflang eksik!");
for (const [name, content] of [
  ["en/wooden-utility-poles.html", enPolesHtml],
  ["en/ar/wooden-utility-poles.html", arPolesHtml],
  ["en/fr/wooden-utility-poles.html", frPolesHtml],
]) {
  assert.ok(!/semita[sş]|320\s*8169|326\s*20\s*40|657\s*91\s*34/i.test(content), `${name}: üçüncü taraf marka/telefon sızıntısı bulundu!`);
  assert.ok(content.includes("905394147854"), `${name}: resmi WhatsApp hattı (+90 539 414 78 54) eksik!`);
  assert.ok(content.includes("data-clarity-event=") && content.includes("zhsd81zz12"), `${name}: Clarity tıklama noktaları veya etiketi eksik!`);
  assert.ok(content.includes("14-977-6743") && content.includes("BNO-100000188010374"), `${name}: D-U-N-S veya SAP Ariba doğrulaması eksik!`);
  assert.ok(content.includes('"@type":"VideoObject"'), `${name}: VideoObject şeması eksik!`);
}
const poleSpokePages = [
  "en/wooden-utility-poles/price-and-container-calculator.html",
  "en/wooden-utility-poles/cca-vs-creosote-pine-vs-eucalyptus.html",
  "en/wooden-utility-poles/standards-en14229-bs1990-sans754.html",
  "en/wooden-utility-poles/senegal-west-africa.html",
  "en/wooden-utility-poles/mozambique-southern-africa.html",
  "en/wooden-utility-poles/ghana-kenya-tanzania-nigeria.html",
  "en/ar/wooden-utility-poles/libya.html",
  "en/ar/wooden-utility-poles/jordan.html",
  "en/ar/wooden-utility-poles/iraq.html",
  "en/ar/wooden-utility-poles/algeria-maghreb.html",
  "en/ar/wooden-utility-poles/price-and-container-guide.html",
  "en/ar/wooden-utility-poles/brown-vs-green-autoclave.html",
  "en/fr/wooden-utility-poles/prix-conteneur-poteaux-bois.html",
  "en/fr/wooden-utility-poles/norme-nfc-67-100-en-14229.html",
  "en/fr/wooden-utility-poles/senegal-senelec.html",
  "en/fr/wooden-utility-poles/cote-divoire-cameroun.html",
  "en/fr/wooden-utility-poles/maghreb-algerie-maroc-tunisie.html",
];
for (const spRel of poleSpokePages) {
  const sh = readOut(spRel);
  const expectedCanonical = `${SITE}/${spRel.replace(/\.html$/, "")}`;
  assert.equal(sh.match(/<link rel="canonical" href="([^"]+)"/)?.[1], expectedCanonical, `${spRel}: canonical hatalı`);
  assert.equal((sh.replace(/<script[\s\S]*?<\/script>/g, "").match(/<h1[ >]/g) ?? []).length, 1, `${spRel}: tek H1 olmalı`);
  assert.ok(sh.includes('"@type":"VideoObject"') && sh.includes('"@type":"Product"'), `${spRel}: VideoObject/Product şeması eksik`);
  assert.ok(sh.includes("905394147854") && sh.includes("14-977-6743") && sh.includes("BNO-100000188010374"), `${spRel}: WhatsApp / D-U-N-S / SAP Ariba eksik`);
}
for (const pdf of [
  "docs/bdimexport-wooden-electric-poles-datasheet-en.pdf",
  "docs/bdimexport-wooden-electric-poles-datasheet-ar.pdf",
  "docs/bdimexport-wooden-electric-poles-datasheet-fr.pdf",
]) {
  assert.ok(fs.existsSync(path.join(OUT, pdf)), `Eksik Teknik Katalog PDF: out/${pdf}`);
}
console.log(`✔ Elektrik direği EN/AR/FR Topikal Kalesi doğrulandı: 3 Pillar + ${poleSpokePages.length} Spoke + 3 PDF Katalog + VideoObject şeması`);
console.log("=== TÜM SEO + GEO + ABM KONTROLLERİ BAŞARIYLA GEÇTİ ===");
