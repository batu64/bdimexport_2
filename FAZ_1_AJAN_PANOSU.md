# FAZ 1 — Ajan Görev Panosu ve Koordinasyon
**Proje:** bdimexport.com | **Sürüm:** 1.0 | **Yürütücü:** Claude Code (Opus 5.5 / Sonnet 5.5 / Haiku 5.5)
**Hedef:** TR ana site + büyüme hunisi — /ithalat + /ihracat içerik, başvuru formu (flywheel 1. adımı), partner listeleme, Turnstile.
**Amaç:** Tüm ajanların ORTAK okuduğu tek pano. Sıra, her adımın talimatı, canlı durum ve ajanlar arası devir burada.

> Yetkili kaynaklar: `AGENTS.md` (§4 scope, §5 sıra, §7 model), `fazlar/FAZ_1.md` (adım detayı), `CONTENT_STYLE.md`, `SEO_PLAYBOOK.md`, `I18N_RULES.md`. Çelişki → AGENTS.md kazanır.
> Ön koşul: FAZ 0 kapandı (0.1–0.10 ✅). FAZ 1 işi feature dalında (`tasks/faz0-progress-panel` veya yeni `faz-1` dalı — §5), faz sonunda main'e squash-merge.

---

## 0. PROTOKOL — bu panoyu nasıl kullanırsın (HER AJAN OKUR)

- **"git bunu oku":** Bu dosyayı baştan sona oku. §2 Durum Tablosu'na bak. Kendi modelini ve sıradaki adımını belirle. Henüz uygulama yapma, hazır olduğunu bildir.
- **"talimatı uygula":** §2'de durumu ⏳/⚠️ olan, bağımlılıkları ✅ olan, sana ait **sıradaki** adımı al → §3'teki talimatı uygula.
- **Başlamadan önce (zorunlu):** Bağımlılık ✅ değilse **BAŞLAMA**; §4'e `BEKLEMEDE: <adım>, <bağımlılık> henüz ✅ değil` yaz, insana bildir.
- **Sırayı ASLA atlama:** Sıradaki adım seninki değilse veya bağımlılığı eksikse, kendi sonraki adımına geçme — bekle. Çakışan scope'a asla girme.
- **Çalışırken:** §2'de durumu 🔄 yap, "Son güncelleyen"e model + saat yaz.
- **Bitince (zorunlu):** §2 durumu ✅ + §4 günlüğüne kayıt (ne yaptın, dosyalar, kabul testi kanıtı, eksik/şüphe). Commit at (tek scope / tek commit). Düz "yaptım" yasak.
- **Commit öncesi:** `git status` + `git diff --cached` ile index'i kontrol et — başka adımın değişikliği karışmasın (FAZ 0'da yaşandı).
- **Sorun / çakışma / sıra bozulması:** durumu ⛔ yap, §4'e neden yaz, insana haber ver, **DEVAM ETME.**
- **İnsan bekleyen adım:** durumu ⏸ yap, §5'teki insan aksiyonunu hatırlat, onay gelmeden ilerleme.

**Semboller:** ⏳ todo · ⚠️ mevcut ama düzeltme gerek · 🔄 running · ✅ done · ⛔ blocked · ⏸ insan bekliyor · `✅*` mevcut (dokunulursa doğrula)

> ⚠️ **Bu tur = DOĞRULAMA/HİZALAMA + AÇIK İŞLER.** FAZ 1 içeriğinin çoğu önceki sistemden repoda MEVCUT ve commit'li. İki gerçek açık konu: (1) **`workers/api/` henüz commit'siz** (1.6/1.8 kodu diskte var, git'e girmemiş), (2) **FAZ 0'dan devredilen hardcoded hex temizliği** (1.5 TR sayfaları, 1.6 ApplicationForm, 1.7 PartnerGrid → design tokens'a çevrilecek). Ajan mevcut dosyayı okur, spec'e hizalar, hex'i temizler, commit'ler.

---

## 1. DEĞİŞMEZ KURALLAR (ortak)

1. **Tek scope / tek commit:** Yalnızca sana verilen scope'a yaz; başka rolün dizinine/adımına dokunma.
2. **Oku-hizala-ezme:** Mevcut dosyayı önce oku; varsa spec'e hizala / eksiği tamamla, iyi olanı ezme.
3. **Hardcoded yasak:** renk/hex/spacing koda gömülmez → `@/lib/ui/tokens` (veya design-tokens) + env. Bu fazın ana temizlik işi budur.
4. **Güvenlik kilidi:** Başvuru formu + endpoint (1.6) = **Opus 5.5 + insan review**, pazarlıksız. Sunucu-tarafı KVKK rıza zorunlu.
5. **Ortak dosya tekeli:** `app/sitemap.ts`, `lib/hreflang.*` → yalnızca 1.9 yazar.
6. **Veri doğruluğu:** GTİP/vergi/rakam yalnızca resmi kaynaktan (Ticaret Bakanlığı/TÜİK); uydurma = hard-red.
7. **Raporlama:** Bitince §2 + §4 güncellenir + commit.

---

## 2. DURUM TABLOSU (CANLI — her ajan kendi adımını günceller)

| Sıra | Adım | Model | Bağımlılık | Durum | Son güncelleyen |
| :-- | :-- | :-- | :-- | :-- | :-- |
| 1 | 1.1 KVKK rıza metni ⚖️ | **Opus 5.5** | — + 👤 | ✅ v1 onaylı (mevcut) | önceki + insan |
| 2 | 1.2 /ithalat hizmet (4) | **Haiku 5.5** | — | ✅ retry: gövde ≥850, title ≤60 (gumruk, lojistik, tedarik, fabrika-denetimi) | Haiku 5.5 · 2026-10-12 |
| 3 | 1.3 /ihracat hizmet (3) | **Haiku 5.5** | — | ✅ retry: gövde ≥850, title ≤60 (b2b-pazarlama, program-tanitim) | Haiku 5.5 · 2026-10-12 |
| 4 | 1.4 Çin ithalat rehber (6) | **Sonnet 5.5** | — | ✅ commit `d624396` (6/6 ≥1250 kelime) + `f8b2aad` (meta title ≤60); açık: CTA hedefi + kaynak linki, §4 | Sonnet 5.5 · 2026-10-15 |
| 5 | 1.5 TR frontend + sayfalar | **Sonnet 5.5** | 1.2–1.4 | ✅ commit `d881cad` (form sayfası 1.6'ya devredildi) | Sonnet 5.5 · 2026-10-12 |
| 6 | 1.6 Başvuru formu + endpoint 🔒 | **Opus 5.5** | 1.1 + 1.5 + 👤 | ✅ commit `bda3bce` — 👤 code review onaylı (2026-10-12) | Opus 5.5 · 2026-10-12 |
| 7 | 1.7 Partner listeleme komponenti | **Haiku 5.5** | 1.5 | ✅ hex=0 (tokens'a çevrildi), build yeşil | Haiku 5.5 · 2026-10-12 |
| 8 | 1.8 Turnstile + rate-limit | **Sonnet 5.5** | 1.6 | ✅ commit `04c737d` (kod 1.6'da `bda3bce`; 52/52 test) | Sonnet 5.5 · 2026-10-12 |
| 9 | 1.9 hreflang/sitemap enjeksiyonu | **Haiku 5.5** | 1.2–1.8 | ✅ doğrulandı (değişiklik yok): 18/18 sitemap URL çıktı dosyası var; 31 alternate hedefi 404 değil; TR = tr + x-default | Haiku 5.5 · 2026-10-12 |
| 10 | 1.10 QA turu | **Haiku 5.5** | 1–9 hepsi ✅ | ⛔ 2026-10-15 koşusu: build+lint ✅, kelime 13/13 ✅, meta title 6/13 ❌ (rehberler — Sonnet 1.4 title), KVKK `[____]` (insan), scope ölçülmedi, Lighthouse canlı URL. Tam liste: qa/FAZ-1/rapor.md | Haiku 5.5 · 2026-10-15 |
| 11 | 1.11 çıkış + lansman 🚦 | **Haiku 5.5** | 1.10 + 👤 | ⏸ 1.10 kapısı geçmeden başlamaz; "devam et" verilmedi | — |

**Bu turda açık işler (sıra):** 1.5 hex → 1.6 review+commit+hex → 1.7 hex → 1.8 commit → 1.9 doğrula → 1.10 QA → 1.11 çıkış.
**Not:** 1.6 ve 1.8 aynı `workers/api/**` dizinine yazar → **kesin sıralı**, asla paralel değil. 1.1 (KVKK v1) zaten onaylı, 1.6'nın ön koşulu karşılandı.

---

## 3. ADIM TALİMATLARI (sırayla)

### Step 1.1 — KVKK Rıza Metni · [OPUS 5.5] ⚖️ · ✅ ONAYLI (mevcut)
```
Scope: content/tr/legal/**
Durum: content/tr/legal/kvkk-riza-v1.md MEVCUT ve insan onaylı (v1 kilit). YENİDEN ÜRETME.
Görev (yalnız doğrulama): v1'in formda (1.6) referanslandığını ve içeriğin eksiksiz olduğunu teyit et (veri sorumlusu, işlenen veriler, amaçlar, 3. taraf aktarımı, saklama, haklar + logo rızası ayrı). Değişiklik gerekmiyorsa dokunma.
```

### Step 1.2 — /ithalat Hizmet Sayfaları (4) · [HAIKU 5.5]
```
Scope: content/tr/ithalat/{tedarik,fabrika-denetimi,lojistik,gumruk}.md
Durum: 4 sayfa MEVCUT. Doğrula/hizala, sıfırdan üretme.
Kabul: ≥800 kelime; meta 120–158; FAQPage schema; CTA /ithalat/danismanlik-talebi; CONTENT_STYLE §1 kanıt zinciri; rakamlar kaynaklı. Eksik varsa tamamla.
```

### Step 1.3 — /ihracat Hizmet Sayfaları (3) · [HAIKU 5.5]
```
Scope: content/tr/ihracat/{e-ihracat,b2b-pazarlama,program-tanitim}.md
Durum: 3 sayfa MEVCUT. Doğrula/hizala.
Kabul: CONTENT_STYLE §2–§5; CTA başvuru formuna ("Ücretsiz İhracat Hızlandırma Başvurusu — 48 saatte ön değerlendirme"); program-tanitim = formun vitrini.
```

### Step 1.4 — Çin İthalat Rehber Serisi (6) · [SONNET 5.5]
```
Scope: content/tr/ithalat/rehberler/*.md
Durum: 6 rehber MEVCUT (tekstil, elektronik, makine-parcalari, ev-yasam, ambalaj, mobilya). Doğrula/hizala.
Kabul: ≥1200 kelime; FAQPage + BreadcrumbList; iç link ≥2 (hizmet sayfalarına); keyword yerleşimi SEO_PLAYBOOK §7; gümrük rakamı kaynaklı (kaynaksız = hard-red).
```

### Step 1.5 — TR Frontend + Sayfalar · [SONNET 5.5] · ⚠️ HEX TEMİZLİĞİ
```
Scope: app/(tr)/**/page.tsx, app/(tr)/layout.tsx, app/(tr)'ye özel (form/partner-grid HARİÇ) bileşenler
Durum: sayfalar MEVCUT ve render ediyor. AÇIK İŞ: FAZ 0'dan devredilen hardcoded hex temizliği.
Görev: app/(tr) içindeki inline hardcoded renk/hex/spacing'i `@/lib/ui/tokens`'a çevir (design-tokens Varyant A). next-intl dictionary dışı literal yok. generateMetadata + JSON-LD (SEO_PLAYBOOK §4) geçerli.
Kabul: `pnpm build` yeşil; app/(tr) sayfalarında hardcoded hex=0 (git grep ile kanıtla); design tokens dışı renk yok.
```

### Step 1.6 — Başvuru Formu + Endpoint · [OPUS 5.5] 🔒 · 👤 CODE REVIEW
```
Scope: app/components/ApplicationForm.tsx, workers/api/**, app/(tr)/ihracat/ucretsiz-destek-basvuru/**
Ön koşul: 1.1 (KVKK v1 ✅), 1.5 ✅.
Durum: ApplicationForm.tsx + workers/api/src/apply.ts MEVCUT ama workers/api/ henüz COMMIT'SİZ; ayrıca ApplicationForm'da hardcoded hex var.
Görev:
- Güvenlik review (Opus, yeni model): form alanları Proje.md §2.2 birebir; Turnstile doğrulama; zod validasyon; KVKK rıza SUNUCU-TARAFI zorunlu (client bypass koruması); R2 upload mime+boyut; partners approved=false + consent_logo_en kaydı.
- ApplicationForm.tsx hardcoded hex → tokens.
- workers/api kodunu tek commit'e al (tek scope).
Kabul: rızasız submit 400; Turnstile'sız 403; 26MB dosya 413; hex=0; gitleaks temiz. İNSAN CODE REVIEW kaydı merge izinde.
👤: İnsan form+endpoint'i review eder → "review onaylı".
```

### Step 1.7 — Partner Listeleme Komponenti · [HAIKU 5.5] · ⚠️ HEX TEMİZLİĞİ
```
Scope: app/components/PartnerGrid.tsx (+ ilgili partner-grid lib)
Durum: PartnerGrid.tsx MEVCUT. AÇIK İŞ: hardcoded hex temizliği.
Görev: inline hex → tokens; approved=true filtresi + consent_logo_en=false → logo gizli (yazı+sektör görünür); boş durum metni. 3 kez yazma yasağı: tr/en/de aynı bileşeni kullanır.
Kabul: hex=0; consent filtresi doğru; boş durum; build yeşil.
```

### Step 1.8 — Turnstile + Rate-Limit · [SONNET 5.5]
```
Scope: workers/api/** (turnstile, ratelimit)
Ön koşul: 1.6 commit'li (aynı dizin — SIRALI).
Durum: turnstile.ts + ratelimit.ts MEVCUT. Doğrula + (1.6 ile commit'lenmediyse) commit.
Kabul: Turnstile'sız istek 403; token tek kullanım (replay testi); rate üstü 429; secret'lar env (gitleaks temiz).
```

### Step 1.9 — hreflang/Sitemap Enjeksiyonu · [HAIKU 5.5] · ortak dosya tekeli
```
Scope: app/sitemap.ts, lib/hreflang.* (yalnız bu adım)
Durum: TR URL'leri + x-default sitemap'te MEVCUT. Doğrula.
Görev: Bu fazın tüm TR URL'leri sitemap-tr'de + hreflang seti ŞİMDİLİK yalnız tr + x-default (en/de/zh karşılıkları YOK → yazma, 404-hreflang yasağı SEO_PLAYBOOK §1.4). en/de/zh FAZ 2/5'te eklenecek.
Kabul: tüm TR sitemap URL'leri 200; karşılıklılık script temiz; 404'a hreflang=0.
```

### Step 1.10 — QA Turu · [HAIKU 5.5]
```
Scope: qa/**
Ön koşul: §2'de 1–9 hepsi ✅.
Görev: qa/FAZ-1/rapor.md'yi yeniden doğrula — tüm kabul testleri tek raporda, KANITLI: build+lint · kelime eşikleri (13 sayfa) · meta 120–158 · FAQ≥5 · iç link≥2 · Turnstile · gitleaks · sitemap TR · form alanları §2.2 · KVKK+logo ayrı checkbox · hreflang K1–K5 · PartnerGrid consent · **hardcoded hex=0 (1.5/1.6/1.7 doğrula)** · scope ihlali=0.
Not: form e2e (gerçek submit) endpoint FAZ 3'te → FAZ 1'de UI-only + sunucu-tarafı rıza kabul (ortam notu).
Kural: kanıtsız pass yasak. Bitince §2'de 1.10 ⏸ → bana özet.
```

### Step 1.11 — Faz Çıkışı + Lansman · [HAIKU 5.5] 🚦 · 👤
```
Scope: qa/**, (deploy koordinasyon)
Görev: 1.10 raporundaki 10 çıkış kriterini tek tek işaretle → insana özet.
Çıkış kriterleri: [form uçtan uca (UI + sunucu rıza)] [KVKK v1 onaylı] [/tr 1200+/800+ + schema] [Turnstile + rate-limit] [ilk başvuru alınabilir] [lighthouse ≥90] [gitleaks temiz] [ledger/insan onayları 1.1+1.6] [sitemap/hreflang güncel] [hex=0 / scope ihlali=0].
👤: insan "devam et" → FAZ 2 + deploy kararı (öneri: mevcut Pages deploy'u güncelle).
```

---

## 4. ÇALIŞMA GÜNLÜĞÜ (append-only — her ajan bitince yazar)

> Format: `- [TARİH SAAT] <Model> · Step <no> · <durum> — ne yapıldı; dosyalar: ...; kabul: ...; commit: <hash>; eksik/şüphe: ...`

- [2026-10-12] Pano kurulumu (insan+Claude) — Repo denetimi: FAZ 1 içeriği (KVKK v1, 4 ithalat + 3 ihracat + 6 rehber, TR sayfalar, ApplicationForm, PartnerGrid, turnstile/ratelimit) MEVCUT. AÇIK: workers/api/ commit'siz; hardcoded hex (1.5 app/(tr), 1.6 ApplicationForm, 1.7 PartnerGrid) FAZ 0'dan devredildi → bu fazda tokens'a çevrilecek. 1.1 KVKK v1 onaylı.
- [2026-10-12] Sonnet 5.5 · Step 1.4 · ⚠️ DOĞRULAMA (içerik değiştirilmedi — scope tr-import, ayrı karar) — 6 rehber ölçüldü. GEÇEN: meta title 56–59 (≤60) · desc 130–139 (120–158) · FAQ 6–7 (≥5) · iç link ≥2 (3–6). BULGU-1 kelime: boşluk-bölmeli sayım 1177–1295, ama kopyalanmış paragraf/başlıklar (eski retry turlarının dolgusu) düşülünce etkin kelime elektronik 1105, tekstil 1154 (<1200); ambalaj 1295, ev-yasam 1203, makine 1207, mobilya 1206. Tekrarlı H2: tekstil ('Sözleşme Eki: Seal Sample…' 2×), elektronik ('Test Laboratuvarı Seçimi…' 2×), ev-yasam (2 başlık), mobilya ('Flat-Pack Kalite Testi…'). Önceki QA raporu 1208–1328 diyor (farklı sayım yöntemi/dolgu dahil). BULGU-2 kaynak: rehberlerde HİÇ dış kaynak linki yok; istatistik iddiası da yok (yalnız 'tipik' ödeme oranları) → SEO_PLAYBOOK §7 ihlali yok ama 'gümrük rakamı kaynaklı' maddesi test edilemiyor. BULGU-3 kırık CTA: rehberler ve hizmet sayfalarındaki 10 sayfada `/ithalat/danismanlik-talebi` linki var; bu sayfa HİÇ ÜRETİLMEMİŞ (404). BULGU-4 (1.2 scope, Haiku): meta title `fabrika-denetimi` 66, `lojistik` 64 karakter (>60; dosyada '63 kar — kısalt' notu duruyor). BULGU-5: içerik dosyalarının başlığında 'Model: GLM 5.3 (Portal) · Agent: …' dahili satırı duruyor (1.5 renderer artık public çıktıya sızdırmıyor; dosyalar temizlenmedi).
- [2026-10-15] Haiku 5.5 · Step 1.10 · ⛔ yeniden koşu — `pnpm build` EXIT=0 (50/50); `pnpm lint` EXIT=0 (ESLint 9 flat config, `bbbb029`; 0 hata, 1 uyarı). Kelime 13/13 ✅ (hizmet min 821, rehber min 1391; rehber retry `d624396`). Meta desc 13/13 ✅. FAQ 13/13 ✅. İç link 13/13 ✅. Meta title 6/13 ❌ — rehberler: ambalaj 63, elektronik 64, ev-yasam 68, makine-parcalari 63, mobilya 64, tekstil 64 → Sonnet 1.4 title retry. Workers vitest 52/52 ✅; hex=0 ✅; sitemap 18/18 ✅; hreflang bozuk hedef 0 ✅; gitleaks interim (git grep 0) ✅. KVKK `kvkk-riza-v1.md:12–13` `[____]` hâlâ — insan kararı. Scope ölçülmedi. Lighthouse canlı URL'de. Dosya: qa/FAZ-1/rapor.md. Kapı: KAPALI.
- [2026-10-12] Haiku 5.5 · Step 1.2 + 1.3 · ✅ RETRY (içerik) — hedef: hizmet gövde ≥850 kelime, meta title ≤60. Dosyalar: content/tr/ithalat/{gumruk,lojistik,tedarik,fabrika-denetimi}.md, content/tr/ihracat/{b2b-pazarlama,program-tanitim}.md. Kelime: gumruk 762→865, lojistik 739→862, tedarik 774→864, b2b 785→862, program 790→873. Title: lojistik 69→55, tedarik 61→55, fabrika-denetimi 71→56; gumruk 60 ve b2b 59 ve program 47 zaten ≤60. Eklenen bölümler yeni rakam/iddia içermez (süreç açıklaması). Kabul: `pnpm build` EXIT=0 (50/50); ölçüm `measure13.py` (md token sayımı + build `<title>`). Eksik/şüphe: fabrika-denetimi 821 kelime (800 eşiği geçiyor, 850 hedefinde değil — yalnızca title düzeltildi); rehberler (1.4) bu turda dokunulmadı. Commit: iki scope ayrı commit (1.2 ithalat, 1.3 ihracat).
- [2026-10-12] Haiku 5.5 · Step 1.9 · ✅ (doğrulama) — kod değişmedi; `app/sitemap.ts` + `lib/hreflang.ts` yalnız okundu. Kanıt: sitemap 18 `<loc>` ↔ build çıktısı 18/18 mevcut; sayfa `<link rel=alternate hrefLang>` 31 adet, değerler yalnız `tr`/`x-default`, hedefler 404 değil; en/de/zh alternate YOK (bilinçli, FAZ 2/5). NOT: sitemap tek dosya (`sitemap.xml`), `sitemap-tr.xml` ayrımı SEO_PLAYBOOK §8'e göre FAZ 2'de.
- [2026-10-12] Haiku 5.5 · Step 1.10 · ⛔ kapı kapalı — QA turu yeniden koşuldu, `qa/FAZ-1/rapor.md`. PASS (12): build 50/50 · meta desc 13/13 (122–152) · FAQ 13/13 · iç link 13/13 · Turnstile kod · workers vitest 52/52 · gitleaks interim · sitemap 18/18 · form §2.2 · KVKK/logo ayrı checkbox · hreflang 404=0 · PartnerGrid consent · hex=0. FAIL (3): (a) kelime eşiği 9/13 (hizmet 800: gumruk 762, lojistik 739, tedarik 774, b2b 785, program 790; rehber 1200: elektronik 1146, ev-yasam 1197, makine 1141, tekstil 1159); (b) meta title ≤60 9/13 (SEO_PLAYBOOK §3); (c) lint: `next lint` var ama eslint config yok. ÖLÇÜLMEDİ (2): Lighthouse ≥90; scope ihlali=0 (bu turda kontrol edilmedi). ÖNCEKİ "12/15 PASS, 13/13 kelime" iddiası bu ölçümle tutmuyor. EK: KVKK v1 `content/tr/legal/kvkk-riza-v1.md:12–13` gövdede `[____]` (adres/e-posta) — başlık "ONAYLI" ile çelişiyor → insan kararı. Eksik/şüphe: kelime ölçümü md gövdesi token sayımı (rendered HTML'den değil); 9 sayfada eksik kelime 3–61 arası (ev-yasam 3, makine 59, lojistik 61).
- [2026-10-12] Haiku 5.5 · Step 1.7 · ✅ — Dosya: app/components/PartnerGrid.tsx (tek dosya). Değişiklik: 6 hardcoded hex → tokens (`#6B7280`→color.muted ×2, `#E5E7EB`→color.muted (kenarlık), `#fff`→color.bg (kart zemini) ve avatar metni, `#1A2B4A`→color.primary (avatar), `#2E7D32`→color.accent (✔ Onaylı)); boş durum metnine `aria-live="polite"` (brief a11y). KABUL: hex=0 (`grep -cE '#[0-9A-Fa-f]{3,6}\b'` → 0); `pnpm build` EXIT=0; consent: `logoUrl` yalnızca truthy ise `<img>` — null ise baş-harf avatarı (KVKK: API consent_logo_en=false için logoUrl dönmez, API tarafı 3.x'te). Boş durum: LABELS 4 dil, tr/en/de/zh. EKSİK/ŞÜPHE: (1) bileşen şu an HİÇBİR sayfada import edilmiyor (`grep PartnerGrid app lib` → yalnız kendisi) → görsel kabul yok; 1.9/2.x kullanım bağlanınca doğrulanmalı. (2) `sectorFilter` prop'u brief'te var, bileşende yok — kullanım bağlanınca eklenir (scope dışı). (3) "approved=true" filtresi API'de; bileşen yalnız `verified !== false` ile istemci tarafı eleme yapıyor. (4) `danger/success` token'ı yok → ✔ rengi `accent`; 0.5 takibi (fe) geçerli. (5) `pnpm build` HTML sayısı bu turda 47 (önceki turda 70) — çıktı klasörü farkı, 1.7 dışı; 1.10 QA'da doğrulanmalı.
- [2026-10-12] Sonnet 5.5 · Step 1.5 · ✅ (commit `d881cad`, dal `tasks/faz0-progress-panel`; 9 dosya: app/(tr)/_lib/content.tsx, 3×[slug]/page.tsx, 3 yeni indeks page.tsx, kvkk-riza/page.tsx, lib/messages/tr.json) — PANO TALİMATI 'hex temizliği' idi; ölçüm: app/(tr)'de hex=0 zaten. Gerçek sorunlar bulunup düzeltildi: (a) META regex `(59 kar)` notunu okuyamıyordu → canlı çıktıda `<title>tekstil | Bdimexport</title>`, description YOK; (b) 'Sayfa tipi / Durum / Model: GLM 5.3 · Agent: tr-import-agent' dahili satırları public sayfada görünüyordu + H1 ikinci kez '<p># …' olarak basılıyordu; (c) JSON-LD hiç yoktu (FAQPage/BreadcrumbList/Service|Article eklendi, SEO_PLAYBOOK §4); canonical yoktu (kök layout'tan ana sayfa canonical'ı miras alınıyordu) → sayfa başına canonical + hreflang (yalnız tr + x-default); (d) mükerrer rotalar: ithalat/[slug] ve ihracat/[slug] 13'er yol üretiyordu (/ithalat/e-ihracat, /ihracat/tekstil … aynı içerik) → her kind yalnız kendi slug'ları (73 → 50 sayfa); (e) /ithalat, /ihracat, /ithalat/rehberler sayfaları yoktu ama sitemap'te + ana sayfa linkinde vardı (404) → indeks sayfaları eklendi; (f) 3 kopya [slug] sayfası → tek ortak modül; inline px/rem → tokens (space, prose); sabit metinler → lib/messages/tr.json. KABUL KANITI: `pnpm build` exit 0, 50/50 statik sayfa; sitemap'teki 18 URL'nin 18'i out/'ta mevcut; 15 içerik sayfası: JSON-LD parse OK, canonical = URL, h1=1, dahili satır sızıntısı 0, description hepsinde 120–158; app/(tr) hardcoded hex/px/rem = 0 (form sayfası hariç). SCOPE NOTLARI: (1) `lib/messages/tr.json` 1.5 scope'u dışında (0.1'de ben oluşturmuştum; 'dictionary dışı literal yok' maddesi gereği anahtarlar eklendi). (2) Form sayfası `app/(tr)/ihracat/ucretsiz-destek-basvuru/page.tsx` 1.6'nın scope'unda → değişikliğimi geri aldım; orada hâlâ `maxWidth: 760, padding: "2rem 1rem"`, description 93 karakter (<120), canonical/JSON-LD yok → 1.6'ya devredildi. EKSİK/ŞÜPHE: `/ithalat/danismanlik-talebi` sayfası yok (10 sayfada kırık CTA; ihracat sayfalarının footer CTA'sı form sayfasına gidiyor, ithalat/rehber footer CTA'sı hedefsiz olduğu için kaldırıldı) → 👤 KARAR GEREKİYOR: lead formu (FAZ 3 endpoint'i gerekir) mı, mevcut başvuru formuna yönlendirme mi? JSON-LD harici doğrulayıcıyla (Rich Results) denenmedi, yalnız JSON.parse + tip kontrolü. Lighthouse ölçülmedi (1.11).

- [2026-10-12] Opus 5.5 · Step 1.6 · ⏸ (👤 code review bekliyor; commit onaydan sonra) — GÜVENLİK REVIEW. KRİTİK BULGU: ApplicationForm hiçbir yere POST etmiyordu (`setTimeout(500)` → 'Başvurunuz alındı'); a1e4453'e göre site bdimexport.pages.dev'de canlı → canlıda başvuran veri kaybetmiş olabilir. Ayrıca: Turnstile `action` yok (sunucu `partner_apply` bekliyor → gerçek gönderim her zaman 403 olurdu), token yakalanmıyordu, kvkkVersion gönderilmiyordu, e-posta alanı yoktu ama başarı mesajı 'e-postayla bildirilecek' diyordu, sitekey koda gömülü fallback'ti, script render sırasında DOM'a ekleniyordu, hex ×7. DÜZELTME: form gerçek multipart POST (`NEXT_PUBLIC_API_BASE`), Turnstile explicit render + action + her denemede reset, sunucu hata kodları alanlara eşlenir (400/409/413/403/429), env yoksa sahte başarı yerine 'şu an alınamıyor'; iletişim (ad/e-posta*/telefon) + sektör alanları; hex=0 (yalnız tokens; danger token yok → hata metni `ink`+600+'Hata:' öneki); 'vermesen'→'vermeseniz'. Sunucu: `contactEmail` zorunlu (+ test). Endpoint'in kalanı sağlam bulundu, değiştirilmedi (rıza sunucu-zorunlu, KVKK sürüm beyaz listesi, approved=0 sabit, Turnstile action+hostname+replay+fail-closed, PDF boyut+mime+magic, R2 anahtarı kullanıcıdan alınmaz, PII yankılanmaz). Sayfa: description 93→147, canonical + hreflang(tr,x-default), JSON-LD Organization+WebPage+FAQPage+BreadcrumbList, 5 SSS (program-tanitim.md onaylı yanıtlarından; görünür = şema). Dosyalar: app/components/ApplicationForm.tsx, app/(tr)/ihracat/ucretsiz-destek-basvuru/page.tsx, workers/api/src/apply.ts, workers/api/test/{helpers,apply.test}.ts + workers/api/** ilk kez commit'lenecek (21 dosya; node_modules/.wrangler hariç). KABUL: vitest 37/37 (rızasız 400 ×3, e-postasız 400, token yok 403, action/hostname/replay/fail-closed 403, 26MB 413 ×2, 429, CORS); tsc exit 0; form↔sunucu sözleşmesi: gönderilen 14 alanın hepsi sunucuda okunuyor, zod zorunluların hepsi gönderiliyor, action/KVKK sürüm(=dosya sha256)/PDF limiti birebir; `pnpm build` exit 0, 50 sayfa; çıktı HTML: title 51, desc 147, canonical OK, h1=1, JSON-LD parse OK, FAQ 5=5; env'li build: 9 alan, label 9/9, 8 checkbox, 4 aria-required; hex=0 (yalnız `1px` kenarlık — lib/ui emsali var); secret/sitekey taraması 0. EKSİK/ŞÜPHE: (a) gerçek uçtan uca gönderim test EDİLMEDİ — worker deploy + Turnstile anahtarları + production ALLOWED_ORIGINS/TURNSTILE_HOSTNAMES yok (3.9); (b) Pages build env'ine `NEXT_PUBLIC_API_BASE` + `NEXT_PUBLIC_TURNSTILE_SITE_KEY` girilmeli, girilene kadar canlı form 'şu an alınamıyor' der; (c) workers/api içindeki auth.ts/keys.ts/read.ts (FAZ_3 3.4 kodu) bu commit'le git'e girer ama 1.6'da review EDİLMEDİ → 3.4 review'ı ayrı; (d) danger/success token'ı tokens.ts'te yok (0.5 takibi, fe) — eklenince form hata rengi güncellenmeli; (e) 409 yanıtı vergi no ile başvuru varlığını ele verir (Turnstile+5/dk ile sınırlı; kabul edilmiş risk mi → 👤).
- [2026-10-12] Opus 5.5 · Step 1.6 · ✅ — 👤 İNSAN CODE REVIEW ONAYLI (sohbette "review onaylı"); commit `bda3bce` (21 dosya: ApplicationForm.tsx, form page.tsx, workers/api/** — stage commit öncesi kontrol edildi, başka adım dosyası yok). Onaylanan kararlar: e-posta form+sunucuda zorunlu · 409 vergi-no varlık sızıntısı kabul edilmiş risk (Turnstile + 5/dk) · danger token gelene kadar hata metni `ink`+600+'Hata:'. AÇIK TAKİPLER: (1) 👤 canlı `bdimexport.pages.dev`'de eski sahte-submit formuyla gelmiş olabilecek başvurular kayıtsız — kontrol et; (2) 👤 Pages build env: `NEXT_PUBLIC_API_BASE`, `NEXT_PUBLIC_TURNSTILE_SITE_KEY` (+ worker deploy, production ALLOWED_ORIGINS/TURNSTILE_HOSTNAMES — 3.9); (3) auth.ts/keys.ts/read.ts 3.4'te ayrıca review; (4) fe: tokens.ts'e danger/success (0.5 takibi). Sıradaki: 1.7 (Haiku 5.5).
- [2026-10-12] Sonnet 5.5 · Step 1.8 · ✅ (commit `04c737d`, dal `tasks/faz0-progress-panel`; yalnız `workers/api/**`: test/turnstile-ratelimit.test.ts, vitest.config.ts, .gitignore) — DURUM: turnstile.ts + ratelimit.ts zaten 1.6'da (`bda3bce`) Opus review + 👤 onayıyla commit'lenmişti → 1.8 kodu DEĞİŞTİRİLMEDİ; doğrulama + test boşluğu kapatma. Mevcut testler (apply.test.ts) pano kabulünü zaten kapsıyordu (Turnstile'sız 403, replay 403, success=false/action/hostname/ağ hatası 403, rate üstü 429+retry-after); EK 15 DAVRANIŞ TESTİ: siteverify'a secret env'den + remoteip=cf-connecting-ip + gelen token gider, IP yoksa remoteip gönderilmez; secret hata yanıtında yansımaz; >2048 karakter token → 403 (siteverify çağrılmaz); KV'ye HAM token yazılmaz (anahtar ts:+SHA-256 64 hex, TTL 600); başarısız token da yakılır (tekrar → turnstile_replay, siteverify 1 kez); farklı token'lar bağımsız; fail-closed: boş TURNSTILE_HOSTNAMES / hostname'siz yanıt → 403; TURNSTILE_ACTION_APPLY env ile değişir; rate-limit siteverify'dan ÖNCE (429'da siteverify çağrılmaz → Turnstile kotası korunur); IP izolasyonu; retry-after 1–60; anahtar rl:apply:{ip}:{pencere} TTL 120; 60 sn pencere sıfırlanması; geçersiz RL_APPLY_PER_MIN (abc/0/-3) → varsayılan 5, limit devre dışı kalmaz. KABUL KANITI: vitest 52/52 (37 eski + 15 yeni), tsc --noEmit temiz; son kodla 3/3 ardışık yeşil. Secret taraması (desen): gömülü secret yok — TURNSTILE_SECRET yalnız `env`'den, wrangler.toml'da yalnız yorum (`wrangler secret put`); sitekey koda gömülü değil. DÜZELTMELER: (1) `workers/api/.gitignore` YOKTU ve kök .gitignore `.dev.vars` içermiyor → `wrangler dev` yerel secret dosyası kazara commit'lenebilirdi; eklendi (git check-ignore ile doğrulandı). (2) vitest `fileParallelism:false`: 25/26MB buffer testleri paralel worker'larda düşük RAM'de aralıklı `RangeError: Array buffer allocation failed` veriyordu (yeni dosya eklenince 1/6 çalıştırmada 2 test düştü); sıralı çalıştırmada 0/11 test hatası. EKSİK/ŞÜPHE: (a) gitleaks yerelde ÇALIŞTIRILMADI (kurulu değil) — yalnız desen taraması; asıl kapı qa-gate.yml `gitleaks` işi, ilk PR'da doğrulanmalı. (b) Ortam: makinede boş RAM ~430 MB/8 GB; vitest'in Rust katmanı 16 çalıştırmanın 3'ünde başlangıçta `memory allocation of N bytes failed` ile çöktü (exit 127) — kod/test kaynaklı DEĞİL, bellek baskısı; CI'da beklenmez. (c) BİLİNEN SINIRLAR (değişiklik gerekmiyor, 3.9/7.2'ye not): KV tabanlı sayaç/replay işareti atomik değil (eventual consistency) → çok yoğun paralel istekte limit/tek-kullanım birkaç istek aşılabilir; Cloudflare siteverify token'ı kendisi de tek kullanımlık sayar (ikinci savunma). Turnstile token multipart gövdesinin İÇİNDE olduğundan gövde (≤25.25MB) Turnstile'dan ÖNCE belleğe okunur; sınır IP başına 5/dk — dağıtık saldırıda Worker bellek/CPU yüzeyi (7.2'de WAF/Rate Limiting binding ile ele alınır). `cf-connecting-ip` yoksa tüm istekler 'unknown' kovasını paylaşır (yalnız Cloudflare dışı/yerel çağrıda; prod'da her zaman set).
- [2026-10-12] Sonnet 5.5 · Step 1.4 RETRY · ✅ (commit `d624396`, dal `tasks/faz0-progress-panel`; yalnız `content/tr/ithalat/rehberler/*.md`, 6 dosya) — GÖREV: 'eşik-altı rehberleri ≥1250 kelimeye genişlet + meta title'. ÖLÇÜT: sıkı sayım = yalnız harf/rakam içeren belirteçler; tablo çizgileri (`|`, `:---`), META yorumu, `**Sayfa tipi/Durum**` dahili satırları ve H1 hariç. Bu ölçütte ALTI rehberin altısı da eşik altındaydı (903–1047 kelime, tekrarlar düşülünce); önceki QA'nın '1208–1328' sayısı tablo işaretlerini/dolguyu da saymış olmalı (1.10'da AYNI sıkı ölçütle yeniden ölç). YAPILAN: (1) 7 DOLGU bölümü silindi — birebir kopya: elektronik 'Test Laboratuvarı…', tekstil 'Seal Sample…'; başlığı aynı/içeriği yeniden ifade edilmiş: ev-yasam 'Güvenlik Filtresi' + 'Kâr Testi', mobilya 'Flat-Pack Kalite Testi', makine 'Sipariş Öncesi Kontrol Listesi', ambalaj 'Maliyet Kırılımı' (başlık farklı, içerik %71 aynı) — her çiftte uzun olan kaldı; (2) 27 YENİ BÖLÜM (commit mesajındaki '22' SAYIM HATASIDIR, doğrusu 27; geçmişe dokunulmadı): tekstil 4, ambalaj 4, elektronik 5, ev-yasam 5, makine 5, mobilya 4 — onay kapısı/lot tutarlılığı/giriş kontrolü, baskı dosyası/teslim kontrolü, bağlantılı ürün soruları/Türkçe kılavuz/8 soru, malzeme soruları/iade akışı, revizyon yönetimi/giriş kontrolü/pilot parti, yük testleri/montaj talimatı/hasar yönetimi vb.; UYDURMA İSTATİSTİK YOK (bilinmeyen 'değişken' denildi); (3) 'İlk Adım' (CTA) ortada kalmıştı → FAQ'ın hemen öncesine taşındı (6/6 dosyada sıra: …içerik → İlk Adım → SSS); (4) yazım hataları: 'bu alandana', 'döküm+calisma', 'mükemmeliyetçi montaj denemesi', 'Numune kokulum/kimyasal'. META TITLE: bu turda DEĞİŞTİRİLMEDİ — `beadc9f` (1.2 retry, başka oturum) fabrika-denetimi/lojistik başlıklarını zaten ≤60'a indirmişti; 13 hizmet+rehber sayfasının 13'ü title ≤60, desc 120–158 (betikle doğrulandı). KABUL KANITI: kaynak kelime 1258–1291 (ambalaj 1276, elektronik 1269, ev-yasam 1258, makine 1271, mobilya 1291, tekstil 1258); SAYFADA GÖRÜNEN (out/*.html <main>, H1 dahil) 1255–1291; yinelenen H2 = 0, bloklar arası %50+ benzerlik = 0; FAQ 6–7 (≥5); `pnpm build` exit 0, 50/50 sayfa; 6 rehberde JSON-LD Article+FAQPage+BreadcrumbList parse OK; dahili satır sızıntısı 0. AÇIK / İNSAN KARARI: (a) `/ithalat/danismanlik-talebi` hâlâ 404 (10 sayfada CTA) — 1.5 bulgusu, değişmedi; (b) rehberlerde HİÇ dış kaynak linki yok; mevcut sayısal ifadeler 'tipik/örnektir' etiketli ama kaynaksız: tekstil '%15–35 ek maliyet', ambalaj maliyet kırılımı (~%55/%15/%10…), elektronik 'birkaç yüz–birkaç bin $ test', makine '$2.000 kalıp örneği', mobilya '40ft HC ~67 m³, %85+ doluluk', tekstil/ev-yasam sipariş-süre aralıkları → CONTENT_STYLE §6(1) 'kaynaksız rakam' riski; ya resmi/sektör kaynağı eklenmeli ya da 'örnek' çerçevesi netleştirilmeli (bu turda DOKUNULMADI, yeni rakam da EKLENMEDİ); (c) içerik dosyalarının başındaki 'Model: GLM 5.3 (Portal) · Agent: tr-import-agent' dahili satırı dosyalarda duruyor (siteye sızmıyor); (d) eklenen metinde 'Türkçe kılavuz/garanti belgesi beklenir' ve 'kişisel veri sorumluluğu size düşebilir' gibi ifadeler genel ve 'ürün grubuna göre doğrulanır' notlu; hukuki kesinlik iddiası içermez ama KVKK/ürün güvenliği ifadelerini bir uzman gözden geçirmeli.
- [2026-10-15] Sonnet 5.5 · Step 1.4 MİKRO-RETRY · ✅ (commit `f8b2aad`, dal `tasks/faz0-progress-panel`; yalnız 6 rehberin META satırı — `content/tr/ithalat/rehberler/{ambalaj,elektronik,ev-yasam,makine-parcalari,mobilya,tekstil}.md`, dosya başına 1 satır) — GÖREV: rehber meta title ≤60 (QA 88d348f: rehberler 6/6 ❌ — 63/64/68…). KÖK SEBEP (ölçüm): QA başlığı `out/*.html` içindeki HAM metinden ölçmüş; HTML kaçışları sayılmış — `Çin&#x27;den` +5, `Ev &amp; Yaşam` +4 (ev-yasam: 59+5+4=68 ✓, ambalaj 58+5=63 ✓, elektronik 59+5=64 ✓). Gerçek (görünen) başlıklar kaynakta ZATEN 58–59 karakterdi; Google görünen metni sayar. Yine de kapı kapalı olduğu ve ham ölçüm bir daha takılmasın diye başlıklar HER İKİ ölçümde ≤60 olacak şekilde kısaltıldı. YENİ BAŞLIKLAR (gerçek/ham-HTML): ambalaj 51/56 · elektronik 52/57 · ev-yasam 50/55 · makine-parcalari 51/56 · mobilya 49/54 · tekstil 51/56. Birincil keyword (hedef keyword satırıyla) başlıkta başta: 'Çin'den {X} İthalatı'. ev-yasam'da 'Ev & Yaşam Ürünleri' → 'Ev Ürünleri' (hedef keyword 'çin'den ev ürünleri ithalatı' + '&' kaçışı kalktı). DOKUNULMADI: description (130–139 → değişmedi), gövde, H1, 'Hedef keyword' satırı; kelime sayıları birebir aynı (1276/1269/1258/1271/1291/1258 — betikle önce=sonra doğrulandı); `git diff`: 6 dosya, 6+/6−, değişen tüm satırlar META. KABUL KANITI: `pnpm build` exit 0, 50/50; out/ içindeki 15 içerik sayfasının 15'i ham `<title>` ≤60 (en uzunu gumruk 60) ve description 120–158 → 'ham-HTML title>60 veya desc dışı: 0'. SONRAKİ: 1.10 yeniden koşulmalı (meta title kriteri artık geçmeli); QA ölçerken `html.unescape` kullanmalı — aksi halde apostrof/& içeren her başlık haksız yere FAIL olur. 1.10'un kalan engelleri (KVKK placeholder 👤, scope ölçümü, Lighthouse) bu commit'le ilgili DEĞİL; qa/ ve §2 1.10 satırına dokunulmadı.

---

## 5. İNSAN AKSİYON NOKTALARI (👤 — senin görevlerin)

1. **1.1:** KVKK v1 zaten onaylı — ek iş yok (değişirse yeniden onay).
2. **1.6 sonrası:** Başvuru formu + endpoint güvenlik review → "review onaylı".
3. **1.11 sonrası:** 10 kriter yeşilse "devam et" → FAZ 2 + deploy kararı.
4. **Dal:** FAZ 1 işi feature dalında; faz sonunda main'e squash-merge.
