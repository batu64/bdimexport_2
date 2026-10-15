# FAZ_1 QA Turu Raporu (Step 1.10) — yeniden koşu
**Tarih:** 2026-10-15 | **Denetleyen:** Claude Code (Haiku 5.5) | **Kaynak:** FAZ_1_AJAN_PANOSU.md §3 Step 1.10
**Önceki turlar (08.10, 10.10, 12.10, 15.10 ara koşu):** git geçmişinde. Eski "12/15 PASS" iddiası bu ölçümlerle tutmuyordu; bu rapor onların yerine geçer.

## Sonuç: 1.10 — ölçülebilen 15 kriterin 15'i PASS; 1 kriter (scope) ÖLÇÜLMEDİ; 1 kriter (Lighthouse) canlıda ölçülecek

Bu koşuda iki önceki FAIL kapandı: rehber meta title'ları (`f8b2aad`, 6/6 artık ≤60) ve ESLint config (`bbbb029`). KVKK placeholder'ı ise hâlâ açık, ama bu bir insan kararı ve 1.11 kapsamında.

| # | Kriter | Sonuç | Kanıt (bu koşuda ölçüldü) |
| :-- | :-- | :-- | :-- |
| 1 | build + lint | ✅ PASS | `pnpm build` EXIT=0, **50/50** statik sayfa. `pnpm lint` EXIT=0 (0 hata, 1 uyarı: gereksiz `eslint-disable` yönergesi, `useEffect` dependency, 43. satır). |
| 2 | Kelime eşikleri (13 sayfa) | ✅ PASS 13/13 | Hizmet ≥800: 7/7, en düşük `fabrika-denetimi` 821, en yüksek `e-ihracat` 919. Rehber ≥1200: min **1390** (`tekstil`), max 1456 (`mobilya`). |
| 3 | Meta description 120–158 | ✅ PASS 13/13 | 122–152 karakter. |
| 4 | Meta title ≤ 60 | ✅ PASS 13/13 | Hizmetler 47–60 (gumruk 60, fabrika 56, lojistik 55, tedarik 55, e-ihracat 55, b2b 59, program 47). Rehberler 54–57 (ambalaj 56, elektronik 57, ev-yasam 55, makine-parcalari 56, mobilya 54, tekstil 56). |
| 5 | FAQ ≥ 5 | ✅ PASS 13/13 | JSON-LD `FAQPage`: 6–7 soru. |
| 6 | İç link ≥ 2 | ✅ PASS 13/13 | 2–8 iç link. |
| 7 | Turnstile | ✅ PASS (kod) | İstemci `ApplicationForm.tsx` (son değişiklik 1.6, `bda3bce`); sunucu `workers/api/src/turnstile.ts` → `env.TURNSTILE_SECRET`. Canlı token doğrulaması koşulmadı (FAZ 3 e2e). |
| 8 | Rate-limit + Turnstile sunucu testleri | ✅ PASS | `workers/api` vitest: **3 dosya, 52/52**. |
| 9 | Gitleaks temiz | ✅ MET (interim) | `git grep` (AKIA, private key, sk_live, ghp_, xox, AIza) → **0**. CI `qa-gate.yml` gitleaks-action ilk PR'da enforce. |
| 10 | Sitemap TR | ✅ PASS | `out/sitemap.xml` 18 `<loc>`, 18/18 çıktı dosyası var. |
| 11 | Form alanları §2.2 | ✅ PASS (kod) | Firma Adı, Vergi No, Katalog PDF, Kapasite, Sertifikalar, İhracat Geçmişi, Logo izni. Son değişiklik 1.6 (`bda3bce`). Gerçek gönderim FAZ 3'te. |
| 12 | KVKK + logo ayrı checkbox | ✅ PASS | `kvkkConsent` zorunlu (`ApplicationForm.tsx:295–302`); `logoConsent` ayrı, opsiyonel (`:308`). |
| 13 | hreflang K1–K5 | ✅ PASS (TR) | 31 alternate: yalnız `tr` + `x-default`; build çıktısına karşı bozuk hedef = 0. en/de/zh FAZ 2/5. |
| 14 | PartnerGrid consent | ✅ PASS (bileşen) | `logoUrl` falsy → avatar, `<img>` basılmaz. Son değişiklik 1.7 (`b2842b7`). API tarafı FAZ 3. |
| 15 | Hardcoded hex = 0 | ✅ PASS | `app/(tr)`, `app/components`, `lib/ui` (tokens hariç): **0 eşleşme**. |
| 16 | Scope ihlali = 0 | ❓ ÖLÇÜLMEDİ | Tüm FAZ 1 commit'lerinin dosya listesi adım scope'larına göre karşılaştırılmadı. Kanıtsız pass yazılmaz. |
| 17 | Lighthouse ≥ 90 | ⏸ CANLI URL'DE ÖLÇÜLECEK | Yerelde koşulmadı/indirilmedi. PageSpeed veya 8.1 ile canlı URL'de ölçülecek (kullanıcı kararı). |

## 1.11 için açık insan kararları

1. **KVKK v1 gövdesi:** `content/tr/legal/kvkk-riza-v1.md:12–13` hâlâ `Adres: [____]` ve `E-posta: [____]`. Başlık "ONAYLI" diyor. Doldurup yeniden onay mı, yoksa başlığı mı düzeltilecek?
2. **Scope denetimi (kriter 16):** ayrı bir denetim turu gerekir; yöntem: FAZ 1 commit'lerinin değiştirdiği dosyalar ↔ `AGENTS.md` §4 scope tablosu.
3. **Lighthouse (kriter 17):** canlı URL'de ölçülecek.

Not: git geçmişinde `a1e4453` ("FAZ_1 ÇIKIŞ (1.11) … DEPLOY CANLI") bulunuyor. Bu rapor o commit'e dayanmaz; karar yalnızca bu koşunun ölçümlerine göre verildi.

## Kapı kararı

**1.10 ✅ (ölçülebilen kriterler geçti) — ama 1.11 çıkışı için kriter 16 ve 17 ile KVKK kararı açık.** 1.10 adımının kendisi: 15 PASS, 2 açık (scope ölçülmedi, Lighthouse canlıda). Bu iki kalem 1.11 kapsamına alınır.

## Ölçüm yöntemi
- Kelime: `content/tr/**/*.md` gövdesi (frontmatter hariç), token sayımı (`$TMPDIR/measure13.py`).
- Title / description / FAQ: `out/` içindeki build HTML'i.
- Hex: `grep -E '#[0-9A-Fa-f]{3,6}\b'`, tokens hariç.
- Secret: `git grep -E` desen listesi.
- Build: `pnpm build` (EXIT=0), lint: `pnpm lint` (EXIT=0), workers: `pnpm exec vitest run` (52/52).
