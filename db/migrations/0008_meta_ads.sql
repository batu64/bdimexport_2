-- ============================================================================
-- Migration 0008 — Meta reklam ölçümü (FAZ_6 Step 6.5 · Opus 5.5 · 2026-10-31)
-- EXPAND-ONLY: 1 YENİ VIEW + 1 YENİ TABLO. Mevcut hiçbir tablo/kolon/view değişmez, veri taşınmaz; 0006 + 0007 nesnelerine DOKUNULMAZ.
-- GERİ ALMA (contract adımı yok — kaldırılan bir şey yok):
--   DROP VIEW IF EXISTS meta_campaign_v; DROP TABLE IF EXISTS integration_status;
--   (integration_status yalnız son kontrol durumudur: silinirse bir sonraki cron çalışması yeniden yazar — kalıcı veri kaybı yok.)
-- İlk remote apply'dan sonra bu dosya DONDURULUR; değişiklik = 0009.
--
-- Veri sözleşmesi (yazan taraf: cron-analytics/src/meta.ts, Insights level=campaign, günlük):
--   analytics_daily.meta_json = {"schema":"meta-insights.v1","spend","impressions","clicks","link_clicks","leads","currency","truncated","fetched_at",
--     "campaigns":[{"id","name","objective","spend","impressions","clicks","link_clicks","reach","leads"}]}
--   3.7 alanları (spend/impressions/clicks/campaigns) KORUNUR. null = Meta bildirmedi (0 DEĞİL). Para birimi = hesap para birimi.
-- KVKK: yalnız kampanya AGREGATI — kişi/kitle/cihaz verisi yok. Lead eşlemesi admin API'de attribution_leads_v (0006, anonim) üzerinden SAYIM'dır.
-- Bozuk JSON görünümü/sorguyu PATLATMAZ (0006/0007 ile aynı savunma: json_valid + json_type + öğe tipi 'object').
-- ============================================================================

CREATE VIEW IF NOT EXISTS meta_campaign_v AS
SELECT day, currency, campaign_id, campaign_name, objective, spend, impressions, clicks, link_clicks, reach, leads FROM (
  SELECT a.day AS day,
         CASE WHEN json_type(a.meta_json, '$.currency') = 'text' THEN json_extract(a.meta_json, '$.currency') END AS currency,
         CASE WHEN c.type = 'object' THEN CAST(json_extract(c.value, '$.id') AS TEXT) END                 AS campaign_id,
         CASE WHEN c.type = 'object' THEN json_extract(c.value, '$.name') END                             AS campaign_name,
         CASE WHEN c.type = 'object' THEN json_extract(c.value, '$.objective') END                        AS objective,
         CASE WHEN c.type = 'object' THEN CAST(json_extract(c.value, '$.spend') AS REAL) END              AS spend,
         CASE WHEN c.type = 'object' THEN CAST(json_extract(c.value, '$.impressions') AS INTEGER) END     AS impressions,
         CASE WHEN c.type = 'object' THEN CAST(json_extract(c.value, '$.clicks') AS INTEGER) END          AS clicks,
         CASE WHEN c.type = 'object' THEN CAST(json_extract(c.value, '$.link_clicks') AS INTEGER) END     AS link_clicks,
         CASE WHEN c.type = 'object' THEN CAST(json_extract(c.value, '$.reach') AS INTEGER) END           AS reach,
         CASE WHEN c.type = 'object' THEN CAST(json_extract(c.value, '$.leads') AS INTEGER) END           AS leads
  FROM analytics_daily a,
       json_each(CASE WHEN json_valid(a.meta_json) AND json_type(a.meta_json, '$.campaigns') = 'array' THEN a.meta_json ELSE '{}' END, '$.campaigns') c
  WHERE a.locale = 'all'
) WHERE campaign_id IS NOT NULL AND spend IS NOT NULL AND impressions IS NOT NULL AND clicks IS NOT NULL;

-- Kaynak entegrasyon durumu (cron çalışması başına son kontrol). Şimdilik yalnız 'meta' yazılır; gsc/ga4/cf FAZ 6.6 sağlık panosu için ayrıldı.
-- detail: kısa durum açıklaması — token/anahtar/hesap değeri ASLA yazılmaz.
CREATE TABLE IF NOT EXISTS integration_status (
  source      TEXT PRIMARY KEY CHECK (source IN ('meta', 'gsc', 'ga4', 'cf')),
  status      TEXT NOT NULL CHECK (status IN ('unconfigured', 'ok', 'passive', 'auth_error', 'error')),
  detail      TEXT CHECK (detail IS NULL OR length(detail) <= 200),
  last_day    TEXT CHECK (last_day IS NULL OR last_day GLOB '[0-9][0-9][0-9][0-9]-[0-9][0-9]-[0-9][0-9]'),
  checked_at  TEXT NOT NULL,
  last_ok_at  TEXT
);
