import { z } from "zod";
import { HttpError, type AuthedKey, type Env } from "./types";
import { json } from "./util";

const page = z.object({
  limit: z.coerce.number().int().min(1).max(100).default(20),
  cursor: z.string().max(40).optional(), // son görülen id — keyset sayfalama
});

function q(url: URL) {
  const p = page.safeParse(Object.fromEntries(url.searchParams));
  if (!p.success) {
    throw new HttpError(400, "validation_failed", "Geçersiz sorgu", p.error.issues.map((i) => ({ field: i.path.join("."), message: i.message })));
  }
  return p.data;
}

function envelope(rows: { id: string }[], limit: number) {
  return { data: rows, next_cursor: rows.length === limit ? rows[rows.length - 1].id : null };
}

/** GET /v1/contents — anahtarsız public; draft HARİÇ (admin-internal ?status ile görebilir). */
export async function listContents(env: Env, url: URL, key: AuthedKey | null): Promise<Response> {
  const { limit, cursor } = q(url);
  const locale = url.searchParams.get("locale");
  const st = url.searchParams.get("status");
  const statuses = key?.tier === "admin-internal" && st ? [st] : ["approved", "published"];
  if (!statuses.every((s) => ["draft", "approved", "published"].includes(s))) {
    throw new HttpError(400, "validation_failed", "Geçersiz status");
  }
  const sql = `SELECT id, slug, locale, page_type, title, body_md, target_keyword, status, created_at, published_at
               FROM contents WHERE status IN (${statuses.map(() => "?").join(",")})
               ${locale ? "AND locale = ?" : ""} ${cursor ? "AND id > ?" : ""} ORDER BY id LIMIT ?`;
  const args: unknown[] = [...statuses, ...(locale ? [locale] : []), ...(cursor ? [cursor] : []), limit];
  const r = await env.DB.prepare(sql).bind(...args).all<{ id: string }>();
  return json(envelope(r.results, limit));
}

/**
 * GET /v1/partners — key zorunlu. admin-internal: tüm alanlar (PII dahil);
 * diğer tier'lar: yalnız approved=1 ve PII'siz alanlar; logo yalnız consent_logo_en=1 ise.
 */
export async function listPartners(env: Env, url: URL, key: AuthedKey): Promise<Response> {
  const { limit, cursor } = q(url);
  const admin = key.tier === "admin-internal";
  const approvedParam = url.searchParams.get("approved");
  const where: string[] = [];
  const args: unknown[] = [];
  if (!admin) where.push("approved = 1");
  else if (approvedParam === "0" || approvedParam === "1") {
    where.push("approved = ?");
    args.push(Number(approvedParam));
  }
  if (cursor) {
    where.push("id > ?");
    args.push(cursor);
  }
  const cols = admin
    ? "id, name, logo_r2_key, sector, certs_json, capacity, catalog_r2_key, consent_logo_en, approved, contact_json, tax_id, export_history, kvkk_consent_version, kvkk_consent_at, created_at, approved_at"
    : "id, name, CASE WHEN consent_logo_en = 1 THEN logo_r2_key END AS logo_r2_key, sector, certs_json, capacity, consent_logo_en";
  const r = await env.DB.prepare(`SELECT ${cols} FROM partners ${where.length ? "WHERE " + where.join(" AND ") : ""} ORDER BY id LIMIT ?`)
    .bind(...args, limit).all<{ id: string }>();
  return json(envelope(r.results, limit));
}

/** GET /v1/leads — yalnız admin-internal (payload PII içerir). */
export async function listLeads(env: Env, url: URL): Promise<Response> {
  const { limit, cursor } = q(url);
  const status = url.searchParams.get("status");
  if (status && !["new", "contacted", "qualified", "closed"].includes(status)) {
    throw new HttpError(400, "validation_failed", "Geçersiz status");
  }
  const where: string[] = [];
  const args: unknown[] = [];
  if (status) {
    where.push("status = ?");
    args.push(status);
  }
  if (cursor) {
    where.push("id > ?");
    args.push(cursor);
  }
  const r = await env.DB.prepare(
    `SELECT id, source_page, locale, form_type, channel_pref, payload_json, status, partner_id, utm_json, created_at
     FROM leads ${where.length ? "WHERE " + where.join(" AND ") : ""} ORDER BY id LIMIT ?`,
  ).bind(...args, limit).all<{ id: string }>();
  return json(envelope(r.results, limit));
}
