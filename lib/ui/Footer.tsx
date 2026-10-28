// footer.md — koyu zemin (brand), 4 kolon (1280) / 2 kolon (768) / 2 kolon kompakt (360).
// Not (brief sapması, bilinçli): 360'ta akordeon yerine 2 kolon — listeler kısa; <details> 768+'da CSS ile açılamıyor
// (Firefox ::details-content yok) → JS'siz, her BP'de aynı DOM. Kanal: yalnız e-posta (gerçek numara yok — uydurulmaz).
import Link from "next/link";
import { Mail } from "lucide-react";
import type { NavLink, SiteLink } from "./Navbar";
import s from "./footer.module.css";

export type FooterProps = {
  brand: string;
  tagline: string;
  columns: { title: string; links: NavLink[] }[];
  sites: { title: string; links: SiteLink[] };
  legal: { title: string; links: NavLink[] };
  contact: { title: string; email: string; emailLabel: string };
  rights: string;
};

export default function Footer({ brand, tagline, columns, sites, legal, contact, rights }: FooterProps) {
  const year = new Date().getFullYear(); // build yılı (static export)
  return (
    <footer className={`on-brand ${s.footer}`}>
      <div className={`container ${s.grid}`}>
        <div className={s.brandCol}>
          <p className={s.brand}>{brand}</p>
          <p className={s.tagline}>{tagline}</p>
          <p className={s.colTitle}>{contact.title}</p>
          <a className={s.channel} href={`mailto:${contact.email}`} aria-label={`${contact.emailLabel}: ${contact.email}`}>
            <Mail aria-hidden="true" className={s.icon} />
            <span>{contact.email}</span>
          </a>
        </div>
        {columns.map((c) => (
          <nav key={c.title} aria-label={c.title} className={s.col}>
            <p className={s.colTitle}>{c.title}</p>
            <ul role="list">
              {c.links.map((l) => (
                <li key={l.href}><Link href={l.href} className={s.link}>{l.label}</Link></li>
              ))}
            </ul>
          </nav>
        ))}
        <div className={s.col}>
          <nav aria-label={sites.title}>
            <p className={s.colTitle}>{sites.title}</p>
            <ul role="list">
              {sites.links.map((l) => (
                <li key={l.href}>
                  <a href={l.href} lang={l.lang} hrefLang={l.lang} className={s.link} aria-current={l.current ? "true" : undefined}>{l.label}</a>
                </li>
              ))}
            </ul>
          </nav>
          <nav aria-label={legal.title} className={s.legal}>
            <p className={s.colTitle}>{legal.title}</p>
            <ul role="list">
              {legal.links.map((l) => (
                <li key={l.href}><Link href={l.href} className={s.link}>{l.label}</Link></li>
              ))}
            </ul>
          </nav>
        </div>
      </div>
      <div className={`container ${s.bottom}`}>
        <span>© {year} {brand}. {rights}</span>
      </div>
    </footer>
  );
}
