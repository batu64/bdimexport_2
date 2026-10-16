// /en/es/services/sourcing — FAZ_2 Step 2.5 örnek hizmet sayfası (en-l10n-agent)
// İskelet-only kanıt sayfası; içerik: content/en/es/services/sourcing.md
// Terminoloji: I18N_RULES §3.1 sözlüğü (ES kolonu sözlükte yok — manifest glossary_proposal'a bak)
import fs from "fs";
import path from "path";
import type { Metadata } from "next";
import { renderVariantMd } from "@/lib/ui/md";
import VariantPageBody from "@/lib/ui/VariantPageBody";

const BASE = "https://bdimexport.com";
const RTL = false;

const parsed = renderVariantMd(
  fs.readFileSync(
    path.join(process.cwd(), "content", "en", "es", "services", "sourcing.md"),
    "utf-8",
  ),
  { rtl: RTL },
);

export const metadata: Metadata = {
  title: parsed.metaTitle ?? parsed.title,
  description: parsed.desc,
  alternates: { canonical: `${BASE}/en/es/services/sourcing` },
};

export default function Page() {
  return <VariantPageBody variant="es" kind="sourcing" title={parsed.title} html={parsed.html} />;
}
