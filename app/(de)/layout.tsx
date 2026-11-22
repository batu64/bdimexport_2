// DE DACH kökü — D6: sakin-güven paleti (data-locale=de), Navbar/Footer (Impressum/Datenschutz footer'da zorunlu konum)
// (agents/de-agent.md §3: hukuki sayfalar insan onaylı — bu placeholder hukuki metin İÇERMEZ)
import "@/app/globals.css";
import ThemeStyle, { htmlAttrs } from "@/lib/ui/ThemeStyle";
import ClarityScript from "@/lib/ui/ClarityScript";
import GoogleAnalyticsScript from "@/lib/ui/GoogleAnalyticsScript";
import type { Metadata } from "next";
import { IntlProvider } from "@/lib/intl";
import PageTransition from "@/lib/ui/motion/PageTransition";
import Navbar from "@/lib/ui/Navbar";
import Footer from "@/lib/ui/Footer";
import WhatsAppFloat from "@/lib/ui/WhatsAppFloat";
import dict from "@/lib/messages/de.json";
import { footerProps, navbarProps } from "./de/_lib/chrome";

export const metadata: Metadata = {
  metadataBase: new URL("https://bdimexport.com"),
  title: "B2B Beschaffung & Export aus der Türkei | Bdimexport", // eskiden kök şablonuyla gelen marka açık yazıldı
  description: "Beschaffung, Werksprüfung, Logistik und Zoll. Kostenloses Angebot innerhalb von 24h.",
};

export default function DeLayout({ children }: { children: React.ReactNode }) {
  return (
    <html {...htmlAttrs("de")}>
      <head>
        <ThemeStyle />
        <GoogleAnalyticsScript />
        <ClarityScript />
      </head>
      <body>
        <a href="#inhalt" className="skip-link">{dict.nav.skip}</a>
        <IntlProvider locale="de">
          <Navbar {...navbarProps()} />
          <div lang="de" id="inhalt" tabIndex={-1}><PageTransition>{children}</PageTransition></div>
          <Footer {...footerProps()} />
          <WhatsAppFloat
            locale="de"
            label={dict.footer.whatsapp}
            ariaLabel={dict.footer.whatsapp}
            message={dict.quote.whatsappText}
          />
        </IntlProvider>
      </body>
    </html>
  );
}
