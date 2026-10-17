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
  topQueries?: Array<{ query: string; clicks: number; impressions: number }>;
  topPages?: Array<{ page: string; clicks: number; impressions: number }>;
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
