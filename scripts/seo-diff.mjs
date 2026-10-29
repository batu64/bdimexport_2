// SEO regresyon karşılaştırması (D9): node scripts/seo-diff.mjs <önceki-çıktı> <yeni-çıktı>
// Her iki dizinde de bulunan her .html için: <title>, canonical, hreflang <link> seti, robots meta, JSON-LD @type çoklu kümesi, H1 sayısı.
import fs from "node:fs";
import path from "node:path";

const [A, B] = process.argv.slice(2);
const walk = (d, base = d, out = []) => {
  for (const e of fs.readdirSync(d, { withFileTypes: true })) {
    const f = path.join(d, e.name);
    if (e.isDirectory()) { if (!["_next", "media", "admin"].includes(e.name)) walk(f, base, out); }
    else if (e.name.endsWith(".html")) out.push(path.relative(base, f));
  }
  return out;
};
const pick = (h) => ({
  title: h.match(/<title>([^<]*)<\/title>/)?.[1] ?? null,
  canonical: h.match(/<link rel="canonical" href="([^"]*)"/)?.[1] ?? null,
  hreflang: [...h.matchAll(/<link rel="alternate" hrefLang="([^"]*)" href="([^"]*)"/g)].map((m) => `${m[1]}=${m[2]}`).sort().join(" "),
  robots: h.match(/<meta name="robots" content="([^"]*)"/)?.[1] ?? null,
  ldTypes: [...h.matchAll(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/g)]
    .flatMap((m) => [...m[1].matchAll(/"@type":"([A-Za-z]+)"/g)].map((x) => x[1])).sort().join(","),
  h1: (h.match(/<h1[ >]/g) ?? []).length,
});
const a = new Set(walk(A)), b = walk(B);
let same = 0;
const diffs = [], added = [];
for (const f of b) {
  if (!a.has(f)) { added.push(f); continue; }
  const pa = pick(fs.readFileSync(path.join(A, f), "utf8")), pb = pick(fs.readFileSync(path.join(B, f), "utf8"));
  const d = Object.keys(pa).filter((k) => pa[k] !== pb[k]);
  if (d.length) diffs.push({ file: f, fields: Object.fromEntries(d.map((k) => [k, [pa[k], pb[k]]])) });
  else same++;
}
console.log(JSON.stringify({ compared: same + diffs.length, identical: same, diffs, added }, null, 2));
