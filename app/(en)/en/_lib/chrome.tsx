// /en global site çerçevesi (navbar + footer) — metin lib/messages/en.json, kurumsal bilgiler lib/ui/entities.ts.
import { enVariants, localeConfig, type Locale } from "@/lib/i18n";
import { CORPORATE_ENTITIES, OFFICIAL_EMAIL, OFFICIAL_PHONE, OFFICIAL_PHONE_HREF, OFFICIAL_WHATSAPP_WA } from "@/lib/ui/entities";
import type { FooterProps } from "@/lib/ui/Footer";
import type { NavbarProps, SiteLink } from "@/lib/ui/Navbar";
import { VARIANTS } from "@/lib/ui/variants";
import dict from "@/lib/messages/en.json";
import { SERVICES } from "./services";
import { INDUSTRIES } from "../industries/_lib/industries";

const SITE_HOME: Record<Locale, string> = { tr: "/", en: "/en", de: "/de", zh: "/zh" };
const ORDER: Locale[] = ["tr", "en", "de", "zh"];

export const QUOTE_EMAIL = process.env.NEXT_PUBLIC_QUOTE_EMAIL ?? OFFICIAL_EMAIL;
/** Akıllı RFQ & talep kanalı — kullanıcıyı /en/rfq interaktif teklif ve denetim konfigüratörüne yönlendirir */
export const quoteHref = (_context?: string) => "/en/rfq";

export function enSites(current: string): SiteLink[] {
  const markets = ORDER.map((l) => ({ label: localeConfig[l].label, href: SITE_HOME[l], lang: localeConfig[l].hreflang, current: l === current }));
  const variants = enVariants.map((v) => ({ label: VARIANTS[v].label, href: `/en/${v}`, lang: VARIANTS[v].lang, current: v === current }));
  return [...markets, ...variants];
}

export function navbarProps(): NavbarProps {
  const n = dict.nav;
  return {
    brand: dict.site.name,
    homeHref: "/en",
    homeLabel: n.home,
    links: n.links,
    cta: { label: n.cta, href: quoteHref() },
    sites: enSites("en"),
    labels: { nav: n.label, open: n.menuOpen, close: n.menuClose, sites: n.sites },
    heroPaths: ["/en", "/en/rfq", "/en/us", "/en/wooden-utility-poles"],
  };
}

export function footerProps(): FooterProps {
  const f = dict.footer;
  return {
    brand: dict.site.name,
    tagline: f.tagline,
    columns: [
      { title: f.services, links: SERVICES.map((s) => ({ label: s.label, href: `/en/services/${s.slug}` })) },
      {
        title: f.industries,
        links: [
          ...INDUSTRIES.map((i) => ({ label: i.label, href: `/en/industries/${i.slug}` })),
          { label: f.products, href: "/en/products" },
          { label: "Wooden Utility Poles (Africa)", href: "/en/wooden-utility-poles" },
          { label: "US Division (BDIMEXPORT LLC)", href: "/en/us" },
          { label: "Country Corridors (12)", href: "/en/markets" },
          { label: "B2B Proposals", href: "/en/proposals" },
          { label: "Insights", href: "/en/insights" },
        ],
      },
    ],
    sites: { title: f.sites, links: enSites("en") },
    contact: {
      title: f.contact,
      email: QUOTE_EMAIL,
      emailLabel: f.email,
      whatsapp: { href: OFFICIAL_WHATSAPP_WA, label: f.whatsapp },
      phone: { number: OFFICIAL_PHONE, href: OFFICIAL_PHONE_HREF, label: f.phone },
    },
    entities: {
      title: f.entitiesTitle,
      items: [
        {
          badge: f.entityBadges.us,
          name: CORPORATE_ENTITIES[1].name,
          address: CORPORATE_ENTITIES[1].address,
          duns: CORPORATE_ENTITIES[1].duns,
          aribaId: CORPORATE_ENTITIES[1].aribaId,
          aribaUrl: CORPORATE_ENTITIES[1].aribaUrl,
        },
        { badge: f.entityBadges.tr, name: CORPORATE_ENTITIES[0].name, address: CORPORATE_ENTITIES[0].address },
      ],
    },
    rights: f.rights,
  };
}
