// FAZ_3 3.8 — channel_pref çözümü (ORTAK LIB). Public UI (ChannelCta) ve admin lead linkleri aynı fonksiyonu kullanır.
// Sıra: lead'in kendi channel_pref'i (geçerliyse) → locale ayarı → fallback. Saf fonksiyon; D1/ağ yok.
import { CHANNELS, DEFAULTS, type ChannelId, type ChannelPrefs, type ContactSettings, type Settings } from "./schema.ts";

export function resolveChannels(
  locale: string,
  prefs: ChannelPrefs = DEFAULTS.channelPrefs,
  leadPref?: string | null,
): ChannelId[] {
  const base = prefs.byLocale[locale.toLowerCase()] ?? prefs.fallback;
  if (leadPref && CHANNELS.includes(leadPref as ChannelId)) {
    return [leadPref as ChannelId, ...base.filter((c) => c !== leadPref)];
  }
  return base;
}

export function primaryChannel(locale: string, prefs?: ChannelPrefs, leadPref?: string | null): ChannelId {
  return resolveChannels(locale, prefs, leadPref)[0];
}

// ───────────── iletişim bilgisi → tek-tık bağlantı (ortak lib) ─────────────
// Yalnız AYARDAKİ değerden üretilir; değer boşsa null (tahmin/uydurma YOK). Aynı fonksiyon public CTA ve admin lead linklerinde kullanılır.

export function channelHref(channel: ChannelId, contacts: ContactSettings): string | null {
  switch (channel) {
    case "whatsapp":
      return contacts.whatsapp ? `https://wa.me/${contacts.whatsapp.replace(/\D/g, "")}` : null;
    case "telegram":
      return contacts.telegram ? `https://t.me/${contacts.telegram}` : null;
    case "email":
      return contacts.email ? `mailto:${contacts.email}` : null;
    case "wechat":
      return null; // WeChat'in evrensel deep-link'i yok: UI kimliği (ID) gösterir, kopyalatır
  }
}

/** Locale için sıralı, ULAŞILABİLİR kanallar: tanımsız (değeri boş) kanal listeden düşer. */
export function reachableChannels(locale: string, s: Pick<Settings, "channelPrefs" | "contacts">, leadPref?: string | null) {
  return resolveChannels(locale, s.channelPrefs, leadPref)
    .map((id) => ({ id, href: channelHref(id, s.contacts), handle: id === "wechat" ? s.contacts.wechat : "" }))
    .filter((c) => c.href !== null || (c.id === "wechat" && c.handle !== ""));
}

/** Public siteye açılacak PROJEKSİYON (ayrı allowlist): yalnız kanal sırası + iletişim; webhooks/rss/uzman-dışı/rate-limit/turnstile ASLA. */
export function publicChannelConfig(s: Settings) {
  return { channelPrefs: s.channelPrefs, contacts: s.contacts, experts: s.experts };
}
