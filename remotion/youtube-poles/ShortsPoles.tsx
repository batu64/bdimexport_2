// bdimexport — Ahşap elektrik (tel) direği dikey Shorts/Reels videosu (1080×1920, 30 fps). EN + AR (RTL).
// Güvenli alan: üst ~200 px, alt ~420 px ve sağ ~140 px platform arayüzüne kalır → metin x 80..940, y 200..1500.
// Teknik veriler: tornalı/tel direk notları + emprenye şartnamesi (bkz. copy.ts başlığı). Arapça terimler /en/ar/wooden-utility-poles ile uyumlu.
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
import { darkColor } from "../../lib/ui/tokens";
import { CONTACT } from "./copy";
import { clamp, CREAM, FONT, FPS, GOLD, KB, Kicker, MUTED, NAVY, NUM, Rise, Scene, TEAL, Wordmark, X } from "./PolesVideo";

export type ShortLang = "en" | "ar";

type SCopy = {
  hookKicker: string;
  hookTitle: string[];
  hookSub: string;
  lenKicker: string;
  lenTitle: string;
  m: string; // metre birimi
  lenNote: string;
  person: string;
  dimKicker: string;
  dimTitle: string;
  top: string;
  butt: string;
  cm: string;
  treatKicker: string;
  treatTitle: string;
  treat: { v: string; l: string }[];
  colKicker: string;
  colTitle: string;
  brown: string;
  brownSub: string;
  green: string;
  greenSub: string;
  boxKicker: string;
  boxTitle: string;
  boxUnit: string;
  boxSub: string;
  ctaTitle: string;
  ctaSub: string;
  ctaButton: string;
};

const S: Record<ShortLang, SCopy> = {
  en: {
    hookKicker: "FACTORY-DIRECT FROM TÜRKİYE",
    hookTitle: ["Wooden", "Electric", "Poles"],
    hookSub: "Power & telecom lines · 7–12 m",
    lenKicker: "LENGTHS",
    lenTitle: "From 7 to 12 metres",
    m: "m",
    lenNote: "Most requested: 9 m",
    person: "1.8 m",
    dimKicker: "9 M POLE",
    dimTitle: "Naturally tapered strength",
    top: "Top diameter",
    butt: "Butt diameter",
    cm: "cm",
    treatKicker: "AUTOCLAVE TREATED",
    treatTitle: "Vacuum-pressure impregnation",
    treat: [
      { v: "≥ 10.5 kg/cm²", l: "Treatment pressure" },
      { v: "≥ 20 mm", l: "Penetration depth" },
      { v: "75%", l: "Of sapwood treated" },
      { v: "≤ 25%", l: "Moisture before treatment" },
    ],
    colKicker: "FINISH",
    colTitle: "Brown or green",
    brown: "Brown impregnated",
    brownSub: "Up to 9 m · export favourite",
    green: "Green impregnated",
    greenSub: "All lengths up to 12 m",
    boxKicker: "EXPORT LOADING",
    boxTitle: "Packed tight. Shipped to your port.",
    boxUnit: "poles",
    boxSub: "9 m poles per container",
    ctaTitle: "Get your factory price",
    ctaSub: "Length · finish · quantity · port",
    ctaButton: "Request a quote",
  },
  ar: {
    hookKicker: "من المصنع في تركيا مباشرة",
    hookTitle: ["أعمدة", "كهرباء", "خشبية"],
    hookSub: "لشبكات الكهرباء والاتصالات · 7–12 م",
    lenKicker: "الأطوال",
    lenTitle: "من 7 إلى 12 متراً",
    m: "م",
    lenNote: "الأكثر طلباً: 9 م",
    person: "1.8 م",
    dimKicker: "عمود 9 م",
    dimTitle: "قوة طبيعية بشكل مخروطي",
    top: "قطر الرأس",
    butt: "قطر القاعدة",
    cm: "سم",
    treatKicker: "تشريب بالأوتوكلاف",
    treatTitle: "تشريب بالتفريغ والضغط",
    treat: [
      { v: "≥ 10.5 kg/cm²", l: "ضغط التشريب" },
      { v: "≥ 20 mm", l: "عمق التغلغل" },
      { v: "75%", l: "من الخشب العصاري" },
      { v: "≤ 25%", l: "الرطوبة قبل التشريب" },
    ],
    colKicker: "نوع التشريب",
    colTitle: "بني أو أخضر",
    brown: "تشريب بني",
    brownSub: "حتى 9 م · الأكثر طلباً للتصدير",
    green: "تشريب أخضر",
    greenSub: "جميع الأطوال حتى 12 م",
    boxKicker: "التحميل والتصدير",
    boxTitle: "تحميل محكم وشحن إلى مينائكم",
    boxUnit: "عموداً",
    boxSub: "بطول 9 م في الحاوية الواحدة",
    ctaTitle: "اطلب سعر المصنع الآن",
    ctaSub: "الطول · نوع التشريب · الكمية · الميناء",
    ctaButton: "اطلب تسعيرة",
  },
};

const AR_FONT = '"Segoe UI", Tahoma, "Noto Sans Arabic", sans-serif';
const PAD = 80;

/** Dil yönü + font sarmalayıcı */
const Dir: React.FC<{ lang: ShortLang; style?: React.CSSProperties; children: React.ReactNode }> = ({ lang, style, children }) => (
  <div
    dir={lang === "ar" ? "rtl" : "ltr"}
    style={{ position: "absolute", inset: 0, fontFamily: lang === "ar" ? AR_FONT : FONT, ...style }}
  >
    {children}
  </div>
);

/** Sayı+birim: EN'de LTR izole; AR'de doğal RTL akış (ör. "12 م" sağdan sola okunur) */
const LangCtx = React.createContext<ShortLang>("en");
const N: React.FC<{ children: React.ReactNode; style?: React.CSSProperties }> = ({ children, style }) => {
  const lang = React.useContext(LangCtx);
  return (
    <bdi dir={lang === "ar" ? "rtl" : "ltr"} style={{ unicodeBidi: "isolate", ...style }}>
      {children}
    </bdi>
  );
};

const big = (lang: ShortLang, en: number) => (lang === "ar" ? Math.round(en * 1.05) : en);

// ── 1. Kanca
const Hook: React.FC<{ lang: ShortLang }> = ({ lang }) => {
  const c = S[lang];
  const f = useCurrentFrame();
  const { fps } = useVideoConfig();
  return (
    <Scene>
      <KB src="brown-9m.jpg" zoom={[1.3, 1.08]} pan={[0, 0]} />
      <AbsoluteFill style={{ background: "linear-gradient(180deg, rgba(12,21,37,0.2) 0%, rgba(12,21,37,0.55) 45%, rgba(12,21,37,0.95) 80%)" }} />
      <Dir lang={lang} style={{ padding: `0 ${PAD}px`, display: "flex", flexDirection: "column", justifyContent: "flex-end", paddingBottom: 460, gap: 10 }}>
        <Kicker delay={2}>{c.hookKicker}</Kicker>
        {c.hookTitle.map((w, i) => {
          const p = spring({ frame: f - 6 - i * 5, fps, config: { damping: 13 } });
          return (
            <div
              key={i}
              style={{
                fontSize: big(lang, 168),
                fontWeight: 900,
                lineHeight: lang === "ar" ? 1.15 : 0.95,
                letterSpacing: lang === "ar" ? 0 : "-0.04em",
                color: i === 1 ? GOLD : CREAM,
                transform: `translateY(${(1 - p) * 80}px) scale(${0.9 + p * 0.1})`,
                opacity: p,
                textShadow: "0 8px 30px rgba(0,0,0,0.5)",
              }}
            >
              {w}
            </div>
          );
        })}
        <Rise delay={24}>
          <div style={{ fontSize: 44, color: CREAM, fontWeight: 600, marginTop: 14 }}>{c.hookSub}</div>
        </Rise>
      </Dir>
    </Scene>
  );
};

// ── 2. Boylar — büyüyen direk çubukları + insan ölçeği
const Lengths: React.FC<{ lang: ShortLang }> = ({ lang }) => {
  const c = S[lang];
  const f = useCurrentFrame();
  const { fps } = useVideoConfig();
  const L = [7, 8, 9, 12];
  const unit = 82; // px / m
  const base = 1500; // zemin çizgisi y
  return (
    <Scene>
      <KB src="brown-poles.jpg" blur={20} zoom={[1.3, 1.4]} />
      <AbsoluteFill style={{ background: "rgba(12,21,37,0.78)" }} />
      <Dir lang={lang}>
        <div style={{ position: "absolute", top: 210, left: PAD, right: PAD, display: "flex", flexDirection: "column", gap: 16 }}>
          <Kicker delay={2}>{c.lenKicker}</Kicker>
          <Rise delay={6}>
            <div style={{ fontSize: big(lang, 84), fontWeight: 800, lineHeight: 1.1 }}>{c.lenTitle}</div>
          </Rise>
        </div>
      </Dir>
      {/* zemin */}
      <div style={{ position: "absolute", left: 60, right: 60, top: base, height: 4, background: "rgba(255,255,255,0.25)" }} />
      <div style={{ position: "absolute", left: 60, right: 60, top: base + 4, height: 120, background: "linear-gradient(180deg, rgba(110,76,36,0.5), transparent)" }} />
      {/* insan siluet (1.8 m) */}
      <div style={{ position: "absolute", left: lang === "ar" ? undefined : 110, right: lang === "ar" ? 110 : undefined, top: base - 1.8 * unit, opacity: interpolate(f, [10, 25], [0, 1], clamp) }}>
        <svg width={50} height={1.8 * unit} viewBox="0 0 50 148" fill={MUTED}>
          <circle cx="25" cy="14" r="12" />
          <path d="M10 32h30l4 50h-8l-3 66h-8l-1-50h-2l-1 50h-8l-3-66H6z" />
        </svg>
        <div style={{ position: "absolute", top: -44, left: -14, fontSize: 26, color: MUTED, whiteSpace: "nowrap", fontFamily: NUM }}>{c.person}</div>
      </div>
      {/* direkler */}
      {L.map((len, i) => {
        const p = spring({ frame: f - 14 - i * 9, fps, config: { damping: 15, mass: 1.1 } });
        const h = len * unit * p;
        const order = lang === "ar" ? L.length - 1 - i : i;
        const x = 260 + order * 190;
        const hot = len === 9;
        return (
          <div key={len}>
            <div
              style={{
                position: "absolute",
                left: x,
                top: base - h,
                height: h,
                width: 70,
                clipPath: "polygon(22% 0, 78% 0, 100% 100%, 0 100%)",
                background: hot
                  ? "linear-gradient(90deg, #5a3417, #9a6232 35%, #b87a44 50%, #8a5528 70%, #4e2d13)"
                  : "linear-gradient(90deg, #4a3a22, #7d6440 35%, #94784e 50%, #6e5636 70%, #3e301c)",
                boxShadow: "0 0 30px rgba(0,0,0,0.4)",
              }}
            />
            <div
              style={{
                position: "absolute",
                left: x - 40,
                width: 150,
                textAlign: "center",
                top: base - h - 78,
                opacity: p,
                fontFamily: NUM,
                fontWeight: 700,
                fontSize: 56,
                color: hot ? GOLD : CREAM,
              }}
            >
              <N>
                {len} {c.m}
              </N>
            </div>
          </div>
        );
      })}
      <Dir lang={lang}>
        <Rise delay={60} style={{ position: "absolute", top: base + 40, left: PAD, right: PAD, display: "flex", justifyContent: "center" }}>
          <div style={{ background: GOLD, color: NAVY, fontSize: 40, fontWeight: 800, padding: "16px 40px", borderRadius: 999 }}>{c.lenNote}</div>
        </Rise>
      </Dir>
    </Scene>
  );
};

// ── 3. Çap — dikey konik direk + uç/dip ölçüleri
const Dims: React.FC<{ lang: ShortLang }> = ({ lang }) => {
  const c = S[lang];
  const f = useCurrentFrame();
  const grow = interpolate(f, [8, 40], [0, 1], { ...clamp, easing: Easing.out(Easing.cubic) });
  const poleTop = 520;
  const poleH = 900;
  const cx = 300;
  const Callout: React.FC<{ y: number; d: string; label: string; delay: number }> = ({ y, d, label, delay }) => (
    <Rise delay={delay} style={{ position: "absolute", top: y - 64, left: 500, right: 90 }}>
      <div dir={lang === "ar" ? "rtl" : "ltr"} style={{ fontFamily: lang === "ar" ? AR_FONT : FONT }}>
        <div style={{ fontSize: 34, color: MUTED, fontWeight: 600 }}>{label}</div>
        <div style={{ fontFamily: NUM, fontSize: 78, fontWeight: 700, color: GOLD, lineHeight: 1.05, whiteSpace: "nowrap" }}>
          <N>
            Ø{d} {c.cm}
          </N>
        </div>
      </div>
    </Rise>
  );
  return (
    <Scene>
      <KB src="brown-9m-utility-poles-closeup.webp" blur={18} zoom={[1.3, 1.4]} />
      <AbsoluteFill style={{ background: "rgba(12,21,37,0.8)" }} />
      <Dir lang={lang}>
        <div style={{ position: "absolute", top: 210, left: PAD, right: PAD, display: "flex", flexDirection: "column", gap: 16 }}>
          <Kicker delay={2}>{c.dimKicker}</Kicker>
          <Rise delay={6}>
            <div style={{ fontSize: big(lang, 80), fontWeight: 800, lineHeight: 1.1 }}>{c.dimTitle}</div>
          </Rise>
        </div>
      </Dir>
      {/* konik direk */}
      <div
        style={{
          position: "absolute",
          left: cx - 85,
          top: poleTop,
          width: 170,
          height: poleH * grow,
          clipPath: "polygon(25% 0, 75% 0, 100% 100%, 0 100%)",
          background: "linear-gradient(90deg, #4e2d13, #8a5528 25%, #c08450 50%, #8a5528 75%, #4e2d13)",
        }}
      />
      {/* uç halkası */}
      <div style={{ position: "absolute", left: cx - 43, top: poleTop - 22, width: 86, height: 44, borderRadius: "50%", background: "radial-gradient(#d9a46b, #8a5528)", opacity: grow }} />
      {/* ölçü çizgileri */}
      {[
        [poleTop + 10, 90],
        [poleTop + poleH - 10, 170],
      ].map(([y, w], i) => (
        <div key={i} style={{ position: "absolute", top: y, left: cx + w / 2 + 16, width: 500 - (cx + w / 2 + 16) - 20, height: 3, background: TEAL, opacity: interpolate(f, [30 + i * 14, 44 + i * 14], [0, 1], clamp) }} />
      ))}
      <Callout y={poleTop + 10} d="12–14" label={c.top} delay={30} />
      <Callout y={poleTop + poleH - 10} d="22–23" label={c.butt} delay={44} />
      {/* boy etiketi */}
      <div style={{ position: "absolute", left: 90, top: poleTop, height: poleH * grow, width: 3, background: "rgba(255,255,255,0.35)" }} />
      <div style={{ position: "absolute", left: 40, top: poleTop + poleH / 2 - 30, fontFamily: NUM, fontSize: 48, fontWeight: 700, color: CREAM, transform: "rotate(-90deg)", opacity: grow }}>
        <N>9 {c.m}</N>
      </div>
    </Scene>
  );
};

// ── 4. Emprenye
const Treat: React.FC<{ lang: ShortLang }> = ({ lang }) => {
  const c = S[lang];
  return (
    <Scene>
      <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: 900 }}>
        <KB src="brown-poles-autoclave-rail.webp" zoom={[1.15, 1.3]} />
        <AbsoluteFill style={{ background: `linear-gradient(180deg, rgba(12,21,37,0.4) 0%, rgba(12,21,37,0) 30%, ${NAVY} 100%)` }} />
      </div>
      <Dir lang={lang}>
        <div style={{ position: "absolute", top: 700, left: PAD, right: PAD, display: "flex", flexDirection: "column", gap: 16 }}>
          <Kicker delay={2} c={TEAL}>
            {c.treatKicker}
          </Kicker>
          <Rise delay={6}>
            <div style={{ fontSize: big(lang, 76), fontWeight: 800, lineHeight: 1.1 }}>{c.treatTitle}</div>
          </Rise>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 22, marginTop: 30 }}>
            {c.treat.map((s, i) => (
              <Rise key={i} delay={18 + i * 7}>
                <div style={{ background: darkColor.surface, borderRadius: 18, padding: "26px 28px", borderTop: `5px solid ${GOLD}`, minHeight: 150 }}>
                  <div style={{ fontFamily: NUM, fontSize: 56, fontWeight: 700, color: GOLD }}>
                    <N>{s.v}</N>
                  </div>
                  <div style={{ fontSize: 30, color: MUTED, marginTop: 6 }}>{s.l}</div>
                </div>
              </Rise>
            ))}
          </div>
        </div>
      </Dir>
    </Scene>
  );
};

// ── 5. Renk
const Colour: React.FC<{ lang: ShortLang }> = ({ lang }) => {
  const c = S[lang];
  const cards: [string, string, string, string, string][] = [
    ["brown-poles.jpg", c.brown, c.brownSub, "#9a6232", "center"],
    ["yard-portrait.jpg", c.green, c.greenSub, "#6f8f4e", "center 85%"],
  ];
  return (
    <Scene>
      <Dir lang={lang}>
        <div style={{ position: "absolute", top: 210, left: PAD, right: PAD, display: "flex", flexDirection: "column", gap: 16 }}>
          <Kicker delay={2}>{c.colKicker}</Kicker>
          <Rise delay={6}>
            <div style={{ fontSize: big(lang, 92), fontWeight: 800 }}>{c.colTitle}</div>
          </Rise>
        </div>
        <div style={{ position: "absolute", top: 470, left: PAD, right: PAD, bottom: 400, display: "flex", flexDirection: "column", gap: 30 }}>
          {cards.map(([img, t, s, col, pos], i) => (
            <Rise key={i} delay={14 + i * 10} dist={60} style={{ flex: 1, display: "flex" }}>
              <div style={{ flex: 1, position: "relative", borderRadius: 26, overflow: "hidden", border: `4px solid ${col}` }}>
                <KB src={img} pos={pos} zoom={[1.05, 1.15]} />
                <AbsoluteFill style={{ background: "linear-gradient(0deg, rgba(12,21,37,0.95) 0%, rgba(12,21,37,0) 65%)" }} />
                <div style={{ position: "absolute", left: 36, right: 36, bottom: 30 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 18 }}>
                    <div style={{ width: 36, height: 36, borderRadius: "50%", background: col, border: "4px solid #fff", flexShrink: 0 }} />
                    <div style={{ fontSize: 56, fontWeight: 800 }}>{t}</div>
                  </div>
                  <div style={{ fontSize: 36, color: CREAM, marginTop: 8 }}>{s}</div>
                </div>
              </div>
            </Rise>
          ))}
        </div>
      </Dir>
    </Scene>
  );
};

// ── 6. Konteyner — tam ekran yükleme videosu + sayaç
const Box: React.FC<{ lang: ShortLang }> = ({ lang }) => {
  const c = S[lang];
  const f = useCurrentFrame();
  const { fps } = useVideoConfig();
  const n = Math.round(interpolate(f, [20, 90], [0, 140], { ...clamp, easing: Easing.out(Easing.cubic) }));
  const inset = spring({ frame: f - 70, fps, config: { damping: 15 } });
  return (
    <Scene>
      <OffthreadVideo src={staticFile("loading.mp4")} startFrom={36 * FPS} muted style={{ position: "absolute", width: "100%", height: "100%", objectFit: "cover" }} />
      <AbsoluteFill style={{ background: "linear-gradient(180deg, rgba(12,21,37,0.85) 0%, rgba(12,21,37,0.1) 30%, rgba(12,21,37,0.1) 45%, rgba(12,21,37,0.92) 75%)" }} />
      <Dir lang={lang}>
        <div style={{ position: "absolute", top: 210, left: PAD, right: PAD, display: "flex", flexDirection: "column", gap: 16 }}>
          <Kicker delay={2}>{c.boxKicker}</Kicker>
          <Rise delay={6}>
            <div style={{ fontSize: big(lang, 70), fontWeight: 800, lineHeight: 1.1 }}>{c.boxTitle}</div>
          </Rise>
        </div>
        <div style={{ position: "absolute", top: 1050, left: PAD, right: PAD }}>
          <div style={{ display: "flex", alignItems: "baseline", gap: 24 }}>
            <div style={{ fontFamily: NUM, fontSize: 250, fontWeight: 700, color: GOLD, lineHeight: 0.9 }}>
              <N>{n}</N>
            </div>
            <div style={{ fontSize: 60, fontWeight: 800 }}>{c.boxUnit}</div>
          </div>
          <div style={{ fontSize: 44, color: CREAM, marginTop: 10 }}>{c.boxSub}</div>
        </div>
      </Dir>
      <div
        style={{
          position: "absolute",
          top: 560,
          [lang === "ar" ? "left" : "right"]: 150,
          width: 300,
          height: 390,
          borderRadius: 18,
          overflow: "hidden",
          border: `5px solid ${GOLD}`,
          transform: `scale(${inset}) rotate(${lang === "ar" ? -3 : 3}deg)`,
          boxShadow: "0 20px 50px rgba(0,0,0,0.6)",
        }}
      >
        <KB src="container-interior.jpg" zoom={[1.05, 1.15]} />
      </div>
    </Scene>
  );
};

// ── 7. CTA
const Cta: React.FC<{ lang: ShortLang }> = ({ lang }) => {
  const c = S[lang];
  const f = useCurrentFrame();
  const pulse = 1 + Math.sin(f / 7) * 0.03;
  const rows: [string, string][] = [
    ["M12 2a10 10 0 1 0 0 20 10 10 0 0 0 0-20zM2 12h20M12 2c3 3 4 6.5 4 10s-1 7-4 10c-3-3-4-6.5-4-10s1-7 4-10z", CONTACT.web],
    ["M3 5h18v14H3zM3 6l9 7 9-7", CONTACT.mail],
    ["M5 3h4l2 5-3 2a11 11 0 0 0 6 6l2-3 5 2v4a2 2 0 0 1-2 2A17 17 0 0 1 3 5a2 2 0 0 1 2-2z", CONTACT.phone],
  ];
  return (
    <Scene>
      <KB src="yard-portrait.jpg" zoom={[1.05, 1.18]} />
      <AbsoluteFill style={{ background: "rgba(12,21,37,0.86)" }} />
      <Dir lang={lang} style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 36, paddingBottom: 260, textAlign: "center" }}>
        <Rise delay={2}>
          <div dir="ltr">
            <Wordmark size={84} />
          </div>
        </Rise>
        <Rise delay={10}>
          <div style={{ fontSize: big(lang, 96), fontWeight: 900, lineHeight: 1.1, padding: `0 ${PAD}px` }}>{c.ctaTitle}</div>
        </Rise>
        <Rise delay={16}>
          <div style={{ fontSize: 40, color: MUTED }}>{c.ctaSub}</div>
        </Rise>
        <div style={{ display: "flex", flexDirection: "column", gap: 22, marginTop: 10 }}>
          {rows.map(([d, t], i) => (
            <Rise key={i} delay={24 + i * 6} dist={20}>
              <div dir="ltr" style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 18, fontSize: 46, fontWeight: 600, fontFamily: FONT }}>
                <svg viewBox="0 0 24 24" width={46} height={46} fill="none" stroke={TEAL} strokeWidth={1.8} strokeLinejoin="round">
                  <path d={d} />
                </svg>
                {t}
              </div>
            </Rise>
          ))}
        </div>
        <Rise delay={44}>
          <div style={{ marginTop: 20, background: GOLD, color: NAVY, fontSize: 50, fontWeight: 900, padding: "26px 70px", borderRadius: 999, transform: `scale(${pulse})`, boxShadow: "0 16px 40px rgba(232,161,61,0.35)" }}>
            {c.ctaButton}
          </div>
        </Rise>
      </Dir>
    </Scene>
  );
};

const SCENES: [string, number][] = [
  ["hook", 3.6],
  ["len", 6],
  ["dims", 5.6],
  ["treat", 6],
  ["col", 5],
  ["box", 7],
  ["cta", 6.5],
];
export const SHORT_TIMELINE = (() => {
  let at = 0;
  return SCENES.map(([id, sec]) => {
    const dur = Math.round(sec * FPS);
    const s = { id, from: at, dur };
    at += dur - X;
    return s;
  });
})();
export const SHORT_FRAMES = SHORT_TIMELINE[SHORT_TIMELINE.length - 1].from + SHORT_TIMELINE[SHORT_TIMELINE.length - 1].dur;

const Bug: React.FC = () => {
  const f = useCurrentFrame();
  const { durationInFrames: d } = useVideoConfig();
  const o = interpolate(f, [0, 15, d - 15, d], [0, 0.95, 0.95, 0], clamp);
  return (
    <div style={{ position: "absolute", left: "50%", top: 110, transform: "translateX(-50%)", opacity: o, fontFamily: FONT, background: "rgba(12,21,37,0.72)", padding: "10px 24px", borderRadius: 999 }}>
      <Wordmark size={32} />
    </div>
  );
};

export const ShortsPoles: React.FC<{ lang: ShortLang }> = ({ lang }) => {
  const { durationInFrames } = useVideoConfig();
  const f = useCurrentFrame();
  const map: Record<string, React.ReactNode> = {
    hook: <Hook lang={lang} />,
    len: <Lengths lang={lang} />,
    dims: <Dims lang={lang} />,
    treat: <Treat lang={lang} />,
    col: <Colour lang={lang} />,
    box: <Box lang={lang} />,
    cta: <Cta lang={lang} />,
  };
  const ctaFrom = SHORT_TIMELINE[SHORT_TIMELINE.length - 1].from;
  return (
    <LangCtx.Provider value={lang}>
    <AbsoluteFill style={{ background: NAVY }}>
      {SHORT_TIMELINE.map((s) => (
        <Sequence key={s.id} from={s.from} durationInFrames={s.dur} name={s.id}>
          {map[s.id]}
        </Sequence>
      ))}
      <Sequence durationInFrames={ctaFrom + X}>
        <Bug />
      </Sequence>
      {/* üst ilerleme çizgisi */}
      <div style={{ position: "absolute", left: 0, top: 0, height: 8, width: `${(f / durationInFrames) * 100}%`, background: GOLD }} />
      {/* müziğin ritimli bölümünden başla */}
      <Audio
        src={staticFile("music.wav")}
        startFrom={16 * FPS}
        volume={(fr) => interpolate(fr, [0, 8, durationInFrames - 45, durationInFrames], [0, 0.85, 0.85, 0], clamp)}
      />
    </AbsoluteFill>
    </LangCtx.Provider>
  );
};

// Kapak (Shorts/Reels kapak görseli) — 1080×1920
export const ShortsCover: React.FC<{ lang: ShortLang }> = ({ lang }) => {
  const c = S[lang];
  return (
    <AbsoluteFill style={{ background: NAVY, color: CREAM }}>
      <Img src={staticFile("brown-9m.jpg")} style={{ position: "absolute", width: "100%", height: "100%", objectFit: "cover" }} />
      <AbsoluteFill style={{ background: "linear-gradient(180deg, rgba(12,21,37,0.3) 0%, rgba(12,21,37,0.9) 70%)" }} />
      <div style={{ position: "absolute", top: 120, left: 0, right: 0, display: "flex", justifyContent: "center", fontFamily: FONT }}>
        <Wordmark size={54} />
      </div>
      <Dir lang={lang} style={{ display: "flex", flexDirection: "column", justifyContent: "flex-end", padding: `0 ${PAD}px 520px` }}>
        {c.hookTitle.map((w, i) => (
          <div key={i} style={{ fontSize: big(lang, 180), fontWeight: 900, lineHeight: lang === "ar" ? 1.15 : 0.95, color: i === 1 ? GOLD : CREAM, letterSpacing: lang === "ar" ? 0 : "-0.04em" }}>
            {w}
          </div>
        ))}
        <div style={{ fontSize: 48, fontWeight: 700, marginTop: 20 }}>{c.hookSub}</div>
      </Dir>
    </AbsoluteFill>
  );
};
