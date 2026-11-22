// Corporate legal entities and official contact channels — single source of truth (TR + EN + ZH + DE).
// Note: VariantShell (/en/xx) smoke test forbids tel:/mailto:/wa.me links in visible HTML on variant pages.
export const CORPORATE_ENTITIES = [
  {
    key: "tr" as const,
    name: "BD Sanayi İthalat İhracat Şirketi",
    address: "Cumhuriyet Mahallesi Milli Egemenlik Caddesi No: 74, 64500 Banaz / Uşak, Türkiye",
  },
  {
    key: "us" as const,
    name: "BDIMEXPORT LLC",
    address: "30 N Gould St Ste N, Sheridan, WY 82801, USA",
  },
] as const;

export const OFFICIAL_EMAIL = "info@bdimexport.com";
export const OFFICIAL_EMAIL_HREF = "mailto:info@bdimexport.com";
export const OFFICIAL_PHONE = "+90 539 414 78 54";
export const OFFICIAL_PHONE_HREF = "tel:+905394147854";
export const OFFICIAL_WHATSAPP_WA = "https://wa.me/905394147854";
