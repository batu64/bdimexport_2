// TR ihracat indeks sayfası — FAZ_1 Step 1.5 (sitemap/ana sayfa/breadcrumb hedefi)
import { IndexPage, indexMetadata } from "../_lib/content";

export const metadata = indexMetadata("ihracat");

export default function Page() {
  return <IndexPage kind="ihracat" section="ihracat" />;
}
