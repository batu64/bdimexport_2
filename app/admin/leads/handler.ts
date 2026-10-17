// FAZ_3 3.3 — /admin/api/leads* (Lead Kanban sunucu tarafı). Admin API router'ında (workers/api) çalışır;
// router bağlaması ayrı adım (api scope). Auth: guardAdminRequest (Access JWT + allowlist) + BURADA ek kural:
// lead = kişisel veri → YALNIZ admin. Viewer maskeli listeyi bile göremez (3.2 rol kapısının sunucu karşılığı).
//
//   GET  /admin/api/leads?status&locale&source_page&channel_pref   → MASKELİ liste (ham iletişim verisi yok)
//   POST /admin/api/leads/:id/status  {from, to}                   → geçiş + audit (yarışta 409, audit yok)
//   POST /admin/api/leads/:id/reveal                               → audit ÖNCE, sonra ham iletişim + kanal linki
//
// CSRF: Access cookie SameSite=Lax + POST'ta zorunlu `content-type: application/json` (form ile taklit edilemez).
import { guardAdminRequest, type AdminEnv } from "../middleware.ts";
import { writeAudit, type D1Like } from "../audit.ts";
import { buildChannelAction } from "./channel.ts";
import { changeLeadStatus, isStatus, parseLeadRow, revealContact, toMaskedLead, REVEAL_FIELDS, type LeadFilter } from "./lib.ts";

export interface LeadsEnv extends AdminEnv {
  DB: D1Like;
}

export const LEADS_PREFIX = "/admin/api/leads";
const LIST_LIMIT = 500;
const ID_RE = /^[A-Za-z0-9_-]{1,64}$/;
const COLS =
  "id, source_page, locale, form_type, channel_pref, payload_json, status, partner_id, created_at, consent_version, consent_at, double_optin_at";

const json = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), {
    status,
    headers: { "content-type": "application/json; charset=utf-8", "cache-control": "no-store", "x-robots-tag": "noindex, nofollow" },
  });
const err = (status: number, code: string) => json({ error: code }, status);

function filterFrom(url: URL): LeadFilter | null {
  const f: LeadFilter = {};
  for (const k of ["locale", "source_page", "channel_pref"] as const) {
    const v = url.searchParams.get(k);
    if (v === null || v === "") continue;
    if (v.length > 200) return null;
    f[k] = v;
  }
  return f;
}

async function readJson(request: Request): Promise<Record<string, unknown> | null> {
  if (!(request.headers.get("content-type") ?? "").toLowerCase().startsWith("application/json")) return null;
  const b = await request.json().catch(() => null);
  return b && typeof b === "object" && !Array.isArray(b) ? (b as Record<string, unknown>) : null;
}

export async function handleLeads(
  request: Request,
  env: LeadsEnv,
  opts?: Parameters<typeof guardAdminRequest>[2],
  now: Date = new Date(),
): Promise<Response> {
  const g = await guardAdminRequest(request, env, opts);
  if (!g.ok) return g.response;
  if (g.identity.role !== "admin") return err(403, "admin_only"); // viewer: lead modülü tamamen kapalı
  const actor = g.identity.email;

  const url = new URL(request.url);
  const sub = url.pathname.replace(/\/+$/, "").slice(LEADS_PREFIX.length); // "", "/:id/status", "/:id/reveal"

  // ---- GET liste (maskeli) ----
  if (sub === "" && request.method === "GET") {
    const f = filterFrom(url);
    const st = url.searchParams.get("status");
    if (!f || (st && !isStatus(st))) return err(400, "bad_filter");
    const where: string[] = [];
    const args: unknown[] = [];
    if (st) { where.push("status = ?"); args.push(st); }
    for (const k of ["locale", "source_page", "channel_pref"] as const) {
      if (f[k]) { where.push(`${k} = ?`); args.push(f[k]); }
    }
    const sql = `SELECT ${COLS} FROM leads ${where.length ? "WHERE " + where.join(" AND ") : ""} ORDER BY created_at DESC LIMIT ${LIST_LIMIT}`;
    const r = await env.DB.prepare(sql).bind(...args).all<Record<string, unknown>>();
    const data = (r.results ?? []).map((row) => toMaskedLead(parseLeadRow(row), now));
    return json({ data, truncated: data.length === LIST_LIMIT });
  }

  const m = sub.match(/^\/([^/]+)\/(status|reveal)$/);
  if (!m || !ID_RE.test(m[1])) return err(404, "not_found");
  if (request.method !== "POST") return err(405, "method_not_allowed");
  const id = m[1];
  const body = await readJson(request);
  if (!body) return err(415, "json_required");

  const row = await env.DB.prepare(`SELECT ${COLS} FROM leads WHERE id = ?`).bind(id).first<Record<string, unknown>>();
  if (!row) return err(404, "not_found");
  const lead = parseLeadRow(row);

  // ---- POST status (drag & drop) ----
  if (m[2] === "status") {
    const { from, to } = body;
    if (!isStatus(from) || !isStatus(to)) return err(400, "bad_status");
    if (from !== lead.status) return json({ error: "stale", current: lead.status }, 409);
    const applied = await changeLeadStatus(env.DB, actor, { id, status: from }, to);
    if (!applied) {
      const cur = await env.DB.prepare("SELECT status FROM leads WHERE id = ?").bind(id).first<{ status: string }>();
      return json({ error: "stale", current: cur?.status ?? null }, 409);
    }
    return json({ id, status: to });
  }

  // ---- POST reveal: hassas veri görüntüleme izi ÖNCE yazılır; audit düşerse veri dönmez ----
  const contact = revealContact(lead);
  const fields = REVEAL_FIELDS.filter((k) => contact[k] !== null);
  await writeAudit(env.DB, {
    actor, action: "lead_pii_reveal", entity_type: "lead", entity_id: id,
    new_value: { fields, channel_pref: lead.channel_pref }, // DEĞER yazılmaz — yalnız hangi alanların görüldüğü
  });
  const channel = buildChannelAction(lead.channel_pref, lead.locale, {
    name: contact.name ?? undefined, email: contact.email ?? undefined, whatsapp: contact.whatsapp ?? undefined,
    telegram: contact.telegram ?? undefined, wechat: contact.wechat ?? undefined, product: lead.payload.product,
  });
  return json({ id, contact, channel });
}
