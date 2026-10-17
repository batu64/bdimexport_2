// FAZ_3 3.8 — Ayarlar şeması + doğrulama (saf TS, bağımlılık yok; node --experimental-strip-types ile test edilir).
// Kural: secret burada TUTULMAZ. Turnstile secret = Workers secret (TURNSTILE_SECRET); ayarlarda yalnız site-key.
// Genel secret reddi (assertNoSecrets): HER ayar anahtarında, her derinlikte, alan adı + değer biçimi taranır.

export const CHANNELS = ["whatsapp", "telegram", "wechat", "email"] as const;
export type ChannelId = (typeof CHANNELS)[number];

export interface ChannelPrefs {
  /** locale (tr/en/de/zh/ru/...) → sıralı kanal listesi, [0] birincil */
  byLocale: Record<string, ChannelId[]>;
  /** locale eşleşmezse */
  fallback: ChannelId[];
}

export interface TurnstileSettings {
  siteKey: string;
  enabled: boolean;
}

export interface RateLimitSettings {
  /** public form uçları: istek/dk/IP */
  formPerMin: number;
  /** public API varsayılanı: istek/dk/anahtar */
  apiPerMin: number;
  /** admin API: istek/dk/kullanıcı */
  adminPerMin: number;
}

/** Herkese açık iletişim bilgileri (sitede zaten görünür) — secret DEĞİL. Boş = tanımsız (uydurma değer YOK). */
export interface ContactSettings {
  /** E.164, örn. +905xxxxxxxxx */
  whatsapp: string;
  /** kullanıcı adı (@ olmadan) */
  telegram: string;
  wechat: string;
  email: string;
}

/** Bölge uzmanı profili: isim + locale + (https veya /media/ altı) foto. */
export interface ExpertProfile {
  id: string;
  name: string;
  locale: string;
  photoUrl: string;
}

export const WEBHOOK_EVENTS = ["lead_new", "partner_application", "analytics_error", "content_draft"] as const;
export type WebhookEvent = (typeof WEBHOOK_EVENTS)[number];

/** Webhook hedefi: URL'ler secret içerir (Slack/Discord) → panelde TUTULMAZ; yalnız Workers secret'ının ADI (envVar) saklanır. */
export interface WebhookTarget {
  id: string;
  name: string;
  /** Workers secret adı, örn. ANALYTICS_ALERT_WEBHOOK_URL — değer panele hiç girmez */
  envVar: string;
  events: WebhookEvent[];
}

/** RSS kaynağı (3.6 Input B ile ORTAK depolama: settings anahtarı `rssSources`; FAZ 4.1 cron bunu okur). */
export interface RssSource {
  id: string;
  name: string;
  url: string;
  enabled: boolean;
}

export interface Settings {
  channelPrefs: ChannelPrefs;
  turnstile: TurnstileSettings;
  rateLimits: RateLimitSettings;
  contacts: ContactSettings;
  experts: ExpertProfile[];
  webhooks: WebhookTarget[];
  rssSources: RssSource[];
}

export const SETTING_KEYS = ["channelPrefs", "turnstile", "rateLimits", "contacts", "experts", "webhooks", "rssSources"] as const;
export type SettingKey = (typeof SETTING_KEYS)[number];

export const DEFAULTS: Settings = {
  channelPrefs: { byLocale: {}, fallback: ["email", "whatsapp"] },
  turnstile: { siteKey: "", enabled: false },
  rateLimits: { formPerMin: 10, apiPerMin: 60, adminPerMin: 120 },
  contacts: { whatsapp: "", telegram: "", wechat: "", email: "" },
  experts: [],
  webhooks: [],
  rssSources: [],
};

export class ValidationError extends Error {
  field: string;
  constructor(field: string, msg: string) {
    super(`${field}: ${msg}`);
    this.field = field;
  }
}

const LOCALE_RE = /^[a-z]{2}(-[a-z]{2,4})?$/;
// Turnstile site-key: "0x4AAAA…" (üretim) veya "1x0000…AA" (test anahtarları)
const SITEKEY_RE = /^[0-9]x[0-9A-Za-z_-]{16,64}$/;

function isObj(v: unknown): v is Record<string, unknown> {
  return !!v && typeof v === "object" && !Array.isArray(v);
}

// ───────────── SECRET REDDİ (genel) ─────────────
// Kural: ayar tablosuna secret YAZILAMAZ (Workers secret = `wrangler secret put`). Alan ADI ve DEĞER biçimi taranır.
// NOT: Turnstile secret ile site-key aynı biçimde (0x4AAAA…) → biçimden ayırt edilemez; orada yalnız alan adı kuralı geçerlidir.
const SECRET_KEY_RE = /secret|private|passw|token|api[_-]?key|credential|authorization|bearer|signing|webhook_?url/i;
const SECRET_VALUE_RES: RegExp[] = [
  /-----BEGIN [A-Z ]*PRIVATE KEY-----/,
  /\beyJ[A-Za-z0-9_-]{8,}\.[A-Za-z0-9_-]{8,}\.[A-Za-z0-9_-]{8,}/, // JWT
  /\b(AKIA|ASIA)[0-9A-Z]{16}\b/, // AWS
  /\bAIza[0-9A-Za-z_-]{35}\b/, // Google API key
  /\bya29\.[0-9A-Za-z_-]{20,}/, // Google OAuth access token
  /\b(sk|rk|pk)_(live|test)_[0-9A-Za-z]{16,}/, // Stripe tarzı
  /\bgh[pousr]_[0-9A-Za-z]{30,}/, // GitHub
  /\bxox[abprs]-[0-9A-Za-z-]{10,}/, // Slack token
  /\bEAA[0-9A-Za-z]{40,}/, // Meta
  /hooks\.slack\.com\/services\//i,
  /discord(app)?\.com\/api\/webhooks\//i,
  /\b[0-9a-f]{40,}\b/i, // uzun hex (anahtar/hash benzeri)
];

/** Her derinlikte: yasak alan adı veya secret biçimli değer → ValidationError (kayıt YAZILMAZ). */
export function assertNoSecrets(v: unknown, field = "value", depth = 0): void {
  if (depth > 6) throw new ValidationError(field, "çok derin nesne");
  if (typeof v === "string") {
    if (SECRET_VALUE_RES.some((re) => re.test(v))) throw new ValidationError(field, "secret biçimli değer ayarlara yazılamaz — Workers secret kullanın");
    return;
  }
  if (Array.isArray(v)) {
    v.forEach((x, i) => assertNoSecrets(x, `${field}[${i}]`, depth + 1));
    return;
  }
  if (isObj(v)) {
    for (const [k, x] of Object.entries(v)) {
      if (SECRET_KEY_RE.test(k)) throw new ValidationError(`${field}.${k}`, "secret ayarlara yazılamaz — Workers secret kullanın (wrangler secret put)");
      assertNoSecrets(x, `${field}.${k}`, depth + 1);
    }
  }
}

// ───────────── ortak doğrulayıcılar ─────────────
const ID_RE = /^[a-z0-9][a-z0-9-]{1,39}$/;
const NAME_RE = /^[^<>{}\u0000-\u001f]{2,80}$/u; // HTML/şablon/kontrol karakteri yok

function str(v: unknown, field: string, re: RegExp, msg: string): string {
  if (typeof v !== "string" || !re.test(v.trim())) throw new ValidationError(field, msg);
  return v.trim();
}

function arr(v: unknown, field: string, max: number): unknown[] {
  if (!Array.isArray(v) || v.length > max) throw new ValidationError(field, `en fazla ${max} öğelik dizi gerekli`);
  return v;
}

function uniqueIds(items: { id: string }[], field: string) {
  if (new Set(items.map((i) => i.id)).size !== items.length) throw new ValidationError(field, "tekrar eden id");
}

/** SSRF/credential korumalı genel https URL: kimlik bilgisi, IP literal, localhost/iç alan adı, özel port YOK. */
export function publicHttpsUrl(v: unknown, field: string, opts: { noSecretQuery?: boolean } = {}): string {
  if (typeof v !== "string" || v.length > 500) throw new ValidationError(field, "geçerli https URL gerekli");
  let u: URL;
  try {
    u = new URL(v.trim());
  } catch {
    throw new ValidationError(field, "geçerli https URL gerekli");
  }
  if (u.protocol !== "https:") throw new ValidationError(field, "yalnız https");
  if (u.username || u.password) throw new ValidationError(field, "URL içinde kimlik bilgisi olamaz");
  if (u.port && u.port !== "443") throw new ValidationError(field, "özel port yasak");
  const h = u.hostname.toLowerCase();
  if (!h.includes(".") || h.startsWith("[") || /^[0-9.]+$/.test(h) || /(^|\.)(localhost|local|internal|lan|home|corp|test|invalid)$/.test(h)) {
    throw new ValidationError(field, "genel bir alan adı gerekli (IP/iç adres yasak)");
  }
  if (opts.noSecretQuery) {
    for (const k of u.searchParams.keys()) {
      if (SECRET_KEY_RE.test(k) || /^(key|sig|auth)$/i.test(k)) throw new ValidationError(field, "URL sorgusunda anahtar/secret olamaz");
    }
  }
  return u.toString();
}

const BAD_CHANNELS = "1-4 kanal bekleniyor";
function channelList(v: unknown, field: string): ChannelId[] {
  if (!Array.isArray(v) || v.length === 0 || v.length > CHANNELS.length) throw new ValidationError(field, BAD_CHANNELS);
  const out: ChannelId[] = [];
  for (const c of v) {
    if (!CHANNELS.includes(c as ChannelId)) throw new ValidationError(field, `bilinmeyen kanal: ${String(c)}`);
    if (out.includes(c as ChannelId)) throw new ValidationError(field, `tekrar eden kanal: ${String(c)}`);
    out.push(c as ChannelId);
  }
  return out;
}

export function validateChannelPrefs(v: unknown): ChannelPrefs {
  if (!isObj(v) || !isObj(v.byLocale)) throw new ValidationError("channelPrefs", "byLocale nesnesi gerekli");
  const byLocale: Record<string, ChannelId[]> = {};
  for (const [loc, list] of Object.entries(v.byLocale)) {
    if (!LOCALE_RE.test(loc)) throw new ValidationError("channelPrefs.byLocale", `geçersiz locale: ${loc}`);
    byLocale[loc] = channelList(list, `channelPrefs.byLocale.${loc}`);
  }
  return { byLocale, fallback: channelList(v.fallback, "channelPrefs.fallback") };
}

export function validateTurnstile(v: unknown): TurnstileSettings {
  if (!isObj(v)) throw new ValidationError("turnstile", "nesne gerekli");
  assertNoSecrets({ ...v, siteKey: undefined }, "turnstile"); // alan adı taraması; siteKey değeri secret biçimiyle aynı olduğundan hariç
  if (typeof v.enabled !== "boolean") throw new ValidationError("turnstile.enabled", "boolean gerekli");
  const siteKey = typeof v.siteKey === "string" ? v.siteKey.trim() : "";
  if (v.enabled && !SITEKEY_RE.test(siteKey)) throw new ValidationError("turnstile.siteKey", "geçerli site-key gerekli (etkinse)");
  if (siteKey && !SITEKEY_RE.test(siteKey)) throw new ValidationError("turnstile.siteKey", "biçim geçersiz");
  return { siteKey, enabled: v.enabled };
}

const LIMITS: Record<keyof RateLimitSettings, [number, number]> = {
  formPerMin: [1, 120],
  apiPerMin: [1, 6000],
  adminPerMin: [10, 1200],
};

export function validateRateLimits(v: unknown): RateLimitSettings {
  if (!isObj(v)) throw new ValidationError("rateLimits", "nesne gerekli");
  const out = {} as RateLimitSettings;
  for (const k of Object.keys(LIMITS) as (keyof RateLimitSettings)[]) {
    const n = v[k];
    const [lo, hi] = LIMITS[k];
    if (typeof n !== "number" || !Number.isInteger(n) || n < lo || n > hi) {
      throw new ValidationError(`rateLimits.${k}`, `${lo}–${hi} arası tamsayı`);
    }
    out[k] = n;
  }
  return out;
}

// ───────────── contacts ─────────────
const WA_RE = /^\+[1-9][0-9]{6,14}$/;
const TG_RE = /^[A-Za-z][A-Za-z0-9_]{4,31}$/;
const WECHAT_RE = /^[A-Za-z][-_A-Za-z0-9]{5,19}$/;
const EMAIL_RE = /^[^\s@<>]{1,64}@[A-Za-z0-9-]+(\.[A-Za-z0-9-]+)+$/;

export function validateContacts(v: unknown): ContactSettings {
  if (!isObj(v)) throw new ValidationError("contacts", "nesne gerekli");
  assertNoSecrets(v, "contacts");
  const opt = (k: keyof ContactSettings, re: RegExp, msg: string) => {
    const raw = typeof v[k] === "string" ? (v[k] as string).trim().replace(/^@/, "") : "";
    return raw ? str(k === "whatsapp" ? (v[k] as string).trim() : raw, `contacts.${k}`, re, msg) : "";
  };
  return {
    whatsapp: opt("whatsapp", WA_RE, "E.164 biçimi (+905…)"),
    telegram: opt("telegram", TG_RE, "5–32 karakter kullanıcı adı"),
    wechat: opt("wechat", WECHAT_RE, "6–20 karakter WeChat ID"),
    email: opt("email", EMAIL_RE, "geçerli e-posta").toLowerCase(),
  };
}

// ───────────── experts ─────────────
export function validateExperts(v: unknown): ExpertProfile[] {
  assertNoSecrets(v, "experts");
  const out = arr(v, "experts", 20).map((e, i) => {
    const f = `experts[${i}]`;
    if (!isObj(e)) throw new ValidationError(f, "nesne gerekli");
    const locale = str(e.locale, `${f}.locale`, LOCALE_RE, "geçersiz locale");
    const photo = typeof e.photoUrl === "string" ? e.photoUrl.trim() : "";
    // Foto: yalnız https (genel alan adı) ya da sitenin kendi /media/ yolu; data:/javascript:/protokol-göreli YASAK
    const local = /^\/media\/[A-Za-z0-9_./-]{1,200}$/.test(photo) && !photo.includes("..");
    const photoUrl = !photo ? "" : local ? photo : publicHttpsUrl(photo, `${f}.photoUrl`, { noSecretQuery: true });
    return {
      id: str(e.id, `${f}.id`, ID_RE, "id: küçük harf/rakam/tire"),
      name: str(e.name, `${f}.name`, NAME_RE, "2–80 karakter, HTML yok"),
      locale,
      photoUrl,
    };
  });
  uniqueIds(out, "experts");
  return out;
}

// ───────────── webhooks ─────────────
const ENV_VAR_RE = /^[A-Z][A-Z0-9_]{2,63}$/;
export function validateWebhooks(v: unknown): WebhookTarget[] {
  // Yalnız {id,name,envVar,events}: URL/secret alanı kabul edilmez; değerler de secret biçimi için taranır.
  const out = arr(v, "webhooks", 10).map((w, i) => {
    const f = `webhooks[${i}]`;
    if (!isObj(w)) throw new ValidationError(f, "nesne gerekli");
    for (const k of Object.keys(w)) {
      if (!["id", "name", "envVar", "events"].includes(k)) throw new ValidationError(`${f}.${k}`, "bilinmeyen alan (URL/secret girilemez — Workers secret kullanın)");
    }
    assertNoSecrets({ id: w.id, name: w.name, events: w.events }, f);
    const envVar = str(w.envVar, `${f}.envVar`, ENV_VAR_RE, "Workers secret ADI (BÜYÜK_HARF), URL değil");
    if (!envVar.endsWith("_WEBHOOK_URL")) throw new ValidationError(`${f}.envVar`, "ad *_WEBHOOK_URL ile bitmeli");
    const events = arr(w.events, `${f}.events`, WEBHOOK_EVENTS.length).map((e) => {
      if (!WEBHOOK_EVENTS.includes(e as WebhookEvent)) throw new ValidationError(`${f}.events`, `bilinmeyen olay: ${String(e)}`);
      return e as WebhookEvent;
    });
    if (events.length === 0 || new Set(events).size !== events.length) throw new ValidationError(`${f}.events`, "1+ benzersiz olay");
    return {
      id: str(w.id, `${f}.id`, ID_RE, "id: küçük harf/rakam/tire"),
      name: str(w.name, `${f}.name`, NAME_RE, "2–80 karakter, HTML yok"),
      envVar,
      events,
    };
  });
  uniqueIds(out, "webhooks");
  return out;
}

// ───────────── rssSources ─────────────
export function validateRssSources(v: unknown): RssSource[] {
  assertNoSecrets(v, "rssSources");
  const out = arr(v, "rssSources", 50).map((r, i) => {
    const f = `rssSources[${i}]`;
    if (!isObj(r)) throw new ValidationError(f, "nesne gerekli");
    if (typeof r.enabled !== "boolean") throw new ValidationError(`${f}.enabled`, "boolean gerekli");
    return {
      id: str(r.id, `${f}.id`, ID_RE, "id: küçük harf/rakam/tire"),
      name: str(r.name, `${f}.name`, NAME_RE, "2–80 karakter, HTML yok"),
      url: publicHttpsUrl(r.url, `${f}.url`, { noSecretQuery: true }),
      enabled: r.enabled,
    };
  });
  uniqueIds(out, "rssSources");
  if (new Set(out.map((r) => r.url)).size !== out.length) throw new ValidationError("rssSources", "tekrar eden URL");
  return out;
}

export const VALIDATORS = {
  channelPrefs: validateChannelPrefs,
  turnstile: validateTurnstile,
  rateLimits: validateRateLimits,
  contacts: validateContacts,
  experts: validateExperts,
  webhooks: validateWebhooks,
  rssSources: validateRssSources,
} as const;
