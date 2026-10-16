// /en/nl KÖK layout — FAZ_2 2.5 rework: <html lang="nl"> (SEO_PLAYBOOK §3; I18N_RULES §4: RTL dir html üzerinde).
// Varyant kabuğu (VariantShell: CTA, switcher, footer, token CSS) alt layout'ta kalır; mantıksal CSS + bdi korunur.
// Başlık şablonu BİLEREK tanımlanmadı: eskiden de varyant sayfaları kök şablonunu almıyordu (md META başlıkları olduğu gibi çıkar).
import type { Metadata } from "next";

export const metadata: Metadata = { metadataBase: new URL("https://bdimexport.com") };

export default function Root({ children }: { children: React.ReactNode }) {
  return (
    <html lang="nl">
      <body>{children}</body>
    </html>
  );
}
