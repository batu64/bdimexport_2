// FAZ_3 3.8 — Ayarlar şeması + doğrulama (saf TS, bağımlılık yok; node --experimental-strip-types ile test edilir).
// Kural: secret burada TUTULMAZ. Turnstile secret = Workers secret (TURNSTILE_SECRET); ayarlarda yalnız site-key.

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

export interface Settings {
  channelPrefs: ChannelPrefs;
  turnstile: TurnstileSettings;
  rateLimits: RateLimitSettings;
}

export const SETTING_KEYS = ["channelPrefs", "turnstile", "rateLimits"] as const;
export type SettingKey = (typeof SETTING_KEYS)[number];

export const DEFAULTS: Settings = {
  channelPrefs: { byLocale: {}, fallback: ["email", "whatsapp"] },
  turnstile: { siteKey: "", enabled: false },
  rateLimits: { formPerMin: 10, apiPerMin: 60, adminPerMin: 120 },
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

function channelList(v: unknown, field: string): ChannelId[] {
  if (!Array.isArray(v) || v.length === 0 || v.length > CHANNELS.length) throw new ValidationError(field, "1-4 kanal bekleniyor");
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
  // Secret'ın yanlışlıkla bu yola girmesini kapıda kes
  if (Object.keys(v).some((k) => /secret|private/i.test(k))) {
    throw new ValidationError("turnstile", "secret ayarlara yazılamaz — Workers secret kullanın");
  }
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

export const VALIDATORS = {
  channelPrefs: validateChannelPrefs,
  turnstile: validateTurnstile,
  rateLimits: validateRateLimits,
} as const;
