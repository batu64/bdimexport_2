-- 0002 — FAZ_3 3.4: partners başvuru alanları (expand-only; destructive değişiklik yok)
-- Kaynak: Proje.md §2.2 form alanları + KVKK rıza kaydı (sunucu tarafı kanıt)
-- Uygulama: wrangler d1 migrations apply bdimexport-db --local  (önce --local!)
ALTER TABLE partners ADD COLUMN tax_id TEXT;                    -- Vergi No (10-11 hane)
ALTER TABLE partners ADD COLUMN export_history TEXT;            -- serbest metin
ALTER TABLE partners ADD COLUMN kvkk_consent_version TEXT;      -- kabul edilen rıza metni sürümü
ALTER TABLE partners ADD COLUMN kvkk_consent_at TEXT;           -- rıza zamanı (sunucu saati, ISO)
-- Aynı vergi no ile mükerrer başvuru engeli (NULL'lar hariç)
CREATE UNIQUE INDEX IF NOT EXISTS uq_partners_tax_id ON partners(tax_id) WHERE tax_id IS NOT NULL;
