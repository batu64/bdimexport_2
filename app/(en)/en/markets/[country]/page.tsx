// /en/markets/[country] — Programmatic Country Trade Corridor SEO + GEO Page (12 Priority Markets)
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Package, ShieldCheck } from "lucide-react";
import dict from "@/lib/messages/en.json";
import PageHeader from "@/lib/ui/PageHeader";
import { Section, SectionHeader } from "@/lib/ui/Section";
import Card from "@/lib/ui/Card";
import Button from "@/lib/ui/Button";
import SmartRfq, { type SmartRfqCopy } from "@/lib/ui/SmartRfq";
import Reveal from "@/lib/ui/motion/Reveal";
import grid from "@/lib/ui/cardgrid.module.css";
import { CORPORATE_ENTITIES, US_DUNS_NUMBER } from "@/lib/ui/entities";
import { MARKET_CORRIDORS, getMarketBySlug } from "@/lib/seo/markets";
import { SeoJsonLd, SITE_URL, buildStructuredPageGraph, defaultOpenGraph } from "@/lib/seo/schema";
import s from "@/lib/seo/proposal.module.css";
import { QUOTE_EMAIL } from "../../_lib/chrome";

export const dynamicParams = false;

export function generateStaticParams() {
  return MARKET_CORRIDORS.map((m) => ({ country: m.slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ country: string }> }): Promise<Metadata> {
  const { country } = await params;
  const m = getMarketBySlug(country);
  if (!m) return {};
  const url = `${SITE_URL}/en/markets/${m.slug}`;
  const languages: Record<string, string> = {
    en: url,
    "x-default": url,
  };
  if (m.hreflangRegional) languages[m.hreflangRegional] = url;
  return {
    title: { absolute: m.metaTitle },
    description: m.metaDesc,
    alternates: {
      canonical: url,
      languages,
    },
    ...defaultOpenGraph({ title: m.metaTitle, description: m.metaDesc, url, locale: "en_US" }),
  };
}

export default async function MarketCorridorPage({ params }: { params: Promise<{ country: string }> }) {
  const { country } = await params;
  const m = getMarketBySlug(country);
  if (!m) notFound();

  const url = `${SITE_URL}/en/markets/${m.slug}`;
  const rfqCopy = dict.rfq as SmartRfqCopy;
  const graph = buildStructuredPageGraph({
    url,
    inLanguage: "en",
    title: m.h1,
    description: m.metaDesc,
    serviceType: `B2B Sourcing, Container Loading Inspection & Trade Intelligence for ${m.countryName}`,
    areaServed: [m.isoCode, "TR", "CN"],
    crumbs: [
      { name: "Home", url: `${SITE_URL}/en` },
      { name: "Country Corridors", url: `${SITE_URL}/en/markets` },
      { name: m.countryName, url },
    ],
    faq: m.faq,
  });

  return (
    <main>
      <SeoJsonLd graph={graph} />
      <PageHeader
        crumbs={[
          { label: "Home", href: "/en" },
          { label: "Country Corridors", href: "/en/markets" },
          { label: m.countryName },
        ]}
        crumbsLabel="Breadcrumb"
        eyebrow={m.regionBadge}
        title={m.h1}
        lead={m.lead}
        actions={
          <div className={s.btnRow}>
            <Button href="#rfq" variant="primary" size="lg" arrow>
              Configure {m.isoCode} RFQ (24h)
            </Button>
            {m.nativeHubHref && m.nativeHubLabel && (
              <Button href={m.nativeHubHref} variant="secondary" size="lg">
                {m.nativeHubLabel}
              </Button>
            )}
          </div>
        }
      />

      <Section id="corridor-profile">
        <div className={s.grid2}>
          <div className={s.box}>
            <span className={s.boxCode}>CUSTOMS &amp; LOGISTICS PROFILE</span>
            <h2 className={s.boxTitle}>Tariff &amp; Gateway Parameters ({m.countryName})</h2>
            <div className={s.kvList}>
              <div className={s.kvRow}>
                <span className={s.kvLabel}>Customs &amp; Tariff Regime</span>
                <span className={s.kvValue}>{m.customsRegime}</span>
              </div>
              <div className={s.kvRow}>
                <span className={s.kvLabel}>Primary Entry Gateways &amp; Transit</span>
                <span className={s.kvValue}>{m.gateways}</span>
              </div>
              <div className={s.kvRow}>
                <span className={s.kvLabel}>Quotation Currencies</span>
                <span className={s.kvValue}>{m.currency}</span>
              </div>
            </div>
          </div>

          <div className={s.box}>
            <span className={s.boxCode}>PRE-SHIPMENT COMPLIANCE GATE</span>
            <h2 className={s.boxTitle}>Mandatory Standards Checked Before Sealing</h2>
            <ul className={s.bulletList}>
              {m.complianceStandards.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          </div>
        </div>
      </Section>

      <Section id="comparison" tone="alt">
        <Reveal>
          <SectionHeader
            id="comparison"
            eyebrow="Dual-Hub Supply Chain Matrix"
            title={`Türkiye vs. China Comparison for ${m.countryName} Importers`}
            lead="Objective side-by-side operational comparison across tariffs, freight lead time, and on-site quality assurance."
          />
        </Reveal>
        <div className={s.tableWrap}>
          <table className={s.table}>
            <thead>
              <tr>
                <th>Decision Factor</th>
                <th>Türkiye Manufacturing Hub</th>
                <th>China Manufacturing Hub</th>
                <th>Bdimexport Execution</th>
              </tr>
            </thead>
            <tbody>
              {m.comparisonRows.map((row) => (
                <tr key={row.factor}>
                  <td className={s.metricCell}>{row.factor}</td>
                  <td>{row.trHub}</td>
                  <td>{row.cnHub}</td>
                  <td>{row.bdimExecution}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Section>

      <Section id="priority-products">
        <Reveal>
          <SectionHeader
            id="priority-products"
            eyebrow="High-Demand Export Categories"
            title={`Top Sourced Product Lines for ${m.countryName}`}
            lead="Explore verified product specifications, compliance requirements, and partner manufacturing hubs."
            action={<Button href="/en/products" variant="ghost">View all 20 product hubs</Button>}
          />
        </Reveal>
        <ul role="list" className={grid.grid}>
          {m.priorityProducts.map((p, idx) => (
            <Reveal as="li" key={p.slug} index={idx % 3}>
              <Card
                title={p.label}
                href={`/en/products/${p.slug}`}
                description={`${p.hsChapter} — Verified factory shortlist, sample consolidation & pre-shipment AQL inspection.`}
                icon={<Package />}
                more="Product specs"
              />
            </Reveal>
          ))}
        </ul>
      </Section>

      <Section id="faq" tone="alt">
        <Reveal>
          <SectionHeader
            id="faq"
            eyebrow="Direct Answers · Trade & Compliance FAQ"
            title={`Frequently Asked Questions: Importing to ${m.countryName}`}
          />
        </Reveal>
        <div className={s.faqStack}>
          {m.faq.map((f) => (
            <article key={f.q} className={s.faqItem}>
              <h3 className={s.faqQ}>{f.q}</h3>
              <p className={s.faqA}>{f.a}</p>
            </article>
          ))}
        </div>
      </Section>

      <Section id="rfq">
        <SmartRfq
          copy={rfqCopy}
          locale="en"
          email={QUOTE_EMAIL}
          initialTrack="sourcing"
          initialTargetMarket={m.countryName}
          sourcePage={`/en/markets/${m.slug}`}
        />
        <p className="chip" style={{ marginBlockStart: "var(--s-6)" }}>
          <ShieldCheck aria-hidden="true" className="chip-icon" />
          <span>
            Backed by {CORPORATE_ENTITIES[1].name} (USA · D-U-N-S® #{US_DUNS_NUMBER}) &amp; {CORPORATE_ENTITIES[0].name} (Türkiye)
          </span>
        </p>
      </Section>
    </main>
  );
}
