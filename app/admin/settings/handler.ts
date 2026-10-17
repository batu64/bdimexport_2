// FAZ_3 3.8 — /admin/api/settings (GET: tüm ayarlar · PUT: {key, value}). Workers'ta çalışır (static-export'ta Next route yok).
// Auth: guardAdminRequest (Access JWT + allowlist) + ADMIN-ONLY (GET dahil: viewer yalnız Dashboard görür — 3.2). Viewer PUT zaten guard'da 403.
// Secret reddi: store.updateSetting → schema.assertNoSecrets (alan adı + değer biçimi, tüm anahtarlar). Audit: store → withAudit (atomik).
import { guardAdminRequest, type AdminEnv } from "../middleware.ts";
import { ValidationError, SETTING_KEYS, type SettingKey } from "./schema.ts";
import { loadSettings, updateSetting, type D1ReadLike } from "./store.ts";

export interface SettingsEnv extends AdminEnv {
  DB: D1ReadLike;
  /** Workers secret — değeri ASLA döndürülmez/loglanmaz; yalnızca varlığı raporlanır */
  TURNSTILE_SECRET?: string;
}

const json = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), {
    status,
    headers: { "content-type": "application/json; charset=utf-8", "cache-control": "no-store", "x-robots-tag": "noindex, nofollow" },
  });

export async function handleSettings(
  request: Request,
  env: SettingsEnv,
  opts?: Parameters<typeof guardAdminRequest>[2],
): Promise<Response> {
  const g = await guardAdminRequest(request, env, opts);
  if (!g.ok) return g.response;
  const { identity } = g;
  if (identity.role !== "admin") return json({ error: "forbidden", code: "admin_only" }, 403);

  if (request.method === "GET") {
    return json({ settings: await loadSettings(env.DB), turnstileSecretConfigured: Boolean(env.TURNSTILE_SECRET) });
  }
  if (request.method === "PUT") {
    if (identity.role !== "admin") return json({ error: "forbidden", code: "viewer_read_only" }, 403);
    let body: { key?: unknown; value?: unknown };
    try {
      body = (await request.json()) as typeof body;
    } catch {
      return json({ error: "bad_request", code: "invalid_json" }, 400);
    }
    if (typeof body.key !== "string" || !(SETTING_KEYS as readonly string[]).includes(body.key)) {
      return json({ error: "bad_request", code: "unknown_key" }, 400);
    }
    try {
      const value = await updateSetting(env.DB, identity.email, body.key as SettingKey, body.value);
      return json({ ok: true, key: body.key, value });
    } catch (e) {
      if (e instanceof ValidationError) return json({ error: "validation", field: e.field, message: e.message }, 422);
      return json({ error: "internal" }, 500);
    }
  }
  return json({ error: "method_not_allowed" }, 405);
}
