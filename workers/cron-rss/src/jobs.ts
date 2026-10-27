// FAZ_4 4.5 — ai_jobs CONSUMER: bekleyen `make_article` işleri → makale + FAQ + schema önerisi → KONTROL PASS'i → contents(status='draft').
// DEĞİŞMEZ KURALLAR (FAZ_4 §1): çıktı HER ZAMAN 'draft' (bu dosyada yayın/onay yolu YOK — contents'e yalnız INSERT, hiç UPDATE yok) · rakamlar yalnız görev
// verisinden (kaynaksız = hard-red → iş 'blocked', taslak YAZILMAZ) · RSS metni aynen kopyalanamaz · ham metin sanitize edilir (4.4 sanitize.ts) ·
// content.model dolu · her yazma AYNI D1 batch'inde audit'li (taslaklar + iş durumu + audit atomik) · runtime AI = Gemini STUB (E3).
// Job payload'ı (3.6 service.submitJob): A {text,locales,page_type} · B {news_ids,locales,page_type} · C {keyword_id,phrase,locales,page_type}.
import { auditStatement, ulid, type D1Like } from "../../../app/admin/audit";
import { slugify, CONTENT_LOCALES, PAGE_TYPES } from "../../../app/admin/content/types";
import type { Env } from "./types";
import { ModelNotConfigured } from "./model";
import { sanitizeForPrompt, detectInjection } from "./sanitize";
import { suggestLocales, type LocaleSuggestion } from "./locales";
import { buildArticleRequest, selectArticleFallback, selectArticleModel, type ArticleModel } from "./article-model";
import { callWithQuota, QuotaPaused } from "./quota";
import { sendAlert } from "./alert";
import { buildJsonLd, controlPass, similarity, validateArticle, type Article, type Fact, type Qa } from "./article";
import { sqlTime } from "./ingest";

export const ACTOR = "system:article-consumer";
const AGENT_PREFIX = "article-consumer:";
const STALE_RUNNING_MS = 30 * 60_000; // 30 dk'dan eski 'running' = çöken işçi → pending'e döner
/** 1 deneme + 2 yeniden deneme (ORCHESTRATION §6: max 2 retry). Tükenirse iş BLOCKED + alert (4.7). */
export const MAX_RETRIES = 3;
const LOCALE_COPY_MAX = 0.7; // SEO_PLAYBOOK §7: iki locale arası >%70 benzerlik = red

const int = (v: string | undefined, def: number, min: number, max: number) => {
  const n = Number(v);
  return v !== undefined && v !== "" && Number.isFinite(n) ? Math.min(max, Math.max(min, Math.floor(n))) : def;
};

export interface JobsSummary {
  mode: string;
  picked: number;
  done: number;
  blocked: number;
  failed: number;
  retried: number;
  drafts: number;
  model_error?: string;
}

interface JobRow { id: string; type: string; payload_json: string; retries: number }
type Outcome =
  | { kind: "done" }
  | { kind: "blocked"; reason: string }
  | { kind: "failed"; reason: string }
  | { kind: "retry"; reason: string }
  | { kind: "unconfigured" }
  | { kind: "quota_paused" };

const SECTION: Record<string, string> = { article: "Insights", product: "Products", industry: "Industries", service: "Services", news_card: "News" };
const db = (env: Env) => env.DB as unknown as D1Like;
const stmt = (env: Env, sql: string, ...args: unknown[]) => env.DB.prepare(sql).bind(...args);

interface Payload { input: "A" | "B" | "C"; text?: string; news_ids?: string[]; phrase?: string; keyword_id?: string; locales: string[]; page_type: string }

function parsePayload(json: string): Payload | null {
  let p: Record<string, unknown>;
  try { p = JSON.parse(json); } catch { return null; }
  if (!p || typeof p !== "object") return null;
  const locales = Array.isArray(p.locales) ? [...new Set(p.locales)] : [];
  const page_type = typeof p.page_type === "string" ? p.page_type : "article";
  if (locales.length < 1 || locales.length > 9 || !locales.every((l) => (CONTENT_LOCALES as readonly string[]).includes(l as string))) return null;
  if (!(PAGE_TYPES as readonly string[]).includes(page_type)) return null;
  if (p.input === "A" && typeof p.text === "string") return { input: "A", text: p.text, locales: locales as string[], page_type };
  if (p.input === "B" && Array.isArray(p.news_ids) && p.news_ids.every((x) => typeof x === "string")) return { input: "B", news_ids: p.news_ids as string[], locales: locales as string[], page_type };
  if (p.input === "C" && typeof p.phrase === "string") return { input: "C", phrase: p.phrase, keyword_id: typeof p.keyword_id === "string" ? p.keyword_id : undefined, locales: locales as string[], page_type };
  return null;
}

interface Gathered { facts: Fact[]; keyword: string | null; tagLocales: string[]; tagSector: string | null; excluded: number }

/** Görev verisini toplar + sanitize eder. Yönerge benzeri girdi → o kaynak dışlanır; hiç kaynak kalmazsa iş 'blocked'. */
async function gather(env: Env, p: Payload): Promise<Gathered | { blocked: string }> {
  if (p.input === "A") {
    const raw = p.text ?? "";
    if (detectInjection(raw)) return { blocked: "injection_suspected" };
    const s = sanitizeForPrompt(raw, 4000);
    if (s.text.length < 20) return { blocked: "text_too_short" };
    return { facts: [{ id: "f1", text: s.text, url: null, label: "yönetici metni", copyProtected: false }], keyword: null, tagLocales: [], tagSector: null, excluded: 0 };
  }
  if (p.input === "C") {
    const raw = p.phrase ?? "";
    if (detectInjection(raw)) return { blocked: "injection_suspected" };
    const s = sanitizeForPrompt(raw, 200);
    if (s.text.length < 3) return { blocked: "keyword_invalid" };
    return { facts: [{ id: "k1", text: s.text, url: null, label: "keyword", copyProtected: false }], keyword: s.text, tagLocales: [], tagSector: null, excluded: 0 };
  }
  const ids = p.news_ids ?? [];
  const { results } = await env.DB.prepare(`SELECT id, title, summary, url, tags_json FROM rss_news WHERE id IN (${ids.map(() => "?").join(",")})`).bind(...ids).all<{ id: string; title: string; summary: string | null; url: string; tags_json: string | null }>();
  const facts: Fact[] = [];
  const tagLocales: string[] = [];
  let sector: string | null = null;
  let excluded = 0;
  for (const r of results) {
    if (detectInjection(r.title) || (r.summary && detectInjection(r.summary))) { excluded++; continue; }
    const title = sanitizeForPrompt(r.title, 200).text;
    const summary = r.summary ? sanitizeForPrompt(r.summary.replace(/^\[MOCK\]\s*/, ""), 300).text : "";
    facts.push({ id: `n${facts.length + 1}`, text: [title, summary].filter(Boolean).join(". "), url: /^https:\/\//.test(r.url) ? r.url : null, label: "haber", copyProtected: true });
    try {
      const t = r.tags_json ? JSON.parse(r.tags_json) : {};
      if (Array.isArray(t.locale_suggestion)) tagLocales.push(...t.locale_suggestion.filter((x: unknown) => typeof x === "string"));
      if (!sector && typeof t.sector === "string") sector = t.sector;
    } catch { /* bozuk etiket: yok say */ }
  }
  if (facts.length === 0) return { blocked: results.length === 0 ? "news_gone" : "injection_suspected" };
  return { facts, keyword: null, tagLocales: [...new Set(tagLocales)], tagSector: sector, excluded };
}

async function uniqueSlug(env: Env, base: string, locale: string, jobId: string, taken: Set<string>): Promise<string> {
  const root = (base || "makale").slice(0, 70);
  for (const cand of [root, `${root}-${jobId.slice(-6).toLowerCase()}`]) {
    const key = cand + "|" + locale;
    if (taken.has(key)) continue;
    const hit = await env.DB.prepare("SELECT 1 AS x FROM contents WHERE slug = ? AND locale = ?").bind(cand, locale).first();
    if (!hit) { taken.add(key); return cand; }
  }
  const last = `${root}-${jobId.toLowerCase()}`.slice(0, 120);
  taken.add(last + "|" + locale);
  return last;
}

async function processJob(env: Env, job: JobRow, model: ArticleModel, fallback: ArticleModel | null, now: Date, stats: JobsSummary): Promise<Outcome> {
  const p = parsePayload(job.payload_json);
  if (!p) return { kind: "failed", reason: "bad_payload" };
  const g = await gather(env, p);
  if ("blocked" in g) return { kind: "blocked", reason: g.blocked };

  const suggestion: LocaleSuggestion = suggestLocales(g.facts.map((f) => f.text).join(" "), g.tagLocales, g.tagSector);

  // 1) her locale için üret + doğrula + KONTROL PASS'i — hiçbir şey yazılmadan
  const made: { locale: string; article: Article; qa: Qa; model: string }[] = [];
  for (const locale of p.locales) {
    let raw: unknown;
    let used = model.name;
    try {
      // 4.7: kota korumalı — ana model eşikte ise yedek (aynı sağlayıcı); ikisi de dolu → QuotaPaused (çağrı yok)
      const r = await callWithQuota(env, now, model, fallback, (m) => m.generate(buildArticleRequest({ page_type: p.page_type, locale, keyword: g.keyword }, g.facts)));
      raw = r.result;
      used = r.used.name;
    } catch (e) {
      if (e instanceof ModelNotConfigured) return { kind: "unconfigured" };
      if (e instanceof QuotaPaused) return { kind: "quota_paused" };
      return { kind: "retry", reason: "model_call_failed" };
    }
    const v = validateArticle(raw);
    if (!v.ok) return { kind: "retry", reason: `invalid_model_output:${v.reason}` };
    const article: Article = { ...v.value, keyword: g.keyword ?? v.value.keyword }; // C: hedef keyword = görev keyword'ü
    const qa = controlPass(article, { locale, keyword: article.keyword, facts: g.facts });
    made.push({ locale, article, qa, model: used });
  }
  const hard = made.flatMap((m) => m.qa.hard.map((h) => `${m.locale}:${h}`));
  if (hard.length) return { kind: "blocked", reason: `hard_red:${hard.slice(0, 6).join(",")}`.slice(0, 480) };

  // 2) locale-kopya kontrolü (SEO_PLAYBOOK §7): çift başına >%70 benzerlik = soft red
  for (let i = 0; i < made.length; i++) for (let j = i + 1; j < made.length; j++) {
    const s = similarity(made[i].article.body_md, made[j].article.body_md);
    if (s > LOCALE_COPY_MAX) {
      made[i].qa.soft.push(`locale_copy:${made[j].locale}:${s.toFixed(2)}`);
      made[j].qa.soft.push(`locale_copy:${made[i].locale}:${s.toFixed(2)}`);
    }
  }

  // 3) TEK atomik batch: taslaklar (status 'draft' SABİT) + iş durumu + keyword + audit
  const stmts: D1PreparedStatementLike[] = [];
  const taken = new Set<string>();
  const contentIds: string[] = [];
  const nowSql = sqlTime(now.getTime());
  for (const m of made) {
    const id = ulid(now.getTime());
    contentIds.push(id);
    const slug = await uniqueSlug(env, slugify(m.article.keyword ?? m.article.title), m.locale, job.id, taken);
    const title = (m.model.startsWith("mock") ? "[MOCK] " : "") + m.article.title;
    const schema = buildJsonLd(m.article, m.locale, g.facts, SECTION[p.page_type] ?? "Insights", now);
    stmts.push(stmt(env,
      "INSERT INTO contents (id, slug, locale, page_type, title, body_md, target_keyword, schema_json, status, model, source_job_id) VALUES (?,?,?,?,?,?,?,?, 'draft', ?,?)",
      id, slug, m.locale, p.page_type, title.slice(0, 300), m.article.body_md, m.article.keyword, schema, m.model, job.id));
    stmts.push(auditStatement(db(env), { actor: ACTOR, action: "create_draft", entity_type: "content", entity_id: id, new_value: { locale: m.locale, model: m.model, job_id: job.id, soft: m.qa.soft.length } }) as unknown as D1PreparedStatementLike);
  }
  const usedModels = [...new Set(made.map((m) => m.model))].join(",");
  const payload = { ...JSON.parse(job.payload_json), result: {
    content_ids: contentIds, model: usedModels, finished_at: nowSql,
    locale_suggestion: suggestion, // gerekçeli öneri (yönetici seçimiyle karşılaştırır)
    requested_locales: p.locales,
    qa: Object.fromEntries(made.map((m) => [m.locale, { soft: m.qa.soft, metrics: m.qa.metrics }])),
    sources_excluded: g.excluded,
  } };
  stmts.push(stmt(env, "UPDATE ai_jobs SET status='done', model=?, finished_at=?, last_error=NULL, payload_json=? WHERE id=? AND status='running'", usedModels, nowSql, JSON.stringify(payload), job.id));
  stmts.push(auditStatement(db(env), { actor: ACTOR, action: "ai_job_done", entity_type: "ai_job", entity_id: job.id, new_value: { content_ids: contentIds, model: usedModels, locale_suggestion: suggestion.locales, soft_total: made.reduce((a, m) => a + m.qa.soft.length, 0) } }) as unknown as D1PreparedStatementLike);
  if (p.input === "C" && p.keyword_id) stmts.push(stmt(env, "UPDATE keywords SET status='done' WHERE id=?", p.keyword_id));
  try {
    await env.DB.batch(stmts as unknown as D1PreparedStatement[]);
  } catch {
    return { kind: "retry", reason: "db_write_failed" }; // atomik: taslak/iş durumu/audit birlikte geri alındı
  }
  stats.drafts += contentIds.length;
  return { kind: "done" };
}

type D1PreparedStatementLike = D1PreparedStatement;

/** Başarısız/engelli/yeniden-dene durumlarını TEK batch'te (UPDATE + audit) yazar. */
async function settle(env: Env, job: JobRow, o: Exclude<Outcome, { kind: "done" }>, now: Date): Promise<"blocked" | "failed" | "retried" | "released"> {
  const nowSql = sqlTime(now.getTime());
  if (o.kind === "unconfigured" || o.kind === "quota_paused") {
    // yapılandırma / kota bekler; deneme hakkı YANMAZ (kota sıfırlanınca ya da E3 yapılandırılınca kendiliğinden devam)
    await env.DB.prepare("UPDATE ai_jobs SET status='pending', agent=NULL WHERE id=? AND status='running'").bind(job.id).run();
    return "released";
  }
  let status: "blocked" | "failed" | "pending";
  let reason = o.reason;
  // 4.7: kalıcı hata (denemeler tükendi) → BLOCKED (insan bakar; ORCHESTRATION §6) — failed yalnız işlenemez payload
  if (o.kind === "retry") status = job.retries + 1 >= MAX_RETRIES ? "blocked" : "pending";
  else status = o.kind === "blocked" ? "blocked" : "failed";
  if (o.kind === "retry" && status === "blocked") reason = `retries_exhausted:${reason}`;
  const upd = status === "pending"
    ? stmt(env, "UPDATE ai_jobs SET status='pending', agent=NULL, retries=retries+1, last_error=? WHERE id=? AND status='running'", reason.slice(0, 500), job.id)
    : stmt(env, "UPDATE ai_jobs SET status=?, finished_at=?, last_error=? WHERE id=? AND status='running'", status, nowSql, reason.slice(0, 500), job.id);
  try {
    await env.DB.batch([upd, auditStatement(db(env), { actor: ACTOR, action: `ai_job_${status === "pending" ? "retry" : status}`, entity_type: "ai_job", entity_id: job.id, new_value: { reason: reason.slice(0, 300), retries: job.retries + (status === "pending" ? 1 : 0) } }) as unknown as D1PreparedStatement]);
  } catch (e) {
    console.error(JSON.stringify({ evt: "jobs_settle_failed", job: job.id, msg: e instanceof Error ? e.message.slice(0, 100) : "?" }));
  }
  if (status !== "pending") {
    // aynı hata türü saatte 1 bildirim (anahtar = durum + neden kodu; iş id'si anahtarda YOK → spam yok)
    const code = reason.split(":").slice(0, 2).join(":").slice(0, 80);
    await sendAlert(env, now, {
      key: `ai_job_${status}:${code}`, level: status === "blocked" ? "error" : "warn",
      title: status === "blocked" ? "Makale işi engellendi (blocked)" : "Makale işi başarısız (failed)",
      details: `iş ${job.id} · neden ${code} · deneme ${job.retries + 1}. Admin → İçerik Fabrikası → iş kuyruğundan incele.`,
    });
  }
  return status === "pending" ? "retried" : status;
}

export async function runArticleJobs(env: Env, now = new Date(), modelOverride?: ArticleModel | null, fallbackOverride?: ArticleModel | null): Promise<JobsSummary> {
  const out: JobsSummary = { mode: (env.ARTICLE_MODE ?? "off").toLowerCase(), picked: 0, done: 0, blocked: 0, failed: 0, retried: 0, drafts: 0 };
  try {
    const model = modelOverride === undefined ? selectArticleModel(env) : modelOverride;
    if (!model) return out; // ARTICLE_MODE=off → kuyruk dokunulmaz
    out.mode = model.name;
    const fallback = fallbackOverride === undefined ? selectArticleFallback(env) : fallbackOverride;

    // çöken işçinin 'running' bıraktığı işleri geri al (agent = "article-consumer:<ISO>")
    const cutoff = new Date(now.getTime() - STALE_RUNNING_MS).toISOString();
    await env.DB.prepare("UPDATE ai_jobs SET status='pending', agent=NULL WHERE status='running' AND agent LIKE ? AND substr(agent, ?) < ?")
      .bind(AGENT_PREFIX + "%", AGENT_PREFIX.length + 1, cutoff).run();

    const max = int(env.ARTICLE_MAX_JOBS_PER_RUN, 5, 1, 50);
    const { results } = await env.DB.prepare("SELECT id, type, payload_json, retries FROM ai_jobs WHERE status='pending' AND type='make_article' ORDER BY created_at ASC, id ASC LIMIT ?").bind(max).all<JobRow>();
    for (const job of results) {
      // atomik sahiplenme: iki çalışma aynı işi işleyemez
      const claim = await env.DB.prepare("UPDATE ai_jobs SET status='running', agent=? WHERE id=? AND status='pending'").bind(AGENT_PREFIX + now.toISOString(), job.id).run();
      if ((claim.meta?.changes ?? 0) !== 1) continue;
      out.picked++;
      let o: Outcome;
      try {
        o = await processJob(env, job, model, fallback, now, out);
      } catch (e) {
        console.error(JSON.stringify({ evt: "jobs_unexpected", job: job.id, msg: e instanceof Error ? e.message.slice(0, 120) : "?" }));
        o = { kind: "retry", reason: "unexpected_error" };
      }
      if (o.kind === "done") { out.done++; continue; }
      const r = await settle(env, job, o, now);
      if (r === "blocked") out.blocked++;
      else if (r === "failed") out.failed++;
      else if (r === "retried") out.retried++;
      else { out.model_error = o.kind === "quota_paused" ? "quota_paused" : "not_configured"; break; } // yapılandırma/kota yok: diğer işlere ısrar etme
      console.error(JSON.stringify({ evt: "job_not_done", job: job.id, outcome: r, reason: "reason" in o ? o.reason.slice(0, 160) : "" }));
    }
  } catch (e) {
    out.model_error = e instanceof ModelNotConfigured ? "not_configured" : "unexpected";
    console.error(JSON.stringify({ evt: "jobs_error", kind: out.model_error, msg: e instanceof Error ? e.message.slice(0, 120) : "?" }));
  }
  console.log(JSON.stringify({ evt: "jobs_run", ...out }));
  return out;
}
