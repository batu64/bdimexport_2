-- ============================================================================
-- Migration 0005 — ai_usage_daily (FAZ_4 Step 4.7 · Opus 5.5 · 2026-10-27)
-- Runtime AI (yalnız Gemini — AGENTS.md §3) günlük kota izi: model başına çağrı / hata / "kota tükendi" bayrağı.
-- Kota yönlendirmesi (workers/cron-rss/src/quota.ts): ana model %80 → aynı sağlayıcının yedek modeli; ikisi de dolu →
-- kuyruk durur (iş pending kalır, deneme hakkı yanmaz) + alert. Gün = UTC tarih (Gemini kotaları UTC'de sıfırlanır).
-- Metin/istem/çıktı SAKLANMAZ (yalnız sayaç). 90 günden eski satırlar gece bakımında silinir.
-- ============================================================================
CREATE TABLE IF NOT EXISTS ai_usage_daily (
  day        TEXT NOT NULL CHECK (day GLOB '[0-9][0-9][0-9][0-9]-[0-9][0-9]-[0-9][0-9]'),
  model      TEXT NOT NULL CHECK (length(model) BETWEEN 1 AND 100),
  calls      INTEGER NOT NULL DEFAULT 0 CHECK (calls >= 0),
  failures   INTEGER NOT NULL DEFAULT 0 CHECK (failures >= 0),
  exhausted  INTEGER NOT NULL DEFAULT 0 CHECK (exhausted IN (0,1)),
  updated_at TEXT NOT NULL DEFAULT (datetime('now')),
  PRIMARY KEY (day, model)
);
