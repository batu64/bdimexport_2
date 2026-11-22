// /en/proposals — Executive B2B Proposal Blueprints + Interactive Outbound Email & Link Builder (EN / DE / ZH)
import type { Metadata } from "next";
import { FileCheck2 } from "lucide-react";
import PageHeader from "@/lib/ui/PageHeader";
import { Section, SectionHeader } from "@/lib/ui/Section";
import Card from "@/lib/ui/Card";
import Button from "@/lib/ui/Button";
import Reveal from "@/lib/ui/motion/Reveal";
import grid from "@/lib/ui/cardgrid.module.css";
import { DE_PROPOSAL, EN_PROPOSALS, ZH_PROPOSAL } from "@/lib/seo/proposals";
import ProposalLinkBuilder, { type BuilderTemplateOption } from "@/lib/seo/ProposalLinkBuilder";
import { SeoJsonLd, SITE_URL, buildHubGraph, defaultOpenGraph } from "@/lib/seo/schema";
import { enAlternates } from "../_lib/hreflang";

const URL = `${SITE_URL}/en/proposals`;
const TITLE = "B2B Sourcing & Inspection Proposals | Bdimexport";
const DESC =
  "Executive B2B proposal blueprints for Dual-Hub sourcing, 24-48h container loading inspection, private-label OEM manufacturing, and 72h supplier due diligence.";

export const metadata: Metadata = {
  title: { absolute: TITLE },
  description: DESC,
  alternates: enAlternates("proposals"),
  ...defaultOpenGraph({ title: TITLE, description: DESC, url: URL, locale: "en_US" }),
};

const BUILDER_OPTIONS: BuilderTemplateOption[] = [
  ...EN_PROPOSALS.map((p) => ({
    id: `en-${p.slug}`,
    lang: "en" as const,
    label: `[EN] ${p.h1}`,
    fullBasePath: `/en/proposals/${p.slug}`,
    shortBasePath: `/p/${p.slug}`,
    subjectTpl: p.emailTemplate.subject,
    bodyTpl: p.emailTemplate.body,
  })),
  {
    id: `de-${DE_PROPOSAL.slug}`,
    lang: "de" as const,
    label: `[DE · DACH] ${DE_PROPOSAL.h1}`,
    fullBasePath: `/de/angebot/${DE_PROPOSAL.slug}`,
    shortBasePath: `/de/angebot/${DE_PROPOSAL.slug}`,
    subjectTpl: DE_PROPOSAL.emailTemplate.subject,
    bodyTpl: DE_PROPOSAL.emailTemplate.body,
  },
  {
    id: `zh-${ZH_PROPOSAL.slug}`,
    lang: "zh" as const,
    label: `[ZH · China] ${ZH_PROPOSAL.h1}`,
    fullBasePath: `/zh/fangan/${ZH_PROPOSAL.slug}`,
    shortBasePath: `/zh/fangan/${ZH_PROPOSAL.slug}`,
    subjectTpl: ZH_PROPOSAL.emailTemplate.subject,
    bodyTpl: ZH_PROPOSAL.emailTemplate.body,
  },
];

export default function EnProposalsIndexPage() {
  const graph = buildHubGraph({
    url: URL,
    inLanguage: "en",
    name: TITLE,
    description: DESC,
    services: EN_PROPOSALS.map((p) => ({
      name: p.h1,
      url: `${SITE_URL}/en/proposals/${p.slug}`,
      description: p.metaDesc,
    })),
  });

  return (
    <main>
      <SeoJsonLd graph={graph} />
      <PageHeader
        crumbs={[{ label: "Home", href: "/en" }, { label: "B2B Proposals" }]}
        crumbsLabel="Breadcrumb"
        eyebrow="Account-Based Executive Proposals · TR & US Corporate Desk"
        title="Structured B2B Sourcing, Inspection & Intelligence Proposals"
        lead="Review our modular engagement blueprints or generate a customized company proposal link for your procurement committee or outbound executive emails."
        actions={<Button href="#builder" variant="primary" size="lg" arrow>Open Proposal Link Builder</Button>}
      />

      <Section id="blueprints">
        <Reveal>
          <SectionHeader
            id="blueprints"
            eyebrow="Modular B2B Engagement Tracks"
            title="Select an Executive Proposal Blueprint"
            lead="Each proposal outlines verified deliverables, SLA commitments, transparent fee governance, and direct RFQ activation."
          />
        </Reveal>
        <ul role="list" className={grid.grid}>
          {EN_PROPOSALS.map((p, idx) => (
            <Reveal as="li" key={p.slug} index={idx % 3}>
              <Card
                title={p.h1}
                href={`/en/proposals/${p.slug}`}
                description={`${p.slaText} — ${p.metaDesc}`}
                icon={<FileCheck2 />}
                more="Review proposal"
              />
            </Reveal>
          ))}
        </ul>
      </Section>

      <Section id="builder" tone="alt">
        <ProposalLinkBuilder
          options={BUILDER_OPTIONS}
          copy={{
            eyebrow: "ABM Outbound Proposal Engine",
            title: "Generate a Targeted Company Proposal URL & Executive Email",
            lead: "Enter prospect details below to create an instant personalized landing link (/p/... short alias + canonical URL) that dynamically greets the company and pre-fills Smart RFQ.",
            templateLabel: "Proposal Track & Language",
            companyLabel: "Target Company Name",
            companyPlaceholder: "e.g., Nordic Home Retail AB",
            countryLabel: "Destination Country / Corridor",
            countryPlaceholder: "e.g., Germany, United States, UAE",
            sectorLabel: "Product Category / Scope",
            sectorPlaceholder: "e.g., Hospitality Furniture, Home Textiles",
            hsLabel: "HS Code (Optional)",
            hsPlaceholder: "e.g., 9403.60",
            volLabel: "Target Volume (Optional)",
            volPlaceholder: "e.g., 1x 40HQ Container",
            shortUrlLabel: "Clean Short Email Link (302 Redirects with Parameters)",
            fullUrlLabel: "Full Canonical Personalized URL",
            copyLinkBtn: "Copy URL",
            copiedBtn: "Copied ✓",
            copyEmailBtn: "Copy Complete Proposal Email",
            previewBtn: "Preview Personalized Page",
            subjectPrefix: "Subject",
            defaultCompany: "Your Company",
            defaultCountry: "your target market",
            defaultSector: "your product line",
          }}
        />
      </Section>
    </main>
  );
}
