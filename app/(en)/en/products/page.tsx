// /en/products — ürün ana listesi (FAZ_2 Step 2.2). İçerik/schema: ./_lib/views.tsx · mantık: ./_lib/catalog.ts
import { ProductsIndexView, indexMetadata } from "./_lib/views";

export const metadata = indexMetadata();

export default function Page() {
  return (
    <>
      <ProductsIndexView />
    </>
  );
}
