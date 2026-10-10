// FAZ_3 3.8 — channel_pref çözümü (ORTAK LIB). Public UI (ChannelCta) ve admin lead linkleri aynı fonksiyonu kullanır.
// Sıra: lead'in kendi channel_pref'i (geçerliyse) → locale ayarı → fallback. Saf fonksiyon; D1/ağ yok.
import { CHANNELS, DEFAULTS, type ChannelId, type ChannelPrefs } from "./schema";

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
