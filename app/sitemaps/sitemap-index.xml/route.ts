// /sitemaps/sitemap-index.xml — FAZ_4 4.8 (orchestrator). SEO_PLAYBOOK §8 sitemap index'i: ana sitemap (tr + en ailesi +
// makaleler) + dil-bazlı parçalar. Dil bölünmesi FAZ 5.8'de genişler (sitemap-de vb.); şu an tr/en ana sitemap'te, zh ayrı.
export const dynamic = "force-static";

const BASE = "https://bdimexport.com";
const SITEMAPS = ["sitemap.xml", "sitemaps/sitemap-zh.xml"] as const;

export function GET(): Response {
  const items = SITEMAPS.map((p) => `  <sitemap><loc>${BASE}/${p}</loc></sitemap>`).join("\n");
  const xml = `<?xml version="1.0" encoding="UTF-8"?>\n<sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${items}\n</sitemapindex>\n`;
  return new Response(xml, { headers: { "content-type": "application/xml; charset=utf-8" } });
}
