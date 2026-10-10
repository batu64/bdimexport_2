// /en/nl/services/sourcing — FAZ_2 Step 2.5 örnek hizmet sayfası (en-l10n-agent)
// İskelet-only kanıt sayfası; içerik: content/en/nl/services/sourcing.md
// Terminoloji: I18N_RULES §3.1 sözlüğü (NL kolonu sözlükte yok — manifest glossary_proposal'a bak)
import fs from "fs";
import path from "path";
import type { Metadata } from "next";
import Link from "next/link";
import { renderVariantMd } from "../../md";

const BASE = "https://bdimexport.com";
const RTL = false;

const parsed = renderVariantMd(
  fs.readFileSync(
    path.join(process.cwd(), "content", "en", "nl", "services", "sourcing.md"),
    "utf-8",
  ),
  { rtl: RTL },
);

export const metadata: Metadata = {
  title: parsed.metaTitle ?? parsed.title,
  description: parsed.desc,
  alternates: { canonical: `${BASE}/en/nl/services/sourcing` },
};

export default function NlSourcingPage() {
  return (
    <main style={{ maxWidth: 760, margin: "0 auto", padding: "32px 16px" }}>
      <nav aria-label="breadcrumb" style={{ fontSize: 14, marginBottom: 16 }}>
        <Link href="/en/nl" style={{ color: "#0E7C7B" }}>Start</Link>
        <span aria-hidden="true"> → </span>
        <span>Inkoop (sourcing)</span>
      </nav>
      <h1 style={{ color: "#1A2B4A", lineHeight: 1.2 }}>{parsed.title}</h1>
      <div dangerouslySetInnerHTML={{ __html: parsed.html }} />
      <section
        id="contact"
        style={{ marginTop: 48, borderInlineStart: "4px solid #E8A13D", paddingInlineStart: 16 }}
      >
        <h2 style={{ color: "#1A2B4A" }}>Neem contact op</h2>
        <p>Wij werken per e-mail: direct en zonder omwegen. Stuur uw aanvraag met product en doelprijs en ontvang binnen 24 uur een gratis offerte. Prijzen in EUR; telefoonnummers in +31-formaat. De directe contactlink wordt geactiveerd zodra ons kanaal live is.</p>
      </section>
    </main>
  );
}
