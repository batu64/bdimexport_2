// EN varyant ortak kabuk: lang/dir + token CSS değişkenleri + kanal CTA + switcher + footer.
// 5 varyant layout.tsx'i yalnızca <VariantShell variant="xx"> sarar. dir tek yerden (VARIANTS[v].dir) gelir.
import type { CSSProperties, ReactNode } from "react";
import Link from "next/link";
import styles from "./variant.module.css";
import ChannelCta from "./ChannelCta";
import LangSwitcher from "./LangSwitcher";
import { VARIANTS, switcherItems } from "./variants";
import { color, space, radius, touchMin, prose, font } from "./tokens";
import type { EnVariant } from "../i18n";

const vars = (rtl: boolean) =>
  ({
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
    "--font": rtl ? font.arabic : font.latin,
  }) as CSSProperties;

export default function VariantShell({
  variant,
  children,
}: {
  variant: EnVariant;
  children: ReactNode;
}) {
  const v = VARIANTS[variant];
  return (
    <div lang={v.lang} dir={v.dir} className={styles.shell} style={vars(v.dir === "rtl")}>
      <ChannelCta variant={variant} />
      <LangSwitcher itemsByPage={{ home: switcherItems("home"), sourcing: switcherItems("sourcing") }} currentCode={variant} label={v.switcherLabel} />
      {children}
      <footer className={styles.footer}>
        <div className={styles.footerIn}>
          <strong>Bdimexport</strong> — {v.tagline}
          <div className={styles.footerRow}>
            <Link href={`/en/${variant}`}>{v.home}</Link>
            {" · "}
            <Link href="/en" lang="en">English</Link>
          </div>
          <div className={styles.footerMuted}>© Bdimexport</div>
        </div>
      </footer>
    </div>
  );
}
