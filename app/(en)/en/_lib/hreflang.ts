// EN ailesi sayfa-düzeyi alternates — FAZ_2 Step 2.8b. TEK ÜRETİCİ: lib/hreflang.ts (2.8a, ortak dosya) kurallarını (SEO_PLAYBOOK §1.4) kullanır, yeniden yazmaz.
//  - canonical: HER ZAMAN sayfanın kendi URL'si (varyantlarda da: /en/ru kendi canonical'ıdır, /en'e işaret etmez)
//  - hreflang: en + manifest'te (lib/hreflang.manifest.json) bu yolu içeren varyantlar (en-RU/FR/NL/ES/AR). Karşılığı OLMAYAN dil YAZILMAZ (404-hreflang yasağı).
//  - TR / x-default YOK: EN sayfalarının TR karşılığı yok (farklı niyet). `alternates` nesnesi aynı zamanda eski kök layout'tan kalma
//    tr/x-default mirasını da keser (2.5 rework sonrası kök layout zaten yok; burada açıkça dil seti verilir).
import type { Metadata } from "next";
import { enFamilyAlternates, joinUrl, toMetadataAlternates } from "@/lib/hreflang";
import type { EnVariant } from "@/lib/i18n";

type Alternates = NonNullable<Metadata["alternates"]>;

/** pathInEn: "/en" altına göre yol — "" (ana sayfa), "services/sourcing", "products/apparel" … */
export function enAlternates(pathInEn: string): Alternates {
  return { canonical: joinUrl("en", pathInEn), ...toMetadataAlternates(enFamilyAlternates(pathInEn)) };
}

/** Varyant sayfası: canonical KENDİ URL'si (/en/{v}/{path}); hreflang seti EN karşılığıyla AYNI aile (karşılıklılık: her üye aynı seti taşır). */
export function variantAlternates(variant: EnVariant, pathInEn: string): Alternates {
  return { canonical: joinUrl("en", variant, pathInEn), ...toMetadataAlternates(enFamilyAlternates(pathInEn)) };
}
