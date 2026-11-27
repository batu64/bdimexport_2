// bdimexport — Emprenyeli ahşap direk YouTube tanıtım videosu (1920×1080, 30 fps).
// Görseller/çekimler: remotion/youtube-poles/public (kaynak: ürünler/DİREKLERLE İLGİLİ BİLGİLER, yeniden adlandırılmış + kırpılmış).
import React from "react";
import {
  AbsoluteFill,
  Audio,
  Easing,
  Img,
  interpolate,
  OffthreadVideo,
  Sequence,
  spring,
  staticFile,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";
import { color, darkColor } from "../../lib/ui/tokens";
import { CONTACT, COPY, type AppScene, type Lang } from "./copy";

export const FPS = 30;
export const X = 14; // sahne geçiş örtüşmesi (kare)

export const NAVY = darkColor.bg;
export const GOLD = color.highlight;
export const TEAL = color.accentOnDark;
export const CREAM = darkColor.heading;
export const MUTED = darkColor.muted;
export const FONT = '"Inter", "Segoe UI", system-ui, sans-serif';
export const NUM = '"Bahnschrift", "Segoe UI", system-ui, sans-serif';

export const clamp = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;

// ── Sahne süreleri (sn)
const APP_SEC = 5.6;
const SCENES = [
  ["intro", 6],
  ["hook", 5.5],
  ["range", 8.5],
  ...Array.from({ length: 8 }, (_, i) => [`app${i}`, APP_SEC] as [string, number]),
  ["treat", 10],
  ["finish", 7],
  ["export", 10],
  ["why", 7.5],
  ["cta", 9],
] as [string, number][];

export const TIMELINE = (() => {
  let at = 0;
  return SCENES.map(([id, sec]) => {
    const dur = Math.round(sec * FPS);
    const s = { id, from: at, dur };
    at += dur - X;
    return s;
  });
})();
export const TOTAL_FRAMES = TIMELINE[TIMELINE.length - 1].from + TIMELINE[TIMELINE.length - 1].dur;

// ── Yardımcılar
export function useFade() {
  const f = useCurrentFrame();
  const { durationInFrames: d } = useVideoConfig();
  return interpolate(f, [0, X, d - X, d], [0, 1, 1, 0], clamp);
}

export function useRise(delay: number, dist = 40) {
  const f = useCurrentFrame();
  const { fps } = useVideoConfig();
  const p = spring({ frame: f - delay, fps, config: { damping: 18, mass: 0.8 } });
  return { opacity: interpolate(p, [0, 1], [0, 1]), transform: `translateY(${(1 - p) * dist}px)` };
}

export const Rise: React.FC<{ delay?: number; dist?: number; style?: React.CSSProperties; children: React.ReactNode }> = ({
  delay = 0,
  dist,
  style,
  children,
}) => {
  const r = useRise(delay, dist);
  return <div style={{ ...style, ...r }}>{children}</div>;
};

/** Ken Burns fotoğraf — yavaş yakınlaşma + kayma */
export const KB: React.FC<{
  src: string;
  zoom?: [number, number];
  pan?: [number, number];
  pos?: string;
  style?: React.CSSProperties;
  blur?: number;
}> = ({ src, zoom = [1.06, 1.18], pan = [0, -2], pos = "center", style, blur = 0 }) => {
  const f = useCurrentFrame();
  const { durationInFrames: d } = useVideoConfig();
  const t = interpolate(f, [0, d], [0, 1], { ...clamp, easing: Easing.inOut(Easing.quad) });
  const s = zoom[0] + (zoom[1] - zoom[0]) * t;
  const x = pan[0] + (pan[1] - pan[0]) * t;
  return (
    <div style={{ position: "absolute", inset: 0, overflow: "hidden", ...style }}>
      <Img
        src={staticFile(src)}
        style={{
          width: "100%",
          height: "100%",
          objectFit: "cover",
          objectPosition: pos,
          transform: `scale(${s}) translateX(${x}%)`,
          filter: blur ? `blur(${blur}px) brightness(0.55)` : undefined,
        }}
      />
    </div>
  );
};

export const Kicker: React.FC<{ children: React.ReactNode; delay?: number; c?: string }> = ({ children, delay = 0, c = GOLD }) => {
  const f = useCurrentFrame();
  const w = interpolate(f - delay, [0, 18], [0, 56], { ...clamp, easing: Easing.out(Easing.cubic) });
  return (
    <Rise delay={delay} dist={20} style={{ display: "flex", alignItems: "center", gap: 18 }}>
      <div style={{ width: w, height: 4, background: c, borderRadius: 2 }} />
      <div style={{ color: c, fontSize: 26, fontWeight: 700, letterSpacing: "0.16em" }}>{children}</div>
    </Rise>
  );
};

export const Wordmark: React.FC<{ size?: number; logo?: number }> = ({ size = 56, logo }) => (
  <div style={{ display: "flex", alignItems: "center", gap: size * 0.3 }}>
    <Img src={staticFile("logo-gold.png")} style={{ width: logo ?? size * 1.25, height: logo ?? size * 1.25 }} />
    <div style={{ fontSize: size, fontWeight: 700, color: CREAM, letterSpacing: "-0.02em" }}>
      bdim<span style={{ color: GOLD }}>export</span>
    </div>
  </div>
);

export const Scene: React.FC<{ children: React.ReactNode; bg?: string }> = ({ children, bg = NAVY }) => {
  const o = useFade();
  return <AbsoluteFill style={{ background: bg, opacity: o, fontFamily: FONT, color: CREAM }}>{children}</AbsoluteFill>;
};

export const Shade: React.FC<{ dir?: string; a?: number; b?: number }> = ({ dir = "90deg", a = 0.92, b = 0.15 }) => (
  <AbsoluteFill
    style={{ background: `linear-gradient(${dir}, rgba(12,21,37,${a}) 0%, rgba(12,21,37,${(a + b) / 2}) 45%, rgba(12,21,37,${b}) 100%)` }}
  />
);

// ── 1. Giriş
const Intro: React.FC<{ lang: Lang }> = ({ lang }) => {
  const c = COPY[lang];
  const f = useCurrentFrame();
  const { fps } = useVideoConfig();
  const lp = spring({ frame: f - 6, fps, config: { damping: 14 } });
  const line = interpolate(f, [30, 70], [0, 1], { ...clamp, easing: Easing.out(Easing.cubic) });
  return (
    <Scene>
      <KB src="brown-poles.jpg" zoom={[1.25, 1.08]} pan={[-3, 2]} />
      <Shade dir="0deg" a={0.95} b={0.35} />
      <AbsoluteFill style={{ alignItems: "center", justifyContent: "center", flexDirection: "column", gap: 36 }}>
        <div style={{ transform: `scale(${0.6 + lp * 0.4})`, opacity: lp }}>
          <Wordmark size={92} />
        </div>
        <div style={{ width: 900 * line, height: 3, background: `linear-gradient(90deg, transparent, ${GOLD}, transparent)` }} />
        <Rise delay={34}>
          <div style={{ fontSize: 26, letterSpacing: "0.22em", color: TEAL, fontWeight: 600, textAlign: "center" }}>{c.introTag}</div>
        </Rise>
        <Rise delay={44}>
          <div style={{ fontSize: 76, fontWeight: 800, textAlign: "center", letterSpacing: "-0.02em", lineHeight: 1.05 }}>
            {c.introTitle}
          </div>
        </Rise>
        <Rise delay={56}>
          <div style={{ fontSize: 32, color: MUTED, textAlign: "center" }}>{c.introSub}</div>
        </Rise>
      </AbsoluteFill>
    </Scene>
  );
};

// ── 2. Kanca
const Hook: React.FC<{ lang: Lang }> = ({ lang }) => {
  const c = COPY[lang];
  return (
    <Scene>
      <KB src="yard-overview.jpg" zoom={[1.05, 1.2]} pan={[2, -2]} />
      <Shade a={0.9} b={0.05} />
      <AbsoluteFill style={{ padding: "0 140px", justifyContent: "center", gap: 28 }}>
        <Kicker delay={6}>{c.hookKicker}</Kicker>
        {c.hookLines.map((l, i) => (
          <Rise key={i} delay={14 + i * 12}>
            <div style={{ fontSize: 112, fontWeight: 800, lineHeight: 1, letterSpacing: "-0.03em", color: i ? GOLD : CREAM }}>{l}</div>
          </Rise>
        ))}
      </AbsoluteFill>
    </Scene>
  );
};

// ── 3. Ürün gamı — çap halkaları
const Range: React.FC<{ lang: Lang }> = ({ lang }) => {
  const c = COPY[lang];
  const f = useCurrentFrame();
  const { fps } = useVideoConfig();
  const dias = [5, 6, 8, 10, 12, 14, 16, 18, 20];
  return (
    <Scene>
      <KB src="q14-treated.jpg" blur={18} zoom={[1.2, 1.3]} />
      <AbsoluteFill style={{ background: "rgba(12,21,37,0.72)" }} />
      <AbsoluteFill style={{ padding: "110px 140px", gap: 22 }}>
        <Kicker delay={4}>{c.rangeKicker}</Kicker>
        <Rise delay={10}>
          <div style={{ fontSize: 68, fontWeight: 800, letterSpacing: "-0.02em" }}>{c.rangeTitle}</div>
        </Rise>
        {/* çap halkaları */}
        <div style={{ display: "flex", alignItems: "flex-end", gap: 30, height: 300, marginTop: 60 }}>
          {dias.map((d, i) => {
            const p = spring({ frame: f - 24 - i * 5, fps, config: { damping: 12 } });
            const px = d * 12;
            return (
              <div key={d} style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 18 }}>
                <div
                  style={{
                    width: px,
                    height: px,
                    borderRadius: "50%",
                    transform: `scale(${p})`,
                    background: `radial-gradient(circle, #d9b27a 0%, #c79a5c 30%, #a87a3e 55%, #8b6230 75%, #6e4c24 100%)`,
                    boxShadow: `0 0 0 ${Math.max(2, d / 3)}px ${d % 4 === 0 ? "#5a4a2a" : "#4c6b3a"}, 0 12px 30px rgba(0,0,0,0.5)`,
                    position: "relative",
                  }}
                >
                  {/* yıllık halka */}
                  <div style={{ position: "absolute", inset: "22%", borderRadius: "50%", border: "1.5px solid rgba(90,55,20,0.45)" }} />
                  <div style={{ position: "absolute", inset: "40%", borderRadius: "50%", border: "1.5px solid rgba(90,55,20,0.45)" }} />
                </div>
                <div style={{ fontFamily: NUM, fontSize: 30, fontWeight: 600, opacity: p, color: CREAM }}>Ø{d}</div>
              </div>
            );
          })}
        </div>
        <div style={{ display: "flex", gap: 40, marginTop: 50 }}>
          {[
            [c.rangeTurned, c.rangeTurnedSub, GOLD],
            [c.rangeUtility, c.rangeUtilitySub, TEAL],
          ].map(([v, s, col], i) => (
            <Rise key={i} delay={80 + i * 12} style={{ flex: 1 }}>
              <div
                style={{
                  borderLeft: `6px solid ${col}`,
                  background: "rgba(19,32,56,0.85)",
                  padding: "26px 34px",
                  borderRadius: 12,
                }}
              >
                <div style={{ fontFamily: NUM, fontSize: 64, fontWeight: 700, color: col }}>{v}</div>
                <div style={{ fontSize: 30, color: CREAM, marginTop: 4 }}>{s}</div>
              </div>
            </Rise>
          ))}
        </div>
      </AbsoluteFill>
    </Scene>
  );
};

// ── 4. Uygulama sahneleri (8 adet, sağ/sol dönüşümlü)
const App: React.FC<{ a: AppScene; i: number; lang: Lang }> = ({ a, i, lang }) => {
  const c = COPY[lang];
  const f = useCurrentFrame();
  const flip = i % 2 === 1;
  const reveal = interpolate(f, [0, 22], [100, 0], { ...clamp, easing: Easing.out(Easing.cubic) });
  const inset = spring({ frame: f - 26, fps: FPS, config: { damping: 16 } });
  return (
    <Scene>
      {/* fotoğraf paneli */}
      <div
        style={{
          position: "absolute",
          top: 0,
          bottom: 0,
          [flip ? "right" : "left"]: 0,
          width: "56%",
          clipPath: flip ? `inset(0 0 0 ${reveal}%)` : `inset(0 ${reveal}% 0 0)`,
        }}
      >
        <KB src={a.img} zoom={[1.04, 1.16]} pan={flip ? [1.5, -1.5] : [-1.5, 1.5]} />
        <AbsoluteFill
          style={{ background: `linear-gradient(${flip ? "270deg" : "90deg"}, transparent 70%, ${NAVY} 100%)` }}
        />
      </div>
      {/* ek görsel */}
      <div
        style={{
          position: "absolute",
          bottom: 70,
          [flip ? "right" : "left"]: `calc(56% - ${190}px)`,
          width: 340,
          height: 250,
          borderRadius: 16,
          overflow: "hidden",
          border: `4px solid ${GOLD}`,
          boxShadow: "0 20px 50px rgba(0,0,0,0.55)",
          transform: `scale(${inset}) rotate(${flip ? 2 : -2}deg)`,
          opacity: inset,
        }}
      >
        <KB src={a.inset} zoom={[1.1, 1.2]} />
      </div>
      {/* metin paneli */}
      <div
        style={{
          position: "absolute",
          top: 0,
          bottom: 0,
          [flip ? "left" : "right"]: 0,
          width: "44%",
          padding: flip ? "0 80px 0 120px" : "0 110px 0 200px",
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          gap: 22,
        }}
      >
        <Rise delay={8} dist={20}>
          <div style={{ display: "flex", alignItems: "baseline", gap: 16 }}>
            <span style={{ fontFamily: NUM, fontSize: 30, color: GOLD, fontWeight: 700 }}>{String(i + 1).padStart(2, "0")}</span>
            <span style={{ fontSize: 22, letterSpacing: "0.18em", color: MUTED, fontWeight: 600 }}>{c.appsKicker}</span>
          </div>
        </Rise>
        <Rise delay={12}>
          <div style={{ fontSize: 30, color: TEAL, fontWeight: 700 }}>{a.kicker}</div>
        </Rise>
        <Rise delay={16}>
          <div style={{ fontSize: 58, fontWeight: 800, lineHeight: 1.08, letterSpacing: "-0.02em" }}>{a.title}</div>
        </Rise>
        <div style={{ display: "flex", flexDirection: "column", gap: 14, marginTop: 14 }}>
          {a.specs.map((s, k) => (
            <Rise key={k} delay={30 + k * 8} dist={24}>
              <div style={{ display: "flex", alignItems: "center", gap: 18, fontSize: 32 }}>
                <div style={{ width: 14, height: 14, borderRadius: 3, background: GOLD, transform: "rotate(45deg)", flexShrink: 0 }} />
                <span>{s}</span>
              </div>
            </Rise>
          ))}
        </div>
      </div>
    </Scene>
  );
};

// ── 5. Emprenye süreci
const Treat: React.FC<{ lang: Lang }> = ({ lang }) => {
  const c = COPY[lang];
  const f = useCurrentFrame();
  const bar = interpolate(f, [30, 150], [0, 1], { ...clamp, easing: Easing.inOut(Easing.cubic) });
  return (
    <Scene>
      <KB src="yard-rain.jpg" blur={14} zoom={[1.15, 1.25]} />
      <AbsoluteFill style={{ background: "rgba(12,21,37,0.8)" }} />
      <AbsoluteFill style={{ padding: "100px 140px", gap: 20 }}>
        <Kicker delay={4} c={TEAL}>
          {c.treatKicker}
        </Kicker>
        <Rise delay={10}>
          <div style={{ fontSize: 76, fontWeight: 800, letterSpacing: "-0.02em" }}>{c.treatTitle}</div>
        </Rise>
        {/* adımlar */}
        <div style={{ position: "relative", marginTop: 100, display: "flex", justifyContent: "space-between" }}>
          <div style={{ position: "absolute", top: 46, left: 46, right: 46, height: 4, background: "rgba(255,255,255,0.12)" }} />
          <div
            style={{
              position: "absolute",
              top: 46,
              left: 46,
              width: `calc((100% - 92px) * ${bar})`,
              height: 4,
              background: `linear-gradient(90deg, ${TEAL}, ${GOLD})`,
            }}
          />
          {c.treatSteps.map((s, i) => {
            const on = bar >= i / 3 - 0.001;
            return (
              <Rise key={i} delay={24 + i * 30} style={{ width: 380, display: "flex", flexDirection: "column", alignItems: i === 0 ? "flex-start" : i === 3 ? "flex-end" : "center", textAlign: i === 0 ? "left" : i === 3 ? "right" : "center" }}>
                <div
                  style={{
                    width: 96,
                    height: 96,
                    borderRadius: "50%",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontFamily: NUM,
                    fontSize: 36,
                    fontWeight: 700,
                    background: on ? GOLD : darkColor.surface,
                    color: on ? NAVY : CREAM,
                    border: `3px solid ${on ? GOLD : darkColor.border}`,
                    position: "relative",
                  }}
                >
                  {s.n}
                </div>
                <div style={{ fontSize: 34, fontWeight: 700, marginTop: 22 }}>{s.t}</div>
                <div style={{ fontSize: 28, color: TEAL, marginTop: 6, fontFamily: NUM }}>{s.v}</div>
              </Rise>
            );
          })}
        </div>
        {/* değerler */}
        <div style={{ display: "flex", gap: 24, marginTop: 120 }}>
          {c.treatStats.map((s, i) => (
            <Rise key={i} delay={150 + i * 8} style={{ flex: 1 }}>
              <div style={{ background: "rgba(19,32,56,0.9)", borderRadius: 14, padding: "34px 32px", borderTop: `4px solid ${GOLD}` }}>
                <div style={{ fontFamily: NUM, fontSize: 54, fontWeight: 700, color: GOLD }}>{s.v}</div>
                <div style={{ fontSize: 24, color: MUTED, marginTop: 4 }}>{s.l}</div>
              </div>
            </Rise>
          ))}
        </div>
      </AbsoluteFill>
    </Scene>
  );
};

// ── 6. Renk/uç seçenekleri
const Finish: React.FC<{ lang: Lang }> = ({ lang }) => {
  const c = COPY[lang];
  const cards: [string, string, string, string][] = [
    ["q10-green.jpg", c.green, c.greenSub, "#6f8f4e"],
    ["brown-poles.jpg", c.brown, c.brownSub, "#9a6232"],
  ];
  return (
    <Scene>
      <AbsoluteFill style={{ padding: "90px 140px", gap: 18 }}>
        <Kicker delay={4}>{c.finishKicker}</Kicker>
        <Rise delay={10}>
          <div style={{ fontSize: 68, fontWeight: 800, letterSpacing: "-0.02em" }}>{c.finishTitle}</div>
        </Rise>
        <div style={{ display: "flex", gap: 40, marginTop: 34, flex: 1 }}>
          {cards.map(([img, t, s, col], i) => (
            <Rise key={i} delay={22 + i * 12} dist={60} style={{ flex: 1, display: "flex" }}>
              <div style={{ flex: 1, position: "relative", borderRadius: 20, overflow: "hidden", border: `3px solid ${col}` }}>
                <KB src={img} zoom={[1.05, 1.15]} />
                <AbsoluteFill style={{ background: "linear-gradient(0deg, rgba(12,21,37,0.95) 0%, rgba(12,21,37,0) 60%)" }} />
                <div style={{ position: "absolute", left: 36, right: 36, bottom: 30 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
                    <div style={{ width: 30, height: 30, borderRadius: "50%", background: col, border: "3px solid #fff" }} />
                    <div style={{ fontSize: 44, fontWeight: 800 }}>{t}</div>
                  </div>
                  <div style={{ fontSize: 28, color: MUTED, marginTop: 8 }}>{s}</div>
                </div>
              </div>
            </Rise>
          ))}
        </div>
        <div style={{ display: "flex", gap: 20, marginTop: 28 }}>
          {c.finishChips.map((ch, i) => (
            <Rise key={i} delay={50 + i * 8} dist={20}>
              <div style={{ padding: "14px 28px", borderRadius: 999, border: `2px solid ${TEAL}`, color: TEAL, fontSize: 28, fontWeight: 600 }}>
                {ch}
              </div>
            </Rise>
          ))}
        </div>
      </AbsoluteFill>
    </Scene>
  );
};

// ── 7. İhracat lojistiği — yükleme videosu + sayaç
const Export: React.FC<{ lang: Lang }> = ({ lang }) => {
  const c = COPY[lang];
  const f = useCurrentFrame();
  const n = Math.round(interpolate(f, [30, 110], [0, Number(c.exportCount)], { ...clamp, easing: Easing.out(Easing.cubic) }));
  const swap = interpolate(f, [150, 175], [0, 1], clamp);
  return (
    <Scene>
      {/* sol: dikey video, bulanık zemin */}
      <div style={{ position: "absolute", left: 0, top: 0, bottom: 0, width: "50%", overflow: "hidden" }}>
        <OffthreadVideo
          src={staticFile("loading.mp4")}
          startFrom={36 * FPS}
          muted
          style={{ position: "absolute", width: "100%", height: "100%", objectFit: "cover", filter: "blur(24px) brightness(0.5)", transform: "scale(1.2)" }}
        />
        <div style={{ position: "absolute", top: 60, bottom: 60, left: "50%", transform: "translateX(-50%)", aspectRatio: "9 / 16", borderRadius: 22, overflow: "hidden", border: `4px solid ${GOLD}`, boxShadow: "0 30px 60px rgba(0,0,0,0.6)" }}>
          <OffthreadVideo src={staticFile("loading.mp4")} startFrom={36 * FPS} muted style={{ width: "100%", height: "100%", objectFit: "cover" }} />
        </div>
      </div>
      {/* sağ: metin */}
      <div style={{ position: "absolute", right: 0, top: 0, bottom: 0, width: "50%", padding: "0 130px 0 90px", display: "flex", flexDirection: "column", justifyContent: "center", gap: 20 }}>
        <Kicker delay={4}>{c.exportKicker}</Kicker>
        <Rise delay={10}>
          <div style={{ fontSize: 62, fontWeight: 800, lineHeight: 1.08, letterSpacing: "-0.02em" }}>{c.exportTitle}</div>
        </Rise>
        <Rise delay={24}>
          <div style={{ display: "flex", alignItems: "baseline", gap: 24, marginTop: 20 }}>
            <div style={{ fontFamily: NUM, fontSize: 190, fontWeight: 700, color: GOLD, lineHeight: 1 }}>{n}</div>
          </div>
          <div style={{ fontSize: 34, color: CREAM, marginTop: 6 }}>{c.exportCountSub}</div>
        </Rise>
        <div style={{ display: "flex", gap: 24, marginTop: 26 }}>
          {c.exportSpecs.map((s, i) => (
            <Rise key={i} delay={70 + i * 10} style={{ flex: 1 }}>
              <div style={{ background: darkColor.surface, borderRadius: 14, padding: "20px 26px", borderLeft: `5px solid ${TEAL}` }}>
                <div style={{ fontFamily: NUM, fontSize: 44, fontWeight: 700, color: TEAL }}>{s.v}</div>
                <div style={{ fontSize: 24, color: MUTED }}>{s.l}</div>
              </div>
            </Rise>
          ))}
        </div>
        {/* küçük foto şeridi */}
        <div style={{ display: "flex", gap: 18, marginTop: 30, height: 170 }}>
          {["container-interior.jpg", "dispatch-trucks.jpg", "loading-telehandler.jpg"].map((s, i) => (
            <Rise key={s} delay={100 + i * 8} style={{ flex: 1, position: "relative", borderRadius: 12, overflow: "hidden", opacity: 0.4 + swap * 0.6 }}>
              <KB src={s} zoom={[1.05, 1.15]} />
            </Rise>
          ))}
        </div>
      </div>
    </Scene>
  );
};

// ── 8. Neden bdimexport
const ICONS = [
  // fabrika
  "M3 21V10l6 4V10l6 4V6h6v15z",
  // cetvel/ölçü
  "M3 17 17 3l4 4L7 21zM7 13l2 2M10 10l2 2M13 7l2 2",
  // belge
  "M6 2h9l5 5v15H6zM14 2v6h6M9 13h8M9 17h8",
  // küre
  "M12 2a10 10 0 1 0 0 20 10 10 0 0 0 0-20zM2 12h20M12 2c3 3 4 6.5 4 10s-1 7-4 10c-3-3-4-6.5-4-10s1-7 4-10z",
];
const Why: React.FC<{ lang: Lang }> = ({ lang }) => {
  const c = COPY[lang];
  return (
    <Scene>
      <KB src="yard-portrait.jpg" blur={16} zoom={[1.2, 1.3]} />
      <AbsoluteFill style={{ background: "rgba(12,21,37,0.82)" }} />
      <AbsoluteFill style={{ padding: "120px 140px", gap: 20 }}>
        <Kicker delay={4}>{c.whyKicker}</Kicker>
        <Rise delay={10}>
          <div style={{ fontSize: 72, fontWeight: 800, letterSpacing: "-0.02em" }}>{c.whyTitle}</div>
        </Rise>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 36, marginTop: 80 }}>
          {c.why.map((w, i) => (
            <Rise key={i} delay={24 + i * 10} dist={40}>
              <div style={{ display: "flex", gap: 30, alignItems: "center", background: "rgba(19,32,56,0.92)", borderRadius: 18, padding: "48px 40px", border: `1px solid ${darkColor.border}` }}>
                <div style={{ width: 96, height: 96, borderRadius: 20, background: "rgba(232,161,61,0.14)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                  <svg viewBox="0 0 24 24" width={54} height={54} fill="none" stroke={GOLD} strokeWidth={1.6} strokeLinejoin="round" strokeLinecap="round">
                    <path d={ICONS[i]} />
                  </svg>
                </div>
                <div>
                  <div style={{ fontSize: 38, fontWeight: 800 }}>{w.t}</div>
                  <div style={{ fontSize: 28, color: MUTED, marginTop: 6 }}>{w.d}</div>
                </div>
              </div>
            </Rise>
          ))}
        </div>
      </AbsoluteFill>
    </Scene>
  );
};

// ── 9. Kapanış / CTA
const Cta: React.FC<{ lang: Lang }> = ({ lang }) => {
  const c = COPY[lang];
  const f = useCurrentFrame();
  const pulse = 1 + Math.sin(f / 8) * 0.025;
  const rows: [string, string][] = [
    ["M12 2a10 10 0 1 0 0 20 10 10 0 0 0 0-20zM2 12h20M12 2c3 3 4 6.5 4 10s-1 7-4 10c-3-3-4-6.5-4-10s1-7 4-10z", CONTACT.web],
    ["M3 5h18v14H3zM3 6l9 7 9-7", CONTACT.mail],
    ["M5 3h4l2 5-3 2a11 11 0 0 0 6 6l2-3 5 2v4a2 2 0 0 1-2 2A17 17 0 0 1 3 5a2 2 0 0 1 2-2z", CONTACT.phone],
  ];
  return (
    <Scene>
      <KB src="vineyard-sea.jpg" zoom={[1.05, 1.15]} />
      <AbsoluteFill style={{ background: "radial-gradient(ellipse 60% 70% at 50% 50%, rgba(12,21,37,0.78) 0%, rgba(12,21,37,0.95) 100%)" }} />
      <AbsoluteFill style={{ alignItems: "center", justifyContent: "center", flexDirection: "column", gap: 30 }}>
        <Rise delay={4}>
          <Wordmark size={80} />
        </Rise>
        <Rise delay={14}>
          <div style={{ fontSize: 84, fontWeight: 800, letterSpacing: "-0.02em", textAlign: "center" }}>{c.ctaTitle}</div>
        </Rise>
        <Rise delay={22}>
          <div style={{ fontSize: 34, color: MUTED, textAlign: "center", maxWidth: 1200 }}>{c.ctaSub}</div>
        </Rise>
        <div style={{ display: "flex", gap: 50, marginTop: 20 }}>
          {rows.map(([d, t], i) => (
            <Rise key={i} delay={34 + i * 8} dist={20}>
              <div style={{ display: "flex", alignItems: "center", gap: 16, fontSize: 36, fontWeight: 600 }}>
                <svg viewBox="0 0 24 24" width={40} height={40} fill="none" stroke={TEAL} strokeWidth={1.8} strokeLinejoin="round">
                  <path d={d} />
                </svg>
                {t}
              </div>
            </Rise>
          ))}
        </div>
        <Rise delay={60}>
          <div
            style={{
              marginTop: 30,
              background: GOLD,
              color: NAVY,
              fontSize: 40,
              fontWeight: 800,
              padding: "22px 70px",
              borderRadius: 999,
              transform: `scale(${pulse})`,
              boxShadow: "0 16px 40px rgba(232,161,61,0.35)",
            }}
          >
            {c.ctaButton} →
          </div>
        </Rise>
      </AbsoluteFill>
    </Scene>
  );
};

// ── Kalıcı köşe logosu (giriş ve kapanış dışında)
const Bug: React.FC = () => {
  const f = useCurrentFrame();
  const { durationInFrames: d } = useVideoConfig();
  const o = interpolate(f, [0, 20, d - 20, d], [0, 0.9, 0.9, 0], clamp);
  return (
    <div style={{ position: "absolute", right: 40, top: 32, opacity: o, fontFamily: FONT, background: "rgba(12,21,37,0.72)", padding: "10px 20px", borderRadius: 999 }}>
      <Wordmark size={30} />
    </div>
  );
};

/** Alt ilerleme çizgisi */
const Progress: React.FC = () => {
  const f = useCurrentFrame();
  const { durationInFrames: d } = useVideoConfig();
  return <div style={{ position: "absolute", left: 0, bottom: 0, height: 5, width: `${(f / d) * 100}%`, background: GOLD, opacity: 0.85 }} />;
};

export const PolesVideo: React.FC<{ lang: Lang }> = ({ lang }) => {
  const c = COPY[lang];
  const { durationInFrames } = useVideoConfig();
  const render = (id: string) => {
    if (id === "intro") return <Intro lang={lang} />;
    if (id === "hook") return <Hook lang={lang} />;
    if (id === "range") return <Range lang={lang} />;
    if (id.startsWith("app")) {
      const i = Number(id.slice(3));
      return <App a={c.apps[i]} i={i} lang={lang} />;
    }
    if (id === "treat") return <Treat lang={lang} />;
    if (id === "finish") return <Finish lang={lang} />;
    if (id === "export") return <Export lang={lang} />;
    if (id === "why") return <Why lang={lang} />;
    return <Cta lang={lang} />;
  };
  const bugFrom = TIMELINE[1].from + X;
  const bugTo = TIMELINE[TIMELINE.length - 1].from;
  return (
    <AbsoluteFill style={{ background: NAVY }}>
      {TIMELINE.map((s) => (
        <Sequence key={s.id} from={s.from} durationInFrames={s.dur} name={s.id}>
          {render(s.id)}
        </Sequence>
      ))}
      <Sequence from={bugFrom} durationInFrames={bugTo - bugFrom + X}>
        <Bug />
      </Sequence>
      <Progress />
      <Audio
        src={staticFile("music.wav")}
        volume={(f) => interpolate(f, [0, 30, durationInFrames - 60, durationInFrames], [0, 0.8, 0.8, 0], clamp)}
      />
    </AbsoluteFill>
  );
};

// ── YouTube küçük resmi (1280×720 still)
export const Thumbnail: React.FC<{ lang: Lang }> = ({ lang }) => {
  const t = lang === "en" ? ["WOODEN POLES", "Export-ready · Ø5–Ø20 cm · up to 12 m"] : ["AHŞAP DİREK", "İhracata hazır · Ø5–Ø20 cm · 12 m'ye kadar"];
  return (
    <AbsoluteFill style={{ background: NAVY, fontFamily: FONT, color: CREAM }}>
      <Img src={staticFile("brown-poles.jpg")} style={{ position: "absolute", width: "100%", height: "100%", objectFit: "cover" }} />
      <AbsoluteFill style={{ background: "linear-gradient(90deg, rgba(12,21,37,0.96) 0%, rgba(12,21,37,0.75) 50%, rgba(12,21,37,0.05) 100%)" }} />
      <div style={{ position: "absolute", left: 70, top: 60 }}>
        <Wordmark size={44} />
      </div>
      <div style={{ position: "absolute", left: 70, bottom: 90, width: 760 }}>
        <div style={{ fontSize: 118, fontWeight: 900, lineHeight: 0.95, letterSpacing: "-0.03em", color: GOLD }}>{t[0]}</div>
        <div style={{ fontSize: 38, fontWeight: 700, marginTop: 22 }}>{t[1]}</div>
      </div>
      <div style={{ position: "absolute", right: 60, bottom: 60, width: 300, height: 400, borderRadius: 18, overflow: "hidden", border: `6px solid ${GOLD}`, transform: "rotate(3deg)", boxShadow: "0 20px 50px rgba(0,0,0,0.6)" }}>
        <Img src={staticFile("vine-head-q12.jpg")} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
      </div>
    </AbsoluteFill>
  );
};
