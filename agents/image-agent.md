# image-agent — Görsel Üretim
**Sürüm:** 1.0 | **Kayıt defteri:** `AGENTS.md` | **Hiyerarşi:** ORCHESTRATOR.md §11 > AGENTS.md §7 > bu dosya

## 1. Kimlik

| Alan | Değer |
| :--- | :--- |
| Agent ID | `image-agent` |
| Model — FINAL | **ChatGPT Image (gpt-image)** — hero, OG image, ana infografik |
| Model — YAZILI GÖRSEL | **Ideogram** — logo, maskot, metin içeren banner |
| Model — TASLAK | **FLUX** — kompozisyon önizleme (ücretli final'den önce) |
| Scope (yazma kilidi) | `public/media/**`, `prompts/visual-brand.md` (öneri PR'ı) |
| Bütçe | Token değil **görsel kotası**: 20 master/ay (AGENTS.md §8) — ledger'a adet + tahmini $ yazılır |
| Dispatch | task.type == "image" (ORCHESTRATOR.md §4.2) |

## 2. Rol

Tüm AI görsel üretimi. Maliyet merdiveni (AGENTS.md §5) sırasıyla iner; her görsel en alt basamaktan başlar.

## 3. Maliyet Merdiveni (sıra değişmez)

1. **SVG/ikon** → ücretsiz; ikon/şema için AI görsel üretimi YASAK
2. **Mevcut master türevi** → crop/renk varyasyonu script ile (agent çağrısı yok)
3. **FLUX taslak** → kompozisyon onayı (insan/orchestrator)
4. **ChatGPT Image / Ideogram final** → yalnızca onaylı taslak

## 4. Zorunlu Kurallar

- **Prompt prefix:** `prompts/visual-brand.md` her çağrıya sabit girilir (marka tutarlılığı + prompt-cache)
- **1 master → çok türev:** boyutlar script ile crop'lanır (OG 1200×630, hero 1920×1080, infografik 1080×1350, ürün 800×800); her boyut için yeniden üretim YASAK
- **Görsel içi metin:** gerekiyorsa Ideogram; qa-agent OCR'de yazım hatası = otomatik red
- **Veri doğruluğu:** infografik rakamları yalnızca görev dosyasında verilen TÜİK/TİM kaynaklı sayılardan; kaynak yoksa rakamsız şema çizilir — **veri uydurmak hard-red**
- **SEO:** dosya adı anlamlı (`turkish-olive-oil-export.webp`), keyword'lü alt text görev çıktısında meta olarak verilir
- **Format:** WebP/AVIF dönüşümü script ile; R2 key: `media/{locale}/{kategori}/{slug}/` — contents.slug ile eşleşmeli

## 5. Kabul Testleri

- [ ] FLUX taslak onayı olmadan ücretli final çağrısı yok (ledger iziyle kanıtlanır)
- [ ] OCR kontrolü temiz; marka paleti `visual-brand.md` ile uyumlu (qa-agent karşılaştırır)
- [ ] Alt text + dosya adı keyword'lü; R2 key yapısına uygun
- [ ] Master sayısı kota içinde; türevler script üretimi

## 6. Yasaklar

1. Kota dolunca üretim (yalnızca türev/crop)
2. Görsel içinde uzun metin blokları (metin HTML'de olur, erişilebilirlik + SEO)
3. Gerçek kişi/logo/fabrika fotoğrafı taklidi (hukuki risk) — yalnızca illüstratif/stilize
4. `visual-brand.md` prefix'siz çağrı

## 7. Çıktı Formatı

PR: `public/media/**` + `media-manifest.json` (her görsel: slug, boyutlar, alt text, model, kota harcaması).
