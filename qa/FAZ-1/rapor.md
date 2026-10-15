# FAZ_1 QA Turu Raporu (Step 1.10) — yeniden koşu
**Tarih:** 2026-10-15 | **Denetleyen:** Claude Code (Haiku 5.5) | **Kaynak:** FAZ_1_AJAN_PANOSU.md §3 Step 1.10
**Önceki turlar (08.10, 10.10, 12.10):** git geçmişinde. Eski "12/15 PASS" iddiası bu ölçümlerle tutmuyordu; bu rapor onların yerine geçer.

## Sonuç: 1.10 ⛔ KAPI KAPALI — rehber title'ları + KVKK placeholder + scope ölçümü

Önceki engellerden ikisi kapandı: ESLint config (`bbbb029`) ve rehber kelime retry'ı (`d624396`). Kalan FAIL'ler aşağıda.

| # | Kriter | Sonuç | Kanıt (bu koşuda ölçüldü) |
| :-- | :-- | :-- | :-- |
| 1 | build + lint | ✅ PASS | `pnpm build` EXIT=0, **50/50** statik sayfa. `pnpm lint` EXIT=0 (0 hata, 1 uyarı: gereksiz `eslint-disable` yönergesi, 43. satır). |
| 2 | Kelime eşikleri (13 sayfa) | ✅ PASS 13/13 | Hizmet ≥800: 7/7, en düşük `fabrika-denetimi` 821, en yüksek `e-ihracat` 919 (gumruk 865, lojistik 862, tedarik 864, b2b 862, program 873). Rehber ≥1200: min **1391** (tekstil), max 1457 (mobilya). |
| 3 | Meta description 120–158 | ✅ PASS 13/13 | 122–152 karakter. |
| 4 | Meta title ≤ 60 | ❌ **FAIL — 6/13** | Hizmetler: 7/7 ✅ (gumruk 60, b2b 59, e-ihracat 55, lojistik 55, tedarik 55, fabrika 56, program 47). **Rehberler: 6/6 ❌** — `ambalaj` 63, `elektronik` 64, `ev-yasam` 68, `makine-parcalari` 63, `mobilya` 64, `tekstil` 64. Retry adımı: **Sonnet 1.4 (title)**. |
| 5 | FAQ ≥ 5 | ✅ PASS 13/13 | JSON-LD `FAQPage`: 6–7 soru. |
| 6 | İç link ≥ 2 | ✅ PASS 13/13 | 2–8 iç link. |
| 7 | Turnstile | ✅ PASS (kod) | İstemci `ApplicationForm.tsx` (son değişiklik 1.6, `bda3bce`); sunucu `workers/api/src/turnstile.ts` → `env.TURNSTILE_SECRET`. Canlı token doğrulaması koşulmadı. |
| 8 | Rate-limit + Turnstile sunucu testleri | ✅ PASS | `workers/api` vitest: **3 dosya, 52/52** (bu koşuda). |
| 9 | Gitleaks temiz | ✅ MET (interim) | `git grep` (AKIA, private key, sk_live, ghp_, xox, AIza) → **0**. CI `qa-gate.yml` gitleaks-action ilk PR'da enforce. |
| 10 | Sitemap TR | ✅ PASS | `out/sitemap.xml` 18 `<loc>`, 18/18 çıktı dosyası var. |
| 11 | Form alanları §2.2 | ✅ PASS (kod) | Firma Adı, Vergi No, Katalog PDF, Kapasite, Sertifikalar, İhracat Geçmişi, Logo izni. Son değişiklik 1.6 (`bda3bce`). Gerçek gönderim FAZ 3'te. |
| 12 | KVKK + logo ayrı checkbox | ✅ PASS | `kvkkConsent` zorunlu (`ApplicationForm.tsx:295–302`); `logoConsent` ayrı, opsiyonel (`:308`). |
| 13 | hreflang K1–K5 | ✅ PASS (TR) | 31 alternate: yalnız `tr` + `x-default`; bozuk hedef = 0 (build çıktısına karşı kontrol). en/de/zh FAZ 2/5. |
| 14 | PartnerGrid consent | ✅ PASS (bileşen) | `logoUrl` falsy → avatar, `<img>` basılmaz. Son değişiklik 1.7 (`b2842b7`). API tarafı FAZ 3. |
| 15 | Hardcoded hex = 0 | ✅ PASS | `app/(tr)`, `app/components`, `lib/ui` (tokens hariç): **0 eşleşme**. |
| 16 | Scope ihlali = 0 | ❓ ÖLÇÜLMEDİ | Tüm FAZ 1 commit'lerinin dosya listesi adım scope'larına göre karşılaştırılmadı. Kanıtsız pass yazılmaz. |
| 17 | Lighthouse ≥ 90 | ⏸ CANLI URL'DE ÖLÇÜLECEK | Yerelde koşulmadı/indirilmedi. PageSpeed veya 8.1 ile canlı URL'de ölçülecek (kullanıcı kararı). |

## Kapıyı kapatan kalemler

1. **Rehber meta title'ları (6 sayfa, Sonnet 1.4):** yukarıdaki 6 dosya, title ≤60 olacak şekilde kısaltılmalı. Kelime tarafı tamam.
2. **KVKK v1 gövdesi:** `content/tr/legal/kvkk-riza-v1.md:12–13` hâlâ `Adres: [____]` ve `E-posta: [____]`. Başlık "ONAYLI" diyor — **insan kararı** (doldur + yeniden onay mı, yoksa başlığı mı düzelt).
3. **Scope ihlali (kriter 16):** ölçülmedi; ayrı bir denetim turu gerekir.
4. **Lighthouse (kriter 17):** canlı URL'de ölçülecek; yerel koşu yok.

Not: git geçmişinde `a1e4453` ("FAZ_1 ÇIKIŞ (1.11) … DEPLOY CANLI") bulunuyor. Bu rapor o commit'e dayanmaz; kapı kararı yalnızca bu koşunun ölçümlerine göre verildi.

## Kapı kararı

**1.10 ⛔.** 1.11'e geçilmez. Gerekli: (1) rehber title'ları, (2) KVKK placeholder kararı, (3) scope denetimi. Lighthouse canlı URL'de ayrıca ölçülür.

## Ölçüm yöntemi
- Kelime: `content/tr/**/*.md` gövdesi (frontmatter hariç), token sayımı.
- Title / description / FAQ: `out/` içindeki build HTML'i.
- Hex: `grep -E '#[0-9A-Fa-f]{3,6}\b'`, tokens hariç.
- Secret: `git grep -E` desen listesi.
- Build: `pnpm build` (EXIT=0), lint: `pnpm lint` (EXIT=0).
