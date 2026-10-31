-- ============================================================================
-- Migration 0007 — keyword motoru (FAZ_6 Step 6.3 · Opus 5.5 · 2026-10-31)
-- EXPAND-ONLY: 1 YENİ VIEW + 1 YENİ TABLO (+ index'leri). Mevcut hiçbir tablo/kolon/view değişmez, veri taşınmaz; 0006 view'larına DOKUNULMAZ.
-- GERİ ALMA (contract adımı yok — kaldırılan bir şey yok):
--   DROP INDEX IF EXISTS idx_kwopp_band; DROP INDEX IF EXISTS idx_kwopp_locale;
--   DROP TABLE IF EXISTS keyword_opportunities; DROP VIEW IF EXISTS gsc_query_v;
--   (keyword_opportunities türetilmiş bir anlık görüntüdür: silinirse bir sonraki cron çalışması yeniden üretir — kalıcı veri kaybı yok.)
-- İlk remote apply'dan sonra bu dosya DONDURULUR; değişiklik = 0008.
--
-- Veri sözleşmesi (yazan taraf): analytics_daily.gsc_json.queries (cron-analytics, GSC searchAnalytics dimensions=[query,page]):
--   [{"query","page","clicks","impressions","ctr","position"}]  — günlük EN ÇOK N satır (GSC_QUERY_ROW_LIMIT). Canlı veri E4 (OAuth) sonrası akar.
-- Sorgu metni kişisel veri İÇEREBİLİR (kullanıcı yazar): e-posta/telefon benzeri sorgular cron'da YAZILMAZ ve motorda ATILIR (keyword-score.ts isSafeQuery).
-- Bozuk JSON görünümü/sorguyu PATLATMAZ (0006 ile aynı savunma: json_valid + json_type + öğe tipi 'object').
-- ============================================================================

CREATE VIEW IF NOT EXISTS gsc_query_v AS
SELECT day, query, page, clicks, impressions, ctr, position FROM (
  SELECT a.day AS day,
         CASE WHEN q.type = 'object' THEN json_extract(q.value, '$.query') END                        AS query,
         CASE WHEN q.type = 'object' THEN json_extract(q.value, '$.page') END                         AS page,
         CASE WHEN q.type = 'object' THEN CAST(json_extract(q.value, '$.clicks') AS INTEGER) END      AS clicks,
         CASE WHEN q.type = 'object' THEN CAST(json_extract(q.value, '$.impressions') AS INTEGER) END AS impressions,
         CASE WHEN q.type = 'object' THEN CAST(json_extract(q.value, '$.ctr') AS REAL) END            AS ctr,
         CASE WHEN q.type = 'object' THEN CAST(json_extract(q.value, '$.position') AS REAL) END       AS position
  FROM analytics_daily a,
       json_each(CASE WHEN json_valid(a.gsc_json) AND json_type(a.gsc_json, '$.queries') = 'array' THEN a.gsc_json ELSE '{}' END, '$.queries') q
  WHERE a.locale = 'all'
) WHERE query IS NOT NULL AND page IS NOT NULL;

-- Fırsat anlık görüntüsü: (sorgu, locale) başına bir satır. cron her çalışmada TEK batch'te DELETE + INSERT yapar (atomik; yarım görüntü yok).
-- Skor DETERMİNİSTİKTİR (workers/api/src/keyword-score.ts, score_version). insight_* = runtime AI (Gemini, E3) — o güne dek NULL + insights_status.
-- volume KOLONU YOK: arama hacmi bu tabloda tutulmaz; yalnız GSC'nin gerçek gösterim/tıklama sayıları (FAZ_6 §1 kural 3 — uydurma hacim yasak).
CREATE TABLE IF NOT EXISTS keyword_opportunities (
  query          TEXT NOT NULL CHECK (length(query) BETWEEN 1 AND 200),
  locale         TEXT NOT NULL CHECK (locale IN ('tr','en','de','zh','en-ru','en-fr','en-nl','en-es','en-ar')),
  page           TEXT NOT NULL CHECK (length(page) BETWEEN 1 AND 300),       -- sorguda en çok gösterim alan sitemiz sayfası (normalize yol)
  pages_count    INTEGER NOT NULL CHECK (pages_count >= 1),                  -- aynı sorguda gösterim alan sayfa sayısı (yamyamlaşma sinyali)
  impressions    INTEGER NOT NULL CHECK (impressions >= 0),
  clicks         INTEGER NOT NULL CHECK (clicks >= 0),
  ctr            REAL NOT NULL CHECK (ctr >= 0 AND ctr <= 1),                -- clicks / impressions (pencere toplamı)
  position       REAL NOT NULL CHECK (position >= 1),                        -- gösterim ağırlıklı ortalama pozisyon
  ref_ctr        REAL CHECK (ref_ctr IS NULL OR (ref_ctr >= 0 AND ref_ctr <= 1)), -- sitenin AYNI pozisyon aralığındaki CTR'ı; az veri → NULL
  score          REAL NOT NULL CHECK (score >= 0 AND score <= 100),
  band           TEXT NOT NULL CHECK (band IN ('near','snippet','top','long_shot')),
  action         TEXT NOT NULL CHECK (action IN ('update_page','improve_snippet','new_page','monitor')),
  reason         TEXT NOT NULL CHECK (length(reason) BETWEEN 1 AND 500),     -- deterministik gerekçe (karar satırı)
  score_version  TEXT NOT NULL,
  window_from    TEXT NOT NULL,
  window_to      TEXT NOT NULL,
  days_with_data INTEGER NOT NULL CHECK (days_with_data >= 1),
  keyword_id     TEXT,                                                       -- admin'in girdiği keywords satırı (eşleşirse)
  insights_status TEXT NOT NULL DEFAULT 'off' CHECK (insights_status IN ('off','skipped','stub','ok','unconfigured','quota_paused','error')),
  insight_intent  TEXT CHECK (insight_intent IS NULL OR insight_intent IN ('informational','commercial','transactional')),
  insight_cluster TEXT CHECK (insight_cluster IS NULL OR length(insight_cluster) <= 60),
  insight_suggestion TEXT CHECK (insight_suggestion IS NULL OR length(insight_suggestion) <= 200),
  insight_model   TEXT,
  computed_at    TEXT NOT NULL,
  PRIMARY KEY (query, locale)
);
CREATE INDEX IF NOT EXISTS idx_kwopp_locale ON keyword_opportunities(locale, score DESC);
CREATE INDEX IF NOT EXISTS idx_kwopp_band ON keyword_opportunities(band, score DESC);
