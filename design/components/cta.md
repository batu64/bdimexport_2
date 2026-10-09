# cta — Komponent Brief
**Kaynak:** design-tokens.md v1.0 (UX Karar 3) · CONTENT_STYLE §5 (metin kuralı) · **Kod:** fe-agent (Qwen 3.8)

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
| primary | `highlight` dolgu + `primary` metin, radius 8, px 24 py 12, weight 600 — **sayfa başına 1** |
| secondary | kontur 1.5px `primary` (açık bg) / `bg` (koyu bg), şeffaf dolgu, hover: dolgu %8 |
| inline | text link `accent` + "→", alt çizgi hover — içerik içinde |

Responsive: 360 tam genişlik; 768+ auto genişlik. Basınç alanı min 44px.

## Erişilebilirlik
- `<Link>` semantik; hedef form sayfası; dış rota yok
- Kontrast AA (highlight+primary çifti tokens'ta doğrulanmış)
- Tekrarlı CTA'lar sayfada farklı aria-label alabilir (bağlam: "…- olive oil sayfasında")

## Notlar
- Primary CTA'nın sayfada konumu: hero (ilk ekran) + içerik sonu — ikisinden fazla değil
- /de: CTA metni Sie formunda; informal hitap red (I18N_RULES §7)
