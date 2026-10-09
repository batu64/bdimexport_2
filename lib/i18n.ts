// next-intl yapılandırması — 4 route group (tr)(zh)(en)(de)
// x-default: tr (Proje.md §3.1 / SEO_PLAYBOOK §1)
export const locales = ["tr", "zh", "en", "de"] as const;
export type Locale = (typeof locales)[number];

export const localeConfig: Record<
  Locale,
  { label: string; hreflang: string; dir: "ltr" | "rtl"; xDefault?: boolean }
> = {
  tr: { label: "Türkçe", hreflang: "tr", dir: "ltr", xDefault: true },
  en: { label: "English", hreflang: "en", dir: "ltr" },
  de: { label: "Deutsch", hreflang: "de", dir: "ltr" },
  zh: { label: "简体中文", hreflang: "zh-CN", dir: "ltr" },
};

// EN varyantları (FAZ 2): /en/{ru,fr,nl,es,ar} — hreflang: en-XX
export const enVariants = ["ru", "fr", "nl", "es", "ar"] as const;
export type EnVariant = (typeof enVariants)[number];

export const enVariantHreflang: Record<EnVariant, string> = {
  ru: "en-RU",
  fr: "en-FR",
  nl: "en-NL",
  es: "en-ES",
  ar: "en-AR",
};
