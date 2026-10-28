// /en/es/insights/{slug} — FAZ_4 4.6 article page (ES variant). Content: content/en/es/insights/{slug}.md.
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { InsightArticle, insightParams, readInsight } from "@/lib/ui/insights";
import { VARIANTS } from "@/lib/ui/variants";

export const dynamicParams = false;
export function generateStaticParams() {
  return insightParams("es");
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const it = readInsight("es", slug);
  if (!it) return { robots: { index: false, follow: false } };
  return { title: { absolute: it.metaTitle ?? `${it.title} | Bdimexport` }, description: it.desc, alternates: { canonical: it.url } };
}

export default async function Page({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const it = readInsight("es", slug);
  if (!it) notFound();
  return <InsightArticle insight={it} crumbs={[{ label: VARIANTS.es.home, href: "/en/es" }, { label: VARIANTS.es.insights, href: "/en/es/insights" }]} crumbsLabel={VARIANTS.es.crumbs} tocLabel={VARIANTS.es.toc} eyebrow={VARIANTS.es.insights} />;
}
