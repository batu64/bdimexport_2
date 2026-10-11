# hero — Komponent Brief
**Kaynak:** design-tokens.md v2.0 (Varyant A onaylı) · `_derived-tokens.md` (UX Karar 1, 3, 4) · **Kod:** fe-agent (Sonnet 5.5)

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
min-height: `heroMinH.xs` (360) / `heroMinH.md` (768) / `heroMinH.lg` (1280+).

## Renk/Tipografi
- home: bg `primary`, metin `bg` (beyaz), başlık `type.H1` weight 600, alt yazı `fontSize.lg` `onDarkMuted`
- product: bg `bg`, başlık `primary` — H1 SEO şablonu burada (SEO_PLAYBOOK §5)
- campaign: bg `accent`'ten primary'ye gradient yok — düz `primary`, rozet bandı öne
- CTA primary: `highlight` dolgu + `primary` metin, py `space.s3` / px `space.s6`, `radius`; secondary: kontur `bg` (koyu zemin) veya `primary` (açık zemin)
- Sayfa başına TEK amber primary (UX Karar 3) — navbar CTA primary ise hero CTA secondary render eder

## Responsive (4 BP)
360: tek kolon, görsel altta `heroImgH.xs`, CTA'lar tam genişlik stacked · 768: görsel `heroImgH.md`, CTA'lar auto genişlik yan yana · 1280: iki kolon (metin %55 / görsel %45) · 1920: `container` sınırı, içerik sola yaslı, boyutlar 1280 ile aynı

## Güven Bandı (home, UX Karar 4)
hero alt bandı: yatay scroll (mobil) / flex (desktop); rozet: partner adı + checkmark ikonu SVG; metin locale bazlı ("Onaylı Türk İş Ortağı" / "Verified Turkish Partner"); boş durum: FAZ 1'de "İlk onaylı partnerler yakında"

## Erişilebilirlik
- `<section aria-labelledby>` h1 id bağlantılı; product variant'ta h1 = sayfa H1 (tek H1 kuralı)
- Görsel: next/image + priority (LCP), alt zorunlu
- Kontrast: `primary` metin üstü `highlight` (6.4:1) — WCAG AA doğrulanmış çift (design-tokens §1.4)
- Odak görünür (`accent` outline); CTA'lar min `touchMin`; güven bandı yatay scroll'u klavyeyle erişilebilir (`tabindex=0`, `role="list"`)

## Notlar
- Metinler %100 dictionary (gömülü literal red); tarih/sayı formatı locale'e göre
