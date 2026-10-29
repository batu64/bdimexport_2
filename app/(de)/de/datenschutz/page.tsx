// /de/datenschutz — KABUK (D6). Onaylı + imzalı DSGVO metni FAZ_5 5.1'de (🔒⚖️). O zamana dek noindex, içerik uydurulmaz.
import type { Metadata } from "next";
import dict from "@/lib/messages/de.json";
import LegalShell from "../_lib/LegalShell";

export const metadata: Metadata = {
  title: { absolute: `${dict.legal.datenschutz.title} | Bdimexport` },
  robots: { index: false, follow: true },
};

export default function DatenschutzPage() {
  return <LegalShell title={dict.legal.datenschutz.title} lead={dict.legal.datenschutz.lead} />;
}
