"use client";
// Remotion-style kinetic stage (30 FPS interpolate/spring physics) — yalnız transform/opacity animasyonu;
// prefers-reduced-motion: reduce olduğunda rAF durur ve tüm kartlar anında görünür.
// Sıfır hardcoded hex/px; 3 modül (4'lü gruplama yok).
import { useEffect, useState } from "react";
import { ArrowRight } from "lucide-react";
import s from "./stage.module.css";

export type StageMetric = { code: string; tag: string; title: string; desc: string };

export type StageTab = {
  tabLabel: string;
  badge: string;
  liveLabel: string;
  title: string;
  lead: string;
  progressLabel: string;
  metrics: [StageMetric, StageMetric, StageMetric];
  footnote: string;
  footRight: string;
};

const FPS = 30;
const SCENE_FRAMES = 240; // 8 saniye / sahne

function clamp01(t: number) {
  return t < 0 ? 0 : t > 1 ? 1 : t;
}

function springProgress(frame: number, delay: number) {
  const f = Math.max(0, frame - delay);
  if (f <= 0) return 0;
  const w0 = Math.sqrt(120);
  const zeta = 12 / (2 * w0);
  const t = f / FPS;
  const wd = w0 * Math.sqrt(1 - zeta * zeta);
  const env = Math.exp(-zeta * w0 * t);
  return 1 - env * (Math.cos(wd * t) + ((zeta * w0) / wd) * Math.sin(wd * t));
}

export default function TradeIntelligenceStage({ tabs }: { tabs: [StageTab, StageTab, StageTab] }) {
  const [active, setActive] = useState(0);
  const [frame, setFrame] = useState(SCENE_FRAMES);
  const [reduced, setReduced] = useState(true);

  useEffect(() => {
    const rm = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    setReduced(rm);
    if (rm) {
      setFrame(SCENE_FRAMES);
      return;
    }
    setFrame(0);
    let last = performance.now();
    let acc = 0;
    let raf = 0;
    const step = (now: number) => {
      acc += now - last;
      last = now;
      const ms = 1000 / FPS;
      if (acc >= ms) {
        const inc = Math.floor(acc / ms);
        acc %= ms;
        setFrame((prev) => {
          const next = prev + inc;
          if (next >= SCENE_FRAMES) {
            setActive((a) => (a + 1) % 3);
            return 0;
          }
          return next;
        });
      }
      raf = requestAnimationFrame(step);
    };
    raf = requestAnimationFrame(step);
    return () => cancelAnimationFrame(raf);
  }, []);

  const f = reduced ? SCENE_FRAMES : frame;
  const headP = reduced ? 1 : clamp01(springProgress(f, 3));
  const barP = reduced ? 100 : Math.round(clamp01((f - 10) / 90) * 100);
  const scene = tabs[active];

  return (
    <div className={s.wrap}>
      <div role="tablist" className={s.tabs}>
        {tabs.map((tab, i) => (
          <button
            key={tab.tabLabel}
            type="button"
            role="tab"
            aria-selected={active === i}
            className={s.tab}
            onClick={() => {
              setActive(i);
              setFrame(reduced ? SCENE_FRAMES : 0);
            }}
          >
            <span>{tab.tabLabel}</span>
            <ArrowRight aria-hidden="true" className={s.tabArrow} />
          </button>
        ))}
      </div>

      <div className={s.stage} role="tabpanel">
        <div className={s.topBar}>
          <span className={s.badge}>{scene.badge}</span>
          <span className={s.live}>
            <span className={s.dot} aria-hidden="true" />
            <span>{scene.liveLabel}</span>
          </span>
        </div>

        <div
          className={s.heroCopy}
          style={{
            opacity: clamp01(headP),
            transform: `translateY(${(1 - headP) * 18}px)`,
          }}
        >
          <h3 className={s.stageTitle}>{scene.title}</h3>
          <p className={s.stageLead}>{scene.lead}</p>
        </div>

        <div className={s.progressBox}>
          <div className={s.progressMeta}>
            <span>{scene.progressLabel}</span>
            <span className={s.progressPct}><bdi dir="ltr">{barP}%</bdi></span>
          </div>
          <div className={s.track} aria-hidden="true">
            <div className={s.fill} style={{ width: `${barP}%` }} />
          </div>
        </div>

        <div className={s.cards}>
          {scene.metrics.map((m, idx) => {
            const p = reduced ? 1 : clamp01(springProgress(f, 18 + idx * 14));
            return (
              <div
                key={m.code}
                className={s.card}
                style={{
                  opacity: clamp01(p),
                  transform: `scale(${0.92 + 0.08 * p}) translateY(${(1 - p) * 14}px)`,
                }}
              >
                <div className={s.cardHead}>
                  <span className={s.cardCode}>{m.code}</span>
                  <span className={s.cardTag}>{m.tag}</span>
                </div>
                <h4 className={s.cardTitle}>{m.title}</h4>
                <p className={s.cardDesc}>{m.desc}</p>
              </div>
            );
          })}
        </div>

        <div className={s.foot}>
          <span>{scene.footnote}</span>
          <span className={s.footAccent}>{scene.footRight}</span>
        </div>
      </div>
    </div>
  );
}
