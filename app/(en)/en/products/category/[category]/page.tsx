// /en/products/category/{textile,food,machinery,construction,home-living} — FAZ_2 Step 2.2.
// "category" segmenti, Step 2.3'ün /en/products/[slug] ürün rotasıyla çakışmayı önler.
import GlobalShell from "../../../_lib/GlobalShell";
import { CategoryPageView, categoryMetadata, categorySlugs } from "../../_lib/views";

export const dynamicParams = false;

export function generateStaticParams() {
  return categorySlugs().map((category) => ({ category }));
}

export async function generateMetadata({ params }: { params: Promise<{ category: string }> }) {
  const { category } = await params;
  return categoryMetadata(category);
}

export default async function Page({ params }: { params: Promise<{ category: string }> }) {
  const { category } = await params;
  return (
    <GlobalShell>
      <CategoryPageView slug={category} />
    </GlobalShell>
  );
}
