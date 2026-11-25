// /en/insights — FAZ_4 4.6 article index (Content Factory → bot PR → merge) + edge news cards.
import type { Metadata } from "next";
import PageHeader from "@/lib/ui/PageHeader";
import dict from "@/lib/messages/en.json";
import { InsightList, listInsights, SITE } from "@/lib/ui/insights";
import NewsCards from "@/app/components/NewsCards";

import { enAlternates } from "../_lib/hreflang";

export const metadata: Metadata = {
  title: { absolute: "Turkey & China Import, Tariff & Sourcing Guides | bdimexport" },
  description: "Practical B2B guides on US & UK import duties from Türkiye, A.TR customs rules, supplier verification, and factory inspection standards.",
  alternates: enAlternates("insights"),
  ...(listInsights("en").length ? {} : { robots: { index: false, follow: true } }),
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
