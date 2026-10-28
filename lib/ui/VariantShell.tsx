// EN varyant ortak kabuğu (D5): lang/dir + bölgesel kanal şeridi (ChannelCta) + ortak Navbar (dil seçici = LangSwitcher listbox)
// + ortak Footer. 5 varyant layout.tsx'i yalnızca <VariantShell variant="xx"> sarar; metinler lib/messages/variants/{v}.json.
// Kanal linkleri gerçek handle gelene dek #contact çapası (uydurma wa.me/t.me/mailto YASAK — smoke test doğrular).
import type { ReactNode } from "react";
import styles from "./variant.module.css";
import ChannelCta from "./ChannelCta";
import LangSwitcher from "./LangSwitcher";
import Navbar from "./Navbar";
import Footer from "./Footer";
import { VARIANTS, switcherItems } from "./variants";
import type { EnVariant } from "../i18n";

export default function VariantShell({ variant, children }: { variant: EnVariant; children: ReactNode }) {
  const v = VARIANTS[variant];
  const base = `/en/${variant}`;
  const links = [
    { label: v.home, href: base },
    { label: v.sourcing.label, href: `${base}/services/sourcing` },
    { label: v.insights, href: `${base}/insights` },
  ];
  const switcher = <LangSwitcher itemsByPage={{ home: switcherItems("home"), sourcing: switcherItems("sourcing") }} currentCode={variant} label={v.switcherLabel} />;
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
      <div id="content" tabIndex={-1}>{children}</div>
      <Footer
        brand="Bdimexport"
        tagline={v.tagline}
        columns={[{ title: v.navLabel, links: [...links, { label: "English", href: "/en" }] }]}
        sites={{ title: v.languages, links: switcherItems("home").map((i) => ({ label: i.label, href: i.href, lang: i.lang, current: i.code === variant })) }}
        rights={v.rights}
      />
    </div>
  );
}
