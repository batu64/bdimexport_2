// /teklif/[slug] — Şirketlere Gönderilen Hedefli İş Teklifi Sayfası (SEO Self-Canonical + İstemci Kişiselleştirme)
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { ShieldCheck } from "lucide-react";
import dict from "@/lib/messages/tr.json";
import PageHeader from "@/lib/ui/PageHeader";
import { Section, SectionHeader } from "@/lib/ui/Section";
import Button from "@/lib/ui/Button";
import SmartRfq, { type SmartRfqCopy } from "@/lib/ui/SmartRfq";
import Reveal from "@/lib/ui/motion/Reveal";
import { CORPORATE_ENTITIES, SAP_ARIBA_ID, SAP_ARIBA_PROFILE_URL, US_DUNS_NUMBER } from "@/lib/ui/entities";
import { buildAlternateSet, toMetadataAlternates } from "@/lib/hreflang";
import ProposalPersonalizer from "@/lib/seo/ProposalPersonalizer";
import { SeoJsonLd, SITE_URL, buildStructuredPageGraph, defaultOpenGraph } from "@/lib/seo/schema";
import s from "@/lib/seo/proposal.module.css";
import { QUOTE_EMAIL } from "../../_lib/links";
import { TR_PROPOSALS, getTrProposalBySlug } from "../../_lib/tr-seo-data";

export const dynamicParams = false;

export function generateStaticParams() {
  return TR_PROPOSALS.map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const p = getTrProposalBySlug(slug);
  if (!p) return {};
  const url = `${SITE_URL}/teklif/${p.slug}`;
  return {
    title: { absolute: p.metaTitle },
    description: p.metaDesc,
    alternates: {
      canonical: url,
      ...toMetadataAlternates(buildAlternateSet(`teklif/${p.slug}`, ["tr"])),
    },
    ...defaultOpenGraph({ title: p.metaTitle, description: p.metaDesc, url, locale: "tr_TR" }),
  };
}

export default async function TrProposalDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const p = getTrProposalBySlug(slug);
  if (!p) notFound();

  const url = `${SITE_URL}/teklif/${p.slug}`;
  const rfqCopy = dict.rfq as SmartRfqCopy;
  const graph = buildStructuredPageGraph({
    url,
    inLanguage: "tr-TR",
    title: p.h1,
    description: p.metaDesc,
    serviceType: p.badge,
    crumbs: [
      { name: "Ana Sayfa", url: SITE_URL },
      { name: "Kurumsal Teklifler", url: `${SITE_URL}/teklif` },
      { name: p.metaTitle.replace(/\s*\|\s*Bdimexport$/, ""), url },
    ],
    faq: p.faq,
  });

  return (
    <main>
      <SeoJsonLd graph={graph} />
      <PageHeader
        crumbs={[
          { label: "Ana Sayfa", href: "/" },
          { label: "Kurumsal Teklifler", href: "/teklif" },
          { label: p.badge },
        ]}
        crumbsLabel="Sayfa yolu"
        eyebrow={p.badge}
        title={p.h1}
        lead={p.lead}
        actions={
          <Button href="#rfq" variant="primary" size="lg" arrow>
            Teklifi Onayla / Kapsam İste (24s)
          </Button>
        }
      />

      <Section id="teslimatlar">
        <ProposalPersonalizer
          labels={{
            eyebrow: "FİRMANIZA ÖZEL HAZIRLANAN TEKLİF ÖZETİ",
            preparedForPrefix: "Sunulan Kurum:",
            sectorLabel: "Ürün / Sektör",
            marketLabel: "Hedef Pazar",
            hsLabel: "GTİP / HS",
            volumeLabel: "Kapsam / Hacim",
          }}
        />

        <Reveal>
          <SectionHeader id="teslimatlar" eyebrow={p.slaText} title={p.deliverablesTitle} />
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

      <Section id="sartlar" tone="alt">
        <div className={s.grid2}>
          <div className={s.box}>
            <span className={s.boxCode}>ÇALIŞMA VE HİZMET ŞARTLARI</span>
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
            <span className={s.boxCode}>STRATEJİK DEĞER</span>
            <h2 className={s.boxTitle}>{p.whyTitle}</h2>
            <ul className={s.bulletList}>
              {p.whyPoints.map((pt) => (
                <li key={pt}>{pt}</li>
              ))}
            </ul>
          </div>
        </div>
      </Section>

      <Section id="sss">
        <Reveal>
          <SectionHeader id="sss" eyebrow="Teklif Hakkında Merak Edilenler" title="Sık Sorulan Sorular" />
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
          locale="tr"
          email={QUOTE_EMAIL}
          initialTrack={p.track}
          sourcePage={`/teklif/${p.slug}`}
        />
        <p className="chip" style={{ marginBlockStart: "var(--s-6)" }}>
          <ShieldCheck aria-hidden="true" className="chip-icon" />
          <span>
            {CORPORATE_ENTITIES[0].name} (Türkiye) &amp; {CORPORATE_ENTITIES[1].name} (Wyoming, ABD · D-U-N-S® #{US_DUNS_NUMBER} ·{" "}
            <a href={SAP_ARIBA_PROFILE_URL} target="_blank" rel="noopener noreferrer" data-clarity-event="teklif_tr_sap_ariba_verify">
              SAP Ariba® {SAP_ARIBA_ID}
            </a>
            ) resmi altyapısıyla
          </span>
        </p>
      </Section>
    </main>
  );
}
