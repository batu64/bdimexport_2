// /de/angebot/[slug] — DACH B2B Projektvorschlag (Formal Sie · UWG-konform · Self-Canonical + ABM Personalisierung)
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import PageHeader from "@/lib/ui/PageHeader";
import { Section, SectionHeader } from "@/lib/ui/Section";
import Button from "@/lib/ui/Button";
import CtaBand from "@/lib/ui/CtaBand";
import Reveal from "@/lib/ui/motion/Reveal";
import { DE_PROPOSAL } from "@/lib/seo/proposals";
import ProposalPersonalizer from "@/lib/seo/ProposalPersonalizer";
import { SeoJsonLd, SITE_URL, buildStructuredPageGraph, defaultOpenGraph } from "@/lib/seo/schema";
import s from "@/lib/seo/proposal.module.css";
import { quoteHref } from "../../_lib/chrome";

export const dynamicParams = false;

export function generateStaticParams() {
  return [{ slug: DE_PROPOSAL.slug }];
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  if (slug !== DE_PROPOSAL.slug) return {};
  const url = `${SITE_URL}/de/angebot/${DE_PROPOSAL.slug}`;
  return {
    title: { absolute: DE_PROPOSAL.metaTitle },
    description: DE_PROPOSAL.metaDesc,
    alternates: {
      canonical: url,
      languages: {
        de: url,
        "de-DE": url,
        "de-AT": url,
        "de-CH": url,
      },
    },
    ...defaultOpenGraph({ title: DE_PROPOSAL.metaTitle, description: DE_PROPOSAL.metaDesc, url, locale: "de_DE" }),
  };
}

export default async function DeProposalPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  if (slug !== DE_PROPOSAL.slug) notFound();

  const p = DE_PROPOSAL;
  const url = `${SITE_URL}/de/angebot/${p.slug}`;
  const graph = buildStructuredPageGraph({
    url,
    inLanguage: "de",
    title: p.h1,
    description: p.metaDesc,
    serviceType: "Beschaffung / Sourcing & Werksprüfung (DACH)",
    areaServed: ["DE", "AT", "CH"],
    crumbs: [
      { name: "Startseite", url: `${SITE_URL}/de` },
      { name: "Projektvorschlag", url },
    ],
    faq: p.faq,
  });

  return (
    <main>
      <SeoJsonLd graph={graph} />
      <PageHeader
        crumbs={[
          { label: "Startseite", href: "/de" },
          { label: "Projektvorschlag" },
        ]}
        crumbsLabel="Brotkrumennavigation"
        eyebrow={p.badge}
        title={p.h1}
        lead={p.lead}
        actions={
          <div className={s.btnRow}>
            <Button href="/de/anfrage" variant="primary" size="lg" arrow>
              Kostenloses Angebot in 24 h anfordern
            </Button>
            <Button href={quoteHref} variant="secondary" size="lg">
              Per E-Mail anfragen
            </Button>
          </div>
        }
      />

      <Section id="umfang">
        <ProposalPersonalizer
          labels={{
            eyebrow: "INDIVIDUELLE PROJEKTÜBERSICHT",
            preparedForPrefix: "Erstellt für:",
            sectorLabel: "Warengruppe",
            marketLabel: "Zielregion",
            hsLabel: "HS-Code",
            volumeLabel: "Geplanter Umfang",
          }}
        />

        <Reveal>
          <SectionHeader id="umfang" eyebrow={p.slaText} title={p.deliverablesTitle} />
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

      <Section id="rahmen" tone="alt">
        <div className={s.grid2}>
          <div className={s.box}>
            <span className={s.boxCode}>KONDITIONEN &amp; SLA</span>
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
            <span className={s.boxCode}>OPERATIVER MEHRWERT</span>
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
          <SectionHeader id="faq" eyebrow="Fachfragen" title={p.faqTitle} />
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

      <CtaBand
        title="Projektumfang unverbindlich abstimmen"
        lead="Übermitteln Sie uns Ihre Spezifikation über das Anfrageformular oder direkt per E-Mail."
        primary={{ label: "Kostenloses Angebot in 24 h anfordern", href: "/de/anfrage" }}
        secondary={{ label: "Alle Leistungen ansehen", href: "/de#leistungen" }}
      />
    </main>
  );
}
