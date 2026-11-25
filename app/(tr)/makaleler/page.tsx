// /makaleler — FAZ_4 4.6 makale dizini (İçerik Fabrikası → bot PR → merge ile gelen içerikler) + edge haber kartları.
import type { Metadata } from "next";
import { InsightList, listInsights } from "@/lib/ui/insights";
import NewsCards from "@/app/components/NewsCards";
import PageHeader from "@/lib/ui/PageHeader";
import dict from "@/lib/messages/tr.json";
import { trAlternates } from "../_lib/content";

export const metadata: Metadata = {
  title: { absolute: "İthalat, İhracat ve Gümrük Rehberleri | bdimexport" },
  description: "Çin'den mal getirme, Kanton Fuarı, gümrük vergileri, CBAM, mikro ihracat ve devlet destekleri üzerine kaynaklı B2B rehberler.",
  alternates: trAlternates("/makaleler"),
  ...(listInsights("tr").length ? {} : { robots: { index: false, follow: true } }),
};

export default function MakalelerPage() {
  return (
    <main>
      <PageHeader
        crumbs={[{ label: dict.content.home, href: "/" }, { label: dict.articles.title }]}
        crumbsLabel={dict.page.crumbs}
        eyebrow={dict.articles.eyebrow}
        title={dict.articles.title}
        lead={dict.articles.lead}
      />
      <div className="container section">
        <InsightList scope="tr" empty={dict.articles.empty} more={dict.page.read} />
        <NewsCards locale="tr" />
      </div>
    </main>
  );
}
