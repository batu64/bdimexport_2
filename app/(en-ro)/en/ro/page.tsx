// /en/ro home page — content/en/ro/home.md
import fs from "fs";
import path from "path";
import type { Metadata } from "next";
import { renderVariantMd } from "@/lib/ui/md";
import VariantPageBody from "@/lib/ui/VariantPageBody";
import { homeAlternates } from "@/lib/hreflang";

const RTL = false;

const parsed = renderVariantMd(
  fs.readFileSync(path.join(process.cwd(), "content", "en", "ro", "home.md"), "utf-8"),
  { rtl: RTL },
);

export const metadata: Metadata = {
  title: parsed.metaTitle ?? parsed.title,
  description: parsed.desc,
  alternates: homeAlternates("en/ro"),
};

export default function Page() {
  return <VariantPageBody variant="ro" kind="home" title={parsed.title} html={parsed.html} desc={parsed.desc} />;
}
