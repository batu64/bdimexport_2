// /en/nl ana sayfa — FAZ_2 Step 2.5 varyant iskeleti (en-l10n-agent)
// İskelet-only: tam yerelleştirilmiş hacim FAZ_5+. İçerik: content/en/nl/home.md
// hreflang verisi manifest'te (Step 2.8); canonical kendi URL'si (2.5 kabul).
import fs from "fs";
import path from "path";
import type { Metadata } from "next";
import Link from "next/link";
import { renderVariantMd } from "./md";

const BASE = "https://bdimexport.com";
const RTL = false;

const parsed = renderVariantMd(
  fs.readFileSync(path.join(process.cwd(), "content", "en", "nl", "home.md"), "utf-8"),
  { rtl: RTL },
);

export const metadata: Metadata = {
  title: parsed.metaTitle ?? parsed.title,
  description: parsed.desc,
  alternates: { canonical: `${BASE}/en/nl` },
};

export default function NlHomePage() {
  return (
    <main style={{ maxWidth: 760, margin: "0 auto", padding: "32px 16px" }}>
      <h1 style={{ color: "#1A2B4A", lineHeight: 1.2 }}>{parsed.title}</h1>
      <div dangerouslySetInnerHTML={{ __html: parsed.html }} />
      <section
        id="contact"
        style={{ marginTop: 48, borderInlineStart: "4px solid #E8A13D", paddingInlineStart: 16 }}
      >
        <h2 style={{ color: "#1A2B4A" }}>Neem contact op</h2>
        <p>Wij werken per e-mail: direct en zonder omwegen. Stuur uw aanvraag met product en doelprijs en ontvang binnen 24 uur een gratis offerte. Prijzen in EUR; telefoonnummers in +31-formaat. De directe contactlink wordt geactiveerd zodra ons kanaal live is.</p>
      </section>
      <nav aria-label="Navigatie" style={{ marginTop: 32, fontSize: 14 }}>
        <Link href="/en/nl/services/sourcing" style={{ color: "#0E7C7B" }}>Inkoop (sourcing)</Link>
        {" · "}
        <Link href="/en" style={{ color: "#0E7C7B" }}>English</Link>
      </nav>
    </main>
  );
}
