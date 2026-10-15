// /en/services indeksi — FAZ_2 Step 2.1 (breadcrumb/ana sayfa/endüstri sayfaları hedefi)
import GlobalShell from "../_lib/GlobalShell";
import { ServicesIndexPage, indexMetadata } from "../_lib/services";

export const metadata = indexMetadata();

export default function Page() {
  return (
    <GlobalShell>
      <ServicesIndexPage />
    </GlobalShell>
  );
}
