// /en/markets — Global Country Corridors & Local Language Hubs Index (2026/2027 International SEO + GEO Architecture)
import type { Metadata } from "next";
import { Globe2, Languages } from "lucide-react";
import PageHeader from "@/lib/ui/PageHeader";
import { Section, SectionHeader } from "@/lib/ui/Section";
import Card from "@/lib/ui/Card";
import Button from "@/lib/ui/Button";
import CtaBand from "@/lib/ui/CtaBand";
import Reveal from "@/lib/ui/motion/Reveal";
import grid from "@/lib/ui/cardgrid.module.css";
import { enVariants } from "@/lib/i18n";
import { VARIANTS } from "@/lib/ui/variants";
import { MARKET_CORRIDORS } from "@/lib/seo/markets";
import { SeoJsonLd, SITE_URL, buildHubGraph, defaultOpenGraph } from "@/lib/seo/schema";
import { enAlternates } from "../_lib/hreflang";

const URL = `${SITE_URL}/en/markets`;
const TITLE = "Global Import Country Corridors & Local Hubs | Bdimexport";
const DESC =
  "Country-specific customs tariffs (A.TR, UK-FTA, US Section 301, UAE CEPA, SABER), transit benchmarks, and 24-48h container QC across 12 markets and 14 languages.";

export const metadata: Metadata = {
  title: { absolute: TITLE },
  description: DESC,
  alternates: enAlternates("markets"),
  ...defaultOpenGraph({ title: TITLE, description: DESC, url: URL, locale: "en_US" }),
};

export default function EnMarketsHubPage() {
  const graph = buildHubGraph({
    url: URL,
    inLanguage: "en",
    name: TITLE,
    description: DESC,
    services: MARKET_CORRIDORS.map((m) => ({
      name: `${m.countryName} Sourcing & Inspection Corridor`,
      url: `${SITE_URL}/en/markets/${m.slug}`,
      description: m.metaDesc,
    })),
  });

  return (
    <main>
      <SeoJsonLd graph={graph} />
      <PageHeader
        crumbs={[{ label: "Home", href: "/en" }, { label: "Country Corridors" }]}
        crumbsLabel="Breadcrumb"
        eyebrow="International Trade Corridors · Dual-Hub (Türkiye + China)"
        title="Country-Specific Sourcing, Tariff & Inspection Hubs"
        lead="Select your destination market to compare Türkiye vs. China customs duties, door-to-door transit times, mandatory regulatory checks, and 24–48h container loading inspection protocols."
        actions={<Button href="/en/rfq" variant="primary" size="lg" arrow>Start Smart RFQ (24h)</Button>}
      />

      <Section id="corridors">
        <Reveal>
          <SectionHeader
            id="corridors"
            eyebrow="12 Priority Destination Markets"
            title="Import Tariffs, Transit Days & Compliance by Country"
            lead="Each corridor models real customs treaties (EU A.TR, UK-Türkiye FTA, Türkiye-UAE CEPA, Saudi SABER, US Section 301 vs. MFN) alongside verified factory sourcing."
          />
        </Reveal>
        <ul role="list" className={grid.grid}>
          {MARKET_CORRIDORS.map((m, idx) => (
            <Reveal as="li" key={m.slug} index={idx % 3}>
              <Card
                title={`${m.countryName} (${m.isoCode})`}
                href={`/en/markets/${m.slug}`}
                description={`${m.regionBadge} — ${m.gateways}`}
                icon={<Globe2 />}
                more="Explore corridor"
              />
            </Reveal>
          ))}
        </ul>
      </Section>

      <Section id="native-hubs" tone="alt">
        <Reveal>
          <SectionHeader
            id="native-hubs"
            eyebrow="14 Native-Language Portals"
            title="Regional Decision-Maker Portals in Local Languages"
            lead="Share localized sourcing and container inspection documentation with regional executives in their preferred business language."
          />
        </Reveal>
        <ul role="list" className={grid.grid}>
          <Reveal as="li" index={0}>
            <Card title="Deutsch (DACH)" href="/de" description="Dedizierte Plattform fuer Deutschland, Oesterreich und die Schweiz (A.TR, LkSG, Werkspruefung)." icon={<Languages />} more="Open /de" />
          </Reveal>
          <Reveal as="li" index={1}>
            <Card title="简体中文 (China Desk)" href="/zh" description="81-province Türkiye on-ground customer visits, buyer closing, customs and local operations for Chinese exporters." icon={<Languages />} more="Open /zh" />
          </Reveal>
          {enVariants.map((v, idx) => (
            <Reveal as="li" key={v} index={(idx + 2) % 3}>
              <Card
                title={`${VARIANTS[v].label} (/en/${v})`}
                href={`/en/${v}`}
                description={`Localized sourcing & 24–48h container inspection overview (${v.toUpperCase()}).`}
                icon={<Languages />}
                more={`Open /en/${v}`}
              />
            </Reveal>
          ))}
        </ul>
      </Section>

      <CtaBand
        title="Need a Custom Landed-Cost Comparison for Your Country?"
        lead="Submit your product, HS code, and destination port via Smart RFQ for a written Dual-Hub response within 24 hours."
        primary={{ label: "Launch Smart RFQ", href: "/en/rfq" }}
        secondary={{ label: "View B2B Proposal Blueprints", href: "/en/proposals" }}
      />
    </main>
  );
}
