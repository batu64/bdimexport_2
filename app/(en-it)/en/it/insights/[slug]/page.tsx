// /en/it/insights/{slug} — article page (IT variant). Content: content/en/it/insights/{slug}.md.
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { InsightArticle, insightParams, readInsight } from "@/lib/ui/insights";
import { VARIANTS } from "@/lib/ui/variants";

export const dynamicParams = false;
export function generateStaticParams() {
  return insightParams("it");
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const it = readInsight("it", slug);
  if (!it) return { robots: { index: false, follow: false } };
  return { title: { absolute: it.metaTitle ?? `${it.title} | Bdimexport` }, description: it.desc, alternates: { canonical: it.url } };
}

export default async function Page({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const it = readInsight("it", slug);
  if (!it) notFound();
  return <InsightArticle insight={it} crumbs={[{ label: VARIANTS.it.home, href: "/en/it" }, { label: VARIANTS.it.insights, href: "/en/it/insights" }]} crumbsLabel={VARIANTS.it.crumbs} tocLabel={VARIANTS.it.toc} eyebrow={VARIANTS.it.insights} />;
}
