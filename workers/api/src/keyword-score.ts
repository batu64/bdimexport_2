// FAZ_6 6.3 — KEYWORD FIRSAT SKORU (kw-score.v1). DETERMİNİSTİK, saf fonksiyonlar: AI/model/ağ çağrısı YOK (AGENTS §8 kural 8).
// Girdi: GSC sorgu × sayfa günlük satırları (gsc_query_v). Çıktı: (sorgu, locale) başına skor + bant + karar + gerekçe.
//
// SKOR (0–100) = 100 × (0.5·D + 0.3·P + 0.2·G) — G hesaplanamazsa ağırlıklar D/P'ye yeniden dağıtılır (100 × (0.5·D + 0.3·P) / 0.8):
//   D talep    = log10(1+gösterim) / log10(1+kümedeki en yüksek gösterim)            → yüksek gösterim = yüksek talep
//   P yakınlık = pozisyon eğrisi: ≤3 → 0.25 · 3–8 → 0.5…1 · 8–20 → 1 (plato) · 20+ → 0.6…0.1 (50'de)   → "neredeyse ilk sayfa/üst sıra" = en çok kazanım;
//                bilinçli basamaklar: ilk 3 (zaten kazanılmış) ve 20+ (uzak hedef) "yakın fırsat" platosunun altında kalır
//   G CTR açığı = max(0, (ref − ctr) / ref) — ref = sitenin AYNI pozisyon aralığındaki CTR'ı (kendi verisinden; dış "benchmark" eğrisi YOK).
//                Yalnız ilk 20 sırada anlamlı (20+ CTR herkes için ~0 → gürültü): pozisyon > 20 ise G = 0.
//                GÜVEN: beklenen tıklama (ref × gösterim) < 5 ise açık istatistiksel olarak anlamsızdır → G × (beklenen / 5)
//                (80 gösterimde 0 tıklama, beklenen 0.5 iken "%100 açık" sayılmaz).
// Sabitler bir ölçüm DEĞİL, sıralama parametresidir (değişirse score_version artar). Hiçbir metrik uydurulmaz: tüm sayılar GSC satırlarından.
import { normalizePage, pageLocale } from "./attribution";
import { KEYWORD_SCORE_VERSION, type KeywordAction, type KeywordBand } from "./keyword-contract";

export { KEYWORD_SCORE_VERSION };

export interface GscQueryRow {
  day: string;
  query: unknown;
  page: unknown;
  clicks: unknown;
  impressions: unknown;
  ctr?: unknown;
  position: unknown;
}

export interface ScoreOptions {
  /** Pencerede bu kadar gösterimin altındaki sorgu fırsat sayılmaz (gürültü). */
  minImpressions?: number;
  /** Bu pozisyondan kötü sorgular atılır. */
  maxPosition?: number;
  /** Pozisyon aralığı referans CTR'ı için gereken en az toplam gösterim. */
  refMinImpressions?: number;
  /** En çok kaç satır döner (skor sırasıyla). */
  maxRows?: number;
}
export const SCORE_DEFAULTS: Required<ScoreOptions> = { minImpressions: 20, maxPosition: 50, refMinImpressions: 200, maxRows: 500 };
/** CTR açığının tam ağırlık alması için gereken en az beklenen tıklama. */
export const MIN_EXPECTED_CLICKS = 5;

export interface ScoredOpportunity {
  query: string;
  locale: string;
  page: string;
  pages_count: number;
  impressions: number;
  clicks: number;
  ctr: number;
  position: number;
  ref_ctr: number | null;
  score: number;
  band: KeywordBand;
  action: KeywordAction;
  reason: string;
  days_with_data: number;
}

// ───────────────────────── sorgu güvenliği / normalizasyon ─────────────────────────
const EMAIL = /[^\s@]+@[^\s@]+\.[^\s@]+/;
const PHONE = /(?:\+?\d[\d\s().-]{7,}\d)/; // ≥9 rakamlık dizi (telefon / kimlik no benzeri)
const URLISH = /https?:\/\/|www\./i;

/** Sorgu metni: NFC, küçük harf, boşluk tekilleştirme; boş/uzun/kontrol karakterli → null. */
export function normalizeQuery(raw: unknown): string | null {
  if (typeof raw !== "string") return null;
  // eslint-disable-next-line no-control-regex
  if (/[\u0000-\u001f\u007f]/.test(raw)) return null;
  const q = raw.normalize("NFC").trim().replace(/\s+/g, " ").toLowerCase();
  return q.length >= 1 && q.length <= 200 ? q : null;
}

/** Kişisel veri benzeri sorgu (e-posta, telefon/kimlik numarası, URL) → false: hiç YAZILMAZ/SKORLANMAZ. */
export function isSafeQuery(q: string): boolean {
  return !EMAIL.test(q) && !PHONE.test(q) && !URLISH.test(q);
}

const num = (v: unknown): number | null => (typeof v === "number" && Number.isFinite(v) ? v : null);
const r4 = (n: number) => Math.round(n * 10_000) / 10_000;
const r1 = (n: number) => Math.round(n * 10) / 10;
const clamp = (n: number, lo: number, hi: number) => Math.min(hi, Math.max(lo, n));

// ───────────────────────── bileşenler ─────────────────────────
/** Pozisyon aralığı (referans CTR kovası). */
export function positionBucket(p: number): "1-3" | "4-10" | "11-20" | "21-50" {
  return p <= 3 ? "1-3" : p <= 10 ? "4-10" : p <= 20 ? "11-20" : "21-50";
}

/** P: pozisyon yakınlık eğrisi (sürekli, monoton parçalar). */
export function proximity(p: number): number {
  if (p <= 3) return 0.25;
  if (p < 8) return 0.5 + 0.5 * ((p - 3) / 5);
  if (p <= 20) return 1;
  if (p <= 50) return 0.6 - 0.5 * ((p - 20) / 30);
  return 0;
}

export function bandOf(p: number, ctr: number, ref: number | null): KeywordBand {
  if (p > 20) return "long_shot";
  if (p >= 4) return "near";
  return ref !== null && ref > 0 && ctr < ref * 0.5 ? "snippet" : "top";
}

const ACTION: Record<KeywordBand, KeywordAction> = { near: "update_page", snippet: "improve_snippet", top: "monitor", long_shot: "new_page" };

const pctTxt = (r: number) => `%${r1(r * 100)}`;

/** Gerekçe (karar satırı) — yalnız hesaplanmış sayılar; Türkçe, ≤500 karakter. */
export function reasonFor(o: Omit<ScoredOpportunity, "reason" | "score" | "days_with_data"> & { cannibal: boolean }): string {
  const ctr = `CTR ${pctTxt(o.ctr)}${o.ref_ctr !== null ? ` (site, aynı aralık: ${pctTxt(o.ref_ctr)})` : ""}`;
  const base = `${o.page} sorguda ort. ${r1(o.position)}. sırada; ${o.impressions} gösterim, ${o.clicks} tıklama, ${ctr}`;
  const why: Record<KeywordAction, string> = {
    update_page: "yakın fırsat → mevcut sayfayı bu sorgu için güncelle (başlık/bölüm/SSS)",
    improve_snippet: "üst sırada ama tıklanmıyor → başlık ve meta açıklamayı iyileştir",
    new_page: "sayfa sorguyla zayıf eşleşiyor → sorguya özel yeni sayfa adayı",
    monitor: "üst sırada ve CTR sağlıklı → izle, iş üretme",
  };
  const extra = o.cannibal ? ` · uyarı: ${o.pages_count} sayfa aynı sorguda yarışıyor (yamyamlaşma)` : "";
  return `${base}. ${why[o.action]}${extra}`.slice(0, 500);
}

interface Acc { imp: number; clicks: number; posW: number; pages: Map<string, { imp: number; posW: number }>; days: Set<string> }

/**
 * Ana fonksiyon: satırlar → skorlanmış fırsatlar (skor ↓, gösterim ↓, sorgu ↑, locale ↑ — tamamen deterministik).
 * Geçersiz satır (sayfa/sorgu/sayı bozuk, gösterim 0, kişisel veri benzeri sorgu) sessizce atılır.
 */
export function scoreOpportunities(rows: readonly GscQueryRow[], opts: ScoreOptions = {}): ScoredOpportunity[] {
  const o = { ...SCORE_DEFAULTS, ...opts };
  const groups = new Map<string, Acc & { query: string; locale: string }>();
  const ref = new Map<string, { imp: number; clicks: number }>(); // pozisyon kovası → site toplamı (TÜM geçerli satırlar)

  for (const r of rows) {
    const query = normalizeQuery(r.query);
    const page = normalizePage(r.page);
    const imp = num(r.impressions), clicks = num(r.clicks), pos = num(r.position);
    if (!query || !page || !isSafeQuery(query) || imp === null || clicks === null || pos === null) continue;
    if (imp <= 0 || clicks < 0 || clicks > imp || pos < 1) continue;
    const locale = pageLocale(page);
    const k = `${locale}\u0000${query}`;
    let g = groups.get(k);
    if (!g) groups.set(k, (g = { query, locale, imp: 0, clicks: 0, posW: 0, pages: new Map(), days: new Set() }));
    g.imp += imp;
    g.clicks += clicks;
    g.posW += pos * imp;
    g.days.add(r.day);
    const pg = g.pages.get(page) ?? { imp: 0, posW: 0 };
    pg.imp += imp;
    pg.posW += pos * imp;
    g.pages.set(page, pg);
    const b = ref.get(positionBucket(pos)) ?? { imp: 0, clicks: 0 };
    b.imp += imp;
    b.clicks += clicks;
    ref.set(positionBucket(pos), b);
  }

  const refCtr = (p: number): number | null => {
    const b = ref.get(positionBucket(p));
    return b && b.imp >= o.refMinImpressions ? b.clicks / b.imp : null;
  };

  const eligible = [...groups.values()]
    .map((g) => ({ g, position: g.posW / g.imp }))
    .filter(({ g, position }) => g.imp >= o.minImpressions && position <= o.maxPosition);
  const maxImp = eligible.reduce((m, { g }) => Math.max(m, g.imp), 0);

  const out: ScoredOpportunity[] = eligible.map(({ g, position }) => {
    const ctr = g.clicks / g.imp;
    const rc = refCtr(position);
    const D = maxImp > 0 ? Math.log10(1 + g.imp) / Math.log10(1 + maxImp) : 0;
    const P = proximity(position);
    const G = position > 20 ? 0 : rc !== null && rc > 0 ? clamp((rc - ctr) / rc, 0, 1) * Math.min(1, (rc * g.imp) / MIN_EXPECTED_CLICKS) : null;
    const score = clamp(r1(100 * (G === null ? (0.5 * D + 0.3 * P) / 0.8 : 0.5 * D + 0.3 * P + 0.2 * G)), 0, 100);
    // en çok gösterim alan sayfa (eşitlikte daha iyi pozisyon, sonra yol) — deterministik
    const pages = [...g.pages].sort((a, b) => b[1].imp - a[1].imp || a[1].posW / a[1].imp - b[1].posW / b[1].imp || (a[0] < b[0] ? -1 : 1));
    const page = pages[0][0];
    const cannibal = pages.length >= 2 && pages[1][1].imp / g.imp >= 0.2;
    const band = bandOf(position, ctr, rc);
    const action = ACTION[band];
    const base = {
      query: g.query, locale: g.locale, page, pages_count: pages.length, impressions: g.imp, clicks: g.clicks,
      ctr: r4(ctr), position: r1(position), ref_ctr: rc === null ? null : r4(rc), band, action,
    };
    return { ...base, score, reason: reasonFor({ ...base, cannibal }), days_with_data: g.days.size };
  });

  out.sort((a, b) => b.score - a.score || b.impressions - a.impressions || (a.query < b.query ? -1 : a.query > b.query ? 1 : a.locale < b.locale ? -1 : 1));
  return out.slice(0, o.maxRows);
}

// ───────────────────────── ai_jobs köprüsü (FAZ 4 4.5 hattı, input C) ─────────────────────────
/** Sayfa yolundan 4.5 page_type (app/admin/content/types PAGE_TYPES). Yeni sayfa = article. */
export function pageTypeFor(o: Pick<ScoredOpportunity, "page" | "action">): "product" | "industry" | "service" | "article" {
  if (o.action === "new_page") return "article";
  if (/^\/en(\/(ru|fr|nl|es|ar))?\/products\//.test(o.page)) return "product";
  if (/\/industries\//.test(o.page)) return "industry";
  if (/\/(services|leistungen|ithalat|ihracat)\//.test(o.page)) return "service";
  return "article";
}

export interface KeywordJobPayload {
  input: "C";
  phrase: string;
  keyword_id?: string;
  locales: string[];
  page_type: string;
  action: KeywordAction;
  target_page: string | null;
  reason: string;
  source: "gsc_opportunity";
  score_version: string;
}

/**
 * Fırsat → ai_jobs `make_article` payload'u (3.6 service.submitJob input C sözleşmesi + gerekçe). monitor → null (iş üretilmez).
 * İşi KUYRUĞA YAZMAK bu dosyanın işi değildir: admin onayıyla (İçerik Fabrikası) yapılır — otomatik üretim YOK.
 */
export function toJobPayload(o: Pick<ScoredOpportunity, "query" | "locale" | "page" | "action" | "reason">, keywordId?: string | null): KeywordJobPayload | null {
  if (o.action === "monitor") return null;
  return {
    input: "C", phrase: o.query, ...(keywordId ? { keyword_id: keywordId } : {}), locales: [o.locale],
    page_type: pageTypeFor(o), action: o.action, target_page: o.action === "new_page" ? null : o.page,
    reason: o.reason, source: "gsc_opportunity", score_version: KEYWORD_SCORE_VERSION,
  };
}
