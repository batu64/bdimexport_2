// FAZ_6 6.5 — VERİ SÖZLEŞMESİ meta-ads.v1: GET /admin/api/analytics/meta?days=1..90 (admin-only, GET-only, no-store).
// 6.2 dashboard'un "Meta reklam harcaması" bloğu bu sözleşmeyi okuyacak (UI bağlama = ayrı app/admin adımı). attribution.v1 DEĞİŞMEZ.
// İLKELER:
//  • SAHTE METRİK YOK: veri yoksa null + data_status. Meta'nın bildirmediği alan null'dır (0 değil). Pasif gün (yayında kampanya yok) = gerçek 0 harcama.
//  • ANONİM: lead tarafı yalnız attribution_leads_v (0006) üzerinden SQL'de GROUP BY SAYIM — satır-satır lead, kimlik, e-posta YOK.
//  • PARA BİRİMİ: reklam hesabının para birimi (USD varsayılmaz). Pencerede birden çok para birimi → tüm para alanları null (toplanmaz).
//  • CAC = harcama / site lead'i (Meta kaynaklı, kampanyaya eşlenmiş). lead 0 → CAC null (sonsuz/0 yazılmaz).
export const META_ADS_CONTRACT = "meta-ads.v1" as const;

/** unknown = durum hiç kaydedilmedi (cron henüz çalışmadı / 0008 uygulanmadı). passive = bağlı, yayında kampanya yok. */
export type MetaIntegration = "unknown" | "unconfigured" | "active" | "passive" | "auth_error" | "error";

export interface MetaTotals {
  spend: number | null;
  impressions: number | null;
  clicks: number | null;
  link_clicks: number | null;
  ctr: number | null; // clicks / impressions
  cpc: number | null; // spend / clicks
  cpm: number | null; // spend / impressions × 1000
  meta_reported_leads: number | null; // Meta'nın bildirdiği (pixel/form) lead aksiyonu
  site_leads: number; // bizim leads tablomuz: Meta kaynaklı + ücretli/kampanyaya eşlenmiş (anonim sayım)
  cac: number | null; // spend / site_leads
}

export interface MetaCampaignRow {
  campaign_id: string;
  name: string;
  objective: string | null;
  days_active: number;
  spend: number | null;
  impressions: number;
  clicks: number;
  link_clicks: number | null;
  ctr: number | null;
  cpc: number | null;
  meta_reported_leads: number | null;
  site_leads: number;
  cac: number | null;
}

export interface MetaDailyRow {
  day: string;
  spend: number | null;
  impressions: number;
  clicks: number;
  campaigns: number;
}

export interface MetaAdsReport {
  contract: typeof META_ADS_CONTRACT;
  generated_at: string;
  period: { from: string; to: string; days: number };
  data_status: {
    integration: MetaIntegration;
    checked_at: string | null;
    last_ok_at: string | null;
    detail: string | null;
    spend_days_with_data: number;
    window_days: number;
    currency: string | null;
    mixed_currency: boolean;
    truncated_days: number; // kampanya sayfa sınırına takılan gün sayısı (kısmi kampanya listesi)
    lead_basis: "attribution_leads_v: utm_source ∈ meta kaynakları ∧ (ücretli utm_medium ∨ utm_campaign eşleşmesi); son tıklama 30 gün";
    campaign_match: "utm_campaign = campaign_id (önerilen: {{campaign.id}}) ∨ küçük harf kampanya adı";
    note: string | null;
  };
  totals: MetaTotals;
  campaigns: MetaCampaignRow[]; // harcama azalan; en çok 50
  /** Meta kaynaklı ama hiçbir kampanyaya eşlenemeyen site lead'leri (ücretli medium; utm_campaign yok/eşleşmiyor). */
  unmatched_site_leads: number;
  /** Meta kaynaklı ama ücretli DEĞİL (organik paylaşım / etiketsiz) — CAC'a girmez, bilgi amaçlı. */
  organic_meta_leads: number;
  daily: MetaDailyRow[]; // yalnız veri olan günler
  /** Dashboard'un küçük CAC bloğu için hazır Türkçe metin (hesaplanmış sayılardan; veri yoksa durumu söyler). */
  cac_text: string;
}

export interface MetaAdsQuery {
  days?: number;
}
