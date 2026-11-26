// Merkezi Schema.org Knowledge Graph + GEO (Generative Engine Optimization) + OpenGraph üreteci.
// Google Knowledge Graph, AI Overviews / AI Mode, Bing Copilot, Perplexity, Yandex ve kurumsal B2B önizlemeler için
// tek doğruluk kaynağından (@/lib/ui/entities) türetilen bağlı varlık grafiği (@id referanslı).
import type { Metadata } from "next";
import {
  CORPORATE_ENTITIES,
  OFFICIAL_EMAIL,
  OFFICIAL_PHONE,
  OFFICIAL_WHATSAPP_WA,
  SAP_ARIBA_ID,
  SAP_ARIBA_PROFILE_URL,
  US_DUNS_NUMBER,
  US_DUNS_RAW,
} from "@/lib/ui/entities";

export const SITE_URL = "https://bdimexport.com";
export const DEFAULT_OG_IMAGE = `${SITE_URL}/media/en/heroes/trade-services-hero-og.webp`;

export const ORG_ID = `${SITE_URL}/#organization`;
export const WEBSITE_ID = `${SITE_URL}/#website`;
export const ENTITY_TR_ID = `${SITE_URL}/#entity-tr`;
export const ENTITY_US_ID = `${SITE_URL}/#entity-us`;

export const SUPPORTED_BCP47 = [
  "tr-TR",
  "en",
  "de-DE",
  "de-AT",
  "de-CH",
  "zh-CN",
  "ru",
  "fr",
  "nl",
  "es",
  "ar",
  "fi",
  "sq",
  "pl",
  "ro",
  "it",
] as const;

export const AREA_SERVED_COUNTRIES = [
  "TR", "US", "GB", "DE", "AT", "CH", "FR", "NL", "BE", "IT", "ES",
  "PL", "RO", "FI", "SE", "NO", "DK", "AL", "AE", "SA", "QA", "KW", "CN",
  "LY", "JO", "IQ", "EG", "DZ", "TN", "SN", "MZ", "GH", "CI", "KE", "TZ", "NG", "ZA",
] as const;

export function masterOrganizationNodes(): object[] {
  return [
    {
      "@type": "Organization",
      "@id": ORG_ID,
      name: "Bdimexport",
      url: SITE_URL,
      logo: {
        "@type": "ImageObject",
        url: `${SITE_URL}/media/brand/logo-gold.png`,
      },
      image: DEFAULT_OG_IMAGE,
      email: OFFICIAL_EMAIL,
      telephone: OFFICIAL_PHONE,
      sameAs: [OFFICIAL_WHATSAPP_WA, SAP_ARIBA_PROFILE_URL],
      description:
        "Dual-Hub global B2B sourcing (Türkiye and China), standalone 24-48h container loading and factory inspection, HS-code commercial intelligence, export marketing systems, and 81-province Türkiye field operations.",
      knowsLanguage: [...SUPPORTED_BCP47],
      areaServed: AREA_SERVED_COUNTRIES.map((code) => ({ "@type": "Country", name: code })),
      subOrganization: [{ "@id": ENTITY_US_ID }, { "@id": ENTITY_TR_ID }],
      contactPoint: [
        {
          "@type": "ContactPoint",
          contactType: "B2B Sourcing, Inspection & Trade Intelligence Desk",
          email: OFFICIAL_EMAIL,
          telephone: OFFICIAL_PHONE,
          url: OFFICIAL_WHATSAPP_WA,
          availableLanguage: [...SUPPORTED_BCP47],
          areaServed: [...AREA_SERVED_COUNTRIES],
        },
      ],
    },
    {
      "@type": "Organization",
      "@id": ENTITY_US_ID,
      name: CORPORATE_ENTITIES[1].name,
      legalName: CORPORATE_ENTITIES[1].name,
      duns: US_DUNS_RAW,
      sameAs: [SAP_ARIBA_PROFILE_URL],
      identifier: [
        {
          "@type": "PropertyValue",
          propertyID: "D-U-N-S",
          value: US_DUNS_NUMBER,
        },
        {
          "@type": "PropertyValue",
          propertyID: "SAP Business Network ID",
          value: SAP_ARIBA_ID,
          url: SAP_ARIBA_PROFILE_URL,
        },
      ],
      parentOrganization: { "@id": ORG_ID },
      address: {
        "@type": "PostalAddress",
        streetAddress: "30 N Gould St Ste N",
        addressLocality: "Sheridan",
        addressRegion: "WY",
        postalCode: "82801",
        addressCountry: "US",
      },
    },
    {
      "@type": "Organization",
      "@id": ENTITY_TR_ID,
      name: CORPORATE_ENTITIES[0].name,
      legalName: CORPORATE_ENTITIES[0].name,
      parentOrganization: { "@id": ORG_ID },
      address: {
        "@type": "PostalAddress",
        streetAddress: "Cumhuriyet Mahallesi Milli Egemenlik Caddesi No: 74",
        addressLocality: "Banaz / Uşak",
        postalCode: "64500",
        addressCountry: "TR",
      },
    },
    {
      "@type": "WebSite",
      "@id": WEBSITE_ID,
      url: SITE_URL,
      name: "Bdimexport",
      publisher: { "@id": ORG_ID },
      inLanguage: [...SUPPORTED_BCP47],
    },
  ];
}

export function buildHubGraph(opts: {
  url: string;
  inLanguage: string;
  name: string;
  description: string;
  services?: { name: string; url: string; description?: string }[];
}): object[] {
  const { url, inLanguage, name, description, services = [] } = opts;
  const graph: object[] = [
    ...masterOrganizationNodes(),
    {
      "@type": "WebPage",
      "@id": `${url}#webpage`,
      url,
      name,
      description,
      inLanguage,
      isPartOf: { "@id": WEBSITE_ID },
      about: { "@id": ORG_ID },
      speakable: {
        "@type": "SpeakableSpecification",
        cssSelector: ["h1", ".lead", "main h2"],
      },
    },
  ];
  if (services.length > 0) {
    graph.push({
      "@type": "OfferCatalog",
      "@id": `${url}#catalog`,
      name: `${name} — Service Catalog`,
      itemListElement: services.map((sv, idx) => ({
        "@type": "ListItem",
        position: idx + 1,
        item: {
          "@type": "Service",
          name: sv.name,
          url: sv.url,
          ...(sv.description ? { description: sv.description } : {}),
          provider: { "@id": ORG_ID },
        },
      })),
    });
  }
  return graph;
}

export function buildStructuredPageGraph(opts: {
  url: string;
  inLanguage: string;
  title: string;
  description: string;
  serviceType: string;
  areaServed?: string[];
  crumbs: { name: string; url: string }[];
  faq?: { q: string; a: string }[];
}): object[] {
  const { url, inLanguage, title, description, serviceType, areaServed = [], crumbs, faq = [] } = opts;
  const graph: object[] = [
    ...masterOrganizationNodes(),
    {
      "@type": "WebPage",
      "@id": `${url}#webpage`,
      url,
      name: title,
      description,
      inLanguage,
      isPartOf: { "@id": WEBSITE_ID },
      about: { "@id": `${url}#service` },
      speakable: {
        "@type": "SpeakableSpecification",
        cssSelector: ["h1", ".lead", "main h2", "main h3"],
      },
    },
    {
      "@type": "Service",
      "@id": `${url}#service`,
      name: title,
      description,
      serviceType,
      url,
      provider: { "@id": ORG_ID },
      ...(areaServed.length > 0
        ? { areaServed: areaServed.map((c) => ({ "@type": "Country", name: c })) }
        : {}),
      offers: {
        "@type": "Offer",
        url: `${url}#rfq`,
        description: "Written B2B scope and quotation delivered within 24 hours.",
        seller: { "@id": ORG_ID },
      },
    },
    {
      "@type": "BreadcrumbList",
      "@id": `${url}#breadcrumb`,
      itemListElement: crumbs.map((c, idx) => ({
        "@type": "ListItem",
        position: idx + 1,
        name: c.name,
        item: c.url,
      })),
    },
  ];
  if (faq.length > 0) {
    graph.push({
      "@type": "FAQPage",
      "@id": `${url}#faq`,
      mainEntity: faq.map((f) => ({
        "@type": "Question",
        name: f.q,
        acceptedAnswer: { "@type": "Answer", text: f.a },
      })),
    });
  }
  return graph;
}

export function buildProductFunnelGraph(opts: {
  url: string;
  inLanguage: string;
  title: string;
  description: string;
  productName: string;
  sku: string;
  mpn?: string;
  productId?: string;
  category: string;
  image: string;
  areaServed: string[];
  crumbs: { name: string; url: string }[];
  faq: { q: string; a: string }[];
}): object[] {
  const { url, inLanguage, title, description, productName, sku, mpn, productId, category, image, areaServed, crumbs, faq } = opts;
  const resolvedProductId = productId ?? `${url}#product`;
  return [
    ...masterOrganizationNodes(),
    {
      "@type": "WebPage",
      "@id": `${url}#webpage`,
      url,
      name: title,
      description,
      inLanguage,
      isPartOf: { "@id": WEBSITE_ID },
      about: { "@id": resolvedProductId },
      speakable: {
        "@type": "SpeakableSpecification",
        cssSelector: ["h1", "main h2", "main h3"],
      },
    },
    {
      "@type": "Product",
      "@id": resolvedProductId,
      name: productName,
      description,
      sku,
      mpn: mpn ?? sku,
      productID: sku,
      category,
      image: [image],
      brand: { "@type": "Brand", name: "Bdimexport" },
      manufacturer: { "@id": ENTITY_TR_ID },
      countryOfOrigin: "TR",
      offers: {
        "@type": "Offer",
        url: `${url}#contact`,
        availability: "https://schema.org/InStock",
        priceCurrency: "USD",
        seller: { "@id": ORG_ID },
        areaServed: areaServed.map((c) => ({ "@type": "Country", name: c })),
      },
    },
    {
      "@type": "Service",
      "@id": `${url}#service`,
      name: title,
      description,
      serviceType: "Factory-Direct Wooden Utility & Telecom Pole Manufacturing and Container Export",
      url,
      provider: { "@id": ORG_ID },
      areaServed: areaServed.map((c) => ({ "@type": "Country", name: c })),
    },
    {
      "@type": "BreadcrumbList",
      "@id": `${url}#breadcrumb`,
      itemListElement: crumbs.map((c, idx) => ({
        "@type": "ListItem",
        position: idx + 1,
        name: c.name,
        item: c.url,
      })),
    },
    {
      "@type": "FAQPage",
      "@id": `${url}#faq`,
      mainEntity: faq.map((f) => ({
        "@type": "Question",
        name: f.q,
        acceptedAnswer: { "@type": "Answer", text: f.a },
      })),
    },
  ];
}

export function defaultOpenGraph(opts: {
  title: string;
  description: string;
  url: string;
  locale?: string;
  image?: string;
}): Pick<Metadata, "openGraph" | "twitter"> {
  const { title, description, url, locale = "en_US", image = DEFAULT_OG_IMAGE } = opts;
  return {
    openGraph: {
      type: "website",
      siteName: "Bdimexport",
      title,
      description,
      url,
      locale,
      images: [
        {
          url: image,
          width: 1200,
          height: 630,
          alt: title,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [image],
    },
  };
}

export function SeoJsonLd({ graph }: { graph: object[] }) {
  const json = JSON.stringify({ "@context": "https://schema.org", "@graph": graph }).replace(/</g, "\\u003c");
  return <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: json }} />;
}
