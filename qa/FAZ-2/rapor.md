# FAZ_2 QA Turu Raporu (Step 2.9)
**Tarih:** 2026-10-16 | **Denetleyen:** Claude Code (Haiku 5.5) | **Kaynak:** FAZ_2_AJAN_PANOSU.md §3 Step 2.9
**Ön koşul:** §2 1–8 (2.6 hariç) ✅ — karşılandı (2.1, 2.2, 2.3, 2.4, 2.5, 2.7, 2.8a, 2.8b).
**Ölçüm kaynağı:** `pnpm build` (EXIT=0, **82/82** sayfa) + `pnpm lint` (EXIT=0) + `out/` HTML + `out/sitemap.xml` + `content/en/**` md + `app/(en)`, `lib/ui` kaynağı.

## Sonuç: 8 / 10 PASS · 2 FAIL

| # | Test | Sonuç | Kanıt |
| :-- | :-- | :-- | :-- |
| 1 | H1 kalıbı — 20 ürün sayfası | ✅ PASS 20/20 | md H1 = `{Product} Manufacturers in Turkey \| B2B Sourcing` (regex ile 20/20); `out/en/products/*.html` `<h1>` md H1 ile birebir. |
| 2 | Partner bloğu placeholder + consent | ✅ PASS | 20/20 ürün sayfasında "Verified Turkish Partners" bölümü; metin: "Approved partners are being onboarded…" (placeholder). `<img>` 0 (her sayfada). Partner adı yok (`_partners.json` yok → `loadPartners()` boş). Consent kodu: `app/(en)/en/products/_lib/catalog.ts:102` (`consent_logo_en` yoksa logo `null`). |
| 3 | RTL DOM — `/en/ar` | ✅ PASS | `out/en/ar.html`: `<html lang="ar" dir="rtl">`; `<bdi dir="ltr">` ≥1. |
| 4 | Kanal CTA matrisi | ✅ PASS | ru: Telegram (ana kanal) ✅ · ar: WhatsApp ✅ · fr: "Vos canaux" (vous) ✅ · nl: e-posta, "direct" ✅ · es: "Envíen / reciban" (ustedes çekimi) ✅. Kaynak: `lib/ui/variants.ts`. |
| 5 | Batch kalıp tutarlılığı | ✅ PASS | 20/20 ürün sayfasında H2 sayısı = 8 (tek kalıp); H1 kalıbı tutarlı; FAQ ≥5 her sayfada (`FAQPage` soru sayısı). |
| 6 | hreflang: karşılıklılık · 404 · sitemap↔sayfa | ✅ PASS | Sitemap 67 URL = build'de 67/67 dosya. EN-ailesi 49/49 sayfada sayfa-düzeyi `<link hrefLang>` seti = sitemap seti (birebir). Karşılıklılık ihlali **0**. 404-hreflang hedefi **0**. Canonical = kendi URL (49/49). |
| 7 | Kelime / meta eşikleri | ❌ FAIL | Ürünler ≥1200: **20/20 ✅**. Hizmetler (en global) ≥800: **5/5 ✅** (949–1033). Industry ≥1000: **5/5 ✅** (1413–1563). **Varyant ana sayfa/sourcing ≥800: 0/10 ❌** (ana: ru 220, fr 247, nl 200, es 241, ar 205; sourcing: ru 226, fr 268, nl 217, es 264, ar 217). **Meta title ≤60: 1 ❌** (`out/en.html` = 67). **Meta desc 120–158: 4 ❌** (`out/en.html` 108 · `out/en/nl.html` 102 · `out/en/ar/services/sourcing.html` 116 · `out/en/nl/services/sourcing.html` 116). |
| 8 | Hardcoded hex = 0 (`app/(en)`, `lib/ui`) | ✅ PASS | `grep -E '#[0-9A-Fa-f]{3,6}\b'` → **0 satır** (`lib/ui/tokens.ts` tanım dosyası hariç, beklenen). |
| 9 | Scope ihlali = 0 | ❌ FAIL (kayıt eksik) | Aşağıdaki "Scope bulguları" bölümü. |
| 10 | Build + lint | ✅ PASS | `pnpm build` EXIT=0, 82/82 sayfa. `pnpm lint` EXIT=0. |

**Notlar (test değil, devir kaydı):**
- **2.6 görsel:** "Gemini'ye ertelendi" (kullanıcı kararı, FAZ 2 ön koşulundan muaf).
- **Lighthouse ≥ 90:** "canlı URL / 8.1'e devredildi" (yerelde ölçülmedi).

## FAIL'lerin ayrıntısı

### 7 — Eşik ihlalleri (içerik / meta; QA düzeltmez)
1. **Varyant ana sayfa + sourcing (10 dosya, ≥800):** `content/en/{ru,fr,nl,es,ar}/home.md` ve `services/sourcing.md` 200–268 kelime. Bunlar 2.5'te **iskelet** olarak üretildi; içerik genişletme adımı tanımlı değil. Sahip: en-l10n (Sonnet kod / Haiku içerik) — karar gerekli: genişletme adımı açılsın mı, yoksa eşik iskelet varyantlar için mi gevşetilsin?
2. **Meta title (1):** `out/en.html` (`/en` hub) 67 karakter: `B2B Sourcing, Inspection & Manufacturing in Turkey | Bdimexport`. Sahip: fe (`app/(en)/en/page.tsx` metadata).
3. **Meta description (4):** `/en` 108, `/en/nl` 102, `/en/ar/services/sourcing` 116, `/en/nl/services/sourcing` 116 — hepsi 120 altında. Sahip: en-l10n / fe.

### 9 — Scope bulguları (2.5 kök layout bölünmesi ve varyant gruplama)
FAZ 2 commit'lerinde (2.5 rework `a691b02` ve ilgili) şu dosyalar **panelde tanımlı scope dışında** değişti:
- **Kök layout bölünmesi (kayıtlı istisna):** `app/layout.tsx` silindi (19 satır). Panel 2.5 satırı "KÖK LAYOUT PARÇALANDI (scope istisnası 👤 onaylı)" diyor. Onay kaydı bu turda sohbet dışından doğrulanamadı.
- **Kayıt dışı komşu dosyalar:** `app/(tr)/layout.tsx` (+23/−4), `app/(tr)/page.tsx` (+2/−1), `app/(zh)/layout.tsx` (+7), `app/(de)/layout.tsx`, `app/admin/layout.tsx` (13 satır değişti — **admin scope**: `app/admin/**` yalnız admin ajanı). Bunlar kök layout bölünmesinin zorunlu sonucu olabilir ama panelde kaydı yok.
- **Varyant route-group taşıması:** `app/(en)/en/{ru,fr,nl,es,ar}/**` → `app/(en-ru)/en/ru/**`, `app/(en-fr)/…`, `app/(en-nl)/…`, `app/(en-es)/…`, `app/(en-ar)/…` (+ her grupta `layout.tsx`). URL'ler değişmedi (route group), ama panel 2.5 scope'u `app/(en)/en/{ru,fr,nl,es,ar}/**` olarak tanımlıyor; taşıma istisnada yazılı değil.

**Karar gerekli (insan):** (a) kök layout istisnasının onay kaydı panele yazılsın mı; (b) `(tr)`, `(zh)`, `(de)`, `admin` layout'larındaki değişikliklerin istisna kapsamına alınması; (c) varyant route-group taşımasının kabulü.

## 2.8b / 2.8a doğrulaması (bu turda)
- Sayfa-düzeyi hreflang: 49/49 EN sayfası sitemap ile birebir.
- Sitemap: 67 URL = 18 TR + 39 EN + 10 varyant. Dil-split (`sitemap-en.xml`) yok — tek dosya (kullanıcı kararı).

## Kapı kararı
**2.9: 8/10 PASS, 2 FAIL.** Kapı açılmadı. 2.10 (faz çıkışı) bu FAIL'lerin kapanmasını bekler:
1. Varyant içerik genişletme veya eşik kararı (7.1).
2. `/en` title ve dört description düzeltmesi (7.2–7.3).
3. Scope istisnalarının kaydı veya düzeltilmesi (9).

## Ölçüm yöntemi
- H1/H2/FAQ: `out/en/products/*.html` + `content/en/global/products/*.md`.
- Hreflang/canonical/sitemap: `out/sitemap.xml` ve `out/en**/*.html`; karşılıklılık ve 404 betiği.
- Kelime: md gövdesi, frontmatter hariç, token sayımı.
- Meta: `<title>` ve `<meta name="description">` uzunluğu, build HTML'i.
- Hex: `app/(en)` + `lib/ui` (tokens.ts hariç).
- Scope: `git log` FAZ 2 commit'lerinin dosya listesi (16 commit, 138 yol) ↔ panel scope tanımları.
