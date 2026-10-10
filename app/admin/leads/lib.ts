// FAZ_3 3.3 — Lead Merkezi saf mantığı (framework'süz; node --experimental-strip-types ile test edilir)
import type { D1Like } from "../audit";
import { withAudit } from "../audit";

export type LeadStatus = "new" | "contacted" | "qualified" | "closed";
export const STATUSES: LeadStatus[] = ["new", "contacted", "qualified", "closed"];
// DB enum'u (0001_init) sabit; kolon etiketleri görev metnine göre eşlenir.
export const STATUS_LABEL: Record<LeadStatus, string> = {
  new: "Yeni", contacted: "İncelemede", qualified: "Cevaplandı", closed: "Kapandı",
};

export interface LeadConsent {
  version: string; // "v1"
  sha256: string; // content/tr/legal/kvkk-riza-v1.md SHA-256 (hex)
  at?: string;
}
export interface LeadPayload {
  name?: string; company?: string; email?: string; whatsapp?: string; telegram?: string; wechat?: string;
  product?: string; message?: string; catalog_r2_key?: string; consent?: LeadConsent;
}
export interface Lead {
  id: string; source_page: string; locale: string; form_type: string;
  channel_pref: string | null; payload: LeadPayload; status: LeadStatus;
  partner_id: string | null; created_at: string; // 'YYYY-MM-DD HH:MM:SS' UTC
}

/** D1 satırı → Lead. Bozuk JSON'da payload boş (UI çökmez; rıza yok olarak işaretlenir). */
export function parseLeadRow(row: Record<string, unknown>): Lead {
  let payload: LeadPayload = {};
  try { payload = JSON.parse(String(row.payload_json ?? "{}")) as LeadPayload; } catch { /* boş */ }
  return {
    id: String(row.id), source_page: String(row.source_page), locale: String(row.locale),
    form_type: String(row.form_type ?? "lead"), channel_pref: (row.channel_pref as string) ?? null,
    payload, status: row.status as LeadStatus, partner_id: (row.partner_id as string) ?? null,
    created_at: String(row.created_at),
  };
}

// ---- KVKK maskeleme: listede HER ZAMAN; detayda yalnız açık toggle ile ----
export function maskEmail(v?: string): string {
  if (!v) return "—";
  const [l, d] = v.split("@");
  if (!l || !d) return "***";
  const tld = d.includes(".") ? d.slice(d.lastIndexOf(".")) : "";
  return `${l.slice(0, 1)}***@${d.slice(0, 1)}***${tld}`;
}
export function maskPhone(v?: string): string {
  if (!v) return "—";
  const digits = v.replace(/\D/g, "");
  if (digits.length < 6) return "***";
  return `+${digits.slice(0, 2)}•••••${digits.slice(-2)}`;
}
export function maskName(v?: string): string {
  if (!v) return "—";
  return v.trim().split(/\s+/).map((p) => p.slice(0, 1) + "•••").join(" ");
}
export function maskHandle(v?: string): string {
  if (!v) return "—";
  return v.slice(0, 2) + "•••";
}

// ---- KVKK saklama süresi rozeti ----
// Kaynak: kvkk-riza-v1.md §1.6 yalnız başvuru (reddedilirse 1 yıl) süresini söyler; lead için 365 gün varsayımı İNSAN ONAYI ister.
export const RETENTION_DAYS = 365;
export interface RetentionBadge { daysLeft: number; level: "ok" | "warn" | "expired"; text: string }
export function retentionBadge(createdAt: string, now: Date = new Date(), days = RETENTION_DAYS): RetentionBadge {
  const created = new Date(createdAt.replace(" ", "T") + (createdAt.endsWith("Z") ? "" : "Z"));
  const left = Math.ceil((created.getTime() + days * 86400000 - now.getTime()) / 86400000);
  if (left <= 0) return { daysLeft: left, level: "expired", text: "Saklama süresi doldu — silinmeli" };
  return { daysLeft: left, level: left <= 30 ? "warn" : "ok", text: `${left} gün saklama kaldı` };
}

// ---- Rıza sürümü rozeti ----
export function consentBadge(c?: LeadConsent): { ok: boolean; text: string } {
  if (!c || !c.version || !/^[0-9a-f]{64}$/.test(c.sha256 ?? "")) return { ok: false, text: "RIZA KAYDI YOK" };
  return { ok: true, text: `${c.version} · ${c.sha256.slice(0, 8)}` };
}

// ---- Filtreler ----
export interface LeadFilter { locale?: string; source_page?: string; channel_pref?: string }
export function filterLeads(leads: Lead[], f: LeadFilter): Lead[] {
  return leads.filter((l) =>
    (!f.locale || l.locale === f.locale) &&
    (!f.source_page || l.source_page === f.source_page) &&
    (!f.channel_pref || l.channel_pref === f.channel_pref));
}

// ---- Status geçişi: mutasyon + audit AYNI batch (audit.ts withAudit) ----
export async function changeLeadStatus(
  db: D1Like, actor: string, lead: Pick<Lead, "id" | "status">, to: LeadStatus,
): Promise<void> {
  if (!STATUSES.includes(to)) throw new Error(`geçersiz status: ${to}`);
  if (lead.status === to) return;
  await withAudit(
    db,
    [db.prepare("UPDATE leads SET status = ? WHERE id = ? AND status = ?").bind(to, lead.id, lead.status)],
    { actor, action: "lead_status_change", entity_type: "lead", entity_id: lead.id, old_value: { status: lead.status }, new_value: { status: to } },
  );
}

/** R2 katalog PDF'i public değil; admin-içi yetkili okuma yolu (endpoint 3.4'te bağlanır). Traversal'a karşı doğrulanır. */
export function catalogHref(key?: string): string | null {
  if (!key || key.includes("..") || !/^media\/[A-Za-z0-9_\-./]+\.pdf$/i.test(key)) return null;
  return `/admin/media/${key}`;
}
