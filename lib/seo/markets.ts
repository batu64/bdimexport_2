// Küresel Ülke Koridorları (/en/markets/[country]) — 2026/2027 Programmatic International SEO + GEO Veritabanı.
// Her koridor: ülke bazlı gümrük rejimi, transit süreleri (Türkiye vs. Çin), uyumluluk/denetim protokolü,
// öncelikli ürün bağlantı matrisi ve LLM alıntılamasına hazır (40-75 kelime) doğrudan Q&A blokları içerir.

export interface MarketCorridor {
  slug: string;
  countryName: string;
  isoCode: string;
  regionBadge: string;
  hreflangRegional?: string;
  nativeHubHref?: string;
  nativeHubLabel?: string;
  metaTitle: string; // <= 60 chars
  metaDesc: string;  // 120-158 chars
  h1: string;
  lead: string;
  currency: string;
  customsRegime: string;
  gateways: string;
  complianceStandards: string[];
  comparisonRows: {
    factor: string;
    trHub: string;
    cnHub: string;
    bdimExecution: string;
  }[];
  priorityProducts: { slug: string; label: string; hsChapter: string }[];
  faq: { q: string; a: string }[];
}

export const MARKET_CORRIDORS: readonly MarketCorridor[] = [
  {
    slug: "united-states",
    countryName: "United States",
    isoCode: "US",
    regionBadge: "North America · US LLC Contracting",
    nativeHubHref: "/en/us",
    nativeHubLabel: "Open Dedicated US Division (/en/us)",
    metaTitle: "Sourcing & Inspection for US Importers | Bdimexport",
    metaDesc: "Compare Türkiye MFN duties vs. China Section 301 tariffs, book 24-48h container loading QC, and contract directly with US-registered BDIMEXPORT LLC.",
    h1: "Türkiye & China Dual-Hub Sourcing and Container Inspection for US Importers",
    lead: "US procurement teams use Bdimexport to diversify away from Section 301 tariff exposure, compare Türkiye vs. China landed costs side by side, and contract domestically via BDIMEXPORT LLC (Sheridan, Wyoming).",
    currency: "USD",
    customsRegime: "US MFN Tariff Schedule (Türkiye) vs. Section 301 Additional Duties (China)",
    gateways: "NY/NJ, Savannah, Houston, Los Angeles / Long Beach (16–24d ex-Türkiye · 18–34d ex-China)",
    complianceStandards: [
      "FDA Food Facility Registration & FSVP documentation verification",
      "UL / ETL electrical safety & CPSIA consumer product test coordination",
      "CTPAT-aligned 7-point container structure, moisture, and ISO 17712 high-security bolt seal proof",
    ],
    comparisonRows: [
      { factor: "US Customs Tariff Exposure", trHub: "Standard MFN duty (no Section 301 surcharge)", cnHub: "MFN + Section 301 duties (7.5%–25%+ on many HS lines)", bdimExecution: "Side-by-side HTS landed-cost modeling before RFQ award" },
      { factor: "Ocean Freight to US East Coast", trHub: "16–22 days direct ex-Mersin / Izmir / Ambarli", cnHub: "28–36 days via Panama / Suez routing", bdimExecution: "FOB/CIF/DDP booking + pre-loading container inspection" },
      { factor: "MOQ & Reorder Agility", trHub: "Flexible mid-volume & hospitality custom runs", cnHub: "High-volume tooling & mass SKU scale", bdimExecution: "Consolidated samples & split-hub risk diversification" },
      { factor: "Contractual Counterparty", trHub: "BD Sanayi on-ground factory execution", cnHub: "On-site inspector network in coastal hubs", bdimExecution: "US domestic invoice via BDIMEXPORT LLC (WY · D-U-N-S® #14-977-6743 · SAP Ariba® BNO-100000188010374)" },
    ],
    priorityProducts: [
      { slug: "hospitality-furniture", label: "Hospitality & Contract Furniture", hsChapter: "HS 9403" },
      { slug: "marble", label: "Natural Stone & Travertine", hsChapter: "HS 6802" },
      { slug: "home-textiles", label: "Turkish Towels & Hospitality Linens", hsChapter: "HS 6302" },
      { slug: "olive-oil", label: "Private Label Olive Oil & Gourmet Foods", hsChapter: "HS 1509" },
      { slug: "cnc-machinery", label: "Industrial Machinery & Metal Fabrication", hsChapter: "HS 8457" },
    ],
    faq: [
      {
        q: "How do US importers reduce Section 301 tariff costs using Bdimexport?",
        a: "Bdimexport models exact 10-digit HTS landed costs across verified Turkish and Chinese factories within 24 hours. For categories heavily impacted by US Section 301 tariffs—such as furniture, stone, textiles, and metal assemblies—shifting production or final manufacturing to Türkiye often lowers total landed cost while cutting East Coast ocean transit to 16–22 days.",
      },
      {
        q: "Can US companies contract with a US legal entity instead of wiring funds overseas?",
        a: "Yes. Bdimexport operates through BDIMEXPORT LLC, registered in Sheridan, Wyoming (Dun & Bradstreet D-U-N-S® #: 14-977-6743 · SAP Business Network / SAP Ariba ID: BNO-100000188010374), alongside BD Sanayi İthalat İhracat Şirketi in Türkiye. US buyers can onboard us directly into SAP Ariba or standard US ERP vendor systems while our local engineers execute factory audits, AQL inspections, and container sealing at the manufacturing site.",
      },
      {
        q: "Can I book a standalone container loading inspection for a supplier we already found?",
        a: "Yes. Even if your company sourced the manufacturer independently in Türkiye or China, Bdimexport dispatches an independent inspector within 24–48 hours to run ISO 2859-1 AQL sampling, verify carton counts, test container integrity, and photograph the numbered bolt seal before balance payment.",
      },
      {
        q: "What compliance checks do you verify for US-bound cargo?",
        a: "Before shipment, our due-diligence and inspection teams verify commercial registration, export history, FDA facility registration for food lines, third-party lab reports (SGS, Intertek, TÜV) for CPSIA or UL requirements, ISPM-15 wood packaging stamps, and country-of-origin marking compliance.",
      },
      {
        q: "How fast do we receive a Dual-Hub RFQ comparison?",
        a: "Initial scope confirmation and preliminary cost corridors are delivered within 24 hours of submitting your Smart RFQ, followed by verified factory shortlists and itemized EXW, FOB, or DDP quotations within 3 to 5 business days.",
      },
    ],
  },
  {
    slug: "united-kingdom",
    countryName: "United Kingdom",
    isoCode: "GB",
    regionBadge: "UK-Türkiye FTA · Fast Road & Short-Sea",
    hreflangRegional: "en-GB",
    metaTitle: "Turkey & China Sourcing for UK Buyers | Bdimexport",
    metaDesc: "Zero-tariff industrial sourcing under the UK-Türkiye FTA, 5-7 day road freight, UKCA compliance checks, and 24-48h container loading inspection.",
    h1: "UK-Türkiye Free Trade Sourcing & Standalone Factory Inspection",
    lead: "British retailers, hospitality groups, and industrial distributors leverage the UK-Türkiye Free Trade Agreement for preferential zero-tariff sourcing in 5–7 days by road, backed by Dual-Hub China cost benchmarking.",
    currency: "GBP / USD / EUR",
    customsRegime: "UK-Türkiye Free Trade Agreement (Preferential Origin Declaration) vs. UK Global Tariff (China)",
    gateways: "Dover / Folkestone (Road TIR 5–7d), Felixstowe, Southampton, London Gateway (Sea 10–14d)",
    complianceStandards: [
      "UKCA & CE dual-marking technical file verification",
      "UK-Türkiye FTA Origin Declaration audit on commercial invoices",
      "BS 5852 / Crib 5 fire-retardancy coordination for UK hospitality upholstery & mattresses",
    ],
    comparisonRows: [
      { factor: "Door-to-Door Lead Time to UK", trHub: "5–7 days overland TIR · 10–14 days short-sea", cnHub: "30–42 days ocean freight to Felixstowe/Southampton", bdimExecution: "Weekly groupage (LCL/FTL) & full container coordination" },
      { factor: "UK Import Duty", trHub: "0% preferential tariff on qualifying industrial goods", cnHub: "Standard UKGT duties + trade remedies where applicable", bdimExecution: "Origin declaration & HS classification check pre-dispatch" },
      { factor: "Hospitality & Retail Standards", trHub: "Experienced in UK Crib 5, BRCGS & SEDEX audits", cnHub: "Broad electronics & high-volume hardgoods ecosystem", bdimExecution: "On-site AQL inspection + lab test sample sealing" },
    ],
    priorityProducts: [
      { slug: "apparel", label: "Private Label Apparel & Knitwear", hsChapter: "HS 61-62" },
      { slug: "hospitality-furniture", label: "Crib-5 Ready Contract Furniture", hsChapter: "HS 9403" },
      { slug: "sanitaryware", label: "Ceramic Sanitaryware & Bathroom Brassware", hsChapter: "HS 6910" },
      { slug: "kitchenware", label: "Cookware, Glassware & HoReCa Equipment", hsChapter: "HS 7323" },
      { slug: "dried-fruits", label: "BRCGS Dried Fruits & Hazelnut Ingredients", hsChapter: "HS 0802" },
    ],
    faq: [
      {
        q: "Do imports from Türkiye to the UK qualify for zero customs duty?",
        a: "Under the UK-Türkiye Free Trade Agreement, qualifying industrial products originating in Türkiye enter the United Kingdom at 0% customs duty when accompanied by a valid Origin Declaration. Bdimexport verifies origin eligibility and invoice wording prior to export clearance.",
      },
      {
        q: "How long does freight take from Turkish factories to UK warehouses?",
        a: "Direct overland TIR trucks deliver from Istanbul, Bursa, Izmir, or Kayseri to UK distribution centers in 5 to 7 days, while short-sea container services reach Felixstowe or London Gateway in 10 to 14 days—more than three weeks faster than Far East sea freight.",
      },
      {
        q: "Can Bdimexport verify UK fire-safety and quality standards before shipment?",
        a: "Yes. For UK furniture, textile, and industrial buyers, our inspectors draw sealed production samples for BS 5852 / Crib 5 or UKCA lab testing and execute pre-shipment ISO 2859-1 AQL inspections before you release final payment.",
      },
      {
        q: "Do you inspect factories in both Türkiye and China for UK importers?",
        a: "Yes. Whether your order is placed in Guangdong, Ningbo, Istanbul, or Gaziantep, we deploy an independent inspector within 24–48 hours for mid-production DUPRO checks or full container loading supervision.",
      },
      {
        q: "What minimum order quantities apply when sourcing from Türkiye for the UK?",
        a: "Turkish manufacturers typically support lower MOQs per SKU and faster seasonal replenishment than ocean-bound Asian supply chains, allowing UK brands to test collections with partial truckloads (LTL) before scaling.",
      },
    ],
  },
  {
    slug: "germany",
    countryName: "Germany & DACH",
    isoCode: "DE",
    regionBadge: "EU Customs Union (A.TR) · DACH Desk",
    nativeHubHref: "/de",
    nativeHubLabel: "Deutsche DACH-Plattform (/de)",
    metaTitle: "Turkey & China Sourcing for Germany (DACH) | Bdimexport",
    metaDesc: "0% EU industrial customs duty via A.TR, 3-5 day truck transit to Germany, LkSG-aware supplier audits, and 24-48h Werkspruefung.",
    h1: "Industrial & Retail Sourcing Across Türkiye and China for German & DACH Buyers",
    lead: "German, Austrian, and Swiss Einkaufsleiter combine Türkiye's EU Customs Union (A.TR) speed with China's tooling depth—supported by structured factory verification, LUCID/LkSG documentation readiness, and dedicated German-speaking support at /de.",
    currency: "EUR / CHF",
    customsRegime: "EU-Türkiye Customs Union (A.TR 0% industrial duty; EFTA-FTA EUR.1 for Switzerland)",
    gateways: "Munich, Stuttgart, Frankfurt, Hamburg, Vienna, Zurich (3–5d overland truck)",
    complianceStandards: [
      "A.TR free-circulation vs. EUR.1 preferential origin verification (excluding agricultural & ECSC steel lines)",
      "Supply-chain documentation readiness for LkSG due-diligence questionnaires & SAP Ariba vendor onboarding (ID: BNO-100000188010374)",
      "VerpackG (LUCID) packaging material specification sheets & CE/REACH compliance checks",
    ],
    comparisonRows: [
      { factor: "Transit to Southern/Central Germany", trHub: "3–5 days overland truck / Trieste Ro-Ro intermodal", cnHub: "30–38 days sea freight to Hamburg/Bremerhaven", bdimExecution: "Scheduled FTL/LTL road & multimodal coordination" },
      { factor: "EU Customs Tariff (Industrial)", trHub: "0% customs duty with A.TR movement certificate", cnHub: "EU TARIC third-country duties + anti-dumping checks", bdimExecution: "Pre-shipment TARIC, A.TR & EFTA-EUR.1 verification" },
      { factor: "Quality & Engineering Audits", trHub: "DIN/ISO-experienced metalwork, CNC, textile & OEM", cnHub: "Electronics, injection tooling & high-volume assemblies", bdimExecution: "48h written inspection report with measurement logs" },
    ],
    priorityProducts: [
      { slug: "cnc-machinery", label: "CNC Machining, Metal Parts & Industrial Equipment", hsChapter: "HS 8457" },
      { slug: "pumps-valves", label: "Industrial Pumps, Valves & Castings", hsChapter: "HS 8481" },
      { slug: "apparel", label: "European Fast-Replenishment Apparel", hsChapter: "HS 61-62" },
      { slug: "hvac-systems", label: "HVAC, Radiators & Ventilation Equipment", hsChapter: "HS 8415" },
      { slug: "hazelnuts", label: "Processed Hazelnuts & Food Ingredients", hsChapter: "HS 0802" },
    ],
    faq: [
      {
        q: "How does the A.TR certificate work when importing from Türkiye to Germany?",
        a: "Under the EU-Türkiye Customs Union, industrial goods in free circulation in Türkiye enter Germany and Austria at 0% customs duty with an A.TR movement certificate. Primary agricultural products and ECSC iron/steel items follow separate preferential rules, while Switzerland uses the Türkiye-EFTA agreement (EUR.1).",
      },
      {
        q: "Do you offer a dedicated German-language platform for DACH procurement teams?",
        a: "Yes. DACH buyers can use our dedicated German hub at bdimexport.com/de for German-language service specifications, Werksprüfung protocols, compliance documentation, and formal B2B inquiry handling.",
      },
      {
        q: "How quickly can an inspector audit a Turkish or Chinese factory for a German buyer?",
        a: "Bdimexport deploys on-site inspectors within 24–48 hours across industrial zones in Türkiye (Istanbul, Bursa, Kocaeli, Izmir, Konya, Gaziantep) and China, delivering photo-documented dimensional and AQL reports within 48 hours of inspection.",
      },
      {
        q: "How do you assist with LkSG and VerpackG (LUCID) data collection?",
        a: "During supplier qualification, we collect corporate registry extracts, ISO/social audit certificates, workplace photos, and exact packaging weight/material breakdowns so the German importer of record can fulfill LkSG risk documentation and LUCID filings accurately.",
      },
      {
        q: "Can we order partial truckloads (LTL) from Türkiye to Germany?",
        a: "Yes. Weekly consolidated road departures connect Istanbul and Izmir with Munich, Stuttgart, Frankfurt, and Ruhr logistics hubs in 4 to 6 days, enabling lean inventory replenishment without full-container lock-in.",
      },
    ],
  },
  {
    slug: "france",
    countryName: "France",
    isoCode: "FR",
    regionBadge: "EU Customs Union · French Hub (/en/fr)",
    nativeHubHref: "/en/fr",
    nativeHubLabel: "Portail Français (/en/fr)",
    metaTitle: "Sourcing Turkey & China for France | Bdimexport",
    metaDesc: "0% industrial tariff via A.TR, 4-6 day road/Ro-Ro freight to France, verified private label factories, and 24-48h container loading inspection.",
    h1: "Nearshore Türkiye & Dual-Hub China Sourcing for French Importers",
    lead: "French retail chains, industrial buyers, and private-label brands cut inventory lead times from 35 days to 5 days via Türkiye's Marseille-Fos / road corridors while retaining full China benchmarking.",
    currency: "EUR",
    customsRegime: "EU-Türkiye Customs Union (A.TR 0% industrial duty)",
    gateways: "Marseille-Fos / Sète Ro-Ro (3–5d), Lyon, Paris, Lille overland TIR (4–6d)",
    complianceStandards: [
      "EU REACH, OEKO-TEX Standard 100 & DGCCRF labeling verification",
      "AGEC Law (Triman sorting logo) artwork & packaging check pre-printing",
      "ISO 2859-1 AQL pre-shipment & container loading supervision",
    ],
    comparisonRows: [
      { factor: "Lead Time to Lyon / Paris / Marseille", trHub: "4–6 days road or Sète/Marseille Ro-Ro", cnHub: "30–38 days sea freight to Le Havre / Fos", bdimExecution: "Door-to-warehouse multimodal freight & customs check" },
      { factor: "Customs Duties", trHub: "0% on industrial goods with A.TR", cnHub: "Standard EU TARIC tariff rates", bdimExecution: "Full export paperwork & EUR.1/A.TR validation" },
      { factor: "Private Label Packaging", trHub: "Low-MOQ Triman/French compliant packaging", cnHub: "High-volume custom molds & gift packaging", bdimExecution: "Pre-production artwork & barcode audit on-site" },
    ],
    priorityProducts: [
      { slug: "apparel", label: "Private Label Fashion & Knitwear", hsChapter: "HS 61-62" },
      { slug: "home-textiles", label: "Bath, Bedding & Home Textiles", hsChapter: "HS 6302" },
      { slug: "furniture", label: "Retail & Hospitality Furniture", hsChapter: "HS 9403" },
      { slug: "ceramics", label: "Architectural Ceramics & Tiles", hsChapter: "HS 6907" },
      { slug: "olive-oil", label: "Mediterranean Food & Ingredients", hsChapter: "HS 1509" },
    ],
    faq: [
      {
        q: "What is the fastest shipping route from Türkiye to France?",
        a: "Ro-Ro vessels from Yalova/Mersin to Sète or Marseille-Fos combined with French rail/road connections deliver cargo in 4 to 5 days, while direct overland TIR trucks reach Lyon and Paris in 5 to 6 days.",
      },
      {
        q: "Do you check French AGEC / Triman packaging compliance during inspection?",
        a: "Yes. When French buyers provide packaging dielines, our inspectors verify Triman sorting symbols, French language mandatory consumer notices, EAN barcodes, and carton markings on the factory floor before packing.",
      },
      {
        q: "Is French-language support available?",
        a: "Yes. French buyers can review our localized French overview at bdimexport.com/en/fr and submit structured RFQs with EUR pricing and +33 contact preferences.",
      },
      {
        q: "Can Bdimexport audit an existing supplier in Bursa, Denizli, or Ningbo?",
        a: "Yes. Standalone factory audits, mid-production DUPRO inspections, and container loading supervision are available within 24–48 hours across both Türkiye and China for a fixed fee.",
      },
      {
        q: "How are customs duties handled between Türkiye and France?",
        a: "Industrial products ship with an A.TR movement certificate under the EU-Türkiye Customs Union at 0% customs duty, leaving only standard French import VAT (autoliquidation de la TVA) at clearance.",
      },
    ],
  },
  {
    slug: "netherlands",
    countryName: "Netherlands & Benelux",
    isoCode: "NL",
    regionBadge: "Rotterdam Gateway · Benelux Hub (/en/nl)",
    nativeHubHref: "/en/nl",
    nativeHubLabel: "Nederlands Portaal (/en/nl)",
    metaTitle: "Turkey & China Sourcing for Benelux | Bdimexport",
    metaDesc: "Direct sourcing & 24-48h container inspection for Dutch and Benelux importers. 4-6 day road transit, 0% A.TR duty, and Rotterdam sea consolidation.",
    h1: "Dual-Hub Sourcing & Container Supervision for Dutch and Benelux Importers",
    lead: "Dutch wholesalers, e-commerce aggregators, and Rotterdam distribution hubs combine fast 4–6 day Turkish road replenishment with audited Chinese container consolidation.",
    currency: "EUR",
    customsRegime: "EU-Türkiye Customs Union (A.TR 0% duty) + Dutch Article 23 VAT Deferment friendly documentation",
    gateways: "Rotterdam, Amsterdam, Venlo, Antwerp (4–6d road · 10–13d short-sea)",
    complianceStandards: [
      "EU CE, RoHS, REACH & NVWA food-contact documentation audit",
      "Clean commercial invoice & packing list accuracy for Dutch Article 23 clearance",
      "Palletization (EPAL Euro-pallet 80×120 cm) & container moisture verification",
    ],
    comparisonRows: [
      { factor: "Transit to Venlo / Rotterdam", trHub: "4–6 days road · 10–13 days short-sea", cnHub: "30–38 days ocean freight to Rotterdam", bdimExecution: "EPAL pallet & carton height check for automated 3PL warehouses" },
      { factor: "Customs & Cash Flow", trHub: "0% A.TR industrial tariff", cnHub: "Standard EU TARIC duties", bdimExecution: "Zero-discrepancy packing lists for fast Dutch customs release" },
      { factor: "Supplier Transparency", trHub: "Direct Turkish factory verification", cnHub: "Verified Chinese OEMs (brokers filtered out)", bdimExecution: "72h corporate registry & capacity due-diligence report" },
    ],
    priorityProducts: [
      { slug: "kitchenware", label: "Kitchenware, Home & Living Goods", hsChapter: "HS 94 / 73" },
      { slug: "kitchenware", label: "Kitchenware & Tableware", hsChapter: "HS 7323 / 7013" },
      { slug: "fabrics", label: "Technical & Upholstery Fabrics", hsChapter: "HS 54-55" },
      { slug: "steel", label: "Fabricated Metal & Structural Profiles", hsChapter: "HS 7308" },
      { slug: "dried-fruits", label: "Nuts, Dried Fruits & Bulk Food", hsChapter: "HS 08" },
    ],
    faq: [
      {
        q: "Can Bdimexport inspect pallet heights and barcode labels for Dutch 3PL warehouses?",
        a: "Yes. Automated Benelux 3PL warehouses strictly reject non-compliant pallets. Our container loading inspectors verify EPAL Euro-pallet dimensions, maximum stack height, wrap tension, GS1-128 carton labels, and moisture levels prior to sealing.",
      },
      {
        q: "How fast is overland delivery from Türkiye to the Netherlands?",
        a: "Full truckloads (FTL) reach Venlo, Eindhoven, Rotterdam, or Antwerp in 4 to 6 days, while weekly groupage (LTL) services deliver in 6 to 8 days.",
      },
      {
        q: "Do you provide Dutch-language information for Benelux buyers?",
        a: "Yes. Dutch importers can visit bdimexport.com/en/nl for our Dutch-language summary and communicate directly via email or Smart RFQ in EUR.",
      },
      {
        q: "How do you eliminate middlemen when sourcing in China or Türkiye?",
        a: "Our commercial intelligence desk verifies official chamber of commerce registrations, tax records, factory floor machinery, and export licenses before shortlisting any manufacturer, ensuring direct factory pricing.",
      },
      {
        q: "What is the turnaround for a standalone pre-shipment inspection?",
        a: "Inspector attendance is scheduled within 24–48 hours of booking, and the full illustrated PDF inspection report is delivered within 48 hours of completion.",
      },
    ],
  },
  {
    slug: "italy",
    countryName: "Italy",
    isoCode: "IT",
    regionBadge: "48–72h Trieste Corridor · Italian Hub (/en/it)",
    nativeHubHref: "/en/it",
    nativeHubLabel: "Portale Italiano (/en/it)",
    metaTitle: "Sourcing Turkey & China for Italy | Bdimexport",
    metaDesc: "48-72h Trieste/Bari Ro-Ro corridor, 0% EU A.TR industrial tariff, verified OEM co-manufacturing, and 24-48h container inspection for Italian buyers.",
    h1: "Industrial Co-Manufacturing, Sourcing & QC Inspection for Italian Buyers",
    lead: "Italian fashion houses, machinery builders, and stone/construction groups integrate Turkish semi-finished and OEM production via the ultra-fast 48–72h Adriatic Ro-Ro corridor.",
    currency: "EUR",
    customsRegime: "EU-Türkiye Customs Union (A.TR 0% industrial duty)",
    gateways: "Trieste, Bari, Ravenna, Genoa (48–72h Ro-Ro / short-sea + rail)",
    complianceStandards: [
      "EU REACH textile & leather chemical compliance testing",
      "EN 1090 / ISO 3834 welding & dimensional tolerances for machinery sub-assemblies",
      "Slab grading, thickness tolerance & A-frame lashing inspection for marble & ceramics",
    ],
    comparisonRows: [
      { factor: "Factory-to-Northern Italy Transit", trHub: "3–4 days via Cesme/Pendik → Trieste Ro-Ro", cnHub: "26–34 days sea freight to Genoa / Trieste", bdimExecution: "Seamless JIT semi-finished & finished goods replenishment" },
      { factor: "Industrial Tariff", trHub: "0% with A.TR movement certificate", cnHub: "EU TARIC third-country duties", bdimExecution: "Customs document audit before vessel cut-off" },
      { factor: "Quality Supervision", trHub: "On-site textile, stone & metalwork inspectors", cnHub: "Coastal electronics & component QC teams", bdimExecution: "Live photo reporting + 48h technical audit PDF" },
    ],
    priorityProducts: [
      { slug: "denim", label: "Denim, Woven Fabrics & Garment OEM", hsChapter: "HS 5209 / 6203" },
      { slug: "marble", label: "Blocks, Slabs & Cut-to-Size Natural Stone", hsChapter: "HS 2515 / 6802" },
      { slug: "cnc-machinery", label: "Machined Castings & OEM Sub-Assemblies", hsChapter: "HS 84" },
      { slug: "hazelnuts", label: "Confectionery Hazelnuts & Paste Inputs", hsChapter: "HS 0802" },
      { slug: "ceramics", label: "Porcelain Tiles & Sanitaryware", hsChapter: "HS 6907" },
    ],
    faq: [
      {
        q: "How fast do goods move from Western Türkiye to Northern Italy?",
        a: "Ro-Ro vessels departing Pendik, Yalova, or Çeşme arrive at the Port of Trieste in roughly 48 to 60 hours, placing cargo in Veneto, Lombardy, or Emilia-Romagna within 3 to 4 days door-to-door.",
      },
      {
        q: "Can Bdimexport inspect marble slabs or CNC tolerances before shipment to Italy?",
        a: "Yes. Our inspectors verify slab vein matching, surface polish, moisture, timber A-frame bracing, and micrometric CNC part tolerances at the quarry or factory prior to container sealing.",
      },
      {
        q: "Is an Italian-language hub available?",
        a: "Yes. Italian procurement teams can view localized service details at bdimexport.com/en/it and initiate Dual-Hub RFQs in EUR.",
      },
      {
        q: "Can Italian manufacturers source sub-components from both Türkiye and China?",
        a: "Yes. Many Italian machinery and furniture producers source electronics or high-cavity tooling from China while sourcing heavy steelwork, upholstery, and fast-turn sub-assemblies from Türkiye under one Bdimexport QC protocol.",
      },
      {
        q: "What is the cost structure for standalone container loading supervision?",
        a: "Standalone inspection is billed as a transparent flat per-man-day fee quoted upfront within 24 hours, with zero commission on your supplier invoice.",
      },
    ],
  },
  {
    slug: "spain",
    countryName: "Spain",
    isoCode: "ES",
    regionBadge: "4–6d Short-Sea Med · Spanish Hub (/en/es)",
    nativeHubHref: "/en/es",
    nativeHubLabel: "Portal en Español (/en/es)",
    metaTitle: "Sourcing Turkey & China for Spain | Bdimexport",
    metaDesc: "4-6 day Mediterranean short-sea to Barcelona/Valencia, 0% EU A.TR industrial duty, verified factories, and 24-48h container inspection.",
    h1: "Mediterranean Short-Sea Sourcing & Factory Inspection for Spanish Buyers",
    lead: "Spanish fashion retailers, construction groups, and industrial distributors connect directly from Izmir, Mersin, and Gemlik to Barcelona and Valencia in 4–6 days duty-free under A.TR.",
    currency: "EUR",
    customsRegime: "EU-Türkiye Customs Union (A.TR 0% industrial duty)",
    gateways: "Barcelona, Valencia, Algeciras (4–6d short-sea · 6–7d road)",
    complianceStandards: [
      "EU REACH, CE & Spanish labeling compliance verification",
      "Textile shrinkage, colorfastness & GSM weight checks on-site",
      "Container tally, desiccant check & bolt seal verification",
    ],
    comparisonRows: [
      { factor: "Transit to Barcelona / Valencia", trHub: "4–6 days direct Mediterranean short-sea", cnHub: "25–34 days ocean freight", bdimExecution: "Fast seasonal fashion & construction replenishment" },
      { factor: "Customs Duty", trHub: "0% industrial tariff via A.TR", cnHub: "Standard EU TARIC tariff", bdimExecution: "Pre-shipment export customs & A.TR audit" },
      { factor: "Inspection Coverage", trHub: "All major Turkish textile, stone & industrial zones", cnHub: "All major Chinese coastal manufacturing provinces", bdimExecution: "24–48h inspector dispatch + full PDF report" },
    ],
    priorityProducts: [
      { slug: "apparel", label: "Fast-Fashion Apparel & Knitwear", hsChapter: "HS 61-62" },
      { slug: "fabrics", label: "Woven & Knitted Apparel Fabrics", hsChapter: "HS 52-60" },
      { slug: "ceramics", label: "Natural Stone & Building Finishes", hsChapter: "HS 68-69" },
      { slug: "agricultural-machinery", label: "Agricultural Implements & Irrigation", hsChapter: "HS 8432" },
      { slug: "carpets-rugs", label: "Machine-Made Rugs & Hospitality Flooring", hsChapter: "HS 5702" },
    ],
    faq: [
      {
        q: "How long does sea freight take from Türkiye to Barcelona or Valencia?",
        a: "Direct Mediterranean short-sea container vessels sail from Izmir, Gemlik, Ambarli, and Mersin to Valencia and Barcelona in 4 to 6 days, combining ocean-freight cost efficiency with near-truck speed.",
      },
      {
        q: "Do you support Spanish-speaking procurement teams in Spain and Latin America?",
        a: "Yes. Our neutral Spanish hub at bdimexport.com/en/es serves importers across both Spain and Latin America with tailored logistics and inspection workflows.",
      },
      {
        q: "Can Bdimexport run inline DUPRO inspections for fast-fashion apparel orders?",
        a: "Yes. Our textile inspectors check GSM weight, measurement specs, stitching defects, and trim accuracy at 20–40% production completion so corrections happen before garment packing.",
      },
      {
        q: "Are industrial imports from Türkiye duty-free in Spain?",
        a: "Yes. Qualifying industrial goods accompanied by an A.TR movement certificate enter Spain at 0% customs duty under the EU-Türkiye Customs Union.",
      },
      {
        q: "Can we verify a supplier before paying an advance deposit?",
        a: "Yes. Our 72-hour Commercial Intelligence & Supplier Verification report confirms official company registry, factory ownership, export track record, and bank beneficiary alignment prior to wire transfer.",
      },
    ],
  },
  {
    slug: "poland",
    countryName: "Poland & Central Europe",
    isoCode: "PL",
    regionBadge: "3–4d Direct Road · Polish Hub (/en/pl)",
    nativeHubHref: "/en/pl",
    nativeHubLabel: "Polski Portal (/en/pl)",
    metaTitle: "Sourcing Turkey & China for Poland & CEE | Bdimexport",
    metaDesc: "3-4 day overland road transit to Poland, 0% EU A.TR industrial tariff, verified OEM & construction suppliers, and 24-48h container QC.",
    h1: "Direct Overland Türkiye & Dual-Hub China Sourcing for Polish and CEE Buyers",
    lead: "Polish retail networks, construction contractors, and industrial manufacturers rely on the 3–4 day overland corridor from Türkiye alongside audited Chinese container imports via Gdańsk.",
    currency: "EUR / PLN",
    customsRegime: "EU-Türkiye Customs Union (A.TR 0% industrial duty)",
    gateways: "Warsaw, Łódź, Wrocław, Poznań (3–4d road) · Port of Gdańsk (China ocean hub)",
    complianceStandards: [
      "CE Declaration of Conformity & CPR (Construction Products Regulation) check",
      "A.TR customs documentation & packing weight accuracy",
      "On-site truck/container loading supervision & lashing verification",
    ],
    comparisonRows: [
      { factor: "Transit to Warsaw / Wrocław", trHub: "3–4 days direct TIR road freight", cnHub: "32–40 days ocean freight to Gdańsk", bdimExecution: "FTL/LTL truck loading QC & ocean container sealing" },
      { factor: "EU Import Tariff", trHub: "0% industrial tariff via A.TR", cnHub: "Standard EU TARIC duties", bdimExecution: "Full export clearance & document pre-audit" },
      { factor: "Industrial Synergy", trHub: "Steel, HVAC, textiles, glass & furniture components", cnHub: "Electronics, tooling & high-volume hardware", bdimExecution: "Dual-origin cost benchmarking in 24h" },
    ],
    priorityProducts: [
      { slug: "hvac-systems", label: "HVAC, Boilers & Ventilation Systems", hsChapter: "HS 8415 / 7322" },
      { slug: "steel", label: "Steel Profiles, Fasteners & Metalwork", hsChapter: "HS 73" },
      { slug: "home-textiles", label: "Home Textiles, Curtains & Carpets", hsChapter: "HS 63 / 57" },
      { slug: "furniture", label: "Furniture & Upholstery Components", hsChapter: "HS 9403" },
      { slug: "agricultural-machinery", label: "Tractors, Tillers & Farm Attachments", hsChapter: "HS 8432" },
    ],
    faq: [
      {
        q: "How fast do trucks reach Poland from Turkish industrial zones?",
        a: "Direct overland TIR trucks travel from Istanbul, Kocaeli, and Bursa to southern and central Poland (Kraków, Wrocław, Łódź, Warsaw) in 3 to 4 days.",
      },
      {
        q: "Do you inspect TIR truck loading as well as sea containers?",
        a: "Yes. For overland CEE shipments, our inspectors supervise trailer floor condition, pallet count, strapping security, AQL product quality, and TIR/customs seal application at the factory ramp.",
      },
      {
        q: "Where can Polish buyers read service details in Polish?",
        a: "Polish importers can access our Polish-language hub at bdimexport.com/en/pl for localized sourcing and inspection guidance.",
      },
      {
        q: "Can Bdimexport verify CE and Construction Products Regulation (CPR) files?",
        a: "Yes. For HVAC, steel, ceramics, and building materials, we review Declaration of Performance (DoP) files, notified-body test reports, and nameplate markings prior to dispatch.",
      },
      {
        q: "Do you also audit Chinese suppliers shipping into the Port of Gdańsk?",
        a: "Yes. Our China field team performs factory audits, inline DUPRO checks, and container loading supervision across Shenzhen, Ningbo, Shanghai, Qingdao, and Tianjin before vessels depart for Gdańsk.",
      },
    ],
  },
  {
    slug: "romania",
    countryName: "Romania & Southeast Europe",
    isoCode: "RO",
    regionBadge: "24–48h Corridor · Romanian Hub (/en/ro)",
    nativeHubHref: "/en/ro",
    nativeHubLabel: "Portalul în Română (/en/ro)",
    metaTitle: "Turkey & China Sourcing for Romania | Bdimexport",
    metaDesc: "24-48h road/Constanta corridor from Türkiye, 0% EU A.TR tariff, verified construction & retail factories, and standalone loading inspection.",
    h1: "24–48h Black Sea & Overland Sourcing and Inspection for Romanian Buyers",
    lead: "Romanian infrastructure developers, retail chains, and industrial distributors enjoy 24–48 hour proximity to Turkish factories with 0% A.TR industrial duty—paired with full China container verification.",
    currency: "EUR / RON",
    customsRegime: "EU-Türkiye Customs Union (A.TR 0% industrial duty)",
    gateways: "Bucharest, Constanța, Timișoara, Cluj-Napoca (24–48h road / Black Sea Ro-Ro)",
    complianceStandards: [
      "EU CPR construction certification & CE machinery compliance",
      "Batch mill-test certificates (EN 10204 3.1) for steel & industrial valves",
      "Truck & container loading tally + seal verification",
    ],
    comparisonRows: [
      { factor: "Transit to Bucharest / Constanța", trHub: "24–48 hours road or Karasu–Constanța ferry", cnHub: "28–36 days sea freight to Constanța", bdimExecution: "Rapid construction & retail restocking with on-site QC" },
      { factor: "Customs Regime", trHub: "0% industrial tariff via A.TR", cnHub: "Standard EU TARIC tariff", bdimExecution: "Zero-delay border & port document verification" },
      { factor: "Risk Control", trHub: "Same-time-zone factory verification", cnHub: "Pre-shipment AQL & loading supervision", bdimExecution: "Fixed-fee independent inspection reports in 48h" },
    ],
    priorityProducts: [
      { slug: "steel", label: "Construction Steel, Pipes & Profiles", hsChapter: "HS 72-73" },
      { slug: "ceramics", label: "Tiles, Marble & Sanitaryware", hsChapter: "HS 68-69" },
      { slug: "hvac-systems", label: "HVAC, Radiators & Plumbing Valves", hsChapter: "HS 8415 / 8481" },
      { slug: "pasta-cereals", label: "Packaged Foods, Pasta & Bakery Lines", hsChapter: "HS 1902" },
      { slug: "furniture", label: "Residential & Hotel Furniture", hsChapter: "HS 9403" },
    ],
    faq: [
      {
        q: "How fast can construction or retail goods ship from Türkiye to Romania?",
        a: "Overland trucks from Istanbul and Thrace reach Bucharest in 24 to 36 hours, while Black Sea Ro-Ro services connect directly to Constanța—allowing near-domestic replenishment speeds.",
      },
      {
        q: "Do you verify EN 10204 3.1 mill test certificates for steel and valves?",
        a: "Yes. Our technical inspectors cross-check heat numbers stamped on steel bundles, pipes, and industrial valves against factory EN 10204 3.1 test certificates during pre-shipment inspection.",
      },
      {
        q: "Is Romanian-language support available on your platform?",
        a: "Yes. Visit bdimexport.com/en/ro for our Romanian-language overview of Dual-Hub sourcing and container loading inspection.",
      },
      {
        q: "Can Romanian importers use Bdimexport for China shipments arriving at Constanța?",
        a: "Yes. Before your supplier seals a container in China bound for Constanța, our local inspector verifies product quality, carton quantities, and container seal integrity.",
      },
      {
        q: "How do we request a multi-factory quote?",
        a: "Submit your product specifications, HS code, and target volume through Smart RFQ below to receive a structured response within 24 hours.",
      },
    ],
  },
  {
    slug: "nordics",
    countryName: "Finland & Nordics",
    isoCode: "FI",
    regionBadge: "Nordic Compliance · Finnish Hub (/en/fi)",
    nativeHubHref: "/en/fi",
    nativeHubLabel: "Suomenkielinen Portaali (/en/fi)",
    metaTitle: "Turkey & China Sourcing for Nordic Buyers | Bdimexport",
    metaDesc: "Sustainability-documented sourcing, 5-7 day Baltic/road transit from Türkiye, 0% EU A.TR duty, and 24-48h factory & container inspection.",
    h1: "Traceable Türkiye & China Sourcing and Factory Audits for Nordic Importers",
    lead: "Finnish, Swedish, Danish, and Norwegian buyers require rigorous chemical compliance, ESG transparency, and reliable winter-grade logistics—delivered through verified Turkish and Chinese factories.",
    currency: "EUR / SEK / NOK / DKK",
    customsRegime: "EU-Türkiye Customs Union (FI/SE/DK: A.TR 0% duty) · Türkiye-EFTA FTA (NO: EUR.1 0% industrial duty)",
    gateways: "Helsinki, Turku, Stockholm, Gothenburg, Oslo, Copenhagen (5–8d road+Baltic ferry)",
    complianceStandards: [
      "EU REACH SVHC, OEKO-TEX, FSC & Nordic Swan documentation gathering",
      "ISO 9001 / ISO 14001 / BSCI / SEDEX social & environmental certificate verification",
      "Moisture-barrier desiccant & cold-chain/condensation protection check at container loading",
    ],
    comparisonRows: [
      { factor: "Transit to Helsinki / Stockholm", trHub: "5–8 days road + Baltic Ro-Pax ferry", cnHub: "35–45 days sea freight via transshipment", bdimExecution: "Condensation-protected packing & punctual ferry slot coordination" },
      { factor: "Customs Duty (EU & EFTA)", trHub: "0% industrial tariff (A.TR for EU · EUR.1 for Norway)", cnHub: "Standard EU/Norwegian MFN duties", bdimExecution: "Exact origin & sustainability dossier verification" },
      { factor: "ESG & Traceability", trHub: "High share of OEKO-TEX, GOTS & ISO-14001 mills", cnHub: "Audited tier-1 factories with verified social compliance", bdimExecution: "On-site physical verification—never desktop-only claims" },
    ],
    priorityProducts: [
      { slug: "home-textiles", label: "GOTS / OEKO-TEX Home & Hotel Textiles", hsChapter: "HS 6302" },
      { slug: "apparel", label: "Sustainable Workwear & Knitwear", hsChapter: "HS 61-62" },
      { slug: "steel", label: "Precision Metalwork & Welded Structures", hsChapter: "HS 7308" },
      { slug: "hvac-systems", label: "Energy-Efficient Heating & HVAC Units", hsChapter: "HS 8415" },
      { slug: "hospitality-furniture", label: "Nordic Design Contract Furniture OEM", hsChapter: "HS 9403" },
    ],
    faq: [
      {
        q: "How do goods from Türkiye enter Finland, Sweden, Denmark, and Norway duty-free?",
        a: "Finland, Sweden, and Denmark apply 0% industrial customs duty via the EU-Türkiye A.TR certificate, while Norway applies 0% preferential duty on qualifying Turkish industrial goods via an EUR.1 certificate under the Türkiye-EFTA Free Trade Agreement.",
      },
      {
        q: "How do you verify sustainability and social compliance claims for Nordic buyers?",
        a: "We validate certificate authenticity directly against official GOTS, OEKO-TEX, FSC, ISO 14001, and amfori BSCI registries and conduct physical on-site factory visits to verify working conditions and production capability.",
      },
      {
        q: "Is Finnish-language information available?",
        a: "Yes. Finnish buyers can review our localized Finnish portal at bdimexport.com/en/fi and submit specifications directly to our Nordic desk.",
      },
      {
        q: "How do you prevent container condensation damage on Baltic northbound routes?",
        a: "During loading supervision, our inspectors measure carton and wood pallet moisture (<18%) with pinless meters, check container roof/gasket tightness, and verify proper calcium-chloride desiccant placement.",
      },
      {
        q: "Can Nordic companies benchmark Turkish nearshore production against China?",
        a: "Yes. Every Dual-Hub RFQ can request side-by-side unit cost, MOQ, carbon/transit footprint, and tariff comparisons across both Türkiye and China.",
      },
    ],
  },
  {
    slug: "united-arab-emirates",
    countryName: "United Arab Emirates & GCC",
    isoCode: "AE",
    regionBadge: "TR-UAE CEPA · Arabic Hub (/en/ar)",
    hreflangRegional: "en-AE",
    nativeHubHref: "/en/ar",
    nativeHubLabel: "البوابة العربية (/en/ar)",
    metaTitle: "Turkey & China Sourcing for UAE & GCC | Bdimexport",
    metaDesc: "Preferential tariffs under Türkiye-UAE CEPA, hospitality & construction project sourcing, Halal/ESMA checks, and 24-48h container loading QC.",
    h1: "Hospitality, Construction & FMCG Sourcing Across Türkiye and China for UAE Buyers",
    lead: "Dubai and Abu Dhabi project contractors, hospitality groups, and re-export traders combine Türkiye-UAE CEPA tariff reductions with Dual-Hub China FF&E and building-material consolidation.",
    currency: "USD / AED",
    customsRegime: "Türkiye-UAE Comprehensive Economic Partnership Agreement (CEPA) + GCC Common External Tariff",
    gateways: "Jebel Ali (Dubai), Khalifa Port (Abu Dhabi), Sharjah (8–14d sea/multimodal ex-TR · 16–22d ex-CN)",
    complianceStandards: [
      "UAE MoIAT / ECAS / EQM conformity & Certificate of Origin attestation",
      "Halal certification & Arabic/English bilingual shelf-life labeling check for food lines",
      "FF&E hospitality mock-up, SAP Ariba enterprise vendor readiness (BNO-100000188010374) & container loading supervision",
    ],
    comparisonRows: [
      { factor: "Transit to Jebel Ali / Abu Dhabi", trHub: "8–14 days sea or overland-Gulf multimodal", cnHub: "16–22 days direct ocean freight", bdimExecution: "Synchronized multi-vendor FF&E & construction dispatch" },
      { factor: "Tariff Advantage", trHub: "Preferential reductions on covered HS lines via TR-UAE CEPA", cnHub: "Standard 5% GCC customs tariff on most lines", bdimExecution: "CEPA Certificate of Origin & invoice legalization check" },
      { factor: "Project Customization", trHub: "Bespoke marble, architectural joinery & hotel textiles", cnHub: "Lighting, decorative hardware & electronics", bdimExecution: "Dual-Hub project BOQ split + single QC standard" },
    ],
    priorityProducts: [
      { slug: "hospitality-furniture", label: "5-Star Hotel FF&E & Bespoke Joinery", hsChapter: "HS 9403" },
      { slug: "marble", label: "Bookmatched Turkish Marble & Travertine", hsChapter: "HS 6802" },
      { slug: "carpets-rugs", label: "Custom Hospitality & Mosque Carpets", hsChapter: "HS 5702" },
      { slug: "olive-oil", label: "Halal Gourmet Foods, Olive Oil & Nuts", hsChapter: "HS 1509 / 0802" },
      { slug: "sanitaryware", label: "Project Sanitaryware & Ceramic Tiles", hsChapter: "HS 6907 / 6910" },
    ],
    faq: [
      {
        q: "How does the Türkiye-UAE CEPA benefit Dubai and Abu Dhabi importers?",
        a: "The Türkiye-UAE Comprehensive Economic Partnership Agreement eliminates or reduces customs duties across more than 80% of tariff lines when accompanied by a preferential Certificate of Origin, boosting margins on construction, food, metal, and textile imports.",
      },
      {
        q: "Can Bdimexport manage multi-factory FF&E inspections for UAE hotel projects?",
        a: "Yes. Hospitality developers routinely source stone, custom furniture, carpets, and linens from Türkiye alongside lighting and hardware from China. We inspect every factory in both hubs against your approved Bill of Quantities (BOQ) and finish samples.",
      },
      {
        q: "Do you provide Arabic-language support for MENA buyers?",
        a: "Yes. Arabic-speaking executives can browse our full RTL Arabic portal at bdimexport.com/en/ar and coordinate fast approvals via WhatsApp Business or email.",
      },
      {
        q: "Do you check Arabic food labeling and Halal certificates before loading?",
        a: "Yes. For UAE and GCC food shipments, our inspectors verify production/expiry date laser printing, Arabic ingredient/allergen stickers, cold/dry container hygiene, and accredited Halal certificate validity prior to sealing.",
      },
      {
        q: "Can we book standalone container loading supervision in Mersin or Foshan?",
        a: "Yes. Even when you purchase directly from your own factories in Türkiye or China, we deploy an on-site inspector within 24–48 hours to supervise loading and seal the container.",
      },
    ],
  },
  {
    slug: "saudi-arabia",
    countryName: "Saudi Arabia",
    isoCode: "SA",
    regionBadge: "Vision 2030 · SABER / SASO Ready",
    nativeHubHref: "/en/ar",
    nativeHubLabel: "البوابة العربية (/en/ar)",
    metaTitle: "Sourcing & SABER QC for Saudi Arabia | Bdimexport",
    metaDesc: "Vision 2030 construction, hospitality & industrial sourcing across Türkiye and China with SABER/SASO pre-shipment inspection in 24-48h.",
    h1: "Vision 2030 Construction, Hospitality & Industrial Sourcing for Saudi Importers",
    lead: "Riyadh, Jeddah, and Dammam contractors and importers rely on Bdimexport to source verified Turkish and Chinese materials while preventing port holds through strict pre-shipment SABER / SASO and country-of-origin verification.",
    currency: "USD / SAR",
    customsRegime: "GCC Tariff Schedule + Mandatory SABER (PCoC & SCoC) / SFDA Registration",
    gateways: "Jeddah Islamic Port (6–10d ex-TR · 18–24d ex-CN), King Abdulaziz Port Dammam, Riyadh Dry Port",
    complianceStandards: [
      "SABER Product (PCoC) & Shipment Certificate of Conformity (SCoC) readiness + SAP Ariba vendor ID (BNO-100000188010374)",
      "Non-removable 'Made in Türkiye' / 'Made in China' marking & SASO plug/voltage check (220V/60Hz)",
      "SFDA & Halal documentation verification for food and agricultural cargo",
    ],
    comparisonRows: [
      { factor: "Sea Transit to Jeddah", trHub: "6–10 days via Suez Red Sea corridor", cnHub: "18–25 days ocean freight", bdimExecution: "Fast giga-project site replenishment & BOQ sourcing" },
      { factor: "Customs Clearance Risk", trHub: "SASO-familiar Turkish export factories", cnHub: "High volume—requires strict origin & voltage check", bdimExecution: "Physical inspection of permanent origin markings & SASO labels" },
      { factor: "Inspection Speed", trHub: "24–48h inspector in all Turkish provinces", cnHub: "24–48h inspector across China manufacturing hubs", bdimExecution: "Photo evidence ready for SABER conformity body review" },
    ],
    priorityProducts: [
      { slug: "marble", label: "Architectural Stone, Marble & Cladding", hsChapter: "HS 6802" },
      { slug: "steel", label: "Structural Steel, Rebar & MEP Supports", hsChapter: "HS 72-73" },
      { slug: "hvac-systems", label: "60Hz-Compatible HVAC & Chiller Units", hsChapter: "HS 8415" },
      { slug: "hospitality-furniture", label: "Hotel, Villa & Giga-Project FF&E", hsChapter: "HS 9403" },
      { slug: "pumps-valves", label: "Water Infrastructure Pumps & Valves", hsChapter: "HS 8481" },
    ],
    faq: [
      {
        q: "How do you prevent Saudi customs holds related to SABER and Country of Origin?",
        a: "Saudi ports strictly reject cargo lacking permanent country-of-origin markings or matching SABER documentation. During pre-shipment inspection, our engineers verify engraved/sewn/molded origin marks, 220V/60Hz UK-type BS 1363 plugs on electricals, Arabic manuals, and HS alignment before container sealing.",
      },
      {
        q: "How fast is Red Sea shipping from Türkiye to Jeddah?",
        a: "Container vessels from Mersin, Iskenderun, and Izmir reach Jeddah Islamic Port in just 6 to 10 days, making Türkiye one of the fastest heavy-material supply hubs for Saudi construction timelines.",
      },
      {
        q: "Can Bdimexport split a construction BOQ between Türkiye and China?",
        a: "Yes. We benchmark structural steel, natural stone, sanitaryware, cables, and bespoke joinery in Türkiye alongside lighting, electronics, and modular hardware in China under one unified RFQ and inspection schedule.",
      },
      {
        q: "Do you verify supplier financial and manufacturing legitimacy before LC or TT?",
        a: "Yes. Our 72-hour supplier due-diligence report verifies official commercial registry, factory ownership, production lines, and export history so Saudi buyers avoid unverified brokers.",
      },
      {
        q: "Is Arabic communication available for Saudi procurement teams?",
        a: "Yes. Visit bdimexport.com/en/ar for our Arabic RTL portal or submit your BOQ/RFQ directly below for a 24-hour response.",
      },
    ],
  },
] as const;

export function getMarketBySlug(slug: string): MarketCorridor | undefined {
  return MARKET_CORRIDORS.find((m) => m.slug === slug);
}
