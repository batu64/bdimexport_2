"use client";
// Dashboard — salt okunur özet kartları. Veri: GET /dashboard/summary (sorgu sözleşmesi: _lib/queries.ts).
import { useAdminGet, type DashboardSummary } from "./_lib/api";
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

export default function Dashboard() {
  const res = useAdminGet<DashboardSummary>("/dashboard/summary");
  return (
    <>
      <h1 className={styles.h1}>Dashboard</h1>
      {res.state === "loading" && (
        <div className={styles.grid} aria-busy="true">
          {[0, 1, 2, 3].map((i) => <div key={i} className={`${styles.card} ${styles.skel}`} />)}
        </div>
      )}
      {res.state === "error" && (
        <Card title="Veri alınamadı">
          <p className={styles.err}>Özet servisine ulaşılamadı ({res.message}).</p>
          <p className={styles.muted}>API (FAZ_3 3.4) hazır olana kadar bu beklenen bir durumdur.</p>
        </Card>
      )}
      {res.state === "ready" && <Cards d={res.data} />}
      <p className={styles.note}>Salt okunur görünüm — bu ekrandan veri değiştirilemez.</p>
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
