// /de site çerçevesi (navbar + footer) — metin lib/messages/de.json (formal Sie). Footer'da Impressum + Datenschutz
// her /de sayfasında ZORUNLU konum (FAZ_5 5.1; footer.md). Resmi şirket bilgileri lib/ui/entities.ts'den gelir.
import { CORPORATE_ENTITIES, OFFICIAL_EMAIL, OFFICIAL_PHONE, OFFICIAL_PHONE_HREF, OFFICIAL_WHATSAPP_WA } from "@/lib/ui/entities";
import type { FooterProps } from "@/lib/ui/Footer";
import type { NavbarProps } from "@/lib/ui/Navbar";
import { marketSites } from "@/lib/ui/sites";
import dict from "@/lib/messages/de.json";

export const QUOTE_EMAIL = process.env.NEXT_PUBLIC_QUOTE_EMAIL ?? OFFICIAL_EMAIL;
export const quoteHref = `mailto:${QUOTE_EMAIL}?subject=${encodeURIComponent(dict.quote.subject)}&body=${encodeURIComponent(dict.quote.body)}`;
export const whatsappHref = `${OFFICIAL_WHATSAPP_WA}?text=${encodeURIComponent(dict.quote.whatsappText)}`;

export function navbarProps(): NavbarProps {
  const n = dict.nav;
  return {
    brand: dict.site.name,
    homeHref: "/de",
    homeLabel: n.home,
    links: n.links,
    cta: { label: n.cta, href: quoteHref },
    sites: marketSites("de"),
    labels: { nav: n.label, open: n.menuOpen, close: n.menuClose, sites: n.sites },
    heroPaths: ["/de"],
  };
}

export function footerProps(): FooterProps {
  const f = dict.footer;
  return {
    brand: dict.site.name,
    tagline: f.tagline,
    columns: [
      {
        title: f.nav,
        links: [
          { label: dict.page.home, href: "/de" },
          ...dict.nav.links,
          { label: "Projektvorschlag (B2B)", href: "/de/angebot/lieferantenpruefung-beschaffung" },
        ],
      },
    ],
    sites: { title: f.sites, links: marketSites("de") },
    legal: { title: f.legal, links: [{ label: f.impressum, href: "/de/impressum" }, { label: f.datenschutz, href: "/de/datenschutz" }] },
    contact: {
      title: f.contact,
      email: QUOTE_EMAIL,
      emailLabel: f.email,
      whatsapp: { href: whatsappHref, label: f.whatsapp },
      phone: { number: OFFICIAL_PHONE, href: OFFICIAL_PHONE_HREF, label: f.phone },
    },
    entities: {
      title: f.entitiesTitle,
      items: [
        { badge: f.entityBadges.tr, name: CORPORATE_ENTITIES[0].name, address: CORPORATE_ENTITIES[0].address },
        { badge: f.entityBadges.us, name: CORPORATE_ENTITIES[1].name, address: CORPORATE_ENTITIES[1].address },
      ],
    },
    rights: f.rights,
  };
}
