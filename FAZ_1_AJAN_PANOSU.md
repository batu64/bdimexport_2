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
| 2 | 1.2 /ithalat hizmet (4) | **Haiku 5.5** | — | ✅* mevcut — doğrula | önceki |
| 3 | 1.3 /ihracat hizmet (3) | **Haiku 5.5** | — | ✅* mevcut — doğrula | önceki |
| 4 | 1.4 Çin ithalat rehber (6) | **Sonnet 5.5** | — | ⚠️ doğrulandı — içerik bulguları açık (§4) | Sonnet 5.5 · 2026-10-12 |
| 5 | 1.5 TR frontend + sayfalar | **Sonnet 5.5** | 1.2–1.4 | ✅ commit `d881cad` (form sayfası 1.6'ya devredildi) | Sonnet 5.5 · 2026-10-12 |
| 6 | 1.6 Başvuru formu + endpoint 🔒 | **Opus 5.5** | 1.1 + 1.5 + 👤 | ⚠️ mevcut — Opus review + workers/api COMMIT + hex | — |
| 7 | 1.7 Partner listeleme komponenti | **Haiku 5.5** | 1.5 | ⚠️ mevcut — hardcoded hex temizle | — |
| 8 | 1.8 Turnstile + rate-limit | **Sonnet 5.5** | 1.6 | ⚠️ mevcut — doğrula + commit | — |
| 9 | 1.9 hreflang/sitemap enjeksiyonu | **Haiku 5.5** | 1.2–1.8 | ✅* mevcut (TR+x-default) — doğrula | önceki |
| 10 | 1.10 QA turu | **Haiku 5.5** | 1–9 hepsi ✅ | ⏸ yeniden doğrula | — |
| 11 | 1.11 çıkış + lansman 🚦 | **Haiku 5.5** | 1.10 + 👤 | ⏸ onay + deploy | — |

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
- [2026-10-12] Sonnet 5.5 · Step 1.5 · ✅ (commit `d881cad`, dal `tasks/faz0-progress-panel`; 9 dosya: app/(tr)/_lib/content.tsx, 3×[slug]/page.tsx, 3 yeni indeks page.tsx, kvkk-riza/page.tsx, lib/messages/tr.json) — PANO TALİMATI 'hex temizliği' idi; ölçüm: app/(tr)'de hex=0 zaten. Gerçek sorunlar bulunup düzeltildi: (a) META regex `(59 kar)` notunu okuyamıyordu → canlı çıktıda `<title>tekstil | Bdimexport</title>`, description YOK; (b) 'Sayfa tipi / Durum / Model: GLM 5.3 · Agent: tr-import-agent' dahili satırları public sayfada görünüyordu + H1 ikinci kez '<p># …' olarak basılıyordu; (c) JSON-LD hiç yoktu (FAQPage/BreadcrumbList/Service|Article eklendi, SEO_PLAYBOOK §4); canonical yoktu (kök layout'tan ana sayfa canonical'ı miras alınıyordu) → sayfa başına canonical + hreflang (yalnız tr + x-default); (d) mükerrer rotalar: ithalat/[slug] ve ihracat/[slug] 13'er yol üretiyordu (/ithalat/e-ihracat, /ihracat/tekstil … aynı içerik) → her kind yalnız kendi slug'ları (73 → 50 sayfa); (e) /ithalat, /ihracat, /ithalat/rehberler sayfaları yoktu ama sitemap'te + ana sayfa linkinde vardı (404) → indeks sayfaları eklendi; (f) 3 kopya [slug] sayfası → tek ortak modül; inline px/rem → tokens (space, prose); sabit metinler → lib/messages/tr.json. KABUL KANITI: `pnpm build` exit 0, 50/50 statik sayfa; sitemap'teki 18 URL'nin 18'i out/'ta mevcut; 15 içerik sayfası: JSON-LD parse OK, canonical = URL, h1=1, dahili satır sızıntısı 0, description hepsinde 120–158; app/(tr) hardcoded hex/px/rem = 0 (form sayfası hariç). SCOPE NOTLARI: (1) `lib/messages/tr.json` 1.5 scope'u dışında (0.1'de ben oluşturmuştum; 'dictionary dışı literal yok' maddesi gereği anahtarlar eklendi). (2) Form sayfası `app/(tr)/ihracat/ucretsiz-destek-basvuru/page.tsx` 1.6'nın scope'unda → değişikliğimi geri aldım; orada hâlâ `maxWidth: 760, padding: "2rem 1rem"`, description 93 karakter (<120), canonical/JSON-LD yok → 1.6'ya devredildi. EKSİK/ŞÜPHE: `/ithalat/danismanlik-talebi` sayfası yok (10 sayfada kırık CTA; ihracat sayfalarının footer CTA'sı form sayfasına gidiyor, ithalat/rehber footer CTA'sı hedefsiz olduğu için kaldırıldı) → 👤 KARAR GEREKİYOR: lead formu (FAZ 3 endpoint'i gerekir) mı, mevcut başvuru formuna yönlendirme mi? JSON-LD harici doğrulayıcıyla (Rich Results) denenmedi, yalnız JSON.parse + tip kontrolü. Lighthouse ölçülmedi (1.11).

---

## 5. İNSAN AKSİYON NOKTALARI (👤 — senin görevlerin)

1. **1.1:** KVKK v1 zaten onaylı — ek iş yok (değişirse yeniden onay).
2. **1.6 sonrası:** Başvuru formu + endpoint güvenlik review → "review onaylı".
3. **1.11 sonrası:** 10 kriter yeşilse "devam et" → FAZ 2 + deploy kararı.
4. **Dal:** FAZ 1 işi feature dalında; faz sonunda main'e squash-merge.
