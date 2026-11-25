"use client";
// navbar.md — sticky; hero sayfalarında koyu hero üstünde şeffaf başlar, kaydırınca yüzey + gölge + kısalma (shrink).
// Mobil (<1280): hamburger → tam ekran sheet (aria-expanded/controls, ESC, odak tuzağı, kaydırma kilidi).
// Pazar/dil seçici: site ana sayfaları (her pazar ayrı site; hreflang alternatifi değil) — disclosure deseni.
// Animasyonlar CSS (transform/opacity); JS yalnız durum bayrakları için. reduced-motion globals.css'te kapanır.
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useCallback, useEffect, useId, useRef, useState } from "react";
import clsx from "clsx";
import { Check, ChevronDown, Globe, Menu, X } from "lucide-react";
import { space } from "./tokens";
import s from "./navbar.module.css";

export type NavLink = { label: string; href: string };
export type SiteLink = { label: string; href: string; lang: string; current?: boolean };

export type NavbarProps = {
  brand: string;
  homeHref: string;
  homeLabel: string;
  links: NavLink[];
  cta: { label: string; href: string };
  sites: SiteLink[];
  labels: { nav: string; open: string; close: string; sites: string };
  /** Bu yollarda navbar koyu hero üstünde şeffaf başlar */
  heroPaths?: string[];
  /** Verilirse yerleşik pazar menüsü yerine bu dil seçici (tek kez, tüm genişliklerde) kullanılır */
  switcher?: React.ReactNode;
};

const SCROLL_SOLID = space.s6;
const isExternal = (href: string) => /^(mailto:|tel:|https?:)/.test(href);

/** İç rota → <Link>, mailto/harici → <a> */
function Go({ href, className, children }: { href: string; className: string; children: React.ReactNode }) {
  return isExternal(href) ? <a href={href} className={className}>{children}</a> : <Link href={href} className={className}>{children}</Link>;
}

export default function Navbar({ brand, homeHref, homeLabel, links, cta, sites, labels, heroPaths = [], switcher }: NavbarProps) {
  const pathname = usePathname() ?? "/";
  const overHero = heroPaths.includes(pathname);
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);
  const [sitesOpen, setSitesOpen] = useState(false);
  const sheetId = useId();
  const sitesId = useId();
  const toggleRef = useRef<HTMLButtonElement>(null);
  const sheetRef = useRef<HTMLDivElement>(null);
  const sitesRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > SCROLL_SOLID);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const close = useCallback((restoreFocus = true) => {
    setOpen(false);
    if (restoreFocus) toggleRef.current?.focus();
  }, []);

  // rota değişince menüler kapanır
  useEffect(() => { setOpen(false); setSitesOpen(false); }, [pathname]);

  // sheet: kaydırma kilidi + ESC + odak tuzağı
  useEffect(() => {
    if (!open) return;
    const prev = document.documentElement.style.overflow;
    document.documentElement.style.overflow = "hidden";
    const focusables = () => Array.from(sheetRef.current?.querySelectorAll<HTMLElement>("a, button") ?? []);
    focusables()[0]?.focus();
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") close();
      if (e.key !== "Tab") return;
      const f = focusables();
      if (!f.length) return;
      const first = f[0], last = f[f.length - 1];
      if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
      else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
    };
    document.addEventListener("keydown", onKey);
    return () => { document.documentElement.style.overflow = prev; document.removeEventListener("keydown", onKey); };
  }, [open, close]);

  // masaüstü pazar menüsü: dışarı tık + ESC
  useEffect(() => {
    if (!sitesOpen) return;
    const onDoc = (e: MouseEvent) => { if (!sitesRef.current?.contains(e.target as Node)) setSitesOpen(false); };
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") setSitesOpen(false); };
    document.addEventListener("mousedown", onDoc);
    document.addEventListener("keydown", onKey);
    return () => { document.removeEventListener("mousedown", onDoc); document.removeEventListener("keydown", onKey); };
  }, [sitesOpen]);

  const isActive = (href: string) => pathname === href || pathname.startsWith(href + "/");
  const transparent = overHero && !scrolled && !open;
  const current = sites.find((x) => x.current);

  return (
    <header className={clsx(s.bar, transparent ? s.transparent : s.solid, scrolled && s.compact)} data-open={open || undefined}>
      <div className={clsx("container", s.inner)}>
        <Link href={homeHref} className={s.brand} aria-label={homeLabel}>
          <span className={s.mark} aria-hidden="true">
            {/* eslint-disable-next-line @next/next/no-img-element -- static export (images.unoptimized); marka amblemi sabit boyut */}
            <img src="/media/brand/logo-white.png" alt="" width={28} height={28} className={s.markImg} />
          </span>
          <span>{brand.toLowerCase()}</span>
        </Link>

        <nav aria-label={labels.nav} className={s.desktopNav}>
          <ul role="list" className={s.links}>
            {links.map((l) => (
              <li key={l.href}>
                <Link href={l.href} className={s.link} aria-current={isActive(l.href) ? "page" : undefined}>{l.label}</Link>
              </li>
            ))}
          </ul>
        </nav>

        <div className={s.actions}>
          {switcher ? <div className={s.switcher}>{switcher}</div> : (
          <div className={s.sites} ref={sitesRef}>
            <button
              type="button"
              className={s.sitesBtn}
              aria-expanded={sitesOpen}
              aria-controls={sitesId}
              aria-label={`${labels.sites}: ${current?.label ?? ""}`}
              onClick={() => setSitesOpen((o) => !o)}
            >
              <Globe aria-hidden="true" className={s.icon} />
              <span className={s.sitesCurrent}>{current?.lang.slice(0, 2).toUpperCase()}</span>
              <ChevronDown aria-hidden="true" className={clsx(s.icon, s.chev)} />
            </button>
            <ul role="list" id={sitesId} className={s.sitesMenu} hidden={!sitesOpen}>
              {sites.map((x) => (
                <li key={x.href}>
                  <a href={x.href} lang={x.lang} hrefLang={x.lang} aria-current={x.current ? "true" : undefined} className={s.siteItem}>
                    <span>{x.label}</span>
                    {x.current && <Check aria-hidden="true" className={s.icon} />}
                  </a>
                </li>
              ))}
            </ul>
          </div>
          )}
          <Go href={cta.href} className={s.cta}>{cta.label}</Go>
          <button
            ref={toggleRef}
            type="button"
            className={s.toggle}
            aria-expanded={open}
            aria-controls={sheetId}
            aria-label={open ? labels.close : labels.open}
            onClick={() => (open ? close(false) : setOpen(true))}
          >
            {open ? <X aria-hidden="true" className={s.icon} /> : <Menu aria-hidden="true" className={s.icon} />}
          </button>
        </div>
      </div>

      <div id={sheetId} ref={sheetRef} className={s.sheet} hidden={!open}>
        <nav aria-label={labels.nav} className="container">
          <ul role="list" className={s.sheetLinks}>
            {links.map((l, i) => (
              <li key={l.href} style={{ "--i": i } as React.CSSProperties}>
                <Link href={l.href} className={s.sheetLink} aria-current={isActive(l.href) ? "page" : undefined}>{l.label}</Link>
              </li>
            ))}
          </ul>
          <Go href={cta.href} className={s.sheetCta}>{cta.label}</Go>
          {!switcher && <p className={s.sheetLabel}>{labels.sites}</p>}
          {!switcher && <ul role="list" className={s.sheetSites}>
            {sites.map((x) => (
              <li key={x.href}>
                <a href={x.href} lang={x.lang} hrefLang={x.lang} aria-current={x.current ? "true" : undefined} className={s.siteItem}>
                  <span>{x.label}</span>
                  {x.current && <Check aria-hidden="true" className={s.icon} />}
                </a>
              </li>
            ))}
          </ul>}
        </nav>
      </div>
    </header>
  );
}
