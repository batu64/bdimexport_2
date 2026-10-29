# OPUS 5.5 — TASARIM FİNALİ (D6 → D9): DE/ZH + Animasyon + Remotion + QA
**Proje:** bdimexport.com | **Sürüm:** 1.0 | **Tarih:** 29.10.2026 | **Yürütücü:** **Opus 5.5**
**Amaç:** Frontend görsel çalışmasını **bitir.** D1–D5 tamam (TR + EN + 5 varyant + ar RTL, insan onaylı). Kalan: **DE/ZH locale paletleri (D6)** + **animasyon cilası (D7)** + **Remotion motion-graphics/video (D8)** + **görsel QA (D9)**. Bu dört adım bitince site, her dil, premium + animasyonlu olur.

> **BAĞLAM:** Onaylı referans = TR/EN anasayfa tasarımı (navy+altın, Varyant A, hero+komponent+stat+CTA). Ortak komponentler (`Navbar, Footer, Button, Card, Section, Reveal, CountUp`, hero/stat/CTA kalıpları) + i18n sözlükleri hazır. **Bu dosya `OPUS_TASARIM_TALIMATI.md` + `OPUS_TASARIM_YAYILIM.md`'nin devamıdır** — oradaki tüm kurallar (static-export, tokens tek kaynak, komponent yeniden kullanım, i18n, Lighthouse ≥90, a11y, motion ilkeleri) aynen geçerli.

---

## 0. DEĞİŞMEZ KURALLAR (özet)
1. **Tokens tek kaynak** — hardcoded hex/px=0 (git grep kanıtı). Yeni renk/ton = token varyantı.
2. **Static export uyumu** — `output:"export"`; animasyon client; Remotion **offline render** → statik asset. `pnpm build`+`pnpm lint` her commit yeşil.
3. **Komponent yeniden KULLAN** — DE/ZH için ayrı komponent yazma; **i18n + locale palet** ile farklılaştır.
4. **i18n** — tüm UI metinleri sözlükten (de.json / zh.json); TR/EN sızıntısı 0.
5. **Erişilebilirlik + reduced-motion** — WCAG AA kontrast, klavye, focus-visible, aria; `prefers-reduced-motion`'da animasyon/video kapanır (ZORUNLU).
6. **İçerik BOZULMAZ** — SEO/schema/meta/hreflang/dil içeriği aynen.
7. **Tek-scope commit** + `git status`/`diff --cached` kontrol.

---

## 1. D6 — DE + ZH (locale palet uygulaması)
```
Scope: app/(de)/**, app/(zh)/**, lib/ui/** (gerekli küçük eklemeler), design-tokens (de/zh palet varyantı), i18n de.json/zh.json
```

### D6-DE — Sakin-Güven paleti
- **Palet:** `data-theme="de"` (de root layout'ta). Baz navy + **ölçülü altın** (DACH için daha az vurgu, daha yüksek kontrast, kurumsal/formal his). Değerler design-tokens.md **de varyantı**ndan (yeni hex yazma).
- **Sayfalar (onaylı kalıpla):** `/de` hub (hero=de hero-copy, güven odaklı; CTA WhatsApp/E-posta + teklif), hizmet sayfa shell'leri, `/de/vertrauen` (Trust — güven rozetleri/yorum kartı iskeleti), **Impressum + Datenschutz shell** (içerik FAZ 5'te dolacak → shell + sabit footer linkleri + prose hazır olsun).
- **Ton:** görsel dil **formal/sade/kurumsal** — az hareket, net tipografi, cömert boşluk.
- **i18n:** Navbar/Footer/CTA/buton → de.json.

### D6-ZH — Kırmızı-Altın paleti
- **Palet:** `data-theme="zh"`. **Kırmızı-altın** (Çin pazarı güven/bereket; design-tokens zh varyantı). 4-sayısı görsel vurgularda kaçın.
- **Sayfalar:** `/zh` hub (hero=zh hero-copy) + hizmet shell'leri. **WeChat QR bileşeni stilli** (kart içinde QR + "扫码联系" benzeri etiket; mobilde aç/kopyala davranışı). 简体字.
- **i18n:** zh.json.

**Kabul:** /de sade-güven, /zh kırmızı-altın net ayrışıyor; WeChat QR stilli; paletler **token'dan** (hex=0); i18n doğru; build+lint yeşil.
**Commit'ler:** "D6 de: sakin-güven palet + sayfa shell'leri", "D6 zh: kırmızı-altın palet + WeChat QR".
> **D6 bitince DUR** → kullanıcıya `/de` + `/zh` ekran görüntüsü göster, kısa onay al, D7'ye geç.

---

## 2. D7 — Animasyon Cilası (tüm diller)
```
Scope: lib/ui/** (motion komponentleri), route group layout/sayfa bağlamaları
```
TR/EN'de kurulu motion sistemini (`Reveal`, `CountUp`, hero giriş) **tüm dillere + tüm sayfa tiplerine** tutarlı yay + zenginleştir:
- **Hero giriş:** her anasayfada stagger reveal (başlık→metin→CTA); LCP'yi geciktirme (metin animasyonsuz da okunur).
- **Scroll reveal:** tüm bölümler `whileInView` (bir kez, yumuşak); kart gridlerinde stagger.
- **Micro-interaction:** buton hover/press, kart hover lift+gölge, nav underline, link/focus halkaları — her dilde.
- **Count-up:** tüm stat bantları viewport'ta sayar.
- **Sayfa geçişi:** client-side nav'da yumuşak fade/slide (ölçülü).
- **RTL (/en/ar):** animasyon yönleri **mirror** (translateX işaretleri ters).
- **Reduced-motion:** `prefers-reduced-motion: reduce` → tüm bunlar kapanır/sadeleşir.
- **Performans:** yalnız `transform`/`opacity`; ağır motion komponentleri `dynamic`/lazy; `will-change` ölçülü.

**Kabul:** 4 dilde + varyantlarda tutarlı, ince, premium motion; reduced-motion saygılı; Lighthouse perf düşmüyor; build yeşil.
**Commit:** "D7 fe: animasyon sistemi tüm dillere yayıldı + RTL mirror + reduced-motion".

---

## 3. D8 — Remotion (motion-graphics / video — offline üretim)
```
Scope: remotion/** (kompozisyonlar), scripts/render-video.mjs, public/media/video/**, sayfa bağlamaları
```
Remotion **sayfada canlı çalışmaz** → node ile **offline render** → `public/media/video/`'ya statik `.webm`+`.mp4`+poster `.webp`. Static export uyumlu.
- **Dizin:** `remotion/` (kompozisyonlar) + `scripts/render-video.mjs` (render komutu). Dev-dependency; runtime bağımlılığı yok.
- **İlk tur varlıkları (kota/zaman disiplinli — 1–2 kompozisyonla başla):**
  1. **Hero arka plan loop** (6–10 s, sessiz, hafif): markalı soyut **küresel ticaret/ağ** motion (navy-altın), poster frame'li. Anasayfa hero'larında arka plan (metin okunur kalsın; overlay/gradient).
  2. **Animated infografik** (örn. 5 adımlı tedarik süreci veya ihracat istatistik şeması): kısa video → ilgili bölümde `<video>`/poster.
- **Kurallar:** `prompts/visual-brand.md` palet/stil sabit prefix; rakamlar **veri-doğru** (TÜİK/TİM) ya da **metinsiz** (metin HTML'de); dosyalar optimize (webm+mp4+poster, boyut sınırı); **mobil + reduced-motion → video yerine poster** (autoplay yok).
- **Not:** Foto-realistik görseller (hero fotoğraf, ürün) = **Gemini image, E3 (proje sonu)** — Remotion onun yerine geçmez, tamamlar (vektörel/motion). Render ağır/uzun sürerse **kullanıcıya haber ver**, kapsamı daralt.

**Kabul:** en az hero loop + 1 infografik `public/media/video`'da, sayfada çalışıyor; mobil/reduced-motion'da poster; build yeşil; boyutlar makul.
**Commit:** "D8 remotion: hero loop + infografik (offline render → public/media/video)".

---

## 4. D9 — Görsel QA (frontend "bitti" denetimi)
```
Scope: qa/** (qa/TASARIM/rapor.md + before/after ekran görüntüleri)
```
- **Lighthouse ≥ 90** (perf+a11y+best+SEO): tr / en / de / zh anasayfa + 1 içerik sayfası. LCP < 2s; CLS < 0.1. (Statik `out/` üzerinden `scripts/serve-static.mjs` ile ölç.)
- **Responsive:** 4 breakpoint (mobil 375 / tablet 768 / masaüstü / geniş) — bozulma yok, taşma yok.
- **RTL:** /en/ar görsel + DOM (dir=rtl, mantıksal CSS, mirror) temiz.
- **Tema:** dark + light ikisi de çalışıyor; kontrast AA.
- **A11y:** klavye navigasyonu, focus-visible, aria, reduced-motion.
- **Kod hijyeni:** hardcoded hex=0 (git grep), `pnpm build`+`pnpm lint` yeşil, gitleaks temiz.
- **Regresyon:** içerik/SEO/schema/meta/hreflang bozulmadı.
- **Çıktı:** `qa/TASARIM/rapor.md` (tablo + kanıt) + **her dil için before/after** ekran görüntüsü.

**Commit:** "D9 qa(TASARIM): Lighthouse + responsive + RTL + a11y denetimi + before/after".
> **D9 bitince DUR** → kullanıcıya **tüm diller before/after + Lighthouse özeti** sun. Frontend görsel TAMAM.

---

## 5. KABUL KRİTERLERİ (frontend görsel bitti)
- [ ] TR + EN + DE + ZH + 5 varyant: **stilsiz/ham sayfa yok**, hepsi premium.
- [ ] /de sakin-güven · /zh kırmızı-altın · TR/EN navy+altın — **token'dan** (hex=0).
- [ ] i18n doğru (dil sızıntısı 0); /en/ar RTL + mirror animasyon.
- [ ] Animasyon: scroll reveal + micro-interaction + count-up + hero + sayfa geçişi; reduced-motion saygılı.
- [ ] Remotion: hero loop + ≥1 infografik, mobil/reduced-motion'da poster.
- [ ] Lighthouse ≥ 90 (4 anasayfa); responsive 4 breakpoint; dark/light; a11y.
- [ ] `pnpm build`+`pnpm lint` yeşil; gitleaks temiz; içerik/SEO bozulmadı.

---

## 6. İNSAN (👤) NOKTALARI
- **D6 sonrası:** /de + /zh göster → kısa yön onayı.
- **D8 Remotion:** render ağırsa haber ver; video "çok mu / az mı" kullanıcıya sor (B2B'de ölçülü motion tercih edilir).
- **D9 sonrası:** tüm diller before/after + Lighthouse → kullanıcı "frontend tamam" onayı → faz hattına dönülür (FAZ 4.10 → FAZ 5).
- **Foto görseller:** Gemini (E3, proje sonu) — D6–D9'da SVG/gradient/Remotion placeholder.

---

## 7. BAŞLANGIÇ
1. Oku: bu dosya + `OPUS_TASARIM_TALIMATI.md` + `OPUS_TASARIM_YAYILIM.md` + onaylı TR/EN tasarım + `design/design-tokens.md` (de/zh varyant) + `lib/ui/*`.
2. **D6**'dan başla (DE + ZH) → bitince kullanıcıya göster → **D7** (animasyon) → **D8** (Remotion) → **D9** (QA).
3. Her adımda build+lint yeşil, i18n doğru, tokens tek kaynak; dev sunucusunda doğrula, ekran görüntüsü al.
4. Belirsizlik (de/zh palet tonu, Remotion kapsamı, font) → kullanıcıya sor.

_Hedef: D9 sonunda localhost'ta TR/EN/DE/ZH/ar — hangisini açarsan aç — premium, animasyonlu, dilin kendi kimliğiyle. Frontend görsel biter; sonra faz hattına (4.10 → FAZ 5) döneriz._
