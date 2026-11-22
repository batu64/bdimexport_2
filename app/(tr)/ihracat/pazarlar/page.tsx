// /ihracat/pazarlar — Türk Üreticiler İçin Hedef İhracat Ülke Koridorları Merkezi (SEO + GEO)
import type { Metadata } from "next";
import { Globe2 } from "lucide-react";
import PageHeader from "@/lib/ui/PageHeader";
import { Section, SectionHeader } from "@/lib/ui/Section";
import Card from "@/lib/ui/Card";
import Button from "@/lib/ui/Button";
import CtaBand from "@/lib/ui/CtaBand";
import Reveal from "@/lib/ui/motion/Reveal";
import grid from "@/lib/ui/cardgrid.module.css";
import { buildAlternateSet, toMetadataAlternates } from "@/lib/hreflang";
import { SeoJsonLd, SITE_URL, buildHubGraph, defaultOpenGraph } from "@/lib/seo/schema";
import { APPLY_PATH } from "../../_lib/links";
import { TR_EXPORT_CORRIDORS } from "../../_lib/tr-seo-data";

const URL = `${SITE_URL}/ihracat/pazarlar`;
const TITLE = "Hedef İhracat Pazarları ve Ülke Koridorları | Bdimexport";
const DESC =
  "Almanya, ABD, İngiltere, BAE, Suudi Arabistan, Fransa, Hollanda, Polonya, Romanya, İtalya ve Balkanlar için gümrük avantajı ve alıcı bulma koridorları.";

export const metadata: Metadata = {
  title: { absolute: TITLE },
  description: DESC,
  alternates: {
    canonical: URL,
    ...toMetadataAlternates(buildAlternateSet("ihracat/pazarlar", ["tr"])),
  },
  ...defaultOpenGraph({ title: TITLE, description: DESC, url: URL, locale: "tr_TR" }),
};

export default function TrExportMarketsHubPage() {
  const graph = buildHubGraph({
    url: URL,
    inLanguage: "tr-TR",
    name: TITLE,
    description: DESC,
    services: TR_EXPORT_CORRIDORS.map((c) => ({
      name: c.h1,
      url: `${SITE_URL}/ihracat/pazarlar/${c.slug}`,
      description: c.metaDesc,
    })),
  });

  return (
    <main>
      <SeoJsonLd graph={graph} />
      <PageHeader
        crumbs={[
          { label: "Ana Sayfa", href: "/" },
          { label: "İhracat", href: "/ihracat" },
          { label: "Hedef Pazarlar" },
        ]}
        crumbsLabel="Sayfa yolu"
        eyebrow="Ülke Bazlı İhracat ve Alıcı İstihbarat Koridorları"
        title="Türk Üreticiler İçin Hedef Ülke İhracat Sistemleri"
        lead="Ürününüzün gümrük avantajına (A.TR, TR-UK STA, TR-BAE CEPA, ABD Section 301 makası), lojistik süresine ve yerel dil vitrinine göre en karlı ihracat koridorunu seçin."
        actions={
          <Button href={APPLY_PATH} variant="primary" size="lg" arrow>
            Ücretsiz İhracat Başvurusu
          </Button>
        }
      />

      <Section id="pazar-koridorlari">
        <Reveal>
          <SectionHeader
            id="pazar-koridorlari"
            eyebrow="8 Stratejik İhracat Koridoru"
            title="Ülke Gümrük Rejimleri, Sertifikalar ve Çok Dilli Alıcı Vitrinleri"
            lead="Her koridor sayfası ilgili ülkedeki yabancı alıcı vitrinimizle doğrudan entegre çalışır."
          />
        </Reveal>
        <ul role="list" className={grid.grid}>
          {TR_EXPORT_CORRIDORS.map((c, idx) => (
            <Reveal as="li" key={c.slug} index={idx % 3}>
              <Card
                title={c.countryTitle}
                href={`/ihracat/pazarlar/${c.slug}`}
                description={`${c.regionBadge} — ${c.metaDesc}`}
                icon={<Globe2 />}
                more="Koridoru incele"
              />
            </Reveal>
          ))}
        </ul>
      </Section>

      <CtaBand
        title="Firmanıza Özel Hedef Ülke ve Alıcı Teklifi Hazırlayalım"
        lead="Ücretsiz İhracat Hızlandırma Programına başvurun veya kurumsal teklif şablonlarımızı inceleyin."
        primary={{ label: "Akıllı RFQ Başlat (24s)", href: "/rfq" }}
        secondary={{ label: "Kurumsal Teklif Şablonları", href: "/teklif" }}
      />
    </main>
  );
}
