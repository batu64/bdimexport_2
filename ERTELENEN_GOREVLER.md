# ERTELENEN GÖREVLER — Proje Sonu Kontrol Listesi
**Proje:** bdimexport.com | **Amaç:** Projenin ilerleyişini **doğrudan etkilemeyen**, en sonda tek seferde yapılabilecek adımlar burada toplanır. Bir işi ertelediğimizde buraya not düşülür; **proje sonunda bu liste tek tek gözden geçirilir.**

> Kural: Bir adım bir fazın çıkışını bloklamıyorsa ve en sonda yapılabilecekse → buraya. Her kayıt: **konu · faz · neden ertelendi · ne zaman · durum.**

---

## 🔴 Güvenlik (ertelenebilir ama uzatma)

| # | Konu | Neden | Ne zaman | Durum |
| :-- | :-- | :-- | :-- | :-- |
| S1 | **İfşa olan Cloudflare API token + R2 Secret Access Key rotasyonu** | Sohbette ekran görüntüsüyle ifşa oldu (2026-10-17) | **En kısa sürede** (güvenlik) | ⏳ bekliyor |

---

## 🟡 Altyapı / Entegrasyon (proje sonu)

| # | Konu | Faz | Neden ertelendi | Ne zaman |
| :-- | :-- | :-- | :-- | :-- |
| E1 | **Cloudflare Access — Google login (edge auth)** | 3.1/3.9 | Google login akışında `ERR_CONNECTION_RESET`; routing+deploy+statik admin SAĞLAM, reset sadece login handshake'te. Admin backend henüz Pages'e bağlı değil → kullanılmıyor, ilerlemeyi engellemiyor. | Proje sonu — muhtemelen **custom domain (bdimexport.com)** bağlanınca + Google IdP test |
| E2 | **Custom domain bdimexport.com → Pages bağlama** | 3.9/8 | Şimdilik `bdimexport.pages.dev` yeterli; Access de custom domainde temiz çalışır | Lansman öncesi (FAZ 8) |
| E3 | **Runtime AI = Gemini** (içerik fabrikası 4.5, RSS özet 4.4, keyword 6.3, görsel 2.6) | 2.6/4/6 | AGENTS.md §9 tasarım kararı: tüm geliştirme Claude Code ile, Gemini en sonda tek seferde. **6.3 keyword (2026-10-31, `1e2ca58`):** `workers/api/src/keyword-insights.ts` `GeminiKeywordModel.insights()` TODO(E3) — `generateContent` çağrısını yaz (cron-rss/model.ts ile aynı desen; 429 → `QuotaExceeded`); cron-analytics'e `KEYWORD_INSIGHTS_MODE=gemini` + `GEMINI_MODEL`/`GEMINI_FALLBACK_MODEL` var + `wrangler secret put GEMINI_API_KEY` (👤) + kota var'ları (`AI_DAILY_LIMIT`…). O güne dek varsayılan `off`: skor deterministik tam, `insight_*` NULL | **Proje sonu** (AGENTS.md §9) |
| E4 | **GSC/GA4/Meta OAuth** (analitik canlı veri) | 3.7 | Trafik + GSC/GA4 property yok → anlamlı veri çekilemez. **6.3 (2026-10-31):** keyword motoru GSC SORGU×SAYFA verisini bekler — OAuth gelince cron-analytics `gsc_json.queries` yazar (`GSC_QUERY_ROW_LIMIT`, varsayılan 500/gün), motor aynı gece skorlar; o güne dek `keyword_opportunities` boş, `/analytics/keywords` `query_data:"none"`. Ayrıca migration **0007 remote apply 👤** (staging önce, 0006'dan sonra). **6.5 (2026-10-31, `628783d`):** Meta ölçümü token bekler — 👤 `wrangler secret put META_ACCESS_TOKEN --env <env>` (Business Manager **sistem kullanıcısı** token'ı, yalnız `ads_read` izni; süresiz/uzun ömürlü) + `META_AD_ACCOUNT_ID` var'ı (`act_<rakam>`) + opsiyonel `META_APP_SECRET` (appsecret_proof) + `META_API_VERSION` (o tarihteki güncel Graph sürümü — kod varsayılanı v21.0, doğrulanmalı). O güne dek cron `integration_status.meta = unconfigured`, `/analytics/meta` null + not döner (sahte harcama yok). Reklam URL şablonu: `utm_source=facebook&utm_medium=paid_social&utm_campaign={{campaign.id}}`. Migration **0008 remote apply 👤** (0007'den sonra). Reklam bütçesi kararı 6.8'de | FAZ 6 (analitik fazı) |
| E5 | **Mail provider (Resend/Brevo) secret + entegrasyon** | 3.9/8 | E-posta gönderimi (partner davet/lead bildirim) FAZ 8'de başlar | FAZ 8 |
| E6 | **R2 `bdimexport-backups`: private teyit + 90 gün lifecycle** | 3.9 | Dashboard işi, kolay | Yakında (kısa) |
| E7 | **Yayın botu `GITHUB_PUBLISH_TOKEN`** (fine-grained PAT: yalnız batu64/bdimexport, Contents + Pull requests R/W, ≤90 gün) → `wrangler secret put … --env staging/production` + `GITHUB_BASE_BRANCH`'in Pages production dalı olduğunu teyit | 4.6 | Kod hazır, token yokken 'Yayına hazırla' DRY-RUN planı kaydeder (hat bloklanmaz) | İlk gerçek makale yayınından önce (FAZ 8.4 / E3 ile) |
| E9 | **Baidu Webmaster hesabı + HTML etiketi doğrulaması** (`NEXT_PUBLIC_BAIDU_SITE_VERIFICATION` Pages env) + sitemap-zh gönderimi | 4.8 | Kod/sitemap/rehber hazır (docs/baidu.md); doğrulama bdimexport.com ister (E2 önce) ve /zh içeriği FAZ 5'te dolar | FAZ 5.5 (E2 sonrası) |
| E8 | **Admin API router bağlaması** (handleLeads/handlePartners/handleContent → workers/api `/admin/api/*` + Pages Functions proxy veya custom domain route) | 3.3–3.6/4.6 (F-06) | Handler'lar + testler hazır; canlı yönlendirme deploy/domain işine bağlı | FAZ 8.2 (E1/E2 ile) |

---

## 🟢 İçerik / Uyum (ilgili faza)

| # | Konu | Faz | Neden ertelendi | Ne zaman |
| :-- | :-- | :-- | :-- | :-- |
| C1 | **/v1/leads endpoint** (public, PII) | 3.4 | EN/DE GDPR rıza metni + çağıran form hazır değil | FAZ 5 (Datenschutz) civarı |
| C2 | **KVKK rıza metni placeholder'ları** (adres / e-posta) | 1.1 | Gerçek şirket verisi insan tarafından sonra girilecek | Form canlıya alınmadan önce (FAZ 8 öncesi) |
| C3 | **Lead saklama süresi (365 gün) kesinleştirme + otomatik silme cron** | 3.3/4 | ✅ **KAPANDI (FAZ 4.2):** `workers/cron-rss/src/maintenance.ts` — 365 gün, audit'li silme, PII audit'e girmez. KVKK metniyle eşitleme takipte (`LEAD_RETENTION_DAYS` sabiti) | FAZ 4.2 ✅ |
| C4 ✅ | ~~**RSS kaynak CRUD kalıcı depolama**~~ (4.1: `settings.rssSources` + cron-rss, 2026-10-19) | 3.6 | İçerik fabrikası arayüzü mock; gerçek depolama FAZ 4 hattında | FAZ 4.1 |
| C5 | **Lighthouse canlı ölçüm (≥90)** | 2/8 | Canlı URL + gerçek ortam gerek | FAZ 8.1 lansman denetimi (canlı URL / PageSpeed) |
| C6 | **/en/{ru,fr,nl,es,ar} varyant tam içeriği** (şu an iskelet) | 2.5 | Tasarım gereği FAZ 2 iskelet; tam çeviri FAZ 5 | FAZ 5 |
| C7 | **/de + /zh makale rotaları** (yayın botu şu an `route_pending` ile reddeder) | 4.6 | de/zh route grupları FAZ 5'te kuruluyor | ◐ app tarafı ✅ 5.6 (`/de/ratgeber` ← content/de/ratgeber · `/zh/insights` ← content/zh/insights, boş-durum shell). KALAN (api): render.ts `routeFor` de/zh dizinleri → bot `route_pending` kalkar |
| **C8** 🔴⚖️ | **/de Impressum + Datenschutz METNİ (FAZ 5.1)** — gerçek şirket verisi (ticaret unvanı, adres, yetkili temsilci, iletişim, vergi/sicil no, veri sorumlusu) + **hukuk imzası** | 5.1 | Kullanıcı veriyi sonra verecek (2026-10-30 kararı); FAZ 5 bu nedenle metin olmadan kapandı. Shell + footer linkleri + anfrage veri kategorileri (`_lib/datenschutz.ts`) HAZIR, metin boş. | **LANSMAN BLOKÖRÜ (FAZ 8, pazarlıksız):** /de §5 TMG gereği Impressum/Datenschutz olmadan **yayına/indekse ALINAMAZ**. Veri gelince 5.1 yazılır → `de.json anfrage.consent` sürümü güncellenir → form açılır (E5 + `NEXT_PUBLIC_DE_FORM_ENABLED`). Birlikte: C2 (KVKK) + /de/vertrauen gerçek yorumlar + B3 (de WhatsApp numarası). |

---

## ⚪ Temizlik (opsiyonel)

| # | Konu | Neden | Ne zaman |
| :-- | :-- | :-- | :-- |
| T1 | Stray `bdimexport` D1 (`d0a18e47…`) + `bdimexport` R2 bucket silme | Erken denemeden kalma; config kullanmıyor | Karışıklık olmasın diye uygun bir zamanda |
| T2 | `.tmp_board.py`, `tsconfig.tsbuildinfo` → `.gitignore` | Geçici/artefakt | Repo hijyeni |
| T3 | **9 makale yer tutucusu (`_yok`) 404 kabuğu `lang`/`dir`'siz** (FAZ 5.7/B4) | noindex + linksiz → SEO/kullanıcı etkisi ihmal edilebilir; düzeltme = route gruplarına `not-found.tsx` (grup layout'unda lang/dir'li) | İlk makaleler gelmeden / repo hijyeni turunda |
| T4 | **B5: TİM Almanya 13,1 mlr USD ikincil kaynak** (CNN Türk) → TİM birincil bülten linki | content/de — kaynak zinciri güçlendirme | FAZ 8.1 lansman denetimi |

---

## Kullanım
- Yeni bir erteleme çıktığında: uygun bölüme bir satır ekle (konu · faz · neden · ne zaman).
- **Proje sonunda:** bu listeyi yukarıdan aşağı gez; S (güvenlik) → E (altyapı) → C (içerik) → T (temizlik) sırasıyla kapat.
- Bir madde yapıldığında satırın başına ✅ koy veya sil.

_Son güncelleme: 2026-10-30 — FAZ 5 kapanışı: **C8** (/de Impressum/Datenschutz metni — 🔴 LANSMAN BLOKÖRÜ, kullanıcı veriyi sonra verecek), T3 (B4 `_yok` lang/dir), T4 (B5 TİM kaynak) eklendi. Önceki: 2026-10-27 FAZ 4.6 E7/E8/C7, FAZ 4.8 E9._
