// /teklif — Kurumsal İş Teklifi Şablonları + Şirketlere Özel Hedefli Teklif Linki & E-Posta Kurucu (TR / EN / DE / ZH)
import type { Metadata } from "next";
import { FileCheck2 } from "lucide-react";
import PageHeader from "@/lib/ui/PageHeader";
import { Section, SectionHeader } from "@/lib/ui/Section";
import Card from "@/lib/ui/Card";
import Button from "@/lib/ui/Button";
import Reveal from "@/lib/ui/motion/Reveal";
import grid from "@/lib/ui/cardgrid.module.css";
import { buildAlternateSet, toMetadataAlternates } from "@/lib/hreflang";
import { DE_PROPOSAL, EN_PROPOSALS, ZH_PROPOSAL } from "@/lib/seo/proposals";
import ProposalLinkBuilder, { type BuilderTemplateOption } from "@/lib/seo/ProposalLinkBuilder";
import { SeoJsonLd, SITE_URL, buildHubGraph, defaultOpenGraph } from "@/lib/seo/schema";
import { TR_PROPOSALS } from "../_lib/tr-seo-data";

const URL = `${SITE_URL}/teklif`;
const TITLE = "Kurumsal İş Teklifi Şablonları ve Link Kurucu | Bdimexport";
const DESC =
  "Şirketlere gönderilen iş teklifi e-postaları için kişiselleştirilebilir ihracat büyüme, konteyner yükleme denetimi ve ticari istihbarat teklif sayfaları.";

export const metadata: Metadata = {
  title: { absolute: TITLE },
  description: DESC,
  alternates: {
    canonical: URL,
    ...toMetadataAlternates(buildAlternateSet("teklif", ["tr"])),
  },
  ...defaultOpenGraph({ title: TITLE, description: DESC, url: URL, locale: "tr_TR" }),
};

const ALL_BUILDER_OPTIONS: BuilderTemplateOption[] = [
  ...TR_PROPOSALS.map((p) => ({
    id: `tr-${p.slug}`,
    lang: "tr" as const,
    label: `[TR] ${p.h1}`,
    fullBasePath: `/teklif/${p.slug}`,
    shortBasePath: `/t/${p.slug}`,
    subjectTpl: p.emailTemplate.subject,
    bodyTpl: p.emailTemplate.body,
  })),
  ...EN_PROPOSALS.map((p) => ({
    id: `en-${p.slug}`,
    lang: "en" as const,
    label: `[EN · Global] ${p.h1}`,
    fullBasePath: `/en/proposals/${p.slug}`,
    shortBasePath: `/p/${p.slug}`,
    subjectTpl: p.emailTemplate.subject,
    bodyTpl: p.emailTemplate.body,
  })),
  {
    id: `de-${DE_PROPOSAL.slug}`,
    lang: "de" as const,
    label: `[DE · DACH] ${DE_PROPOSAL.h1}`,
    fullBasePath: `/de/angebot/${DE_PROPOSAL.slug}`,
    shortBasePath: `/de/angebot/${DE_PROPOSAL.slug}`,
    subjectTpl: DE_PROPOSAL.emailTemplate.subject,
    bodyTpl: DE_PROPOSAL.emailTemplate.body,
  },
  {
    id: `zh-${ZH_PROPOSAL.slug}`,
    lang: "zh" as const,
    label: `[ZH · Çin] ${ZH_PROPOSAL.h1}`,
    fullBasePath: `/zh/fangan/${ZH_PROPOSAL.slug}`,
    shortBasePath: `/zh/fangan/${ZH_PROPOSAL.slug}`,
    subjectTpl: ZH_PROPOSAL.emailTemplate.subject,
    bodyTpl: ZH_PROPOSAL.emailTemplate.body,
  },
];

export default function TrProposalsHubPage() {
  const graph = buildHubGraph({
    url: URL,
    inLanguage: "tr-TR",
    name: TITLE,
    description: DESC,
    services: TR_PROPOSALS.map((p) => ({
      name: p.h1,
      url: `${SITE_URL}/teklif/${p.slug}`,
      description: p.metaDesc,
    })),
  });

  return (
    <main>
      <SeoJsonLd graph={graph} />
      <PageHeader
        crumbs={[{ label: "Ana Sayfa", href: "/" }, { label: "Kurumsal Teklifler" }]}
        crumbsLabel="Sayfa yolu"
        eyebrow="Hedefli B2B Teklif Mimarisi · TR / EN / DE / ZH"
        title="Şirketlere Özel Hedefli İş Teklifi Sayfaları ve Link Üreteci"
        lead="Yerli veya yabancı şirketlere göndereceğiniz iş teklifi e-postalarında genel ana sayfa yerine karşı firmanın adıyla açılan ve Akıllı RFQ formunu otomatik dolduran yüksek dönüşümlü teklif bağlantıları oluşturun."
        actions={
          <Button href="#kurucu" variant="primary" size="lg" arrow>
            Hedefli Teklif Linki Oluştur
          </Button>
        }
      />

      <Section id="sablonlar">
        <Reveal>
          <SectionHeader
            id="sablonlar"
            eyebrow="4 Ana Türkiye Teklif Modülü"
            title="Hazır Kurumsal İş Teklifi Şablonları"
            lead="Her şablon kendi başına SEO/GEO uyumlu bir iniş sayfasıdır; URL parametreleriyle gönderildiğinde ise karşı firmaya özel kişiselleştirilir."
          />
        </Reveal>
        <ul role="list" className={grid.grid}>
          {TR_PROPOSALS.map((p, idx) => (
            <Reveal as="li" key={p.slug} index={idx % 3}>
              <Card
                title={p.h1}
                href={`/teklif/${p.slug}`}
                description={`${p.slaText} — ${p.metaDesc}`}
                icon={<FileCheck2 />}
                more="Teklif sayfasını aç"
              />
            </Reveal>
          ))}
        </ul>
      </Section>

      <Section id="kurucu" tone="alt">
        <ProposalLinkBuilder
          options={ALL_BUILDER_OPTIONS}
          copy={{
            eyebrow: "Çok Dilli Outbound Teklif Kurucu (TR · EN · DE · ZH)",
            title: "Şirkete Özel Teklif Bağlantısı ve Hazır E-Posta Metni Üretin",
            lead: "Hedef şirketin adını, ülkesini ve ürün grubunu girin; sistem hem kısa e-posta bağlantısını (/t/... veya /p/...) hem de kopyalamaya hazır kurumsal teklif e-postasını anında oluşturur.",
            templateLabel: "Teklif Dili ve Şablonu",
            companyLabel: "Hedef Şirket Unvanı",
            companyPlaceholder: "Örn: Anadolu Makina A.Ş. veya Nordic Retail GmbH",
            countryLabel: "Hedef Ülke / Pazar",
            countryPlaceholder: "Örn: Almanya, ABD, İngiltere, BAE",
            sectorLabel: "Ürün Grubu / Sektör",
            sectorPlaceholder: "Örn: Otel Mobilyası, CNC Parça, Ev Tekstili",
            hsLabel: "GTİP / HS Kodu (Opsiyonel)",
            hsPlaceholder: "Örn: 9403.60",
            volLabel: "Hedef Hacim / Kapsam (Opsiyonel)",
            volPlaceholder: "Örn: 1x 40HQ Konteyner",
            shortUrlLabel: "Kısa E-Posta Teklif Uzantısı (Parametreleri Koruyarak Yönlendirir)",
            fullUrlLabel: "Tam Kanonik Kişiselleştirilmiş URL",
            copyLinkBtn: "Linki Kopyala",
            copiedBtn: "Kopyalandı ✓",
            copyEmailBtn: "Hazır E-Posta Metnini Kopyala",
            previewBtn: "Kişiselleştirilmiş Sayfayı Önizle",
            subjectPrefix: "Konu",
            defaultCompany: "Firmanız",
            defaultCountry: "hedef pazarlarınız",
            defaultSector: "ilgili ürün grubunuz",
          }}
        />
      </Section>
    </main>
  );
}
