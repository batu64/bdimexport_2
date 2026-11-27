// footer.md — koyu zemin (brand), 4 kolon (1280) / 2 kolon (768) / 2 kolon kompakt (360).
// Not (brief sapması, bilinçli): 360'ta akordeon yerine 2 kolon — listeler kısa; <details> 768+'da CSS ile açılamıyor
// (Firefox ::details-content yok) → JS'siz, her BP'de aynı DOM.
import Link from "next/link";
import { Building2, ExternalLink, MapPin, MessageCircle, Phone, ShieldCheck } from "lucide-react";
import type { NavLink, SiteLink } from "./Navbar";
import EmailSmartAction from "./EmailSmartAction";
import Reveal from "./motion/Reveal";
import s from "./footer.module.css";

export type CorporateEntity = {
  badge: string;
  name: string;
  address: string;
  duns?: string;
  aribaId?: string;
  aribaUrl?: string;
};

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
    locale?: string;
    whatsappPrimary?: boolean;
    whatsapp?: { href: string; label: string };
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
            <p className={s.brand}>{brand.toLowerCase()}</p>
          </div>
          <p className={s.tagline}>{tagline}</p>
          {contact && <>
            <p className={s.colTitle}>{contact.title}</p>
            <div className={s.channels}>
              {contact.whatsappPrimary && contact.whatsapp && (
                <a
                  className={`${s.channel} ${s.channelWa}`}
                  href={contact.whatsapp.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={`${contact.whatsapp.label}: ${contact.phone?.number ?? "WhatsApp"}`}
                >
                  <MessageCircle aria-hidden="true" className={s.icon} />
                  <span>{contact.whatsapp.label}</span>
                </a>
              )}
              <EmailSmartAction
                to={contact.email}
                label={contact.email}
                ariaLabel={`${contact.emailLabel}: ${contact.email}`}
                locale={contact.locale ?? "en"}
                variant="footer"
                whatsappHref={contact.whatsapp?.href}
                eventName={`footer_email_${contact.locale ?? "global"}`}
              />
              {!contact.whatsappPrimary && contact.whatsapp && (
                <a
                  className={`${s.channel} ${s.channelWa}`}
                  href={contact.whatsapp.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={`${contact.whatsapp.label}: ${contact.phone?.number ?? "WhatsApp"}`}
                >
                  <MessageCircle aria-hidden="true" className={s.icon} />
                  <span>{contact.whatsapp.label}</span>
                </a>
              )}
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
                <div className={s.entityTopRow}>
                  <span className={s.entityBadge}>
                    <Building2 aria-hidden="true" className={s.entityIcon} />
                    {ent.badge}
                  </span>
                  {(ent.duns || ent.aribaId) && (
                    <div className={s.entityPills}>
                      {ent.duns && (
                        <span className={s.dunsPill} dir="ltr">
                          <ShieldCheck aria-hidden="true" className={s.dunsIcon} />
                          <span>D-U-N-S® #: {ent.duns}</span>
                        </span>
                      )}
                      {ent.aribaId && ent.aribaUrl && (
                        <a
                          href={ent.aribaUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className={`${s.dunsPill} ${s.aribaLink}`}
                          dir="ltr"
                          data-clarity-event="footer_sap_ariba_verify"
                        >
                          <ShieldCheck aria-hidden="true" className={s.dunsIcon} />
                          <span>SAP Ariba®: {ent.aribaId}</span>
                          <ExternalLink aria-hidden="true" className={s.dunsIcon} />
                        </a>
                      )}
                    </div>
                  )}
                </div>
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
        <span>© {year} {brand.toLowerCase()}. {rights}</span>
      </div>
    </footer>
  );
}
