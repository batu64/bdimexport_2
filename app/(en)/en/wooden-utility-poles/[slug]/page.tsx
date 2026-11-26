// /en/wooden-utility-poles/[slug] — English Wooden Pole & Wooden Electric Pole Spoke Pages (6 SSG pages).
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import PoleSpokeTemplate from "@/lib/ui/PoleSpokeTemplate";
import { EN_POLE_SPOKES } from "@/lib/seo/poles-spokes-en";
import { POLE_OG_IMAGE } from "@/lib/seo/poles-funnel-copy";
import { SITE_URL, defaultOpenGraph } from "@/lib/seo/schema";

export const dynamicParams = false;

export function generateStaticParams() {
  return EN_POLE_SPOKES.map((s) => ({ slug: s.slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const spoke = EN_POLE_SPOKES.find((s) => s.slug === slug);
  if (!spoke) return {};
  const url = `${SITE_URL}/en/wooden-utility-poles/${spoke.slug}`;
  const languages: Record<string, string> = { en: url, "x-default": url };
  if (spoke.crossAlternates?.ar) languages.ar = `${SITE_URL}${spoke.crossAlternates.ar}`;
  if (spoke.crossAlternates?.fr) languages.fr = `${SITE_URL}${spoke.crossAlternates.fr}`;
  return {
    title: { absolute: spoke.metaTitle },
    description: spoke.metaDescription,
    alternates: { canonical: url, languages },
    ...defaultOpenGraph({
      title: spoke.metaTitle,
      description: spoke.metaDescription,
      url,
      locale: spoke.ogLocale,
      image: POLE_OG_IMAGE,
    }),
  };
}

export default async function EnPoleSpokePage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const spoke = EN_POLE_SPOKES.find((s) => s.slug === slug);
  if (!spoke) notFound();
  return <PoleSpokeTemplate spoke={spoke} siblings={EN_POLE_SPOKES} />;
}
