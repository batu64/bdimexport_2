// /en/ar ana sayfa — FAZ_2 Step 2.5 varyant iskeleti (en-l10n-agent)
// İskelet-only: tam yerelleştirilmiş hacim FAZ_5+. İçerik: content/en/ar/home.md
// hreflang verisi manifest'te (Step 2.8); canonical kendi URL'si (2.5 kabul).
import fs from "fs";
import path from "path";
import type { Metadata } from "next";
import { renderVariantMd } from "@/lib/ui/md";
import VariantPageBody from "@/lib/ui/VariantPageBody";

const BASE = "https://bdimexport.com";
const RTL = true;

const parsed = renderVariantMd(
  fs.readFileSync(path.join(process.cwd(), "content", "en", "ar", "home.md"), "utf-8"),
  { rtl: RTL },
);

export const metadata: Metadata = {
  title: parsed.metaTitle ?? parsed.title,
  description: parsed.desc,
  alternates: { canonical: `${BASE}/en/ar` },
};

export default function Page() {
  return <VariantPageBody variant="ar" kind="home" title={parsed.title} html={parsed.html} />;
}
