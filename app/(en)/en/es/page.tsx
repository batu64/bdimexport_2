// /en/es ana sayfa — FAZ_2 Step 2.5 varyant iskeleti (en-l10n-agent)
// İskelet-only: tam yerelleştirilmiş hacim FAZ_5+. İçerik: content/en/es/home.md
// hreflang verisi manifest'te (Step 2.8); canonical kendi URL'si (2.5 kabul).
import fs from "fs";
import path from "path";
import type { Metadata } from "next";
import Link from "next/link";
import { renderVariantMd } from "./md";

const BASE = "https://bdimexport.com";
const RTL = false;

const parsed = renderVariantMd(
  fs.readFileSync(path.join(process.cwd(), "content", "en", "es", "home.md"), "utf-8"),
  { rtl: RTL },
);

export const metadata: Metadata = {
  title: parsed.metaTitle ?? parsed.title,
  description: parsed.desc,
  alternates: { canonical: `${BASE}/en/es` },
};

export default function EsHomePage() {
  return (
    <main style={{ maxWidth: 760, margin: "0 auto", padding: "32px 16px" }}>
      <h1 style={{ color: "#1A2B4A", lineHeight: 1.2 }}>{parsed.title}</h1>
      <div dangerouslySetInnerHTML={{ __html: parsed.html }} />
      <section
        id="contact"
        style={{ marginTop: 48, borderInlineStart: "4px solid #E8A13D", paddingInlineStart: 16 }}
      >
        <h2 style={{ color: "#1A2B4A" }}>Contáctenos</h2>
        <p>Nuestro canal principal es WhatsApp. Los enlaces directos se activarán cuando el canal entre en operación; esta página se actualizará. Envíen su solicitud con el producto y el precio objetivo, y reciban un presupuesto gratuito en 24 horas. Precios en EUR (consulten también opciones para Latinoamérica). Teléfonos en formato +34.</p>
      </section>
      <nav aria-label="Navegación" style={{ marginTop: 32, fontSize: 14 }}>
        <Link href="/en/es/services/sourcing" style={{ color: "#0E7C7B" }}>Abastecimiento (sourcing)</Link>
        {" · "}
        <Link href="/en" style={{ color: "#0E7C7B" }}>English</Link>
      </nav>
    </main>
  );
}
