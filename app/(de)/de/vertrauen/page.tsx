// /de/vertrauen — Trust sayfası (D6 kabuk + FAZ_5 5.4 içerik: content/de/vertrauen.md). Standartlar (doğrulanabilir hizmet taahhütleri)
// + Kundenstimmen boş durumu: gerçek yorum gelene dek yorum YOK (CONTENT_STYLE §4: uydurma yorum = hard-red). Künye/Datenschutz metni = 5.1 PARK.
import type { Metadata } from "next";
import { BadgeCheck, Factory, FileText, MessageSquareQuote, Receipt } from "lucide-react";
import dict from "@/lib/messages/de.json";
import PageHeader from "@/lib/ui/PageHeader";
import ArticleLayout, { AsideCta } from "@/lib/ui/ArticleLayout";
import { tocFromHtml } from "@/lib/ui/md";
import { Section, SectionHeader } from "@/lib/ui/Section";
import CtaBand from "@/lib/ui/CtaBand";
import Reveal from "@/lib/ui/motion/Reveal";
import empty from "@/lib/ui/empty.module.css";
import { quoteHref } from "../_lib/chrome";
import { readDeDoc } from "../_lib/services";
import s from "../de.module.css";

const doc = readDeDoc("vertrauen");

export const metadata: Metadata = {
  title: { absolute: doc?.metaTitle ?? `${dict.vertrauen.title} | Bdimexport` },
  description: doc?.desc ?? dict.vertrauen.lead,
  alternates: { canonical: "https://bdimexport.com/de/vertrauen" },
};

const ICON = [Factory, FileText, Receipt];

export default function VertrauenPage() {
  const h = dict.home;
  const v = dict.vertrauen;
  const pg = dict.page;
  return (
    <main>
      <PageHeader crumbs={[{ label: pg.home, href: "/de" }, { label: v.title }]} crumbsLabel={pg.crumbs} eyebrow={h.trust.eyebrow} title={v.title} lead={v.lead} />
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
      {doc && (
        <ArticleLayout
          toc={tocFromHtml(doc.html)}
          tocLabel={pg.toc}
          aside={<AsideCta title={pg.aside.title} text={pg.aside.text} cta={{ label: h.hero.ctaPrimary, href: quoteHref }} />}
        >
          <div className="prose" dangerouslySetInnerHTML={{ __html: doc.html }} />
        </ArticleLayout>
      )}
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
