// Ana Sitemap üreteci — SEO_PLAYBOOK §8 + 2026/2027 Çoklu-Ülke Koridorları & Rehberler.
// Kural: Sitemap'te YALNIZ 200 OK ve indexable (noindex OLMAYAN, boş OLMAYAN) kanonik URL'ler yer alır.
import type { MetadataRoute } from "next";
import fs from "node:fs";
import path from "node:path";
import { EN_PATHS, SITE_BASE, buildAlternateSet, crossClusterAlternates, enFamilyAlternates, joinUrl, toMetadataAlternates } from "@/lib/hreflang";
import manifest from "@/lib/hreflang.manifest.json";
import { locales, enVariants } from "@/lib/i18n";
import { MARKET_CORRIDORS } from "@/lib/seo/markets";
import { fileLastModDate } from "@/lib/seo/lastmod";
import { TR_EXPORT_CORRIDORS } from "@/app/(tr)/_lib/tr-seo-data";
import { insightBase, listInsights, type InsightScope } from "@/lib/ui/insights";
import { listRatgeber } from "@/app/(de)/de/_lib/ratgeber";
import { listZhInsights } from "@/app/(zh)/zh/_lib/insights";

const BASE = SITE_BASE;

export const dynamic = "force-static";

function listMd(dir: string): string[] {
  const full = path.join(process.cwd(), "content", "tr", dir);
  if (!fs.existsSync(full)) return [];
  return fs.readdirSync(full).filter((f) => f.endsWith(".md")).map((f) => f.replace(/\.md$/, "")).sort();
}

function listServices(locale: string): string[] {
  const full = path.join(process.cwd(), "content", locale, "services");
  if (!fs.existsSync(full)) return [];
  return fs.readdirSync(full).filter((f) => f.endsWith(".md")).map((f) => f.replace(/\.md$/, "")).sort();
}

export default function sitemap(): MetadataRoute.Sitemap {
  const stableMod = fileLastModDate("lib", "hreflang.manifest.json");
  const homeAlt = toMetadataAlternates(buildAlternateSet("", [...locales], [...enVariants]));

  const trRoutes = [
    "",
    "ithalat",
    "ithalat/rehberler",
    "ithalat/cin-gumruk-vergisi-hesaplama",
    "ihracat",
    "ihracat/pazarlar",
    "ticari-istihbarat",
    "rfq",
    "kvkk-riza",
    "ihracat/ucretsiz-destek-basvuru",
  ];
  for (const s of listMd("ithalat")) if (s !== "danismanlik-talebi") trRoutes.push(`ithalat/${s}`);
  for (const s of listMd("ihracat")) if (s !== "ucretsiz-destek-basvuru") trRoutes.push(`ihracat/${s}`);
  for (const g of listMd(path.join("ithalat", "rehberler"))) trRoutes.push(`ithalat/rehberler/${g}`);
  for (const c of TR_EXPORT_CORRIDORS) trRoutes.push(`ihracat/pazarlar/${c.slug}`);

  const entries: MetadataRoute.Sitemap = [];
  for (const route of trRoutes) {
    const url = route ? `${BASE}/${route}` : BASE;
    const cross = route ? crossClusterAlternates(`/${route}`) : null;
    entries.push({
      url,
      lastModified: stableMod,
      changeFrequency: "weekly",
      priority: route === "" ? 1 : route.startsWith("ihracat/pazarlar") ? 0.85 : 0.8,
      ...(route === "" ? { alternates: homeAlt } : cross ? { alternates: toMetadataAlternates(cross) } : {}),
    });
  }

  // EN ailesi: ana hub + ABD bölümü (/en/us) + ülke koridorları + ürün/hizmet/sektör/kategori sayfaları
  for (const p of EN_PATHS) {
    const marketMatch = p.startsWith("markets/") ? MARKET_CORRIDORS.find((m) => `markets/${m.slug}` === p) : undefined;
    const url = joinUrl("en", p);
    let alternates = p === "" || p === "us" ? homeAlt : toMetadataAlternates(enFamilyAlternates(p));
    if (p.startsWith("us/")) {
      alternates = {
        languages: {
          "en-US": url,
          en: url,
          "x-default": url,
        },
      };
    } else if (marketMatch?.hreflangRegional) {
      alternates = {
        languages: {
          en: url,
          [marketMatch.hreflangRegional]: url,
          "x-default": url,
        },
      };
    }
    entries.push({
      url,
      lastModified: stableMod,
      changeFrequency: "weekly",
      priority: p === "" || p === "us" ? 0.95 : p.startsWith("us/") || p.startsWith("markets") ? 0.9 : 0.75,
      alternates,
    });
  }

  // EN varyantları: 10 yerelleştirilmiş alt-hub (/en/{ru,fr,nl,es,ar,fi,sq,pl,ro,it})
  for (const v of enVariants) {
    for (const p of manifest.variants[v] as string[]) {
      entries.push({
        url: joinUrl("en", v, p),
        lastModified: stableMod,
        changeFrequency: "weekly",
        priority: p === "" || p === "wooden-utility-poles" ? 0.85 : 0.7,
        alternates: p === "" ? homeAlt : toMetadataAlternates(enFamilyAlternates(p)),
      });
    }
  }

  // DE ailesi: hub + Leistungen + vertrauen + Ratgeber (yalnız içerik varsa; noindex anfrage & angebot hariç)
  entries.push({ url: `${BASE}/de`, lastModified: stableMod, changeFrequency: "weekly", priority: 0.9, alternates: homeAlt });
  for (const slug of listServices("de")) {
    const cross = crossClusterAlternates(`/de/leistungen/${slug}`);
    entries.push({
      url: `${BASE}/de/leistungen/${slug}`,
      lastModified: stableMod,
      changeFrequency: "weekly",
      priority: 0.8,
      ...(cross ? { alternates: toMetadataAlternates(cross) } : {}),
    });
  }
  entries.push({ url: `${BASE}/de/vertrauen`, lastModified: stableMod, changeFrequency: "weekly", priority: 0.75 });
  const deGuides = listRatgeber();
  if (deGuides.length > 0) {
    const cross = crossClusterAlternates("/de/ratgeber");
    entries.push({
      url: `${BASE}/de/ratgeber`,
      lastModified: stableMod,
      changeFrequency: "weekly",
      priority: 0.75,
      ...(cross ? { alternates: toMetadataAlternates(cross) } : {}),
    });
    for (const slug of deGuides) {
      entries.push({ url: `${BASE}/de/ratgeber/${slug}`, lastModified: stableMod, changeFrequency: "monthly", priority: 0.75 });
    }
  }

  // ZH ailesi: hub + 5 hizmet + 行业指南 (noindex fangan hariç)
  entries.push({ url: `${BASE}/zh`, lastModified: stableMod, changeFrequency: "weekly", priority: 0.9, alternates: homeAlt });
  for (const slug of listServices("zh")) {
    entries.push({ url: `${BASE}/zh/services/${slug}`, lastModified: stableMod, changeFrequency: "weekly", priority: 0.75 });
  }
  const zhGuides = listZhInsights();
  if (zhGuides.length > 0) {
    const cross = crossClusterAlternates("/zh/insights");
    entries.push({
      url: `${BASE}/zh/insights`,
      lastModified: stableMod,
      changeFrequency: "weekly",
      priority: 0.75,
      ...(cross ? { alternates: toMetadataAlternates(cross) } : {}),
    });
    for (const slug of zhGuides) {
      entries.push({ url: `${BASE}/zh/insights/${slug}`, lastModified: stableMod, changeFrequency: "monthly", priority: 0.75 });
    }
  }

  // Makaleler / Insights — YALNIZ en az 1 yayınlanmış makalesi olan merkezler sitemap'e girer (boş sayfa = 0)
  const scopes: InsightScope[] = ["tr", "en", ...enVariants];
  for (const scope of scopes) {
    const slugs = listInsights(scope);
    if (slugs.length === 0) continue;
    const base = insightBase(scope);
    const cross = crossClusterAlternates(base);
    entries.push({
      url: `${BASE}${base}`,
      lastModified: stableMod,
      changeFrequency: "weekly",
      priority: 0.75,
      ...(cross ? { alternates: toMetadataAlternates(cross) } : {}),
    });
    for (const slug of slugs) {
      entries.push({ url: `${BASE}${base}/${slug}`, lastModified: stableMod, changeFrequency: "monthly", priority: 0.75 });
    }
  }

  return entries;
}
