// next-intl yapılandırması — 4 ana route group (tr)(zh)(en)(de) + 10 küresel/niş dil varyantı (/en/{xx})
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

// EN varyantları: 10 yerelleştirilmiş alt-hub — içerikler ilgili dilde (<html lang="xx">) yazıldığı için
// geçerli BCP-47 / ISO-639-1 dil etiketleri kullanılır (eski en-AR=Arjantin ve geçersiz en-SQ hataları giderildi).
export const enVariants = ["ru", "fr", "nl", "es", "ar", "fi", "sq", "pl", "ro", "it"] as const;
export type EnVariant = (typeof enVariants)[number];

export const enVariantHreflang: Record<EnVariant, string> = {
  ru: "ru",
  fr: "fr",
  nl: "nl",
  es: "es",
  ar: "ar",
  fi: "fi",
  sq: "sq",
  pl: "pl",
  ro: "ro",
  it: "it",
};
