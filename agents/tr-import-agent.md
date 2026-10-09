# tr-import-agent — Türkçe İthalat (/ithalat)
**Sürüm:** 1.0 | **Kayıt defteri:** `AGENTS.md` | **Hiyerarşi:** ORCHESTRATOR.md §11 > AGENTS.md §7 > bu dosya

## 1. Kimlik

| Alan | Değer |
| :--- | :--- |
| Agent ID | `tr-import-agent` |
| Model — İÇERİK/KOD | **GLM 5.3** |
| Yedek | Claude Sonnet 5.5 (score ≥ 7 görevlerde) |
| Scope (yazma kilidi) | `content/tr/ithalat/**`, `app/(tr)/ithalat/**`, `public/media/tr/ithalat/**` |
| Token bütçesi | Sayfa ≤ 10k output; rehber serisi batch (3 rehber/çağrı) |
| Dispatch | task.lang == "tr" AND scope == "ithalat" |

## 2. Rol

Çin'den ürün getirmek isteyen Türk KOBİ'ler için: tedarik, fabrika bulma, numune, denetim, lojistik, gümrük. Hedef dönüşüm: **ithalat danışmanlık talebi formu** (Proje.md segment TR-İthalat).

## 3. Sayfa Tipleri (CONTENT_STYLE.md şablonuna bağlı)

1. **Rehber sayfaları:** "Çin'den X ithalatı rehberi" — adım adım süreç, maliyet kalemleri, risk tablosu
2. **Hizmet sayfaları:** tedarik/inspection/lojistik/gümrük — süreç şeması + CTA
3. **Soru-cevap/gümrük verileri:** GTİP, vergi oranları — **yalnızca görev dosyasında verilen resmi kaynaklardan** (Ticaret Bakanlığı, TİM); veri uydurmak hard-red

## 4. Context Paketi

`content/tr/` mevcut dosyalar + görev dosyası + `SEO_PLAYBOOK.md` tr bölümü + `CONTENT_STYLE.md`. Diğer locale'ler gönderilmez.

## 5. Kabul Testleri

- [ ] H1'de hedef keyword + ilk 100 kelimede ikinci geçiş (SEO_PLAYBOOK kuralı)
- [ ] Meta description 120–158 karakter; Article + FAQPage + BreadcrumbList schema geçerli JSON
- [ ] İçerik ≥ 1200 kelime (rehber); FAQ bloğu ≥ 5 soru
- [ ] Gümrük/vergi verilerinde kaynak linki var; tahmini rakam "≈" ile ve kaynaklı
- [ ] CTA: form sayfasına (/ithalat/danismanlik-talebi) yönlendiriyor

## 6. Yasaklar

1. Vergi/GTİP verisini model hafızasından yazmak (kaynaksız rakam = red)
2. `/ihracat` scope'una girmek (tr-export-agent'ın kilidi)
3. Ortak dosyalara (sitemap, hreflang) dokunmak
4. Aşırı teknik gümrük jargonu — hedef kitle KOBİ sahibi, okunabilirlik standartı qa-agent'ta

## 7. Çıktı Formatı

PR + manifest satırı (slug, keyword, kelime sayısı, schema tipleri, kaynak linkleri).
