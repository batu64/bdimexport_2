// /en/products + /en/products/category/{slug} görünümleri — FAZ_2 Step 2.2. Mantık: ./catalog.ts (saf, test edilir).
// Schema: ItemList (+CollectionPage, BreadcrumbList). Boş/yayımlanmamış ürün → "Coming soon" (link yok); ItemList yalnız LIVE URL'ler için üretilir.
// hreflang YAZILMAZ (2.8). Renk/spacing yalnız tokens + lib/ui/variant.module.css.
import fs from "node:fs";
import path from "node:path";
import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import styles from "@/lib/ui/variant.module.css";
import { color, fontSize, space } from "@/lib/ui/tokens";
import { renderVariantMd } from "@/lib/ui/md";
import { QuoteCta } from "../../_lib/services";
import { PRODUCTS_ROOT, composeCatalog, loadPartners, partnersForCategory, type CategoryView, type PublicPartner } from "./catalog";

const SITE = "https://bdimexport.com";

function readIntro(slug: string) {
  return renderVariantMd(fs.readFileSync(path.join(PRODUCTS_ROOT, "_categories", `${slug}.md`), "utf-8"));
}

export function categorySlugs(): string[] {
  return composeCatalog().map((c) => c.slug);
}

const canonical = (p: string): Metadata["alternates"] => ({ canonical: `${SITE}${p}` });

export function indexMetadata(): Metadata {
  const d = readIntro("index");
  return { title: { absolute: d.metaTitle ?? d.title }, description: d.desc, alternates: canonical("/en/products") };
}

export function categoryMetadata(slug: string): Metadata {
  const cat = composeCatalog().find((c) => c.slug === slug);
  if (!cat) return {};
  const d = readIntro(slug);
  return {
    title: { absolute: d.metaTitle ?? d.title },
    description: d.desc,
    alternates: canonical(`/en/products/category/${slug}`),
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

function ComingSoon() {
  return (
    <span style={{ color: color.muted, fontSize: fontSize.sm }}>
      {" "}
      — Coming soon
    </span>
  );
}

function PartnerStrip({ partners }: { partners: PublicPartner[] }) {
  return (
    <section aria-labelledby="partners-title" className={styles.contact}>
      <h2 id="partners-title">Verified Turkish Partners</h2>
      {partners.length === 0 ? (
        <p aria-live="polite">Approved partners for this category will be listed here after their review is complete.</p>
      ) : (
        <ul style={{ listStyle: "none", padding: 0, display: "flex", flexWrap: "wrap", gap: space.s4 }}>
          {partners.map((p) => (
            <li key={p.id} style={{ display: "flex", alignItems: "center", gap: space.s3 }}>
              {p.logoUrl ? <Image src={p.logoUrl} alt={p.name} width={space.s16} height={space.s16} unoptimized /> : null}
              <span>{p.name}</span>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}

function ProductList({ cat }: { cat: CategoryView }) {
  return (
    <ul>
      {cat.products.map((p) => (
        <li key={p.slug}>
          {p.href ? <Link href={p.href}>{sentence(p.keyword)}</Link> : <strong>{p.name}</strong>}
          {p.live ? null : <ComingSoon />}
          <br />
          <span>{p.blurb}</span>
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
    <main className={styles.main}>
      <JsonLd graph={graph} />
      <nav aria-label="breadcrumb" className={styles.crumb}>
        <Link href="/en">Home</Link>
        <span aria-hidden="true"> → </span>
        <span>Products</span>
      </nav>
      <h1>{d.title}</h1>
      <div dangerouslySetInnerHTML={{ __html: d.html }} />
      {cats.map((c) => (
        <section key={c.slug} aria-labelledby={`cat-${c.slug}`}>
          <h2 id={`cat-${c.slug}`}>
            <Link href={`/en/products/category/${c.slug}`}>{c.name}</Link>
          </h2>
          <p style={{ color: color.muted, fontSize: fontSize.sm }}>
            {c.liveCount} of {c.products.length} product pages published
          </p>
          <ProductList cat={c} />
        </section>
      ))}
      <QuoteCta context="Products from Turkey" />
    </main>
  );
}

export function CategoryPageView({ slug }: { slug: string }) {
  const cats = composeCatalog();
  const cat = cats.find((c) => c.slug === slug);
  if (!cat) {
    return (
      <main className={styles.main}>
        <h1>Category not found</h1>
        <p>
          See all <Link href="/en/products">product categories</Link>.
        </p>
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
  return (
    <main className={styles.main}>
      <JsonLd graph={graph} />
      <nav aria-label="breadcrumb" className={styles.crumb}>
        <Link href="/en">Home</Link>
        <span aria-hidden="true"> → </span>
        <Link href="/en/products">Products</Link>
        <span aria-hidden="true"> → </span>
        <span>{cat.name}</span>
      </nav>
      <h1>{d.title}</h1>
      <div dangerouslySetInnerHTML={{ __html: d.html }} />
      <h2>Products in this category</h2>
      {live.length === 0 ? (
        <p aria-live="polite">Product pages for this category are being prepared. Send your requirements now and we will quote in 24h.</p>
      ) : null}
      <ProductList cat={cat} />
      <p>
        <Link href={cat.industry}>Read the {cat.name} industry overview</Link>
      </p>
      <PartnerStrip partners={partners} />
      <QuoteCta context={cat.name} />
      <nav aria-label="Other categories" className={styles.pageNav}>
        {cats
          .filter((c) => c.slug !== slug)
          .map((c, i) => (
            <span key={c.slug}>
              {i > 0 ? " · " : ""}
              <Link href={`/en/products/category/${c.slug}`}>{c.name}</Link>
            </span>
          ))}
      </nav>
    </main>
  );
}
