// /de/ratgeber — Fachartikel listesi (FAZ_5 5.6 · C7 shell). Makale yokken noindex (boş sayfa dizine girmez).
import type { Metadata } from "next";
import dict from "@/lib/messages/de.json";
import PageHeader from "@/lib/ui/PageHeader";
import { SITE } from "@/lib/ui/insights";
import { RATGEBER_BASE, RatgeberList, listRatgeber } from "../_lib/ratgeber";

const t = dict.ratgeber;

export const metadata: Metadata = {
  title: { absolute: `${t.title}: Beschaffung aus der Türkei | Bdimexport` },
  description: t.metaDesc,
  alternates: { canonical: `${SITE}${RATGEBER_BASE}` },
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
