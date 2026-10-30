// FAZ_6 6.2 — Analitik dashboard görünüm mantığı (saf, test edilir: view.test.mjs). Veri = `attribution.v1` (workers/api/src/attribution-contract.ts);
// alan adları OKUNUR, uydurulmaz. KURAL: null = bilinmiyor → "veri bekleniyor" (0 gösterilmez); sahte/varsayılan sayı üretilmez.
import type { AttributionDailyRow, AttributionReport } from "../../../workers/api/src/attribution-contract.ts";

export type { AttributionReport };

/** Görünüm süreleri — sözleşme sınırı 1–90 gün; varsayılan 90 (6.2: "90 gün görünüm"). */
export const PERIODS = [90, 30, 7] as const;
export type Period = (typeof PERIODS)[number];
export const DEFAULT_PERIOD: Period = 90;

/** Dil filtresi — sözleşme LOCALES'in ana dört dili ("" = tümü). Trend grafiği bu dört dili ayrı çizer. */
export const LOCALES = ["tr", "en", "de", "zh"] as const;
export type Locale = (typeof LOCALES)[number];
export const LOCALE_LABEL: Record<Locale | "", string> = { "": "Tüm diller", tr: "TR", en: "EN", de: "DE", zh: "ZH" };

export const WAITING = "veri bekleniyor";

export const isPeriod = (v: unknown): v is Period => (PERIODS as readonly unknown[]).includes(v);
export const isLocale = (v: unknown): v is Locale => (LOCALES as readonly unknown[]).includes(v);

/** GET yolu (admin API tabanına göre). Yalnız sözleşmenin tanıdığı parametreler; sınır dışı değer üretilmez. */
export function attributionPath(days: Period, locale: Locale | ""): string {
  const q = new URLSearchParams({ days: String(days) });
  if (locale) q.set("locale", locale);
  return `/analytics/attribution?${q}`;
}

/** URL hash'inden filtre durumu (#days=30&locale=de) — paylaşılabilir görünüm; geçersiz değer → varsayılan. */
export function parseHash(hash: string): { days: Period; locale: Locale | "" } {
  const q = new URLSearchParams(hash.replace(/^#/, ""));
  const d = Number(q.get("days"));
  const l = q.get("locale");
  return { days: isPeriod(d) ? d : DEFAULT_PERIOD, locale: isLocale(l) ? l : "" };
}
export const toHash = (days: Period, locale: Locale | "") => `#days=${days}${locale ? `&locale=${locale}` : ""}`;

const nf = new Intl.NumberFormat("tr-TR");
const pf = new Intl.NumberFormat("tr-TR", { style: "percent", maximumFractionDigits: 1 });
/** Sayı biçimi: null → "—" (bilinmiyor). 0 ancak sözleşme 0 verdiyse gösterilir. */
export const fmt = (n: number | null | undefined) => (typeof n === "number" ? nf.format(n) : "—");
export const pct = (r: number | null | undefined) => (typeof r === "number" ? pf.format(r) : "—");

/** Seride en az bir bilinen (null olmayan) değer var mı. */
export const hasAny = (xs: readonly (number | null)[]) => xs.some((x) => typeof x === "number");

/** Günlük trafik serisi — null'lar korunur (grafikte boşluk; 0'a çevrilmez). */
export function trafficSeries(daily: readonly AttributionDailyRow[]) {
  return {
    labels: daily.map((d) => d.day.slice(5)), // MM-DD
    sessions: daily.map((d) => d.sessions),
    clicks: daily.map((d) => d.gsc_clicks),
    impressions: daily.map((d) => d.gsc_impressions),
    leads: daily.map((d) => d.leads),
  };
}

/** Lead kaynağı etiketi: "google / organic"; (none) → "doğrudan (utm yok)". */
export const sourceLabel = (s: { source: string; medium: string }) =>
  s.source === "(none)" && s.medium === "(none)" ? "doğrudan (utm yok)" : `${s.source} / ${s.medium}`;

/**
 * Locale trend: her dil için ayrı rapordan (aynı dönem, locale filtresi) günlük seri. Etiketler ilk mevcut rapordan;
 * dillerin gün listesi aynı dönem olduğundan birebir hizalıdır. Rapor yoksa/yüklenmediyse o dil atlanır (uydurma yok).
 */
export function localeTrend(reports: Partial<Record<Locale, AttributionReport>>, metric: "sessions" | "leads") {
  const present = LOCALES.filter((l) => reports[l]);
  const base = present.length ? reports[present[0]]!.daily : [];
  const raw = present.map((l) => ({ locale: l, values: reports[l]!.daily.map((d) => (metric === "sessions" ? d.sessions : d.leads)) }));
  if (base.length <= WEEKLY_AFTER) return { labels: base.map((d) => d.day.slice(5)), series: raw, weekly: false };
  // >30 gün: 7 günlük kova (günlük lead seyrek → okunmaz sivri seri). Kova etiketi = ilk günü; tümü null kova null kalır.
  const starts = base.map((_, i) => i).filter((i) => i % 7 === 0);
  return {
    labels: starts.map((i) => base[i].day.slice(5)),
    series: raw.map((s) => ({ locale: s.locale, values: starts.map((i) => sumKnown(s.values.slice(i, i + 7))) })),
    weekly: true,
  };
}
export const WEEKLY_AFTER = 31;
/** Bilinen değerlerin toplamı; hiç bilinen yoksa null (uydurma 0 yok). */
export const sumKnown = (xs: readonly (number | null)[]) => (hasAny(xs) ? xs.reduce<number>((a, x) => a + (x ?? 0), 0) : null);

/** Bölüm durumu: "waiting" = veri kaynağı bağlı değil (null), "empty" = bağlı ama dönemde kayıt yok, "ok" = çizilebilir. */
export type SectionState = "waiting" | "empty" | "ok";
export function trafficState(r: AttributionReport): SectionState {
  if (r.data_status.traffic === "none") return "waiting";
  const s = trafficSeries(r.daily);
  return hasAny(s.sessions) || hasAny(s.clicks) || hasAny(s.impressions) ? "ok" : "empty";
}
export const sourcesState = (r: AttributionReport): SectionState => (r.totals.leads_in_period === 0 ? "empty" : "ok");
export function convertingState(r: AttributionReport): SectionState {
  if (r.data_status.traffic === "none") return "waiting";
  return r.top_converting.length ? "ok" : "empty";
}
export const localeState = (r: AttributionReport): SectionState =>
  r.by_locale.some((l) => l.leads > 0 || typeof l.sessions === "number") ? "ok" : r.data_status.traffic === "none" ? "waiting" : "empty";
