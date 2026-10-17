-- ============================================================================
-- Migration 0002 — admin_actions bütünlüğü (FAZ_3 Step 3.1)
-- STATUS: 🔒 İNSAN REVIEW BEKLİYOR (D1/auth = Sonnet 5.5 + insan, ORCHESTRATOR.md §9)
-- Uygulama: wrangler d1 migrations apply bdimexport-db --local  (önce --local!)
-- Amaç: audit log append-only — UPDATE/DELETE trigger'la engellenir (kurcalama koruması)
-- ============================================================================

CREATE INDEX IF NOT EXISTS idx_audit_actor ON admin_actions(actor, created_at);

CREATE TRIGGER IF NOT EXISTS trg_admin_actions_no_update
BEFORE UPDATE ON admin_actions
BEGIN
  SELECT RAISE(ABORT, 'admin_actions is append-only');
END;

CREATE TRIGGER IF NOT EXISTS trg_admin_actions_no_delete
BEFORE DELETE ON admin_actions
BEGIN
  SELECT RAISE(ABORT, 'admin_actions is append-only');
END;
