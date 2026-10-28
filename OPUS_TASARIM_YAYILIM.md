# OPUS 5.5 — TASARIM YAYILIMI (Tüm Sayfalar + Tüm Diller)
**Proje:** bdimexport.com | **Sürüm:** 1.0 | **Tarih:** 29.10.2026 | **Yürütücü:** **Opus 5.5**
**Amaç:** **Onaylanan TR anasayfa tasarımını** (navy+altın, Varyant A, hero+komponent+stat+CTA sistemi) **tüm iç sayfalara ve 4 dil ailesine** (TR, EN + {ru,fr,nl,es,ar}, DE, ZH) yaymak. Sonra animasyon cilası + Remotion + görsel QA.

> **BAĞLAM:** TR anasayfa (D3) **insan onaylı referans**. D1 (globals.css + tokens + Inter) zaten **tüm dil layout'larına** bağlı → diğer diller şu an "temel tema var ama tam tasarım yok" durumunda. Bu talimat o tam tasarımı her dile taşır. **Bu dosya `OPUS_TASARIM_TALIMATI.md`'nin devamıdır** — oradaki tüm kurallar (static-export, tokens tek kaynak, Lighthouse ≥90, a11y, motion ilkeleri, Remotion) aynen geçerli; burada **yayılım + i18n + locale palet** eklenir.

---

## 0. DEĞİŞMEZ KURALLAR (ana talimata ek)
1. **Yeniden KULLAN, yeniden YAZMA:** D2'de üretilen ortak komponentler (`Navbar, Footer, Button, Card, Section, Reveal, CountUp` + hero/stat/CTA kalıpları) **tüm dillerde aynen kullanılır.** Her dile ayrı komponent yazma — **i18n + locale-palet** ile farklılaştır.
2. **i18n ZORUNLU:** Navbar/Footer/CTA/buton/rozet gibi TÜM arayüz metinleri **next-intl sözlüklerinden** gelir (TR/EN/DE/ZH + ru/fr/nl/es/ar). **Hardcoded Türkçe metin YASAK** — şu an D2 komponentlerinde TR label varsa sözlüğe taşı. Sayfa içeriği zaten `content/<locale>`'de; UI kabuğu da locale'e uymalı.
3. **Locale palet varyantları (tokens üzerinden):** TR/EN baz navy+altın · **/zh kırmızı-altın** · **/de sakin-güven** (daha yüksek kontrast, altın vurgu ölçülü). Route group root layout'unda `data-theme="zh|de"` (veya token seti) ile; **yeni hex yazma, token varyantı kullan** (design-tokens.md zh/de varyantları).
4. **RTL (/en/ar):** tam mirror — `dir="rtl"`, mantıksal CSS (`*-inline`), animasyon yönleri ters, bdi sayılar. Mevcut variant RTL sistemini koru.
5. **Kanal CTA (bölgesel):** `ChannelCta` ile — **ru→Telegram · ar→WhatsApp · zh→WeChat · de→WhatsApp/E-posta · tr→WhatsApp · en→teklif formu.** Doğru kanal, doğru dil.
6. **İçerik BOZULMAZ:** `content/<locale>/**` metinleri, SEO, schema, meta, hreflang aynen; sadece stilli layout + prose tipografi ile sarmalanır.
7. **Her commit:** tek-scope; `pnpm build` + `pnpm lint` yeşil; tokens dışı hex=0; `git status`/`diff --cached` kontrol.

---

## 1. SAYFA ŞABLONLARI (her dilde aynı iskelet)
- **Homepage (TR ✅ / EN hub / DE / ZH):** Hero (locale hero-copy) + güven rozetleri + süreç/özellik kartları + **stat bandı (count-up)** + hizmet panelleri + partner bloğu + güçlü CTA bandı + Footer. TR'deki kalıbı birebir uygula, içerik locale'den.
- **Hizmet/Rehber/Ürün/Industry sayfası:** üst başlık bandı (breadcrumb + H1 + özet + CTA) → **prose tipografi** (md içerik: başlık/liste/tablo/FAQ/alıntı markalı) → yan/alt ilgili kartlar → CTA. İstatistik/süreç varsa stat/step komponenti.
- **Form sayfası:** stilli form (float-label, validasyon, Turnstile alanı, KVKK/consent), güven yan paneli.
- **Legal (kvkk / impressum / datenschutz):** sade, okunur prose + footer sabit linkler.
- **Varyant homepage ({ru,fr,nl,es,ar}):** EN hub kalıbı + bölgesel kanal CTA; ar RTL.

---

## 2. D4 — TR İÇ SAYFALAR
```
Scope: app/(tr)/**, lib/ui/** (gerekli ortak komponent eklemeleri)
- /ithalat/[slug] + /ihracat/[slug] + /ithalat/rehberler/[slug]: hizmet/rehber şablonu (üst band + prose + ilgili kartlar + CTA). md render tipografisi markalı.
- /ihracat/ucretsiz-destek-basvuru: stilli başvuru formu (float-label, Turnstile alanı, KVKK checkbox, güven paneli).
- /kvkk-riza + legal: sade prose.
- Navbar/Footer TR layout'ta zaten bağlı → tüm TR sayfalarında tutarlı.
Kabul: tüm /tr sayfaları stilli; prose okunur; form güzel; build+lint yeşil; hex=0.
Tek commit: "D4 fe: TR iç sayfalar (hizmet/rehber/form/legal) tasarım".
```

## 3. D5 — EN + VARYANTLAR
```
Scope: app/(en)/**, app/(en-{ru,fr,nl,es,ar})/**, content i18n sözlükleri, lib/ui/**
- i18n: Navbar/Footer/CTA/buton metinleri EN + ru/fr/nl/es/ar sözlüklerine (hardcoded TR temizle).
- /en hub: TR homepage kalıbı (hero=EN hero-copy, "Get Free Quotation in 24h" CTA, stat bandı, hizmetler, industries öne çıkan, partner, CTA bandı). Navbar/Footer EN layout'a bağla.
- /en/products (liste+kategori) + /en/products/[slug] (20 ürün): ürün şablonu (hero/CTA → Neden Türkiye → stat tablo → süreç → partner placeholder → SSS → CTA) stilli; ItemList/Product schema korunur.
- /en/industries + /en/services: şablonlu.
- /en/{ru,fr,nl,es,ar}: EN hub kalıbı + bölgesel ChannelCta (ru→Telegram, ar→WhatsApp, fr/nl/es→form); **/en/ar TAM RTL** (dir=rtl, mantıksal CSS, mirror, bdi).
Kabul: EN + 5 varyant stilli; i18n doğru (TR sızıntısı yok); ar RTL temiz; kanal CTA matrisi; build+lint yeşil; hex=0.
Commit'ler (tek-scope): "D5 en: hub+products+industries", "D5 en-l10n: 5 varyant + ar RTL + i18n".
```
> **D5 bitince DUR** → kullanıcıya /en + /en/ar ekran görüntüsü göster, "yayılım doğru mu" kısa onay al, sonra D6.

## 4. D6 — DE + ZH (locale palet)
```
Scope: app/(de)/**, app/(zh)/**, lib/ui/**, design-tokens (de/zh palet varyantı)
- DE (sakin-güven palet, data-theme="de"): /de hub + hizmet şablonları + /de/vertrauen + Impressum/Datenschutz shell (içerik FAZ 5'te dolacak; tasarım+footer sabit linkler hazır). Formal ton görsel dile yansısın (sade, kurumsal).
- ZH (kırmızı-altın palet, data-theme="zh"): /zh hub + hizmet şablonları + **WeChat QR bileşeni** stilli (mobil aç/kopyala); 简体字; 4-sayısı görsellerde kaçın.
- i18n: de + zh sözlükleri; Navbar/Footer/CTA bağlı.
Kabul: /de sade-güven, /zh kırmızı-altın net; WeChat QR stilli; palet varyantları token'dan (yeni hex yok); build+lint yeşil.
Commit'ler: "D6 de: sakin-güven palet + sayfalar", "D6 zh: kırmızı-altın palet + WeChat QR".
```

## 5. SONRA — D7 → D9 (ana talimat §6–§9)
- **D7 Animasyon cilası:** tüm dillerde scroll reveal + micro-interaction + count-up + sayfa geçişi; RTL'de yön ters; `prefers-reduced-motion` saygılı.
- **D8 Remotion:** hero loop + 1–2 infografik → `public/media/video`; locale-nötr veya her hero'da kullanılabilir; kota disiplinli.
- **D9 Görsel QA:** Lighthouse ≥90 (tr/en/de/zh anasayfa), 4 breakpoint, RTL, dark/light, a11y, hex=0, build yeşil → `qa/TASARIM/rapor.md` + before/after (her dil).

---

## 6. KABUL KRİTERLERİ (yayılım "bitti")
- [ ] TR + EN + DE + ZH + 5 varyant: **hiçbir ham/stilsiz sayfa kalmadı.**
- [ ] UI metinleri **i18n'den** (navbar/footer/CTA/buton); diller arası TR sızıntısı 0.
- [ ] Locale palet: /zh kırmızı-altın, /de sakin-güven, TR/EN navy+altın — hepsi **token'dan** (hex=0).
- [ ] /en/ar **tam RTL**; kanal CTA matrisi doğru (ru/ar/fr/nl/es).
- [ ] İçerik/SEO/schema/meta/hreflang **bozulmadı** (regresyon).
- [ ] Ortak komponentler yeniden kullanıldı (dil başına kopya yok).
- [ ] `pnpm build` + `pnpm lint` yeşil; gitleaks temiz; Lighthouse ≥90 (4 anasayfa).

---

## 7. BAŞLANGIÇ
1. Oku: bu dosya + `OPUS_TASARIM_TALIMATI.md` + onaylı TR anasayfa (referans) + `design/design-tokens.md` (de/zh varyant) + mevcut `lib/ui/*`.
2. **D4**'ten başla (TR iç sayfalar) → **D5** (EN + varyantlar; bitince kullanıcıya göster, kısa onay) → **D6** (DE + ZH) → **D7–D9**.
3. Her adımda build+lint yeşil, i18n doğru, tokens tek kaynak; dev sunucusunda (localhost) doğrula, ekran görüntüsü al.
4. Belirsizlik (locale palet tonu, kanal, font) → kullanıcıya sor.

_Hedef: localhost'ta hangi dili açarsan aç — TR, EN, DE, ZH, /en/ar — hepsi aynı premium kalitede, dilin kendi kimliğiyle._
