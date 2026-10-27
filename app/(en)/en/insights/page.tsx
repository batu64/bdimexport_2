// /en/insights — FAZ_4 4.6 article index (Content Factory → bot PR → merge) + edge news cards.
import type { Metadata } from "next";
import GlobalShell from "../_lib/GlobalShell";
import styles from "@/lib/ui/variant.module.css";
import { InsightList, SITE } from "@/lib/ui/insights";
import NewsCards from "@/app/components/NewsCards";

export const metadata: Metadata = {
  title: { absolute: "Insights: Turkish Export & Sourcing Guides | Bdimexport" },
  description: "Sourced guides on buying from Turkish manufacturers: specifications, inspection, logistics and trade data. Every article is human-reviewed before publishing.",
  alternates: { canonical: `${SITE}/en/insights` },
};

export default function InsightsPage() {
  return (
    <GlobalShell>
      <main className={styles.main}>
        <h1>Insights</h1>
        <InsightList scope="en" empty="No articles published yet. New guides appear here after human review." />
        <NewsCards locale="en" className={styles.news} />
      </main>
    </GlobalShell>
  );
}
