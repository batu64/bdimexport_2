// /sitemaps/sitemap-tr.xml — Türkiye (TR) İthalat, İhracat, Ülke Koridorları ve Kurumsal Teklifler Sitemap.
import fs from "node:fs";
import path from "node:path";
import { TR_EXPORT_CORRIDORS, TR_PROPOSALS } from "@/app/(tr)/_lib/tr-seo-data";
import { fileLastMod } from "@/lib/seo/lastmod";
import { listInsights } from "@/lib/ui/insights";

export const dynamic = "force-static";

const BASE = "https://bdimexport.com";

function listMd(dir: string): string[] {
  const full = path.join(process.cwd(), "content", "tr", dir);
  if (!fs.existsSync(full)) return [];
  return fs.readdirSync(full).filter((f) => f.endsWith(".md")).map((f) => f.replace(/\.md$/, "")).sort();
}

export function GET(): Response {
  const mod = fileLastMod("app", "(tr)", "_lib", "tr-seo-data.ts");
  const routes = [
    "",
    "ithalat",
    "ihracat",
    "ihracat/pazarlar",
    "teklif",
    "ticari-istihbarat",
    "rfq",
    "kvkk-riza",
    "ihracat/ucretsiz-destek-basvuru",
    "makaleler",
  ];
  for (const s of listMd("ithalat")) if (s !== "danismanlik-talebi") routes.push(`ithalat/${s}`);
  for (const s of listMd("ihracat")) if (s !== "ucretsiz-destek-basvuru") routes.push(`ihracat/${s}`);
  for (const g of listMd(path.join("ithalat", "rehberler"))) routes.push(`ithalat/rehberler/${g}`);
  for (const c of TR_EXPORT_CORRIDORS) routes.push(`ihracat/pazarlar/${c.slug}`);
  for (const p of TR_PROPOSALS) routes.push(`teklif/${p.slug}`);
  for (const slug of listInsights("tr")) routes.push(`makaleler/${slug}`);

  const urls = routes
    .map((r) => {
      const loc = r ? `${BASE}/${r}` : BASE;
      return `  <url><loc>${loc}</loc><lastmod>${mod}</lastmod><changefreq>weekly</changefreq></url>`;
    })
    .join("\n");
  const xml = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls}\n</urlset>\n`;
  return new Response(xml, { headers: { "content-type": "application/xml; charset=utf-8" } });
}
