// FAZ_6 6.3 — VERİ SÖZLEŞMESİ: `GET /admin/api/analytics/keywords` yanıtı (6.2 dashboard'un keyword bölümünün OKUYACAĞI alan adları). SALT TİP.
// attribution.v1'in EKİDİR (ayrı uç, ayrı sözleşme): attribution.v1 alanlarına dokunulmaz. Ek alan = geriye uyumlu; kaldırma/yeniden adlandırma = "keywords.v2".
//
// KURALLAR (bu sözleşmenin parçası):
//  • UYDURMA YOK: GSC sorgu verisi yoksa toplamlar null + data_status.query_data = "none" (UI "veri bekleniyor"). Arama HACMİ alanı YOK — yalnız GSC gösterim/tıklama.
//  • Skor DETERMİNİSTİK (score_version); AI (Gemini, E3) yalnız insight_* alanlarını doldurur — o güne dek null + data_status.insights.
//  • Anonim: sorgular agregat GSC verisidir; e-posta/telefon benzeri sorgular hiç yazılmaz.

export const KEYWORDS_CONTRACT = "keywords.v1" as const;
export const KEYWORD_SCORE_VERSION = "kw-score.v1" as const;

/** near = "yakın fırsat" (4–20. sıra; gösterim var, tıklama az) · snippet = ilk 3'te ama CTR sitenin aynı aralığının yarısından az · top = ilk 3, sağlıklı · long_shot = 20+. */
export type KeywordBand = "near" | "snippet" | "top" | "long_shot";
/** Deterministik karar: mevcut sayfayı güncelle · başlık/açıklama iyileştir · sorguya özel yeni sayfa · izle (iş üretme). */
export type KeywordAction = "update_page" | "improve_snippet" | "new_page" | "monitor";
export type KeywordIntent = "informational" | "commercial" | "transactional";
/** off = AI kapalı (varsayılan) · skipped = bu satır AI'ya gönderilmedi · stub = yer tutucu (E3 öncesi) · ok = gerçek çıktı · unconfigured = anahtar/model yok · quota_paused · error. */
export type KeywordInsightsStatus = "off" | "skipped" | "stub" | "ok" | "unconfigured" | "quota_paused" | "error";

export interface KeywordOpportunityRow {
  rank: number;
  query: string;
  /** Sayfa yolundan (attribution.pageLocale ile aynı kural). */
  locale: string;
  /** Sorguda en çok gösterim alan sayfamız (normalize yol). */
  page: string;
  pages_count: number;
  impressions: number;
  clicks: number;
  /** 0–1 */
  ctr: number;
  /** Gösterim ağırlıklı ortalama pozisyon (1 = en üst). */
  position: number;
  /** Sitenin aynı pozisyon aralığındaki CTR'ı (0–1); kıyas için yeterli veri yoksa null. */
  ref_ctr: number | null;
  /** 0–100 */
  score: number;
  band: KeywordBand;
  action: KeywordAction;
  /** Deterministik gerekçe (karar satırı) — ai_jobs payload'una aynen geçer. */
  reason: string;
  keyword_id: string | null;
  insights: {
    status: KeywordInsightsStatus;
    intent: KeywordIntent | null;
    cluster: string | null;
    suggestion: string | null;
    model: string | null;
  };
}

export interface KeywordReport {
  contract: typeof KEYWORDS_CONTRACT;
  generated_at: string; // ISO
  score_version: typeof KEYWORD_SCORE_VERSION;
  /** Anlık görüntünün penceresi (cron'un hesapladığı); hiç çalışmadıysa null. */
  window: { from: string; to: string; days: number } | null;
  data_status: {
    /** none = pencerede GSC sorgu satırı yok · partial = bazı günler eksik · ok = her gün var (son `window_days` gün, bugünden geriye). */
    query_data: "none" | "partial" | "ok";
    query_days_with_data: number;
    window_days: number;
    /** Son motor çalışması (anlık görüntü yazıldığı an); hiç yoksa null. */
    computed_at: string | null;
    /** computed_at 48 saatten eski (cron çalışmıyor olabilir). */
    stale: boolean;
    /** Satırların baskın AI durumu; satır yoksa null. */
    insights: KeywordInsightsStatus | null;
    query_basis: "gsc_query_page_top_n_per_day";
    note: string | null;
  };
  totals: {
    opportunities: number;
    near: number;
    snippet: number;
    new_page: number;
    /** Fırsat satırlarının GSC toplamı; satır yoksa null (0 değil). */
    impressions: number | null;
    clicks: number | null;
  };
  by_band: { band: KeywordBand; count: number }[];
  by_locale: { locale: string; opportunities: number; near: number; impressions: number }[];
  /** Keyword çıktı takibi: admin/GSC kaynaklı keywords satırları durum sayıları (keywords tablosu — gerçek sayım). */
  pipeline: { queued: number; analyzed: number; job_created: number; done: number };
  items: KeywordOpportunityRow[];
  limit: number;
}

export interface KeywordQuery {
  locale?: string;
  band?: KeywordBand;
  limit?: number;
}
