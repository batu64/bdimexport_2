// TR sabit hedefler — chrome (navbar/footer) ve içerik şablonları ortak kullanır (döngüsel import yok).
import { OFFICIAL_EMAIL, OFFICIAL_WHATSAPP_WA } from "@/lib/ui/entities";

export const APPLY_PATH = "/ihracat/ucretsiz-destek-basvuru";
export const INTELLIGENCE_PATH = "/ticari-istihbarat";
export const RFQ_PATH = "/rfq";
export const QUOTE_EMAIL = process.env.NEXT_PUBLIC_QUOTE_EMAIL ?? OFFICIAL_EMAIL;
export const WHATSAPP_HREF = OFFICIAL_WHATSAPP_WA;
export const quoteHref = RFQ_PATH;
