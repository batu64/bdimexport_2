// TR ithalat içerik sayfası — FAZ_1 Step 1.5. İçerik/JSON-LD/canonical: app/(tr)/_lib/content.tsx
import { ContentPage, docMetadata, listSlugs } from "../../_lib/content";

export const dynamicParams = false;

export function generateStaticParams() {
  return listSlugs("ithalat").map((slug) => ({ slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  return docMetadata("ithalat", slug);
}

export default async function Page({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  return <ContentPage kind="ithalat" slug={slug} />;
}
