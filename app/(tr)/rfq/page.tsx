// Akıllı RFQ, Konteyner Denetimi ve Ticari İstihbarat Talep Merkezi (/rfq)
import type { Metadata } from "next";
import { Building2, ShieldCheck } from "lucide-react";
import dict from "@/lib/messages/tr.json";
import PageHeader from "@/lib/ui/PageHeader";
import { Section } from "@/lib/ui/Section";
import SmartRfq, { type SmartRfqCopy } from "@/lib/ui/SmartRfq";
import { CORPORATE_ENTITIES, US_DUNS_NUMBER } from "@/lib/ui/entities";
import { trAlternates, JsonLd } from "../_lib/content";
import { QUOTE_EMAIL } from "../_lib/links";

export const metadata: Metadata = {
  title: "Akıllı Teklif (RFQ), Denetim ve İstihbarat Talebi",
  description:
    "Çin veya Türkiye ürün tedariği, tekil konteyner yükleme denetimi, ticari istihbarat raporu ve ihracat pazarlama sistemi için 24 saatte teklif alın.",
  alternates: trAlternates("/rfq"),
};

export default function TrRfqPage() {
  const rfqCopy = dict.rfq as SmartRfqCopy;
  return (
    <main>
      <JsonLd
        graph={[
          {
            "@type": "WebPage",
            name: metadata.title,
            description: metadata.description,
            url: "https://bdimexport.com/rfq",
          },
        ]}
      />
      <PageHeader
        crumbs={[{ label: dict.content.home, href: "/" }, { label: dict.content.rfq }]}
        crumbsLabel={dict.page.crumbs}
        eyebrow="24 Saatte Yazılı Teklif ve Operasyon Planı"
        title="Akıllı RFQ, Denetim ve İstihbarat Talebi"
        lead="Hizmet alanınızı, kaynak bölgeyi (Türkiye / Çin) ve tahmini hacmi seçin; uzman ekibimizle WhatsApp veya e-posta üzerinden anında paylaşın."
        meta={
          <span className="chip">
            <ShieldCheck aria-hidden="true" className="chip-icon" />
            {CORPORATE_ENTITIES[1].name} (D-U-N-S® #{US_DUNS_NUMBER}) &amp; {CORPORATE_ENTITIES[0].name}
          </span>
        }
      />

      <Section id="rfq-form">
        <SmartRfq copy={rfqCopy} locale="tr" email={QUOTE_EMAIL} initialTrack="sourcing" sourcePage="/rfq" />
      </Section>

      <Section id="kurumsal-guvence" tone="alt">
        <div className="prose">
          <h2>Çift Merkezli Kurumsal Yapımız</h2>
          <p>
            Tüm uluslararası ticaret, denetim ve danışmanlık süreçleriniz Türkiye ve Amerika Birleşik Devletleri&apos;nde kayıtlı resmi şirketlerimiz güvencesiyle yürütülür:
          </p>
          <ul>
            <li>
              <Building2 aria-hidden="true" style={{ display: "inline", verticalAlign: "middle", marginInlineEnd: 8 }} />
              <strong>Türkiye Operasyon Merkezi:</strong> {CORPORATE_ENTITIES[0].name} — {CORPORATE_ENTITIES[0].address}
            </li>
            <li>
              <Building2 aria-hidden="true" style={{ display: "inline", verticalAlign: "middle", marginInlineEnd: 8 }} />
              <strong>ABD Kurumsal Merkezi:</strong> {CORPORATE_ENTITIES[1].name} — {CORPORATE_ENTITIES[1].address} (Dun &amp; Bradstreet D-U-N-S® #: {US_DUNS_NUMBER})
            </li>
          </ul>
        </div>
      </Section>
    </main>
  );
}
