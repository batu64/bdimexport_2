// /en/pl/insights/{slug} — article page (PL variant). Content: content/en/pl/insights/{slug}.md.
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { InsightArticle, insightParams, readInsight } from "@/lib/ui/insights";
import { VARIANTS } from "@/lib/ui/variants";

export const dynamicParams = false;
export function generateStaticParams() {
  return insightParams("pl");
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const it = readInsight("pl", slug);
  if (!it) return { robots: { index: false, follow: false } };
  return { title: { absolute: it.metaTitle ?? `${it.title} | Bdimexport` }, description: it.desc, alternates: { canonical: it.url } };
}

export default async function Page({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const it = readInsight("pl", slug);
  if (!it) notFound();
  return <InsightArticle insight={it} crumbs={[{ label: VARIANTS.pl.home, href: "/en/pl" }, { label: VARIANTS.pl.insights, href: "/en/pl/insights" }]} crumbsLabel={VARIANTS.pl.crumbs} tocLabel={VARIANTS.pl.toc} eyebrow={VARIANTS.pl.insights} />;
}
