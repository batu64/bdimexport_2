// FAZ_3 3.5 — Partner yönetimi saf mantığı (framework'süz; node --experimental-strip-types ile test edilir).
// Flywheel kapısı: başvuru (approved=0) → admin ONAY → /en/suppliers vb. sayfalarda görünür (approved=1).
// KVKK/rıza kuralları:
//   - consent_logo_en SALT-OKUNUR: admin değiştiremez (yalnız partner yeniden rıza verir). PATCH'te gelirse 400.
//   - approved / kvkk_consent_* / tax_id / contact_json bu modülden düzenlenemez.
//   - KVKK rıza kaydı olmayan başvuru ONAYLANAMAZ.
//   - Logo, consent_logo_en=0 ise public görünümde ASLA dönmez (yazı + sektör görünür).

export type PartnerStatus = "pending" | "approved" | "rejected";
export const LIST_STATUSES = ["pending", "approved", "rejected", "all"] as const;
export type ListStatus = (typeof LIST_STATUSES)[number];

export interface PartnerRow {
  id: string; name: string; logo_r2_key: string | null; sector: string | null; certs_json: string | null;
  capacity: string | null; catalog_r2_key: string | null; consent_logo_en: number; approved: number;
  contact_json: string | null; created_at: string; approved_at: string | null; tax_id: string | null;
  export_history: string | null; kvkk_consent_version: string | null; kvkk_consent_at: string | null;
  rejected: number; // admin_actions'tan türetilir (son karar reject_partner mı)
}

export const PARTNER_COLS =
  "id, name, logo_r2_key, sector, certs_json, capacity, catalog_r2_key, consent_logo_en, approved, contact_json, created_at, approved_at, tax_id, export_history, kvkk_consent_version, kvkk_consent_at";

/**
 * Red kalıcı kolon değil (şema: approved 0/1) → audit'ten türetilir: partner için SON karar aksiyonu
 * reject_partner ise "rejected". Kalıcı `rejected_at` kolonu için migration önerisi panoda (api scope).
 */
export const REJECTED_EXPR = `(SELECT a.action FROM admin_actions a
  WHERE a.entity_type = 'partner' AND a.entity_id = partners.id
    AND a.action IN ('approve_partner','reject_partner','unapprove_partner')
  ORDER BY a.created_at DESC, a.id DESC LIMIT 1) = 'reject_partner'`;

export function statusOf(r: Pick<PartnerRow, "approved" | "rejected">): PartnerStatus {
  if (r.approved === 1) return "approved";
  return r.rejected ? "rejected" : "pending";
}

function parseArr(s: string | null): string[] {
  try {
    const v = JSON.parse(s ?? "[]");
    return Array.isArray(v) ? v.filter((x): x is string => typeof x === "string") : [];
  } catch {
    return [];
  }
}
function maskContact(s: string | null): { name: string; email: string; phone: string } | null {
  if (!s) return null;
  let c: Record<string, unknown> = {};
  try { c = JSON.parse(s) ?? {}; } catch { return { name: "—", email: "—", phone: "—" }; }
  const str = (v: unknown) => (typeof v === "string" && v ? v : "");
  const email = str(c.email), phone = str(c.phone) || str(c.whatsapp), name = str(c.name);
  const [l, d] = email.split("@");
  return {
    name: name ? name.trim().split(/\s+/).map((p) => p[0] + "•••").join(" ") : "—",
    email: l && d ? `${l[0]}***@${d[0]}***${d.includes(".") ? d.slice(d.lastIndexOf(".")) : ""}` : "—",
    phone: phone.replace(/\D/g, "").length >= 6 ? `+${phone.replace(/\D/g, "").slice(0, 2)}•••••${phone.replace(/\D/g, "").slice(-2)}` : "—",
  };
}
/** Vergi no tam gösterilmez (şahıs işletmesinde kişisel veri olabilir). */
export const maskTaxId = (t: string | null) => (t ? `${t.slice(0, 2)}••••••${t.slice(-2)}` : "—");

/** Admin listesi/detayı DTO'su — iletişim + vergi no MASKELİ. */
export function toAdminPartner(r: PartnerRow) {
  return {
    id: r.id, name: r.name, sector: r.sector, capacity: r.capacity, certs: parseArr(r.certs_json),
    export_history: r.export_history, status: statusOf(r), created_at: r.created_at, approved_at: r.approved_at,
    consent_logo_en: r.consent_logo_en === 1, // SALT-OKUNUR
    kvkk_consent: r.kvkk_consent_version ? { version: r.kvkk_consent_version, at: r.kvkk_consent_at } : null,
    has_logo: !!r.logo_r2_key, has_catalog: !!r.catalog_r2_key,
    contact: maskContact(r.contact_json), tax_id: maskTaxId(r.tax_id),
  };
}
export type AdminPartner = ReturnType<typeof toAdminPartner>;

/**
 * Public kart görünümü (PartnerGrid PartnerItem sözleşmesi). Yalnız approved=1; logo YALNIZ consent_logo_en=1.
 * workers/api read.ts non-admin SELECT'i ile aynı kural (CASE WHEN consent_logo_en = 1 THEN logo_r2_key).
 */
export function toPublicPartner(
  r: Pick<PartnerRow, "id" | "name" | "sector" | "approved" | "consent_logo_en" | "logo_r2_key">,
  logoBase: string,
): { id: string; name: string; sector?: string; logoUrl: string | null; verified: true } | null {
  if (r.approved !== 1) return null;
  const logoUrl = r.consent_logo_en === 1 && r.logo_r2_key ? `${logoBase.replace(/\/+$/, "")}/${r.logo_r2_key}` : null;
  return { id: r.id, name: r.name, ...(r.sector ? { sector: r.sector } : {}), logoUrl, verified: true };
}

// ---- Düzenleme (PATCH) doğrulaması ----
export const EDITABLE = ["sector", "certs", "capacity", "export_history"] as const;
/** Bu alanlar PATCH'te görülürse istek REDDEDİLİR (sessizce yok sayılmaz — rıza zorlama denemesi görünür olsun). */
export const FORBIDDEN = ["consent_logo_en", "approved", "approved_at", "kvkk_consent_version", "kvkk_consent_at", "tax_id", "contact_json", "logo_r2_key", "catalog_r2_key", "id", "created_at"] as const;

export type PartnerPatch = Partial<{ sector: string | null; certs: string[]; capacity: string | null; export_history: string | null }>;
export function validatePatch(body: Record<string, unknown>): { ok: true; patch: PartnerPatch } | { ok: false; error: string; field?: string } {
  for (const k of Object.keys(body)) {
    if ((FORBIDDEN as readonly string[]).includes(k)) return { ok: false, error: k === "consent_logo_en" ? "consent_read_only" : "field_read_only", field: k };
    if (!(EDITABLE as readonly string[]).includes(k)) return { ok: false, error: "unknown_field", field: k };
  }
  const patch: PartnerPatch = {};
  const text = (k: "sector" | "capacity" | "export_history", max: number) => {
    if (!(k in body)) return true;
    const v = body[k];
    if (v === null || v === "") { patch[k] = null; return true; }
    if (typeof v !== "string" || v.trim().length > max) return false;
    patch[k] = v.trim();
    return true;
  };
  if (!text("sector", 120)) return { ok: false, error: "bad_value", field: "sector" };
  if (!text("capacity", 300)) return { ok: false, error: "bad_value", field: "capacity" };
  if (!text("export_history", 2000)) return { ok: false, error: "bad_value", field: "export_history" };
  if ("certs" in body) {
    const c = body.certs;
    if (!Array.isArray(c) || c.length > 12 || !c.every((x) => typeof x === "string" && x.trim().length >= 1 && x.trim().length <= 40)) {
      return { ok: false, error: "bad_value", field: "certs" };
    }
    patch.certs = [...new Set(c.map((x: string) => x.trim()))];
  }
  if (Object.keys(patch).length === 0) return { ok: false, error: "empty_patch" };
  return { ok: true, patch };
}

// ---- Logo doğrulaması (SUNUCU: beyan edilen mime'a değil İÇERİĞE bakılır) ----
export const MAX_LOGO_BYTES = 1024 * 1024; // 1 MB
export type LogoKind = { mime: "image/png" | "image/jpeg" | "image/webp"; ext: "png" | "jpg" | "webp" };
/** SVG kabul edilmez (script/XSS taşıyabilir). Magic bytes ile tür tespiti; beyan edilen tür uyuşmazsa red. */
export function detectLogo(bytes: Uint8Array, declared: string): LogoKind | null {
  const b = bytes;
  const is = (sig: number[], off = 0) => sig.every((v, i) => b[off + i] === v);
  let k: LogoKind | null = null;
  if (b.length >= 8 && is([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a])) k = { mime: "image/png", ext: "png" };
  else if (b.length >= 3 && is([0xff, 0xd8, 0xff])) k = { mime: "image/jpeg", ext: "jpg" };
  else if (b.length >= 12 && is([0x52, 0x49, 0x46, 0x46]) && is([0x57, 0x45, 0x42, 0x50], 8)) k = { mime: "image/webp", ext: "webp" };
  if (!k) return null;
  return declared.toLowerCase() === k.mime ? k : null;
}
/** Sürümlü anahtar: yeni yükleme başarısız olursa eski logo bozulmaz; eski sürüm başarıdan sonra silinir. */
export const logoKey = (id: string, version: string, ext: string) => `media/partners/${id}/logo-${version}.${ext}`;
