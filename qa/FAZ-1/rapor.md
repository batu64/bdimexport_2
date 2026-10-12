# FAZ_1 QA Turu Raporu (Step 1.10) — yeniden doğrulama
**Tarih:** 2026-10-12 | **Denetleyen:** Claude Code (Haiku 5.5) | **Kaynak:** FAZ_1_AJAN_PANOSU.md §3 Step 1.10
**Önceki sürüm (08.10 / 10.10):** git geçmişinde; bu rapor onun yerine geçer. Eski "12/15 PASS" ve "13/13 kelime" iddiaları bu turda yeniden ölçüldü ve **tutmadı** (aşağıda).

## Sonuç: 1.10 KAPI KAPALI — 16 kriterden 12'si PASS (bunların 2'si interim/kod düzeyi), 3'ü FAIL, 1'i ÖLÇÜLMEDİ

| # | Kriter | Sonuç | Kanıt |
| :-- | :-- | :-- | :-- |
| 1 | build + lint | ❌ **FAIL** (lint) | `pnpm build` EXIT=0, **50/50** statik sayfa. `lint` script var (`package.json` → `next lint`) ama **eslint config yok** (`.eslintrc*` / `eslint.config.*` bulunamadı) → lint koşmuyor. |
| 2 | Kelime eşikleri (13 sayfa) | ❌ **FAIL** — 9/13 | Ölçüm: `content/tr/**/*.md` gövdesi (frontmatter hariç) kelime sayımı. Hizmet ≥800, rehber ≥1200 (SEO_PLAYBOOK §7). Hizmet (≥800): `fabrika-denetimi` 823 ✅, `e-ihracat` 919 ✅ · FAIL: `gumruk` 762, `lojistik` 739, `tedarik` 774, `b2b-pazarlama` 785, `program-tanitim` 790. Rehber (≥1200): `ambalaj` 1220 ✅, `mobilya` 1209 ✅ · FAIL: `elektronik` 1146, `ev-yasam` 1197, `makine-parcalari` 1141, `tekstil` 1159. **Toplam FAIL: 9** (gumruk, lojistik, tedarik, b2b, program, elektronik, ev-yasam, makine-parcalari, tekstil). |
| 3 | Meta description 120–158 | ✅ PASS 13/13 | Build HTML `<meta name="description">`: 122–152 karakter. |
| 4 | Meta title ≤ 60 (SEO_PLAYBOOK §3) | ❌ **FAIL** — 9/13 | Build HTML `<title>`: `fabrika-denetimi` 71, `lojistik` 69, `ev-yasam` 68, `tedarik` 61, `ambalaj` 63, `elektronik` 64, `makine-parcalari` 63, `mobilya` 64, `tekstil` 64. ✅: `gumruk` 60, `b2b` 59, `e-ihracat` 55, `program` 47. Ek kriter; eski raporda yoktu. |
| 5 | FAQ ≥ 5 | ✅ PASS 13/13 | Build HTML'de JSON-LD `FAQPage` içinde 6–7 `Question`; md'de 6–13 soru başlığı. |
| 6 | İç link ≥ 2 | ✅ PASS 13/13 | md gövdesinde iç link: 2–8 (`fabrika`=2, `lojistik`=2 en düşük). |
| 7 | Turnstile | ✅ PASS (kod) | İstemci: `app/components/ApplicationForm.tsx` (explicit render, action). Sunucu: `workers/api/src/turnstile.ts` → `env.TURNSTILE_SECRET` (env binding). Repo'da gerçek secret yok; tek `1x000…AA` değeri Cloudflare'in yayımlanmış test sitekey'i (`app/admin/settings/settings.test.mjs:50`). **Gerçek doğrulama (canlı token) koşulmadı.** |
| 8 | Rate-limit + Turnstile sunucu testleri | ✅ PASS | `workers/api`: `vitest run` → **3 dosya, 52/52 test geçti** (bu turda koşuldu). |
| 9 | Gitleaks temiz | ✅ MET (interim) | Kullanıcı kararı (0.10 ile aynı): `git grep` tüm takipli dosyalarda 0 eşleşme; CI `qa-gate.yml` gitleaks-action ilk PR'da enforce. |
| 10 | Sitemap TR | ✅ PASS | `out/sitemap.xml` 18 `<loc>`; 18/18 çıktı dosyası mevcut (1.9 doğrulaması). Not: eski raporun "13 URL" iddiası eskidi. |
| 11 | Form alanları §2.2 | ✅ PASS (kod) | `ApplicationForm.tsx`: Firma Adı (`firmaAdi`), Vergi No (`vergiNo`), Ürün Kataloğu PDF (`katalog`), Kapasite (`kapasite`), Sertifikalar (checkbox listesi, `sertifikalar`), İhracat Geçmişi (`gecmis`), Logo izni (`logoConsent`). Ek: sektör + iletişim. **Gerçek gönderim (e2e) FAZ 3'te** — FAZ 1 UI+sunucu-sözleşme kabulü. |
| 12 | KVKK + logo ayrı checkbox | ✅ PASS | `kvkkConsent` zorunlu (satır 295–302, `aria-required`), `logoConsent` opsiyonel ve ayrı (satır 308). |
| 13 | hreflang K1–K5 | ✅ PASS (TR) | 31 sayfada `<link rel="alternate" hrefLang>`: yalnız `tr` ve `x-default`; tüm hedefler build çıktısında var (**404 hreflang = 0**). K1 (karşılıklılık) TR tek dil ailesinde kendi-kendine; en/de/zh karşılıkları FAZ 2/5'te (bilinçli, 404-yasağı). K4/K5 helper yorumu + süreç kuralı. |
| 14 | PartnerGrid consent | ✅ PASS (bileşen) | `logoUrl` falsy → baş-harf avatarı, `<img>` basılmaz (1.7). API tarafı (`consent_logo_en=false` → `logoUrl` dönmez) FAZ 3'te doğrulanacak. |
| 15 | Hardcoded hex = 0 (1.5/1.6/1.7) | ✅ PASS | `grep` `app/(tr)`, `app/components`, `lib/ui` (tokens hariç): **0 eşleşme**. |
| 16 | Scope ihlali = 0 | ❌ **ÖLÇÜLMEDİ** | Bu turda tüm FAZ 1 commit'lerinin dosya listesi karşılaştırılmadı. Kanıtsız pass yasak. |

**Ek (kriter dışı ama 1.11'i etkileyen):**
- **KVKK v1 metni:** başlık "✅ ONAYLI (08.10.2026, kullanıcı)" diyor, ancak gövdede hâlâ `Adres: [____]` ve `E-posta: [____]` (`content/tr/legal/kvkk-riza-v1.md:12–13`). Onay kaydı ile metnin tamamlanmış hali çelişiyor → **insan kararı**.
- **Lighthouse ≥ 90:** ölçülmedi (1.11 kriteri). Bu turda koşulmadı.
- **Canlı başvuru alınabilirliği:** Worker deploy + Pages env (`NEXT_PUBLIC_API_BASE`, `NEXT_PUBLIC_TURNSTILE_SITE_KEY`) + production `ALLOWED_ORIGINS`/`TURNSTILE_HOSTNAMES` (3.9) → yok. Uçtan uca gönderim bu turda test edilmedi.

## Kapı kararı

**1.10 FAIL → 1.11 "devam et" verilemez.** Gerekçe, kanıtlı FAIL'ler:
1. Kelime eşikleri 13 sayfadan 9'unda karşılanmıyor (2).
2. Meta title ≤60 9/13'te aşılıyor (4).
3. Lint koşmuyor (config yok) (1).
4. Lighthouse ölçülmedi (1.11).
5. Scope ihlali kontrolü yapılmadı (16).
6. KVKK v1 gövdesinde placeholder var (ek).

Eski raporun "12/15 PASS, fail değil, pending" ifadesi bu ölçümlerle tutarlı değil; kelime iddiası (13/13, min 813) mevcut md ile **eşleşmiyor**.

## İnsan kararı gerekenler
1. **Kelime + title:** 9 hizmet/rehber sayfası içerik genişletme ister (scope `tr-import` / `tr-export` — bu adımın dışı). Genişletilsin mi, yoksa eşik hizmet sayfaları için mi gevşetilsin (SEO_PLAYBOOK değişikliği orchestrator)?
2. **KVKK v1:** `[____]` alanları doldurulsun mu (adres/e-posta) — onay yeniden mi gerekiyor?
3. **Lint:** eslint config eklensin mi (`next lint` interaktif takılıyor)?
4. **Lighthouse:** ölçüm koşulsun mu?

## Retry geçmişi
Eski sürümde: "3 retry turu → tüm testler geçti" yazılmıştı. Bu tur, aynı eşikler yeniden ölçüldüğünde FAIL çıktı; retry kayıtları bu raporda sayılmaz.
