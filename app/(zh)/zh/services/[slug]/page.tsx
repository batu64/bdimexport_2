// /zh/services/{slug} — FAZ_5 5.3 /zh hizmet sayfaları. İçerik/schema/metadata: app/(zh)/zh/_lib/services.tsx.
import { ZhServicePage, zhServiceMetadata, zhServiceSlugs } from "../../_lib/services";

export const dynamicParams = false;

export function generateStaticParams() {
  return zhServiceSlugs().map((slug) => ({ slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  return zhServiceMetadata(slug);
}

export default async function Page({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  return <ZhServicePage slug={slug} />;
}
