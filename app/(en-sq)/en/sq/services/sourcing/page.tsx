// /en/sq/services/sourcing — content/en/sq/services/sourcing.md
import fs from "fs";
import path from "path";
import type { Metadata } from "next";
import { renderVariantMd } from "@/lib/ui/md";
import VariantPageBody from "@/lib/ui/VariantPageBody";
import { variantAlternates } from "@/app/(en)/en/_lib/hreflang";

const RTL = false;

const parsed = renderVariantMd(
  fs.readFileSync(
    path.join(process.cwd(), "content", "en", "sq", "services", "sourcing.md"),
    "utf-8",
  ),
  { rtl: RTL },
);

export const metadata: Metadata = {
  title: parsed.metaTitle ?? parsed.title,
  description: parsed.desc,
  alternates: variantAlternates("sq", "services/sourcing"),
};

export default function Page() {
  return <VariantPageBody variant="sq" kind="sourcing" title={parsed.title} html={parsed.html} desc={parsed.desc} />;
}
