// /en/fr/insights — FAZ_4 4.6 article index for the FR variant (+ edge news cards). Layout: VariantShell (dir/lang).
import type { Metadata } from "next";
import PageHeader from "@/lib/ui/PageHeader";
import { VARIANTS } from "@/lib/ui/variants";
import { InsightList, listInsights, SITE } from "@/lib/ui/insights";
import NewsCards from "@/app/components/NewsCards";

export const metadata: Metadata = {
  title: { absolute: "Sourcing & Export Guides (FR) | bdimexport" },
  description: "Sourced guides on buying from Turkish manufacturers: specifications, inspection, logistics and trade data. Every article is human-reviewed before publishing.",
  alternates: { canonical: `${SITE}/en/fr/insights` },
  ...(listInsights("fr").length ? {} : { robots: { index: false, follow: true } }),
};

export default function InsightsPage() {
  const v = VARIANTS.fr;
  return (
    <main>
      <PageHeader crumbs={[{ label: v.home, href: "/en/fr" }, { label: v.insights }]} crumbsLabel={v.crumbs} eyebrow={v.tagline} title={v.insights} lead={v.insightsLead} />
      <div className="container section">
        <InsightList scope="fr" empty={v.insightsEmpty} more={v.read} />
        <NewsCards locale="en-fr" />
      </div>
    </main>
  );
}
