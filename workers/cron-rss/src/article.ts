// FAZ_4 4.5 — makale sözleşmesi: model çıktısı doğrulaması + JSON-LD (Article/FAQPage/BreadcrumbList/ClaimReview) + KONTROL PASS'i.
// KONTROL PASS'i = SEO_PLAYBOOK §7 eşikleri, tamamen DETERMİNİSTİK (model yok; "GLM yerine"). İki sınıf:
//   HARD (iş 'blocked', taslak YAZILMAZ): kaynaksız/atıfsız rakam · kaynak metnin aynen kopyası · yönerge/enjeksiyon · güvensiz markup · yabancı dış link
//   SOFT (taslak yazılır, rapor iş sonucuna girer; insan düzeltir): kelime<1200 · FAQ<5/yanlış uzunluk · keyword yerleşimi/yoğunluk · meta uzunlukları · iç link<2 · locale kopyası
import { detectInjection } from "./sanitize";

export interface Fact {
  id: string;
  text: string; // sanitize edilmiş kaynak metni (A: yönetici metni; B: haber başlığı+özeti; C: yalnız keyword)
  url: string | null; // kaynak bağlantısı (B: haber URL'si)
  label: string;
  /** true = RSS metni: AYNEN kopyalanamaz (yeniden yazım zorunlu) */
  copyProtected: boolean;
}

export interface Faq { q: string; a: string }
export interface Article {
  title: string;
  meta_title: string;
  meta_description: string;
  keyword: string | null;
  body_md: string; // "# H1" ile başlar; FAQ bölümü dahil
  faq: Faq[];
  claims: { statement: string; fact_id: string }[];
}

const KEYS = ["title", "meta_title", "meta_description", "keyword", "body_md", "faq", "claims"] as const;
const isObj = (v: unknown): v is Record<string, unknown> => !!v && typeof v === "object" && !Array.isArray(v);
const isStr = (v: unknown, min: number, max: number): v is string => typeof v === "string" && v.trim().length >= min && v.length <= max;

export type ArticleReject = "not_object" | "bad_keys" | "bad_title" | "bad_meta" | "bad_keyword" | "bad_body" | "bad_faq" | "bad_claims";

/** Model çıktısı GÜVENİLMEZ: sıkı şekil doğrulaması (içerik denetimi controlPass'te). */
export function validateArticle(raw: unknown): { ok: true; value: Article } | { ok: false; reason: ArticleReject } {
  let v = raw;
  if (typeof v === "string") {
    try { v = JSON.parse(v); } catch { return { ok: false, reason: "not_object" }; }
  }
  if (!isObj(v)) return { ok: false, reason: "not_object" };
  const keys = Object.keys(v);
  if (keys.length !== KEYS.length || !KEYS.every((k) => keys.includes(k))) return { ok: false, reason: "bad_keys" };
  if (!isStr(v.title, 5, 160)) return { ok: false, reason: "bad_title" };
  if (!isStr(v.meta_title, 5, 120) || !isStr(v.meta_description, 20, 300)) return { ok: false, reason: "bad_meta" };
  if (v.keyword !== null && !isStr(v.keyword, 2, 120)) return { ok: false, reason: "bad_keyword" };
  if (!isStr(v.body_md, 200, 80_000)) return { ok: false, reason: "bad_body" };
  if (!Array.isArray(v.faq) || v.faq.length > 12 || !v.faq.every((f) => isObj(f) && Object.keys(f).length === 2 && isStr(f.q, 5, 240) && isStr(f.a, 10, 1200))) return { ok: false, reason: "bad_faq" };
  if (!Array.isArray(v.claims) || v.claims.length > 30 || !v.claims.every((c) => isObj(c) && Object.keys(c).length === 2 && isStr(c.statement, 5, 400) && isStr(c.fact_id, 1, 40))) return { ok: false, reason: "bad_claims" };
  return {
    ok: true,
    value: {
      title: (v.title as string).trim(),
      meta_title: (v.meta_title as string).trim(),
      meta_description: (v.meta_description as string).trim(),
      keyword: v.keyword === null ? null : (v.keyword as string).trim(),
      body_md: (v.body_md as string).trim(),
      faq: (v.faq as Faq[]).map((f) => ({ q: f.q.trim(), a: f.a.trim() })),
      claims: (v.claims as Article["claims"]).map((c) => ({ statement: c.statement.trim(), fact_id: c.fact_id.trim() })),
    },
  };
}

// ───────────────────────── metin yardımcıları ─────────────────────────
const WORD_RE = /[\p{L}\p{N}]+/gu;
export const words = (s: string): string[] => (s.toLowerCase().match(WORD_RE) ?? []);
const CJK_RE = /[㐀-鿿]/g;

/** Kelime sayısı: zh için CJK karakter/1.5 (≈ kelime; SEO_PLAYBOOK §7 eşiği kelime cinsinden — zh varsayımı belgeli). */
export function wordCount(text: string, locale: string): number {
  if (locale === "zh") return Math.round((text.match(CJK_RE)?.length ?? 0) / 1.5);
  return words(text.replace(/\]\([^)]*\)/g, "]")).length;
}

const stripLinksUrls = (s: string) => s.replace(/\]\([^)]*\)/g, "]").replace(/`[^`]*`/g, " ");
const digitsOnly = (s: string) => s.replace(/\D/g, "");

/** Metindeki "istatistik/iddia" sayıları: yüzde, para/miktar birimli, ya da ≥3 haneli (yıl 1900–2100 hariç). */
export function extractStats(text: string): { raw: string; digits: string; index: number }[] {
  const t = stripLinksUrls(text);
  const out: { raw: string; digits: string; index: number }[] = [];
  const spans: [number, number][] = []; // aynı sayıyı iki desenle (örn. "$300" + "300") ikinci kez saymamak için
  const push = (m: RegExpMatchArray, numPart: string) => {
    const a = m.index ?? 0;
    const b = a + m[0].length;
    if (spans.some(([x, y]) => a < y && b > x)) return;
    const d = digitsOnly(numPart);
    if (!d) return;
    spans.push([a, b]);
    out.push({ raw: m[0].trim(), digits: d, index: a });
  };
  for (const m of t.matchAll(/(\d[\d.,]*)\s?(%|percent|per cent|yüzde|prozent)/gi)) push(m, m[1]);
  for (const m of t.matchAll(/[$€£]\s?(\d[\d.,]*)/g)) push(m, m[1]);
  for (const m of t.matchAll(/(\d[\d.,]*)\s?(usd|eur|try|tl|dollars?|euros?|dolar|avro|million|billion|trillion|milyon|milyar|tons?|tonnes?|kg|containers?|konteyner)\b/gi)) push(m, m[1]);
  for (const m of t.matchAll(/(?<![\d.,])(\d{3,}(?:[.,]\d+)*)(?![\d])/g)) {
    const d = digitsOnly(m[1]);
    const yr = d.length === 4 && +d >= 1900 && +d <= 2100 && !/[.,]/.test(m[1]);
    if (!yr) push(m, m[1]);
  }
  out.sort((x, y) => x.index - y.index);
  return out;
}

export const numberSet = (text: string): Set<string> => new Set((text.match(/\d[\d.,]*/g) ?? []).map(digitsOnly).filter(Boolean));

const grams = (ws: string[], n: number): Set<string> => {
  const s = new Set<string>();
  for (let i = 0; i + n <= ws.length; i++) s.add(ws.slice(i, i + n).join(" "));
  return s;
};

/** İki metnin n-gram Jaccard benzerliği (locale-kopya testi). */
export function similarity(a: string, b: string, n = 5): number {
  const A = grams(words(a), n), B = grams(words(b), n);
  if (A.size === 0 || B.size === 0) return 0;
  let inter = 0;
  for (const g of A) if (B.has(g)) inter++;
  return inter / (A.size + B.size - inter);
}

const COPY_N = 6;

// ───────────────────────── KONTROL PASS'İ ─────────────────────────
export interface Qa {
  hard: string[];
  soft: string[];
  metrics: { words: number; faq: number; h1: number; density: number; internal_links: number; stats: number };
}

/** İç link allowlist'i (kökler): locale ailesine göre var olan site bölümleri. */
export const INTERNAL_ROOTS: Record<string, string[]> = {
  en: ["/en/services/", "/en/products", "/en/industries"],
  tr: ["/ithalat", "/ihracat"],
  de: ["/de"],
  zh: ["/zh"],
};
const rootsFor = (locale: string) => INTERNAL_ROOTS[locale.startsWith("en") ? "en" : locale] ?? INTERNAL_ROOTS.en;

const LINK_RE = /\[([^\]]*)\]\(([^)\s]+)(?:\s+"[^"]*")?\)/g;

export function controlPass(a: Article, ctx: { locale: string; keyword: string | null; facts: Fact[] }): Qa {
  const hard: string[] = [];
  const soft: string[] = [];
  const body = a.body_md;
  const all = [a.title, a.meta_title, a.meta_description, body].join("\n");

  // ── HARD ─────────────────────────────────────────────────────────
  // (1) güvensiz markup: ham HTML etiketi, javascript:/data: bağlantı, olay işleyici
  if (/<\s*\/?\s*[a-z!][^>]*>/i.test(all) || /\bon[a-z]+\s*=\s*["']/i.test(all) || /\]\(\s*(javascript|data|vbscript):/i.test(all)) hard.push("unsafe_markup");
  // (2) yönerge/enjeksiyon izi (model ele geçirilmiş olabilir)
  const inj = detectInjection(all) ?? detectInjection(a.faq.map((f) => f.q + " " + f.a).join(" "));
  if (inj) hard.push(`injection_in_output:${inj}`);
  // (3) dış linkler yalnız görev verisindeki kaynak URL'leri olabilir
  const factUrls = new Set(ctx.facts.map((f) => f.url).filter((u): u is string => !!u));
  const links = [...body.matchAll(LINK_RE)].map((m) => ({ text: m[1], href: m[2], index: m.index ?? 0 }));
  for (const l of links) {
    const external = /^https?:\/\//i.test(l.href) || l.href.startsWith("//");
    if (external && !factUrls.has(l.href)) hard.push(`foreign_link:${l.href.slice(0, 60)}`);
  }
  // (4) rakamlar yalnız görev verisinden + (URL'li kaynakta) aynı paragrafta atıfla
  const allowed = new Map<string, Fact[]>();
  for (const f of ctx.facts) for (const d of numberSet(f.text)) allowed.set(d, [...(allowed.get(d) ?? []), f]);
  const stats = extractStats([a.title, a.meta_description, body].join("\n\n"));
  for (const s of stats) {
    const srcs = allowed.get(s.digits);
    if (!srcs) {
      hard.push(`unsourced_stat:${s.raw}`);
      continue;
    }
    const withUrl = srcs.filter((f) => f.url);
    if (withUrl.length) {
      const joined = [a.title, a.meta_description, body].join("\n\n");
      const start = joined.lastIndexOf("\n\n", joined.indexOf(s.raw)) + 1;
      const endRaw = joined.indexOf("\n\n", joined.indexOf(s.raw));
      const para = joined.slice(start, endRaw === -1 ? undefined : endRaw);
      const cited = withUrl.some((f) => para.includes(`](${f.url}`) || para.includes(f.url as string));
      if (!cited) hard.push(`uncited_stat:${s.raw}`);
    }
  }
  // (5) RSS metni aynen kopyalanamaz: korumalı kaynaklardan ≥6 ardışık kelime gövdede/FAQ'da geçemez
  const bodyWords = grams(words(body + " " + a.faq.map((f) => f.a).join(" ")), COPY_N);
  for (const f of ctx.facts.filter((x) => x.copyProtected)) {
    for (const g of grams(words(f.text), COPY_N)) {
      if (bodyWords.has(g)) {
        hard.push(`copied_source_text:${f.id}`);
        break;
      }
    }
  }
  // iddialar (claims) var olan bir kaynağa bağlı olmalı
  for (const c of a.claims) if (!ctx.facts.some((f) => f.id === c.fact_id)) hard.push(`claim_unknown_fact:${c.fact_id}`);

  // ── SOFT (SEO_PLAYBOOK §7) ───────────────────────────────────────
  const wc = wordCount(body, ctx.locale);
  if (wc < 1200) soft.push(`words<1200:${wc}`);
  if (a.faq.length < 5) soft.push(`faq<5:${a.faq.length}`);
  for (const f of a.faq) {
    const n = words(f.a).length;
    if (n < 40 || n > 80) soft.push(`faq_answer_words_40_80:${n}`);
    if (!body.includes(f.q) || !body.includes(f.a)) soft.push("faq_not_in_body"); // FAQ metni ve schema birebir aynı (schema faq'tan üretilir; gövdede de bulunmalı)
  }
  const h1Lines = body.split("\n").filter((l) => /^#\s+\S/.test(l));
  if (h1Lines.length !== 1) soft.push(`h1_count:${h1Lines.length}`);
  const kw = (ctx.keyword ?? "").trim().toLowerCase();
  let density = 0;
  if (kw) {
    const kwWords = words(kw).length || 1;
    const bw = words(body);
    const occ = body.toLowerCase().split(kw).length - 1;
    density = bw.length ? (occ * kwWords) / bw.length : 0;
    if (!h1Lines[0] || !h1Lines[0].toLowerCase().includes(kw)) soft.push("keyword_not_in_h1");
    const afterH1 = body.replace(/^#\s+.*$/m, "");
    if (!words(afterH1).slice(0, 100).join(" ").includes(words(kw).join(" "))) soft.push("keyword_not_in_first_100_words");
    if (!body.split("\n").some((l) => /^##\s+/.test(l) && l.toLowerCase().includes(kw))) soft.push("keyword_not_in_h2");
    if (density > 0.03) soft.push(`keyword_density>3%:${(density * 100).toFixed(1)}`);
  } else soft.push("keyword_missing");
  if ([...a.meta_title].length > 60) soft.push(`meta_title>60:${[...a.meta_title].length}`);
  const md = [...a.meta_description].length;
  if (md < 120 || md > 158) soft.push(`meta_description_120_158:${md}`);
  const roots = rootsFor(ctx.locale);
  const internal = links.filter((l) => l.href.startsWith("/") && !l.href.startsWith("//") && l.text.trim().length >= 3);
  if (internal.length < 2) soft.push(`internal_links<2:${internal.length}`);
  for (const l of internal) if (!roots.some((r) => l.href.startsWith(r))) soft.push(`internal_link_unknown_path:${l.href.slice(0, 40)}`);

  return { hard, soft: [...new Set(soft)], metrics: { words: wc, faq: a.faq.length, h1: h1Lines.length, density: Number(density.toFixed(4)), internal_links: internal.length, stats: stats.length } };
}

// ───────────────────────── JSON-LD (SEO_PLAYBOOK §4: Article + FAQPage + BreadcrumbList [+ ClaimReview]) ─────────────────────────
const SITE = "https://bdimexport.com";
const ORG = { "@type": "Organization", name: "Bdimexport", url: SITE };

/** schema_json önerisi — FAQ'lar article.faq'tan BİREBİR; yayın URL'si bilinmediğinden url/mainEntityOfPage yok (4.6 doldurur). */
export function buildJsonLd(a: Article, locale: string, facts: Fact[], pageSection: string, at: Date): string {
  const lang = locale.startsWith("en") ? "en" : locale === "zh" ? "zh-CN" : locale;
  const graph: object[] = [
    { "@type": "Article", headline: a.title, description: a.meta_description, inLanguage: lang, datePublished: at.toISOString().slice(0, 10), author: ORG, publisher: ORG },
    {
      "@type": "FAQPage",
      mainEntity: a.faq.map((f) => ({ "@type": "Question", name: f.q, acceptedAnswer: { "@type": "Answer", text: f.a } })),
    },
    {
      "@type": "BreadcrumbList",
      itemListElement: [
        { "@type": "ListItem", position: 1, name: "Home", item: SITE },
        { "@type": "ListItem", position: 2, name: pageSection, item: SITE + "/" + (locale === "tr" ? "" : locale.startsWith("en") ? "en" : locale) },
        { "@type": "ListItem", position: 3, name: a.title },
      ],
    },
  ];
  for (const c of a.claims) {
    const f = facts.find((x) => x.id === c.fact_id);
    if (!f?.url) continue; // ClaimReview yalnız URL'li kaynakta (kaynaksız iddia zaten hard-red)
    graph.push({
      "@type": "ClaimReview",
      claimReviewed: c.statement,
      datePublished: at.toISOString().slice(0, 10),
      author: ORG,
      itemReviewed: { "@type": "Claim", appearance: { "@type": "CreativeWork", url: f.url } },
      reviewRating: { "@type": "Rating", ratingValue: 5, bestRating: 5, worstRating: 1, alternateName: "True: equals the linked source" },
    });
  }
  return JSON.stringify({ "@context": "https://schema.org", "@graph": graph }).replace(/</g, "\\u003c");
}
