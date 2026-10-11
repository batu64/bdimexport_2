# card — Komponent Brief
**Kaynak:** design-tokens.md v2.0 (Varyant A onaylı) · `_derived-tokens.md` · **Kod:** fe-agent (Sonnet 5.5)

## Props
```ts
interface CardProps {
  variant: "service" | "product" | "partner";
  locale: "tr" | "en" | "de" | "zh";
  title: string; description?: string;
  href: string;                        // iç link, anchor = keyword (CONTENT_STYLE §5)
  image?: { src: string; alt: string };
  // partner variant özel:
  verified?: boolean; consentLogo?: boolean;   // consent=false → logo YERİNE initografik avatar
  sector?: string;
}
```

## Varyant Farkları
| Varyant | Görsel | Metin | Ek |
| :--- | :--- | :--- | :--- |
| service | üstte 16:9 next/image | başlık `fontSize.lg`/600 + 2 satır desc (clamp) | alt: keyword'lü iç link "→" |
| product | üstte 4:3 | başlık `fontSize.base`/600 + ürün sektör etiketi (`accent`, `fontSize.xs` uppercase) | schema: Product (page.tsx'te) |
| partner | **consent_logo_en=true ise logo (`space.s16` contain), değilse baş harf avatar** | firma adı `fontSize.base`/600 + sektör | verified rozet (checkmark SVG, `success`) |

## Yapısal Kurallar
- bg `surface`, `radius`, border `border` (`_derived-tokens.md`), hover: yukarı kayma `space.s1`/2 + `elevation.2`, geçiş `motionFast`
- padding `space.s6`; görsel üst padding'siz (bleed)
- Kart BAŞLIĞI link olmak zorunda (tüm kart tıklanabilir değil — link metni keyword'lü, a11y için)
- Grid: partner-grid grid-3 (desktop) / grid-4 (1920) / 1 kolon (360) — grid-4 varyantı 1920'de

## Responsive (4 BP)
360: 1 kolon, görsel tam genişlik · 768: 2 kolon (service/product), partner 2 · 1280: 3 kolon · 1920: 4 kolon (yalnızca partner-grid; service/product 3'te kalır, `container` sınırı)

## Erişilebilirlik
- `<article>`; link `aria-label` = başlık + ek bağlam; görseller alt zorunlu
- Konsantre sıra: başlık linki ilk focusable
- partner verified rozet: `aria-label` metni dahil (sadece ikon değil); `success` rengi tek başına anlam taşımaz (checkmark SVG + metin)
- Kontrast: `ink` / `muted` üstü `surface` AA; hover hareketi `prefers-reduced-motion`'da kapalı

## Notlar
- consentLogo=false iken logo URL'si hiç render edilmez (display:none değil — DOM'a girmesin, KVKK)
