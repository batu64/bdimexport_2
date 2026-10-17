// FAZ_3 3.6 — ContentApi'nin D1 uygulaması (Workers tarafında çalışır; UI'dan doğrudan import edilmez).
// Kural: HER yazma `withAudit` ile aynı D1 batch'inde (mutasyon + admin_actions atomik).
// Sözleşme: ai_jobs + contents (0001_init.sql). Yazma yetkisi çağıran handler'da (admin rolü) denetlenir.
import { ulid, withAudit, type D1Like, type D1PreparedLike } from "../audit.ts";
import {
  ApiError,
  CONTENT_LOCALES,
  PAGE_TYPES,
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

/** Okuma için D1 yüzeyi (audit.ts'deki yazma yüzeyini genişletir) */
export interface D1ReadLike extends D1Like {
  prepare(sql: string): D1PreparedLike & { all<T = unknown>(): Promise<{ results: T[] }>; first<T = unknown>(): Promise<T | null> };
}

const MAX_TEXT = 20_000;
const MAX_BULK = 100;
const MAX_NEWS_PER_JOB = 10;

function parseJson(s: string | null): Record<string, unknown> | null {
  if (!s) return null;
  try {
    return JSON.parse(s) as Record<string, unknown>;
  } catch {
    return null;
  }
}

function validLocales(locales: string[]): string[] {
  const out = [...new Set(locales)];
  if (out.length === 0) throw new ApiError(400, "locale_required");
  for (const l of out) if (!(CONTENT_LOCALES as readonly string[]).includes(l)) throw new ApiError(400, "bad_locale");
  return out;
}

function inList(ids: string[]): string {
  return ids.map(() => "?").join(",");
}

export function createContentService(db: D1ReadLike, actor: string, now: () => number = Date.now): ContentApi {
  if (!actor) throw new Error("actor zorunlu");

  async function rows<T>(sql: string, ...binds: unknown[]): Promise<T[]> {
    const r = await db.prepare(sql).bind(...binds).all<T>();
    return r.results;
  }

  async function bulkTransition(ids: string[], from: ContentStatus, to: ContentStatus, action: string): Promise<BulkResult> {
    if (ids.length === 0 || ids.length > MAX_BULK) throw new ApiError(400, "bad_bulk_size");
    const found = await rows<ContentItem>(`SELECT * FROM contents WHERE id IN (${inList(ids)})`, ...ids);
    const byId = new Map(found.map((c) => [c.id, c]));
    const result: BulkResult = { changed: [], skipped: [] };
    for (const id of ids) {
      const c = byId.get(id);
      if (!c) result.skipped.push({ id, reason: "not_found" });
      else if (c.status !== from) result.skipped.push({ id, reason: `status_is_${c.status}` });
      else {
        // WHERE status=from: yarış durumunda (başka admin) çift geçiş olmaz
        const set = to === "published" ? "status=?, published_at=datetime('now')" : "status=?";
        const stmt = db.prepare(`UPDATE contents SET ${set} WHERE id=? AND status=?`).bind(to, id, from);
        const applied = await withAudit(db, [stmt], {
          actor,
          action,
          entity_type: "content",
          entity_id: id,
          old_value: { status: from },
          new_value: { status: to, slug: c.slug, locale: c.locale },
        });
        // 0 satır → başka admin araya girdi; audit yazılmadı → "değişti" RAPORLANMAZ
        if (applied) result.changed.push(id);
        else result.skipped.push({ id, reason: "stale" });
      }
    }
    return result;
  }

  return {
    async listNews() {
      const list = await rows<Omit<NewsItem, "hours_left" | "ttl_warning" | "tags"> & { tags_json: string | null }>(
        // Tek saat kaynağı: filtre de kalan-saat hesabı da now() — D1 datetime('now') ile karışırsa liste ve TTL rozeti çelişebilir
        "SELECT id, source, title, url, summary, tags_json, fetched_at, expires_at FROM rss_news WHERE expires_at > ? ORDER BY expires_at ASC LIMIT 200",
        new Date(now()).toISOString().slice(0, 19).replace("T", " "),
      );
      return list.map(({ tags_json, ...n }) => {
        const h = hoursLeft(n.expires_at, now());
        return { ...n, tags: parseJson(tags_json), hours_left: h, ttl_warning: h < TTL_WARN_HOURS };
      });
    },

    async listJobs() {
      const list = await rows<Omit<JobItem, "payload"> & { payload_json: string }>(
        "SELECT id, type, status, payload_json, model, created_at, finished_at, last_error FROM ai_jobs ORDER BY created_at DESC LIMIT 100",
      );
      return list.map(({ payload_json, ...j }) => ({ ...j, payload: parseJson(payload_json) ?? {} }));
    },

    listDrafts(status = "draft") {
      return rows<ContentItem>(
        "SELECT id, slug, locale, page_type, title, body_md, target_keyword, status, model, source_job_id, created_at, published_at FROM contents WHERE status=? ORDER BY created_at DESC LIMIT 200",
        status,
      );
    },

    listAudit() {
      return rows<AuditItem>(
        "SELECT id, actor, action, entity_type, entity_id, created_at FROM admin_actions WHERE entity_type IN ('ai_job','content','keyword') ORDER BY created_at DESC, id DESC LIMIT 100",
      );
    },

    async submitJob(input: JobInput) {
      const locales = validLocales(input.locales);
      const page_type = input.page_type ?? "article";
      if (!(PAGE_TYPES as readonly string[]).includes(page_type)) throw new ApiError(400, "bad_page_type");
      const jobId = ulid(now());
      const muts: D1PreparedLike[] = [];
      let payload: Record<string, unknown>;
      let type: string;
      let keywordId: string | undefined;

      if (input.input === "A") {
        const text = input.text.trim();
        if (!text || text.length > MAX_TEXT) throw new ApiError(400, "bad_text");
        type = "make_article";
        // Ham metin = güvenilmeyen veri; orchestrator prompt'unda delimiter içinde kullanılır (prompt-injection, FAZ_4 4.1)
        payload = { input: "A", text, locales, page_type };
      } else if (input.input === "B") {
        const ids = [...new Set(input.news_ids)];
        if (ids.length === 0 || ids.length > MAX_NEWS_PER_JOB) throw new ApiError(400, "bad_news_ids");
        const hit = await rows<{ id: string }>(`SELECT id FROM rss_news WHERE id IN (${inList(ids)})`, ...ids);
        if (hit.length !== ids.length) throw new ApiError(404, "news_not_found");
        type = "make_article";
        payload = { input: "B", news_ids: ids, locales, page_type };
      } else {
        const phrase = input.phrase.trim();
        if (phrase.length < 3 || phrase.length > 200) throw new ApiError(400, "bad_phrase");
        if (input.intent && !["informational", "commercial", "transactional"].includes(input.intent)) throw new ApiError(400, "bad_intent");
        if (input.volume != null && (!Number.isInteger(input.volume) || input.volume < 0)) throw new ApiError(400, "bad_volume");
        keywordId = ulid(now());
        type = "make_article";
        payload = { input: "C", keyword_id: keywordId, phrase, locales, page_type };
        // Elle girilen volume gerçek veri değildir → volume_estimated=1 (şema: "tahmin ise flagged")
        muts.push(
          db
            .prepare("INSERT INTO keywords (id, phrase, locale, intent, volume, volume_estimated, status) VALUES (?,?,?,?,?,?, 'job_created')")
            .bind(keywordId, phrase, locales[0], input.intent ?? null, input.volume ?? null, input.volume != null ? 1 : 0),
        );
      }

      muts.push(
        db
          .prepare("INSERT INTO ai_jobs (id, type, payload_json, status, agent) VALUES (?,?,?, 'pending', NULL)")
          .bind(jobId, type, JSON.stringify(payload)),
      ); // model seçimi Faz 4'te orchestrator'da (model/agent NULL)
      await withAudit(db, muts, {
        actor,
        action: "create_ai_job",
        entity_type: "ai_job",
        entity_id: jobId,
        new_value: { type, input: input.input, locales, keyword_id: keywordId },
      });
      return { job_id: jobId, keyword_id: keywordId };
    },

    async updateDraft(id, patch) {
      const cur = await db.prepare("SELECT * FROM contents WHERE id=?").bind(id).first<ContentItem>();
      if (!cur) throw new ApiError(404, "not_found");
      if (cur.status !== "draft") throw new ApiError(409, "only_draft_editable");
      const title = patch.title ?? cur.title;
      const body = patch.body_md ?? cur.body_md;
      const kw = patch.target_keyword === undefined ? cur.target_keyword : patch.target_keyword;
      if (!title.trim() || title.length > 300 || !body.trim() || body.length > 200_000) throw new ApiError(400, "bad_content");
      const stmt = db
        .prepare("UPDATE contents SET title=?, body_md=?, target_keyword=? WHERE id=? AND status='draft'")
        .bind(title, body, kw, id);
      const applied = await withAudit(db, [stmt], {
        actor,
        action: "update_content",
        entity_type: "content",
        entity_id: id,
        old_value: { title: cur.title, body_len: cur.body_md.length, target_keyword: cur.target_keyword },
        new_value: { title, body_len: body.length, target_keyword: kw },
      });
      if (!applied) throw new ApiError(409, "only_draft_editable"); // okuma ile yazma arasında onaylandı/silindi
    },

    approve: (ids) => bulkTransition(ids, "draft", "approved", "approve_content"),
    publish: (ids) => bulkTransition(ids, "approved", "published", "publish_content"),

    async reject(ids, reason) {
      const why = reason.trim();
      if (!why || why.length > 500) throw new ApiError(400, "reason_required");
      if (ids.length === 0 || ids.length > MAX_BULK) throw new ApiError(400, "bad_bulk_size");
      const found = await rows<ContentItem>(`SELECT * FROM contents WHERE id IN (${inList(ids)})`, ...ids);
      const byId = new Map(found.map((c) => [c.id, c]));
      const result: BulkResult = { changed: [], skipped: [] };
      for (const id of ids) {
        const c = byId.get(id);
        if (!c) result.skipped.push({ id, reason: "not_found" });
        else if (c.status !== "draft") result.skipped.push({ id, reason: `status_is_${c.status}` });
        else {
          const applied = await withAudit(db, [db.prepare("DELETE FROM contents WHERE id=? AND status='draft'").bind(id)], {
            actor,
            action: "reject_content",
            entity_type: "content",
            entity_id: id,
            old_value: { status: "draft", slug: c.slug, locale: c.locale, title: c.title, model: c.model },
            new_value: { reason: why },
          });
          if (applied) result.changed.push(id);
          else result.skipped.push({ id, reason: "stale" });
        }
      }
      return result;
    },

    async mockProduce() {
      throw new ApiError(404, "mock_disabled"); // prod D1'de sahte üretim yok
    },
  };
}

/** Test/dev yardımcısı: sahte üretim çıktısı (yalnızca testlerde ve mock modunda kullanılır). */
export async function seedMockDraftForJob(db: D1Like, jobId: string, payload: { locales: string[]; page_type?: string; phrase?: string; text?: string }) {
  const ids: string[] = [];
  const stmts: D1PreparedLike[] = [db.prepare("UPDATE ai_jobs SET status='done', model='mock', finished_at=datetime('now') WHERE id=?").bind(jobId)];
  const topic = payload.phrase ?? payload.text?.slice(0, 60) ?? "mock";
  for (const loc of payload.locales) {
    const id = ulid();
    ids.push(id);
    stmts.push(
      db
        .prepare("INSERT INTO contents (id, slug, locale, page_type, title, body_md, target_keyword, status, model, source_job_id) VALUES (?,?,?,?,?,?,?, 'draft', 'mock', ?)")
        .bind(id, slugify(topic), loc, payload.page_type ?? "article", `[MOCK] ${topic}`, `# ${topic}\n\nMock üretim (${loc}).`, payload.phrase ?? null, jobId),
    );
  }
  await db.batch(stmts);
  return ids;
}
