// EN global hub placeholder — FAZ 2'de tam içerik (Proje.md segment EN)
import type { Metadata } from "next";
import { IntlProvider } from "@/lib/intl";

export const metadata: Metadata = {
  metadataBase: new URL("https://bdimexport.com"),
  title: "B2B Sourcing, Inspection & Manufacturing in Turkey | Bdimexport", // eskiden kök şablonuyla gelen marka açık yazıldı
  description:
    "Sourcing, factory inspection, private label manufacturing, logistics and customs. Get free quotation in 24h.",
};

export default function EnLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
    <IntlProvider locale="en">
      <div lang="en">{children}</div>
    </IntlProvider>
      </body>
    </html>
  );
}
