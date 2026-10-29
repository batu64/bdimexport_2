// /de/impressum — KABUK (D6). Onaylı + imzalı metin FAZ_5 5.1'de (🔒⚖️). O zamana dek noindex, içerik uydurulmaz.
import type { Metadata } from "next";
import dict from "@/lib/messages/de.json";
import LegalShell from "../_lib/LegalShell";

export const metadata: Metadata = {
  title: { absolute: `${dict.legal.impressum.title} | Bdimexport` },
  robots: { index: false, follow: true },
};

export default function ImpressumPage() {
  return <LegalShell title={dict.legal.impressum.title} lead={dict.legal.impressum.lead} />;
}
