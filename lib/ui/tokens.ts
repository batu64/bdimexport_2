// Design tokens — tek kaynak: design/design-tokens.md v1.0 (§1 renk, §2 tipografi, §3 spacing)
// Varyant komponentlerinde hex/px literal YASAK; yalnızca bu dosyadan import edilir.
export const color = {
  primary: "#1A2B4A",
  accent: "#0E7C7B",
  highlight: "#E8A13D",
  bg: "#FAF8F5",
  ink: "#1F2937",
  muted: "#6B7280",
} as const;

// spacing scale 4/8/12/16/24/32/48/64/96
export const space = { s1: 4, s2: 8, s3: 12, s4: 16, s6: 24, s8: 32, s12: 48, s16: 64, s24: 96 } as const;

// type scale 12/14/16/18/20/24/30/36/48/60
export const fontSize = { xs: 12, sm: 14, base: 16, lg: 18, xl: 20 } as const;

export const radius = 8; // cta.md: radius 8
export const touchMin = 44; // cta.md: basınç alanı min 44px
export const container = 1280; // design-tokens §3
export const prose = "72ch"; // okuma ölçüsü (px değil — spacing scale dışı sabit yok)

export const font = {
  latin: '"Inter", system-ui, sans-serif',
  arabic: '"Noto Sans Arabic", "Inter", system-ui, sans-serif',
} as const;
