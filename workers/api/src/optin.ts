import { z } from "zod";
import { HttpError, type Env } from "./types";
import { clientIp, intVar, json, readBodyLimited, sha256Hex, ulid } from "./util";
import { rateLimit } from "./ratelimit";
import { verifyTurnstile } from "./turnstile";

// FAZ_5 5.6 — /de Angebotsanfrage: DSGVO çift opt-in (double opt-in) İSKELETİ. 🔒 insan review zorunlu (AGENTS §8 Kural 4).
// Akış: POST /api/v1/de/anfrage → doğrulama → KV'de BEKLEYEN kayıt (TTL 72 sa) + mail kuyruğu girdisi → 202.
//       POST /api/v1/de/optin/bestaetigen {token} → bekleyen kaydı tüketir → 200 (lead yazımı TODO).
// Ham token yalnız kuyruk girdisinde (onay linki için) durur; bekleyen kayıt sha256(token) anahtarıyla saklanır.
// Veri kategorileri app/(de)/de/_lib/datenschutz.ts (DE_DATA_CATEGORIES) ile birebir — 5.1 Datenschutz bu listeyi beyan eder.

export const OPTIN_TTL_S = 72 * 3600;
const MAX_BODY = 16 * 1024;
const TURNSTILE_ACTION_DE_QUOTE = "de_quote";

const schema = z.object({
  name: z.string().trim().min(1, "erforderlich").max(120),
  company: z.string().trim().max(200).optional(),
  email: z.string().trim().email().max(200),
  phone: z.string().trim().max(40).optional(),
  message: z.string().trim().min(10, "mindestens 10 Zeichen").max(4000),
  consent: z.literal(true),                               // SUNUCU TARAFI ZORUNLU — önceden işaretli kutu kabul edilmez (istemci de false başlar)
  consentVersion: z.string().trim().min(1).max(100),
  turnstileToken: z.string().max(2048).optional(),
});

const tokenSchema = z.object({ token: z.string().regex(/^[A-Za-z0-9_-]{43}$/) });

function randomToken(): string {
  const b = crypto.getRandomValues(new Uint8Array(32));
  return btoa(String.fromCharCode(...b)).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

async function readJson(req: Request): Promise<unknown> {
  if (req.method !== "POST") throw new HttpError(405, "method_not_allowed", "POST gerekli", undefined, { allow: "POST" });
  const ct = req.headers.get("content-type") ?? "";
  if (!ct.toLowerCase().startsWith("application/json")) throw new HttpError(415, "unsupported_media_type", "application/json gerekli");
  const raw = await readBodyLimited(req, MAX_BODY);
  try {
    return JSON.parse(new TextDecoder().decode(raw));
  } catch {
    throw new HttpError(400, "invalid_json", "JSON çözümlenemedi");
  }
}

export async function handleDeQuote(req: Request, env: Env): Promise<Response> {
  const ip = clientIp(req);
  await rateLimit(env.CACHE, "de-quote", ip, intVar(env.RL_APPLY_PER_MIN, 5));
  const body = (await readJson(req)) as Record<string, unknown> | null;

  // Turnstile (bağlı + replay'li) — validasyondan ÖNCE; action bu forma özel
  const tsToken = typeof body?.turnstileToken === "string" ? body.turnstileToken : null;
  await verifyTurnstile(env, tsToken, ip, env.TURNSTILE_ACTION_DE_QUOTE ?? TURNSTILE_ACTION_DE_QUOTE);

  const parsed = schema.safeParse(body);
  if (!parsed.success) {
    throw new HttpError(400, "validation_failed", "Ungültige Eingaben", parsed.error.issues.map((i) => ({ field: String(i.path[0] ?? ""), message: i.message })));
  }
  const d = parsed.data;
  const allowed = (env.DE_CONSENT_VERSIONS ?? "").split("|").map((s) => s.trim()).filter(Boolean);
  if (!allowed.includes(d.consentVersion)) {
    throw new HttpError(400, "consent_version_unknown", "Einwilligungsversion unbekannt", [{ field: "consent", message: "version" }]);
  }

  const token = randomToken();
  const id = ulid();
  const pending = {
    id,
    name: d.name, company: d.company ?? null, email: d.email, phone: d.phone ?? null, message: d.message,
    consentVersion: d.consentVersion,
    consentAt: new Date().toISOString(),               // rıza zamanı (Art. 7 Abs. 1 DSGVO ispat yükü); IP SAKLANMAZ (veri minimizasyonu)
  };
  await env.CACHE.put(`optin:${await sha256Hex(token)}`, JSON.stringify(pending), { expirationTtl: OPTIN_TTL_S });

  // TODO E5: mail sağlayıcı (ERTELENEN E5) bu kuyruğu tüketir → "de_optin" şablonu, link = {SITE}/de/anfrage/bestaetigen#t={token};
  // gönderim sonrası girdi silinir. Şimdilik GERÇEK MAIL YOK — yalnız kuyruğa yazılır (TTL = opt-in süresi).
  await env.CACHE.put(`mailq:${id}`, JSON.stringify({ template: "de_optin", to: d.email, token, locale: "de" }), { expirationTtl: OPTIN_TTL_S });

  return json({ status: "pending_confirmation" }, 202);
}

export async function handleDeOptinConfirm(req: Request, env: Env): Promise<Response> {
  const ip = clientIp(req);
  await rateLimit(env.CACHE, "de-optin", ip, intVar(env.RL_APPLY_PER_MIN, 5));
  const parsed = tokenSchema.safeParse(await readJson(req));
  if (!parsed.success) throw new HttpError(400, "invalid_token", "Ungültiger Bestätigungslink");

  const key = `optin:${await sha256Hex(parsed.data.token)}`;
  const raw = await env.CACHE.get(key);
  if (!raw) throw new HttpError(410, "optin_expired", "Bestätigungslink abgelaufen oder bereits verwendet");
  await env.CACHE.delete(key); // tek kullanımlık

  // TODO 5.6→E5/3.3: onaylanan talep → D1 leads (Kanban) yazımı + ekip bildirimi. Şema eşlemesi 🔒 insan review ile yapılır;
  // o zamana dek onaylanan kayıt KV'de kalmaz (bekleyen kayıt silindi) → kişisel veri birikmez.
  return json({ status: "confirmed" });
}
