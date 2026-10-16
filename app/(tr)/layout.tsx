// TR route group KÖK layout — FAZ_2 2.5 rework: <html lang> artık grup başına (eski tek app/layout.tsx kaldırıldı).
// Eski kök metadata (metadataBase, title şablonu, description, x-default: tr) BURADA; (tr) altındaki alt segmentler şablonu eskisi gibi alır.
import type { Metadata } from "next";
import { buildAlternateSet, toMetadataAlternates } from "@/lib/hreflang";
import { IntlProvider } from "@/lib/intl";

export const metadata: Metadata = {
  metadataBase: new URL("https://bdimexport.com"),
  title: { default: "Bdimexport — İthalat & İhracat Danışmanlığı", template: "%s | Bdimexport" },
  description:
    "Çin'den ithalat danışmanlığı, ihracat desteği ve global tedarik hizmetleri. Ücretsiz teklif 24 saatte.",
  alternates: toMetadataAlternates(buildAlternateSet("", ["tr"])),
};

export default function TrLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="tr">
      <body>
        <IntlProvider locale="tr">
          <div lang="tr">{children}</div>
        </IntlProvider>
      </body>
    </html>
  );
}
