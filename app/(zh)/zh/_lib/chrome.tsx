// /zh site çerçevesi (navbar + footer) — metin lib/messages/zh.json (简体字). Birincil kanal WeChat (#wechat kartı).
// ICP vaadi YOK (Cloudflare HK — agents/zh-agent.md §6.3). Resmi şirket bilgileri lib/ui/entities.ts'den gelir.
import { CORPORATE_ENTITIES, OFFICIAL_EMAIL, OFFICIAL_PHONE, OFFICIAL_PHONE_HREF, OFFICIAL_WHATSAPP_WA } from "@/lib/ui/entities";
import type { FooterProps } from "@/lib/ui/Footer";
import type { NavbarProps } from "@/lib/ui/Navbar";
import { marketSites } from "@/lib/ui/sites";
import dict from "@/lib/messages/zh.json";

export const QUOTE_EMAIL = process.env.NEXT_PUBLIC_QUOTE_EMAIL ?? OFFICIAL_EMAIL;

export function navbarProps(): NavbarProps {
  const n = dict.nav;
  return {
    brand: dict.site.name,
    homeHref: "/zh",
    homeLabel: n.home,
    links: n.links,
    cta: { label: n.cta, href: "/zh#wechat" },
    sites: marketSites("zh"),
    labels: { nav: n.label, open: n.menuOpen, close: n.menuClose, sites: n.sites },
    heroPaths: ["/zh"],
  };
}

export function footerProps(): FooterProps {
  const f = dict.footer;
  return {
    brand: dict.site.name,
    tagline: f.tagline,
    columns: [{ title: f.nav, links: dict.nav.links }],
    sites: { title: f.sites, links: marketSites("zh") },
    contact: {
      title: f.contact,
      email: QUOTE_EMAIL,
      emailLabel: f.email,
      locale: "zh",
      whatsappPrimary: false,
      whatsapp: { href: OFFICIAL_WHATSAPP_WA, label: f.whatsapp },
      phone: { number: OFFICIAL_PHONE, href: OFFICIAL_PHONE_HREF, label: f.phone },
    },
    entities: {
      title: f.entitiesTitle,
      items: [
        { badge: f.entityBadges.tr, name: CORPORATE_ENTITIES[0].name, address: CORPORATE_ENTITIES[0].address },
        {
          badge: f.entityBadges.us,
          name: CORPORATE_ENTITIES[1].name,
          address: CORPORATE_ENTITIES[1].address,
          duns: CORPORATE_ENTITIES[1].duns,
          aribaId: CORPORATE_ENTITIES[1].aribaId,
          aribaUrl: CORPORATE_ENTITIES[1].aribaUrl,
        },
      ],
    },
    rights: f.rights,
  };
}
