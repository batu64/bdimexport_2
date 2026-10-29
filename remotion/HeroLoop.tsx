// Hero arka plan döngüsü — soyut küresel ticaret ağı (metinsiz; başlık HTML'de). Renkler lib/ui/tokens.ts (tek kaynak).
// Kesintisiz döngü: tüm hareketler t = frame / süre'nin periyodik fonksiyonu (sin/cos, mod 1) → son kare = ilk kare.
// Kompozisyon sağ ağırlıklı: sol üçte bir başlık için boş (prompts/visual-brand.md "room for text overlay").
import { AbsoluteFill, useCurrentFrame, useVideoConfig } from "remotion";
import { color, darkColor } from "../lib/ui/tokens";

const TAU = Math.PI * 2;
const hexA = (hex: string, a: number) => {
  const n = [1, 3, 5].map((i) => parseInt(hex.slice(i, i + 2), 16));
  return `rgba(${n.join(",")},${a})`;
};

// düğümler (1280×720 tuval; sağ %60)
const NODES = [
  [560, 210], [700, 120], [760, 330], [900, 200], [980, 420], [1080, 150], [1150, 300], [860, 560], [1060, 600], [640, 470],
] as const;
// yaylar: [a, b, eğrilik, hız, faz, renk]
const ARCS: [number, number, number, number, number, "hl" | "ac"][] = [
  [0, 3, -90, 1, 0.0, "hl"], [1, 5, -70, 1, 0.35, "ac"], [2, 4, 60, 2, 0.15, "ac"], [3, 6, -50, 1, 0.6, "hl"],
  [9, 7, 50, 1, 0.8, "ac"], [7, 8, -40, 2, 0.25, "hl"], [2, 6, -80, 1, 0.5, "ac"], [0, 9, 40, 1, 0.1, "ac"],
  [4, 8, 30, 1, 0.7, "hl"], [1, 2, 40, 2, 0.45, "hl"],
];

function arc(a: number, b: number, bend: number) {
  const [x1, y1] = NODES[a];
  const [x2, y2] = NODES[b];
  const mx = (x1 + x2) / 2, my = (y1 + y2) / 2;
  const len = Math.hypot(x2 - x1, y2 - y1) || 1;
  const cx = mx + (-(y2 - y1) / len) * bend, cy = my + ((x2 - x1) / len) * bend;
  return { x1, y1, x2, y2, cx, cy, d: `M${x1} ${y1} Q${cx} ${cy} ${x2} ${y2}` };
}
const qp = (p: number, a: ReturnType<typeof arc>) => {
  const u = 1 - p;
  return [u * u * a.x1 + 2 * u * p * a.cx + p * p * a.x2, u * u * a.y1 + 2 * u * p * a.cy + p * p * a.y2];
};

export function HeroLoop() {
  const frame = useCurrentFrame();
  const { durationInFrames } = useVideoConfig();
  const t = frame / durationInFrames; // 0..1, periyodik
  const driftX = Math.sin(TAU * t) * 12;
  const driftY = Math.cos(TAU * t) * 8;

  return (
    <AbsoluteFill style={{ background: `radial-gradient(ellipse 70% 80% at 75% 40%, ${darkColor.brand} 0%, ${color.primary} 55%, ${darkColor.bg} 100%)` }}>
      <svg viewBox="0 0 1280 720" width="100%" height="100%">
        <defs>
          <radialGradient id="glowHl">
            <stop offset="0%" stopColor={color.highlight} stopOpacity="0.9" />
            <stop offset="100%" stopColor={color.highlight} stopOpacity="0" />
          </radialGradient>
          <radialGradient id="glowAc">
            <stop offset="0%" stopColor={color.accentOnDark} stopOpacity="0.9" />
            <stop offset="100%" stopColor={color.accentOnDark} stopOpacity="0" />
          </radialGradient>
        </defs>

        {/* nokta matrisi — dalga ile nefes alır */}
        {Array.from({ length: 22 * 12 }, (_, i) => {
          const gx = i % 22, gy = Math.floor(i / 22);
          const x = 40 + gx * 58, y = 30 + gy * 60;
          const w = 0.5 + 0.5 * Math.sin(TAU * (t + gx * 0.035 + gy * 0.02));
          const fade = Math.min(1, Math.max(0, (x - 300) / 500)); // sol taraf sakin (metin alanı)
          return <circle key={i} cx={x} cy={y} r={1.6} fill={hexA(color.bg, (0.05 + 0.12 * w) * fade)} />;
        })}

        <g transform={`translate(${driftX} ${driftY})`}>
          {ARCS.map(([a, b, bend, , , c], i) => (
            <path key={`a${i}`} d={arc(a, b, bend).d} fill="none" stroke={hexA(c === "hl" ? color.highlight : color.accentOnDark, 0.22)} strokeWidth={1.4} />
          ))}
          {/* yaylar üzerinde ilerleyen ışık darbeleri */}
          {ARCS.map(([a, b, bend, speed, phase, c], i) => {
            const geo = arc(a, b, bend);
            const p = (t * speed + phase) % 1;
            const [x, y] = qp(p, geo);
            const vis = Math.sin(Math.PI * p); // uçlarda sön
            return (
              <g key={`p${i}`} opacity={vis}>
                <circle cx={x} cy={y} r={16} fill={`url(#${c === "hl" ? "glowHl" : "glowAc"})`} />
                <circle cx={x} cy={y} r={3} fill={c === "hl" ? color.highlight : color.accentOnDark} />
              </g>
            );
          })}
          {/* düğümler + yayılan halkalar */}
          {NODES.map(([x, y], i) => {
            const ring = (t * 2 + i * 0.13) % 1;
            return (
              <g key={`n${i}`}>
                <circle cx={x} cy={y} r={6 + ring * 26} fill="none" stroke={hexA(color.accentOnDark, 0.35 * (1 - ring))} strokeWidth={1.2} />
                <circle cx={x} cy={y} r={5} fill={darkColor.surface} stroke={i % 3 === 0 ? color.highlight : color.accentOnDark} strokeWidth={2} />
              </g>
            );
          })}
        </g>
      </svg>
      {/* sol kenar okunurluk degradesi (başlık alanı) */}
      <AbsoluteFill style={{ background: `linear-gradient(90deg, ${hexA(color.primary, 0.85)} 0%, ${hexA(color.primary, 0.35)} 45%, ${hexA(color.primary, 0)} 70%)` }} />
    </AbsoluteFill>
  );
}
