// FAZ_4 4.6 — onaylı içerik → repo dosyaları (deterministik; AI çağrısı YOK). Saf modül: worker türlerine bağımlı değil
// (app/admin/content/handler.ts de kullanır).
//
// Kalıcı yayın = makale sayfası. AI metni elle hazırlanmış ürün/sektör/hizmet sayfalarının ÜZERİNE YAZILMAZ;
// page_type ne olursa olsun (news_card hariç) içerik "insights/makaleler" altında yeni dosya olarak önerilir.
// de / zh rotaları FAZ 5'te kurulur → o zamana kadar bu dillerde kalıcı yayın reddedilir.

export const SITE = "https://bdimexport.com";

export interface ContentRow {
  id: string;
  slug: string;
  locale: string;
  page_type: string;
  title: string;
  body_md: string;
  target_keyword: string | null;
  schema_json: string | null;
  status: string;
  model: string | null;
  source_job_id: string | null;
}

export interface ArticleRoute {
  /** repo içi dizin (sonunda / yok) */
  dir: string;
  /** site yolu öneki (başında /, sonunda / yok) */
  urlBase: string;
  /** dizin sayfasının görünen adı (breadcrumb) */
  section: string;
}

const EN_VARIANTS = ["ru", "fr", "nl", "es", "ar"] as const;

/** locale → makale rotası. null = bu dilde kalıcı makale rotası henüz yok. */
export function routeFor(locale: string): ArticleRoute | null {
  if (locale === "tr") return { dir: "content/tr/makaleler", urlBase: "/makaleler", section: "Makaleler" };
  if (locale === "en") return { dir: "content/en/global/insights", urlBase: "/en/insights", section: "Insights" };
  const m = locale.match(/^en-([a-z]{2})$/);
  if (m && (EN_VARIANTS as readonly string[]).includes(m[1])) {
    return { dir: `content/en/${m[1]}/insights`, urlBase: `/en/${m[1]}/insights`, section: "Insights" };
  }
  return null; // de, zh → FAZ 5
}

export const SLUG_RE = /^[a-z0-9]+(?:-[a-z0-9]+){0,15}$/;

export type RenderError = "route_pending" | "bad_slug" | "mock_not_publishable" | "use_edge" | "empty_body";

export interface RenderedArticle {
  url: string;
  files: { path: string; content: string }[];
}

const isMock = (c: Pick<ContentRow, "model" | "title">) => c.model === "mock" || /^\s*\[MOCK\]/i.test(c.title);

/** META yorumu için: çift tırnak ve yorum kapanışı metni bozamaz. */
const metaSafe = (s: string) => s.replace(/"/g, "”").replace(/-->/g, "—>").replace(/\s+/g, " ").trim();

function clip(s: string, max: number): string {
  if (s.length <= max) return s;
  const cut = s.slice(0, max - 1);
  const sp = cut.lastIndexOf(" ");
  return (sp > max * 0.6 ? cut.slice(0, sp) : cut).trimEnd() + "…";
}

interface LdNode { "@type"?: string; [k: string]: unknown }

/** 4.5 JSON-LD'sini gerçek URL'lere bağlar (breadcrumb + mainEntityOfPage). Bozuk JSON → yalnız temel Article. */
function finalizeSchema(c: ContentRow, url: string, route: ArticleRoute): { json: string; description: string } {
  let graph: LdNode[] = [];
  try {
    const p = JSON.parse(c.schema_json ?? "{}") as { "@graph"?: LdNode[] };
    if (Array.isArray(p["@graph"])) graph = p["@graph"];
  } catch { /* boş */ }
  let article = graph.find((n) => n["@type"] === "Article");
  if (!article) {
    article = { "@type": "Article", headline: c.title };
    graph.unshift(article);
  }
  article.mainEntityOfPage = url;
  article.url = url;
  const crumb = graph.find((n) => n["@type"] === "BreadcrumbList");
  const home = c.locale === "tr" ? `${SITE}/` : `${SITE}/en`;
  const crumbs = { "@type": "BreadcrumbList", itemListElement: [
    { "@type": "ListItem", position: 1, name: c.locale === "tr" ? "Ana Sayfa" : "Home", item: home },
    { "@type": "ListItem", position: 2, name: route.section, item: SITE + route.urlBase },
    { "@type": "ListItem", position: 3, name: c.title, item: url },
  ] };
  if (crumb) Object.assign(crumb, crumbs); else graph.push(crumbs);
  const description = typeof article.description === "string" ? article.description : "";
  return { json: JSON.stringify({ "@context": "https://schema.org", "@graph": graph }, null, 2) + "\n", description };
}

/** Onaylı içerik → PR'a girecek dosyalar. Hata kodu döner; hiçbir zaman fırlatmaz. */
export function renderArticle(c: ContentRow, meta: { approvedBy: string; preparedAt: string }): RenderedArticle | { error: RenderError; detail?: string } {
  if (c.page_type === "news_card") return { error: "use_edge" };
  if (isMock(c)) return { error: "mock_not_publishable" };
  const route = routeFor(c.locale);
  if (!route) return { error: "route_pending", detail: c.locale };
  if (!SLUG_RE.test(c.slug) || c.slug.length > 80) return { error: "bad_slug" };
  if (!c.body_md.trim()) return { error: "empty_body" };

  const url = `${SITE}${route.urlBase}/${c.slug}`;
  const schema = finalizeSchema(c, url, route);
  const brand = " | Bdimexport";
  const metaTitle = metaSafe(clip(c.title, 60 - brand.length) + brand);
  const metaDesc = metaSafe(clip(schema.description || c.title, 158));
  const provenance = [
    `content_id=${c.id}`, `locale=${c.locale}`, `page_type=${c.page_type}`, `model=${c.model ?? "-"}`,
    `source_job=${c.source_job_id ?? "-"}`, `approved_by=${meta.approvedBy}`, `prepared_at=${meta.preparedAt}`,
  ].map(metaSafe).join(" ");
  const body = c.body_md.replace(/<!--[\s\S]*?-->/g, "").trim();
  const md = [
    `<!-- META: title="${metaTitle}" desc="${metaDesc}" -->`,
    `<!-- PUBLISH: ${provenance} -->`,
    "",
    /^# /m.test(body) ? body : `# ${c.title}\n\n${body}`,
    "",
  ].join("\n");
  return {
    url,
    files: [
      { path: `${route.dir}/${c.slug}.md`, content: md },
      { path: `${route.dir}/${c.slug}.schema.json`, content: schema.json },
    ],
  };
}
