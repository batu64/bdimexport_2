// /en/ru/services/sourcing — FAZ_2 Step 2.5 örnek hizmet sayfası (en-l10n-agent)
// İskelet-only kanıt sayfası; içerik: content/en/ru/services/sourcing.md
// Terminoloji: I18N_RULES §3.1 sözlüğü (RU kolonu birebir: Подбор поставщиков vb.)
import fs from "fs";
import path from "path";
import type { Metadata } from "next";
import { renderVariantMd } from "@/lib/ui/md";
import VariantPageBody from "@/lib/ui/VariantPageBody";
import { variantAlternates } from "@/app/(en)/en/_lib/hreflang";

const RTL = false;

const parsed = renderVariantMd(
  fs.readFileSync(
    path.join(process.cwd(), "content", "en", "ru", "services", "sourcing.md"),
    "utf-8",
  ),
  { rtl: RTL },
);

export const metadata: Metadata = {
  title: parsed.metaTitle ?? parsed.title,
  description: parsed.desc,
  alternates: variantAlternates("ru", "services/sourcing"),
};

export default function Page() {
  return <VariantPageBody variant="ru" kind="sourcing" title={parsed.title} html={parsed.html} desc={parsed.desc} />;
}
