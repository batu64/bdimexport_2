// EN global hub placeholder — FAZ 2'de tam içerik (Proje.md segment EN)
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "B2B Sourcing, Inspection & Manufacturing in Turkey",
  description:
    "Sourcing, factory inspection, private label manufacturing, logistics and customs. Get free quotation in 24h.",
};

export default function EnLayout({ children }: { children: React.ReactNode }) {
  return <div lang="en">{children}</div>;
}
