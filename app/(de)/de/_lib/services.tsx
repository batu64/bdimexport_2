// /de Leistungsseiten ortak modülü — FAZ_5 5.4. İçerik: content/de/services/*.md (DACH yerelleştirme, formal Sie, kaynaklı rakam).
// Render: lib/ui/md (h2 id + "Häufig gestellte Fragen" akordeon + tablo sarmalayıcı) → D6 stilli kabuk (PageHeader + ArticleLayout + CtaBand).
// Schema: Service + FAQPage + BreadcrumbList (SEO_PLAYBOOK §4). hreflang YAZILMAZ (ortak dosya — 5.8); canonical kendi URL'si.
import fs from "node:fs";
import path from "node:path";
import type { Metadata } from "next";
import { Boxes, Factory, Landmark, PackageSearch, Ship, type LucideIcon } from "lucide-react";
import { renderVariantMd, tocFromHtml } from "@/lib/ui/md";
import PageHeader from "@/lib/ui/PageHeader";
import ArticleLayout, { AsideCta } from "@/lib/ui/ArticleLayout";
import Card from "@/lib/ui/Card";
import CtaBand from "@/lib/ui/CtaBand";
import Reveal from "@/lib/ui/motion/Reveal";
import { Section, SectionHeader } from "@/lib/ui/Section";
import grid from "@/lib/ui/cardgrid.module.css";
import dict from "@/lib/messages/de.json";
import { quoteHref } from "./chrome";

const SITE = "https://bdimexport.com";
const ROOT = path.join(process.cwd(), "content", "de");

/** Sıra = hub/ilgili kart sırası; key = EN SERVICES slug'ı (hub ikon/etiket eşlemesi) */
export const DE_SERVICES: { slug: string; key: keyof typeof dict.home.services.items; Icon: LucideIcon }[] = [
  { slug: "beschaffung", key: "sourcing", Icon: PackageSearch },
  { slug: "lohnfertigung", key: "manufacturing", Icon: Boxes },
  { slug: "werkspruefung", key: "inspection", Icon: Factory },
  { slug: "logistik", key: "logistics", Icon: Ship },
  { slug: "zollabwicklung", key: "customs", Icon: Landmark },
];

const plain = (s: string) =>
  s.replace(/\[([^\]]+)\]\([^)]+\)/g, "$1").replace(/\*\*([^*]+)\*\*/g, "$1").replace(/`/g, "").replace(/\s+/g, " ").trim();

function parseFaq(raw: string): { q: string; a: string }[] {
  const out: { q: string; a: string }[] = [];
  let inFaq = false;
  let cur: { q: string; a: string } | null = null;
  for (const line of raw.split("\n")) {
    const t = line.trim();
    if (t.startsWith("## ")) { inFaq = t === "## Häufig gestellte Fragen"; cur = null; continue; }
    if (!inFaq) continue;
    if (t.startsWith("### ")) { cur = { q: plain(t.slice(4)), a: "" }; out.push(cur); }
    else if (cur && t) cur.a = `${cur.a} ${plain(t)}`.trim();
  }
  return out.filter((f) => f.q && f.a);
}

/** content/de altındaki bir md (services/{slug} veya vertrauen) */
export function readDeDoc(rel: string) {
  const file = path.join(ROOT, `${rel}.md`);
  if (!fs.existsSync(file)) return null;
  const raw = fs.readFileSync(file, "utf-8");
  return { ...renderVariantMd(raw), faq: parseFaq(raw) };
}

export const readDeService = (slug: string) => readDeDoc(`services/${slug}`);

export function deServiceSlugs(): string[] {
  return DE_SERVICES.map((s) => s.slug).filter((s) => fs.existsSync(path.join(ROOT, "services", `${s}.md`)));
}

export function deServiceMetadata(slug: string): Metadata {
  const d = readDeService(slug);
  if (!d) return { robots: { index: false, follow: false } };
  return { title: { absolute: d.metaTitle ?? d.title }, description: d.desc, alternates: { canonical: `${SITE}/de/leistungen/${slug}` } };
}

function JsonLd({ graph }: { graph: object[] }) {
  const json = JSON.stringify({ "@context": "https://schema.org", "@graph": graph }).replace(/</g, "\\u003c");
  return <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: json }} />;
}

export function DeServicePage({ slug }: { slug: string }) {
  const d = readDeService(slug);
  const pg = dict.page;
  const h = dict.home;
  if (!d) return null;
  const url = `${SITE}/de/leistungen/${slug}`;
  const ORG = { "@type": "Organization", name: "Bdimexport", url: SITE };
  const graph: object[] = [
    { "@type": "Service", name: d.title, description: d.desc, url, inLanguage: "de-DE", provider: ORG, areaServed: ["DE", "AT", "CH"].map((c) => ({ "@type": "Country", name: c })) },
  ];
  if (d.faq.length) {
    graph.push({ "@type": "FAQPage", mainEntity: d.faq.map((f) => ({ "@type": "Question", name: f.q, acceptedAnswer: { "@type": "Answer", text: f.a } })) });
  }
  graph.push({
    "@type": "BreadcrumbList",
    itemListElement: [
      { name: pg.home, item: `${SITE}/de` },
      { name: pg.services, item: `${SITE}/de#leistungen` },
      { name: d.title, item: url },
    ].map((c, i) => ({ "@type": "ListItem", position: i + 1, name: c.name, item: c.item })),
  });
  // ilgili hizmetler: sıradaki 3
  const idx = DE_SERVICES.findIndex((s) => s.slug === slug);
  const related = [1, 2, 3].map((k) => DE_SERVICES[(idx + k) % DE_SERVICES.length]).map((s) => ({ ...s, doc: readDeService(s.slug) })).filter((s) => s.doc);
  return (
    <main>
      <JsonLd graph={graph} />
      <PageHeader
        crumbs={[{ label: pg.home, href: "/de" }, { label: pg.services, href: "/de#leistungen" }, { label: d.title }]}
        crumbsLabel={pg.crumbs}
        eyebrow={h.services.items[DE_SERVICES[idx].key]}
        title={d.title}
        lead={d.desc}
      />
      <ArticleLayout
        toc={tocFromHtml(d.html)}
        tocLabel={pg.toc}
        aside={<AsideCta title={pg.aside.title} text={pg.aside.text} cta={{ label: h.hero.ctaPrimary, href: quoteHref }} />}
      >
        <div className="prose" dangerouslySetInnerHTML={{ __html: d.html }} />
      </ArticleLayout>
      <Section id="weitere" tone="alt">
        <SectionHeader id="weitere" title={pg.related} />
        <ul role="list" className={grid.grid}>
          {related.map((r, i) => (
            <Reveal as="li" key={r.slug} index={i}>
              <Card title={r.doc!.title} href={`/de/leistungen/${r.slug}`} description={r.doc!.desc} icon={<r.Icon />} more={pg.read} />
            </Reveal>
          ))}
        </ul>
      </Section>
      <CtaBand title={h.cta.title} lead={h.cta.lead} primary={{ label: h.hero.ctaPrimary, href: quoteHref }} />
    </main>
  );
}
