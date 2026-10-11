import { z } from "zod";
import { HttpError, type Env } from "./types";
import { clientIp, intVar, json, readBodyLimited, ulid } from "./util";
import { rateLimit } from "./ratelimit";
import { verifyTurnstile } from "./turnstile";

export const MAX_PDF_BYTES = 25 * 1024 * 1024;
const MULTIPART_OVERHEAD = 256 * 1024; // alan + boundary payı
const TRUE_VALUES = ["true", "on", "1"] as const;

const bool = z.enum(TRUE_VALUES);

const schema = z.object({
  firmaAdi: z.string().trim().min(1, "zorunlu").max(200),
  vergiNo: z.string().transform((s) => s.replace(/\s/g, "")).pipe(z.string().regex(/^\d{10,11}$/, "10-11 haneli olmalı")),
  kapasite: z.string().trim().max(300).optional(),
  sertifikalar: z.array(z.string().trim().min(1).max(40)).max(12),
  ihracatGecmisi: z.string().trim().max(2000).optional(),
  sektor: z.string().trim().max(120).optional(),
  kvkkConsent: bool,                                   // SUNUCU TARAFI ZORUNLU — yoksa/false ise 400
  kvkkVersion: z.string().trim().min(1).max(100),
  logoConsent: z.enum([...TRUE_VALUES, "false", "off", "0", ""]).optional(),  // ayrı, opsiyonel
  contactName: z.string().trim().max(120).optional(),
  contactEmail: z.string().trim().email().max(200),         // zorunlu: başvuru sonucu e-postayla bildirilir (form 48 saat SLA)
  contactPhone: z.string().trim().max(40).optional(),
});

function str(fd: FormData, k: string): string | undefined {
  const v = fd.get(k);
  return typeof v === "string" && v !== "" ? v : undefined;
}

export async function handleApply(req: Request, env: Env): Promise<Response> {
  if (req.method !== "POST") throw new HttpError(405, "method_not_allowed", "POST gerekli", undefined, { allow: "POST" });
  const ip = clientIp(req);

  await rateLimit(env.CACHE, "apply", ip, intVar(env.RL_APPLY_PER_MIN, 5));

  const ct = req.headers.get("content-type") ?? "";
  if (!ct.toLowerCase().startsWith("multipart/form-data")) {
    throw new HttpError(415, "unsupported_media_type", "multipart/form-data gerekli");
  }

  // 1) Gövde boyutu — Content-Length veya akış sayacı ile (26MB → 413)
  const raw = await readBodyLimited(req, MAX_PDF_BYTES + MULTIPART_OVERHEAD);
  const fd = await new Response(raw, { headers: { "content-type": ct } }).formData().catch(() => {
    throw new HttpError(400, "invalid_multipart", "Form çözümlenemedi");
  });

  // 2) Turnstile (bağlı + replay'li) — bot kapısı, validasyondan ÖNCE
  const tsToken = str(fd, "turnstileToken") ?? str(fd, "cf-turnstile-response") ?? null;
  await verifyTurnstile(env, tsToken, ip);

  // 3) Dosya kontrolleri
  const file = fd.get("katalogFile");
  let pdf: Uint8Array | null = null;
  if (file && typeof file !== "string" && file.size > 0) {
    if (file.size > MAX_PDF_BYTES) throw new HttpError(413, "file_too_large", "PDF 25MB altı olmalı");
    if (file.type !== "application/pdf") throw new HttpError(400, "invalid_file_type", "Yalnızca PDF kabul edilir");
    pdf = new Uint8Array(await file.arrayBuffer());
    // magic bytes: mime beyanı client kontrollü, içerik doğrulanır
    const magic = new TextDecoder().decode(pdf.subarray(0, 5));
    if (magic !== "%PDF-") throw new HttpError(400, "invalid_file_type", "Dosya geçerli bir PDF değil");
  }

  // 4) zod — KVKK rızası sunucuda zorunlu
  const parsed = schema.safeParse({
    firmaAdi: str(fd, "firmaAdi"),
    vergiNo: str(fd, "vergiNo"),
    kapasite: str(fd, "kapasite"),
    sertifikalar: fd.getAll("sertifikalar").filter((v): v is string => typeof v === "string" && v !== ""),
    ihracatGecmisi: str(fd, "ihracatGecmisi"),
    sektor: str(fd, "sektor"),
    kvkkConsent: str(fd, "kvkkConsent"),
    kvkkVersion: str(fd, "kvkkVersion"),
    logoConsent: str(fd, "logoConsent"),
    contactName: str(fd, "contactName"),
    contactEmail: str(fd, "contactEmail"),
    contactPhone: str(fd, "contactPhone"),
  });
  if (!parsed.success) {
    // Girdi değeri geri yansıtılmaz (PII); yalnızca alan yolu + mesaj
    const details = parsed.error.issues.map((i) => ({ field: i.path.join("."), message: i.message }));
    throw new HttpError(400, "validation_failed", "Geçersiz başvuru", details);
  }
  const d = parsed.data;
  const versions = (env.KVKK_VERSIONS ?? "").split("|").map((s) => s.trim()).filter(Boolean);
  if (!versions.includes(d.kvkkVersion)) {
    throw new HttpError(400, "validation_failed", "Geçersiz başvuru", [{ field: "kvkkVersion", message: "tanınmayan rıza metni sürümü" }]);
  }

  // 5) Mükerrer vergi no
  const dup = await env.DB.prepare("SELECT id FROM partners WHERE tax_id = ?").bind(d.vergiNo).first();
  if (dup) throw new HttpError(409, "duplicate_application", "Bu vergi numarası ile başvuru mevcut");

  const id = ulid();
  let catalogKey: string | null = null;
  if (pdf) {
    catalogKey = `media/tr/katalog/${id}/katalog.pdf`; // dosya adı kullanıcıdan ALINMAZ
    await env.MEDIA.put(catalogKey, pdf, {
      httpMetadata: { contentType: "application/pdf" },
      customMetadata: { partner_id: id },
    });
  }

  const contact = d.contactName || d.contactEmail || d.contactPhone
    ? JSON.stringify({ name: d.contactName ?? null, email: d.contactEmail ?? null, phone: d.contactPhone ?? null })
    : null;
  const logoConsent = d.logoConsent && (TRUE_VALUES as readonly string[]).includes(d.logoConsent) ? 1 : 0;

  try {
    // approved=0 SABİT (client'tan alınmaz); logo_r2_key NULL (rıza + admin onayı sonrası 3.5'te)
    await env.DB.prepare(
      `INSERT INTO partners (id, name, sector, certs_json, capacity, catalog_r2_key, consent_logo_en, approved,
                             contact_json, tax_id, export_history, kvkk_consent_version, kvkk_consent_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, 0, ?, ?, ?, ?, ?)`,
    )
      .bind(id, d.firmaAdi, d.sektor ?? null, JSON.stringify(d.sertifikalar), d.kapasite ?? null, catalogKey,
            logoConsent, contact, d.vergiNo, d.ihracatGecmisi ?? null, d.kvkkVersion, new Date().toISOString())
      .run();
  } catch (e) {
    if (catalogKey) await env.MEDIA.delete(catalogKey).catch(() => {});
    if (String(e).includes("UNIQUE")) throw new HttpError(409, "duplicate_application", "Bu vergi numarası ile başvuru mevcut");
    throw e;
  }

  return json({ id, status: "pending_review", approved: false }, 201);
}
