# I18N_RULES.md — Çeviri/Yerelleştirme Kuralları, Sözlük, Ton ve RTL
**Sürüm:** 1.0 | **Tarih:** 08.10.2026 | **Proje:** bdimexport.com
**Amaç:** Tüm agent'ların çeviri/yerelleştirme işlerindeki TEK STANDARDI. qa-agent'ın terminoloji diff testi bu dosyadaki sözlüğü temel alır (agents/qa-agent.md §3). Proje.md §2.1 segment tanımları + mimari.md §9 ile birebir uyumlu.

> **Çelişki hiyerarşisi:** ORCHESTRATOR.md §11 > bu dosya (dil konularında) > agent dosyaları.
> **Güncelleme:** Sözlük maddeleri yalnızca orchestrator (insan onaylı PR ile) ekler/günceller — tutarlılık için.

---

## 1. Evrensel Kurallar (Tüm Diller)

1. **Çeviri değil, yerelleştirme:** Düz çeviri red edilir. Hedef kitlenin ticaret kültürüne göre niyet, kanal ve örnekler uyarlanır (Proje.md: /zh "bağımsız Çin sitesi gibi", /de "%100 yerelleştirilmiş klon").
2. **Terminoloji tutarlılığı:** Aynı kavram her sayfada AYNI terimle yazılır (§3 sözlük). Aynı dokümanda 2 farklı terim = qa-agent red.
3. **Marka adı çevrilmez:** "Bdimexport" her dilde aynı; domain gibi URL parçaları çevrilmez.
4. **Sayı/birim:** On binlik ayırıcı locale'e göre (1.234.567 TR/DE, 1,234,567 EN, 1234567 zh çoğu bağlamda noktasız). Para birimi §2 matrisi.
5. **Tarih formatı:** TR 08.10.2026 · EN 8 Oct 2026 · DE 08.10.2026 · RU 08.10.2026 · AR uygun Arapça format · ZH 2026年10月8日.
6. **Yer tutucu metin ve alt text:** Çevrilir; "Lorem/örnek" kalıntısı = red.
7. **Kontrast dili:** Formlar ve hukuki metinler o dilin resmi yazı dilinde; makine-çevirisi tınısı ("Google Translate kalitesi") = red.
8. **Rıza metinleri (KVKK/GDPR):** Yalnızca insan onaylı ana metinden çevrilir; agent kendi yorumunu ekleyemez (tr-export-agent §6.1 ile paralel).

---

## 2. Locale Matrisi (Proje.md §2.1 segment tablosuyla eşleşir)

| Locale | Hedef kitle | Ton | Birincil kanal CTA | Para birimi | Format notu |
| :--- | :--- | :--- | :--- | :--- | :--- |
| `tr` | Türk KOBİ/üretici | Samimi-profesyonel; "siz" | WhatsApp + form | TRY (ithalat maliyet örn. USD/EUR gösterilebilir) | Ayraç nokta: 1.234.567 |
| `zh-CN` | Çinli üretici/tedarikçi | Saygılı, kurumsal; WeChat merkezli | **WeChat QR** | USD + CNY referansı | title ≤ 30 karakter (SEO_PLAYBOOK §9) |
| `en` | Global alıcı | Doğrudan, fayda-odaklı B2B | Form ("Get Free Quotation in 24h") | USD | — |
| `en-RU` | Rus alıcı | Profesyonel, güven vurgulu | **Telegram** | USD + RUB referansı | Rusça telefon +7 |
| `en-FR` | Fransız alıcı | Formal "vous" | Email + WhatsApp | EUR | +33 formatı |
| `en-NL` | Hollandalı alıcı | Doğrudan, öz (ticaret kültürü) | Email | EUR | +31 formatı |
| `en-ES` | İspanyolca konuşan alıcı | Neutral İspanyolca (LatAm'ı dışlamayan) | WhatsApp | EUR (+LATAM notu) | +34 / bölge notu |
| `en-AR` | MENA alıcı | Saygılı, ilişki-odaklı | **WhatsApp Business** | USD + AED/SAR bağlamı | **RTL zorunlu (§4)** |
| `de` | DACH alıcı | **Formal Sie**, kesin, kanıt-odaklı | Email + WhatsApp | EUR (CH sayfasında CHF) | de-CH'de ß YASAK → ss |

---

## 3. Terminoloji Sözlüğü (qa-agent diff testinin kaynağı)

**Kural:** Her satırdaki terim, o dildeki TÜM sayfalarda birebir kullanılır. Uyuşmazlık > 3 terim = görev red (ORCHESTRATOR.md §6).

### 3.1. Hizmet kavramları

| TR | EN | ZH | DE | RU |
| :--- | :--- | :--- | :--- | :--- |
| Tedarik | Sourcing | 采购 | Beschaffung / Sourcing | Подбор поставщиков |
| Fabrika denetimi | Factory Inspection | 验厂 | Werksprüfung | Аудит завода |
| Özel üretim | Private Label / Manufacturing | 代工生产 (OEM) | Lohnfertigung / Private Label | Контрактное производство |
| Lojistik | Logistics | 物流 | Logistik | Логистика |
| Gümrük | Customs | 清关 | Zollabwicklung | Таможенное оформление |
| İthalat danışmanlığı | Import Consulting | 进口咨询 | Importberatung | Консалтинг по импорту |
| İhracat desteği | Export Support | 出口支持 | Exportförderung | Поддержка экспорта |

### 3.2. Marka/durum ifadeleri

| Kavram | TR | EN | ZH | DE |
| :--- | :--- | :--- | :--- | :--- |
| Onaylı Türk Partner | Onaylı Türk İş Ortağı | Verified Turkish Partner | 认证的土耳其合作伙伴 | Verifizierter türkischer Partner |
| Ücretsiz program | Ücretsiz İhracat Hızlandırma | Free Export Acceleration | 免费出口加速计划 | Kostenlose Exportbeschleunigung |
| Teklif CTA | Ücretsiz Teklif Alın | Get Free Quotation in 24h | 24小时内获取免费报价 | Kostenlose Angebotseinholung in 24h |
| Denetim raporu | Denetim Raporu | Inspection Report | 验厂报告 | Prüfbericht |

*(Not: Sözlük Faz 1–5 ilerledikçe satır satır büyür; her ekleme orchestrator PR'ı + insan onayı ile. Yeni terim çeviri görevinde sözlükte yoksa agent önerir, sözlüğe işlenir, sonraki görevlerde bağlayıcı olur.)*

### 3.3. Yasaklı/tercihli kalıplar (tüm diller)

| Yasak | Tercih | Neden |
| :--- | :--- | :--- |
| "en iyi / dünyada tek / %100 garanti" | "doğrulanmış / referanslı / X denetiminden geçti" | Reklam yasası (DE: UWG) + GEO güvenilirliği |
| "uygun fiyat" (nondescript) | "rekabetçi fabrika fiyatı" + kanal | Gevşek iddia dönüştürmez |
| Machine-tiny kalıpları ("İhtiyacınız var mı? Biz varız!") | Sade B2B cümle | Marka sesi |

---

## 4. RTL Kuralları (/en/ar — "en-ab" segmenti, mimari.md notu)

1. `<html lang="ar" dir="rtl">` — layout mirror zorunlu: sol-menü sağa, ikon yönleri (oklar) aynalanır
2. Tailwind: mantıksal özellikler (`ms-*`, `me-*`, `start/end`) — `ml/mr/pl/pr` kalıntısı = red
3. Sayı/telefon/veri kod blokları LTR gömülü kalır (`<bdi>` veya `dir="ltr"` span)
4. Logo/kompozisyon aynalanmaz; sadece hizalama aynalanır
5. qa-agent görsel testi: sağa hizalı başlık + soldan akmayan metin kontrolü (ekran görüntüsü)

## 5. Ton ve Marka Sesi (dil bazında 3 cümlelik özet — CONTENT_STYLE.md'yi tamamlar)

- **tr:** KOBİ sahibine konuşur; süreç korkularını (gümrük, dolandırılma) isimlendirip çözer; somut adım listeleri.
- **zh:** Hizmet veren kurum tonu; Türkiye'de "yerel ayak" vurgusu (lokal ekip, WeChat ile 7/24); abartısız sayısal güven.
- **en:** Net fayda cümlesi + süreç şeffaflığı; "24h quotation" gibi somut SLA'lar; jargon minimal.
- **de:** Formal Sie; kanıt ve sertifikasyon odaklı; her iddianın arkasında kaynak/rapor referansı; humor yok.
- **ru/fr/nl/es (en varyantları):** EN tonunu korur + §2 satırındaki kültürel ayarı uygular.

## 6. qa-agent Terminoloji Diff Testi (uygulama)

1. Görev çıktısındaki metin §3 sözlük satırlarıyla karşılaştırılır (sözlük JSON olarak `i18n/glossary.json`'a da yansıtılır — script okur)
2. Her kavram için kullanılan terim kaydedilir; sözlük dışı eşanlamlı = uyuşmazlık sayılır
3. Uyuşmazlık ≤ 3 → pass (uyarı listesi) · > 3 → fail, kaynak agent'a retry
4. Yeni kavram önerisi: agent manifest'e "glossary_proposal" yazar; orchestrator toplu olarak insan onayına sunar

## 7. Dil Bazlı Özel Yasaklar

| Dil | Yasak |
| :--- | :--- |
| de | du/dich/euch hitabı; ß (de-CH); İngilizce anglicism şişirmesi ("Meeting abhalten" → "Besprechung") |
| zh | Geleneksel karakter (只 简); pinyin-İngilizce karışık başlık; ICP vaadi içeren cümle |
| ar | RTL'siz layout; sol-hizalı başlık; adaş ülke karışıklığı (AED/SAR bağlam karışımı) |
| ru | Latin harfli rusça (translit); Telegram yerine email'i birincil göstermek |
| es | LatAm'ı dışlayan yalnız-İspanya ifadeleri ("vosotros" yerine neutral "ustedes") |
| fr | "tu" hitabı; İngilizce kalıp cümleler |
| tr | Türkçe karakter sorunlu transliterasyon; gümrük verisinde kaynaksız rakam (tr-import-agent §6.1) |
