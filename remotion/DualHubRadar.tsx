// Dual-Hub Radar & Container Telemetry Motion Composition (Remotion 4.0 — offline render).
// Metinsiz soyut vektörel animasyon: sol küme (TR üretim üssü) + sağ küme (CN tedarik üssü) → merkez denetim/istihbarat kalkanı.
// Renkler yalnız lib/ui/tokens.ts. Kesintisiz döngü: tüm fazlar t = frame / durationInFrames periyodik sin/cos/mod1.
import { AbsoluteFill, useCurrentFrame, useVideoConfig } from "remotion";
import { color, darkColor } from "../lib/ui/tokens";

const TAU = Math.PI * 2;
const hexA = (hex: string, a: number) => {
  const n = [1, 3, 5].map((i) => parseInt(hex.slice(i, i + 2), 16));
  return `rgba(${n.join(",")},${a})`;
};

const TR_NODES: [number, number][] = [[160, 170], [230, 340], [320, 120], [360, 410], [120, 390]];
const CN_NODES: [number, number][] = [[1120, 170], [1050, 340], [960, 120], [920, 410], [1160, 390]];
const CENTER: [number, number] = [640, 280];

function quad(a: readonly [number, number], b: readonly [number, number], bend: number) {
  const mx = (a[0] + b[0]) / 2;
  const my = (a[1] + b[1]) / 2;
  const dx = b[0] - a[0];
  const dy = b[1] - a[1];
  const len = Math.hypot(dx, dy) || 1;
  const cx = mx + (-dy / len) * bend;
  const cy = my + (dx / len) * bend;
  return { x1: a[0], y1: a[1], x2: b[0], y2: b[1], cx, cy, d: `M${a[0]} ${a[1]} Q${cx} ${cy} ${b[0]} ${b[1]}` };
}

function pointOnQuad(p: number, q: ReturnType<typeof quad>): [number, number] {
  const u = 1 - p;
  return [u * u * q.x1 + 2 * u * p * q.cx + p * p * q.x2, u * u * q.y1 + 2 * u * p * q.cy + p * p * q.y2];
}

export function DualHubRadar() {
  const frame = useCurrentFrame();
  const { durationInFrames } = useVideoConfig();
  const t = frame / durationInFrames;
  const sweepDeg = t * 360;
  const breath = Math.sin(TAU * t) * 8;

  const trArcs = TR_NODES.map((n, i) => quad(n, CENTER, i % 2 === 0 ? -55 : 55));
  const cnArcs = CN_NODES.map((n, i) => quad(n, CENTER, i % 2 === 0 ? 55 : -55));

  return (
    <AbsoluteFill style={{ background: `radial-gradient(circle at 50% 45%, ${darkColor.brand} 0%, ${color.primary} 55%, ${darkColor.bg} 100%)` }}>
      <svg viewBox="0 0 1280 560" width="100%" height="100%">
        <defs>
          <radialGradient id="coreGlow">
            <stop offset="0%" stopColor={color.highlight} stopOpacity="0.45" />
            <stop offset="55%" stopColor={color.accentOnDark} stopOpacity="0.16" />
            <stop offset="100%" stopColor={darkColor.bg} stopOpacity="0" />
          </radialGradient>
          <radialGradient id="packetHl">
            <stop offset="0%" stopColor={color.highlight} stopOpacity="1" />
            <stop offset="100%" stopColor={color.highlight} stopOpacity="0" />
          </radialGradient>
          <radialGradient id="packetAc">
            <stop offset="0%" stopColor={color.accentOnDark} stopOpacity="1" />
            <stop offset="100%" stopColor={color.accentOnDark} stopOpacity="0" />
          </radialGradient>
        </defs>

        {/* İnce koordinat ızgarası */}
        {Array.from({ length: 16 * 7 }, (_, idx) => {
          const gx = idx % 16;
          const gy = Math.floor(idx / 16);
          const x = 60 + gx * 78;
          const y = 50 + gy * 76;
          const pulse = 0.5 + 0.5 * Math.sin(TAU * (t + gx * 0.04 + gy * 0.03));
          return <circle key={idx} cx={x} cy={y} r={1.6} fill={hexA(color.bg, 0.06 + 0.1 * pulse)} />;
        })}

        {/* Merkez radar halkaları */}
        <circle cx={CENTER[0]} cy={CENTER[1]} r={210} fill="url(#coreGlow)" />
        {[110, 175, 240].map((r, i) => (
          <circle
            key={r}
            cx={CENTER[0]}
            cy={CENTER[1]}
            r={r}
            fill="none"
            stroke={hexA(i === 1 ? color.highlight : color.accentOnDark, 0.2)}
            strokeWidth={1.5}
            strokeDasharray={i === 1 ? "8 8" : "2 10"}
            transform={`rotate(${i % 2 === 0 ? sweepDeg : -sweepDeg} ${CENTER[0]} ${CENTER[1]})`}
          />
        ))}

        {/* Sol (TR) ve Sağ (CN) tedarik köprüleri */}
        <g transform={`translate(0 ${breath * 0.4})`}>
          {trArcs.map((q, i) => (
            <path key={`ta${i}`} d={q.d} fill="none" stroke={hexA(color.accentOnDark, 0.3)} strokeWidth={1.6} />
          ))}
          {cnArcs.map((q, i) => (
            <path key={`ca${i}`} d={q.d} fill="none" stroke={hexA(color.highlight, 0.3)} strokeWidth={1.6} />
          ))}

          {/* Akan konteyner & istihbarat veri paketleri */}
          {trArcs.map((q, i) => {
            const p = (t * 2 + i * 0.19) % 1;
            const [x, y] = pointOnQuad(p, q);
            const fade = Math.sin(Math.PI * p);
            return (
              <g key={`tp${i}`} opacity={fade}>
                <circle cx={x} cy={y} r={14} fill="url(#packetAc)" />
                <rect x={x - 5} y={y - 4} width={10} height={8} rx={2} fill={color.accentOnDark} />
              </g>
            );
          })}
          {cnArcs.map((q, i) => {
            const p = (t * 2 + i * 0.21 + 0.35) % 1;
            const [x, y] = pointOnQuad(p, q);
            const fade = Math.sin(Math.PI * p);
            return (
              <g key={`cp${i}`} opacity={fade}>
                <circle cx={x} cy={y} r={14} fill="url(#packetHl)" />
                <rect x={x - 5} y={y - 4} width={10} height={8} rx={2} fill={color.highlight} />
              </g>
            );
          })}

          {/* Üretim & Tedarik Düğümleri */}
          {TR_NODES.map(([x, y], i) => {
            const ring = (t * 2 + i * 0.17) % 1;
            return (
              <g key={`tn${i}`}>
                <circle cx={x} cy={y} r={8 + ring * 26} fill="none" stroke={hexA(color.accentOnDark, 0.4 * (1 - ring))} strokeWidth={1.5} />
                <circle cx={x} cy={y} r={7} fill={darkColor.surface} stroke={color.accentOnDark} strokeWidth={2.5} />
              </g>
            );
          })}
          {CN_NODES.map(([x, y], i) => {
            const ring = (t * 2 + i * 0.19 + 0.4) % 1;
            return (
              <g key={`cn${i}`}>
                <circle cx={x} cy={y} r={8 + ring * 26} fill="none" stroke={hexA(color.highlight, 0.4 * (1 - ring))} strokeWidth={1.5} />
                <circle cx={x} cy={y} r={7} fill={darkColor.surface} stroke={color.highlight} strokeWidth={2.5} />
              </g>
            );
          })}
        </g>

        {/* Merkez doğrulama kalkanı & denetim onay sembolü */}
        <g transform={`translate(${CENTER[0]} ${CENTER[1]})`}>
          <circle cx={0} cy={0} r={46 + Math.sin(TAU * t) * 3} fill={darkColor.surface} stroke={color.highlight} strokeWidth={3} />
          <circle cx={0} cy={0} r={34} fill={hexA(color.accentOnDark, 0.16)} stroke={color.accentOnDark} strokeWidth={1.5} />
          <path d="M-14 2 L-4 12 L16 -10" fill="none" stroke={color.highlight} strokeWidth={4.5} strokeLinecap="round" strokeLinejoin="round" />
        </g>
      </svg>
    </AbsoluteFill>
  );
}
