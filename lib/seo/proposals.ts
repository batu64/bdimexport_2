// Hedefli B2B İş Teklifi (Outbound Email Proposal) Mimari Verisi — EN, DE, ZH.
// Şirketlere gönderilen teklif e-postalarında doğrudan hedefli iniş sayfası (landing page) sağlar.
// Statik SEO/GEO otoritesini korur (self-canonical); istemci tarafında URL parametreleriyle (?co=...&country=...&sector=...&hs=...&vol=...)
// sıfır-yeniden-derleme ile şirket adına kişiselleştirilir.

import type { RfqTrackId } from "@/lib/ui/SmartRfq";

export interface ProposalBlueprint {
  slug: string;
  locale: "en" | "de" | "zh";
  track: RfqTrackId;
  badge: string;
  metaTitle: string;
  metaDesc: string;
  h1: string;
  lead: string;
  slaText: string;
  deliverablesTitle: string;
  deliverables: { code: string; title: string; detail: string }[];
  commercialTermsTitle: string;
  commercialTerms: { label: string; value: string }[];
  whyTitle: string;
  whyPoints: string[];
  faqTitle: string;
  faq: { q: string; a: string }[];
  emailTemplate: {
    subject: string;
    body: string;
  };
}

export const EN_PROPOSALS: readonly ProposalBlueprint[] = [
  {
    slug: "us-procurement-partner",
    locale: "en",
    track: "sourcing",
    badge: "US CORPORATE PARTNERSHIP · BDIMEXPORT LLC (WYOMING, USA)",
    metaTitle: "US Overseas Procurement Partner Proposal | Bdimexport",
    metaDesc: "Partner with US-registered BDIMEXPORT LLC to manage your end-to-end Türkiye and China purchasing, OEM manufacturing, AQL inspection, and import logistics.",
    h1: "Your Dedicated US-Based Overseas Procurement, Manufacturing & Import Partner (Türkiye & China)",
    lead: "Through US-registered BDIMEXPORT LLC (Sheridan, Wyoming) and our full-time engineering teams on the ground in Türkiye and China, we act as your external overseas purchasing department—managing factory vetting, Section 301 vs. MFN tariff optimization, OEM production, 24–48h container QC, and port-to-door import execution.",
    slaText: "W-9 · D-U-N-S® #14-977-6743 · SAP Ariba® BNO-100000188010374 · 24h RFQ Brief",
    deliverablesTitle: "Full-Lifecycle Overseas Procurement Management",
    deliverables: [
      { code: "USA-01", title: "Direct Tier-1 Factory Sourcing & Tariff Optimization (TR + CN)", detail: "Eliminate 15%–25% trading-company markups and model 10-digit US HTS duties (China Section 301 vs. Türkiye MFN) side by side before awarding POs." },
      { code: "USA-02", title: "OEM Manufacturing, Inline DUPRO & 24–48h Container Sealing", detail: "Dedicated engineers oversee golden samples, mid-production quality gates, ANSI/ISO 2859-1 AQL inspection, and 7-point CTPAT container bolt-seal proof." },
      { code: "USA-03", title: "US-Compliant Export Docs, ISF 10+2 & Port Delivery", detail: "Accurate commercial invoices, packing lists, Country-of-Origin & FNSKU/UPC audits, ISPM-15 verification, and FOB/CIF/DDP delivery to NY/NJ, Savannah, Houston, or LA." },
    ],
    commercialTermsTitle: "US Corporate Partnership & Governance Terms",
    commercialTerms: [
      { label: "Contracting US Legal Entity", value: "BDIMEXPORT LLC — 30 N Gould St Ste N, Sheridan, WY 82801 (D-U-N-S® #: 14-977-6743 · SAP Ariba® ID: BNO-100000188010374 · W-9 Ready)" },
      { label: "On-Ground Operations Arm", value: "BD Sanayi (Türkiye, 81 Provinces) + Coastal/Inland China QC Network" },
      { label: "Open-Book Fee Policy", value: "Transparent management or flat inspection fee — zero hidden factory kickbacks" },
      { label: "Engagement Flexibility", value: "Start with a single 48h container audit, 72h supplier check, or full annual retainer" },
    ],
    whyTitle: "Why American Importers Appoint BDIMEXPORT LLC as Their Overseas Partner",
    whyPoints: [
      "One US corporate counterparty accountable across BOTH China and Türkiye—never get trapped in a single-country tariff spike.",
      "Protect every 70% balance wire transfer with timestamped factory-floor AQL measurements and container seal photos.",
      "Cut East Coast and Gulf replenishment lead times to 16–22 days via Türkiye while retaining China scale for complex tooling.",
    ],
    faqTitle: "Frequently Asked Questions for US Partners",
    faq: [
      {
        q: "Can BDIMEXPORT LLC onboard as a standard US vendor with a W-9?",
        a: "Yes. BDIMEXPORT LLC is a registered Wyoming Limited Liability Company (30 N Gould St Ste N, Sheridan, WY 82801 · Dun & Bradstreet D-U-N-S® #: 14-977-6743 · SAP Business Network / SAP Ariba ID: BNO-100000188010374), enabling immediate US ERP / SAP Ariba vendor onboarding, NDA execution, and USD invoicing.",
      },
      {
        q: "We already import from China or Türkiye—how can you add value immediately?",
        a: "Most US partners test us on one of two zero-disruption entry points: (1) a 24–48h standalone container loading & AQL inspection on an upcoming shipment, or (2) a side-by-side Dual-Hub landed-cost benchmark against their current supplier pricing.",
      },
      {
        q: "Do you handle all stages from factory search to US port arrival?",
        a: "Yes. We manage supplier due diligence, RFQ negotiation, sample consolidation, OEM production tracking, pre-shipment quality control, export customs, ISF 10+2 coordination, and ocean/air freight handover.",
      },
    ],
    emailTemplate: {
      subject: "US-Based Türkiye & China Procurement Partnership for {{company}} ({{sector}})",
      body: "Hi {{company}} Supply Chain & Leadership Team,\n\nThrough our US entity, BDIMEXPORT LLC (Sheridan, WY), and our full-time engineering teams on the ground in Türkiye and China, we would like to serve as your dedicated overseas purchasing, manufacturing, and quality inspection partner for {{sector}}.\n\nWe prepared a tailored US Partnership overview for {{company}} here:\n\n{{url}}\n\nHow we support US importers ({{country}}):\n• End-to-end sourcing & OEM production across BOTH Türkiye (16–22d East Coast transit, zero Section 301 surcharge) and China\n• Open-book factory pricing (zero middleman markups) + 24–48h on-site AQL & CTPAT container seal inspection\n• Domestic US LLC contracting (W-9 ready) backed by our Turkish operations company\n\nWhether you want to benchmark landed costs on an active SKU or book a standalone 48h inspection on your next container, you can review the scope directly on the page.\n\nBest regards,\nBDIMEXPORT LLC — US & Dual-Hub Operations Desk\n30 N Gould St Ste N, Sheridan, WY 82801\nD-U-N-S® #: 14-977-6743 | SAP Ariba® ID: BNO-100000188010374",
    },
  },
  {
    slug: "dual-hub-sourcing",
    locale: "en",
    track: "sourcing",
    badge: "EXECUTIVE B2B PROPOSAL · DUAL-HUB SOURCING",
    metaTitle: "Dual-Hub Sourcing Proposal (TR & CN) | Bdimexport",
    metaDesc: "Structured B2B sourcing proposal comparing verified Turkish and Chinese factories side by side with 24h RFQ scoping, landed-cost modeling, and AQL QC.",
    h1: "Dual-Hub Manufacturing & Landed-Cost Optimization Proposal (Türkiye + China)",
    lead: "Prepared for international importers, retail chains, and industrial buyers seeking direct tier-1 factory pricing, tariff optimization, and verified on-site quality control across Türkiye and China.",
    slaText: "24h Written Scope · 3–5 Business Days Verified Factory Shortlist",
    deliverablesTitle: "Included Executive Deliverables",
    deliverables: [
      { code: "DLV-01", title: "Direct Factory Verification (Zero Unverified Brokers)", detail: "Chamber of commerce, tax registry, production machinery, and export license verification across 3–5 shortlisted manufacturers." },
      { code: "DLV-02", title: "Türkiye vs. China Landed-Cost Matrix", detail: "Itemized EXW/FOB unit cost, road/ocean freight, customs tariff (A.TR / UK-FTA / US MFN vs. Section 301), and lead-time comparison." },
      { code: "DLV-03", title: "Consolidated Sample Dispatch & Pre-Shipment QC", detail: "Single-box multi-factory sample evaluation followed by ISO 2859-1 AQL inspection and container seal verification." },
    ],
    commercialTermsTitle: "Transparent Engagement Structure",
    commercialTerms: [
      { label: "Initial Feasibility & Tariff Brief", value: "Complimentary within 24 hours of specification receipt" },
      { label: "Contracting Entities", value: "BDIMEXPORT LLC (WY · D-U-N-S® #14-977-6743 · SAP Ariba® BNO-100000188010374) & BD Sanayi (Türkiye)" },
      { label: "Fee Structure", value: "Disclosed separately upfront — zero hidden factory markups" },
      { label: "Quality Gate", value: "Balance payment released only after passed AQL / loading report" },
    ],
    whyTitle: "Why Procurement Directors Select Dual-Hub Execution",
    whyPoints: [
      "Eliminate single-country supply chain disruption by qualifying backup capacity across both Türkiye and China.",
      "Cut European, UK, and MENA replenishment cycles to 3–10 days while keeping China scale for high-tooling SKUs.",
      "Single operational desk accountable from factory shortlist through sealed container dispatch.",
    ],
    faqTitle: "Frequently Asked Questions",
    faq: [
      {
        q: "What information is required to activate this Dual-Hub sourcing proposal?",
        a: "Share your target product specs, technical drawings or reference links, estimated order volume, and destination port via the Smart RFQ module below. Our desk returns a written scope and preliminary cost corridor within 24 hours.",
      },
      {
        q: "Do we pay manufacturers directly or contract through Bdimexport?",
        a: "Both models are supported. You may pay the verified manufacturer directly while retaining Bdimexport on a transparent management/QC fee, or contract turnkey through US-registered BDIMEXPORT LLC or BD Sanayi.",
      },
      {
        q: "How do you guarantee shortlisted companies are real factories?",
        a: "Every shortlisted supplier undergoes tax-plate, industrial capacity report (Kapasite Raporu / business scope), export history, and physical workshop verification before presentation.",
      },
    ],
    emailTemplate: {
      subject: "Dual-Hub Sourcing & Landed-Cost Proposal for {{company}} ({{sector}})",
      body: "Dear {{company}} Procurement Team,\n\nWe prepared a tailored Dual-Hub (Türkiye + China) sourcing and landed-cost benchmark proposal for your {{sector}} lines bound for {{country}}:\n\n{{url}}\n\nKey highlights:\n• Side-by-side factory quotes + tariff/freight comparison (Türkiye vs. China)\n• 100% verified manufacturers (zero middlemen) + on-site AQL & container sealing\n• US (BDIMEXPORT LLC) & Türkiye (BD Sanayi) corporate accountability\n\nYou can review the full scope and adjust your target HS code / volume directly on the page.\n\nBest regards,\nBdimexport Global Desk",
    },
  },
  {
    slug: "container-loading-audit",
    locale: "en",
    track: "inspection",
    badge: "EXECUTIVE B2B PROPOSAL · 24–48H FIELD INSPECTION",
    metaTitle: "Container Loading & Factory QC Proposal | Bdimexport",
    metaDesc: "Independent 24-48h factory inspection, ISO 2859-1 AQL quality testing, and container loading supervision across Türkiye and China—even for your own suppliers.",
    h1: "Standalone Factory Audit & Container Loading Supervision Proposal",
    lead: "Already selected your manufacturer in Türkiye or China? Protect your 70% balance wire transfer by deploying an independent Bdimexport engineer to the factory gate within 24–48 hours.",
    slaText: "24–48h Inspector Dispatch · Live Loading Photos · 48h Full PDF Report",
    deliverablesTitle: "7-Point On-Site Inspection Scope",
    deliverables: [
      { code: "QC-01", title: "ISO 2859-1 (AQL 2.5 / 4.0) Product Quality Audit", detail: "Random sampling across packed cartons checking dimensions, workmanship, function, GSM/weight, barcodes, and drop-test resilience." },
      { code: "QC-02", title: "Empty Container Structural & Moisture Verification", detail: "7-point light-leakage, floor moisture (<18%), odor, pest, and refrigeration/desiccant readiness check before loading starts." },
      { code: "QC-03", title: "100% Carton Tally, Lashing & Bolt-Seal Proof", detail: "Continuous supervision of carton count, container stuffing pattern, pallet strapping, container number, and high-security seal locking." },
    ],
    commercialTermsTitle: "Conflict-Free Inspection Terms",
    commercialTerms: [
      { label: "Supplier Independence", value: "Available for any factory you sourced independently in Türkiye or China" },
      { label: "Pricing Model", value: "Flat per-man-day fee quoted in 24h — zero % commission on cargo value" },
      { label: "Coverage", value: "All industrial provinces in Türkiye + coastal/inland hubs in China" },
      { label: "Reporting", value: "Real-time WhatsApp bay photos + comprehensive stamped PDF audit report" },
    ],
    whyTitle: "Why Importers Never Release Final Balance Blindly",
    whyPoints: [
      "Prevent short-shipped cartons, wet-wood mold damage, crushed bottom tiers, and unapproved last-minute substitutions.",
      "Inspectors report exclusively to you—strictly zero gifts or payments accepted from factories.",
      "Rapid scheduling within 24–48 hours when vessel cut-off dates are tight.",
    ],
    faqTitle: "Frequently Asked Questions",
    faq: [
      {
        q: "Can we book this inspection for a supplier we found on our own?",
        a: "Yes. Over half of our inspection bookings come from importers who already have an established Turkish or Chinese supplier and simply need independent eyes at the factory before paying the final balance.",
      },
      {
        q: "What happens if defects exceed the agreed AQL threshold?",
        a: "Our inspector immediately alerts your team with photographic evidence from the factory floor so you can instruct rework, replacement, or hold container sealing before goods leave the facility.",
      },
      {
        q: "Which cities do you cover in Türkiye and China?",
        a: "We cover Istanbul, Bursa, Kocaeli, Izmir, Denizli, Gaziantep, Kayseri, Konya, Mersin, and Ankara in Türkiye, plus Guangdong, Zhejiang, Jiangsu, Shanghai, Shandong, Fujian, and Hebei in China.",
      },
    ],
    emailTemplate: {
      subject: "24-48h Container Loading & AQL Inspection Proposal for {{company}}",
      body: "Dear {{company}} Operations & Quality Team,\n\nFor your upcoming shipments from Türkiye or China to {{country}}, we prepared a dedicated Container Loading Supervision & Pre-Shipment QC proposal:\n\n{{url}}\n\nScope included:\n• 24–48h independent engineer dispatch to your supplier's facility\n• ISO 2859-1 AQL quality check + 100% carton tally + container bolt-seal verification\n• Live loading-bay photos + 48h formal PDF report prior to balance payment\n\nBest regards,\nBdimexport Field Inspection Desk",
    },
  },
  {
    slug: "private-label-manufacturing",
    locale: "en",
    track: "sourcing",
    badge: "EXECUTIVE B2B PROPOSAL · OEM & PRIVATE LABEL",
    metaTitle: "OEM & Private Label Proposal in Turkey | Bdimexport",
    metaDesc: "Turnkey OEM and private-label contract manufacturing proposal in Türkiye with flexible MOQs, NDA protection, custom packaging, and A.TR/FTA zero-duty export.",
    h1: "Verified OEM & Private Label Contract Manufacturing Proposal",
    lead: "Designed for D2C brands, retail chains, and hospitality operators launching custom-formulated or custom-tooled product lines in Türkiye with fast European and US replenishment.",
    slaText: "NDA-Protected Tech-Pack Review in 24h · Prototype Plan in 5 Business Days",
    deliverablesTitle: "End-to-End OEM Execution Phases",
    deliverables: [
      { code: "OEM-01", title: "NDA Tech-Pack & Bill-of-Materials Scoping", detail: "Confidential matching with audited Turkish OEM mills holding ISO, BRCGS, GMP, OEKO-TEX, or CE certifications." },
      { code: "OEM-02", title: "Golden Sample & Custom Packaging Approval", detail: "Counter-sample iteration, lab compliance coordination, and multilingual retail/shelf-ready packaging verification." },
      { code: "OEM-03", title: "Inline DUPRO & Sealed Export Dispatch", detail: "Mid-production quality check at 30% completion plus final AQL inspection and preferential customs clearance." },
    ],
    commercialTermsTitle: "OEM Governance & Brand Protection",
    commercialTerms: [
      { label: "IP & Mold Confidentiality", value: "Bilateral NDA + non-circumvention & mold ownership clauses" },
      { label: "MOQ Structure", value: "Pilot-batch friendly Turkish OEM runs with rapid re-order cycles" },
      { label: "Tariff Advantage", value: "0% industrial duty to EU (A.TR) & UK (UK-TR FTA); MFN to USA" },
      { label: "Corporate Counterparty", value: "BDIMEXPORT LLC (USA · D-U-N-S® #14-977-6743 · SAP Ariba® BNO-100000188010374) & BD Sanayi (Türkiye)" },
    ],
    whyTitle: "Why Brands Shift Private Label Lines to Türkiye",
    whyPoints: [
      "Launch seasonal SKUs with 3–5x lower working-capital lockup compared to 90-day Far East ocean cycles.",
      "Mature European-compliant ecosystems across apparel, home textiles, furniture, cosmetics, food, and metal/plastics.",
      "Golden-sample lock ensures mass production matches your approved prototype.",
    ],
    faqTitle: "Frequently Asked Questions",
    faq: [
      {
        q: "How is our product design and private-label brand protected?",
        a: "Before sharing technical drawings, recipes, or dielines with any factory, we execute strict non-disclosure and tooling/brand protection agreements and restrict factory selection to export-vetted manufacturers.",
      },
      {
        q: "Can Bdimexport coordinate custom retail packaging inside Türkiye?",
        a: "Yes. Türkiye has a world-class printing, glass, rigid box, and flexible packaging industry, allowing products to ship retail-ready with EAN barcodes, Triman/LUCID symbols, and custom inserts.",
      },
      {
        q: "What if one component is cheaper to source from China?",
        a: "Our Dual-Hub desk can import specialized sub-components or hardware from China while completing primary manufacturing, assembly, and value-added OEM finishing in Türkiye.",
      },
    ],
    emailTemplate: {
      subject: "Private Label & OEM Manufacturing Proposal for {{company}} ({{sector}})",
      body: "Dear {{company}} Product & Sourcing Team,\n\nWe put together a Private Label & OEM Contract Manufacturing blueprint tailored to {{company}} for {{sector}} lines serving {{country}}:\n\n{{url}}\n\nHighlights:\n• Audited Turkish OEM manufacturers with flexible pilot MOQs\n• NDA brand protection + Golden Sample & inline DUPRO quality gates\n• Fast replenishment + preferential tariff routing\n\nBest regards,\nBdimexport OEM Desk",
    },
  },
  {
    slug: "trade-intelligence-due-diligence",
    locale: "en",
    track: "intelligence",
    badge: "EXECUTIVE B2B PROPOSAL · 72H TRADE INTELLIGENCE",
    metaTitle: "Supplier Due Diligence & HS Report Proposal | Bdimexport",
    metaDesc: "72-hour corporate supplier verification, anti-fraud registry audit, and 6/10-digit HS landed-cost intelligence report across Türkiye and China.",
    h1: "Supplier Due Diligence & HS-Code Commercial Intelligence Proposal",
    lead: "Eliminate wire-transfer fraud, shell trading companies, and unexpected customs duties before signing a proforma invoice—delivered as an evidence-backed executive PDF dossier within 48–72 hours.",
    slaText: "48–72h Executive Intelligence Dossier · Registry + Tariff + Price Benchmark",
    deliverablesTitle: "3-Layer Commercial Intelligence Dossier",
    deliverables: [
      { code: "INT-01", title: "Corporate Registry, Tax & Litigation Verification", detail: "Official chamber extract, paid-in capital, registered manufacturing address, export license, and proforma bank-account beneficiary cross-check." },
      { code: "INT-02", title: "HS-Code Customs, Anti-Dumping & Non-Tariff Barrier Map", detail: "Destination duty rates, A.TR/FTA/CEPA eligibility, anti-dumping alerts, CE/FDA/SABER requirements, and true landed-cost formula." },
      { code: "INT-03", title: "Export Price Corridor & Alternative Supplier Benchmark", detail: "UN Comtrade / customs statistical unit-value corridors plus 2–3 verified backup manufacturers for negotiation leverage." },
    ],
    commercialTermsTitle: "Intelligence Engagement Terms",
    commercialTerms: [
      { label: "Delivery Turnaround", value: "48 to 72 hours from supplier name / HS code submission" },
      { label: "Standalone Availability", value: "Orderable for a single supplier check with zero ongoing commitment" },
      { label: "Optional On-Site Upgrade", value: "Creditable toward a physical 24–48h factory visit if required" },
      { label: "Confidentiality", value: "Discreet registry verification — target supplier is not alerted unless physical visit is requested" },
    ],
    whyTitle: "When Executive Teams Commission This Report",
    whyPoints: [
      "Before wiring a first-time 30% deposit ($15,000–$500,000+) to an unfamiliar Turkish or Chinese company.",
      "When benchmarking whether current supplier FOB pricing sits above real market export corridors.",
      "Before entering a new product category with complex anti-dumping or regulatory rules.",
    ],
    faqTitle: "Frequently Asked Questions",
    faq: [
      {
        q: "Will the supplier know we ordered a corporate registry due-diligence check?",
        a: "Desktop registry, tax-scope, export license, and bank-beneficiary checks are performed discreetly through official records without contacting the supplier. If you add an on-site factory audit, we schedule it transparently with your authorization.",
      },
      {
        q: "What documents should we share to start a supplier verification?",
        a: "Simply provide the supplier's company name, tax/registration number or proforma invoice details, and product HS code via Smart RFQ below.",
      },
      {
        q: "Can this report cover both Turkish and Chinese suppliers?",
        a: "Yes. Our Türkiye and China desks verify Turkish Ticaret Sicili / Kapasite Raporu records as well as Chinese USCC (Unified Social Credit Code) business licenses, litigation filings, and export rights.",
      },
    ],
    emailTemplate: {
      subject: "72h Supplier Verification & Landed-Cost Intelligence Proposal for {{company}}",
      body: "Dear {{company}} Leadership Team,\n\nBefore finalizing new supplier contracts or deposits for {{sector}}, please review our 72-hour Supplier Due Diligence & HS-Code Intelligence proposal:\n\n{{url}}\n\nWhat your team receives in 48–72h:\n• Official corporate registry, real-factory status & bank-beneficiary anti-fraud check\n• Exact HS tariff, FTA/A.TR eligibility & landed-cost model for {{country}}\n• Market price corridor benchmark for stronger negotiation leverage\n\nBest regards,\nBdimexport Commercial Intelligence Desk",
    },
  },
] as const;

// DE DACH Proposal — Formal Sie, UWG-konform (keine Superlative), exakte I18N_RULES §3 Glossarbegriffe!
export const DE_PROPOSAL: ProposalBlueprint = {
  slug: "lieferantenpruefung-beschaffung",
  locale: "de",
  track: "sourcing",
  badge: "GESCHÄFTSVORSCHLAG · DACH-EINKAUF & WERKSPRÜFUNG",
  metaTitle: "Beschaffung & Werkspruefung Vorschlag | Bdimexport",
  metaDesc: "Strukturierter B2B-Vorschlag fuer DACH-Einkaeufer: Beschaffung / Sourcing, Werkspruefung in 24-48 h, Zollabwicklung (A.TR / EUR.1) und Pruefbericht.",
  h1: "Strukturierter Projektvorschlag: Beschaffung / Sourcing & Werksprüfung (Türkei & China)",
  lead: "Erstellt für Einkaufsleitungen und Geschäftsführungen in Deutschland, Österreich und der Schweiz: Direkte Herstelleridentifikation, dokumentierte Werksprüfung vor Ort und transparente Zollabwicklung über A.TR bzw. EFTA-EUR.1.",
  slaText: "Kostenloses Angebot in 24 h anfordern · Prüfbericht innerhalb von 48 h nach Begehung",
  deliverablesTitle: "Verbindlicher Leistungsumfang",
  deliverables: [
    { code: "MOD-01", title: "Beschaffung / Sourcing & Handelsregister-Abgleich", detail: "Identifikation produzierender Betriebe (Verifizierter türkischer Partner oder geprüfter chinesischer Hersteller) inklusive Kapazitäts- und Registerabgleich ohne Zwischenhändler." },
    { code: "MOD-02", title: "Unabhängige Werksprüfung & Containerverladung", detail: "Vor-Ort-Inspektion innerhalb von 24–48 h (ISO 2859-1 AQL, Maßprotokoll, Kartonzählung und Plomben-Dokumentation) inklusive schriftlichem Prüfbericht." },
    { code: "MOD-03", title: "Logistik, Zollabwicklung & LkSG-/LUCID-Datenmappe", detail: "Prüfung von A.TR (EU-Freiverkehr, ausgenommen Agrarwaren und EGKS-Eisen/Stahl) bzw. EFTA-EUR.1 (Schweiz) sowie strukturierte Verpackungsdaten für das Verpackungsregister LUCID." },
  ],
  commercialTermsTitle: "Kaufmännische Rahmenbedingungen",
  commercialTerms: [
    { label: "Ersteinschätzung & Angebot", value: "Schriftliche Rückmeldung innerhalb von 24 Stunden in EUR (oder CHF)" },
    { label: "Vertragspartner", value: "BD Sanayi İthalat İhracat Şirketi (Türkei) & BDIMEXPORT LLC (USA · D-U-N-S® 14-977-6743 · SAP Ariba® ID: BNO-100000188010374)" },
    { label: "Vergütungsmodell", value: "Offengelegtes Honorar getrennt von Werkspreisen und Frachtkosten" },
    { label: "Qualitätsfreigabe", value: "Schlusszahlung erst nach dokumentiertem Prüfbericht" },
  ],
  whyTitle: "Mehrwert für Einkaufsabteilungen im DACH-Raum",
  whyPoints: [
    "Kurze Lkw-Laufzeiten (3–5 Tage aus der Türkei) kombiniert mit Dual-Hub-Kostenvergleich gegenüber China.",
    "Einzelbuchung einer unabhängigen Werksprüfung auch für Lieferanten, die Sie bereits selbst ausgewählt haben.",
    "Saubere Dokumentationsgrundlage für Lieferkettensorgfalt (§ 1 LkSG ab 1.000 Beschäftigten seit 1. Januar 2024) und Herstellerpflichten im Sinne des Verpackungsgesetzes (LUCID).",
  ],
  faqTitle: "Häufig gestellte Fragen",
  faq: [
    {
      q: "Können Sie eine einzelne Werksprüfung für einen bestehenden Lieferanten durchführen?",
      a: "Ja. Auch wenn Sie Ihren Hersteller in der Türkei oder in China bereits selbst ausgewählt haben, entsenden wir innerhalb von 24–48 Stunden einen unabhängigen Prüfer zur Produktionskontrolle oder Containerverladung und erstellen innerhalb von 48 Stunden einen bebilderten Prüfbericht.",
    },
    {
      q: "Wie wird zwischen A.TR und Ursprungsnachweis unterschieden?",
      a: "Die Warenverkehrsbescheinigung A.TR belegt im Warenverkehr EU–Türkei den zollrechtlichen Freiverkehr für gewerbliche Waren (nicht den präferenziellen Ursprung); landwirtschaftliche Erzeugnisse sowie Eisen- und Stahlerzeugnisse (EGKS) unterliegen gesonderten Präferenzregeln. Für die Schweiz gilt das Freihandelsabkommen Türkei–EFTA mit EUR.1.",
    },
    {
      q: "Wie starten Sie die Anfrage für Ihr Unternehmen?",
      a: "Übermitteln Sie uns Warengruppe, Zolltarifnummer (HS-Code), geplante Menge und Zielort per E-Mail oder über das Anfrageformular. Sie erhalten Ihr strukturiertes Angebot innerhalb von 24 Stunden.",
    },
  ],
  emailTemplate: {
    subject: "Projektvorschlag Beschaffung & Werksprüfung für {{company}} ({{sector}})",
    body: "Sehr geehrte Damen und Herren bei {{company}},\n\nfür Ihre Beschaffungs- und Qualitätssicherungsprozesse im Bereich {{sector}} ({{country}}) haben wir eine strukturierte Projektübersicht vorbereitet:\n\n{{url}}\n\nSchwerpunkte:\n• Direkte Herstellerprüfung (Türkei & China) ohne Zwischenhändler\n• Unabhängige Werksprüfung & Containerverladung innerhalb von 24–48 h inkl. Prüfbericht\n• Saubere Vorbereitung für Zollabwicklung (A.TR / EFTA-EUR.1) und LUCID-Daten\n\nMit freundlichen Grüßen\nBdimexport DACH-Desk",
  },
};

// ZH China-to-Türkiye Proposal — Simplified Chinese ONLY (简体字), exact glossary (采购/验厂/物流/清关/代工生产), 3/5 items (NO 4-item lists!), NO ICP!
export const ZH_PROPOSAL: ProposalBlueprint = {
  slug: "tuerqi-bendi-tuandui",
  locale: "zh",
  track: "marketing",
  badge: "土耳其市场本地化合作方案 · 81省实地团队",
  metaTitle: "中国企业土耳其本地团队与客户拜访方案 | Bdimexport",
  metaDesc: "面向中国制造与出口企业的土耳其81省实地拜访、犹豫客户当面促成、售后巡访、清关物流及财税法务一体化合作方案，24小时内响应。",
  h1: "中国企业开拓土耳其市场：81省实地拜访与本地运营合作方案",
  lead: "专为中国工厂与外贸企业打造：依托土耳其本土实体（BD Sanayi）与美国实体（BDIMEXPORT LLC），提供新客户实地开发、成交前犹豫客户上门沟通、售后回访、清关物流与电商社媒落地支持。",
  slaText: "24小时内获取免费报价 · 微信直连中文团队（bdimexport）",
  deliverablesTitle: "五大核心落地服务模块",
  deliverables: [
    { code: "TR-01", title: "新客户实地拜访与买家背景核验", detail: "深入伊斯坦布尔、布尔萨、伊兹密尔、安卡拉、加济安泰普等土耳其81省工业区，当面拜访目标进口商并核实企业资质。" },
    { code: "TR-02", title: "采购阶段犹豫客户上门促成与疑虑解决", detail: "针对已报价但迟迟未付款的土耳其买家，派遣本地双语商务代表登门拜访，消除信任障碍，加速定金与尾款落地。" },
    { code: "TR-03", title: "售后服务回访与现场问题协处", detail: "货物抵港后协助现场清点、验厂报告复核、质量异议沟通及长期客户关系维护，提升复购率。" },
    { code: "TR-04", title: "土耳其清关、物流与代工生产协同", detail: "协助TAREKS合规、海运陆运清关物流衔接，以及面向欧盟关税同盟（A.TR）的土耳其本地组装与代工生产（OEM）评估。" },
    { code: "TR-05", title: "公司设立、财税法务（SMMM）与本地电商运营", detail: "对接土耳其注册会计师与商事律师，支持主体设立、商标保护及本地B2B/电商与社媒矩阵搭建。" },
  ],
  commercialTermsTitle: "三大透明合作保障",
  commercialTerms: [
    { label: "响应承诺", value: "收到产品与目标客户需求后24小时内出具执行方案与报价" },
    { label: "签约主体", value: "土耳其本土公司 BD Sanayi 与美国公司 BDIMEXPORT LLC（邓白氏 D-U-N-S®：14-977-6743 · SAP Ariba®：BNO-100000188010374）双实体保障" },
    { label: "服务模式", value: "支持单次客户拜访/尽调委托，或按季度/年度派驻专属土耳其本地业务团队" },
  ],
  whyTitle: "为什么中国出口企业选择 Bdimexport 土耳其团队",
  whyPoints: [
    "无需高昂驻外差旅与签证等待，48小时内即可安排土耳其本地人员直达买家办公室或工厂。",
    "深谙土耳其商业文化与海关清关规则，用土耳其语面对面建立深度商业信任。",
    "全流程图文与书面纪要反馈，沟通高效透明。",
  ],
  faqTitle: "常见问题解答",
  faq: [
    {
      q: "如果我们已经有正在跟进但犹豫不决的土耳其客户，可以委托单次上门拜访吗？",
      a: "完全可以。您只需提供客户所在城市、行业背景与当前沟通卡点，我们的土耳其本地商务团队即可预约上门拜访，当面解答清关、付款或售后顾虑，并向您提交详细拜访报告。",
    },
    {
      q: "除了销售拜访，你们能否协助土耳其清关、验厂与售后协调？",
      a: "可以。我们涵盖土耳其进口清关咨询、港口物流衔接、到货现场核验、验厂报告复核以及本地法律与财税顾问对接，帮助中国供应商稳健深耕土耳其市场。",
    },
    {
      q: "如何快速启动专属方案沟通？",
      a: "请通过微信号 bdimexport 或邮件发送贵司产品目录与需求目标，中文项目组将在24小时内回复定制执行计划。",
    },
  ],
  emailTemplate: {
    subject: "致 {{company}}：土耳其市场81省本地客户拜访与落地合作方案（{{sector}}）",
    body: "{{company}} 外贸与国际业务负责人您好：\n\n针对贵司在 {{sector}} 领域拓展土耳其及周边市场的需求，我们整理了专属本地化实地拜访与运营支持方案：\n\n{{url}}\n\n核心支持：\n• 土耳其81省潜在买家实地拜访 + 犹豫客户当面促成\n• 售后巡访、清关物流协同与买家资质尽调\n• 土耳其本地公司实体支持，微信号 bdimexport 中文直连\n\n欢迎随时审阅方案并与我们联系。\n\n顺颂商祺\nBdimexport 土耳其本地运营中心",
  },
};

export function getEnProposalBySlug(slug: string): ProposalBlueprint | undefined {
  return EN_PROPOSALS.find((p) => p.slug === slug);
}
