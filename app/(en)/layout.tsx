// EN global hub placeholder — FAZ 2'de tam içerik (Proje.md segment EN)
import "@/app/globals.css";
import ThemeStyle, { htmlAttrs } from "@/lib/ui/ThemeStyle";
import type { Metadata } from "next";
import { IntlProvider } from "@/lib/intl";

export const metadata: Metadata = {
  metadataBase: new URL("https://bdimexport.com"),
  title: "B2B Sourcing and Manufacturing in Turkey | Bdimexport", // marka açık yazılı (kök şablon yok); ≤60 ve "&" yok → ham HTML = gerçek uzunluk
  description:
    "Sourcing, factory inspection, private label manufacturing, logistics and customs from Turkey for global B2B buyers. Get a free quotation in 24h.",
};

export default function EnLayout({ children }: { children: React.ReactNode }) {
  return (
    <html {...htmlAttrs("en")}>
      <head>
        <ThemeStyle />
      </head>
      <body>
    <IntlProvider locale="en">
      <div lang="en">{children}</div>
    </IntlProvider>
      </body>
    </html>
  );
}
