// /en/proposals/[slug] — Targeted B2B Outbound Proposal Landing Page (SEO Self-Canonical + Dynamic ABM Personalization)
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { ShieldCheck } from "lucide-react";
import dict from "@/lib/messages/en.json";
import PageHeader from "@/lib/ui/PageHeader";
import { Section, SectionHeader } from "@/lib/ui/Section";
import Button from "@/lib/ui/Button";
import SmartRfq, { type SmartRfqCopy } from "@/lib/ui/SmartRfq";
import Reveal from "@/lib/ui/motion/Reveal";
import { CORPORATE_ENTITIES, US_DUNS_NUMBER } from "@/lib/ui/entities";
import { EN_PROPOSALS, getEnProposalBySlug } from "@/lib/seo/proposals";
import ProposalPersonalizer from "@/lib/seo/ProposalPersonalizer";
import { SeoJsonLd, SITE_URL, buildStructuredPageGraph, defaultOpenGraph } from "@/lib/seo/schema";
import s from "@/lib/seo/proposal.module.css";
import { enAlternates } from "../../_lib/hreflang";
import { QUOTE_EMAIL } from "../../_lib/chrome";

export const dynamicParams = false;

export function generateStaticParams() {
  return EN_PROPOSALS.map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const p = getEnProposalBySlug(slug);
  if (!p) return {};
  const url = `${SITE_URL}/en/proposals/${p.slug}`;
  return {
    title: { absolute: p.metaTitle },
    description: p.metaDesc,
    alternates: enAlternates(`proposals/${p.slug}`),
    ...defaultOpenGraph({ title: p.metaTitle, description: p.metaDesc, url, locale: "en_US" }),
  };
}

export default async function EnProposalDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const p = getEnProposalBySlug(slug);
  if (!p) notFound();

  const url = `${SITE_URL}/en/proposals/${p.slug}`;
  const rfqCopy = dict.rfq as SmartRfqCopy;
  const graph = buildStructuredPageGraph({
    url,
    inLanguage: "en",
    title: p.h1,
    description: p.metaDesc,
    serviceType: p.badge,
    crumbs: [
      { name: "Home", url: `${SITE_URL}/en` },
      { name: "B2B Proposals", url: `${SITE_URL}/en/proposals` },
      { name: p.metaTitle.replace(/\s*\|\s*Bdimexport$/, ""), url },
    ],
    faq: p.faq,
  });

  return (
    <main>
      <SeoJsonLd graph={graph} />
      <PageHeader
        crumbs={[
          { label: "Home", href: "/en" },
          { label: "B2B Proposals", href: "/en/proposals" },
          { label: p.badge },
        ]}
        crumbsLabel="Breadcrumb"
        eyebrow={p.badge}
        title={p.h1}
        lead={p.lead}
        actions={<Button href="#rfq" variant="primary" size="lg" arrow>Activate Proposal &amp; Confirm Scope</Button>}
      />

      <Section id="deliverables">
        <ProposalPersonalizer
          labels={{
            eyebrow: "TAILORED EXECUTIVE BRIEF",
            preparedForPrefix: "Prepared for:",
            sectorLabel: "Product / Sector",
            marketLabel: "Target Corridor",
            hsLabel: "HS Code",
            volumeLabel: "Scope / Volume",
          }}
        />

        <Reveal>
          <SectionHeader
            id="deliverables"
            eyebrow={p.slaText}
            title={p.deliverablesTitle}
          />
        </Reveal>
        <div className={s.grid3}>
          {p.deliverables.map((d) => (
            <article key={d.code} className={s.box}>
              <span className={s.boxCode}>{d.code}</span>
              <h3 className={s.boxTitle}>{d.title}</h3>
              <p className={s.boxText}>{d.detail}</p>
            </article>
          ))}
        </div>
      </Section>

      <Section id="governance" tone="alt">
        <div className={s.grid2}>
          <div className={s.box}>
            <span className={s.boxCode}>GOVERNANCE &amp; SLA</span>
            <h2 className={s.boxTitle}>{p.commercialTermsTitle}</h2>
            <div className={s.kvList}>
              {p.commercialTerms.map((t) => (
                <div key={t.label} className={s.kvRow}>
                  <span className={s.kvLabel}>{t.label}</span>
                  <span className={s.kvValue}>{t.value}</span>
                </div>
              ))}
            </div>
          </div>

          <div className={s.box}>
            <span className={s.boxCode}>STRATEGIC RATIONALE</span>
            <h2 className={s.boxTitle}>{p.whyTitle}</h2>
            <ul className={s.bulletList}>
              {p.whyPoints.map((pt) => (
                <li key={pt}>{pt}</li>
              ))}
            </ul>
          </div>
        </div>
      </Section>

      <Section id="faq">
        <Reveal>
          <SectionHeader id="faq" eyebrow="Proposal Q&A" title={p.faqTitle} />
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
          locale="en"
          email={QUOTE_EMAIL}
          initialTrack={p.track}
          sourcePage={`/en/proposals/${p.slug}`}
        />
        <p className="chip" style={{ marginBlockStart: "var(--s-6)" }}>
          <ShieldCheck aria-hidden="true" className="chip-icon" />
          <span>
            Contractual execution via {CORPORATE_ENTITIES[1].name} (Wyoming, USA · D-U-N-S® #{US_DUNS_NUMBER}) &amp; {CORPORATE_ENTITIES[0].name} (Türkiye)
          </span>
        </p>
      </Section>
    </main>
  );
}
