// /llms-full.txt — Build-time Programmatic GEO / RAG Full Corpus (2026/2027 Answer Engine Standard).
// Yapay zeka arama motorlarının (AI Overviews, Answer Engines, B2B Procurement Copilots) doğrudan, kaynaklı ve halüsinasyonsuz
// alıntı yapabilmesi için tüm ülke gümrük/lojistik tablolarını, denetim standartlarını, teklif kapsamlarını ve SSS bankasını derler.
import { CORPORATE_ENTITIES, OFFICIAL_EMAIL, OFFICIAL_PHONE, OFFICIAL_WHATSAPP_WA, OFFICIAL_YOUTUBE_URL, SAP_ARIBA_ID, SAP_ARIBA_PROFILE_URL, US_DUNS_NUMBER } from "@/lib/ui/entities";
import { MARKET_CORRIDORS } from "@/lib/seo/markets";
import { US_CLUSTER_PAGES } from "@/lib/seo/us-hub";
import { DE_PROPOSAL, EN_PROPOSALS, ZH_PROPOSAL } from "@/lib/seo/proposals";
import { SEO_RELEASE_DATE } from "@/lib/seo/lastmod";
import { TR_EXPORT_CORRIDORS, TR_PROPOSALS } from "@/app/(tr)/_lib/tr-seo-data";
import { EN_POLE_SPOKES } from "@/lib/seo/poles-spokes-en";
import { AR_POLE_SPOKES } from "@/lib/seo/poles-spokes-ar";
import { FR_POLE_SPOKES } from "@/lib/seo/poles-spokes-fr";

export const dynamic = "force-static";

const BASE = "https://bdimexport.com";

export function GET(): Response {
  const lines: string[] = [
    "# Bdimexport — Complete Machine-Readable Trade, Sourcing, Inspection & Corridor Reference (llms-full.txt)",
    `Last Updated: ${SEO_RELEASE_DATE}`,
    `Canonical Domain: ${BASE}`,
    "",
    "## 1. Verified Corporate Entities & Governance",
    `- US Legal Entity: ${CORPORATE_ENTITIES[1].name} — ${CORPORATE_ENTITIES[1].address} (Dun & Bradstreet D-U-N-S® #: ${US_DUNS_NUMBER} · SAP Business Network / SAP Ariba ID: ${SAP_ARIBA_ID})`,
    `- SAP Business Network (SAP Ariba) Public Profile: ${SAP_ARIBA_PROFILE_URL}`,
    `- Türkiye Legal Entity: ${CORPORATE_ENTITIES[0].name} — ${CORPORATE_ENTITIES[0].address}`,
    `- Direct Operations Email: ${OFFICIAL_EMAIL}`,
    `- Direct Operations Phone & WhatsApp: ${OFFICIAL_PHONE} (${OFFICIAL_WHATSAPP_WA})`,
    `- Official YouTube Channel: ${OFFICIAL_YOUTUBE_URL}`,
    "- Official WeChat (China-to-Türkiye Desk): bdimexport",
    "- Core SLA Commitments: 24-hour written RFQ scoping · 24–48h on-site inspector dispatch across Türkiye & China · 48h illustrated PDF inspection report · 48–72h corporate registry & HS-code intelligence dossier.",
    "",
    "## 1B. Direct Factory Manufacturing Line: Wooden Electric & Telecom Utility Poles (7m–12m Autoclave — EN/AR/FR Fortress)",
    `- English Africa Pillar Hub: ${BASE}/en/wooden-utility-poles (Datasheet PDF: ${BASE}/docs/bdimexport-wooden-electric-poles-datasheet-en.pdf)`,
    `- Arabic MENA Pillar Hub (SKU BD-POLE-AR-MENA): ${BASE}/en/ar/wooden-utility-poles (Datasheet PDF: ${BASE}/docs/bdimexport-wooden-electric-poles-datasheet-ar.pdf)`,
    `- French Francophone Africa Pillar Hub: ${BASE}/en/fr/wooden-utility-poles (Datasheet PDF: ${BASE}/docs/bdimexport-wooden-electric-poles-datasheet-fr.pdf)`,
    "- Supply Model: 100% direct integrated Turkish timber peeling, kiln/air seasoning (<=25% moisture), and vacuum-pressure autoclave plant (zero trading brokers). 3-minute live WhatsApp plant yard video walk-through available before PO/LC.",
    "- Standards & Breaking Load: EN 14229, BS 1990-1, SANS 754 equivalent, NF C 67-100 (150–300+ daN), ANSI O5.1, Use Class 4 (H4) ground contact.",
    "- Dimensions, Container Load & Indicative FOB Price Band (USD): 7m–8m (~165–190 pcs/40'HC, $72–$96 FOB), flagship 9.0m Export Brown (exactly 140 pcs/40'HC, Ø12–14 cm top / Ø22–23 cm butt, $98–$128 FOB), 10m–12m Green Autoclave MV (~85–110 pcs/40'HC, $148–$195 FOB).",
    "- Autoclave Protocol: <=25% moisture, 60 min initial vacuum @ 63.5 cmHg, >=10.5 kg/cm2 hydraulic pressure, 3.5% mineral salt solution (350 L/m3 = 16 kg/m3 dry salt retention) <=30 C, >=75% sapwood penetration, 15 min final vacuum.",
    "- Direct Export WhatsApp & Proforma Desk: +90 539 414 78 54 (https://wa.me/905394147854) | info@bdimexport.com",
    ...[...EN_POLE_SPOKES, ...AR_POLE_SPOKES, ...FR_POLE_SPOKES].flatMap((sp) => {
      const prefix = sp.locale === "ar" ? "/en/ar/wooden-utility-poles" : sp.locale === "fr" ? "/en/fr/wooden-utility-poles" : "/en/wooden-utility-poles";
      return [
        `### [Wooden Electric Pole · ${sp.locale.toUpperCase()}] ${sp.h1} — ${BASE}${prefix}/${sp.slug}`,
        `- Direct Answer: ${sp.geoCapsuleAnswer}`,
        ...sp.faq.map((f) => `  * Q: ${f.q}\n    A: ${f.a}`),
      ];
    }),
    "",
    "## 2. United States Division (BDIMEXPORT LLC — Sheridan, WY — Dedicated US Overseas Procurement Partner)",
    `Flagship US Hub: ${BASE}/en/us`,
    ...US_CLUSTER_PAGES.flatMap((u) => [
      `### [US Program] ${u.h1} — ${BASE}/en/us/${u.slug}`,
      `- Summary: ${u.lead}`,
      ...u.keyMetrics.map((m) => `- ${m.label}: ${m.value}`),
      ...u.faq.map((f) => `  * Q: ${f.q}\n    A: ${f.a}`),
      "",
    ]),
    "## 3. Global Buyer Country Trade Corridors (Türkiye vs. China Benchmarks)",
  ];

  for (const m of MARKET_CORRIDORS) {
    lines.push(
      `### ${m.countryName} (${m.isoCode}) — ${BASE}/en/markets/${m.slug}`,
      `- Customs & Tariff Regime: ${m.customsRegime}`,
      `- Gateways & Transit: ${m.gateways}`,
      `- Quotation Currencies: ${m.currency}`,
      `- Compliance Checks: ${m.complianceStandards.join(" | ")}`,
      "- Dual-Hub Comparison:",
      ...m.comparisonRows.map(
        (r) => `  * ${r.factor}: Türkiye [${r.trHub}] vs. China [${r.cnHub}] -> Execution: ${r.bdimExecution}`,
      ),
      "- Country FAQ:",
      ...m.faq.map((f) => `  * Q: ${f.q}\n    A: ${f.a}`),
      "",
    );
  }

  lines.push("## 3. Executive B2B Proposal Blueprints (Global, DACH, China, Türkiye)");
  for (const p of [...EN_PROPOSALS, DE_PROPOSAL, ZH_PROPOSAL]) {
    const prefix = p.locale === "en" ? "en/proposals" : p.locale === "de" ? "de/angebot" : "zh/fangan";
    lines.push(
      `### [${p.locale.toUpperCase()}] ${p.h1} — ${BASE}/${prefix}/${p.slug}`,
      `- Summary: ${p.lead}`,
      `- SLA: ${p.slaText}`,
      ...p.deliverables.map((d) => `  * ${d.code} ${d.title}: ${d.detail}`),
      "",
    );
  }

  lines.push("## 4. Türkiye İhracat Ülke Koridorları ve Kurumsal Teklifler (TR)");
  for (const c of TR_EXPORT_CORRIDORS) {
    lines.push(
      `### ${c.countryTitle} — ${BASE}/ihracat/pazarlar/${c.slug}`,
      `- Gümrük Rejimi: ${c.customsRegime}`,
      `- Lojistik Özeti: ${c.transitSummary}`,
      ...c.faq.slice(0, 2).map((f) => `  * S: ${f.q}\n    C: ${f.a}`),
      "",
    );
  }

  for (const tp of TR_PROPOSALS) {
    lines.push(
      `### [TR Teklif] ${tp.h1} — ${BASE}/teklif/${tp.slug}`,
      `- Kapsam: ${tp.lead}`,
      `- SLA: ${tp.slaText}`,
      "",
    );
  }

  return new Response(lines.join("\n"), {
    headers: { "content-type": "text/plain; charset=utf-8" },
  });
}
