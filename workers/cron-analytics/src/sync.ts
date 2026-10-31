import type { Env, Ga4Data, GscData, MetaAdsData } from "./types";
import { fetchGscAnalytics, fetchGa4Analytics, getGoogleAccessToken } from "./google";
import { fetchMetaInsights, metaConfig, type MetaFetchResult } from "./meta";
import { fetchCfPagesAnalytics } from "./cloudflare";
import { sendAlert } from "./alert";

// TODO(3.9/FAZ 6 — 👤 canlı OAuth ertelendi): GSC/GA4/Meta/CF credential'ları Cloudflare Secrets'a girilmedikçe tüm istemciler null
// döner (STUB). Bu durumda D1'e SATIR YAZILMAZ (aksi halde daha önce çekilmiş gerçek veri null ile ezilirdi). Canlı doğrulama
// (credential + 1 gün veri) trafik ve property hazır olunca yapılır: docs/analytics-setup.md §4.
export type SyncResult = { success: boolean; error?: string; skipped?: "no_credentials" | "no_data"; meta?: MetaSyncStatus };

/** FAZ_6 6.5 — Meta kaynağının bu günkü durumu (integration_status'a yazılır → meta-ads.v1 data_status.integration). */
export type MetaSyncStatus = { status: "unconfigured" | "ok" | "passive" | "auth_error" | "error"; detail: string | null };

export function metaSyncStatus(r: MetaFetchResult): MetaSyncStatus {
  if (r.status === "unconfigured") return { status: "unconfigured", detail: r.reason };
  if (r.status === "ok") {
    const n = r.data.campaigns?.length ?? 0;
    return n > 0 ? { status: "ok", detail: `${n} kampanya${r.data.truncated ? " (sayfa sınırı — kısmi)" : ""}` } : { status: "passive", detail: "yayında kampanya yok (harcama 0)" };
  }
  return { status: r.status, detail: r.error };
}

/** Hangi kaynakların credential'ı tanımlı? (değerler asla loglanmaz) */
export function configuredSources(env: Env): string[] {
  const out: string[] = [];
  if (env.GSC_SITE_URL && env.GOOGLE_SERVICE_ACCOUNT_EMAIL && env.GOOGLE_PRIVATE_KEY) out.push("gsc");
  if (env.GA4_PROPERTY_ID && env.GOOGLE_SERVICE_ACCOUNT_EMAIL && env.GOOGLE_PRIVATE_KEY) out.push("ga4");
  if (metaConfig(env).ok) out.push("meta");
  if (env.CF_ACCOUNT_ID && env.CF_API_TOKEN) out.push("cf");
  return out;
}

export async function syncAnalyticsDay(
  env: Env,
  targetDay: string, // YYYY-MM-DD
): Promise<SyncResult> {
  if (configuredSources(env).length === 0) {
    console.warn(`Analytics sync ${targetDay} atlandı: credential tanımlı değil (stub).`);
    const m = metaConfig(env);
    return { success: true, skipped: "no_credentials", meta: { status: "unconfigured", detail: m.ok ? null : m.reason } };
  }
  try {
    console.log(`Starting analytics sync for ${targetDay}...`);

    let gscData: GscData | null = null;
    let ga4Data: Ga4Data | null = null;
    let metaData: MetaAdsData | null = null;

    // Shared Google token if configured
    let googleToken: string | undefined = undefined;
    if (env.GOOGLE_SERVICE_ACCOUNT_EMAIL && env.GOOGLE_PRIVATE_KEY) {
      try {
        googleToken = await getGoogleAccessToken(
          env.GOOGLE_SERVICE_ACCOUNT_EMAIL,
          env.GOOGLE_PRIVATE_KEY,
          [
            "https://www.googleapis.com/auth/webmasters.readonly",
            "https://www.googleapis.com/auth/analytics.readonly",
          ],
        );
      } catch (e) {
        console.error("Google OAuth token generation error:", e);
        await sendAlert(env, "Google OAuth Failed", `Could not generate token: ${e instanceof Error ? e.message : String(e)}`);
      }
    }

    // Parallel fetches
    const [gscRes, ga4Res, metaRes, cfRes] = await Promise.allSettled([
      fetchGscAnalytics(env, targetDay, googleToken),
      fetchGa4Analytics(env, targetDay, googleToken),
      fetchMetaInsights(env, targetDay),
      fetchCfPagesAnalytics(env, targetDay),
    ]);

    if (gscRes.status === "fulfilled") gscData = gscRes.value;
    else console.error("GSC fetch rejected:", gscRes.reason);

    if (ga4Res.status === "fulfilled") ga4Data = ga4Res.value;
    else console.error("GA4 fetch rejected:", ga4Res.reason);

    // 6.5: yalnız "ok" yazılır (pasif gün = gerçek 0 harcama). unconfigured/auth_error/error → meta_json YAZILMAZ (sahte harcama yok).
    const metaFetch: MetaFetchResult = metaRes.status === "fulfilled" ? metaRes.value : { status: "error", error: "rejected" };
    if (metaFetch.status === "ok") metaData = metaFetch.data;
    else if (metaFetch.status !== "unconfigured") console.error(`Meta fetch ${targetDay}: ${metaFetch.status} ${metaFetch.error}`);
    const meta = metaSyncStatus(metaFetch);

    // If GA4 is missing but CF Pages Analytics is available, merge CF stats into ga4 fallback object
    if (!ga4Data && cfRes.status === "fulfilled" && cfRes.value) {
      const cf = cfRes.value;
      ga4Data = {
        sessions: cf.pageViews,
        users: cf.uniqueVisitors || cf.requests,
        screenPageViews: cf.pageViews,
      };
    }

    if (!ga4Data && !gscData && !metaData) {
      // Credential var ama hiçbir kaynak veri döndürmedi (hata/yetki/boş gün): mevcut satırı null ile EZME.
      await sendAlert(env, `Analytics Sync No Data (${targetDay})`, "Tüm kaynaklar boş döndü; D1 satırı yazılmadı.");
      return { success: false, error: "no_data_from_any_source", skipped: "no_data", meta };
    }

    const ga4Json = ga4Data ? JSON.stringify(ga4Data) : null;
    const gscJson = gscData ? JSON.stringify(gscData) : null;
    const metaJson = metaData ? JSON.stringify(metaData) : null;

    // Write to analytics_daily table. 6.5: bir kaynak bu çalışmada null döndüyse (geçici hata) o günün DAHA ÖNCE yazılmış gerçek verisi
    // null ile EZİLMEZ (COALESCE) — yeniden sync (manuel /sync) yalnız gelen kaynakları günceller.
    const sql = `
      INSERT INTO analytics_daily (day, locale, ga4_json, gsc_json, meta_json, created_at)
      VALUES (?, 'all', ?, ?, ?, datetime('now'))
      ON CONFLICT(day, locale) DO UPDATE SET
        ga4_json = COALESCE(excluded.ga4_json, analytics_daily.ga4_json),
        gsc_json = COALESCE(excluded.gsc_json, analytics_daily.gsc_json),
        meta_json = COALESCE(excluded.meta_json, analytics_daily.meta_json),
        created_at = datetime('now')
    `;

    await env.DB.prepare(sql).bind(targetDay, ga4Json, gscJson, metaJson).run();
    console.log(`Successfully synced analytics for ${targetDay}`);
    return { success: true, meta };
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err);
    console.error(`Sync error for ${targetDay}:`, msg);
    await sendAlert(env, `Analytics Sync Error (${targetDay})`, msg);
    return { success: false, error: msg };
  }
}

export function getYesterdayString(baseDate = new Date()): string {
  const d = new Date(baseDate.getTime() - 24 * 60 * 60 * 1000);
  return d.toISOString().slice(0, 10);
}

/** YYYY-MM-DD aralığı üretir (dahil), eskiden yeniye. */
function daysBack(from: Date, count: number): string[] {
  const out: string[] = [];
  for (let i = count; i >= 1; i--) out.push(new Date(from.getTime() - i * 86_400_000).toISOString().slice(0, 10));
  return out;
}

/** Son `lookback` günden analytics_daily'de (locale='all') kaydı OLMAYAN günler (bugün hariç). */
export async function findMissingDays(env: Env, now = new Date(), lookback = 7): Promise<string[]> {
  const wanted = daysBack(now, lookback);
  const res = await env.DB.prepare("SELECT day FROM analytics_daily WHERE locale = 'all' AND day >= ?").bind(wanted[0]).all<{ day: string }>();
  const have = new Set((res.results ?? []).map((r) => r.day));
  return wanted.filter((d) => !have.has(d));
}

/** Cron: dünü çek + eksik günleri doldur (en fazla `cap` gün/çalışma → API kotası korunur). */
export async function syncWithBackfill(env: Env, now = new Date(), lookback = 7, cap = 3): Promise<Record<string, SyncResult>> {
  const results: Record<string, SyncResult> = {};
  if (configuredSources(env).length === 0) {
    results[getYesterdayString(now)] = await syncAnalyticsDay(env, getYesterdayString(now)); // skipped:no_credentials
    return results;
  }
  const yesterday = getYesterdayString(now);
  results[yesterday] = await syncAnalyticsDay(env, yesterday);
  const missing = (await findMissingDays(env, now, lookback)).filter((d) => d !== yesterday).reverse().slice(0, cap);
  for (const d of missing) results[d] = await syncAnalyticsDay(env, d);
  return results;
}
