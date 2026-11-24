// /en/rfq — Dual-Hub (Türkiye + China) Smart RFQ, Standalone Container Loading & Commercial Intelligence Hub
import type { Metadata } from "next";
import { ShieldCheck } from "lucide-react";
import dict from "@/lib/messages/en.json";
import Hero from "@/lib/ui/Hero";
import { Section, SectionHeader } from "@/lib/ui/Section";
import LoopVideo from "@/lib/ui/motion/LoopVideo";
import Reveal from "@/lib/ui/motion/Reveal";
import SmartRfq, { type SmartRfqCopy } from "@/lib/ui/SmartRfq";
import { CORPORATE_ENTITIES, SAP_ARIBA_ID, SAP_ARIBA_PROFILE_URL, US_DUNS_NUMBER } from "@/lib/ui/entities";
import { enAlternates } from "../_lib/hreflang";
import { QUOTE_EMAIL } from "../_lib/chrome";
import s from "./rfq.module.css";

export const metadata: Metadata = {
  title: "Smart RFQ, Container Inspection & Dual-Hub Quote | Bdimexport",
  description:
    "Request Türkiye or China product sourcing, standalone container loading supervision, or a supplier commercial intelligence report within 24 hours.",
  alternates: enAlternates("rfq"),
};

export default function EnRfqPage() {
  const rfqCopy = dict.rfq as SmartRfqCopy;
  const dual = dict.dualHub;
  return (
    <main>
      <Hero
        media={<LoopVideo name="dual-hub-radar" desktopOnly />}
        eyebrow={rfqCopy.eyebrow}
        title="Start a Dual-Hub RFQ, Container Loading Audit or Trade Report"
        subtitle="Compare Türkiye vs. China landed cost side-by-side, or book an independent on-site inspector for a factory you already selected."
        primary={{ label: "Configure Request Below", href: "#smart-rfq" }}
        secondary={{ label: "Explore All Services", href: "/en/services" }}
        trust={[
          `${CORPORATE_ENTITIES[1].name} (D-U-N-S® #${US_DUNS_NUMBER} · SAP Ariba® ${SAP_ARIBA_ID}) + ${CORPORATE_ENTITIES[0].name} (TR)`,
          "24-hour written sourcing & audit quotation",
          "Fixed inspection fee — zero hidden commissions",
        ]}
      />

      <Section id="dual-hub-matrix" tone="alt">
        <Reveal>
          <SectionHeader id="dual-hub-matrix" eyebrow={dual.eyebrow} title={dual.title} lead={dual.lead} />
        </Reveal>
        <div className={s.matrixWrap}>
          <table className={s.table}>
            <thead>
              <tr>
                <th>Decision Factor</th>
                <th>Türkiye Manufacturing Hub</th>
                <th>China Manufacturing Hub</th>
              </tr>
            </thead>
            <tbody>
              {dual.rows.map((r) => (
                <tr key={r.metric}>
                  <td className={s.metricCell}>{r.metric}</td>
                  <td>{r.tr}</td>
                  <td>{r.cn}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Section>

      <Section id="smart-rfq">
        <SmartRfq copy={rfqCopy} locale="en" email={QUOTE_EMAIL} initialTrack="sourcing" sourcePage="/en/rfq" />
        <p className="chip" style={{ marginBlockStart: "var(--s-6)" }}>
          <ShieldCheck aria-hidden="true" className="chip-icon" />
          <span>
            Supported by {CORPORATE_ENTITIES[1].name} (Wyoming, USA · D-U-N-S® #{US_DUNS_NUMBER} ·{" "}
            <a href={SAP_ARIBA_PROFILE_URL} target="_blank" rel="noopener noreferrer" data-clarity-event="rfq_en_sap_ariba_verify">
              SAP Ariba® {SAP_ARIBA_ID}
            </a>
            ) &amp; {CORPORATE_ENTITIES[0].name} (Türkiye)
          </span>
        </p>
      </Section>
    </main>
  );
}
