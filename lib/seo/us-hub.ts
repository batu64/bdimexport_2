// United States Division (BDIMEXPORT LLC — Sheridan, Wyoming) SEO + GEO Cluster Database (/en/us & /en/us/[slug]).
// Targets high-intent US B2B commercial search queries across Google US (hreflang="en-US") and AI Answer Engines.

import type { RfqTrackId } from "@/lib/ui/SmartRfq";

export interface UsClusterPage {
  slug: string;
  track: RfqTrackId;
  eyebrow: string;
  metaTitle: string; // <= 60 chars
  metaDesc: string;  // 120-158 chars
  h1: string;
  lead: string;
  targetKeywords: string[];
  keyMetrics: { label: string; value: string }[];
  matrixTitle: string;
  matrixLead: string;
  matrixHeaders: [string, string, string, string];
  matrixRows: [string, string, string, string][];
  executionTitle: string;
  executionSteps: { code: string; title: string; detail: string }[];
  relatedProducts: { slug: string; label: string; note: string }[];
  faq: { q: string; a: string }[];
}

export const US_CLUSTER_PAGES: readonly UsClusterPage[] = [
  {
    slug: "china-plus-turkey-sourcing",
    track: "sourcing",
    eyebrow: "US TARIFF HEDGING · CHINA + TÜRKİYE DUAL-HUB",
    metaTitle: "China Plus One Sourcing via Turkey for US | Bdimexport",
    metaDesc: "Hedge US Section 301 tariffs without losing China tooling scale. BDIMEXPORT LLC (WY) manages factory sourcing, QC & freight across Türkiye and China.",
    h1: "China + Türkiye Dual-Hub Sourcing Partner for US Importers",
    lead: "American importers no longer have to choose blindly between high US Section 301 tariffs in China and unfamiliar suppliers elsewhere. Contracted domestically through BDIMEXPORT LLC (Sheridan, Wyoming), our on-ground engineering teams manage factory sourcing, production QC, and container dispatch across both China and Türkiye.",
    targetKeywords: [
      "China plus one sourcing Turkey",
      "Section 301 tariff alternative manufacturing",
      "Turkey vs China landed cost for US importers",
      "US-based overseas procurement partner",
    ],
    keyMetrics: [
      { label: "US Contracting Counterparty", value: "BDIMEXPORT LLC (Sheridan, WY) — W-9 Vendor Onboarding Ready" },
      { label: "US East Coast Ocean Transit", value: "16–22 Days ex-Türkiye · 28–36 Days ex-China" },
      { label: "Tariff Modeling Turnaround", value: "24h Preliminary Scope · 10-Digit US HTS Duty Comparison" },
      { label: "On-Site Quality & Seal Gate", value: "24–48h Inspector Dispatch Before 70% Balance Wire" },
    ],
    matrixTitle: "10-Digit HTS Landed-Cost Decision Matrix: China vs. Türkiye for US Buyers",
    matrixLead: "We model unit factory price, Section 301 / MFN duty impact, ocean freight to NY/NJ, Savannah, Houston, or LA, and working-capital cycle side by side.",
    matrixHeaders: ["Supply Chain Variable", "China Hub Execution", "Türkiye Hub Execution", "BDIMEXPORT LLC Advantage"],
    matrixRows: [
      ["US Customs Duty Exposure", "Base MFN + Section 301 surcharges (7.5%–25%+ on thousands of HTS lines)", "Standard US MFN tariff schedule (zero Section 301 surcharge)", "Unbiased SKU-by-SKU duty & landed-cost spreadsheet"],
      ["Transit to NY/NJ & Savannah", "28–36 days via Panama / Suez all-water", "16–22 days direct Mediterranean–Atlantic", "Cut safety-stock cash lockup by 2–3 weeks on East/Gulf Coasts"],
      ["Tooling vs. MOQ Agility", "Unmatched multi-cavity injection molds, electronics & high-SKU hardware", "Low-to-mid MOQ textiles, furniture, stone, metal, food & private label", "Split your BOM/catalog across the optimal hub under one contract"],
      ["Quality & Container Security", "On-site coastal & inland AQL + CTPAT bolt-seal verification", "81-province factory floor DUPRO + loading supervision", "One unified US-grade PDF inspection standard across both countries"],
    ],
    executionTitle: "How BDIMEXPORT LLC Operates as Your External Overseas Procurement Department",
    executionSteps: [
      { code: "US-01", title: "SKU & HTS Tariff Audit (24–48 Hours)", detail: "Send your current product list or BOM. We identify which SKUs save 10%–22% landed cost by moving to Türkiye and which SKUs should remain in tier-1 Chinese factories." },
      { code: "US-02", title: "Direct Factory Vetting & Sample Consolidation", detail: "We eliminate trading companies, verify factory business licenses and capacity, and ship consolidated comparison samples to your US office." },
      { code: "US-03", title: "Production QC, CTPAT Seal Proof & US Port Handover", detail: "Independent ISO 2859-1 AQL inspection, container moisture check, ISO 17712 bolt-seal photo proof, and clean ISF 10+2 / customs paperwork for your US customs broker." },
    ],
    relatedProducts: [
      { slug: "hospitality-furniture", label: "Hospitality & Commercial Furniture", note: "Avoid heavy China Section 301 furniture duties via Turkish contract mills" },
      { slug: "home-textiles", label: "Home Textiles, Towels & Bedding", note: "18-day East Coast replenishment + OEKO-TEX/GOTS compliance" },
      { slug: "cnc-machinery", label: "Machined Metal, Castings & Assemblies", note: "Dual-Hub precision metalwork & industrial components" },
    ],
    faq: [
      {
        q: "Why is Türkiye the strongest China-Plus-One manufacturing hub for US East Coast and Gulf importers?",
        a: "Unlike Southeast Asian assembly hubs that still depend on Chinese raw materials and 32–40 day transpacific/Suez transit to the US East Coast, Türkiye possesses vertically integrated steel, textile, stone, chemical, food, and furniture mills with 16–22 day direct ocean service into NY/NJ, Savannah, and Houston under standard US MFN duty rates.",
      },
      {
        q: "Does BDIMEXPORT LLC replace our China suppliers or manage both countries?",
        a: "We manage both. Many US clients keep high-cavity plastic tooling and electronics in China—where our China team audits factories and supervises container loading—while shifting tariff-heavy furniture, textiles, stone, and metal lines to verified Turkish factories.",
      },
      {
        q: "How does contracting with a Wyoming LLC protect our US company?",
        a: "Working with BDIMEXPORT LLC (Sheridan, WY) gives your finance and legal teams a US-registered counterparty, W-9 vendor documentation, USD invoicing, and transparent fee separation instead of wiring consulting retainers to unverified offshore agents.",
      },
      {
        q: "Do you handle US ISF (10+2) data and customs broker coordination?",
        a: "Yes. Prior to vessel departure, our export desk validates commercial invoices, packing lists, HS codes, Manufacturer ID (MID) details, ISPM-15 wood packaging marks, and timely Importer Security Filing (ISF 10+2) data for seamless US Customs (CBP) clearance.",
      },
      {
        q: "What is the minimum order size to work with BDIMEXPORT LLC?",
        a: "Standalone factory audits and container loading inspections have zero minimum order value. For turnkey Dual-Hub procurement partnerships, we typically support trial LCL pallet orders from $10,000 up to multi-container annual supply programs.",
      },
    ],
  },
  {
    slug: "turkey-sourcing-agent-for-us-companies",
    track: "sourcing",
    eyebrow: "US-BASED TURKEY SOURCING PARTNER · DIRECT MILLS",
    metaTitle: "Turkey Sourcing Agent for US Companies | Bdimexport",
    metaDesc: "US-registered BDIMEXPORT LLC connects American importers directly with verified Turkish manufacturers—zero middlemen, 24h RFQ, and on-site AQL inspection.",
    h1: "Turkey Sourcing Agent & Manufacturing Partner for US Companies",
    lead: "Source factory-direct from Türkiye's premier industrial zones (Istanbul, Bursa, Izmir, Denizli, Gaziantep, Kayseri, Konya) with a US-registered partner on your side and full-time Turkish engineers on the factory floor.",
    targetKeywords: [
      "Turkey sourcing agent for US companies",
      "Turkish manufacturers for US importers",
      "sourcing company in Turkey with US office",
      "private label manufacturing Turkey USA",
    ],
    keyMetrics: [
      { label: "On-Ground Reach in Türkiye", value: "All 81 Provinces & Organized Industrial Zones (OSB)" },
      { label: "Broker Elimination Policy", value: "Official Industrial Capacity Report (Kapasite Raporu) Verification" },
      { label: "Shortlist Delivery SLA", value: "3–5 Business Days with Itemized EXW / FOB / CIF Quotes" },
      { label: "US Legal Counterparty", value: "BDIMEXPORT LLC (30 N Gould St Ste N, Sheridan, WY 82801)" },
    ],
    matrixTitle: "DIY Alibaba/Trade-Show Hunting vs. BDIMEXPORT LLC On-Ground Procurement",
    matrixLead: "Most English-speaking websites claiming to be 'Turkish factories' online are actually export trading brokers adding 15%–30% margin.",
    matrixHeaders: ["Procurement Stage", "Unassisted US Buyer Risk", "BDIMEXPORT LLC Field Protocol", "Bottom-Line Impact"],
    matrixRows: [
      ["Supplier Discovery", "Export brokers & middlemen posing as factories", "Chamber registry + physical loom/CNC/kiln verification", "Save 12%–25% hidden trading-company markup"],
      ["Price & Payment Terms", "Inflated USD export quotes & rigid 100% upfront demands", "Local Turkish-language factory negotiation & staged milestones", "True domestic-tier ex-works cost structure"],
      ["Production Follow-Up", "8-hour timezone gap & delayed WhatsApp excuses", "Bi-weekly floor visits + inline DUPRO inspection at 30%", "Catch spec drift weeks before vessel cut-off"],
      ["Container Stuffing", "Short counts, damp pallets, or unbraced crates", "On-site engineer supervises loading & locks ISO 17712 seal", "Release balance payment only after visual proof"],
    ],
    executionTitle: "End-to-End Turkish Procurement Managed for American Teams",
    executionSteps: [
      { code: "TR-01", title: "Technical Spec Translation & Industrial Zone Matching", detail: "We convert your US specs (imperial/ASTM/UL/FDA/CPSIA) into Turkish production sheets and approach vetted OSB factories directly." },
      { code: "TR-02", title: "Side-by-Side Costing & Sample Consolidation", detail: "Receive 3–5 verified factory quotes with transparent cost breakdowns plus one consolidated DHL/FedEx sample box to your US address." },
      { code: "TR-03", title: "Contract Manufacturing, AQL QC & Ocean/Air Freight", detail: "From golden-sample sign-off to Mersin/Izmir/Ambarli container sealing and US port delivery." },
    ],
    relatedProducts: [
      { slug: "marble", label: "Turkish Marble, Travertine & Stone", note: "Quarry-direct blocks, slabs & cut-to-size tiles for US distributors" },
      { slug: "apparel", label: "Cut-and-Sew Apparel & Knitwear", note: "Fast seasonal turnaround & low pilot MOQs in Istanbul/Izmir" },
      { slug: "olive-oil", label: "Private Label Olive Oil & Specialty Foods", note: "FDA-registered Turkish mills with retail bottling" },
    ],
    faq: [
      {
        q: "How do you prove a Turkish supplier is a real manufacturer and not a trading broker?",
        a: "In Türkiye, genuine manufacturers hold an official Chamber of Industry Capacity Report (Sanayi Kapasite Raporu) listing their exact machinery count, annual output, engineer headcount, and factory address. Our local team verifies this document and visits the facility before shortlisting.",
      },
      {
        q: "Can BDIMEXPORT LLC translate US ASTM, FDA, or CPSIA standards for Turkish factories?",
        a: "Yes. Misunderstood US technical tolerances and labeling rules are the #1 cause of import delays. Our bilingual engineers translate your US drawings, packaging dielines, and lab test protocols into clear Turkish floor instructions.",
      },
      {
        q: "Which US ports have the fastest direct container service from Türkiye?",
        a: "Direct container services from Ambarli (Istanbul), Gemlik, Izmir, and Mersin reach New York/New Jersey, Norfolk, Charleston, and Savannah in 16–22 days, and Houston or Miami in 20–25 days.",
      },
      {
        q: "Do we pay the Turkish factory directly or pay BDIMEXPORT LLC?",
        a: "You choose. Many US mid-market importers pay factories directly while paying BDIMEXPORT LLC a transparent procurement/QC management fee in the US; others prefer single-vendor turnkey invoicing.",
      },
      {
        q: "Can you take over management of Turkish suppliers we already buy from?",
        a: "Yes. If you already import from Türkiye but struggle with late deliveries, quality drift, or communication gaps, our Turkish field team can step in as your local expediting and pre-shipment inspection arm.",
      },
    ],
  },
  {
    slug: "china-sourcing-and-procurement-partner",
    track: "sourcing",
    eyebrow: "US-LED CHINA PROCUREMENT · ZERO TRADING MARKUPS",
    metaTitle: "China Sourcing & Procurement Partner for US | Bdimexport",
    metaDesc: "US-registered BDIMEXPORT LLC manages direct China factory sourcing, tooling protection, AQL inspections, and Dual-Hub tariff alternatives for US companies.",
    h1: "China Sourcing, Tooling & Factory Management Partner for US Importers",
    lead: "Get factory-direct Chinese manufacturing across Guangdong, Zhejiang, Jiangsu, Shandong, and Fujian—managed under a US corporate relationship (BDIMEXPORT LLC) with strict anti-kickback governance and built-in Türkiye backup benchmarking.",
    targetKeywords: [
      "US-based China sourcing partner",
      "China procurement management for US companies",
      "direct factory sourcing China USA",
      "China contract manufacturing & QC partner",
    ],
    keyMetrics: [
      { label: "China Industrial Coverage", value: "Shenzhen, Dongguan, Ningbo, Yiwu, Suzhou, Qingdao, Xiamen & Inland Hubs" },
      { label: "Factory Verification", value: "USCC Business Scope, Export License & Physical Workshop Audit" },
      { label: "Anti-Kickback Governance", value: "Open-Book Factory Quotes — Zero Undisclosed Supplier Commissions" },
      { label: "Built-In Tariff Hedge", value: "Optional Türkiye Cost Comparison Included on Tariff-Hit SKUs" },
    ],
    matrixTitle: "Why US Importers Upgrade from Offshore Sourcing Agents to BDIMEXPORT LLC",
    matrixLead: "Commission-based offshore agents profit when factory prices go up and hide real manufacturer identities.",
    matrixHeaders: ["Governance Area", "Typical Commission Agent", "BDIMEXPORT LLC Open-Book Model", "US Buyer Protection"],
    matrixRows: [
      ["Supplier Transparency", "Hides real factory name behind Hong Kong shell", "Full USCC license, factory address & direct contact disclosure", "You own your supply chain relationship"],
      ["Tooling & IP Ownership", "Molds held hostage at unvetted workshops", "NNN / mold-ownership agreements before tooling deposit", "Prevent unauthorized Amazon/competitor knockoffs"],
      ["Quality Control", "Same agent who gets kickback 'inspects' goods", "Independent inspection protocol + photo/video AQL report", "Zero conflict of interest before 70% wire"],
      ["Tariff Resilience", "Locked 100% into China even when duties spike", "Dual-Hub capability to shift SKUs to Türkiye when needed", "Future-proof supply chain continuity"],
    ],
    executionTitle: "Structured China Procurement Workflow for US Brands & Wholesalers",
    executionSteps: [
      { code: "CN-01", title: "USCC Factory Due Diligence & Open-Book RFQ", detail: "We verify registered capital, manufacturing scope ('生产/制造' on Chinese business license), litigation records, and collect itemized RMB/USD factory quotes." },
      { code: "CN-02", title: "Golden Sample Lock & Inline DUPRO Audit", detail: "Sealed reference sample kept by our inspector; mid-production check catches finish, PCB, or packaging defects early." },
      { code: "CN-03", title: "Multi-Factory Consolidation & Container Loading QC", detail: "Combine LCL orders or supervise full 20GP/40HQ loading at Ningbo, Shenzhen, Shanghai, or Qingdao with CTPAT seal verification." },
    ],
    relatedProducts: [
      { slug: "kitchenware", label: "Kitchenware, Drinkware & Housewares", note: "High-volume tooling in China benchmarked against Turkish glass/steel" },
      { slug: "hvac-systems", label: "HVAC Components, Motors & Controls", note: "Sub-component sourcing + pre-shipment electrical testing" },
      { slug: "pumps-valves", label: "Valves, Castings & Industrial Hardware", note: "Material certificate & pressure-test verification on-site" },
    ],
    faq: [
      {
        q: "How do you verify whether a Chinese supplier is a factory or a trading company?",
        a: "Every Chinese enterprise has an 18-digit Unified Social Credit Code (USCC). We inspect the official Chinese-language business scope (经营范围): only companies explicitly licensed for manufacturing/production (生产/制造) with verified workshop equipment pass our filter.",
      },
      {
        q: "Do you take hidden kickbacks from Chinese factories?",
        a: "Never. Undisclosed factory kickbacks destroy quality accountability. BDIMEXPORT LLC operates on transparent, upfront fees agreed with your US team, passing 100% of negotiated factory price reductions directly to you.",
      },
      {
        q: "Can you consolidate orders from 3 or 4 Chinese suppliers into one container?",
        a: "Yes. For US e-commerce brands, wholesalers, and hospitality projects buying across multiple factories, we inspect each batch at origin and coordinate bonded/port consolidation into a single FCL container.",
      },
      {
        q: "What if US tariffs rise further on our Chinese product category?",
        a: "Because Bdimexport operates full engineering and sourcing teams in both China and Türkiye, we can immediately benchmark and transition affected SKUs to Turkish manufacturers without onboarding a second agency.",
      },
      {
        q: "How fast can we start a China or Dual-Hub sourcing project?",
        a: "Submit your product specs or target Alibaba/supplier links below; our desk responds with a written scope and fee proposal within 24 hours.",
      },
    ],
  },
  {
    slug: "pre-shipment-and-container-loading-inspection",
    track: "inspection",
    eyebrow: "24–48H INSPECTOR DISPATCH · CHINA & TÜRKİYE",
    metaTitle: "Container Loading & QC Inspection for US | Bdimexport",
    metaDesc: "Protect your 70% balance wire. 24-48h standalone factory AQL inspection & CTPAT container loading supervision in China and Türkiye via BDIMEXPORT LLC.",
    h1: "24–48h Pre-Shipment QC & Container Loading Supervision for US Importers",
    lead: "Already have your own suppliers in China or Türkiye? Never wire your 70% final balance blind. Deploy an independent Bdimexport engineer within 24–48 hours to run ISO 2859-1 AQL sampling, tally every master carton, and lock your container with CTPAT-compliant bolt-seal photo proof.",
    targetKeywords: [
      "container loading supervision China and Turkey",
      "pre-shipment inspection for US importers",
      "ISO 2859-1 AQL factory inspection",
      "CTPAT container seal verification",
    ],
    keyMetrics: [
      { label: "Dispatch Speed", value: "24–48 Hours Across All Major China & Türkiye Hubs" },
      { label: "Sampling Standard", value: "ANSI/ASQ Z1.4 / ISO 2859-1 (AQL Major 2.5 · Minor 4.0)" },
      { label: "Report Turnaround", value: "Same-Day WhatsApp Bay Alerts + Formal PDF Within 48h" },
      { label: "Pricing Structure", value: "Flat Per-Man-Day Fee — Zero % Tie to Cargo Value" },
    ],
    matrixTitle: "4 Inspection Gates Available as Standalone Bookings",
    matrixLead: "Book a single 1-day check for an urgent container or embed all four gates across an annual supply contract.",
    matrixHeaders: ["Inspection Type", "When Performed", "Core Verification Scope", "Risk Eliminated"],
    matrixRows: [
      ["Factory Audit (FA)", "Before paying 30% deposit", "Machinery, ISO certs, capacity, USCC/registry & social check", "Wire fraud, shell brokers & subcontracting"],
      ["Inline Inspection (DUPRO)", "20%–40% production complete", "Dimensions, materials, workmanship & packaging artwork", "Mass-batch defects & missed vessel cut-offs"],
      ["Pre-Shipment Inspection (PSI)", "80%–100% packed", "AQL random sampling, function/drop test, UPC/FNSKU scan", "Paying final 70% balance for defective goods"],
      ["Container Loading (CLS)", "Loading day at factory ramp", "7-point CTPAT container check, moisture, 100% tally & seal", "Short-shipped cartons, wet-container mold & pilferage"],
    ],
    executionTitle: "What Your US Operations Team Receives Before Releasing Wire Payment",
    executionSteps: [
      { code: "QC-01", title: "Custom Checklist Built Around Your PO & Spec Sheet", detail: "Your exact tolerances, Pantone/finish refs, Amazon FNSKU/GS1 barcodes, carton drop tests, and US Country-of-Origin marking rules." },
      { code: "QC-02", title: "7-Point CTPAT Container & Moisture Verification", detail: "Floor wood moisture meter check (<18%), light-leak roof test, odor/pest check, pallet ISPM-15 stamp check, and ISO 17712 bolt-seal verification." },
      { code: "QC-03", title: "Pass/Fail Executive PDF + High-Resolution Photo Archive", detail: "Timestamped photos of every defect, measurement caliper reading, loading row, and locked container door before you release funds." },
    ],
    relatedProducts: [
      { slug: "furniture", label: "Furniture & Cabinetry QC", note: "Moisture content, finish scratch, hardware & drop-test checks" },
      { slug: "ceramics", label: "Tile, Stone & Sanitaryware QC", note: "Shade lot consistency, flatness, thickness & crate bracing" },
      { slug: "denim", label: "Apparel & Denim AQL Inspection", note: "GSM weight, shrinkage report, stitch density & measurement spec" },
    ],
    faq: [
      {
        q: "Can we book an inspection even if BDIMEXPORT LLC did not source the supplier?",
        a: "Yes. Standalone pre-shipment and container loading supervision is one of our most popular services for US importers who already have established Chinese or Turkish factories and want independent verification before wiring balances.",
      },
      {
        q: "Do you check Amazon FBA FNSKU labels and US Country of Origin markings?",
        a: "Yes. US Customs (CBP) issues costly Marking Notices if cartons or units lack permanent 'Made in China' or 'Made in Türkiye' markings, and Amazon fulfillment centers reject unscannable FNSKU/carton labels. Our inspectors scan-test barcodes on-site.",
      },
      {
        q: "What is a 7-point CTPAT container inspection?",
        a: "Aligned with US Customs-Trade Partnership Against Terrorism (CTPAT) guidelines, our inspector examines the front wall, left side, right side, floor, ceiling/roof, inside/outside doors, and outside/undercarriage before loading, then documents the ISO 17712 high-security bolt seal number.",
      },
      {
        q: "What happens if the factory fails the pre-shipment inspection?",
        a: "You receive an immediate alert from the factory floor so you can withhold final balance payment, demand 100% sorting/rework by the supplier, and schedule a re-inspection at the supplier's expense.",
      },
      {
        q: "How many days' notice is required to book an inspector in China or Türkiye?",
        a: "48 to 72 hours' notice guarantees slot availability in major industrial hubs, with 24-hour rush dispatch available in Istanbul, Bursa, Izmir, Shenzhen, Dongguan, Ningbo, and Shanghai.",
      },
    ],
  },
  {
    slug: "hospitality-furniture-and-construction-sourcing",
    track: "sourcing",
    eyebrow: "US HOSPITALITY FF&E, STONE & CONSTRUCTION",
    metaTitle: "Hospitality FF&E & Stone Sourcing for US | Bdimexport",
    metaDesc: "Turnkey Turkish & Chinese hospitality furniture (FF&E), travertine/marble, ceramics, and millwork procurement for US developers, hotels, and distributors.",
    h1: "Hospitality FF&E, Natural Stone & Construction Procurement Partner for US Projects",
    lead: "US hotel developers, multifamily builders, stone wholesalers, and architectural contractors cut FF&E and stone budgets by 25%–45% through BDIMEXPORT LLC's Dual-Hub (Türkiye + China) project procurement and factory mock-up supervision.",
    targetKeywords: [
      "hospitality FF&E sourcing Turkey and China",
      "import travertine and marble from Turkey to USA",
      "commercial hotel furniture manufacturer for US",
      "overseas construction material procurement USA",
    ],
    keyMetrics: [
      { label: "Core Project Categories", value: "Casegoods, Seating, Marble/Travertine, Porcelain, Sanitaryware, Rugs & Lighting" },
      { label: "US Standards Coordinated", value: "CAL TB 117-2013, NFPA 701, UL/ETL Lighting, ANSI/BIFMA & ADA Specs" },
      { label: "Quarry & Factory QC", value: "Dry-Lay Stone Vein Approval + Full Hotel Room Mock-Up Audit" },
      { label: "US Port Coverage", value: "NY/NJ, Miami/Port Everglades, Savannah, Houston, LA/Long Beach" },
    ],
    matrixTitle: "Optimal Dual-Hub BOQ Split for US Hotel & Multifamily Developments",
    matrixLead: "Why top US FF&E purchasing groups split project Bills of Quantities (BOQ) between Türkiye and China under one QC team:",
    matrixHeaders: ["BOQ Package", "Recommended Hub", "Why It Wins for US Projects", "On-Site Inspection Focus"],
    matrixRows: [
      ["Marble, Travertine & Limestone", "Türkiye (Afyon, Denizli, Burdur, Mugla)", "World-renowned quarries, 0 Section 301 duty & 18d East Coast transit", "Dry-lay bookmatch photos, thickness tolerance & timber A-frame bracing"],
      ["Custom Casegoods & Upholstered Seating", "Türkiye (Inegol, Kayseri, Istanbul)", "Avoids heavy US China furniture tariffs; bespoke veneer & low room-count MOQs", "Kiln-dried wood moisture (8%–10%), CAL TB 117 foam & joinery load test"],
      ["Hospitality Carpets & Bath Linens", "Türkiye (Gaziantep & Denizli)", "High-tuft Wilton/Axminster corridor carpets & long-staple Turkish cotton", "Tuft density, NFPA 701 flame cert & GSM towel weight"],
      ["Decorative Lighting, Mirrors & Hardware", "China (Zhongshan / Foshan)", "Unmatched UL/ETL fixture component ecosystem & architectural metal finishes", "UL/ETL listing mark verification, hi-pot wiring test & drop-safe foam packing"],
    ],
    executionTitle: "Project Procurement From Shop Drawings to Job-Site Container Delivery",
    executionSteps: [
      { code: "FFE-01", title: "BOQ Line-Item Costing & Value Engineering", detail: "Upload your architectural schedule or BOQ; we return itemized factory-direct quotes across Türkiye and China with tariff-optimized origin allocation." },
      { code: "FFE-02", title: "Shop Drawings, Finish Submittals & Model-Room Sign-Off", detail: "Approve wood stains, stone vein dry-lays, brass finishes, and physical mock-up pieces before mass production begins." },
      { code: "FFE-03", title: "Sequenced Floor-by-Floor Container Loading & US Delivery", detail: "Containers packed and labeled by hotel floor/zone with full AQL and A-frame lashing inspection." },
    ],
    relatedProducts: [
      { slug: "hospitality-furniture", label: "Hotel Casegoods & Contract Seating", note: "Custom hospitality millwork & upholstery in Türkiye" },
      { slug: "marble", label: "Turkish Marble & Travertine Slabs/Tiles", note: "Quarry-direct selection + dry-lay inspection" },
      { slug: "sanitaryware", label: "Commercial Sanitaryware & Porcelain", note: "UPC/cUPC & project-grade ceramic lines" },
      { slug: "carpets-rugs", label: "Custom Hospitality & Area Rugs", note: "Gaziantep contract looms for hotels & retail" },
    ],
    faq: [
      {
        q: "How much do US hotel and multifamily projects save by sourcing casegoods and stone from Türkiye?",
        a: "Because Chinese wooden and upholstered furniture faces steep US Section 301 and trade-remedy tariffs whereas Turkish furniture and natural stone enter under standard MFN rates (0%–6.5% on most lines), US developers frequently save 25%–40% landed while cutting East/Gulf Coast transit in half.",
      },
      {
        q: "Can you inspect dry-lay marble slabs at Turkish quarries before crating?",
        a: "Yes. Our inspectors in Afyon, Denizli, Burdur, Izmir, and Bilecik verify slab grading, vein continuity, surface honing/polishing, epoxy backing quality, and fumigated ISPM-15 A-frame bundle lashing before containers are sealed.",
      },
      {
        q: "Do Turkish furniture factories meet US CAL TB 117-2013 and UL electrical rules?",
        a: "Yes. For built-in headboard power units and decorative lamps, we enforce UL/ETL-listed components, and for upholstered seating we verify CAL TB 117-2013 and NFPA 701 fire-retardant foam and fabric test certificates.",
      },
      {
        q: "Can stonewholesalers or tile distributors set up recurring monthly containers?",
        a: "Yes. Beyond single hospitality projects, BDIMEXPORT LLC manages recurring monthly container programs for US stone yards, tile distributors, and cabinet wholesalers.",
      },
      {
        q: "How do we submit an architectural BOQ or spec package?",
        a: "Initiate a request through Smart RFQ below with your project location and timeline; our engineering desk will share a secure upload link or email thread within 24 hours.",
      },
    ],
  },
  {
    slug: "textile-apparel-and-home-goods-manufacturing",
    track: "sourcing",
    eyebrow: "US APPAREL, HOME TEXTILES & CONSUMER BRANDS",
    metaTitle: "Turkish Textile & Apparel OEM for US Brands | Bdimexport",
    metaDesc: "Low-MOQ OEKO-TEX & GOTS Turkish towels, bedding, denim, apparel, and Dual-Hub housewares manufacturing managed for US D2C and retail brands.",
    h1: "Private Label Apparel, Home Textiles & Consumer Goods Manufacturing for US Brands",
    lead: "Scale your US retail, hospitality, or D2C brand with vertically integrated Turkish cotton, denim, knitwear, and housewares mills—backed by US LLC contracting, low pilot MOQs, and strict UFLPA-clean supply-chain traceability.",
    targetKeywords: [
      "Turkish towel manufacturer for US brands",
      "private label apparel manufacturing Turkey USA",
      "UFLPA compliant cotton sourcing Turkey",
      "home textiles & kitchenware OEM partner USA",
    ],
    keyMetrics: [
      { label: "Cotton & Yarn Traceability", value: "100% Non-Xinjiang Turkish Aegean Cotton · GOTS & OEKO-TEX Certified Mills" },
      { label: "Pilot MOQ Flexibility", value: "300–500 pcs Apparel · 500–1,000 pcs Home Textiles (SKU Dependent)" },
      { label: "Retail Readiness", value: "Custom Woven Labels, UPC/GS1 Hangtags, Polybags & Amazon FBA Cartons" },
      { label: "Quality Assurance", value: "GSM Weight, Shrinkage, Colorfastness & AQL 2.5 Garment Inspection" },
    ],
    matrixTitle: "Why US Apparel & Home Brands Pair Turkish Cotton Mills with Dual-Hub Hardgoods",
    matrixLead: "US Customs (CBP) detentions under UFLPA have made clean, documented cotton origin mandatory for American retailers.",
    matrixHeaders: ["Brand Requirement", "Turkish Textile Ecosystem", "Dual-Hub Hardgoods (TR + CN)", "US Retail Impact"],
    matrixRows: [
      ["UFLPA Cotton Origin Proof", "100% domestic Turkish Aegean / Better Cotton bale-to-yarn documentation", "N/A (non-cotton hardgoods)", "Zero CBP forced-labor detention risk at US ports"],
      ["Speed to Trend / Reorder", "4–6 week cut-and-sew production + 18d East Coast sea (or 3d air)", "Fast glass/ceramic/metalware runs in TR; complex molds in CN", "Replenish winning SKUs mid-season"],
      ["Certifications", "GOTS Organic, OEKO-TEX Standard 100, GRS Recycled, SEDEX/BSCI", "FDA food-contact, LFGB & prop-65 lab test coordination", "Pass US department-store & major retailer compliance"],
    ],
    executionTitle: "Tech-Pack to US 3PL Warehouse Execution",
    executionSteps: [
      { code: "TEX-01", title: "Tech-Pack Review, Fabric Swatching & Costing", detail: "Share your tech pack or physical benchmark garment/towel; we source matching Denizli/Bursa/Istanbul mills and send lab-dips and fabric headers." },
      { code: "TEX-02", title: "Proto / Pre-Production (PP) Sample & Trim Lock", detail: "Iterate fit, GSM weight, embroidery, custom retail boxes, and FTC fiber-content / RN# care labels." },
      { code: "TEX-03", title: "Inline Measurement Check & AQL 2.5 Final Inspection", detail: "Full garment measurement table audit, needle-detector verification where required, and moisture-safe carton loading." },
    ],
    relatedProducts: [
      { slug: "home-textiles", label: "Turkish Towels, Robes & Bedding", note: "Denizli long-staple cotton looms with custom jacquard/embroidery" },
      { slug: "apparel", label: "Knitwear, Activewear & Woven Apparel", note: "Low-MOQ private label production in Istanbul & Izmir" },
      { slug: "denim", label: "Premium Denim & Garment Washing", note: "Laser/ozone sustainable denim mills for US fashion labels" },
      { slug: "kitchenware", label: "Glassware, Cookware & Tabletop", note: "FDA-compliant Turkish glass, copper, steel & porcelain" },
    ],
    faq: [
      {
        q: "How does Turkish textile sourcing eliminate US UFLPA customs detention risks?",
        a: "US Customs and Border Protection strictly enforces the Uyghur Forced Labor Prevention Act (UFLPA) on cotton supply chains tied to restricted regions. Turkish mills spin domestically grown Aegean/Anatolian cotton or certified US cotton, providing clean bale-to-garment origin documentation.",
      },
      {
        q: "Do you verify US FTC Textile Labeling rules (RN number, fiber %, care symbols) before packing?",
        a: "Yes. Every US-bound apparel and home-textile order is checked against Federal Trade Commission (FTC) labeling rules—verifying exact fiber percentages, RN or importer company name, ASTM care symbols, and 'Made in Türkiye' labels prior to shipment.",
      },
      {
        q: "What are typical minimum order quantities (MOQs) in Denizli and Istanbul?",
        a: "Depending on yarn dyeing vs. piece dyeing, vetted export mills typically accept 300–500 pieces per style/color for apparel and 500–1,000 pieces for custom-branded towels, robes, or bedding sets.",
      },
      {
        q: "Can you ship retail-ready directly into our US 3PL or Amazon FBA fulfillment centers?",
        a: "Yes. Factories apply your exact UPC/FNSKU item barcodes, suffocation-warning polybags, master-carton weight limits (<50 lbs for FBA), and pallet labels, verified on-site by our inspector.",
      },
      {
        q: "How do we request fabric swatches and factory quotes?",
        a: "Submit your product category, target GSM/fabric spec, and target quantity via Smart RFQ below for a 24-hour scoping response.",
      },
    ],
  },
  {
    slug: "customs-hts-landed-cost-and-supplier-verification",
    track: "intelligence",
    eyebrow: "72H SUPPLIER DUE DILIGENCE & US HTS INTELLIGENCE",
    metaTitle: "Supplier Verification & US Landed Cost | Bdimexport",
    metaDesc: "Verify Chinese or Turkish suppliers before wiring a deposit and model exact 10-digit US HTS duties, Section 301 tariffs, and landed costs in 48-72 hours.",
    h1: "72-Hour Overseas Supplier Verification & US Landed-Cost Intelligence",
    lead: "Before wiring $25,000–$500,000 overseas or signing an exclusive manufacturing contract, commission an evidence-backed due-diligence and 10-digit US HTS landed-cost dossier from BDIMEXPORT LLC.",
    targetKeywords: [
      "verify Chinese supplier before paying deposit",
      "Turkish supplier due diligence report",
      "US HTS landed cost calculation service",
      "anti-fraud overseas factory verification",
    ],
    keyMetrics: [
      { label: "Dossier Delivery", value: "48–72 Hours (Executive PDF + Supporting Registry Extracts)" },
      { label: "Anti-Fraud Bank Check", value: "Proforma Invoice Beneficiary vs. Official Legal Entity Match" },
      { label: "Tariff Precision", value: "10-Digit US HTS + Section 301 + AD/CVD Anti-Dumping Screening" },
      { label: "Discreet Option", value: "Desktop Registry Audit Performed Without Alerting Target Supplier" },
    ],
    matrixTitle: "3 Fatal Overseas Import Traps Eliminated in 72 Hours",
    matrixLead: "One bad deposit wire or surprise US anti-dumping duty costs 50x more than pre-contract verification.",
    matrixHeaders: ["Risk Vector", "How US Buyers Get Burned", "72h Intelligence Verification", "Actionable Outcome"],
    matrixRows: [
      ["Wire & Beneficiary Fraud", "Proforma invoice lists offshore personal/shell account or hacked email", "Cross-check legal export entity, registered capital & official bank match", "Wire funds only to verified legal manufacturer"],
      ["AD/CVD & Section 301 Surprises", "Unexpected 25%–200%+ US Anti-Dumping / Countervailing or 301 duty at port", "Pre-order 10-digit HTS + CBP AD/CVD scope screening across CN & TR", "Know true per-unit landed cost to the penny"],
      ["Subcontracted 'Ghost' Factories", "Polished website hides tiny trading office with zero QC equipment", "Turkish Kapasite Raporu / Chinese USCC manufacturing license + litigation check", "Negotiate directly with real tier-1 production mills"],
    ],
    executionTitle: "What Is Inside Your 72-Hour Commercial Intelligence Dossier",
    executionSteps: [
      { code: "DD-01", title: "Official Corporate, Tax, Capacity & Litigation Extract", detail: "Direct verification against Turkish Trade Registry / Chamber of Industry records or Chinese SAMR/USCC & court-enforcement filings." },
      { code: "DD-02", title: "US CBP Duty, AD/CVD, FDA/UL & Landed-Cost Model", detail: "Complete unit-cost build-up: EXW/FOB, ocean freight, MPF (Merchandise Processing Fee), HMF (Harbor Maintenance Fee), MFN + 301 tariffs, and drayage." },
      { code: "DD-03", title: "Export Price Benchmark & 2–3 Backup Manufacturers", detail: "Market FOB price corridor check plus pre-vetted backup suppliers so your team never negotiates from weakness." },
    ],
    relatedProducts: [
      { slug: "steel", label: "Steel & Metal Products (AD/CVD Screening)", note: "Critical Section 232 & AD/CVD scope check before US import" },
      { slug: "olive-oil", label: "Food & Agricultural Imports (FDA/FSVP)", note: "FDA facility registration & US MFN tariff verification" },
      { slug: "cnc-machinery", label: "Industrial Capital Equipment", note: "Pre-deposit factory solvency & capacity verification" },
    ],
    faq: [
      {
        q: "Why must US importers screen for Anti-Dumping and Countervailing Duties (AD/CVD) before ordering?",
        a: "US Commerce and CBP enforce strict AD/CVD orders ranging from 15% to over 200% on specific steel, aluminum, quartz, ceramic, mattress, pipe, and chemical products depending on country of origin. Screening exact product scope across China and Türkiye before ordering prevents catastrophic port bills.",
      },
      {
        q: "Can you verify a supplier discreetly without letting them know?",
        a: "Yes. Our 48–72h corporate registry, manufacturing scope, litigation, and proforma bank-beneficiary check uses official records without contacting the factory. If you subsequently request a physical visit, we coordinate it only with your approval.",
      },
      {
        q: "Do you include US Merchandise Processing Fee (MPF) and Harbor Maintenance Fee (HMF) in landed-cost models?",
        a: "Yes. Every US ocean landed-cost model includes base HTS duty, applicable Section 301/232 tariffs, CBP Merchandise Processing Fee (0.3464% within min/max caps), Harbor Maintenance Fee (0.125%), marine insurance, and port/drayage estimates.",
      },
      {
        q: "What do we need to send to start a 72-hour supplier check?",
        a: "Simply share the supplier's legal name (or website/proforma invoice) and product description via Smart RFQ below.",
      },
      {
        q: "Is the intelligence report fee creditable if we proceed with full sourcing or inspection?",
        a: "Yes. When you engage BDIMEXPORT LLC for turnkey procurement or recurring container inspections on that project, your initial supplier verification report can be credited toward the program.",
      },
    ],
  },
] as const;

export function getUsClusterBySlug(slug: string): UsClusterPage | undefined {
  return US_CLUSTER_PAGES.find((p) => p.slug === slug);
}
