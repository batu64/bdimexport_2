# Hero Copy — 4 Dil (Step 0.5 nihai, TEK batch çıktısı)
**Sürüm:** v2.1 · 11.10.2026 · Opus 5.5 · **Önceki:** v1.0 (`bbb8578`) → bu sürümle revize edildi
**Kaynak kurallar:** CONTENT_STYLE §1 (somut > soyut, riski isimlendir, kanıt zinciri, ≤ 20 kelime cümle, dürüstlük sınırı) · I18N_RULES §2 ton + §3 sözlük · cta.md metin şablonları · SEO_PLAYBOOK §3/§9
**Kullanım:** dictionary dosyalarına (FAZ_1/2/5 fe) — bu dosya hero metninin tek doğruluk kaynağı. Komponent: `design/components/hero.md` (variant `home`).
**Durum:** tr / en = **nihai** · de / zh = **taslak** → final dil pass'i FAZ 5 (5.4 de, 5.3/5.7 zh)

---

## TR — ana site (Türk KOBİ / üretici; "siz")
- **H1:** Çin'den İthalat ve Global İhracat: Tedarikten Gümrüğe Tek Ekip
- **Alt:** Yanlış tedarikçi, kalite sürprizi ve gümrük gecikmesi riskini fabrika denetimi ve adım adım takiple azaltıyoruz. İhracata açılmak isteyen üreticiler için ücretsiz hızlandırma programı sunuyoruz.
- **CTA primary:** Ücretsiz İhracat Hızlandırma Başvurusu *(cta.md `application` şablonu)*
- **CTA secondary:** Ücretsiz Teklif Alın — 24 saatte yanıt *(cta.md `quotation`; ithalat formuna)*
- **Güven bandı etiketi:** Onaylı Türk İş Ortağı
- **Güven bandı boş durum:** İlk Onaylı Türk İş Ortaklarımız yakında burada.

## EN — global hub (global alıcı; doğrudan, SLA'lı)
- **H1:** Source from Verified Turkish Manufacturers
- **Alt:** We handle sourcing, factory inspection, private label and logistics end-to-end, so you know who produces your order before it ships. Free quotation within 24 hours.
- **CTA primary:** Get Free Quotation in 24h
- **CTA secondary:** Explore Our Services
- **Güven bandı etiketi:** Verified Turkish Partner
- **Güven bandı boş durum:** Our first Verified Turkish Partners are coming soon.

## DE — DACH (formal Sie, kanıt odaklı) · TASLAK
- **H1:** Verifizierte türkische Hersteller für Ihre Beschaffung
- **Alt:** Wir übernehmen Beschaffung, Werksprüfung und Logistik. Jede Werksprüfung dokumentieren wir mit einem Prüfbericht. Ihr kostenloses Angebot erhalten Sie innerhalb von 24 Stunden.
- **CTA primary:** Kostenloses Angebot in 24 h anfordern ⚠️ *(bkz. Açık Konu 1)*
- **CTA secondary:** Unsere Leistungen ansehen
- **Güven bandı etiketi:** Verifizierter türkischer Partner
- **Güven bandı boş durum:** Die ersten verifizierten türkischen Partner folgen in Kürze.

## ZH — Çinli firmalar → Türkiye pazarı (kurum sesi, WeChat) · TASLAK
- **H1:** 进军土耳其市场的本地合作伙伴
- **Alt:** 我们的土耳其本地团队为中国企业提供本地销售、市场推广与清关物流支持，全程可通过微信沟通。24小时内获取免费报价。
- **CTA primary:** 24小时内获取免费报价
- **CTA secondary:** 通过微信联系我们
- **Güven bandı etiketi:** 认证的土耳其合作伙伴
- **Güven bandı boş durum:** 首批认证的土耳其合作伙伴即将上线。

---

## v1.0 → v2.1 değişiklik gerekçeleri (her biri ≤ 10 satır)

**G1 — TR H1.** "Tek Danışmanlık Noktası" soyuttu (CONTENT_STYLE §1.1). Yeni H1 hizmet kapsamını somut uçlarıyla söyler (tedarik → gümrük) ve iki yönü (ithalat + ihracat) korur. Alt metin kitlenin üç korkusunu adlandırır (İlke 2), çözümü fabrika denetimine bağlar.

**G2 — TR secondary CTA.** "İthalat Danışmanlığı" fiil ve SLA içermiyordu. cta.md `quotation` şablonuyla değiştirildi: tutarlı, 24h SLA'lı.

**G3 — EN H1.** Slogan kalıbı ("…, Verified. …, Served.") yerine alıcının arama niyetine yakın, keyword taşıyan fayda cümlesi ("Turkish manufacturers"). Alt metin riski (kimin ürettiğini bilmemek) adlandırır.

**G4 — DE CTA'ya SLA eklendi.** v1.0 "Kostenloses Angebot anfordern" SLA taşımıyordu (CONTENT_STYLE §5). H1 terimi sözlükle hizalandı ("Verifiziert", "Beschaffung"); alt metin kanıt olarak Prüfbericht'i öne alır (I18N §5 de).

**G5 — ZH hedef kitle düzeltmesi (kritik).** v1.0 zh metni alıcı hizmetlerini (采购、验厂) anlatıyordu. mimari.md §1'e göre /zh kitlesi **Türkiye'de satış yapmak isteyen Çinli firmalar**dır. Metin pazara giriş hizmetlerine çevrildi; hizmetler 3 öğe olarak gruplandı (4'lü gruplama yasağı); WeChat birincil kanal (I18N §2).

**G6 — Güven bandı mikro metni eklendi.** hero.md "Güven Bandı" bölümü locale metnine referans veriyordu ama metin tanımlı değildi. Etiketler I18N §3.2 sözlüğünden birebir; boş durum 4 dilde.

**G7 — Uydurma rakam yok.** zh "sayısal güven" ve de "kanıt" ister, fakat doğrulanmış şirket rakamı (yıl, proje sayısı, partner sayısı) henüz yok. Dürüstlük sınırı (CONTENT_STYLE İlke 5) gereği eklenmedi → Açık Konu 2.

---

## Açık konular (insan / orchestrator)
1. **⚠️ DE teklif CTA terim çakışması:** I18N_RULES §3.2 sözlüğü "Kostenlose Angebotseinholung in 24h", cta.md ise "Kostenloses Angebot in 24h" diyor; ikisi de fiil içermiyor ve "Angebotseinholung" alıcı ağzında doğal değil. Bu dosya "Kostenloses Angebot in 24 h anfordern" kullanır. Sözlük güncellemesi **orchestrator + insan onaylı PR** gerektirir (I18N_RULES başlığı); FAZ 5.4'ten önce karara bağlanmalı, aksi halde qa terminoloji testi DE hero'yu reddeder.
2. **👤 Sayısal güven verisi:** zh/de hero'ya eklenebilecek gerçek rakamlar (kuruluş yılı, tamamlanan proje, onaylı partner sayısı) senden gelir. Gelene kadar hero rakamsız kalır.
3. **👤 Başvuru SLA'sı:** TR primary CTA (`application`) şablonu SLA içermiyor. Başvuru değerlendirme süresi (ör. "X iş günü") belirlenirse CTA altına mikro metin olarak eklenir; süre uydurulmaz.

## Değişmez kurallar
- Bu metinler FAZ 1/2'de değiştirilmez (A/B testi FAZ 8'de, orchestrator kararıyla); de/zh yalnızca FAZ 5 dil pass'inde revize edilir.
- de: Sie tutarlı (du yok) · zh: 4'lü gruplama yok · her aksiyon CTA'sı "Fiil + SLA" (navigasyon amaçlı secondary hariç).
- Tüm metin dictionary'den; komponent içine literal gömülmez (hero.md).
