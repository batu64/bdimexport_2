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
| 2 | 2.2 ürün liste + kategori | **Sonnet 5.5** | 2.1 | ⏳ yok | — |
| 3 | 2.3 20 ürün SEO/GEO | **Sonnet 5.5** (ucuz: Haiku) | 2.2 | ⏳ yok — PLACEHOLDER partner bloğu (A ONAYLI) | insan |
| 4 | 2.4 industries (5) | **Sonnet 5.5** | — | ✅* mevcut — doğrula · ⚠️ ROTA HATASI (2.1 bulgusu): `/industries/*` üretiliyor, canonical/linkler `/en/industries/*` (§4) | önceki |
| 5 | 2.5 varyant iskeletleri (5 dil + RTL) | kod **Sonnet** · içerik **Haiku/Sonnet** | 2.1 | ✅* mevcut — doğrula | önceki |
| 6 | 2.7 komplex varyant layout | **Opus 5.5** | 2.5 | ✅* mevcut (lib/ui) — doğrula | önceki |
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
- [2026-10-15] Sonnet 5.5 · Step 2.1 · ✅ (tek commit: "FAZ_2 2.1: /en global hizmet sayfaları (5)"; hash `git log -1`; dal `tasks/faz0-progress-panel`) — DOSYALAR (13): content/en/global/services/{sourcing,manufacturing,inspection,logistics,customs,index}.md · content/en/global/global-manifest.json (hreflang VERİSİ) · app/(en)/en/_lib/{services.tsx,GlobalShell.tsx} · app/(en)/en/services/{page.tsx,[slug]/page.tsx} · app/(en)/en/page.tsx (5 hizmete link) · FAZ_2_AJAN_PANOSU.md. Scope dışına yazılmadı; sitemap/hreflang/llms DOKUNULMADI (2.8). İÇERİK: global ALICI niyetiyle yeniden yazım (TR /ithalat sayfalarının çevirisi değil — onlar Çin→TR ithalat, bunlar TR→dünya ihracat alıcısı); SLA cümleleri; istatistik/rakam/partner adı/yorum YOK. KABUL KANITI: kelime (sıkı ölçüt: yalnız harf/rakam içeren belirteç; tablo çizgisi/META/H1 hariç) sourcing 874 · manufacturing 917 · inspection 967 · logistics 885 · customs 904 (≥800); sayfada görünen metin (nav+CTA hariç) 877/921/971/890/910; title 46–51 karakter (apostrofsuz/&'siz → ham-HTML = gerçek), description 141–156 (120–158); FAQ 6/sayfa; build exit 0 (56/56 sayfa, +6), `pnpm lint` 0 hata (1 eski uyarı); out/ HTML: canonical = kendi URL'si, hreflang etiketi 0 (kök layout'un TR/x-default mirası `alternates` ile ezildi), JSON-LD parse OK: Service+FAQPage+BreadcrumbList (indeks: BreadcrumbList+ItemList), h1=1, #get-quote + mailto var, dahili satır sızıntısı 0; yeni kodda hex/px = 0 (yalnız lib/ui/tokens). KARARLAR: (1) 'quotation formu' YOK — lead POST endpoint'i FAZ 3'te (workers/api'de yalnız partners/apply var) ve 1.6'da sahte-submit formunun yarattığı veri kaybı tekrarlanmasın diye SAHTE FORM YAZILMADI; CTA = GlobalShell üst barı + sayfa sonu #get-quote bloğu, kanal = gerçek `mailto:` (env NEXT_PUBLIC_QUOTE_EMAIL, varsayılan iletisim@bdimexport.com KVKK metninde 'geçici' etiketli). (2) CTA layout yerine sayfa düzeyi (GlobalShell): app/(en)/layout.tsx tüm (en) grubunu sarar, varyant layout'ları kendi CTA/footer'ına sahip → çift CTA olurdu; app/(en)/layout.tsx scope dışı. (3) Markdown için lib/ui/md (üçüncü kopya yazılmadı); stil lib/ui/variant.module.css; lib/ui DEĞİŞTİRİLMEDİ. (4) TR karşılığı yok → hreflang tr yazılmaz (manifest `tr_counterpart: null` + gerekçe). 2.8'E DEVİR (manifest): sourcing için en-RU/FR/NL/ES/AR sayfaları MEVCUT → set: en + 5 varyant; diğer 4 hizmet yalnız `en` (varyant sayfası yok, 404-hreflang yasağı). Karşılıklılık: /en/{v}/services/sourcing sayfaları da /en/services/sourcing'e hreflang=en vermeli. AÇIK / İNSAN KARARI: (a) ⚠️ 2.4 ROTA HATASI: `app/(en)/industries/**` URL'si `/industries/*` (route group (en) URL'ye girmez); sayfaların kendi canonical'ı ve iç linkleri `/en/industries/*` → şu an 404. Çözüm: klasör `app/(en)/en/industries` altına taşınmalı (2.4 doğrulamasında). Hizmet sayfalarım bu yüzden 2 sayfada (sourcing, manufacturing) kırık iç link içeriyor — hedef URL DOĞRU, 2.4 düzelince kendiliğinden çözülür. Ayrıca 2.4 kodu hardcoded hex + inline stil + ClaimReview'da kaynaksız '5/5' puan + sabit rakamlar ($31.45 milyar vb.) içeriyor — doğrulanmadı, 2.4 adımında kontrol edilmeli. (b) SLA taahhütleri iş sahibi onayı gerektirir: 24h teklif (tüm hizmetler) · sourcing shortlist ≤5 iş günü · manufacturing geliştirme planı ≤5 iş günü · inspection raporu ≤48 saat · logistics rota/maliyet 24h · customs checklist 24h · 'müfettiş alıcıya raporlar' bağımsızlık taahhüdü. 48 saat TR fabrika-denetimi sayfasıyla, 24h CONTENT_STYLE §5 ile uyumlu; ≤5 iş günü talimatla eklendi. (c) Gümrük/menşe ifadeleri (AB–TR gümrük birliği, ATR/EUR.1, menşe şahadetnamesi odalardan) GENEL ve 'ürün kapsamı/menşe kurallarına bağlı' notlu; hukuki/gümrük uzmanı gözden geçirmeli. (d) /en layout dil değiştirici yok (global /en ↔ varyant geçişi 2.8 hreflang verisiyle birlikte); og:image yok (Gemini görsel, 2.6 ertelendi).

---

## 5. İNSAN AKSİYON NOKTALARI (👤)

1. **2.3 partner kararı: ✅ A ONAYLANDI (2026-10-15).** 20 ürün sayfası "onaylı partner bekleniyor" placeholder sosyal-kanıt bloğuyla üretilir; gerçek logolar FAZ 3 (admin onay) + FAZ 8 (gerçek başvuru) ile otomatik dolar. Uydurma partner YASAK.
2. **2.6 görsel:** Gemini ayarı en sonda → bu fazda placeholder. Ek iş yok.
3. **2.10 sonrası:** "devam et" → FAZ 3.
4. **Dal:** FAZ 2 işi feature dalında; faz sonunda main'e squash-merge.
