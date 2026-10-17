import type { Env, Ga4Data, GscData } from "./types";

/**
 * Creates Google OAuth2 Service Account JWT assertion and fetches an access token.
 * Using Web Crypto API natively supported in Cloudflare Workers (subtle.importKey + subtle.sign RS256).
 */
export async function getGoogleAccessToken(
  clientEmail: string,
  privateKeyPem: string,
  scopes: string[],
): Promise<string> {
  const now = Math.floor(Date.now() / 1000);
  const header = { alg: "RS256", typ: "JWT" };
  const payload = {
    iss: clientEmail,
    scope: scopes.join(" "),
    aud: "https://oauth2.googleapis.com/token",
    exp: now + 3600,
    iat: now,
  };

  const enc = new TextEncoder();
  const b64Url = (buf: ArrayBuffer | Uint8Array) => {
    const bytes = buf instanceof Uint8Array ? buf : new Uint8Array(buf);
    let binary = "";
    for (let i = 0; i < bytes.byteLength; i++) {
      binary += String.fromCharCode(bytes[i]);
    }
    return btoa(binary).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
  };

  const sHeader = b64Url(enc.encode(JSON.stringify(header)));
  const sPayload = b64Url(enc.encode(JSON.stringify(payload)));
  const toSign = `${sHeader}.${sPayload}`;

  // Clean PEM string
  const pemBody = privateKeyPem
    .replace(/-----BEGIN [A-Z ]+-----/g, "")
    .replace(/-----END [A-Z ]+-----/g, "")
    .replace(/\s+/g, "");

  const binaryDer = Uint8Array.from(atob(pemBody), (c) => c.charCodeAt(0));

  const cryptoKey = await crypto.subtle.importKey(
    "pkcs8",
    binaryDer.buffer,
    { name: "RSASSA-PKCS1-v1_5", hash: "SHA-256" },
    false,
    ["sign"],
  );

  const sig = await crypto.subtle.sign("RSASSA-PKCS1-v1_5", cryptoKey, enc.encode(toSign));
  const assertion = `${toSign}.${b64Url(sig)}`;

  const tokenRes = await fetch("https://oauth2.googleapis.com/token", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      grant_type: "urn:ietf:params:oauth:grant-type:jwt-bearer",
      assertion,
    }),
  });

  if (!tokenRes.ok) {
    throw new Error(`Google OAuth token request failed: HTTP ${tokenRes.status} ${await tokenRes.text()}`);
  }

  const tokenData = (await tokenRes.json()) as { access_token: string };
  return tokenData.access_token;
}

/**
 * Google Search Console Search Analytics API client
 * Fetches impressions, clicks, ctr, position and top queries for a given day.
 */
export async function fetchGscAnalytics(
  env: Env,
  day: string, // YYYY-MM-DD
  accessToken?: string,
): Promise<GscData | null> {
  if (!env.GSC_SITE_URL) return null;
  if (!accessToken && (!env.GOOGLE_SERVICE_ACCOUNT_EMAIL || !env.GOOGLE_PRIVATE_KEY)) {
    return null;
  }

  try {
    const token =
      accessToken ??
      (await getGoogleAccessToken(env.GOOGLE_SERVICE_ACCOUNT_EMAIL!, env.GOOGLE_PRIVATE_KEY!, [
        "https://www.googleapis.com/auth/webmasters.readonly",
      ]));

    const encodedSite = encodeURIComponent(env.GSC_SITE_URL);
    const url = `https://www.googleapis.com/webmasters/v3/sites/${encodedSite}/searchAnalytics/query`;

    const res = await fetch(url, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        startDate: day,
        endDate: day,
        dimensions: ["query"],
        rowLimit: 20,
      }),
    });

    if (!res.ok) {
      console.error(`GSC API HTTP ${res.status}: ${await res.text()}`);
      return null;
    }

    const data = (await res.json()) as any;
    const rows = data.rows ?? [];

    let totalClicks = 0;
    let totalImpressions = 0;
    let sumCtr = 0;
    let sumPosition = 0;

    const topQueries = rows.map((r: any) => {
      const q = r.keys?.[0] ?? "";
      totalClicks += r.clicks ?? 0;
      totalImpressions += r.impressions ?? 0;
      sumCtr += r.ctr ?? 0;
      sumPosition += r.position ?? 0;
      return {
        query: q,
        clicks: r.clicks ?? 0,
        impressions: r.impressions ?? 0,
      };
    });

    const count = rows.length || 1;
    return {
      clicks: totalClicks,
      impressions: totalImpressions,
      ctr: sumCtr / count,
      position: sumPosition / count,
      topQueries,
    };
  } catch (err) {
    console.error("fetchGscAnalytics error:", err instanceof Error ? err.message : String(err));
    return null;
  }
}

/**
 * Google Analytics 4 (GA4) Data API client
 * Fetches sessions, totalUsers, screenPageViews, and top pages for a given day.
 */
export async function fetchGa4Analytics(
  env: Env,
  day: string, // YYYY-MM-DD
  accessToken?: string,
): Promise<Ga4Data | null> {
  if (!env.GA4_PROPERTY_ID) return null;
  if (!accessToken && (!env.GOOGLE_SERVICE_ACCOUNT_EMAIL || !env.GOOGLE_PRIVATE_KEY)) {
    return null;
  }

  try {
    const token =
      accessToken ??
      (await getGoogleAccessToken(env.GOOGLE_SERVICE_ACCOUNT_EMAIL!, env.GOOGLE_PRIVATE_KEY!, [
        "https://www.googleapis.com/auth/analytics.readonly",
      ]));

    const url = `https://analyticsdata.googleapis.com/v1beta/properties/${env.GA4_PROPERTY_ID}:runReport`;

    const res = await fetch(url, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        dateRanges: [{ startDate: day, endDate: day }],
        dimensions: [{ name: "pagePath" }],
        metrics: [
          { name: "sessions" },
          { name: "totalUsers" },
          { name: "screenPageViews" },
        ],
        limit: 20,
      }),
    });

    if (!res.ok) {
      console.error(`GA4 API HTTP ${res.status}: ${await res.text()}`);
      return null;
    }

    const data = (await res.json()) as any;
    const rows = data.rows ?? [];

    let totalSessions = 0;
    let totalUsers = 0;
    let totalViews = 0;

    const topPages = rows.map((r: any) => {
      const pagePath = r.dimensionValues?.[0]?.value ?? "";
      const s = parseInt(r.metricValues?.[0]?.value ?? "0", 10);
      const u = parseInt(r.metricValues?.[1]?.value ?? "0", 10);
      const v = parseInt(r.metricValues?.[2]?.value ?? "0", 10);

      totalSessions += s;
      totalUsers += u;
      totalViews += v;

      return { pagePath, sessions: s };
    });

    return {
      sessions: totalSessions,
      users: totalUsers,
      screenPageViews: totalViews,
      topPages,
    };
  } catch (err) {
    console.error("fetchGa4Analytics error:", err instanceof Error ? err.message : String(err));
    return null;
  }
}
