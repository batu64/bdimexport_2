// Ana Sitemap üreteci — SEO_PLAYBOOK §8 + 2026/2027 Çoklu-Ülke Koridorları & Hedefli B2B Teklif Uzantıları.
// Static export uyumlu; deterministik lastmod (sahte new Date() churn yok); tam karşılıklı BCP-47 hreflang.
import type { MetadataRoute } from "next";
import fs from "node:fs";
import path from "node:path";
import { EN_PATHS, SITE_BASE, buildAlternateSet, enFamilyAlternates, joinUrl, toMetadataAlternates } from "@/lib/hreflang";
import manifest from "@/lib/hreflang.manifest.json";
import { locales, enVariants } from "@/lib/i18n";
import { MARKET_CORRIDORS } from "@/lib/seo/markets";
import { DE_PROPOSAL, ZH_PROPOSAL } from "@/lib/seo/proposals";
import { fileLastModDate } from "@/lib/seo/lastmod";
import { TR_EXPORT_CORRIDORS, TR_PROPOSALS } from "@/app/(tr)/_lib/tr-seo-data";
import { insightBase, listInsights, type InsightScope } from "@/lib/ui/insights";

const BASE = SITE_BASE;

export const dynamic = "force-static";

function listMd(dir: string): string[] {
  const full = path.join(process.cwd(), "content", "tr", dir);
  if (!fs.existsSync(full)) return [];
  return fs.readdirSync(full).filter((f) => f.endsWith(".md")).map((f) => f.replace(/\.md$/, ""));
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
    "ihracat",
    "ihracat/pazarlar",
    "teklif",
    "ticari-istihbarat",
    "rfq",
    "kvkk-riza",
    "ihracat/ucretsiz-destek-basvuru",
  ];
  for (const s of listMd("ithalat")) if (s !== "danismanlik-talebi") trRoutes.push(`ithalat/${s}`);
  for (const s of listMd("ihracat")) if (s !== "ucretsiz-destek-basvuru") trRoutes.push(`ihracat/${s}`);
  for (const g of listMd(path.join("ithalat", "rehberler"))) trRoutes.push(`ithalat/rehberler/${g}`);
  for (const c of TR_EXPORT_CORRIDORS) trRoutes.push(`ihracat/pazarlar/${c.slug}`);
  for (const p of TR_PROPOSALS) trRoutes.push(`teklif/${p.slug}`);

  const entries: MetadataRoute.Sitemap = [];
  for (const route of trRoutes) {
    const url = route ? `${BASE}/${route}` : BASE;
    entries.push({
      url,
      lastModified: stableMod,
      changeFrequency: "weekly",
      priority: route === "" ? 1 : route.startsWith("teklif") || route.startsWith("ihracat/pazarlar") ? 0.85 : 0.8,
      ...(route === "" ? { alternates: homeAlt } : {}),
    });
  }

  // EN ailesi: ana hub + ABD bölümü (/en/us) + ülke koridorları + teklif şablonları + ürün/hizmet/sektör/kategori sayfaları
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
      priority: p === "" || p === "us" ? 0.95 : p.startsWith("us/") || p.startsWith("markets") || p.startsWith("proposals") ? 0.9 : 0.75,
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
        priority: p === "" ? 0.8 : 0.65,
        alternates: p === "" ? homeAlt : toMetadataAlternates(enFamilyAlternates(p)),
      });
    }
  }

  // DE ailesi: hub + Leistungen + vertrauen + anfrage + B2B Projektvorschlag
  entries.push({ url: `${BASE}/de`, lastModified: stableMod, changeFrequency: "weekly", priority: 0.9, alternates: homeAlt });
  for (const slug of listServices("de")) {
    entries.push({ url: `${BASE}/de/leistungen/${slug}`, lastModified: stableMod, changeFrequency: "weekly", priority: 0.75 });
  }
  for (const p of ["vertrauen", "anfrage", `angebot/${DE_PROPOSAL.slug}`]) {
    entries.push({ url: `${BASE}/de/${p}`, lastModified: stableMod, changeFrequency: "weekly", priority: 0.75 });
  }

  // ZH ailesi: hub + 5 hizmet + özel Türkiye saha iş teklifi
  entries.push({ url: `${BASE}/zh`, lastModified: stableMod, changeFrequency: "weekly", priority: 0.9, alternates: homeAlt });
  for (const slug of listServices("zh")) {
    entries.push({ url: `${BASE}/zh/services/${slug}`, lastModified: stableMod, changeFrequency: "weekly", priority: 0.75 });
  }
  entries.push({ url: `${BASE}/zh/fangan/${ZH_PROPOSAL.slug}`, lastModified: stableMod, changeFrequency: "weekly", priority: 0.8 });

  // Makaleler / Insights
  const scopes: InsightScope[] = ["tr", "en", ...enVariants];
  for (const scope of scopes) {
    const base = insightBase(scope);
    entries.push({ url: `${BASE}${base}`, lastModified: stableMod, changeFrequency: "weekly", priority: 0.6 });
    for (const slug of listInsights(scope)) {
      entries.push({ url: `${BASE}${base}/${slug}`, lastModified: stableMod, changeFrequency: "monthly", priority: 0.6 });
    }
  }

  return entries;
}
