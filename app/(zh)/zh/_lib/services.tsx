// /zh 服务 sayfaları ortak modülü — FAZ_5 5.3. İçerik: content/zh/services/*.md (简体字, Baidu META: title ≤30 / desc ≤78).
// Render: lib/ui/md (h2 id + 常见问题 akordeon + tablo sarmalayıcı) → D6 stilli kabuk (PageHeader + ArticleLayout + WeChatContact).
// Schema: Service + FAQPage + BreadcrumbList (SEO_PLAYBOOK §4). hreflang YAZILMAZ (ortak dosya — 5.8); canonical kendi URL'si.
import fs from "node:fs";
import path from "node:path";
import type { Metadata } from "next";
import { Building2, Megaphone, ShieldCheck, Store, Truck, type LucideIcon } from "lucide-react";
import { renderVariantMd, tocFromHtml } from "@/lib/ui/md";
import PageHeader from "@/lib/ui/PageHeader";
import ArticleLayout, { AsideCta } from "@/lib/ui/ArticleLayout";
import Card from "@/lib/ui/Card";
import WeChatContact from "./WeChatContact";
import Reveal from "@/lib/ui/motion/Reveal";
import { Section, SectionHeader } from "@/lib/ui/Section";
import grid from "@/lib/ui/cardgrid.module.css";
import dict from "@/lib/messages/zh.json";
import { QUOTE_EMAIL } from "./chrome";

const SITE = "https://bdimexport.com";
const ROOT = path.join(process.cwd(), "content", "zh", "services");

/** Sıra = hub/ilgili kart sırası (5 hizmet — 4'lü gruplama yok) */
export const ZH_SERVICES: { slug: string; Icon: LucideIcon }[] = [
  { slug: "bendi-xiaoshou", Icon: Store },
  { slug: "shichang-tuiguang", Icon: Megaphone },
  { slug: "gongsi-sheli", Icon: Building2 },
  { slug: "wuliu-qingguan", Icon: Truck },
  { slug: "chanpin-renzheng", Icon: ShieldCheck },
];

const plain = (s: string) =>
  s.replace(/\[([^\]]+)\]\([^)]+\)/g, "$1").replace(/\*\*([^*]+)\*\*/g, "$1").replace(/`/g, "").replace(/\s+/g, " ").trim();

function parseFaq(raw: string): { q: string; a: string }[] {
  const out: { q: string; a: string }[] = [];
  let inFaq = false;
  let cur: { q: string; a: string } | null = null;
  for (const line of raw.split("\n")) {
    const t = line.trim();
    if (t.startsWith("## ")) { inFaq = t === "## 常见问题"; cur = null; continue; }
    if (!inFaq) continue;
    if (t.startsWith("### ")) { cur = { q: plain(t.slice(4)), a: "" }; out.push(cur); }
    else if (cur && t) cur.a = (cur.a + plain(t)).trim();
  }
  return out.filter((f) => f.q && f.a);
}

export function readZhService(slug: string) {
  const file = path.join(ROOT, `${slug}.md`);
  if (!fs.existsSync(file)) return null;
  const raw = fs.readFileSync(file, "utf-8");
  return { ...renderVariantMd(raw), faq: parseFaq(raw) };
}

export function zhServiceSlugs(): string[] {
  return ZH_SERVICES.map((s) => s.slug).filter((s) => fs.existsSync(path.join(ROOT, `${s}.md`)));
}

export function zhServiceMetadata(slug: string): Metadata {
  const d = readZhService(slug);
  if (!d) return { robots: { index: false, follow: false } };
  return { title: { absolute: d.metaTitle ?? d.title }, description: d.desc, alternates: { canonical: `${SITE}/zh/services/${slug}` } };
}

function JsonLd({ graph }: { graph: object[] }) {
  const json = JSON.stringify({ "@context": "https://schema.org", "@graph": graph }).replace(/</g, "\\u003c");
  return <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: json }} />;
}

export function ZhServicePage({ slug }: { slug: string }) {
  const d = readZhService(slug);
  const pg = dict.page;
  if (!d) return null;
  const url = `${SITE}/zh/services/${slug}`;
  const ORG = { "@type": "Organization", name: "Bdimexport", url: SITE };
  const graph: object[] = [
    { "@type": "Service", name: d.title, description: d.desc, url, inLanguage: "zh-CN", provider: ORG, areaServed: { "@type": "Country", name: "Türkiye" } },
  ];
  if (d.faq.length) {
    graph.push({ "@type": "FAQPage", mainEntity: d.faq.map((f) => ({ "@type": "Question", name: f.q, acceptedAnswer: { "@type": "Answer", text: f.a } })) });
  }
  graph.push({
    "@type": "BreadcrumbList",
    itemListElement: [
      { name: pg.home, item: `${SITE}/zh` },
      { name: pg.services, item: `${SITE}/zh#fuwu` },
      { name: d.title, item: url },
    ].map((c, i) => ({ "@type": "ListItem", position: i + 1, name: c.name, item: c.item })),
  });
  // ilgili hizmetler: sıradaki 3 (5 hizmetten — 4'lü gruplama yok)
  const idx = ZH_SERVICES.findIndex((s) => s.slug === slug);
  const related = [1, 2, 3].map((k) => ZH_SERVICES[(idx + k) % ZH_SERVICES.length]).map((s) => ({ ...s, doc: readZhService(s.slug) })).filter((s) => s.doc);
  return (
    <main>
      <JsonLd graph={graph} />
      <PageHeader
        crumbs={[{ label: pg.home, href: "/zh" }, { label: pg.services, href: "/zh#fuwu" }, { label: d.title }]}
        crumbsLabel={pg.crumbs}
        eyebrow={dict.home.hero.eyebrow}
        title={d.title}
        lead={d.desc}
      />
      <ArticleLayout
        toc={tocFromHtml(d.html)}
        tocLabel={pg.toc}
        aside={<AsideCta title={pg.aside.title} text={pg.aside.text} cta={{ label: pg.aside.cta, href: "#wechat" }} />}
      >
        <div className="prose" dangerouslySetInnerHTML={{ __html: d.html }} />
      </ArticleLayout>
      <Section id="xiangguan" tone="alt">
        <SectionHeader id="xiangguan" title={pg.related} />
        <ul role="list" className={grid.grid}>
          {related.map((r, i) => (
            <Reveal as="li" key={r.slug} index={i}>
              <Card title={r.doc!.title} href={`/zh/services/${r.slug}`} description={r.doc!.desc} icon={<r.Icon />} more={pg.read} />
            </Reveal>
          ))}
        </ul>
      </Section>
      <section aria-label={dict.wechat.title} className="section">
        <div className="container">
          <WeChatContact email={QUOTE_EMAIL} />
        </div>
      </section>
    </main>
  );
}
