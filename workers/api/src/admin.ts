// FAZ_3 3.4 — /admin/api/* : admin paneli API'si. HER istek önce 3.1 guard'ından geçer (Access JWT + allowlist);
// rota eşleşmesi guard'dan SONRA yapılır → kimliksiz istek hangi yolun var olduğunu öğrenemez (401/403, 404 değil).
// Yol /admin/api altında: Cloudflare Access app'i `admin/*` yolunu kapsar → JWT başlığını yalnız orada ekler.
// Bağlama (Pages → Worker route / Functions proxy) FAZ_3 3.9. Yanıtlar no-store (util.json).
import { guardAdminRequest, type AdminEnv, type AdminIdentity } from "../../../app/admin/middleware";
import { DASHBOARD_QUERIES as Q } from "../../../app/admin/_lib/queries";
import { HttpError, type Env } from "./types";
import { json } from "./util";
import { AttributionQueryError, computeAttribution, parseAttributionQuery } from "./attribution";
import { KeywordQueryError, computeKeywordReport, parseKeywordQuery } from "./keywords";

export const ADMIN_PREFIX = "/admin/api";

function adminEnv(env: Env): AdminEnv {
  return {
    ACCESS_TEAM_DOMAIN: env.ACCESS_TEAM_DOMAIN ?? "",
    ACCESS_AUD: env.ACCESS_AUD ?? "",
    ADMIN_EMAILS: env.ADMIN_EMAILS ?? "",
    VIEWER_EMAILS: env.VIEWER_EMAILS ?? "",
  };
}

type Count = { n: number };
const num = (v: unknown): number | null => (typeof v === "number" && Number.isFinite(v) ? v : null);
function parseObj(s: unknown): Record<string, unknown> {
  if (typeof s !== "string") return {};
  try {
    const o = JSON.parse(s);
    return o && typeof o === "object" ? (o as Record<string, unknown>) : {};
  } catch {
    return {};
  }
}

/** GET /admin/api/dashboard/summary — yalnız sayılar (PII yok). Sözleşme: app/admin/_lib/api.ts DashboardSummary. */
export async function dashboardSummary(env: Env) {
  const all = <T>(sql: string) => env.DB.prepare(sql).all<T>().then((r) => r.results ?? []);
  const [leads, last7, contents, partners, latest] = await Promise.all([
    all<{ status: string } & Count>(Q.leadsByStatus),
    env.DB.prepare(Q.leadsLast7d).first<Count>(),
    all<{ status: string } & Count>(Q.contentsByStatus),
    all<{ approved: number } & Count>(Q.partnersByApproval),
    env.DB.prepare(Q.analyticsLatest).first<{ day: string; ga4_json: string | null; gsc_json: string | null }>(),
  ]);
  const by = <R extends Count>(rows: R[], key: (r: R) => unknown, v: unknown) => rows.find((r) => key(r) === v)?.n ?? 0;
  const ga4 = parseObj(latest?.ga4_json);
  const gsc = parseObj(latest?.gsc_json);
  return {
    leads: {
      new: by(leads, (r) => r.status, "new"),
      contacted: by(leads, (r) => r.status, "contacted"),
      qualified: by(leads, (r) => r.status, "qualified"),
      closed: by(leads, (r) => r.status, "closed"),
      last7d: last7?.n ?? 0,
    },
    contents: {
      draft: by(contents, (r) => r.status, "draft"),
      approved: by(contents, (r) => r.status, "approved"),
      published: by(contents, (r) => r.status, "published"),
    },
    partners: { pending: by(partners, (r) => r.approved, 0), approved: by(partners, (r) => r.approved, 1) },
    analytics: latest
      ? { day: latest.day, sessions: num(ga4.sessions), clicks: num(gsc.clicks), impressions: num(gsc.impressions) }
      : null,
  };
}

export async function routeAdmin(req: Request, env: Env, path: string): Promise<Response> {
  const g = await guardAdminRequest(req, adminEnv(env));
  if (!g.ok) return g.response;
  const id: AdminIdentity = g.identity;
  const sub = path.slice(ADMIN_PREFIX.length) || "/";

  if (req.method === "GET" && sub === "/me") return json({ email: id.email, role: id.role });
  if (req.method === "GET" && sub === "/dashboard/summary") return json(await dashboardSummary(env));
  // FAZ_6 6.1 — dönüşüm atfı (anonim agregat; lead-türevi → admin-only, 3.7 analitik kuralıyla aynı). Sözleşme: ./attribution-contract.ts
  if (req.method === "GET" && sub === "/analytics/attribution") {
    if (id.role !== "admin") throw new HttpError(403, "forbidden", "Analitik modülü yalnız admin");
    try {
      return json(await computeAttribution(env.DB, parseAttributionQuery(new URL(req.url))));
    } catch (e) {
      if (e instanceof AttributionQueryError) throw new HttpError(400, "validation_failed", "Geçersiz sorgu", [{ field: e.field, message: "sınır dışı" }]);
      throw e;
    }
  }
  // FAZ_6 6.3 — keyword fırsatları (GSC sorgu anlık görüntüsü; analitik modülü → admin-only). Sözleşme: ./keyword-contract.ts (keywords.v1)
  if (req.method === "GET" && sub === "/analytics/keywords") {
    if (id.role !== "admin") throw new HttpError(403, "forbidden", "Analitik modülü yalnız admin");
    try {
      return json(await computeKeywordReport(env.DB, parseKeywordQuery(new URL(req.url))));
    } catch (e) {
      if (e instanceof KeywordQueryError) throw new HttpError(400, "validation_failed", "Geçersiz sorgu", [{ field: e.field, message: "sınır dışı" }]);
      throw e;
    }
  }
  throw new HttpError(404, "not_found", "Bulunamadı");
}
