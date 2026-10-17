-- ============================================================================
-- Migration 0003 — settings tablosu (FAZ_3 Step 3.8) · v1.1 Opus 5.5 güvenlik review (FAZ_3 3.9, 2026-10-17)
-- Uygulama: wrangler d1 migrations apply <db> --local → --env staging → (👤) --env production. Yalnız ileri yönlü.
-- Remote D1 henüz yok → v1 yerinde sertleştirildi; ilk remote apply'dan sonra bu dosya DONDURULUR.
--
-- Secret YOK: Turnstile secret / webhook URL / API token = Workers secret (`wrangler secret put`); bu tabloya yazılmaz.
-- Birincil kontrol uygulamada (app/admin/settings/schema.ts assertNoSecrets: alan adı + değer biçimi, her derinlikte);
-- aşağıdaki CHECK'ler İKİNCİ hat (uygulama atlatılsa/hatalı olsa da DB secret çağrıştıran anahtarı ve bozuk JSON'u almaz).
-- Değişiklik geçmişi admin_actions'ta (append-only, 0002); bu tablo yalnız güncel değer.
-- Anahtarlar (2026-10-17): channelPrefs, turnstile, rateLimits, contacts, experts, webhooks, rssSources.
-- ============================================================================
CREATE TABLE IF NOT EXISTS settings (
  key        TEXT PRIMARY KEY
             CHECK (length(key) BETWEEN 1 AND 64 AND key GLOB '[A-Za-z]*' AND key NOT GLOB '*[^A-Za-z0-9_]*')
             CHECK (lower(key) NOT LIKE '%secret%' AND lower(key) NOT LIKE '%token%' AND lower(key) NOT LIKE '%passw%'
                    AND lower(key) NOT LIKE '%private%' AND lower(key) NOT LIKE '%credential%'
                    AND lower(key) NOT LIKE '%apikey%' AND lower(key) NOT LIKE '%api_key%'),
  value_json TEXT NOT NULL CHECK (json_valid(value_json) AND length(value_json) <= 65536),
  updated_by TEXT NOT NULL CHECK (length(trim(updated_by)) > 0),   -- Access e-postası / "system" (audit actor ile aynı)
  updated_at TEXT NOT NULL DEFAULT (datetime('now'))
);
