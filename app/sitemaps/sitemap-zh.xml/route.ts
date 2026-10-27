// /sitemaps/sitemap-zh.xml — FAZ_4 4.8 Baidu hazırlığı (orchestrator ortak dosyası). SEO_PLAYBOOK §8: dil-bazlı parçalı sitemap.
// Baidu Webmaster'a (ziyuan.baidu.com) AYRICA gönderilir (docs/baidu.md). İçerik build anında var olan zh sayfalarından
// türetilir: şu an yalnız /zh (iskelet, 200); FAZ 5 (5.3 hizmet sayfaları, 5.8 enjeksiyon) ile dolar. Var olmayan URL YAZILMAZ.
import fs from "node:fs";
import path from "node:path";

export const dynamic = "force-static";

const BASE = "https://bdimexport.com";
const SLUG = /^[a-z0-9]+(?:-[a-z0-9]+){0,15}$/;

/** zh sayfa envanteri: /zh + content/zh/services/*.md (FAZ 5.3 sonrası). */
function zhPaths(): string[] {
  const out = ["zh"];
  const dir = path.join(process.cwd(), "content", "zh", "services");
  if (fs.existsSync(dir)) {
    for (const f of fs.readdirSync(dir).sort()) {
      const s = f.replace(/\.md$/, "");
      if (f.endsWith(".md") && SLUG.test(s)) out.push(`zh/services/${s}`);
    }
  }
  return out;
}

export function GET(): Response {
  const urls = zhPaths()
    .map((p) => `  <url><loc>${BASE}/${p}</loc><changefreq>weekly</changefreq></url>`)
    .join("\n");
  const xml = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls}\n</urlset>\n`;
  return new Response(xml, { headers: { "content-type": "application/xml; charset=utf-8" } });
}
