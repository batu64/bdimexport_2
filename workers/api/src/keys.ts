import { z } from "zod";
import { HttpError, type AuthedKey, type Env } from "./types";
import { json, sha256Hex, ulid } from "./util";
import { generateKey } from "./auth";
import { withAudit, type D1Like } from "../../../app/admin/audit";

const createSchema = z.object({
  name: z.string().trim().min(1).max(100),
  tier: z.enum(["read-only", "partner", "admin-internal"]).default("read-only"),
  rate_limit: z.number().int().min(1).max(10_000).default(60),
});

// Mutasyon + audit AYNI D1 batch'inde (atomik; 0 satır değişirse audit yazılmaz) — app/admin/audit.ts
const db = (env: Env) => env.DB as unknown as D1Like;
const actorOf = (k: AuthedKey) => `api_key:${k.id}`;

/** POST /v1/keys — yalnız admin-internal. Ham key YALNIZ bu yanıtta döner (tek seferlik). */
export async function createKey(req: Request, env: Env, actor: AuthedKey): Promise<Response> {
  const body = await req.json().catch(() => null);
  const p = createSchema.safeParse(body);
  if (!p.success) {
    throw new HttpError(400, "validation_failed", "Geçersiz istek", p.error.issues.map((i) => ({ field: i.path.join("."), message: i.message })));
  }
  const key = generateKey();
  const id = ulid();
  const ins = env.DB.prepare("INSERT INTO api_keys (id, name, key_hash, tier, rate_limit) VALUES (?,?,?,?,?)")
    .bind(id, p.data.name, await sha256Hex(key), p.data.tier, p.data.rate_limit);
  await withAudit(db(env), [ins as never], {
    actor: actorOf(actor), action: "create_key", entity_type: "api_key", entity_id: id,
    new_value: { name: p.data.name, tier: p.data.tier, rate_limit: p.data.rate_limit }, // ham key/hash audit'e GİRMEZ
  });
  return json({ id, name: p.data.name, tier: p.data.tier, rate_limit: p.data.rate_limit, key, notice: "Bu anahtar yeniden gösterilmeyecek." }, 201);
}

export async function listKeys(env: Env): Promise<Response> {
  const r = await env.DB.prepare("SELECT id, name, tier, rate_limit, revoked, created_at, revoked_at FROM api_keys ORDER BY created_at DESC").all();
  return json({ data: r.results });
}

/**
 * DELETE /v1/keys/:id — revoke. D1 anında (+ audit aynı batch'te); KV cache girişi silinir.
 * Süresiz key + revoke politikası: geri alma (un-revoke) YOK — yeni key üretilir.
 * İdempotent: zaten revoke ise ikinci audit yazılmaz (UPDATE … AND revoked = 0 → 0 satır).
 */
export async function revokeKey(env: Env, actor: AuthedKey, id: string): Promise<Response> {
  const row = await env.DB.prepare("SELECT key_hash, revoked FROM api_keys WHERE id = ?").bind(id).first<{ key_hash: string; revoked: number }>();
  if (!row) throw new HttpError(404, "not_found", "Anahtar bulunamadı");
  if (!row.revoked) {
    const upd = env.DB.prepare("UPDATE api_keys SET revoked = 1, revoked_at = datetime('now') WHERE id = ? AND revoked = 0").bind(id);
    await withAudit(db(env), [upd as never], {
      actor: actorOf(actor), action: "revoke_key", entity_type: "api_key", entity_id: id,
      old_value: { revoked: 0 }, new_value: { revoked: 1 },
    });
  }
  await env.CACHE.delete(`ak:${row.key_hash}`); // her durumda (önceki revoke'ta silme düşmüş olabilir)
  return json({ id, revoked: true });
}
