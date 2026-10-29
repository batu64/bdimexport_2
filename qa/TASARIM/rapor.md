# Tasarım QA Raporu (D9) — frontend görsel "bitti" denetimi
**Tarih:** 2026-10-29 | **Denetleyen:** Claude Code (Opus 5.5) | **Kaynak:** OPUS_TASARIM_D6_D9.md §4 + OPUS_TASARIM_TALIMATI.md §9 + OPUS_TASARIM_YAYILIM.md §6
**Ölçülen çıktı:** `NEXT_DIST_DIR=.next-build pnpm build` statik export'u, `scripts/serve-static.mjs` ile (Cloudflare Pages gibi brotli/gzip).
**Kural:** kanıtsız pass yok — her satır bu dizindeki bir JSON'a, ekran görüntüsüne ya da yeniden koşulabilir komuta bağlı.

---

## 0. ÖZET

| Kriter | Hedef | Sonuç | Kanıt |
| :-- | :-- | :-- | :-- |
| Stilsiz/ham sayfa | 0 | ✅ 0 — TR, EN (+5 varyant), DE, ZH; 101 sayfanın tamamı ortak şablonlarla | `screens/d9-*`, `screens/after-*`, `screens/d4-*…d8-*` |
| Lighthouse **masaüstü** | ≥ 90 (4 kategori) | ✅ perf 99–100 · a11y 100 · BP 100 · SEO 100 (7 sayfa) · LCP 0,67–0,79 s | `lighthouse-desktop.json` |
| Lighthouse **mobil** | ≥ 90 | ✅ 6/7 sayfa ilk koşuda ≥90; /en ilk koşu 89 → tekrar 90 / 94 / 94 (medyan 94) · a11y/BP/SEO 7/7'de 100 | `lighthouse-mobile.json` + §1 |
| LCP < 2 s | 4 ana sayfa | ⚠️ **masaüstü ✅ (≤0,79 s); mobil simülasyon 2,3–3,1 s** (Lighthouse "iyi" eşiği 2,5 s: 5/7 ≤2,77 s) | §1 |
| CLS < 0,1 | — | ✅ 0–0,002 | aynı |
| Responsive (375/768/1440/1920) | taşma yok | ✅ 10 sayfa × 4 genişlik: yatay taşma 0 | `ui-audit.json` |
| RTL (/en/ar) | dir=rtl, ayna | ✅ `<html dir=rtl>`, mantıksal CSS (tarama), ok/kayma yönleri `--dir` ile ters, bdi sayılar; smoke 7/7 | `ui-audit.json`, `lib/ui/variants.smoke.test.mjs` |
| Dark / light | ikisi de | ✅ 10 sayfa koyu temada gövde kontrastı 14,5:1; zh koyu temada kırmızı→altın (K8) | `ui-audit.json`, `screens/d9-*-1440-dark.png` |
| A11y: klavye / odak | — | ✅ 10 sayfada ilk Tab = "içeriğe geç" (kendi dilinde), odak halkası ≥2 px; Lighthouse a11y 100 | `ui-audit.json` |
| Reduced-motion | animasyon/video kapalı | ✅ 10 sayfada: gizli reveal 0, `<video>` 0, uzun animasyon 0 | `ui-audit.json` |
| Hardcoded hex / px | 0 | ✅ public UI'da hex 0, rgba/hsl literal 0 (token kaynağı tokens.ts/theme.ts hariç), CSS px 0; @media yalnız token kırılımları (768/1280) | §3 |
| Build / lint / gitleaks | yeşil | ✅ build (101 sayfa) + lint yeşil; secret taraması 0 açıklanmamış bulgu | §3 |
| İçerik / SEO regresyonu | bozulmadı | ✅ 86/86 sayfa birebir (title, canonical, hreflang, robots, JSON-LD tipleri, H1 sayısı); yeni 3 sayfa = DE kabukları (noindex) | `seo-diff.json` |
| i18n | sızıntı 0 | ✅ UI metinleri tr/en/de/zh + 5 varyant sözlüğünden; varyant smoke (lang/ton/kanal) 7/7 | sözlükler + smoke |

---

## 1. LIGHTHOUSE 13.5.0 (Chrome Headless Shell)

**Mobil** (Lighthouse varsayılanı: yavaş 4G + 4× CPU simülasyonu)

| Sayfa | Perf | A11y | BP | SEO | LCP ms | CLS | TBT ms |
| :-- | --: | --: | --: | --: | --: | --: | --: |
| / (TR) | 91 | 100 | 100 | 100 | 2774 | 0 | 202 |
| /en | 89 → **94** (tekrar: 90, 94, 94) | 100 | 100 | 100 | 2453–2635 | 0,002 | 175–305 |
| /de | 90 | 100 | 100 | 100 | 2457 | 0 | 324 |
| /zh | 97 | 100 | 100 | 100 | 2284 | 0 | 131 |
| /ithalat/tedarik | 92 | 100 | 100 | 100 | 2631 | 0 | 201 |
| /en/products/olive-oil | 94 | 100 | 100 | 100 | 2490 | 0 | 208 |
| /en/ar | 90 | 100 | 100 | 100 | 3068 | 0,001 | 155 |

**Masaüstü:** 7 sayfanın tamamı perf 99–100, a11y/BP/SEO 100, LCP 669–787 ms, CLS ≤ 0,002, TBT ≤ 12 ms.

**D9'da yapılan iyileştirmeler** (ilk ölçüm: mobil perf 64–80, LCP 4,4–5,5 s):
1. Ölçüm sunucusuna brotli/gzip (Cloudflare Pages davranışı; sıkıştırmasız sunum Lighthouse'u haksız düşürüyordu).
2. LCP öğesi hero posteriydi → poster + video yalnız ≥768 px (mobilde CSS degrade = statik poster; LCP metin).
3. Kritik CSS satır içi (`experimental.inlineCss`) → render-blocking stylesheet 0.
4. Inter ön yüklemesi kapalı (`swap` + boyut uyumlu fallback; CLS ≈ 0).
5. Reveal sunucu bileşeni + tek `RevealObserver` (bölüm başına hydration yok); D7'de Framer kaldırıldı (ana sayfa JS 132 → 109 KB).
6. Kontrast: süreç kartı rota çipi (4,38 → heading) ve partner rozeti (4,13 → heading) metinleri.

**Dürüst not:** Mobil simülasyonda LCP 2,3–3,1 s; talimattaki "< 2 s" hedefi **masaüstünde** sağlanıyor, mobil simülasyonda sağlanmıyor. Kalan pay ağırlıkla React/Next çalışma zamanı (~102 KB ortak JS) ve yavaş-4G simülasyonu. Gerçek kullanıcı ölçümü (CrUX) yayından sonra doğrulanmalı.

---

## 2. UI DENETİMİ (`scripts/ui-audit.mjs`, CDP)
Sayfalar: `/`, `/en`, `/de`, `/zh`, `/en/ar`, `/ithalat/tedarik`, `/en/products/olive-oil`, `/ihracat/ucretsiz-destek-basvuru`, `/de/vertrauen`, `/en/ru`.

| Kontrol | Sonuç |
| :-- | :-- |
| 375 / 768 / 1440 / 1920 yatay taşma | 0 / 40 ölçüm |
| H1 sayısı | 1 (10/10) |
| `<html dir>` | yalnız /en/ar'da `rtl`; LTR'de basılmıyor |
| Koyu tema gövde kontrastı | 14,51:1 (10/10) |
| Reduced-motion: `data-reveal=hidden` / `<video>` / >1 ms animasyon | 0 / 0 / 0 (10/10) |
| İlk Tab | skip-link, kendi dilinde, odak halkası görünür (10/10) |

---

## 3. KOD HİJYENİ + REGRESYON

```bash
git grep -nE "#[0-9a-fA-F]{3,8}\b" -- 'app/(*)/**' 'app/components/**' 'app/*.css' 'lib/ui/**' ':!lib/ui/tokens.ts'      # → yalnız #çapa linkleri
git grep -nE "\b(rgba?|hsla?)\(" -- 'app/(*)/**' 'app/components/**' 'app/*.css' 'lib/ui/**' ':!lib/ui/theme.ts'      # → 0
git grep -nE "[0-9]px" -- '*.css' ':!app/admin/**' | grep -v @media                                                  # → 0 (1 yorum satırı)
OUT_DIR=.next-build node --experimental-strip-types --no-warnings --test lib/ui/variants.smoke.test.mjs                # → 7/7
node qa/FAZ-3/secret-scan.mjs                                                                                          # → 0 açıklanmamış
node scripts/seo-diff.mjs out .next-build                                                                              # → 86/86 birebir
```
Not: Remotion kompozisyonları (`remotion/*.tsx`) renkleri `lib/ui/tokens.ts`'ten alır; çalışma zamanında `rgba()` dizgisi üretir (token türevi, sitede çalışmaz).

---

## 4. BEFORE / AFTER (`screens/`)

| Dil | Before | After |
| :-- | :-- | :-- |
| TR | `before-tr-home-{desktop,mobile}.png`, `before-ithalat-tedarik-*` | `d9-tr-{375,1440,1440-dark}.png`, `after-tr-home-*`, `d4-tr-*` |
| EN | `before-en-{desktop,mobile}.png` | `d9-en-*`, `d5-en-*` |
| DE | `before-de-*` | `d9-de-*`, `d6-de-*`, `d8-de-home-desktop.png` |
| ZH | `before-zh-*` | `d9-zh-*`, `d6-zh-*` |
| AR (RTL) | `before-en-ar-*` | `d9-en-ar-*`, `d5-en-ar-*` |
Before = tasarım öncesi commit `a6465f2` (geçici worktree build'i).

---

## 5. AÇIK KONULAR (👤 / sonraki fazlar)
1. **KVKK sayfası iç not sızıntısı (D4'te bulundu, önceden vardı):** `/kvkk-riza` hukuki dosyayı "DURUM/AI katkısı/Form Bağlama Notları" ve boş `Adres: [____]` ile yayınlıyor. Dosya insan onaylı v1 + hash'i `KVKK_VERSIONS`'a bağlı → dokunulmadı; karar senin (sayfada gizleme mi, v2 metin mi).
2. **TASLAK token'lar** (`tokens.ts` `[TASLAK-D]`/`[TASLAK-D6]`: koyu tema paleti, radiusLg, e3, sectionY, tracking, motion, zh sistem font yığını) → onaylanırsa `design/design-tokens.md` v2.2'ye işlenir.
3. **WeChat:** `NEXT_PUBLIC_WECHAT_ID` + `NEXT_PUBLIC_WECHAT_QR` girilince kart QR/kopyala/aç moduna geçer (şimdilik dürüst "即将上线").
4. **DE/ZH içerik (FAZ 5):** DE hizmet sayfaları (kartlar şimdilik EN sayfalara "(Englisch)"), Impressum/Datenschutz imzalı metin (5.1), Vertrauen gerçek yorumlar; hero metinleri hero-copy TASLAK.
5. **Mobil LCP < 2 s** simülasyonda sağlanmıyor (§1) — yayından sonra CrUX ile doğrula; gerekirse ana sayfa JS'ini (Navbar/LangSwitcher hydration) daha da küçült.
6. **Foto-realistik görseller** = Gemini image (E3, proje sonu); şimdilik SVG + Remotion.

## 6. YENİDEN KOŞMA
```bash
NEXT_DIST_DIR=.next-build pnpm build
node scripts/serve-static.mjs .next-build 3100
node scripts/lighthouse-audit.mjs <lighthouse/cli/index.js> http://localhost:3100 qa/TASARIM/lighthouse-mobile.json
node scripts/lighthouse-audit.mjs <lighthouse/cli/index.js> http://localhost:3100 qa/TASARIM/lighthouse-desktop.json desktop
node scripts/ui-audit.mjs http://localhost:3100 qa/TASARIM/ui-audit.json
```
(CHROME_PATH: `node_modules/.remotion/chrome-headless-shell/...` — `scripts/render-video.mjs` ilk koşuda indirir.)
