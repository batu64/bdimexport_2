// FAZ_3 3.6 — AI İçerik Fabrikası: paylaşılan tipler + ContentApi sözleşmesi
// Sözleşme tabloları: ai_jobs + contents (+ okuma: rss_news, keywords, admin_actions) — db/migrations/0001_init.sql
// UI, ContentApi'ye bağlıdır; arkasında D1 servisi (service.ts → api.ts) veya mock (mock.ts) olabilir.

/** İçerik locale'leri. EN varyantları "en-xx" biçiminde (hreflang en-XX ile eşleşir — I18N_RULES §4). */
export const CONTENT_LOCALES = ["tr", "en", "de", "zh", "en-ru", "en-fr", "en-nl", "en-es", "en-ar"] as const;
export type ContentLocale = (typeof CONTENT_LOCALES)[number];

export const PAGE_TYPES = ["product", "industry", "service", "article", "news_card"] as const;
export type PageType = (typeof PAGE_TYPES)[number];

export type ContentStatus = "draft" | "approved" | "published";
export type JobStatus = "pending" | "running" | "done" | "failed" | "blocked";
export type Intent = "informational" | "commercial" | "transactional";

/** Haber TTL'i bu eşiğin altındaysa görsel uyarı (FAZ_3 3.6 zorunlu kural) */
export const TTL_WARN_HOURS = 24;

export interface NewsItem {
  id: string;
  source: string;
  title: string;
  url: string;
  summary: string | null;
  tags: Record<string, unknown> | null;
  fetched_at: string;
  expires_at: string;
  /** Kalan saat (0'a kırpılır) */
  hours_left: number;
  /** hours_left < TTL_WARN_HOURS */
  ttl_warning: boolean;
}

export interface JobItem {
  id: string;
  type: string;
  status: JobStatus;
  payload: Record<string, unknown>;
  model: string | null;
  created_at: string;
  finished_at: string | null;
  last_error: string | null;
}

export interface ContentItem {
  id: string;
  slug: string;
  locale: string;
  page_type: string;
  title: string;
  body_md: string;
  target_keyword: string | null;
  status: ContentStatus;
  model: string | null;
  source_job_id: string | null;
  created_at: string;
  published_at: string | null;
}

export interface AuditItem {
  id: string;
  actor: string;
  action: string;
  entity_type: string;
  entity_id: string;
  created_at: string;
}

export type JobInput =
  | { input: "A"; text: string; locales: string[]; page_type?: PageType }
  | { input: "B"; news_ids: string[]; locales: string[]; page_type?: PageType }
  | { input: "C"; phrase: string; intent?: Intent; volume?: number | null; volume_estimated?: boolean; locales: string[]; page_type?: PageType };

export interface BulkResult {
  changed: string[];
  skipped: { id: string; reason: string }[];
}

export interface ContentApi {
  listNews(): Promise<NewsItem[]>;
  listJobs(): Promise<JobItem[]>;
  listDrafts(status?: ContentStatus): Promise<ContentItem[]>;
  listAudit(): Promise<AuditItem[]>;
  submitJob(input: JobInput): Promise<{ job_id: string; keyword_id?: string }>;
  updateDraft(id: string, patch: { title?: string; body_md?: string; target_keyword?: string | null }): Promise<void>;
  /** draft → approved (yayın DEĞİL) */
  approve(ids: string[]): Promise<BulkResult>;
  /** draft → silinir (şemada 'rejected' status yok); eski satır audit old_value'da kalır */
  reject(ids: string[], reason: string): Promise<BulkResult>;
  /** approved → published — onaydan AYRI aksiyon (admin-agent §4.3). PR/build tetikleme Faz 4 orchestrator'ında. */
  publish(ids: string[]): Promise<BulkResult>;
  /** YALNIZCA mock/dev: üretimi simüle eder (pending job → done + draft). Prod'da kapalı. */
  mockProduce(jobId: string): Promise<{ content_ids: string[] }>;
}

export class ApiError extends Error {
  status: number;
  code: string;
  constructor(status: number, code: string) {
    super(code);
    this.status = status;
    this.code = code;
  }
}

export function hoursLeft(expiresAt: string, now: number = Date.now()): number {
  // D1 datetime('now') → "YYYY-MM-DD HH:MM:SS" UTC
  const t = Date.parse(expiresAt.includes("T") ? expiresAt : expiresAt.replace(" ", "T") + "Z");
  if (Number.isNaN(t)) return 0;
  return Math.max(0, Math.floor((t - now) / 3_600_000));
}

export function slugify(s: string): string {
  const base = s
    .toLowerCase()
    .replace(/ç/g, "c").replace(/ğ/g, "g").replace(/ı/g, "i").replace(/ö/g, "o").replace(/ş/g, "s").replace(/ü/g, "u")
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 80);
  return base || "icerik";
}
