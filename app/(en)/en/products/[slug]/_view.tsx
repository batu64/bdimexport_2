// /en/products/{slug} ürün SEO/GEO sayfası — FAZ_2 Step 2.3. İçerik: content/en/global/products/{slug}.md (blok sırası CONTENT_STYLE §2).
// Schema: Product + FAQPage + Organization + BreadcrumbList (SEO_PLAYBOOK §4). hreflang YAZILMAZ (2.8).
// PARTNER BLOĞU (Seçenek A, 👤 onaylı): md'deki {{partners}} işaretçisi burada doldurulur — D1 dışa aktarımından (_partners.json) yalnız
// ONAYLI partnerler, logo yalnız consent_logo_en=true; hiç yoksa "onaylı partner bekleniyor" PLACEHOLDER. Partner UYDURULMAZ.
import fs from "node:fs";
import path from "node:path";
import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import styles from "@/lib/ui/variant.module.css";
import { space } from "@/lib/ui/tokens";
import { renderVariantMd } from "@/lib/ui/md";
import { QuoteCta } from "../../_lib/services";
import { PRODUCTS_ROOT, composeCatalog, loadPartners, partnersForCategory } from "../_lib/catalog";

const SITE = "https://bdimexport.com";
const MARKER = "<p>{{partners}}</p>";

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
  const file = path.join(PRODUCTS_ROOT, `${slug}.md`);
  if (!fs.existsSync(file)) return null;
  const raw = fs.readFileSync(file, "utf-8");
  return { ...renderVariantMd(raw), faq: parseFaq(raw) };
}

export function productSlugs(): string[] {
  return composeCatalog().flatMap((c) => c.products.filter((p) => p.live).map((p) => p.slug));
}

export function productMetadata(slug: string): Metadata {
  const d = readDoc(slug);
  if (!d) return {};
  return {
    title: { absolute: d.metaTitle ?? d.title },
    description: d.desc,
    alternates: { canonical: `${SITE}/en/products/${slug}` },
  };
}

const ORG = { "@type": "Organization", name: "Bdimexport", url: SITE };

function JsonLd({ graph }: { graph: object[] }) {
  const json = JSON.stringify({ "@context": "https://schema.org", "@graph": graph }).replace(/</g, "\\u003c");
  return <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: json }} />;
}

export function ProductPageView({ slug }: { slug: string }) {
  const cats = composeCatalog();
  const cat = cats.find((c) => c.products.some((p) => p.slug === slug));
  const prod = cat?.products.find((p) => p.slug === slug);
  const d = readDoc(slug);
  if (!cat || !prod || !d) {
    return (
      <main className={styles.main}>
        <h1>Product not found</h1>
        <p>
          See all <Link href="/en/products">product categories</Link>.
        </p>
      </main>
    );
  }
  const url = `${SITE}/en/products/${slug}`;
  const partners = partnersForCategory(loadPartners(), cat);
  const [before, after] = d.html.includes(MARKER) ? d.html.split(MARKER) : [d.html, ""];

  const graph: object[] = [
    {
      "@type": "Product",
      name: prod.name,
      description: d.desc,
      category: cat.name,
      url,
      // Fiyat YOK: teklif usulü. (uydurma fiyat/stok bilgisi yazılmaz)
      offers: {
        "@type": "Offer",
        url: `${url}#get-quote`,
        description: "Price on request: request a quotation. Our fee is quoted separately from third-party costs.",
        seller: ORG,
        priceSpecification: { "@type": "PriceSpecification", priceCurrency: "USD" },
      },
    },
    ORG,
  ];
  if (d.faq.length) {
    graph.push({
      "@type": "FAQPage",
      mainEntity: d.faq.map((f) => ({ "@type": "Question", name: f.q, acceptedAnswer: { "@type": "Answer", text: f.a } })),
    });
  }
  graph.push({
    "@type": "BreadcrumbList",
    itemListElement: [
      { name: "Home", item: `${SITE}/en` },
      { name: "Products", item: `${SITE}/en/products` },
      { name: cat.name, item: `${SITE}/en/products/category/${cat.slug}` },
      { name: prod.name, item: url },
    ].map((c, i) => ({ "@type": "ListItem", position: i + 1, name: c.name, item: c.item })),
  });

  return (
    <main className={styles.main}>
      <JsonLd graph={graph} />
      <nav aria-label="breadcrumb" className={styles.crumb}>
        <Link href="/en">Home</Link>
        <span aria-hidden="true"> → </span>
        <Link href="/en/products">Products</Link>
        <span aria-hidden="true"> → </span>
        <Link href={`/en/products/category/${cat.slug}`}>{cat.name}</Link>
        <span aria-hidden="true"> → </span>
        <span>{prod.name}</span>
      </nav>
      <h1>{d.title}</h1>
      <div dangerouslySetInnerHTML={{ __html: before }} />
      <div data-partner-state={partners.length === 0 ? "placeholder" : "listed"} aria-live="polite">
        {partners.length === 0 ? (
          <p>
            Approved partners are being onboarded. Verified manufacturers for this product category will appear here as soon as their
            review is complete.
          </p>
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
      </div>
      <div dangerouslySetInnerHTML={{ __html: after }} />
      <QuoteCta context={prod.name} />
    </main>
  );
}
