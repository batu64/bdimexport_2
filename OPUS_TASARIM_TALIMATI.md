# OPUS 5.5 — TASARIM & GÖRSEL UYGULAMA TALİMATI (Public UI + Animasyon + Remotion)
**Proje:** bdimexport.com | **Sürüm:** 1.0 | **Tarih:** 28.10.2026 | **Yürütücü:** **Opus 5.5**
**Amaç:** Şu an **çıplak HTML** olan public siteyi, **premium, modern, güven veren bir B2B ticaret platformu** görünümüne kavuşturmak. Tasarım sistemini (zaten mevcut token + brief'ler) gerçek CSS + stilli komponentlere çevir, **ince ve profesyonel animasyon** (Framer Motion) ekle, **Remotion** ile motion-graphics/video varlıkları üret. Hedef: ekrana baktığında "gerçek, pahalı, güvenilir bir ürün" hissi.

> **KRİTİK BAĞLAM:** İçerik + backend + admin + otomasyon HAZIR ve çalışıyor (49+ sayfa, D1, Workers API, cron'lar, 194 test). **Eksik olan tek şey: public sayfalara uygulanmış görsel katman.** `globals.css` YOK; `(tr)/(en)/(de)/(zh)` layout'ları CSS import etmiyor; sayfalar tarayıcı varsayılanıyla render oluyor. Yalnız admin stilli. **Bu talimat o boşluğu dünya-sınıfı kapatır.**

---

## 0. DEĞİŞMEZ KURALLAR

1. **Tasarım tek kaynak:** Tüm renk/tipografi/spacing/radius/shadow değerleri **`lib/ui/tokens.ts`** + **`design/design-tokens.md`** (Varyant A "Ticaret Güveni", insan onaylı) üzerinden. **Hardcoded hex/px YASAK** — her değer token. Token eksikse önce token'a ekle, sonra kullan.
2. **Static export uyumu (ZORUNLU):** `next.config.ts` = `output: "export"`. Yani: server component + `"use client"` animasyon komponentleri OK; **API route/SSR/ISR YOK.** Framer Motion client-only; Remotion **offline render** (build-time, node) → statik video/görsel asset. Hiçbir şey SSR'a bağlı olmasın; `pnpm build` yeşil kalmalı.
3. **Performans kapısı:** Lighthouse ≥ 90 (perf+a11y+best+SEO) her ana sayfada; LCP < 2.0s; CLS < 0.1; animasyonlar main-thread'i bloklamasın (transform/opacity, GPU); ağır medya lazy-load.
4. **Erişilebilirlik (WCAG AA):** kontrast ≥ 4.5:1 (metin), klavye navigasyonu, focus-visible, aria, `prefers-reduced-motion` → animasyonları kapat/sadeleştir. Animasyon dekoratif, içerik ona bağlı değil.
5. **RTL:** `/en/ar` tam RTL (mantıksal CSS: `margin-inline`, `padding-inline`, `inset-inline`; `dir="rtl"`; animasyon yönleri mirror). Mevcut `lib/ui/variant.module.css` RTL sistemini koru/genişlet.
6. **Dil varyant kimlikleri:** TR/EN baz · **/zh kırmızı-altın** · **/de sade-güven** — tek tasarım dili, locale'e göre palet/vurgu farkı (design-tokens zh/de varyantları). 4-sayısı /zh görsellerinde kaçınılır.
7. **İkon = SVG** (AGENTS §5: ikon/şema için AI görsel yasağı). Inline SVG veya `lucide-react` gibi hafif set.
8. **Marka tonu:** Premium B2B ticaret/sourcing — **güven, netlik, veri-odaklı, kurumsal.** Flashy/gimmick değil; "sessiz lüks" — ince motion, cömert boşluk, net tipografi, güçlü hiyerarşi. (Alibaba'nın ciddiyeti + modern SaaS'ın inceliği.)
9. **Build-breaking yok:** Her commit sonrası `pnpm build` + `pnpm lint` yeşil. Mevcut içerik/SEO/schema/meta BOZULMAZ (sadece sarmalanır/stil alır).
10. **Scope/commit:** mantıklı tek-scope commit'ler (globals+tokens · ortak komponentler · her route group · animasyon · Remotion · QA). Her commit öncesi `git status`/`git diff --cached`.

---

## 1. MEVCUT VARLIKLAR (önce bunları oku/kullan)
- `design/design-tokens.md` — Varyant A palet/tipografi/spacing/breakpoint (insan onaylı; yetkili).
- `design/components/*.md` — 8 komponent brief'i (navbar, hero, card, form, footer, cta, partner-grid, lang-switcher) — prop + 4 breakpoint + a11y. **Bunları gerçek komponente çevir.**
- `lib/ui/tokens.ts` — token TS kaynağı. **CSS değişkenlerine bunu bağla.**
- `lib/ui/variant.module.css`, `lib/ui/VariantShell.tsx`, `ChannelCta.tsx`, `LangSwitcher.tsx`, `VariantPageBody.tsx`, `md.tsx` — mevcut UI altyapısı; genişlet, ezme.
- `app/admin/*.module.css` — admin stilli (referans: tasarımın uygulanabildiğinin kanıtı; tutarlılık için paleti paylaş).
- `design/hero-copy.md` — 4 dilde hero metni (hazır).

---

## 2. TEKNOLOJİ YIĞINI (ekle)
`package.json`'a (exact sürüm, static-export uyumlu):
- **`framer-motion`** — client animasyonları (scroll reveal, micro-interaction, hover, page transition). `"use client"` komponentlerde.
- **`remotion` + `@remotion/cli` + `@remotion/renderer`** — motion-graphics/video **offline render** (ayrı `remotion/` dizini; `public/media/video/`'ya `.mp4`/`.webm` üretir; runtime'a bağlı değil).
- (opsiyonel) **`lucide-react`** — SVG ikon seti · **`clsx`** — className birleştirme.
- CSS yaklaşımı: **`app/globals.css`** (tokens → CSS custom properties, temel reset/tipografi/temalar) + **CSS Modules** (mevcut desenle tutarlı). Tailwind EKLEME (mevcut desen CSS Modules + tokens; tutarlılık için onu sürdür).

> Sürüm seçimi: her paket için en az 2 hafta eski, sabit sürüm. `pnpm add` sonrası `pnpm build` yeşil doğrula (static export'ta framer-motion client, remotion dev-dependency).

---

## 3. TASARIM DİLİ (uygulanacak sistem)
Değerleri `design-tokens.md`/`tokens.ts`'ten çek; aşağısı **yön**:
- **Palet (Varyant A):** lacivert/navy (güven, kurumsal) + altın/amber (ticaret, vurgu/CTA) + nötr gri skala + semantik (success/warn/error). /zh: kırmızı-altın. /de: daha sakin, yüksek kontrast güven.
- **Tipografi:** net, kurumsal bir ölçek (başlık için güçlü sans/serif-contrast, gövde için okunur sans). Google Fonts'tan 1–2 aile (perf: `font-display: swap`, subset). Modüler ölçek (1.25 civarı), net hiyerarşi.
- **Spacing/Grid:** 4/8 px tabanlı skala; max-width container (~1200–1280); cömert dikey ritim; 4 breakpoint (mobil-first).
- **Radius/Shadow:** yumuşak radius (8–16), katmanlı ince gölgeler (elevation sistemi); glassmorphism'den kaçın (kurumsallık).
- **Dark/Light:** `:root` light + `@media (prefers-color-scheme: dark)` dark; token'lar iki temada da tanımlı; `data-theme` override.
- **Motion ilkeleri:** easing = doğal (ease-out giriş, 150–400ms); mesafe kısa; stagger ince; `prefers-reduced-motion` → kapat. Motion **anlam taşısın** (hiyerarşi, yönlendirme), süsleme değil.

---

## 4. KOMPONENT KATMANI (brief'leri gerçeğe çevir)
`lib/ui/` altında stilli, tokenlı, animasyonlu, responsive, a11y komponentler. Her biri `design/components/<ad>.md` brief'ine dayanır:

| Komponent | İçerik | Animasyon |
| :-- | :-- | :-- |
| **Navbar** | logo, ana menü, dil switcher, kanal CTA, mobil hamburger drawer | sticky shrink-on-scroll, mobil drawer slide, underline hover |
| **Hero** | başlık (hero-copy), alt metin, çift CTA, güven rozetleri/istatistik şeridi, görsel/video alanı | giriş stagger (başlık→metin→CTA), hafif parallax, arka plan Remotion video/gradient-mesh |
| **Card** (ürün/hizmet/rehber/sektör) | ikon/görsel, başlık, özet, link, rozet | hover lift + gölge + border-glow; grid scroll-reveal stagger |
| **StatBand / Metrikler** | TÜİK/ihracat rakamları, "X partner", "24h teklif" | **number count-up** (viewport'a girince), ince ikon motion |
| **Form** (başvuru/teklif) | alanlar, validasyon, Turnstile alanı, KVKK checkbox | focus float-label, error shake (reduced-motion saygılı), submit state |
| **Footer** | linkler, diller, legal, kanallar, bülten | kolon reveal |
| **PartnerGrid** | onaylı partner logoları (consent filtreli) / "yakında" boş durum | logo marquee (hafif) / fade-in |
| **CTA bandı** | güçlü dönüşüm bloğu | arka plan gradient motion, buton micro-interaction |
| **LangSwitcher / ChannelCta** | mevcut — stil + motion ver | dropdown/aç-kapa motion |
| **SectionReveal (wrapper)** | scroll-triggered reveal sarmalayıcı (tüm bölümler) | IntersectionObserver / framer `whileInView` |

**Kural:** hepsi `"use client"` sadece animasyon gerektiren kısımlarda; statik içerik server component kalsın (perf). Her komponent 4 breakpoint + klavye + aria.

---

## 5. SAYFA / LAYOUT UYGULAMASI
1. **`app/globals.css`** oluştur: token→CSS değişkenleri, reset, temel tipografi, link/buton temelleri, tema (light/dark), yardımcı sınıflar. **Her route group root layout'u import etsin.**
2. **Route group shell'leri:** `(tr)/(en)/(de)/(zh)` + `(en-{ru,fr,nl,es,ar})` root layout'larına **Navbar + Footer + container + tema** uygula (mevcut `<body>`'yi sarmala; hreflang/IntlProvider korunur).
3. **Sayfaları stille:**
   - **TR:** ana sayfa (hero+hizmetler+flywheel+CTA+partner), /ithalat & /ihracat hizmet + rehber sayfaları (md render → stilli tipografi/`prose`), başvuru formu, kvkk.
   - **EN:** ana hub, /en/products (liste+kategori+20 ürün detay), /en/industries, /en/services.
   - **Varyantlar:** /en/{ru,fr,nl,es,ar} (VariantShell'i stille; **ar RTL**).
   - **DE:** sade-güven palet; Impressum/Datenschutz/vertrauen (FAZ 5'te içerik dolacak — shell hazır olsun).
   - **ZH:** kırmızı-altın; WeChat QR bileşeni stilli.
4. **MD içerik tipografisi:** `md.tsx`/`prose` — başlık/paragraf/liste/tablo/FAQ/quote için okunur, markalı tipografi (kaynak linkleri, istatistik tabloları güzel görünsün).
5. **İkon/illustrasyon:** SVG ikon seti + hafif SVG pattern/gradient-mesh arka planlar (görsel üretimi Gemini E3'e kadar); hero görseli için **placeholder + Remotion video/gradient** kullan.

---

## 6. ANİMASYON KATMANI (Framer Motion — ince & premium)
- **Giriş (page/hero):** stagger reveal (opacity+translateY kısa), ilk ekran hızlı (LCP'yi geciktirme — hero metni animasyonsuz da okunur olmalı).
- **Scroll reveal:** bölümler `whileInView` ile yumuşak belirme (bir kez, `viewport once`).
- **Micro-interaction:** buton hover/press, kart hover lift, link underline, focus halkaları.
- **Sayaç:** stat rakamları viewport'ta count-up.
- **Sayfa geçişi:** route değişiminde yumuşak fade/slide (static export'ta client-side nav ile; abartma).
- **Arka plan motion:** hero/CTA'da hafif animasyonlu gradient-mesh veya Remotion video (düşük ağırlık, loop, `prefers-reduced-motion`'da statik frame).
- **Reduced motion:** tüm animasyonlar `prefers-reduced-motion: reduce`'da kapanır/sadeleşir (zorunlu).
- **Performans:** yalnız `transform`/`opacity`; `will-change` ölçülü; animasyonlu ağır komponentler lazy/`dynamic` import.

---

## 7. REMOTION KATMANI (motion-graphics / video — offline üretim)
Remotion **sayfada canlı çalışmaz**; node ile **offline render** edip `public/media/video/`'ya statik `.mp4`/`.webm` (ve poster `.webp`) koyar. Static export ile uyumlu.
- **Dizin:** `remotion/` (kompozisyonlar) + `scripts/render-video.mjs` (render) — **dev/offline**, runtime bağımlılığı yok.
- **Üretilecek varlıklar (öneri, kota disiplinli):**
  1. **Hero arka plan loop** (6–10s, sessiz, hafif): markalı soyut ticaret/global-ağ motion (navy-altın), poster frame'li. TR/EN ana sayfa hero.
  2. **Animated stat/infografik** (ihracat rakamları, süreç 5 adım) → kısa video/gif; sayfalarda `<video>`/`<img>`.
  3. **Sosyal/OG motion klip** (opsiyonel, lansman FAZ 8 için) — kısa tanıtım.
- **Kurallar:** `prompts/visual-brand.md` paleti/stili sabit; metin/rakam Remotion'da **veri-doğru** (TÜİK/TİM; uydurma yok) ya da metinsiz (metin HTML'de); dosyalar optimize (boyut sınırı, webm+mp4, poster); reduced-motion'da `<video>` yerine poster.
- **Not:** Gerçek foto-realistik görseller (hero fotoğraf, ürün) = **Gemini image E3** (en sonda). Remotion = vektörel/motion-graphics; ikisi tamamlayıcı. Remotion render **ağır** olabilir → ilk turda 1–2 kompozisyonla başla, kota/zaman kontrollü.

---

## 8. SIRA / PLAN (faz faz, her biri commit + build-yeşil)
1. **D1 — Temel:** `pnpm add` (framer-motion, remotion, lucide, clsx); `app/globals.css` (tokens→CSS var, reset, tema, tipografi); route group root layout'larına import + container + tema. → **build yeşil + bir sayfa stilli.**
2. **D2 — Ortak komponentler:** Navbar + Footer + Button + Card + Section + Container + prose/md tipografi (tokenlı, responsive, a11y).
3. **D3 — Hero + Homepage:** TR ana sayfa tam tasarım (hero, hizmet kartları, flywheel, stat band, partner, CTA) + Framer Motion giriş/scroll. → **before/after ekran görüntüsü.**
4. **D4 — İç sayfalar:** /ithalat, /ihracat, rehberler, form, kvkk (md tipografi + kart düzen).
5. **D5 — EN:** hub, products (liste+kategori+detay), industries, services + varyant shell'leri (ar RTL).
6. **D6 — DE + ZH:** sade-güven / kırmızı-altın palet uygulaması, WeChat QR.
7. **D7 — Animasyon cilası:** scroll reveal sistemi, micro-interaction, count-up, sayfa geçişi, reduced-motion.
8. **D8 — Remotion:** hero loop + 1 infografik; `public/media/video`'ya render; sayfalara bağla.
9. **D9 — Görsel QA + performans:** Lighthouse ≥90 (4 ana sayfa), 4 breakpoint, RTL, dark/light, klavye/a11y, hardcoded-hex=0, build yeşil. `qa/TASARIM/rapor.md` + before/after ekran görüntüleri.

> Her D adımında dev sunucusunda (localhost:3000) görünümü doğrula, ekran görüntüsü al.

---

## 9. KABUL KRİTERLERİ (tasarım "bitti" tanımı)
- [ ] `globals.css` + tokens→CSS var; tüm route group'lar stilli (ham HTML sayfa KALMADI).
- [ ] Navbar/Footer/Hero/Card/Form/CTA/StatBand komponentleri tokenlı + 4 breakpoint + a11y.
- [ ] TR + EN ana sayfa **premium görünüm** (before/after kanıtı).
- [ ] Framer Motion: scroll reveal + micro-interaction + count-up + hero giriş; `prefers-reduced-motion` saygılı.
- [ ] Remotion: en az hero loop + 1 infografik, `public/media/video`'da, sayfada çalışıyor.
- [ ] RTL (/en/ar) doğru; dark/light çalışıyor; /zh kırmızı-altın, /de sade-güven.
- [ ] Lighthouse ≥ 90 (perf+a11y+best+SEO) ana sayfalarda; LCP < 2s; CLS < 0.1.
- [ ] **Hardcoded hex/px = 0** (tokens dışı yok — git grep kanıtı); `pnpm build` + `pnpm lint` yeşil; gitleaks temiz.
- [ ] Mevcut içerik/SEO/schema/meta BOZULMADI (regresyon).

---

## 10. İNSAN (👤) NOKTALARI
- **Palet/yön onayı:** Varyant A zaten onaylı — ek onay gerekmez; ama D3 (ilk homepage) çıkınca **kullanıcıya before/after göster, "yön doğru mu" onayı al**, sonra tüm sayfalara yay.
- **Gemini görsel (E3):** foto-realistik hero/ürün görselleri en sonda; o ana kadar SVG/gradient/Remotion placeholder.
- **Remotion render:** ağır/uzun sürerse kullanıcıya haber ver; ilk turda kapsamı dar tut.
- **Font seçimi:** 1–2 Google Fonts ailesi öner, kullanıcı onaylasın (marka hissi).

---

## 11. BAŞLANGIÇ
1. Oku: bu dosya + `design/design-tokens.md` + `design/components/*` + `lib/ui/tokens.ts` + `lib/ui/variant.module.css` + `design/hero-copy.md`.
2. **D1**'den başla (paketler + globals.css + layout wiring) → build yeşil → bir sayfa stilli göster.
3. **D3 bitince DUR**, kullanıcıya **before/after TR ana sayfa** ekran görüntüsü + "yön onayı" sun. Onay sonrası D4+ ile tüm sayfalara yay.
4. Takıldığında/kararsız kaldığında (font, yön, Remotion kapsamı) **kullanıcıya sor** — tahminle premium his yakalanmaz.

_Hedef cümlesi: Kullanıcı localhost:3000'i açtığında "bu gerçek, pahalı, güvenilir bir platform" demeli. Çıplak iskeletten cilalı ürüne._
