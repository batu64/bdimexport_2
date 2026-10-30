"use client";
// FAZ_6 6.2 — genel Chart.js sarmalayıcı (çizgi / çubuk / halka). Renkler YALNIZ design tokens'tan (hex literal yok); Chart.js istemcide tembel yüklenir
// (static export'ta SSR yok). null değerler BOŞLUK olarak çizilir (spanGaps:false) — 0'a çevrilmez. prefers-reduced-motion → animasyon kapalı.
// Erişilebilirlik: canvas role="img" + aria-label; aynı veri ekran okuyucu için gizli tabloda (görsel yalnız grafik).
import { useEffect, useRef } from "react";
import { color, font, fontSize } from "@/lib/ui/tokens";
import styles from "../admin.module.css";

export type Series = { label: string; data: (number | null)[]; color: string; dash?: number[]; axis?: "y" | "y2" };

type Props = {
  type: "line" | "bar" | "doughnut";
  labels: string[];
  series: Series[];
  ariaLabel: string;
  /** yatay çubuk (uzun sayfa yolu etiketleri için) */
  horizontal?: boolean;
  /** değerler 0–1 oran → eksende yüzde */
  percent?: boolean;
  /** ikinci y ekseni başlığı (ör. gösterim) */
  y2Title?: string;
  height?: "sm" | "md";
};

const ink = color.bg; // koyu admin zemininde metin
const grid = `${color.bg}26`; // token + %15 alfa (tokens'tan türetilir)

export default function Chart({ type, labels, series, ariaLabel, horizontal, percent, y2Title, height = "md" }: Props) {
  const ref = useRef<HTMLCanvasElement>(null);
  const key = JSON.stringify([type, labels, series, horizontal, percent, y2Title]);

  useEffect(() => {
    let chart: { destroy(): void } | undefined;
    let cancelled = false;
    const still = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    // ekran dışı grafik görünür alana yaklaşınca çizilir (TBT: sayfada 5 grafik; ilk boyamada yalnız görünenler)
    const io = new IntersectionObserver((es) => {
      if (!es.some((e) => e.isIntersecting)) return;
      io.disconnect();
      draw();
    }, { rootMargin: "200px" });
    if (ref.current) io.observe(ref.current);
    const draw = () => void import("chart.js/auto").then(({ default: C }) => {
      if (cancelled || !ref.current) return;
      const tick = { color: ink, font: { family: font.latin, size: fontSize.xs } };
      const fmtTick = (v: string | number) => (percent ? `%${Math.round(Number(v) * 1000) / 10}` : Number(v).toLocaleString("tr-TR"));
      const round = type === "doughnut";
      chart = new C(ref.current, {
        type,
        data: {
          labels,
          datasets: series.map((s) => ({
            label: s.label,
            data: s.data,
            borderColor: round ? color.primary : s.color,
            backgroundColor: round ? series[0].data.map((_, i) => PALETTE[i % PALETTE.length]) : s.color,
            borderDash: s.dash,
            borderWidth: type === "line" ? 2 : 1,
            pointRadius: type === "line" ? (labels.length > 40 ? 0 : 2) : undefined,
            spanGaps: false,
            yAxisID: !round && s.axis === "y2" ? "y2" : undefined, // yatayda kategori ekseni y; varsayılan eksenler
          })),
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          animation: still ? false : undefined,
          indexAxis: horizontal ? "y" : "x",
          interaction: { mode: "index", intersect: false },
          plugins: {
            legend: { display: series.length > 1 || round, labels: { color: ink, font: { family: font.latin, size: fontSize.xs }, boxWidth: 12 } },
            tooltip: { callbacks: { label: (c: { dataset: { label?: string }; raw: unknown }) => `${c.dataset.label}: ${c.raw === null ? "veri yok" : fmtTick(c.raw as number)}` } },
          },
          scales: round ? {} : {
            x: { beginAtZero: true, ticks: { ...tick, ...(horizontal ? { callback: fmtTick } : { maxRotation: 0, autoSkip: true, maxTicksLimit: 10 }) }, grid: { color: horizontal ? grid : "transparent" } },
            y: { beginAtZero: true, ticks: { ...tick, ...(horizontal ? {} : { callback: fmtTick }) }, grid: { color: horizontal ? "transparent" : grid } },
            ...(series.some((s) => s.axis === "y2")
              ? { y2: { position: "right", beginAtZero: true, ticks: { ...tick, callback: fmtTick }, grid: { display: false }, title: { display: !!y2Title, text: y2Title, color: ink } } }
              : {}),
          },
        },
      } as never);
    });
    return () => {
      cancelled = true;
      io.disconnect();
      chart?.destroy();
    };
    // key: veri/ayar değişince yeniden çiz (series dizisi her render'da yeni nesne olabilir)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key]);

  return (
    <>
      <div className={height === "sm" ? styles.chartBoxSm : styles.chartBox}>
        <canvas ref={ref} role="img" aria-label={ariaLabel} />
      </div>
      <table className={styles.srOnly}>
        <caption>{ariaLabel}</caption>
        <thead><tr><th scope="col">—</th>{series.map((s) => <th key={s.label} scope="col">{s.label}</th>)}</tr></thead>
        <tbody>
          {labels.map((l, i) => (
            <tr key={`${l}-${i}`}><th scope="row">{l}</th>{series.map((s) => <td key={s.label}>{s.data[i] ?? "veri yok"}</td>)}</tr>
          ))}
        </tbody>
      </table>
    </>
  );
}

/** Kategori paleti (halka grafik dilimleri) — yalnız token renkleri. */
export const PALETTE = [color.accentOnDark, color.highlight, color.bg, color.accent, color.warning, color.borderStrong, color.success, color.muted];
