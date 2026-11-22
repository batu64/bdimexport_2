// /en/ro/services/sourcing — content/en/ro/services/sourcing.md
import fs from "fs";
import path from "path";
import type { Metadata } from "next";
import { renderVariantMd } from "@/lib/ui/md";
import VariantPageBody from "@/lib/ui/VariantPageBody";
import { variantAlternates } from "@/app/(en)/en/_lib/hreflang";

const RTL = false;

const parsed = renderVariantMd(
  fs.readFileSync(
    path.join(process.cwd(), "content", "en", "ro", "services", "sourcing.md"),
    "utf-8",
  ),
  { rtl: RTL },
);

export const metadata: Metadata = {
  title: parsed.metaTitle ?? parsed.title,
  description: parsed.desc,
  alternates: variantAlternates("ro", "services/sourcing"),
};

export default function Page() {
  return <VariantPageBody variant="ro" kind="sourcing" title={parsed.title} html={parsed.html} desc={parsed.desc} />;
}
