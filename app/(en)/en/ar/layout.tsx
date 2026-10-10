// /en/ar varyant layout — FAZ_2 Step 2.5 iskelet (en-l10n-agent)
// Bölge kanalı: WhatsApp Business birincil; AED/SAR bağlamı
// dir="rtl" — RTL ZORUNLU (I18N_RULES §4): mantıksal CSS + flex uçları otomatik aynalanır; sayılar md.tsx içinde <bdi dir=ltr>
// hreflang VERİSİ bu dosyaya yazılmaz → manifest (Step 2.8 orchestrator enjeksiyonu)
import type { CSSProperties } from "react";
import Link from "next/link";
import ChannelCta from "./ChannelCta";

const shell: CSSProperties = {
  background: "#FAF8F5",
  color: "#1F2937",
  minHeight: "100vh",
  fontFamily: '"Noto Sans Arabic", "Inter", system-ui, sans-serif',
};

const footerStyle: CSSProperties = {
  background: "#1A2B4A",
  color: "#FAF8F5",
  padding: "32px 16px",
  fontSize: 14,
  textAlign: "start", // mantıksal hizalama — RTL'de otomatik aynalanır
};

export default function ArVariantLayout({ children }: { children: React.ReactNode }) {
  return (
    <div lang="ar" dir="rtl" style={shell}>
      <ChannelCta />
      {children}
      <footer style={footerStyle}>
        <div style={{ maxWidth: 760, margin: "0 auto" }}>
          <strong>Bdimexport</strong> — التوريد والتصدير بين الشركات من تركيا
          <div style={{ marginTop: 8 }}>
            <Link href="/en/ar" style={{ color: "#E8A13D" }}>الرئيسية</Link>
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
