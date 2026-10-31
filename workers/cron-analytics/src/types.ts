export interface Env {
  DB: D1Database;

  // Cloudflare Secrets / Vars
  // /sync (manuel tetik) için paylaşılan sır — Cloudflare Secret. Tanımsızsa /sync KAPALI (fail-closed).
  SYNC_TOKEN?: string;

  // Alert Webhook (Slack / Discord / generic webhook)
  ANALYTICS_ALERT_WEBHOOK_URL?: string;

  // Cloudflare GraphQL / Pages Analytics API
  CF_ACCOUNT_ID?: string;
  CF_API_TOKEN?: string;
  CF_PAGES_PROJECT?: string;

  // Google OAuth / Service Account credentials for GSC & GA4
  GOOGLE_SERVICE_ACCOUNT_EMAIL?: string;
  GOOGLE_PRIVATE_KEY?: string; // PEM format
  GA4_PROPERTY_ID?: string;
  GSC_SITE_URL?: string; // e.g. "https://bdimexport.com" or "sc-domain:bdimexport.com"

  // Meta Marketing API (reklam harcamaları ve dönüşümler)
  META_ACCESS_TOKEN?: string;
  META_AD_ACCOUNT_ID?: string;

  // FAZ_6 6.3 — keyword motoru (deterministik skor her gün sync'ten sonra; AI içgörüsü Gemini STUB — ERTELENEN E3)
  GSC_QUERY_ROW_LIMIT?: string; // var — günlük sorgu×sayfa satırı (default 500, en çok 5000)
  KEYWORD_INSIGHTS_MODE?: string; // "off" (varsayılan) | "stub" | "gemini" (E3)
  // PLACEHOLDER — DEĞER KODDA/REPODA YOK. E3'te (AGENTS §9) `wrangler secret put GEMINI_API_KEY --env <env>` + GEMINI_MODEL var'ı.
  GEMINI_API_KEY?: string; // SECRET
  GEMINI_MODEL?: string;
  GEMINI_FALLBACK_MODEL?: string;
  AI_DAILY_LIMIT?: string; // 4.7 kota (cron-rss/quota.ts ile aynı anlam)
  AI_FALLBACK_DAILY_LIMIT?: string;
  AI_QUOTA_WARN_RATIO?: string;
  PIPELINE_ALERT_WEBHOOK_URL?: string; // SECRET — kota alert'i (cron-rss/alert.ts)
}

export interface DayAnalytics {
  day: string; // YYYY-MM-DD
  locale: string; // "all", "tr", "en", "zh", "de" etc.
  ga4_json: string | null;
  gsc_json: string | null;
  meta_json: string | null;
}

export interface GscData {
  impressions: number;
  clicks: number;
  ctr: number;
  position: number;
  topQueries?: Array<{ query: string; clicks: number; impressions: number; ctr?: number; position?: number }>;
  topPages?: Array<{ page: string; clicks: number; impressions: number }>;
  /** FAZ_6 6.3 — sorgu × sayfa (keyword motoru girdisi; migration 0007 gsc_query_v okur). */
  queries?: GscQueryRow[];
}

export interface GscQueryRow {
  query: string;
  page: string;
  clicks: number;
  impressions: number;
  ctr: number;
  position: number;
}

export interface Ga4Data {
  sessions: number;
  users: number;
  screenPageViews: number;
  engagementRate?: number;
  topPages?: Array<{ pagePath: string; sessions: number }>;
  trafficSources?: Array<{ source: string; medium: string; sessions: number }>;
}

export interface CfPagesAnalyticsData {
  requests: number;
  pageViews: number;
  uniqueVisitors: number;
  bandwidthBytes: number;
  topCountries?: Array<{ country: string; requests: number }>;
}

export interface MetaAdsData {
  spend: number;
  impressions: number;
  clicks: number;
  campaigns?: Array<{ id: string; name: string; spend: number; impressions: number; clicks: number }>;
}
