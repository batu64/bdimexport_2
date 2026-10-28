// /en/ru/insights/{slug} — FAZ_4 4.6 article page (RU variant). Content: content/en/ru/insights/{slug}.md.
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { InsightArticle, insightParams, readInsight } from "@/lib/ui/insights";
import { VARIANTS } from "@/lib/ui/variants";

export const dynamicParams = false;
export function generateStaticParams() {
  return insightParams("ru");
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const it = readInsight("ru", slug);
  if (!it) return { robots: { index: false, follow: false } };
  return { title: { absolute: it.metaTitle ?? `${it.title} | Bdimexport` }, description: it.desc, alternates: { canonical: it.url } };
}

export default async function Page({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const it = readInsight("ru", slug);
  if (!it) notFound();
  return <InsightArticle insight={it} crumbs={[{ label: VARIANTS.ru.home, href: "/en/ru" }, { label: VARIANTS.ru.insights, href: "/en/ru/insights" }]} crumbsLabel={VARIANTS.ru.crumbs} tocLabel={VARIANTS.ru.toc} eyebrow={VARIANTS.ru.insights} />;
}
