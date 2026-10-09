# hero — Komponent Brief
**Kaynak:** design-tokens.md v1.0 (UX Karar 1, 3, 4) · **Kod:** fe-agent (Qwen 3.8; görsel değişim logic'i Argon 4 gerekirse)

## Props
```ts
interface HeroProps {
  locale: "tr" | "en" | "de" | "zh";
  variant: "home" | "product" | "campaign";
  title: string;              // dictionary
  subtitle: string;
  ctaPrimary: { label: string; href: string };
  ctaSecondary?: { label: string; href: string };
  image?: { src: string; alt: string };       // R2/OG; product variant'ta zorunlu
  partnerBadges?: { name: string }[];          // home: güven bandı (UX Karar 4)
}
```

## Düzen (UX Karar 1)
tr/en/de: sol metin (%55) + sağ görsel (%45), rule-of-thirds; **zh: simetrik merkez**, metin üstte görsel altta.
min-height: 480px (360bp) / 560px (768) / 640px (1280+).

## Renk/Tipografi
- home: bg `primary`, metin `bg` (beyaz), başlık 48/36/30px weight 600, alt yazı 18px muted-on-dark (`bg`/80)
- product: bg `bg`, başlık `primary` — H1 SEO şablonu burada (SEO_PLAYBOOK §5)
- campaign: bg `accent`'ten primary'ye gradient yok — düz `primary`, rozet bandı öne
- CTA primary: `highlight` dolgu + `primary` metin, 12px/24px py-px, radius 8; secondary: kontur `bg` (koyu zemin) veya `primary` (açık zemin)
- Sayfa başına TEK amber primary (UX Karar 3) — navbar CTA primary ise hero CTA secondary render eder

## Responsive (4 BP)
360: tek kolon, görsel altta 240px yükseklik, CTA'lar tam genişlik stacked · 768: görsel 320px · 1280: iki kolon · 1920: container sınırı, içerik sola yaslı

## Güven Bandı (home, UX Karar 4)
hero alt bandı: yatay scroll (mobil) / flex (desktop); rozet: partner adı + checkmark ikonu SVG; metin locale bazlı ("Onaylı Türk İş Ortağı" / "Verified Turkish Partner"); boş durum: FAZ 1'de "İlk onaylı partnerler yakında"

## Erişilebilirlik
- `<section aria-labelledby>` h1 id bağlantılı; product variant'ta h1 = sayfa H1 (tek H1 kuralı)
- Görsel: next/image + priority (LCP), alt zorunlu
- Kontrast: `highlight` üstü `primary` metin — WCAG AA doğrulanmış çift

## Notlar
- Metinler %100 dictionary (gömülü literal red); tarih/sayı formatı locale'e göre
