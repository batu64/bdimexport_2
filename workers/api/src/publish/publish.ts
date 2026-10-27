// FAZ_4 4.6 — Onay → yayın hattı (hibrit). Saf modül (D1Like; worker türü yok) — admin içerik handler'ı çağırır.
//
//   KALICI (makale):  approved ──[👤 "Yayına hazırla"]──▶ bot dal + PR açar (publications.state=pr_open, içerik HÂLÂ approved)
//                     ──[👤 GitHub'da merge]──▶ Pages build ──[👤 "Yayınlandı işaretle"]──▶ contents.published + publications.live
//   GEÇİCİ (news_card): approved ──[👤 "Yayınla (edge)"]──▶ contents.published + publications(edge, live) → D1'den edge render
//
// Kurallar: draft hiçbir yoldan yayına gitmez (yalnız approved); mock içerik yayınlanmaz; her geçiş koşullu UPDATE + audit
// AYNI batch'te (yarışta 0 satır → audit yok → "stale"); token yoksa PR yerine DRY-RUN planı kaydedilir (ağ çağrısı yok).
import { ulid, withAudit, type D1Like } from "../../../../app/admin/audit.ts";
import { renderArticle, type ContentRow, type RenderError } from "./render.ts";
import { GitHubError, type GitHubClient } from "./github.ts";

export type PublishError =
  | RenderError | "not_found" | "not_approved" | "pr_already_open" | "file_exists" | "github_error"
  | "no_open_pr" | "pr_not_merged" | "pr_closed" | "stale" | "not_news_card";

export type PublishResult =
  | { ok: true; state: "dry_run" | "pr_open" | "live"; kind: "pr" | "edge"; url?: string; pr_url?: string; files?: string[]; verified?: boolean }
  | { ok: false; error: PublishError; http: number; detail?: string; pr_url?: string };

const HTTP: Record<PublishError, number> = {
  not_found: 404, not_approved: 409, pr_already_open: 409, file_exists: 409, github_error: 502, no_open_pr: 409,
  pr_not_merged: 409, pr_closed: 409, stale: 409, not_news_card: 409, route_pending: 409, bad_slug: 422,
  mock_not_publishable: 422, use_edge: 409, empty_body: 422,
};
const fail = (error: PublishError, detail?: string, extra: { pr_url?: string } = {}): PublishResult => ({ ok: false, error, http: HTTP[error], detail, ...extra });

const COLS = "id, slug, locale, page_type, title, body_md, target_keyword, schema_json, status, model, source_job_id";
const sqlNow = (ms: number) => new Date(ms).toISOString().slice(0, 19).replace("T", " ");
const isMock = (c: ContentRow) => c.model === "mock" || /^\s*\[MOCK\]/i.test(c.title);

interface PubRow { id: string; state: string; pr_number: number | null; pr_url: string | null; kind: string }

async function loadContent(db: D1Like, id: string) {
  return db.prepare(`SELECT ${COLS} FROM contents WHERE id = ?`).bind(id).first<ContentRow>();
}
async function openPr(db: D1Like, contentId: string) {
  return db.prepare("SELECT id, state, pr_number, pr_url, kind FROM publications WHERE content_id = ? AND state = 'pr_open'").bind(contentId).first<PubRow>();
}

function prBody(c: ContentRow, url: string, files: string[], actor: string): string {
  return [
    `Otomatik yayın PR'ı — İçerik Fabrikası (FAZ_4 4.6). **Onaylayan:** ${actor}`,
    "",
    `- content_id: \`${c.id}\` · locale: \`${c.locale}\` · page_type: \`${c.page_type}\` · model: \`${c.model ?? "-"}\``,
    `- Canlı adres (merge + build sonrası): ${url}`,
    `- Dosyalar: ${files.map((f) => `\`${f}\``).join(", ")}`,
    "",
    "### Merge öncesi insan kontrolü",
    "- [ ] Rakamların her biri kaynağına bağlı (kaynaksız rakam yok)",
    "- [ ] Başlık, meta açıklama ve FAQ doğru dilde ve tonda",
    "- [ ] İç linkler mevcut sayfalara gidiyor",
    "",
    "Merge edildikten ve Pages build'i bittikten sonra admin panelde **\"Yayınlandı işaretle\"** — içerik ancak o zaman `published` olur.",
  ].join("\n");
}

/** 👤 "Yayına hazırla": approved makale → PR (veya token yoksa dry-run planı). İçerik approved KALIR. */
export async function preparePublication(db: D1Like, gh: GitHubClient | null, contentId: string, actor: string, now = Date.now()): Promise<PublishResult> {
  const c = await loadContent(db, contentId);
  if (!c) return fail("not_found");
  if (c.status !== "approved") return fail("not_approved", c.status);
  const open = await openPr(db, contentId);
  if (open) return fail("pr_already_open", undefined, { pr_url: open.pr_url ?? undefined });
  const r = renderArticle(c, { approvedBy: actor, preparedAt: new Date(now).toISOString() });
  if ("error" in r) return fail(r.error, r.detail);
  const paths = r.files.map((f) => f.path);
  const pubId = ulid(now);
  // İçerik okuma ile yazma arasında onayı geri alınmışsa kayıt düşmez (0 satır → audit yok)
  const guardedInsert = (state: string, extra: { branch?: string; pr_number?: number; pr_url?: string; error?: string }) =>
    db.prepare(
      "INSERT INTO publications (id, content_id, kind, state, branch, pr_number, pr_url, files_json, error, created_by, created_at, updated_at) " +
      "SELECT ?, ?, 'pr', ?, ?, ?, ?, ?, ?, ?, ?, ? WHERE EXISTS (SELECT 1 FROM contents WHERE id = ? AND status = 'approved')",
    ).bind(pubId, contentId, state, extra.branch ?? null, extra.pr_number ?? null, extra.pr_url ?? null, JSON.stringify(paths),
      extra.error ?? null, actor, sqlNow(now), sqlNow(now), contentId);

  if (!gh) {
    const ok = await withAudit(db, [guardedInsert("dry_run", {})], {
      actor, action: "publish_dry_run", entity_type: "content", entity_id: contentId, new_value: { publication_id: pubId, files: paths, url: r.url },
    });
    return ok ? { ok: true, kind: "pr", state: "dry_run", url: r.url, files: paths } : fail("stale");
  }

  const branch = `publish/${c.slug}-${pubId.slice(-8).toLowerCase()}`;
  let pr: { number: number; url: string } | null = null;
  try {
    // Var olan dosyanın ÜZERİNE YAZILMAZ (aynı slug daha önce yayınlandıysa insan karar verir)
    for (const p of paths) if (await gh.exists(p)) return fail("file_exists", p);
    const sha = await gh.baseSha();
    await gh.createBranch(branch, sha);
    for (const f of r.files) await gh.putFile(branch, f.path, f.content, `content(${c.locale}): ${c.slug} — İçerik Fabrikası yayın önerisi [${c.id}]`);
    pr = await gh.openPr(branch, `Yayın: ${c.title.slice(0, 80)} (${c.locale})`, prBody(c, r.url, paths, actor));
  } catch (e) {
    const op = e instanceof GitHubError ? `${e.op}:${e.status}` : "network";
    await withAudit(db, [guardedInsert("failed", { branch, error: op })], {
      actor, action: "publish_failed", entity_type: "content", entity_id: contentId, new_value: { publication_id: pubId, error: op },
    }).catch(() => {});
    return fail("github_error", op);
  }
  try {
    const ok = await withAudit(db, [guardedInsert("pr_open", { branch, pr_number: pr.number, pr_url: pr.url })], {
      actor, action: "publish_pr_opened", entity_type: "content", entity_id: contentId,
      new_value: { publication_id: pubId, pr_number: pr.number, pr_url: pr.url, branch, files: paths },
    });
    if (!ok) { await gh.closePr(pr.number).catch(() => {}); return fail("not_approved"); }
  } catch (e) {
    // eşzamanlı ikinci istek: uq_publications_open → bu PR'ı kapat (yetim PR bırakma)
    await gh.closePr(pr.number).catch(() => {});
    if (String(e).includes("UNIQUE")) return fail("pr_already_open");
    throw e;
  }
  return { ok: true, kind: "pr", state: "pr_open", url: r.url, pr_url: pr.url, files: paths };
}

/** 👤 "Yayınlandı işaretle": merge + build sonrası. Token varsa PR'ın GERÇEKTEN merge edildiği doğrulanır. */
export async function markPublished(db: D1Like, gh: GitHubClient | null, contentId: string, actor: string, now = Date.now()): Promise<PublishResult> {
  const c = await loadContent(db, contentId);
  if (!c) return fail("not_found");
  if (c.status !== "approved") return fail("not_approved", c.status);
  const pub = await openPr(db, contentId);
  if (!pub || pub.pr_number === null) return fail("no_open_pr");
  let verified = false;
  if (gh) {
    let st: { state: string; merged: boolean };
    try { st = await gh.pr(pub.pr_number); } catch (e) { return fail("github_error", e instanceof GitHubError ? `${e.op}:${e.status}` : "network"); }
    if (!st.merged && st.state === "closed") {
      await withAudit(db, [db.prepare("UPDATE publications SET state = 'closed', updated_at = ? WHERE id = ? AND state = 'pr_open'").bind(sqlNow(now), pub.id)], {
        actor, action: "publish_pr_closed", entity_type: "content", entity_id: contentId, new_value: { publication_id: pub.id, pr_number: pub.pr_number },
      });
      return fail("pr_closed", undefined, { pr_url: pub.pr_url ?? undefined });
    }
    if (!st.merged) return fail("pr_not_merged", undefined, { pr_url: pub.pr_url ?? undefined });
    verified = true;
  }
  const t = sqlNow(now);
  const ok = await withAudit(db, [
    db.prepare("UPDATE publications SET state = 'live', updated_at = ? WHERE id = ? AND state = 'pr_open' AND EXISTS (SELECT 1 FROM contents WHERE id = ? AND status = 'approved')").bind(t, pub.id, contentId),
    db.prepare("UPDATE contents SET status = 'published', published_at = ? WHERE id = ? AND status = 'approved' AND EXISTS (SELECT 1 FROM publications WHERE id = ? AND state = 'live')").bind(t, contentId, pub.id),
  ], {
    actor, action: "publish_content", entity_type: "content", entity_id: contentId,
    old_value: { status: "approved" }, new_value: { status: "published", kind: "pr", publication_id: pub.id, pr_number: pub.pr_number, merge_verified: verified },
  });
  return ok ? { ok: true, kind: "pr", state: "live", pr_url: pub.pr_url ?? undefined, verified } : fail("stale");
}

/** 👤 "Yayınla (edge)": yalnız haber kartı — PR yok, D1'den anında edge render. */
export async function publishEdge(db: D1Like, contentId: string, actor: string, now = Date.now()): Promise<PublishResult> {
  const c = await loadContent(db, contentId);
  if (!c) return fail("not_found");
  if (c.page_type !== "news_card") return fail("not_news_card");
  if (c.status !== "approved") return fail("not_approved", c.status);
  if (isMock(c)) return fail("mock_not_publishable");
  const pubId = ulid(now);
  const t = sqlNow(now);
  const ok = await withAudit(db, [
    db.prepare("INSERT INTO publications (id, content_id, kind, state, files_json, created_by, created_at, updated_at) SELECT ?, ?, 'edge', 'live', '[]', ?, ?, ? WHERE EXISTS (SELECT 1 FROM contents WHERE id = ? AND status = 'approved')")
      .bind(pubId, contentId, actor, t, t, contentId),
    db.prepare("UPDATE contents SET status = 'published', published_at = ? WHERE id = ? AND status = 'approved' AND EXISTS (SELECT 1 FROM publications WHERE id = ? AND state = 'live')").bind(t, contentId, pubId),
  ], {
    actor, action: "publish_content", entity_type: "content", entity_id: contentId,
    old_value: { status: "approved" }, new_value: { status: "published", kind: "edge", publication_id: pubId },
  });
  return ok ? { ok: true, kind: "edge", state: "live" } : fail("stale");
}

/** UI için: içerik başına son yayın kaydı. */
export async function latestPublications(db: D1Like, contentIds: string[]): Promise<Record<string, { kind: string; state: string; pr_url: string | null; updated_at: string; error: string | null }>> {
  if (contentIds.length === 0) return {};
  const ids = contentIds.slice(0, 200);
  const r = await db.prepare(
    `SELECT content_id, kind, state, pr_url, updated_at, error FROM publications WHERE content_id IN (${ids.map(() => "?").join(",")}) ORDER BY created_at DESC, id DESC`,
  ).bind(...ids).all<{ content_id: string; kind: string; state: string; pr_url: string | null; updated_at: string; error: string | null }>();
  const out: Record<string, { kind: string; state: string; pr_url: string | null; updated_at: string; error: string | null }> = {};
  for (const row of r.results ?? []) if (!out[row.content_id]) out[row.content_id] = { kind: row.kind, state: row.state, pr_url: row.pr_url, updated_at: row.updated_at, error: row.error };
  return out;
}
