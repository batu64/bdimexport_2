// /en/ar/insights — FAZ_4 4.6 article index for the AR variant (+ edge news cards). Layout: VariantShell (dir/lang).
import type { Metadata } from "next";
import PageHeader from "@/lib/ui/PageHeader";
import { VARIANTS } from "@/lib/ui/variants";
import { InsightList, SITE } from "@/lib/ui/insights";
import NewsCards from "@/app/components/NewsCards";

export const metadata: Metadata = {
  title: { absolute: "Insights: Turkish Export & Sourcing Guides | Bdimexport" },
  description: "Sourced guides on buying from Turkish manufacturers: specifications, inspection, logistics and trade data. Every article is human-reviewed before publishing.",
  alternates: { canonical: `${SITE}/en/ar/insights` },
};

export default function InsightsPage() {
  const v = VARIANTS.ar;
  return (
    <main>
      <PageHeader crumbs={[{ label: v.home, href: "/en/ar" }, { label: v.insights }]} crumbsLabel={v.crumbs} eyebrow={v.tagline} title={v.insights} lead={v.insightsLead} />
      <div className="container section">
        <InsightList scope="ar" empty={v.insightsEmpty} more={v.read} />
        <NewsCards locale="en-ar" />
      </div>
    </main>
  );
}
