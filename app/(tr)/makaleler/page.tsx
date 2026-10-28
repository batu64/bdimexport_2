// /makaleler — FAZ_4 4.6 makale dizini (İçerik Fabrikası → bot PR → merge ile gelen içerikler) + edge haber kartları.
import type { Metadata } from "next";
import { InsightList } from "@/lib/ui/insights";
import NewsCards from "@/app/components/NewsCards";
import PageHeader from "@/lib/ui/PageHeader";
import dict from "@/lib/messages/tr.json";
import { trAlternates } from "../_lib/content";

export const metadata: Metadata = {
  title: { absolute: "Makaleler: İthalat ve İhracat Rehberleri | Bdimexport" },
  description: "Türkiye'den ihracat, Çin'den ithalat ve B2B tedarik üzerine kaynaklı rehberler. Her makale insan onayından geçer; rakamlar kaynağına bağlıdır.",
  alternates: trAlternates("/makaleler"),
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
        <InsightList scope="tr" empty={dict.articles.empty} />
        <NewsCards locale="tr" />
      </div>
    </main>
  );
}
