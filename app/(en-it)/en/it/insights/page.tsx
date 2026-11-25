// /en/it/insights — article index for the IT variant (+ edge news cards). Layout: VariantShell.
import type { Metadata } from "next";
import PageHeader from "@/lib/ui/PageHeader";
import { VARIANTS } from "@/lib/ui/variants";
import { InsightList, listInsights, SITE } from "@/lib/ui/insights";
import NewsCards from "@/app/components/NewsCards";

export const metadata: Metadata = {
  title: { absolute: "Sourcing & Export Guides (IT) | bdimexport" },
  description: "Sourced guides on buying from Turkish and Chinese manufacturers: specifications, container inspection, logistics and trade data.",
  alternates: { canonical: `${SITE}/en/it/insights` },
  ...(listInsights("it").length ? {} : { robots: { index: false, follow: true } }),
};

export default function InsightsPage() {
  const v = VARIANTS.it;
  return (
    <main>
      <PageHeader crumbs={[{ label: v.home, href: "/en/it" }, { label: v.insights }]} crumbsLabel={v.crumbs} eyebrow={v.tagline} title={v.insights} lead={v.insightsLead} />
      <div className="container section">
        <InsightList scope="it" empty={v.insightsEmpty} more={v.read} />
        <NewsCards locale="en-it" />
      </div>
    </main>
  );
}
