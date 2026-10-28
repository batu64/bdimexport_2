// /makaleler/{slug} — FAZ_4 4.6 makale sayfası. İçerik: content/tr/makaleler/{slug}.md (+ .schema.json JSON-LD).
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { InsightArticle, insightParams, readInsight } from "@/lib/ui/insights";
import { trAlternates } from "../../_lib/content";

export const dynamicParams = false;
export function generateStaticParams() {
  return insightParams("tr");
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const it = readInsight("tr", slug);
  if (!it) return { robots: { index: false, follow: false } };
  return { title: { absolute: it.metaTitle ?? `${it.title} | Bdimexport` }, description: it.desc, alternates: trAlternates(`/makaleler/${slug}`) };
}

export default async function Page({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const it = readInsight("tr", slug);
  if (!it) notFound();
  return <InsightArticle insight={it} crumbs={[{ label: "Ana Sayfa", href: "/" }, { label: "Makaleler", href: "/makaleler" }]} />;
}
