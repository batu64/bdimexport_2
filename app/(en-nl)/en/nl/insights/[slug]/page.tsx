// /en/nl/insights/{slug} — FAZ_4 4.6 article page (NL variant). Content: content/en/nl/insights/{slug}.md.
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { InsightArticle, insightParams, readInsight } from "@/lib/ui/insights";
import { VARIANTS } from "@/lib/ui/variants";

export const dynamicParams = false;
export function generateStaticParams() {
  return insightParams("nl");
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const it = readInsight("nl", slug);
  if (!it) return { robots: { index: false, follow: false } };
  return { title: { absolute: it.metaTitle ?? `${it.title} | Bdimexport` }, description: it.desc, alternates: { canonical: it.url } };
}

export default async function Page({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const it = readInsight("nl", slug);
  if (!it) notFound();
  return <InsightArticle insight={it} crumbs={[{ label: VARIANTS.nl.home, href: "/en/nl" }, { label: VARIANTS.nl.insights, href: "/en/nl/insights" }]} crumbsLabel={VARIANTS.nl.crumbs} tocLabel={VARIANTS.nl.toc} eyebrow={VARIANTS.nl.insights} />;
}
