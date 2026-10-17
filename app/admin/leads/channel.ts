// FAZ_3 3.3 — Tek-tık kanal lib'i (I18N_RULES §2 / Proje.md §5.1 wa.me kalıbı).
// KURAL: kanal YALNIZCA leads.channel_pref'ten gelir; kişi bilgisi yoksa / biçim belirsizse link üretilmez (null).
// Tahmin YOK: başka kanalın bilgisi olsa bile ona düşülmez; yerel numaraya ülke kodu eklenmez.
// Link ham iletişim verisi içerdiğinden yalnız "göster" (reveal, audit'li) yanıtında üretilir — handler.ts.
export type ChannelId = "whatsapp" | "telegram" | "wechat" | "email";

export interface ChannelContact {
  name?: string;
  email?: string;
  whatsapp?: string;
  telegram?: string;
  wechat?: string;
  product?: string;
}

export interface ChannelAction {
  channel: ChannelId;
  /** null = otomatik link yok (WeChat) → UI "ID'yi kopyala" gösterir */
  href: string | null;
  copyValue?: string;
  label: string;
}

const isChannel = (v: unknown): v is ChannelId =>
  v === "whatsapp" || v === "telegram" || v === "wechat" || v === "email";

export function greeting(locale: string, c: ChannelContact): string {
  const name = c.name?.trim() ?? "";
  const product = c.product?.trim() ?? "";
  const s = locale.startsWith("tr")
    ? `Merhaba ${name}, ${product ? product + " " : ""}talebiniz hakkında yazıyoruz.`
    : `Hello ${name}, we are following up on your ${product || "inquiry"}.`;
  return s.replace(/\s{2,}/g, " ");
}

export function buildChannelAction(
  channelPref: string | null | undefined,
  locale: string,
  c: ChannelContact,
): ChannelAction | null {
  if (!isChannel(channelPref)) return null;
  const text = encodeURIComponent(greeting(locale, c));
  switch (channelPref) {
    case "whatsapp": {
      // Proje.md §5.1: https://wa.me/{number}?text=… — {number} uluslararası biçim, yalnız rakam (E.164: 8–15 hane).
      // "0555…" gibi yerel numara → ülke kodu tahmin edilmez → link yok.
      const num = (c.whatsapp ?? "").trim().replace(/[\s().-]/g, "").replace(/^(\+|00)/, "");
      return /^[1-9]\d{7,14}$/.test(num)
        ? { channel: "whatsapp", href: `https://wa.me/${num}?text=${text}`, label: "WhatsApp" }
        : null;
    }
    case "telegram": {
      const u = (c.telegram ?? "").replace(/^@/, "").trim();
      return /^[A-Za-z0-9_]{5,32}$/.test(u)
        ? { channel: "telegram", href: `https://t.me/${u}?text=${text}`, label: "Telegram" }
        : null;
    }
    case "wechat": {
      const id = (c.wechat ?? "").trim();
      return id ? { channel: "wechat", href: null, copyValue: id, label: "WeChat" } : null;
    }
    case "email": {
      const e = (c.email ?? "").trim();
      // Katı biçim: '?', '&', '#' vb. ile mailto parametre enjeksiyonu (cc/bcc) engellenir
      return /^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$/.test(e)
        ? { channel: "email", href: `mailto:${e}?subject=${encodeURIComponent("Bdimexport")}&body=${text}`, label: "E-posta" }
        : null;
    }
  }
}
