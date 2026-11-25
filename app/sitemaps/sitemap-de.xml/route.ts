// /sitemaps/sitemap-de.xml — DACH (Deutschland, Oesterreich, Schweiz) Sitemap (yalnız indexable URL'ler; noindex anfrage & angebot hariç).
import fs from "node:fs";
import path from "node:path";
import { fileLastMod } from "@/lib/seo/lastmod";
import { listRatgeber } from "@/app/(de)/de/_lib/ratgeber";

export const dynamic = "force-static";

const BASE = "https://bdimexport.com";

export function GET(): Response {
  const mod = fileLastMod("lib", "hreflang.manifest.json");
  const paths = ["de"];
  const svcDir = path.join(process.cwd(), "content", "de", "services");
  if (fs.existsSync(svcDir)) {
    for (const f of fs.readdirSync(svcDir).sort()) {
      if (f.endsWith(".md")) paths.push(`de/leistungen/${f.replace(/\.md$/, "")}`);
    }
  }
  paths.push("de/vertrauen");
  const guides = listRatgeber();
  if (guides.length > 0) {
    paths.push("de/ratgeber");
    for (const g of guides) paths.push(`de/ratgeber/${g}`);
  }

  const urls = paths
    .map((p) => `  <url><loc>${BASE}/${p}</loc><lastmod>${mod}</lastmod><changefreq>weekly</changefreq></url>`)
    .join("\n");
  const xml = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls}\n</urlset>\n`;
  return new Response(xml, { headers: { "content-type": "application/xml; charset=utf-8" } });
}
