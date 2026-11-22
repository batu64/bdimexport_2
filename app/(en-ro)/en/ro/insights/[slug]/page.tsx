// /en/ro/insights/{slug} — article page (RO variant). Content: content/en/ro/insights/{slug}.md.
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { InsightArticle, insightParams, readInsight } from "@/lib/ui/insights";
import { VARIANTS } from "@/lib/ui/variants";

export const dynamicParams = false;
export function generateStaticParams() {
  return insightParams("ro");
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const it = readInsight("ro", slug);
  if (!it) return { robots: { index: false, follow: false } };
  return { title: { absolute: it.metaTitle ?? `${it.title} | Bdimexport` }, description: it.desc, alternates: { canonical: it.url } };
}

export default async function Page({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const it = readInsight("ro", slug);
  if (!it) notFound();
  return <InsightArticle insight={it} crumbs={[{ label: VARIANTS.ro.home, href: "/en/ro" }, { label: VARIANTS.ro.insights, href: "/en/ro/insights" }]} crumbsLabel={VARIANTS.ro.crumbs} tocLabel={VARIANTS.ro.toc} eyebrow={VARIANTS.ro.insights} />;
}
