"use client";
// Dashboard — salt okunur özet kartları. Veri: GET /dashboard/summary (sorgu sözleşmesi: _lib/queries.ts).
// FAZ_6 6.2: admin rolünde 30 günlük trafik/lead trendi (GET /analytics/attribution — attribution.v1; uç admin-only → viewer'da istek ATILMAZ).
import Link from "next/link";
import { color } from "@/lib/ui/tokens";
import { useAdminGet, type DashboardSummary, type Me } from "./_lib/api";
import Chart from "./analytics/Chart";
import { WAITING, attributionPath, hasAny, trafficSeries, type AttributionReport } from "./analytics/view";
import styles from "./admin.module.css";

function Card({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className={styles.card}>
      <h2 className={styles.cardTitle}>{title}</h2>
      {children}
    </section>
  );
}

function Rows({ items }: { items: [string, number | null | undefined][] }) {
  return (
    <ul className={styles.rows}>
      {items.map(([k, v]) => (
        <li key={k} className={styles.row}><span className={styles.muted}>{k}</span><span>{v ?? "—"}</span></li>
      ))}
    </ul>
  );
}

function Empty({ text }: { text: string }) {
  return (
    <div className={styles.empty}>
      <div className={styles.emptyIcon} aria-hidden>∅</div>
      <p className={styles.muted}>{text}</p>
    </div>
  );
}

const sum = (...n: number[]) => n.reduce((a, b) => a + b, 0);

function Trend() {
  const res = useAdminGet<AttributionReport>(attributionPath(30, ""));
  if (res.state === "loading") return <div className={`${styles.card} ${styles.skelTrend} ${styles.section}`} aria-busy="true" />;
  if (res.state === "error") return null; // analitik servisi yoksa Dashboard sade kalır (ayrıntı Analitik sayfasında)
  const s = trafficSeries(res.data.daily);
  const any = hasAny(s.sessions) || hasAny(s.clicks) || s.leads.some((n) => n > 0);
  return (
    <section className={`${styles.card} ${styles.section}`}>
      <h2 className={styles.cardTitle}>Trafik ve lead trendi (30 gün)</h2>
      {!any ? (
        <Empty text={`${WAITING} — ${res.data.data_status.note ?? "dönemde kayıt yok."}`} />
      ) : (
        <Chart type="line" height="sm" labels={s.labels} ariaLabel="Son 30 gün: günlük oturum, arama tıklaması ve lead"
          series={[
            { label: "Oturum (GA4)", data: s.sessions, color: color.accentOnDark },
            { label: "Tıklama (GSC)", data: s.clicks, color: color.highlight },
            { label: "Lead", data: s.leads, color: color.bg, dash: [6, 4], axis: "y2" },
          ]} y2Title="Lead" />
      )}
      <Link href="/admin/analytics" className={styles.more}>Analitik Hub →</Link>
    </section>
  );
}

export default function Dashboard() {
  const res = useAdminGet<DashboardSummary>("/dashboard/summary");
  const me = useAdminGet<Me>("/me");
  const isAdmin = me.state === "ready" && me.data.role === "admin";
  return (
    <>
      <h1 className={styles.h1}>Dashboard</h1>
      <p className={styles.lede}>Salt okunur görünüm — bu ekrandan veri değiştirilemez.</p>
      {res.state === "loading" && (
        <div className={styles.grid} aria-busy="true">
          {[0, 1, 2, 3].map((i) => <div key={i} className={`${styles.card} ${styles.skelCard}`} />)}
        </div>
      )}
      {res.state === "error" && (
        <Card title="Veri alınamadı">
          <p className={styles.err}>Özet servisine ulaşılamadı ({res.message}).</p>
          <p className={styles.muted}>API (FAZ_3 3.4) hazır olana kadar bu beklenen bir durumdur.</p>
        </Card>
      )}
      {res.state === "ready" && <Cards d={res.data} />}
      {/* rol doğrulanırken trend yeri ayrılır (admin çoğunluk; viewer'da kalkar) */}
      {me.state === "loading" ? <div className={`${styles.card} ${styles.skelTrend} ${styles.section}`} aria-hidden /> : isAdmin && <Trend />}
    </>
  );
}

function Cards({ d }: { d: DashboardSummary }) {
  const leadTotal = sum(d.leads.new, d.leads.contacted, d.leads.qualified, d.leads.closed);
  const contentTotal = sum(d.contents.draft, d.contents.approved, d.contents.published);
  const partnerTotal = sum(d.partners.pending, d.partners.approved);
  return (
    <div className={styles.grid}>
      <Card title="Lead'ler">
        {leadTotal === 0 ? <Empty text="Henüz lead yok." /> : (
          <>
            <p className={styles.big}>{leadTotal}</p>
            <Rows items={[["Yeni", d.leads.new], ["İletişimde", d.leads.contacted], ["Nitelikli", d.leads.qualified], ["Kapandı", d.leads.closed], ["Son 7 gün", d.leads.last7d]]} />
          </>
        )}
      </Card>
      <Card title="İçerik">
        {contentTotal === 0 ? <Empty text="Henüz içerik kaydı yok." /> : (
          <>
            <p className={styles.big}>{contentTotal}</p>
            <Rows items={[["Taslak", d.contents.draft], ["Onaylı", d.contents.approved], ["Yayında", d.contents.published]]} />
          </>
        )}
      </Card>
      <Card title="Partner'lar">
        {partnerTotal === 0 ? <Empty text="Henüz partner başvurusu yok." /> : (
          <>
            <p className={styles.big}>{d.partners.pending}</p>
            <Rows items={[["Onay bekleyen", d.partners.pending], ["Onaylı", d.partners.approved]]} />
          </>
        )}
      </Card>
      <Card title="Analitik (son gün)">
        {!d.analytics ? <Empty text="analytics_daily verisi henüz yok." /> : (
          <>
            <p className={styles.big}>{d.analytics.day}</p>
            <Rows items={[["Oturum", d.analytics.sessions], ["Tıklama", d.analytics.clicks], ["Gösterim", d.analytics.impressions]]} />
          </>
        )}
      </Card>
    </div>
  );
}
