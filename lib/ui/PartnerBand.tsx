// Onaylı partner bandı (partner-grid.md boş durumu): onaylı partner yokken dürüst "yakında" metni — partner UYDURULMAZ.
// Gerçek liste FAZ 8'de (API, consent_logo_en filtresi) bu bileşenin yerini alır.
import { BadgeCheck } from "lucide-react";
import Reveal from "./motion/Reveal";
import { Section } from "./Section";
import s from "./partnerband.module.css";

export default function PartnerBand({ id, badge, title, empty }: { id: string; badge: string; title: string; empty: string }) {
  return (
    <Section id={id} tone="alt">
      <Reveal>
        <div className={s.partners}>
          <span className={s.partnerBadge}>
            <BadgeCheck aria-hidden="true" className={s.partnerIcon} />
            {badge}
          </span>
          <h2 id={`${id}-title`} className={s.partnersTitle}>{title}</h2>
          <p className={s.partnersEmpty} aria-live="polite">{empty}</p>
          <ul role="list" className={s.ghostLogos} aria-hidden="true">
            {Array.from({ length: 6 }, (_, i) => <li key={i} style={{ "--i": i } as React.CSSProperties} />)}
          </ul>
        </div>
      </Reveal>
    </Section>
  );
}
