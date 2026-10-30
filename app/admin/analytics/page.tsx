"use client";
// Analitik Hub (FAZ_3 3.7 → FAZ_6 6.2) — SALT OKUNUR; admin-only (menü/yol kapısı: ../_lib/nav.ts; sunucu: viewer→403).
// Veri: GET /analytics/attribution (attribution.v1 — workers/api/src/attribution-contract.ts; D1 analytics_daily + 0006 view'ları; sayfada canlı
// GSC/GA4/Meta çağrısı YOK) + GET /analytics/summary (Meta harcaması + ham analytics_daily). 90/30/7 gün + dil filtresi (#days=&locale= paylaşılabilir).
// UYDURMA YOK: null = "veri bekleniyor" (E4 canlı veri gelene dek). Grafik mantığı: ./view.ts (test: view.test.mjs).
import { useEffect, useMemo, useState } from "react";
import { useAdminGet, type AnalyticsHubData } from "../_lib/api";
import styles from "../admin.module.css";
import { color, localeColor } from "@/lib/ui/tokens";
import Chart, { PALETTE } from "./Chart";
import {
  LOCALES, LOCALE_LABEL, PERIODS, WAITING, attributionPath, convertingState, fmt, localeTrend, parseHash, pct, sourceLabel,
  sourcesState, toHash, trafficSeries, trafficState, type AttributionReport, type Locale, type Period, type SectionState,
} from "./view";

/** Dil trend çizgileri: renk + çizgi deseni (renk tek başına ayırt edici değil). */
const LOCALE_STYLE: Record<Locale, { color: string; dash?: number[] }> = {
  tr: { color: color.accentOnDark },
  en: { color: color.highlight },
  de: { color: color.bg, dash: [6, 4] },
  zh: { color: localeColor.zh.highlight, dash: [2, 3] },
};

function Status({ state, text }: { state: SectionState; text?: string }) {
  return (
    <div className={styles.empty} role="status">
      <div className={styles.emptyIcon} aria-hidden>{state === "waiting" ? "⏳" : "∅"}</div>
      <p className={styles.muted}>{text ?? (state === "waiting" ? `${WAITING} — GA4/GSC bağlantısı (E4) kurulunca dolacak.` : "Seçilen dönem ve dilde kayıt yok.")}</p>
    </div>
  );
}

function Section({ title, sub, children, wide }: { title: string; sub?: string; children: React.ReactNode; wide?: boolean }) {
  return (
    <section className={`${styles.card} ${wide ? styles.wide : ""}`}>
      <h2 className={styles.cardTitle}>{title}</h2>
      {sub && <p className={`${styles.muted} ${styles.sub}`}>{sub}</p>}
      {children}
    </section>
  );
}

function Kpi({ title, value, sub }: { title: string; value: string; sub?: string }) {
  return (
    <div className={styles.card}>
      <h2 className={styles.cardTitle}>{title}</h2>
      <p className={styles.big}>{value === "—" ? <span className={styles.muted}>{WAITING}</span> : value}</p>
      {sub && <span className={styles.muted}>{sub}</span>}
    </div>
  );
}

export default function AnalyticsPage() {
  const [days, setDays] = useState<Period>(90);
  const [locale, setLocale] = useState<Locale | "">("");
  const [metric, setMetric] = useState<"sessions" | "leads">("leads");

  // filtre ↔ URL hash (paylaşılabilir görünüm; static export'ta sorgu dizesi yerine hash)
  useEffect(() => {
    const apply = () => { const h = parseHash(window.location.hash); setDays(h.days); setLocale(h.locale); };
    apply();
    window.addEventListener("hashchange", apply);
    return () => window.removeEventListener("hashchange", apply);
  }, []);
  const setFilter = (d: Period, l: Locale | "") => {
    setDays(d);
    setLocale(l);
    window.history.replaceState(null, "", toHash(d, l));
  };

  const res = useAdminGet<AttributionReport>(attributionPath(days, locale));
  const hub = useAdminGet<AnalyticsHubData>("/analytics/summary");
  // dil trendi: "tüm diller"de 4 dil ayrı istenir (sözleşme locale filtresi); tek dil seçiliyse ana rapor yeter
  const per = {
    tr: useAdminGet<AttributionReport>(locale ? null : attributionPath(days, "tr")),
    en: useAdminGet<AttributionReport>(locale ? null : attributionPath(days, "en")),
    de: useAdminGet<AttributionReport>(locale ? null : attributionPath(days, "de")),
    zh: useAdminGet<AttributionReport>(locale ? null : attributionPath(days, "zh")),
  };
  const r = res.state === "ready" ? res.data : null;
  const perReports = useMemo(() => {
    if (locale && r) return { [locale]: r } as Partial<Record<Locale, AttributionReport>>;
    const out: Partial<Record<Locale, AttributionReport>> = {};
    for (const l of LOCALES) { const x = per[l]; if (x.state === "ready") out[l] = x.data; }
    return out;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [locale, r, per.tr, per.en, per.de, per.zh]);

  return (
    <>
      <h1 className={styles.h1}>Analitik Hub</h1>
      <p className={styles.lede}>Salt okunur görünüm — bu ekrandan veri değiştirilemez. Kişisel veri yok: yalnız sayfa/dil/utm agregatları (attribution.v1).</p>
      <div className={styles.filters} role="group" aria-label="Görünüm filtreleri">
        <fieldset className={styles.seg}>
          <legend className={styles.srOnly}>Dönem</legend>
          {PERIODS.map((p) => (
            <label key={p} className={`${styles.segOpt} ${days === p ? styles.segOn : ""}`}>
              <input type="radio" name="period" value={p} checked={days === p} onChange={() => setFilter(p, locale)} className={styles.srOnly} />
              {p} gün
            </label>
          ))}
        </fieldset>
        <label className={styles.selLabel}>
          <span>Dil</span>
          <select className={styles.select} value={locale} onChange={(e) => setFilter(days, e.target.value as Locale | "")}>
            {(["", ...LOCALES] as const).map((l) => <option key={l} value={l}>{LOCALE_LABEL[l]}</option>)}
          </select>
        </label>
        <span className={styles.muted}>{r ? `${r.period.from} → ${r.period.to} · son tıklama, ${r.period.attribution_window_days} gün pencere` : " "}</span>
      </div>

      {res.state === "loading" && <div className={`${styles.card} ${styles.skel}`} aria-busy="true">Veriler yükleniyor…</div>}
      {res.state === "error" && (
        <div className={styles.card} role="alert">
          <p className={styles.err}>Analitik servisine ulaşılamadı ({res.message}).</p>
          <p className={styles.muted}>Veriler D1&apos;den (analytics_daily + atıf görünümleri) admin API ile okunur; admin backend canlıya bağlanana dek (E8) bu beklenen bir durumdur.</p>
        </div>
      )}
      {r && <Report r={r} hub={hub.state === "ready" ? hub.data : null} perReports={perReports} locale={locale} metric={metric} setMetric={setMetric} />}
    </>
  );
}

function Report({ r, hub, perReports, locale, metric, setMetric }: {
  r: AttributionReport; hub: AnalyticsHubData | null; perReports: Partial<Record<Locale, AttributionReport>>; locale: Locale | "";
  metric: "sessions" | "leads"; setMetric: (m: "sessions" | "leads") => void;
}) {
  const t = r.totals;
  const tr = trafficSeries(r.daily);
  const ts = trafficState(r);
  const lt = localeTrend(perReports, metric);
  const attributedPages = r.pages.filter((p) => p.submits > 0).slice(0, 10);
  const spend = hub && hub.history.length ? hub.summary.totalSpend : null;

  return (
    <>
      {r.data_status.note && <p className={styles.notice} role="status">{r.data_status.note}</p>}

      <section className={styles.grid} aria-label="Özet göstergeler">
        <Kpi title="Oturum (GA4)" value={fmt(t.sessions)} sub={r.data_status.traffic === "partial" ? `${r.data_status.analytics_days_with_data}/${r.period.days} gün veri · top-20 sayfa kapsamı` : "top-20 sayfa kapsamı"} />
        <Kpi title="Arama tıklaması (GSC)" value={fmt(t.gsc_clicks)} sub={`Gösterim: ${t.gsc_impressions === null ? WAITING : fmt(t.gsc_impressions)}`} />
        <Kpi title="Lead (dönem)" value={fmt(t.leads_in_period)} sub={`Atfedilen ${fmt(t.attributed)} · doğrudan ${fmt(t.direct)}`} />
        <Kpi title="Form başladı" value={fmt(t.form_starts)} sub={r.data_status.form_start_tracking ? "GA4 form_start" : "olay henüz bağlı değil"} />
      </section>

      <div className={styles.twoCol}>
        <Section title="Günlük trafik" sub="GA4 oturum + GSC tıklama (sol eksen) · GSC gösterim (sağ eksen). Boşluk = o gün veri yok." wide>
          {ts !== "ok" ? <Status state={ts} /> : (
            <Chart type="line" labels={tr.labels} ariaLabel="Günlük trafik: oturum, arama tıklaması ve gösterim" y2Title="Gösterim"
              series={[
                { label: "Oturum (GA4)", data: tr.sessions, color: color.accentOnDark },
                { label: "Tıklama (GSC)", data: tr.clicks, color: color.highlight },
                { label: "Gösterim (GSC)", data: tr.impressions, color: color.bg, dash: [6, 4], axis: "y2" },
              ]} />
          )}
        </Section>

        <Section title="Lead kaynağı dağılımı" sub="utm_source / utm_medium (son tıklama) — en çok 10 + diğer">
          {sourcesState(r) !== "ok" ? <Status state="empty" text="Seçilen dönemde lead yok." /> : (
            <>
              <Chart type="doughnut" height="sm" labels={r.sources.map(sourceLabel)} ariaLabel="Lead kaynağına göre lead sayısı"
                series={[{ label: "Lead", data: r.sources.map((s) => s.leads), color: PALETTE[0] }]} />
              <ul className={styles.rows}>
                {r.sources.map((s) => <li key={`${s.source}/${s.medium}`} className={styles.row}><span className={styles.muted}>{sourceLabel(s)}</span><span>{fmt(s.leads)} · {pct(s.share)}</span></li>)}
              </ul>
            </>
          )}
          {t.direct > 0 && (
            <p className={`${styles.muted} ${styles.foot}`}>Doğrudan {fmt(t.direct)}: kaynak sayfa yok {fmt(t.direct_no_source)} · 30 gün dışı {fmt(t.direct_window_expired)} · geçersiz dokunuş {fmt(t.direct_invalid_touch)}</p>
          )}
        </Section>

        <Section title="Dönüşüm hunisi" sub="Oturum → form başladı → gönderildi (atıflı lead)">
          <ul className={styles.funnel}>
            {r.funnel.stages.map((s) => (
              <li key={s.id} className={styles.row}><span className={styles.muted}>{s.label}</span><span>{s.value === null ? <em className={styles.muted}>{WAITING}</em> : fmt(s.value)}</span></li>
            ))}
          </ul>
        </Section>

        <Section title="En iyi dönüşen içerik" sub={`Oturum ≥ ${r.min_sessions} olan sayfalar, oturum→lead oranına göre`} wide>
          {convertingState(r) !== "ok" ? (
            <Status state={convertingState(r)} text={convertingState(r) === "waiting" ? `${WAITING} — oran için sayfa trafiği (GA4) gerekir.` : `Oturumu ${r.min_sessions} ve üzeri olan sayfa yok.`} />
          ) : (
            <Chart type="bar" horizontal percent height="sm" labels={r.top_converting.map((p) => p.page)} ariaLabel="Sayfa başına oturumdan lead'e dönüşüm oranı"
              series={[{ label: "Oturum → lead", data: r.top_converting.map((p) => p.session_to_submit_rate), color: color.accentOnDark }]} />
          )}
          <h3 className={styles.h3}>Atıflı lead alan sayfalar</h3>
          {attributedPages.length === 0 ? <Status state="empty" text="Seçilen dönemde sayfaya atfedilen lead yok." /> : (
            <div className={styles.tableWrap}>
              <table className={styles.table}>
                <thead><tr><th scope="col">#</th><th scope="col">Sayfa</th><th scope="col">Dil</th><th scope="col">Oturum</th><th scope="col">Form başladı</th><th scope="col">Lead</th><th scope="col">Oturum→lead</th></tr></thead>
                <tbody>
                  {attributedPages.map((p) => (
                    <tr key={p.page}><td>{p.rank}</td><td className={styles.path}>{p.page}</td><td>{p.locale}</td><td>{fmt(p.sessions)}</td><td>{fmt(p.form_starts)}</td><td>{fmt(p.submits)}</td><td>{pct(p.session_to_submit_rate)}</td></tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </Section>

        <Section title="Dil kırılımı" sub={`${locale ? `${LOCALE_LABEL[locale]} trendi` : "tr / en / de / zh ayrı trend (sayfa yolu dili · lead dili)"}${lt.weekly ? " · haftalık toplam" : ""}`} wide>
          <div className={styles.seg} role="radiogroup" aria-label="Trend ölçüsü">
            {(["leads", "sessions"] as const).map((m) => (
              <button key={m} type="button" role="radio" aria-checked={metric === m} className={`${styles.segOpt} ${metric === m ? styles.segOn : ""}`} onClick={() => setMetric(m)}>
                {m === "leads" ? "Lead" : "Oturum"}
              </button>
            ))}
          </div>
          {lt.series.length === 0 ? <div className={styles.chartBox} aria-busy="true"><Status state="waiting" text="Dil serileri yükleniyor…" /></div> :
            !lt.series.some((s) => s.values.some((v) => typeof v === "number" && (metric === "sessions" || v > 0))) ? (
              <Status state={metric === "sessions" && r.data_status.traffic === "none" ? "waiting" : "empty"} />
            ) : (
              <Chart type="line" labels={lt.labels} ariaLabel={`Dile göre günlük ${metric === "leads" ? "lead" : "oturum"} trendi`}
                series={lt.series.map((s) => ({ label: LOCALE_LABEL[s.locale], data: s.values, ...LOCALE_STYLE[s.locale] }))} />
            )}
          <div className={styles.tableWrap}>
            <table className={styles.table}>
              <thead><tr><th scope="col">Dil</th><th scope="col">Lead</th><th scope="col">Oturum</th></tr></thead>
              <tbody>{r.by_locale.map((l) => <tr key={l.locale}><td>{l.locale}</td><td>{fmt(l.leads)}</td><td>{l.sessions === null ? <span className={styles.muted}>{WAITING}</span> : fmt(l.sessions)}</td></tr>)}</tbody>
            </table>
          </div>
        </Section>

        <Section title="Keyword çıktı takibi" sub="Keyword → makale → trafik (FAZ 6.3 keyword motoru)">
          <Status state="waiting" text="Keyword motoru (6.3) bağlanınca dolacak: hangi keyword'den kaç makale üretildi ve hangileri trafik getirdi. Sayı uydurulmaz." />
        </Section>

        <Section title="Meta reklam harcaması" sub="analytics_daily.meta_json (FAZ 6.5)">
          <p className={styles.big}>{spend === null ? <span className={styles.muted}>{WAITING}</span> : `$${spend.toFixed(2)}`}</p>
          <span className={styles.muted}>Meta OAuth (E4) bağlanınca dolar.</span>
        </Section>
      </div>

      <p className={`${styles.muted} ${styles.section}`}>
        Kapsam: GA4 sayfa trafiği günde en çok 20 sayfa ({r.data_status.traffic_basis}); GSC: {r.data_status.search_data ? "bağlı" : WAITING}.
        {r.data_status.pages_truncated && " Sayfa listesi 200 satırla sınırlandı."}{r.data_status.leads_truncated && " Lead sayımı üst sınıra ulaştı."} Oluşturma: {r.generated_at.replace("T", " ").slice(0, 16)} UTC
      </p>
    </>
  );
}
