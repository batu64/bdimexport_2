// DE DACH placeholder — FAZ 5'te tam içerik; footer Impressum/Datenschutz zorunlu konum notu
// (agents/de-agent.md §3: hukuki sayfalar insan onaylı — bu placeholder hukuki metin İÇERMEZ)
import type { Metadata } from "next";
import { IntlProvider } from "@/lib/intl";

export const metadata: Metadata = {
  title: "B2B Beschaffung & Export aus der Türkei",
  description: "Beschaffung, Werksprüfung, Logistik und Zoll. Kostenloses Angebot innerhalb von 24h.",
};

export default function DeLayout({ children }: { children: React.ReactNode }) {
  return (
    <IntlProvider locale="de">
      <div lang="de">{children}</div>
    </IntlProvider>
  );
}
