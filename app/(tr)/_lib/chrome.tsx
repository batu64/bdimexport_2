// TR site çerçevesi (navbar + footer) verisi — metin sözlükten (lib/messages/tr.json), hizmet linkleri İÇERİKTEN
// (content/tr/**/*.md başlıkları; elle liste tutulmaz → yeni hizmet sayfası footer'a kendiliğinden girer).
import { localeConfig, type Locale } from "@/lib/i18n";
import type { FooterProps } from "@/lib/ui/Footer";
import type { NavbarProps, SiteLink } from "@/lib/ui/Navbar";
import dict from "@/lib/messages/tr.json";
import { listSlugs, readDoc, type Kind } from "./content";
import { QUOTE_EMAIL, quoteHref } from "./links";

export { quoteHref };

const SITE_HOME: Record<Locale, string> = { tr: "/", en: "/en", de: "/de", zh: "/zh" };
const ORDER: Locale[] = ["tr", "en", "de", "zh"];

export function sites(current: Locale): SiteLink[] {
  return ORDER.map((l) => ({ label: localeConfig[l].label, href: SITE_HOME[l], lang: localeConfig[l].hreflang, current: l === current }));
}

/** Hizmet sayfaları: { slug, title, desc } — ana sayfa kartları ve footer aynı kaynaktan */
export function services(kind: Exclude<Kind, "rehber">) {
  const base = kind === "ithalat" ? "/ithalat" : "/ihracat";
  return listSlugs(kind).flatMap((slug) => {
    const d = readDoc(kind, slug);
    return d ? [{ slug, href: `${base}/${slug}`, title: d.title.replace(/\s*\((Sourcing|Inspection)\)/, ""), desc: d.desc ?? "" }] : [];
  });
}

export function navbarProps(): NavbarProps {
  const n = dict.nav;
  return {
    brand: dict.site.name,
    homeHref: "/",
    homeLabel: n.home,
    links: n.links,
    cta: { label: n.cta, href: quoteHref },
    sites: sites("tr"),
    labels: { nav: n.label, open: n.menuOpen, close: n.menuClose, sites: n.sites },
    heroPaths: ["/"],
  };
}

export function footerProps(): FooterProps {
  const f = dict.footer;
  const link = (x: { title: string; href: string }) => ({ label: x.title, href: x.href });
  return {
    brand: dict.site.name,
    tagline: f.tagline,
    columns: [
      { title: f.import, links: [...services("ithalat").map(link), { label: dict.content.guides, href: "/ithalat/rehberler" }] },
      { title: f.export, links: services("ihracat").map(link) },
    ],
    sites: { title: f.sites, links: sites("tr") },
    legal: { title: f.legal, links: [{ label: f.kvkk, href: "/kvkk-riza" }] },
    contact: { title: f.contact, email: QUOTE_EMAIL, emailLabel: f.email },
    rights: f.rights,
  };
}
