import { HttpError, type AuthedKey, type Env, type Tier } from "./types";
import { intVar, sha256Hex } from "./util";
import { rateLimit } from "./ratelimit";

export const KEY_PREFIX = "bdx_";
const KEY_RE = /^bdx_[A-Za-z0-9_-]{43}$/; // 32 bayt base64url

export function generateKey(): string {
  const b = crypto.getRandomValues(new Uint8Array(32));
  const s = btoa(String.fromCharCode(...b)).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
  return KEY_PREFIX + s;
}

export function extractKey(req: Request): string | null {
  const a = req.headers.get("authorization");
  if (a && /^bearer /i.test(a)) return a.slice(7).trim();
  return req.headers.get("x-api-key");
}

/**
 * Key doğrulama: format → hash → KV cache → D1. Anahtarın kendisi hiçbir yerde saklanmaz/loglanmaz.
 * Cache: yalnız POZİTİF sonuç, KEY_CACHE_TTL_S (min 60 sn — KV sınırı). Revoke D1'i günceller ve
 * cache girişini siler; KV global yayılımı nedeniyle diğer colo'larda en fazla TTL kadar gecikme olabilir.
 */
export async function authenticate(env: Env, req: Request, ip: string): Promise<AuthedKey> {
  const key = extractKey(req);
  if (!key) throw new HttpError(401, "unauthorized", "API anahtarı gerekli", undefined, { "www-authenticate": "Bearer" });

  // Geçersiz deneme brute-force freni (IP başına)
  const bad = async () => {
    await rateLimit(env.CACHE, "badauth", ip, intVar(env.RL_BAD_AUTH_PER_MIN, 20));
    return new HttpError(401, "unauthorized", "Geçersiz API anahtarı", undefined, { "www-authenticate": "Bearer" });
  };
  if (!KEY_RE.test(key)) throw await bad();

  const hash = await sha256Hex(key);
  const ck = `ak:${hash}`;
  let k = (await env.CACHE.get(ck, "json")) as AuthedKey | null;
  if (!k) {
    const row = await env.DB.prepare("SELECT id, tier, rate_limit FROM api_keys WHERE key_hash = ? AND revoked = 0")
      .bind(hash).first<{ id: string; tier: Tier; rate_limit: number }>();
    if (!row) throw await bad();
    k = { id: row.id, tier: row.tier, rate_limit: row.rate_limit };
    await env.CACHE.put(ck, JSON.stringify(k), { expirationTtl: Math.max(60, intVar(env.KEY_CACHE_TTL_S, 60)) });
  }
  await rateLimit(env.CACHE, "key", k.id, k.rate_limit); // key bazlı (req/dk)
  return k;
}

export function requireTier(k: AuthedKey, ...tiers: Tier[]): void {
  if (!tiers.includes(k.tier)) throw new HttpError(403, "forbidden", "Bu anahtar için yetki yok");
}
