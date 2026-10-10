// Dashboard D1 okuma sorguları — YALNIZCA SELECT (salt okunur). Çalıştıracak taraf: workers/api (FAZ_3 3.4).
// Şema: db/migrations/0001_init.sql. Bu dosya sözleşmedir; UI D1'e doğrudan erişmez (static export).
export const DASHBOARD_QUERIES = {
  leadsByStatus: "SELECT status, COUNT(*) AS n FROM leads GROUP BY status",
  leadsLast7d: "SELECT COUNT(*) AS n FROM leads WHERE created_at >= datetime('now','-7 days')",
  contentsByStatus: "SELECT status, COUNT(*) AS n FROM contents GROUP BY status",
  partnersByApproval: "SELECT approved, COUNT(*) AS n FROM partners GROUP BY approved",
  analyticsLatest:
    "SELECT day, ga4_json, gsc_json FROM analytics_daily WHERE locale='all' ORDER BY day DESC LIMIT 1",
  analyticsHistory30d:
    "SELECT day, locale, ga4_json, gsc_json, meta_json FROM analytics_daily ORDER BY day DESC LIMIT 30",
} as const;
