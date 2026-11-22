// /de/anfrage — Angebotsanfrage (FAZ_5 5.6). Form yalnız DE_FORM_ENABLED iken (5.1 Datenschutz + hukuk onaylı rıza + E5 mail → 👤);
// kapalıyken dürüst e-posta yolu. Veri kategorileri listesi _lib/datenschutz.ts'ten (5.1 ile birebir). Yayın kapısı açılana dek noindex.
import type { Metadata } from "next";
import { Clock, ListChecks, Mail, MessageCircle } from "lucide-react";
import dict from "@/lib/messages/de.json";
import PageHeader from "@/lib/ui/PageHeader";
import Button from "@/lib/ui/Button";
import { quoteHref, whatsappHref } from "../_lib/chrome";
import { DE_DATA_CATEGORIES, DE_FORM_ENABLED } from "../_lib/datenschutz";
import QuoteForm from "./QuoteForm";
import s from "../de.module.css";

const t = dict.anfrage;

export const metadata: Metadata = {
  title: { absolute: `${t.title} | Bdimexport` },
  description: t.metaDesc,
  robots: { index: false, follow: true },
  alternates: { canonical: "https://bdimexport.com/de/anfrage" },
};

export default function AnfragePage() {
  const pg = dict.page;
  return (
    <main>
      <PageHeader crumbs={[{ label: pg.home, href: "/de" }, { label: t.title }]} crumbsLabel={pg.crumbs} eyebrow={dict.nav.cta} title={t.title} lead={t.lead} />
      <div className={`container section ${s.anfrage}`}>
        <div>
          {DE_FORM_ENABLED ? (
            <QuoteForm />
          ) : (
            <div className={s.pending} role="status">
              <span className={s.pendingChip}><Clock aria-hidden="true" className={s.pendingIcon} />{pg.pending}</span>
              <h2 className={s.pendingTitle}>{t.closedTitle}</h2>
              <p>{t.closedText}</p>
              <Button href={quoteHref} variant="primary" arrow>
                <Mail aria-hidden="true" className={s.pendingIcon} /> {t.closedCta}
              </Button>
              <Button href={whatsappHref} variant="secondary">
                <MessageCircle aria-hidden="true" className={s.pendingIcon} /> {t.whatsappCta}
              </Button>
            </div>
          )}
        </div>
        <aside aria-labelledby="kategorien" className={s.categories}>
          <h2 id="kategorien" className={s.categoriesTitle}><ListChecks aria-hidden="true" className={s.pendingIcon} />{t.categoriesTitle}</h2>
          <p>{t.categoriesLead}</p>
          <ul>
            {DE_DATA_CATEGORIES.map((c) => <li key={c.key}>{t.categories[c.key]}</li>)}
          </ul>
          <a href="/de/datenschutz">{t.consentMore}</a>
        </aside>
      </div>
    </main>
  );
}
