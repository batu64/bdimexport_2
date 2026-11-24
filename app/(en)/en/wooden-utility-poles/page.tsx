// /en/wooden-utility-poles — Factory-Direct Wooden Electric & Telecom Utility Poles Export Funnel for Africa
// Primary Corridors: Senegal (Dakar — SENELEC/ASER) & Mozambique (Maputo, Beira, Nacala — EDM/FUNAE) + West, East & Southern Africa.
// Zero Brokers · Official WhatsApp Desk Only: +90 539 414 78 54 (lib/ui/entities.ts).
import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, Factory, Globe, MessageCircle, ShieldCheck } from "lucide-react";
import Hero from "@/lib/ui/Hero";
import StatBand from "@/lib/ui/StatBand";
import { Section, SectionHeader } from "@/lib/ui/Section";
import UtilityPoleFunnel, { PoleHeroVideoShowcase, type UtilityPoleFunnelCopy } from "@/lib/ui/UtilityPoleFunnel";
import Reveal from "@/lib/ui/motion/Reveal";
import { CORPORATE_ENTITIES, OFFICIAL_PHONE, OFFICIAL_WHATSAPP_WA, SAP_ARIBA_ID, SAP_ARIBA_PROFILE_URL, US_DUNS_NUMBER } from "@/lib/ui/entities";
import { enAlternates } from "../_lib/hreflang";
import { SeoJsonLd, SITE_URL, buildProductFunnelGraph, defaultOpenGraph } from "@/lib/seo/schema";
import ps from "@/lib/seo/proposal.module.css";
import up from "@/lib/ui/utilitypole.module.css";

const PAGE_PATH = "wooden-utility-poles";
const PAGE_URL = `${SITE_URL}/en/${PAGE_PATH}`;
const OG_IMG = `${SITE_URL}/media/poles/wooden-utility-poles-og.webp`;

// ≤ 60 chars (58 chars) & 120–158 chars (154 chars) SEO_PLAYBOOK §3 compliant
const META_TITLE = "Wooden Utility Poles Factory Export to Africa | Bdimexport";
const META_DESC =
  "Factory-direct 7m-12m autoclave wooden utility and telecom poles from Türkiye to Senegal (Dakar), Mozambique (Maputo/Beira) and Africa. 140x 9m per 40'HC.";

export const metadata: Metadata = {
  title: { absolute: META_TITLE },
  description: META_DESC,
  alternates: enAlternates(PAGE_PATH),
  ...defaultOpenGraph({
    title: META_TITLE,
    description: META_DESC,
    url: PAGE_URL,
    locale: "en_US",
    image: OG_IMG,
  }),
};

const CORRIDORS_EN = [
  {
    id: "senegal",
    priority: true,
    badge: "Priority Hub #1 — West Africa Gateway",
    transit: "10–14 Days Direct Sea Liner to Dakar",
    title: "Senegal & UEMOA Corridor: Direct Container Supply to Port of Dakar",
    desc: "Factory-direct 7m–12m vacuum-pressure impregnated wooden poles engineered for SENELEC LV/MV grid extensions, ASER rural electrification concessions, fiber-optic/telecom backhaul contractors, and overland transit from Dakar into Mali, The Gambia, Guinea-Bissau, and Mauritania — complete with BSC/CTN, Phytosanitary, and Autoclave Charge Certification.",
    ports: ["Port of Dakar (Senegal)", "Bamako Transit Corridor", "Banjul / Bissau / Nouakchott"],
    cta: "Get Factory CIF Dakar Quote on WhatsApp",
    waText:
      "Hello Bdimexport Factory Desk, we request a direct factory CIF Port of Dakar (Senegal) quotation for autoclave-impregnated wooden utility poles (9m export brown — 140 pcs per 40' HC container).",
  },
  {
    id: "mozambique",
    priority: true,
    badge: "Priority Hub #2 — Southern & East Africa",
    transit: "Containerized Delivery to Maputo · Beira · Nacala",
    title: "Mozambique & Hinterland: EDM, FUNAE & Cyclone-Resilient Grid Supply",
    desc: "High-retention (16 kg/m³ dry salt, ≥10.5 kg/cm² autoclave pressure) utility poles built to withstand tropical humidity, subterranean termites, and coastal storm winds across Mozambique. Shipped in sealed 40' HC containers to Maputo, Beira, and Nacala for EDM distribution contractors, FUNAE rural energy tenders, and Malawi/Zambia/Zimbabwe corridors.",
    ports: ["Port of Maputo", "Port of Beira", "Port of Nacala", "Malawi / Zambia Rail Corridor"],
    cta: "Get Factory CIF Maputo / Beira / Nacala Quote",
    waText:
      "Hello Bdimexport Factory Desk, we request a direct factory CIF Maputo / Beira / Nacala (Mozambique) quotation for wooden electric distribution poles with full autoclave treatment certificates.",
  },
  {
    id: "west-central-africa",
    priority: false,
    badge: "Gulf of Guinea & Atlantic Africa",
    transit: "14–20 Days Containerized Liner",
    title: "Côte d'Ivoire, Ghana, Nigeria, Cameroon & Angola EPC Projects",
    desc: "Zero-middleman factory pricing for utility contractors supplying CI-ENERGIES, ECG Ghana, REA Nigeria, ENEO Cameroon, and ENDE Angola. Every 40' HC container is chalk-tallied pole-by-pole before customs bolt-sealing, with BESC/ECTN/CNCA and SGS/BV pre-shipment inspection readiness.",
    ports: ["Abidjan", "Tema", "Lomé / Cotonou", "Lagos / Douala / Luanda"],
    cta: "Request CIF West & Central Africa Pricing",
    waText:
      "Hello Bdimexport Factory Desk, please share factory-direct FOB/CIF container pricing for wooden utility poles to West/Central Africa.",
  },
  {
    id: "east-africa",
    priority: false,
    badge: "Indian Ocean & Horn of Africa",
    transit: "12–18 Days via Suez / Red Sea",
    title: "Kenya, Tanzania, Djibouti & Regional Rural Electrification Tenders",
    desc: "Eliminate regional plantation diameter bottlenecks and unseasoned-pole splitting risks. Our integrated Turkish plant kiln/air-seasons timber to ≤25% moisture prior to full-cell vacuum-pressure impregnation, delivering uniform taper and 40–50+ year field durability.",
    ports: ["Mombasa (Kenya)", "Dar es Salaam (Tanzania)", "Port of Djibouti"],
    cta: "Request CIF Mombasa / Dar es Salaam Quote",
    waText:
      "Hello Bdimexport Factory Desk, please send factory-direct CIF Mombasa / Dar es Salaam pricing and technical specs for 7m–12m wooden utility poles.",
  },
] as const;

const GALLERY_EN = [
  {
    src: "/media/poles/container-loading-telehandler.webp",
    tag: "Direct 40' HC Container Stuffing",
    title: "Manitou Telehandler Loading 9m Brown Poles Directly at Our Integrated Plant",
    sub: "Specialized hydraulic log-grapple handling loads full-length 9m utility poles straight into 40' High Cube containers without surface damage.",
  },
  {
    src: "/media/poles/container-140-poles-tally.webp",
    tag: "Verified 140 pcs / 40' HC",
    title: "Chalk-Numbered 140 × 9m Export Poles Packed Inside a Single 40' HC Container",
    sub: "Every single pole is individually chalk-marked and photographed inside the container prior to door closure and customs bolt-sealing.",
  },
  {
    src: "/media/poles/factory-yard-autoclave-stock.webp",
    tag: "Integrated Plant — Zero Brokers",
    title: "Plant Yard Overview: Raw Debarked Timber, Autoclave Rail & Cured Export Stock",
    sub: "Raw pine poles on the right, autoclave rail transfer track in the center, and cured brown & green utility poles ready for container dispatch.",
  },
  {
    src: "/media/poles/brown-9m-utility-poles-closeup.webp",
    tag: "Export-Standard Brown Treatment",
    title: "Smooth Lathe-Peeled 9m Brown Vacuum-Pressure Impregnated Utility Poles",
    sub: "Uniform taper (Ø12–14 cm top, Ø22–23 cm butt) engineered for international overhead power distribution and telecom lines.",
  },
  {
    src: "/media/poles/brown-poles-autoclave-rail.webp",
    tag: "Multi-Container Tender Stock",
    title: "High-Volume 9m Brown Pole Inventory Staged Along the Autoclave Track",
    sub: "Continuous kiln and autoclave cycle capacity supporting multi-container African rural electrification and telecom rollout schedules.",
  },
  {
    src: "/media/poles/export-container-dispatch-yard.webp",
    tag: "Port-Direct Export Fleet",
    title: "Multi-Container Factory Dispatch to Turkish Deep-Sea Ports",
    sub: "Direct factory-to-vessel container logistics connecting weekly sailings to Dakar, Maputo, Beira, Nacala, Abidjan, Tema, and Mombasa.",
  },
] as const;

const AUTOCLAVE_STEPS_EN = [
  {
    num: "01 · Pre-Seasoning",
    title: "Moisture Strictly ≤ 25%",
    val: "Poles are seasoned (with steam kiln capability down to 10–12% and strict ≤25% pre-autoclave ceiling) to prevent post-installation checking and guarantee deep preservative uptake.",
  },
  {
    num: "02 · Initial Vacuum",
    title: "60 Min @ 63.5 cmHg",
    val: "Full 60-minute initial vacuum stage evacuates air and sap from sapwood cells (held for the full 60 minutes even if 63.5 cmHg is reached earlier).",
  },
  {
    num: "03 · Flooding & Pressure",
    title: "≥ 10.5 kg/cm² Hydraulic Pressure",
    val: "The sealed autoclave cylinder is flooded under vacuum and pressurized to ≥10.5 kg/cm² (~150 psi) until target preservative absorption is locked into the timber.",
  },
  {
    num: "04 · Retention & Penetration",
    title: "16 kg/m³ Dry Salt · ≥75% Sapwood",
    val: "3.5% solution concentration (350 L/m³ = 16 kg/m³ dry salt retention) below 30 °C achieves ≥75% sapwood (≥20–40 mm) penetration, followed by a 15-minute final vacuum.",
  },
] as const;

const FUNNEL_COPY_EN: UtilityPoleFunnelCopy = {
  eyebrow: "Direct Factory Export Desk · 24h Proforma Quotation",
  title: "Calculate Container Capacity & Request Factory-Direct CIF/FOB Pricing",
  lead: "Select your pole length, autoclave treatment, container volume, and African destination port (Senegal, Mozambique, or regional hub). Send your technical RFQ directly to our factory export desk on WhatsApp — zero brokers or trading markups.",
  step1Label: "1. Select Utility Pole Length & Autoclave Treatment Specification",
  specs: [
    {
      id: "9m-brown",
      title: "9.0m Export Brown Utility Pole (Most Exported)",
      tag: "140 pcs / 40' HC",
      meta: "Top Ø12–14 cm · Butt Ø22–23 cm · International standard brown vacuum-pressure impregnation",
      polesPerContainer: 140,
      treatmentNote: "Export Brown (≤9m) or Green",
    },
    {
      id: "7m-8m-lv-telecom",
      title: "7.0m / 8.0m LV Distribution & Telecom Pole",
      tag: "~175 pcs / 40' HC",
      meta: "Available in Export Brown or Green · Ideal for rural last-mile LV lines & fiber-optic networks",
      polesPerContainer: 175,
      treatmentNote: "Export Brown or Green Autoclave",
    },
    {
      id: "10m-12m-green-mv",
      title: "10m / 11m / 12m Heavy-Duty MV Grid Pole",
      tag: "~95 pcs / 40' HC",
      meta: "Medium-voltage feeders & road crossings · Supplied exclusively in Green Autoclave Impregnation (>9m)",
      polesPerContainer: 95,
      treatmentNote: "Green Autoclave Only (>9m rule)",
    },
    {
      id: "mixed-tender-boq",
      title: "Mixed Tender BOQ (7m – 12m Utility Schedule)",
      tag: "Custom Tender Lot",
      meta: "Staged container shipments matched to World Bank / AfDB / National Utility BOQ schedules",
      polesPerContainer: 140,
      treatmentNote: "Matched to Tender BOQ",
    },
  ],
  step2Label: "2. Select Order Volume (40' High Cube Containers)",
  volumes: [
    { id: "1x40hc", label: "1 × 40' HC (Trial / Urgent Lot)", containers: 1 },
    { id: "3x40hc", label: "2 – 5 × 40' HC (Contractor Stock)", containers: 3 },
    { id: "8x40hc", label: "5 – 10 × 40' HC (Grid Rollout)", containers: 8 },
    { id: "20x40hc", label: "10+ Containers / Annual Utility Tender", containers: 20 },
  ],
  incotermLabel: "3. Preferred Delivery Term (Incoterms 2020)",
  incoterms: ["CIF Destination Port", "CFR Destination Port", "FOB Turkish Port", "EXW Factory Gate"],
  step3Label: "4. Target African Destination Port (Senegal & Mozambique Priority)",
  destinations: [
    { id: "senegal-dakar", label: "Senegal — Port of Dakar", portSummary: "Port of Dakar (10–14d Sea Transit)" },
    { id: "mozambique-maputo-beira", label: "Mozambique — Maputo / Beira / Nacala", portSummary: "Maputo / Beira / Nacala Ports" },
    { id: "west-africa-abidjan-tema", label: "Côte d'Ivoire / Ghana (Abidjan · Tema)", portSummary: "Abidjan / Tema / Lomé" },
    { id: "east-africa-mombasa-dar", label: "Kenya / Tanzania (Mombasa · Dar)", portSummary: "Mombasa / Dar es Salaam" },
    { id: "nigeria-angola-cameroon", label: "Nigeria / Cameroon / Angola", portSummary: "Lagos / Douala / Luanda" },
    { id: "other-africa", label: "Other African / Global Port", portSummary: "Specify port in field below" },
  ],
  calcLabels: {
    estimatedLoad: "Estimated Total Quantity",
    polesUnit: "utility poles",
    treatmentRule: "Autoclave Treatment",
    selectedPort: "Target Discharge Port",
  },
  fields: {
    companyLabel: "Company / EPC Contractor / Utility Authority",
    companyPlaceholder: "e.g. Grid EPC Ltd — Dakar / Maputo",
    whatsappLabel: "Direct WhatsApp Number (with Country Code)",
    whatsappPlaceholder: "+221 ... / +258 ...",
    emailLabel: "Corporate Email (for Formal PDF Proforma Invoice)",
    emailPlaceholder: "procurement@company.com",
    portCustomLabel: "Specific Discharge Port or Final Inland City (Optional)",
    portCustomPlaceholder: "e.g. Dakar, Beira, Nacala, Maputo, Bamako, Lilongwe...",
    notesLabel: "Technical Standard, Taper Class, Tender Reference or Payment Terms (LC / TT)",
    notesPlaceholder: "Share required pole lengths, top/butt diameters, BS 1990 / EN 14229 / SANS 754 spec, or tender deadline...",
  },
  briefHeader: "Ready-to-Send Factory RFQ Summary",
  slaBadge: "Written Factory Quote in 24h",
  briefLabels: {
    header: "[DIRECT FACTORY RFQ — WOODEN UTILITY POLES · BDIMEXPORT]",
    spec: "Pole Specification",
    volume: "Container Volume",
    estimatedQty: "Estimated Pole Count",
    incoterm: "Incoterm",
    destination: "Destination Corridor",
    company: "Buyer / EPC Company",
    whatsapp: "WhatsApp Contact",
    email: "Corporate Email",
    notes: "Technical / Tender Notes",
  },
  whatsappCta: "Send RFQ Instantly to Factory WhatsApp",
  emailCta: "Request Formal PDF Proforma via Email",
  copyCta: "Copy Technical RFQ",
  copiedCta: "Copied to Clipboard",
  emailSubject: "Factory-Direct Wooden Utility Poles RFQ",
  directFactoryGuarantee: "Direct Factory Production & Export (Zero Middlemen)",
  submittedMsg: "Your inquiry has been logged with our Factory Export Desk.",
};

const FAQ_EN = [
  {
    q: "Are you the direct wooden pole manufacturer or an intermediary trading broker?",
    a: "You buy factory-direct without middlemen. Production, kiln/air seasoning, CNC peeling, high-pressure vacuum autoclave impregnation, and 40' HC container stuffing take place directly at our integrated facility in Türkiye under BD Sanayi İthalat İhracat Şirketi, with optional USD/US-entity contracting via BDIMEXPORT LLC (Sheridan, Wyoming, USA) for international EPCs and donor-funded tenders.",
  },
  {
    q: "How many 9-meter wooden utility poles fit inside one 40' High Cube container?",
    a: "Exactly 140 export-standard 9.0m wooden utility poles (Ø12–14 cm top diameter, Ø22–23 cm butt diameter) load into a single 40' High Cube container. Every pole is chalk-marked, tallied, and photographed inside the container before customs bolt-sealing.",
  },
  {
    q: "Why is Brown impregnation offered up to 9 meters while Green impregnation covers 7m to 12m?",
    a: "International utility buyers across Africa strongly prefer brown vacuum-pressure impregnated poles. Our dedicated brown-treatment autoclave cylinder accommodates lengths up to 9.0 meters maximum (7m, 8m, and 9m). For longer medium-voltage poles (10m, 11m, and 12m), our longer green-treatment autoclave cylinder provides full-length impregnation with identical pressure (≥10.5 kg/cm²) and preservative retention.",
  },
  {
    q: "How do your poles resist subterranean termites and tropical rot in Senegal and Mozambique?",
    a: "Unlike brush-on or dip-treated timber, every charge undergoes a strict full-cell vacuum-pressure cycle: ≤25% initial moisture, 60-minute initial vacuum at 63.5 cmHg, cylinder flooding under vacuum, ≥10.5 kg/cm² hydraulic pressure at 3.5% concentration (350 L/m³ = 16 kg/m³ dry salt retention), and ≥75% sapwood (≥20–40 mm) penetration — delivering 40–50+ years of resistance against termites, fungi, and coastal humidity.",
  },
  {
    q: "What sea transit times and export certificates do you provide for Dakar, Maputo, Beira, and Nacala?",
    a: "Container sailings from Turkish ports reach Port of Dakar (Senegal) in 10–14 days and Maputo, Beira, or Nacala (Mozambique) in 18–24 days. Each shipment includes Commercial Invoice, Chalk-Numbered Packing List, Bill of Lading, Phytosanitary Certificate, Certificate of Origin, ISO 9001/14001 & Autoclave Charge Batch Report, plus full support for BSC/CTN (Senegal), CNCA (Mozambique), ECTN/BESC, and independent SGS/Bureau Veritas inspection.",
  },
  {
    q: "Can we contract via a US legal entity or documentary Letter of Credit (LC) for utility tenders?",
    a: "Yes. Depending on your project structure, you can contract directly with our Turkish manufacturing exporter (BD Sanayi İthalat İhracat Şirketi) or our US-registered entity (BDIMEXPORT LLC, Wyoming · Dun & Bradstreet D-U-N-S® #: 14-977-6743 · SAP Business Network / SAP Ariba ID: BNO-100000188010374) for World Bank, AfDB, or corporate ERP procurement governance.",
  },
];

export default function EnWoodenUtilityPolesPage() {
  const graph = buildProductFunnelGraph({
    url: PAGE_URL,
    inLanguage: "en",
    title: META_TITLE,
    description: META_DESC,
    productName: "Factory-Direct Autoclave-Impregnated Wooden Utility & Telecom Poles (7m – 12m)",
    sku: "BDIM-POLE-AFRICA-7M-12M",
    category: "Wooden Electric & Telecom Utility Poles (HS 4403.11 / 4403.21)",
    image: OG_IMG,
    areaServed: ["SN", "MZ", "GH", "CI", "KE", "TZ", "NG", "ZA", "LY", "JO"],
    crumbs: [
      { name: "Global Home", url: `${SITE_URL}/en` },
      { name: "Products", url: `${SITE_URL}/en/products` },
      { name: "Wooden Utility & Telecom Poles (Direct Factory)", url: PAGE_URL },
    ],
    faq: FAQ_EN,
  });

  const directWaHero = `${OFFICIAL_WHATSAPP_WA}?text=${encodeURIComponent(
    "Hello Bdimexport Factory Desk, we are inquiring about factory-direct wooden electric/telecom utility poles (7m–12m) for Africa (Senegal / Mozambique). Please share CIF container pricing.",
  )}`;

  const stats = [
    { value: 140, label: "9m Export Poles Loaded per 40' HC Container" },
    { value: 10.5, decimals: 1, unit: " kg/cm²", label: "Hydraulic Vacuum-Pressure Autoclave Cycle" },
    { value: 16, unit: " kg/m³", label: "Dry Salt Retention Against Termites & Decay" },
    { value: 24, unit: "h", label: "Factory-Direct CIF / FOB Proforma Turnaround" },
  ];

  return (
    <main>
      <SeoJsonLd graph={graph} />

      <div className={up.langBar}>
        <div className={`container ${up.langBarInner}`}>
          <span className={up.factoryBadge}>
            <Factory aria-hidden="true" className={up.badgeIcon} />
            <span>100% Direct Integrated Factory in Türkiye — Zero Trading Brokers · Priority Shipping to Senegal &amp; Mozambique</span>
          </span>
          <Link
            id="cta-pole-en-switch-ar"
            href="/en/ar/wooden-utility-poles"
            lang="ar"
            hrefLang="ar"
            className={up.langSwitchLink}
            data-clarity-event="pole_en_switch_to_ar"
          >
            <Globe aria-hidden="true" className={up.badgeIcon} />
            <span>النسخة العربية (ليبيا · الأردن · الشرق الأوسط)</span>
          </Link>
        </div>
      </div>

      <Hero
        id="poles-en-hero"
        eyebrow="Factory-Direct Export (Zero Middlemen) · Senegal (Dakar) · Mozambique (Maputo / Beira / Nacala) & Sub-Saharan Africa"
        title="Autoclave-Impregnated Wooden Electric & Telecom Poles — Shipped Direct from Our Integrated Plant"
        subtitle="Source 7m to 12m lathe-turned, vacuum-pressure impregnated wooden utility poles directly from our production line in Türkiye. Verified 140 × 9m poles per 40' HC container, engineered with 16 kg/m³ dry salt retention for 40–50+ year tropical termite and grid durability."
        primary={{
          id: "cta-pole-en-hero-calc",
          label: "Calculate Containers & Get Factory Quote",
          href: "#rfq",
          clarityEvent: "pole_en_hero_scroll_calc",
        }}
        secondary={{
          id: "cta-pole-en-hero-wa",
          label: "Chat with Factory Desk on WhatsApp",
          href: directWaHero,
          clarityEvent: "pole_en_hero_whatsapp",
          clarityUpgrade: "pole_en_hero_wa_lead",
        }}
        trust={[
          "Direct Manufacturer Pricing (EXW / FOB Türkiye / CIF Dakar, Maputo, Beira, Nacala, Abidjan, Mombasa)",
          "Export Brown Impregnation (7m–9m) & Heavy-Duty Green Impregnation (7m–12m) · ≥10.5 kg/cm² Autoclave",
          "Chalk-Numbered 140 Poles / 40' HC Photo Tally + Phytosanitary, Origin & SGS/ECTN/CNCA Readiness",
        ]}
        visual={
          <PoleHeroVideoShowcase
            liveBadge="Real Factory Yard Footage — 9m Container Stuffing"
            posterAlt="Manitou telehandler loading 9m brown wooden utility poles into a 40ft container at Bdimexport plant"
            specs={[
              { val: "7m – 12m", label: "LV, MV & Telecom Distribution Lengths" },
              { val: "140 / 40' HC", label: "Verified 9m Brown Container Load" },
              { val: "+90 539 414 78 54", label: "Official Factory WhatsApp Desk" },
            ]}
          />
        }
      />

      <StatBand items={stats} label="Factory Manufacturing & Export Benchmarks" locale="en" />

      <Section id="africa-corridors">
        <Reveal>
          <SectionHeader
            id="africa-corridors"
            eyebrow="African Electrification & Telecom Export Corridors"
            title="Purpose-Built Container Logistics for Senegal, Mozambique & Sub-Saharan Grid Contractors"
            lead="Whether you are executing SENELEC/ASER concessions through Dakar, EDM/FUNAE grid rebuilds via Maputo, Beira, and Nacala, or multi-country EPC tenders, our Turkish plant delivers faster sea transit and strict kiln-dried autoclave quality."
          />
        </Reveal>

        <div className={up.corridorGrid}>
          {CORRIDORS_EN.map((c) => (
            <article key={c.id} className={`${up.corridorCard} ${c.priority ? up.corridorPriority : ""}`}>
              <div className={up.corridorTop}>
                <div className={up.corridorTagRow}>
                  <span className={`${up.corridorBadge} ${c.priority ? up.corridorBadgeGold : ""}`}>{c.badge}</span>
                  <span className={up.corridorTransit}>{c.transit}</span>
                </div>
                <h3 className={up.corridorTitle}>{c.title}</h3>
                <p className={up.corridorDesc}>{c.desc}</p>
                <ul className={up.portList} aria-label="Target discharge ports">
                  {c.ports.map((p) => (
                    <li key={p} className={up.portChip}>{p}</li>
                  ))}
                </ul>
              </div>
              <a
                id={`cta-pole-en-corridor-${c.id}`}
                href={`${OFFICIAL_WHATSAPP_WA}?text=${encodeURIComponent(c.waText)}`}
                target="_blank"
                rel="noopener noreferrer"
                className={`${up.corridorWaLink} ${c.priority ? up.corridorWaPriority : ""}`}
                data-clarity-event={`pole_en_corridor_wa_${c.id}`}
                data-clarity-upgrade={`pole_en_${c.id}_wa_lead`}
                data-clarity-tag={`pole_corridor:${c.id}`}
              >
                <MessageCircle aria-hidden="true" className={up.btnIcon} />
                <span>{c.cta}</span>
                <ArrowRight aria-hidden="true" className={up.dirArrow} />
              </a>
            </article>
          ))}
        </div>
      </Section>

      <Section id="factory-proof" tone="alt">
        <Reveal>
          <SectionHeader
            id="factory-proof"
            eyebrow="Authentic Plant & Container Loading Evidence"
            title="Inside Our Integrated Timber Yard, Autoclave Line & 40' HC Container Stuffing"
            lead="Zero stock imagery. Every photograph below shows actual raw timber staging, vacuum-pressure impregnated 9m export stacks, and chalk-tallied 40' High Cube container loading at our facility."
          />
        </Reveal>

        <div className={up.galleryGrid}>
          {GALLERY_EN.map((img, idx) => (
            <figure
              key={img.src}
              id={`pole-en-gallery-${idx + 1}`}
              className={up.galleryCard}
              data-clarity-event={`pole_en_gallery_${idx + 1}`}
            >
              <div className={up.galleryImgWrap}>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={img.src} alt={img.title} className={up.galleryImg} loading="lazy" decoding="async" />
                <span className={up.galleryTag}>{img.tag}</span>
              </div>
              <figcaption className={up.galleryCaption}>
                <strong className={up.galleryTitle}>{img.title}</strong>
                <span className={up.gallerySub}>{img.sub}</span>
              </figcaption>
            </figure>
          ))}
        </div>
      </Section>

      <Section id="pole-dimensions">
        <Reveal>
          <SectionHeader
            id="pole-dimensions"
            eyebrow="Dimensional Schedule & Container Stuffing Matrix"
            title="7m – 12m Wooden Utility & Telecom Pole Specifications"
            lead="Manufactured from selected straight-grain pine timber, machine-peeled to uniform taper, seasoned prior to treatment, and pressure-impregnated for overhead LV/MV electrical and telecom lines."
          />
        </Reveal>

        <div className={ps.tableWrap}>
          <table className={ps.table}>
            <thead>
              <tr>
                <th>Pole Length</th>
                <th>Top Diameter (Tip)</th>
                <th>Butt Diameter (Base)</th>
                <th>Autoclave Treatment Color</th>
                <th>40&apos; HC Container Capacity</th>
                <th>Primary Grid &amp; Telecom Application</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td className={ps.metricCell}>7.0 m</td>
                <td>Ø 11 – 13 cm</td>
                <td>Ø 18 – 20 cm</td>
                <td>Export Brown or Green</td>
                <td>~180 – 195 poles</td>
                <td>Telecom drop/backhaul lines, rural LV service connections</td>
              </tr>
              <tr>
                <td className={ps.metricCell}>8.0 m</td>
                <td>Ø 12 – 14 cm</td>
                <td>Ø 20 – 22 cm</td>
                <td>Export Brown or Green</td>
                <td>~155 – 170 poles</td>
                <td>Low-voltage (LV) rural electrification &amp; street lighting</td>
              </tr>
              <tr>
                <td className={ps.metricCell}>9.0 m (Export Flagship)</td>
                <td>Ø 12 – 14 cm</td>
                <td>Ø 22 – 23 cm</td>
                <td><strong>Export Brown (Most Popular)</strong> or Green</td>
                <td><strong>140 poles (Verified Tally)</strong></td>
                <td>Standard African LV/MV distribution &amp; fiber-optic corridors</td>
              </tr>
              <tr>
                <td className={ps.metricCell}>10.0 m – 11.0 m</td>
                <td>Ø 14 – 16 cm</td>
                <td>Ø 24 – 27 cm</td>
                <td>Green Autoclave Exclusively</td>
                <td>~95 – 110 poles</td>
                <td>Medium-voltage (11kV / 33kV) feeders &amp; highway crossings</td>
              </tr>
              <tr>
                <td className={ps.metricCell}>12.0 m</td>
                <td>Ø 15 – 17 cm</td>
                <td>Ø 26 – 30 cm</td>
                <td>Green Autoclave Exclusively</td>
                <td>~80 – 90 poles (special stowage)</td>
                <td>Heavy-duty MV distribution backbones &amp; substation approaches</td>
              </tr>
            </tbody>
          </table>
        </div>

        <div className={up.autoclaveNotice}>
          <span className={up.autoclaveNoticeTitle}>Engineering Note on Brown vs. Green Autoclave Cylinder Length:</span>
          <p className={up.autoclaveNoticeBody}>
            International export buyers predominantly specify <strong>Brown vacuum-pressure impregnation</strong>. Our dedicated brown-treatment autoclave cylinder processes poles up to <strong>9.0 meters maximum</strong> (7m, 8m, and 9m). Orders requiring <strong>10m, 11m, or 12m</strong> poles are treated in our extended <strong>Green vacuum-pressure autoclave cylinder</strong> with the exact same ≥10.5 kg/cm² hydraulic pressure and preservative retention.
          </p>
        </div>
      </Section>

      <Section id="autoclave-spec" tone="alt">
        <Reveal>
          <SectionHeader
            id="autoclave-spec"
            eyebrow="Industrial Vacuum-Pressure Impregnation Specification"
            title="Engineered Against Tropical Termites, Fungal Decay & Coastal Humidity"
            lead="Every production batch is processed inside calibrated vacuum-pressure cylinders under strict moisture, pressure, temperature, and sapwood-penetration controls."
          />
        </Reveal>

        <div className={up.protocolGrid}>
          {AUTOCLAVE_STEPS_EN.map((st) => (
            <article key={st.num} className={up.protocolStep}>
              <span className={up.protocolNum}>{st.num}</span>
              <h3 className={up.protocolTitle}>{st.title}</h3>
              <p className={up.protocolVal}>{st.val}</p>
            </article>
          ))}
        </div>
      </Section>

      <Section id="rfq-section">
        <UtilityPoleFunnel
          copy={FUNNEL_COPY_EN}
          locale="en"
          sourcePage="/en/wooden-utility-poles"
          sectionId="rfq"
        />
        <p className="chip" style={{ marginBlockStart: "var(--s-6)" }}>
          <ShieldCheck aria-hidden="true" className="chip-icon" />
          <span>
            Direct Manufacturing &amp; Export Entity: {CORPORATE_ENTITIES[0].name} (Türkiye) · International USD Contracting Option: {CORPORATE_ENTITIES[1].name} (Wyoming, USA · D-U-N-S® #{US_DUNS_NUMBER} ·{" "}
            <a href={SAP_ARIBA_PROFILE_URL} target="_blank" rel="noopener noreferrer" data-clarity-event="pole_en_sap_ariba_verify">
              SAP Ariba® {SAP_ARIBA_ID}
            </a>
            ) · Official WhatsApp: {OFFICIAL_PHONE}
          </span>
        </p>
      </Section>

      <Section id="faq" tone="alt">
        <Reveal>
          <SectionHeader
            id="faq"
            eyebrow="Direct Procurement & Engineering Answers"
            title="Frequently Asked Questions: Importing Wooden Utility Poles to Africa"
          />
        </Reveal>
        <div className={ps.faqStack}>
          {FAQ_EN.map((f) => (
            <article key={f.q} className={ps.faqItem}>
              <h3 className={ps.faqQ}>{f.q}</h3>
              <p className={ps.faqA}>{f.a}</p>
            </article>
          ))}
        </div>
      </Section>
    </main>
  );
}
