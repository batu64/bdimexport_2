// /en/fr/wooden-utility-poles — Entonnoir B2B direct usine : poteaux electriques et telecoms en bois traite par autoclave
// Priorite #1 : Senegal (Port autonome de Dakar · SENELEC / ASER) · Cote d'Ivoire (Abidjan) · Cameroun, Guinee, Benin, Togo & Maghreb.
// Zero intermediaire · WhatsApp officiel unique : +90 539 414 78 54 (lib/ui/entities.ts).
import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, Factory, Globe, MessageCircle, ShieldCheck } from "lucide-react";
import Hero from "@/lib/ui/Hero";
import StatBand from "@/lib/ui/StatBand";
import { Section, SectionHeader } from "@/lib/ui/Section";
import UtilityPoleFunnel, { PoleConversionBar, PoleHeroVideoShowcase, PoleStickyMobileBar, type UtilityPoleFunnelCopy } from "@/lib/ui/UtilityPoleFunnel";
import WhatsAppFloat from "@/lib/ui/WhatsAppFloat";
import Reveal from "@/lib/ui/motion/Reveal";
import { CORPORATE_ENTITIES, OFFICIAL_PHONE, OFFICIAL_WHATSAPP_WA, SAP_ARIBA_ID, SAP_ARIBA_PROFILE_URL, US_DUNS_NUMBER } from "@/lib/ui/entities";
import { variantAlternates } from "@/app/(en)/en/_lib/hreflang";
import { SeoJsonLd, SITE_URL, buildProductFunnelGraph, defaultOpenGraph } from "@/lib/seo/schema";
import { POLE_GALLERY_IMAGES, POLE_SCHEMA_SPECS, POLE_VIDEO_META } from "@/lib/seo/poles-funnel-copy";
import { FR_POLE_SPOKES } from "@/lib/seo/poles-spokes-fr";
import ps from "@/lib/seo/proposal.module.css";
import up from "@/lib/ui/utilitypole.module.css";

const PAGE_PATH = "wooden-utility-poles";
const PAGE_URL = `${SITE_URL}/en/fr/${PAGE_PATH}`;
const OG_IMG = `${SITE_URL}/media/poles/wooden-utility-poles-og.webp`;

// <= 60 chars (53 chars) + 120-158 chars meta description
const META_TITLE = "Poteaux Électriques en Bois Traités (Usine) | Sénégal";
const META_DESC =
  "Fabricant direct en Türkiye de poteaux électriques et télécoms en bois traité autoclave (7m–12m). 140 poteaux 9m/40'HC livrés CIF Dakar, Abidjan, Douala.";

export const metadata: Metadata = {
  title: { absolute: META_TITLE },
  description: META_DESC,
  alternates: variantAlternates("fr", PAGE_PATH),
  ...defaultOpenGraph({
    title: META_TITLE,
    description: META_DESC,
    url: PAGE_URL,
    locale: "fr_FR",
    image: OG_IMG,
  }),
};

const CORRIDORS_FR = [
  {
    id: "senegal-dakar",
    priority: true,
    badge: "Corridor Prioritaire #1 — Sénégal & UEMOA",
    transit: "10–14 jours en ligne maritime directe vers Dakar",
    title: "Sénégal & Hinterland : livraison directe d'usine au Port autonome de Dakar",
    desc: "Fourniture directe sans courtier de poteaux électriques et télécoms en bois imprégné sous vide-pression (7m à 12m, norme EN 14229) pour les extensions de réseaux BT/MT SENELEC, concessions d'électrification rurale ASER, opérateurs fibre optique et transit terrestre vers Bamako, Banjul, Bissau et Nouakchott — avec BSC/CTN, certificat phytosanitaire et rapport de cycle d'autoclave.",
    ports: ["Port autonome de Dakar", "Corridor Bamako (Mali)", "Banjul / Bissau / Nouakchott"],
    cta: "Demander un devis usine CIF Dakar sur WhatsApp",
    waText:
      "Bonjour Bureau Usine bdimexport, nous souhaitons recevoir une cotation directe d'usine CIF Port de Dakar (Sénégal) pour des poteaux électriques en bois traité autoclave (9m brun export — 140 unités par conteneur 40' HC).",
  },
  {
    id: "cote-divoire-uemoa",
    priority: true,
    badge: "Corridor Prioritaire #2 — Côte d'Ivoire & Golfe de Guinée",
    transit: "14–18 jours par conteneur scellé",
    title: "Côte d'Ivoire, Bénin, Togo & Guinée : marchés publics et projets EPC",
    desc: "Approvisionnement direct d'usine pour les attributaires de marchés CI-ENERGIES, SBEE, CEET et EDG. Chaque conteneur 40' High Cube fait l'objet d'un comptage individuel à la craie (140 poteaux de 9m) avant plombage douanier, avec préparation BESC/ECTN et inspection SGS ou Bureau Veritas sur demande.",
    ports: ["Port d'Abidjan / San-Pédro", "Cotonou (Bénin)", "Lomé (Togo)", "Conakry (Guinée)"],
    cta: "Obtenir un tarif CIF Abidjan / Cotonou / Lomé",
    waText:
      "Bonjour Bureau Usine bdimexport, merci de nous transmettre votre offre directe d'usine CIF Abidjan / Cotonou / Lomé pour des poteaux électriques en bois traité (7m–12m).",
  },
  {
    id: "afrique-centrale",
    priority: false,
    badge: "Afrique Centrale — CEMAC & RDC",
    transit: "16–22 jours par conteneur 40' HC",
    title: "Cameroun, Gabon, Congo & RDC : haute rétention contre termites et humidité",
    desc: "Imprégnation industrielle en cellule pleine (pression hydraulique ≥ 10,5 kg/cm², rétention de 16 kg/m³ de sel sec) conçue pour résister durablement aux termites souterrains, aux champignons lignivores et aux climats équatoriaux humides sur les réseaux ENEO, SEEG et SNEL.",
    ports: ["Port de Douala / Kribi", "Libreville / Owendo", "Pointe-Noire / Matadi"],
    cta: "Demander une cotation CIF Douala / Pointe-Noire",
    waText:
      "Bonjour Bureau Usine bdimexport, nous sollicitons un devis direct d'usine CIF Douala / Pointe-Noire pour des poteaux en bois traité autoclave destinés aux réseaux électriques et télécoms.",
  },
  {
    id: "maghreb-francophone",
    priority: false,
    badge: "Maghreb — Fret maritime court",
    transit: "4–8 jours depuis la Türkiye",
    title: "Maroc, Algérie & Tunisie : expédition rapide depuis nos ports turcs",
    desc: "Grâce à la proximité maritime immédiate de notre usine en Türkiye, vos lots de poteaux bois pour lignes téléphoniques, fibre optique et distribution rurale rejoignent Casablanca, Tanger Med, Alger, Skikda ou Radès en moins d'une semaine de mer.",
    ports: ["Casablanca / Tanger Med", "Alger / Skikda / Oran", "Radès / Sfax"],
    cta: "Demander un tarif CIF Maghreb sur WhatsApp",
    waText:
      "Bonjour Bureau Usine bdimexport, merci de nous communiquer vos prix usine CIF Maroc / Algérie / Tunisie pour des poteaux électriques et télécoms en bois traité.",
  },
] as const;

const GALLERY_FR = [
  {
    src: "/media/poles/container-loading-telehandler.webp",
    tag: "Empotage direct 40' HC",
    title: "Chargement au chariot télescopique de poteaux bruns de 9 m dans notre cour d'usine",
    sub: "Manutention mécanique maîtrisée directement de la voie d'autoclave vers le conteneur maritime sans intermédiaire.",
  },
  {
    src: "/media/poles/container-140-poles-tally.webp",
    tag: "140 poteaux / 40' HC",
    title: "Pointage vérifié : exactement 140 poteaux de 9 m numérotés par conteneur 40' High Cube",
    sub: "Chaque poteau est marqué individuellement à la craie blanche et photographié avant la pose du scellé douanier.",
  },
  {
    src: "/media/poles/factory-yard-autoclave-stock.webp",
    tag: "Usine intégrée en Türkiye",
    title: "Parc à grumes, séchage contrôlé, rails d'autoclave et stocks export bruns et verts",
    sub: "De l'écorçage mécanique à l'imprégnation vide-pression sous un seul toit industriel.",
  },
  {
    src: "/media/poles/brown-9m-utility-poles-closeup.webp",
    tag: "Traitement brun export",
    title: "Poteaux électriques et télécoms de 9 m à finition brune prisée en Afrique de l'Ouest",
    sub: "Conicité régulière et pénétration profonde de l'aubier pour 40 à 50 ans de tenue en ligne.",
  },
  {
    src: "/media/poles/brown-poles-autoclave-rail.webp",
    tag: "Capacité appels d'offres",
    title: "Chariots d'autoclave prêts pour les expéditions multi-conteneurs des marchés publics",
    sub: "Cadence industrielle adaptée aux concessions d'électrification rurale et déploiements fibre optique.",
  },
  {
    src: "/media/poles/export-container-dispatch-yard.webp",
    tag: "Départs hebdomadaires",
    title: "Expédition directe des conteneurs vers Dakar, Abidjan, Douala, Cotonou et Casablanca",
    sub: "Liaisons maritimes régulières depuis Izmir, Gemlik et Mersin avec dossier documentaire complet.",
  },
] as const;

const AUTOCLAVE_STEPS_FR = [
  {
    num: "01 · Séchage préalable",
    title: "Humidité ramenée ≤ 25 %",
    val: "Aucun poteau n'entre en cylindre d'imprégnation au-dessus de 25 % d'humidité (étuvage possible à 10–12 %) afin d'assurer une absorption homogène.",
    specId: "9m-brown",
    cta: "Choisir le format 9 m Brun Export →",
  },
  {
    num: "02 · Vide initial",
    title: "60 minutes à 63,5 cmHg",
    val: "Extraction complète de l'air des cellules du bois pendant au moins 60 minutes sous vide poussé avant l'introduction de la solution.",
    specId: "7m-8m-brown-green",
    cta: "Choisir les formats 7 m – 8 m BT / Télécoms →",
  },
  {
    num: "03 · Pression hydraulique",
    title: "Injection ≥ 10,5 kg/cm²",
    val: "Remplissage sous vide puis maintien sous pression hydraulique d'au moins 10,5 kg/cm² pour saturer durablement l'aubier.",
    specId: "10m-12m-green",
    cta: "Choisir les formats 10 m – 12 m MT Vert →",
  },
  {
    num: "04 · Rétention certifiée",
    title: "16 kg/m³ de sel sec · ≥ 75 %",
    val: "Solution à 3,5 % (350 L/m³ soit 16 kg/m³ de sel sec) sous 30 °C, pénétration ≥ 75 % de l'aubier suivie d'un vide final de 15 minutes.",
    specId: "mixed-tender",
    cta: "Configurer un bordereau DQE / BOQ →",
  },
] as const;

const DIMENSION_ROWS_FR = [
  {
    lengthLabel: "7,0 m",
    topDia: "Ø 11 – 13 cm",
    buttDia: "Ø 18 – 20 cm",
    treatment: "Brun export ou Vert",
    capacity: "~180 – 195 poteaux",
    usage: "Lignes téléphoniques, fibre optique et branchements ruraux BT",
    specId: "7m-8m-brown-green",
    notes: "Poteau 7,0 m BT/Télécom (Sommet Ø11-13cm / Base Ø18-20cm — ~185 u./40'HC)",
    waText:
      "Bonjour Bureau Usine bdimexport, merci de nous communiquer votre prix CIF/FOB par conteneur 40' HC pour des poteaux bois traité de 7,0 m (~185 poteaux).",
  },
  {
    lengthLabel: "8,0 m",
    topDia: "Ø 12 – 14 cm",
    buttDia: "Ø 20 – 22 cm",
    treatment: "Brun export ou Vert",
    capacity: "~155 – 170 poteaux",
    usage: "Distribution basse tension (BT) et éclairage public",
    specId: "7m-8m-brown-green",
    notes: "Poteau 8,0 m BT (Sommet Ø12-14cm / Base Ø20-22cm — ~165 u./40'HC)",
    waText:
      "Bonjour Bureau Usine bdimexport, merci de nous communiquer votre prix CIF/FOB par conteneur 40' HC pour des poteaux bois traité de 8,0 m (~165 poteaux).",
  },
  {
    lengthLabel: "9,0 m (Référence Export)",
    topDia: "Ø 12 – 14 cm",
    buttDia: "Ø 22 – 23 cm",
    treatment: "Brun export (le plus demandé) ou Vert",
    capacity: "140 poteaux (pointage vérifié)",
    usage: "Standard distribution BT/MT Sénégal, Côte d'Ivoire & Afrique",
    specId: "9m-brown",
    flagship: true,
    notes: "Poteau 9,0 m Brun Export (140 poteaux par conteneur 40' HC)",
    waText:
      "Bonjour Bureau Usine bdimexport, merci de nous communiquer votre prix CIF/FOB par conteneur 40' HC pour des poteaux bois traité de 9,0 m Brun Export (140 poteaux).",
  },
  {
    lengthLabel: "10,0 m – 11,0 m",
    topDia: "Ø 14 – 16 cm",
    buttDia: "Ø 24 – 27 cm",
    treatment: "Autoclave Vert exclusivement",
    capacity: "~95 – 110 poteaux",
    usage: "Lignes moyenne tension (11 kV / 30 kV / 33 kV) et traversées routières",
    specId: "10m-12m-green",
    notes: "Poteau 10 m – 11 m MT Autoclave Vert (~100 poteaux/40'HC)",
    waText:
      "Bonjour Bureau Usine bdimexport, merci de nous communiquer votre prix CIF/FOB par conteneur 40' HC pour des poteaux moyenne tension 10 m – 11 m Autoclave Vert (~100 poteaux).",
  },
  {
    lengthLabel: "12,0 m",
    topDia: "Ø 15 – 17 cm",
    buttDia: "Ø 26 – 30 cm",
    treatment: "Autoclave Vert exclusivement",
    capacity: "~80 – 90 poteaux",
    usage: "Artères MT renforcées et départs de postes",
    specId: "10m-12m-green",
    notes: "Poteau 12,0 m MT Autoclave Vert (~85 poteaux/40'HC)",
    waText:
      "Bonjour Bureau Usine bdimexport, merci de nous communiquer votre prix CIF/FOB par conteneur 40' HC pour des poteaux 12,0 m Autoclave Vert (~85 poteaux).",
  },
] as const;

const FUNNEL_COPY_FR: UtilityPoleFunnelCopy = {
  eyebrow: "Bureau Export Direct Usine · Devis Proforma sous 24 h",
  title: "Calculez vos conteneurs et recevez votre offre directe d'usine (FOB / CIF)",
  lead: "Sélectionnez la longueur des poteaux, le volume en conteneurs 40' HC et votre port de destination en Afrique de l'Ouest, Centrale ou au Maghreb pour transmettre votre demande directement à notre usine.",
  step1Label: "1. Choisissez la spécification du poteau bois et le traitement autoclave",
  specs: [
    {
      id: "9m-brown",
      title: "Poteau 9,0 m — Autoclave Brun Export (Standard Afrique)",
      tag: "140 poteaux / 40' HC",
      meta: "Sommet Ø12–14 cm · Base Ø22–23 cm · Imprégnation brune sous vide-pression",
      polesPerContainer: 140,
      treatmentNote: "Brun export (jusqu'à 9 m) ou Vert",
    },
    {
      id: "7m-8m-brown-green",
      title: "Poteau 7,0 m ou 8,0 m — Réseaux BT ruraux & Télécoms",
      tag: "~175 poteaux / 40' HC",
      meta: "Disponible en brun ou vert · Idéal pour branchements BT, éclairage et fibre optique",
      polesPerContainer: 175,
      treatmentNote: "Brun ou Vert (autoclave complet)",
    },
    {
      id: "10m-12m-green",
      title: "Poteau 10 m / 11 m / 12 m — Autoclave Vert Moyenne Tension",
      tag: "~95 poteaux / 40' HC",
      meta: "Artères MT (11 kV / 30 kV / 33 kV) · Cylindre vert longue portée exclusivement (> 9 m)",
      polesPerContainer: 95,
      treatmentNote: "Vert exclusivement au-delà de 9 m",
    },
    {
      id: "mixed-tender",
      title: "Panachage appel d'offres électrique ou télécom (7 m – 12 m)",
      tag: "Bordereau DQE / BOQ",
      meta: "Colisage sur mesure selon votre cahier des charges SENELEC, CI-ENERGIES, ENEO ou ONEE",
      polesPerContainer: 140,
      treatmentNote: "Selon bordereau de quantités (DQE)",
    },
  ],
  step2Label: "2. Sélectionnez le nombre de conteneurs 40' High Cube",
  volumes: [
    { id: "1x40hc", label: "1 × 40' HC (Commande test)", containers: 1 },
    { id: "3x40hc", label: "2 – 5 × 40' HC (Stock chantier)", containers: 3 },
    { id: "8x40hc", label: "5 – 10 × 40' HC (Lot réseau)", containers: 8 },
    { id: "20x40hc", label: "10+ × 40' HC / Appel d'offres", containers: 20 },
  ],
  incotermLabel: "3. Incoterm souhaité",
  incoterms: ["CIF Port de destination", "CFR Port de destination", "FOB Port turc", "EXW Départ usine"],
  step3Label: "4. Port de déchargement prioritaire",
  destinations: [
    { id: "senegal-dakar", label: "Sénégal (Port de Dakar)", portSummary: "Port autonome de Dakar (10–14 j)" },
    { id: "civ-abidjan", label: "Côte d'Ivoire (Abidjan / San-Pédro)", portSummary: "Port d'Abidjan / San-Pédro" },
    { id: "benin-togo-guinee", label: "Bénin / Togo / Guinée", portSummary: "Cotonou / Lomé / Conakry" },
    { id: "cameroun-gabon", label: "Cameroun / Gabon / Congo", portSummary: "Douala / Kribi / Pointe-Noire" },
    { id: "maghreb-ports", label: "Maroc / Algérie / Tunisie", portSummary: "Casablanca / Alger / Radès" },
    { id: "other-francophone", label: "Autre port africain", portSummary: "Préciser le port ci-dessous" },
  ],
  calcLabels: {
    estimatedLoad: "Quantité estimée",
    polesUnit: "poteaux bois",
    treatmentRule: "Traitement autoclave",
    selectedPort: "Destination sélectionnée",
  },
  fields: {
    companyLabel: "Société / Attributaire EPC / Organisme acheteur",
    companyPlaceholder: "Ex. : Entreprise Électrique — Dakar / Abidjan / Douala",
    whatsappLabel: "Numéro WhatsApp direct (avec indicatif pays)",
    whatsappPlaceholder: "+221 77 ... / +225 ... / +237 ...",
    emailLabel: "E-mail professionnel (pour facture proforma PDF)",
    emailPlaceholder: "achats@entreprise.sn",
    portCustomLabel: "Port final ou ville de transit (optionnel)",
    portCustomPlaceholder: "Ex. : Dakar, Bamako, Abidjan, Douala, Cotonou...",
    notesLabel: "Précisions techniques (norme EN 14229, diamètres, numéro d'appel d'offres, L/C ou virement)",
    notesPlaceholder: "Indiquez vos longueurs, classes de résistance ou échéances de livraison...",
  },
  briefHeader: "Récapitulatif prêt à transmettre au bureau d'usine",
  slaBadge: "Cotation proforma sous 24 h",
  briefLabels: {
    header: "[DEMANDE DE PRIX USINE — POTEAUX BOIS TRAITÉS · bdimexport]",
    spec: "Spécification",
    volume: "Volume",
    estimatedQty: "Quantité estimée",
    incoterm: "Incoterm",
    destination: "Port / Pays",
    company: "Société",
    whatsapp: "WhatsApp",
    email: "E-mail",
    notes: "Notes techniques",
  },
  whatsappCta: "Envoyer la demande sur le WhatsApp de l'usine",
  emailCta: "Recevoir la facture proforma par e-mail",
  copyCta: "Copier le récapitulatif",
  copiedCta: "Récapitulatif copié",
  emailSubject: "Demande de prix usine — Poteaux électriques en bois traité",
  directFactoryGuarantee: "Contrat direct fabricant en Türkiye sans courtier",
  submittedMsg: "Votre demande a bien été enregistrée auprès du bureau export.",
};

const FAQ_FR = [
  {
    q: "Êtes-vous le fabricant direct des poteaux électriques en bois ou un intermédiaire ?",
    a: `Nous opérons directement depuis notre site industriel intégré en Türkiye via notre entité turque (${CORPORATE_ENTITIES[0].name}) et notre structure contractuelle internationale (${CORPORATE_ENTITIES[1].name} — enregistrée auprès de Dun & Bradstreet sous le numéro D-U-N-S® ${US_DUNS_NUMBER} et sur SAP Business Network / SAP Ariba sous l'identifiant ${SAP_ARIBA_ID}). Écorçage, séchage, tournage, imprégnation en autoclave et empotage conteneur sont réalisés sans aucun courtier.`,
  },
  {
    q: "Combien de poteaux en bois de 9 mètres entrent dans un conteneur 40 pieds High Cube ?",
    a: "Un conteneur maritime 40' High Cube (40' HC) charge exactement 140 poteaux électriques en bois de 9,0 mètres au gabarit export standard (diamètre sommet Ø12–14 cm, base Ø22–23 cm). Chaque poteau est numéroté à la craie et photographié avant fermeture des portes et pose du plomb douanier.",
  },
  {
    q: "Quelle est la différence entre le traitement autoclave brun (7m–9m) et vert (7m–12m) ?",
    a: "Les acheteurs en Afrique de l'Ouest et au Maghreb privilégient souvent la teinte brune à l'export. Notre cylindre d'autoclave brun traite les poteaux jusqu'à 9,0 mètres maximum (7 m, 8 m et 9 m). Pour les longueurs supérieures (10 m, 11 m et 12 m), notre cylindre longue portée réalise une imprégnation verte sous vide-pression offrant exactement la même pression hydraulique (≥ 10,5 kg/cm²) et la même rétention fongicide et anti-termites.",
  },
  {
    q: "Quels sont les délais maritimes vers Dakar (Sénégal), Abidjan et Douala ?",
    a: "Les départs conteneurisés depuis les ports turcs (Izmir, Gemlik, Mersin) atteignent le Port autonome de Dakar en 10 à 14 jours de mer, Abidjan / Lomé / Cotonou en 14 à 18 jours, Douala en 16 à 22 jours, et Casablanca / Alger / Radès en 4 à 8 jours.",
  },
  {
    q: "Quels certificats fournissez-vous pour le dédouanement et les appels d'offres SENELEC ou CI-ENERGIES ?",
    a: "Chaque expédition comprend la facture commerciale, la liste de colisage numérotée, le connaissement maritime (B/L), le certificat d'origine turc, le certificat phytosanitaire officiel, le rapport de charge autoclave (humidité ≤ 25 %, vide 60 min, pression ≥ 10,5 kg/cm², rétention 16 kg/m³), ainsi que l'assistance BSC / BESC / ECTN et l'inspection préalable SGS ou Bureau Veritas si requise.",
  },
];

export default function FrWoodenUtilityPolesPage() {
  const graph = buildProductFunnelGraph({
    url: PAGE_URL,
    inLanguage: "fr",
    title: META_TITLE,
    description: META_DESC,
    productName: "Poteaux électriques et télécoms en bois traité autoclave (7m – 12m)",
    sku: "BDIM-POLE-FR-7M-12M",
    mpn: "BDIM-POLE-FR-NFC67100",
    productId: `${PAGE_URL}#BDIM-POLE-FR-7M-12M`,
    category: "Poteaux électriques en bois (HS 4403.11 / 4403.21 · NF C 67-100 · EN 14229)",
    image: OG_IMG,
    images: POLE_GALLERY_IMAGES,
    video: POLE_VIDEO_META.fr,
    specs: POLE_SCHEMA_SPECS,
    areaServed: ["SN", "CI", "CM", "BJ", "TG", "GN", "ML", "MA", "DZ", "TN"],
    crumbs: [
      { name: "Accueil FR", url: `${SITE_URL}/en/fr` },
      { name: "Poteaux électriques en bois traité (Usine directe)", url: PAGE_URL },
    ],
    faq: FAQ_FR,
  });

  const directWaHero = `${OFFICIAL_WHATSAPP_WA}?text=${encodeURIComponent(
    "Bonjour Bureau Usine bdimexport, nous recherchons des poteaux électriques / télécoms en bois traité (7m–12m) pour l'Afrique francophone (Sénégal / Côte d'Ivoire / Cameroun). Merci de partager vos prix CIF par conteneur.",
  )}`;

  const stats = [
    { value: 140, label: "Poteaux de 9 m chargés par conteneur 40' HC" },
    { value: 10.5, decimals: 1, unit: " kg/cm²", label: "Pression hydraulique en cylindre d'autoclave" },
    { value: 16, unit: " kg/m³", label: "Rétention de sel sec anti-termites & champignons" },
    { value: 24, unit: " h", label: "Délai d'émission de votre devis proforma CIF/FOB" },
  ];

  return (
    <main>
      <SeoJsonLd graph={graph} />

      <div className={up.langBar}>
        <div className={`container ${up.langBarInner}`}>
          <span className={up.factoryBadge}>
            <Factory aria-hidden="true" className={up.badgeIcon} />
            <span>Usine intégrée en Türkiye — Zéro courtier · Livraison prioritaire Dakar, Abidjan, Douala &amp; Maghreb</span>
          </span>
          <div style={{ display: "flex", flexWrap: "wrap", gap: "var(--s-3)" }}>
            <Link
              id="cta-pole-fr-switch-en"
              href="/en/wooden-utility-poles"
              lang="en"
              hrefLang="en"
              className={up.langSwitchLink}
              data-clarity-event="pole_fr_switch_to_en"
            >
              <Globe aria-hidden="true" className={up.badgeIcon} />
              <span>English (Africa &amp; Global)</span>
            </Link>
            <Link
              id="cta-pole-fr-switch-ar"
              href="/en/ar/wooden-utility-poles"
              lang="ar"
              hrefLang="ar"
              className={up.langSwitchLink}
              data-clarity-event="pole_fr_switch_to_ar"
            >
              <Globe aria-hidden="true" className={up.badgeIcon} />
              <span>العربية (ليبيا · الأردن)</span>
            </Link>
          </div>
        </div>
      </div>

      <Hero
        id="poles-fr-hero"
        eyebrow="Export Direct d'Usine (Zéro Intermédiaire) · Sénégal (Dakar) · Côte d'Ivoire (Abidjan) · Cameroun & Maghreb"
        title="Poteaux Électriques et Télécoms en Bois Traité Autoclave — Livrés Directement de Notre Usine"
        subtitle="Commandez vos poteaux en bois tournés et imprégnés sous vide-pression (7 m à 12 m, norme EN 14229) directement sur notre ligne de production en Türkiye. Chargement vérifié de 140 poteaux de 9 m par conteneur 40' HC et rétention de 16 kg/m³ contre les termites tropicaux."
        primary={{
          id: "cta-pole-fr-hero-calc",
          label: "Calculer mes conteneurs & devis 24 h",
          href: "#rfq",
          clarityEvent: "pole_fr_hero_scroll_calc",
        }}
        secondary={{
          id: "cta-pole-fr-hero-wa",
          label: "WhatsApp Direct Usine",
          href: directWaHero,
          clarityEvent: "pole_fr_hero_whatsapp",
          clarityUpgrade: "pole_fr_hero_wa_lead",
        }}
        trust={[
          "Prix direct fabricant (EXW / FOB Türkiye / CIF Dakar, Abidjan, Cotonou, Lomé, Douala, Casablanca)",
          "Autoclave brun export (7 m – 9 m) & autoclave vert haute portée (7 m – 12 m) · Pression ≥ 10,5 kg/cm²",
          "Pointage photo de 140 poteaux / 40' HC + Certificat phytosanitaire, Origine & BSC/ECTN",
        ]}
        visual={
          <PoleHeroVideoShowcase
            liveBadge="Vidéo réelle de notre parc usine — Empotage 9 m"
            posterAlt="Chargement au chariot télescopique de poteaux électriques en bois brun de 9m en conteneur 40 pieds"
            specs={[
              { val: "7m – 12m", label: "Longueurs réseaux BT, MT & Télécoms" },
              { val: "140 / 40' HC", label: "Capacité vérifiée en 9 m brun export" },
              { val: "+90 539 414 78 54", label: "Ligne WhatsApp Officielle Usine" },
            ]}
          />
        }
      />

      <StatBand items={stats} label="Repères industriels et capacités d'exportation" locale="en" />

      <Section id="factory-verification-cro" tone="alt">
        <PoleConversionBar locale="fr" sourcePage="/en/fr/wooden-utility-poles" rfqAnchor="#rfq" contextLabel="Poteaux Électriques Bois Afrique" />
      </Section>

      <Section id="corridors-afrique">
        <Reveal>
          <SectionHeader
            id="corridors-afrique"
            eyebrow="Corridors Maritimes Afrique Francophone & Maghreb"
            title="Logistique Conteneurisée Directe pour le Sénégal, la Côte d'Ivoire, le Cameroun et l'Afrique du Nord"
            lead="Que vous répondiez à un appel d'offres SENELEC/ASER via Dakar, à un lot d'électrification rurale CI-ENERGIES ou ENEO, ou à un déploiement fibre optique, notre usine turque réduit vos délais maritimes et élimine les marges de négoce."
          />
        </Reveal>

        <div className={up.corridorGrid}>
          {CORRIDORS_FR.map((c) => (
            <article key={c.id} className={`${up.corridorCard} ${c.priority ? up.corridorPriority : ""}`}>
              <div className={up.corridorTop}>
                <div className={up.corridorTagRow}>
                  <span className={`${up.corridorBadge} ${c.priority ? up.corridorBadgeGold : ""}`}>{c.badge}</span>
                  <span className={up.corridorTransit}>{c.transit}</span>
                </div>
                <h3 className={up.corridorTitle}>{c.title}</h3>
                <p className={up.corridorDesc}>{c.desc}</p>
                <ul className={up.portList} aria-label="Ports desservis">
                  {c.ports.map((p) => (
                    <li key={p} className={up.portChip}>{p}</li>
                  ))}
                </ul>
              </div>
              <a
                id={`cta-pole-fr-corridor-${c.id}`}
                href={`${OFFICIAL_WHATSAPP_WA}?text=${encodeURIComponent(c.waText)}`}
                target="_blank"
                rel="noopener noreferrer"
                className={`${up.corridorWaLink} ${c.priority ? up.corridorWaPriority : ""}`}
                data-clarity-event={`pole_fr_corridor_wa_${c.id}`}
                data-clarity-upgrade={`pole_fr_${c.id}_wa_lead`}
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

      <Section id="preuves-usine" tone="alt">
        <Reveal>
          <SectionHeader
            id="preuves-usine"
            eyebrow="Preuves Visuelles d'Usine et d'Empotage"
            title="Notre Parc à Bois, Ligne d'Autoclave et Chargement Conteneur 40' HC"
            lead="Aucune image générique : chaque photographie ci-dessous illustre nos stocks réels de poteaux traités et le comptage individuel avant expédition."
          />
        </Reveal>

        <div className={up.galleryGrid}>
          {GALLERY_FR.map((img, idx) => (
            <figure
              key={img.src}
              id={`pole-fr-gallery-${idx + 1}`}
              className={up.galleryCard}
              data-clarity-event={`pole_fr_gallery_${idx + 1}`}
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

      <Section id="dimensions-poteaux">
        <Reveal>
          <SectionHeader
            id="dimensions-poteaux"
            eyebrow="Barème Dimensionnel & Colisage Maritime (Cliquez sur un format pour chiffrer)"
            title="Spécifications des Poteaux Électriques et Télécoms en Bois (7 m – 12 m)"
            lead="Fabriqués en pin sélectionné à grain droit, écorcés et planés mécaniquement, séchés avant étuvage et imprégnés en autoclave selon les exigences des réseaux aériens BT/MT et télécoms. Cliquez sur n'importe quelle longueur pour la sélectionner dans le calculateur ou demander un devis WhatsApp."
          />
        </Reveal>

        <div className={ps.tableWrap}>
          <table className={ps.table}>
            <thead>
              <tr>
                <th>Longueur</th>
                <th>Diamètre au sommet</th>
                <th>Diamètre à la base</th>
                <th>Couleur d&apos;autoclave</th>
                <th>Capacité par 40&apos; HC</th>
                <th>Usage réseau électrique &amp; télécom</th>
                <th>Devis direct usine</th>
              </tr>
            </thead>
            <tbody>
              {DIMENSION_ROWS_FR.map((row) => (
                <tr key={row.lengthLabel}>
                  <td className={ps.metricCell}>
                    <a
                      href="#rfq"
                      data-pole-spec={row.specId}
                      data-pole-notes={row.notes}
                      style={{ color: "inherit", textDecoration: "underline" }}
                    >
                      {row.lengthLabel}
                    </a>
                  </td>
                  <td>{row.topDia}</td>
                  <td>{row.buttDia}</td>
                  <td>{"flagship" in row && row.flagship ? <strong>{row.treatment}</strong> : row.treatment}</td>
                  <td>{"flagship" in row && row.flagship ? <strong>{row.capacity}</strong> : row.capacity}</td>
                  <td>{row.usage}</td>
                  <td>
                    <div className={up.tableCtaCell}>
                      <a
                        href="#rfq"
                        data-pole-spec={row.specId}
                        data-pole-notes={row.notes}
                        className={up.tableCalcLink}
                      >
                        <span>Choisir ce format</span>
                      </a>
                      <a
                        href={`${OFFICIAL_WHATSAPP_WA}?text=${encodeURIComponent(row.waText)}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className={up.tableWaLink}
                        data-clarity-event={`pole_fr_table_wa_${row.specId}`}
                      >
                        <MessageCircle aria-hidden="true" className={up.badgeIcon} />
                        <span>Devis WhatsApp</span>
                      </a>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className={up.autoclaveNotice}>
          <span className={up.autoclaveNoticeTitle}>Note technique sur le choix Brun (≤ 9 m) ou Vert (jusqu&apos;à 12 m) :</span>
          <p className={up.autoclaveNoticeBody}>
            Notre cylindre d&apos;autoclave dédié au <strong>traitement brun export</strong> accepte les longueurs jusqu&apos;à <strong>9,0 mètres maximum</strong> (7 m, 8 m et 9 m). Pour les poteaux de <strong>10 m, 11 m et 12 m</strong>, le traitement est réalisé dans notre <strong>cylindre d&apos;autoclave vert longue portée</strong> avec la même pression hydraulique (≥ 10,5 kg/cm²) et la même classe de durabilité.
          </p>
        </div>
      </Section>

      <Section id="protocole-autoclave" tone="alt">
        <Reveal>
          <SectionHeader
            id="protocole-autoclave"
            eyebrow="Cahier des Charges d'Imprégnation Vide-Pression (Cliquez pour sélectionner)"
            title="Protection Industrielle Contre les Termites, l'Humidité Tropicale et le Pourrissement"
            lead="Chaque charge d'autoclave suit un cycle instrumenté garantissant la pénétration profonde du produit de préservation dans l'aubier."
          />
        </Reveal>

        <div className={up.protocolGrid}>
          {AUTOCLAVE_STEPS_FR.map((st) => (
            <a
              key={st.num}
              href="#rfq"
              data-pole-spec={st.specId}
              className={up.protocolStep}
            >
              <div>
                <span className={up.protocolNum}>{st.num}</span>
                <h3 className={up.protocolTitle}>{st.title}</h3>
                <p className={up.protocolVal}>{st.val}</p>
              </div>
              <span className={up.protocolCta}>{st.cta}</span>
            </a>
          ))}
        </div>
      </Section>

      <Section id="rfq-section">
        <UtilityPoleFunnel
          copy={FUNNEL_COPY_FR}
          locale="fr"
          sourcePage="/en/fr/wooden-utility-poles"
          sectionId="rfq"
        />
        <p className="chip" style={{ marginBlockStart: "var(--s-6)" }}>
          <ShieldCheck aria-hidden="true" className="chip-icon" />
          <span>
            Entité industrielle et exportatrice (Türkiye) : {CORPORATE_ENTITIES[0].name} · Entité contractuelle internationale : {CORPORATE_ENTITIES[1].name} (USA · D-U-N-S® #{US_DUNS_NUMBER} ·{" "}
            <a href={SAP_ARIBA_PROFILE_URL} target="_blank" rel="noopener noreferrer" data-clarity-event="pole_fr_sap_ariba_verify">
              SAP Ariba® {SAP_ARIBA_ID}
            </a>
            ) · WhatsApp officiel : {OFFICIAL_PHONE}
          </span>
        </p>
      </Section>

      <Section id="faq" tone="alt">
        <Reveal>
          <SectionHeader
            id="faq"
            eyebrow="Questions Fréquentes des Acheteurs & Attributaires EPC"
            title="FAQ : Achat Direct d'Usine de Poteaux Électriques en Bois vers l'Afrique"
          />
        </Reveal>
        <div className={ps.faqStack}>
          {FAQ_FR.map((f) => (
            <article key={f.q} className={ps.faqItem}>
              <h3 className={ps.faqQ}>{f.q}</h3>
              <p className={ps.faqA}>{f.a}</p>
            </article>
          ))}
        </div>
      </Section>

      <Section id="pole-guides-fortress">
        <Reveal>
          <SectionHeader
            id="pole-guides-fortress"
            eyebrow="Dossiers Prix, Norme NF C 67-100 & Corridors Afrique Francophone"
            title="Guides Spécialisés : Sénégal (SENELEC), Côte d'Ivoire (CIE), Cameroun (ENEO) & Maghreb"
            lead="Consultez nos barèmes indicatifs par conteneur 40' HC, les exigences NF C 67-100 (150–300 daN) et nos délais maritimes par port."
          />
        </Reveal>
        <div className={up.spokeGrid}>
          {FR_POLE_SPOKES.map((sp) => (
            <Link
              key={sp.slug}
              href={`/en/fr/wooden-utility-poles/${sp.slug}`}
              className={up.spokeCard}
              data-clarity-event={`pole_fr_pillar_to_${sp.slug}`}
            >
              <div>
                <span className={up.spokeTag}>{sp.hubTag}</span>
                <h3 className={up.spokeTitle}>{sp.metaTitle}</h3>
                <p className={up.spokeSummary}>{sp.hubSummary}</p>
              </div>
              <span className={up.protocolCta}>Ouvrir le dossier technique →</span>
            </Link>
          ))}
        </div>
      </Section>

      <PoleStickyMobileBar
        locale="fr"
        rfqAnchor="#rfq"
        waMessage="Bonjour Bureau Usine bdimexport, nous souhaitons un devis CIF direct d'usine pour des poteaux électriques en bois traité (7m–12m)."
      />

      <WhatsAppFloat
        locale="en"
        label="WhatsApp Direct Usine"
        ariaLabel="Contacter l'usine directement sur WhatsApp"
        message="Bonjour bdimexport, nous souhaitons un devis direct d'usine pour des poteaux électriques en bois traité (Sénégal / Afrique francophone)."
      />
    </main>
  );
}
