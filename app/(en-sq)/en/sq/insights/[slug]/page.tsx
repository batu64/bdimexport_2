// /en/sq/insights/{slug} — article page (SQ variant). Content: content/en/sq/insights/{slug}.md.
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { InsightArticle, insightParams, readInsight } from "@/lib/ui/insights";
import { VARIANTS } from "@/lib/ui/variants";

export const dynamicParams = false;
export function generateStaticParams() {
  return insightParams("sq");
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const it = readInsight("sq", slug);
  if (!it) return { robots: { index: false, follow: false } };
  return { title: { absolute: it.metaTitle ?? `${it.title} | Bdimexport` }, description: it.desc, alternates: { canonical: it.url } };
}

export default async function Page({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const it = readInsight("sq", slug);
  if (!it) notFound();
  return <InsightArticle insight={it} crumbs={[{ label: VARIANTS.sq.home, href: "/en/sq" }, { label: VARIANTS.sq.insights, href: "/en/sq/insights" }]} crumbsLabel={VARIANTS.sq.crumbs} tocLabel={VARIANTS.sq.toc} eyebrow={VARIANTS.sq.insights} />;
}
