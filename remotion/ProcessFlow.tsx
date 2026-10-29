// 5 adımlı süreç infografiği (metinsiz; adım adları HTML'de — Steps bileşeni). Renkler lib/ui/tokens.ts.
// Kargo noktası rota boyunca ilerler; geçtiği durak dolar ve onay işareti çizilir. Döngü sonunda yumuşak sönüp yeniden başlar.
import { AbsoluteFill, Easing, interpolate, useCurrentFrame, useVideoConfig } from "remotion";
import { color } from "../lib/ui/tokens";

const W = 1600, H = 400, N = 5, X0 = 160, X1 = 1440, Y = 200;
const xs = Array.from({ length: N }, (_, i) => X0 + ((X1 - X0) / (N - 1)) * i);
const hexA = (hex: string, a: number) => `rgba(${[1, 3, 5].map((i) => parseInt(hex.slice(i, i + 2), 16)).join(",")},${a})`;

export function ProcessFlow() {
  const frame = useCurrentFrame();
  const { durationInFrames } = useVideoConfig();
  const travel = durationInFrames * 0.78; // kalan süre: tamamlanmış durumda bekle + sön
  const p = interpolate(frame, [8, travel], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp", easing: Easing.inOut(Easing.cubic) });
  const fade = interpolate(frame, [0, 8, durationInFrames - 12, durationInFrames - 1], [0, 1, 1, 0]);
  const cargoX = X0 + (X1 - X0) * p;
  // hafif dalgalı rota
  const path = `M${X0} ${Y} ` + xs.slice(1).map((x, i) => `C ${xs[i] + 110} ${Y + (i % 2 ? 46 : -46)}, ${x - 110} ${Y + (i % 2 ? 46 : -46)}, ${x} ${Y}`).join(" ");

  return (
    <AbsoluteFill style={{ background: color.bg, opacity: fade }}>
      <svg viewBox={`0 0 ${W} ${H}`} width="100%" height="100%">
        <defs>
          <linearGradient id="trail" x1="0" x2="1">
            <stop offset="0%" stopColor={color.accent} />
            <stop offset="100%" stopColor={color.highlight} />
          </linearGradient>
          <clipPath id="done"><rect x={0} y={0} width={cargoX} height={H} /></clipPath>
        </defs>
        <path d={path} fill="none" stroke={color.border} strokeWidth={4} strokeDasharray="2 12" strokeLinecap="round" />
        <path d={path} fill="none" stroke="url(#trail)" strokeWidth={5} strokeLinecap="round" clipPath="url(#done)" />
        {xs.map((x, i) => {
          const on = interpolate(cargoX, [x - 30, x + 10], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
          const r = 34 + on * 6;
          return (
            <g key={i}>
              <circle cx={x} cy={Y} r={r + 18} fill={hexA(color.accent, 0.12 * on)} />
              <circle cx={x} cy={Y} r={r} fill={on > 0.5 ? color.accent : color.surface} stroke={on > 0.5 ? color.accent : color.borderStrong} strokeWidth={3} />
              <path d={`M${x - 13} ${Y + 1} l9 9 l18 -19`} fill="none" stroke={color.surface} strokeWidth={5} strokeLinecap="round" strokeLinejoin="round"
                strokeDasharray={44} strokeDashoffset={44 * (1 - on)} />
              {on < 0.5 && <circle cx={x} cy={Y} r={6} fill={color.borderStrong} />}
            </g>
          );
        })}
        {/* kargo */}
        <g transform={`translate(${cargoX} ${Y - 70})`} opacity={p < 1 ? 1 : 0}>
          <rect x={-22} y={-16} width={44} height={32} rx={6} fill={color.highlight} />
          <path d="M-22 -4 h44" stroke={color.primary} strokeWidth={3} />
          <path d={`M0 22 v22`} stroke={hexA(color.primary, 0.3)} strokeWidth={2} strokeDasharray="3 5" />
        </g>
      </svg>
    </AbsoluteFill>
  );
}
