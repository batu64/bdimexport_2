// /en/es/insights — FAZ_4 4.6 article index for the ES variant (+ edge news cards). Layout: VariantShell (dir/lang).
import type { Metadata } from "next";
import PageHeader from "@/lib/ui/PageHeader";
import { VARIANTS } from "@/lib/ui/variants";
import { InsightList, listInsights, SITE } from "@/lib/ui/insights";
import NewsCards from "@/app/components/NewsCards";

export const metadata: Metadata = {
  title: { absolute: "Sourcing & Export Guides (ES) | bdimexport" },
  description: "Sourced guides on buying from Turkish manufacturers: specifications, inspection, logistics and trade data. Every article is human-reviewed before publishing.",
  alternates: { canonical: `${SITE}/en/es/insights` },
  ...(listInsights("es").length ? {} : { robots: { index: false, follow: true } }),
};

export default function InsightsPage() {
  const v = VARIANTS.es;
  return (
    <main>
      <PageHeader crumbs={[{ label: v.home, href: "/en/es" }, { label: v.insights }]} crumbsLabel={v.crumbs} eyebrow={v.tagline} title={v.insights} lead={v.insightsLead} />
      <div className="container section">
        <InsightList scope="es" empty={v.insightsEmpty} more={v.read} />
        <NewsCards locale="en-es" />
      </div>
    </main>
  );
}
