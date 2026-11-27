// /entity-graph.json — Machine-Readable Schema.org Knowledge Graph & B2B Trade Capability Index.
// Arama motoru bilgi grafikleri (Knowledge Graph) ve kurumsal B2B tedarik ajanları için tüm varlık, koridor ve teklif uçlarını sunar.
import { MARKET_CORRIDORS } from "@/lib/seo/markets";
import { US_CLUSTER_PAGES } from "@/lib/seo/us-hub";
import { DE_PROPOSAL, EN_PROPOSALS, ZH_PROPOSAL } from "@/lib/seo/proposals";
import { ORG_ID, SITE_URL, SUPPORTED_BCP47, masterOrganizationNodes } from "@/lib/seo/schema";
import { SEO_RELEASE_DATE } from "@/lib/seo/lastmod";
import { TR_EXPORT_CORRIDORS, TR_PROPOSALS } from "@/app/(tr)/_lib/tr-seo-data";
import { EN_POLE_SPOKES } from "@/lib/seo/poles-spokes-en";
import { AR_POLE_SPOKES } from "@/lib/seo/poles-spokes-ar";
import { FR_POLE_SPOKES } from "@/lib/seo/poles-spokes-fr";

export const dynamic = "force-static";

export function GET(): Response {
  const payload = {
    "@context": "https://schema.org",
    version: "2026.11",
    generatedAt: SEO_RELEASE_DATE,
    "@graph": [
      ...masterOrganizationNodes(),
      {
        "@type": "ItemList",
        "@id": `${SITE_URL}/#direct-factory-utility-poles`,
        name: "Bdimexport Factory-Direct Autoclave Wooden Electric & Telecom Poles (7m–12m)",
        numberOfItems: 3 + EN_POLE_SPOKES.length + AR_POLE_SPOKES.length + FR_POLE_SPOKES.length,
        itemListElement: [
          {
            "@type": "ListItem",
            position: 1,
            name: "Factory-Direct Wooden Electric & Utility Poles for Africa (Senegal, Mozambique & Sub-Saharan Grid)",
            url: `${SITE_URL}/en/wooden-utility-poles`,
          },
          {
            "@type": "ListItem",
            position: 2,
            name: "توريد أعمدة الكهرباء والاتصالات الخشبية من المصنع مباشرة — ليبيا والأردن والعراق والجزائر",
            url: `${SITE_URL}/en/ar/wooden-utility-poles`,
          },
          {
            "@type": "ListItem",
            position: 3,
            name: "Poteaux Électriques et Télécoms en Bois Traité Autoclave (Sénégal, Côte d'Ivoire, Cameroun & Maghreb)",
            url: `${SITE_URL}/en/fr/wooden-utility-poles`,
          },
          ...[...EN_POLE_SPOKES, ...AR_POLE_SPOKES, ...FR_POLE_SPOKES].map((sp, i) => {
            const prefix = sp.locale === "ar" ? "/en/ar/wooden-utility-poles" : sp.locale === "fr" ? "/en/fr/wooden-utility-poles" : "/en/wooden-utility-poles";
            return {
              "@type": "ListItem",
              position: i + 4,
              name: sp.h1,
              url: `${SITE_URL}${prefix}/${sp.slug}`,
            };
          }),
        ],
      },
      {
        "@type": "ItemList",
        "@id": `${SITE_URL}/#us-division-programs`,
        name: "BDIMEXPORT LLC United States Overseas Procurement & QC Programs",
        numberOfItems: US_CLUSTER_PAGES.length + 1,
        itemListElement: [
          {
            "@type": "ListItem",
            position: 1,
            name: "United States Division Flagship Hub (BDIMEXPORT LLC)",
            url: `${SITE_URL}/en/us`,
          },
          ...US_CLUSTER_PAGES.map((u, i) => ({
            "@type": "ListItem",
            position: i + 2,
            name: u.h1,
            url: `${SITE_URL}/en/us/${u.slug}`,
          })),
        ],
      },
      {
        "@type": "ItemList",
        "@id": `${SITE_URL}/#global-corridors`,
        name: "Bdimexport Global Import Country Corridors",
        numberOfItems: MARKET_CORRIDORS.length,
        itemListElement: MARKET_CORRIDORS.map((m, i) => ({
          "@type": "ListItem",
          position: i + 1,
          name: `${m.countryName} (${m.isoCode}) Dual-Hub Sourcing & Inspection Corridor`,
          url: `${SITE_URL}/en/markets/${m.slug}`,
        })),
      },
      {
        "@type": "ItemList",
        "@id": `${SITE_URL}/#tr-export-corridors`,
        name: "Bdimexport Turkish Exporter Target Country Corridors",
        numberOfItems: TR_EXPORT_CORRIDORS.length,
        itemListElement: TR_EXPORT_CORRIDORS.map((c, i) => ({
          "@type": "ListItem",
          position: i + 1,
          name: c.h1,
          url: `${SITE_URL}/ihracat/pazarlar/${c.slug}`,
        })),
      },
      {
        "@type": "OfferCatalog",
        "@id": `${SITE_URL}/#executive-proposals`,
        name: "Bdimexport Targeted B2B Proposal Blueprints",
        provider: { "@id": ORG_ID },
        inLanguage: [...SUPPORTED_BCP47],
        itemListElement: [
          ...EN_PROPOSALS.map((p) => ({
            "@type": "Offer",
            name: p.h1,
            url: `${SITE_URL}/en/proposals/${p.slug}`,
          })),
          ...TR_PROPOSALS.map((p) => ({
            "@type": "Offer",
            name: p.h1,
            url: `${SITE_URL}/teklif/${p.slug}`,
          })),
          {
            "@type": "Offer",
            name: DE_PROPOSAL.h1,
            url: `${SITE_URL}/de/angebot/${DE_PROPOSAL.slug}`,
          },
          {
            "@type": "Offer",
            name: ZH_PROPOSAL.h1,
            url: `${SITE_URL}/zh/fangan/${ZH_PROPOSAL.slug}`,
          },
        ],
      },
    ],
  };

  return new Response(JSON.stringify(payload, null, 2), {
    headers: { "content-type": "application/ld+json; charset=utf-8" },
  });
}
