// QA yardımcısı: node:sqlite üzerinde GERÇEK SQL ile D1 benzeri sahte (prepare/bind/first/all/run/batch + meta.changes).
// batch = tek transaction (D1 semantiği). Migration'lar repodaki gerçek dosyalardır (sıra ile).
import { DatabaseSync } from "node:sqlite";
import { readdirSync, readFileSync } from "node:fs";
import { resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const MIG = resolve(dirname(fileURLToPath(import.meta.url)), "../../../db/migrations");
// TÜM migration'lar, ad sırası (wrangler sırası) — sabit liste FAZ 4'te (0004_publications, 0005_ai_usage) eskidi (4.9 QA).
export const MIGRATIONS = readdirSync(MIG).filter((f) => f.endsWith(".sql")).sort();

class Stmt {
  constructor(db, sql) { this.db = db; this.sql = sql; this.args = []; }
  bind(...a) { const s = new Stmt(this.db, this.sql); s.args = a; return s; }
  async first() { return this.db.prepare(this.sql).get(...this.args) ?? null; }
  async all() { return { results: this.db.prepare(this.sql).all(...this.args) }; }
  async run() { return this.runSync(); }
  runSync() { const r = this.db.prepare(this.sql).run(...this.args); return { success: true, meta: { changes: Number(r.changes) } }; }
}

export function makeD1(migrations = MIGRATIONS) {
  const raw = new DatabaseSync(":memory:");
  for (const f of migrations) raw.exec(readFileSync(resolve(MIG, f), "utf8"));
  const d1 = {
    prepare: (sql) => new Stmt(raw, sql),
    batch: async (stmts) => {
      raw.exec("BEGIN");
      try { const out = stmts.map((s) => s.runSync()); raw.exec("COMMIT"); return out; }
      catch (e) { raw.exec("ROLLBACK"); throw e; }
    },
  };
  return { d1, raw };
}

export const auditRows = (raw) => raw.prepare("SELECT actor, action, entity_type, entity_id, old_value, new_value FROM admin_actions ORDER BY rowid").all();
