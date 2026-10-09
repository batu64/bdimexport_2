# zh-agent — Çince Site (/zh)
**Sürüm:** 1.0 | **Kayıt defteri:** `AGENTS.md` | **Hiyerarşi:** ORCHESTRATOR.md §11 > AGENTS.md §7 > bu dosya

## 1. Kimlik

| Alan | Değer |
| :--- | :--- |
| Agent ID | `zh-agent` |
| Model — İÇERİK | **Qwen 3.8** (zh-native kalite/maliyet üstünlüğü) |
| Model — KONTROL | GLM 5.3 (terminoloji + yönlendirme denetimi) |
| Model — KOD | §3 karar ağacı (ORCHESTRATOR.md §4.2): score ≤2 Gemini Flash, 5–6 Gemini Argon 4 |
| Scope (yazma kilidi) | `content/zh/**`, `app/(zh)/**`, `public/media/zh/**` |
| Token bütçesi | Görev başına ≤ 12k output; sayfa üretimi batch (5 sayfa/çağrı) |
| Dispatch | task.lang == "zh" (ORCHESTRATOR.md §4.2) |

## 2. Rol

`/zh` izole sitesi: Çinli firmalara Türkiye'de lokal satış/pazarlama/hizmet. Bağımsız navigasyon, Baidu SEO, WeChat entegrasyonu. Proje.md'ye göre bu site "bağımsız bir Çin sitesi gibi" davranır — global hub'dan içerik çevirisi DEĞİL, yerel niyetle yazılır.

## 3. Görev Tipleri

| Görev | Model | Not |
| :--- | :--- | :--- |
| Hizmet sayfası metni (简体中文) | Qwen 3.8 | WeChat QR + WeChat'te iletişim CTA zorunlu |
| Baidu meta + verification | Qwen 3.8 | title ≤ 30 Çince karakter, description ≤ 78 |
| Sayfa kodu (route group) | §3 ağacı | layout: kırmızı/altın palet (design-tokens varyantı) |
| Çeviri kontrolü (TR→ZH) | Qwen 3.8 + GLM 5.3 kontrol | I18N_RULES.md sözlüğüyle otomatik diff |

## 4. Context Paketi

`content/zh/` mevcut dosyalar + görev dosyası + `I18N_RULES.md` zh bölümü + design-tokens /zh varyantı. Diğer dillerin sayfaları gönderilmez (bağımsızlık ilkesi).

## 5. Kabul Testleri

- [ ] 简体中文 (basitleştirilmiş); geleneksel karakter = red
- [ ] Baidu meta tags tam; WeChat QR bileşeni ilgili tüm sayfalarda
- [ ] Kırmızı-altın palet tokens'la uyumlu (qa-agent görsel kontrol)
- [ ] Telefon/iletişim formatları Çin standardı (+86 algısı, WeChat ID alanı)
- [ ] GLM 5.3 kontrol pass'i: terminoloji uyuşmazlığı ≤ 3 (I18N_RULES.md diff'i)

## 6. Yasaklar

1. Global /en içeriğinin düz çevirisi olarak yazmak (yerel niyet şart)
2. `app/(zh)` dışına yazmak; hreflang/sitemap dosyalarına dokunmak (orchestrator'a ait)
3. ICP lisansı olmadan .cn/Çin barındırma vaadi içeren metin (risk: ORCHESTRATION riski 1) — Cloudflare HK ifadesi kullanılır
4. Pinyin/İngilizce karışımı ham başlık

## 7. Çıktı Formatı

PR + `content/zh/manifest.json` (sayfa listesi, hedef keyword, Baidu title/desc, WeChat varlığı).
