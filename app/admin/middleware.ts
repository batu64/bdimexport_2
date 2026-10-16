// FAZ_3 3.1 — Admin kimlik katmanı: Cloudflare Access JWT doğrulama + ikinci katman (e-posta/rol allowlist)
//
// ÖNEMLİ (static-export): next.config.ts `output: "export"` → Next.js middleware'i ÇALIŞMAZ.
// Bu modül framework'den bağımsızdır (yalnızca Web Crypto + fetch + Request/Response); Workers'ta
// çalışır. /admin'in Workers (prod) ve Pages preview ayrımı + wrangler bağlaması → FAZ_3 Step 3.9.
// Fail-closed: yapılandırma eksik / JWKS alınamıyor / herhangi bir hata => 403. Asla "izin ver" varsayılanı yok.
// Dosya kendi içinde bağımsızdır (relative import yok) — node --experimental-strip-types ile test edilir.

export interface AdminEnv {
  /** Zero Trust team domain, örn. "bdimexport.cloudflareaccess.com" (şemasız) */
  ACCESS_TEAM_DOMAIN: string;
  /** Access Application Audience (AUD) tag */
  ACCESS_AUD: string;
  /** Virgülle ayrık: tam yetkili adminler */
  ADMIN_EMAILS: string;
  /** Virgülle ayrık: yalnızca Dashboard (salt-okunur) — 3.2 rol kuralı */
  VIEWER_EMAILS?: string;
}

export type AdminRole = "admin" | "viewer";

export interface AdminIdentity {
  email: string;
  role: AdminRole;
  sub: string;
  exp: number;
}

export type GuardResult =
  | { ok: true; identity: AdminIdentity }
  | { ok: false; response: Response };

interface Jwk extends JsonWebKey {
  kid?: string;
}
type JwksFetcher = (url: string) => Promise<{ keys: Jwk[] }>;

export const ACCESS_JWT_HEADER = "cf-access-jwt-assertion";
const CLOCK_SKEW_S = 30;
const JWKS_TTL_MS = 10 * 60 * 1000;
/** Bilinmeyen kid ile zorla yenileme en fazla bu aralıkla (rastgele kid'li isteklerle JWKS'e yük bindirmeyi engeller) */
const JWKS_FORCE_MIN_MS = 60 * 1000;
/** Access JWT'leri ~1–2 KB; üstü işlenmeden reddedilir (aşırı büyük başlıkla decode/CPU yükü) */
const MAX_TOKEN_LEN = 8192;

let jwksCache: { url: string; at: number; keys: Jwk[] } | null = null;

/** Test yardımcısı */
export function _resetJwksCache(): void {
  jwksCache = null;
}

function b64urlToBytes(s: string): Uint8Array {
  const pad = "=".repeat((4 - (s.length % 4)) % 4);
  const bin = atob(s.replace(/-/g, "+").replace(/_/g, "/") + pad);
  const out = new Uint8Array(bin.length);
  for (let i = 0; i < bin.length; i++) out[i] = bin.charCodeAt(i);
  return out;
}

function parseJson<T>(bytes: Uint8Array): T {
  return JSON.parse(new TextDecoder().decode(bytes)) as T;
}

const defaultFetcher: JwksFetcher = async (url) => {
  const r = await fetch(url);
  if (!r.ok) throw new Error(`jwks_http_${r.status}`);
  return (await r.json()) as { keys: Jwk[] };
};

async function getKeys(teamDomain: string, fetcher: JwksFetcher, force = false): Promise<Jwk[]> {
  const url = `https://${teamDomain}/cdn-cgi/access/certs`;
  const now = Date.now();
  const fresh = jwksCache && jwksCache.url === url;
  if (fresh && !force && now - jwksCache!.at < JWKS_TTL_MS) return jwksCache!.keys;
  if (fresh && force && now - jwksCache!.at < JWKS_FORCE_MIN_MS) return jwksCache!.keys;
  const { keys } = await fetcher(url);
  jwksCache = { url, at: now, keys };
  return keys;
}

export class AccessJwtError extends Error {
  code: string;
  constructor(code: string) {
    super(code);
    this.code = code;
  }
}

interface AccessClaims {
  aud?: string | string[];
  iss?: string;
  exp?: number;
  nbf?: number;
  iat?: number;
  email?: string;
  sub?: string;
  type?: string;
}

/**
 * Access JWT'sini doğrular: yapı, alg=RS256 (none/HS256 red), imza (JWKS), iss, aud, exp, nbf.
 * Hata durumunda AccessJwtError(code) fırlatır.
 */
export async function verifyAccessJwt(
  token: string,
  env: Pick<AdminEnv, "ACCESS_TEAM_DOMAIN" | "ACCESS_AUD">,
  opts: { now?: number; fetcher?: JwksFetcher } = {},
): Promise<AccessClaims & { email: string; sub: string; exp: number }> {
  if (!env.ACCESS_TEAM_DOMAIN || !env.ACCESS_AUD) throw new AccessJwtError("misconfigured");
  const fetcher = opts.fetcher ?? defaultFetcher;
  const nowS = Math.floor((opts.now ?? Date.now()) / 1000);

  if (token.length > MAX_TOKEN_LEN) throw new AccessJwtError("malformed");
  const parts = token.split(".");
  if (parts.length !== 3 || parts.some((p) => p.length === 0)) throw new AccessJwtError("malformed");

  let header: { alg?: string; kid?: string };
  let claims: AccessClaims;
  let sig: Uint8Array;
  try {
    header = parseJson(b64urlToBytes(parts[0]));
    claims = parseJson(b64urlToBytes(parts[1]));
    sig = b64urlToBytes(parts[2]);
  } catch {
    throw new AccessJwtError("malformed");
  }
  // Algoritma sabitlenir — header'a güvenilmez (alg confusion / alg:none)
  if (header.alg !== "RS256" || !header.kid) throw new AccessJwtError("bad_alg");

  let keys = await getKeys(env.ACCESS_TEAM_DOMAIN, fetcher);
  let jwk = keys.find((k) => k.kid === header.kid);
  if (!jwk) {
    // key rotation: bir kez zorla yenile
    keys = await getKeys(env.ACCESS_TEAM_DOMAIN, fetcher, true);
    jwk = keys.find((k) => k.kid === header.kid);
  }
  if (!jwk) throw new AccessJwtError("unknown_kid");
  // Anahtarın kendisi de RS256 imza anahtarı olmalı (JWKS'e enjekte edilmiş farklı tür anahtar kabul edilmez)
  if (jwk.kty !== "RSA" || (jwk.alg !== undefined && jwk.alg !== "RS256") || (jwk.use !== undefined && jwk.use !== "sig")) {
    throw new AccessJwtError("bad_key");
  }

  const key = await crypto.subtle.importKey(
    "jwk",
    jwk,
    { name: "RSASSA-PKCS1-v1_5", hash: "SHA-256" },
    false,
    ["verify"],
  );
  const signed = new TextEncoder().encode(`${parts[0]}.${parts[1]}`);
  const valid = await crypto.subtle.verify("RSASSA-PKCS1-v1_5", key, sig as BufferSource, signed);
  if (!valid) throw new AccessJwtError("bad_signature");

  if (claims.iss !== `https://${env.ACCESS_TEAM_DOMAIN}`) throw new AccessJwtError("bad_iss");
  const auds = Array.isArray(claims.aud) ? claims.aud : claims.aud ? [claims.aud] : [];
  if (!auds.includes(env.ACCESS_AUD)) throw new AccessJwtError("bad_aud");
  if (typeof claims.exp !== "number") throw new AccessJwtError("no_exp");
  if (nowS > claims.exp + CLOCK_SKEW_S) throw new AccessJwtError("expired");
  if (typeof claims.nbf === "number" && nowS + CLOCK_SKEW_S < claims.nbf) throw new AccessJwtError("not_yet_valid");
  if (typeof claims.email !== "string" || !claims.email) throw new AccessJwtError("no_email");
  if (typeof claims.sub !== "string" || !claims.sub) throw new AccessJwtError("no_sub");

  return claims as AccessClaims & { email: string; sub: string; exp: number };
}

function parseList(s: string | undefined): string[] {
  return (s ?? "")
    .split(",")
    .map((x) => x.trim().toLowerCase())
    .filter(Boolean);
}

/** İkinci katman: JWT geçerli olsa bile e-posta allowlist'te olmalı. */
export function resolveRole(email: string, env: Pick<AdminEnv, "ADMIN_EMAILS" | "VIEWER_EMAILS">): AdminRole | null {
  const e = email.toLowerCase();
  if (parseList(env.ADMIN_EMAILS).includes(e)) return "admin";
  if (parseList(env.VIEWER_EMAILS).includes(e)) return "viewer";
  return null;
}

function deny(status: 401 | 403, code: string): Response {
  return new Response(JSON.stringify({ error: status === 401 ? "unauthorized" : "forbidden", code }), {
    status,
    headers: {
      "content-type": "application/json; charset=utf-8",
      "cache-control": "no-store",
      "x-robots-tag": "noindex, nofollow",
    },
  });
}

/**
 * /admin ve /admin/api isteği için tek giriş kapısı.
 *  - Access başlığı yok          → 401 (Access'siz erişim)
 *  - JWT geçersiz/imzasız/expire → 403
 *  - e-posta allowlist dışı      → 403
 *  - viewer rolü mutasyon (GET/HEAD/OPTIONS dışı) → 403
 */
export async function guardAdminRequest(
  request: Request,
  env: AdminEnv,
  opts: { now?: number; fetcher?: JwksFetcher } = {},
): Promise<GuardResult> {
  const token = request.headers.get(ACCESS_JWT_HEADER);
  if (!token) return { ok: false, response: deny(401, "no_access_token") };

  let claims;
  try {
    claims = await verifyAccessJwt(token, env, opts);
  } catch (err) {
    const code = err instanceof AccessJwtError ? err.code : "verify_error";
    return { ok: false, response: deny(403, code) };
  }

  const role = resolveRole(claims.email, env);
  if (!role) return { ok: false, response: deny(403, "not_allowlisted") };

  const safeMethod = ["GET", "HEAD", "OPTIONS"].includes(request.method.toUpperCase());
  if (role === "viewer" && !safeMethod) return { ok: false, response: deny(403, "viewer_read_only") };

  return {
    ok: true,
    identity: { email: claims.email.toLowerCase(), role, sub: claims.sub, exp: claims.exp },
  };
}
