# OPUS 5.5 — TAM GÖREV TALİMATI (FAZ 4.6 → FAZ 9 + Ertelenenler)
**Proje:** bdimexport.com | **Sürüm:** 1.0 | **Tarih:** 27.10.2026 | **Yürütücü:** **yalnız Opus 5.5**
**Amaç:** Projenin kalan tüm görevlerini ve fazlarını (FAZ 4'ün 4.6'dan sonrası + FAZ 5–9 + proje-sonu ertelenenler) baştan sona, tek başına yürütmen için yetkili talimat.

> ⚠️ **MODEL KURALI DEĞİŞTİ (kullanıcı kararı, 27.10.2026):** Bundan sonra **tüm adımlar Opus 5.5 ile** yapılır. Bu, `AGENTS.md §7` tablosundaki Haiku/Sonnet/Opus dağılımını **yürütme açısından geçersiz kılar** (o dağılım maliyet içindi; kullanıcı artık her şeyi Opus ile istiyor). AGENTS.md'nin **diğer her kuralı yürürlükte:** scope kilitleri (§4), sıralı yürütme (§5), güvenlik kilidi (§8), runtime AI = Gemini (§3/§9).

---

## 0. HER GÖREVDE UYACAĞIN KURALLAR (değişmez)

1. **Önce oku:** `AGENTS.md`, ilgili `fazlar/FAZ_N.md` (yetkili adım detayı), ilgili `FAZ_N_AJAN_PANOSU.md` (varsa; yoksa faz başında kur — aşağı bak).
2. **Tek scope / tek commit:** Bir adım yalnız kendi scope dizinlerine yazar. İki rolün dizinine aynı commit'te yazma. Commit öncesi `git status` + `git diff --cached` ile index'i kontrol et (başka değişiklik karışmasın).
3. **Sıralı yürütme:** Eş zamanlılık yok. Faz panosundaki sırayı izle; bağımlılığı ✅ olmayan adıma başlama.
4. **Ortak dosya tekeli:** `app/sitemap.ts`, `lib/hreflang.*`, `public/llms.txt`, `public/robots.txt` → yalnız "orchestrator-rolü" adımlarında (hreflang/sitemap enjeksiyonu, yayın otomasyonu). Başka adımda dokunma.
5. **Runtime AI = Gemini STUB (E3):** Uygulamanın çalışma-zamanı AI çağrıları (içerik üretimi, özet, keyword, görsel) **mock/stub** ile yazılır: arayüz + env placeholder + `TODO(E3)`. Gerçek Gemini anahtarı/model **proje sonunda** (bu dosya §9 + AGENTS.md §9). Asla gerçek anahtar bekleme, asla başka sağlayıcı kullanma.
6. **Değişmez yayın kuralı:** Hiçbir AI metni `status: draft` dışına **insan onayı olmadan** geçmez.
7. **Deterministik iş AI'dan geçmez:** sitemap/hreflang/RSS parse/TTL/dedup = script.
8. **Secret kodda ASLA:** env/Cloudflare Secrets. gitleaks temiz şart.
9. **İNSAN KAPILARI (👤) — DUR ve sor, sen yapamazsın:**
   - Secret **değerleri** (`wrangler secret put`), kredansiyel dosyası okuma
   - **Production deploy / prod migration** (sınıflandırıcı engeller)
   - Cloudflare/Google **dashboard güvenlik ayarları** (Access, OAuth, Pages toggle, WAF, DNS, custom domain)
   - **Hukuki metin onayı/imzası** (KVKK, Impressum/Datenschutz), **palet/tasarım onayı**, **faz çıkış "devam et"**, kültür onayı
   - Bu noktalarda: kodu/şablonu/rehberi hazırla, durumu ⏸ yap, kullanıcıya net "senin yapman gereken" özeti ver, onay/girdi gelmeden bağımlı adıma geçme.
10. **Erteleme:** İlerlemeyi bloklamayan, proje-sonu bir iş çıkarsa → `ERTELENEN_GOREVLER.md`'ye satır ekle (konu · faz · neden · ne zaman).
11. **Raporlama:** Her adım sonunda: değişen dosyalar + kabul testi sonucu (kanıtlı) + önerilen commit + varsa 👤 aksiyonu. Düz "yaptım" yasak.
12. **Faz panosu:** Her faz için `FAZ_N_AJAN_PANOSU.md` (FAZ 0–4 formatında: §0 protokol, §1 kurallar, §2 canlı durum tablosu, §3 adım talimatları, §4 günlük, §5 insan aksiyonları). FAZ 5–9 panoları henüz YOK → o faza başlarken kur, sonra her adımda §2/§4 güncelle.
13. **Dal:** `tasks/faz0-progress-panel`. Faz sonunda main'e **squash-merge** (👤 tetik).

---

## 1. MEVCUT DURUM (snapshot, 27.10.2026)

- **FAZ 0–3 ✅ KAPANDI** (kod + staging): Foundation, TR site+huni, EN global (20 ürün+varyant+hreflang), Admin+API+güvenlik (0 kritik QA, insan imzalı).
- **FAZ 4 (İçerik Fabrikası) ~%50:** 4.1 RSS cron, 4.2 TTL+retention, 4.3 Trends, 4.4 batch özet, 4.5 makale üretim → hepsi **kod+stub ✅**. **Sıradaki: 4.6.**
- **Ertelenenler:** `ERTELENEN_GOREVLER.md` (S1 token rotasyonu · E1 Access/Google login · E2 custom domain · E3 Gemini runtime · E4 GSC/GA4 OAuth · E5 mail · E6 R2 lifecycle · C1 /v1/leads · C2 KVKK placeholder · C5 Lighthouse · C6 varyant içerik · temizlik). C3/C4 kapandı.
- **Not:** Cron worker'larının (4.1/4.2/4.3) staging'e gerçek deploy'u 👤 bekliyor — FAZ 4 sonunda toplu.

---

## 2. FAZ 4 KALAN — İçerik Fabrikası Otomasyonu (4.6 → 4.10)
> Yetkili detay: `fazlar/FAZ_4.md` · pano: `FAZ_4_AJAN_PANOSU.md`. Sıra: 4.6 → 4.7 → 4.8 → 4.9 → 4.10.

| Adım | Scope | Görev (özet) | 👤 |
| :-- | :-- | :-- | :-- |
| **4.6** Onay→yayın otomasyonu | `workers/**` + `app/sitemap.ts` + `public/llms.txt` (ortak dosya tekeli) | Admin "onayla" → kalıcı (ürün/sektör) **Git PR** (content/** + metadata) → merge → build; geçici (haber kartı) → contents(status=approved) → edge render. sitemap/llms güncelleme tek elden. **"approved" ≠ "published"** (iki ayrı status). PR bot'ta; merge insan/yetkili akış. | — |
| **4.7** Hata izleme/fallback/kota | `workers/api/**` (veya ortak lib) | ai_jobs retry (max 2); üretim hatası → Webhook alert (3.3 altyapısı); Gemini kota izleme (%80 → fallback); nightly hat raporu; alert spam önleme (aynı hata 1s/1). | — |
| **4.8** Baidu hazırlık | `app/sitemap.ts` (sitemap-zh placeholder) + docs | sitemap-zh placeholder (zh FAZ 5'te dolar) + Baidu submit rutini dokümanı + verification şablonu yeri. | 👤 Baidu hesabı **ERTELENEBİLİR** (FAZ 5'te aktif; hesap yoksa ERTELENEN'e ekle, placeholder bırak) |
| **4.9** QA (otomasyon) | `qa/**` | Tam hat e2e (haber→özet→üretim→draft→onay→yayın, **mock** üretimle, iki yol); TTL doğruluk; dedup; injection; fallback zincirleri; kota eşikleri; retry/blocked; prod D1 izolasyonu; **onaysız yayın negatif testi**. Gerçek Gemini stub → "E3'te doğrulanacak" işaretle. | — |
| **4.10** Faz çıkışı 🚦 | `qa/**` | Çıkış kriterleri → insana özet. ERTELENEN: gerçek Gemini runtime (E3), Baidu hesabı. | 👤 "devam et" + günlük üretim hız hedefi |

**FAZ 4 bitişinde:** cron worker'larını (cron-rss, cron-trends) staging'e deploy için kullanıcıya rehber ver (staging deploy'u sen koşabilirsin; prod 👤).

---

## 3. FAZ 5 — ZH + DE Tam Yerelleştirme
> Yetkili detay: `fazlar/FAZ_5.md`. İki hat (zh / de) ama tek yürütücü → **sıralı.** Palet zh (kırmızı-altın) / de (sade) FAZ 0'da onaylı. Sıra önerisi: 5.1 → 5.2 → 5.3 → 5.5 → 5.4 → 5.6 → 5.7 → 5.8 → 5.9 → 5.10 → 5.11.

| Adım | Scope | Görev (özet) | 👤 |
| :-- | :-- | :-- | :-- |
| **5.1** /de Impressum + Datenschutz 🔒⚖️ | `content/de/legal/**` + page.tsx | §5 TMG Impressum + DSGVO Datenschutz. Şirket verisi **insandan** (uydurma = hard-red). footer linkleri tüm /de'de. | 👤 **şirket verileri + hukuk imzası** (pazarlıksız) |
| **5.2** /zh iskelet + kimlik | `app/(zh)/**`, `content/zh/**` | kırmızı-altın layout (design-tokens zh varyantı), bağımsız nav, **WeChat QR** bileşeni, zh dictionary. 简体字 only; ICP vaadi YASAK (Cloudflare HK). | — |
| **5.3** /zh hizmet sayfaları | `content/zh/services/**` | 4–5 sayfa + Baidu meta (title ≤30, desc ≤78 Çince karakter). "Yerel ayak" vurgusu; ≥1200 kelime; FAQPage. Kontrol: terminoloji (I18N §3). | — |
| **5.4** /de hizmet sayfaları | `content/de/services/**` + `/de/vertrauen` | 5 hizmet DACH yerelleştirmesi (çeviri değil) + Trust sayfası (gerçek yorum/künye — uydurma = hard-red). **Formal Sie** (du/dich/euch = red); ≥1200 kelime; Service+FAQPage. | — |
| **5.5** /zh Baidu SEO | `app/(zh)` meta + sitemap-zh | Baidu verification meta (4.8 şablonu) + sitemap-zh gerçek URL'lerle + robots zh. | 👤 **Baidu doğrulama kodu girişi** |
| **5.6** /de + /zh kod bağlamları | `app/(de)/**`, `app/(zh)/**` | page.tsx render; de: GDPR double opt-in form katmanı; zh: WeChat QR davranışı (mobil aç/kopyala); generateMetadata + JSON-LD. tokens dışı stil YOK; lighthouse ≥90. | — |
| **5.7** Dil kalite turu | `qa/**` | zh öz-denetim + çapraz kontrol; de Sonnet-pass zaten (artık Opus); terminoloji diff + kültür kontrol listesi (zh kırmızı-altın bağlam, 4-sayısı; de Sie). | 👤 **zh kültür/marka onayı** |
| **5.8** hreflang/sitemap enjeksiyonu | `app/sitemap.ts`, `lib/hreflang.*` (ortak) | tr+en+de+zh **tam karşılıklı** hreflang (FAZ 2'de ertelenen tamamlanır); sitemap-de + sitemap-zh. | — |
| **5.9** QA | `qa/**` | Sie/du regex (/de); 简体字 (/zh); Baidu meta uzunlukları; Impressum/Datenschutz footer konumu; palet görsel; WeChat QR scan; hukuk↔form kategorileri; tam hreflang matrisi. | — |
| **5.10** Hukuk/kültür imza 🚀 | `qa/**` | 5.1 hukuk + 5.7 kültür + 5.9 topla. | 👤 **imza** (olmadan 5.11 yok) |
| **5.11** Faz çıkışı 🚦 | `qa/**` | Çıkış kriterleri → özet. | 👤 "devam et" |

---

## 4. FAZ 6 — Analitik + Raporlama
> Yetkili detay: `fazlar/FAZ_6.md`. Sıra: 6.1 → 6.2 → 6.3 → 6.5 → 6.6 → 6.4 → 6.7 → 6.8. **Not:** canlı veri GSC/GA4 OAuth'a (E4) bağlı → stub/boş-veri ile yaz, gerçek veri E4'te.

| Adım | Scope | Görev (özet) | 👤 |
| :-- | :-- | :-- | :-- |
| **6.1** Dönüşüm atıf modeli | `workers/api/**` | leads.source_page + utm → analytics_daily JOIN → attribution; sayfa bazlı dönüşüm. **Anonim JOIN** (kişisel veri eşleştirme YOK — KVKK); 30 gün pencere. | — |
| **6.2** Dashboard tamamlama | `app/admin/analytics/**` | Chart.js: trafik, lead kaynağı (6.1), en iyi içerik, locale kırılımı, keyword çıktı takibi. Salt-okunur; analytics_daily'den; boş-veri zarif. | — |
| **6.3** Keyword motoru | kod `workers/**` · runtime **Gemini stub (E3)** | admin girişi + GSC fırsat sinyali → analiz (Gemini stub) → hedef sayfa/locale KARARI (deterministik) → ai_jobs. volume yalnız gerçek veriyle; gerekçeli. | — |
| **6.4** Haftalık rapor | `reports/**` (orchestrator) | Pzt 09:00 TR: trafik+lead, en iyi/kötü 5 sayfa, keyword üretimi, token/maliyet, faz durumu, **karar önerileri** (öneri başlıklı, otomatik uygulama YOK). Veri D1'den. | — |
| **6.5** Meta API | `workers/cron-analytics/**` | Meta campaign → lead eşlemesi + CAC bloğu. Reklam yoksa "entegre ama pasif". | — |
| **6.6** Sağlık panosu | `app/admin/**` + `workers/**` | son RSS fetch, TTL log, ai_jobs kuyruk derinliği, son üretim, D1/Workers kullanım, fallback sayıları; eşik → webhook alert. | — |
| **6.7** QA | `qa/**` | attribution doğruluk; 30-gün; **anonim JOIN denetimi** (sızıntı yok); dashboard; keyword akışı; rapor; sağlık simülasyonları. | — |
| **6.8** Faz çıkışı 🚦 | `qa/**` | — | 👤 "devam et" + reklam bütçesi/rapor tercihi |

---

## 5. FAZ 7 — Public API Sertleştirme
> Yetkili detay: `fazlar/FAZ_7.md`. Sıra: 7.1 → 7.2 → 7.3 → 7.4 → 7.5 → 7.6 → 7.7 → 7.8. **Sözleşme dondurma kuralı başlar (v1 breaking change yasağı).**

| Adım | Scope | Görev (özet) | 👤 |
| :-- | :-- | :-- | :-- |
| **7.1** API sürümleme + sözleşme dondurma 🔒 | `docs/openapi/**`, `workers/api/**` | OpenAPI 3.1 (`docs/openapi/v1.yaml`), hata formatı RFC 9457, rate-limit header; sürümleme politikası (semver, 6 ay uyum); `/api/v1/health`. Spec = kod (oasdiff CI). | 👤 **sözleşme onayı** |
| **7.2** Dış erişim güvenlik sertleştirme 🔒 | `workers/api/**` | key tier (read-only/partner/admin-internal — admin-internal dışarı ASLA, F-02 kuralı); key başına kota; anormal kullanım alert; IP allowlist (partner); `/v1/*` WAF kuralı. | 👤 **güvenlik imzası + WAF aktivasyonu** |
| **7.3** API docs sitesi | `docs/` / `/docs` | spec'ten üretilen interaktif referans (Scalar/Swagger, statik); quickstart; endpoint rehberleri; rate/deprecation. EN. | 👤 docs URL kararı (/docs vs subdomain) |
| **7.4** n8n / entegrasyon | `workers/**` + docs | n8n sample workflow; webhook HMAC imzalama; reçete dokümanı. Mobil app GELİŞTİRİLMEZ (yalnız API mobil-ready garanti). | — |
| **7.5** Performans/yük testi | `qa/**` (staging) | yük testi (staging, prod ASLA); SLO (p95 <300ms okuma / <800ms yazma, hata <0.1%); cache stratejisi; ücretsiz katman limitleri. | — |
| **7.6** .cn değerlendirme raporu | `reports/cn-degerlendirme.md` | /zh Çin erişim ölçümü + Baidu + trafik + ICP maliyeti → karar matrisi (statüko / Aliyun mirror / erteleme tetikleyicileri). Otomatik uygulanmaz. | 👤 **.cn senaryo kararı** |
| **7.7** QA | `qa/**` | spec-conformance; tier matrisi; oasdiff; webhook HMAC; SLO; docs örnek; production izolasyonu. | — |
| **7.8** Faz çıkışı 🚦 | `qa/**` | — | 👤 "devam et" + docs URL + ilk dış partner key kararı |

---

## 6. FAZ 8 — Lansman + Partner Büyütme (operasyon fazı)
> Yetkili detay: `fazlar/FAZ_8.md`. **En insan-yoğun faz** + ertelenen E1/E2 (prod go-live + Access + custom domain) burada çözülür. Kod minimum; operasyon ağırlıklı.

| Adım | Scope | Görev (özet) | 👤 |
| :-- | :-- | :-- | :-- |
| **8.1** Lansman denetimi (regresyon) | `qa/**` | Tüm fazların çıkış kriterleri tek seferde (4 dil, formlar, hreflang, sitemap, llms, lighthouse ≥90, Access/admin, API, gitleaks, prod izolasyon). Bloklayıcı = lansman ERTELENİR. | — |
| **8.2** Lansman 🚀 | koordinasyon + docs | **E1/E2 burada:** custom domain `bdimexport.com` → Pages; Access'i custom domainde kur (Google login bu sefer çalışır); prod deploy; Search Console/Bing/Baidu submit; GA4 canlı doğrulama. Sen rehber+kod; uygulama 👤. | 👤 **prod deploy tetik + DNS/domain + Access kurulumu + token rotasyonu S1** |
| **8.3** Partner kampanyası | `content/tr/**` + docs | kampanya sayfası (sosyal kanıt dolu), e-posta/WhatsApp/LinkedIn şablonları (İYS uyumlu — soğuk liste uydurma YASAK). | 👤 hedef kurum listesi + İYS kaydı |
| **8.4** İçerik ölçekleme | runtime **Gemini (E3 gerekli)** | Faz 4 hattıyla günde 5–10 makale. **E3 açık olmalı** (bu faz öncesi Gemini entegrasyonu — §9). Kalite eşikleri sabit; onay kuyruğu >50 → yavaşlat. | — |
| **8.5** Kanal operasyonları | `content/**` | Telegram (ru), WeChat (zh), WhatsApp (ar/tr/de) içerik + şablonlar; channel_pref widget'larına bağlı; utm'li. | 👤 kanal hesapları (WeChat resmi hesap vb.) |
| **8.6** İlk partner yayına alma | admin akışı | ilk gerçek başvuru → onay → /en/suppliers + /de/lieferanten → lead eşleştirme. | 👤 **partner onay + lead eşleştirme kararları** |
| **8.7** Büyüme deneyleri A/B | metin/metadata | CTA/H2/konu satırı A/B (aynı anda ≤2; ≥2 hafta); kazanan şablona işlenir. | 👤 karar |
| **8.8** Operasyonel QA | `qa/**` | 8.1 regresyonun haftalık tekrarı; üretim kalite eşikleri; KVKK/GDPR canlı akış; haftalık rapor operasyon metrikleriyle. | — |
| **8.9** Faz çıkışı 🚦 | `qa/**` | Partner havuzu hedefi, flywheel ilk tur, üretim istikrarı, kanallar. | 👤 "devam et" + kararlar (.cn zamanı, hız, reklam) |

---

## 7. FAZ 9 — Ölçekleme + Sürekli Optimizasyon (kalıcı rejim)
> Yetkili detay: `fazlar/FAZ_9.md`. "Çıkış" yok; aylık ritim. Sıra: 9.1 → 9.2 → 9.3 → 9.4 → 9.5 → 9.6 → 9.7 → 9.8.

| Adım | Scope | Görev (özet) | 👤 |
| :-- | :-- | :-- | :-- |
| **9.1** Maliyet optimizasyon motoru | `reports/**` | ledger analiz → cache <%60 / retry >%20 / en pahalı 5 / batch <%50 → otomatik revizyon görevi (uygulama PR'ı 👤). | — |
| **9.2** Katman sınır izleme | `app/admin/**` sağlık | Workers/D1/R2/KV/Pages limitleri %75/90 uyarı; Paid geçiş tetikleyicisi (2 hafta %90 → 👤). | 👤 geçiş kararı |
| **9.3** Ölçekleme tetikleyicileri | `fazlar/tetikleyiciler/**` | T1 Workers Paid · T2 .cn uygulama · T3 API v2 · T4 reklam · T5 mobil feasibility — her biri koşul+adım+maliyet+geri dönüş. | 👤 uygulama kararları |
| **9.4** İçerik kalite denetimi | `qa/**` | haftalık %10 örnekleme + çapraz benzerlik taraması; düşüş 2 hafta → üretim %50 düşür + kök neden. | — |
| **9.5** Güvenlik/uyum periyodik | `qa/**` + düzeltme | aylık: gitleaks, Access kullanıcı revizyonu, key envanteri, KVKK/GDPR checklist, D1→R2 geri-yükleme provası, secret rotasyon. | 👤 revizyon onayı |
| **9.6** Agent/kural dosyaları evrimi | `agents/**`, `AGENTS.md` | 4+ hafta veriyle kanıt-temelli güncelleme. | 👤 PR onayı |
| **9.7** Aylık ritim | `reports/**` | haftalık rapor + tetikleyici tarama + örnekleme; aylık güvenlik + limitler + evrim. | — |
| **9.8** Yıllık değerlendirme 🚦 | `reports/**` | hedef vs gerçek; sonraki dönem önerileri. | 👤 strateji kararı |

---

## 8. İNSAN (👤) AKSİYONLARI — KONSOLİDE

Sen bu noktalarda DUR, hazırla, kullanıcıya net özet ver, bekle:
- **FAZ 4:** 4.8 Baidu (ertelenebilir) · 4.10 çıkış + hız hedefi.
- **FAZ 5:** 5.1 şirket verisi+hukuk imza · 5.5 Baidu kod · 5.7 zh kültür · 5.10 imza · 5.11 çıkış.
- **FAZ 6:** 6.8 çıkış + tercihler.
- **FAZ 7:** 7.1 sözleşme · 7.2 güvenlik imza+WAF · 7.3 docs URL · 7.6 .cn karar · 7.8 çıkış.
- **FAZ 8:** 8.2 **prod deploy + custom domain + Access + S1 token rotasyonu** · 8.3 kurum listesi+İYS · 8.5 kanal hesapları · 8.6 partner onay+eşleştirme · 8.9 çıkış.
- **FAZ 9:** tetikleyici/geçiş/evrim onayları + yıllık strateji.
- **PROJE SONU (§9 aşağıda):** Gemini anahtarları + model adları + stub→gerçek.

---

## 9. PROJE SONU — Gemini Entegrasyonu (E3) ve Ertelenen Kapanışı
> AGENTS.md §9 ile aynı. FAZ 8.4 (içerik ölçekleme) runtime Gemini gerektirir → **E3 bu fazdan önce açılır.** Sıra:

1. **👤 Gemini API anahtarı** (Google AI Studio/Vertex) → GitHub Secrets + Cloudflare Secrets.
2. **Model adlarını sabitle:** metin (yeni Gemini), hızlı özet varyantı, görsel (`gemini-*-image`).
3. **Stub→gerçek:** FAZ 4.4, 4.5, 6.3 (metin) + 2.6 (görsel). `ENRICH_MODE`/`ARTICLE_MODE` vb. `off`→`on`.
4. **Prompt injection + kota/fallback testi** (4.7 altyapısı) koş.
5. **Maliyet izleme** ledger'a bağla (9.2).

**Ertelenen dosya kapanışı** (`ERTELENEN_GOREVLER.md` sırası): 🔴 **S1 token rotasyonu (uzatma — mümkünse FAZ 8.2'den önce)** → 🟡 E1/E2 (FAZ 8.2), E3 (§9), E4 (FAZ 6), E5 (FAZ 8), E6 (yakında) → 🟢 C1 (FAZ 5 /v1/leads), C2 (FAZ 8 öncesi KVKK), C5 (FAZ 8.1), C6 (FAZ 5) → ⚪ temizlik.

---

## 10. BAŞLANGIÇ
1. `FAZ_4_AJAN_PANOSU.md`'yi oku → **4.6**'dan devam et.
2. Her adım: oku → yap → §2/§4 güncelle → commit → rapor + 👤 varsa.
3. Faz bitince: çıkış kriterleri → 👤 "devam et" → sonraki fazın panosunu kur → devam.
4. Takıldığın/kararsız kaldığın her yerde (özellikle 👤 kapıları ve belirsizlik) **DUR ve kullanıcıya sor** — tahminle ilerleme.

_Bu dosya kalan tüm işin tek yetkili yol haritasıdır; `AGENTS.md` (kurallar) + `fazlar/FAZ_N.md` (adım detayı) + `ERTELENEN_GOREVLER.md` (proje-sonu) ile birlikte okunur._
