// /de/ratgeber — makale rotaları SHELL'i (FAZ_5 5.6 · ERTELENEN C7). İçerik: content/de/ratgeber/{slug}.md (+ .schema.json) — yalnız
// İçerik Fabrikası yayın botunun merge edilmiş PR'ıyla gelir (FAZ 4 hattı; bot tarafı routeFor = C7 kalanı, api scope).
// Görünüm lib/ui/insights (InsightArticle) ile AYNI: PageHeader + ArticleLayout + prose. Boşken dürüst "folgen in Kürze".
import fs from "node:fs";
import path from "node:path";
import { FileText } from "lucide-react";
import Card from "@/lib/ui/Card";
import grid from "@/lib/ui/cardgrid.module.css";
import empty from "@/lib/ui/empty.module.css";
import { renderVariantMd } from "@/lib/ui/md";
import { PLACEHOLDER, SITE, type Insight } from "@/lib/ui/insights";

export const RATGEBER_BASE = "/de/ratgeber";
const DIR = path.join(process.cwd(), "content", "de", "ratgeber");
const SLUG = /^[a-z0-9]+(?:-[a-z0-9]+){0,15}$/;

export function listRatgeber(): string[] {
  if (!fs.existsSync(DIR)) return [];
  return fs.readdirSync(DIR).filter((f) => f.endsWith(".md")).map((f) => f.slice(0, -3)).filter((s) => SLUG.test(s)).sort();
}

/** Static export: boş generateStaticParams build'i durdurur → makale yokken yer tutucu; sayfa notFound() (sitemap'e girmez). */
export function ratgeberParams(): { slug: string }[] {
  const s = listRatgeber();
  return (s.length ? s : [PLACEHOLDER]).map((slug) => ({ slug }));
}

export function readRatgeber(slug: string): Insight | null {
  if (!SLUG.test(slug)) return null;
  const file = path.join(DIR, `${slug}.md`);
  if (!fs.existsSync(file)) return null;
  const parsed = renderVariantMd(fs.readFileSync(file, "utf-8"));
  let jsonLd: string | null = null;
  const side = path.join(DIR, `${slug}.schema.json`);
  if (fs.existsSync(side)) {
    try { jsonLd = JSON.stringify(JSON.parse(fs.readFileSync(side, "utf-8"))).replace(/</g, "\\u003c"); } catch { jsonLd = null; }
  }
  return { slug, title: parsed.title, metaTitle: parsed.metaTitle, desc: parsed.desc, html: parsed.html, jsonLd, url: `${SITE}${RATGEBER_BASE}/${slug}` };
}

export function RatgeberList({ emptyText, more }: { emptyText: string; more: string }) {
  const items = listRatgeber().map(readRatgeber).filter((x): x is Insight => !!x);
  if (!items.length) {
    return (
      <div className={empty.box} aria-live="polite">
        <FileText aria-hidden="true" className={empty.icon} />
        <p>{emptyText}</p>
      </div>
    );
  }
  return (
    <ul role="list" className={grid.grid}>
      {items.map((it) => (
        <li key={it.slug}>
          <Card title={it.title} href={`${RATGEBER_BASE}/${it.slug}`} description={it.desc} icon={<FileText />} more={more} />
        </li>
      ))}
    </ul>
  );
}
