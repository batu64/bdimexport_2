// /en/sq/services/inspection — content/en/sq/services/inspection.md
import fs from "fs";
import path from "path";
import type { Metadata } from "next";
import { renderVariantMd } from "@/lib/ui/md";
import VariantPageBody from "@/lib/ui/VariantPageBody";
import { variantAlternates } from "@/app/(en)/en/_lib/hreflang";

const RTL = false;

const parsed = renderVariantMd(
  fs.readFileSync(
    path.join(process.cwd(), "content", "en", "sq", "services", "inspection.md"),
    "utf-8",
  ),
  { rtl: RTL },
);

export const metadata: Metadata = {
  title: parsed.metaTitle ?? parsed.title,
  description: parsed.desc,
  alternates: variantAlternates("sq", "services/inspection"),
};

export default function Page() {
  return <VariantPageBody variant="sq" kind="inspection" title={parsed.title} html={parsed.html} desc={parsed.desc} />;
}
