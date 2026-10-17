import type { Env, MetaAdsData } from "./types";

/**
 * Meta Marketing API client (Insights API)
 * Docs: https://developers.facebook.com/docs/marketing-api/insights
 */
export async function fetchMetaAnalytics(
  env: Env,
  day: string, // YYYY-MM-DD
): Promise<MetaAdsData | null> {
  if (!env.META_ACCESS_TOKEN || !env.META_AD_ACCOUNT_ID) {
    return null;
  }

  try {
    const actId = env.META_AD_ACCOUNT_ID.startsWith("act_")
      ? env.META_AD_ACCOUNT_ID
      : `act_${env.META_AD_ACCOUNT_ID}`;

    const params = new URLSearchParams({
      access_token: env.META_ACCESS_TOKEN,
      time_range: JSON.stringify({ since: day, until: day }),
      fields: "campaign_id,campaign_name,spend,impressions,clicks",
      level: "campaign",
      limit: "50",
    });

    const url = `https://graph.facebook.com/v21.0/${actId}/insights?${params.toString()}`;
    const res = await fetch(url);

    if (!res.ok) {
      console.error(`Meta Marketing API HTTP ${res.status}: ${await res.text()}`);
      return null;
    }

    const data = (await res.json()) as any;
    const rows = data.data ?? [];

    let totalSpend = 0;
    let totalImpressions = 0;
    let totalClicks = 0;

    const campaigns = rows.map((r: any) => {
      const s = parseFloat(r.spend ?? "0");
      const imp = parseInt(r.impressions ?? "0", 10);
      const clk = parseInt(r.clicks ?? "0", 10);

      totalSpend += s;
      totalImpressions += imp;
      totalClicks += clk;

      return {
        id: r.campaign_id,
        name: r.campaign_name,
        spend: s,
        impressions: imp,
        clicks: clk,
      };
    });

    return {
      spend: totalSpend,
      impressions: totalImpressions,
      clicks: totalClicks,
      campaigns,
    };
  } catch (err) {
    console.error("fetchMetaAnalytics error:", err instanceof Error ? err.message : String(err));
    return null;
  }
}
