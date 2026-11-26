// /sitemaps/sitemap-en.xml — Global English Hub, Products, Services, Industries & B2B Proposals Sitemap.
import { EN_PATHS, joinUrl } from "@/lib/hreflang";
import { fileLastMod } from "@/lib/seo/lastmod";
import { listInsights } from "@/lib/ui/insights";
import { EN_POLE_SPOKES } from "@/lib/seo/poles-spokes-en";

export const dynamic = "force-static";

const BASE = "https://bdimexport.com";

export function GET(): Response {
  const mod = fileLastMod("lib", "hreflang.manifest.json");
  const locs: string[] = [];
  for (const p of EN_PATHS) {
    if (p.startsWith("markets/")) continue; // ülke koridorları sitemap-markets.xml'de de yer alır; ana dizin korunur
    locs.push(joinUrl("en", p));
  }
  locs.push(`${BASE}/en/insights`);
  for (const slug of listInsights("en")) locs.push(`${BASE}/en/insights/${slug}`);
  for (const sp of EN_POLE_SPOKES) locs.push(`${BASE}/en/wooden-utility-poles/${sp.slug}`);

  const urls = locs
    .map((loc) => `  <url><loc>${loc}</loc><lastmod>${mod}</lastmod><changefreq>weekly</changefreq></url>`)
    .join("\n");
  const xml = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls}\n</urlset>\n`;
  return new Response(xml, { headers: { "content-type": "application/xml; charset=utf-8" } });
}
