// TR ithalat indeks sayfası — FAZ_1 Step 1.5 (sitemap/ana sayfa/breadcrumb hedefi)
import { IndexPage, indexMetadata } from "../_lib/content";

export const metadata = indexMetadata("ithalat");

export default function Page() {
  return <IndexPage kind="ithalat" section="ithalat" />;
}
