// partner-grid — FAZ_1 Step 1.7 (design/components/partner-grid.md brief'ine göre)
// Veri: GET /api/v1/partners?approved=true (FAZ_3'te gerçek endpoint; şimdilik build-time boş liste)
// KVKK kuralı: consent_logo_en=false → logoUrl API'de hiç dönmez; bileşen logoUrl null ise avatar gösterir

import Link from "next/link";

export interface PartnerItem {
  id: string;
  name: string;
  sector?: string;
  logoUrl?: string | null; // consent_logo_en=true ise dolu
  verified?: boolean;
}

const LABELS: Record<string, { title: string; empty: string; verified: string }> = {
  tr: { title: "Onaylı Türk İş Ortakları", empty: "İlk onaylı partnerler yakında — başvurular değerlendiriliyor.", verified: "Onaylı" },
  en: { title: "Verified Turkish Partners", empty: "First approved partners coming soon — applications under review.", verified: "Verified" },
  de: { title: "Verifizierte türkische Partner", empty: "Erste verifizierte Partner in Kürze — Bewerbungen in Prüfung.", verified: "Verifiziert" },
  zh: { title: "认证的土耳其合作伙伴", empty: "首批认证合作伙伴即将上线 — 申请审核中。", verified: "已认证" },
};

export default function PartnerGrid({
  locale = "tr",
  partners = [],
  limit = 12,
}: {
  locale?: string;
  partners?: PartnerItem[];
  limit?: number;
}) {
  const t = LABELS[locale] ?? LABELS.tr;
  const shown = partners.filter(p => p.verified !== false).slice(0, limit);

  return (
    <section aria-labelledby="partner-grid-title" style={{ padding: "2rem 1rem" }}>
      <h2 id="partner-grid-title">{t.title}</h2>
      {shown.length === 0 ? (
        <p style={{ color: "#6B7280" }}>{t.empty}</p>
      ) : (
        <ul style={{ listStyle: "none", display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(220px, 1fr))", gap: "1rem", padding: 0 }}>
          {shown.map(p => (
            <li key={p.id} style={{ border: "1px solid #E5E7EB", borderRadius: 12, padding: "1rem", background: "#fff" }}>
              {p.logoUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={p.logoUrl} alt={p.name} width={64} height={64} style={{ objectFit: "contain" }} />
              ) : (
                <div aria-hidden="true" style={{ width: 64, height: 64, borderRadius: 8, background: "#1A2B4A", color: "#fff", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 24, fontWeight: 600 }}>
                  {p.name.charAt(0).toUpperCase()}
                </div>
              )}
              <div style={{ fontWeight: 600, marginTop: ".5rem" }}>{p.name}</div>
              {p.sector && <div style={{ color: "#6B7280", fontSize: 13 }}>{p.sector}</div>}
              {p.verified && (
                <span aria-label={t.verified} style={{ color: "#2E7D32", fontSize: 12 }}>✔ {t.verified}</span>
              )}
            </li>
          ))}
        </ul>
      )}
      <p style={{ marginTop: "1rem" }}>
        <Link href="/ihracat/ucretsiz-destek-basvuru">Başvur</Link>
      </p>
    </section>
  );
}
