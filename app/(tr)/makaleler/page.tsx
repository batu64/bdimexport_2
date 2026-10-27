// /makaleler — FAZ_4 4.6 makale dizini (İçerik Fabrikası → bot PR → merge ile gelen içerikler) + edge haber kartları.
import type { Metadata } from "next";
import { InsightList } from "@/lib/ui/insights";
import NewsCards from "@/app/components/NewsCards";
import { pageMainStyle, trAlternates } from "../_lib/content";

export const metadata: Metadata = {
  title: { absolute: "Makaleler: İthalat ve İhracat Rehberleri | Bdimexport" },
  description: "Türkiye'den ihracat, Çin'den ithalat ve B2B tedarik üzerine kaynaklı rehberler. Her makale insan onayından geçer; rakamlar kaynağına bağlıdır.",
  alternates: trAlternates("/makaleler"),
};

export default function MakalelerPage() {
  return (
    <main style={pageMainStyle()}>
      <h1>Makaleler</h1>
      <InsightList scope="tr" empty="Henüz yayınlanmış makale yok. Yeni rehberler insan onayından geçtikçe burada listelenir." />
      <NewsCards locale="tr" />
    </main>
  );
}
