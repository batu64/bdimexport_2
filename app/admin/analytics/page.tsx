"use client";

import { useAdminGet, type AnalyticsHubData } from "../_lib/api";
import styles from "../admin.module.css";

export default function AnalyticsPage() {
  const res = useAdminGet<AnalyticsHubData>("/analytics/summary");

  if (res.state === "loading") {
    return (
      <>
        <h1 className={styles.h1}>Analitik Hub</h1>
        <div className={`${styles.card} ${styles.skel}`}>Veriler yükleniyor…</div>
      </>
    );
  }

  if (res.state === "error") {
    return (
      <>
        <h1 className={styles.h1}>Analitik Hub</h1>
        <div className={styles.card}>
          <p className={styles.err}>Hata: {res.message}</p>
          <p className={styles.muted}>
            Not: Analitik verileri cron-analytics servisinden günlük olarak çekilir.
          </p>
        </div>
      </>
    );
  }

  const { summary, history, leadSources, topPages } = res.data;

  return (
    <>
      <h1 className={styles.h1}>Analitik Hub</h1>

      {/* KPI Kartları */}
      <section className={styles.grid}>
        <div className={styles.card}>
          <h2 className={styles.cardTitle}>Toplam Oturum (GA4/CF)</h2>
          <p className={styles.big}>{summary.totalSessions.toLocaleString()}</p>
          <span className={styles.muted}>Son 30 gün toplamı</span>
        </div>
        <div className={styles.card}>
          <h2 className={styles.cardTitle}>Google Arama Tıklama (GSC)</h2>
          <p className={styles.big}>{summary.totalClicks.toLocaleString()}</p>
          <span className={styles.muted}>Gösterim: {summary.totalImpressions.toLocaleString()}</span>
        </div>
        <div className={styles.card}>
          <h2 className={styles.cardTitle}>Meta Reklam Harcaması</h2>
          <p className={styles.big}>${summary.totalSpend.toFixed(2)}</p>
          <span className={styles.muted}>Dönüşüm & kampanya maliyeti</span>
        </div>
      </section>

      {/* Grafikler / Görsel Dağılımlar */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "var(--a-s4)", marginTop: "var(--a-s6)" }}>
        {/* Lead Kaynağı Dağılımı */}
        <div className={styles.card}>
          <h2 className={styles.cardTitle}>Lead Kaynağı Dağılımı</h2>
          {leadSources.length === 0 ? (
            <div className={styles.empty}>
              <p className={styles.muted}>Henüz kaynak verisi yok.</p>
            </div>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: "var(--a-s3)", marginTop: "var(--a-s2)" }}>
              {leadSources.map((ls) => (
                <div key={ls.source}>
                  <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "4px" }}>
                    <span>{ls.source}</span>
                    <span className={styles.muted}>{ls.count} ({ls.percentage}%)</span>
                  </div>
                  <div style={{ height: "8px", background: "rgba(255,255,255,0.1)", borderRadius: "4px", overflow: "hidden" }}>
                    <div
                      style={{
                        height: "100%",
                        width: `${ls.percentage}%`,
                        background: "var(--a-accent, #3b82f6)",
                        borderRadius: "4px",
                      }}
                    />
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* En Çok Trafik Alan SEO Sayfaları */}
        <div className={styles.card}>
          <h2 className={styles.cardTitle}>En Çok Trafik Alan SEO Sayfaları</h2>
          {topPages.length === 0 ? (
            <div className={styles.empty}>
              <p className={styles.muted}>Henüz sayfa trafik verisi yok.</p>
            </div>
          ) : (
            <ul className={styles.rows}>
              {topPages.slice(0, 5).map((tp) => (
                <li key={tp.page} className={styles.row}>
                  <span style={{ maxWidth: "250px", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                    {tp.page}
                  </span>
                  <span className={styles.muted}>{tp.sessions.toLocaleString()} oturum</span>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>

      {/* Günlük Çekim Geçmişi Tablosu */}
      <section className={styles.card} style={{ marginTop: "var(--a-s6)" }}>
        <h2 className={styles.cardTitle}>Günlük Çekim Kayıtları (analytics_daily)</h2>
        {history.length === 0 ? (
          <div className={styles.empty}>
            <div className={styles.emptyIcon} aria-hidden>∅</div>
            <p className={styles.muted}>analytics_daily tablosunda henüz kayıt bulunamadı.</p>
          </div>
        ) : (
          <div style={{ overflowX: "auto" }}>
            <table style={{ width: "100%", borderCollapse: "collapse", textAlign: "left", fontSize: "var(--a-fs-sm)" }}>
              <thead>
                <tr style={{ borderBottom: "1px solid rgba(255,255,255,0.15)" }}>
                  <th style={{ padding: "8px" }}>Tarih</th>
                  <th style={{ padding: "8px" }}>Locale</th>
                  <th style={{ padding: "8px" }}>GA4 Oturum</th>
                  <th style={{ padding: "8px" }}>GSC Tıklama</th>
                  <th style={{ padding: "8px" }}>Meta Harcama</th>
                </tr>
              </thead>
              <tbody>
                {history.map((row) => {
                  let ga4: any = null;
                  let gsc: any = null;
                  let meta: any = null;
                  try { if (row.ga4_json) ga4 = JSON.parse(row.ga4_json); } catch {}
                  try { if (row.gsc_json) gsc = JSON.parse(row.gsc_json); } catch {}
                  try { if (row.meta_json) meta = JSON.parse(row.meta_json); } catch {}

                  return (
                    <tr key={`${row.day}-${row.locale}`} style={{ borderBottom: "1px solid rgba(255,255,255,0.05)" }}>
                      <td style={{ padding: "8px" }}>{row.day}</td>
                      <td style={{ padding: "8px" }}>{row.locale}</td>
                      <td style={{ padding: "8px" }}>{ga4?.sessions ?? "-"}</td>
                      <td style={{ padding: "8px" }}>{gsc?.clicks ?? "-"}</td>
                      <td style={{ padding: "8px" }}>{meta?.spend ? `$${meta.spend}` : "-"}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </>
  );
}
