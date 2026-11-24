// TR route group KÖK layout — FAZ_2 2.5 rework: <html lang> artık grup başına (eski tek app/layout.tsx kaldırıldı).
// Eski kök metadata (metadataBase, title şablonu, description, x-default: tr) BURADA; (tr) altındaki alt segmentler şablonu eskisi gibi alır.
import "@/app/globals.css";
import ThemeStyle, { htmlAttrs } from "@/lib/ui/ThemeStyle";
import ClarityScript from "@/lib/ui/ClarityScript";
import GoogleAnalyticsScript from "@/lib/ui/GoogleAnalyticsScript";
import type { Metadata } from "next";
import { buildAlternateSet, toMetadataAlternates } from "@/lib/hreflang";
import { IntlProvider } from "@/lib/intl";
import PageTransition from "@/lib/ui/motion/PageTransition";
import Navbar from "@/lib/ui/Navbar";
import Footer from "@/lib/ui/Footer";
import WhatsAppFloat from "@/lib/ui/WhatsAppFloat";
import SmartLocaleBanner from "@/lib/ui/SmartLocaleBanner";
import dict from "@/lib/messages/tr.json";
import { footerProps, navbarProps } from "./_lib/chrome";

export const metadata: Metadata = {
  metadataBase: new URL("https://bdimexport.com"),
  title: { default: "Bdimexport — İthalat & İhracat Danışmanlığı", template: "%s | Bdimexport" },
  description:
    "Çin'den ithalat danışmanlığı, ihracat desteği ve global tedarik hizmetleri. Ücretsiz teklif 24 saatte.",
  alternates: toMetadataAlternates(buildAlternateSet("", ["tr"])),
};

export default function TrLayout({ children }: { children: React.ReactNode }) {
  return (
    <html {...htmlAttrs("tr")}>
      <head>
        <ThemeStyle />
        <GoogleAnalyticsScript />
        <ClarityScript />
      </head>
      <body>
        <a href="#icerik" className="skip-link">{dict.nav.skip}</a>
        <IntlProvider locale="tr">
          <Navbar {...navbarProps()} />
          <div lang="tr" id="icerik" tabIndex={-1}><PageTransition>{children}</PageTransition></div>
          <Footer {...footerProps()} />
          <WhatsAppFloat
            locale="tr"
            label={dict.footer.whatsapp}
            ariaLabel={dict.footer.whatsapp}
            message={dict.footer.whatsappMessage}
          />
          <SmartLocaleBanner currentLocale="tr" />
        </IntlProvider>
      </body>
    </html>
  );
}
