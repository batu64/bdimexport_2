// Ticari İstihbarat, Pazar Araştırması ve Raporlama Merkezi (/ticari-istihbarat)
import type { Metadata } from "next";
import { BarChart3, Globe2, ShieldCheck } from "lucide-react";
import dict from "@/lib/messages/tr.json";
import Hero from "@/lib/ui/Hero";
import { Section, SectionHeader } from "@/lib/ui/Section";
import Card from "@/lib/ui/Card";
import LoopVideo from "@/lib/ui/motion/LoopVideo";
import Reveal from "@/lib/ui/motion/Reveal";
import TradeIntelligenceStage, { type StageTab } from "@/lib/ui/motion/TradeIntelligenceStage";
import SmartRfq, { type SmartRfqCopy } from "@/lib/ui/SmartRfq";
import grid from "@/lib/ui/cardgrid.module.css";
import { trAlternates, JsonLd } from "../_lib/content";
import { QUOTE_EMAIL, RFQ_PATH } from "../_lib/links";

export const metadata: Metadata = {
  title: "Ticari İstihbarat, Pazar Araştırması ve Maliyet Raporları",
  description:
    "Çin ve Türkiye merkezli tedarikçi doğrulama, GTİP bazlı aktif alıcı istihbaratı, gümrük ve kapıya teslim maliyet simülasyonu raporları.",
  alternates: trAlternates("/ticari-istihbarat"),
};

const REPORTS = [
  {
    title: "Üretici Sicil & Fabrika Doğrulama Raporu",
    desc: "Ön ödeme yapmadan önce karşı tarafın gerçek fabrika mı aracı mı olduğunu, sermayesini, dava ve ihraç geçmişini doğrulayın.",
    href: "/ithalat/ticari-istihbarat-uretici-dogrulama",
    Icon: ShieldCheck,
  },
  {
    title: "Hedef Pazar & Aktif Alıcı İstihbaratı",
    desc: "Türk üreticiler için GTİP kodu üzerinden ürünü aktif ithal eden yabancı firmaları, fiyat bantlarını ve giriş stratejisini raporlarız.",
    href: "/ihracat/pazar-arastirmasi-musteri-bulma",
    Icon: Globe2,
  },
  {
    title: "GTİP Maliyet & Konteyner Denetim Planı",
    desc: "Navlun, gümrük vergisi, ilave vergi, TAREKS gereklilikleri ve yükleme öncesi saha kontrol planını tek dosyada görün.",
    href: "/ithalat/konteyner-yukleme-denetimi",
    Icon: BarChart3,
  },
];

export default function TicariIstihbaratPage() {
  const stageTabs = dict.home.stage.tabs as [StageTab, StageTab, StageTab];
  const rfqCopy = dict.rfq as SmartRfqCopy;
  return (
    <main>
      <JsonLd
        graph={[
          {
            "@type": "Service",
            name: "Bdimexport Ticari İstihbarat ve Raporlama Merkezi",
            description: metadata.description,
            provider: { "@type": "Organization", name: "Bdimexport", url: "https://bdimexport.com" },
            areaServed: ["TR", "CN", "US", "EU"],
          },
        ]}
      />
      <Hero
        media={<LoopVideo name="dual-hub-radar" desktopOnly />}
        eyebrow="Ticari İstihbarat & Pazar Analizi"
        title="Veriye Dayalı Dış Ticaret: Siparişten Önce Gerçek Tabloyu Görün"
        subtitle="Yanlış tedarikçiye ödeme yapma veya yanlış pazara bütçe harcama riskini ortadan kaldırın. Çin, Türkiye, ABD ve Avrupa ticaret verileriyle 72 saatte özel istihbarat raporu hazırlıyoruz."
        primary={{ label: "İstihbarat Raporu Talep Et", href: "#istihbarat-talep" }}
        secondary={{ label: "Tüm İthalat & İhracat Hizmetleri", href: RFQ_PATH }}
        trust={[
          "Üretici sicil ve kapasite doğrulama",
          "GTİP bazlı gümrük ve landed cost hesabı",
          "İhracatçılar için aktif yabancı alıcı istihbaratı",
        ]}
      />

      <Section id="raporlar">
        <Reveal>
          <SectionHeader
            id="raporlar"
            eyebrow="Rapor Türleri"
            title="Hangi Ticari İstihbarat Raporlarını Üretiyoruz?"
            lead="Hem ithalatçılar hem Türk ihracatçılar için karar alma süresini kısaltan 3 temel istihbarat modülü:"
          />
        </Reveal>
        <ul role="list" className={grid.grid}>
          {REPORTS.map((r, i) => (
            <Reveal as="li" key={r.href} index={i}>
              <Card title={r.title} href={r.href} description={r.desc} icon={<r.Icon />} more={dict.page.read} />
            </Reveal>
          ))}
        </ul>
      </Section>

      <Section id="istihbarat-vitrin" tone="alt">
        <Reveal>
          <SectionHeader
            id="istihbarat-vitrin"
            eyebrow={dict.home.stage.eyebrow}
            title={dict.home.stage.title}
            lead={dict.home.stage.lead}
            align="center"
          />
        </Reveal>
        <TradeIntelligenceStage tabs={stageTabs} />
      </Section>

      <Section id="istihbarat-talep">
        <SmartRfq copy={rfqCopy} locale="tr" email={QUOTE_EMAIL} initialTrack="intelligence" sourcePage="/ticari-istihbarat" />
      </Section>
    </main>
  );
}
