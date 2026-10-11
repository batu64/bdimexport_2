import { HttpError, type Env } from "./types";
import { clientIp, intVar, json } from "./util";
import { corsHeaders, originAllowed } from "./cors";
import { rateLimit } from "./ratelimit";
import { authenticate, extractKey, requireTier } from "./auth";
import { handleApply } from "./apply";
import { createKey, listKeys, revokeKey } from "./keys";
import { listContents, listLeads, listPartners } from "./read";

async function route(req: Request, env: Env, url: URL, ip: string): Promise<Response> {
  const path = url.pathname.replace(/\/+$/, "");
  const m = req.method;

  if (path === "/api/v1/partners/apply") return handleApply(req, env);

  if (path === "/api/v1/contents" && m === "GET") {
    // Anahtarsız public okuma (IP limitli); anahtar verilirse doğrulanır
    if (extractKey(req)) return listContents(env, url, await authenticate(env, req, ip));
    await rateLimit(env.CACHE, "pub", ip, intVar(env.RL_PUBLIC_READ_PER_MIN, 60));
    return listContents(env, url, null);
  }
  if (path === "/api/v1/partners" && m === "GET") return listPartners(env, url, await authenticate(env, req, ip));
  if (path === "/api/v1/leads" && m === "GET") {
    const k = await authenticate(env, req, ip);
    requireTier(k, "admin-internal");
    return listLeads(env, url);
  }
  if (path === "/api/v1/keys") {
    const k = await authenticate(env, req, ip);
    requireTier(k, "admin-internal");
    if (m === "POST") return createKey(req, env, k);
    if (m === "GET") return listKeys(env);
    throw new HttpError(405, "method_not_allowed", "İzin verilmeyen metot");
  }
  const km = path.match(/^\/api\/v1\/keys\/([0-9A-Z]{26})$/);
  if (km && m === "DELETE") {
    const k = await authenticate(env, req, ip);
    requireTier(k, "admin-internal");
    return revokeKey(env, k, km[1]);
  }
  if (path === "/api/v1/health" && m === "GET") return json({ ok: true });
  throw new HttpError(404, "not_found", "Bulunamadı");
}

export default {
  async fetch(req: Request, env: Env): Promise<Response> {
    const origin = req.headers.get("origin");
    const url = new URL(req.url);
    const ip = clientIp(req);
    let res: Response;
    try {
      // Origin'li (tarayıcı) istek beyaz listede değilse işlenmeden red
      if (!originAllowed(env, origin)) throw new HttpError(403, "origin_not_allowed", "Origin izinli değil");
      if (req.method === "OPTIONS") return new Response(null, { status: 204, headers: corsHeaders(env, origin) });
      await rateLimit(env.CACHE, "ip", ip, intVar(env.RL_IP_PER_MIN, 120));
      res = await route(req, env, url, ip);
    } catch (e) {
      if (e instanceof HttpError) {
        res = json({ error: { code: e.code, message: e.message, details: e.details } }, e.status, e.headers);
      } else {
        console.error("unhandled", e instanceof Error ? e.message : "error"); // PII/secret loglama yok
        res = json({ error: { code: "internal_error", message: "Sunucu hatası" } }, 500);
      }
    }
    const h = new Headers(res.headers);
    for (const [k, v] of Object.entries(corsHeaders(env, origin))) h.set(k, v);
    h.set("x-content-type-options", "nosniff");
    return new Response(res.body, { status: res.status, headers: h });
  },
};
