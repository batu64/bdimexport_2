# partner-grid — Komponent Brief
**Kaynak:** design-tokens.md v1.0 · card.md (partner variant) · **Kod:** fe-agent (Qwen 3.8) · FAZ_1 Step 1.7 — 3 kez yazma yasağı: tr/en/de AYNI bileşeni kullanır

## Props
```ts
interface PartnerGridProps {
  locale: "tr" | "en" | "de" | "zh";
  limit?: number;                    // default 12; ürün sayfasında 3–5
  sectorFilter?: string;
}
```

## Veri (api-agent sağlar — fe-agent sorgu yazmaz)
- `GET /api/v1/partners?approved=true&sector=X` (ISR revalidate 3600)
- Dönen: `{ id, name, logoUrl|null, sector, verified }` — **consent_logo_en=false ise logoUrl field'ı API'de hiç dönmez** (api-agent §3.5; fe-agent karar vermez)
- Boş durum: locale bazlı "İlk onaylı partnerler yakında" metni — grid gizlenmez, bilgi metni gösterilir (FAZ 1'de durum budur)

## Düzen
grid-3 / grid-4 (1920) — card.md partner variant'ı kullanır. Ürün sayfası kullanımında: yatay şerit (scrollable, 360) / flex (1280+), limit 3–5, başlık: locale bazlı "Verified Turkish Partners" şeridi (hero güven bandıyla aynı metin kaynağı)

## Responsive (4 BP)
360: 1 kolon / yatay scroll şerit modu · 768: 2 · 1280: 3 · 1920: 4

## Erişilebilirlik
- `<section aria-labelledby>`; liste `<ul>`; her kart card.md a11y kurallarını miras alır
- Yükleme durumu: skeleton (aria-busy); hata: sessiz boşluk değil locale bazlı hata metni

## Notlar
- Bu bileşen 3 yerde kullanılacak (tr ana, /en/suppliers, /de/lieferanten) — locale text'leri dictionary'den, bileşen tek
- Logo yüklenmezse: baş harf avatar (card.md) — kırık görsel gösterilmez
