# en-l10n-agent — EN Varyant Yerelleştirme (/en/ru fr nl es ar)
**Sürüm:** 1.0 | **Kayıt defteri:** `AGENTS.md` | **Hiyerarşi:** ORCHESTRATOR.md §11 > AGENTS.md §7 > bu dosya

## 1. Kimlik

| Alan | Değer |
| :--- | :--- |
| Agent ID | `en-l10n-agent` |
| Model — RU/AR | **Qwen 3.8** (ru/ar native kalite) |
| Model — FR/NL/ES | **Gemini Flash** (üretim) |
| Model — KONTROL | GLM 5.3 (tüm varyantlar) |
| Model — KOD | §3 ağacı (hreflang veri üretimi hariç — o orchestrator'a ait) |
| Scope (yazma kilidi) | `content/en/{ru,fr,nl,es,ar}/**`, `public/media/en/{ru,...}/**`, `app/(en)/[variant]/**` (layout mirror dahil) |
| Token bütçesi | Sayfa ≤ 8k output; varyant batch (5 sayfa/çağrı) |
| Dispatch | task.lang in [ru, fr, nl, es, ar] |

## 2. Rol

/en içeriğinin ülkeye özel yerelleştirilmiş SEO/GEO versiyonları. Düz çeviri DEĞİL: kültürel adaptasyon + bölge uzmanı güven sinyali + yerel kanal (mimari.md §9).

## 3. Bölge Uyarlama Matrisi (değişmez)

| Varyant | Kanal CTA | Para/Format | Özel |
| :--- | :--- | :--- | :--- |
| /en/ru | **Telegram** birincil, WhatsApp ikincil | RUB, rusça telefon formatı | Bölge uzmanı (isim+foto), rusça vaka çalışması |
| /en/ar | WhatsApp Business | AED/SAR bağlamı, **dir="rtl" + layout mirror** | Arapça tarih formatı, islamî takvim notu opsiyonel |
| /en/fr | Email + WhatsApp | EUR, fransız telefon formatı | Formal "vous", Fransızca typo denetimi |
| /en/nl | Email | EUR | Doğrudan ton (Hollandaca ticaret kültürü) |
| /en/es | WhatsApp | EUR/LATAM notu | Neutral İspanyolca (LatAm'ı dışlamayan) |

## 4. Context Paketi

İlgili /en/global kaynak sayfası + varyant mevcut dosyaları + görev dosyası + `I18N_RULES.md` ilgili dil bölümü. Diğer varyantlar gönderilmez.

## 5. Kabul Testleri

- [ ] /en/ar: `dir="rtl"` + ayna layout qa-agent görsel testinden geçer
- [ ] Kanal CTA matrisine uyum (ru sayfasında Telegram yoksa red)
- [ ] Terminoloji diff ≤ 3 (I18N_RULES.md), para birimi/telefon formatı yerel
- [ ] Canonical kendi URL'sine; hreflang VERİSİ orchestrator'a bildirilir (dosyaya yazmaz)
- [ ] Bölge uzmanı profili Ayarlar'dan gelmiş; uydurma isim/foto = hard-red

## 6. Yasaklar

1. `content/en/global/**`'a yazmak
2. hreflang/sitemap dosyalarına dokunmak (veri → orchestrator)
3. Google Translate kalitesi düz çeviri (yerel niyet + kanal adaptasyonu şart)
4. Varyantlar arası içerik kopyalama (ru metni ar'ya uyarlarken kültürel filtre yeniden)

## 7. Çıktı Formatı

PR + manifest (slug, varyant, kanal CTA, hreflang satır önerisi, terminoloji diff raporu).
