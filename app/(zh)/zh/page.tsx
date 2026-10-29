// /zh Hub — OPUS_TASARIM D6: kırmızı-altın (data-locale=zh: açık zeminde kırmızı vurgu, koyu zeminde altın), hero SİMETRİK MERKEZ
// (design-tokens §2.1). Metin lib/messages/zh.json (hero = design/hero-copy.md ZH TASLAK; final FAZ 5.3/5.7).
// 4'lü gruplama yok: 5 hizmet (5.3 sayfalarına bağlı) · 3 rakam · 5 adım. Rakamlar yalnız doğrulanabilir taahhüt/sayım (uydurma şirket verisi yok).
import { Building2, Handshake, Megaphone, MessageCircle, Search, ShieldCheck, Store, Truck, Users, LifeBuoy } from "lucide-react";
import dict from "@/lib/messages/zh.json";
import Hero from "@/lib/ui/Hero";
import StatBand from "@/lib/ui/StatBand";
import { Section, SectionHeader } from "@/lib/ui/Section";
import Card from "@/lib/ui/Card";
import Steps from "@/lib/ui/Steps";
import PartnerBand from "@/lib/ui/PartnerBand";
import WeChatCard from "@/lib/ui/WeChatCard";
import Reveal from "@/lib/ui/motion/Reveal";
import { QUOTE_EMAIL } from "./_lib/chrome";
import s from "./zh.module.css";

const SERVICE_ICON = [Store, Megaphone, Building2, Truck, ShieldCheck];
const STEP_ICON = [MessageCircle, Search, Handshake, Truck, LifeBuoy];

export default function ZhHomePage() {
  const h = dict.home;
  const stats = [
    { value: 1, unit: h.stats.team.unit, label: h.stats.team.label },
    { value: h.services.items.length, unit: h.stats.services.unit, label: h.stats.services.label },
    { value: h.process.steps.length, unit: h.stats.steps.unit, label: h.stats.steps.label },
  ];
  return (
    <main>
      <Hero
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

      <Section id="liucheng" tone="alt">
        <Reveal><SectionHeader id="liucheng" eyebrow={h.process.eyebrow} title={h.process.title} align="center" /></Reveal>
        <Steps steps={h.process.steps} icons={STEP_ICON} numbered={false} />
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
            <WeChatCard labels={dict.wechat} email={QUOTE_EMAIL} />
          </Reveal>
        </div>
      </section>
    </main>
  );
}
