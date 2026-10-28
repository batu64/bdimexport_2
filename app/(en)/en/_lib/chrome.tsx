// /en global site çerçevesi (navbar + footer) — metin lib/messages/en.json, hizmet/sektör/kategori linkleri İÇERİK modüllerinden.
// Pazar/dil seçici: 4 pazar sitesi + 5 EN dil varyantı (her biri kendi ana sayfasına; hreflang alternatifi değil, site seçimi).
import { enVariants, localeConfig, type Locale } from "@/lib/i18n";
import type { FooterProps } from "@/lib/ui/Footer";
import type { NavbarProps, SiteLink } from "@/lib/ui/Navbar";
import { VARIANTS } from "@/lib/ui/variants";
import dict from "@/lib/messages/en.json";
import { SERVICES } from "./services";
import { INDUSTRIES } from "../industries/_lib/industries";

const SITE_HOME: Record<Locale, string> = { tr: "/", en: "/en", de: "/de", zh: "/zh" };
const ORDER: Locale[] = ["tr", "en", "de", "zh"];

export const QUOTE_EMAIL = process.env.NEXT_PUBLIC_QUOTE_EMAIL ?? "iletisim@bdimexport.com";
/** Teklif kanalı: gerçek e-posta (form/endpoint henüz yok — sahte form yazılmaz). context: hangi sayfadan */
export const quoteHref = (context?: string) =>
  `mailto:${QUOTE_EMAIL}?subject=${encodeURIComponent(context ? `Quotation request: ${context}` : dict.quote.subject)}&body=${encodeURIComponent(dict.quote.body)}`;

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
    heroPaths: ["/en"],
  };
}

export function footerProps(): FooterProps {
  const f = dict.footer;
  return {
    brand: dict.site.name,
    tagline: f.tagline,
    columns: [
      { title: f.services, links: SERVICES.map((s) => ({ label: s.label, href: `/en/services/${s.slug}` })) },
      { title: f.industries, links: [...INDUSTRIES.map((i) => ({ label: i.label, href: `/en/industries/${i.slug}` })), { label: f.products, href: "/en/products" }] },
    ],
    sites: { title: f.sites, links: enSites("en") },
    contact: { title: f.contact, email: QUOTE_EMAIL, emailLabel: f.email },
    rights: f.rights,
  };
}
