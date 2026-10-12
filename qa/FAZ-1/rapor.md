# FAZ_1 QA Turu Raporu (Step 1.10) — yeniden doğrulama
**Tarih:** 2026-10-12 | **Denetleyen:** Claude Code (Haiku 5.5) | **Kaynak:** FAZ_1_AJAN_PANOSU.md §3 Step 1.10
**Önceki sürüm (08.10 / 10.10):** git geçmişinde; bu rapor onun yerine geçer. Eski "12/15 PASS" ve "13/13 kelime" iddiaları bu turda yeniden ölçüldü ve **tutmadı**.

## Sonuç: 1.10 ⛔ KAPI KAPALI — içerik retry + ESLint config bekliyor

Bu turda eşikler **gevşetilmedi**. Eşik-altı sayfalar içerik adımlarına devredildi; retry sonrası 1.10 yeniden koşulacak.

| # | Kriter | Sonuç | Kanıt / not |
| :-- | :-- | :-- | :-- |
| 1 | build + lint | ❌ FAIL (lint) | `pnpm build` EXIT=0, **50/50** statik sayfa. `lint` script'i var (`next lint`) ama eslint config yok. **ESLint config eklemesi QA scope'unda değil — Sonnet ekleyecek.** |
| 2 | Kelime eşikleri (13 sayfa) | ❌ FAIL — 9/13 | Aşağıda tam liste. Hizmet ≥800, rehber ≥1200 (SEO_PLAYBOOK §7). |
| 3 | Meta description 120–158 | ✅ PASS 13/13 | Build HTML: 122–152 karakter. |
| 4 | Meta title ≤ 60 (SEO_PLAYBOOK §3) | ❌ FAIL — 9/13 | Aşağıda tam liste. |
| 5 | FAQ ≥ 5 | ✅ PASS 13/13 | JSON-LD `FAQPage`: 6–7 `Question`. |
| 6 | İç link ≥ 2 | ✅ PASS 13/13 | md gövdesi: 2–8 iç link. |
| 7 | Turnstile | ✅ PASS (kod) | İstemci `ApplicationForm.tsx`; sunucu `workers/api/src/turnstile.ts` → `env.TURNSTILE_SECRET`. Gerçek token doğrulaması koşulmadı. |
| 8 | Rate-limit + Turnstile sunucu testleri | ✅ PASS | `workers/api` vitest: **3 dosya, 52/52** (bu turda koşuldu). |
| 9 | Gitleaks temiz | ✅ MET (interim) | Kullanıcı kararı: `git grep` 0 eşleşme; CI `qa-gate.yml` ilk PR'da enforce. |
| 10 | Sitemap TR | ✅ PASS | `out/sitemap.xml` 18 `<loc>`, 18/18 çıktı dosyası var. |
| 11 | Form alanları §2.2 | ✅ PASS (kod) | Firma Adı, Vergi No, Katalog PDF, Kapasite, Sertifikalar, İhracat Geçmişi, Logo izni. Gerçek gönderim FAZ 3'te. |
| 12 | KVKK + logo ayrı checkbox | ✅ PASS | `kvkkConsent` zorunlu (`ApplicationForm.tsx:295–302`); `logoConsent` ayrı, opsiyonel (`:308`). |
| 13 | hreflang K1–K5 | ✅ PASS (TR) | 31 alternate: yalnız `tr` + `x-default`; 404 hedef = 0. en/de/zh FAZ 2/5. |
| 14 | PartnerGrid consent | ✅ PASS (bileşen) | `logoUrl` falsy → avatar, `<img>` basılmaz. API tarafı FAZ 3. |
| 15 | Hardcoded hex = 0 | ✅ PASS | `app/(tr)`, `app/components`, `lib/ui` (tokens hariç): 0 eşleşme. |
| 16 | Scope ihlali = 0 | ❓ ÖLÇÜLMEDİ | FAZ 1 commit dosya listeleri bu turda karşılaştırılmadı. |
| 17 | Lighthouse ≥ 90 | ⏸ CANLI URL'DE ÖLÇÜLECEK | Yerelde koşulmuyor/indirilmiyor. PageSpeed veya 8.1 (smoke/lansman denetimi) ile canlı URL üzerinden ölçülecek. |

## Eşik-altı sayfalar (içerik adımlarına devredildi)

### A. Kelime eşiği altı — 9 sayfa

Ölçüm: `content/tr/**/*.md` gövdesi, frontmatter hariç, token sayımı. Eşik: hizmet 800 (1.2/1.3), rehber 1200 (1.4).

| # | Dosya | Sınıf | Gövde kelime | Eşik | Eksik | Meta title (karakter) | Retry adımı |
| :-- | :-- | :-- | --: | --: | --: | --: | :-- |
| 1 | `content/tr/ithalat/gumruk.md` | hizmet | 762 | 800 | 38 | 60 ✅ | Haiku 1.2 |
| 2 | `content/tr/ithalat/lojistik.md` | hizmet | 739 | 800 | 61 | 69 ❌ | Haiku 1.2 |
| 3 | `content/tr/ithalat/tedarik.md` | hizmet | 774 | 800 | 26 | 61 ❌ | Haiku 1.2 |
| 4 | `content/tr/ihracat/b2b-pazarlama.md` | hizmet | 785 | 800 | 15 | 59 ✅ | Haiku 1.3 |
| 5 | `content/tr/ihracat/program-tanitim.md` | hizmet | 790 | 800 | 10 | 47 ✅ | Haiku 1.3 |
| 6 | `content/tr/ithalat/rehberler/elektronik.md` | rehber | 1146 | 1200 | 54 | 64 ❌ | Sonnet 1.4 |
| 7 | `content/tr/ithalat/rehberler/ev-yasam.md` | rehber | 1197 | 1200 | 3 | 68 ❌ | Sonnet 1.4 |
| 8 | `content/tr/ithalat/rehberler/makine-parcalari.md` | rehber | 1141 | 1200 | 59 | 63 ❌ | Sonnet 1.4 |
| 9 | `content/tr/ithalat/rehberler/tekstil.md` | rehber | 1159 | 1200 | 41 | 64 ❌ | Sonnet 1.4 |

Geçen rehberler (eşik üstü): `ambalaj` 1220, `mobilya` 1209. Geçen hizmetler: `fabrika-denetimi` 823, `e-ihracat` 919.

### B. Meta title > 60 — kelime eşiğini geçen 3 sayfa

Bunlar kelime eşiğinde değil, yalnızca title uzunluğunda takılıyor (SEO_PLAYBOOK §3). Aynı retry turunda düzeltilmeli.

| Dosya | Gövde kelime | Meta title | Retry adımı |
| :-- | --: | --: | :-- |
| `content/tr/ithalat/fabrika-denetimi.md` | 823 ✅ | 71 ❌ | Haiku 1.2 |
| `content/tr/ithalat/rehberler/ambalaj.md` | 1220 ✅ | 63 ❌ | Sonnet 1.4 |
| `content/tr/ithalat/rehberler/mobilya.md` | 1209 ✅ | 64 ❌ | Sonnet 1.4 |

Toplam title FAIL: 9 sayfa = A tablosundaki 6 + B tablosundaki 3 (yukarıdaki 9 title hatası: lojistik, tedarik, elektronik, ev-yasam, makine-parcalari, tekstil, fabrika-denetimi, ambalaj, mobilya).

## Kapı kararı

**1.10 ⛔ — 1.11'e geçilmez.** Açık bağımlılıklar:
1. **İçerik retry (Haiku 1.2 / 1.3 / Sonnet 1.4):** A ve B tablolarındaki sayfalar. Kelime + title birlikte.
2. **ESLint config:** Sonnet eklemesi. Sonra `pnpm lint` yeşil olmalı.
3. **Lighthouse:** canlı URL'de PageSpeed / 8.1 ile ölçülecek (1.10'un yerel kriteri değil).
4. **Scope ihlali kontrolü:** 1.10 yeniden koşumunda yapılacak.
5. **KVKK v1 gövdesi:** `content/tr/legal/kvkk-riza-v1.md:12–13` `[____]` placeholder (başlık "ONAYLI" ile çelişiyor) → insan kararı.

Retry + eslint bittikten sonra 1.10 bu rapor baştan koşulacak.

## Retry sonucu — 1.2 / 1.3 (2026-10-12)

Hizmet sayfalarında hedef: gövde ≥850 kelime, meta title ≤60. Ölçüm yöntemi aynı (md gövdesi token sayımı, build'de `<title>`).

| Dosya | Kelime (önce → sonra) | Title (önce → sonra) | Durum |
| :-- | :-- | :-- | :-- |
| `ithalat/gumruk.md` | 762 → **865** | 60 → 60 | ✅ |
| `ithalat/lojistik.md` | 739 → **862** | 69 → **55** | ✅ |
| `ithalat/tedarik.md` | 774 → **864** | 61 → **55** | ✅ |
| `ihracat/b2b-pazarlama.md` | 785 → **862** | 59 → 59 | ✅ |
| `ihracat/program-tanitim.md` | 790 → **873** | 47 → 47 | ✅ |
| `ithalat/fabrika-denetimi.md` | 821 → 821 | 71 → **56** | ✅ (title) |

Eklenen bölümler yeni rakam/iddia içermez; mevcut sayfanın konusuna bağlı süreç açıklamasıdır. Kalan açık eşik işleri: **rehberler** (Sonnet 1.4: elektronik 1146, ev-yasam 1197, makine-parcalari 1141, tekstil 1159 kelime; ambalaj 1220 / mobilya 1209 geçiyor) ve rehber title'ları (ambalaj 63, elektronik 64, ev-yasam 68, makine-parcalari 63, mobilya 64, tekstil 64). **1.10 hâlâ ⛔; ESLint config (Sonnet) ve rehber retry'ı bitince yeniden koşulacak.**

## Önceki iddialar hakkında
Eski rapordaki "12/15 PASS, 13/13 kelime (min 813), 3 retry turu → tüm testler geçti" ifadeleri bu ölçümle **tutmuyor**. Retry kayıtları bu raporda sayılmaz.
