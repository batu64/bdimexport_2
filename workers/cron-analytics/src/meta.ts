// FAZ_6 6.5 — Meta Marketing API (Insights) istemcisi: kampanya bazlı günlük harcama + teslimat metrikleri → analytics_daily.meta_json.
// FAIL-CLOSED: META_ACCESS_TOKEN / META_AD_ACCOUNT_ID yoksa (ERTELENEN E4) ağ çağrısı YAPILMAZ → status "unconfigured"; sync düşmez,
// SAHTE HARCAMA ÜRETİLMEZ (meta_json yazılmaz). Token yalnız Authorization başlığında gider (URL'de/logda YOK).
// KVKK: yalnız hesap→kampanya AGREGATI (harcama/gösterim/tıklama/erişim/Meta'nın bildirdiği lead SAYISI); kişi/kitle verisi istenmez.
// Docs: https://developers.facebook.com/docs/marketing-api/insights
import type { Env, MetaAdsData, MetaCampaign } from "./types";

export const META_INSIGHTS_SCHEMA = "meta-insights.v1";
/** Graph API sürümü — Meta sürümleri ~2 yıl yaşar: E4'te güncel sürüm doğrulanıp META_API_VERSION ile verilir. */
export const META_DEFAULT_API_VERSION = "v21.0";
export const META_PAGE_LIMIT = 100;
export const META_MAX_PAGES = 5; // en çok 500 kampanya/gün; fazlası `truncated: true`
const FIELDS = "campaign_id,campaign_name,objective,spend,impressions,clicks,inline_link_clicks,reach,actions,account_currency";
/** "lead" Meta'nın toplam lead aksiyonudur; yoksa bileşenleri toplanır (çift sayım yok). */
const LEAD_TOTAL = "lead";
const LEAD_PARTS = ["offsite_conversion.fb_pixel_lead", "onsite_conversion.lead_grouped"];

export type MetaFetchResult =
  | { status: "unconfigured"; reason: string }
  | { status: "ok"; data: MetaAdsData }
  | { status: "auth_error"; error: string }
  | { status: "error"; error: string };

type MetaConfig = { ok: true; token: string; account: string; version: string; appSecret: string | null } | { ok: false; reason: string };

export function metaConfig(env: Env): MetaConfig {
  if (!env.META_ACCESS_TOKEN || !env.META_AD_ACCOUNT_ID) return { ok: false, reason: "META_ACCESS_TOKEN / META_AD_ACCOUNT_ID tanımlı değil (E4)" };
  const acct = env.META_AD_ACCOUNT_ID.trim();
  if (!/^(act_)?\d{1,20}$/.test(acct)) return { ok: false, reason: "META_AD_ACCOUNT_ID biçimi geçersiz (act_<rakam>)" };
  const version = (env.META_API_VERSION ?? META_DEFAULT_API_VERSION).trim();
  if (!/^v\d{1,2}\.\d$/.test(version)) return { ok: false, reason: "META_API_VERSION biçimi geçersiz (vNN.N)" };
  return { ok: true, token: env.META_ACCESS_TOKEN, account: acct.startsWith("act_") ? acct : `act_${acct}`, version, appSecret: env.META_APP_SECRET || null };
}

/** appsecret_proof = HMAC-SHA256(token, app secret) hex — META_APP_SECRET tanımlıysa her isteğe eklenir (çalınan token'ı tek başına işe yaramaz kılar). */
async function appSecretProof(token: string, secret: string): Promise<string> {
  const key = await crypto.subtle.importKey("raw", new TextEncoder().encode(secret), { name: "HMAC", hash: "SHA-256" }, false, ["sign"]);
  const sig = new Uint8Array(await crypto.subtle.sign("HMAC", key, new TextEncoder().encode(token)));
  return [...sig].map((b) => b.toString(16).padStart(2, "0")).join("");
}

// Meta sayıları METİN döner ("12.34"); geçersiz/negatif → null (0 UYDURULMAZ).
const money = (v: unknown): number | null => {
  const n = typeof v === "string" && /^\d+(\.\d+)?$/.test(v.trim()) ? Number(v) : typeof v === "number" ? v : NaN;
  return Number.isFinite(n) && n >= 0 ? Math.round(n * 100) / 100 : null;
};
const count = (v: unknown): number | null => {
  const n = typeof v === "string" && /^\d{1,15}$/.test(v.trim()) ? Number(v) : typeof v === "number" ? v : NaN;
  return Number.isInteger(n) && n >= 0 ? n : null;
};
// eslint-disable-next-line no-control-regex
const cleanName = (v: unknown): string | null => (typeof v === "string" ? v.replace(/[\u0000-\u001f\u007f]/g, " ").replace(/\s+/g, " ").trim().slice(0, 200) || null : null);

/** actions dizisinden lead sayısı. actions alanı YOKSA null ("Meta bildirmedi"); dizi var ama lead tipi yoksa 0 (gerçek sıfır). */
export function leadsFromActions(actions: unknown): number | null {
  if (!Array.isArray(actions)) return null;
  const get = (t: string) => {
    const a = actions.find((x) => x && typeof x === "object" && (x as Record<string, unknown>).action_type === t) as Record<string, unknown> | undefined;
    return a ? count(a.value) : null;
  };
  const total = get(LEAD_TOTAL);
  if (total !== null) return total;
  return LEAD_PARTS.reduce((s, t) => s + (get(t) ?? 0), 0);
}

/** Tek Insights satırı → kampanya. Kimliği/harcaması/gösterimi/tıklaması geçersiz satır ATILIR (kısmi uydurma yok). */
export function parseCampaignRow(r: unknown): (MetaCampaign & { currency: string | null }) | null {
  if (!r || typeof r !== "object") return null;
  const o = r as Record<string, unknown>;
  const id = typeof o.campaign_id === "string" && /^\d{1,30}$/.test(o.campaign_id) ? o.campaign_id : null;
  const spend = money(o.spend), impressions = count(o.impressions), clicks = count(o.clicks);
  if (id === null || spend === null || impressions === null || clicks === null) return null;
  return {
    id,
    name: cleanName(o.campaign_name) ?? id,
    objective: typeof o.objective === "string" && /^[A-Z_]{1,40}$/.test(o.objective) ? o.objective : null,
    spend, impressions, clicks,
    link_clicks: count(o.inline_link_clicks),
    reach: count(o.reach),
    leads: leadsFromActions(o.actions),
    currency: typeof o.account_currency === "string" && /^[A-Z]{3}$/.test(o.account_currency) ? o.account_currency : null,
  };
}

/** Kampanya listesi → gün özeti. reach kampanyalar arası TOPLANMAZ (tekilleştirilmiş kişi sayısıdır; toplamı yanlış olur). */
export function summarizeCampaigns(rows: unknown[], fetchedAt: string, truncated = false): { data: MetaAdsData; rejected: number } {
  const parsed = rows.map(parseCampaignRow);
  const ok = parsed.filter((x): x is NonNullable<typeof x> => x !== null);
  const currencies = [...new Set(ok.map((c) => c.currency).filter((c): c is string => c !== null))];
  const sumN = (f: (c: MetaCampaign) => number | null) => ok.reduce<number | null>((a, c) => (f(c) === null ? a : (a ?? 0) + (f(c) as number)), null);
  const campaigns: MetaCampaign[] = ok.map(({ currency: _c, ...c }) => c);
  return {
    rejected: parsed.length - ok.length,
    data: {
      schema: META_INSIGHTS_SCHEMA,
      spend: Math.round(ok.reduce((a, c) => a + c.spend, 0) * 100) / 100,
      impressions: ok.reduce((a, c) => a + c.impressions, 0),
      clicks: ok.reduce((a, c) => a + c.clicks, 0),
      link_clicks: sumN((c) => c.link_clicks ?? null),
      leads: sumN((c) => c.leads ?? null),
      currency: currencies.length === 1 ? currencies[0] : null, // tek hesap → tek para birimi; boş gün → null
      campaigns,
      fetched_at: fetchedAt,
      truncated,
    },
  };
}

/** Graph API hata gövdesi → kısa, sır içermeyen metin. code 190 (geçersiz/süresi dolmuş token) ve 102 (oturum) = auth. */
function metaError(status: number, body: unknown): { auth: boolean; msg: string } {
  const e = body && typeof body === "object" ? ((body as Record<string, unknown>).error as Record<string, unknown> | undefined) : undefined;
  const code = typeof e?.code === "number" ? e.code : null;
  const type = typeof e?.type === "string" ? e.type.slice(0, 40) : "";
  const auth = status === 401 || code === 190 || code === 102;
  return { auth, msg: `HTTP ${status}${code !== null ? ` code ${code}` : ""}${type ? ` ${type}` : ""}` };
}

/**
 * Günlük kampanya Insights'ı (level=campaign). Hiçbir koşulda fırlatmaz. paging.next yalnız graph.facebook.com'a izlenir (en çok META_MAX_PAGES).
 * Teslimat olmayan gün: Meta boş `data` döner → status "ok", spend 0, campaigns [] (= "entegre ama pasif"; bu gerçek sıfırdır, uydurma değil).
 */
export async function fetchMetaInsights(env: Env, day: string, now: Date = new Date()): Promise<MetaFetchResult> {
  const cfg = metaConfig(env);
  if (!cfg.ok) return { status: "unconfigured", reason: cfg.reason };
  try {
    const params = new URLSearchParams({
      level: "campaign",
      fields: FIELDS,
      time_range: JSON.stringify({ since: day, until: day }),
      limit: String(META_PAGE_LIMIT),
    });
    if (cfg.appSecret) params.set("appsecret_proof", await appSecretProof(cfg.token, cfg.appSecret));
    let url: string | null = `https://graph.facebook.com/${cfg.version}/${cfg.account}/insights?${params.toString()}`;
    const rows: unknown[] = [];
    let pages = 0;
    while (url && pages < META_MAX_PAGES) {
      const res: Response = await fetch(url, { headers: { Authorization: `Bearer ${cfg.token}` } });
      let body: unknown = null;
      try { body = await res.json(); } catch { body = null; }
      if (!res.ok) {
        const e = metaError(res.status, body);
        return e.auth ? { status: "auth_error", error: e.msg } : { status: "error", error: e.msg };
      }
      const o = (body ?? {}) as { data?: unknown; paging?: { next?: unknown } };
      if (!Array.isArray(o.data)) return { status: "error", error: "beklenmeyen yanıt biçimi (data dizisi yok)" };
      rows.push(...o.data);
      pages++;
      const next = typeof o.paging?.next === "string" ? o.paging.next : null;
      url = next && new URL(next).hostname === "graph.facebook.com" ? next : null;
    }
    const { data, rejected } = summarizeCampaigns(rows, now.toISOString(), url !== null);
    if (rejected) console.warn(`Meta ${day}: ${rejected} geçersiz kampanya satırı atıldı`);
    return { status: "ok", data };
  } catch (err) {
    return { status: "error", error: (err instanceof Error ? err.message : String(err)).slice(0, 120) };
  }
}

/** Geriye uyumlu (3.7) imza: veri yoksa/yapılandırılmamışsa null. */
export async function fetchMetaAnalytics(env: Env, day: string): Promise<MetaAdsData | null> {
  const r = await fetchMetaInsights(env, day);
  return r.status === "ok" ? r.data : null;
}
