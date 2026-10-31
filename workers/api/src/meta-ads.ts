// FAZ_6 6.5 — Meta reklam ölçümü raporu (meta-ads.v1). Salt-okunur: analytics_daily.meta_json (gün) + meta_campaign_v (0008, kampanya)
// + integration_status (0008, bağlı mı/pasif mi/hata mı) + attribution_leads_v (0006, ANONİM — yalnız GROUP BY sayımı).
// Canlı Meta çağrısı YOK (cron-analytics yazar). Sözleşme: ./meta-ads-contract.ts
import { META_ADS_CONTRACT, type MetaAdsQuery, type MetaAdsReport, type MetaCampaignRow, type MetaDailyRow, type MetaIntegration } from "./meta-ads-contract";
import { utmToken } from "./attribution";

export const META_DEFAULT_DAYS = 30;
export const META_MAX_DAYS = 90;
const CAMPAIGN_LIMIT = 50;
const DAY_MS = 86_400_000;

/** utm_source (utmToken ile normalize) → Meta ailesi. */
export const META_SOURCES: ReadonlySet<string> = new Set([
  "facebook", "fb", "facebook.com", "m.facebook.com", "l.facebook.com", "lm.facebook.com",
  "instagram", "ig", "instagram.com", "l.instagram.com", "meta", "messenger", "audience_network", "an",
]);
/** Ücretli trafik medium'ları — organik paylaşım (utm_medium=social vb.) CAC'a girmez. */
export const PAID_MEDIA: ReadonlySet<string> = new Set(["cpc", "ppc", "cpm", "paid", "paid_social", "paidsocial", "paid-social", "social_paid", "social-paid", "ads", "ad", "display"]);

// Şablon enterpolasyonu YOK (SQLi taraması temiz). Lead sorgusu 0006 attribution_leads_v'yi okur — leads tablosuna doğrudan erişim yok.
// Dokunuş penceresi attribution.ts attributeLead ile aynı: touch_at yoksa lead anı; varsa (oluşturma − dokunuş) ≤ 30 gün ve dokunuş ≤ oluşturma + 1 gün.
export const META_ADS_SQL = {
  status: "SELECT status, detail, checked_at, last_ok_at FROM integration_status WHERE source = 'meta'",
  days: "SELECT day, meta_json FROM analytics_daily WHERE locale = 'all' AND day >= ? AND day <= ? AND meta_json IS NOT NULL ORDER BY day",
  campaigns: `SELECT day, currency, campaign_id, campaign_name, objective, spend, impressions, clicks, link_clicks, leads
              FROM meta_campaign_v WHERE day >= ? AND day <= ?`,
  leads: `SELECT utm_source, utm_medium, utm_campaign, COUNT(*) AS n FROM attribution_leads_v
          WHERE created_at >= ? AND created_at < ? AND utm_source IS NOT NULL
            AND (touch_at IS NULL OR touch_at = '' OR (typeof(touch_at) = 'text' AND julianday(touch_at) IS NOT NULL
                 AND julianday(created_at) - julianday(touch_at) <= 30 AND julianday(touch_at) <= julianday(created_at) + 1))
          GROUP BY utm_source, utm_medium, utm_campaign`,
} as const;
export const META_TOUCH_WINDOW_DAYS = 30; // SQL'deki 30 ile aynı (testte attribution WINDOW_DAYS ile eşitliği doğrulanır)

type Db = { prepare(sql: string): { bind(...a: unknown[]): { all<T>(): Promise<{ results?: T[] }>; first<T>(): Promise<T | null> }; first<T>(): Promise<T | null> } };

const dayOf = (ms: number) => new Date(ms).toISOString().slice(0, 10);
const sqlTs = (ms: number) => new Date(ms).toISOString().slice(0, 19).replace("T", " ");
const r2 = (n: number) => Math.round(n * 100) / 100;
const div = (a: number | null, b: number | null, k = 1, digits = 2): number | null =>
  a === null || b === null || b <= 0 ? null : Math.round(((a * k) / b) * 10 ** digits) / 10 ** digits;
const num = (v: unknown): number | null => (typeof v === "number" && Number.isFinite(v) && v >= 0 ? v : null);
const addN = (a: number | null, b: number | null) => (b === null ? a : (a ?? 0) + b);
const normCampaign = (v: unknown): string | null => (typeof v === "string" && v.trim() ? v.trim().toLowerCase().replace(/\s+/g, " ").slice(0, 200) : null);

interface DayRow { day: string; spend: number; impressions: number; clicks: number; link_clicks: number | null; leads: number | null; currency: string | null; campaigns: number; truncated: boolean }

/** meta_json → gün özeti. spend/impressions/clicks geçersizse gün "veri yok" sayılır (0 uydurulmaz). */
export function parseMetaDay(day: string, raw: unknown): DayRow | null {
  if (typeof raw !== "string") return null;
  let o: Record<string, unknown>;
  try {
    const p = JSON.parse(raw);
    if (!p || typeof p !== "object" || Array.isArray(p)) return null;
    o = p as Record<string, unknown>;
  } catch {
    return null;
  }
  const spend = num(o.spend), impressions = num(o.impressions), clicks = num(o.clicks);
  if (spend === null || impressions === null || clicks === null) return null;
  return {
    day, spend, impressions, clicks,
    link_clicks: num(o.link_clicks), leads: num(o.leads),
    currency: typeof o.currency === "string" && /^[A-Z]{3}$/.test(o.currency) ? o.currency : null,
    campaigns: Array.isArray(o.campaigns) ? o.campaigns.length : 0,
    truncated: o.truncated === true,
  };
}

const INTEGRATION: Record<string, MetaIntegration> = { ok: "active", passive: "passive", unconfigured: "unconfigured", auth_error: "auth_error", error: "error" };

export async function computeMetaAdsReport(db: Db, q: MetaAdsQuery = {}, now = new Date()): Promise<MetaAdsReport> {
  const days = Math.min(META_MAX_DAYS, Math.max(1, Math.trunc(q.days ?? META_DEFAULT_DAYS)));
  const toMs = Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate()) - DAY_MS; // dün (cron dünü yazar)
  const fromMs = toMs - (days - 1) * DAY_MS;
  const from = dayOf(fromMs), to = dayOf(toMs);
  const all = async <T>(sql: string, ...a: unknown[]) => ((await db.prepare(sql).bind(...a).all<T>()).results ?? []) as T[];

  const [st, dayRaw, campRaw, leadRaw] = await Promise.all([
    db.prepare(META_ADS_SQL.status).first<{ status: string; detail: string | null; checked_at: string; last_ok_at: string | null }>(),
    all<{ day: string; meta_json: string | null }>(META_ADS_SQL.days, from, to),
    all<{ day: string; currency: string | null; campaign_id: string; campaign_name: string | null; objective: string | null; spend: number; impressions: number; clicks: number; link_clicks: number | null; leads: number | null }>(META_ADS_SQL.campaigns, from, to),
    all<{ utm_source: unknown; utm_medium: unknown; utm_campaign: unknown; n: number }>(META_ADS_SQL.leads, sqlTs(fromMs), sqlTs(toMs + DAY_MS)),
  ]);
  const integration: MetaIntegration = st ? INTEGRATION[st.status] ?? "unknown" : "unknown";

  // ── gün düzeyi ──
  const dayRows = dayRaw.map((r) => parseMetaDay(r.day, r.meta_json)).filter((x): x is DayRow => x !== null);
  const currencies = [...new Set(dayRows.map((d) => d.currency).filter((c): c is string => c !== null))].sort();
  const mixed = currencies.length > 1;
  const currency = currencies.length === 1 ? currencies[0] : null;
  const money = (v: number | null) => (mixed || v === null ? null : r2(v));
  const has = dayRows.length > 0;
  const spend = has ? money(dayRows.reduce((a, d) => a + d.spend, 0)) : null;
  const impressions = has ? dayRows.reduce((a, d) => a + d.impressions, 0) : null;
  const clicks = has ? dayRows.reduce((a, d) => a + d.clicks, 0) : null;
  const daily: MetaDailyRow[] = dayRows.map((d) => ({ day: d.day, spend: money(d.spend), impressions: d.impressions, clicks: d.clicks, campaigns: d.campaigns }));

  // ── kampanya düzeyi ──
  type Acc = { id: string; name: string; objective: string | null; lastDay: string; days: Set<string>; spend: number; impressions: number; clicks: number; link: number | null; leads: number | null };
  const camps = new Map<string, Acc>();
  for (const c of campRaw) {
    const a = camps.get(c.campaign_id) ?? { id: c.campaign_id, name: c.campaign_id, objective: null, lastDay: "", days: new Set<string>(), spend: 0, impressions: 0, clicks: 0, link: null, leads: null };
    if (c.day >= a.lastDay) { a.lastDay = c.day; a.name = (typeof c.campaign_name === "string" && c.campaign_name) || c.campaign_id; a.objective = typeof c.objective === "string" ? c.objective : null; }
    a.days.add(c.day);
    a.spend += c.spend; a.impressions += c.impressions; a.clicks += c.clicks;
    a.link = addN(a.link, num(c.link_clicks)); a.leads = addN(a.leads, num(c.leads));
    camps.set(c.campaign_id, a);
  }
  // utm_campaign eşlemesi: önce kampanya kimliği, sonra BENZERSİZ küçük-harf ad (aynı adlı iki kampanya → ad ile eşlenmez)
  const byName = new Map<string, string | null>();
  for (const a of camps.values()) { const k = normCampaign(a.name); if (k) byName.set(k, byName.has(k) && byName.get(k) !== a.id ? null : a.id); }

  // ── anonim lead sayımı ──
  const siteLeads = new Map<string, number>();
  let unmatched = 0, organic = 0;
  for (const l of leadRaw) {
    if (!META_SOURCES.has(utmToken(l.utm_source))) continue;
    const n = Number(l.n) || 0;
    const c = normCampaign(l.utm_campaign);
    const id = c === null ? null : camps.has(c) ? c : byName.get(c) ?? null;
    if (id) siteLeads.set(id, (siteLeads.get(id) ?? 0) + n);
    else if (PAID_MEDIA.has(utmToken(l.utm_medium))) unmatched += n;
    else organic += n;
  }
  const matched = [...siteLeads.values()].reduce((a, b) => a + b, 0);
  const totalSite = matched + unmatched;

  const campaigns: MetaCampaignRow[] = [...camps.values()].map((a) => {
    const s = money(a.spend);
    const sl = siteLeads.get(a.id) ?? 0;
    return {
      campaign_id: a.id, name: a.name, objective: a.objective, days_active: a.days.size,
      spend: s, impressions: a.impressions, clicks: a.clicks, link_clicks: a.link,
      ctr: div(a.clicks, a.impressions, 1, 4), cpc: div(s, a.clicks), meta_reported_leads: a.leads, site_leads: sl, cac: sl > 0 ? div(s, sl) : null,
    };
  });
  campaigns.sort((x, y) => (y.spend ?? 0) - (x.spend ?? 0) || y.impressions - x.impressions || (x.campaign_id < y.campaign_id ? -1 : 1));

  const totals = {
    spend, impressions, clicks,
    link_clicks: has ? dayRows.reduce<number | null>((a, d) => addN(a, d.link_clicks), null) : null,
    ctr: div(clicks, impressions, 1, 4),
    cpc: div(spend, clicks),
    cpm: div(spend, impressions, 1000),
    meta_reported_leads: has ? dayRows.reduce<number | null>((a, d) => addN(a, d.leads), null) : null,
    site_leads: totalSite,
    cac: totalSite > 0 ? div(spend, totalSite) : null,
  };

  // ── durum metinleri ──
  const cur = currency ?? "(para birimi bilinmiyor)";
  const notes: string[] = [];
  if (!has) {
    notes.push(
      integration === "auth_error" ? "Meta token geçersiz ya da süresi dolmuş — yenilenmeli (E4). Harcama verisi yok; sayı uydurulmaz."
        : integration === "error" ? `Meta Insights son kontrolde hata verdi (${st?.detail ?? "-"}). Bu dönemde harcama verisi yok.`
          : integration === "active" || integration === "passive" ? "Meta bağlı; bu dönem için kayıt yok (eksik günler bilinmiyor, 0 sayılmadı)."
            : "Meta reklam hesabı bağlı değil (E4: META_ACCESS_TOKEN + META_AD_ACCOUNT_ID) — harcama verisi yok; sayı uydurulmaz.",
    );
  } else {
    if (dayRows.length < days) notes.push(`Meta verisi ${dayRows.length}/${days} günde var (eksik günler bilinmiyor, 0 sayılmadı).`);
    if (integration === "unconfigured" || integration === "auth_error" || integration === "error") notes.push("Meta şu an bağlı değil / hata veriyor; gösterilen önceden çekilmiş veridir.");
    if (mixed) notes.push(`Pencerede birden çok para birimi var (${currencies.join(", ")}) — harcama/CAC toplanmadı.`);
  }
  const truncatedDays = dayRows.filter((d) => d.truncated).length;
  if (truncatedDays) notes.push(`${truncatedDays} günde kampanya listesi sayfa sınırına takıldı (kampanya tablosu kısmi; gün toplamları da kısmi).`);

  let cacText: string;
  if (!has) cacText = integration === "unknown" || integration === "unconfigured" ? "Meta bağlı değil — harcama ve CAC hesaplanamaz." : "Bu dönemde Meta harcama verisi yok — CAC hesaplanamaz.";
  else if (mixed) cacText = "Birden çok para birimi — CAC toplanmadı.";
  else if (spend === 0) cacText = `Meta entegre ama pasif: son ${days} günde yayında kampanya yok (harcama 0).`;
  else if (totalSite === 0) cacText = `Son ${days} gün: ${spend!.toFixed(2)} ${cur} harcama · henüz Meta kaynaklı site lead'i yok → CAC hesaplanamaz.`;
  else {
    cacText = `Son ${days} gün: ${spend!.toFixed(2)} ${cur} harcama · ${totalSite} Meta kaynaklı site lead'i → CAC ${totals.cac!.toFixed(2)} ${cur}.`;
    const best = campaigns.filter((c) => c.cac !== null).sort((a, b) => a.cac! - b.cac! || b.site_leads - a.site_leads)[0];
    if (best) cacText += ` En düşük CAC: "${best.name}" (${best.cac!.toFixed(2)} ${cur}, ${best.site_leads} lead).`;
    if (unmatched) cacText += ` ${unmatched} lead kampanyaya eşlenemedi (reklam URL'sinde utm_campaign={{campaign.id}} önerilir).`;
  }

  return {
    contract: META_ADS_CONTRACT,
    generated_at: now.toISOString(),
    period: { from, to, days },
    data_status: {
      integration,
      checked_at: st?.checked_at ?? null,
      last_ok_at: st?.last_ok_at ?? null,
      detail: st?.detail ?? null,
      spend_days_with_data: dayRows.length,
      window_days: days,
      currency,
      mixed_currency: mixed,
      truncated_days: truncatedDays,
      lead_basis: "attribution_leads_v: utm_source ∈ meta kaynakları ∧ (ücretli utm_medium ∨ utm_campaign eşleşmesi); son tıklama 30 gün",
      campaign_match: "utm_campaign = campaign_id (önerilen: {{campaign.id}}) ∨ küçük harf kampanya adı",
      note: notes.length ? notes.join(" ") : null,
    },
    totals,
    campaigns: campaigns.slice(0, CAMPAIGN_LIMIT),
    unmatched_site_leads: unmatched,
    organic_meta_leads: organic,
    daily,
    cac_text: cacText,
  };
}

export class MetaAdsQueryError extends Error {
  constructor(public field: string) {
    super(`invalid_${field}`);
  }
}

/** ?days=1..90 doğrulanır (sınır dışı → MetaAdsQueryError); başka parametre yok sayılır. */
export function parseMetaAdsQuery(url: URL): MetaAdsQuery {
  const raw = url.searchParams.get("days");
  if (raw === null) return {};
  if (!/^\d{1,3}$/.test(raw)) throw new MetaAdsQueryError("days");
  const n = Number(raw);
  if (n < 1 || n > META_MAX_DAYS) throw new MetaAdsQueryError("days");
  return { days: n };
}
