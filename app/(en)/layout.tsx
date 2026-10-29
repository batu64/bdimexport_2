// EN global hub placeholder — FAZ 2'de tam içerik (Proje.md segment EN)
import "@/app/globals.css";
import ThemeStyle, { htmlAttrs } from "@/lib/ui/ThemeStyle";
import type { Metadata } from "next";
import { IntlProvider } from "@/lib/intl";
import PageTransition from "@/lib/ui/motion/PageTransition";
import Navbar from "@/lib/ui/Navbar";
import Footer from "@/lib/ui/Footer";
import dict from "@/lib/messages/en.json";
import { footerProps, navbarProps } from "./en/_lib/chrome";

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
        <a href="#content" className="skip-link">{dict.nav.skip}</a>
        <IntlProvider locale="en">
          <Navbar {...navbarProps()} />
          <div lang="en" id="content" tabIndex={-1}><PageTransition>{children}</PageTransition></div>
          <Footer {...footerProps()} />
        </IntlProvider>
      </body>
    </html>
  );
}
