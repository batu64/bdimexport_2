// FAZ_6 6.2 — dashboard görünüm mantığı. Çalıştır: node --experimental-strip-types --test app/admin/analytics/view.test.mjs
// Girdi: attribution.v1 biçiminde minimal raporlar (sözleşme alan adları). Kural: null = bilinmiyor → "—"/waiting, asla 0'a çevrilmez.
import test from "node:test";
import assert from "node:assert/strict";
import {
  DEFAULT_PERIOD, attributionPath, convertingState, fmt, hasAny, localeState, localeTrend, parseHash, pct, sourceLabel, sourcesState,
  toHash, trafficSeries, trafficState,
} from "./view.ts";

const day = (d, o = {}) => ({ day: d, sessions: null, gsc_clicks: null, gsc_impressions: null, leads: 0, ...o });
const report = (o = {}) => ({
  contract: "attribution.v1",
  generated_at: "2026-10-30T12:00:00.000Z",
  period: { from: "2026-10-29", to: "2026-10-30", days: 2, attribution_window_days: 30, model: "last_click" },
  data_status: { traffic: "none", analytics_days_with_data: 0, search_data: false, form_start_tracking: false, traffic_basis: "ga4_top20_pages_per_day", leads_truncated: false, pages_truncated: false, note: "E4" },
  totals: { leads_in_period: 0, attributed: 0, direct: 0, direct_no_source: 0, direct_window_expired: 0, direct_invalid_touch: 0, sessions: null, gsc_clicks: null, gsc_impressions: null, form_starts: null },
  funnel: { stages: [{ id: "sessions", label: "Oturum", value: null }, { id: "form_start", label: "Form başladı", value: null }, { id: "submit", label: "Gönderildi", value: 0 }] },
  pages: [], top_converting: [], min_sessions: 100, sources: [], products: [],
  by_locale: ["tr", "en", "de", "zh"].map((l) => ({ locale: l, leads: 0, sessions: null })),
  daily: [day("2026-10-29"), day("2026-10-30")],
  ...o,
});

test("boş/E4 öncesi rapor: tüm bölümler waiting/empty; null → '—' (0 değil)", () => {
  const r = report();
  assert.equal(trafficState(r), "waiting");
  assert.equal(convertingState(r), "waiting");
  assert.equal(sourcesState(r), "empty");
  assert.equal(localeState(r), "waiting");
  assert.equal(fmt(null), "—");
  assert.equal(pct(null), "—");
  const s = trafficSeries(r.daily);
  assert.deepEqual(s.sessions, [null, null], "null korunur, 0'a çevrilmez");
  assert.equal(hasAny(s.sessions), false);
});

test("kısmi veri: bilinen günler çizilir, eksik gün null kalır", () => {
  const r = report({ data_status: { ...report().data_status, traffic: "partial", analytics_days_with_data: 1 }, daily: [day("2026-10-29"), day("2026-10-30", { sessions: 120, gsc_clicks: 8, gsc_impressions: 400, leads: 2 })] });
  assert.equal(trafficState(r), "ok");
  const s = trafficSeries(r.daily);
  assert.deepEqual(s.labels, ["10-29", "10-30"]);
  assert.deepEqual(s.sessions, [null, 120]);
  assert.deepEqual(s.leads, [0, 2]);
  assert.equal(fmt(0), "0", "sözleşme 0 verdiyse 0 gösterilir");
});

test("trafik bağlı ama dönemde satır yok → empty (waiting değil)", () => {
  assert.equal(trafficState(report({ data_status: { ...report().data_status, traffic: "partial" } })), "empty");
});

test("filtre: yol yalnız sözleşme parametreleri; hash ayrıştırma geçersiz değeri varsayılana çeker", () => {
  assert.equal(attributionPath(90, ""), "/analytics/attribution?days=90");
  assert.equal(attributionPath(30, "de"), "/analytics/attribution?days=30&locale=de");
  assert.deepEqual(parseHash("#days=7&locale=zh"), { days: 7, locale: "zh" });
  assert.deepEqual(parseHash("#days=365&locale=fr"), { days: DEFAULT_PERIOD, locale: "" });
  assert.deepEqual(parseHash(""), { days: 90, locale: "" });
  assert.equal(toHash(30, "tr"), "#days=30&locale=tr");
  assert.equal(toHash(90, ""), "#days=90");
});

test("locale trend: yalnız yüklenmiş dillerin serisi; hizalı etiketler; metrik seçimi", () => {
  const de = report({ daily: [day("2026-10-29", { sessions: 5, leads: 1 }), day("2026-10-30", { sessions: null, leads: 0 })] });
  const zh = report({ daily: [day("2026-10-29", { sessions: 2 }), day("2026-10-30", { sessions: 3, leads: 2 })] });
  const t = localeTrend({ de, zh }, "sessions");
  assert.deepEqual(t.labels, ["10-29", "10-30"]);
  assert.deepEqual(t.series.map((x) => x.locale), ["de", "zh"]);
  assert.deepEqual(t.series[0].values, [5, null]);
  assert.deepEqual(localeTrend({ de, zh }, "leads").series[1].values, [0, 2]);
  assert.deepEqual(localeTrend({}, "leads"), { labels: [], series: [], weekly: false });
});

test("locale trend >31 gün: haftalık kova; tümü null kova null kalır (0 değil)", () => {
  const days = Array.from({ length: 35 }, (_, i) => day(`2026-09-${String(i + 1).padStart(2, "0")}`.replace(/09-3[1-5]/, (m) => `10-0${Number(m.slice(3)) - 30}`), { sessions: i < 7 ? null : 1, leads: i % 2 }));
  const t = localeTrend({ tr: report({ daily: days }) }, "sessions");
  assert.equal(t.weekly, true);
  assert.equal(t.labels.length, 5);
  assert.deepEqual(t.series[0].values, [null, 7, 7, 7, 7]);
  assert.deepEqual(localeTrend({ tr: report({ daily: days }) }, "leads").series[0].values, [3, 4, 3, 4, 3]);
});

test("kaynak etiketi ve dönüşüm bölümü durumu", () => {
  assert.equal(sourceLabel({ source: "(none)", medium: "(none)" }), "doğrudan (utm yok)");
  assert.equal(sourceLabel({ source: "google", medium: "organic" }), "google / organic");
  const row = { rank: 1, page: "/en/x", locale: "en", product_slug: null, sessions: 200, gsc_clicks: null, gsc_impressions: null, form_starts: null, submits: 4, session_to_submit_rate: 0.02, session_to_start_rate: null, start_to_submit_rate: null, days_with_traffic: 3 };
  const ok = report({ data_status: { ...report().data_status, traffic: "ok" }, top_converting: [row], totals: { ...report().totals, leads_in_period: 4 } });
  assert.equal(convertingState(ok), "ok");
  assert.equal(sourcesState(ok), "ok");
  assert.equal(pct(0.02), "%2");
});
