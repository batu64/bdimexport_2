// /en/services/* ortak modül — FAZ_2 Step 2.1 (content/en/global/services/*.md → sayfa + metadata + JSON-LD).
// Markdown→HTML: lib/ui/md (üçüncü kopya yazılmaz). Schema: Service + FAQPage + BreadcrumbList (SEO_PLAYBOOK §4).
// hreflang: BU DOSYADA YAZILMAZ — veri content/en/global/global-manifest.json'da, enjeksiyon Step 2.8 (ortak dosya tekeli).
import fs from "fs";
import path from "path";
import type { Metadata } from "next";
import Link from "next/link";
import { BarChart3, Boxes, ClipboardCheck, Factory, Globe2, Landmark, PackageSearch, Ship, type LucideIcon } from "lucide-react";
import { renderVariantMd, tocFromHtml } from "@/lib/ui/md";
import PageHeader from "@/lib/ui/PageHeader";
import ArticleLayout, { AsideCta } from "@/lib/ui/ArticleLayout";
import CtaBand from "@/lib/ui/CtaBand";
import Card from "@/lib/ui/Card";
import Reveal from "@/lib/ui/motion/Reveal";
import { Section, SectionHeader } from "@/lib/ui/Section";
import grid from "@/lib/ui/cardgrid.module.css";
import dict from "@/lib/messages/en.json";
import { MARKET_CORRIDORS } from "@/lib/seo/markets";
import { US_CLUSTER_PAGES } from "@/lib/seo/us-hub";
import { listInsights, readInsight } from "@/lib/ui/insights";
import { enAlternates } from "./hreflang";
import { quoteHref } from "./chrome";

const SITE = "https://bdimexport.com";
const ROOT = path.join(process.cwd(), "content", "en", "global", "services");

/** Sıra = menü/footer/indeks sırası (Proje.md §3.1 hizmet seti). label: kısa ad. */
export const SERVICES = [
  { slug: "sourcing", label: "Türkiye Sourcing" },
  { slug: "china-sourcing", label: "China & Dual-Hub Sourcing" },
  { slug: "container-loading", label: "Container Loading & QC" },
  { slug: "commercial-intelligence", label: "Commercial Intelligence" },
  { slug: "manufacturing", label: "Private Label Manufacturing" },
  { slug: "inspection", label: "Factory Inspection" },
  { slug: "logistics", label: "Freight Logistics" },
  { slug: "customs", label: "Export Customs" },
] as const;
export type ServiceSlug = (typeof SERVICES)[number]["slug"];
export const SERVICE_ICON: Record<string, LucideIcon> = {
  sourcing: PackageSearch,
  "china-sourcing": Globe2,
  "container-loading": ClipboardCheck,
  "commercial-intelligence": BarChart3,
  manufacturing: Boxes,
  inspection: Factory,
  logistics: Ship,
  customs: Landmark,
};
const pg = dict.page;


const plain = (s: string) =>
  s.replace(/\[([^\]]+)\]\([^)]+\)/g, "$1").replace(/\*\*([^*]+)\*\*/g, "$1").replace(/`/g, "").replace(/\s+/g, " ").trim();

function parseFaq(raw: string): { q: string; a: string }[] {
  const out: { q: string; a: string }[] = [];
  let inFaq = false;
  let cur: { q: string; a: string } | null = null;
  for (const line of raw.split("\n")) {
    const t = line.trim();
    if (t.startsWith("## ")) {
      inFaq = t === "## Frequently Asked Questions";
      cur = null;
      continue;
    }
    if (!inFaq) continue;
    if (t.startsWith("### ")) {
      cur = { q: plain(t.slice(4)), a: "" };
      out.push(cur);
    } else if (cur && t) cur.a = (cur.a + " " + plain(t)).trim();
  }
  return out.filter((f) => f.q && f.a);
}

function readDoc(slug: string) {
  const file = path.join(ROOT, slug + ".md");
  if (!fs.existsSync(file)) return null;
  const raw = fs.readFileSync(file, "utf-8");
  const parsed = renderVariantMd(raw);
  return { ...parsed, faq: parseFaq(raw) };
}

/** Kart açıklaması (META desc) */
export function readServiceDesc(slug: string): string | undefined {
  return readDoc(slug)?.desc;
}

export function serviceMetadata(slug: string): Metadata {
  const d = readDoc(slug);
  if (!d) return {};
  return { title: { absolute: d.metaTitle ?? d.title }, description: d.desc, alternates: enAlternates(`services/${slug}`) };
}

export function indexMetadata(): Metadata {
  const d = readDoc("index");
  if (!d) return {};
  return { title: { absolute: d.metaTitle ?? d.title }, description: d.desc, alternates: enAlternates("services") };
}

const ORG = { "@type": "Organization", name: "Bdimexport", url: SITE };

function JsonLd({ graph }: { graph: object[] }) {
  const json = JSON.stringify({ "@context": "https://schema.org", "@graph": graph }).replace(/</g, "\\u003c");
  return <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: json }} />;
}

const crumbs = (items: { name: string; item: string }[]) => ({
  "@type": "BreadcrumbList",
  itemListElement: items.map((c, i) => ({ "@type": "ListItem", position: i + 1, name: c.name, item: c.item })),
});

/** Sayfa altı teklif bandı — #get-quote (Product Offer url'si buraya bağlı). Kanal: gerçek e-posta (sahte form yazılmaz). */
export function QuoteCta({ context }: { context: string }) {
  return (
    <div id="get-quote">
      <CtaBand id="get-quote-band" title={pg.quoteTitle} lead={pg.quoteLead} primary={{ label: pg.quoteCta, href: quoteHref(context) }} />
    </div>
  );
}

const enCrumbs = (...c: { label: string; href?: string }[]) => [{ label: pg.home, href: "/en" }, ...c];

/** Yan sütun teklif kartı (tüm EN içerik sayfaları) */
export function QuoteAside({ context }: { context: string }) {
  return <AsideCta title={pg.aside.title} text={pg.aside.text} cta={{ label: pg.aside.cta, href: quoteHref(context) }} secondary={{ label: pg.aside.services, href: "/en/services" }} />;
}

export function ServicePage({ slug }: { slug: string }) {
  const d = readDoc(slug);
  const meta = SERVICES.find((s) => s.slug === slug);
  if (!d || !meta) {
    return (
      <main>
        <PageHeader crumbs={enCrumbs({ label: pg.services, href: "/en/services" }, { label: pg.notFound })} crumbsLabel={pg.crumbs} title={pg.notFound} />
      </main>
    );
  }
  const url = `${SITE}/en/services/${slug}`;
  const graph: object[] = [
    {
      "@type": "Service",
      name: d.title,
      serviceType: meta.label,
      description: d.desc,
      url,
      provider: ORG,
      areaServed: "Worldwide",
    },
  ];
  if (d.faq.length) {
    graph.push({
      "@type": "FAQPage",
      mainEntity: d.faq.map((f) => ({ "@type": "Question", name: f.q, acceptedAnswer: { "@type": "Answer", text: f.a } })),
    });
  }
  graph.push(
    crumbs([
      { name: "Home", item: `${SITE}/en` },
      { name: "Services", item: `${SITE}/en/services` },
      { name: meta.label, item: url },
    ]),
  );
  const others = SERVICES.filter((x) => x.slug !== slug).map((x) => ({ ...x, doc: readDoc(x.slug) })).slice(0, 3);
  return (
    <main>
      <JsonLd graph={graph} />
      <PageHeader
        crumbs={enCrumbs({ label: pg.services, href: "/en/services" }, { label: meta.label })}
        crumbsLabel={pg.crumbs}
        eyebrow={pg.services}
        title={d.title}
        lead={d.desc}
      />
      <ArticleLayout toc={tocFromHtml(d.html)} tocLabel={pg.toc} aside={<QuoteAside context={meta.label} />}>
        <div className="prose" dangerouslySetInnerHTML={{ __html: d.html }} />
      </ArticleLayout>
      <Section id="other-services" tone="alt">
        <SectionHeader id="other-services" title={pg.related.services} />
        <ul role="list" className={grid.grid}>
          {others.map((o, i) => {
            const Icon = SERVICE_ICON[o.slug];
            return (
              <Reveal as="li" key={o.slug} index={i}>
                <Card title={o.label} href={`/en/services/${o.slug}`} description={o.doc?.desc} icon={<Icon />} more={pg.read} />
              </Reveal>
            );
          })}
        </ul>
        <div className="prose" style={{ marginBlockStart: "var(--s-6)" }}>
          <p>
            <strong>US Procurement Hubs &amp; Tariff Guides:</strong>{" "}
            {US_CLUSTER_PAGES.map((u, idx) => (
              <span key={u.slug}>
                {idx > 0 ? " · " : ""}
                <Link href={`/en/us/${u.slug}`}>{u.metaTitle.replace(/\s*\|\s*bdimexport$/i, "")}</Link>
              </span>
            ))}
            {listInsights("en").map((ins) => {
              const doc = readInsight("en", ins);
              return doc ? (
                <span key={ins}>
                  {" · "}
                  <Link href={`/en/insights/${ins}`}>{doc.title}</Link>
                </span>
              ) : null;
            })}
          </p>
          <p>
            <strong>Key Product Hubs &amp; Country Corridors:</strong>{" "}
            <Link href="/en/products/apparel">Clothing &amp; Low-MOQ Apparel</Link> ·{" "}
            <Link href="/en/products/hospitality-furniture">Hotel Furniture</Link> ·{" "}
            <Link href="/en/products/marble">Marble &amp; Travertine</Link> ·{" "}
            <Link href="/en/products/home-textiles">Towels &amp; Hotel Textiles</Link> ·{" "}
            <Link href="/en/products/olive-oil">Olive Oil</Link> ·{" "}
            <Link href="/en/products/ceramics">Ceramic Tiles</Link> ·{" "}
            <Link href="/en/products/denim">Denim</Link> ·{" "}
            <Link href="/en/wooden-utility-poles">Wooden Utility Poles (Africa)</Link> ·{" "}
            <Link href="/en/fr/wooden-utility-poles">Poteaux Bois (Sénégal/Afrique)</Link>
            {MARKET_CORRIDORS.map((m) => (
              <span key={m.slug}>
                {" · "}
                <Link href={`/en/markets/${m.slug}`}>{m.countryName}</Link>
              </span>
            ))}
          </p>
        </div>
      </Section>
      <QuoteCta context={meta.label} />
    </main>
  );
}

export function ServicesIndexPage() {
  const d = readDoc("index");
  const cards = SERVICES.map((s) => ({ ...s, doc: readDoc(s.slug) })).filter((x) => x.doc);
  const graph: object[] = [
    crumbs([
      { name: "Home", item: `${SITE}/en` },
      { name: "Services", item: `${SITE}/en/services` },
    ]),
    {
      "@type": "ItemList",
      itemListElement: cards.map((c, i) => ({
        "@type": "ListItem",
        position: i + 1,
        name: c.label,
        url: `${SITE}/en/services/${c.slug}`,
      })),
    },
  ];
  return (
    <main>
      <JsonLd graph={graph} />
      <PageHeader crumbs={enCrumbs({ label: pg.services })} crumbsLabel={pg.crumbs} eyebrow={pg.services} title={d?.title ?? "Export Services from Turkey"} lead={d?.desc} />
      <Section id="services-list">
        <h2 id="services-list-title" className="visually-hidden">{pg.services}</h2>
        <ul role="list" className={grid.grid}>
          {cards.map((c, i) => {
            const Icon = SERVICE_ICON[c.slug];
            return (
              <Reveal as="li" key={c.slug} index={i % 3}>
                <Card title={c.label} href={`/en/services/${c.slug}`} description={c.doc?.desc} icon={<Icon />} more={pg.read} />
              </Reveal>
            );
          })}
        </ul>
      </Section>
      {d ? (
        <ArticleLayout toc={tocFromHtml(d.html)} tocLabel={pg.toc} aside={<QuoteAside context="Export services from Turkey" />}>
          <div className="prose" dangerouslySetInnerHTML={{ __html: d.html }} />
        </ArticleLayout>
      ) : null}
      <QuoteCta context="Export services from Turkey" />
    </main>
  );
}
