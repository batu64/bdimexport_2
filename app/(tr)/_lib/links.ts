// TR sabit hedefler — chrome (navbar/footer) ve içerik şablonları ortak kullanır (döngüsel import yok).
export const APPLY_PATH = "/ihracat/ucretsiz-destek-basvuru";
export const INTELLIGENCE_PATH = "/ticari-istihbarat";
export const RFQ_PATH = "/rfq";
export const QUOTE_EMAIL = process.env.NEXT_PUBLIC_QUOTE_EMAIL ?? "iletisim@bdimexport.com";
export const quoteHref = RFQ_PATH;
