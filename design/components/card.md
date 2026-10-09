# card — Komponent Brief
**Kaynak:** design-tokens.md v1.0 · **Kod:** fe-agent (Qwen 3.8)

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
| service | üstte 16:9 next/image | başlık 18/600 + 2 satır desc (clamp) | alt: keyword'lü iç link "→" |
| product | üstte 4:3 | başlık 16/600 + ürün sektör etiketi (accent, 12px uppercase) | schema: Product (page.tsx'te) |
| partner | **consent_logo_en=true ise logo (64px contain), değilse baş harf avatar** | firma adı 16/600 + sektör | verified rozet (checkmark SVG, `success`) |

## Yapısal Kurallar
- bg `bg` (surface beyaz), radius 12, border 1px `border` (tokens'a eklenecek: `border: #E5E7EB`), hover: translateY(-2px) + shadow-md, transition 150ms
- padding 24px; görsel üst padding'siz (bleed)
- Kart BAŞLIĞI link olmak zorunda (tüm kart tıklanabilir değil — link metni keyword'lü, a11y için)
- Grid: partner-grid grid-3 (desktop) / grid-4 (1920) / 1 kolon (360) — grid-4 varyantı 1920'de

## Responsive (4 BP)
360: 1 kolon · 768: 2 kolon (service/product), partner 2 · 1280: 3 kolon · 1920: 4 kolon (partner-grid)

## Erişilebilirlik
- `<article>`; link `aria-label` = başlık + ek bağlam; görseller alt zorunlu
- Konsantre sıra: başlık linki ilk focusable
- partner verified rozet: `aria-label` metni dahil (sadece ikon değil)

## Notlar
- consentLogo=false iken logo URL'si hiç render edilmez (display:none değil — DOM'a girmesin, KVKK)
