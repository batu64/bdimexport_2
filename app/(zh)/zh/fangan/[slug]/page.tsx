// /zh/fangan/[slug] — Çinli Üreticiler İçin Türkiye 81 İl Yerel Operasyon Teklif Sayfası (简体中文 · Self-Canonical + ABM)
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import PageHeader from "@/lib/ui/PageHeader";
import { Section, SectionHeader } from "@/lib/ui/Section";
import Button from "@/lib/ui/Button";
import Reveal from "@/lib/ui/motion/Reveal";
import { ZH_PROPOSAL } from "@/lib/seo/proposals";
import ProposalPersonalizer from "@/lib/seo/ProposalPersonalizer";
import { SeoJsonLd, SITE_URL, buildStructuredPageGraph, defaultOpenGraph } from "@/lib/seo/schema";
import s from "@/lib/seo/proposal.module.css";
import WeChatContact from "../../_lib/WeChatContact";
import { QUOTE_EMAIL } from "../../_lib/chrome";

export const dynamicParams = false;

export function generateStaticParams() {
  return [{ slug: ZH_PROPOSAL.slug }];
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  if (slug !== ZH_PROPOSAL.slug) return {};
  const url = `${SITE_URL}/zh/fangan/${ZH_PROPOSAL.slug}`;
  return {
    title: { absolute: ZH_PROPOSAL.metaTitle },
    description: ZH_PROPOSAL.metaDesc,
    robots: { index: false, follow: true },
    alternates: {
      canonical: url,
      languages: { "zh-CN": url },
    },
    ...defaultOpenGraph({ title: ZH_PROPOSAL.metaTitle, description: ZH_PROPOSAL.metaDesc, url, locale: "zh_CN" }),
  };
}

export default async function ZhProposalPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  if (slug !== ZH_PROPOSAL.slug) notFound();

  const p = ZH_PROPOSAL;
  const url = `${SITE_URL}/zh/fangan/${p.slug}`;
  const graph = buildStructuredPageGraph({
    url,
    inLanguage: "zh-CN",
    title: p.h1,
    description: p.metaDesc,
    serviceType: p.badge,
    areaServed: ["CN", "TR"],
    crumbs: [
      { name: "首页", url: `${SITE_URL}/zh` },
      { name: "专属合作方案", url },
    ],
    faq: p.faq,
  });

  return (
    <main>
      <SeoJsonLd graph={graph} />
      <PageHeader
        crumbs={[
          { label: "首页", href: "/zh" },
          { label: "专属合作方案" },
        ]}
        crumbsLabel="页面路径"
        eyebrow={p.badge}
        title={p.h1}
        lead={p.lead}
        actions={
          <Button href="#wechat" variant="primary" size="lg" arrow>
            24小时内获取免费报价
          </Button>
        }
      />

      <Section id="modules">
        <ProposalPersonalizer
          labels={{
            eyebrow: "贵司专属合作方案摘要",
            preparedForPrefix: "呈交企业：",
            sectorLabel: "产品领域",
            marketLabel: "目标区域",
            hsLabel: "海关编码",
            volumeLabel: "合作规模",
          }}
        />

        <Reveal>
          <SectionHeader id="modules" eyebrow={p.slaText} title={p.deliverablesTitle} />
        </Reveal>
        <div className={s.grid3}>
          {p.deliverables.map((d) => (
            <article key={d.code} className={s.box}>
              <span className={s.boxCode}>{d.code}</span>
              <h3 className={s.boxTitle}>{d.title}</h3>
              <p className={s.boxText}>{d.detail}</p>
            </article>
          ))}
        </div>
      </Section>

      <Section id="terms" tone="alt">
        <div className={s.grid2}>
          <div className={s.box}>
            <span className={s.boxCode}>合作保障与条款</span>
            <h2 className={s.boxTitle}>{p.commercialTermsTitle}</h2>
            <div className={s.kvList}>
              {p.commercialTerms.map((t) => (
                <div key={t.label} className={s.kvRow}>
                  <span className={s.kvLabel}>{t.label}</span>
                  <span className={s.kvValue}>{t.value}</span>
                </div>
              ))}
            </div>
          </div>

          <div className={s.box}>
            <span className={s.boxCode}>核心竞争优势</span>
            <h2 className={s.boxTitle}>{p.whyTitle}</h2>
            <ul className={s.bulletList}>
              {p.whyPoints.map((pt) => (
                <li key={pt}>{pt}</li>
              ))}
            </ul>
          </div>
        </div>
      </Section>

      <Section id="faq">
        <Reveal>
          <SectionHeader id="faq" eyebrow="合作问答" title={p.faqTitle} />
        </Reveal>
        <div className={s.faqStack}>
          {p.faq.map((f) => (
            <article key={f.q} className={s.faqItem}>
              <h3 className={s.faqQ}>{f.q}</h3>
              <p className={s.faqA}>{f.a}</p>
            </article>
          ))}
        </div>
      </Section>

      <Section id="contact" tone="alt">
        <WeChatContact id="wechat" email={QUOTE_EMAIL} />
      </Section>
    </main>
  );
}
