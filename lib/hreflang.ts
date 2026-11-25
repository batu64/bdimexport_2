// hreflang helper — SEO_PLAYBOOK + 2026/2027 International BCP-47 / ISO-639-1 + ISO-3166-1 kuralları:
// K1: karşılıklılık (çift yönlü set) · K2: 404'a hreflang YAZILMAZ (varsa ekle, yoksa es geç)
// K3: hreflang değeri gerçek sayfa diliyle (<html lang>) birebir uyumlu BCP-47 kodu taşır
// K4: varyantlar /en/{xx} alt klasörü · DACH kapsama (de, de-DE, de-AT, de-CH) · Küresel x-default
// K5: Eşdeğer ticari hizmet ve rehber merkezleri arasında tam karşılıklı çapraz-dil (TR <-> EN <-> DE <-> ZH) hreflang.
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

type CrossCluster = {
  en?: string;
  enSubPath?: string; // manifest.variants altındaki karşılık (örn. "services/sourcing")
  de?: string;
  tr?: string;
  zh?: string;
};

/** Eşdeğer ticari niyet taşıyan çapraz-dil (TR / EN / DE / ZH + varyantlar) hizmet ve rehber kümeleri */
const CROSS_LOCALE_CLUSTERS: CrossCluster[] = [
  { en: "/en/services/sourcing", enSubPath: "services/sourcing", de: "/de/leistungen/beschaffung" },
  { en: "/en/services/china-sourcing", de: "/de/leistungen/china-einkauf", tr: "/ithalat/tedarik" },
  { en: "/en/services/inspection", enSubPath: "services/inspection", de: "/de/leistungen/werkspruefung", tr: "/ithalat/fabrika-denetimi" },
  { en: "/en/services/container-loading", de: "/de/leistungen/qualitaetskontrolle-china", tr: "/ithalat/konteyner-yukleme-denetimi" },
  { en: "/en/services/manufacturing", de: "/de/leistungen/lohnfertigung" },
  { en: "/en/services/logistics", de: "/de/leistungen/logistik", tr: "/ithalat/lojistik" },
  { en: "/en/services/customs", de: "/de/leistungen/zollabwicklung", tr: "/ithalat/gumruk" },
  { en: "/en/services/commercial-intelligence", tr: "/ithalat/ticari-istihbarat-uretici-dogrulama" },
  { en: "/en/rfq", tr: "/rfq" },
  { en: "/en/insights", tr: "/makaleler", de: "/de/ratgeber", zh: "/zh/insights" },
];

export function crossClusterAlternates(routePath: string): AlternateSet | null {
  const norm = "/" + routePath.replace(/^\/+/, "");
  const cluster = CROSS_LOCALE_CLUSTERS.find((c) => {
    if (c.en === norm || c.de === norm || c.tr === norm || c.zh === norm) return true;
    if (c.enSubPath) {
      for (const v of enVariants) {
        if ((manifest.variants[v] as string[]).includes(c.enSubPath) && `/en/${v}/${c.enSubPath}` === norm) {
          return true;
        }
      }
    }
    return false;
  });
  if (!cluster) return null;

  const set: AlternateSet = [];
  if (cluster.en) {
    const u = `${BASE}${cluster.en}`;
    set.push({ hreflang: "en", href: u });
    set.push({ hreflang: "x-default", href: u });
  }
  if (cluster.enSubPath) {
    for (const v of enVariants) {
      if ((manifest.variants[v] as string[]).includes(cluster.enSubPath)) {
        set.push({ hreflang: enVariantHreflang[v], href: joinUrl("en", v, cluster.enSubPath) });
      }
    }
  }
  if (cluster.de) {
    const u = `${BASE}${cluster.de}`;
    set.push({ hreflang: "de", href: u });
    set.push({ hreflang: "de-DE", href: u });
    set.push({ hreflang: "de-AT", href: u });
    set.push({ hreflang: "de-CH", href: u });
  }
  if (cluster.tr) {
    const u = `${BASE}${cluster.tr}`;
    set.push({ hreflang: "tr", href: u });
    set.push({ hreflang: "tr-TR", href: u });
    if (!cluster.en) set.push({ hreflang: "x-default", href: u });
  }
  if (cluster.zh) {
    set.push({ hreflang: "zh-CN", href: `${BASE}${cluster.zh}` });
  }
  return set;
}

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
    if (existingLanguages.length > 1) {
      set.push({ hreflang: "en-US", href: joinUrl("en", "us") });
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

/** Ana sayfa (homepage) tam karşılıklı set — 14 dil + bölgesel DACH/TR + küresel x-default (/en). */
export function homeAlternates(self: string): { canonical: string; languages: Record<string, string> } {
  const canonical = self ? joinUrl(...self.split("/").filter(Boolean)) : joinUrl();
  return {
    canonical,
    ...toMetadataAlternates(buildAlternateSet("", [...locales], [...enVariants])),
  };
}

/** EN ailesi için tam set: çapraz dil kümesi varsa onu döner; yoksa en + manifest'te bu yolu içeren varyantlar. */
export function enFamilyAlternates(pathInEn: string): AlternateSet {
  const clean = pathInEn.replace(/^\//, "");
  const cross = crossClusterAlternates(clean ? `/en/${clean}` : "/en");
  if (cross) return cross;
  const present = enVariants.filter((v) => (manifest.variants[v] as string[]).includes(clean));
  return buildAlternateSet(clean, ["en"], present);
}

/** Next.js Metadata API alternate dizisine çevirir */
export function toMetadataAlternates(set: AlternateSet) {
  const languages: Record<string, string> = {};
  for (const { hreflang, href } of set) languages[hreflang] = href;
  return { languages };
}
