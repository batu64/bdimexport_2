// FAZ_4 4.4 — etiket/özet ŞEMASI + ÇIKTI doğrulaması. Model çıktısı GÜVENİLMEZ girdidir: sıkı şema (fazladan alan yok), kapalı sözlükler,
// özette yönerge/URL/HTML/şablon karakteri YOK. Geçmeyen öğe yazılmaz (kısmi başarı: batch içi öğeler bağımsız doğrulanır).
import { detectInjection } from "./sanitize";

/** Site sektörleri = /en/industries slug'ları (app/(en)/en/industries) + "other". */
export const SECTORS = ["textile", "food", "machinery", "construction", "home-living", "other"] as const;
/** Yayın dilleri = hreflang manifesti (lib/hreflang.manifest.json) — locale_suggestion yalnız bunlardan. */
export const LOCALES = ["tr", "en", "de", "zh", "en-ru", "en-fr", "en-nl", "en-es", "en-ar"] as const;
export const URGENCY = ["low", "normal", "high"] as const;

export type Sector = (typeof SECTORS)[number];
export type Urgency = (typeof URGENCY)[number];

/** rss_news.tags_json sözleşmesi (db/migrations/0001: {sector, product_candidate, locale_suggestion[], urgency}). */
export interface Tags {
  sector: Sector;
  product_candidate: string | null;
  locale_suggestion: string[];
  urgency: Urgency;
}
export interface Enrichment extends Tags {
  summary: string;
}

export const SUMMARY_MIN = 20;
export const SUMMARY_MAX = 280;

const KEYS = ["id", "summary", "sector", "product_candidate", "locale_suggestion", "urgency"] as const;
const PRODUCT_RE = /^[\p{L}\p{N}][\p{L}\p{N} ,.&'()/+-]{1,79}$/u;
const BAD_SUMMARY_CHARS = /[<>{}`\\|]/;
const URL_RE = /(https?:\/\/|www\.|[a-z0-9-]+\.(com|net|org|io|ru|cn|info|xyz|top)\b)/i;
const AI_TELL = /\b(as an ai|language model|i cannot|i can't|i am unable|here is the)\b/i;

export type Reject = "not_object" | "extra_or_missing_keys" | "bad_id" | "duplicate_id" | "bad_summary" | "summary_injection" | "bad_sector" | "bad_product" | "bad_locale" | "bad_urgency";

const isObj = (v: unknown): v is Record<string, unknown> => !!v && typeof v === "object" && !Array.isArray(v);

export function validateSummary(s: unknown): Reject | null {
  if (typeof s !== "string") return "bad_summary";
  const t = s.trim();
  const n = [...t].length;
  if (n < SUMMARY_MIN || n > SUMMARY_MAX) return "bad_summary";
  // eslint-disable-next-line no-control-regex
  if (/[\u0000-\u001f\u007f-\u009f]/.test(t) || BAD_SUMMARY_CHARS.test(t) || URL_RE.test(t) || AI_TELL.test(t)) return "bad_summary";
  if (detectInjection(t)) return "summary_injection";
  return null;
}

export function validateItem(v: unknown): { ok: true; id: number; value: Enrichment } | { ok: false; id: number | null; reason: Reject } {
  if (!isObj(v)) return { ok: false, id: null, reason: "not_object" };
  const id = typeof v.id === "number" && Number.isInteger(v.id) && v.id >= 0 ? v.id : null;
  const keys = Object.keys(v);
  if (keys.length !== KEYS.length || !KEYS.every((k) => keys.includes(k))) return { ok: false, id, reason: "extra_or_missing_keys" };
  if (id === null) return { ok: false, id, reason: "bad_id" };
  const sum = validateSummary(v.summary);
  if (sum) return { ok: false, id, reason: sum };
  if (!(SECTORS as readonly unknown[]).includes(v.sector)) return { ok: false, id, reason: "bad_sector" };
  if (v.product_candidate !== null) {
    if (typeof v.product_candidate !== "string" || !PRODUCT_RE.test(v.product_candidate.trim()) || detectInjection(v.product_candidate)) return { ok: false, id, reason: "bad_product" };
  }
  const loc = v.locale_suggestion;
  if (!Array.isArray(loc) || loc.length < 1 || loc.length > 4 || new Set(loc).size !== loc.length || !loc.every((l) => (LOCALES as readonly unknown[]).includes(l))) {
    return { ok: false, id, reason: "bad_locale" };
  }
  if (!(URGENCY as readonly unknown[]).includes(v.urgency)) return { ok: false, id, reason: "bad_urgency" };
  return {
    ok: true,
    id,
    value: {
      summary: (v.summary as string).trim(),
      sector: v.sector as Sector,
      product_candidate: v.product_candidate === null ? null : (v.product_candidate as string).trim(),
      locale_suggestion: [...(loc as string[])],
      urgency: v.urgency as Urgency,
    },
  };
}

/** Model yanıtı → id → Enrichment. Dizi ya da {items:[…]} ya da JSON dizesi kabul; beklenmeyen/yinelenen/eksik id'ler öğe bazında reddedilir. */
export function validateBatch(raw: unknown, expectedIds: number[]): { ok: Map<number, Enrichment>; rejected: Map<number, Reject> } {
  let data: unknown = raw;
  if (typeof data === "string") {
    try {
      data = JSON.parse(data);
    } catch {
      data = null;
    }
  }
  const list = Array.isArray(data) ? data : isObj(data) && Array.isArray(data.items) ? data.items : [];
  const expected = new Set(expectedIds);
  const ok = new Map<number, Enrichment>();
  const rejected = new Map<number, Reject>();
  const seen = new Set<number>();
  for (const el of list.slice(0, expectedIds.length * 2)) {
    const r = validateItem(el);
    if (r.id !== null && (!expected.has(r.id) || seen.has(r.id))) {
      if (expected.has(r.id)) {
        ok.delete(r.id);
        rejected.set(r.id, "duplicate_id"); // aynı id iki kez → ikisi de güvenilmez
      }
      continue;
    }
    if (r.id !== null) seen.add(r.id);
    if (r.ok) ok.set(r.id, r.value);
    else if (r.id !== null) rejected.set(r.id, r.reason);
  }
  for (const id of expectedIds) if (!ok.has(id) && !rejected.has(id)) rejected.set(id, "bad_id"); // model bu id'yi hiç döndürmedi
  return { ok, rejected };
}
