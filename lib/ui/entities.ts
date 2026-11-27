// Corporate legal entities and official contact channels — single source of truth (TR + EN + ZH + DE + 10 Variants).
// Note: VariantShell (/en/xx) smoke test forbids tel:/mailto:/wa.me links and <bdi> tags on LTR variant pages.
export const US_DUNS_NUMBER = "14-977-6743";
export const US_DUNS_RAW = "149776743";
export const SAP_ARIBA_ID = "BNO-100000188010374";
export const SAP_ARIBA_PROFILE_URL =
  "https://portal.us.bn.cloud.ariba.com/dashboard/public/appext/company-profile#/?bnoId=BNO-100000188010374";

export const CORPORATE_ENTITIES = [
  {
    key: "tr" as const,
    name: "BD Sanayi İthalat İhracat Şirketi",
    address: "Cumhuriyet Mahallesi Milli Egemenlik Caddesi No: 74, 64500 Banaz / Uşak, Türkiye",
    duns: undefined,
    aribaId: undefined,
    aribaUrl: undefined,
  },
  {
    key: "us" as const,
    name: "BDIMEXPORT LLC",
    address: "30 N Gould St Ste N, Sheridan, WY 82801, USA",
    duns: US_DUNS_NUMBER,
    aribaId: SAP_ARIBA_ID,
    aribaUrl: SAP_ARIBA_PROFILE_URL,
  },
] as const;

export const OFFICIAL_EMAIL = "info@bdimexport.com";
export const OFFICIAL_EMAIL_HREF = "mailto:info@bdimexport.com";
export const OFFICIAL_PHONE = "+90 539 414 78 54";
export const OFFICIAL_PHONE_HREF = "tel:+905394147854";
export const OFFICIAL_WHATSAPP_WA = "https://wa.me/905394147854";
export const OFFICIAL_YOUTUBE_URL = "https://www.youtube.com/@bdimexport";
