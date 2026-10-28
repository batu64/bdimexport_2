// TR sabit hedefler — chrome (navbar/footer) ve içerik şablonları ortak kullanır (döngüsel import yok).
import dict from "@/lib/messages/tr.json";

export const APPLY_PATH = "/ihracat/ucretsiz-destek-basvuru";
export const QUOTE_EMAIL = process.env.NEXT_PUBLIC_QUOTE_EMAIL ?? "iletisim@bdimexport.com";
export const quoteHref = `mailto:${QUOTE_EMAIL}?subject=${encodeURIComponent(dict.quote.subject)}`;
