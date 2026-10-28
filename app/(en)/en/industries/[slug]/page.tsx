// /en/industries/{textile,food,machinery,construction,home-living} — FAZ_2 Step 2.4 rework (rota /en altına taşındı).
import { IndustryPageView, industryMetadata, industrySlugs } from "../_lib/industries";

export const dynamicParams = false;

export function generateStaticParams() {
  return industrySlugs().map((slug) => ({ slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  return industryMetadata(slug);
}

export default async function Page({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  return (
    <>
      <IndustryPageView slug={slug} />
    </>
  );
}
