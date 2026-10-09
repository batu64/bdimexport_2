// hreflang helper — SEO_PLAYBOOK §1 kuralları burada gömülü:
// K1: karşılıklılık (çift yönlü set) · K2: 404'a hreflang YAZILMAZ (varsa ekle, yoksa es geç)
// K3: hreflang değeri content/{tr,zh,en/{ru..},de} dizin yapısıyla birebir
// K4: varyantlar /en-ru DEĞİL /en/ru/
// K5: bu helper'a veri agent manifest'lerinden gelir; dosyaya yalnızca orchestrator yazar
import { localeConfig, enVariants, enVariantHreflang, type Locale, type EnVariant } from "./i18n";

const BASE = "https://bdimexport.com";

export type AlternateSet = {
  hreflang: string;
  href: string;
}[];

/** Bir locale'in kök-relative yolu için tam alternate seti üretir.
 *  existingLanguages: sitede GERÇEKTEN var olan dil yolları (404-hreflang yasağı için).
 *  Örn: FAZ 0-1'de sadece ["tr"] → set yalnızca tr + x-default içerir. */
export function buildAlternateSet(
  pathInLocale: string,
  existingLanguages: Locale[],
  existingEnVariants: EnVariant[] = [],
): AlternateSet {
  const set: AlternateSet = [];
  const clean = pathInLocale.replace(/^\//, "");
  for (const loc of existingLanguages) {
    const cfg = localeConfig[loc];
    const href = loc === "tr" ? `${BASE}/${clean}` : `${BASE}/${loc}/${clean}`;
    set.push({ hreflang: cfg.hreflang, href });
    if (cfg.xDefault) set.push({ hreflang: "x-default", href });
  }
  // EN varyantları yalnızca /en/... yolları için
  if (existingLanguages.includes("en")) {
    const enHref = `${BASE}/en/${clean}`;
    if (!set.some((s) => s.href === enHref)) {
      set.push({ hreflang: "en", href: enHref });
    }
    for (const v of existingEnVariants) {
      set.push({ hreflang: enVariantHreflang[v], href: `${BASE}/en/${v}/${clean}` });
    }
  }
  // K1 karşılıklılık: set içinde hreflang + href çiftleri benzersiz olmalı
  const seen = new Set<string>();
  return set.filter((s) => {
    const k = `${s.hreflang}:${s.href}`;
    if (seen.has(k)) return false;
    seen.add(k);
    return true;
  });
}

/** Next.js Metadata API alternate dizisine çevirir */
export function toMetadataAlternates(set: AlternateSet) {
  const languages: Record<string, string> = {};
  for (const { hreflang, href } of set) languages[hreflang] = href;
  return { languages };
}
