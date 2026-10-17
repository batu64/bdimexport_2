// FAZ_3 3.8 — Admin rate-limit GÖRÜNÜMÜ (SALT-OKUNUR): hangi IP/anahtar hangi uçta kaç istek attı (mevcut + önceki 60 sn pencere).
// Kaynak: workers/api/src/ratelimit.ts anahtarları `rl:<scope>:<id>:<pencere>` (KV, TTL 120 sn). Bu dosya YAZMAZ/SİLMEZ (list+get).
// KVKK: IP kişisel veridir → yanıtta MASKELENİR (IPv4 son oktet, IPv6 ilk 3 grup). Admin-only.
import { guardAdminRequest, type AdminEnv } from "../middleware.ts";

export interface KvReadLike {
  list(opts: { prefix: string; limit?: number }): Promise<{ keys: { name: string }[]; list_complete?: boolean }>;
  get(key: string): Promise<string | null>;
}
export interface RateLimitViewEnv extends AdminEnv {
  CACHE: KvReadLike;
}

export interface RateLimitRow {
  scope: string;
  id: string;
  count: number;
  window: "current" | "previous";
}

const MAX_KEYS = 500; // tek istekte okunacak anahtar üst sınırı (KV okuma maliyeti)

export function maskId(scope: string, id: string): string {
  if (scope === "key") return id.slice(0, 8) + "…"; // API key kimliği (hash değil): kısalt
  if (/^\d{1,3}(\.\d{1,3}){3}$/.test(id)) return id.replace(/\.\d{1,3}$/, ".x");
  if (id.includes(":")) return id.split(":").slice(0, 3).join(":") + ":…"; // IPv6
  return id.length > 12 ? id.slice(0, 8) + "…" : id;
}

/** `rl:<scope>:<id>:<win>` → parçalar (id IPv6 olabilir: ilk ve son iki parça dışı id'dir). */
export function parseKey(name: string): { scope: string; id: string; win: number } | null {
  if (!name.startsWith("rl:")) return null;
  const parts = name.slice(3).split(":");
  if (parts.length < 3) return null;
  const win = Number(parts[parts.length - 1]);
  if (!Number.isInteger(win)) return null;
  return { scope: parts[0], id: parts.slice(1, -1).join(":"), win };
}

const json = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), {
    status,
    headers: { "content-type": "application/json; charset=utf-8", "cache-control": "no-store", "x-robots-tag": "noindex, nofollow" },
  });

export async function handleRateLimitView(
  request: Request,
  env: RateLimitViewEnv,
  opts?: Parameters<typeof guardAdminRequest>[2],
): Promise<Response> {
  const g = await guardAdminRequest(request, env, opts);
  if (!g.ok) return g.response;
  if (g.identity.role !== "admin") return json({ error: "admin_only" }, 403);
  if (request.method !== "GET") return json({ error: "method_not_allowed" }, 405);

  try {
    const cur = Math.floor((opts?.now ?? Date.now()) / 60_000);
    const listed = await env.CACHE.list({ prefix: "rl:", limit: MAX_KEYS });
    const parsed = listed.keys.map((k) => ({ name: k.name, p: parseKey(k.name) })).filter((k) => k.p && (k.p.win === cur || k.p.win === cur - 1));
    const rows: RateLimitRow[] = [];
    for (const k of parsed) {
      const n = Number((await env.CACHE.get(k.name)) ?? "0");
      if (n > 0 && k.p) rows.push({ scope: k.p.scope, id: maskId(k.p.scope, k.p.id), count: n, window: k.p.win === cur ? "current" : "previous" });
    }
    rows.sort((a, b) => b.count - a.count);
    const byScope: Record<string, number> = {};
    for (const r of rows) byScope[r.scope] = (byScope[r.scope] ?? 0) + r.count;
    return json({ rows: rows.slice(0, 50), byScope, truncated: listed.list_complete === false, note: "IP'ler maskelidir; yalnız son ~2 dakikalık pencere (KV TTL 120 sn)." });
  } catch (err) {
    console.error("handleRateLimitView error:", err instanceof Error ? err.message : String(err));
    return json({ error: "internal_error" }, 500);
  }
}
