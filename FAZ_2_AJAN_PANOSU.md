# FAZ 2 — Ajan Görev Panosu ve Koordinasyon
**Proje:** bdimexport.com | **Sürüm:** 1.0 | **Yürütücü:** Claude Code (Opus 5.5 / Sonnet 5.5 / Haiku 5.5)
**Hedef:** EN global lead jeneratörü — /en iskelet + 5 hizmet + 20 ürün SEO/GEO + 5 industry + /en/{ru,fr,nl,es,ar} varyant + tam hreflang/sitemap/llms.
**Amaç:** Tüm ajanların ORTAK okuduğu tek pano. Sıra, her adımın talimatı, canlı durum, ajanlar arası devir burada.

> Yetkili kaynaklar: `AGENTS.md` (§4 scope, §5 sıra, §7 model), `fazlar/FAZ_2.md`, `CONTENT_STYLE.md`, `SEO_PLAYBOOK.md`, `I18N_RULES.md`. Çelişki → AGENTS.md kazanır.
> Ön koşul: FAZ 1 kapandı (KVKK verisi 👤 tarafından sonra girilecek — form canlıya o doldurulmadan alınamaz; FAZ 2 buna bağlı değil). Feature dalı, faz sonunda main'e squash-merge.

---

## 0. PROTOKOL (HER AJAN OKUR)

- **"git bunu oku":** Baştan sona oku. §2'ye bak, modelini + sıradaki adımını belirle. Uygulama yapma, hazır olduğunu bildir.
- **"talimatı uygula":** §2'de durumu ⏳/⚠️, bağımlılıkları ✅, sana ait **sıradaki** adımı al → §3'teki talimatı uygula.
- **Başlamadan:** bağımlılık ✅ değilse BAŞLAMA; §4'e `BEKLEMEDE` yaz, insana bildir. **Sırayı ASLA atlama.**
- **Çalışırken:** §2 durumu 🔄, "Son güncelleyen"e model+saat.
- **Bitince:** §2 ✅ + §4 günlüğü (ne, dosyalar, kabul kanıtı, eksik) + commit (tek scope/tek commit). Commit öncesi `git status`/`git diff --cached` kontrol.
- **Sorun/çakışma:** ⛔ + §4'e neden + insana haber + DEVAM ETME.
- **İnsan bekleyen:** ⏸ + §5 hatırlat.

**Semboller:** ⏳ todo · ⚠️ mevcut/eksik düzelt · 🔄 running · ✅ done · ⛔ blocked · ⏸ insan bekliyor · 🟡 Gemini (en sonda) · `✅*` mevcut (dokunulursa doğrula)

---

## 1. DEĞİŞMEZ KURALLAR

1. **Tek scope / tek commit.** 2. **Oku-hizala-ezme.** 3. **Hardcoded hex yasak → `@/lib/ui/tokens`.**
4. **Ortak dosya tekeli:** `app/sitemap.ts`, `lib/hreflang.*`, `public/llms.txt` → yalnız 2.8.
5. **İçerik yeniden yazım, çeviri DEĞİL** (I18N_RULES §1): /en global alıcı niyetiyle; varyantlar bölge kültürüyle.
6. **Rakamlar kaynaklı** (TÜİK/TİM); uydurma = hard-red. **Partner isimleri D1'den**, agent uyduramaz.
7. **H1 kalıbı [ŞART]:** `{Product} Manufacturers in Turkey | B2B Sourcing` (SEO_PLAYBOOK §5).
8. **Runtime AI = Gemini, en sonda (2.6 görsel).** O ana kadar stub/placeholder.

---

## 2. DURUM TABLOSU (CANLI)

| Sıra | Adım | Model | Bağımlılık | Durum | Son güncelleyen |
| :-- | :-- | :-- | :-- | :-- | :-- |
| 1 | 2.1 /en route + 5 hizmet | **Sonnet 5.5** | — | ✅ 5 hizmet + indeks (≥874 kelime); `/en/industries/*` linkleri 2.4 rota hatası yüzünden şimdilik kırık (§4) | Sonnet 5.5 · 2026-10-15 |
| 2 | 2.2 ürün liste + kategori | **Sonnet 5.5** | 2.1 | ✅ /en/products + 5 kategori + ItemList; 20 ürün 'coming soon' (2.3 bekler); URL sözleşmesi §4 | Sonnet 5.5 · 2026-10-15 |
| 3 | 2.3 20 ürün SEO/GEO | **Sonnet 5.5** (ucuz: Haiku) | 2.2 | ✅ 20 sayfa (≥1302 kelime), her rakam linkli kaynak (UN Comtrade), partner = PLACEHOLDER (A ONAYLI) | Sonnet 5.5 · 2026-10-15 |
| 4 | 2.4 industries (5) | **Sonnet 5.5** | — | ⚠️ rework gerekli (Sonnet): meta title 74–79 (≤60), kaynak linki yok, rota `/industries` (canonical `/en/industries`) — §4 | Haiku 5.5 · 2026-10-15 |
| 5 | 2.5 varyant iskeletleri (5 dil + RTL) | kod **Sonnet** · içerik **Haiku/Sonnet** | 2.1 | ⚠️ rework gerekli (Sonnet): `<html lang="tr">` tüm 5 varyantta, `/en/ar` `<html dir>` yok (dir yalnız div'de) — §4 | Haiku 5.5 · 2026-10-15 |
| 6 | 2.7 komplex varyant layout | **Opus 5.5** | 2.5 | ⚠️ rework gerekli (Opus'a devir): 5 varyant smoke test yok; `app/(en)/industries` 69 hex (lib/ui temiz) — §4 | Haiku 5.5 · 2026-10-15 |
| 7 | 2.6 görsel üretim turu | **Gemini** 🟡 + Haiku script | 2.3–2.5 | ⏸ ERTELE (Gemini en sonda) | — |
| 8 | 2.8 hreflang/sitemap/llms enjeksiyonu | **Haiku 5.5** | 2.1–2.5 | ⏳ en sayfaları sitemap'te yok | — |
| 9 | 2.9 QA turu | **Haiku 5.5** | 1–8 (2.6 hariç) ✅ | ⏳ qa/FAZ-2 yok | — |
| 10 | 2.10 faz çıkışı 🚦 | **Haiku 5.5** | 2.9 + 👤 | ⏸ onay | — |

**Sıralı yürütme:** 2.1 → 2.2 → 2.3 → 2.4(doğrula) → 2.5(doğrula) → 2.7(doğrula) → 2.8 → 2.9 → 2.10 · *(2.6 görsel Gemini ayarına kadar ⏸)*
**Not:** 2.8 ortak dosya (sitemap/hreflang/llms) → tek elden, içerik adımlarından sonra. 2.3 ürün sayfaları 2.2 URL yapısını bekler.

---

## 3. ADIM TALİMATLARI

### Step 2.1 — /en Route + 5 Hizmet · [SONNET 5.5] · ⚠️ services içeriği eksik
```
Scope: content/en/global/**, app/(en)/en/* (varyant alt dizinleri HARİÇ), lib/ui (gerekirse)
Durum: app/(en)/en route + variant iskeletleri var. EKSİK: content/en/global/services/* (sourcing/manufacturing/inspection/logistics/customs) ve bunların /en/services/* sayfaları.
Görev: 5 hizmet sayfasını üret — global ALICI niyetiyle yeniden yazım (çeviri değil), SLA'lı cümleler ("in 24h", "within 5 days"), Service+FAQPage+BreadcrumbList schema. /en layout CTA = quotation formu.
Kabul: ≥800 kelime/sayfa; meta ≤60 title + 120–158 desc; hreflang VERİSİ manifest'e (yazma yok — 2.8); build yeşil.
```

### Step 2.2 — Ürün Liste + Kategori · [SONNET 5.5]
```
Scope: app/(en)/en/products/**, content/en/global/products/_categories*
Ön koşul: 2.1 ✅.
Görev: /en/products ana liste (D1 contents+partners bileşimi) + 5 kategori (textile, food, machinery, home-living, construction) + ItemList schema. Boş kategori "coming soon" durumu yönetilebilir.
Kabul: kategori→ürün iç link kuralı; ItemList schema geçerli; build yeşil.
```

### Step 2.3 — 20 Ürün SEO/GEO · [SONNET 5.5] (ucuz alt: Haiku) · ⚠️ PARTNER KARARI (§5)
```
Scope: content/en/global/products/**, app/(en)/en/products/[slug]
Ön koşul: 2.2 ✅. Partner bloğu kararı (§5): onaylı partner 0 → "onaylı partner bekleniyor" PLACEHOLDER bloğuyla üret (consent filtresi hazır, gerçek logolar FAZ 3/8'de dolar). Uydurma partner YASAK.
Görev: her kategoriye 4 ürün = 20 sayfa. Blok sırası CONTENT_STYLE §2 değişmez: Hero+CTA → Neden Türkiye (kaynaklı) → TÜİK/TİM tablosu (3 yıl) → üretim 5 adım → partner bloğu (placeholder) → kalite/denetim → SSS≥5 → CTA. H1 [ŞART]: "{Product} Manufacturers in Turkey | B2B Sourcing".
Batch: 10 sayfa/çağrı × 2 (20 ayrı çağrı = ihlal).
Kabul: ≥1200 kelime; Product+FAQPage+Organization schema; her rakam linkli kaynak; keyword §7.
```

### Step 2.4 — Industries (5) · [SONNET 5.5] · ✅* doğrula
```
Scope: content/en/global/industries/**, app/(en)/industries/**
Durum: 5 industry (construction/food/home-living/machinery/textile) MEVCUT. Doğrula/hizala, üretme.
Kabul: Article+ClaimReview schema (rakam iddiaları); kaynak linkleri; ≥1000 kelime; ürün sayfalarına iç link; meta ≤60.
```

### Step 2.5 — Varyant İskeletleri (5 dil + RTL) · [SONNET kod / Haiku-Sonnet içerik] · ✅* doğrula
```
Scope: content/en/{ru,fr,nl,es,ar}/**, app/(en)/en/{ru,fr,nl,es,ar}/**
Durum: 5 dilde home + services/sourcing + layout MEVCUT. Doğrula/hizala.
Kabul: /en/ar dir="rtl" + mantıksal CSS + bdi (I18N §4); bölge CTA (ru→Telegram, ar→WhatsApp, fr→vous, nl→doğrudan, es→ustedes); canonical kendi URL; hreflang VERİSİ manifest'e (2.8 yazar).
```

### Step 2.7 — Komplex Varyant Layout · [OPUS 5.5] · ✅* doğrula (yalnız rework gerekirse Opus)
```
Scope: lib/ui/** (VariantShell/ChannelCta/LangSwitcher), varyant layout
Durum: lib/ui MEVCUT (VariantShell, ChannelCta, LangSwitcher, tokens, variant CSS). Doğrula.
Kabul: 5 varyantta smoke test; RTL mirror tüm komponentlerde; lighthouse değişmez; hardcoded hex=0.
Not: Mevcut ve çalışıyorsa doğrulama Haiku/Sonnet ile yapılır; sadece kalıp değişikliği/yeniden yazım gerekirse Opus.
```

### Step 2.6 — Görsel Üretim · [GEMINI 🟡 + HAIKU script] · ⏸ ERTELE
```
Scope: public/media/**
Durum: Gemini görsel ayarı EN SONDA (AGENTS.md §9). Şimdi üretme.
Şimdilik (opsiyonel, Haiku): media-manifest.json iskeleti + crop script (OG 1200×630 / hero 1920×1080) hazır dursun; görseller placeholder. Gerçek üretim Gemini açılınca.
```

### Step 2.8 — hreflang/Sitemap/llms Enjeksiyonu · [HAIKU 5.5] · ortak dosya tekeli
```
Scope: app/sitemap.ts, lib/hreflang.*, public/llms.txt (yalnız bu adım)
Ön koşul: 2.1–2.5 manifest'leri hazır.
Görev: sitemap-en + sitemap-en-{ru,fr,nl,es,ar}; /en ailesi hreflang seti (en + varyantlar + VARSA tr karşılığı — yoksa yazma, 404-hreflang yasağı §1.4); llms.txt güncelle (20 ürün + 5 sektör + hizmetler).
Kabul: karşılıklılık script temiz; tüm URL 200; hreflang↔dizin eşleşme; 404-hreflang=0.
```

### Step 2.9 — QA Turu · [HAIKU 5.5]
```
Scope: qa/** (qa/FAZ-2/rapor.md oluştur)
Ön koşul: §2'de 1–8 (2.6 hariç) ✅.
Görev: H1 kalıbı 20 sayfada script eşleşme · partner bloğu placeholder/consent tutarlı · RTL DOM testi (ar) · kanal CTA matrisi · batch tutarlılık (kalıp kırılması=red) · hreflang 404 testi · kelime/meta eşikleri · hardcoded hex=0 · scope ihlali=0 · build+lint (eslint config FAZ 1'de eklendi).
Kural: kanıtsız pass yasak. Bitince §2 2.9 ⏸ → bana özet.
```

### Step 2.10 — Faz Çıkışı · [HAIKU 5.5] 🚦 · 👤
```
Scope: qa/**
Görev: ROADMAP FAZ 2 çıkış kriterleri işaretle → insana özet: [20 ürün şablon testi] [5 hizmet + 5 industry canlı] [5 varyant + RTL] [hreflang karşılıklılık + 404] [llms güncel] [partner consent filtresi — placeholder durumu belgeli] [görsel: Gemini'ye ertelendi, kota notu] [lighthouse: canlı URL/8.1'e devredildi] [gitleaks temiz].
👤: "devam et" → FAZ 3 (Admin + API — Opus ağırlıklı, güvenlik fazı).
```

---

## 4. ÇALIŞMA GÜNLÜĞÜ (append-only)

> Format: `- [TARİH SAAT] <Model> · Step <no> · <durum> — ne; dosyalar; kabul; commit <hash>; eksik`

- [2026-10-15] Pano kurulumu — Repo denetimi: 2.4/2.5/2.7 MEVCUT (doğrulanacak). AÇIK: 2.1 global services içeriği eksik, 2.2/2.3 ürünler yok, 2.8 en sayfaları sitemap'te yok, 2.9 qa yok. 2.6 görsel Gemini'ye ertelendi.
- [2026-10-15] Karar — 2.3 partner bloğu: SEÇENEK A ONAYLANDI (insan). 20 ürün sayfası placeholder "onaylı partner bekleniyor" bloğuyla üretilecek; gerçek logolar FAZ 3/8'de dolar.
- [2026-10-16] Haiku 5.5 · Step 2.9 · BEKLEMEDE — ön koşul §2 1–8 (2.6 hariç) ✅; şu an ✅ değil: 2.4 (rework), 2.5 (rework), 2.7 (rework), 2.8 (BEKLEMEDE). `qa/FAZ-2/rapor.md` oluşturulmadı. Sıra kuralı gereği 2.9 başlamadı; `qa/**` değişmedi.
- [2026-10-15] Haiku 5.5 · Step 2.8 · BEKLEMEDE — 2.8 bağımlılığı `2.1–2.5`; 2.4 ve 2.5 ✅ değil (rework gerekli, yukarıdaki kayıt). Sıra kuralı gereği başlanmadı; hiçbir dosya (app/sitemap.ts, lib/hreflang.*, public/llms.txt) değiştirilmedi. Açılış koşulu: 2.4 rota taşıma (`/en/industries`) + title/kaynak ve 2.5 `<html lang>`/`dir` rework'ü tamamlanıp ✅ olunca 2.8 başlar. Not: rota düzeltilmeden `/en` ailesi hreflang/sitemap'e `/en/industries` yazılırsa 404-hreflang yasağı ihlal edilir.
- [2026-10-15] Haiku 5.5 · Step 2.4 / 2.5 / 2.7 · DOĞRULAMA — kod DEĞİŞTİRİLMEDİ (rework yapılmadı; insan talimatı). Sonuç: ✅ hiçbiri; üçü de rework gerekli.
  - **2.4 industries (5) — rework gerekli (Sonnet):** (a) meta title 74–79 karakter (`out/industries/*.html`), kabul ≤60; (b) kaynak linki YOK — 5 md'de `http` = 0 (rakam iddiası kaynaksız); (c) ROTA: `app/(en)/industries/` → build'de `/industries/*` (ör. `out/industries/construction.html`), `out/en/industries` yok; canonical `https://bdimexport.com/en/industries` ve index linkleri `/en/industries/${slug}` → kırık. Düzeltme: sayfalar `app/(en)/en/industries/` altına taşınmalı (diğer en sayfaları gibi). Geçenler: Article + ClaimReview (build'de 1+1 her sayfada) ✅; ≥1000 kelime (1364–1437) ✅; ürün iç linki 4/4/4/4/4 ✅. Ek: `app/(en)/industries/` içinde 69 hardcoded hex (`[slug]/page.tsx` 43, `page.tsx` 26) — hex=0 kuralı ihlali.
  - **2.5 varyantlar — rework gerekli (Sonnet):** (a) `<html lang="tr">` 5 varyantın hepsinde (`out/en/{ru,fr,nl,es,ar}.html`) — kök `app/layout.tsx:15` sabit `tr`; SEO_PLAYBOOK §3 `<html lang>` = sayfa dili istiyor. (b) `/en/ar`: `dir="rtl"` yalnız `VariantShell` div'inde (`lib/ui/VariantShell.tsx:42`), `<html>` üzerinde yok → SEO §3 ihlali. ✅ geçenler: canonical kendi URL (5/5); bölge CTA — ru Telegram (`lib/ui/variants.ts:26`), ar WhatsApp, fr "vous" (Vos canaux), nl doğrudan e-posta, es "ustedes" (Envíen/reciban); `<bdi dir="ltr">` ar'da var; fiziksel CSS (left/right/margin-left vb.) lib/ui + ar'da 0.
  - **2.7 lib/ui — rework gerekli (Opus'a devir):** (a) 5 varyant smoke test YOK — `find lib/ui app/(en) -name "*.test.*"` yalnız `app/(en)/en/products/_lib/catalog.test.mjs`; (b) RTL mirror: VariantShell `dir`/`vars(rtl)` ve `md.tsx` bdi sarma ✅, fiziksel CSS yok ✅; (c) hex: lib/ui (tokens.ts hariç) 0 ✅; `tokens.ts` 6 hex yalnız token tanımı (beklenen); app/(en) 69 → 2.4 bulgusu. Lighthouse: ölçülmedi (canlıda, 2.10).
  - Build: bu turda çalıştırılmadı (ölçümler mevcut `out/` çıktısından). Commit: yalnız panel kaydı; kod commit'i yok.
- [2026-10-15] Sonnet 5.5 · Step 2.1 · ✅ (tek commit: "FAZ_2 2.1: /en global hizmet sayfaları (5)"; hash `git log -1`; dal `tasks/faz0-progress-panel`) — DOSYALAR (13): content/en/global/services/{sourcing,manufacturing,inspection,logistics,customs,index}.md · content/en/global/global-manifest.json (hreflang VERİSİ) · app/(en)/en/_lib/{services.tsx,GlobalShell.tsx} · app/(en)/en/services/{page.tsx,[slug]/page.tsx} · app/(en)/en/page.tsx (5 hizmete link) · FAZ_2_AJAN_PANOSU.md. Scope dışına yazılmadı; sitemap/hreflang/llms DOKUNULMADI (2.8). İÇERİK: global ALICI niyetiyle yeniden yazım (TR /ithalat sayfalarının çevirisi değil — onlar Çin→TR ithalat, bunlar TR→dünya ihracat alıcısı); SLA cümleleri; istatistik/rakam/partner adı/yorum YOK. KABUL KANITI: kelime (sıkı ölçüt: yalnız harf/rakam içeren belirteç; tablo çizgisi/META/H1 hariç) sourcing 874 · manufacturing 917 · inspection 967 · logistics 885 · customs 904 (≥800); sayfada görünen metin (nav+CTA hariç) 877/921/971/890/910; title 46–51 karakter (apostrofsuz/&'siz → ham-HTML = gerçek), description 141–156 (120–158); FAQ 6/sayfa; build exit 0 (56/56 sayfa, +6), `pnpm lint` 0 hata (1 eski uyarı); out/ HTML: canonical = kendi URL'si, hreflang etiketi 0 (kök layout'un TR/x-default mirası `alternates` ile ezildi), JSON-LD parse OK: Service+FAQPage+BreadcrumbList (indeks: BreadcrumbList+ItemList), h1=1, #get-quote + mailto var, dahili satır sızıntısı 0; yeni kodda hex/px = 0 (yalnız lib/ui/tokens). KARARLAR: (1) 'quotation formu' YOK — lead POST endpoint'i FAZ 3'te (workers/api'de yalnız partners/apply var) ve 1.6'da sahte-submit formunun yarattığı veri kaybı tekrarlanmasın diye SAHTE FORM YAZILMADI; CTA = GlobalShell üst barı + sayfa sonu #get-quote bloğu, kanal = gerçek `mailto:` (env NEXT_PUBLIC_QUOTE_EMAIL, varsayılan iletisim@bdimexport.com KVKK metninde 'geçici' etiketli). (2) CTA layout yerine sayfa düzeyi (GlobalShell): app/(en)/layout.tsx tüm (en) grubunu sarar, varyant layout'ları kendi CTA/footer'ına sahip → çift CTA olurdu; app/(en)/layout.tsx scope dışı. (3) Markdown için lib/ui/md (üçüncü kopya yazılmadı); stil lib/ui/variant.module.css; lib/ui DEĞİŞTİRİLMEDİ. (4) TR karşılığı yok → hreflang tr yazılmaz (manifest `tr_counterpart: null` + gerekçe). 2.8'E DEVİR (manifest): sourcing için en-RU/FR/NL/ES/AR sayfaları MEVCUT → set: en + 5 varyant; diğer 4 hizmet yalnız `en` (varyant sayfası yok, 404-hreflang yasağı). Karşılıklılık: /en/{v}/services/sourcing sayfaları da /en/services/sourcing'e hreflang=en vermeli. AÇIK / İNSAN KARARI: (a) ⚠️ 2.4 ROTA HATASI: `app/(en)/industries/**` URL'si `/industries/*` (route group (en) URL'ye girmez); sayfaların kendi canonical'ı ve iç linkleri `/en/industries/*` → şu an 404. Çözüm: klasör `app/(en)/en/industries` altına taşınmalı (2.4 doğrulamasında). Hizmet sayfalarım bu yüzden 2 sayfada (sourcing, manufacturing) kırık iç link içeriyor — hedef URL DOĞRU, 2.4 düzelince kendiliğinden çözülür. Ayrıca 2.4 kodu hardcoded hex + inline stil + ClaimReview'da kaynaksız '5/5' puan + sabit rakamlar ($31.45 milyar vb.) içeriyor — doğrulanmadı, 2.4 adımında kontrol edilmeli. (b) SLA taahhütleri iş sahibi onayı gerektirir: 24h teklif (tüm hizmetler) · sourcing shortlist ≤5 iş günü · manufacturing geliştirme planı ≤5 iş günü · inspection raporu ≤48 saat · logistics rota/maliyet 24h · customs checklist 24h · 'müfettiş alıcıya raporlar' bağımsızlık taahhüdü. 48 saat TR fabrika-denetimi sayfasıyla, 24h CONTENT_STYLE §5 ile uyumlu; ≤5 iş günü talimatla eklendi. (c) Gümrük/menşe ifadeleri (AB–TR gümrük birliği, ATR/EUR.1, menşe şahadetnamesi odalardan) GENEL ve 'ürün kapsamı/menşe kurallarına bağlı' notlu; hukuki/gümrük uzmanı gözden geçirmeli. (d) /en layout dil değiştirici yok (global /en ↔ varyant geçişi 2.8 hreflang verisiyle birlikte); og:image yok (Gemini görsel, 2.6 ertelendi).
- [2026-10-15] Sonnet 5.5 · Step 2.2 · ✅ (tek commit: "FAZ_2 2.2: ürün liste + 5 kategori + ItemList"; hash `git log -1`; dal `tasks/faz0-progress-panel`) — DOSYALAR (14): app/(en)/en/products/{page.tsx, category/[category]/page.tsx, _lib/catalog.ts, _lib/catalog.test.mjs, _lib/views.tsx} · content/en/global/products/{_categories.json, _categories.manifest.json, _categories/{index,textile,food,machinery,construction,home-living}.md} · FAZ_2_AJAN_PANOSU.md. Scope dışına yazılmadı; sitemap/hreflang/llms DOKUNULMADI (2.8); 2.1'in _lib'ine dokunulmadı (yalnız import). URL SÖZLEŞMESİ (2.3 BUNA BAĞLANIR): `/en/products` (liste) · `/en/products/category/{textile|food|machinery|construction|home-living}` (kategori) · `/en/products/{slug}` (ürün — 2.3'ün `app/(en)/en/products/[slug]`'ı; 'category' slug'ı YASAK, testle zorunlu). 20 ürün slug'ı + ad + keyword + kısa tanım: content/en/global/products/_categories.json (industries sayfalarının zaten verdiği 19 slug'a hizalı; home-living'in çakışan 4.'sü `home-textiles` textile'a bırakıldı, home-living 4. ürün = `carpets-rugs`). MİMARİ KARAR 'D1 contents+partners bileşimi': site static export → build-time D1 YOK ve `GET /api/v1/partners` API anahtarı ister (herkese açık değil). Bu yüzden: (a) ÜRÜNLER = git (mimari.md §4 'kalıcı SEO sayfaları'): ürün LIVE ⇔ content/en/global/products/{slug}.md MEVCUT; yoksa 'Coming soon', LİNK YOK (404'a link yasağı); 2.3 dosya ekledikçe liste/ItemList/indexable kendiliğinden güncellenir. (b) PARTNERLER = D1 DIŞA AKTARIMI: content/en/global/products/_partners.json (YOK → boş liste → 'coming soon' bloğu); yalnız approved; logo yalnız consent_logo_en=true (rızasız ASLA); agent partner uyduramaz. Dışa aktarımı üreten betik FAZ 3/8 işi. 'BOŞ KATEGORİ YÖNETİMİ': yayımlanmış ürünü olmayan kategori = `robots: noindex, follow` (ince içerik koruması; ilk ürün yayımlanınca build'de OTOMATİK indekslenir) ve ItemList YAYIMLANMAZ (boş/URL'siz ItemList geçersiz); /en/products her zaman indekslenebilir. 2.8: sitemap'e YALNIZ indexable sayfalar yazılmalı (manifest `indexable` alanı). ANCHOR KURALI (SEO_PLAYBOOK §7 / CONTENT_STYLE §5): kategori→ürün bağlantı metni = ürünün H1 kalıbından gelen keyword'ü ('Olive oil manufacturers in Turkey'), 'buraya tıklayın' yok (testle zorunlu). KABUL KANITI: `pnpm build` exit 0 (62/62 sayfa, +6); `pnpm lint` 0 hata (1 eski uyarı); katalog testi `node --experimental-strip-types --test` 7/7 (20 benzersiz slug, 'category' yasağı, coming-soon/live/indexable, partner süzgeci: onaysız görünmez + rızasız logo taşınmaz, bozuk katalog reddi). out/ HTML: 6 sayfada title 48–55, description 140–153, canonical = kendi URL'si, hreflang etiketi 0, h1=1, kırık iç link 0 (endüstri linkleri hariç); /en/products: BreadcrumbList+CollectionPage+ItemList (5 kategori, her öğe position+name+url) geçerli; 5 kategori noindex + ItemList yok (0 live). GERÇEK FLIP TESTİ: geçici `olive-oil.md` ile build → food kategorisi noindex'ten çıktı, ItemList 1 geçerli öğe ('Extra Virgin Olive Oil', url), anchor 'Olive oil manufacturers in Turkey', textile noindex kaldı; dosya SİLİNDİ, yeniden build ile out/ temizlendi (kalıntı yok). Yeni kodda hex/px=0 (tokens). 2.3'E KRİTİK UYARI: LIVE kuralı yalnız `{slug}.md` dosyasına bakar; md ile `app/(en)/en/products/[slug]/page.tsx` AYNI adımda gelmeli, aksi halde liste var olmayan sayfaya link verir (flip testinde bu yüzden 'kırık link' görüldü — beklenen). AÇIK: (a) 2.4 rota hatası sürüyor: kategori sayfalarındaki 'industry overview' linkleri (/en/industries/*) ve /en/industries/* tüm linkler 404 (2.1 kaydı). (b) GlobalShell/footer'da 'Products' bağlantısı YOK (_lib 2.1 dosyası, bu adımın scope'u dışı) — /en/products yalnızca sayfa içi linklerle erişilebilir; 2.8/2.7'de menüye eklenmeli. (c) Kategori metinleri ~150 kelime (ince; bu yüzden noindex kuralı) ve genel nitelikte: sertifika adları (OEKO-TEX, BRCGS/IFS, CE) 'örnek/ilgiliyse' çerçevesinde, istatistik yok; uzman gözden geçirmeli. (d) 2.2 H1 pattern'i yalnız ürün sayfaları için [ŞART]; kategori H1'leri '{Kategori} Manufacturers in Turkey | B2B Sourcing' (aynı kalıp, onay gerekmez ama QA 2.9 ürün H1 testinden ayrı tutmalı).
- [2026-10-15] Sonnet 5.5 · Step 2.3 · ✅ (tek commit: "FAZ_2 2.3: 20 ürün SEO/GEO (placeholder partner bloğu)"; hash `git log -1`; dal `tasks/faz0-progress-panel`) — DOSYALAR (25): content/en/global/products/{20 ürün .md, _stats.json, _products.manifest.json} · app/(en)/en/products/[slug]/{page.tsx,_view.tsx} · FAZ_2_AJAN_PANOSU.md. Scope dışına yazılmadı; sitemap/hreflang/llms DOKUNULMADI (2.8); 2.1/2.2 dosyalarına dokunulmadı (yalnız import). BLOK SIRASI (CONTENT_STYLE §2, 20/20 sayfada HTML'de doğrulandı): Hero+CTA('Get Free Quotation in 24h') → Why Source → Official Trade Data (3 yıl tablosu) → Working with … (5 adım) → Verified Turkish Partners (PLACEHOLDER) → Quality Control → SSS → Request Your Free Quotation (+ sayfa sonu #get-quote). Ek içerik H3 alt bölümler olarak BLOK İÇİNE eklendi (sıra bozulmadı). H1 [ŞART] `{Product} Manufacturers in Turkey | B2B Sourcing` 20/20 birebir. ⚠️ SAYILAR — EN KRİTİK KARAR: Kural 'her rakam linkli kaynak, kaynaksız=red'. TÜİK/TİM'in ürün bazlı 3 yıllık serisi makinece okunabilir/herkese açık API'yle alınamadı (TÜİK veri portalı JS ile yükleniyor; deep-link doğrulanamadı). Bu yüzden **UN Comtrade kamu önizleme API'si** (reporter Türkiye=792, flow=ihracat, partner=dünya, yıllık, HS) kullanıldı — Türkiye verisi TurkStat'ın gümrük beyannamelerinden derlediği veridir. YIL: 2023–2025 (2025 mevcut). 60 sorgu (20 ürün × 3 yıl), hepsi 200, eksik HS kodu YOK. Çoklu HS kodu değerleri toplandı. Her tablo hücresi KENDİ sorgu URL'sine linkli (tıklayınca ham JSON doğrulanır); kaynak satırında UN Comtrade+ portalı (comtradeplus.un.org) + TurkStat dış ticaret veri-seti açıklaması (tuik.gov.tr/media/microdata/pdf/dis-ticaret.pdf; arama ile doğrulandı) linkli; erişim tarihi 15 Ekim 2026. Sayılar ELLE YAZILMADI: üretici betik _stats.json/comtrade çıktısından basıyor. BAĞIMSIZ DOĞRULAMA: 4 hücre (olive-oil 2025, steel 2024, ceramics 2023, hvac 2025) canlı API'den yeniden çekildi → sayfadaki değerle BİREBİR eşit. DÜRÜSTLÜK NOTLARI: (a) HS kodları ürünü tam kapsamaz → her sayfada 'What the codes include' notu var: örn. hvac-systems 8418 ev tipi buzdolabı/oda klimasını da içerir (rakamı şişirir), agricultural-machinery 8701 tüm traktörleri (yol çekicileri dahil), denim yalnız pamuklu pantolon (jean proxy'si), hospitality-furniture ayrı raporlanmaz (ahşap mobilya genel göstergesi), ceramics 6907 2022 HS revizyonu sonrası yapı → yalnız 2023–2025. (b) olive-oil 2025 değeri 2023'ün çok altında (774.8 → 267.9 milyon $) — GERÇEK veri; sayfada NEDEN iddia edilmedi (yalnız 'higher/lower' + 'son yıl revize olabilir'). (c) Tablo dışında HİÇ istatistik/yüzde/sıralama iddiası yok (betikle tarandı: sayılar yalnız SLA'lar, yıllar, HS kodları, standart adları). İÇERİK: 20 sayfa × 1302–1584 kelime (görünür sayfa; kaynak md 1241–1523, sıkı ölçüt), title 44–60 (60 = hospitality-furniture), description 140–157, 9 SSS/sayfa (180 SSS; şema = görünür metin, betikle doğrulandı), keyword ilk 100 kelimede + H2'de, yoğunluk ≤2.5%. Anchor kuralı: kategori↔ürün bağlantı metni = ürün keyword'ü; her ürün ≥3 iç link. Metinler ürüne özgü (şablon yalnız yapı); sertifika/standart adları (OEKO-TEX, GOTS, BRCGS/IFS/FSSC 22000, EN 10204 3.1, ISO 10545, CE/ATEX…) 'ilgiliyse/ürüne göre doğrulanır' çerçevesinde. Batch kuralı: 2 üretim batch'i (10+10 ürün metni) + 2 genişletme batch'i + 2 ek batch (kalite kontrollü). ŞEMA: Product + FAQPage + Organization + BreadcrumbList; Offer'da FİYAT/STOK YOK ('price on request'). PARTNER: md'deki {{partners}} işaretçisi _view.tsx'te dolduruluyor — _partners.json (D1 dışa aktarımı) YOKSA 'Approved partners are being onboarded…' placeholder (`data-partner-state=placeholder`, 20/20); VARSA yalnız approved, logo yalnız consent_logo_en=true (2.2 katalog testi 7/7 bunu kanıtlıyor). Partner UYDURULMADI. KABUL KANITI: `pnpm build` exit 0 (82/82 sayfa, +20); `pnpm lint` 0 hata (1 eski uyarı); catalog testi 7/7; out/ HTML 20/20 sayfa 0 sorun: canonical = kendi URL'si, hreflang 0, noindex 0, h1=1, kırık iç link 0. KATEGORİ SAYFALARI: 2.2'nin 'yayımlanmış ürün yoksa noindex' kuralı OTOMATİK devreye girdi — 5 kategori artık indexable, her birinde 4 live link + geçerli ItemList(4), 'Coming soon' 0. 2.8'E DEVİR (content/en/global/products/_products.manifest.json): sitemap-en'e 1 indeks + 5 kategori + 20 ürün (hepsi indexable); hreflang yalnız `en`; llms.txt'e 20 ürün. AÇIK / İNSAN KARARI: (a) 👤 TÜİK/TİM resmi bülteniyle çapraz doğrulama + sayıların yıllık yenilenmesi (Comtrade önizleme API'si anahtarsız ve hız sınırlı; üretim için resmi kaynak veya anahtarlı API önerilir). (b) 'Customs union' cümlesi 10 sayfada (sanayi ürünleri) genel ve 'kapsam/menşe kurallarına bağlı' notlu; gıda sayfalarında yok. Gümrük/ürün güvenliği ifadeleri (CE/ATEX/PED, gıda temas, aflatoksin) uzman gözden geçirmeli. (c) 2.4 rota hatası sürüyor (/industries vs /en/industries) — bu sayfalar endüstri sayfasına LİNK VERMİYOR (kırık link eklememek için). (d) GlobalShell/footer'da 'Products' bağlantısı hâlâ yok (2.1 dosyası, scope dışı). (e) Aynı ürün sayfalarında 'verified manufacturers/vetting' dili var ama onaylı partner SIFIR — metin süreç tanımıdır, partner varlığı iddia etmez; yine de 3/8 öncesi canlıya alınırken 'verified' ifadeleri insan gözüyle kontrol edilmeli.

---

## 5. İNSAN AKSİYON NOKTALARI (👤)

1. **2.3 partner kararı: ✅ A ONAYLANDI (2026-10-15).** 20 ürün sayfası "onaylı partner bekleniyor" placeholder sosyal-kanıt bloğuyla üretilir; gerçek logolar FAZ 3 (admin onay) + FAZ 8 (gerçek başvuru) ile otomatik dolar. Uydurma partner YASAK.
2. **2.6 görsel:** Gemini ayarı en sonda → bu fazda placeholder. Ek iş yok.
3. **2.10 sonrası:** "devam et" → FAZ 3.
4. **Dal:** FAZ 2 işi feature dalında; faz sonunda main'e squash-merge.
