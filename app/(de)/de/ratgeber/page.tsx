// /de/ratgeber — Fachartikel listesi (FAZ_5 5.6 · C7 shell). Makale yokken noindex (boş sayfa dizine girmez).
import type { Metadata } from "next";
import dict from "@/lib/messages/de.json";
import PageHeader from "@/lib/ui/PageHeader";
import { SITE } from "@/lib/ui/insights";
import { crossClusterAlternates, toMetadataAlternates } from "@/lib/hreflang";
import { RATGEBER_BASE, RatgeberList, listRatgeber } from "../_lib/ratgeber";

const t = dict.ratgeber;
const ratgeberCross = crossClusterAlternates(RATGEBER_BASE);

export const metadata: Metadata = {
  title: { absolute: "Import Ratgeber: Türkei, China, A.TR & Zoll | bdimexport" },
  description: t.metaDesc,
  alternates: {
    canonical: `${SITE}${RATGEBER_BASE}`,
    ...(ratgeberCross ? toMetadataAlternates(ratgeberCross) : {}),
  },
  ...(listRatgeber().length ? {} : { robots: { index: false, follow: true } }),
};

export default function RatgeberPage() {
  const pg = dict.page;
  return (
    <main>
      <PageHeader crumbs={[{ label: pg.home, href: "/de" }, { label: t.title }]} crumbsLabel={pg.crumbs} eyebrow={t.title} title={t.title} lead={t.lead} />
      <div className="container section">
        <RatgeberList emptyText={t.empty} more={t.read} />
      </div>
    </main>
  );
}
