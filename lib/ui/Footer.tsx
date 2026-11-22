// footer.md — koyu zemin (brand), 4 kolon (1280) / 2 kolon (768) / 2 kolon kompakt (360).
// Not (brief sapması, bilinçli): 360'ta akordeon yerine 2 kolon — listeler kısa; <details> 768+'da CSS ile açılamıyor
// (Firefox ::details-content yok) → JS'siz, her BP'de aynı DOM.
import Link from "next/link";
import { Building2, Mail, MapPin, Phone } from "lucide-react";
import type { NavLink, SiteLink } from "./Navbar";
import Reveal from "./motion/Reveal";
import s from "./footer.module.css";

export type CorporateEntity = { badge: string; name: string; address: string };

export type FooterProps = {
  brand: string;
  tagline: string;
  columns: { title: string; links: NavLink[] }[];
  sites: { title: string; links: SiteLink[] };
  legal?: { title: string; links: NavLink[] };
  contact?: {
    title: string;
    email: string;
    emailLabel: string;
    phone?: { number: string; href: string; label: string };
  };
  entities?: { title: string; items: CorporateEntity[] };
  rights: string;
};

export default function Footer({ brand, tagline, columns, sites, legal, contact, entities, rights }: FooterProps) {
  const year = new Date().getFullYear(); // build yılı (static export)
  return (
    <footer className={`on-brand ${s.footer}`}>
      <div className={`container ${s.grid}`}>
        <div className={s.brandCol}>
          <div className={s.brandRow}>
            <span className={s.brandMark} aria-hidden="true">
              {/* eslint-disable-next-line @next/next/no-img-element -- static export (images.unoptimized); marka amblemi sabit boyut */}
              <img src="/media/brand/logo-white.png" alt="" width={28} height={28} className={s.brandImg} />
            </span>
            <p className={s.brand}>{brand}</p>
          </div>
          <p className={s.tagline}>{tagline}</p>
          {contact && <>
            <p className={s.colTitle}>{contact.title}</p>
            <div className={s.channels}>
              <a className={s.channel} href={`mailto:${contact.email}`} aria-label={`${contact.emailLabel}: ${contact.email}`}>
                <Mail aria-hidden="true" className={s.icon} />
                <span>{contact.email}</span>
              </a>
              {contact.phone && (
                <a className={s.channel} href={contact.phone.href} aria-label={`${contact.phone.label}: ${contact.phone.number}`}>
                  <Phone aria-hidden="true" className={s.icon} />
                  <bdi dir="ltr">{contact.phone.number}</bdi>
                </a>
              )}
            </div>
          </>}
        </div>
        {columns.map((c, i) => (
          <Reveal key={c.title} index={i + 1}>
          <nav aria-label={c.title} className={s.col}>
            <p className={s.colTitle}>{c.title}</p>
            <ul role="list">
              {c.links.map((l) => (
                <li key={l.href}><Link href={l.href} className={s.link}>{l.label}</Link></li>
              ))}
            </ul>
          </nav>
          </Reveal>
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
          {legal && <nav aria-label={legal.title} className={s.legal}>
            <p className={s.colTitle}>{legal.title}</p>
            <ul role="list">
              {legal.links.map((l) => (
                <li key={l.href}><Link href={l.href} className={s.link}>{l.label}</Link></li>
              ))}
            </ul>
          </nav>}
        </div>
      </div>

      {entities && entities.items.length > 0 && (
        <div className={`container ${s.entitiesWrap}`}>
          <p className={s.colTitle}>{entities.title}</p>
          <div className={s.entities}>
            {entities.items.map((ent) => (
              <div key={ent.name} className={s.entityCard}>
                <span className={s.entityBadge}>
                  <Building2 aria-hidden="true" className={s.entityIcon} />
                  {ent.badge}
                </span>
                <p className={s.entityName}>{ent.name}</p>
                <p className={s.entityAddr}>
                  <MapPin aria-hidden="true" className={s.entityIcon} />
                  <span>{ent.address}</span>
                </p>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className={`container ${s.bottom}`}>
        <span>© {year} {brand}. {rights}</span>
      </div>
    </footer>
  );
}
