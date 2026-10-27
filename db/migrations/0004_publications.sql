-- ============================================================================
-- Migration 0004 — publications (FAZ_4 Step 4.6 · Opus 5.5 · 2026-10-27)
-- Onay → yayın hattının izi. contents.status yalnız draft → approved → published akar (iki ayrı insan aksiyonu);
-- bu tablo "yayına NASIL gidildiğini" tutar:
--   kind='pr'   : kalıcı makale → bot Git PR açar (state pr_open) → insan merge eder → admin "yayınlandı" işaretler (live)
--   kind='edge' : haber kartı (news_card) → D1'den edge render; admin yayın aksiyonu anında live
--   state='dry_run' : GITHUB_PUBLISH_TOKEN yokken üretilen PR PLANI (dosyalar files_json'da; hiçbir ağ çağrısı yapılmadı)
-- Değişiklik geçmişi admin_actions'ta (append-only). İlk remote apply'dan sonra bu dosya DONDURULUR.
-- ============================================================================
CREATE TABLE IF NOT EXISTS publications (
  id          TEXT PRIMARY KEY,
  content_id  TEXT NOT NULL REFERENCES contents(id),
  kind        TEXT NOT NULL CHECK (kind IN ('pr','edge')),
  state       TEXT NOT NULL CHECK (state IN ('dry_run','pr_open','live','failed','closed')),
  branch      TEXT,
  pr_number   INTEGER,
  pr_url      TEXT CHECK (pr_url IS NULL OR pr_url LIKE 'https://github.com/%'),
  files_json  TEXT NOT NULL DEFAULT '[]' CHECK (json_valid(files_json)),
  error       TEXT,
  created_by  TEXT NOT NULL CHECK (length(trim(created_by)) > 0),
  created_at  TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at  TEXT NOT NULL DEFAULT (datetime('now'))
);
-- Bir içerik için aynı anda tek açık PR (çift tıklama / iki admin → ikinci PR açılmaz)
CREATE UNIQUE INDEX IF NOT EXISTS uq_publications_open ON publications(content_id) WHERE state = 'pr_open';
CREATE INDEX IF NOT EXISTS idx_publications_content ON publications(content_id, created_at);
CREATE INDEX IF NOT EXISTS idx_publications_state ON publications(state, updated_at);
