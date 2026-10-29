// /de/leistungen/{slug} — FAZ_5 5.4 /de Leistungsseiten. İçerik/schema/metadata: app/(de)/de/_lib/services.tsx.
import { DeServicePage, deServiceMetadata, deServiceSlugs } from "../../_lib/services";

export const dynamicParams = false;

export function generateStaticParams() {
  return deServiceSlugs().map((slug) => ({ slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  return deServiceMetadata(slug);
}

export default async function Page({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  return <DeServicePage slug={slug} />;
}
