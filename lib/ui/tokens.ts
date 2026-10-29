// Design tokens — TEK KAYNAK: design/design-tokens.md v2.1 (Varyant A "Ticaret Güveni", 👤 onaylı).
// Komponent/CSS'te hex/px literal YASAK; CSS değişkenleri bu dosyadan lib/ui/theme.ts ile üretilir (--c-*, --s-*, --fs-*, …).
// İşaretler: [v2.1] = onaylı token · [TASLAK-D] = OPUS_TASARIM_TALIMATI D1 ile eklenen öneri — D3 yön onayıyla design-tokens.md'ye işlenir.

// ── Renk — açık tema [v2.1 §1.1–§1.2]
export const color = {
  primary: "#1A2B4A",
  accent: "#0E7C7B",
  highlight: "#E8A13D",
  bg: "#FAF8F5",
  surface: "#FFFFFF",
  border: "#E5E1DA",
  borderStrong: "#8A8478",
  ink: "#1F2937",
  muted: "#6B7280",
  success: "#2E7D32",
  warning: "#A15F00",
  danger: "#C62828",
  accentOnDark: "#5FD3CF",
} as const;

/** on-dark-muted = bg @ %80 [v2.1 K5 — %72 altına inilmez] */
export const onDarkMutedAlpha = 0.8;

// ── Locale varyantları [v2.1 §2] — yalnız fark eden roller
export const localeColor = {
  zh: { accent: "#B91C1C", highlight: "#D4A017", accentOnDark: "#D4A017" },
  de: { highlight: "#C98A2B", trustBadgeBg: "#E6F2F1", trustBadgeInk: "#0B6665" },
} as const;

// ── Koyu tema [TASLAK-D] — Varyant A ailesinden türetildi; her çift AA (qa/TASARIM/rapor.md kontrast tablosu).
// /zh koyu temada kırmızı vurgu KULLANILMAZ (K8: koyu zeminde 2.18) → altın.
export const darkColor = {
  bg: "#0C1525",
  surface: "#132038",
  surfaceAlt: "#0F1A2E",
  brand: "#16243D",
  border: "#22324D",
  borderStrong: "#7A879C",
  ink: "#E7E5E0",
  muted: "#A4ADBB",
  heading: "#F3F1EC",
  link: "#5FD3CF",
  success: "#6CC070",
  warning: "#E0A050",
  danger: "#F07A7A",
  shadow: "#000000", // koyu zeminde gölge rengi (ink açık olduğu için ink alfa görünmez)
} as const;

// ── Spacing [v2.1 §4] 4/8/12/16/24/32/48/64/96
export const space = { s1: 4, s2: 8, s3: 12, s4: 16, s6: 24, s8: 32, s12: 48, s16: 64, s24: 96 } as const;
/** Bölüm dikey ritmi [TASLAK-D] — ölçek dışı tek değer (96'nın 1.5 katı), yalnız geniş ekranda bölüm boşluğu */
export const sectionY = { sm: space.s16, lg: 144 } as const;

// ── Tipografi [v2.1 §3]
export const fontSize = { xs: 12, sm: 14, base: 16, lg: 18, xl: 20, x2: 24, x3: 30, x4: 36, x5: 48, x6: 60 } as const;
export const fontWeight = { body: 400, label: 500, heading: 600, stat: 700 } as const;
export const lineHeight = { heading: 1.2, body: 1.6, caption: 1.4 } as const;
/** Rol eşlemesi mobil → masaüstü [v2.1 §3] */
export const typeRole = {
  h1: [fontSize.x4, fontSize.x6],
  h2: [fontSize.x3, fontSize.x5],
  h3: [fontSize.x2, fontSize.x4],
  h4: [fontSize.xl, fontSize.x2],
} as const;
/** Başlık harf aralığı [TASLAK-D] — büyük puntoda Inter'i sıkılaştırır (em, px değil) */
export const tracking = { tight: "-0.02em", caps: "0.08em" } as const;
export const font = {
  latin: '"Inter", system-ui, sans-serif',
  arabic: '"Noto Sans Arabic", "Inter", system-ui, sans-serif',
  zh: '"Inter", "PingFang SC", "Hiragino Sans GB", "Microsoft YaHei", "Noto Sans SC", system-ui, sans-serif', // [TASLAK-D6] CJK web fontu yok (perf): sistem fontları
} as const;

// ── Şekil [v2.1 §4]
export const radius = 8; // kart/CTA/input
export const radiusLg = 16; // [TASLAK-D] hero medya + büyük bloklar (talimat §3 "8–16")
export const radiusPill = 999; // rozet
export const borderWidth = { hair: 1, strong: 2 } as const; // focus 2px + 2px offset [v2.1 §1.2]
export const touchMin = 44;
export const container = 1280;
export const prose = "72ch";
/** Elevation [v2.1 §4] (ink %8–12 alfa) + 3 [TASLAK-D] premium hover */
export const elevation = {
  e1: { y: 1, blur: 3, alpha: 0.08 },
  e2: { y: 4, blur: 12, alpha: 0.1 },
  e3: { y: 16, blur: 40, alpha: 0.12 },
} as const;

// ── Türetilmiş layout [design/components/_derived-tokens.md]
export const layout = {
  navH: space.s16,
  navHMobile: space.s12 + space.s2,
  heroMinH: { xs: 480, md: 560, lg: 640 },
  heroImgH: { xs: 240, md: 320 },
  formMaxW: 720,
} as const;
/** Breakpoint'ler [v2.1 §5] — CSS @media literal'leri BU değerlerle eşleşmek zorunda (qa/TASARIM tarama kontrolü) */
export const breakpoint = { xs: 360, md: 768, lg: 1280, xl: 1920 } as const;

// ── Motion [TASLAK-D; motionFast v2.1 _derived] — yalnız transform/opacity; prefers-reduced-motion → 0
export const motion = {
  fast: 150,
  base: 250,
  slow: 400,
  easeOut: [0.16, 1, 0.3, 1] as [number, number, number, number],
  easeInOut: [0.65, 0, 0.35, 1] as [number, number, number, number],
  distance: space.s4, // giriş kayması (translateY)
  stagger: 0.06, // saniye
} as const;
