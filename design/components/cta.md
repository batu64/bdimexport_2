# cta — Komponent Brief
**Kaynak:** design-tokens.md v2.0 (Varyant A onaylı) · `_derived-tokens.md` (UX Karar 3) · CONTENT_STYLE §5 (metin kuralı) · **Kod:** fe-agent (Sonnet 5.5)

## Props
```ts
interface CtaProps {
  variant: "primary" | "secondary" | "inline";
  locale: "tr" | "en" | "de" | "zh";
  action: "quotation" | "application" | "contact";   // metin dictionary'den sabit şablon
  href?: string;                                       // default: form sayfası
}
```

## METİN KURALI [ŞART — CONTENT_STYLE §5, değişmez]
Fiil + SLA + bedel netliği. Şablonlar (dictionary, locale bazlı):
- quotation: tr "Ücretsiz Teklif Alın — 24 saatte yanıt" · en "Get Free Quotation in 24h" · de "Kostenloses Angebot in 24h" · zh "24小时内获取免费报价"
- application: tr "Ücretsiz İhracat Hızlandırma Başvurusu" · en "Apply for Free Export Acceleration"
- A/B varyasyonu YALNIZCA orchestrator kararıyla (CONTENT_STYLE §5) — agent değiştiremez

## Stiller
| Variant | Görünüm |
| :--- | :--- |
| primary | `highlight` dolgu + `primary` metin, `radius`, px `space.s6` py `space.s3`, weight 600 — **sayfa başına 1** |
| secondary | kontur `space.s1`/2 `primary` (açık bg) / `bg` (koyu bg), şeffaf dolgu, hover: dolgu %8 |
| inline | text link `accent` + "→", alt çizgi hover — içerik içinde |

## Responsive (4 BP)
| BP | Davranış |
| :--- | :--- |
| 360 | tam genişlik, stacked (primary üstte); yükseklik ≥ `touchMin` |
| 768 | auto genişlik; primary + secondary yan yana, aralık `space.s4` |
| 1280 | auto genişlik; hero ve içerik sonu konumlarında aynı boyut; inline varyant satır içi |
| 1920 | 1280 ile aynı (büyütme yok); `container` sınırı içinde |

Basınç alanı min `touchMin`.

## Erişilebilirlik
- `<Link>` semantik; hedef form sayfası; dış rota yok
- Kontrast AA: `primary` metin üstü `highlight` 6.4:1; `accent` inline link üstü `bg` 4.7:1 (design-tokens §1.4)
- Odak görünür (`accent` outline); `prefers-reduced-motion`'da hover geçişi yok
- Gezinti yapan öğe `<a>`/`<Link>`; `role="button"` kullanılmaz
- Tekrarlı CTA'lar sayfada farklı aria-label alabilir (bağlam: "…- olive oil sayfasında")

## Notlar
- Primary CTA'nın sayfada konumu: hero (ilk ekran) + içerik sonu — ikisinden fazla değil
- /de: CTA metni Sie formunda; informal hitap red (I18N_RULES §7)
