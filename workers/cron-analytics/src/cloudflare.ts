import type { CfPagesAnalyticsData, Env } from "./types";

/**
 * Cloudflare GraphQL Analytics API client for Pages & Worker requests.
 * Uses CF GraphQL: https://api.cloudflare.com/client/v4/graphql
 */
export async function fetchCfPagesAnalytics(
  env: Env,
  day: string, // YYYY-MM-DD
): Promise<CfPagesAnalyticsData | null> {
  if (!env.CF_ACCOUNT_ID || !env.CF_API_TOKEN) {
    return null;
  }

  const startDate = `${day}T00:00:00Z`;
  const endDate = `${day}T23:59:59Z`;

  const query = `
    query PagesAnalytics($accountTag: String!, $start: String!, $end: String!) {
      viewer {
        accounts(filter: { accountTag: $accountTag }) {
          pagesProjectsAdaptiveGroups(
            filter: { datetime_geq: $start, datetime_leq: $end }
            limit: 100
          ) {
            sum {
              requests
              pageViews
            }
            dimensions {
              datetime
            }
          }
        }
      }
    }
  `;

  try {
    const res = await fetch("https://api.cloudflare.com/client/v4/graphql", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${env.CF_API_TOKEN}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        query,
        variables: {
          accountTag: env.CF_ACCOUNT_ID,
          start: startDate,
          end: endDate,
        },
      }),
    });

    if (!res.ok) {
      console.error(`CF Analytics HTTP ${res.status}: ${await res.text()}`);
      return null;
    }

    const json = (await res.json()) as any;
    if (json.errors && json.errors.length > 0) {
      console.error("CF Analytics GraphQL errors:", json.errors);
      return null;
    }

    const groups = json.data?.viewer?.accounts?.[0]?.pagesProjectsAdaptiveGroups ?? [];
    let requests = 0;
    let pageViews = 0;

    for (const g of groups) {
      requests += g.sum?.requests ?? 0;
      pageViews += g.sum?.pageViews ?? 0;
    }

    return {
      requests,
      pageViews,
      uniqueVisitors: 0,
      bandwidthBytes: 0,
    };
  } catch (err: unknown) {
    console.error("fetchCfPagesAnalytics error:", err instanceof Error ? err.message : String(err));
    return null;
  }
}
