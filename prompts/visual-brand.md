# VISUAL BRAND — Görsel Üretim Sabit Prefix (image-agent)
**Sürüm:** 1.0 | **Tarih:** 08.10.2026 | **Proje:** bdimexport.com
**Kullanım:** Bu dosyanın §1 bloğu her görsel üretim çağrısının prompt'una **sabit ilk blok** olarak girilir (agents/image-agent.md §4; AGENTS.md §7 Kural 3 prompt-cache prefix sabitliği). Sonra göreve özel prompt gelir. Blok değişirse tüm görsellerin stili bozulur — değişiklik yalnızca orchestrator + insan onayıyla.

---

## 1. SABİT PREFIX BLOK (her çağrıya kopyalanır)

```
STYLE: Modern B2B trade-consultancy illustration. Clean corporate flat design with
subtle depth (soft shadows, 2.5D elements). Warm professional palette: deep navy
(#1A2B4A) as primary, teal (#0E7C7B) accent, warm amber (#E8A13D) highlight,
off-white (#FAF8F5) background. Generous negative space, uncluttered composition,
crisp vector-like edges, consistent soft studio lighting. Subject positioned
rule-of-thirds, room for text overlay in hero variants. NO photorealistic faces,
NO stock-photo look, NO text inside the image unless explicitly requested.
```

*(Tercih edilen İngilizce kalır — tüm görsel modeller İngilizce prompt'ta en tutarlı sonuç verir. Palet nihai kararı Faz 0'da design-tokens.md ile mutabakata bağlanır: AGENTS.md §8 açık konular.)*

## 2. Görsel Tipleri — Hazır Şablonlar (prefix sonrasına eklenir)

| Tip | Ek prompt şablonu | Boyut (master → crop) | Model |
| :--- | :--- | :--- | :--- |
| Hero görseli | "Hero illustration for {sayfa konusu}, trade/production scene, wide composition, subject right, left third empty for headline" | 1920×1080 → OG 1200×630 crop | FLUX taslak → ChatGPT Image final |
| OG image | "Social share card composition, bold central motif, minimal detail, high contrast at small sizes" | 1200×630 | FLUX taslak → ChatGPT Image final |
| İnfografik şeması | "Step-by-step process infographic layout, {N} numbered stages, flat icons, no text labels (labels added in HTML)" | 1080×1350 | ChatGPT Image |
| Ürün görseli | "Product presentation scene for {ürün}, industrial context, neutral backdrop, single focal product" | 800×800 | ChatGPT Image |
| Yazılı banner | "Banner with clean typography reading exactly: '{METİN}'" | gerekli boyut | **Ideogram** (metin içeren tek model) |
| İkon/şema | **AI görsel YASAK** → SVG (fe-agent / script) | — | — |

## 3. Dil/Pazar Varyasyon Notları

| Pazar | Ayar (prefix'e ek cümle) |
| :--- | :--- |
| /zh | "Red and gold festive accents acceptable for CTA-adjacent visuals; numerology-aware (avoid 4-heavy groupings)" — design-tokens zh varyantıyla uyumlu |
| /de | "Sober, evidence-oriented composition; no playful elements; trust-cue style (documents, checkmarks, precision)" |
| /en/ar | Hizalama aynalanmaz; kompozisyon text-overlay'siz simetrik tercih edilir (RTL metin HTML'de) |
| Genel | Gerçek kişi/logo/fabrika taklidi yasak (image-agent §6.3); illüstratif stil |

## 4. Kalite Kontrol (qa-agent + image-agent kendi testi)

1. Palet uyumu: üretilen görsel baskın renkleri §1 paletiyle (görsel karşılaştırma) örtüşmeli
2. OCR: istenen metin dışında okunabilir yazı varsa veya istenen metin hatalıysa red
3. Master → crop zinciri: media-manifest.json'da her türev master ID'sine bağlı olmalı
4. Dosya adı: `{hedef-keyword}-{tip}.webp` (SEO_PLAYBOOK §5 alt text kuralıyla eşleşir)
5. Kota: her başarılı final üretim ledger'a `{images: 1, est_usd: X}` yazar; FLUX taslak ve türevler kota sayılmaz
