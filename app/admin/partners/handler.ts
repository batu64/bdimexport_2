// FAZ_3 3.5 — /admin/api/partners* (Partner CRUD + logo onay). Admin API router'ında (workers/api) çalışır;
// router bağlaması ayrı adım (api scope). Auth: guardAdminRequest + BURADA admin-only (viewer 403).
//
//   GET   /admin/api/partners?status=pending|approved|rejected|all   → liste (iletişim + vergi no MASKELİ)
//   GET   /admin/api/partners/:id                                    → detay (maskeli)
//   POST  /admin/api/partners/:id/approve   {}                       → approved 0→1 (KVKK rızası şart) + audit
//   POST  /admin/api/partners/:id/reject    {reason}                 → yalnız approved=0 iken + audit (reject_partner)
//   POST  /admin/api/partners/:id/unapprove {reason}                 → approved 1→0 + audit
//   PATCH /admin/api/partners/:id   {sector?, certs?, capacity?, export_history?} → + audit (old/new)
//   POST  /admin/api/partners/:id/logo  multipart (file=logo)        → mime+boyut+magic SUNUCUDA + R2 + audit
//
// consent_logo_en'e yazan HİÇBİR yol yok; PATCH'te gelirse 400 consent_read_only.
// CSRF: JSON uçları application/json ister; multipart ucu ayrıca `x-bdx-admin: 1` başlığı ister (cross-site
// form bu başlığı ekleyemez). Access cookie SameSite=Lax ayrıca cross-site POST'ta gönderilmez.
import { guardAdminRequest, type AdminEnv } from "../middleware.ts";
import { ulid, withAudit, type D1Like } from "../audit.ts";
import {
  LIST_STATUSES, MAX_LOGO_BYTES, PARTNER_COLS, REJECTED_EXPR, detectLogo, logoKey, statusOf, toAdminPartner, validatePatch,
  type ListStatus, type PartnerRow,
} from "./lib.ts";

export interface R2Like {
  put(key: string, value: Uint8Array, opts?: { httpMetadata?: { contentType?: string }; customMetadata?: Record<string, string> }): Promise<unknown>;
  delete(key: string): Promise<unknown>;
}
export interface PartnersEnv extends AdminEnv {
  DB: D1Like;
  MEDIA: R2Like;
}

export const PARTNERS_PREFIX = "/admin/api/partners";
const ID_RE = /^[0-9A-Za-z_-]{1,64}$/;
const LIST_LIMIT = 500;

const json = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), {
    status,
    headers: { "content-type": "application/json; charset=utf-8", "cache-control": "no-store", "x-robots-tag": "noindex, nofollow" },
  });
const err = (status: number, error: string, extra: Record<string, unknown> = {}) => json({ error, ...extra }, status);

async function readJson(req: Request): Promise<Record<string, unknown> | null> {
  if (!(req.headers.get("content-type") ?? "").toLowerCase().startsWith("application/json")) return null;
  const b = await req.json().catch(() => null);
  return b && typeof b === "object" && !Array.isArray(b) ? (b as Record<string, unknown>) : null;
}

/** Gövdeyi en fazla `max` bayt okur (Content-Length'siz/chunked dahil); aşarsa null. */
async function readLimited(req: Request, max: number): Promise<Uint8Array | null> {
  const cl = Number(req.headers.get("content-length") ?? "0");
  if (cl > max) return null;
  if (!req.body) return new Uint8Array(0);
  const reader = req.body.getReader();
  const parts: Uint8Array[] = [];
  let total = 0;
  for (;;) {
    const { done, value } = await reader.read();
    if (done) break;
    total += value.byteLength;
    if (total > max) { await reader.cancel().catch(() => {}); return null; }
    parts.push(value);
  }
  const out = new Uint8Array(total);
  let o = 0;
  for (const p of parts) { out.set(p, o); o += p.byteLength; }
  return out;
}

const reasonOf = (b: Record<string, unknown>) =>
  typeof b.reason === "string" && b.reason.trim().length >= 3 && b.reason.trim().length <= 500 ? b.reason.trim() : null;

async function load(db: D1Like, id: string): Promise<PartnerRow | null> {
  return db.prepare(`SELECT ${PARTNER_COLS}, ${REJECTED_EXPR} AS rejected FROM partners WHERE id = ?`).bind(id).first<PartnerRow>();
}

export async function handlePartners(
  request: Request,
  env: PartnersEnv,
  opts?: Parameters<typeof guardAdminRequest>[2],
): Promise<Response> {
  const g = await guardAdminRequest(request, env, opts);
  if (!g.ok) return g.response;
  if (g.identity.role !== "admin") return err(403, "admin_only");
  const actor = g.identity.email;

  const url = new URL(request.url);
  const sub = url.pathname.replace(/\/+$/, "").slice(PARTNERS_PREFIX.length);
  const m = request.method;

  // ---- liste ----
  if (sub === "") {
    if (m !== "GET") return err(405, "method_not_allowed");
    const st = (url.searchParams.get("status") ?? "pending") as ListStatus;
    if (!LIST_STATUSES.includes(st)) return err(400, "bad_status");
    const where =
      st === "approved" ? "WHERE approved = 1"
      : st === "pending" ? `WHERE approved = 0 AND NOT COALESCE(${REJECTED_EXPR}, 0)`
      : st === "rejected" ? `WHERE approved = 0 AND COALESCE(${REJECTED_EXPR}, 0)`
      : "";
    const r = await env.DB.prepare(`SELECT ${PARTNER_COLS}, ${REJECTED_EXPR} AS rejected FROM partners ${where} ORDER BY created_at DESC LIMIT ${LIST_LIMIT}`).all<PartnerRow>();
    const data = (r.results ?? []).map(toAdminPartner);
    return json({ data, truncated: data.length === LIST_LIMIT });
  }

  const mm = sub.match(/^\/([^/]+)(?:\/(approve|reject|unapprove|logo))?$/);
  if (!mm || !ID_RE.test(mm[1])) return err(404, "not_found");
  const id = mm[1];
  const action = mm[2];
  const row = await load(env.DB, id);
  if (!row) return err(404, "not_found");

  // ---- detay ----
  if (!action && m === "GET") return json(toAdminPartner(row));

  // ---- düzenleme ----
  if (!action && m === "PATCH") {
    const body = await readJson(request);
    if (!body) return err(415, "json_required");
    const v = validatePatch(body);
    if (!v.ok) return err(400, v.error, v.field ? { field: v.field } : {});
    const set: string[] = [];
    const args: unknown[] = [];
    const oldV: Record<string, unknown> = {};
    const newV: Record<string, unknown> = {};
    for (const [k, val] of Object.entries(v.patch)) {
      const col = k === "certs" ? "certs_json" : k;
      set.push(`${col} = ?`);
      args.push(k === "certs" ? JSON.stringify(val) : val);
      oldV[k] = k === "certs" ? JSON.parse(row.certs_json ?? "[]") : (row as unknown as Record<string, unknown>)[col];
      newV[k] = val;
    }
    await withAudit(env.DB, [env.DB.prepare(`UPDATE partners SET ${set.join(", ")} WHERE id = ?`).bind(...args, id)], {
      actor, action: "update_partner", entity_type: "partner", entity_id: id, old_value: oldV, new_value: newV,
    });
    return json(toAdminPartner((await load(env.DB, id))!));
  }

  if (m !== "POST" || !action) return err(405, "method_not_allowed");

  // ---- logo upload (multipart) ----
  if (action === "logo") {
    if (request.headers.get("x-bdx-admin") !== "1") return err(403, "csrf_header_required");
    const ct = request.headers.get("content-type") ?? "";
    if (!ct.toLowerCase().startsWith("multipart/form-data")) return err(415, "multipart_required");
    const raw = await readLimited(request, MAX_LOGO_BYTES + 64 * 1024);
    if (!raw) return err(413, "logo_too_large", { max_bytes: MAX_LOGO_BYTES });
    const fd = await new Response(raw as unknown as BodyInit, { headers: { "content-type": ct } }).formData().catch(() => null);
    const file = fd?.get("logo");
    if (!file || typeof file === "string") return err(400, "logo_required");
    if (file.size > MAX_LOGO_BYTES) return err(413, "logo_too_large", { max_bytes: MAX_LOGO_BYTES });
    const bytes = new Uint8Array(await file.arrayBuffer());
    const kind = detectLogo(bytes, file.type);
    if (!kind) return err(400, "invalid_logo_type", { allowed: ["image/png", "image/jpeg", "image/webp"] });
    const key = logoKey(id, ulid(), kind.ext);
    await env.MEDIA.put(key, bytes, { httpMetadata: { contentType: kind.mime }, customMetadata: { partner_id: id } });
    try {
      await withAudit(env.DB, [env.DB.prepare("UPDATE partners SET logo_r2_key = ? WHERE id = ?").bind(key, id)], {
        actor, action: "upload_partner_logo", entity_type: "partner", entity_id: id,
        old_value: { logo_r2_key: row.logo_r2_key }, new_value: { logo_r2_key: key, mime: kind.mime, bytes: bytes.byteLength },
      });
    } catch (e) {
      await env.MEDIA.delete(key).catch(() => {});
      throw e;
    }
    if (row.logo_r2_key) await env.MEDIA.delete(row.logo_r2_key).catch(() => {}); // eski sürüm (best-effort)
    return json({ ...toAdminPartner((await load(env.DB, id))!), logo_public: row.consent_logo_en === 1 });
  }

  const body = await readJson(request);
  if (!body) return err(415, "json_required");

  // ---- onay / red / geri alma: koşullu UPDATE + audit aynı batch (0 satır → audit yok → 409) ----
  if (action === "approve") {
    if (!row.kvkk_consent_version) return err(422, "kvkk_consent_missing"); // rızasız başvuru yayına alınamaz
    if (statusOf(row) !== "pending") return err(409, "not_pending", { status: statusOf(row) });
    const ok = await withAudit(env.DB, [env.DB.prepare("UPDATE partners SET approved = 1, approved_at = datetime('now') WHERE id = ? AND approved = 0").bind(id)], {
      actor, action: "approve_partner", entity_type: "partner", entity_id: id,
      old_value: { approved: 0 }, new_value: { approved: 1, consent_logo_en: row.consent_logo_en },
    });
    return ok ? json(toAdminPartner((await load(env.DB, id))!)) : err(409, "stale");
  }
  const reason = reasonOf(body);
  if (!reason) return err(400, "reason_required");
  if (action === "reject") {
    if (statusOf(row) !== "pending") return err(409, "not_pending", { status: statusOf(row) });
    // No-op UPDATE yalnız approved=0 iken satır eşler → arada onaylandıysa 0 satır → audit yok → 409
    const ok = await withAudit(env.DB, [env.DB.prepare("UPDATE partners SET approved = 0 WHERE id = ? AND approved = 0").bind(id)], {
      actor, action: "reject_partner", entity_type: "partner", entity_id: id, old_value: { status: "pending" }, new_value: { status: "rejected", reason },
    });
    return ok ? json(toAdminPartner((await load(env.DB, id))!)) : err(409, "stale");
  }
  // unapprove
  if (row.approved !== 1) return err(409, "not_approved");
  const ok = await withAudit(env.DB, [env.DB.prepare("UPDATE partners SET approved = 0, approved_at = NULL WHERE id = ? AND approved = 1").bind(id)], {
    actor, action: "unapprove_partner", entity_type: "partner", entity_id: id, old_value: { approved: 1 }, new_value: { approved: 0, reason },
  });
  return ok ? json(toAdminPartner((await load(env.DB, id))!)) : err(409, "stale");
}
