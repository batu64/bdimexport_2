// /en/products + /en/products/category/{slug} görünümleri — FAZ_2 Step 2.2. Mantık: ./catalog.ts (saf, test edilir).
// Schema: ItemList (+CollectionPage, BreadcrumbList). Boş/yayımlanmamış ürün → "Coming soon" (link yok); ItemList yalnız LIVE URL'ler için üretilir.
// hreflang YAZILMAZ (2.8). Renk/spacing yalnız tokens + lib/ui/variant.module.css.
import fs from "node:fs";
import path from "node:path";
import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { ArrowRight, BadgeCheck, Clock } from "lucide-react";
import { renderVariantMd, tocFromHtml } from "@/lib/ui/md";
import PageHeader from "@/lib/ui/PageHeader";
import ArticleLayout from "@/lib/ui/ArticleLayout";
import Reveal from "@/lib/ui/motion/Reveal";
import Button from "@/lib/ui/Button";
import { Section, SectionHeader } from "@/lib/ui/Section";
import { space } from "@/lib/ui/tokens";
import dict from "@/lib/messages/en.json";
import { QuoteAside, QuoteCta } from "../../_lib/services";
import { INDUSTRY_ICON } from "../../industries/_lib/industries";
import pv from "./products.module.css";
import { enAlternates } from "../../_lib/hreflang";
import { PRODUCTS_ROOT, composeCatalog, loadPartners, partnersForCategory, type CategoryView, type PublicPartner } from "./catalog";

const SITE = "https://bdimexport.com";

function readIntro(slug: string) {
  return renderVariantMd(fs.readFileSync(path.join(PRODUCTS_ROOT, "_categories", `${slug}.md`), "utf-8"));
}

export function categorySlugs(): string[] {
  return composeCatalog().map((c) => c.slug);
}

export function indexMetadata(): Metadata {
  const d = readIntro("index");
  return { title: { absolute: d.metaTitle ?? d.title }, description: d.desc, alternates: enAlternates("products") };
}

export function categoryMetadata(slug: string): Metadata {
  const cat = composeCatalog().find((c) => c.slug === slug);
  if (!cat) return {};
  const d = readIntro(slug);
  return {
    title: { absolute: d.metaTitle ?? d.title },
    description: d.desc,
    alternates: enAlternates(`products/category/${slug}`),
    // yayımlanmış ürünü olmayan kategori = ince içerik → noindex (ilk ürün yayımlanınca build'de otomatik indekslenir)
    robots: cat.indexable ? undefined : { index: false, follow: true },
  };
}

function JsonLd({ graph }: { graph: object[] }) {
  const json = JSON.stringify({ "@context": "https://schema.org", "@graph": graph }).replace(/</g, "\\u003c");
  return <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: json }} />;
}

const crumbs = (items: { name: string; item: string }[]) => ({
  "@type": "BreadcrumbList",
  itemListElement: items.map((c, i) => ({ "@type": "ListItem", position: i + 1, name: c.name, item: c.item })),
});

const sentence = (s: string) => s.charAt(0).toUpperCase() + s.slice(1);
const pg = dict.page;
const catIcon = (industryHref: string) => INDUSTRY_ICON[industryHref.split("/").pop() ?? ""];

/** Onaylı partner şeridi — partner UYDURULMAZ; logo yalnız consent_logo_en=true (catalog.ts filtresi) */
export function PartnerStrip({ partners, empty, compact }: { partners: PublicPartner[]; empty: string; compact?: boolean }) {
  // compact: başlığı md içeriği zaten veriyor (ürün sayfası "## Verified Turkish Partners" + {{partners}}) → ikinci başlık yok
  return (
    <section aria-labelledby={compact ? undefined : "partners-title"} className={pv.partners}>
      <p className={pv.partnersBadge}><BadgeCheck aria-hidden="true" className={pv.icon} />{dict.home.partners.badge}</p>
      {!compact && <h2 id="partners-title" className={pv.partnersTitle}>{pg.partnersTitle}</h2>}
      {partners.length === 0 ? (
        <p aria-live="polite" className={pv.muted}>{empty}</p>
      ) : (
        <ul role="list" className={pv.partnerList}>
          {partners.map((p) => (
            <li key={p.id}>
              {p.logoUrl ? <Image src={p.logoUrl} alt={p.name} width={space.s16} height={space.s16} unoptimized /> : null}
              <span>{p.name}</span>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}

/** Kategori ürün listesi: yayımlanmış → link satırı; hazırlanan → "Coming soon" (404'a link yok) */
function ProductList({ cat }: { cat: CategoryView }) {
  return (
    <ul role="list" className={pv.products}>
      {cat.products.map((p) => (
        <li key={p.slug} className={pv.product} data-live={p.live || undefined}>
          {p.href ? (
            <Link href={p.href} className={pv.productLink}>
              <span className={pv.productName}>{sentence(p.keyword)}</span>
              <ArrowRight aria-hidden="true" className={pv.arrow} />
            </Link>
          ) : (
            <span className={pv.productName}>
              {p.name}
              <span className={pv.soon}><Clock aria-hidden="true" className={pv.icon} />{pg.comingSoon}</span>
            </span>
          )}
          <span className={pv.blurb}>{p.blurb}</span>
        </li>
      ))}
    </ul>
  );
}

export function ProductsIndexView() {
  const d = readIntro("index");
  const cats = composeCatalog();
  const graph: object[] = [
    crumbs([
      { name: "Home", item: `${SITE}/en` },
      { name: "Products", item: `${SITE}/en/products` },
    ]),
    { "@type": "CollectionPage", name: d.title, description: d.desc, url: `${SITE}/en/products` },
    {
      "@type": "ItemList",
      name: "Product categories",
      itemListElement: cats.map((c, i) => ({
        "@type": "ListItem",
        position: i + 1,
        name: c.name,
        url: `${SITE}/en/products/category/${c.slug}`,
      })),
    },
  ];
  return (
    <main>
      <JsonLd graph={graph} />
      <PageHeader crumbs={[{ label: pg.home, href: "/en" }, { label: pg.products }]} crumbsLabel={pg.crumbs} eyebrow={pg.products} title={d.title} lead={d.desc} />
      <Section id="categories">
        <h2 id="categories-title" className="visually-hidden">{pg.products}</h2>
        <div className={pv.catGrid}>
          {cats.map((c, i) => {
            const Icon = catIcon(c.industry);
            return (
              <Reveal key={c.slug} index={i % 2} className={pv.catWrap}>
                <section aria-labelledby={`cat-${c.slug}`} className={pv.cat}>
                  <div className={pv.catHead}>
                    {Icon && <span className={pv.catIcon} aria-hidden="true"><Icon /></span>}
                    <div>
                      <h2 id={`cat-${c.slug}`} className={pv.catTitle}><Link href={`/en/products/category/${c.slug}`}>{c.name}</Link></h2>
                      <p className={pv.muted}>{pg.published.replace("{n}", String(c.liveCount)).replace("{total}", String(c.products.length))}</p>
                    </div>
                  </div>
                  <ProductList cat={c} />
                </section>
              </Reveal>
            );
          })}
        </div>
      </Section>
      <ArticleLayout toc={tocFromHtml(d.html)} tocLabel={pg.toc} aside={<QuoteAside context="Products from Turkey" />}>
        <div className="prose" dangerouslySetInnerHTML={{ __html: d.html }} />
      </ArticleLayout>
      <QuoteCta context="Products from Turkey" />
    </main>
  );
}

export function CategoryPageView({ slug }: { slug: string }) {
  const cats = composeCatalog();
  const cat = cats.find((c) => c.slug === slug);
  if (!cat) {
    return (
      <main>
        <PageHeader crumbs={[{ label: pg.home, href: "/en" }, { label: pg.products, href: "/en/products" }, { label: pg.notFound }]} crumbsLabel={pg.crumbs} title={pg.notFound} />
      </main>
    );
  }
  const d = readIntro(slug);
  const url = `${SITE}/en/products/category/${slug}`;
  const live = cat.products.filter((p) => p.live);
  const graph: object[] = [
    crumbs([
      { name: "Home", item: `${SITE}/en` },
      { name: "Products", item: `${SITE}/en/products` },
      { name: cat.name, item: url },
    ]),
    { "@type": "CollectionPage", name: d.title, description: d.desc, url },
  ];
  // Geçerli ItemList: yalnız URL'si olan (LIVE) öğeler; boş liste YAYIMLANMAZ
  if (live.length) {
    graph.push({
      "@type": "ItemList",
      name: `${cat.name} products`,
      itemListElement: live.map((p, i) => ({ "@type": "ListItem", position: i + 1, name: p.name, url: `${SITE}${p.href}` })),
    });
  }
  const partners = partnersForCategory(loadPartners(), cat);
  const others = cats.filter((c) => c.slug !== slug);
  return (
    <main>
      <JsonLd graph={graph} />
      <PageHeader
        crumbs={[{ label: pg.home, href: "/en" }, { label: pg.products, href: "/en/products" }, { label: cat.name }]}
        crumbsLabel={pg.crumbs}
        eyebrow={pg.products}
        title={d.title}
        lead={d.desc}
        meta={<span className="chip">{pg.published.replace("{n}", String(cat.liveCount)).replace("{total}", String(cat.products.length))}</span>}
      />
      <Section id="category-products">
        <SectionHeader
          id="category-products"
          title={pg.productsInCategory}
          lead={live.length === 0 ? pg.preparing : undefined}
          action={<Button href={cat.industry} variant="ghost">{pg.industryLink.replace("{name}", cat.name)}</Button>}
        />
        <ProductList cat={cat} />
      </Section>
      <ArticleLayout toc={tocFromHtml(d.html)} tocLabel={pg.toc} aside={<QuoteAside context={cat.name} />}>
        <div className="prose" dangerouslySetInnerHTML={{ __html: d.html }} />
        <PartnerStrip partners={partners} empty={pg.partnersEmpty} />
      </ArticleLayout>
      <nav aria-label={pg.related.categories} className={`container ${pv.otherCats}`}>
        <p className={pv.otherTitle}>{pg.related.categories}</p>
        <ul role="list">
          {others.map((c) => (
            <li key={c.slug}><Link href={`/en/products/category/${c.slug}`} className="chip">{c.name}</Link></li>
          ))}
        </ul>
      </nav>
      <QuoteCta context={cat.name} />
    </main>
  );
}
