// Dil bazlı parçalı sitemap üreteci — SEO_PLAYBOOK §8
// Deterministik: build sırasında Next.js sitemap API'si çalıştırır (agent YOK — ORCHESTRATOR.md §4.3 K8)
// K1: hreflang karşılıklılık · K2: yalnızca GERÇEKTEN var olan diller (404-hreflang yasağı)
import type { MetadataRoute } from "next";
import { locales } from "@/lib/i18n";

const BASE = "https://bdimexport.com";

// Statik sayfa envanteri — yeni sayfa PR merge'ünde build otomatik yeniler (agent müdahalesi yok)
// Not: content koleksiyonları bağlandığında dinamik üretimle genişler (FAZ 2+)
const staticRoutes: Record<string, string[]> = {
  tr: ["", "ithalat", "ihracat"],
  en: [],
  de: [],
  zh: [],
};

export default function sitemap(): MetadataRoute.Sitemap {
  const entries: MetadataRoute.Sitemap = [];
  for (const loc of locales) {
    for (const route of staticRoutes[loc] ?? []) {
      const url = loc === "tr" ? `${BASE}/${route}` : `${BASE}/${loc}/${route}`;
      entries.push({ url, lastModified: new Date(), changeFrequency: "weekly", priority: route === "" ? 1 : 0.8 });
    }
  }
  return entries;
}
