// /sitemaps/sitemap-index.xml — SEO_PLAYBOOK §8 çoklu dil & koridor parçalı Sitemap Index.
import { fileLastMod } from "@/lib/seo/lastmod";

export const dynamic = "force-static";

const BASE = "https://bdimexport.com";
const SITEMAPS = [
  "sitemap.xml",
  "sitemaps/sitemap-tr.xml",
  "sitemaps/sitemap-en.xml",
  "sitemaps/sitemap-markets.xml",
  "sitemaps/sitemap-de.xml",
  "sitemaps/sitemap-zh.xml",
] as const;

export function GET(): Response {
  const mod = fileLastMod("lib", "hreflang.manifest.json");
  const items = SITEMAPS.map((p) => `  <sitemap><loc>${BASE}/${p}</loc><lastmod>${mod}</lastmod></sitemap>`).join("\n");
  const xml = `<?xml version="1.0" encoding="UTF-8"?>\n<sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${items}\n</sitemapindex>\n`;
  return new Response(xml, { headers: { "content-type": "application/xml; charset=utf-8" } });
}
