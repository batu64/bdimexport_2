// /en global hub — Bdimexport v3.0: Dual-Hub (Türkiye + China) Sourcing, Standalone Container QC, Commercial Intelligence & Remotion Motion
import type { Metadata } from "next";
import { ClipboardCheck, Factory, FileSearch, PackageSearch, Ship } from "lucide-react";
import dict from "@/lib/messages/en.json";
import Hero from "@/lib/ui/Hero";
import ProcessTracker from "@/lib/ui/ProcessTracker";
import StatBand from "@/lib/ui/StatBand";
import { Section, SectionHeader } from "@/lib/ui/Section";
import Card from "@/lib/ui/Card";
import Button from "@/lib/ui/Button";
import Steps from "@/lib/ui/Steps";
import LoopVideo from "@/lib/ui/motion/LoopVideo";
import PartnerBand from "@/lib/ui/PartnerBand";
import CtaBand from "@/lib/ui/CtaBand";
import Reveal from "@/lib/ui/motion/Reveal";
import TradeIntelligenceStage, { type StageTab } from "@/lib/ui/motion/TradeIntelligenceStage";
import grid from "@/lib/ui/cardgrid.module.css";
import { homeAlternates } from "@/lib/hreflang";
import { SeoJsonLd, SITE_URL, buildHubGraph, defaultOpenGraph } from "@/lib/seo/schema";
import { SERVICES, SERVICE_ICON, readServiceDesc } from "./_lib/services";
import { quoteHref } from "./_lib/chrome";
import { INDUSTRY_ICON, industryCards } from "./industries/_lib/industries";
import { productSlugs } from "./products/[slug]/_view";

const EN_HOME_TITLE = "Dual-Hub Sourcing & Container QC (TR & CN) | Bdimexport";
const EN_HOME_DESC =
  "Verified manufacturers in Türkiye and China, 24-48h standalone container loading supervision, OEM manufacturing, and HS-code commercial intelligence.";

export const metadata: Metadata = {
  title: { absolute: EN_HOME_TITLE },
  description: EN_HOME_DESC,
  alternates: homeAlternates("en"),
  ...defaultOpenGraph({ title: EN_HOME_TITLE, description: EN_HOME_DESC, url: `${SITE_URL}/en`, locale: "en_US" }),
};

const STEP_ICON = [FileSearch, PackageSearch, Factory, ClipboardCheck, Ship];

export default function EnHomePage() {
  const h = dict.home;
  const industries = industryCards();
  const exportsBn = industries.reduce((a, c) => a + c.bn, 0);
  const fmtBn = (n: number) => n.toLocaleString("en", { maximumFractionDigits: 1 });
  const stats = [
    { value: 24, unit: h.stats.quote.unit, label: h.stats.quote.label },
    { value: Math.round(exportsBn * 10) / 10, decimals: 1, unit: h.stats.exports.unit, label: h.stats.exports.label },
    { value: SERVICES.length, label: h.stats.services.label },
    { value: productSlugs().length, label: h.stats.products.label },
  ];
  const stageTabs = h.stage.tabs as [StageTab, StageTab, StageTab];

  const hubGraph = buildHubGraph({
    url: `${SITE_URL}/en`,
    inLanguage: "en",
    name: EN_HOME_TITLE,
    description: EN_HOME_DESC,
    services: SERVICES.map((sv) => ({
      name: sv.label,
      url: `${SITE_URL}/en/services/${sv.slug}`,
      description: readServiceDesc(sv.slug),
    })),
  });

  return (
    <main>
      <SeoJsonLd graph={hubGraph} />
      <Hero
        media={<LoopVideo name="hero-loop" desktopOnly />}
        eyebrow={h.hero.eyebrow}
        title={h.hero.h1}
        subtitle={h.hero.sub}
        primary={{ label: h.hero.ctaPrimary, href: quoteHref() }}
        secondary={{ label: h.hero.ctaSecondary, href: "/en/services/container-loading" }}
        trust={h.hero.trust}
        trustLabel={h.stats.label}
        visual={
          <ProcessTracker
            title={h.hero.visual.title}
            caption={h.hero.visual.caption}
            route={h.hero.visual.route}
            steps={h.hero.visual.steps}
            labels={{ done: h.hero.visual.done, active: h.hero.visual.active, next: h.hero.visual.next }}
            doneCount={2}
            badge={h.hero.visual.badge}
          />
        }
      />

      <StatBand items={stats} label={h.stats.label} locale="en" />

      <Section id="dual-hub-stage" tone="alt">
        <Reveal>
          <SectionHeader
            id="dual-hub-stage"
            eyebrow={h.stage.eyebrow}
            title={h.stage.title}
            lead={h.stage.lead}
            align="center"
            action={<Button href="/en/rfq" variant="ghost">{dict.nav.cta}</Button>}
          />
        </Reveal>
        <TradeIntelligenceStage tabs={stageTabs} />
      </Section>

      <Section id="services">
        <Reveal>
          <SectionHeader
            id="services"
            eyebrow={h.services.eyebrow}
            title={h.services.title}
            lead={h.services.lead}
            action={<Button href="/en/services" variant="ghost">{h.services.more}</Button>}
          />
        </Reveal>
        <ul role="list" className={grid.grid}>
          {SERVICES.map((sv, i) => {
            const Icon = SERVICE_ICON[sv.slug];
            return (
              <Reveal as="li" key={sv.slug} index={i % 3}>
                <Card title={sv.label} href={`/en/services/${sv.slug}`} description={readServiceDesc(sv.slug)} icon={<Icon />} more={dict.page.read} />
              </Reveal>
            );
          })}
        </ul>
      </Section>

      <Section id="industries" tone="alt">
        <Reveal>
          <SectionHeader
            id="industries"
            eyebrow={h.industries.eyebrow}
            title={h.industries.title}
            lead={h.industries.lead}
            action={<Button href="/en/industries" variant="ghost">{h.industries.more}</Button>}
          />
        </Reveal>
        <ul role="list" className={grid.grid}>
          {industries.map((c, i) => {
            const Icon = INDUSTRY_ICON[c.slug];
            return (
              <Reveal as="li" key={c.slug} index={i % 3}>
                <Card
                  title={c.label}
                  href={`/en/industries/${c.slug}`}
                  description={c.desc}
                  icon={<Icon />}
                  eyebrow={h.industries.figure.replace("{n}", fmtBn(c.bn))}
                  more={dict.page.read}
                />
              </Reveal>
            );
          })}
        </ul>
      </Section>

      <Section id="process">
        <Reveal><SectionHeader id="process" eyebrow={h.process.eyebrow} title={h.process.title} align="center" /></Reveal>
        <Steps steps={h.process.steps} icons={STEP_ICON} media={<LoopVideo name="process-flow" lazy />} />
      </Section>

      <PartnerBand id="partners" badge={h.partners.badge} title={h.partners.title} empty={h.partners.empty} />

      <CtaBand
        title={h.cta.title}
        lead={h.cta.lead}
        primary={{ label: h.hero.ctaPrimary, href: quoteHref() }}
        secondary={{ label: h.hero.ctaSecondary, href: "/en/services/container-loading" }}
      />
    </main>
  );
}
