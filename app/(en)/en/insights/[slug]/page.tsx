// /en/insights/{slug} — FAZ_4 4.6 article page. Content: content/en/global/insights/{slug}.md (+ .schema.json JSON-LD).
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import GlobalShell from "../../_lib/GlobalShell";
import { InsightArticle, insightParams, readInsight } from "@/lib/ui/insights";

export const dynamicParams = false;
export function generateStaticParams() {
  return insightParams("en");
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const it = readInsight("en", slug);
  if (!it) return { robots: { index: false, follow: false } };
  return { title: { absolute: it.metaTitle ?? `${it.title} | Bdimexport` }, description: it.desc, alternates: { canonical: it.url } };
}

export default async function Page({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const it = readInsight("en", slug);
  if (!it) notFound();
  return (
    <GlobalShell>
      <InsightArticle insight={it} crumbs={[{ label: "Home", href: "/en" }, { label: "Insights", href: "/en/insights" }]} />
    </GlobalShell>
  );
}
