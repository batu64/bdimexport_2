// /en/fi/services/sourcing — content/en/fi/services/sourcing.md
import fs from "fs";
import path from "path";
import type { Metadata } from "next";
import { renderVariantMd } from "@/lib/ui/md";
import VariantPageBody from "@/lib/ui/VariantPageBody";
import { variantAlternates } from "@/app/(en)/en/_lib/hreflang";

const RTL = false;

const parsed = renderVariantMd(
  fs.readFileSync(
    path.join(process.cwd(), "content", "en", "fi", "services", "sourcing.md"),
    "utf-8",
  ),
  { rtl: RTL },
);

export const metadata: Metadata = {
  title: parsed.metaTitle ?? parsed.title,
  description: parsed.desc,
  alternates: variantAlternates("fi", "services/sourcing"),
};

export default function Page() {
  return <VariantPageBody variant="fi" kind="sourcing" title={parsed.title} html={parsed.html} desc={parsed.desc} />;
}
