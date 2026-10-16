// FAZ_3 3.1 — Audit log helper (admin_actions: db/migrations/0001_init.sql + 0002_admin_audit_integrity.sql)
// Kural: HER mutasyon `withAudit` ile sarılır — mutasyon + audit satırı tek D1 batch'te (atomik):
// biri düşerse ikisi de düşer; "mutasyon var, audit yok" durumu oluşamaz.
// Tersi de engellenir (3.1 review, 2026-10-16): koşullu mutasyon (örn. `WHERE status=?` yarışı) 0 satır
// etkilerse audit satırı YAZILMAZ ("audit var, mutasyon yok" = sahte kayıt). Koşul SON mutasyona bağlıdır
// (SQLite changes()); koşullu statement'ı listenin sonuna koy. Dönüş değeri: değişiklik uygulandı mı.

/** Minimal D1 yüzeyi (@cloudflare/workers-types bağımlılığı eklememek için) */
export interface D1PreparedLike {
  bind(...values: unknown[]): D1PreparedLike;
  first<T = unknown>(): Promise<T | null>;
  all<T = unknown>(): Promise<{ results: T[] }>;
}
/** D1 batch sonucu: her statement için `meta.changes` (D1 sağlar; sahte DB'lerde olmayabilir). */
type BatchResult = { meta?: { changes?: number } } | undefined;
export interface D1Like {
  prepare(sql: string): D1PreparedLike;
  batch(statements: D1PreparedLike[]): Promise<unknown[]>;
}

export interface AuditEntry {
  /** Access e-postası (AdminIdentity.email) veya "system" */
  actor: string;
  /** örn. approve_partner | update_content | revoke_key | lead_status_change */
  action: string;
  entity_type: string;
  entity_id: string;
  old_value?: unknown;
  new_value?: unknown;
}

const ULID_ALPHABET = "0123456789ABCDEFGHJKMNPQRSTVWXYZ";

/** Zaman sıralı 26 karakterlik ULID (Web Crypto) */
export function ulid(now: number = Date.now()): string {
  let t = now;
  let timePart = "";
  for (let i = 0; i < 10; i++) {
    timePart = ULID_ALPHABET[t % 32] + timePart;
    t = Math.floor(t / 32);
  }
  const rnd = crypto.getRandomValues(new Uint8Array(16));
  let randPart = "";
  for (let i = 0; i < 16; i++) randPart += ULID_ALPHABET[rnd[i] % 32];
  return timePart + randPart;
}

const SENSITIVE_KEYS = /pass(word)?|secret|token|api[_-]?key|authorization/i;

/** Audit'e sızıntıyı önler: gizli alanları maskeler (KVKK/secret hijyeni). */
export function redact(value: unknown): unknown {
  if (Array.isArray(value)) return value.map(redact);
  if (value && typeof value === "object") {
    return Object.fromEntries(
      Object.entries(value as Record<string, unknown>).map(([k, v]) => [k, SENSITIVE_KEYS.test(k) ? "[REDACTED]" : redact(v)]),
    );
  }
  return value;
}

const AUDIT_COLS = "INSERT INTO admin_actions (id, actor, action, entity_type, entity_id, old_value, new_value)";

/**
 * @param onlyIfChanged true → `INSERT … SELECT … WHERE changes() > 0`: aynı batch'te hemen önceki
 *   mutasyon hiç satır değiştirmediyse audit yazılmaz.
 */
export function auditStatement(db: D1Like, e: AuditEntry, onlyIfChanged = false): D1PreparedLike {
  if (!e.actor || !e.action || !e.entity_type || !e.entity_id) {
    throw new Error("audit: actor/action/entity_type/entity_id zorunlu");
  }
  const ser = (v: unknown) => (v === undefined ? null : JSON.stringify(redact(v)));
  const sql = onlyIfChanged
    ? `${AUDIT_COLS} SELECT ?, ?, ?, ?, ?, ?, ? WHERE changes() > 0`
    : `${AUDIT_COLS} VALUES (?, ?, ?, ?, ?, ?, ?)`;
  return db.prepare(sql).bind(ulid(), e.actor, e.action, e.entity_type, e.entity_id, ser(e.old_value), ser(e.new_value));
}

/** Yalnızca audit yazar (mutasyonun D1 dışında olduğu durumlar: R2 upload vb.). */
export async function writeAudit(db: D1Like, e: AuditEntry): Promise<void> {
  await db.batch([auditStatement(db, e)]);
}

/**
 * Mutasyon statement'larını audit satırıyla AYNI batch'te çalıştırır.
 * Audit girdisi oluşturulamazsa (eksik alan) hiçbir mutasyon çalışmaz.
 * Son mutasyon 0 satır etkilerse audit yazılmaz ve `false` döner — çağıran bunu "değişmedi"
 * (yarış / bayat durum) olarak raporlamalıdır. D1 `meta.changes` vermiyorsa `true` varsayılır.
 */
export async function withAudit(db: D1Like, mutations: D1PreparedLike[], entry: AuditEntry): Promise<boolean> {
  if (mutations.length === 0) throw new Error("audit: en az bir mutasyon gerekli");
  const audit = auditStatement(db, entry, true); // önce doğrula — hata varsa batch hiç başlamaz
  const results = (await db.batch([...mutations, audit])) as BatchResult[] | undefined;
  const changes = results?.[results.length - 1]?.meta?.changes;
  return typeof changes === "number" ? changes > 0 : true;
}
