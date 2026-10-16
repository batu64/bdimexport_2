// /en/services/* ortak modül — FAZ_2 Step 2.1 (content/en/global/services/*.md → sayfa + metadata + JSON-LD).
// Markdown→HTML: lib/ui/md (üçüncü kopya yazılmaz). Schema: Service + FAQPage + BreadcrumbList (SEO_PLAYBOOK §4).
// hreflang: BU DOSYADA YAZILMAZ — veri content/en/global/global-manifest.json'da, enjeksiyon Step 2.8 (ortak dosya tekeli).
import fs from "fs";
import path from "path";
import type { Metadata } from "next";
import Link from "next/link";
import styles from "@/lib/ui/variant.module.css";
import { color } from "@/lib/ui/tokens";
import { renderVariantMd } from "@/lib/ui/md";
import { enAlternates } from "./hreflang";

const SITE = "https://bdimexport.com";
const ROOT = path.join(process.cwd(), "content", "en", "global", "services");

/** Sıra = menü/footer/indeks sırası (Proje.md §3.1 hizmet seti). label: kısa ad. */
export const SERVICES = [
  { slug: "sourcing", label: "Sourcing" },
  { slug: "manufacturing", label: "Private Label Manufacturing" },
  { slug: "inspection", label: "Factory Inspection" },
  { slug: "logistics", label: "Freight Logistics" },
  { slug: "customs", label: "Export Customs" },
] as const;
export type ServiceSlug = (typeof SERVICES)[number]["slug"];

/** Geçici teklif kanalı. Teklif FORMU/endpoint'i yok (lead POST FAZ 3'te) → sahte form YAZILMADI; gerçek e-posta kanalı.
 *  Adres KVKK metninde yayımlı (content/tr/legal) ama "geçici" etiketli; gerçek posta kutusu bağlanınca env ile değişir. */
const QUOTE_EMAIL = process.env.NEXT_PUBLIC_QUOTE_EMAIL ?? "iletisim@bdimexport.com";

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

/** Sayfa altı teklif bloğu — #get-quote (kabuk CTA'sının hedefi). mailto: gerçek, çalışan kanal. */
export function QuoteCta({ context }: { context: string }) {
  const subject = encodeURIComponent(`Quotation request: ${context}`);
  const body = encodeURIComponent("Product / service needed:\nQuantity:\nTarget market:\nDeadline:\nTarget price (optional):\n");
  return (
    <section id="get-quote" className={styles.contact}>
      <h2>Get Free Quotation in 24h</h2>
      <p>
        Tell us what you need, how much, where it should go and by when. You receive a free quotation within 24 hours. Our fee is
        quoted separately from third-party costs.
      </p>
      <p>
        <a
          href={`mailto:${QUOTE_EMAIL}?subject=${subject}&body=${body}`}
          className={`${styles.btn} ${styles.btnPrimary}`}
          style={{ color: color.primary }}
        >
          Request a quotation by email
        </a>
      </p>
    </section>
  );
}

export function ServicePage({ slug }: { slug: string }) {
  const d = readDoc(slug);
  const meta = SERVICES.find((s) => s.slug === slug);
  if (!d || !meta) {
    return (
      <main className={styles.main}>
        <h1>Service not found</h1>
        <p>
          See all <Link href="/en/services">export services from Turkey</Link>.
        </p>
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
  return (
    <main className={styles.main}>
      <JsonLd graph={graph} />
      <nav aria-label="breadcrumb" className={styles.crumb}>
        <Link href="/en">Home</Link>
        <span aria-hidden="true"> → </span>
        <Link href="/en/services">Services</Link>
        <span aria-hidden="true"> → </span>
        <span>{meta.label}</span>
      </nav>
      <h1>{d.title}</h1>
      <div dangerouslySetInnerHTML={{ __html: d.html }} />
      <QuoteCta context={meta.label} />
      <nav aria-label="Other services" className={styles.pageNav}>
        {SERVICES.filter((s) => s.slug !== slug).map((s, i) => (
          <span key={s.slug}>
            {i > 0 ? " · " : ""}
            <Link href={`/en/services/${s.slug}`}>{s.label}</Link>
          </span>
        ))}
      </nav>
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
    <main className={styles.main}>
      <JsonLd graph={graph} />
      <nav aria-label="breadcrumb" className={styles.crumb}>
        <Link href="/en">Home</Link>
        <span aria-hidden="true"> → </span>
        <span>Services</span>
      </nav>
      <h1>{d?.title ?? "Export Services from Turkey"}</h1>
      {d ? <div dangerouslySetInnerHTML={{ __html: d.html }} /> : null}
      <ul>
        {cards.map((c) => (
          <li key={c.slug}>
            <Link href={`/en/services/${c.slug}`}>{c.label}</Link>
            {c.doc?.desc ? <> — {c.doc.desc}</> : null}
          </li>
        ))}
      </ul>
      <QuoteCta context="Export services from Turkey" />
    </main>
  );
}
