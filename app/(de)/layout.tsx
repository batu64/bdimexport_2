// DE DACH placeholder — FAZ 5'te tam içerik; footer Impressum/Datenschutz zorunlu konum notu
// (agents/de-agent.md §3: hukuki sayfalar insan onaylı — bu placeholder hukuki metin İÇERMEZ)
import type { Metadata } from "next";
import { IntlProvider } from "@/lib/intl";

export const metadata: Metadata = {
  metadataBase: new URL("https://bdimexport.com"),
  title: "B2B Beschaffung & Export aus der Türkei | Bdimexport", // eskiden kök şablonuyla gelen marka açık yazıldı
  description: "Beschaffung, Werksprüfung, Logistik und Zoll. Kostenloses Angebot innerhalb von 24h.",
};

export default function DeLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="de">
      <body>
    <IntlProvider locale="de">
      <div lang="de">{children}</div>
    </IntlProvider>
      </body>
    </html>
  );
}
