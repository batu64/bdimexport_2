// /ithalat/danismanlik-talebi — Eski iç/dış bağlantılar için 200 OK dönüşüm sayfası (noindex, follow; kanonik teklif akışı /rfq ve /ithalat/danismanlik-ucretleri).
import type { Metadata } from "next";
import Link from "next/link";
import PageHeader from "@/lib/ui/PageHeader";
import { Section } from "@/lib/ui/Section";
import Button from "@/lib/ui/Button";
import SmartRfq, { type SmartRfqCopy } from "@/lib/ui/SmartRfq";
import dict from "@/lib/messages/tr.json";
import { QUOTE_EMAIL } from "../../_lib/links";

export const metadata: Metadata = {
  title: { absolute: "Çin İthalat Danışmanlık Talebi (24s Ön Değerlendirme)" },
  description:
    "Çin'den ürün getirme, tedarikçi doğrulama, konteyner yükleme nezareti ve gümrük maliyet hesabı için 24 saatte ücretsiz ön değerlendirme alın.",
  robots: { index: false, follow: true },
  alternates: { canonical: "https://bdimexport.com/ithalat/danismanlik-ucretleri" },
};

export default function IthalatDanismanlikTalebiPage() {
  const rfqCopy = dict.rfq as SmartRfqCopy;
  return (
    <main>
      <PageHeader
        crumbs={[
          { label: dict.content.home, href: "/" },
          { label: dict.content.ithalat, href: "/ithalat" },
          { label: "Danışmanlık Talebi" },
        ]}
        crumbsLabel={dict.page.crumbs}
        eyebrow="Çin & Türkiye Saha Operasyonu · 24 Saatte Yanıt"
        title="Çin İthalat ve Denetim Danışmanlığı Ön Değerlendirme Talebi"
        lead="Getirmek istediğiniz ürünü, hedef adedi veya mevcut tedarikçiniz için gereken fabrika / konteyner yükleme denetimini aşağıdan iletin; 24 saat içinde yazılı kapsam ve şeffaf ücret teklifi paylaşalım."
        actions={
          <Button href="/ithalat/danismanlik-ucretleri" variant="secondary" arrow>
            Hizmet Paketleri ve Danışmanlık Ücretlerini İncele
          </Button>
        }
      />
      <Section id="rfq">
        <SmartRfq copy={rfqCopy} email={QUOTE_EMAIL} locale="tr" />
        <p style={{ marginBlockStart: "1.5rem" }}>
          İthalat vergilerini önceden görmek için{" "}
          <Link href="/ithalat/cin-gumruk-vergisi-hesaplama">Çin Gümrük Vergisi, İGV ve Gözetim Hesaplayıcı</Link>{" "}
          aracımızı kullanabilir veya{" "}
          <Link href="/ithalat/danismanlik-ucretleri">Danışmanlık ve Denetim Ücretleri</Link> sayfamızı inceleyebilirsiniz.
        </p>
      </Section>
    </main>
  );
}
