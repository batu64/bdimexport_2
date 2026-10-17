// FAZ_3 3.7 — /admin/api/analytics/summary (GET: analytics_daily + leads kaynakları + top pages).
// Workers / admin API router'ında çalışır.
// Auth: guardAdminRequest (Access JWT + allowlist) + ADMIN-ONLY: viewer 403 (analitik modülü Dashboard dışı → 3.2 rol kuralı).
// Salt-okunur (yalnız SELECT). Veri yoksa 200 + boş diziler (UI zarif boş durum gösterir).
import { guardAdminRequest, type AdminEnv } from "../middleware.ts";

export interface AnalyticsEnv extends AdminEnv {
  DB: {
    prepare(sql: string): {
      bind(...args: unknown[]): {
        all<T>(): Promise<{ results: T[] }>;
        first<T>(): Promise<T | null>;
      };
      all<T>(): Promise<{ results: T[] }>;
    };
  };
}

const json = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), {
    status,
    headers: {
      "content-type": "application/json; charset=utf-8",
      "cache-control": "no-store",
      "x-robots-tag": "noindex, nofollow",
    },
  });

export async function handleAnalyticsSummary(
  request: Request,
  env: AnalyticsEnv,
  opts?: Parameters<typeof guardAdminRequest>[2],
): Promise<Response> {
  const g = await guardAdminRequest(request, env, opts);
  if (!g.ok) return g.response;
  if (g.identity.role !== "admin") return json({ error: "admin_only" }, 403);

  if (request.method !== "GET") {
    return json({ error: "method_not_allowed" }, 405);
  }

  try {
    // 1. Son 30 günün analytics_daily kayıtları
    const historyRes = await env.DB.prepare(
      "SELECT day, locale, ga4_json, gsc_json, meta_json FROM analytics_daily ORDER BY day DESC LIMIT 30"
    ).all<{
      day: string;
      locale: string;
      ga4_json: string | null;
      gsc_json: string | null;
      meta_json: string | null;
    }>();

    const history = historyRes.results ?? [];

    let totalSessions = 0;
    let totalClicks = 0;
    let totalImpressions = 0;
    let totalSpend = 0;

    const pageSessionsMap: Record<string, number> = {};

    for (const h of history) {
      if (h.ga4_json) {
        try {
          const ga4 = JSON.parse(h.ga4_json);
          totalSessions += ga4.sessions ?? 0;
          if (Array.isArray(ga4.topPages)) {
            for (const p of ga4.topPages) {
              if (p.pagePath) {
                pageSessionsMap[p.pagePath] = (pageSessionsMap[p.pagePath] ?? 0) + (p.sessions ?? 0);
              }
            }
          }
        } catch {}
      }
      if (h.gsc_json) {
        try {
          const gsc = JSON.parse(h.gsc_json);
          totalClicks += gsc.clicks ?? 0;
          totalImpressions += gsc.impressions ?? 0;
        } catch {}
      }
      if (h.meta_json) {
        try {
          const meta = JSON.parse(h.meta_json);
          totalSpend += meta.spend ?? 0;
        } catch {}
      }
    }

    const topPages = Object.entries(pageSessionsMap)
      .map(([page, sessions]) => ({ page, sessions }))
      .sort((a, b) => b.sessions - a.sessions)
      .slice(0, 10);

    // 2. Lead kaynakları (leads tablosundan utm_source veya source_page gruplaması)
    const leadsRes = await env.DB.prepare(
      "SELECT source_page, utm_json FROM leads ORDER BY created_at DESC LIMIT 500"
    ).all<{ source_page: string; utm_json: string | null }>();

    const leads = leadsRes.results ?? [];
    const sourceCount: Record<string, number> = {};
    let totalLeads = 0;

    for (const l of leads) {
      totalLeads++;
      let src = "Doğrudan / Organik";
      if (l.utm_json) {
        try {
          const utm = JSON.parse(l.utm_json);
          if (utm.utm_source) src = String(utm.utm_source);
        } catch {}
      } else if (l.source_page) {
        src = l.source_page;
      }
      sourceCount[src] = (sourceCount[src] ?? 0) + 1;
    }

    const leadSources = Object.entries(sourceCount)
      .map(([source, count]) => ({
        source,
        count,
        percentage: totalLeads > 0 ? Math.round((count / totalLeads) * 100) : 0,
      }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 5);

    return json({
      summary: {
        totalSessions,
        totalClicks,
        totalImpressions,
        totalSpend,
      },
      history,
      leadSources,
      topPages,
    });
  } catch (err: unknown) {
    console.error("handleAnalyticsSummary error:", err);
    return json({ error: "internal_error" }, 500);
  }
}
