// Dil bazlı parçalı sitemap üreteci — SEO_PLAYBOOK §8
// Static export uyumlu: fs tabanlı content taraması (agent YOK — ORCHESTRATOR.md §4.3 K8)
import type { MetadataRoute } from "next";
import fs from "fs";
import path from "path";

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
  return entries;
}

