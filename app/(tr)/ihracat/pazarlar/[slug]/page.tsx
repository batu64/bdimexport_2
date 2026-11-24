// /ihracat/pazarlar/[slug] — Türk Üreticiler İçin Ülke Bazlı İhracat Koridoru SEO + GEO Sayfası
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Package, ShieldCheck } from "lucide-react";
import dict from "@/lib/messages/tr.json";
import PageHeader from "@/lib/ui/PageHeader";
import { Section, SectionHeader } from "@/lib/ui/Section";
import Card from "@/lib/ui/Card";
import Button from "@/lib/ui/Button";
import SmartRfq, { type SmartRfqCopy } from "@/lib/ui/SmartRfq";
import Reveal from "@/lib/ui/motion/Reveal";
import grid from "@/lib/ui/cardgrid.module.css";
import { CORPORATE_ENTITIES, SAP_ARIBA_ID, SAP_ARIBA_PROFILE_URL, US_DUNS_NUMBER } from "@/lib/ui/entities";
import { buildAlternateSet, toMetadataAlternates } from "@/lib/hreflang";
import { SeoJsonLd, SITE_URL, buildStructuredPageGraph, defaultOpenGraph } from "@/lib/seo/schema";
import s from "@/lib/seo/proposal.module.css";
import { APPLY_PATH, QUOTE_EMAIL } from "../../../_lib/links";
import { TR_EXPORT_CORRIDORS, getTrCorridorBySlug } from "../../../_lib/tr-seo-data";

export const dynamicParams = false;

export function generateStaticParams() {
  return TR_EXPORT_CORRIDORS.map((c) => ({ slug: c.slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const c = getTrCorridorBySlug(slug);
  if (!c) return {};
  const url = `${SITE_URL}/ihracat/pazarlar/${c.slug}`;
  return {
    title: { absolute: c.metaTitle },
    description: c.metaDesc,
    alternates: {
      canonical: url,
      ...toMetadataAlternates(buildAlternateSet(`ihracat/pazarlar/${c.slug}`, ["tr"])),
    },
    ...defaultOpenGraph({ title: c.metaTitle, description: c.metaDesc, url, locale: "tr_TR" }),
  };
}

export default async function TrExportCorridorPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const c = getTrCorridorBySlug(slug);
  if (!c) notFound();

  const url = `${SITE_URL}/ihracat/pazarlar/${c.slug}`;
  const rfqCopy = dict.rfq as SmartRfqCopy;
  const graph = buildStructuredPageGraph({
    url,
    inLanguage: "tr-TR",
    title: c.h1,
    description: c.metaDesc,
    serviceType: `${c.countryTitle} İhracat Pazarlama ve Alıcı Bulma Sistemi`,
    crumbs: [
      { name: "Ana Sayfa", url: SITE_URL },
      { name: "İhracat", url: `${SITE_URL}/ihracat` },
      { name: "Hedef Pazarlar", url: `${SITE_URL}/ihracat/pazarlar` },
      { name: c.countryTitle, url },
    ],
    faq: c.faq,
  });

  return (
    <main>
      <SeoJsonLd graph={graph} />
      <PageHeader
        crumbs={[
          { label: "Ana Sayfa", href: "/" },
          { label: "İhracat", href: "/ihracat" },
          { label: "Hedef Pazarlar", href: "/ihracat/pazarlar" },
          { label: c.countryTitle },
        ]}
        crumbsLabel="Sayfa yolu"
        eyebrow={c.regionBadge}
        title={c.h1}
        lead={c.lead}
        actions={
          <div className={s.btnRow}>
            <Button href="#rfq" variant="primary" size="lg" arrow>
              Bu Pazar İçin RFQ / Analiz İste
            </Button>
            <Button href={APPLY_PATH} variant="secondary" size="lg">
              Ücretsiz Programa Başvur
            </Button>
          </div>
        }
      />

      <Section id="gumruk-lojistik">
        <div className={s.grid2}>
          <div className={s.box}>
            <span className={s.boxCode}>GÜMRÜK VE LOJİSTİK PARAMETRELERİ</span>
            <h2 className={s.boxTitle}>{c.countryTitle} Ticaret Özeti</h2>
            <div className={s.kvList}>
              <div className={s.kvRow}>
                <span className={s.kvLabel}>Gümrük ve Anlaşma Rejimi</span>
                <span className={s.kvValue}>{c.customsRegime}</span>
              </div>
              <div className={s.kvRow}>
                <span className={s.kvLabel}>Ortalama Lojistik ve Koridor Süresi</span>
                <span className={s.kvValue}>{c.transitSummary}</span>
              </div>
              <div className={s.kvRow}>
                <span className={s.kvLabel}>Entegre Yabancı Alıcı Vitrinimiz</span>
                <span className={s.kvValue}>
                  <a href={c.buyerPortalHref}>{c.buyerPortalLabel}</a>
                </span>
              </div>
            </div>
          </div>

          <div className={s.box}>
            <span className={s.boxCode}>TEKNİK UYUM VE SERTİFİKASYON</span>
            <h2 className={s.boxTitle}>Sevkiyat Öncesi Kontrol Edilen Kriterler</h2>
            <ul className={s.bulletList}>
              {c.complianceItems.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          </div>
        </div>
      </Section>

      <Section id="rekabet-matrisi" tone="alt">
        <Reveal>
          <SectionHeader
            id="rekabet-matrisi"
            eyebrow="Asimetrik Rekabet Avantajı"
            title={`${c.countryTitle} Pazarında Nasıl Öne Çıkıyoruz?`}
          />
        </Reveal>
        <div className={s.tableWrap}>
          <table className={s.table}>
            <thead>
              <tr>
                <th>Karar Kriteri</th>
                <th>Türk Üretici Rekabet Avantajı</th>
                <th>Bdimexport Saha &amp; Dijital Uygulaması</th>
              </tr>
            </thead>
            <tbody>
              {c.comparisonRows.map((row) => (
                <tr key={row.criterion}>
                  <td className={s.metricCell}>{row.criterion}</td>
                  <td>{row.advantage}</td>
                  <td>{row.execution}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Section>

      <Section id="oncelikli-sektorler">
        <Reveal>
          <SectionHeader
            id="oncelikli-sektorler"
            eyebrow="Yüksek Talep Gören Ürün Grupları"
            title="Öncelikli GTİP ve İhracat Hizmet Bağlantıları"
          />
        </Reveal>
        <ul role="list" className={grid.grid}>
          {c.topSectors.map((sec, idx) => (
            <Reveal as="li" key={sec.label} index={idx % 3}>
              <Card
                title={sec.label}
                href={sec.serviceHref}
                description={`${sec.gtip} — Hedef ithalatçı tespiti, çok dilli vitrin ve doğrudan B2B teklif kurulumu.`}
                icon={<Package />}
                more="Hizmeti incele"
              />
            </Reveal>
          ))}
        </ul>
      </Section>

      <Section id="sss" tone="alt">
        <Reveal>
          <SectionHeader id="sss" eyebrow="Doğrudan Yanıtlar · GEO Bilgi Bankası" title="Sık Sorulan Sorular" />
        </Reveal>
        <div className={s.faqStack}>
          {c.faq.map((f) => (
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
          locale="tr"
          email={QUOTE_EMAIL}
          initialTrack="marketing"
          initialTargetMarket={c.countryTitle}
          sourcePage={`/ihracat/pazarlar/${c.slug}`}
        />
        <p className="chip" style={{ marginBlockStart: "var(--s-6)" }}>
          <ShieldCheck aria-hidden="true" className="chip-icon" />
          <span>
            {CORPORATE_ENTITIES[0].name} (TR) &amp; {CORPORATE_ENTITIES[1].name} (ABD · D-U-N-S® #{US_DUNS_NUMBER} ·{" "}
            <a href={SAP_ARIBA_PROFILE_URL} target="_blank" rel="noopener noreferrer" data-clarity-event="tr_market_sap_ariba_verify">
              SAP Ariba® {SAP_ARIBA_ID}
            </a>
            ) kurumsal güvencesiyle
          </span>
        </p>
      </Section>
    </main>
  );
}
