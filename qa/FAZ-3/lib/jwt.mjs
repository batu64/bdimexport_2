// QA yardımcısı: gerçek RS256 imzalı Cloudflare Access JWT üretir (ağ yok; JWKS fetcher enjekte).
import { _resetJwksCache } from "../../../app/admin/middleware.ts";

export const TEAM = "qa.cloudflareaccess.com";
export const AUD = "qa-aud-tag";
export const NOW = 1_800_000_000_000;
const b64u = (b) => Buffer.from(b).toString("base64url");

export async function makeIssuer() {
  _resetJwksCache();
  const kp = await crypto.subtle.generateKey(
    { name: "RSASSA-PKCS1-v1_5", modulusLength: 2048, publicExponent: new Uint8Array([1, 0, 1]), hash: "SHA-256" }, true, ["sign", "verify"]);
  const jwk = { ...(await crypto.subtle.exportKey("jwk", kp.publicKey)), kid: "qa1" };
  const sign = async (claims) => {
    const h = b64u(JSON.stringify({ alg: "RS256", kid: "qa1" })), p = b64u(JSON.stringify(claims));
    const s = await crypto.subtle.sign("RSASSA-PKCS1-v1_5", kp.privateKey, new TextEncoder().encode(`${h}.${p}`));
    return `${h}.${p}.${b64u(new Uint8Array(s))}`;
  };
  const claims = (o = {}) => ({ iss: `https://${TEAM}`, aud: [AUD], exp: NOW / 1000 + 600, iat: NOW / 1000, sub: "qa-sub", email: "admin@qa.test", ...o });
  const opts = { now: NOW, fetcher: async () => ({ keys: [jwk] }) };
  // kimlik → { token | null }
  const identities = async () => ({
    anon: { token: null, expect: 401 },
    "çöp token": { token: "not.a.jwt", expect: 403 },
    "expire JWT": { token: await sign(claims({ exp: NOW / 1000 - 3600 })), expect: 403 },
    "yanlış aud": { token: await sign(claims({ aud: ["baska-uygulama"] })), expect: 403 },
    "allowlist dışı": { token: await sign(claims({ email: "stranger@qa.test" })), expect: 403 },
    viewer: { token: await sign(claims({ email: "viewer@qa.test" })), expect: "viewer" },
    admin: { token: await sign(claims({ email: "admin@qa.test" })), expect: "admin" },
  });
  return { identities, opts };
}

export const baseEnv = (extra = {}) => ({
  ACCESS_TEAM_DOMAIN: TEAM, ACCESS_AUD: AUD, ADMIN_EMAILS: "admin@qa.test", VIEWER_EMAILS: "viewer@qa.test", ...extra,
});
