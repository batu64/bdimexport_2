// /en/es varyant layout — FAZ_2 Step 2.5 iskelet (en-l10n-agent)
// Bölge kanalı: WhatsApp birincil; neutral İspanyolca — ustedes (vosotros YASAK, I18N_RULES §7)
// dir="ltr" — LTR; EUR + LATAM notu, telefon +34
// hreflang VERİSİ bu dosyaya yazılmaz → manifest (Step 2.8 orchestrator enjeksiyonu)
import type { CSSProperties } from "react";
import Link from "next/link";
import ChannelCta from "./ChannelCta";

const shell: CSSProperties = {
  background: "#FAF8F5",
  color: "#1F2937",
  minHeight: "100vh",
  fontFamily: '"Inter", system-ui, sans-serif',
};

const footerStyle: CSSProperties = {
  background: "#1A2B4A",
  color: "#FAF8F5",
  padding: "32px 16px",
  fontSize: 14,
  textAlign: "start", // mantıksal hizalama — RTL'de otomatik aynalanır
};

export default function EsVariantLayout({ children }: { children: React.ReactNode }) {
  return (
    <div lang="es" dir="ltr" style={shell}>
      <ChannelCta />
      {children}
      <footer style={footerStyle}>
        <div style={{ maxWidth: 760, margin: "0 auto" }}>
          <strong>Bdimexport</strong> — Abastecimiento B2B y exportación desde Turquía
          <div style={{ marginTop: 8 }}>
            <Link href="/en/es" style={{ color: "#E8A13D" }}>Inicio</Link>
            {" · "}
            <Link href="/en" style={{ color: "#E8A13D" }}>English</Link>
          </div>
          <div style={{ marginTop: 8, color: "rgba(250,248,245,0.7)" }}>
            © Bdimexport
          </div>
        </div>
      </footer>
    </div>
  );
}
