// /en/fr/wooden-utility-poles/[slug] — French Francophone Africa & Maghreb Poteau Électrique Bois Spoke Pages (5 SSG pages).
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import PoleSpokeTemplate from "@/lib/ui/PoleSpokeTemplate";
import { FR_POLE_SPOKES } from "@/lib/seo/poles-spokes-fr";
import { POLE_OG_IMAGE } from "@/lib/seo/poles-funnel-copy";
import { SITE_URL, defaultOpenGraph } from "@/lib/seo/schema";

export const dynamicParams = false;

export function generateStaticParams() {
  return FR_POLE_SPOKES.map((s) => ({ slug: s.slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const spoke = FR_POLE_SPOKES.find((s) => s.slug === slug);
  if (!spoke) return {};
  const url = `${SITE_URL}/en/fr/wooden-utility-poles/${spoke.slug}`;
  const languages: Record<string, string> = { fr: url };
  if (spoke.crossAlternates?.en) {
    languages.en = `${SITE_URL}${spoke.crossAlternates.en}`;
    languages["x-default"] = `${SITE_URL}${spoke.crossAlternates.en}`;
  } else {
    languages["x-default"] = url;
  }
  if (spoke.crossAlternates?.ar) languages.ar = `${SITE_URL}${spoke.crossAlternates.ar}`;
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

export default async function FrPoleSpokePage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const spoke = FR_POLE_SPOKES.find((s) => s.slug === slug);
  if (!spoke) notFound();
  return <PoleSpokeTemplate spoke={spoke} siblings={FR_POLE_SPOKES} />;
}
