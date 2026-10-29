// /zh site çerçevesi (navbar + footer) — metin lib/messages/zh.json (简体字). Birincil kanal WeChat (#wechat kartı).
// ICP vaadi YOK (Cloudflare HK — agents/zh-agent.md §6.3). Gizlilik sayfası henüz yok → yasal kolon yok (404'a link verilmez).
import type { FooterProps } from "@/lib/ui/Footer";
import type { NavbarProps } from "@/lib/ui/Navbar";
import { marketSites } from "@/lib/ui/sites";
import dict from "@/lib/messages/zh.json";

export const QUOTE_EMAIL = process.env.NEXT_PUBLIC_QUOTE_EMAIL ?? "iletisim@bdimexport.com";

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
    contact: { title: f.contact, email: QUOTE_EMAIL, emailLabel: f.email },
    rights: f.rights,
  };
}
