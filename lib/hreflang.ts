// hreflang helper — SEO_PLAYBOOK + 2026/2027 International BCP-47 / ISO-639-1 + ISO-3166-1 kuralları:
// K1: karşılıklılık (çift yönlü set) · K2: 404'a hreflang YAZILMAZ (varsa ekle, yoksa es geç)
// K3: hreflang değeri gerçek sayfa diliyle (<html lang>) birebir uyumlu BCP-47 kodu taşır
// K4: varyantlar /en/{xx} alt klasörü · DACH kapsama (de, de-DE, de-AT, de-CH) · Küresel x-default
import { locales, localeConfig, enVariants, enVariantHreflang, type Locale, type EnVariant } from "./i18n";
import manifest from "./hreflang.manifest.json";

export const SITE_BASE = "https://bdimexport.com";
const BASE = SITE_BASE;

/** Boş parçaları atlar: joinUrl("en", "") → BASE/en (sondaki "/" yok — canonical ile aynı) */
export const joinUrl = (...parts: string[]) => [BASE, ...parts.filter(Boolean)].join("/");

/** EN ailesinin sayfa yolları (manifest) — sitemap ve sayfa metadata'sı buradan okur */
export const EN_PATHS: readonly string[] = manifest.en;

export type AlternateSet = {
  hreflang: string;
  href: string;
}[];

/** Bir locale'in kök-relative yolu için tam alternate seti üretir.
 *  existingLanguages: sitede GERÇEKTEN var olan dil yolları (404-hreflang yasağı için). */
export function buildAlternateSet(
  pathInLocale: string,
  existingLanguages: Locale[],
  existingEnVariants: EnVariant[] = [],
): AlternateSet {
  const set: AlternateSet = [];
  const clean = pathInLocale.replace(/^\//, "");
  const hasEn = existingLanguages.includes("en");

  for (const loc of existingLanguages) {
    const cfg = localeConfig[loc];
    const href = loc === "tr" ? joinUrl(clean) : joinUrl(loc, clean);
    set.push({ hreflang: cfg.hreflang, href });
    if (loc === "tr") {
      set.push({ hreflang: "tr-TR", href });
      // Çok dilli kümede (en mevcutsa) küresel x-default /en hub'ına yönlenir;
      // yalnız TR sayfalarında ise x-default kendi URL'sini korur.
      if (!hasEn && cfg.xDefault) set.push({ hreflang: "x-default", href });
    }
    if (loc === "de") {
      set.push({ hreflang: "de-DE", href });
      set.push({ hreflang: "de-AT", href });
      set.push({ hreflang: "de-CH", href });
    }
  }

  if (hasEn) {
    const enHref = joinUrl("en", clean);
    if (!set.some((s) => s.hreflang === "en" && s.href === enHref)) {
      set.push({ hreflang: "en", href: enHref });
    }
    // Çok dilli ana sayfa kümesinde eşleşmeyen tüm ülkeler için küresel İngilizce vitrin x-default olur
    if (existingLanguages.length > 1) {
      set.push({ hreflang: "x-default", href: enHref });
    } else if (existingEnVariants.length > 0) {
      set.push({ hreflang: "x-default", href: enHref });
    }
    for (const v of existingEnVariants) {
      set.push({ hreflang: enVariantHreflang[v], href: joinUrl("en", v, clean) });
    }
  }

  const seen = new Set<string>();
  return set.filter((s) => {
    const k = `${s.hreflang}:${s.href}`;
    if (seen.has(k)) return false;
    seen.add(k);
    return true;
  });
}

/** Ana sayfa (homepage) tam karşılıklı set — 14 dil + bölgesel DACH/TR + küresel x-default (/en).
 *  Tüm 14 ana sayfa (/, /en, /de, /zh ve 10 /en/{xx} varyantı) birebir AYNI seti taşır (K1 %100 karşılıklılık). */
export function homeAlternates(self: string): { canonical: string; languages: Record<string, string> } {
  const canonical = self ? joinUrl(...self.split("/").filter(Boolean)) : joinUrl();
  return {
    canonical,
    ...toMetadataAlternates(buildAlternateSet("", [...locales], [...enVariants])),
  };
}

/** EN ailesi için tam set: en + manifest'te bu yolu içeren varyantlar (+ varyant varsa x-default=/en/...). */
export function enFamilyAlternates(pathInEn: string): AlternateSet {
  const present = enVariants.filter((v) => (manifest.variants[v] as string[]).includes(pathInEn));
  return buildAlternateSet(pathInEn, ["en"], present);
}

/** Next.js Metadata API alternate dizisine çevirir */
export function toMetadataAlternates(set: AlternateSet) {
  const languages: Record<string, string> = {};
  for (const { hreflang, href } of set) languages[hreflang] = href;
  return { languages };
}
