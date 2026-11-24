// EN varyant ortak kabuğu (D5): lang/dir + bölgesel kanal şeridi (ChannelCta) + ortak Navbar (dil seçici = LangSwitcher listbox)
// + ortak Footer (tüzel kişilikler metin olarak; tel:/mailto:/wa.me linki YOK — smoke test invariantı).
import type { ReactNode } from "react";
import styles from "./variant.module.css";
import ChannelCta from "./ChannelCta";
import LangSwitcher from "./LangSwitcher";
import Navbar from "./Navbar";
import Footer from "./Footer";
import SmartLocaleBanner from "./SmartLocaleBanner";
import PageTransition from "./motion/PageTransition";
import { CORPORATE_ENTITIES } from "./entities";
import { VARIANTS, switcherItems } from "./variants";
import type { EnVariant } from "../i18n";

export default function VariantShell({ variant, children }: { variant: EnVariant; children: ReactNode }) {
  const v = VARIANTS[variant];
  const base = `/en/${variant}`;
  const links = [
    { label: v.home, href: base },
    ...(variant === "ar" ? [{ label: "أعمدة الكهرباء الخشبية", href: `${base}/wooden-utility-poles` }] : []),
    { label: v.sourcing.label, href: `${base}/services/sourcing` },
    { label: v.inspection.label, href: `${base}/services/inspection` },
    { label: v.insights, href: `${base}/insights` },
  ];
  const switcher = (
    <LangSwitcher
      itemsByPage={{
        home: switcherItems("home"),
        sourcing: switcherItems("sourcing"),
        inspection: switcherItems("inspection"),
      }}
      currentCode={variant}
      label={v.switcherLabel}
    />
  );
  return (
    <div lang={v.lang} dir={v.dir} className={styles.shell}>
      <a href="#content" className="skip-link">{v.skip}</a>
      <div className={`on-brand ${styles.ctaBar}`}>
        <div className="container">
          <ChannelCta variant={variant} />
        </div>
      </div>
      <Navbar
        brand="Bdimexport"
        homeHref={base}
        homeLabel={`Bdimexport — ${v.home}`}
        links={links}
        cta={{ label: v.contact.title, href: "#contact" }}
        sites={[]}
        labels={{ nav: v.navLabel, open: v.menuOpen, close: v.menuClose, sites: v.switcherLabel }}
        heroPaths={[base]}
        switcher={switcher}
      />
      <div id="content" tabIndex={-1}><PageTransition>{children}</PageTransition></div>
      <Footer
        brand="Bdimexport"
        tagline={v.tagline}
        columns={[{ title: v.navLabel, links: [...links, { label: "English", href: "/en" }, { label: "Smart RFQ", href: "/en/rfq" }] }]}
        sites={{ title: v.languages, links: switcherItems("home").map((i) => ({ label: i.label, href: i.href, lang: i.lang, current: i.code === variant })) }}
        entities={{
          title: "BDIMEXPORT",
          items: [
            {
              badge: "USA",
              name: CORPORATE_ENTITIES[1].name,
              address: CORPORATE_ENTITIES[1].address,
              duns: CORPORATE_ENTITIES[1].duns,
              aribaId: CORPORATE_ENTITIES[1].aribaId,
              aribaUrl: CORPORATE_ENTITIES[1].aribaUrl,
            },
            { badge: "TR", name: CORPORATE_ENTITIES[0].name, address: CORPORATE_ENTITIES[0].address },
          ],
        }}
        rights={v.rights}
      />
      <SmartLocaleBanner currentLocale={variant} />
    </div>
  );
}
