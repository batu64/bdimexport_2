// TR içerik sayfaları ortak modülü — FAZ_1 Step 1.5
// content/tr/**/*.md → HTML + generateMetadata + JSON-LD (SEO_PLAYBOOK §4) + canonical/hreflang (§1: yalnız tr + x-default).
// _lib = Next private folder (route değil). Üç [slug] sayfası ve üç indeks sayfası bunu kullanır (kopya yok).
import fs from "fs";
import path from "path";
import type { Metadata } from "next";
import Link from "next/link";
import { space, prose } from "@/lib/ui/tokens";
import { buildAlternateSet, toMetadataAlternates } from "@/lib/hreflang";
import dict from "@/lib/messages/tr.json";

export type Kind = "ithalat" | "ihracat" | "rehber";

const SITE = "https://bdimexport.com";
const ROOT = path.join(process.cwd(), "content", "tr");
const t = dict.content;

const CFG: Record<Kind, { dir: string[]; base: string; ld: "Service" | "Article" }> = {
  ithalat: { dir: ["ithalat"], base: "/ithalat", ld: "Service" },
  ihracat: { dir: ["ihracat"], base: "/ihracat", ld: "Service" },
  rehber: { dir: ["ithalat", "rehberler"], base: "/ithalat/rehberler", ld: "Article" },
};

// Dosyası olmayan/başka sayfaya ait slug'lar rota üretmez
const EXCLUDE = new Set(["danismanlik-talebi", "ucretsiz-destek-basvuru"]);

export function listSlugs(kind: Kind): string[] {
  const dir = path.join(ROOT, ...CFG[kind].dir);
  if (!fs.existsSync(dir)) return [];
  return fs
    .readdirSync(dir)
    .filter((f) => f.endsWith(".md"))
    .map((f) => f.replace(/\.md$/, ""))
    .filter((s) => !EXCLUDE.has(s))
    .sort();
}

type Faq = { q: string; a: string };
export type Doc = { title: string; metaTitle?: string; desc?: string; body: string; faq: Faq[] };

const plain = (s: string) =>
  s.replace(/\[([^\]]+)\]\([^)]+\)/g, "$1").replace(/\*\*([^*]+)\*\*/g, "$1").replace(/`/g, "").replace(/\s+/g, " ").trim();

function parseFaq(body: string): Faq[] {
  const out: Faq[] = [];
  let inFaq = false;
  let cur: Faq | null = null;
  for (const line of body.split("\n")) {
    const tl = line.trim();
    if (tl.startsWith("## ")) {
      inFaq = tl === "## Sık Sorulan Sorular";
      cur = null;
      continue;
    }
    if (!inFaq) continue;
    if (tl.startsWith("### ")) {
      cur = { q: plain(tl.slice(4)), a: "" };
      out.push(cur);
    } else if (cur && tl) {
      cur.a = (cur.a + " " + plain(tl)).trim();
    }
  }
  return out.filter((f) => f.q && f.a);
}

export function readDoc(kind: Kind, slug: string): Doc | null {
  const file = path.join(ROOT, ...CFG[kind].dir, slug + ".md");
  if (!fs.existsSync(file)) return null;
  const raw = fs.readFileSync(file, "utf-8");
  const metaBlock = raw.match(/<!--\s*META:([\s\S]*?)-->/)?.[1] ?? "";
  const metaTitle = metaBlock.match(/title="([^"]+)"/)?.[1];
  const desc = metaBlock.match(/desc="([^"]+)"/)?.[1];
  const title = raw.match(/^# (.+)$/m)?.[1] ?? slug;
  // Dahili üretim notları (Sayfa tipi / Durum / model adı) public sayfaya SIZMAZ; H1 sayfa başlığı olarak ayrıca basılır
  const body = raw
    .replace(/<!--[\s\S]*?-->/g, "")
    .split("\n")
    .filter((l) => !/^\*\*(Sayfa tipi|Durum):\*\*/.test(l.trim()) && !/^# /.test(l))
    .join("\n")
    .trim();
  return { title, metaTitle, desc, body, faq: parseFaq(body) };
}

const esc = (s: string) => s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
const inline = (s: string) =>
  esc(s)
    .replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2">$1</a>')
    .replace(/\*\*([^*]+)\*\*/g, "<strong>$1</strong>")
    .replace(/`([^`]+)`/g, "<code>$1</code>");

// Basit markdown→HTML (FAZ_2'de content collections/remark ile değişir)
function md2html(md: string): string {
  let html = "";
  let inList: "ul" | "ol" | null = null;
  let inTable = false;
  let inCode = false;
  const closeList = () => {
    if (inList) html += `</${inList}>`;
    inList = null;
  };
  for (const line of md.split("\n")) {
    const tl = line.trim();
    if (tl.startsWith("```")) {
      closeList();
      inCode = !inCode;
      html += inCode ? "<pre><code>" : "</code></pre>";
      continue;
    }
    if (inCode) {
      html += esc(line) + "\n";
      continue;
    }
    if (tl.startsWith("|")) {
      closeList();
      if (/^[-\s|:]+$/.test(tl)) continue;
      const cells = tl.split("|").slice(1, -1).map((c) => c.trim());
      if (!inTable) {
        inTable = true;
        html += "<table><tr>" + cells.map((c) => `<th>${inline(c)}</th>`).join("") + "</tr>";
      } else html += "<tr>" + cells.map((c) => `<td>${inline(c)}</td>`).join("") + "</tr>";
      continue;
    }
    if (inTable) {
      html += "</table>";
      inTable = false;
    }
    if (tl.startsWith("### ")) { closeList(); html += `<h3>${inline(tl.slice(4))}</h3>`; }
    else if (tl.startsWith("## ")) { closeList(); html += `<h2>${inline(tl.slice(3))}</h2>`; }
    else if (tl.startsWith("- ")) {
      if (inList !== "ul") { closeList(); html += "<ul>"; inList = "ul"; }
      html += `<li>${inline(tl.slice(2))}</li>`;
    } else if (/^\d+\. /.test(tl)) {
      if (inList !== "ol") { closeList(); html += "<ol>"; inList = "ol"; }
      html += `<li>${inline(tl.replace(/^\d+\. /, ""))}</li>`;
    } else {
      closeList();
      if (tl) html += `<p>${inline(tl)}</p>`;
    }
  }
  closeList();
  if (inTable) html += "</table>";
  if (inCode) html += "</code></pre>";
  return html;
}

/** canonical + hreflang: yalnız tr + x-default (en/de/zh karşılıkları yok → 404-hreflang yasağı, SEO_PLAYBOOK §1.4) */
export function trAlternates(urlPath: string): Metadata["alternates"] {
  const p = urlPath.replace(/^\//, "");
  return { canonical: `${SITE}/${p}`, ...toMetadataAlternates(buildAlternateSet(p, ["tr"])) };
}

export function docMetadata(kind: Kind, slug: string): Metadata {
  const doc = readDoc(kind, slug);
  if (!doc) return {};
  return {
    title: { absolute: doc.metaTitle ?? `${doc.title} | Bdimexport` },
    description: doc.desc,
    alternates: trAlternates(`${CFG[kind].base}/${slug}`),
  };
}

const ORG = { "@type": "Organization", name: dict.site.name, url: SITE };

function crumbs(kind: Kind, title: string, url: string) {
  const items: { name: string; item: string }[] = [{ name: t.home, item: `${SITE}/` }];
  if (kind === "ihracat") items.push({ name: t.ihracat, item: `${SITE}/ihracat` });
  else items.push({ name: t.ithalat, item: `${SITE}/ithalat` });
  if (kind === "rehber") items.push({ name: t.guides, item: `${SITE}/ithalat/rehberler` });
  items.push({ name: title, item: url });
  return {
    "@type": "BreadcrumbList",
    itemListElement: items.map((c, i) => ({ "@type": "ListItem", position: i + 1, name: c.name, item: c.item })),
  };
}

function JsonLd({ graph }: { graph: object[] }) {
  const json = JSON.stringify({ "@context": "https://schema.org", "@graph": graph }).replace(/</g, "\\u003c");
  return <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: json }} />;
}

const mainStyle = { maxWidth: prose, margin: "0 auto", padding: `${space.s8}px ${space.s4}px` } as const;

export function pageMainStyle() {
  return mainStyle;
}

export { JsonLd };

export function ContentPage({ kind, slug }: { kind: Kind; slug: string }) {
  const doc = readDoc(kind, slug);
  if (!doc) {
    return (
      <main style={mainStyle}>
        <h1>{t.notFound}</h1>
      </main>
    );
  }
  const url = `${SITE}${CFG[kind].base}/${slug}`;
  const main =
    CFG[kind].ld === "Article"
      ? {
          "@type": "Article",
          headline: doc.title,
          description: doc.desc,
          inLanguage: "tr",
          mainEntityOfPage: url,
          author: ORG,
          publisher: ORG,
        }
      : {
          "@type": "Service",
          name: doc.title,
          description: doc.desc,
          areaServed: "TR",
          provider: ORG,
          url,
        };
  const graph: object[] = [main];
  if (doc.faq.length) {
    graph.push({
      "@type": "FAQPage",
      mainEntity: doc.faq.map((f) => ({
        "@type": "Question",
        name: f.q,
        acceptedAnswer: { "@type": "Answer", text: f.a },
      })),
    });
  }
  graph.push(crumbs(kind, doc.title, url));
  return (
    <main style={mainStyle}>
      <JsonLd graph={graph} />
      <h1>{doc.title}</h1>
      <div dangerouslySetInnerHTML={{ __html: md2html(doc.body) }} />
      {kind === "ihracat" && (
        <p style={{ marginTop: space.s8 }}>
          <Link href="/ihracat/ucretsiz-destek-basvuru">{t.applyCta}</Link>
        </p>
      )}
    </main>
  );
}

/** Bölüm indeksi: /ithalat · /ihracat · /ithalat/rehberler */
export function indexMetadata(key: "ithalat" | "ihracat" | "rehberler"): Metadata {
  const m = dict.indexes[key];
  const urlPath = key === "rehberler" ? "/ithalat/rehberler" : `/${key}`;
  return { title: { absolute: m.title }, description: m.desc, alternates: trAlternates(urlPath) };
}

export function IndexPage({ kind, section }: { kind: Kind; section: "ithalat" | "ihracat" | "rehberler" }) {
  const m = dict.indexes[section];
  const urlPath = section === "rehberler" ? "/ithalat/rehberler" : `/${section}`;
  const items = listSlugs(kind)
    .map((slug) => ({ slug, doc: readDoc(kind, slug) }))
    .filter((x): x is { slug: string; doc: Doc } => !!x.doc);
  const crumbItems = [{ name: t.home, item: `${SITE}/` }];
  if (section === "rehberler") crumbItems.push({ name: t.ithalat, item: `${SITE}/ithalat` });
  crumbItems.push({ name: m.h1, item: `${SITE}${urlPath}` });
  const graph: object[] = [
    {
      "@type": "BreadcrumbList",
      itemListElement: crumbItems.map((c, i) => ({ "@type": "ListItem", position: i + 1, name: c.name, item: c.item })),
    },
  ];
  return (
    <main style={mainStyle}>
      <JsonLd graph={graph} />
      <h1>{m.h1}</h1>
      <p>{m.intro}</p>
      <ul>
        {items.map(({ slug, doc }) => (
          <li key={slug}>
            <Link href={`${CFG[kind].base}/${slug}`}>{doc.title}</Link>
            {doc.desc ? <> — {doc.desc}</> : null}
          </li>
        ))}
      </ul>
      {section === "ithalat" && (
        <p>
          <Link href="/ithalat/rehberler">{t.guides}</Link>
        </p>
      )}
      {section === "ihracat" && (
        <p>
          <Link href="/ihracat/ucretsiz-destek-basvuru">{t.applyCta}</Link>
        </p>
      )}
    </main>
  );
}
