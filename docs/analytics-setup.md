# Analitik Entegrasyonu ve Credential Dokümantasyonu (Step 3.7)

`workers/cron-analytics` Cloudflare Worker servisi ve admin panel `app/admin/analytics` arayüzü kurulmuştur.
Bu doküman, analitik sisteminin canlıya alınması için gereken API anahtarları, izinler ve gizli değişkenlerin (secrets) envanterini açıklar.

> **Önemli Güvenlik Kuralı:** Kod tabanında veya git geçmişinde ASLA gerçek secret veya credential tutulmaz. Değerler yalnızca Cloudflare Secrets (`wrangler secret put`) üzerinden ortama enjekte edilir.

---

## 1. Gerekli Credential Envanteri

| Servis | Değişken Adı | Açıklama | Nereden Alınır? |
| :--- | :--- | :--- | :--- |
| **Cloudflare Pages** | `CF_ACCOUNT_ID` | Cloudflare Hesap ID'si | Cloudflare Dashboard → Sağ sütun (Account ID) |
| **Cloudflare Pages** | `CF_API_TOKEN` | GraphQL Analytics okuma yetkili API Token | Cloudflare Dashboard → My Profile → API Tokens (Read Analytics) |
| **Google Search Console** | `GOOGLE_SERVICE_ACCOUNT_EMAIL` | GCP Service Account e-postası | Google Cloud Console → IAM & Admin → Service Accounts |
| **Google Search Console** | `GOOGLE_PRIVATE_KEY` | Service Account özel anahtarı (PEM format) | Google Cloud Console → Service Account Keys JSON |
| **Google Search Console** | `GSC_SITE_URL` | Search Console'daki site URL veya etki alanı | `https://bdimexport.com` veya `sc-domain:bdimexport.com` |
| **Google Analytics 4** | `GA4_PROPERTY_ID` | GA4 Mülk Numarası | Google Analytics → Yönetici → Mülk Ayrıntıları (Property ID) |
| **Meta Marketing API** | `META_ACCESS_TOKEN` | Uzun ömürlü Sistem Kullanıcısı Token'ı | Meta Business Suite → Sistem Kullanıcıları → Token Oluştur |
| **Meta Marketing API** | `META_AD_ACCOUNT_ID` | Reklam Hesabı ID'si (`act_...` veya numara) | Meta Ads Manager |
| **Manuel tetik (/sync)** | `SYNC_TOKEN` | `/sync` uç noktasının Bearer sırrı; **tanımsızsa /sync KAPALI** (403). Rastgele uzun değer üret | `openssl rand -hex 32` → `wrangler secret put` |
| **Bildirim & Alarm** | `ANALYTICS_ALERT_WEBHOOK_URL` | Hata durumunda uyarılacak Webhook | Slack Incoming Webhook veya Discord Webhook URL |

---

## 2. Kurulum ve İzin Adımları (İnsan Operasyonu)

### Google Search Console & GA4 Yetkilendirmesi
1. **Google Cloud Console**'da yeni bir proje oluşturun veya mevcut projeyi seçin.
2. Aşağıdaki API'leri etkinleştirin:
   - **Google Search Console API**
   - **Google Analytics Data API**
3. **Service Account** oluşturun (örn: `bdimexport-analytics@...iam.gserviceaccount.com`).
4. Bir adet **JSON Key** oluşturun ve indirin.
5. **Yetkilendirme:**
   - **GSC:** Google Search Console paneline gidin → *Ayarlar* → *Kullanıcılar ve İzinler* → Service Account e-postasını "Kısıtlı" veya "Tam" yetkiyle ekleyin.
   - **GA4:** Google Analytics paneline gidin → *Yönetici* → *Mülk Erişim Yönetimi* → Service Account e-postasını "Görüntüleyici" (Viewer) olarak ekleyin.

### Cloudflare Ortamına Secret'ları Ekleme
`workers/cron-analytics` dizininde veya proje kök dizininde Cloudflare Wrangler CLI ile secrets tanımlanır:

```bash
# Staging için
wrangler secret put GOOGLE_SERVICE_ACCOUNT_EMAIL --env staging
wrangler secret put GOOGLE_PRIVATE_KEY --env staging
wrangler secret put GA4_PROPERTY_ID --env staging
wrangler secret put GSC_SITE_URL --env staging
wrangler secret put CF_ACCOUNT_ID --env staging
wrangler secret put CF_API_TOKEN --env staging
wrangler secret put META_ACCESS_TOKEN --env staging
wrangler secret put META_AD_ACCOUNT_ID --env staging
wrangler secret put ANALYTICS_ALERT_WEBHOOK_URL --env staging
wrangler secret put SYNC_TOKEN --env staging
```

---

## 3. Çalışma Mantığı ve Backfill (Dünü Çek)

- Cron job her gün gece 00:00 UTC (TR saati ile 03:00)'da otomatik olarak tetiklenir ve bir önceki günün (dünün) verilerini çeker.
- Çekilen veriler D1 veritabanındaki `analytics_daily` tablosuna `day` ve `locale='all'` olarak yazılır (`ON CONFLICT` ile güncellenir).
- **Otomatik backfill:** her cron çalışmasında dünün yanında son 7 günde `analytics_daily`'de kaydı olmayan günler de çekilir (çalışma başına en fazla 3 eksik gün — API kotası korunur).
- **Credential yoksa (STUB):** hiçbir kaynak yapılandırılmamışsa çekim `skipped: no_credentials` döner ve D1'e **satır yazılmaz**; credential var ama tüm kaynaklar boş dönerse de mevcut satır null ile ezilmez (alarm gönderilir).
- **Manuel / toplu backfill** (`/sync` artık `POST` + `Authorization: Bearer $SYNC_TOKEN` ister; token ortam değişkeni olarak verilir, komuta/koda yazılmaz):
  ```bash
  # Belirli bir günü çekmek için
  SYNC_TOKEN=... CRON_ANALYTICS_URL=https://<worker> node workers/cron-analytics/scripts/backfill.mjs --day=2026-10-09

  # Son N günü toplu çekmek için
  SYNC_TOKEN=... CRON_ANALYTICS_URL=https://<worker> node workers/cron-analytics/scripts/backfill.mjs --days=7
  ```

---

## 4. ⏸ CANLI OAUTH ERTELENDİ (3.9 / FAZ 6)

**Durum (3.7 sonu):** kod hazır ve testli; **gerçek GSC/GA4/Meta credential girişi yapılmadı**. Sebep: trafik ve GA4/GSC property'leri henüz yok. Bu yüzden `analytics_daily` boştur ve admin Analitik ekranı "Veri OAuth bağlanınca" boş durumunu gösterir (beklenen).

**Yapılacak (👤, 3.9 secret girişleri / FAZ 6 — trafik + property hazır olunca):**
1. §2'deki Service Account + GSC/GA4 izinleri, §1'deki secret'lar (`wrangler secret put … --env staging`, sonra production).
2. `workers/cron-analytics/wrangler.toml` içindeki `database_id` değerlerini (`local-dev`, `REPLACE_ME_STAGING_D1_ID`) gerçek D1 ID'leriyle değiştir (3.9).
3. **Canlı doğrulama (kabul):** `backfill.mjs --day=<dün>` çalıştır → D1'de `SELECT * FROM analytics_daily WHERE day='<dün>'` 1 satır dönmeli; admin Analitik ekranında kart + grafikler dolmalı.
4. Not: `/api/admin/analytics/summary` uç noktasını admin API router'ına bağlamak 3.4'ün işidir (`app/admin/analytics/handler.ts` hazır).

> Bu doküman ve kod içindeki `TODO(3.9/FAZ 6)` notları aynı ertelemeyi işaret eder.
