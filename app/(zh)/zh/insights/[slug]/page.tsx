// /zh/insights/{slug} — 资讯文章 (FAZ_5 5.6 · C7 shell). İçerik: content/zh/insights/{slug}.md (yayın botu PR'ı).
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { InsightArticle } from "@/lib/ui/insights";
import dict from "@/lib/messages/zh.json";
import { INSIGHTS_BASE, readZhInsight, zhInsightParams } from "../../_lib/insights";

export const dynamicParams = false;
export function generateStaticParams() {
  return zhInsightParams();
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const it = readZhInsight(slug);
  if (!it) return { robots: { index: false, follow: false } };
  return { title: { absolute: it.metaTitle ?? it.title }, description: it.desc, alternates: { canonical: it.url } };
}

export default async function Page({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const it = readZhInsight(slug);
  if (!it) notFound();
  const pg = dict.page;
  return (
    <InsightArticle insight={it} crumbs={[{ label: pg.home, href: "/zh" }, { label: dict.insights.title, href: INSIGHTS_BASE }]} crumbsLabel={pg.crumbs} tocLabel={pg.toc} eyebrow={dict.insights.title} />
  );
}
