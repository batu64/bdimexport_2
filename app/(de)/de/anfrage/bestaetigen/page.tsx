// /de/anfrage/bestaetigen — çift opt-in onay sayfası (statik kabuk; doğrulama istemcide, token #fragment'te). noindex.
import type { Metadata } from "next";
import dict from "@/lib/messages/de.json";
import PageHeader from "@/lib/ui/PageHeader";
import ConfirmOptin from "./ConfirmOptin";

const t = dict.anfrage.confirm;

export const metadata: Metadata = {
  title: { absolute: `${t.title} | Bdimexport` },
  description: t.lead,
  robots: { index: false, follow: false },
  referrer: "no-referrer",
};

export default function BestaetigenPage() {
  const pg = dict.page;
  return (
    <main>
      <PageHeader crumbs={[{ label: pg.home, href: "/de" }, { label: dict.anfrage.title, href: "/de/anfrage" }, { label: t.title }]} crumbsLabel={pg.crumbs} title={t.title} lead={t.lead} />
      <div className="container section">
        <ConfirmOptin />
      </div>
    </main>
  );
}
