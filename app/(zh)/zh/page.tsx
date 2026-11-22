// /zh Hub — Bdimexport v3.0 (Kırmızı-Altın Palet, Remotion Video + İnteraktif Stage, 5 Hizmet, 3 Türk Ürünü, WeChat QR)
// 4'lü gruplama KESİNLİKLE YOK: 5 hizmet · 3 rakam · 3 Türk ihraç ürünü · 5 adım.
import { Building2, Handshake, LifeBuoy, Megaphone, MessageCircle, Package, Search, ShieldCheck, Store, Truck, Users } from "lucide-react";
import type { Metadata } from "next";
import dict from "@/lib/messages/zh.json";
import Hero from "@/lib/ui/Hero";
import StatBand from "@/lib/ui/StatBand";
import { Section, SectionHeader } from "@/lib/ui/Section";
import Card from "@/lib/ui/Card";
import Steps from "@/lib/ui/Steps";
import PartnerBand from "@/lib/ui/PartnerBand";
import LoopVideo from "@/lib/ui/motion/LoopVideo";
import Reveal from "@/lib/ui/motion/Reveal";
import TradeIntelligenceStage, { type StageTab } from "@/lib/ui/motion/TradeIntelligenceStage";
import WeChatContact from "./_lib/WeChatContact";
import { QUOTE_EMAIL } from "./_lib/chrome";
import { homeAlternates } from "@/lib/hreflang";
import s from "./zh.module.css";

export const metadata: Metadata = {
  title: { absolute: dict.seo.title },
  description: dict.seo.description,
  keywords: dict.seo.keywords,
  alternates: homeAlternates("zh"),
};

const SERVICE_ICON = [Store, Megaphone, Building2, Truck, ShieldCheck];
const STEP_ICON = [MessageCircle, Search, Handshake, Truck, LifeBuoy];

export default function ZhHomePage() {
  const h = dict.home;
  const stats = [
    { value: 1, unit: h.stats.team.unit, label: h.stats.team.label },
    { value: h.services.items.length, unit: h.stats.services.unit, label: h.stats.services.label },
    { value: h.process.steps.length, unit: h.stats.steps.unit, label: h.stats.steps.label },
  ];
  const stageTabs = h.stage.tabs as [StageTab, StageTab, StageTab];

  return (
    <main>
      <Hero
        media={<LoopVideo name="hero-loop" desktopOnly />}
        align="center"
        eyebrow={h.hero.eyebrow}
        title={h.hero.h1}
        subtitle={h.hero.sub}
        primary={{ label: h.hero.ctaPrimary, href: "#wechat" }}
        secondary={{ label: h.hero.ctaSecondary, href: "#wechat" }}
        trust={h.hero.trust}
        trustLabel={h.stats.label}
      />
      <StatBand items={stats} label={h.stats.label} locale="zh-CN" />

      <Section id="stage" tone="alt">
        <Reveal>
          <SectionHeader id="stage" eyebrow={h.stage.eyebrow} title={h.stage.title} lead={h.stage.lead} align="center" />
        </Reveal>
        <TradeIntelligenceStage tabs={stageTabs} />
      </Section>

      <Section id="fuwu">
        <Reveal><SectionHeader id="fuwu" eyebrow={h.services.eyebrow} title={h.services.title} lead={h.services.lead} align="center" /></Reveal>
        <ul role="list" className={s.services}>
          {h.services.items.map((it, i) => {
            const Icon = SERVICE_ICON[i] ?? Users;
            return (
              <Reveal as="li" key={it.title} index={i}>
                <Card title={it.title} href={`/zh/services/${it.slug}`} description={it.text} icon={<Icon />} more={h.services.more} />
              </Reveal>
            );
          })}
        </ul>
      </Section>

      <Section id="chanpin" tone="alt">
        <Reveal><SectionHeader id="chanpin" eyebrow={h.sourcing.eyebrow} title={h.sourcing.title} lead={h.sourcing.lead} align="center" /></Reveal>
        <ul role="list" className={s.services}>
          {h.sourcing.items.map((p, i) => (
            <Reveal as="li" key={p.slug} index={i}>
              <Card title={p.title} href={p.href} description={p.text} icon={<Package />} more={h.sourcing.more} />
            </Reveal>
          ))}
        </ul>
      </Section>

      <Section id="liucheng">
        <Reveal><SectionHeader id="liucheng" eyebrow={h.process.eyebrow} title={h.process.title} align="center" /></Reveal>
        <Steps steps={h.process.steps} icons={STEP_ICON} numbered={false} media={<LoopVideo name="process-flow" lazy />} />
      </Section>

      <PartnerBand id="hezuo" badge={h.partners.badge} title={h.partners.title} empty={h.partners.empty} />

      <section aria-labelledby="lianxi-title" className={`section ${s.contact}`}>
        <div className="container">
          <Reveal>
            <div className={s.contactHead}>
              <h2 id="lianxi-title" className={s.contactTitle}>{h.cta.title}</h2>
              <p className="lead">{h.cta.lead}</p>
            </div>
          </Reveal>
          <Reveal index={1}>
            <WeChatContact email={QUOTE_EMAIL} />
          </Reveal>
        </div>
      </section>
    </main>
  );
}
