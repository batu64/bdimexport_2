// Bağımlılıksız RSS 2.0 / RSS 1.0 (RDF) / Atom ayrıştırıcı. DETERMİNİSTİK — AI/model çağrısı YOK.
// Workers'ta DOMParser yok → öğe blokları + etiket regex'i. Çıktı yalnız {title, url}; metin DÜZ metne indirilir (etiket/CDATA/entity temiz).
// Güvenlik: yalnız http(s) mutlak URL'ler; kimlik bilgili URL, javascript:/data: vb. atlanır; izleme parametreleri (utm_*, fbclid…) dedup için atılır.
import type { FeedItem } from "./types";

export class FeedParseError extends Error {}

const ENTITIES: Record<string, string> = { amp: "&", lt: "<", gt: ">", quot: '"', apos: "'", nbsp: " " };
const decode = (s: string) =>
  s.replace(/&(#x[0-9a-f]+|#\d+|[a-z]+);/gi, (m, e: string) => {
    if (e[0] === "#") {
      const cp = e[1].toLowerCase() === "x" ? parseInt(e.slice(2), 16) : parseInt(e.slice(1), 10);
      return Number.isFinite(cp) && cp > 0 && cp <= 0x10ffff ? String.fromCodePoint(cp) : "";
    }
    return ENTITIES[e.toLowerCase()] ?? m;
  });

/** CDATA aç → entity çöz → etiketleri at → kontrol karakterlerini at → boşlukları sıkıştır. */
export function cleanText(raw: string): string {
  const cdata = raw.match(/^\s*<!\[CDATA\[([\s\S]*?)\]\]>\s*$/);
  const inner = cdata ? cdata[1] : raw;
  return decode(inner)
    .replace(/<[^>]*>/g, " ")
    .replace(/[\u0000-\u001f\u007f-\u009f\u200b-\u200f\u2028\u2029\ufeff]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

const tagText = (block: string, tag: string): string | null => {
  const m = block.match(new RegExp(`<${tag}\\b[^>]*>([\\s\\S]*?)</${tag}>`, "i"));
  return m ? m[1] : null;
};

function attr(a: string, name: string): string | null {
  const m = a.match(new RegExp(`\\b${name}\\s*=\\s*(?:"([^"]*)"|'([^']*)')`, "i"));
  return m ? (m[1] ?? m[2] ?? null) : null;
}

function atomHref(block: string): string | null {
  const links = [...block.matchAll(/<link\b([^>]*?)\/?>/gi)].map((m) => m[1]);
  const alt = links.find((a) => (attr(a, "rel") ?? "alternate") === "alternate" && attr(a, "href"));
  return alt ? attr(alt, "href") : null;
}

const TRACKING = /^(utm_|fbclid$|gclid$|mc_(cid|eid)$|igshid$|ref_src$)/i;

/** Mutlak, http(s), kimlik bilgisiz, izleme parametresiz, fragment'siz URL; aksi halde null. */
export function normalizeUrl(link: string, base: string): string | null {
  const t = cleanText(link);
  if (!t || t.length > 2000) return null;
  let u: URL;
  try {
    u = new URL(t, base);
  } catch {
    return null;
  }
  if (u.protocol !== "https:" && u.protocol !== "http:") return null;
  if (u.username || u.password) return null;
  u.hash = "";
  for (const k of [...u.searchParams.keys()]) if (TRACKING.test(k)) u.searchParams.delete(k);
  const out = u.toString();
  return out.length > 2000 ? null : out;
}

export function parseFeed(xml: string, baseUrl: string, maxItems: number): { items: FeedItem[]; skipped: number } {
  if (!/<(rss|rdf:RDF|feed)\b/i.test(xml)) throw new FeedParseError("not_a_feed");
  const blocks = [...xml.matchAll(/<(item|entry)\b[^>]*>([\s\S]*?)<\/\1>/gi)].map((m) => m[2]);

  const items: FeedItem[] = [];
  const seen = new Set<string>();
  let skipped = 0;
  for (const b of blocks.slice(0, maxItems)) {
    const titleRaw = tagText(b, "title");
    const linkRaw = tagText(b, "link");
    // RSS'te <link> boş/eksik olabilir → permalink guid; Atom'da <link href>
    const guid = tagText(b, "guid");
    const linkCand =
      linkRaw && cleanText(linkRaw)
        ? linkRaw
        : atomHref(b) ?? (guid && /^\s*https?:/i.test(cleanText(guid)) ? guid : null);
    const title = titleRaw ? cleanText(titleRaw).slice(0, 300) : "";
    const url = linkCand ? normalizeUrl(linkCand, baseUrl) : null;
    if (!title || !url) {
      skipped++;
      continue;
    }
    if (seen.has(url)) continue; // aynı feed içi tekrar
    seen.add(url);
    items.push({ title, url });
  }
  return { items, skipped };
}
