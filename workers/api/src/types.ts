// workers/api — ortak tipler. Secret'lar yalnızca env'den (wrangler secret put); kodda sabit YOK.
export interface Env {
  DB: D1Database;
  MEDIA: R2Bucket;
  CACHE: KVNamespace;

  // secret
  TURNSTILE_SECRET: string;

  // vars (wrangler.toml [vars] / [env.*.vars])
  ALLOWED_ORIGINS: string;          // virgülle: https://bdimexport.com,https://www.bdimexport.com
  TURNSTILE_HOSTNAMES: string;      // siteverify yanıtındaki hostname beyaz listesi
  TURNSTILE_ACTION_APPLY?: string;  // default partner_apply
  KVKK_VERSIONS: string;            // kabul edilen rıza metni sürümleri, '|' ile ayrılır
  RL_APPLY_PER_MIN?: string;        // IP başına başvuru limiti (default 5)
  RL_IP_PER_MIN?: string;           // IP başına genel limit (default 120)
  RL_PUBLIC_READ_PER_MIN?: string;  // anahtarsız public read (default 60)
  RL_BAD_AUTH_PER_MIN?: string;     // IP başına geçersiz anahtar denemesi (default 20)
  KEY_CACHE_TTL_S?: string;         // doğrulanmış key KV cache süresi (default 60; admin-internal cache'lenmez)

  // Cloudflare Access — /admin/api/* guard'ı (app/admin/middleware.ts). Boş/eksik → 403 (fail-closed).
  ACCESS_TEAM_DOMAIN?: string;      // var (public)
  ACCESS_AUD?: string;              // var (public)
  ADMIN_EMAILS?: string;            // secret (kişisel veri)
  VIEWER_EMAILS?: string;           // secret (kişisel veri)

  // FAZ_4 4.6 yayın botu — token yoksa PR açılmaz, DRY-RUN planı kaydedilir
  GITHUB_PUBLISH_TOKEN?: string;    // secret — fine-grained PAT: yalnız bu repo, Contents + Pull requests (read/write)
  GITHUB_REPO?: string;             // var — "batu64/bdimexport"
  GITHUB_BASE_BRANCH?: string;      // var — PR hedef dalı (Pages'in build ettiği dal)
}

export type Tier = "read-only" | "partner" | "admin-internal";

export interface AuthedKey {
  id: string;
  tier: Tier;
  rate_limit: number;
}

export class HttpError extends Error {
  constructor(
    public status: number,
    public code: string,
    message: string,
    public details?: unknown,
    public headers?: Record<string, string>,
  ) {
    super(message);
  }
}
