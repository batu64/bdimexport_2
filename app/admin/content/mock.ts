// FAZ_3 3.6 — ContentApi bellek-içi MOCK (tarayıcıda çalışır; D1/Workers bağlanana kadar UI'ı sürer).
// Davranış service.ts ile aynı kuralları uygular (draft→approved→published ayrı adımlar, audit her mutasyonda).
import {
  ApiError,
  CONTENT_LOCALES,
  TTL_WARN_HOURS,
  hoursLeft,
  slugify,
  type AuditItem,
  type BulkResult,
  type ContentApi,
  type ContentItem,
  type ContentStatus,
  type JobInput,
  type JobItem,
  type NewsItem,
} from "./types.ts";

let seq = 0;
const nid = (p: string) => `${p}_${Date.now().toString(36)}${(seq++).toString(36)}`;
const ts = (now: number) => new Date(now).toISOString().slice(0, 19).replace("T", " ");

export function createMockContentApi(actor = "mock@local", now: () => number = Date.now): ContentApi {
  const H = 3_600_000;
  const news: Omit<NewsItem, "hours_left" | "ttl_warning">[] = [
    { id: "n1", source: "TİM", title: "Zeytinyağı ihracatı yılın ilk yarısında arttı", url: "https://example.com/zeytinyagi", summary: "[MOCK] Sektör verisi", tags: { sector: "gıda" }, fetched_at: ts(now() - 60 * H), expires_at: ts(now() + 12 * H) },
    { id: "n2", source: "Alibaba News", title: "Çin'de elektrikli ürün tedarik fiyatları", url: "https://example.com/ev", summary: "[MOCK] Tedarik trendi", tags: { sector: "elektronik" }, fetched_at: ts(now() - 20 * H), expires_at: ts(now() + 52 * H) },
    { id: "n3", source: "TİM", title: "Mobilya ihracatında DACH talebi", url: "https://example.com/mobilya", summary: null, tags: null, fetched_at: ts(now() - 2 * H), expires_at: ts(now() + 70 * H) },
  ];
  const jobs: JobItem[] = [];
  const contents: ContentItem[] = [];
  const audit: AuditItem[] = [];
  const log = (action: string, entity_type: string, entity_id: string) =>
    audit.unshift({ id: nid("a"), actor, action, entity_type, entity_id, created_at: ts(now()) });

  const addDraft = (slug: string, locale: string, title: string, kw: string | null, jobId: string | null, page_type = "article") => {
    const c: ContentItem = { id: nid("c"), slug, locale, page_type, title, body_md: `# ${title}\n\n[MOCK] gövde (${locale})`, target_keyword: kw, status: "draft", model: "mock", source_job_id: jobId, created_at: ts(now()), published_at: null };
    contents.unshift(c);
    return c;
  };
  addDraft("zeytinyagi-ihracati", "tr", "Zeytinyağı İhracatı Rehberi", "zeytinyağı ihracatı", null);
  addDraft("olive-oil-export", "en", "Olive Oil Export Guide", "olive oil export", null);

  const transition = (ids: string[], from: ContentStatus, to: ContentStatus, action: string): BulkResult => {
    if (ids.length === 0 || ids.length > 100) throw new ApiError(400, "bad_bulk_size");
    const r: BulkResult = { changed: [], skipped: [] };
    for (const id of ids) {
      const c = contents.find((x) => x.id === id);
      if (!c) r.skipped.push({ id, reason: "not_found" });
      else if (c.status !== from) r.skipped.push({ id, reason: `status_is_${c.status}` });
      else {
        c.status = to;
        if (to === "published") c.published_at = ts(now());
        log(action, "content", id);
        r.changed.push(id);
      }
    }
    return r;
  };

  return {
    async listNews() {
      return news
        .map((n) => ({ ...n, hours_left: hoursLeft(n.expires_at, now()), tags: n.tags }))
        .map((n) => ({ ...n, ttl_warning: n.hours_left < TTL_WARN_HOURS }));
    },
    async listJobs() {
      return [...jobs];
    },
    async listDrafts(status = "draft") {
      return contents.filter((c) => c.status === status).map((c) => ({ ...c }));
    },
    async listAudit() {
      return [...audit];
    },
    async submitJob(input: JobInput) {
      const locales = [...new Set(input.locales)];
      if (locales.length === 0) throw new ApiError(400, "locale_required");
      if (locales.some((l) => !(CONTENT_LOCALES as readonly string[]).includes(l))) throw new ApiError(400, "bad_locale");
      if (input.input === "A" && (!input.text.trim() || input.text.length > 20_000)) throw new ApiError(400, "bad_text");
      if (input.input === "B" && (input.news_ids.length === 0 || input.news_ids.length > 10)) throw new ApiError(400, "bad_news_ids");
      if (input.input === "C" && (input.phrase.trim().length < 3 || input.phrase.length > 200)) throw new ApiError(400, "bad_phrase");
      const job: JobItem = { id: nid("j"), type: "make_article", status: "pending", payload: { ...input, locales }, model: null, created_at: ts(now()), finished_at: null, last_error: null };
      jobs.unshift(job);
      let keyword_id: string | undefined;
      if (input.input === "C") {
        keyword_id = nid("k");
        log("create_keyword", "keyword", keyword_id);
      }
      log("create_ai_job", "ai_job", job.id);
      return { job_id: job.id, keyword_id };
    },
    async updateDraft(id, patch) {
      const c = contents.find((x) => x.id === id);
      if (!c) throw new ApiError(404, "not_found");
      if (c.status !== "draft") throw new ApiError(409, "only_draft_editable");
      const title = patch.title ?? c.title;
      const body = patch.body_md ?? c.body_md;
      if (!title.trim() || !body.trim()) throw new ApiError(400, "bad_content");
      c.title = title;
      c.body_md = body;
      if (patch.target_keyword !== undefined) c.target_keyword = patch.target_keyword;
      log("update_content", "content", id);
    },
    async approve(ids) {
      return transition(ids, "draft", "approved", "approve_content");
    },
    async publish(ids) {
      return transition(ids, "approved", "published", "publish_content");
    },
    async reject(ids, reason) {
      if (!reason.trim()) throw new ApiError(400, "reason_required");
      const r: BulkResult = { changed: [], skipped: [] };
      for (const id of ids) {
        const i = contents.findIndex((x) => x.id === id);
        if (i < 0) r.skipped.push({ id, reason: "not_found" });
        else if (contents[i].status !== "draft") r.skipped.push({ id, reason: `status_is_${contents[i].status}` });
        else {
          contents.splice(i, 1);
          log("reject_content", "content", id);
          r.changed.push(id);
        }
      }
      return r;
    },
    async mockProduce(jobId) {
      const job = jobs.find((j) => j.id === jobId);
      if (!job) throw new ApiError(404, "not_found");
      if (job.status !== "pending") throw new ApiError(409, "job_not_pending");
      const p = job.payload as { input: string; phrase?: string; text?: string; news_ids?: string[]; locales: string[]; page_type?: string };
      const topic = p.phrase ?? (p.news_ids ? news.find((n) => n.id === p.news_ids![0])?.title : p.text?.slice(0, 60)) ?? "mock";
      const ids = p.locales.map((loc) => addDraft(slugify(topic), loc, `[MOCK] ${topic}`, p.phrase ?? null, job.id, p.page_type ?? "article").id);
      job.status = "done";
      job.model = "mock";
      job.finished_at = ts(now());
      log("mock_produce", "ai_job", job.id);
      return { content_ids: ids };
    },
  };
}
