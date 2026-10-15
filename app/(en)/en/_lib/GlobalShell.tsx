// Global /en kabuğu — FAZ_2 Step 2.1. Varyant kabuğu (lib/ui/VariantShell) değil: /en/{ru,fr,nl,es,ar} kendi layout'una sahip,
// bu kabuk yalnızca global /en sayfalarını sarar (iç içe çift CTA/footer olmasın diye layout yerine sayfa düzeyinde).
// Renk/spacing YALNIZCA lib/ui/tokens'tan CSS değişkeni olarak enjekte edilir (hardcoded hex yok); stil lib/ui/variant.module.css.
import type { CSSProperties, ReactNode } from "react";
import Link from "next/link";
import styles from "@/lib/ui/variant.module.css";
import { color, space, radius, touchMin, prose, font } from "@/lib/ui/tokens";
import { SERVICES } from "./services";

const vars = {
  "--c-bg": color.bg,
  "--c-ink": color.ink,
  "--c-primary": color.primary,
  "--c-accent": color.accent,
  "--c-highlight": color.highlight,
  "--c-muted": color.muted,
  "--s-1": `${space.s1}px`,
  "--s-2": `${space.s2}px`,
  "--s-3": `${space.s3}px`,
  "--s-4": `${space.s4}px`,
  "--s-6": `${space.s6}px`,
  "--s-8": `${space.s8}px`,
  "--s-12": `${space.s12}px`,
  "--radius": `${radius}px`,
  "--touch": `${touchMin}px`,
  "--prose": prose,
  "--font": font.latin,
} as CSSProperties;

export default function GlobalShell({ children }: { children: ReactNode }) {
  return (
    <div lang="en" dir="ltr" className={styles.shell} style={vars}>
      {/* /en layout CTA: birincil = teklif (CONTENT_STYLE §5 "Get Free Quotation in 24h") */}
      <div className={styles.cta} role="region" aria-label="Request a quotation">
        <span className={styles.ctaNote}>Free quotation in 24h · Our fee is quoted separately from third-party costs</span>
        <a href="#get-quote" className={`${styles.btn} ${styles.btnPrimary}`}>
          Get Free Quotation in 24h
        </a>
        <Link href="/en/services" className={`${styles.btn} ${styles.btnSecondary}`}>
          All services
        </Link>
      </div>
      {children}
      <footer className={styles.footer}>
        <div className={styles.footerIn}>
          <strong>Bdimexport</strong> — B2B sourcing and export services from Turkey
          <div className={styles.footerRow}>
            {SERVICES.map((s, i) => (
              <span key={s.slug}>
                {i > 0 ? " · " : ""}
                <Link href={`/en/services/${s.slug}`}>{s.label}</Link>
              </span>
            ))}
          </div>
          <div className={styles.footerMuted}>© Bdimexport</div>
        </div>
      </footer>
    </div>
  );
}
