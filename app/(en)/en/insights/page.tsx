// /en/insights — FAZ_4 4.6 article index (Content Factory → bot PR → merge) + edge news cards.
import type { Metadata } from "next";
import PageHeader from "@/lib/ui/PageHeader";
import dict from "@/lib/messages/en.json";
import { InsightList, SITE } from "@/lib/ui/insights";
import NewsCards from "@/app/components/NewsCards";

export const metadata: Metadata = {
  title: { absolute: "Insights: Turkish Export & Sourcing Guides | Bdimexport" },
  description: "Sourced guides on buying from Turkish manufacturers: specifications, inspection, logistics and trade data. Every article is human-reviewed before publishing.",
  alternates: { canonical: `${SITE}/en/insights` },
};

export default function InsightsPage() {
  const pg = dict.page;
  return (
    <main>
      <PageHeader crumbs={[{ label: pg.home, href: "/en" }, { label: pg.insights }]} crumbsLabel={pg.crumbs} eyebrow={pg.insights} title={pg.insights} lead={pg.insightsLead} />
      <div className="container section">
        <InsightList scope="en" empty={pg.insightsEmpty} more={pg.read} />
        <NewsCards locale="en" />
      </div>
    </main>
  );
}
