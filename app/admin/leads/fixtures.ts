// DENEME VERİSİ — uydurma kişiler (.example alan adları). Gerçek lead'ler D1'den gelir (3.4 endpoint'i bağlanınca).
import type { Lead } from "./lib";

/** content/tr/legal/kvkk-riza-v1.md SHA-256 (sha256sum ile doğrulandı) */
export const KVKK_V1_SHA256 = "47ac2ef0a5b432649f313be7f04cf5349433c8ccd516f5769ee8dfcec5c74764";
const consent = { version: "v1", sha256: KVKK_V1_SHA256, at: "2026-10-09T10:00:00Z" };

export const DEMO_LEADS: Lead[] = [
  { id: "L-DEMO-001", source_page: "/ihracat/ucretsiz-destek-basvuru", locale: "tr", form_type: "application", channel_pref: "whatsapp",
    payload: { name: "Ayşe Örnek", company: "Örnek Tekstil A.Ş.", email: "ayse@ornek-tekstil.example", whatsapp: "+905550000001", product: "Pamuklu kumaş", catalog_r2_key: "media/tr/katalog/demo-001/katalog.pdf", consent },
    status: "new", partner_id: null, created_at: "2026-10-09 09:12:00" },
  { id: "L-DEMO-002", source_page: "/en/ru/services/sourcing", locale: "en-ru", form_type: "lead", channel_pref: "telegram",
    payload: { name: "Ivan Demo", company: "Demo Trade LLC", email: "ivan@demo-trade.example", telegram: "@ivan_demo", product: "Olive oil", consent },
    status: "contacted", partner_id: null, created_at: "2026-10-05 14:30:00" },
  { id: "L-DEMO-003", source_page: "/en/fr/services/sourcing", locale: "en-fr", form_type: "quotation", channel_pref: "email",
    payload: { name: "Claire Exemple", company: "Exemple SARL", email: "claire@exemple-sarl.example", product: "Ceramic tiles", consent },
    status: "qualified", partner_id: null, created_at: "2025-09-20 08:00:00" },
  { id: "L-DEMO-004", source_page: "/zh/", locale: "zh", form_type: "lead", channel_pref: "wechat",
    payload: { name: "Li Shiyan", company: "Shiyan Demo Co.", wechat: "demo_wx_0001", product: "Marble", consent },
    status: "closed", partner_id: null, created_at: "2026-01-15 11:00:00" },
  { id: "L-DEMO-005", source_page: "/de/", locale: "de", form_type: "lead", channel_pref: "email",
    payload: { name: "Hans Beispiel", email: "hans@beispiel.example", product: "Textil" }, // bilinçli: rıza kaydı YOK → kırmızı rozet
    status: "new", partner_id: null, created_at: "2026-10-09 18:45:00" },
];
