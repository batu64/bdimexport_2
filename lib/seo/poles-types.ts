// Ortak tip tanımları: Ahşap Elektrik & Telekom Direkleri Topikal Kale (Hub & Spoke — EN / AR / FR).

export type PoleSpokeLocale = "en" | "ar" | "fr";

export type PoleSpokeTableRow = {
  cells: string[];
  specId: string;
  destId?: string;
  notes?: string;
  waText: string;
  highlight?: boolean;
};

export type PoleSpokeSection = {
  badge: string;
  title: string;
  paragraphs: string[];
  ctaLabel: string;
  specId: string;
  destId?: string;
  notes?: string;
};

export type PoleSpoke = {
  slug: string;
  locale: PoleSpokeLocale;
  sku: string;
  mpn: string;
  metaTitle: string; // ZORUNLU <= 60 karakter
  metaDescription: string; // 120–158 karakter
  ogLocale: string;
  areaServed: string[];
  hubTag: string;
  hubSummary: string;
  eyebrow: string;
  h1: string;
  subtitle: string;
  heroTrust: [string, string, string];
  heroWaText: string;
  geoCapsuleLabel: string;
  geoCapsuleAnswer: string;
  tableEyebrow: string;
  tableTitle: string;
  tableLead: string;
  tableHeaders: string[];
  tableRows: PoleSpokeTableRow[];
  sections: PoleSpokeSection[];
  defaultSpecId: string;
  defaultDestId: string;
  faqTitle: string;
  faq: { q: string; a: string }[];
  crossAlternates?: Partial<Record<PoleSpokeLocale, string>>; // Karşılık gelen dilin tam yolu (örn. "/en/fr/wooden-utility-poles/senegal-senelec")
};
