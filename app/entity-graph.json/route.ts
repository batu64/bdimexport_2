// /entity-graph.json — Machine-Readable Schema.org Knowledge Graph & B2B Trade Capability Index.
// Arama motoru bilgi grafikleri (Knowledge Graph) ve kurumsal B2B tedarik ajanları için tüm varlık, koridor ve teklif uçlarını sunar.
import { MARKET_CORRIDORS } from "@/lib/seo/markets";
import { DE_PROPOSAL, EN_PROPOSALS, ZH_PROPOSAL } from "@/lib/seo/proposals";
import { ORG_ID, SITE_URL, SUPPORTED_BCP47, masterOrganizationNodes } from "@/lib/seo/schema";
import { SEO_RELEASE_DATE } from "@/lib/seo/lastmod";
import { TR_EXPORT_CORRIDORS, TR_PROPOSALS } from "@/app/(tr)/_lib/tr-seo-data";

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
