// TR içerik sayfaları ortak modülü — FAZ_1 Step 1.5
// content/tr/**/*.md → HTML + generateMetadata + JSON-LD (SEO_PLAYBOOK §4) + canonical/hreflang (§1: yalnız tr + x-default).
// _lib = Next private folder (route değil). Üç [slug] sayfası ve üç indeks sayfası bunu kullanır (kopya yok).
import fs from "fs";
import path from "path";
import type { Metadata } from "next";
import { Clock } from "lucide-react";
import ArticleLayout, { AsideCta, type TocItem } from "@/lib/ui/ArticleLayout";
import PageHeader, { type Crumb } from "@/lib/ui/PageHeader";
import CtaBand from "@/lib/ui/CtaBand";
import Card from "@/lib/ui/Card";
import Button from "@/lib/ui/Button";
import Reveal from "@/lib/ui/motion/Reveal";
import { Section, SectionHeader } from "@/lib/ui/Section";
import cardGrid from "@/lib/ui/cardgrid.module.css";
import { iconFor } from "./icons";
import { APPLY_PATH, quoteHref } from "./links";
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

// Basit markdown→HTML (FAZ_2'de content collections/remark ile değişir).
// D4: h2 → id (içindekiler + #bağlantı), tablo → .table-wrap (dar ekranda yatay kaydırma), "## Sık Sorulan Sorular"
// altındaki ### → <details> akordeon (JS'siz). Metin aynen korunur; FAQPage JSON-LD ayrıca parseFaq'tan üretilir.
const TR_ASCII: Record<string, string> = { ç: "c", ğ: "g", ı: "i", İ: "i", ö: "o", ş: "s", ü: "u", Ç: "c", Ğ: "g", Ö: "o", Ş: "s", Ü: "u" };
const slugify = (t: string) =>
  t.replace(/[çğıİöşüÇĞÖŞÜ]/g, (c) => TR_ASCII[c]).toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "").slice(0, 60);
const plainText = (t: string) => t.replace(/\[([^\]]+)\]\([^)]+\)/g, "$1").replace(/\*\*([^*]+)\*\*/g, "$1").replace(/`/g, "");

function md2html(md: string): { html: string; toc: TocItem[] } {
  let html = "";
  const toc: TocItem[] = [];
  const used = new Set<string>();
  let inList: "ul" | "ol" | null = null;
  let inTable = false;
  let inCode = false;
  let inFaq = false;
  let inDetails = false;
  const closeList = () => {
    if (inList) html += `</${inList}>`;
    inList = null;
  };
  const closeTable = () => {
    if (inTable) html += "</table></div>";
    inTable = false;
  };
  const closeDetails = () => {
    if (inDetails) html += "</div></details>";
    inDetails = false;
  };
  const closeFaq = () => {
    closeDetails();
    if (inFaq) html += "</div>";
    inFaq = false;
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
        html += '<div class="table-wrap"><table><tr>' + cells.map((c) => `<th>${inline(c)}</th>`).join("") + "</tr>";
      } else html += "<tr>" + cells.map((c) => `<td>${inline(c)}</td>`).join("") + "</tr>";
      continue;
    }
    closeTable();
    if (tl.startsWith("### ")) {
      closeList();
      if (inFaq) {
        closeDetails();
        html += `<details><summary>${inline(tl.slice(4))}</summary><div>`;
        inDetails = true;
      } else html += `<h3>${inline(tl.slice(4))}</h3>`;
    } else if (tl.startsWith("## ")) {
      closeList();
      closeFaq();
      const text = tl.slice(3);
      let id = slugify(plainText(text)) || `bolum-${toc.length + 1}`;
      while (used.has(id)) id += "-2";
      used.add(id);
      toc.push({ id, text: plainText(text) });
      html += `<h2 id="${id}">${inline(text)}</h2>`;
      if (text === "Sık Sorulan Sorular") {
        html += '<div class="faq">';
        inFaq = true;
      }
    } else if (tl.startsWith("- ")) {
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
  closeTable();
  if (inCode) html += "</code></pre>";
  closeFaq();
  return { html, toc };
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

export { JsonLd };

const pg = dict.page;
const readMinutes = (body: string) => Math.max(1, Math.round(body.split(/\s+/).length / 200));

/** Breadcrumb (görünür) — JSON-LD crumbs() ile aynı sıra */
function visibleCrumbs(kind: Kind, title: string): Crumb[] {
  const c: Crumb[] = [{ label: t.home, href: "/" }];
  if (kind === "ihracat") c.push({ label: t.ihracat, href: "/ihracat" });
  else c.push({ label: t.ithalat, href: "/ithalat" });
  if (kind === "rehber") c.push({ label: t.guides, href: "/ithalat/rehberler" });
  c.push({ label: title });
  return c;
}

/** Aynı türdeki diğer sayfalar (ilgili kartlar) */
function related(kind: Kind, slug: string) {
  return listSlugs(kind)
    .filter((x) => x !== slug)
    .flatMap((x) => {
      const d = readDoc(kind, x);
      return d ? [{ slug: x, title: d.title, desc: d.desc ?? "" }] : [];
    })
    .slice(0, 3);
}

export function ContentPage({ kind, slug }: { kind: Kind; slug: string }) {
  const doc = readDoc(kind, slug);
  if (!doc) {
    return (
      <main>
        <PageHeader crumbs={[{ label: t.home, href: "/" }, { label: t.notFound }]} crumbsLabel={pg.crumbs} title={t.notFound} />
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
  const { html, toc } = md2html(doc.body);
  const isExport = kind === "ihracat";
  const isProgram = slug === "program-tanitim";
  const rel = related(kind, slug);
  const cta = isExport ? pg.cta.export : pg.cta.import;
  return (
    <main>
      <JsonLd graph={graph} />
      <PageHeader
        crumbs={visibleCrumbs(kind, doc.title)}
        crumbsLabel={pg.crumbs}
        eyebrow={pg.eyebrow[kind]}
        title={doc.title}
        lead={doc.desc}
        meta={
          <span className="chip">
            <Clock aria-hidden="true" className="chip-icon" />
            {pg.readTime.replace("{n}", String(readMinutes(doc.body)))}
          </span>
        }
        actions={
          isExport ? (
            <Button href={APPLY_PATH} variant="primary" size="lg" arrow>{dict.home.hero.ctaPrimary}</Button>
          ) : (
            <Button href={quoteHref} variant="primary" size="lg" arrow>{dict.home.hero.ctaSecondary}</Button>
          )
        }
      />
      <ArticleLayout
        toc={toc}
        tocLabel={pg.toc}
        aside={
          isExport ? (
            <AsideCta
              title={pg.aside.applyTitle}
              text={pg.aside.applyText}
              cta={{ label: pg.aside.applyCta, href: APPLY_PATH }}
              secondary={isProgram ? undefined : { label: pg.aside.programLink, href: "/ihracat/program-tanitim" }}
            />
          ) : (
            <AsideCta title={pg.aside.quoteTitle} text={pg.aside.quoteText} cta={{ label: pg.aside.quoteCta, href: quoteHref }} />
          )
        }
      >
        <div className="prose" dangerouslySetInnerHTML={{ __html: html }} />
      </ArticleLayout>
      {rel.length > 0 && (
        <Section id="ilgili" tone="alt">
          <SectionHeader id="ilgili" title={pg.related[kind]} />
          <ul role="list" className={cardGrid.grid}>
            {rel.map((r, i) => {
              const Icon = iconFor(r.slug);
              return (
                <Reveal as="li" key={r.slug} index={i}>
                  <Card title={r.title} href={`${CFG[kind].base}/${r.slug}`} description={r.desc} icon={<Icon />} more={pg.read} />
                </Reveal>
              );
            })}
          </ul>
        </Section>
      )}
      <CtaBand
        title={cta.title}
        lead={cta.lead}
        primary={isExport ? { label: dict.home.hero.ctaPrimary, href: APPLY_PATH } : { label: dict.home.hero.ctaSecondary, href: quoteHref }}
        secondary={isExport ? { label: dict.home.hero.ctaSecondary, href: quoteHref } : undefined}
      />
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
  const isExport = section === "ihracat";
  const cta = isExport ? pg.cta.export : pg.cta.import;
  const crumbList: Crumb[] = crumbItems.map((c, i) => ({ label: c.name, href: i < crumbItems.length - 1 ? c.item.replace(SITE, "") || "/" : undefined }));
  return (
    <main>
      <JsonLd graph={graph} />
      <PageHeader
        crumbs={crumbList}
        crumbsLabel={pg.crumbs}
        eyebrow={section === "rehberler" ? t.ithalat : t[section]}
        title={m.h1}
        lead={m.desc}
        meta={<span className="chip">{pg.index.count.replace("{n}", String(items.length))}</span>}
      />
      <Section id="liste">
        <h2 id="liste-title" className="visually-hidden">{m.intro.replace(/:$/, "")}</h2>
        <ul role="list" className={cardGrid.grid}>
          {items.map(({ slug, doc }, i) => {
            const Icon = iconFor(slug);
            return (
              <Reveal as="li" key={slug} index={i % 3}>
                <Card title={doc.title} href={`${CFG[kind].base}/${slug}`} description={doc.desc} icon={<Icon />} more={pg.read} />
              </Reveal>
            );
          })}
        </ul>
        {section === "ithalat" && (
          <p className={cardGrid.more}>
            <Button href="/ithalat/rehberler" variant="ghost">{t.guides}</Button>
          </p>
        )}
      </Section>
      <CtaBand
        title={cta.title}
        lead={cta.lead}
        primary={isExport ? { label: dict.home.hero.ctaPrimary, href: APPLY_PATH } : { label: dict.home.hero.ctaSecondary, href: quoteHref }}
        secondary={isExport ? { label: dict.home.hero.ctaSecondary, href: quoteHref } : undefined}
      />
    </main>
  );
}
