// /en/industries — sektör indeksi (FAZ_2 Step 2.4 rework). İçerik/schema: ./_lib/industries.tsx
import GlobalShell from "../_lib/GlobalShell";
import { IndustriesIndexView, indexMetadata } from "./_lib/industries";

export const metadata = indexMetadata();

export default function Page() {
  return (
    <GlobalShell>
      <IndustriesIndexView />
    </GlobalShell>
  );
}
