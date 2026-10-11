// TR ihracat içerik sayfası — FAZ_1 Step 1.5. İçerik/JSON-LD/canonical: app/(tr)/_lib/content.tsx
import { ContentPage, docMetadata, listSlugs } from "../../_lib/content";

export const dynamicParams = false;

export function generateStaticParams() {
  return listSlugs("ihracat").map((slug) => ({ slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  return docMetadata("ihracat", slug);
}

export default async function Page({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  return <ContentPage kind="ihracat" slug={slug} />;
}
