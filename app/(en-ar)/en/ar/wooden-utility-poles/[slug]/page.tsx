// /en/ar/wooden-utility-poles/[slug] — Arabic MENA Wooden Electric Pole Spoke Pages (6 SSG pages).
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import PoleSpokeTemplate from "@/lib/ui/PoleSpokeTemplate";
import { AR_POLE_SPOKES } from "@/lib/seo/poles-spokes-ar";
import { POLE_OG_IMAGE } from "@/lib/seo/poles-funnel-copy";
import { SITE_URL, defaultOpenGraph } from "@/lib/seo/schema";

export const dynamicParams = false;

export function generateStaticParams() {
  return AR_POLE_SPOKES.map((s) => ({ slug: s.slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const spoke = AR_POLE_SPOKES.find((s) => s.slug === slug);
  if (!spoke) return {};
  const url = `${SITE_URL}/en/ar/wooden-utility-poles/${spoke.slug}`;
  const languages: Record<string, string> = { ar: url };
  if (spoke.crossAlternates?.en) {
    languages.en = `${SITE_URL}${spoke.crossAlternates.en}`;
    languages["x-default"] = `${SITE_URL}${spoke.crossAlternates.en}`;
  } else {
    languages["x-default"] = url;
  }
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

export default async function ArPoleSpokePage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const spoke = AR_POLE_SPOKES.find((s) => s.slug === slug);
  if (!spoke) notFound();
  return <PoleSpokeTemplate spoke={spoke} siblings={AR_POLE_SPOKES} />;
}
