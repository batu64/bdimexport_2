import { z } from "zod";
import { HttpError, type AuthedKey, type Env } from "./types";
import { json, sha256Hex, ulid } from "./util";
import { generateKey } from "./auth";

const createSchema = z.object({
  name: z.string().trim().min(1).max(100),
  tier: z.enum(["read-only", "partner", "admin-internal"]).default("read-only"),
  rate_limit: z.number().int().min(1).max(10_000).default(60),
});

async function audit(env: Env, actor: string, action: string, id: string, o: unknown, n: unknown) {
  await env.DB.prepare(
    "INSERT INTO admin_actions (id, actor, action, entity_type, entity_id, old_value, new_value) VALUES (?,?,?,?,?,?,?)",
  ).bind(ulid(), `api_key:${actor}`, action, "api_key", id, o ? JSON.stringify(o) : null, n ? JSON.stringify(n) : null).run();
}

/** POST /v1/keys — yalnız admin-internal. Ham key YALNIZ bu yanıtta döner (tek seferlik). */
export async function createKey(req: Request, env: Env, actor: AuthedKey): Promise<Response> {
  const body = await req.json().catch(() => null);
  const p = createSchema.safeParse(body);
  if (!p.success) {
    throw new HttpError(400, "validation_failed", "Geçersiz istek", p.error.issues.map((i) => ({ field: i.path.join("."), message: i.message })));
  }
  const key = generateKey();
  const id = ulid();
  await env.DB.prepare("INSERT INTO api_keys (id, name, key_hash, tier, rate_limit) VALUES (?,?,?,?,?)")
    .bind(id, p.data.name, await sha256Hex(key), p.data.tier, p.data.rate_limit).run();
  await audit(env, actor.id, "create_key", id, null, { name: p.data.name, tier: p.data.tier, rate_limit: p.data.rate_limit });
  return json({ id, name: p.data.name, tier: p.data.tier, rate_limit: p.data.rate_limit, key, notice: "Bu anahtar yeniden gösterilmeyecek." }, 201);
}

export async function listKeys(env: Env): Promise<Response> {
  const r = await env.DB.prepare("SELECT id, name, tier, rate_limit, revoked, created_at, revoked_at FROM api_keys ORDER BY created_at DESC").all();
  return json({ data: r.results });
}

/** DELETE /v1/keys/:id — revoke. D1 anında; KV cache girişi silinir. */
export async function revokeKey(env: Env, actor: AuthedKey, id: string): Promise<Response> {
  const row = await env.DB.prepare("SELECT key_hash, revoked FROM api_keys WHERE id = ?").bind(id).first<{ key_hash: string; revoked: number }>();
  if (!row) throw new HttpError(404, "not_found", "Anahtar bulunamadı");
  if (!row.revoked) {
    await env.DB.prepare("UPDATE api_keys SET revoked = 1, revoked_at = datetime('now') WHERE id = ?").bind(id).run();
    await env.CACHE.delete(`ak:${row.key_hash}`);
    await audit(env, actor.id, "revoke_key", id, { revoked: 0 }, { revoked: 1 });
  }
  return json({ id, revoked: true });
}
