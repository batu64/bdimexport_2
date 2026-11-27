// Locale-aware WhatsApp vs. Email channel prioritization & resilient email delivery helper.
// Eliminates silent `mailto:` dead clicks by providing 1-click Gmail Web, Outlook Web,
// clipboard auto-copy, and instant WhatsApp fallback across all markets.

export type ChannelPriority = "whatsapp" | "email" | "wechat";

const EMAIL_FIRST_LOCALES = new Set(["de", "de-de", "de-at", "de-ch", "en-us", "us", "nl", "fi", "pl", "fr"]);
const WECHAT_FIRST_LOCALES = new Set(["zh", "zh-cn", "zh-hans"]);

/**
 * Determines primary B2B contact channel priority by country / locale:
 * - WhatsApp Primary: TR, AR (MENA), ES, IT, RO, SQ, RU, Global EN (Africa/MENA/Emerging)
 * - Email / Formal Proforma Primary: DE (DACH), EN-US (USA), NL, FI, PL, EU FR
 * - WeChat + Email Primary: ZH (China)
 */
export function resolveChannelPriority(locale: string, override?: ChannelPriority): ChannelPriority {
  if (override) return override;
  const norm = (locale || "en").trim().toLowerCase();
  if (WECHAT_FIRST_LOCALES.has(norm)) return "wechat";
  if (EMAIL_FIRST_LOCALES.has(norm)) return "email";
  return "whatsapp";
}

export function buildEmailLinks({
  to,
  subject,
  body,
}: {
  to: string;
  subject: string;
  body: string;
}): { mailto: string; gmail: string; outlook: string } {
  const encSub = encodeURIComponent(subject);
  const encBody = encodeURIComponent(body);
  const encTo = encodeURIComponent(to);
  return {
    mailto: `mailto:${to}?subject=${encSub}&body=${encBody}`,
    gmail: `https://mail.google.com/mail/?view=cm&fs=1&to=${encTo}&su=${encSub}&body=${encBody}`,
    outlook: `https://outlook.live.com/mail/0/deeplink/compose?to=${encTo}&subject=${encSub}&body=${encBody}`,
  };
}

export function triggerMailtoLink(mailtoHref: string): void {
  if (typeof document === "undefined") return;
  const a = document.createElement("a");
  a.href = mailtoHref;
  a.style.display = "none";
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
}

export type EmailDeliveryCopy = {
  panelTitle: string;
  copiedNotice: string;
  gmailBtn: string;
  outlookBtn: string;
  copyAddrBtn: string;
  copiedAddrBtn: string;
  whatsappFallbackBtn: string;
  clickToCopyHint: string;
  priorityWhatsAppHint: string;
  priorityEmailHint: string;
  priorityWechatHint: string;
};

export function getEmailDeliveryCopy(locale: string): EmailDeliveryCopy {
  const norm = (locale || "en").trim().toLowerCase();
  if (norm === "tr" || norm === "tr-tr") {
    return {
      panelTitle: "E-posta gönderim seçenekleri hazır",
      copiedNotice: "Talep özetiniz panoya kopyalandı. Mail uygulamanız otomatik açılmadıysa tek tıkla aşağıdan gönderin:",
      gmailBtn: "Gmail Web ile Gönder",
      outlookBtn: "Outlook Web ile Gönder",
      copyAddrBtn: "info@bdimexport.com Kopyala",
      copiedAddrBtn: "Adres Kopyalandı ✓",
      whatsappFallbackBtn: "WhatsApp'tan Anında Gönder",
      clickToCopyHint: "Kopyalamak için özet kutusuna tıklayın",
      priorityWhatsAppHint: "Türkiye için en hızlı kanal: WhatsApp (ort. <15 dk yanıt) · Kurumsal yazılı teklif: E-posta / Gmail Web",
      priorityEmailHint: "Kurumsal yazılı teklif (24s): E-posta / Gmail Web · Acil hat: WhatsApp",
      priorityWechatHint: "WeChat veya kurumsal e-posta ile 24 saatte dönüş",
    };
  }
  if (norm.startsWith("de")) {
    return {
      panelTitle: "E-Mail-Versandoptionen bereit",
      copiedNotice: "Ihre Anfrage wurde in die Zwischenablage kopiert. Falls sich kein Mail-Programm öffnet, nutzen Sie einen Klick:",
      gmailBtn: "Mit Gmail Web senden",
      outlookBtn: "Mit Outlook Web senden",
      copyAddrBtn: "info@bdimexport.com kopieren",
      copiedAddrBtn: "Adresse kopiert ✓",
      whatsappFallbackBtn: "Direkt per WhatsApp senden",
      clickToCopyHint: "Zum Kopieren auf die Zusammenfassung klicken",
      priorityWhatsAppHint: "Schnellster Direktkanal: WhatsApp · Schriftliches Angebot: E-Mail / Gmail",
      priorityEmailHint: "Empfohlen für DACH-Einkauf: Schriftliche Anfrage per E-Mail / Gmail (24h) · Schnelldesk: WhatsApp",
      priorityWechatHint: "WeChat & E-Mail innerhalb von 24h",
    };
  }
  if (norm.startsWith("ar")) {
    return {
      panelTitle: "خيارات إرسال البريد الإلكتروني جاهزة",
      copiedNotice: "تم نسخ ملخص الطلب تلقائياً. إذا لم يفتح تطبيق البريد لديك، أرسله بنقرة واحدة عبر:",
      gmailBtn: "إرسال عبر Gmail Web",
      outlookBtn: "إرسال عبر Outlook Web",
      copyAddrBtn: "نسخ info@bdimexport.com",
      copiedAddrBtn: "تم نسخ البريد ✓",
      whatsappFallbackBtn: "إرسال فوري عبر واتساب",
      clickToCopyHint: "انقر على الملخص للنسخ الفوري",
      priorityWhatsAppHint: "الأسرع في الشرق الأوسط وشمال أفريقيا: واتساب المباشر (رد فوري) · عرض رسمي: البريد / Gmail",
      priorityEmailHint: "العرض الرسمي عبر البريد / Gmail (خلال 24 ساعة) · الخط السريع: واتساب",
      priorityWechatHint: "WeChat والبريد الإلكتروني خلال 24 ساعة",
    };
  }
  if (norm.startsWith("fr")) {
    return {
      panelTitle: "Options d'envoi par e-mail prêtes",
      copiedNotice: "Votre demande a été copiée dans le presse-papiers. Si votre messagerie ne s'ouvre pas, envoyez en un clic :",
      gmailBtn: "Envoyer via Gmail Web",
      outlookBtn: "Envoyer via Outlook Web",
      copyAddrBtn: "Copier info@bdimexport.com",
      copiedAddrBtn: "E-mail copié ✓",
      whatsappFallbackBtn: "Envoyer sur WhatsApp",
      clickToCopyHint: "Cliquez sur le résumé pour copier",
      priorityWhatsAppHint: "Canal le plus rapide (Afrique / Export) : WhatsApp direct · Proforma écrite : E-mail / Gmail",
      priorityEmailHint: "Recommandé pour achats Europe : E-mail / Gmail Proforma (24h) · Ligne rapide : WhatsApp",
      priorityWechatHint: "WeChat & E-mail sous 24h",
    };
  }
  if (norm.startsWith("zh")) {
    return {
      panelTitle: "邮件发送方式已就绪",
      copiedNotice: "您的需求摘要已自动复制。如未弹出本地邮箱客户端，请点击下方一键发送：",
      gmailBtn: "通过 Gmail 网页版发送",
      outlookBtn: "通过 Outlook 网页版发送",
      copyAddrBtn: "复制 info@bdimexport.com",
      copiedAddrBtn: "邮箱已复制 ✓",
      whatsappFallbackBtn: "通过 WhatsApp 发送",
      clickToCopyHint: "点击摘要即可复制",
      priorityWhatsAppHint: "快速通道：WhatsApp · 正式书面报价：企业邮箱",
      priorityEmailHint: "正式书面报价：企业邮箱 / Gmail（24小时回复）· 即时通道：WhatsApp",
      priorityWechatHint: "中国客户优先：微信 / 企业邮箱（24小时书面回复）· 国际直连：WhatsApp",
    };
  }
  if (norm === "en-us" || norm === "us") {
    return {
      panelTitle: "Email delivery options ready",
      copiedNotice: "Your RFQ brief has been copied to clipboard. If your desktop email app did not open, send in one click:",
      gmailBtn: "Send via Gmail Web",
      outlookBtn: "Send via Outlook Web",
      copyAddrBtn: "Copy info@bdimexport.com",
      copiedAddrBtn: "Email Copied ✓",
      whatsappFallbackBtn: "Send via WhatsApp Desk",
      clickToCopyHint: "Click brief box to copy",
      priorityWhatsAppHint: "Fastest Direct Line: WhatsApp · Formal Proforma: Email / Gmail Web (24h)",
      priorityEmailHint: "Preferred for US & Enterprise Procurement: Formal Email / Gmail Proforma (24h SLA) · Urgent Desk: WhatsApp",
      priorityWechatHint: "WeChat & Formal Email within 24h",
    };
  }
  return {
    panelTitle: "Email delivery options ready",
    copiedNotice: "Your RFQ summary has been copied to clipboard. If your desktop email app did not open, send in one click:",
    gmailBtn: "Send via Gmail Web",
    outlookBtn: "Send via Outlook Web",
    copyAddrBtn: "Copy info@bdimexport.com",
    copiedAddrBtn: "Email Copied ✓",
    whatsappFallbackBtn: "Send Instantly via WhatsApp",
    clickToCopyHint: "Click summary to copy",
    priorityWhatsAppHint: "Fastest Global Direct Desk: WhatsApp (<15 min reply) · Written Proforma: Email / Gmail Web",
    priorityEmailHint: "Preferred for EU / Corporate Procurement: Email / Gmail Proforma (24h) · Fast Desk: WhatsApp",
    priorityWechatHint: "WeChat & Email within 24h",
  };
}
