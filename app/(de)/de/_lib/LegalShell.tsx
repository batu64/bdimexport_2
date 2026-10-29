// /de hukuki sayfa kabuğu (Impressum / Datenschutz) — FAZ_5 5.1 onaylı + insan imzalı metin gelene dek İÇERİK YOK.
// Hukuki metin UYDURULMAZ; sayfa noindex (metadata), footer linkleri sabit konumda hazır. Metin gelince prose ile render edilir.
import { Clock, Mail } from "lucide-react";
import PageHeader from "@/lib/ui/PageHeader";
import Button from "@/lib/ui/Button";
import dict from "@/lib/messages/de.json";
import { QUOTE_EMAIL } from "./chrome";
import s from "../de.module.css";

export default function LegalShell({ title, lead }: { title: string; lead: string }) {
  const pg = dict.page;
  return (
    <main>
      <PageHeader crumbs={[{ label: pg.home, href: "/de" }, { label: pg.legal }, { label: title }]} crumbsLabel={pg.crumbs} eyebrow={pg.legal} title={title} lead={lead} />
      <div className="container section">
        <div className={s.pending} role="status">
          <span className={s.pendingChip}><Clock aria-hidden="true" className={s.pendingIcon} />{pg.pending}</span>
          <p>{pg.legalPending}</p>
          <Button href={`mailto:${QUOTE_EMAIL}`} variant="secondary" arrow>
            <Mail aria-hidden="true" className={s.pendingIcon} /> {pg.contactCta}
          </Button>
        </div>
      </div>
    </main>
  );
}
