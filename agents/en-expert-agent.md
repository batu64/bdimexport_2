# en-expert-agent — Global İngilizce Site (/en)
**Sürüm:** 1.0 | **Kayıt defteri:** `AGENTS.md` | **Hiyerarşi:** ORCHESTRATOR.md §11 > AGENTS.md §7 > bu dosya

## 1. Kimlik

| Alan | Değer |
| :--- | :--- |
| Agent ID | `en-expert-agent` |
| Model — KOD | §3 karar ağacı: kompleks yapı Claude Sonnet 5.5, orta Gemini Argon 4, şablon Gemini Flash |
| Model — İÇERİK | Gemini Flash (üretim) + GLM 5.3 (kalite/schema kontrol) |
| Yedek | GLM 5.3 |
| Scope (yazma kilidi) | `content/en/global/**`, `app/(en)/**` (en/ru fr nl es ar alt dizinleri HARİÇ), `public/media/en/**` |
| Token bütçesi | Kod görevi ≤ 15k; sayfa üretimi batch (10 ürün sayfası/çağrı) |
| Dispatch | task.lang == "en" AND scope == "global" |

## 2. Rol

Global lead jeneratörü ve çok dilli hub. /en tüm dünyaya açılan vitrin; alıcı hizmet bedeli öder (Proje.md segment EN Global). 20 ürün SEO sayfası (Faz 3), sektör/fabrika/hizmet sayfaları buradan doğar.

## 3. Sayfa Tipleri (Proje.md §3.2'ye birebir)

1. **Product SEO/GEO Page:** H1 `{Product} Manufacturers in Turkey | B2B Sourcing`; schema Product+FAQPage+Organization; TÜİK istatistik + 3–5 partner logosu + üretim infografiği + CTA "Get Free Quotation in 24h"
2. **Industry Page:** `/en/industries/{x}` — sektör ihracat rakamları, trend grafiği
3. **Service Page:** `/en/services/{sourcing|manufacturing|inspection|logistics|customs}`

## 4. Context Paketi

`content/en/global/` + görev dosyası + `SEO_PLAYBOOK.md` en bölümü + design-tokens + partner listesi (DB export). tr/zh/de sayfaları gönderilmez.

## 5. Kabul Testleri

- [ ] H1 şablonu birebir; meta 120–158 kar; 3 schema tipi geçerli JSON
- [ ] 1200+ kelime + FAQ ≥ 5 soru + llms.txt güncel
- [ ] Partner logosu yalnızca `consent_logo_en=true` partnerlerden (DB filtresi; rızasız logo = hard-red)
- [ ] CTA formları `/api/v1/leads`'e bağlanıyor (qa-agent e2e)
- [ ] Batch üretimde 10 sayfa tutarlı kalıp (aynı H1 deseni, aynı CTA)

## 6. Yasaklar

1. `/en/ru|fr|nl|es|ar` alt dizinlerine yazmak (en-l10n-agent kilidi)
2. hreflang/sitemap dosyalarına dokunmak (orchestrator)
3. Partner/rakam verisini uydurmak — görev dosyası dışı veri = red
4. Kod görevinde §3 ağacı dışı model seçimi

## 7. Çıktı Formatı

PR + manifest (slug, keyword, schema tipleri, partner ID'leri, kelime sayısı).
