# BDMEXPORT.COM - Çok Dilli İthalat/İhracat Platformu Teknik Proje Dokümanı
**Versiyon:** 1.0 | **Tarih:** 08.10.2026 | **Hazırlayan:** Bdimexport Tech Team
**Domain:** bdimexport.com | **Merkez:** Türkiye

---

## 1. YÖNETİCİ ÖZETİ (Executive Summary)

Bdimexport.com, Türkiye merkezli bir ithalat/ihracat aracılık ve danışmanlık platformudur. Proje, tek domain altında 4 ana coğrafi/dilsel varlık gibi davranan ancak tek bir Admin ve AI orkestrasyon sistemi ile yönetilen headless, edge-native bir mimari hedefler.

**Temel Fark:** /zh rotası bağımsız bir Çin sitesi gibi izole, /tr (kök) Türk firmalarını toplayan bir huni, /en global lead jeneratörü ve çok-dilli hub, /de ise DACH pazarına %100 yerelleştirilmiş bir klon.

Platformun büyüme motoru **Ücretsiz İhracat Desteği** programıdır: Türk üreticiler sisteme dahil olur, logoları /en ve /de sitelerinde sosyal kanıt olarak sergilenir, karşılığında global talepler onlara yönlendirilir.

Tüm içerik üretimi, SEO/GEO optimizasyonu ve RSS/Trends analizi için **Vibe Coding** ile yönetilen çok ajanlı (multi-agent) bir sistem kurulacaktır.

---

## 2. İŞ MODELİ VE HEDEF KİTLE ANALİZİ

### 2.1. Site Segmentleri

| Segment | Route | Hedef Kitle | Dil | Birincil Amaç | Monetization |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **ZH** | `/zh` | Türkiye'de iş yapmak isteyen Çinli üreticiler/tedarikçiler | 简体中文 | Çinli firmalara TR'de lokal müşteri hizmetleri, satış, pazarlama, şirket kurulumu | Hizmet Komisyonu + Retainer |
| **TR-İthalat** | `/` -> `/ithalat` | Çin'den ürün getirmek isteyen Türk KOBİ | Türkçe | Tedarik, fabrika bulma, denetim, lojistik, gümrük | Hizmet Bedeli + Komisyon |
| **TR-İhracat** | `/` -> `/ihracat` | İhracat yapmak isteyen Türk üretici | Türkçe | E-ihracat, B2B pazarlama danışmanlığı, lead toplama | Ücretsiz Giriş -> Lead Satışı / Komisyon |
| **EN Global** | `/en` | TR/CN'den ürün arayan global alıcılar | İngilizce | Fabrika denetimi, private label, sourcing, lojistik | Alıcıdan Hizmet Bedeli |
| **EN-Localized** | `/en/fr`, `/en/nl`, `/en/es`, `/en/ar`, `/en/ru` | FR, NL, ES, MENA, RU pazarları | Yerel dil | /en içeriğinin yerelleştirilmiş SEO/GEO versiyonu | Alıcıdan Hizmet Bedeli |
| **DE** | `/de` | Almanya, Avusturya, İsviçre alıcıları | Almanca | /en ile aynı hizmetlerin DACH yerelleştirmesi | Alıcıdan Hizmet Bedeli |

### 2.2. Kritik Büyüme Döngüsü (Flywheel)

1.  **Toplama:** `/tr/ihracat` üzerinden "Ücretsiz İhracat Hızlandırma" formu ile Türk firmaları toplanır. Form: Firma Adı, Vergi No, Ürün Kataloğu (PDF), Kapasite, Sertifikalar (CE, ISO), İhracat Geçmişi, İzin (Logo kullanım izni KVKK uyumlu checkbox).
2.  **Doğrulama & Varlıklaştırma:** Admin panelinde firma onaylanır. Logo, firma adı, 3 cümlelik özet `partners` koleksiyonuna eklenir.
3.  **Sergileme:** Onaylı firmalar `/en/suppliers`, `/en/product/[slug]`, `/de/lieferanten` gibi sayfalarda "Verified Turkish Partner" olarak listelenir.
4.  **Lead Jenerasyonu:** SEO/GEO sayfaları (örn: `/en/products/turkish-olive-oil-manufacturers`, `/en/ru/turkey-textile-export-to-russia`) üzerinden yabancı alıcı formu doldurur.
5.  **Eşleştirme:** Admin lead'i görür, uygun Türk partnerlere yönlendirir.

---

## 3. BİLGİ MİMARİSİ (Information Architecture)

### 3.1. URL Yapısı ve Hreflang Stratejisi

```
bdimexport.com/ (tr) -> x-default: tr, alternate: en, de, zh-CN
bdimexport.com/ithalat/*
bdimexport.com/ihracat/*
bdimexport.com/ihracat/ucretsiz-destek-basvuru (Lead Mıknatısı)

bdimexport.com/zh/ (zh-CN) -> İzole navigasyon, Baidu SEO, WeChat entegrasyonu
bdimexport.com/zh/services/*
bdimexport.com/zh/contact (Çince konuşan TR ekibi)

bdimexport.com/en/ (en) -> Global hub
bdimexport.com/en/products/*
bdimexport.com/en/industries/*
bdimexport.com/en/factories/*
bdimexport.com/en/services/[inspection|logistics|customs|sourcing]
bdimexport.com/en/suppliers (Türk partnerler)

bdimexport.com/en/fr/* (fr)
bdimexport.com/en/ru/* (ru) + Telegram CTA
bdimexport.com/en/ar/* (ar, RTL destekli)
... (nl, es)

bdimexport.com/de/ (de-DE, de-AT, de-CH) -> x-default: de
bdimexport.com/de/produkte/*
bdimexport.com/de/branchen/*
bdimexport.com/de/lieferanten
```

**Teknik:** Next.js 15 App Router ile `app/[lang]` yapısı değil, `app/(tr)`, `app/(zh)`, `app/(en)`, `app/(de)` route groups. Her grup kendi layout, middleware, ve dictionary'e sahip. `next-intl` ile yönetim.

### 3.2. Sayfa Şablonları

1.  **Product SEO/GEO Page:** H1: `{Product Name} Manufacturers in Turkey | B2B Sourcing`. Schema: Product + FAQPage + Organization. İçerik: Sektör istatistikleri (TÜİK verisi), 3-5 Türk partner logosu, üretim süreci infografiği, CTA: "Get Free Quotation in 24h".
2.  **Industry Page:** `/en/industries/textile` - Sektör ihracat rakamları, trend grafiği.
3.  **Trust Page:** `/de/vertrauen` - DACH için özel: Alman müşteri yorumları, Handelsregister benzeri güven rozetleri.

---

## 4. VIBE CODING - ÇOK AJANLI ORKESTRASYON

### 4.1. Yönetici Ajan (Manager / Orchestrator Agent)

- **Orkestratör Modeli:** **GLM 5.3** (düşük maliyet, yüksek yetenek) — tam kurallar: `ORCHESTRATOR.md`
- **Görev:** `agents/` dizinindeki tüm ajan tanımlarının görev ataması, token bütçesi, model seçimi (kayıt defteri: `AGENTS.md`).
- **Konfigürasyon:** `root/AGENTS.md` (model kayıt defteri), `root/ORCHESTRATOR.md`, `root/ORCHESTRATION.md`, `root/agents/`, `root/prompts/`
- **Mantık:**
  ```
  IF task.type == "design"                => Claude Opus 5 (min token, brief-first) / Qwen 3.8 Max
  IF task.type == "coding" AND score <= 2 => Gemini Flash (en ucuz)
  IF task.type == "coding" AND score 3-6  => Qwen 3.8 / Gemini Argon 4
  IF task.type == "coding" AND score >= 7 => Claude Sonnet 5.5
  IF task.type == "image"                 => ChatGPT Image (final) / FLUX (taslak)
  IF task.type == "localization" zh/ru/ar => Qwen 3.8
  ```

### 4.2. Uzman Ajanlar

| Ajan ID | Sorumlu Alan | Model Önerisi | Skill Dosyası |
| :--- | :--- | :--- | :--- |
| `design-agent` | Tasarım sistemi, hero copy, UX kararları | Claude Opus 5 (min token, brief-first) + Qwen 3.8 Max (uygulama) | `agents/design-agent.md` |
| `image-agent` | Tüm görsel üretim (OG, hero, infografik) | ChatGPT Image (final) / Ideogram (yazılı görsel) / FLUX (taslak) | `agents/image-agent.md` |
| `zh-agent` | `/zh` tüm içerik, Baidu SEO, Çin UX (kırmızı/altın palet, WeChat QR) | Qwen 3.8 (zh-native) | `agents/zh-agent.md` |
| `tr-import-agent` | `/ithalat` sayfaları, Çin tedarik rehberleri | GLM 5.3 | `agents/tr-import-agent.md` |
| `tr-export-agent` | `/ihracat`, ücretsiz destek hunisi, başvuru formu UX | GLM 5.3 | `agents/tr-export-agent.md` |
| `en-expert-agent` | `/en` ana yapı, global SEO, ürün endüstri sayfaları | Kod: Claude Sonnet 5.5 (kompleks) / Gemini Argon 4; içerik: Gemini Flash | `agents/en-expert-agent.md` |
| `en-localization-agent` | `/en/*` alt diller, hreflang, kültürel adaptasyon (örn: RU için Telegram, MENA için WhatsApp Business) | Qwen 3.8 (ru/ar) · Gemini Flash (fr/nl/es) | `agents/en-l10n-agent.md` |
| `de-agent` | `/de` tam izolasyon, DACH hukuku (Impressum, DSGVO), formal Sie hitabı | Claude Sonnet 5.5 | `agents/de-agent.md` |
| `seo-geo-agent` | Tüm SEO/GEO metin üretimi, schema, sitemap.xml, llms.txt | Gemini Flash (üretim) + GLM 5.3 (kontrol) | `agents/seo-geo-agent.md` |
| `rss-trends-agent` | RSS ingestion, 3-gün TTL, Google Trends API | Gemini Flash-Lite / Workers AI | `agents/rss-trends-agent.md` |
| `qa-agent` | Build/lint/link testi, kabul testleri, görsel OCR kontrolü | GLM 5.3 | `agents/qa-agent.md` |

**Eşzamanlı Çalışma:** `git worktree` ile her ajan ayrı branch'te çalışır. Manager ajan (GLM 5.3) conflict çözümü yapar. Tam model kayıt defteri ve karar ağacı: `AGENTS.md`.

### 4.3. Dosya Yapısı (Vibe Coding Root)

```
/ (root)
├── agents/ (tüm ajan tanım dosyaları)
│   ├── design-agent.md
│   ├── image-agent.md
│   ├── zh-agent.md
│   ├── tr-import-agent.md
│   └── ...
├── prompts/
│   ├── seo-geo-prompt.txt
│   ├── partner-onboarding.txt
│   └── visual-brand.txt (görsel üretim sabit prefix)
└── tasks/
    ├── task_queue.json
    └── token_ledger.json
```

---

## 5. ADMİN PANELİ VE AI OTOMASYONU

Admin rotası: `bdimexport.com/admin` (Cloudflare Access ile IP + Google OAuth korumalı)

### 5.1. Modüller

1.  **Lead Yönetimi (CRM Lite):**
    - Tablo: `leads` (id, source_page, locale, name, company, email, whatsapp, telegram, product, message, status: new/contacted/qualified/closed, assigned_partner_id, created_at)
    - Kanban board, WhatsApp/Telegram'a tek tıkla geçiş: `https://wa.me/{number}?text=Merhaba {name}, {product} talebiniz...`

2.  **Partner Yönetimi:**
    - CRUD: Türk firmaları, logo upload (R2), onay akışı.

3.  **AI İçerik Fabrikası (En Kritik):**
    - **Input A:** Admin manuel haber/metni yapıştırır -> Buton: "SEO/GEO Metne Dönüştür"
    - **Input B:** RSS Kaynakları (Admin ekler: e.g. `tim.org.tr/rss`, `trade.gov.tr`). Cron her 6 saatte çeker. `rss_news` tablosuna yazar (TTL: 3 gün, cron ile `DELETE WHERE created_at < NOW() - INTERVAL 3 DAY`). Admin listeden seçer -> "Seçili Haberlerden SEO Yazısı Üret".
    - **Input C:** Google Trends + Keyword Planner. Admin uzun kuyruk kelimeler girer: "turkish hazelnut exporter to germany". 
    - **Agent Kararı:** `seo-geo-agent` input'u analiz eder, hangi locale'e gideceğine karar verir (ör: "hazelnut + germany" => `/de` ve `/en` + `/en/de` alt varyantı). İlgili dilde 1200+ kelimelik GEO-optimize (Generative Engine Optimization - LLM'lere uygun yapılandırılmış) makale üretir, FAQ, Schema ekler.
    - **Onay:** Taslak olarak `contents` tablosuna `status: draft` olarak düşer. Admin onaylarsa yayınlanır.

4.  **Analitik Hub:**
    - Google Search Console API, GA4 Data API, Meta Marketing API entegrasyonu. Günlük çekilen veriler `analytics_daily` tablosuna. Dashboard: Chart.js ile lead kaynağı, en çok trafik alan SEO sayfası.

5.  **API Gateway:**
    - `api.bdimexport.com/v1/leads`, `/partners`, `/contents`. API Key ile. Gelecekte mobil app veya n8n entegrasyonu için.

### 5.2. Veri Modeli (Özet)

```sql
-- D1 / Postgres uyumlu
partners (id, name, logo_url, website, products_json, capacity, certs_json, is_verified, created_at)
leads (id, locale, source_url, product_slug, contact_json, status, partner_id FK, created_at)
contents (id, slug, locale, title, body_html, seo_title, seo_desc, schema_json, status, author_agent, created_at)
rss_news (id, source, title, link, summary, fetched_at, expires_at)
keywords (id, keyword, volume, intent, target_locale, status)
```

---

## 6. TEKNİK MİMARİ - ALTERNATİFLİ KARAR

**Kısıt:** Uzun süre Free Tier'da kalabilecek, bütüncül, edge'e yakın.

### SEÇENEK A: CLOUDFLARE NATIVE STACK (ÖNERİLEN - %90 Free Tier Uyumlu)

**Neden Önerilen:** Tek vendor, sıfır cold start, global edge, limitsiz free tier.

- **Hosting & Compute:** Cloudflare Pages (Next.js static + SSR via Functions) + Cloudflare Workers (API, Cron, RSS fetcher)
  - Free: Limitsiz request (Pages), 100k Worker request/gün
- **Database:** Cloudflare D1 (SQLite, edge). 
  - Free: 5GB storage, 5M row read/gün. Partners/leads için fazlasıyla yeterli. 1 yıl boyunca ücretsiz kalır.
- **Storage:** Cloudflare R2 (S3 uyumlu, egress ücretsiz)
  - Free: 10GB storage, 10M Class A ops. Logo, PDF kataloglar için ideal.
- **Cache & Session:** Cloudflare KV + Durable Objects
  - Free: 1GB KV, 1M read/gün. RSS 3-gün buffer için KV TTL kullanılır.
- **CDN & Security:** Cloudflare CDN, WAF, DDoS, Turnstile (Captcha) - Hepsi free.
- **Auth:** Cloudflare Access (Admin için) + Lucia Auth (kendi D1 üzerinde)
- **Cron:** Cloudflare Workers Cron Triggers (RSS çekme, 3-gün silme)
- **Analytics:** Cloudflare Web Analytics (free, cookieless)

**Maliyet Projeksiyonu:** İlk 50k ziyaretçi/ay ve 10k lead'e kadar ~0$. Sonrası $5/mo Workers Paid plan.

**Dezavantaj:** D1 NoSQL değil SQL ama SQLite. Çok komplex joinlerde Supabase kadar güçlü değil. Ancak bu proje için yeterli.

### SEÇENEK B: FIREBASE + SUPABASE HYBRID (Alternatif)

- **Hosting:** Firebase Hosting (Free: 10GB storage, 360MB/gün transfer) veya Vercel Hobby (100GB bandwidth)
- **Compute:** Firebase Functions 2nd Gen (Free: 2M invokasyon) veya Vercel Functions
- **Database:** Supabase Postgres (Free: 500MB DB, 50k MAU, 2GB bandwidth) - D1'den daha güçlü, Realtime var.
- **Storage:** Supabase Storage (Free: 1GB) veya Firebase Storage (5GB)
- **Auth:** Supabase Auth veya Firebase Auth
- **Cache:** Upstash Redis (Free tier) - RSS buffer için

**Avantaj:** Supabase Realtime ile Admin panelinde canlı lead akışı. SQL daha güçlü.
**Dezavantaj:** İki vendor (Firebase + Supabase), cold start var, free tier limitleri Cloudflare'den daha çabuk doluyor (Supabase 500MB). Egress ücreti riski.

### SEÇENEK C: VERCEL + PLANETSCALE (Startup Friendly)

- Vercel Pro $20/mo ama Hobby free ile başlanabilir. PlanetScale free 5GB.

**Karar Matrisi:**

| Kriter | Cloudflare (A) | Firebase/Supabase (B) | Vercel/PlanetScale (C) |
| :--- | :--- | :--- | :--- |
| Free Tier Süresi | 12-18 ay (en uzun) | 6-9 ay | 3-6 ay |
| Edge Latency | En iyi (300+ PoP) | Orta | İyi |
| Vendor Lock | Tek vendor (kolay) | 2 vendor | 2 vendor |
| DB Gücü | Orta (SQLite) | Yüksek (Postgres) | Yüksek |
| AI Agent Cron | Native (Workers) | Firebase Scheduler gerekli | Vercel Cron $ |
| Toplam Puan | **9.2/10 (Önerilen)** | 8.0/10 | 7.5/10 |

**Nihai Öneri:** **Hibrit Başlangıç:** Frontend Cloudflare Pages, Backend Cloudflare Workers + D1 + R2. Admin paneli için Supabase Realtime sadece ihtiyaç duyulursa eklenir (D1 + Cloudflare Realtime beta ile de çözülebilir). Bu sayede 1 yıl boyunca $0 maliyet.

---

## 7. SEO/GEO ve ÇOK DİLLİ STRATEJİ

- **GEO (Generative Engine Optimization):** ChatGPT, Perplexity gibi LLM'lerin kaynak göstermesi için: Her sayfada `llms.txt`, net Q&A bölümü, istatistik tablosu, ve `ClaimReview` schema.
- **Hreflang:** `<link rel="alternate" hreflang="de-AT" href="...">` gibi detaylı. Sitemap ayrı: `/sitemaps/sitemap-tr.xml`, `/sitemaps/sitemap-zh.xml`...
- **Baidu için /zh:** Meta Baidu verification, ICP lisansı yok ama Hong Kong sunucu (Cloudflare) ile hızlandırma.

---

## 8. GÜVENLİK ve KVKK/GDPR

- Formlarda KVKK ve GDPR checkbox zorunlu. `partners` logosu için açık rıza metni.
- /de için Impressum, Datenschutz sayfaları zorunlu.
- Turnstile ile bot koruması.

---

## 9. ROADMAP (Vibe Coding ile 4 Hafta)

**Hafta 1: Foundation** - Manager agent kurulumu, Cloudflare Pages + D1 + R2 kurulumu, Next.js route groups, Admin login.
**Hafta 2: TR + ZH** - tr-import-agent ve tr-export-agent sayfaları, ücretsiz destek formu + partner tablosu. zh-agent izole site.
**Hafta 3: EN Global + SEO Factory** - en-expert-agent 20 ürün sayfası üretir, seo-geo-agent schema ekler, rss-trends-agent cron'ları.
**Hafta 4: DE + EN-Localized + Analytics** - de-agent DACH yerelleştirme, en-localization-agent 5 dil, Admin analytics hub.

---

## 10. SONUÇ

Bu proje klasik bir web sitesi değil, **AI orkestrasyonlu bir lead jenerasyon fabrikasıdır**. Cloudflare stack ile free tier'da uzun süre yaşayabilir, vibe coding ile 6 ajan paralel çalışarak 1 ayda 200+ SEO sayfası üretebilir. En kritik başarı faktörü: Türk partner havuzunu hızla doldurmak.

**Ekler:** Mimari şema görseli ektedir.
