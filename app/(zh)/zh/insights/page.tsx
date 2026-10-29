// /zh/insights — 行业资讯 listesi (FAZ_5 5.6 · C7 shell). Makale yokken noindex (boş sayfa dizine girmez).
import type { Metadata } from "next";
import dict from "@/lib/messages/zh.json";
import PageHeader from "@/lib/ui/PageHeader";
import { SITE } from "@/lib/ui/insights";
import { INSIGHTS_BASE, ZhInsightList, listZhInsights } from "../_lib/insights";

const t = dict.insights;

export const metadata: Metadata = {
  title: { absolute: `${t.title}｜土耳其市场准入与本地运营` },
  description: t.metaDesc,
  alternates: { canonical: `${SITE}${INSIGHTS_BASE}` },
  ...(listZhInsights().length ? {} : { robots: { index: false, follow: true } }),
};

export default function InsightsPage() {
  const pg = dict.page;
  return (
    <main>
      <PageHeader crumbs={[{ label: pg.home, href: "/zh" }, { label: t.title }]} crumbsLabel={pg.crumbs} eyebrow={t.title} title={t.title} lead={t.lead} />
      <div className="container section">
        <ZhInsightList emptyText={t.empty} more={t.read} />
      </div>
    </main>
  );
}
