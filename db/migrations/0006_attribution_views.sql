-- ============================================================================
-- Migration 0006 — attribution görünümleri (FAZ_6 Step 6.1 · Opus 5.5 · 2026-10-30)
-- EXPAND-ONLY: yalnız YENİ VIEW'lar eklenir; hiçbir tablo/kolon değişmez, hiçbir veri taşınmaz → geri alınabilir (DROP VIEW), eski kod etkilenmez.
-- CONTRACT adımı yok (kaldırılan bir şey yok). İlk remote apply'dan sonra bu dosya DONDURULUR; değişiklik = 0007 (yeni view / DROP+CREATE).
--
-- ANONİM JOIN (KVKK/GDPR — pazarlıksız): lead tarafı YAPISAL olarak anonimdir. `attribution_leads_v` leads'ten YALNIZ aşağıdaki kolonları açar:
--   created_at, locale, form_type, source_page, utm_source/medium/campaign, touch_at.
-- id, payload_json (ad/e-posta/telefon/mesaj), partner_id, channel_pref, consent_*, double_optin_at GÖRÜNÜMDE YOKTUR → atıf sorguları (workers/api/src/attribution.ts)
-- yalnız bu görünümü okur; kullanıcı kimliği ile eşleştirme teknik olarak mümkün değildir. Trafik görünümleri agregattır (kişisel veri içermez).
--
-- Veri sözleşmesi (yazan taraflar):
--   leads.utm_json (lead yazıcısı — /v1/leads, ERTELENEN C1): {"utm_source","utm_medium","utm_campaign","touch_at"}; touch_at = son tıklamanın ISO zamanı.
--   leads.source_page = SON TIKLAMA ile gelinen sayfa yolu (landing) — sayfa görüntüsünde istemci 30 gün ömürlü first-party kayıt tutar.
--   analytics_daily.ga4_json (cron, 3.7/6.5): {"topPages":[{"pagePath","sessions"}], "formStarts":[{"pagePath","count"}]?}  (formStarts E4 + GA4 olayı sonrası)
--   analytics_daily.gsc_json (cron): {"topPages":[{"page","clicks","impressions"}]?}
-- Bozuk JSON görünümü ve sorguyu PATLATMAZ (json_valid korumalı → NULL / boş küme).
-- ============================================================================

CREATE VIEW IF NOT EXISTS attribution_leads_v AS
SELECT
  created_at,
  locale,
  form_type,
  NULLIF(TRIM(source_page), '')                                                  AS source_page,
  CASE WHEN json_valid(utm_json) THEN json_extract(utm_json, '$.utm_source')   END AS utm_source,
  CASE WHEN json_valid(utm_json) THEN json_extract(utm_json, '$.utm_medium')   END AS utm_medium,
  CASE WHEN json_valid(utm_json) THEN json_extract(utm_json, '$.utm_campaign') END AS utm_campaign,
  CASE WHEN json_valid(utm_json) THEN json_extract(utm_json, '$.touch_at')     END AS touch_at
FROM leads;

-- Üç trafik görünümü ortak savunma: (1) JSON geçerli DEĞİLSE ya da hedef anahtar DİZİ değilse boş küme; (2) dizi öğesi nesne DEĞİLSE (skaler/metin) json_extract ÇAĞRILMAZ
-- (metin öğede json_extract "malformed JSON" ile patlardı — fixture testinde yakalandı); (3) sayfa NULL olan satır atılır.

-- Sayfa bazlı GA4 oturumları (cron topPages — günlük EN ÇOK N sayfa: kapsam eksik olabilir, eksik satır "0" DEĞİL "bilinmiyor"dur).
CREATE VIEW IF NOT EXISTS attribution_page_traffic_v AS
SELECT day, page, sessions FROM (
  SELECT a.day AS day,
         CASE WHEN p.type = 'object' THEN json_extract(p.value, '$.pagePath') END                  AS page,
         CASE WHEN p.type = 'object' THEN CAST(json_extract(p.value, '$.sessions') AS INTEGER) END AS sessions
  FROM analytics_daily a,
       json_each(CASE WHEN json_valid(a.ga4_json) AND json_type(a.ga4_json, '$.topPages') = 'array' THEN a.ga4_json ELSE '{}' END, '$.topPages') p
  WHERE a.locale = 'all'
) WHERE page IS NOT NULL;

-- Sayfa bazlı GSC (organik arama): tıklama + gösterim.
CREATE VIEW IF NOT EXISTS attribution_page_search_v AS
SELECT day, page, clicks, impressions FROM (
  SELECT a.day AS day,
         CASE WHEN p.type = 'object' THEN json_extract(p.value, '$.page') END                         AS page,
         CASE WHEN p.type = 'object' THEN CAST(json_extract(p.value, '$.clicks') AS INTEGER) END      AS clicks,
         CASE WHEN p.type = 'object' THEN CAST(json_extract(p.value, '$.impressions') AS INTEGER) END AS impressions
  FROM analytics_daily a,
       json_each(CASE WHEN json_valid(a.gsc_json) AND json_type(a.gsc_json, '$.topPages') = 'array' THEN a.gsc_json ELSE '{}' END, '$.topPages') p
  WHERE a.locale = 'all'
) WHERE page IS NOT NULL;

-- Sayfa bazlı "form başladı" (GA4 özel olayı; olay bağlanana dek BOŞ → huni bu aşamayı "veri yok" gösterir, sahte sayı üretilmez).
CREATE VIEW IF NOT EXISTS attribution_page_formstart_v AS
SELECT day, page, form_starts FROM (
  SELECT a.day AS day,
         CASE WHEN p.type = 'object' THEN json_extract(p.value, '$.pagePath') END                    AS page,
         CASE WHEN p.type = 'object' THEN CAST(json_extract(p.value, '$.count') AS INTEGER) END      AS form_starts
  FROM analytics_daily a,
       json_each(CASE WHEN json_valid(a.ga4_json) AND json_type(a.ga4_json, '$.formStarts') = 'array' THEN a.ga4_json ELSE '{}' END, '$.formStarts') p
  WHERE a.locale = 'all'
) WHERE page IS NOT NULL;
