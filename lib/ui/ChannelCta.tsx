// Bölge kanal CTA — I18N_RULES §2 matrisi. Tek komponent; kanal listesi lib/ui/variants.ts'ten.
// Birincil kanal highlight dolgu (sayfada 1), ikincil kontur (cta.md). Gerçek handle FAZ_8'de; şimdilik #contact çapası.
import styles from "./variant.module.css";
import { VARIANTS } from "./variants";
import type { EnVariant } from "../i18n";

export default function ChannelCta({ variant }: { variant: EnVariant }) {
  const v = VARIANTS[variant];
  return (
    <div className={styles.cta} role="region" aria-label={v.ctaNote}>
      <span className={styles.ctaNote}>{v.ctaNote}</span>
      {v.channels.map((c, i) => (
        <a
          key={c.id}
          href="#contact"
          data-channel={c.id}
          className={`${styles.btn} ${i === 0 ? styles.btnPrimary : styles.btnSecondary}`}
        >
          {c.text}
        </a>
      ))}
    </div>
  );
}
