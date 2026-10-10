// /en/fr varyant layout — FAZ_2 Step 2.5 iskelet (en-l10n-agent)
// Bölge kanalı: Email birincil + WhatsApp ikincil; formal vous (I18N_RULES §7: tu yasağı)
// dir="ltr" — LTR; EUR, telefon formatı +33
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

export default function FrVariantLayout({ children }: { children: React.ReactNode }) {
  return (
    <div lang="fr" dir="ltr" style={shell}>
      <ChannelCta />
      {children}
      <footer style={footerStyle}>
        <div style={{ maxWidth: 760, margin: "0 auto" }}>
          <strong>Bdimexport</strong> — Approvisionnement et export B2B depuis la Turquie
          <div style={{ marginTop: 8 }}>
            <Link href="/en/fr" style={{ color: "#E8A13D" }}>Accueil</Link>
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
