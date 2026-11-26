// /sitemaps/sitemap-markets.xml — 12 Global Country Corridors + 10 Native-Language Localized Hubs (/en/{xx}) — boş insights hariç.
import manifest from "@/lib/hreflang.manifest.json";
import { joinUrl } from "@/lib/hreflang";
import { enVariants } from "@/lib/i18n";
import { MARKET_CORRIDORS } from "@/lib/seo/markets";
import { US_CLUSTER_PAGES } from "@/lib/seo/us-hub";
import { fileLastMod } from "@/lib/seo/lastmod";
import { insightBase, listInsights } from "@/lib/ui/insights";
import { AR_POLE_SPOKES } from "@/lib/seo/poles-spokes-ar";
import { FR_POLE_SPOKES } from "@/lib/seo/poles-spokes-fr";

export const dynamic = "force-static";

const BASE = "https://bdimexport.com";

export function GET(): Response {
  const mod = fileLastMod("lib", "seo", "markets.ts");
  const locs: string[] = [`${BASE}/en/us`, ...US_CLUSTER_PAGES.map((u) => `${BASE}/en/us/${u.slug}`), `${BASE}/en/markets`];
  for (const m of MARKET_CORRIDORS) locs.push(`${BASE}/en/markets/${m.slug}`);
  for (const v of enVariants) {
    for (const p of manifest.variants[v] as string[]) {
      locs.push(joinUrl("en", v, p));
    }
    const slugs = listInsights(v);
    if (slugs.length > 0) {
      const ib = insightBase(v);
      locs.push(`${BASE}${ib}`);
      for (const slug of slugs) locs.push(`${BASE}${ib}/${slug}`);
    }
  }

  for (const sp of AR_POLE_SPOKES) locs.push(`${BASE}/en/ar/wooden-utility-poles/${sp.slug}`);
  for (const sp of FR_POLE_SPOKES) locs.push(`${BASE}/en/fr/wooden-utility-poles/${sp.slug}`);

  const urls = locs
    .map((loc) => `  <url><loc>${loc}</loc><lastmod>${mod}</lastmod><changefreq>weekly</changefreq></url>`)
    .join("\n");
  const xml = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls}\n</urlset>\n`;
  return new Response(xml, { headers: { "content-type": "application/xml; charset=utf-8" } });
}
