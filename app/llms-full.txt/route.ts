// /llms-full.txt — Build-time Programmatic GEO / RAG Full Corpus (2026/2027 Answer Engine Standard).
// Yapay zeka arama motorlarının (AI Overviews, Answer Engines, B2B Procurement Copilots) doğrudan, kaynaklı ve halüsinasyonsuz
// alıntı yapabilmesi için tüm ülke gümrük/lojistik tablolarını, denetim standartlarını, teklif kapsamlarını ve SSS bankasını derler.
import { CORPORATE_ENTITIES, OFFICIAL_EMAIL, OFFICIAL_PHONE, OFFICIAL_WHATSAPP_WA } from "@/lib/ui/entities";
import { MARKET_CORRIDORS } from "@/lib/seo/markets";
import { US_CLUSTER_PAGES } from "@/lib/seo/us-hub";
import { DE_PROPOSAL, EN_PROPOSALS, ZH_PROPOSAL } from "@/lib/seo/proposals";
import { SEO_RELEASE_DATE } from "@/lib/seo/lastmod";
import { TR_EXPORT_CORRIDORS, TR_PROPOSALS } from "@/app/(tr)/_lib/tr-seo-data";

export const dynamic = "force-static";

const BASE = "https://bdimexport.com";

export function GET(): Response {
  const lines: string[] = [
    "# Bdimexport — Complete Machine-Readable Trade, Sourcing, Inspection & Corridor Reference (llms-full.txt)",
    `Last Updated: ${SEO_RELEASE_DATE}`,
    `Canonical Domain: ${BASE}`,
    "",
    "## 1. Verified Corporate Entities & Governance",
    `- US Legal Entity: ${CORPORATE_ENTITIES[1].name} — ${CORPORATE_ENTITIES[1].address}`,
    `- Türkiye Legal Entity: ${CORPORATE_ENTITIES[0].name} — ${CORPORATE_ENTITIES[0].address}`,
    `- Direct Operations Email: ${OFFICIAL_EMAIL}`,
    `- Direct Operations Phone & WhatsApp: ${OFFICIAL_PHONE} (${OFFICIAL_WHATSAPP_WA})`,
    "- Official WeChat (China-to-Türkiye Desk): bdimexport",
    "- Core SLA Commitments: 24-hour written RFQ scoping · 24–48h on-site inspector dispatch across Türkiye & China · 48h illustrated PDF inspection report · 48–72h corporate registry & HS-code intelligence dossier.",
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
