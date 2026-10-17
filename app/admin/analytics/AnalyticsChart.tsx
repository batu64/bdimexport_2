"use client";
// Chart.js yatay çubuk grafik. Renkler YALNIZ design tokens'tan (hex yok); Chart.js istemcide, tembel yüklenir (static export'ta SSR yok).
import { useEffect, useRef } from "react";
import { color, font, fontSize } from "@/lib/ui/tokens";

export type ChartDatum = { label: string; value: number };

export default function AnalyticsChart({ data, unit, ariaLabel }: { data: ChartDatum[]; unit: string; ariaLabel: string }) {
  const ref = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    let chart: { destroy(): void } | undefined;
    let cancelled = false;
    void import("chart.js/auto").then(({ default: Chart }) => {
      if (cancelled || !ref.current) return;
      const grid = `${color.bg}26`; // token + %15 alfa (hex literal değil; tokens'tan türetilir)
      chart = new Chart(ref.current, {
        type: "bar",
        data: {
          labels: data.map((d) => d.label),
          datasets: [{ label: unit, data: data.map((d) => d.value), backgroundColor: color.accent, borderColor: color.highlight, borderWidth: 1 }],
        },
        options: {
          indexAxis: "y",
          responsive: true,
          maintainAspectRatio: false,
          plugins: { legend: { display: false } },
          scales: {
            x: { beginAtZero: true, ticks: { color: color.bg, font: { family: font.latin, size: fontSize.xs } }, grid: { color: grid } },
            y: { ticks: { color: color.bg, font: { family: font.latin, size: fontSize.xs } }, grid: { display: false } },
          },
        },
      });
    });
    return () => {
      cancelled = true;
      chart?.destroy();
    };
  }, [data, unit]);

  return <canvas ref={ref} role="img" aria-label={ariaLabel} />;
}
