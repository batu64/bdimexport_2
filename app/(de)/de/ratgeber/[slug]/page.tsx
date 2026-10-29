// /de/ratgeber/{slug} — Fachartikel (FAZ_5 5.6 · C7 shell). İçerik: content/de/ratgeber/{slug}.md (yayın botu PR'ı).
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { InsightArticle } from "@/lib/ui/insights";
import dict from "@/lib/messages/de.json";
import { RATGEBER_BASE, ratgeberParams, readRatgeber } from "../../_lib/ratgeber";

export const dynamicParams = false;
export function generateStaticParams() {
  return ratgeberParams();
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const it = readRatgeber(slug);
  if (!it) return { robots: { index: false, follow: false } };
  return { title: { absolute: it.metaTitle ?? `${it.title} | Bdimexport` }, description: it.desc, alternates: { canonical: it.url } };
}

export default async function Page({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const it = readRatgeber(slug);
  if (!it) notFound();
  const pg = dict.page;
  return (
    <InsightArticle insight={it} crumbs={[{ label: pg.home, href: "/de" }, { label: dict.ratgeber.title, href: RATGEBER_BASE }]} crumbsLabel={pg.crumbs} tocLabel={pg.toc} eyebrow={dict.ratgeber.title} />
  );
}
