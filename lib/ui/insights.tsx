// FAZ_4 4.6 — Makale (insights / makaleler) sayfaları ortak katmanı. Kaynak: İçerik Fabrikası yayın botunun PR'ı
// (workers/api/src/publish/render.ts ile AYNI dizin sözleşmesi): content/tr/makaleler · content/en/global/insights ·
// content/en/{ru,fr,nl,es,ar}/insights → {slug}.md + {slug}.schema.json. Dosya yalnız merge edilmiş PR ile gelir.
// Render: lib/ui/md (META/HTML yorumları + üretim notları public'e sızmaz). Stil yalnız tokens/variant.module.css.
import fs from "node:fs";
import path from "node:path";
import type { CSSProperties } from "react";
import Link from "next/link";
import styles from "./variant.module.css";
import { renderVariantMd } from "./md";
import type { EnVariant } from "../i18n";

export const SITE = "https://bdimexport.com";
export type InsightScope = "tr" | "en" | EnVariant;

export function insightDir(scope: InsightScope): string {
  if (scope === "tr") return path.join(process.cwd(), "content", "tr", "makaleler");
  if (scope === "en") return path.join(process.cwd(), "content", "en", "global", "insights");
  return path.join(process.cwd(), "content", "en", scope, "insights");
}
export function insightBase(scope: InsightScope): string {
  return scope === "tr" ? "/makaleler" : scope === "en" ? "/en/insights" : `/en/${scope}/insights`;
}

const SLUG = /^[a-z0-9]+(?:-[a-z0-9]+){0,15}$/;

/** Yayınlanmış makale slug'ları (yalnız geçerli slug'lı .md; _ ile başlayanlar ve sidecar'lar hariç). */
export function listInsights(scope: InsightScope): string[] {
  const dir = insightDir(scope);
  if (!fs.existsSync(dir)) return [];
  return fs.readdirSync(dir).filter((f) => f.endsWith(".md")).map((f) => f.slice(0, -3)).filter((s) => SLUG.test(s)).sort();
}

/**
 * Static export: boş generateStaticParams build'i durdurur → makale yokken tek bir yer tutucu parametre üretilir;
 * sayfa notFound() verir (404.html), sitemap'e GİRMEZ (orchestrator listInsights'ı kullanır).
 */
export const PLACEHOLDER = "_yok";
export function insightParams(scope: InsightScope): { slug: string }[] {
  const s = listInsights(scope);
  return (s.length ? s : [PLACEHOLDER]).map((slug) => ({ slug }));
}

export interface Insight { slug: string; title: string; metaTitle?: string; desc?: string; html: string; jsonLd: string | null; url: string }

export function readInsight(scope: InsightScope, slug: string): Insight | null {
  if (!SLUG.test(slug)) return null;
  const file = path.join(insightDir(scope), `${slug}.md`);
  if (!fs.existsSync(file)) return null;
  const parsed = renderVariantMd(fs.readFileSync(file, "utf-8"), { rtl: scope === "ar" });
  let jsonLd: string | null = null;
  const side = path.join(insightDir(scope), `${slug}.schema.json`);
  if (fs.existsSync(side)) {
    try {
      jsonLd = JSON.stringify(JSON.parse(fs.readFileSync(side, "utf-8"))).replace(/</g, "\\u003c"); // geçerli JSON değilse basılmaz
    } catch { jsonLd = null; }
  }
  return { slug, title: parsed.title, metaTitle: parsed.metaTitle, desc: parsed.desc, html: parsed.html, jsonLd, url: `${SITE}${insightBase(scope)}/${slug}` };
}

export function InsightArticle({ insight, crumbs, style }: { insight: Insight; crumbs: { label: string; href: string }[]; style?: CSSProperties }) {
  return (
    <main className={style ? undefined : styles.main} style={style}>
      {insight.jsonLd && <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: insight.jsonLd }} />}
      <nav aria-label="breadcrumb" className={styles.crumb}>
        {crumbs.map((c, i) => (
          <span key={c.href}>
            {i > 0 && <span aria-hidden="true"> › </span>}
            <Link href={c.href}>{c.label}</Link>
          </span>
        ))}
      </nav>
      <h1>{insight.title}</h1>
      <div dangerouslySetInnerHTML={{ __html: insight.html }} />
    </main>
  );
}

export function InsightList({ scope, empty }: { scope: InsightScope; empty: string }) {
  const items = listInsights(scope).map((s) => readInsight(scope, s)).filter((x): x is Insight => !!x);
  if (items.length === 0) return <p>{empty}</p>;
  return (
    <ul className={styles.list}>
      {items.map((it) => (
        <li key={it.slug}>
          <Link href={`${insightBase(scope)}/${it.slug}`}>{it.title}</Link>
          {it.desc && <p>{it.desc}</p>}
        </li>
      ))}
    </ul>
  );
}
