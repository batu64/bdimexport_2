// /en/services/{sourcing,manufacturing,inspection,logistics,customs} — FAZ_2 Step 2.1. İçerik/JSON-LD/metadata: ../../_lib/services.tsx
import { SERVICES, ServicePage, serviceMetadata } from "../../_lib/services";

export const dynamicParams = false;

export function generateStaticParams() {
  return SERVICES.map((s) => ({ slug: s.slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  return serviceMetadata(slug);
}

export default async function Page({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  return (
    <>
      <ServicePage slug={slug} />
    </>
  );
}
