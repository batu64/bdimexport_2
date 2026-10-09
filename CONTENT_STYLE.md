# CONTENT_STYLE.md — Marka Sesi ve Sayfa Şablonları
**Sürüm:** 1.0 | **Tarih:** 08.10.2026 | **Proje:** bdimexport.com
**Amaç:** Tüm içerik üreten agent'ların (tr-import, tr-export, en-expert, en-l10n, zh, de, seo-geo) metin standardı. Proje.md §3.2 şablonlarını + SEO_PLAYBOOK §5 H1 kalıplarını bölüm bölüm açar; I18N_RULES.md §5 ton özetlerinin tam halidir.

> **Çelişki hiyerarşisi:** ORCHESTRATOR.md §11 > SEO_PLAYBOOK.md (SEO alanları) > bu dosya (metin yapısı/ton) > agent dosyaları.
> **Bölünme:** SEO teknik kuralları (meta, schema, hreflang) → SEO_PLAYBOOK.md. Bu dosya: **ne söyleyeceğiz, hangi sırada, hangi tonda.**

---

## 1. Marka Sesi — Evrensel 5 İlke (tüm diller)

1. **Somut > soyut:** "Hızlı hizmet" değil → "24 saat içinde ücretsiz teklif". Her iddiaya sayı, süre veya süreç adımı eşlik eder.
2. **Riski isimlendir, çöz:** Hedef kitle korkusunu zaten yaşıyor (ithalatta: dolandırılma/kalite; ihracatta: müşteri bulamama). Sayfa o korkuyu adlandırıp adım adım çözer — gösterişli vaat değil.
3. **Kanıt zinciri:** İddia → veri (kaynaklı) → sosyal kanıt (onaylı partner) → eylem çağrısı. Bu dörtlü her satış sayfasının omurgasıdır.
4. **Sade B2B cümlesi:** Ortalama cümle ≤ 20 kelime. Jargon yalnızca kitlenin kullandığı jargon (GTİP, FOB, OEM — tanımlı kullanılır).
5. **Dürüstlük sınırı:** Üstü çizili vaat yasak (I18N_RULES §3.3). Bilinmeyen sayı "değişken" olarak açıklanır — uydurulmaz.

### 1.1. Dil Bazlı Ton Kartları (I18N_RULES §2 ile eşleşir)

| Dil | Ses | Yapma |
| :--- | :--- | :--- |
| **tr** | KOBİ sahibine "siz" ile; süreç korkusunu isimlendir; adım listeleri; yerel örnek (Çerkezköy, Gaziantep, İzmir sanayisi gibi bölge vurguları görev dosyasından) | İngilizce şişirme ("çözüm ortağınız sizin için burada" kalıbı) |
| **en** | Doğrudan fayda + süreç şeffaflığı; SLA'lı cümleler ("in 24h", "within 5 days") | Aşırı satış ünlemleri; belirsiz "world-class" sıfatları |
| **de** | Formal Sie; her cümle kanıt taşıyan; sertifikasyon/rapor vurgusu; ölçülü, humor yok | du hitabı; süslü pazarlama sıfatları; kesin hukuk dili (Impressum dışında) |
| **zh** | Kurum sesi; Türkiye'de yerel ekip gücü; sayısal güven (proje sayısı, yıl); WeChat ile erişilebilirlik | Batı tarzı hype; kişisel hitap aşırılığı |
| **en-ru/fr/nl/es/ar** | EN sesini koru + bölge kanalı ve para birimi uyarlaması (SEO_PLAYBOOK §9, I18N_RULES §2) | Bölgeyi dışlayan kültürel referanslar |

---

## 2. Sayfa Şablonu 1 — Product SEO/GEO Page

**Nerede:** `/en/products/{slug}`, `/de/produkte/{slug}` · **H1:** SEO_PLAYBOOK §5 · **Üretici:** en-expert-agent (tr/de karşılıkları ilgili agent)

| Sıra | Blok | İçerik kuralı | Kelime hedefi |
| :--- | :--- | :--- | :--- |
| 1 | Hero | H1 + 1 cümlelik değer önerisi + CTA butonu ("Get Free Quotation in 24h") | 40–60 |
| 2 | Neden Türkiye? | 3–4 madde: lojistik avantaj, üretim kapasitesi, maliyet — her biri kaynaklı veriyle | 150–200 |
| 3 | Sektör istatistiği | TÜİK/TİM tablosu (son 3 yıl) + kaynak linkleri | 80–120 |
| 4 | Üretim süreci | 5 adımlı süreç (sourcing → numune → üretim → denetim → sevkiyat) + infografik | 150–200 |
| 5 | Partner sosyal kanıtı | 3–5 onaylı partner logosu + 3 cümlelik özetler (Proje.md flywheel 3. adım; yalnızca `consent_logo_en=true`) | 60–100 |
| 6 | Kalite/denetim | Inspection hizmeti bağlantısı; sertifikalar (CE, ISO) ne anlama gelir | 100–150 |
| 7 | SSS | ≥ 5 soru (FAQPage schema ile birebir): MOQ, numune, süreç süresi, ödeme, lojistik | 200–300 |
| 8 | CTA bloğu | Form bağlantısı + yanıt SLA'sı + kanal seçimi (bölgeye göre) | 30–50 |

**Toplam:** 1200+ kelime. **Yasak:** Partner olmayan üretici adı; kaynaksız ihracat rakamı; "en ucuz/en iyi" iddiası.

## 3. Sayfa Şablonu 2 — Industry Page

**Nerede:** `/en/industries/{slug}` · **H1:** `{Sector} Exports from Turkey: {Year} Data & Trends`

| Sıra | Blok | Kural |
| :--- | :--- | :--- |
| 1 | Giriş | Sektörün 1 paragraf tanımı + son yıl ihracat rakamı (kaynaklı) |
| 2 | Veri tablosu | Son 3 yıl: hacim, büyüme, başlıca pazarlar — TÜİK/TİM kaynaklı, ClaimReview'li |
| 3 | Trend analizi | 3 trend madde; her biri veri + müşteri etkisi |
| 4 | Türkiye'nin konumu | Küresel pazarda pay; rekabet karşılaştırması (kaynaklı) |
| 5 | Bdimexport yaklaşımı | Bu sektörde verilen hizmetler (2–3 cümle + hizmet sayfası iç linki) |
| 6 | Vaka çalışması | Anonimleştirilmiş gerçek proje ("Almanya'ya tekstil tedariki: 6 hafta") — uydurma = hard-red |
| 7 | SSS + CTA | ≥ 5 soru + teklif formu |

## 4. Sayfa Şablonu 3 — Trust Page (/de/vertrauen + EN karşılığı)

**Nerede:** `/de/vertrauen` · **Hedef:** DACH güven ihtiyacı (belirsizlik toleransı düşük)

| Sıra | Blok | Kural |
| :--- | :--- | :--- |
| 1 | Şeffaflık beyanı | Şirket kimliği, süreç, adres — Impressum linki |
| 2 | Güven rozetleri | Sertifikalar, üyelikler, denetim standartları (yalnızca gerçek olanlar) |
| 3 | Müşteri yorumları | İsim + şehir + sektör + gerçek alıntı; **uydurma yorum = hard-red** (SEO_PLAYBOOK §4) |
| 4 | Süreç şeffaflığı | Adım adım "bizimle çalışmak" akışı + her adımın çıktısı |
| 5 | Veri koruması | GDPR/KVKK durumu kısa + Datenschutz linki |
| 6 | SSS | ≥ 5: sözleşme, ödeme koruması, uyuşmazlık çözümü, veri saklama |

---

## 5. Yardımcı Metin Standartları

| Öğe | Kural |
| :--- | :--- |
| CTA metinleri | Fiil + SLA + bedel netliği: "Ücretsiz Teklif Alın — 24 saatte yanıt" / "Get Free Quotation in 24h". Tek şablon projesi boyunca değişmez (A/B testi sonrası orchestrator kararıyla) |
| Form etiketleri | Kısa + zorunluluk işaretli + KVKK linkli; yer tutucu metin örnek içerir |
| 404/hata metinleri | Her dilde çevrilmiş; ana sayfa + ilgili dil hub'ına link |
| Footer standart | Dil ailesi linkleri + yasal sayfalar (Impressum/Datenschutz de'de zorunlu) + iletişim kanalı (bölge birincil kanalı) |
| Alt text | Görsel içeriği + hedef keyword doğal geçişi ("Turkish olive oil export infographic — production to shipment") |
| İç link anchor | "Buraya tıklayın" yasak; hedef sayfanın keyword'ü anchor olur ("textile inspection service") |

---

## 6. Metin Red Sebepleri (qa-agent kontrol listesi bu dosyadan beslenir)

1. Kanıtsız üstünlük iddiası veya kaynaksız rakam
2. Uydurma partner/yorum/vaka çalışması
3. CTA metni §5 standart dışı
4. Şablon sırası bozuk (blok eksik: sosyal kanıt olmadan satış sayfası yayınlanamaz)
5. Kelime hedefinin %80 altı (blok bazında)
6. Ton kartına aykırı hitap (I18N_RULES §7 yasakları dahil)

## 7. Bu Dosyayı Kim Ne İçin Okur?

| Agent | Bölüm |
| :--- | :--- |
| tr-import, tr-export, en-expert, de-agent | §1, §2–§4 (kendi sayfaları), §5, §6 |
| seo-geo-agent | §1, §5, §6 (makaleler şablon dışı ama ses kuralları bağlar) |
| zh-agent, en-l10n-agent | §1, §5, §6 + I18N_RULES dil satırı |
| qa-agent | §6 testleri |
