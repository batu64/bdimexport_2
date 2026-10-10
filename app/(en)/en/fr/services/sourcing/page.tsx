// /en/fr/services/sourcing — FAZ_2 Step 2.5 örnek hizmet sayfası (en-l10n-agent)
// İskelet-only kanıt sayfası; içerik: content/en/fr/services/sourcing.md
// Terminoloji: I18N_RULES §3.1 sözlüğü (FR kolonu sözlükte yok — manifest glossary_proposal'a bak)
import fs from "fs";
import path from "path";
import type { Metadata } from "next";
import Link from "next/link";
import { renderVariantMd } from "../../md";

const BASE = "https://bdimexport.com";
const RTL = false;

const parsed = renderVariantMd(
  fs.readFileSync(
    path.join(process.cwd(), "content", "en", "fr", "services", "sourcing.md"),
    "utf-8",
  ),
  { rtl: RTL },
);

export const metadata: Metadata = {
  title: parsed.metaTitle ?? parsed.title,
  description: parsed.desc,
  alternates: { canonical: `${BASE}/en/fr/services/sourcing` },
};

export default function FrSourcingPage() {
  return (
    <main style={{ maxWidth: 760, margin: "0 auto", padding: "32px 16px" }}>
      <nav aria-label="breadcrumb" style={{ fontSize: 14, marginBottom: 16 }}>
        <Link href="/en/fr" style={{ color: "#0E7C7B" }}>Accueil</Link>
        <span aria-hidden="true"> → </span>
        <span>Approvisionnement (sourcing)</span>
      </nav>
      <h1 style={{ color: "#1A2B4A", lineHeight: 1.2 }}>{parsed.title}</h1>
      <div dangerouslySetInnerHTML={{ __html: parsed.html }} />
      <section
        id="contact"
        style={{ marginTop: 48, borderInlineStart: "4px solid #E8A13D", paddingInlineStart: 16 }}
      >
        <h2 style={{ color: "#1A2B4A" }}>Contactez-nous</h2>
        <p>Vos canaux : e-mail (principal) et WhatsApp. Les liens directs seront activés dès la mise en service de nos canaux ; cette page sera mise à jour. Envoyez votre demande avec votre produit et votre prix cible : nous vous répondons sous 24 heures. Prix en EUR ; numéros de téléphone acceptés au format +33.</p>
      </section>
    </main>
  );
}
