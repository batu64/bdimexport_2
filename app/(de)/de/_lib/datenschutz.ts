// /de Angebotsanfrage — DSGVO veri kategorileri TEK KAYNAĞI (FAZ_5 5.6). 🔒 5.1 Datenschutzerklärung bu listeyi BİREBİR beyan eder;
// form alanları ve workers/api/src/optin.ts şeması (name/company/email/phone/message/consent) bununla eşleşir. Alan eklenirse üçü birlikte değişir.
// Rıza metni (de.json anfrage.consent) TASLAKTIR → sürüm "de-v0-entwurf"; hukuk imzası (5.1/5.10) sonrası sürüm yükseltilir ve
// workers/api DE_CONSENT_VERSIONS'a yazılır (staging/prod şu an tanımsız → sunucu fail-closed).
export const DE_CONSENT_VERSION = "de-v0-entwurf";

/** Sıra = formdaki sıra; required = form + sunucu zorunluluğu */
export const DE_DATA_CATEGORIES = [
  { key: "name", required: true },
  { key: "company", required: false },
  { key: "email", required: true },
  { key: "phone", required: false },
  { key: "message", required: true },
  { key: "consent", required: true },
] as const;

/**
 * Form yayın kapısı: API + Turnstile yapılandırılmış VE açıkça etkinleştirilmiş olmalı. Etkinleştirme ön koşulu (👤):
 * 5.1 Datenschutzerklärung yayında + rıza metni hukuk onaylı + E5 mail sağlayıcısı bağlı. Kapalıyken e-posta yolu gösterilir.
 */
export const DE_FORM_ENABLED =
  process.env.NEXT_PUBLIC_DE_FORM_ENABLED === "1" && (process.env.NEXT_PUBLIC_API_BASE ?? "") !== "" && (process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY ?? "") !== "";
