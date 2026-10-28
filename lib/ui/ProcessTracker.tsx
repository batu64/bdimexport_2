// Hero görseli — ÖRNEK süreç kartı (gerçek sipariş verisi DEĞİL; "Örnek görünüm" etiketi görünür + aria).
// Fotoğraf yerine ürün-benzeri arayüz illüstrasyonu (Gemini görsel E3'e kadar). Tamamı SVG/CSS; animasyonlar transform/opacity.
import { Check, Clock, Ship } from "lucide-react";
import s from "./tracker.module.css";

export type TrackerProps = {
  title: string;
  caption: string;
  route: string;
  steps: string[];
  labels: { done: string; active: string; next: string };
  /** tamamlanan adım sayısı; sonraki adım "sürüyor" */
  doneCount: number;
  badge?: string;
};

export default function ProcessTracker({ title, caption, route, steps, labels, doneCount, badge }: TrackerProps) {
  const pct = Math.round(((doneCount + 0.5) / steps.length) * 100);
  return (
    <figure className={s.wrap} aria-label={`${title} — ${caption}`}>
      <div className={s.card}>
        <div className={s.head}>
          <div>
            <p className={s.title}>{title}</p>
            <p className={s.caption}>{caption}</p>
          </div>
          <span className={s.route}>
            <Ship aria-hidden="true" className={s.routeIcon} />
            {route}
          </span>
        </div>

        <svg className={s.map} viewBox="0 0 320 72" aria-hidden="true" preserveAspectRatio="none">
          <path className={s.mapBase} d="M16 52 C 96 4, 224 4, 304 40" />
          <path className={s.mapLine} d="M16 52 C 96 4, 224 4, 304 40" pathLength={100} />
          <circle className={s.nodeA} cx="16" cy="52" r="5" />
          <circle className={s.nodeB} cx="304" cy="40" r="5" />
          <circle className={s.mover} r="4">
            <animateMotion dur="6s" repeatCount="indefinite" path="M16 52 C 96 4, 224 4, 304 40" keyPoints="0;1" keyTimes="0;1" calcMode="spline" keySplines="0.65 0 0.35 1" />
          </circle>
        </svg>

        <div className={s.progress} role="presentation">
          <span className={s.bar} style={{ "--p": `${pct}%` } as React.CSSProperties} />
        </div>

        <ol className={s.steps}>
          {steps.map((step, i) => {
            const state = i < doneCount ? "done" : i === doneCount ? "active" : "next";
            return (
              <li key={step} className={s.step} data-state={state} style={{ "--i": i } as React.CSSProperties}>
                <span className={s.mark} aria-hidden="true">
                  {state === "done" ? <Check className={s.markIcon} /> : state === "active" ? <Clock className={s.markIcon} /> : null}
                </span>
                <span className={s.stepName}>{step}</span>
                <span className={s.state}>{labels[state]}</span>
              </li>
            );
          })}
        </ol>
      </div>
      {badge && (
        <p className={s.badge}>
          <Clock aria-hidden="true" className={s.badgeIcon} />
          <span>{badge}</span>
        </p>
      )}
    </figure>
  );
}
