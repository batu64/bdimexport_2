// FAZ_3 3.3 — Lead Merkezi saf mantığı (framework'süz; node --experimental-strip-types ile test edilir)
// KVKK: lead = kişisel veri. Maskeleme SUNUCUDA yapılır (toMaskedLead) — liste yanıtında ham iletişim verisi YOKTUR;
// ham veri yalnız "göster" (reveal) ile, audit'e yazıldıktan SONRA döner (handler.ts).
import type { D1Like } from "../audit.ts";
import { withAudit } from "../audit.ts";

export type LeadStatus = "new" | "contacted" | "qualified" | "closed";
export const STATUSES: LeadStatus[] = ["new", "contacted", "qualified", "closed"];
// DB enum'u (0001_init) sabit; kolon etiketleri.
export const STATUS_LABEL: Record<LeadStatus, string> = {
  new: "Yeni", contacted: "İletişimde", qualified: "Nitelikli", closed: "Kapandı",
};
export const isStatus = (v: unknown): v is LeadStatus => STATUSES.includes(v as LeadStatus);

export interface LeadPayload {
  name?: string; company?: string; email?: string; whatsapp?: string; telegram?: string; wechat?: string;
  phone?: string; product?: string; message?: string; catalog_r2_key?: string;
  /** eski kayıt biçimi — rıza artık leads.consent_* kolonlarında (0001 v1.1) */
  consent?: { version?: string; sha256?: string; at?: string };
}
export interface Lead {
  id: string; source_page: string; locale: string; form_type: string;
  channel_pref: string | null; payload: LeadPayload; status: LeadStatus;
  partner_id: string | null; created_at: string; // 'YYYY-MM-DD HH:MM:SS' UTC
  consent_version: string | null; consent_at: string | null; double_optin_at: string | null;
}

/** D1 satırı → Lead. Bozuk JSON'da payload boş (UI çökmez; rıza yok olarak işaretlenir). */
export function parseLeadRow(row: Record<string, unknown>): Lead {
  let payload: LeadPayload = {};
  try {
    const p = JSON.parse(String(row.payload_json ?? "{}"));
    if (p && typeof p === "object") payload = p as LeadPayload;
  } catch { /* boş */ }
  const str = (v: unknown) => (typeof v === "string" && v ? v : null);
  return {
    id: String(row.id), source_page: String(row.source_page), locale: String(row.locale),
    form_type: String(row.form_type ?? "lead"), channel_pref: str(row.channel_pref),
    payload, status: row.status as LeadStatus, partner_id: str(row.partner_id),
    created_at: String(row.created_at),
    consent_version: str(row.consent_version) ?? str(payload.consent?.version),
    consent_at: str(row.consent_at) ?? str(payload.consent?.at),
    double_optin_at: str(row.double_optin_at),
  };
}

// ---- KVKK maskeleme ----
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

/** Liste/Kanban DTO'su — ham kişisel veri İÇERMEZ. Firma adı tüzel kişi bilgisidir, maskelenmez. */
export interface MaskedLead {
  id: string; source_page: string; locale: string; form_type: string; channel_pref: string | null;
  status: LeadStatus; partner_id: string | null; created_at: string;
  company: string | null; product: string | null;
  masked: { name: string; email: string; phone: string; whatsapp: string; telegram: string; wechat: string };
  consent: { ok: boolean; text: string }; double_optin: boolean;
  retention: RetentionBadge; has_catalog: boolean;
}
export function toMaskedLead(l: Lead, now: Date = new Date()): MaskedLead {
  const p = l.payload;
  return {
    id: l.id, source_page: l.source_page, locale: l.locale, form_type: l.form_type, channel_pref: l.channel_pref,
    status: l.status, partner_id: l.partner_id, created_at: l.created_at,
    company: p.company?.trim() || null, product: p.product?.trim() || null,
    masked: {
      name: maskName(p.name), email: maskEmail(p.email), phone: maskPhone(p.phone),
      whatsapp: maskPhone(p.whatsapp), telegram: maskHandle(p.telegram), wechat: maskHandle(p.wechat),
    },
    consent: consentBadge(l.consent_version), double_optin: !!l.double_optin_at,
    retention: retentionBadge(l.created_at, now), has_catalog: !!catalogHref(p.catalog_r2_key),
  };
}

/** "Göster" ile dönen ham iletişim verisi (yalnız audit yazıldıktan sonra). Mesaj/katalog dahil değil. */
export interface RevealedContact {
  name: string | null; email: string | null; phone: string | null;
  whatsapp: string | null; telegram: string | null; wechat: string | null;
}
export const REVEAL_FIELDS = ["name", "email", "phone", "whatsapp", "telegram", "wechat"] as const;
export function revealContact(l: Lead): RevealedContact {
  const p = l.payload;
  const v = (s?: string) => (s && s.trim() ? s.trim() : null);
  return { name: v(p.name), email: v(p.email), phone: v(p.phone), whatsapp: v(p.whatsapp), telegram: v(p.telegram), wechat: v(p.wechat) };
}

// ---- KVKK saklama süresi rozeti ----
// Kaynak: kvkk-riza-v1.md §1.6 yalnız başvuru (reddedilirse 1 yıl) süresini söyler; lead için 365 gün varsayımı İNSAN ONAYI ister.
export const RETENTION_DAYS = 365;
export interface RetentionBadge { daysLeft: number; level: "ok" | "warn" | "expired"; text: string }
export function retentionBadge(createdAt: string, now: Date = new Date(), days = RETENTION_DAYS): RetentionBadge {
  const created = new Date(createdAt.replace(" ", "T") + (createdAt.endsWith("Z") ? "" : "Z"));
  const left = Math.ceil((created.getTime() + days * 86400000 - now.getTime()) / 86400000);
  if (!Number.isFinite(left)) return { daysLeft: 0, level: "warn", text: "Tarih okunamadı" };
  if (left <= 0) return { daysLeft: left, level: "expired", text: "Saklama süresi doldu — silinmeli" };
  return { daysLeft: left, level: left <= 30 ? "warn" : "ok", text: `${left} gün saklama kaldı` };
}

// ---- Rıza sürümü rozeti (kaynak: leads.consent_version — sunucu tarafı yazılır) ----
export function consentBadge(version?: string | null): { ok: boolean; text: string } {
  if (!version || !version.trim()) return { ok: false, text: "RIZA KAYDI YOK" };
  return { ok: true, text: `Rıza ${version.trim()}` };
}

// ---- Filtreler (sunucuda SQL ile de uygulanır; bu saf sürüm testler + istemci içindir) ----
export interface LeadFilter { locale?: string; source_page?: string; channel_pref?: string }
export function filterLeads<T extends Pick<Lead, "locale" | "source_page" | "channel_pref">>(leads: T[], f: LeadFilter): T[] {
  return leads.filter((l) =>
    (!f.locale || l.locale === f.locale) &&
    (!f.source_page || l.source_page === f.source_page) &&
    (!f.channel_pref || l.channel_pref === f.channel_pref));
}

// ---- Status geçişi: mutasyon + audit AYNI batch (audit.ts withAudit) ----
/**
 * `from` = UI'nin gördüğü durum. `WHERE status = from` → başka admin araya girdiyse 0 satır değişir,
 * audit YAZILMAZ ve `false` döner (çağıran 409 verir; UI listeyi yeniler).
 */
export async function changeLeadStatus(
  db: D1Like, actor: string, lead: Pick<Lead, "id" | "status">, to: LeadStatus,
): Promise<boolean> {
  if (!isStatus(to)) throw new Error(`geçersiz status: ${to}`);
  if (!isStatus(lead.status)) throw new Error(`geçersiz status: ${lead.status}`);
  if (lead.status === to) return true;
  return withAudit(
    db,
    [db.prepare("UPDATE leads SET status = ? WHERE id = ? AND status = ?").bind(to, lead.id, lead.status)],
    { actor, action: "lead_status_change", entity_type: "lead", entity_id: lead.id, old_value: { status: lead.status }, new_value: { status: to } },
  );
}

/** R2 katalog PDF'i public değil; admin-içi yetkili okuma yolu (endpoint sonra). Traversal'a karşı doğrulanır. */
export function catalogHref(key?: string): string | null {
  if (!key || key.includes("..") || !/^media\/[A-Za-z0-9_\-./]+\.pdf$/i.test(key)) return null;
  return `/admin/media/${key}`;
}
