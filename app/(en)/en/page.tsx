// /en global hub — OPUS_TASARIM_YAYILIM D5: onaylı TR ana sayfa kalıbı, metin lib/messages/en.json (hero = design/hero-copy.md EN).
// Rakamlar: 24h SLA · UN Comtrade doğrulanmış ihracat toplamı (_claims.json, sektör sayfalarında kaynak linkli) · içerik sayımları.
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
import PartnerBand from "@/lib/ui/PartnerBand";
import CtaBand from "@/lib/ui/CtaBand";
import Reveal from "@/lib/ui/motion/Reveal";
import grid from "@/lib/ui/cardgrid.module.css";
import { enAlternates } from "./_lib/hreflang";
import { SERVICES, SERVICE_ICON, readServiceDesc } from "./_lib/services";
import { quoteHref } from "./_lib/chrome";
import { INDUSTRY_ICON, industryCards } from "./industries/_lib/industries";
import { productSlugs } from "./products/[slug]/_view";

// canonical + hreflang (en ailesi); başlık/açıklama (en) layout'tan
export const metadata: Metadata = { alternates: enAlternates("") };

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
  return (
    <main>
      <Hero
        eyebrow={h.hero.eyebrow}
        title={h.hero.h1}
        subtitle={h.hero.sub}
        primary={{ label: h.hero.ctaPrimary, href: quoteHref() }}
        secondary={{ label: h.hero.ctaSecondary, href: "/en/services" }}
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

      <Section id="services">
        <Reveal>
          <SectionHeader id="services" eyebrow={h.services.eyebrow} title={h.services.title} lead={h.services.lead}
            action={<Button href="/en/services" variant="ghost">{h.services.more}</Button>} />
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
          <SectionHeader id="industries" eyebrow={h.industries.eyebrow} title={h.industries.title} lead={h.industries.lead}
            action={<Button href="/en/industries" variant="ghost">{h.industries.more}</Button>} />
        </Reveal>
        <ul role="list" className={grid.grid}>
          {industries.map((c, i) => {
            const Icon = INDUSTRY_ICON[c.slug];
            return (
              <Reveal as="li" key={c.slug} index={i % 3}>
                <Card title={c.label} href={`/en/industries/${c.slug}`} description={c.desc} icon={<Icon />}
                  eyebrow={h.industries.figure.replace("{n}", fmtBn(c.bn))} more={dict.page.read} />
              </Reveal>
            );
          })}
        </ul>
      </Section>

      <Section id="process">
        <Reveal><SectionHeader id="process" eyebrow={h.process.eyebrow} title={h.process.title} align="center" /></Reveal>
        <Steps steps={h.process.steps} icons={STEP_ICON} />
      </Section>

      <PartnerBand id="partners" badge={h.partners.badge} title={h.partners.title} empty={h.partners.empty} />

      <CtaBand
        title={h.cta.title}
        lead={h.cta.lead}
        primary={{ label: h.hero.ctaPrimary, href: quoteHref() }}
        secondary={{ label: h.hero.ctaSecondary, href: "/en/services" }}
      />
    </main>
  );
}
