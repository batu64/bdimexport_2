// /en/us — United States Division Flagship Hub (BDIMEXPORT LLC · Sheridan, Wyoming · hreflang="en-US").
// Built specifically to rank in Google US & AI Search for US companies seeking a dedicated overseas sourcing,
// manufacturing, quality inspection, and import management partner across Türkiye and China.
import type { Metadata } from "next";
import Link from "next/link";
import { Building2, ClipboardCheck, FileCheck2, ShieldCheck, Ship } from "lucide-react";
import dict from "@/lib/messages/en.json";
import Hero from "@/lib/ui/Hero";
import { Section, SectionHeader } from "@/lib/ui/Section";
import Card from "@/lib/ui/Card";
import Button from "@/lib/ui/Button";
import SmartRfq, { type SmartRfqCopy } from "@/lib/ui/SmartRfq";
import LoopVideo from "@/lib/ui/motion/LoopVideo";
import Reveal from "@/lib/ui/motion/Reveal";
import grid from "@/lib/ui/cardgrid.module.css";
import { CORPORATE_ENTITIES, SAP_ARIBA_ID, SAP_ARIBA_PROFILE_URL, US_DUNS_NUMBER } from "@/lib/ui/entities";
import { homeAlternates } from "@/lib/hreflang";
import { US_CLUSTER_PAGES } from "@/lib/seo/us-hub";
import { SeoJsonLd, SITE_URL, buildStructuredPageGraph, defaultOpenGraph } from "@/lib/seo/schema";
import s from "@/lib/seo/proposal.module.css";
import { QUOTE_EMAIL } from "../_lib/chrome";

const URL = `${SITE_URL}/en/us`;
const TITLE = "US Overseas Sourcing Partner (Turkey & China) | Bdimexport";
const DESC =
  "US-registered BDIMEXPORT LLC (Wyoming) manages your end-to-end Türkiye and China purchasing, OEM manufacturing, 24-48h container QC, and Section 301 tariff strategy.";

export const metadata: Metadata = {
  title: { absolute: TITLE },
  description: DESC,
  alternates: homeAlternates("en/us"),
  ...defaultOpenGraph({ title: TITLE, description: DESC, url: URL, locale: "en_US" }),
};

const US_HOME_FAQ = [
  {
    q: "How does BDIMEXPORT LLC work as an overseas procurement partner for US companies?",
    a: "BDIMEXPORT LLC (registered in Sheridan, Wyoming · Dun & Bradstreet D-U-N-S® #: 14-977-6743 · SAP Business Network / SAP Ariba ID: BNO-100000188010374) serves as your dedicated external overseas purchasing and quality department. While you contract domestically with our US LLC (W-9, D-U-N-S & SAP Ariba ready for rapid enterprise ERP onboarding), our full-time engineering teams on the ground in Türkiye and China execute factory vetting, open-book RFQ negotiation, OEM sample management, 24–48h AQL inspections, and container loading supervision.",
  },
  {
    q: "Why do American importers combine Türkiye and China instead of relying on one country?",
    a: "China remains unmatched for complex tooling, electronics, and ultra-high-volume hardgoods, whereas Türkiye offers zero US Section 301 tariff surcharges, 16–22 day direct ocean transit to NY/NJ and Savannah, UFLPA-clean cotton, and lower MOQs on furniture, stone, textiles, food, and metalwork. Managing both hubs through one US partner gives you optimal landed cost and supply-chain resilience.",
  },
  {
    q: "Can US companies start with a single inspection or supplier check before a full partnership?",
    a: "Yes. Many American importers begin by booking a 24–48h standalone container loading & AQL inspection on an existing Chinese or Turkish shipment, or ordering a 72-hour supplier due-diligence and 10-digit US HTS landed-cost report.",
  },
  {
    q: "Do you take undisclosed commissions from overseas factories?",
    a: "No. Undisclosed factory kickbacks create a direct conflict of interest against the buyer. BDIMEXPORT LLC operates on transparent, open-book factory quotations with our management or inspection fee clearly separated upfront.",
  },
  {
    q: "Which US ports and Incoterms do you support?",
    a: "We support EXW, FOB, CIF, DAP, and DDP shipments into New York/New Jersey, Savannah, Charleston, Norfolk, Miami, Houston, Chicago (rail ramps), and Los Angeles/Long Beach, complete with ISF 10+2 and US Customs documentation verification.",
  },
];

export default function UsDivisionHubPage() {
  const rfqCopy = dict.rfq as SmartRfqCopy;
  const graph = buildStructuredPageGraph({
    url: URL,
    inLanguage: "en-US",
    title: "US-Based Türkiye & China Sourcing, Manufacturing and Import Management Partner — BDIMEXPORT LLC",
    description: DESC,
    serviceType: "Overseas Procurement, Contract Manufacturing, Container Loading QC & Import Management",
    areaServed: ["US", "TR", "CN"],
    crumbs: [
      { name: "Global Home", url: `${SITE_URL}/en` },
      { name: "United States Division (BDIMEXPORT LLC)", url: URL },
    ],
    faq: US_HOME_FAQ,
  });

  return (
    <main>
      <SeoJsonLd graph={graph} />
      <Hero
        media={<LoopVideo name="dual-hub-radar" desktopOnly />}
        eyebrow={`BDIMEXPORT LLC (WY · D-U-N-S® #${US_DUNS_NUMBER} · SAP Ariba® ${SAP_ARIBA_ID})`}
        title="Your US-Based Overseas Sourcing, Manufacturing & Import Partner Across Türkiye and China"
        subtitle="Stop wiring deposits blind or managing fragmented offshore brokers. Contract with our US LLC while our on-ground engineers in Türkiye and China manage factory sourcing, Section 301 tariff hedging, OEM production, and 24–48h container sealing."
        primary={{ label: "Start US Partnership RFQ (24h)", href: "#rfq" }}
        secondary={{ label: "View US Partnership Proposal", href: "/en/proposals/us-procurement-partner" }}
        trust={[
          `US Legal Counterparty: BDIMEXPORT LLC (WY) — D-U-N-S® #${US_DUNS_NUMBER} · SAP Ariba® ${SAP_ARIBA_ID} · W-9 Ready`,
          "Dual-Hub Execution: Türkiye (16–22d East Coast) + China",
          "Open-Book Factory Pricing & 24–48h CTPAT Seal Proof",
        ]}
      />

      <Section id="us-pillars">
        <Reveal>
          <SectionHeader
            id="us-pillars"
            eyebrow="7 Specialized US Procurement Programs"
            title="Built Around What American Importers Actually Buy & Risk-Manage"
            lead="Explore dedicated US playbooks covering China+Türkiye tariff hedging, direct mill sourcing, 24–48h container QC, hospitality FF&E/stone, UFLPA-clean textiles, and 72h supplier due diligence."
          />
        </Reveal>
        <ul role="list" className={grid.grid}>
          {US_CLUSTER_PAGES.map((p, idx) => (
            <Reveal as="li" key={p.slug} index={idx % 3}>
              <Card
                title={p.h1}
                href={`/en/us/${p.slug}`}
                description={p.metaDesc}
                icon={p.track === "inspection" ? <ClipboardCheck /> : p.track === "intelligence" ? <FileCheck2 /> : <Ship />}
                more="Explore US program"
              />
            </Reveal>
          ))}
          <Reveal as="li" index={1}>
            <Card
              title="Executive US Procurement Partnership Proposal"
              href="/en/proposals/us-procurement-partner"
              description="Shareable W-9 ready partnership proposal outlining deliverables, open-book governance, and SLA commitments for US leadership teams."
              icon={<Building2 />}
              more="Open US proposal"
            />
          </Reveal>
        </ul>
      </Section>

      <Section id="us-port-matrix" tone="alt">
        <Reveal>
          <SectionHeader
            id="us-port-matrix"
            eyebrow="US Port & Customs Comparison"
            title="Türkiye vs. China Supply-Chain Matrix for American Companies"
            lead="Why leading US importers run a Dual-Hub model through BDIMEXPORT LLC instead of single-country dependency."
          />
        </Reveal>
        <div className={s.tableWrap}>
          <table className={s.table}>
            <thead>
              <tr>
                <th>US Procurement Factor</th>
                <th>Türkiye Manufacturing Hub</th>
                <th>China Manufacturing Hub</th>
                <th>Managed Together via BDIMEXPORT LLC</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td className={s.metricCell}>US Tariff Treatment</td>
                <td>Standard US MFN tariff (0 Section 301 surcharge)</td>
                <td>Base MFN + Section 301 duties (7.5%–25%+ on many lines)</td>
                <td>10-digit HTS landed-cost comparison before PO award</td>
              </tr>
              <tr>
                <td className={s.metricCell}>NY/NJ, Savannah &amp; Houston Transit</td>
                <td>16–22 days direct ocean freight</td>
                <td>28–36 days all-water ocean freight</td>
                <td>Faster inventory turns + lower safety-stock cash lockup</td>
              </tr>
              <tr>
                <td className={s.metricCell}>Cotton &amp; Forced-Labor Compliance</td>
                <td>100% UFLPA-clean Aegean/Anatolian cotton traceability</td>
                <td>Strict origin auditing required on textile inputs</td>
                <td>Zero CBP port detention surprises</td>
              </tr>
              <tr>
                <td className={s.metricCell}>Best-Fit Categories</td>
                <td>Furniture/FF&amp;E, Marble/Tile, Towels/Apparel, Food, Metal/CNC</td>
                <td>Complex Injection Tooling, Electronics, Hardware, Lighting</td>
                <td>Single US partner managing your entire overseas SKU catalog</td>
              </tr>
            </tbody>
          </table>
        </div>
      </Section>

      <Section id="faq">
        <Reveal>
          <SectionHeader
            id="faq"
            eyebrow="Direct Executive Answers"
            title="Frequently Asked Questions: US Overseas Procurement Partnership"
          />
        </Reveal>
        <div className={s.faqStack}>
          {US_HOME_FAQ.map((f, idx) => (
            <details key={f.q} className={s.faqDetails} open={idx === 0}>
              <summary className={s.faqSummary}>{f.q}</summary>
              <p className={s.faqBody}>{f.a}</p>
            </details>
          ))}
        </div>
      </Section>

      <Section id="rfq" tone="alt">
        <SmartRfq
          copy={rfqCopy}
          locale="en-US"
          email={QUOTE_EMAIL}
          initialTrack="sourcing"
          initialTargetMarket="United States"
          sourcePage="/en/us"
        />
        <p className="chip" style={{ marginBlockStart: "var(--s-6)" }}>
          <ShieldCheck aria-hidden="true" className="chip-icon" />
          <span>
            US Contracting Entity: {CORPORATE_ENTITIES[1].name} ({CORPORATE_ENTITIES[1].address} · D-U-N-S® #{US_DUNS_NUMBER} ·{" "}
            <a href={SAP_ARIBA_PROFILE_URL} target="_blank" rel="noopener noreferrer" data-clarity-event="us_hub_sap_ariba_verify">
              SAP Ariba® {SAP_ARIBA_ID}
            </a>
            {" · "}
            <Link href="/en/proposals/us-procurement-partner" data-clarity-event="us_hub_w9_proposal_click">
              W-9 &amp; Partnership Proposal →
            </Link>
            ) · Field Arm: {CORPORATE_ENTITIES[0].name}
          </span>
        </p>
      </Section>
    </main>
  );
}
