// /sitemaps/sitemap-zh.xml — Baidu & Küresel Arama Motorları Çin (/zh) Sitemap (yalnız indexable URL'ler; noindex fangan hariç).
import fs from "node:fs";
import path from "node:path";
import { fileLastMod } from "@/lib/seo/lastmod";
import { listZhInsights } from "@/app/(zh)/zh/_lib/insights";

export const dynamic = "force-static";

const BASE = "https://bdimexport.com";
const SLUG = /^[a-z0-9]+(?:-[a-z0-9]+){0,15}$/;

function zhPaths(): string[] {
  const out = ["zh"];
  const dir = path.join(process.cwd(), "content", "zh", "services");
  if (fs.existsSync(dir)) {
    for (const f of fs.readdirSync(dir).sort()) {
      const s = f.replace(/\.md$/, "");
      if (f.endsWith(".md") && SLUG.test(s)) out.push(`zh/services/${s}`);
    }
  }
  const guides = listZhInsights();
  if (guides.length > 0) {
    out.push("zh/insights");
    for (const g of guides) out.push(`zh/insights/${g}`);
  }
  return out;
}

export function GET(): Response {
  const mod = fileLastMod("lib", "hreflang.manifest.json");
  const urls = zhPaths()
    .map((p) => `  <url><loc>${BASE}/${p}</loc><lastmod>${mod}</lastmod><changefreq>weekly</changefreq></url>`)
    .join("\n");
  const xml = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls}\n</urlset>\n`;
  return new Response(xml, { headers: { "content-type": "application/xml; charset=utf-8" } });
}
