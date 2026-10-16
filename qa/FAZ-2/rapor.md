# FAZ_2 QA Turu Raporu (Step 2.9) — kapanış
**Tarih:** 2026-10-16 | **Denetleyen:** Claude Code (Haiku 5.5) | **Kaynak:** FAZ_2_AJAN_PANOSU.md §3 Step 2.9
**Ön koşul:** §2 1–8 (2.6 hariç) ✅ — karşılandı (2.1, 2.2, 2.3, 2.4, 2.5, 2.7, 2.8a, 2.8b).
**Ölçüm kaynağı:** `pnpm build` (EXIT=0, **82/82** sayfa) + `pnpm lint` (EXIT=0) + `out/` HTML + `out/sitemap.xml` + `content/en/**` md + `app/(en)`, `lib/ui` kaynağı.

## Sonuç: 10 / 10 — 8 PASS, 2 kapanış kaydı (çözüldü / belgeli muafiyet)

| # | Test | Sonuç | Kanıt |
| :-- | :-- | :-- | :-- |
| 1 | H1 kalıbı — 20 ürün sayfası | ✅ PASS 20/20 | md H1 = `{Product} Manufacturers in Turkey \| B2B Sourcing` (regex 20/20); `out/en/products/*.html` `<h1>` md H1 ile birebir. |
| 2 | Partner bloğu placeholder + consent | ✅ PASS | 20/20 ürün sayfasında "Verified Turkish Partners" bölümü, metin: "Approved partners are being onboarded…" (placeholder). `<img>` 0. Partner adı yok (`_partners.json` yok → `loadPartners()` boş). Consent: `app/(en)/en/products/_lib/catalog.ts:102`. |
| 3 | RTL DOM — `/en/ar` | ✅ PASS | `out/en/ar.html`: `<html lang="ar" dir="rtl">`; `<bdi dir="ltr">` ≥1. |
| 4 | Kanal CTA matrisi | ✅ PASS | ru: Telegram · ar: WhatsApp · fr: "Vos canaux" (vous) · nl: e-posta, "direct" · es: "Envíen / reciban" (ustedes çekimi). Kaynak: `lib/ui/variants.ts`. |
| 5 | Batch kalıp tutarlılığı | ✅ PASS | 20/20 ürün sayfasında H2 = 8 (tek kalıp); FAQ ≥5 her sayfada. |
| 6 | hreflang: karşılıklılık · 404 · sitemap↔sayfa | ✅ PASS | Sitemap 67 URL = build'de 67/67 dosya. EN ailesi 49/49 sayfada sayfa-düzeyi `<link hrefLang>` seti = sitemap seti. Karşılıklılık ihlali **0**. 404-hreflang **0**. Canonical = kendi URL (49/49). |
| 7 | Kelime / meta eşikleri | ✅ PASS (kapanış) | Ürün ≥1200 **20/20**; hizmet ≥800 **5/5** (949–1033); industry ≥1000 **5/5** (1413–1563). **Meta title ≤60 49/49** ve **desc 120–158 49/49** (Sonnet düzeltmesi `a98e549`; önceki 1+4 ihlal kapandı). Varyant ana/sourcing ≥800 → **muaf (belgeli)** — aşağıda. |
| 8 | Hardcoded hex = 0 (`app/(en)`, `lib/ui`) | ✅ PASS | `grep -E '#[0-9A-Fa-f]{3,6}\b'` → **0 satır** (`lib/ui/tokens.ts` tanım dosyası hariç). |
| 9 | Scope ihlali = 0 | ✅ PASS (belgeli istisna) | Aşağıda "Scope istisnaları" — gerekçe, dosyalar, onay ve kalıcı kayıt. |
| 10 | Build + lint | ✅ PASS | `pnpm build` EXIT=0, 82/82 sayfa. `pnpm lint` EXIT=0. |

**Devir kaydı (test değil):**
- **2.6 görsel:** "Gemini'ye ertelendi" (kullanıcı kararı).
- **Lighthouse ≥ 90:** "canlı URL / 8.1'e devredildi" (yerelde ölçülmedi).

## Muafiyetler (kalıcı kayıt)

### M1 — Varyant içerik eşiği (test 7): MUAF (FAZ 2)
- **Kapsam:** `content/en/{ru,fr,nl,es,ar}/home.md` ve `services/sourcing.md` (10 dosya, 200–268 kelime).
- **Neden:** 2.5 varyant **iskelet** olarak tanımlı (FAZ_2.md 2.5). Tam içerik **FAZ 5** adımlarında üretilecek.
- **Kayıt:** kullanıcı kararı (2026-10-16). Genişletme bu adımda yapılmadı.
- **Kapsam dışı bırakılan eşik:** varyant ana/sourcing ≥800. Diğer tüm eşikler (ürün, hizmet, industry, meta) geçerli kalır.

### M2 — Scope istisnaları (test 9): BELGELİ İSTİSNA
Kullanıcı kararı (2026-10-16): gerekçeli, zararsız, onaylı. Dosyalar:

| Dosya | Değişiklik | Neden | Onay / kanıt |
| :-- | :-- | :-- | :-- |
| `app/layout.tsx` | silindi (19 satır) | Tek kök layout `<html lang="tr">` basıyordu; `<html>` yalnız kök layout'tan değiştirilebiliyor. Varyantların kendi `lang`'ı için zorunlu. | Commit `a691b02` mesajı: "SCOPE İSTİSNASI (👤 onaylı)". |
| `app/(tr)/layout.tsx` | yeni kök layout (lang=tr + eski kök metadata) | Kök layout bölünmesinin sonucu. TR çıktısı aynı (27 sayfa title/desc/canonical korundu). | `a691b02` + kullanıcı onayı. |
| `app/(tr)/page.tsx` | başlık absolute yapıldı | Yeni kök layout'ta şablon yok; çıktı aynı. | `a691b02`. |
| `app/(zh)/layout.tsx` | kök layout (lang=zh-CN) | Aynı bölünme. | `a691b02`. |
| `app/(de)/layout.tsx` | kök layout (lang=de) | Aynı bölünme. | `a691b02`. |
| `app/(en)/layout.tsx` | kök layout (lang=en) | Aynı bölünme. | `a691b02`. |
| `app/admin/layout.tsx` | kök layout (lang=tr), `<html>`/`<body>` sarmalayıcı | Admin scope'u; **güvenlik mantığı DEĞİŞMEDİ**: `AdminShell` aynen render ediliyor, `robots: noindex, nofollow` ve `nocache` korunuyor. Değişen yalnızca metadata (`metadataBase`, marka başlığı) ve `<html>` sarmalayıcısı. Doğrulama: `git show a691b02 -- app/admin/layout.tsx`. | Kullanıcı doğruladı + bu rapor diff'i inceledi. |
| `app/(en-ru)`, `(en-fr)`, `(en-nl)`, `(en-es)`, `(en-ar)` | `app/(en)/en/{v}/**` → route-group taşıması (`git mv`, R100) | Her varyant kendi kök layout'una (lang/dir) sahip olsun diye. **URL'ler AYNI** (route group URL'yi etkilemez). | `a691b02` ("git mv … R100, geçmiş korunur"). |

**Not:** Panelin 2.5 satırı yalnız "kök layout" istisnasını yazıyordu; bu rapor komşu dosyalar ve route-group taşımasını da kalıcı olarak kaydeder.

## Kapanan FAIL'ler (kanıt)
- **Meta title ≤60:** `out/en.html` 67 → kapandı; 49/49 ≤60.
- **Meta desc 120–158:** `/en` 108, `/en/nl` 102, `/en/ar/services/sourcing` 116, `/en/nl/services/sourcing` 116 → kapandı; 49/49 aralıkta. Düzeltme: `a98e549` (Sonnet).

## Kapı kararı
**2.9: 10/10 — kapandı.** 2.9 ✅. Sonraki adım 2.10 çıkış kontrol listesi (insan onayı).

## 2.8a / 2.8b doğrulaması (bu turda)
- Sayfa-düzeyi hreflang: 49/49 EN sayfası sitemap ile birebir.
- Sitemap: 67 URL = 18 TR + 39 EN + 10 varyant. Dil-split (`sitemap-en.xml`) yok — tek dosya (kullanıcı kararı).

## Ölçüm yöntemi
- H1/H2/FAQ: `out/en/products/*.html` + `content/en/global/products/*.md`.
- Hreflang/canonical/sitemap: `out/sitemap.xml` ve `out/en**/*.html`; karşılıklılık ve 404 betiği.
- Kelime: md gövdesi, frontmatter hariç, token sayımı.
- Meta: `<title>` ve `<meta name="description">` uzunluğu, build HTML'i (49 EN sayfası).
- Hex: `app/(en)` + `lib/ui` (tokens.ts hariç).
- Scope: `git log` FAZ 2 commit'lerinin dosya listesi ↔ panel scope tanımları + M2 istisna tablosu.
