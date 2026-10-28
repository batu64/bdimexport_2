// /en/ar/insights/{slug} — FAZ_4 4.6 article page (AR variant). Content: content/en/ar/insights/{slug}.md.
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { InsightArticle, insightParams, readInsight } from "@/lib/ui/insights";
import { VARIANTS } from "@/lib/ui/variants";

export const dynamicParams = false;
export function generateStaticParams() {
  return insightParams("ar");
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const it = readInsight("ar", slug);
  if (!it) return { robots: { index: false, follow: false } };
  return { title: { absolute: it.metaTitle ?? `${it.title} | Bdimexport` }, description: it.desc, alternates: { canonical: it.url } };
}

export default async function Page({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const it = readInsight("ar", slug);
  if (!it) notFound();
  return <InsightArticle insight={it} crumbs={[{ label: VARIANTS.ar.home, href: "/en/ar" }, { label: VARIANTS.ar.insights, href: "/en/ar/insights" }]} crumbsLabel={VARIANTS.ar.crumbs} tocLabel={VARIANTS.ar.toc} eyebrow={VARIANTS.ar.insights} />;
}
