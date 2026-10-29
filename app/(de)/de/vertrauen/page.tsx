// /de/vertrauen — Trust sayfası KABUĞU (D6). Standartlar (doğrulanabilir hizmet taahhütleri) + Kundenstimmen boş durumu:
// gerçek yorum gelene dek yorum YOK (CONTENT_STYLE §4: uydurma yorum = hard-red). Tam içerik FAZ_5 5.4 → o zamana dek noindex.
import type { Metadata } from "next";
import { BadgeCheck, Factory, FileText, MessageSquareQuote, Receipt } from "lucide-react";
import dict from "@/lib/messages/de.json";
import PageHeader from "@/lib/ui/PageHeader";
import { Section, SectionHeader } from "@/lib/ui/Section";
import CtaBand from "@/lib/ui/CtaBand";
import Reveal from "@/lib/ui/motion/Reveal";
import empty from "@/lib/ui/empty.module.css";
import { quoteHref } from "../_lib/chrome";
import s from "../de.module.css";

export const metadata: Metadata = {
  title: { absolute: `${dict.vertrauen.title} | Bdimexport` },
  description: dict.vertrauen.lead,
  robots: { index: false, follow: true },
};

const ICON = [Factory, FileText, Receipt];

export default function VertrauenPage() {
  const h = dict.home;
  const v = dict.vertrauen;
  return (
    <main>
      <PageHeader crumbs={[{ label: dict.page.home, href: "/de" }, { label: v.title }]} crumbsLabel={dict.page.crumbs} eyebrow={h.trust.eyebrow} title={v.title} lead={v.lead} />
      <Section id="standards">
        <h2 id="standards-title" className="visually-hidden">{h.trust.title}</h2>
        <ul role="list" className={s.trust}>
          {h.trust.items.map((t, i) => {
            const Icon = ICON[i];
            return (
              <Reveal as="li" key={t.title} index={i} className={s.trustItem}>
                <span className={s.trustBadge}><BadgeCheck aria-hidden="true" className={s.badgeIcon} /></span>
                <Icon aria-hidden="true" className={s.trustIcon} />
                <h3 className={s.trustTitle}>{t.title}</h3>
                <p className={s.trustText}>{t.text}</p>
              </Reveal>
            );
          })}
        </ul>
      </Section>
      <Section id="stimmen" tone="alt">
        <SectionHeader id="stimmen" title={v.reviewsTitle} />
        <div className={empty.box} aria-live="polite">
          <MessageSquareQuote aria-hidden="true" className={empty.icon} />
          <p>{v.reviewsEmpty}</p>
        </div>
      </Section>
      <CtaBand title={h.cta.title} lead={h.cta.lead} primary={{ label: h.hero.ctaPrimary, href: quoteHref }} />
    </main>
  );
}
