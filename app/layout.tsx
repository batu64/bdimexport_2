// Kök layout — x-default: tr (SEO_PLAYBOOK §1.1)
import type { Metadata } from "next";
import { buildAlternateSet, toMetadataAlternates } from "@/lib/hreflang";

export const metadata: Metadata = {
  metadataBase: new URL("https://bdimexport.com"),
  title: { default: "Bdimexport — İthalat & İhracat Danışmanlığı", template: "%s | Bdimexport" },
  description:
    "Çin'den ithalat danışmanlığı, ihracat desteği ve global tedarik hizmetleri. Ücretsiz teklif 24 saatte.",
  alternates: toMetadataAlternates(buildAlternateSet("", ["tr"])),
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="tr">
      <body>{children}</body>
    </html>
  );
}
