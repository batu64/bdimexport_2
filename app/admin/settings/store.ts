// FAZ_3 3.8 — Ayarlar okuma/yazma. Her yazma withAudit ile atomik (ayar + audit aynı D1 batch).
import { withAudit, type D1Like, type D1PreparedLike } from "../audit";
import { DEFAULTS, SETTING_KEYS, VALIDATORS, type Settings, type SettingKey } from "./schema";

export interface D1ReadLike extends D1Like {
  prepare(sql: string): D1PreparedLike & { all<T = unknown>(): Promise<{ results: T[] }> };
}

export async function loadSettings(db: D1ReadLike): Promise<Settings> {
  const { results } = await db.prepare("SELECT key, value_json FROM settings").all<{ key: string; value_json: string }>();
  const out: Settings = structuredClone(DEFAULTS);
  const target = out as unknown as Record<string, unknown>;
  for (const row of results) {
    if (!(SETTING_KEYS as readonly string[]).includes(row.key)) continue;
    try {
      target[row.key] = VALIDATORS[row.key as SettingKey](JSON.parse(row.value_json));
    } catch {
      /* bozuk satır → varsayılan (fail-safe) */
    }
  }
  return out;
}

/** Tek ayar anahtarını doğrulayıp yazar; audit'e eski/yeni değer düşer (redact audit.ts'te). */
export async function updateSetting(db: D1ReadLike, actor: string, key: SettingKey, raw: unknown): Promise<unknown> {
  if (!(SETTING_KEYS as readonly string[]).includes(key)) throw new Error(`unknown_setting:${key}`);
  const value = VALIDATORS[key](raw);
  const old = (await loadSettings(db))[key];
  const upsert = db
    .prepare(
      "INSERT INTO settings (key, value_json, updated_by, updated_at) VALUES (?, ?, ?, datetime('now')) " +
        "ON CONFLICT(key) DO UPDATE SET value_json = excluded.value_json, updated_by = excluded.updated_by, updated_at = excluded.updated_at",
    )
    .bind(key, JSON.stringify(value), actor);
  await withAudit(db, [upsert], { actor, action: "update_setting", entity_type: "settings", entity_id: key, old_value: old, new_value: value });
  return value;
}
