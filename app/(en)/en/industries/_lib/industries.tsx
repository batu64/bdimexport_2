// /en/industries ve /en/industries/{slug} — FAZ_2 Step 2.4 REWORK. İçerik: content/en/global/industries/*.md (üretici betik, products/_stats.json'dan).
// Schema: Article + ClaimReview + FAQPage + Organization + BreadcrumbList (SEO_PLAYBOOK §4). hreflang YAZILMAZ (2.8).
// Renk/spacing YALNIZ lib/ui/tokens + variant.module.css (hex yok). Önceki sürümdeki uydurma tarih/rozet/hero-görsel/istatistik sabitleri KALDIRILDI.
import fs from "node:fs";
import path from "node:path";
import type { Metadata } from "next";
import Link from "next/link";
import styles from "@/lib/ui/variant.module.css";
import { renderVariantMd } from "@/lib/ui/md";
import { QuoteCta } from "../../_lib/services";

const SITE = "https://bdimexport.com";
const ROOT = path.join(process.cwd(), "content", "en", "global", "industries");
/** Gerçek tarih: bu sürümün yazıldığı gün. (Eski sürümdeki uydurma 2026-01-15 yayın tarihi kaldırıldı.) */
const VERSION_DATE = "2026-10-16";

export const INDUSTRIES = [
  { slug: "textile", label: "Textile & Apparel" },
  { slug: "food", label: "Food & Agriculture" },
  { slug: "machinery", label: "Machinery & Engineering" },
  { slug: "construction", label: "Construction Materials" },
  { slug: "home-living", label: "Home & Living" },
] as const;

interface Claim {
  year: number;
  claim: string;
  total_usd_million: Record<string, number>;
  components: { slug: string; name: string; hs: string[]; source_url: string }[];
  verified_on: string;
}

const CLAIMS = JSON.parse(fs.readFileSync(path.join(ROOT, "_claims.json"), "utf-8")) as Record<string, Claim>;

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

const slugify = (s: string) =>
  s
    .toLowerCase()
    .replace(/&amp;/g, "and")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");

/** h2/h3'e id ekler: hesaplanan hücrelerin bağlandığı #calculation-notes çapası için. */
function withHeadingIds(html: string): string {
  return html.replace(/<h([23])>(.*?)<\/h\1>/g, (_m, l: string, inner: string) => `<h${l} id="${slugify(inner.replace(/<[^>]+>/g, ""))}">${inner}</h${l}>`);
}

function readDoc(name: string) {
  const file = path.join(ROOT, `${name}.md`);
  if (!fs.existsSync(file)) return null;
  const raw = fs.readFileSync(file, "utf-8");
  const d = renderVariantMd(raw);
  return { ...d, html: withHeadingIds(d.html), faq: parseFaq(raw) };
}

export function industrySlugs(): string[] {
  return INDUSTRIES.map((i) => i.slug).filter((s) => fs.existsSync(path.join(ROOT, `${s}.md`)));
}

const canonical = (p: string): Metadata["alternates"] => ({ canonical: `${SITE}${p}` });

export function industryMetadata(slug: string): Metadata {
  const d = readDoc(slug);
  if (!d) return {};
  return { title: { absolute: d.metaTitle ?? d.title }, description: d.desc, alternates: canonical(`/en/industries/${slug}`) };
}

export function indexMetadata(): Metadata {
  const d = readDoc("index");
  if (!d) return {};
  return { title: { absolute: d.metaTitle ?? d.title }, description: d.desc, alternates: canonical("/en/industries") };
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

export function IndustryPageView({ slug }: { slug: string }) {
  const meta = INDUSTRIES.find((i) => i.slug === slug);
  const d = readDoc(slug);
  const claim = CLAIMS[slug];
  if (!meta || !d || !claim) {
    return (
      <main className={styles.main}>
        <h1>Industry not found</h1>
        <p>
          See all <Link href="/en/industries">export industries</Link>.
        </p>
      </main>
    );
  }
  const url = `${SITE}/en/industries/${slug}`;
  const graph: object[] = [
    {
      "@type": "Article",
      headline: d.title,
      description: d.desc,
      inLanguage: "en",
      url,
      mainEntityOfPage: url,
      datePublished: VERSION_DATE,
      dateModified: VERSION_DATE,
      author: ORG,
      publisher: ORG,
    },
    // ClaimReview: iddia = tablodaki toplam; kaynak = bağlı UN Comtrade sorguları. Not: bu, sitenin KENDİ rakamını kaynağa karşı doğrulamasıdır
    // (üçüncü taraf fact-check değil); zengin sonuç uygunluğu Google politikasına bağlıdır — insan kararı (pano §4).
    {
      "@type": "ClaimReview",
      url: `${url}#export-data`,
      claimReviewed: claim.claim,
      datePublished: claim.verified_on,
      author: ORG,
      itemReviewed: {
        "@type": "Claim",
        author: { "@type": "Organization", name: "UN Comtrade (export data reported by Türkiye)" },
        appearance: { "@type": "CreativeWork", url: claim.components[0]?.source_url },
      },
      reviewRating: {
        "@type": "Rating",
        ratingValue: 5,
        bestRating: 5,
        worstRating: 1,
        alternateName: "True: equals the sum of the linked source values",
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
  graph.push(
    crumbs([
      { name: "Home", item: `${SITE}/en` },
      { name: "Industries", item: `${SITE}/en/industries` },
      { name: meta.label, item: url },
    ]),
  );
  return (
    <main className={styles.main}>
      <JsonLd graph={graph} />
      <nav aria-label="breadcrumb" className={styles.crumb}>
        <Link href="/en">Home</Link>
        <span aria-hidden="true"> → </span>
        <Link href="/en/industries">Industries</Link>
        <span aria-hidden="true"> → </span>
        <span>{meta.label}</span>
      </nav>
      <h1>{d.title}</h1>
      <div dangerouslySetInnerHTML={{ __html: d.html }} />
      <QuoteCta context={meta.label} />
    </main>
  );
}

export function IndustriesIndexView() {
  const d = readDoc("index");
  const cards = INDUSTRIES.map((i) => ({ ...i, doc: readDoc(i.slug) })).filter((c) => c.doc);
  const graph: object[] = [
    crumbs([
      { name: "Home", item: `${SITE}/en` },
      { name: "Industries", item: `${SITE}/en/industries` },
    ]),
    { "@type": "CollectionPage", name: d?.title, description: d?.desc, url: `${SITE}/en/industries` },
    {
      "@type": "ItemList",
      name: "Export industries",
      itemListElement: cards.map((c, i) => ({ "@type": "ListItem", position: i + 1, name: c.label, url: `${SITE}/en/industries/${c.slug}` })),
    },
  ];
  return (
    <main className={styles.main}>
      <JsonLd graph={graph} />
      <nav aria-label="breadcrumb" className={styles.crumb}>
        <Link href="/en">Home</Link>
        <span aria-hidden="true"> → </span>
        <span>Industries</span>
      </nav>
      <h1>{d?.title ?? "Export Industries of Turkey"}</h1>
      {d ? <div dangerouslySetInnerHTML={{ __html: d.html }} /> : null}
      <ul>
        {cards.map((c) => (
          <li key={c.slug}>
            <Link href={`/en/industries/${c.slug}`}>{c.label}</Link>
            {c.doc?.desc ? <> — {c.doc.desc}</> : null}
          </li>
        ))}
      </ul>
      <QuoteCta context="Export industries of Turkey" />
    </main>
  );
}
