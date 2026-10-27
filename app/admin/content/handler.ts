// FAZ_3 3.6 — /admin/api/content/* (İçerik Fabrikası sunucu tarafı). Admin API router'ında (workers/api) çalışır;
// router bağlaması ayrı adım (api scope). Auth: guardAdminRequest + BURADA admin-only (viewer 403).
//
//   GET   /admin/api/content/news | jobs | drafts?status= | audit
//   POST  /admin/api/content/jobs                 JobInput (A/B/C) → ai_jobs (pending, model NULL — FAZ 4 Gemini)
//   PATCH /admin/api/content/drafts/:id           {title?, body_md?, target_keyword?}  (yalnız draft)
//   POST  /admin/api/content/drafts/approve       {ids}            draft → approved   (YAYIN DEĞİL)
//   POST  /admin/api/content/drafts/publish       {ids}            YALNIZ news_card: approved → published (edge; 4.6)
//   POST  /admin/api/content/drafts/:id/prepare-pr  {}             makale: approved → bot PR (token yoksa DRY-RUN); içerik approved kalır
//   POST  /admin/api/content/drafts/:id/mark-published {}          merge+build sonrası → published (token varsa merge doğrulanır)
//   GET   /admin/api/content/publications?ids=a,b                  içerik başına son yayın kaydı
//   POST  /admin/api/content/drafts/reject        {ids, reason}    draft → silinir (audit old_value'da kalır)
//   POST  /admin/api/content/jobs/:id/mock-produce                 YALNIZ env CONTENT_MOCK_PRODUCE="1" (staging); aksi 404
//
// Runtime AI üretimi YOK (AGENTS.md §3/§9 — Gemini en sonda). POST/PATCH yalnız application/json (CSRF).
import { guardAdminRequest, type AdminEnv } from "../middleware.ts";
import { writeAudit } from "../audit.ts";
import { createContentService, seedMockDraftForJob, type D1ReadLike } from "./service.ts";
import { ApiError, type ContentStatus, type JobInput, type PublishOutcome } from "./types.ts";
import { githubFromEnv, type PublishEnv } from "../../../workers/api/src/publish/env.ts";
import type { FetchLike } from "../../../workers/api/src/publish/github.ts";

export interface ContentEnv extends AdminEnv, PublishEnv {
  DB: D1ReadLike;
  /** "1" → mock üretim ucu açık (yalnız staging/dev). Varsayılan KAPALI. */
  CONTENT_MOCK_PRODUCE?: string;
}

export const CONTENT_PREFIX = "/admin/api/content";
const STATUSES: ContentStatus[] = ["draft", "approved", "published"];
const ID_RE = /^[0-9A-Za-z_-]{1,64}$/;

const json = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), {
    status,
    headers: { "content-type": "application/json; charset=utf-8", "cache-control": "no-store", "x-robots-tag": "noindex, nofollow" },
  });
const err = (status: number, error: string) => json({ error }, status);

async function readJson(req: Request): Promise<Record<string, unknown> | null> {
  if (!(req.headers.get("content-type") ?? "").toLowerCase().startsWith("application/json")) return null;
  const b = await req.json().catch(() => null);
  return b && typeof b === "object" && !Array.isArray(b) ? (b as Record<string, unknown>) : null;
}
const ids = (b: Record<string, unknown>) =>
  Array.isArray(b.ids) && b.ids.every((x) => typeof x === "string" && ID_RE.test(x)) ? (b.ids as string[]) : null;

export async function handleContent(
  request: Request,
  env: ContentEnv,
  opts?: Parameters<typeof guardAdminRequest>[2] & { githubFetch?: FetchLike },
  now: () => number = Date.now,
): Promise<Response> {
  const g = await guardAdminRequest(request, env, opts);
  if (!g.ok) return g.response;
  if (g.identity.role !== "admin") return err(403, "admin_only");
  const actor = g.identity.email;
  const svc = createContentService(env.DB, actor, now, githubFromEnv(env, opts?.githubFetch));

  const url = new URL(request.url);
  const sub = url.pathname.replace(/\/+$/, "").slice(CONTENT_PREFIX.length);
  const m = request.method;

  try {
    if (m === "GET") {
      if (sub === "/news") return json(await svc.listNews());
      if (sub === "/jobs") return json(await svc.listJobs());
      if (sub === "/audit") return json(await svc.listAudit());
      if (sub === "/drafts") {
        const st = (url.searchParams.get("status") ?? "draft") as ContentStatus;
        if (!STATUSES.includes(st)) return err(400, "bad_status");
        return json(await svc.listDrafts(st));
      }
      if (sub === "/publications") {
        const list = (url.searchParams.get("ids") ?? "").split(",").filter(Boolean);
        if (list.length > 200 || !list.every((x) => ID_RE.test(x))) return err(400, "bad_ids");
        return json(await svc.listPublications(list));
      }
      return err(404, "not_found");
    }

    const body = await readJson(request);
    if (!body) return err(415, "json_required"); // tüm mutasyonlar (mock dahil) JSON — CSRF

    const mock = sub.match(/^\/jobs\/([^/]+)\/mock-produce$/);
    if (mock && m === "POST") {
      if (env.CONTENT_MOCK_PRODUCE !== "1") return err(404, "mock_disabled"); // prod'da sahte üretim YOK
      const id = mock[1];
      if (!ID_RE.test(id)) return err(404, "not_found");
      const job = await env.DB.prepare("SELECT id, status, payload_json FROM ai_jobs WHERE id = ?").bind(id).first<{ id: string; status: string; payload_json: string }>();
      if (!job) return err(404, "not_found");
      if (job.status !== "pending") return err(409, "job_not_pending");
      const content_ids = await seedMockDraftForJob(env.DB, id, JSON.parse(job.payload_json));
      await writeAudit(env.DB, { actor, action: "mock_produce", entity_type: "ai_job", entity_id: id, new_value: { content_ids, model: "mock" } });
      return json({ content_ids });
    }

    if (sub === "/jobs" && m === "POST") return json(await svc.submitJob(body as unknown as JobInput), 201);

    const bulk = sub.match(/^\/drafts\/(approve|publish|reject)$/);
    if (bulk && m === "POST") {
      const list = ids(body);
      if (!list) return err(400, "bad_ids");
      if (bulk[1] === "approve") return json(await svc.approve(list));
      if (bulk[1] === "publish") return json(await svc.publish(list));
      return json(await svc.reject(list, typeof body.reason === "string" ? body.reason : ""));
    }

    const pubAct = sub.match(/^\/drafts\/([^/]+)\/(prepare-pr|mark-published)$/);
    if (pubAct && m === "POST" && ID_RE.test(pubAct[1])) {
      const r: PublishOutcome = pubAct[2] === "prepare-pr" ? await svc.preparePublication(pubAct[1]) : await svc.markPublished(pubAct[1]);
      if (r.ok) return json(r);
      const code = r.error === "github_error" ? 502 : ["bad_slug", "mock_not_publishable", "empty_body"].includes(r.error) ? 422 : 409;
      return json({ error: r.error, detail: r.detail, pr_url: r.pr_url }, code);
    }

    const edit = sub.match(/^\/drafts\/([^/]+)$/);
    if (edit && m === "PATCH" && ID_RE.test(edit[1])) {
      const patch: { title?: string; body_md?: string; target_keyword?: string | null } = {};
      if ("title" in body) { if (typeof body.title !== "string") return err(400, "bad_content"); patch.title = body.title; }
      if ("body_md" in body) { if (typeof body.body_md !== "string") return err(400, "bad_content"); patch.body_md = body.body_md; }
      if ("target_keyword" in body) {
        if (body.target_keyword !== null && typeof body.target_keyword !== "string") return err(400, "bad_content");
        patch.target_keyword = body.target_keyword as string | null;
      }
      const extra = Object.keys(body).filter((k) => !["title", "body_md", "target_keyword"].includes(k));
      if (extra.length) return err(400, "field_read_only"); // status/model/slug vb. PATCH'le değiştirilemez (onay/yayın ayrı uçlar)
      await svc.updateDraft(edit[1], patch);
      return json({ id: edit[1], ok: true });
    }
    return err(404, "not_found");
  } catch (e) {
    if (e instanceof ApiError) return err(e.status, e.code);
    if (e instanceof TypeError) return err(400, "bad_request"); // eksik alanlı JobInput (ör. text yok)
    throw e;
  }
}
