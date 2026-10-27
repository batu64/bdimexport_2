// /en/nl/insights/{slug} — FAZ_4 4.6 article page (NL variant). Content: content/en/nl/insights/{slug}.md.
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { InsightArticle, insightParams, readInsight } from "@/lib/ui/insights";

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
  return <InsightArticle insight={it} crumbs={[{ label: "Home", href: "/en/nl" }, { label: "Insights", href: "/en/nl/insights" }]} />;
}
