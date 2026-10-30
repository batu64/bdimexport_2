// FAZ_6 6.1 — DÖNÜŞÜM ATIF MODELİ: leads (ANONİM görünüm) × analytics_daily (sayfa trafiği) → sayfa bazlı huni + sıralama.
// Sözleşme: ./attribution-contract.ts (6.2 dashboard'un okuyacağı alan adları). Şema: db/migrations/0006_attribution_views.sql (expand-only view'lar).
//
// ANONİM JOIN (KVKK, pazarlıksız): bu dosyadaki TÜM lead okumaları `attribution_leads_v` üzerinden yapılır; görünüm leads'ten id/payload/partner/kanal/rıza
// kolonlarını AÇMAZ → kullanıcı eşleştirmesi teknik olarak mümkün değil. Çıktı yalnız sayfa/locale/utm/ürün-slug AGREGATIDIR (satır-satır lead yok).
// MODEL: son tıklama, 30 gün. lead.source_page = son tıklamayla gelinen sayfa; utm_json.touch_at = o tıklamanın zamanı (yoksa tıklama = lead anı).
//   source_page boş → "direct"; touch_at > 30 gün önce → ATFEDİLMEZ (direct/window_expired); touch_at bozuk/gelecek → direct/invalid_touch.
// UYDURMA YOK: trafik/form-start verisi yoksa alan null'dır (0 değil). Hiçbir sayı sabit/tahmin değildir; hepsi D1 satırlarından hesaplanır.
import { ATTRIBUTION_CONTRACT } from "./attribution-contract";
import type { AttributionDailyRow, AttributionPageRow, AttributionQuery, AttributionReport, AttributionSourceRow } from "./attribution-contract";

export const WINDOW_DAYS = 30;
export const DEFAULT_DAYS = 30;
export const MAX_DAYS = 90;
export const DEFAULT_MIN_SESSIONS = 100;
const DAY_MS = 86_400_000;
const LEAD_LIMIT = 20_000;
const PAGE_LIMIT = 200;
const SOURCE_LIMIT = 10;
export const LOCALES = ["tr", "en", "de", "zh", "en-ru", "en-fr", "en-nl", "en-es", "en-ar"] as const;

/** TÜM SQL — yalnız görünümler + agregat analytics_daily. `leads` tablosuna DOĞRUDAN erişim YOK (test: SQL metinleri taranır). */
export const ATTRIBUTION_SQL = {
  leads: `SELECT created_at, locale, form_type, source_page, utm_source, utm_medium, utm_campaign, touch_at
          FROM attribution_leads_v WHERE created_at >= ? AND created_at < ? ORDER BY created_at DESC LIMIT 20001`, // = LEAD_LIMIT + 1 (şablon enterpolasyonu yok → SQL enjeksiyon taraması temiz; testte tutarlılık doğrulanır)
  traffic: "SELECT day, page, sessions FROM attribution_page_traffic_v WHERE day >= ? AND day <= ?",
  search: "SELECT day, page, clicks, impressions FROM attribution_page_search_v WHERE day >= ? AND day <= ?",
  formStarts: "SELECT day, page, form_starts FROM attribution_page_formstart_v WHERE day >= ? AND day <= ?",
  daily: "SELECT day, ga4_json, gsc_json FROM analytics_daily WHERE locale = 'all' AND day >= ? AND day <= ?",
} as const;

// ───────────────────────── saf yardımcılar (test edilir) ─────────────────────────
/** Sayfa anahtarı: host/sorgu/hash atılır, küçük harf, çift "/" tek, sondaki "/" atılır (kök hariç). Geçersiz/boş → null. */
export function normalizePage(raw: unknown): string | null {
  if (typeof raw !== "string") return null;
  let s = raw.trim();
  if (!s || s.toLowerCase() === "direct" || s.length > 300) return null;
  // eslint-disable-next-line no-control-regex
  if (/[\u0000-\u001f\u007f\s]/.test(s)) return null;
  s = s.replace(/^https?:\/\/[^/?#]+/i, "").split("#")[0].split("?")[0];
  if (!s.startsWith("/")) return null;
  s = s.replace(/\/{2,}/g, "/").toLowerCase();
  if (s.length > 1) s = s.replace(/\/+$/, "");
  return s || "/";
}

/** Sayfa yolundan locale: /en/{ru|fr|nl|es|ar}… → en-xx; /en → en; /de → de; /zh → zh; diğer her şey (kök, /ithalat, /ihracat…) → tr. */
export function pageLocale(path: string): string {
  const seg = path.split("/").filter(Boolean);
  if (seg[0] === "en") return ["ru", "fr", "nl", "es", "ar"].includes(seg[1] ?? "") ? `en-${seg[1]}` : "en";
  if (seg[0] === "de") return "de";
  if (seg[0] === "zh") return "zh";
  return "tr";
}

export function productSlug(path: string): string | null {
  const m = path.match(/^\/en\/products\/([a-z0-9-]+)$/);
  return m && m[1] !== "category" ? m[1] : null;
}

/** UTM değeri kullanıcı/URL kontrollüdür → dar karakter kümesi + uzunluk; yoksa "(none)", geçersizse "(other)". */
export function utmToken(v: unknown): string {
  if (v === null || v === undefined || (typeof v === "string" && v.trim() === "")) return "(none)";
  if (typeof v !== "string") return "(other)";
  const t = v.trim().toLowerCase();
  return /^[a-z0-9][a-z0-9_.-]{0,38}$/.test(t) ? t : "(other)";
}

/** 'YYYY-MM-DD HH:MM:SS' (D1, UTC) veya ISO-8601 → epoch ms; geçersiz → null. */
export function parseTs(v: unknown): number | null {
  if (typeof v !== "string") return null;
  const s = v.trim();
  if (/^\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2}$/.test(s)) {
    const t = Date.parse(s.replace(" ", "T") + "Z");
    return Number.isNaN(t) ? null : t;
  }
  if (/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}(:\d{2}(\.\d{1,3})?)?(Z|[+-]\d{2}:\d{2})$/.test(s)) {
    const t = Date.parse(s);
    return Number.isNaN(t) ? null : t;
  }
  return null;
}

export type DirectReason = "no_source" | "window_expired" | "invalid_touch";
export type Attribution = { kind: "attributed"; page: string } | { kind: "direct"; reason: DirectReason };

/** TEK lead için atıf kararı (son tıklama, 30 gün). Pencere SINIRI DAHİL: tam 30 gün = atfedilir, 30 gün + 1 ms = atfedilmez. */
export function attributeLead(lead: { created_at: string; source_page: string | null; touch_at?: unknown }): Attribution {
  const page = normalizePage(lead.source_page);
  if (!page) return { kind: "direct", reason: "no_source" };
  const created = parseTs(lead.created_at);
  if (created === null) return { kind: "direct", reason: "invalid_touch" };
  let touch = created; // touch_at yoksa son tıklama = lead anı (aynı oturum)
  if (lead.touch_at !== null && lead.touch_at !== undefined && lead.touch_at !== "") {
    const t = parseTs(lead.touch_at);
    if (t === null || t > created + DAY_MS) return { kind: "direct", reason: "invalid_touch" }; // bozuk ya da gelecek (1 gün saat sapması toleransı)
    touch = Math.min(t, created);
  }
  if (created - touch > WINDOW_DAYS * DAY_MS) return { kind: "direct", reason: "window_expired" };
  return { kind: "attributed", page };
}

/**
 * YAZMA SÖZLEŞMESİ yardımcısı (lead yazıcısı — /v1/leads, ERTELENEN C1 — bunu kullanmalı): ham UTM/dokunuş verisini `leads.utm_json` için temizler.
 * Yalnız utm_source/medium/campaign/touch_at saklanır (kimlik/IP/cihaz izi YOK). touch_at: ISO, [şimdi-90g, şimdi+1g] dışıysa atılır.
 */
export function sanitizeTouch(input: Record<string, unknown>, now = Date.now()): string | null {
  const out: Record<string, string> = {};
  for (const k of ["utm_source", "utm_medium"] as const) {
    const t = utmToken(input[k]);
    if (t !== "(none)" && t !== "(other)") out[k] = t;
  }
  const c = input.utm_campaign;
  if (typeof c === "string" && /^[A-Za-z0-9][A-Za-z0-9_.\- ]{0,79}$/.test(c.trim())) out.utm_campaign = c.trim().toLowerCase();
  const ts = parseTs(input.touch_at);
  if (ts !== null && ts >= now - 90 * DAY_MS && ts <= now + DAY_MS) out.touch_at = new Date(ts).toISOString();
  return Object.keys(out).length ? JSON.stringify(out) : null;
}

const rate = (num: number | null, den: number | null): number | null => (num === null || den === null || den <= 0 ? null : Math.round((num / den) * 10_000) / 10_000);
const dayOf = (ms: number) => new Date(ms).toISOString().slice(0, 10);
const sqlTs = (ms: number) => new Date(ms).toISOString().slice(0, 19).replace("T", " ");
const asInt = (v: unknown): number | null => (typeof v === "number" && Number.isFinite(v) ? Math.max(0, Math.trunc(v)) : null);
function parseObj(s: unknown): Record<string, unknown> {
  if (typeof s !== "string") return {};
  try {
    const o = JSON.parse(s);
    return o && typeof o === "object" && !Array.isArray(o) ? (o as Record<string, unknown>) : {};
  } catch {
    return {};
  }
}

// ───────────────────────── rapor ─────────────────────────
type Db = { prepare(sql: string): { bind(...a: unknown[]): { all<T>(): Promise<{ results?: T[] }> } } };

interface Acc { sessions: number | null; clicks: number | null; impressions: number | null; formStarts: number | null; submits: number; days: Set<string> }
const addN = (a: number | null, b: number | null) => (b === null ? a : (a ?? 0) + b);

export async function computeAttribution(db: Db, q: AttributionQuery = {}, now = new Date()): Promise<AttributionReport> {
  const days = Math.min(MAX_DAYS, Math.max(1, Math.trunc(q.days ?? DEFAULT_DAYS)));
  const minSessions = Math.max(0, Math.trunc(q.min_sessions ?? DEFAULT_MIN_SESSIONS));
  const loc = q.locale && (LOCALES as readonly string[]).includes(q.locale) ? q.locale : null;
  const toMs = Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate());
  const fromMs = toMs - (days - 1) * DAY_MS;
  const from = dayOf(fromMs), to = dayOf(toMs);
  const dayList = Array.from({ length: days }, (_x, i) => dayOf(fromMs + i * DAY_MS));

  const run = async <T>(sql: string, ...args: unknown[]) => ((await db.prepare(sql).bind(...args).all<T>()).results ?? []) as T[];
  const [leadRows, traffic, search, starts, dailyRaw] = await Promise.all([
    run<{ created_at: string; locale: string; form_type: string; source_page: string | null; utm_source: unknown; utm_medium: unknown; utm_campaign: unknown; touch_at: unknown }>(ATTRIBUTION_SQL.leads, sqlTs(fromMs), sqlTs(toMs + DAY_MS)),
    run<{ day: string; page: string; sessions: number | null }>(ATTRIBUTION_SQL.traffic, from, to),
    run<{ day: string; page: string; clicks: number | null; impressions: number | null }>(ATTRIBUTION_SQL.search, from, to),
    run<{ day: string; page: string; form_starts: number | null }>(ATTRIBUTION_SQL.formStarts, from, to),
    run<{ day: string; ga4_json: string | null; gsc_json: string | null }>(ATTRIBUTION_SQL.daily, from, to),
  ]);

  const truncated = leadRows.length > LEAD_LIMIT;
  const leads = (truncated ? leadRows.slice(0, LEAD_LIMIT) : leadRows).filter((l) => !loc || l.locale === loc);

  // ── sayfa birikimleri (anahtar = normalize sayfa) ──
  const pages = new Map<string, Acc>();
  const acc = (p: string): Acc => {
    let a = pages.get(p);
    if (!a) pages.set(p, (a = { sessions: null, clicks: null, impressions: null, formStarts: null, submits: 0, days: new Set() }));
    return a;
  };
  const inLoc = (p: string) => !loc || pageLocale(p) === loc;
  const trafficByDay = new Map<string, number>(); // dönem günü → sayfa oturumları toplamı (locale filtresine uyan)
  for (const r of traffic) {
    const p = normalizePage(r.page);
    const s = asInt(r.sessions);
    if (!p || s === null || !inLoc(p)) continue;
    const a = acc(p);
    a.sessions = addN(a.sessions, s);
    a.days.add(r.day);
    trafficByDay.set(r.day, (trafficByDay.get(r.day) ?? 0) + s);
  }
  const searchByDay = new Map<string, { c: number; i: number }>();
  for (const r of search) {
    const p = normalizePage(r.page);
    if (!p || !inLoc(p)) continue;
    const a = acc(p);
    const c = asInt(r.clicks), i = asInt(r.impressions);
    a.clicks = addN(a.clicks, c);
    a.impressions = addN(a.impressions, i);
    const d = searchByDay.get(r.day) ?? { c: 0, i: 0 };
    searchByDay.set(r.day, { c: d.c + (c ?? 0), i: d.i + (i ?? 0) });
  }
  let formStartRows = 0;
  for (const r of starts) {
    const p = normalizePage(r.page);
    const n = asInt(r.form_starts);
    if (!p || n === null || !inLoc(p)) continue;
    formStartRows++;
    acc(p).formStarts = addN(acc(p).formStarts, n);
  }

  // ── lead atfı (ANONİM: yalnız görünümün açtığı kolonlar) ──
  const totals = { attributed: 0, direct_no_source: 0, direct_window_expired: 0, direct_invalid_touch: 0 };
  const srcCount = new Map<string, number>();
  const prodCount = new Map<string, number>();
  const localeLeads = new Map<string, number>();
  const leadsByDay = new Map<string, number>();
  for (const l of leads) {
    const at = attributeLead(l);
    if (at.kind === "attributed") {
      totals.attributed++;
      acc(at.page).submits++;
      const slug = productSlug(at.page);
      if (slug) prodCount.set(slug, (prodCount.get(slug) ?? 0) + 1);
    } else if (at.reason === "no_source") totals.direct_no_source++;
    else if (at.reason === "window_expired") totals.direct_window_expired++;
    else totals.direct_invalid_touch++;
    const key = `${utmToken(l.utm_source)}\u0000${utmToken(l.utm_medium)}`;
    srcCount.set(key, (srcCount.get(key) ?? 0) + 1);
    const lc = (LOCALES as readonly string[]).includes(l.locale) ? l.locale : "other";
    localeLeads.set(lc, (localeLeads.get(lc) ?? 0) + 1);
    const d = (l.created_at ?? "").slice(0, 10);
    leadsByDay.set(d, (leadsByDay.get(d) ?? 0) + 1);
  }
  const direct = totals.direct_no_source + totals.direct_window_expired + totals.direct_invalid_touch;

  // ── günlük seri ──
  const rawByDay = new Map(dailyRaw.map((r) => [r.day, r]));
  const daysWithData = dayList.filter((d) => {
    const r = rawByDay.get(d);
    return !!r && (r.ga4_json !== null || r.gsc_json !== null);
  }).length;
  const daily: AttributionDailyRow[] = dayList.map((d) => {
    const raw = rawByDay.get(d);
    const ga4 = parseObj(raw?.ga4_json), gsc = parseObj(raw?.gsc_json);
    const hasTraffic = trafficByDay.has(d);
    // locale filtresiyle üst-düzey toplamlar kullanılamaz (locale'e bölünmez) → sayfa satırı toplamı; filtresiz: üst-düzey, yoksa sayfa toplamı
    const sessions = loc ? (hasTraffic ? trafficByDay.get(d)! : null) : asInt(ga4.sessions) ?? (hasTraffic ? trafficByDay.get(d)! : null);
    const sd = searchByDay.get(d);
    return {
      day: d,
      sessions,
      gsc_clicks: loc ? (sd ? sd.c : null) : asInt(gsc.clicks) ?? (sd ? sd.c : null),
      gsc_impressions: loc ? (sd ? sd.i : null) : asInt(gsc.impressions) ?? (sd ? sd.i : null),
      leads: leadsByDay.get(d) ?? 0,
    };
  });
  const sum = (f: (r: AttributionDailyRow) => number | null) => daily.reduce<number | null>((a, r) => addN(a, f(r)), null);
  const totSessions = sum((r) => r.sessions), totClicks = sum((r) => r.gsc_clicks), totImpr = sum((r) => r.gsc_impressions);
  const totStarts = formStartRows > 0 ? [...pages.values()].reduce<number | null>((a, p) => addN(a, p.formStarts), null) : null;

  // ── sayfa satırları + sıralama ──
  const rows: Omit<AttributionPageRow, "rank">[] = [...pages].map(([page, a]) => ({
    page,
    locale: pageLocale(page),
    product_slug: productSlug(page),
    sessions: a.sessions,
    gsc_clicks: a.clicks,
    gsc_impressions: a.impressions,
    form_starts: a.formStarts,
    submits: a.submits,
    session_to_submit_rate: rate(a.submits, a.sessions),
    session_to_start_rate: rate(a.formStarts, a.sessions),
    start_to_submit_rate: rate(a.submits, a.formStarts),
    days_with_traffic: a.days.size,
  }));
  rows.sort((x, y) => y.submits - x.submits || (y.sessions ?? -1) - (x.sessions ?? -1) || (x.page < y.page ? -1 : 1));
  const ranked: AttributionPageRow[] = rows.map((r, i) => ({ rank: i + 1, ...r }));
  const topConverting = ranked
    .filter((r) => (r.sessions ?? 0) >= Math.max(1, minSessions) && r.session_to_submit_rate !== null)
    .sort((x, y) => (y.session_to_submit_rate ?? 0) - (x.session_to_submit_rate ?? 0) || y.submits - x.submits || (x.page < y.page ? -1 : 1))
    .slice(0, 10);

  // ── kaynak dağılımı (en çok 10 + "(other)") ──
  const srcRows = [...srcCount].map(([k, n]) => ({ source: k.split("\u0000")[0], medium: k.split("\u0000")[1], leads: n }));
  srcRows.sort((a, b) => b.leads - a.leads || (a.source + a.medium < b.source + b.medium ? -1 : 1));
  const head = srcRows.slice(0, SOURCE_LIMIT);
  const tail = srcRows.slice(SOURCE_LIMIT);
  if (tail.length) {
    const other = head.find((r) => r.source === "(other)" && r.medium === "(other)");
    const n = tail.reduce((a, r) => a + r.leads, 0);
    if (other) other.leads += n;
    else head.push({ source: "(other)", medium: "(other)", leads: n });
  }
  const sources: AttributionSourceRow[] = head.map((r) => ({ ...r, share: leads.length ? Math.round((r.leads / leads.length) * 10_000) / 10_000 : 0 }));

  // ── locale kırılımı: sayfa-yolu locale'i ile oturum; lead.locale ile lead ──
  const sessByLocale = new Map<string, number>();
  for (const [p, a] of pages) if (a.sessions !== null) sessByLocale.set(pageLocale(p), (sessByLocale.get(pageLocale(p)) ?? 0) + a.sessions);
  const byLocale = (LOCALES as readonly string[]).filter((l) => !loc || l === loc).map((l) => ({ locale: l, leads: localeLeads.get(l) ?? 0, sessions: sessByLocale.get(l) ?? null }));

  const trafficStatus = daysWithData === 0 ? "none" : daysWithData === days ? "ok" : "partial";
  const notes: string[] = [];
  if (trafficStatus === "none") notes.push("GA4/GSC verisi henüz bağlı değil (E4) — trafik sayıları BİLİNMİYOR (0 değil).");
  else if (trafficStatus === "partial") notes.push(`Dönemin ${daysWithData}/${days} günü için analitik verisi var.`);
  if (formStartRows === 0) notes.push("Form-başladı olayı henüz bağlı değil — o huni aşaması veri bekliyor.");

  return {
    contract: ATTRIBUTION_CONTRACT,
    generated_at: now.toISOString(),
    period: { from, to, days, attribution_window_days: 30, model: "last_click" },
    data_status: {
      traffic: trafficStatus,
      analytics_days_with_data: daysWithData,
      search_data: search.length > 0,
      form_start_tracking: formStartRows > 0,
      traffic_basis: "ga4_top20_pages_per_day",
      leads_truncated: truncated,
      pages_truncated: ranked.length > PAGE_LIMIT,
      note: notes.length ? notes.join(" ") : null,
    },
    totals: {
      leads_in_period: leads.length,
      attributed: totals.attributed,
      direct,
      direct_no_source: totals.direct_no_source,
      direct_window_expired: totals.direct_window_expired,
      direct_invalid_touch: totals.direct_invalid_touch,
      sessions: totSessions,
      gsc_clicks: totClicks,
      gsc_impressions: totImpr,
      form_starts: totStarts,
    },
    funnel: {
      stages: [
        { id: "sessions", label: "Oturum (GA4)", value: totSessions },
        { id: "form_start", label: "Form başladı", value: totStarts },
        { id: "submit", label: "Form gönderildi (lead)", value: leads.length },
      ],
    },
    pages: ranked.slice(0, PAGE_LIMIT),
    top_converting: topConverting,
    min_sessions: minSessions,
    sources,
    products: [...prodCount].map(([product_slug, n]) => ({ product_slug, leads: n })).sort((a, b) => b.leads - a.leads || (a.product_slug < b.product_slug ? -1 : 1)),
    by_locale: byLocale,
    daily,
  };
}

export class AttributionQueryError extends Error {
  constructor(public field: string) {
    super(`invalid_${field}`);
  }
}

/** URL parametrelerini doğrular (sınır dışı → AttributionQueryError). */
export function parseAttributionQuery(url: URL): AttributionQuery {
  const q: AttributionQuery = {};
  const int = (name: string, lo: number, hi: number) => {
    const raw = url.searchParams.get(name);
    if (raw === null) return undefined;
    if (!/^\d{1,6}$/.test(raw)) throw new AttributionQueryError(name);
    const n = Number(raw);
    if (n < lo || n > hi) throw new AttributionQueryError(name);
    return n;
  };
  q.days = int("days", 1, MAX_DAYS);
  q.min_sessions = int("min_sessions", 0, 100_000);
  const l = url.searchParams.get("locale");
  if (l !== null) {
    if (!(LOCALES as readonly string[]).includes(l)) throw new AttributionQueryError("locale");
    q.locale = l;
  }
  return q;
}
