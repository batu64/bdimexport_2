// Deterministik sitemap lastmod yardımcısı — SEO_PLAYBOOK §8 + 2026 Google Crawl-Budget standardı:
// Her build'de "new Date()" basmak Google'da sahte lastmod sinyali olarak işlenir.
// Gerçek dosya mtime değerini (YYYY-MM-DD) okur; dosya bulunamazsa kararlı sürüm tarihini döner.
import fs from "node:fs";
import path from "node:path";

export const SEO_RELEASE_DATE = "2026-11-22";

export function fileLastMod(...relParts: string[]): string {
  try {
    const full = path.join(process.cwd(), ...relParts);
    const stat = fs.statSync(full);
    return stat.mtime.toISOString().slice(0, 10);
  } catch {
    return SEO_RELEASE_DATE;
  }
}

export function fileLastModDate(...relParts: string[]): Date {
  return new Date(`${fileLastMod(...relParts)}T00:00:00.000Z`);
}
