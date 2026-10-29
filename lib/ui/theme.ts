// tokens.ts → CSS custom properties (TEK yol). globals.css ve CSS Module'ler yalnız var(--…) kullanır; literal hex/px yok.
// Çıktı build-time'da <ThemeStyle> ile <head>'e basılır (static export: JS'siz çalışır, FOUC yok).
// Temalar: :root açık · prefers-color-scheme: dark (data-theme="light" ile kapatılabilir) · data-theme="dark" zorla.
// Locale: <html data-locale="zh|de"> yalnız fark eden rolleri ezer (design-tokens §2).
import {
  borderWidth, breakpoint, color, container, darkColor, elevation, font, fontSize, fontWeight, layout, lineHeight,
  localeColor, motion, onDarkMutedAlpha, prose, radius, radiusLg, radiusPill, sectionY, space, touchMin, tracking, typeRole,
} from "./tokens.ts";

const px = (n: number) => `${n}px`;
const rgb = (hex: string) => [1, 3, 5].map((i) => parseInt(hex.slice(i, i + 2), 16)).join(", ");
const rgba = (hex: string, a: number) => `rgba(${rgb(hex)}, ${a})`;
const bezier = (b: readonly number[]) => `cubic-bezier(${b.join(", ")})`;
/** Akışkan punto: xs (360) → lg (1280) arasında doğrusal; dışında sabit */
const fluid = (min: number, max: number) => {
  const slope = (max - min) / (breakpoint.lg - breakpoint.xs);
  const base = min - slope * breakpoint.xs;
  return `clamp(${px(min)}, ${px(+base.toFixed(3))} + ${+(slope * 100).toFixed(4)}vw, ${px(max)})`;
};
const shadow = (e: { y: number; blur: number; alpha: number }, ink: string) => `0 ${px(e.y)} ${px(e.blur)} ${rgba(ink, e.alpha)}`;
const block = (sel: string, vars: Record<string, string | number>) =>
  `${sel}{${Object.entries(vars).map(([k, v]) => `--${k}:${v};`).join("")}}`;

/** Tema-bağımsız ölçek değişkenleri */
function scaleVars(): Record<string, string | number> {
  const v: Record<string, string | number> = {};
  for (const [k, n] of Object.entries(space)) v[`s-${k.slice(1)}`] = px(n);
  for (const [k, n] of Object.entries(fontSize)) v[`fs-${k}`] = px(n);
  for (const [k, n] of Object.entries(fontWeight)) v[`fw-${k}`] = n;
  for (const [k, n] of Object.entries(lineHeight)) v[`lh-${k}`] = n;
  for (const [k, [min, max]] of Object.entries(typeRole)) v[`type-${k}`] = fluid(min, max);
  Object.assign(v, {
    "track-tight": tracking.tight, "track-caps": tracking.caps,
    "font-sans": font.latin.replace('"Inter"', 'var(--font-inter), "Inter"'),
    "font-arabic": font.arabic.replace('"Noto Sans Arabic"', 'var(--font-noto-arabic), "Noto Sans Arabic"'), "font-zh": font.zh.replace('"Inter"', 'var(--font-inter), "Inter"'),
    radius: px(radius), "radius-lg": px(radiusLg), "radius-pill": px(radiusPill),
    "bw-1": px(borderWidth.hair), "bw-2": px(borderWidth.strong),
    touch: px(touchMin), container: px(container), prose,
    "nav-h": px(layout.navH), "nav-h-m": px(layout.navHMobile),
    "hero-min-xs": px(layout.heroMinH.xs), "hero-min-md": px(layout.heroMinH.md), "hero-min-lg": px(layout.heroMinH.lg),
    "hero-img-xs": px(layout.heroImgH.xs), "hero-img-md": px(layout.heroImgH.md),
    "form-max": px(layout.formMaxW),
    "section-y": fluid(sectionY.sm, sectionY.lg),
    "dur-fast": `${motion.fast}ms`, "dur-base": `${motion.base}ms`, "dur-slow": `${motion.slow}ms`,
    "ease-out": bezier(motion.easeOut), "ease-in-out": bezier(motion.easeInOut),
    "motion-distance": px(motion.distance), stagger: `${motion.stagger * 1000}ms`,
  });
  return v;
}

const light = {
  bg: color.bg, surface: color.surface, "surface-alt": color.surface, border: color.border, "border-strong": color.borderStrong,
  ink: color.ink, muted: color.muted, heading: color.primary, primary: color.primary, accent: color.accent, link: color.accent,
  highlight: color.highlight, "on-highlight": color.primary,
  brand: color.primary, "on-brand": color.bg, "on-brand-muted": rgba(color.bg, onDarkMutedAlpha), "accent-on-brand": color.accentOnDark,
  focus: color.accent, "focus-on-brand": color.highlight,
  success: color.success, warning: color.warning, danger: color.danger,
  "trust-bg": localeColor.de.trustBadgeBg, "trust-ink": localeColor.de.trustBadgeInk,
};

function colorVars(c: Record<string, string>, ink: string) {
  const v: Record<string, string> = {};
  for (const [k, val] of Object.entries(c)) v[`c-${k}`] = val;
  for (const [k, e] of Object.entries(elevation)) v[`e-${k.slice(1)}`] = shadow(e, ink);
  return v;
}

const dark = {
  bg: darkColor.bg, surface: darkColor.surface, "surface-alt": darkColor.surfaceAlt, border: darkColor.border,
  "border-strong": darkColor.borderStrong, ink: darkColor.ink, muted: darkColor.muted, heading: darkColor.heading,
  accent: darkColor.link, link: darkColor.link, brand: darkColor.brand, focus: color.highlight,
  success: darkColor.success, warning: darkColor.warning, danger: darkColor.danger,
};
const darkVars = { ...colorVars(dark, darkColor.shadow), "color-scheme": "dark" };

/** Tam tema CSS metni (minify edilmiş tek satır blok dizisi) */
export function themeCss(): string {
  const zh = { "c-accent": localeColor.zh.accent, "c-link": localeColor.zh.accent, "c-highlight": localeColor.zh.highlight,
    "c-accent-on-brand": localeColor.zh.accentOnDark, "c-focus": localeColor.zh.accent };
  const zhDark = { "c-accent": localeColor.zh.highlight, "c-link": localeColor.zh.highlight, "c-focus": localeColor.zh.highlight };
  return [
    block(":root", { ...scaleVars(), ...colorVars(light, color.ink), "color-scheme": "light" }),
    `@media (prefers-color-scheme: dark){${block(':root:not([data-theme="light"])', darkVars)}${block(':root:not([data-theme="light"])[data-locale="zh"]', zhDark)}}`,
    block(':root[data-theme="dark"]', darkVars),
    block(':root[data-locale="zh"]', { ...zh, "font-sans": "var(--font-zh)" }),
    block(':root[data-theme="dark"][data-locale="zh"]', zhDark),
    block(':root[data-locale="de"]', { "c-highlight": localeColor.de.highlight }),
    block(':root[dir="rtl"], [dir="rtl"]', { "font-sans": "var(--font-arabic)" }),
  ].join("\n");
}
