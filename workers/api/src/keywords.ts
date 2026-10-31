// FAZ_6 6.3 — KEYWORD MOTORU: GSC sorgu × sayfa (gsc_query_v, migration 0007) → deterministik fırsat skoru (keyword-score.ts) → D1 anlık görüntü
// (keyword_opportunities) + opsiyonel AI içgörüsü (keyword-insights.ts — Gemini STUB, E3). Okuma: GET /admin/api/analytics/keywords (keywords.v1).
// Çalıştıran: cron-analytics (günlük sync'ten SONRA). Sayfada canlı API çağrısı yok — UI yalnız bu tabloyu okur.
// UYDURMA YOK: GSC sorgu verisi yoksa anlık görüntüye DOKUNULMAZ (silinmez/yazılmaz) ve rapor null + data_status "none" döner.
import { LOCALES } from "./attribution";
import { KEYWORDS_CONTRACT, KEYWORD_SCORE_VERSION, type KeywordBand, type KeywordInsightsStatus, type KeywordOpportunityRow, type KeywordQuery, type KeywordReport } from "./keyword-contract";
import { scoreOpportunities, type GscQueryRow, type ScoreOptions, type ScoredOpportunity } from "./keyword-score";
import { directRunner, generateKeywordInsights, MAX_INSIGHT_ITEMS, type KeywordInsightsConfig, type QuotaRunner } from "./keyword-insights";

export const KEYWORD_WINDOW_DAYS = 28; // GSC'nin standart karşılaştırma penceresi
export const DEFAULT_LIMIT = 50;
export const MAX_LIMIT = 200;
export const STALE_MS = 48 * 3_600_000;
const DAY_MS = 86_400_000;
const BANDS: readonly KeywordBand[] = ["near", "snippet", "top", "long_shot"];

/** TÜM SQL (şablon enterpolasyonu yok — sqli statik taraması temiz). */
export const KEYWORD_SQL = {
  queryRows: "SELECT day, query, page, clicks, impressions, ctr, position FROM gsc_query_v WHERE day >= ? AND day <= ?",
  queryDays: "SELECT COUNT(DISTINCT day) AS n FROM gsc_query_v WHERE day >= ? AND day <= ?",
  keywords: "SELECT id, phrase, locale FROM keywords",
  pipeline: "SELECT status, COUNT(*) AS n FROM keywords GROUP BY status",
  wipe: "DELETE FROM keyword_opportunities",
  insert:
    "INSERT INTO keyword_opportunities (query, locale, page, pages_count, impressions, clicks, ctr, position, ref_ctr, score, band, action, reason, score_version, " +
    "window_from, window_to, days_with_data, keyword_id, insights_status, insight_intent, insight_cluster, insight_suggestion, insight_model, computed_at) " +
    "VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)",
  snapshot:
    "SELECT query, locale, page, pages_count, impressions, clicks, ctr, position, ref_ctr, score, band, action, reason, keyword_id, insights_status, " +
    "insight_intent, insight_cluster, insight_suggestion, insight_model, window_from, window_to, computed_at FROM keyword_opportunities " +
    "ORDER BY score DESC, impressions DESC, query ASC, locale ASC",
} as const;

type Stmt = { bind(...a: unknown[]): Stmt; all<T>(): Promise<{ results?: T[] }>; first<T>(): Promise<T | null>; run(): Promise<unknown> };
export type KeywordDb = { prepare(sql: string): Stmt; batch(s: Stmt[]): Promise<unknown> };

const dayOf = (ms: number) => new Date(ms).toISOString().slice(0, 10);
const sqlTs = (ms: number) => new Date(ms).toISOString().slice(0, 19).replace("T", " ");
const utcMidnight = (d: Date) => Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate());

/** Pencere: dünden geriye `days` gün (GSC verisi ~2 gün gecikmeli; bugün daima eksik). */
export function keywordWindow(now: Date, days = KEYWORD_WINDOW_DAYS) {
  const toMs = utcMidnight(now) - DAY_MS;
  return { from: dayOf(toMs - (days - 1) * DAY_MS), to: dayOf(toMs), days };
}

export interface RefreshResult {
  status: "no_data" | "written";
  rows: number;
  window: { from: string; to: string; days: number };
  insights: KeywordInsightsStatus;
}

/**
 * Anlık görüntüyü yeniden üretir. Sorgu verisi yoksa NO-OP (mevcut görüntü korunur, sahte boşaltma yok).
 * Veri varsa TEK batch: DELETE + INSERT (atomik). AI içgörüsü başarısız olsa da skor yazılır (insights_status ile işaretli).
 */
export async function refreshKeywordOpportunities(
  db: KeywordDb, now: Date, cfg: KeywordInsightsConfig = {}, runner: QuotaRunner = directRunner, opts: ScoreOptions & { windowDays?: number } = {},
): Promise<RefreshResult> {
  const window = keywordWindow(now, opts.windowDays);
  const rows = (await db.prepare(KEYWORD_SQL.queryRows).bind(window.from, window.to).all<GscQueryRow>()).results ?? [];
  if (!rows.length) return { status: "no_data", rows: 0, window, insights: "off" };

  const scored = scoreOpportunities(rows, opts);
  const kw = (await db.prepare(KEYWORD_SQL.keywords).bind().all<{ id: string; phrase: string; locale: string | null }>()).results ?? [];
  const kwId = (o: ScoredOpportunity) => kw.find((k) => k.phrase.trim().toLowerCase() === o.query && (k.locale === null || k.locale === o.locale))?.id ?? null;

  // AI yalnız iş üretecek bantlara (near/snippet/long_shot) — skor sırasıyla ilk MAX_INSIGHT_ITEMS
  const forAi = scored.filter((o) => o.action !== "monitor");
  const ai = await generateKeywordInsights(cfg, forAi.map((o) => ({ query: o.query, locale: o.locale, position: o.position, impressions: o.impressions, band: o.band })), runner);
  const byKey = new Map(ai.insights.map((i) => [`${i.locale}\u0000${i.query}`, i]));
  const sent = new Set(forAi.slice(0, MAX_INSIGHT_ITEMS).map((o) => `${o.locale}\u0000${o.query}`));

  const at = sqlTs(now.getTime());
  const ins = scored.map((o) => {
    const k = `${o.locale}\u0000${o.query}`;
    const i = byKey.get(k);
    const status: KeywordInsightsStatus = ai.status === "off" ? "off" : sent.has(k) ? ai.status : "skipped";
    return db.prepare(KEYWORD_SQL.insert).bind(
      o.query, o.locale, o.page, o.pages_count, o.impressions, o.clicks, o.ctr, o.position, o.ref_ctr, o.score, o.band, o.action, o.reason, KEYWORD_SCORE_VERSION,
      window.from, window.to, o.days_with_data, kwId(o), status,
      status === "ok" ? (i?.intent ?? null) : null, status === "ok" ? (i?.cluster ?? null) : null, status === "ok" ? (i?.suggestion ?? null) : null,
      status === "ok" || status === "stub" ? ai.model : null, at,
    );
  });
  await db.batch([db.prepare(KEYWORD_SQL.wipe).bind(), ...ins]);
  return { status: "written", rows: scored.length, window, insights: ai.status };
}

// ───────────────────────── okuma (admin uç) ─────────────────────────
interface SnapRow {
  query: string; locale: string; page: string; pages_count: number; impressions: number; clicks: number; ctr: number; position: number; ref_ctr: number | null;
  score: number; band: KeywordBand; action: KeywordOpportunityRow["action"]; reason: string; keyword_id: string | null; insights_status: KeywordInsightsStatus;
  insight_intent: KeywordOpportunityRow["insights"]["intent"]; insight_cluster: string | null; insight_suggestion: string | null; insight_model: string | null;
  window_from: string; window_to: string; computed_at: string;
}

const tsMs = (s: string) => Date.parse(s.replace(" ", "T") + "Z");

export async function computeKeywordReport(db: KeywordDb, q: KeywordQuery = {}, now = new Date()): Promise<KeywordReport> {
  const limit = Math.min(MAX_LIMIT, Math.max(1, Math.trunc(q.limit ?? DEFAULT_LIMIT)));
  const w = keywordWindow(now);
  const [snap, days, pipe] = await Promise.all([
    db.prepare(KEYWORD_SQL.snapshot).bind().all<SnapRow>().then((r) => r.results ?? []),
    db.prepare(KEYWORD_SQL.queryDays).bind(w.from, w.to).first<{ n: number }>(),
    db.prepare(KEYWORD_SQL.pipeline).bind().all<{ status: string; n: number }>().then((r) => r.results ?? []),
  ]);
  const qDays = days?.n ?? 0;
  const computedAt = snap.reduce<string | null>((m, r) => (m === null || r.computed_at > m ? r.computed_at : m), null);
  const stale = computedAt !== null && now.getTime() - tsMs(computedAt) > STALE_MS;

  const rows = snap.filter((r) => (!q.locale || r.locale === q.locale) && (!q.band || r.band === q.band));
  const statusCount = new Map<KeywordInsightsStatus, number>();
  for (const r of rows) statusCount.set(r.insights_status, (statusCount.get(r.insights_status) ?? 0) + 1);
  const insights = rows.length ? [...statusCount].sort((a, b) => b[1] - a[1] || (a[0] < b[0] ? -1 : 1))[0][0] : null;

  const locMap = new Map<string, { opportunities: number; near: number; impressions: number }>();
  for (const r of rows) {
    const l = locMap.get(r.locale) ?? { opportunities: 0, near: 0, impressions: 0 };
    l.opportunities++;
    if (r.band === "near") l.near++;
    l.impressions += r.impressions;
    locMap.set(r.locale, l);
  }
  const count = (f: (r: SnapRow) => boolean) => rows.filter(f).length;
  const sum = (f: (r: SnapRow) => number) => (rows.length ? rows.reduce((a, r) => a + f(r), 0) : null);
  const pc = (s: string) => pipe.find((p) => p.status === s)?.n ?? 0;

  const note =
    qDays === 0 && !snap.length
      ? "GSC sorgu verisi henüz yok (E4: Search Console OAuth bağlanınca cron-analytics günlük sorgu×sayfa satırlarını yazar; motor ertesi çalışmada skorlar)."
      : qDays === 0
        ? "Son pencerede yeni GSC sorgu verisi yok — gösterilen anlık görüntü eski veriden."
        : stale
          ? "Anlık görüntü 48 saatten eski — cron-analytics çalışmıyor olabilir."
          : null;

  return {
    contract: KEYWORDS_CONTRACT,
    generated_at: now.toISOString(),
    score_version: KEYWORD_SCORE_VERSION,
    window: snap.length ? { from: snap[0].window_from, to: snap[0].window_to, days: Math.round((Date.parse(snap[0].window_to) - Date.parse(snap[0].window_from)) / DAY_MS) + 1 } : null,
    data_status: {
      query_data: qDays === 0 ? "none" : qDays < w.days ? "partial" : "ok",
      query_days_with_data: qDays,
      window_days: w.days,
      computed_at: computedAt,
      stale,
      insights,
      query_basis: "gsc_query_page_top_n_per_day",
      note,
    },
    totals: {
      opportunities: rows.length,
      near: count((r) => r.band === "near"),
      snippet: count((r) => r.band === "snippet"),
      new_page: count((r) => r.action === "new_page"),
      impressions: sum((r) => r.impressions),
      clicks: sum((r) => r.clicks),
    },
    by_band: BANDS.map((band) => ({ band, count: count((r) => r.band === band) })),
    by_locale: [...locMap].map(([locale, v]) => ({ locale, ...v })).sort((a, b) => b.opportunities - a.opportunities || (a.locale < b.locale ? -1 : 1)),
    pipeline: { queued: pc("queued"), analyzed: pc("analyzed"), job_created: pc("job_created"), done: pc("done") },
    items: rows.slice(0, limit).map((r, i) => ({
      rank: i + 1, query: r.query, locale: r.locale, page: r.page, pages_count: r.pages_count, impressions: r.impressions, clicks: r.clicks,
      ctr: r.ctr, position: r.position, ref_ctr: r.ref_ctr, score: r.score, band: r.band, action: r.action, reason: r.reason, keyword_id: r.keyword_id,
      insights: { status: r.insights_status, intent: r.insight_intent, cluster: r.insight_cluster, suggestion: r.insight_suggestion, model: r.insight_model },
    })),
    limit,
  };
}

export class KeywordQueryError extends Error {
  constructor(public field: string) {
    super(`invalid_${field}`);
  }
}

/** URL parametreleri: locale (attribution LOCALES), band, limit 1..200. Sınır dışı → KeywordQueryError. */
export function parseKeywordQuery(url: URL): KeywordQuery {
  const q: KeywordQuery = {};
  const l = url.searchParams.get("locale");
  if (l !== null) {
    if (!(LOCALES as readonly string[]).includes(l)) throw new KeywordQueryError("locale");
    q.locale = l;
  }
  const b = url.searchParams.get("band");
  if (b !== null) {
    if (!(BANDS as readonly string[]).includes(b)) throw new KeywordQueryError("band");
    q.band = b as KeywordBand;
  }
  const lim = url.searchParams.get("limit");
  if (lim !== null) {
    if (!/^\d{1,3}$/.test(lim) || Number(lim) < 1 || Number(lim) > MAX_LIMIT) throw new KeywordQueryError("limit");
    q.limit = Number(lim);
  }
  return q;
}
