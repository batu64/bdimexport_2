// /de Hub — OPUS_TASARIM D6: onaylı kalıp, "sakin-güven" (data-locale=de: ölçülü altın, yalnız primary CTA'da).
// Metin lib/messages/de.json (hero = design/hero-copy.md DE TASLAK; final dil pass'i FAZ 5.4). Rakamlar: SLA + doğrulanmış UN Comtrade.
// Leistungsseiten DE henüz yok (FAZ 5.4) → kartlar EN sayfalara "(Englisch)" etiketiyle (404'a link yok).
import { BadgeCheck, Boxes, ClipboardCheck, Factory, FileSearch, FileText, Landmark, PackageSearch, Receipt, Ship } from "lucide-react";
import dict from "@/lib/messages/de.json";
import Hero from "@/lib/ui/Hero";
import StatBand from "@/lib/ui/StatBand";
import { Section, SectionHeader } from "@/lib/ui/Section";
import Card from "@/lib/ui/Card";
import Button from "@/lib/ui/Button";
import Steps from "@/lib/ui/Steps";
import LoopVideo from "@/lib/ui/motion/LoopVideo";
import PartnerBand from "@/lib/ui/PartnerBand";
import CtaBand from "@/lib/ui/CtaBand";
import Reveal from "@/lib/ui/motion/Reveal";
import grid from "@/lib/ui/cardgrid.module.css";
import { SERVICES } from "@/app/(en)/en/_lib/services";
import { industryCards } from "@/app/(en)/en/industries/_lib/industries";
import { quoteHref } from "./_lib/chrome";
import s from "./de.module.css";

const SERVICE_ICON = { sourcing: PackageSearch, manufacturing: Boxes, inspection: Factory, logistics: Ship, customs: Landmark } as const;
const STEP_ICON = [FileSearch, PackageSearch, Factory, ClipboardCheck, Ship];
const TRUST_ICON = [Factory, FileText, Receipt];

export default function DeHomePage() {
  const h = dict.home;
  const bn = industryCards().reduce((a, c) => a + c.bn, 0);
  const stats = [
    { value: 24, unit: h.stats.quote.unit, label: h.stats.quote.label },
    { value: 48, unit: h.stats.report.unit, label: h.stats.report.label },
    { value: Math.round(bn * 10) / 10, decimals: 1, unit: h.stats.exports.unit, label: h.stats.exports.label },
    { value: SERVICES.length, label: h.stats.services.label },
  ];
  return (
    <main>
      <Hero
        media={<LoopVideo name="hero-loop" desktopOnly />}
        eyebrow={h.hero.eyebrow}
        title={h.hero.h1}
        subtitle={h.hero.sub}
        primary={{ label: h.hero.ctaPrimary, href: quoteHref }}
        secondary={{ label: h.hero.ctaSecondary, href: "#leistungen" }}
        trust={h.hero.trust}
        trustLabel={h.stats.label}
      />
      <StatBand items={stats} label={h.stats.label} locale="de" />

      <Section id="leistungen">
        <Reveal><SectionHeader id="leistungen" eyebrow={h.services.eyebrow} title={h.services.title} lead={h.services.lead} /></Reveal>
        <ul role="list" className={grid.grid}>
          {SERVICES.map((sv, i) => {
            const Icon = SERVICE_ICON[sv.slug];
            return (
              <Reveal as="li" key={sv.slug} index={i % 3}>
                <Card title={h.services.items[sv.slug]} href={`/en/services/${sv.slug}`} hrefLang="en" icon={<Icon />} more={h.services.more} />
              </Reveal>
            );
          })}
        </ul>
      </Section>

      <Section id="vertrauen" tone="alt">
        <Reveal>
          <SectionHeader id="vertrauen" eyebrow={h.trust.eyebrow} title={h.trust.title} lead={h.trust.lead}
            action={<Button href="/de/vertrauen" variant="ghost">{h.trust.more}</Button>} />
        </Reveal>
        <ul role="list" className={s.trust}>
          {h.trust.items.map((t, i) => {
            const Icon = TRUST_ICON[i];
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

      <Section id="ablauf">
        <Reveal><SectionHeader id="ablauf" eyebrow={h.process.eyebrow} title={h.process.title} align="center" /></Reveal>
        <Steps steps={h.process.steps} icons={STEP_ICON} media={<LoopVideo name="process-flow" lazy />} />
      </Section>

      <PartnerBand id="partner" badge={h.partners.badge} title={h.partners.title} empty={h.partners.empty} />
      <CtaBand title={h.cta.title} lead={h.cta.lead} primary={{ label: h.hero.ctaPrimary, href: quoteHref }} />
    </main>
  );
}
