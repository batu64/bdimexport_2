// /en/es/services/sourcing — FAZ_2 Step 2.5 örnek hizmet sayfası (en-l10n-agent)
// İskelet-only kanıt sayfası; içerik: content/en/es/services/sourcing.md
// Terminoloji: I18N_RULES §3.1 sözlüğü (ES kolonu sözlükte yok — manifest glossary_proposal'a bak)
import fs from "fs";
import path from "path";
import type { Metadata } from "next";
import Link from "next/link";
import { renderVariantMd } from "../../md";

const BASE = "https://bdimexport.com";
const RTL = false;

const parsed = renderVariantMd(
  fs.readFileSync(
    path.join(process.cwd(), "content", "en", "es", "services", "sourcing.md"),
    "utf-8",
  ),
  { rtl: RTL },
);

export const metadata: Metadata = {
  title: parsed.metaTitle ?? parsed.title,
  description: parsed.desc,
  alternates: { canonical: `${BASE}/en/es/services/sourcing` },
};

export default function EsSourcingPage() {
  return (
    <main style={{ maxWidth: 760, margin: "0 auto", padding: "32px 16px" }}>
      <nav aria-label="breadcrumb" style={{ fontSize: 14, marginBottom: 16 }}>
        <Link href="/en/es" style={{ color: "#0E7C7B" }}>Inicio</Link>
        <span aria-hidden="true"> → </span>
        <span>Abastecimiento (sourcing)</span>
      </nav>
      <h1 style={{ color: "#1A2B4A", lineHeight: 1.2 }}>{parsed.title}</h1>
      <div dangerouslySetInnerHTML={{ __html: parsed.html }} />
      <section
        id="contact"
        style={{ marginTop: 48, borderInlineStart: "4px solid #E8A13D", paddingInlineStart: 16 }}
      >
        <h2 style={{ color: "#1A2B4A" }}>Contáctenos</h2>
        <p>Nuestro canal principal es WhatsApp. Los enlaces directos se activarán cuando el canal entre en operación; esta página se actualizará. Envíen su solicitud con el producto y el precio objetivo, y reciban un presupuesto gratuito en 24 horas. Precios en EUR (consulten también opciones para Latinoamérica). Teléfonos en formato +34.</p>
      </section>
    </main>
  );
}
