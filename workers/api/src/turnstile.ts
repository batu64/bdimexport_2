import { HttpError, type Env } from "./types";
import { sha256Hex } from "./util";

const VERIFY_URL = "https://challenges.cloudflare.com/turnstile/v0/siteverify";
const REPLAY_TTL_S = 600; // Turnstile token ömrü 300 sn; marjla

interface SiteVerify {
  success: boolean;
  hostname?: string;
  action?: string;
  "error-codes"?: string[];
}

/**
 * Turnstile server-side doğrulama + BAĞLAMA:
 *  1. token yok/boş            → 403
 *  2. replay (KV'de görüldü)   → 403   (token SHA-256 ile saklanır; ham token yazılmaz)
 *  3. siteverify success=false → 403
 *  4. action != beklenen       → 403   (başka formdan alınan token bu endpoint'te geçmez)
 *  5. hostname beyaz listede değil → 403 (başka sitede üretilen token geçmez)
 * Replay işareti siteverify ÖNCESİ yazılır (eşzamanlı çift kullanım penceresi daralır);
 * Cloudflare da token'ı tek kullanımlık sayar (ikinci savunma hattı).
 */
export async function verifyTurnstile(env: Env, token: string | null, ip: string): Promise<void> {
  if (!token || token.length > 2048) throw new HttpError(403, "turnstile_required", "Doğrulama belirteci gerekli");

  const tkey = `ts:${await sha256Hex(token)}`;
  if (await env.CACHE.get(tkey)) throw new HttpError(403, "turnstile_replay", "Doğrulama belirteci daha önce kullanıldı");
  await env.CACHE.put(tkey, "1", { expirationTtl: REPLAY_TTL_S });

  const body = new URLSearchParams({ secret: env.TURNSTILE_SECRET, response: token });
  if (ip !== "unknown") body.set("remoteip", ip);

  let res: SiteVerify;
  try {
    const r = await fetch(VERIFY_URL, { method: "POST", body });
    res = (await r.json()) as SiteVerify;
  } catch {
    // Doğrulayamıyorsak fail-closed
    throw new HttpError(403, "turnstile_unverifiable", "Doğrulama yapılamadı");
  }
  if (!res.success) throw new HttpError(403, "turnstile_failed", "Doğrulama başarısız");

  const expectedAction = env.TURNSTILE_ACTION_APPLY ?? "partner_apply";
  if (res.action !== expectedAction) throw new HttpError(403, "turnstile_action_mismatch", "Doğrulama bağlamı uyumsuz");

  const hosts = (env.TURNSTILE_HOSTNAMES ?? "").split(",").map((s) => s.trim()).filter(Boolean);
  if (!res.hostname || !hosts.includes(res.hostname)) {
    throw new HttpError(403, "turnstile_hostname_mismatch", "Doğrulama bağlamı uyumsuz");
  }
}
