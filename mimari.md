# BDIM EXPORT — Bütüncül Sistem Analizi ve Mimari Tasarım
**Doküman sürümü:** v1.1 | **Tarih:** 08.10.2026 | **Durum:** Proje.md v1.0 ile mutabık hale getirildi
**Proje:** bdimexport.com — Çok dilli ithalat/ihracat platformu + AI içerik motoru + Çok modelli agent orkestrasyonu

> **v1.1 GÜNCELLEME NOTU:** Proje.md v1.0 ile çelişen kararlar bu sürümde mutabakatla güncellendi:
> 1. Framework **Astro → Next.js 15 App Router route groups + next-intl** (Proje.md §3.1 kararı üstün)
> 2. RSS penceresi **72 saat → 3 gün TTL** (Proje.md §5.1; cron `DELETE WHERE created_at < NOW() - INTERVAL 3 DAY`)
> 3. Hreflang **x-default: tr** (kök site TR, Proje.md §3.1 — eski "x-default en" kararı iptal)
> 4. Agent kadrosu **Claude+Gemini → çok modelli: GLM 5.3 (orkestratör), Qwen 3.8, Claude, Gemini, Workers AI** → tam kurallar `ORCHESTRATOR.md` v1.0'da
> 5. Admin SPA (React+Vite) → Next.js admin route group olarak birleştirildi (aynı repo, Cloudflare Access korumalı)

---

## 1. Sistem Bileşenlerinin Çıkarımı

| # | Bileşen | Hedef Kitle | Dil | Temel İşlev |
| :--- | :--- | :--- | :--- | :--- |
| 1 | `/` (TR ana site) | Türk firmaları | TR | İthalat (Çin→TR) + İhracat (TR→Dünya), e-commerce/B2B |
| 2 | Partner Toplama Sistemi | Türk üreticiler | TR | "Ücretsiz İhracat Hızlandırma" başvurusu → onaylı firmaların logo/isimleri EN/DE sayfalarda "Verified Turkish Partner" olarak listelenir (KVKK açık rıza checkbox şart) |
| 3 | `/zh` | Çinli firmalar | ZH | Türkiye'de lokal satış/pazarlama hizmetleri (izole site mantığı, Baidu + WeChat; .cn sonradan) |
| 4 | `/en` + varyantlar (/en/ru, /en/fr, /en/nl, /en/es, /en/ar) | Global alıcılar | EN (yerelleştirilmiş) | Tedarik, üretim, inspection, lojistik + ülkeye özel SEO/GEO sayfaları + bölge uzmanı güven sinyalleri (RU: Telegram, CN: WeChat, DACH: WhatsApp/Email) |
| 5 | `/de` | DACH (de-DE/AT/CH) | DE | Tam yerelleştirilmiş hizmet seti + Impressum/Datenschutz, formal Sie |
| 6 | Admin Panel (`/admin`) | Yönetim | TR | İçerik onayı, AI SEO/GEO Fabrikası, RSS (3 gün TTL), Trends/keyword, GSC/GA4/Meta analitik, lead Kanban + wa.me/telegram tek-tık, API Gateway |
| 7 | Orkestrasyon Katmanı | Dev süreç | — | **GLM 5.3 orkestratör + uzman agentlar (Qwen 3.8, Claude, Gemini)** eş zamanlı, çakışmasız, token-verimli yönetim |

Not: "en-ab" = en-ar (Arapça) — **RTL kritiktir** (dir="rtl" + layout mirror).

## 2. URL & Site Ağacı Mimarisi

```
bdimexport.com/              → TR (hreflang: tr, x-default: tr)
├── /ithalat/…
├── /ihracat/…                 (/ihracat/ucretsiz-destek-basvuru = lead mıknatısı)
├── /hakkimizda /iletisim
├── /zh/                       → izole navigasyon, Baidu meta, WeChat
│   └── /zh/services /zh/contact
├── /en/                       → global hub (hreflang: en)
│   ├── /en/products /en/industries /en/factories
│   ├── /en/services/{sourcing,manufacturing,inspection,logistics,customs}
│   ├── /en/suppliers            (Türk partnerler, DB'den render)
│   └── /en/ru /en/fr /en/nl /en/es /en/ar   (hreflang: en-RU …)
└── /de/                       → /de/produkte /de/branchen /de/lieferanten /de/vertrauen
```

**Kritik karar:** Varyantlar `/en/ru/` alt klasörü olarak — hreflang haritası + build mantığı temiz. Next.js'te `app/(tr) app/(zh) app/(en) app/(de)` **route groups**; her grup kendi layout/middleware/dictionary, `next-intl` ile.

## 3. Mimari Karar: Alternatif A — Cloudflare Full-Stack ✅

| Kriter | A: Cloudflare ✅ | B: Firebase | C: +Supabase | D: Vercel+Upstash |
| :--- | :--- | :--- | :--- | :--- |
| Statik bant | Sınırsız, egress $0 | 500MB/ay kısıtlı | Sınırsız | Hobby ticari ❌ |
| DB (D1) | 5GB, 5M oku/gün, **Free ≥1 yıl** | Firestore kotalı | 500MB + 7 gün inaktif uyu ⚠️ | — |
| R2 medya | 10GB, egress $0 | egress ücretli | — | — |
| Cron (RSS/Trends/analitik) | ✅ Free planda | AI çağrısı Blaze+kart ister ❌ | ✅ | Hobby'de cron yok |
| Admin auth | Cloudflare Access (50 kullanıcı, SSO) | — | — | — |
| Spam | Turnstile $0 | — | — | — |
| Ticari kullanım | ✅ | ✅ | ✅ | ❌ |

**Gerekçe:** egress $0 (çok dilli + logo ağırlıklı sitede en büyük gizli maliyet), AI çağrıları Workers'tan serbest, DNS/CDN/Access/Turnstile/Analytics/cron tek panelde. Maliyet projeksiyonu: 50k ziyaretçi + 50k lead/ay'a kadar ~$0; sonrası $5/mo Workers Paid.
**Bileşen envanteri:** Pages (500 build/ay) · Workers (100k req/gün) · D1 (5GB, 5M oku/gün) · R2 (10GB) · KV (RSS 3-gün TTL buffer) · Queues yerine **D1 `ai_jobs` tablosu + cron kuyruğu** (Queues ücretli) · Access (50 kullanıcı) · Resend/Brevo (100–300 mail/gün) · Workers AI (fallback) · GitHub Actions (2000 dk/ay private).
**AI katmanı bütçesi:** Qwen 3.8 / GLM / Gemini Flash-Lite (hacim işleri, ücretsiz/düşük) → Gemini Flash (SEO üretim) → GLM 5.3 (orkestrasyon+kontrol) → Claude Sonnet 5.5 / Opus 5 (yalnızca kalite-kritik, kotalı). Aylık AI maliyeti ≈ $0 ile başlar.

## 4. Önerilen Mimari — Genel Şema

```
Kullanıcılar (TR / ZH / Global EN·DE·RU·FR·NL·ES·AR)
   ↓
EDGE: DNS+CDN+DDoS · Turnstile · Geo-dil önerisi · Access (admin)
   ↓
APPS: Next.js Public Site (route groups (tr)(zh)(en)(de), statik+ISR, SEO-öncelikli)
      Next.js Admin (Access korumalı, /admin)
      Workers API: /api/v1/* (leads, partners, contents, analitik, public)
   ↓
DATA: D1 (partners, leads, contents, rss_news, keywords, ai_jobs, token_ledger)
      R2 (logo, fotoğraf, PDF) · KV (cache, TTL buffer)
   ↓
AI: GLM 5.3 (orkestratör) · Qwen 3.8 (zh/ru/ar) · Gemini Flash/Flash-Lite (hacim)
    Claude Sonnet 5.5 / Opus 5 (kalite-kritik, kotalı) · Workers AI (fallback)
   ↓
CRON: saatlik RSS · gece 3-gün TTL silme · haftalık D1→R2 yedek · günlük keyword + GSC/GA4/Meta
```

**Hibrit yayın stratejisi (önemli):** Kalıcı SEO sayfaları (ürün/sektör/fabrika) → **Git PR → merge → build** (versiyonlanır, denetlenebilir); geçici öğeler (haber kartları, partner listesi, lead formları) → **D1 → edge render** (anında).

## 5. Veri Modeli (D1)

```
partners(id, name, logo_r2_key, sector, consent_logo_en, approved, created_at)
leads(id, source_page, locale, form_type, channel_pref, payload_json, status,
      partner_id, created_at)          -- channel_pref: whatsapp|telegram|wechat|email
contents(slug, locale, page_type, title, body_md, target_keyword, schema_json,
         status: draft|approved|published, model, created_at)
rss_news(id, source, title, url, fetched_at, expires_at)   -- TTL: 3 gün, cron siler
keywords(id, phrase, locale, intent, priority, status)
ai_jobs(id, type, payload, status, retries, agent, model)   -- D1 tabanlı ücretsiz kuyruk
analytics_daily(day, ga4_json, gsc_json, meta_json)
```

Önemli alanlar: `leads.channel_pref` ülkeye göre iletişim widget'ını belirler; `partners.consent_logo_en` logonun yabancı sayfalarda yayın rızası (hukuki şart); `ai_jobs` Queues'u D1+cron ile ücretsiz ikame eder; `contents.model` hangi agent/model ürettiği (muhasebe için).

## 6. İçerik Motoru: RSS/Trends → 3 Gün Pencere → AI → Onay → Yayın

```
Admin RSS kaynak ekler (tim.org.tr, trade.gov.tr, trends.google.com RSS geo=TR/RU/DE…)
  → Cron saatlik çeker → rss_news (TTL 3 gün)
  → Admin listeden seçer VEYA keyword kuyruğundan otomatik
  → seo-geo-agent (Gemini Flash üretim + GLM 5.3 schema/kalite kontrol) → contents: draft
  → Orchestrator kalite kapısı (1200+ kelime, FAQ, ClaimReview/FAQPage schema)
  → Admin onayı → yayın (kalıcı: PR merge; geçici: D1 blok)
  → sitemap + hreflang otomatik güncellenir
```

Google Trends resmi API yok → günlük trending RSS'leri (geo parametreli) cron ile çekilir; aynı akış admin'in elle girdiği haber/veri için de çalışır. **Yayın kuralı değişmez: onaysız AI metni yayınlanmaz.**

## 7. Admin Panel Yetenek Matrisi

| Modül | İşlev |
| :--- | :--- |
| Dashboard | CF Analytics + GSC + GA4 + Meta (cron → analytics_daily), Chart.js |
| Lead Merkezi | Kanban; wa.me / Telegram / WeChat tek-tık; source_page takibi |
| Partner CRUD | Logo upload R2, onay akışı, KVKK yayın rızası, /en/suppliers + /de/lieferanten otomatik |
| AI İçerik Fabrikası | RSS seçim + keyword → draft üretim → onay |
| Analitik Hub | Günlük çekim, haftalık insan raporu |
| API Gateway | `api.bdimexport.com/v1/leads|partners|contents`, API key, mobil/app hazırlığı |
| Güvenlik | Cloudflare Access (IP + Google OAuth) + Turnstile + secret-scan |

## 8. Vibe Coding — Çok Modelli Orkestrasyon (v1.1)

**Orkestratör:** **GLM 5.3** → `ORCHESTRATOR.md` v1.0 (repo kökünde; değişmez kurallar §11: ucuz-önce, tek görev ≤2 model çağrısı, scope dışı dosya yok, ortak dosyalara yalnızca orchestrator yazar, retry'da context büyütülmez, token_ledger muhasebe).

| İş tipi | Model | Gerekçe |
| :--- | :--- | :--- |
| Orkestrasyon, review, standart kodlama | **GLM 5.3** | Düşük maliyet, yüksek yetenek |
| zh / ru / ar içerik + yerelleştirme | **Qwen 3.8** | Dil-native kalite + maliyet üstünlüğü |
| Hacim işleri (RSS özet, çeviri taslağı, lint) | Gemini Flash-Lite / Workers AI | ~$0 |
| SEO metin üretimi | Gemini Flash → GLM 5.3 kontrol | Hacim ücretsiz, kontrol ucuz |
| Komponent/kalite-kritik kod, final çeviri pass | Claude Sonnet 5.5 | Yalnızca gerekli yerde |
| Tasarım sistemi, hero copy, mimari | Claude Opus 5 | Sprint başına max 3 çağrı (onaylı) |

**Repo kök düzeni (mutabık):**
```
├── ORCHESTRATOR.md  ORCHESTRATION.md  SEO_PLAYBOOK.md  I18N_RULES.md
├── CLAUDE.md  GEMINI.md  AGENTS.md          (provider davranış dosyaları)
├── agents/  (zh-agent.md, tr-import-agent.md, en-l10n-agent.md, de-agent.md,
│                   seo-geo-agent.md, rss-trends-agent.md, qa-agent.md …)
├── prompts/  tasks/  (task_queue.json, token_ledger.json, task şablonları)
├── app/ (tr)(zh)(en)(de)  admin/  workers/api  workers/cron-*
├── content/{tr,zh,en/{ru,fr,nl,es,ar},de}/  db/migrations/
```

**Eş zamanlılık:** Her agent kendi `git worktree` + branch'inde, dosya kilit matrisi skill beyanında; ortak dosyalar (sitemap/hreflang/route) sadece orchestrator enjekte eder → merge conflict sıfır.

## 9. SEO/GEO Teknik Altyapı

- Hreflang matrisi tam: tr, zh, en, en-RU/FR/NL/ES/AR, de, de-AT, de-CH, **x-default: tr**; her varyant kendi URL'sine canonical; dil-bazlı parçalı sitemap index (`/sitemaps/sitemap-{tr,zh,en,de}.xml`) build'de otomatik
- GEO sinyalleri: `llms.txt`, `ClaimReview`/`FAQPage`/`Product` schema, ülkeye özel para birimi/telefon formatı, vaka çalışmaları, bölge uzmanı + yerel kanal
- /zh: Baidu meta verification (ICP'siz, Cloudflare HK hızlandırma; .cn + Aliyun mirror ileride, 301 ile sorunsuz)
- en-ar: `dir="rtl"` + layout mirror zorunlu (I18N_RULES.md agent'lara kural olarak)

## 10. Faz Planı (ORCHESTRATOR.md §10 eşlemesi)

| Faz | Kapsam | Yayın |
| :--- | :--- | :--- |
| 0 | Repo + tüm orkestrasyon .md + agent skill dosyaları (GLM 5.3, tek seferlik) | Kurulum |
| 1 | TR ana site + partner başvuru hunisi | Yayında |
| 2 | EN global + 5 varyant iskelet + hreflang/sitemap | Yayında |
| 3 | Admin (Access korumalı) + D1 + /api/v1 — **Claude Sonnet 5.5 zorunlu** | Çalışır |
| 4 | RSS + 3-gün TTL + AI İçerik Fabrikası — tam otomatik, T0/T1 ağırlıklı | Otomasyon |
| 5 | ZH (Qwen 3.8) + DE (Sonnet) tam yerelleştirme | Tam kapsam |
| 6 | GSC/GA4/Meta analitik + haftalık insan raporu | Analitik |
| 7 | Public API + .cn geçiş değerlendirmesi | Ölçekleme |

## 11. Riskler ve Kritik Karar Noktaları

1. .cn domain + barındırma = ICP lisansı şart → başlangıçta /zh Cloudflare'de statik + agresif cache; hreflang hazır olduğundan ileride 301 ile sorunsuz
2. Cloudflare Queues free'de yok → D1 `ai_jobs` + cron çözüldü
3. Firebase'e düşme: AI çağrısı Blaze+kart ister → elenen en büyük sebep; Supabase: 7 gün inaktif uykuya geçme riski → elenen
4. KVKK/GDPR: formlarda açık rıza + double opt-in (EN-DE), partner logo için ayrı yayın rızası; /de Impressum + Datenschutz zorunlu
5. AI içerik kalitesi/spam riski: onaysız yayın yok; PR merge ile versiyonlanır
6. D1 yedek: haftalık cron → export → R2
7. Model kırılganlığı: GLM 5.3 orkestratör düşerse Gemini Flash "reduced-mode" (yalnızca dağıtım); fallback chain ORCHESTRATOR.md §8'de
8. **Token ekonomisi:** deterministik işler script ile (sitemap/hreflang/parse), batch çağrılar, prompt-cache prefix sabitliği, gece kota taşması — ORCHESTRATOR.md §4

**SONRAKİ ADIM:** Faz 0 — `ORCHESTRATOR.md` ve `AGENTS.md` hazır ✅ → `agents/` altındaki uzman agent tanımlarının tam metinleri + `tasks/` kuyruk dosyaları + GitHub Actions orchestrator workflow (15dk) → ilk çalıştırma.
