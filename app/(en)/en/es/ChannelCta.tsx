// Bölge kanal CTA — I18N_RULES §2 matrisi / agents/en-l10n-agent.md §3
// KANAL: WhatsApp birincil; neutral İspanyolca — ustedes (vosotros YASAK, I18N_RULES §7)
// Gerçek kanal linkleri (t.me/wa.me handle'ı, e-posta adresi) FAZ_8'de açılır ve
// leads.channel_pref (Ayarlar/D1) üzerinden bağlanır — iskelet sayfa içi #contact
// çapasını kullanır; uydurma handle/link YASAK (agent §5).
import type { CSSProperties } from "react";

const bar: CSSProperties = {
  display: "flex",
  flexWrap: "wrap",
  gap: 12,
  alignItems: "center",
  justifyContent: "flex-end", // flex uçları yazı yönünü takip eder → RTL'de otomatik aynalanır
  padding: "10px 16px",
  background: "#1A2B4A",
  color: "#FAF8F5",
  fontSize: 14,
};

const primaryBtn: CSSProperties = {
  background: "#E8A13D",
  color: "#1A2B4A",
  fontWeight: 600,
  borderRadius: 8,
  padding: "10px 20px",
  textDecoration: "none",
  minHeight: 44,
};

const secondaryBtn: CSSProperties = {
  border: "1.5px solid #FAF8F5",
  borderRadius: 8,
  padding: "10px 20px",
  textDecoration: "none",
  color: "#FAF8F5",
  minHeight: 44,
};

export default function ChannelCta() {
  return (
    <div style={bar}>
      <span style={{ marginInlineEnd: "auto" }}>Presupuesto gratuito en 24 horas · Precios en EUR</span>
      <a href="#contact" style={primaryBtn} data-channel="whatsapp">WhatsApp</a>

    </div>
  );
}
