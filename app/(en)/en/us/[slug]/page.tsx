// /en/us/[slug] — High-Intent US Commercial SEO + GEO Cluster Pages (hreflang="en-US" · BDIMEXPORT LLC)
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
import { US_CLUSTER_PAGES, getUsClusterBySlug } from "@/lib/seo/us-hub";
import { SeoJsonLd, SITE_URL, buildStructuredPageGraph, defaultOpenGraph } from "@/lib/seo/schema";
import s from "@/lib/seo/proposal.module.css";
import { QUOTE_EMAIL } from "../../_lib/chrome";

export const dynamicParams = false;

export function generateStaticParams() {
  return US_CLUSTER_PAGES.map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const p = getUsClusterBySlug(slug);
  if (!p) return {};
  const url = `${SITE_URL}/en/us/${p.slug}`;
  return {
    title: { absolute: p.metaTitle },
    description: p.metaDesc,
    keywords: p.targetKeywords,
    alternates: {
      canonical: url,
      languages: {
        "en-US": url,
        en: url,
        "x-default": url,
      },
    },
    ...defaultOpenGraph({ title: p.metaTitle, description: p.metaDesc, url, locale: "en_US" }),
  };
}

export default async function UsClusterDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const p = getUsClusterBySlug(slug);
  if (!p) notFound();

  const url = `${SITE_URL}/en/us/${p.slug}`;
  const rfqCopy = dict.rfq as SmartRfqCopy;
  const graph = buildStructuredPageGraph({
    url,
    inLanguage: "en-US",
    title: p.h1,
    description: p.metaDesc,
    serviceType: p.eyebrow,
    areaServed: ["US", "TR", "CN"],
    crumbs: [
      { name: "Global Home", url: `${SITE_URL}/en` },
      { name: "US Division (BDIMEXPORT LLC)", url: `${SITE_URL}/en/us` },
      { name: p.metaTitle.replace(/\s*\|\s*Bdimexport$/, ""), url },
    ],
    faq: p.faq,
  });

  return (
    <main>
      <SeoJsonLd graph={graph} />
      <PageHeader
        crumbs={[
          { label: "Global Home", href: "/en" },
          { label: "US Division", href: "/en/us" },
          { label: p.eyebrow },
        ]}
        crumbsLabel="Breadcrumb"
        eyebrow={`${p.eyebrow} · BDIMEXPORT LLC (WY · D-U-N-S® #${US_DUNS_NUMBER})`}
        title={p.h1}
        lead={p.lead}
        actions={
          <div className={s.btnRow}>
            <Button href="#rfq" variant="primary" size="lg" arrow>
              Request 24h US Scope &amp; Quote
            </Button>
            <Button href="/en/proposals/us-procurement-partner" variant="secondary" size="lg">
              US Partnership Proposal
            </Button>
          </div>
        }
      />

      <Section id="metrics">
        <div className={s.grid2}>
          {p.keyMetrics.map((m) => (
            <div key={m.label} className={s.box}>
              <span className={s.boxCode}>{m.label}</span>
              <p className={s.kvValue}>{m.value}</p>
            </div>
          ))}
        </div>
      </Section>

      <Section id="matrix" tone="alt">
        <Reveal>
          <SectionHeader id="matrix" eyebrow="US Supply-Chain Benchmark" title={p.matrixTitle} lead={p.matrixLead} />
        </Reveal>
        <div className={s.tableWrap}>
          <table className={s.table}>
            <thead>
              <tr>
                {p.matrixHeaders.map((h) => (
                  <th key={h}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {p.matrixRows.map((row) => (
                <tr key={row[0]}>
                  <td className={s.metricCell}>{row[0]}</td>
                  <td>{row[1]}</td>
                  <td>{row[2]}</td>
                  <td>{row[3]}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Section>

      <Section id="execution">
        <Reveal>
          <SectionHeader id="execution" eyebrow="Turnkey US Partner Execution" title={p.executionTitle} />
        </Reveal>
        <div className={s.grid3}>
          {p.executionSteps.map((st) => (
            <article key={st.code} className={s.box}>
              <span className={s.boxCode}>{st.code}</span>
              <h3 className={s.boxTitle}>{st.title}</h3>
              <p className={s.boxText}>{st.detail}</p>
            </article>
          ))}
        </div>
      </Section>

      <Section id="products" tone="alt">
        <Reveal>
          <SectionHeader
            id="products"
            eyebrow="Connected Manufacturing Catalogs"
            title="Priority Product Hubs for US Importers"
            action={<Button href="/en/products" variant="ghost">All 20 product hubs</Button>}
          />
        </Reveal>
        <ul role="list" className={grid.grid}>
          {p.relatedProducts.map((rp, idx) => (
            <Reveal as="li" key={rp.slug} index={idx % 3}>
              <Card
                title={rp.label}
                href={`/en/products/${rp.slug}`}
                description={rp.note}
                icon={<Package />}
                more="View product specs"
              />
            </Reveal>
          ))}
        </ul>
      </Section>

      <Section id="faq">
        <Reveal>
          <SectionHeader id="faq" eyebrow="US Importer FAQ · Direct Answers" title="Frequently Asked Questions" />
        </Reveal>
        <div className={s.faqStack}>
          {p.faq.map((f) => (
            <article key={f.q} className={s.faqItem}>
              <h3 className={s.faqQ}>{f.q}</h3>
              <p className={s.faqA}>{f.a}</p>
            </article>
          ))}
        </div>
      </Section>

      <Section id="rfq" tone="alt">
        <SmartRfq
          copy={rfqCopy}
          locale="en-US"
          email={QUOTE_EMAIL}
          initialTrack={p.track}
          initialTargetMarket="United States"
          sourcePage={`/en/us/${p.slug}`}
        />
        <p className="chip" style={{ marginBlockStart: "var(--s-6)" }}>
          <ShieldCheck aria-hidden="true" className="chip-icon" />
          <span>
            Contracted via {CORPORATE_ENTITIES[1].name} (Sheridan, WY · D-U-N-S® #{US_DUNS_NUMBER}) · On-ground execution by {CORPORATE_ENTITIES[0].name}
          </span>
        </p>
      </Section>
    </main>
  );
}
