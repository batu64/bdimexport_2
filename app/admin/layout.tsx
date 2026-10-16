// Admin route iskeleti (FAZ_3 3.2). Static export: sunucu verisi yok; widget'lar istemcide fetch eder.
// Erişim: Cloudflare Access (3.1) edge'de zorunlu; UI rol kontrolü yalnızca menü görünürlüğüdür, güvenlik sınırı DEĞİLDİR.
import type { Metadata } from "next";
import type { CSSProperties } from "react";
import { color, space, fontSize, radius, touchMin, container, font } from "@/lib/ui/tokens";
import AdminShell from "./AdminShell";
import styles from "./admin.module.css";

export const metadata: Metadata = {
  metadataBase: new URL("https://bdimexport.com"),
  title: "Admin | Bdimexport", // kök layout artık yok: marka açık
  robots: { index: false, follow: false, nocache: true },
};

const vars = {
  "--a-primary": color.primary, "--a-accent": color.accent, "--a-highlight": color.highlight, "--a-bg": color.bg,
  "--a-s1": `${space.s1}px`, "--a-s2": `${space.s2}px`, "--a-s3": `${space.s3}px`, "--a-s4": `${space.s4}px`,
  "--a-s6": `${space.s6}px`, "--a-s8": `${space.s8}px`, "--a-s16": `${space.s16}px`,
  "--a-side": `${space.s24 * 2 + space.s12}px`, "--a-card": `${space.s24 * 2 + space.s6}px`,
  "--a-fs-sm": `${fontSize.sm}px`, "--a-fs-lg": `${fontSize.lg}px`, "--a-fs-xl": `${fontSize.xl}px`,
  "--a-radius": `${radius}px`, "--a-touch": `${touchMin}px`, "--a-container": `${container}px`, "--a-font": font.latin,
} as CSSProperties;

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="tr">
      <body>
        <div className={styles.shell} style={vars}>
          <AdminShell>{children}</AdminShell>
        </div>
      </body>
    </html>
  );
}
