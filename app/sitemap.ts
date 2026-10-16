// Sitemap üreteci — SEO_PLAYBOOK §8 (FAZ 2 Step 2.8a)
// Static export uyumlu. TR URL'leri content/tr taramasından; EN ailesi (ana + varyant) lib/hreflang.manifest.json'dan.
// Dil-split (sitemap-en.xml vb.) ayrı karar: şu an tek dosyada; EN/varyant URL'leri xhtml:link alternates taşır.
import type { MetadataRoute } from "next";
import fs from "fs";
import path from "path";
import { EN_PATHS, enFamilyAlternates, joinUrl, toMetadataAlternates } from "@/lib/hreflang";
import manifest from "@/lib/hreflang.manifest.json";
import { enVariants } from "@/lib/i18n";

const BASE = "https://bdimexport.com";

export const dynamic = "force-static";

// Statik sayfa envanteri — build'de content/tr'den otomatik türetilir
function listMd(dir: string): string[] {
  const full = path.join(process.cwd(), "content", "tr", dir);
  if (!fs.existsSync(full)) return [];
  return fs.readdirSync(full).filter(f => f.endsWith(".md")).map(f => f.replace(/\.md$/, ""));
}

export default function sitemap(): MetadataRoute.Sitemap {
  const trRoutes = ["", "ithalat", "ihracat", "kvkk-riza", "ihracat/ucretsiz-destek-basvuru"];
  for (const s of listMd("ithalat")) if (s !== "danismanlik-talebi") trRoutes.push(`ithalat/${s}`);
  for (const s of listMd("ihracat")) if (s !== "ucretsiz-destek-basvuru") trRoutes.push(`ihracat/${s}`);
  for (const g of listMd(path.join("ithalat", "rehberler"))) trRoutes.push(`ithalat/rehberler/${g}`);

  const entries: MetadataRoute.Sitemap = [];
  for (const route of trRoutes) {
    const url = `${BASE}/${route}`;
    entries.push({ url, lastModified: new Date(), changeFrequency: "weekly", priority: route === "" ? 1 : 0.8 });
  }

  // EN ailesi: ana hub + ürün/hizmet/sektör/kategori sayfaları (manifest.en)
  for (const p of EN_PATHS) {
    entries.push({
      url: joinUrl("en", p),
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: p === "" ? 0.9 : 0.7,
      alternates: toMetadataAlternates(enFamilyAlternates(p)),
    });
  }

  // EN varyantları: /en/{ru,fr,nl,es,ar} + mevcut alt sayfalar (manifest.variants)
  for (const v of enVariants) {
    for (const p of (manifest.variants[v] as string[])) {
      entries.push({
        url: joinUrl("en", v, p),
        lastModified: new Date(),
        changeFrequency: "weekly",
        priority: p === "" ? 0.8 : 0.6,
        alternates: toMetadataAlternates(enFamilyAlternates(p)),
      });
    }
  }
  return entries;
}
