"use client";
// Analitik Hub (FAZ_3 3.7) — SALT OKUNUR; admin-only (menü/yol kapısı: ../_lib/nav.ts; sunucu: handler.ts viewer→403).
// Veri: GET /analytics/summary → analytics_daily (cron-analytics yazar) + leads kaynakları. Chart.js: lead kaynağı + en çok trafik sayfa.
// TODO(3.9/FAZ 6): canlı GSC/GA4/Meta OAuth ertelendi → credential girilene dek tablo boştur ve aşağıdaki boş durum görünür.
import { useMemo } from "react";
import { useAdminGet, type AnalyticsHubData } from "../_lib/api";
import styles from "../admin.module.css";
import AnalyticsChart from "./AnalyticsChart";

const EMPTY_HINT = "Veri OAuth bağlanınca (GSC / GA4 / Meta) görünecek — kurulum: docs/analytics-setup.md";

function Empty({ text }: { text: string }) {
  return (
    <div className={styles.empty}>
      <div className={styles.emptyIcon} aria-hidden>∅</div>
      <p className={styles.muted}>{text}</p>
    </div>
  );
}

type Json = Record<string, unknown> | null;
const parse = (s: string | null): Json => {
  if (!s) return null;
  try {
    return JSON.parse(s) as Json;
  } catch {
    return null;
  }
};
const num = (v: unknown) => (typeof v === "number" ? v : null);

export default function AnalyticsPage() {
  const res = useAdminGet<AnalyticsHubData>("/analytics/summary");
  const data = res.state === "ready" ? res.data : null;
  const leadData = useMemo(() => (data?.leadSources ?? []).map((l) => ({ label: `${l.source} (${l.percentage}%)`, value: l.count })), [data]);
  const pageData = useMemo(() => (data?.topPages ?? []).slice(0, 8).map((p) => ({ label: p.page, value: p.sessions })), [data]);

  if (res.state === "loading") {
    return (
      <>
        <h1 className={styles.h1}>Analitik Hub</h1>
        <div className={`${styles.card} ${styles.skel}`} aria-busy="true">Veriler yükleniyor…</div>
      </>
    );
  }

  if (res.state === "error") {
    return (
      <>
        <h1 className={styles.h1}>Analitik Hub</h1>
        <div className={styles.card}>
          <p className={styles.err}>Analitik servisine ulaşılamadı ({res.message}).</p>
          <p className={styles.muted}>Analitik verileri cron-analytics servisinden günlük çekilir; API (3.4) hazır olana dek bu beklenen bir durumdur.</p>
        </div>
      </>
    );
  }

  const { summary, history } = res.data;
  const noTraffic = history.length === 0;

  return (
    <>
      <h1 className={styles.h1}>Analitik Hub</h1>
      {noTraffic && (
        <div className={styles.card} role="status">
          <Empty text={EMPTY_HINT} />
        </div>
      )}

      <section className={`${styles.grid} ${noTraffic ? styles.section : ""}`}>
        <div className={styles.card}>
          <h2 className={styles.cardTitle}>Toplam Oturum (GA4/CF)</h2>
          <p className={styles.big}>{noTraffic ? "—" : summary.totalSessions.toLocaleString()}</p>
          <span className={styles.muted}>Son 30 gün toplamı</span>
        </div>
        <div className={styles.card}>
          <h2 className={styles.cardTitle}>Google Arama Tıklama (GSC)</h2>
          <p className={styles.big}>{noTraffic ? "—" : summary.totalClicks.toLocaleString()}</p>
          <span className={styles.muted}>Gösterim: {noTraffic ? "—" : summary.totalImpressions.toLocaleString()}</span>
        </div>
        <div className={styles.card}>
          <h2 className={styles.cardTitle}>Meta Reklam Harcaması</h2>
          <p className={styles.big}>{noTraffic ? "—" : `$${summary.totalSpend.toFixed(2)}`}</p>
          <span className={styles.muted}>Kampanya maliyeti</span>
        </div>
      </section>

      <div className={styles.twoCol}>
        <section className={styles.card}>
          <h2 className={styles.cardTitle}>Lead Kaynağı Dağılımı</h2>
          {leadData.length === 0 ? (
            <Empty text="Henüz lead kaynağı verisi yok." />
          ) : (
            <div className={styles.chartBox}>
              <AnalyticsChart data={leadData} unit="Lead" ariaLabel="Lead kaynağına göre lead sayısı" />
            </div>
          )}
        </section>

        <section className={styles.card}>
          <h2 className={styles.cardTitle}>En Çok Trafik Alan Sayfalar</h2>
          {pageData.length === 0 ? (
            <Empty text={noTraffic ? EMPTY_HINT : "Sayfa bazlı trafik verisi yok (GA4 topPages)."} />
          ) : (
            <div className={styles.chartBox}>
              <AnalyticsChart data={pageData} unit="Oturum" ariaLabel="Sayfa bazında oturum sayısı" />
            </div>
          )}
        </section>
      </div>

      <section className={`${styles.card} ${styles.section}`}>
        <h2 className={styles.cardTitle}>Günlük Çekim Kayıtları (analytics_daily)</h2>
        {noTraffic ? (
          <Empty text={EMPTY_HINT} />
        ) : (
          <div className={styles.tableWrap}>
            <table className={styles.table}>
              <thead>
                <tr><th>Tarih</th><th>Locale</th><th>GA4 Oturum</th><th>GSC Tıklama</th><th>Meta Harcama</th></tr>
              </thead>
              <tbody>
                {history.map((row) => {
                  const ga4 = parse(row.ga4_json);
                  const gsc = parse(row.gsc_json);
                  const meta = parse(row.meta_json);
                  return (
                    <tr key={`${row.day}-${row.locale}`}>
                      <td>{row.day}</td>
                      <td>{row.locale}</td>
                      <td>{num(ga4?.sessions) ?? "-"}</td>
                      <td>{num(gsc?.clicks) ?? "-"}</td>
                      <td>{num(meta?.spend) != null ? `$${num(meta?.spend)}` : "-"}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </section>
      <p className={styles.note}>Salt okunur görünüm — bu ekrandan veri değiştirilemez.</p>
    </>
  );
}
