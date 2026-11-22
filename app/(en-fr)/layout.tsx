// /en/fr KÖK layout — FAZ_2 2.5 rework: <html lang="fr"> (SEO_PLAYBOOK §3; I18N_RULES §4: RTL dir html üzerinde).
// Varyant kabuğu (VariantShell: CTA, switcher, footer, token CSS) alt layout'ta kalır; mantıksal CSS + bdi korunur.
// Başlık şablonu BİLEREK tanımlanmadı: eskiden de varyant sayfaları kök şablonunu almıyordu (md META başlıkları olduğu gibi çıkar).
import "@/app/globals.css";
import ThemeStyle, { htmlAttrs } from "@/lib/ui/ThemeStyle";
import ClarityScript from "@/lib/ui/ClarityScript";
import type { Metadata } from "next";

export const metadata: Metadata = { metadataBase: new URL("https://bdimexport.com") };

export default function Root({ children }: { children: React.ReactNode }) {
  return (
    <html {...htmlAttrs("en", "fr")}>
      <head>
        <ThemeStyle />
        <ClarityScript />
      </head>
      <body>{children}</body>
    </html>
  );
}
