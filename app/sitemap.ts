// Sitemap üreteci — SEO_PLAYBOOK §8 (FAZ 2 Step 2.8a)
// Static export uyumlu. TR URL'leri content/tr taramasından; EN ailesi (ana + varyant) lib/hreflang.manifest.json'dan.
// Dil-split (sitemap-en.xml vb.) ayrı karar: şu an tek dosyada; EN/varyant URL'leri xhtml:link alternates taşır.
import type { MetadataRoute } from "next";
import fs from "fs";
import path from "path";
import { EN_PATHS, buildAlternateSet, enFamilyAlternates, joinUrl, toMetadataAlternates } from "@/lib/hreflang";
import manifest from "@/lib/hreflang.manifest.json";
import { locales, enVariants } from "@/lib/i18n";
import { insightBase, listInsights, type InsightScope } from "@/lib/ui/insights";

const BASE = "https://bdimexport.com";

export const dynamic = "force-static";

// Statik sayfa envanteri — build'de content/tr'den otomatik türetilir
function listMd(dir: string): string[] {
  const full = path.join(process.cwd(), "content", "tr", dir);
  if (!fs.existsSync(full)) return [];
  return fs.readdirSync(full).filter(f => f.endsWith(".md")).map(f => f.replace(/\.md$/, ""));
}

// content/<locale>/services/*.md → slug listesi (de/zh hizmet sayfaları için; rota /de/leistungen · /zh/services)
function listServices(locale: string): string[] {
  const full = path.join(process.cwd(), "content", locale, "services");
  if (!fs.existsSync(full)) return [];
  return fs.readdirSync(full).filter(f => f.endsWith(".md")).map(f => f.replace(/\.md$/, "")).sort();
}

export default function sitemap(): MetadataRoute.Sitemap {
  const trRoutes = ["", "ithalat", "ihracat", "kvkk-riza", "ihracat/ucretsiz-destek-basvuru"];
  for (const s of listMd("ithalat")) if (s !== "danismanlik-talebi") trRoutes.push(`ithalat/${s}`);
  for (const s of listMd("ihracat")) if (s !== "ucretsiz-destek-basvuru") trRoutes.push(`ihracat/${s}`);
  for (const g of listMd(path.join("ithalat", "rehberler"))) trRoutes.push(`ithalat/rehberler/${g}`);

  // ANA SAYFA tam karşılıklı set (SEO_PLAYBOOK §1 / Proje.md §3.1): tr/en/de/zh + en-XX, x-default=tr.
  // 9 ana sayfanın hepsi AYNI xhtml:link setini taşır; iç sayfalar kendi ailesinde kalır.
  const homeAlt = toMetadataAlternates(buildAlternateSet("", [...locales], [...enVariants]));

  const entries: MetadataRoute.Sitemap = [];
  for (const route of trRoutes) {
    // Kök için trailing-slash YOK → loc, hreflang tr/x-default href'i ve canonical ile birebir aynı (BASE)
    const url = route ? `${BASE}/${route}` : BASE;
    entries.push({
      url, lastModified: new Date(), changeFrequency: "weekly",
      priority: route === "" ? 1 : 0.8,
      ...(route === "" ? { alternates: homeAlt } : {}),
    });
  }

  // EN ailesi: ana hub + ürün/hizmet/sektör/kategori sayfaları (manifest.en)
  for (const p of EN_PATHS) {
    entries.push({
      url: joinUrl("en", p),
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: p === "" ? 0.9 : 0.7,
      alternates: p === "" ? homeAlt : toMetadataAlternates(enFamilyAlternates(p)),
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
        alternates: p === "" ? homeAlt : toMetadataAlternates(enFamilyAlternates(p)),
      });
    }
  }

  // DE ailesi (FAZ_5): hub + Leistungen (content/de/services → /de/leistungen/{slug}) + vertrauen + anfrage.
  // İç sayfalar kendi ailesinde (hreflang YAZILMAZ — farklı niyet); ana sayfa homeAlt taşır.
  // /de/ratgeber (makale listesi) makale yokken noindex → sitemap DIŞI.
  entries.push({ url: `${BASE}/de`, lastModified: new Date(), changeFrequency: "weekly", priority: 0.9, alternates: homeAlt });
  for (const slug of listServices("de")) {
    entries.push({ url: `${BASE}/de/leistungen/${slug}`, lastModified: new Date(), changeFrequency: "weekly", priority: 0.7 });
  }
  for (const p of ["vertrauen", "anfrage"]) {
    entries.push({ url: `${BASE}/de/${p}`, lastModified: new Date(), changeFrequency: "monthly", priority: 0.6 });
  }

  // ZH ailesi (FAZ_5): hub + hizmetler (content/zh/services → /zh/services/{slug}).
  // İç sayfalar kendi ailesinde; /zh/insights (行业资讯) makale yokken noindex → sitemap DIŞI.
  entries.push({ url: `${BASE}/zh`, lastModified: new Date(), changeFrequency: "weekly", priority: 0.9, alternates: homeAlt });
  for (const slug of listServices("zh")) {
    entries.push({ url: `${BASE}/zh/services/${slug}`, lastModified: new Date(), changeFrequency: "weekly", priority: 0.7 });
  }
  // FAZ_4 4.6 — makaleler: dizin sayfaları + yayınlanmış makaleler. Liste build anında dosya sisteminden okunur
  // (content/**/makaleler|insights/*.md — yalnız merge edilmiş yayın PR'ı ile gelir) → yeni makale merge + build ile
  // kendiliğinden girer; ortak dosyaya elle dokunulmaz. Makaleler tek dillidir → hreflang alternates YAZILMAZ
  // (karşılığı olmayan dile hreflang = 404-hreflang yasağı, SEO_PLAYBOOK §1.4). _yok yer tutucusu listede yoktur.
  const scopes: InsightScope[] = ["tr", "en", ...enVariants];
  for (const scope of scopes) {
    const base = insightBase(scope);
    entries.push({ url: `${BASE}${base}`, lastModified: new Date(), changeFrequency: "weekly", priority: 0.6 });
    for (const slug of listInsights(scope)) {
      entries.push({ url: `${BASE}${base}/${slug}`, lastModified: new Date(), changeFrequency: "monthly", priority: 0.6 });
    }
  }
  return entries;
}
