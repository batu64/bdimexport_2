// /en/products/{slug} — 20 ürün SEO/GEO sayfası (FAZ_2 Step 2.3). Görünüm/schema/partner bloğu: ./_view.tsx · içerik: content/en/global/products/{slug}.md
import { ProductPageView, productMetadata, productSlugs } from "./_view";

export const dynamicParams = false;

export function generateStaticParams() {
  return productSlugs().map((slug) => ({ slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  return productMetadata(slug);
}

export default async function Page({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  return (
    <>
      <ProductPageView slug={slug} />
    </>
  );
}
