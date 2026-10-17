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
 * Key doğrulama: format → hash → (KV cache) → D1. Anahtarın kendisi hiçbir yerde saklanmaz/loglanmaz.
 * Hash: SHA-256 — anahtar 256 bit rastgele olduğundan yavaş hash/pepper gerekmez (DB sızsa bile brute-force imkânsız).
 * Karşılaştırma: ham key hiç karşılaştırılmaz; hash'in D1 index araması yapılır (zamanlama bilgisi bir
 * önimaj vermez) → timing-safe compare'e gerek yok.
 * Cache (yalnız POZİTİF sonuç, KEY_CACHE_TTL_S, min 60 sn):
 *   - admin-internal ASLA cache'lenmez → revoke her colo'da ANINDA (her istek D1).
 *   - read-only/partner cache'lenir → revoke aynı colo'da anında (girdi silinir); KV global yayılımı
 *     nedeniyle diğer colo'larda en fazla TTL (60 sn) gecikebilir. (Onaylı politika: "KV cache'li doğrulama".)
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
  if (k?.tier === "admin-internal") k = null; // eski/enjekte cache girdisine güvenme — admin her zaman D1'den
  if (!k) {
    const row = await env.DB.prepare("SELECT id, tier, rate_limit FROM api_keys WHERE key_hash = ? AND revoked = 0")
      .bind(hash).first<{ id: string; tier: Tier; rate_limit: number }>();
    if (!row) throw await bad();
    k = { id: row.id, tier: row.tier, rate_limit: row.rate_limit };
    if (k.tier !== "admin-internal") {
      await env.CACHE.put(ck, JSON.stringify(k), { expirationTtl: Math.max(60, intVar(env.KEY_CACHE_TTL_S, 60)) });
    }
  }
  await rateLimit(env.CACHE, "key", k.id, k.rate_limit); // key bazlı (req/dk)
  return k;
}

export function requireTier(k: AuthedKey, ...tiers: Tier[]): void {
  if (!tiers.includes(k.tier)) throw new HttpError(403, "forbidden", "Bu anahtar için yetki yok");
}
