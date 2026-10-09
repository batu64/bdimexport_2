-- ============================================================================
-- Bdimexport D1 Schema v1 — migration 0001_init
-- FAZ_0 Step 0.8 | Kaynak: mimari.md §5 (satır satır eşleşme zorunlu — qa testi)
-- STATUS: 🔒 İNSAN REVIEW BEKLİYOR (ORCHESTRATOR.md §9: D1/auth = Sonnet 5.5 + insan)
-- Uygulama: wrangler d1 migrations apply bdimexport-db --local  (önce --local!)
-- ============================================================================

-- PARTNERS: Türk üretici havuzu (Proje.md §2.2 flywheel 1. adım)
-- consent_logo_en = logo yayın açık rızası (hukuki şart — agents/tr-export-agent.md §3)
CREATE TABLE IF NOT EXISTS partners (
  id            TEXT PRIMARY KEY,                    -- ulid
  name          TEXT NOT NULL,
  logo_r2_key   TEXT,                                -- media/tr/katalog/{id}/... (consent yoksa NULL)
  sector        TEXT,
  certs_json    TEXT DEFAULT '[]',                   -- ["CE","ISO9001",...]
  capacity      TEXT,
  catalog_r2_key TEXT,                               -- başvuru PDF'i
  consent_logo_en INTEGER NOT NULL DEFAULT 0,        -- 0/1 — admin değiştiremez, partner yeniden rıza verir
  approved      INTEGER NOT NULL DEFAULT 0,          -- admin onayı
  contact_json  TEXT,                                -- {name,email,phone,whatsapp} — KVKK maskeleme UI'da
  created_at    TEXT NOT NULL DEFAULT (datetime('now')),
  approved_at   TEXT
);
CREATE INDEX IF NOT EXISTS idx_partners_approved ON partners(approved, sector);

-- LEADS: tüm formlardan (Proje.md §5.1 modül 1)
-- channel_pref ülkeye göre UI widget'ını belirler (I18N_RULES §2)
CREATE TABLE IF NOT EXISTS leads (
  id           TEXT PRIMARY KEY,
  source_page  TEXT NOT NULL,                        -- attribution (FAZ_6 6.1) için kritik
  locale       TEXT NOT NULL,                        -- tr/en/de/zh/en-ru...
  form_type    TEXT NOT NULL DEFAULT 'lead',         -- lead|application|quotation
  channel_pref TEXT,                                 -- whatsapp|telegram|wechat|email
  payload_json TEXT NOT NULL,                        -- {name,company,email,...} — maskeleme UI'da
  status       TEXT NOT NULL DEFAULT 'new' CHECK (status IN ('new','contacted','qualified','closed')),
  partner_id   TEXT REFERENCES partners(id),         -- eşleştirme (Proje.md flywheel 5. adım)
  utm_json     TEXT,                                 -- campaign kaynak takibi
  created_at   TEXT NOT NULL DEFAULT (datetime('now'))
);
CREATE INDEX IF NOT EXISTS idx_leads_status ON leads(status, created_at);
CREATE INDEX IF NOT EXISTS idx_leads_source ON leads(source_page);
CREATE INDEX IF NOT EXISTS idx_leads_locale ON leads(locale, created_at);

-- CONTENTS: SEO sayfa/makale içerikleri (hibrit yayın: kalıcı=PR, geçici=D1 — mimari.md §6)
CREATE TABLE IF NOT EXISTS contents (
  id             TEXT PRIMARY KEY,
  slug           TEXT NOT NULL,
  locale         TEXT NOT NULL,
  page_type      TEXT NOT NULL,                      -- product|industry|service|article|news_card
  title          TEXT NOT NULL,
  body_md        TEXT NOT NULL,
  target_keyword TEXT,
  schema_json    TEXT,                               -- JSON-LD önerisi (seo-geo-agent)
  status         TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft','approved','published')),
  model          TEXT,                               -- üreten model (muhasebe — AGENTS.md §7 K2)
  source_job_id  TEXT,                               -- ai_jobs bağlantısı (Faz 4)
  created_at     TEXT NOT NULL DEFAULT (datetime('now')),
  published_at   TEXT,
  UNIQUE(slug, locale)
);
CREATE INDEX IF NOT EXISTS idx_contents_status ON contents(status, locale);
CREATE INDEX IF NOT EXISTS idx_contents_slug ON contents(slug, locale);       -- unique ile birlikte
CREATE INDEX IF NOT EXISTS idx_contents_type ON contents(page_type, locale);

-- RSS_NEWS: 3 gün TTL buffer (Proje.md §5.1 Input B)
CREATE TABLE IF NOT EXISTS rss_news (
  id         TEXT PRIMARY KEY,
  source     TEXT NOT NULL,                          -- admin tanımlı kaynak adı
  title      TEXT NOT NULL,
  url        TEXT NOT NULL UNIQUE,                   -- dedup (FAZ_4 4.1)
  summary    TEXT,                                   -- Flash-Lite özeti + etiket (injection temizli)
  tags_json  TEXT,                                   -- {sector, product_candidate, locale_suggestion[], urgency}
  fetched_at TEXT NOT NULL DEFAULT (datetime('now')),
  expires_at TEXT NOT NULL                           -- fetched_at + 72h — TTL cron siler
);
CREATE INDEX IF NOT EXISTS idx_rss_expires ON rss_news(expires_at);
CREATE INDEX IF NOT EXISTS idx_rss_fetched ON rss_news(fetched_at);

-- KEYWORDS: keyword motoru (Proje.md §5.1 Input C; FAZ_6 6.3 tam otomasyon)
CREATE TABLE IF NOT EXISTS keywords (
  id           TEXT PRIMARY KEY,
  phrase       TEXT NOT NULL,
  locale       TEXT,
  intent       TEXT,                                 -- informational|commercial|transactional
  volume       INTEGER,                              -- yalnızca gerçek GSC/API verisi; tahmin ise flagged
  volume_estimated INTEGER NOT NULL DEFAULT 0,
  target_page  TEXT,                                 -- GLM karar: yeni sayfa slug'ı veya güncellenecek sayfa
  status       TEXT NOT NULL DEFAULT 'queued' CHECK (status IN ('queued','analyzed','job_created','done')),
  created_at   TEXT NOT NULL DEFAULT (datetime('now'))
);
CREATE INDEX IF NOT EXISTS idx_keywords_status ON keywords(status, locale);

-- AI_JOBS: D1 tabanlı ücretsiz kuyruk (Cloudflare Queues ücretli — mimari.md kararı)
CREATE TABLE IF NOT EXISTS ai_jobs (
  id         TEXT PRIMARY KEY,
  type       TEXT NOT NULL,                          -- make_article|summarize_news|analyze_keyword
  payload_json TEXT NOT NULL,                        -- input_ref'ler + hedef locale + gerekçe
  status     TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending','running','done','failed','blocked')),
  agent      TEXT,
  model      TEXT,
  retries    INTEGER NOT NULL DEFAULT 0,             -- max 2 (ORCHESTRATION.md §6)
  last_error TEXT,
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  finished_at TEXT
);
CREATE INDEX IF NOT EXISTS idx_jobs_status ON ai_jobs(status, created_at);

-- ANALYTICS_DAILY: GSC/GA4/Meta cron çekimleri (Proje.md §5.1 modül 4)
CREATE TABLE IF NOT EXISTS analytics_daily (
  day       TEXT NOT NULL,                          -- YYYY-MM-DD
  locale    TEXT NOT NULL DEFAULT 'all',
  ga4_json  TEXT,                                   -- {sessions, users, ...}
  gsc_json  TEXT,                                   -- {impressions, clicks, topQueries[]}
  meta_json TEXT,                                   -- {campaigns[], spend} — reklam varsa (FAZ_6 6.5)
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  PRIMARY KEY (day, locale)
);

-- API_KEYS: dış erişim (FAZ_3 3.4 — tier sistemi orada genişletilir)
CREATE TABLE IF NOT EXISTS api_keys (
  id         TEXT PRIMARY KEY,
  name       TEXT NOT NULL,
  key_hash   TEXT NOT NULL UNIQUE,                  -- SHA-256; key yalnızca hash (ilk gösterim tek seferlik)
  tier       TEXT NOT NULL DEFAULT 'read-only' CHECK (tier IN ('read-only','partner','admin-internal')),
  rate_limit INTEGER NOT NULL DEFAULT 60,           -- req/dk
  revoked    INTEGER NOT NULL DEFAULT 0,
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  revoked_at TEXT
);

-- ADMIN_ACTIONS: audit log (admin-agent §4.2 — her mutasyon aksiyonu)
CREATE TABLE IF NOT EXISTS admin_actions (
  id          TEXT PRIMARY KEY,
  actor       TEXT NOT NULL,                        -- Access email / system
  action      TEXT NOT NULL,                        -- approve_partner|update_content|revoke_key...
  entity_type TEXT NOT NULL,
  entity_id   TEXT NOT NULL,
  old_value   TEXT,                                 -- JSON
  new_value   TEXT,                                 -- JSON
  created_at  TEXT NOT NULL DEFAULT (datetime('now'))
);
CREATE INDEX IF NOT EXISTS idx_audit_entity ON admin_actions(entity_type, entity_id);
CREATE INDEX IF NOT EXISTS idx_audit_time ON admin_actions(created_at);
