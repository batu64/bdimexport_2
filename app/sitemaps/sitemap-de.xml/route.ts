// /sitemaps/sitemap-de.xml — DACH (Deutschland, Oesterreich, Schweiz) Sitemap.
import fs from "node:fs";
import path from "node:path";
import { DE_PROPOSAL } from "@/lib/seo/proposals";
import { fileLastMod } from "@/lib/seo/lastmod";

export const dynamic = "force-static";

const BASE = "https://bdimexport.com";

export function GET(): Response {
  const mod = fileLastMod("lib", "seo", "proposals.ts");
  const paths = ["de"];
  const svcDir = path.join(process.cwd(), "content", "de", "services");
  if (fs.existsSync(svcDir)) {
    for (const f of fs.readdirSync(svcDir).sort()) {
      if (f.endsWith(".md")) paths.push(`de/leistungen/${f.replace(/\.md$/, "")}`);
    }
  }
  paths.push("de/vertrauen", "de/anfrage", `de/angebot/${DE_PROPOSAL.slug}`);

  const urls = paths
    .map((p) => `  <url><loc>${BASE}/${p}</loc><lastmod>${mod}</lastmod><changefreq>weekly</changefreq></url>`)
    .join("\n");
  const xml = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls}\n</urlset>\n`;
  return new Response(xml, { headers: { "content-type": "application/xml; charset=utf-8" } });
}
