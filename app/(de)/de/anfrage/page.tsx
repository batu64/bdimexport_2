// /de/anfrage — Angebotsanfrage (FAZ_5 5.6). Form yalnız DE_FORM_ENABLED iken (5.1 Datenschutz + hukuk onaylı rıza + E5 mail → 👤);
// kapalıyken dürüst e-posta yolu. Veri kategorileri listesi _lib/datenschutz.ts'ten (5.1 ile birebir). Yayın kapısı açılana dek noindex.
import type { Metadata } from "next";
import { ListChecks } from "lucide-react";
import dict from "@/lib/messages/de.json";
import PageHeader from "@/lib/ui/PageHeader";
import SmartRfq, { type SmartRfqCopy } from "@/lib/ui/SmartRfq";
import { QUOTE_EMAIL } from "../_lib/chrome";
import { DE_DATA_CATEGORIES, DE_FORM_ENABLED } from "../_lib/datenschutz";
import QuoteForm from "./QuoteForm";
import s from "../de.module.css";

const t = dict.anfrage;

const DE_RFQ_COPY: SmartRfqCopy = {
  eyebrow: "DACH-Anfrage-Konfigurator · 24h Rückmeldung",
  title: "Projektanfrage strukturieren & per E-Mail oder WhatsApp senden",
  lead: "Wählen Sie Beschaffung, Werksprüfung/Containerkontrolle oder Handelsanalyse. Ihr strukturiertes Briefing senden Sie mit einem Klick über Ihr Mail-Programm, Gmail Web, Outlook Web oder WhatsApp.",
  step1Label: "1. Gewünschter Leistungsbereich",
  tracks: [
    { id: "sourcing", title: "Beschaffung & Hersteller (TR / China)", desc: "Geprüfte Fabriken, offene Werksangebote, Muster & FOB/CIF/DDP-Lieferung." },
    { id: "inspection", title: "Werksprüfung & Container-Verladung (QC)", desc: "Unabhängige AQL-Prüfung & Containerverplombung binnen 24–48 Stunden." },
    { id: "intelligence", title: "Lieferantenprüfung & Zoll-/Kostenanalyse", desc: "Registerprüfung, Zolltarifnummer-Simulation & transparente Landed-Cost-Matrix." },
    { id: "marketing", title: "Langfristige Einkaufspartnerschaft", desc: "Laufende Dual-Hub-Steuerung Türkei + China für DACH-Industriekunden." },
  ],
  step2Label: "2. Beschaffungsregion",
  origins: [
    { id: "dual", label: "Türkei + China Vergleich" },
    { id: "tr", label: "Türkei (Nearshoring / A.TR)" },
    { id: "cn", label: "China (Direktwerk / QC)" },
  ],
  volumesLabel: "3. Projektumfang / Volumen",
  volumes: ["Einzelprüfung / Bericht", "Muster / LCL-Stückgut", "1× 20' Container", "1× 40' HQ Container", "Regelmäßige Abrufe"],
  fields: {
    productLabel: "Produktgruppe / Bedarf",
    productPlaceholder: "z. B. CNC-Drehteile, Textil/Frottier, Holz-Strommasten, Möbel",
    hsLabel: "Zolltarifnummer / HS-Code (optional)",
    hsPlaceholder: "z. B. 7326.90 oder noch offen",
    companyLabel: "Unternehmen",
    companyPlaceholder: "z. B. Musterbau GmbH",
    targetMarketLabel: "Lieferziel / Hafen",
    targetMarketPlaceholder: "z. B. Hamburg, Duisburg, Wien, Zürich",
    emailLabel: "Geschäftliche E-Mail",
    emailPlaceholder: "name@unternehmen.de",
    notesLabel: "Technische Anforderungen & Termine",
    notesPlaceholder: "Zertifikate (CE, ISO, EN), Zielpreis, gewünschter Liefertermin",
  },
  summaryTitle: "Strukturierte Projektzusammenfassung",
  slaBadge: "24h ANGEBOT",
  copyBtn: "Briefing kopieren",
  copiedBtn: "Kopiert ✓",
  whatsappBtn: "Per WhatsApp senden",
  emailBtn: "Per E-Mail / Gmail senden",
  submitBtn: "Anfrage speichern",
  submittedMsg: "Anfrage erfasst. Unser DACH-Team antwortet innerhalb von 24 Stunden.",
  emailSubject: "Bdimexport DACH-Projektanfrage",
};

export const metadata: Metadata = {
  title: { absolute: `${t.title} | Bdimexport` },
  description: t.metaDesc,
  robots: { index: false, follow: true },
  alternates: { canonical: "https://bdimexport.com/de/anfrage" },
};

export default function AnfragePage() {
  const pg = dict.page;
  return (
    <main>
      <PageHeader crumbs={[{ label: pg.home, href: "/de" }, { label: t.title }]} crumbsLabel={pg.crumbs} eyebrow={dict.nav.cta} title={t.title} lead={t.lead} />
      <div className={`container section ${s.anfrage}`}>
        <div>
          {DE_FORM_ENABLED ? (
            <QuoteForm />
          ) : (
            <SmartRfq
              copy={DE_RFQ_COPY}
              locale="de"
              email={QUOTE_EMAIL}
              initialTrack="sourcing"
              initialTargetMarket="Deutschland / DACH"
              sourcePage="/de/anfrage"
            />
          )}
        </div>
        <aside aria-labelledby="kategorien" className={s.categories}>
          <h2 id="kategorien" className={s.categoriesTitle}><ListChecks aria-hidden="true" className={s.pendingIcon} />{t.categoriesTitle}</h2>
          <p>{t.categoriesLead}</p>
          <ul>
            {DE_DATA_CATEGORIES.map((c) => <li key={c.key}>{t.categories[c.key]}</li>)}
          </ul>
          <a href="/de/datenschutz">{t.consentMore}</a>
        </aside>
      </div>
    </main>
  );
}
