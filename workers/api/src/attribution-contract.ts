// FAZ_6 6.1 — VERİ SÖZLEŞMESİ: `GET /admin/api/analytics/attribution` yanıtı (6.2 dashboard'un OKUYACAĞI alan adları). SALT TİP — çalışma zamanı kodu YOK
// (admin UI `import type` ile alabilir). Alan adları 6.2 başladığında DEĞİŞTİRİLMEZ; ek alan = geriye uyumlu, kaldırma/yeniden adlandırma = contract "attribution.v2".
//
// KURALLAR (bu sözleşmenin parçası):
//  • ANONİM: yanıtta kullanıcı kimliği/lead kimliği/e-posta/telefon/ad/mesaj YOK; yalnız sayfa/locale/utm/ürün-slug AGREGATLARI. Satır-satır lead yok.
//  • UYDURMA YOK: bilinmeyen = null (0 DEĞİL). null → UI "veri bekleniyor" gösterir. Oran = payda null/0 ise null.
//  • Model: SON TIKLAMA, pencere 30 gün (`attribution_window_days`). source_page boş → "direct".
//  • Kapsam notu: GA4 sayfa trafiği cron'da günlük EN ÇOK 20 sayfadır (3.7) → trafik sayıları "top-20 kapsamlı"dır (`data_status.traffic_basis`).

export const ATTRIBUTION_CONTRACT = "attribution.v1" as const;

export type FunnelStageId = "sessions" | "form_start" | "submit";

/** Sayfa satırı — `pages[]` (rank = submits azalan, sonra sessions azalan, sonra page artan). */
export interface AttributionPageRow {
  rank: number;
  /** Normalize edilmiş yol: "/en/products/olive-oil" (host/sorgu/hash/sondaki "/" atılmış). */
  page: string;
  /** Sayfa yolundan türetilen locale: tr | en | de | zh | en-ru | en-fr | en-nl | en-es | en-ar. */
  locale: string;
  /** Ürün sayfasıysa slug ("/en/products/{slug}"), değilse null. */
  product_slug: string | null;
  /** GA4 oturumları (dönem toplamı). null = bu sayfa için dönemde hiç trafik satırı yok (BİLİNMİYOR). */
  sessions: number | null;
  /** GSC organik tıklama/gösterim (dönem toplamı). null = bilinmiyor. */
  gsc_clicks: number | null;
  gsc_impressions: number | null;
  /** "Form başladı" (GA4 olayı). null = olay henüz bağlı değil / veri yok. */
  form_starts: number | null;
  /** Bu sayfaya ATIFLI lead sayısı (30 gün son-tıklama penceresi içinde). Her zaman sayı (0 olabilir — lead tablosu tam sayılır). */
  submits: number;
  /** submits / sessions. */
  session_to_submit_rate: number | null;
  /** form_starts / sessions. */
  session_to_start_rate: number | null;
  /** submits / form_starts. */
  start_to_submit_rate: number | null;
  /** Dönemde trafik satırı olan gün sayısı (kapsam göstergesi). */
  days_with_traffic: number;
}

export interface AttributionSourceRow {
  /** utm_source (normalize, küçük harf) ya da "(none)"; fazla çeşit "(other)" altında toplanır. */
  source: string;
  medium: string;
  leads: number;
  /** leads / totals.leads_in_period (0–1). */
  share: number;
}

export interface AttributionDailyRow {
  day: string; // YYYY-MM-DD (UTC)
  /** analytics_daily üst düzey GA4 oturumu (top-20 toplamı). null = o gün için cron satırı yok. */
  sessions: number | null;
  gsc_clicks: number | null;
  gsc_impressions: number | null;
  /** O gün oluşan toplam lead (anonim sayı; sayfa kırılımı YOK). */
  leads: number;
}

export interface AttributionLocaleRow {
  locale: string;
  leads: number; // lead.locale'e göre
  sessions: number | null; // sayfa yolu locale'ine göre; veri yoksa null
}

export interface AttributionReport {
  contract: typeof ATTRIBUTION_CONTRACT;
  generated_at: string; // ISO
  period: { from: string; to: string; days: number; attribution_window_days: 30; model: "last_click" };
  /** UI'nın "veri bekleniyor" kararını vereceği tek yer. */
  data_status: {
    /** none = dönemde hiç trafik satırı yok · partial = bazı günler eksik · ok = her gün satır var */
    traffic: "none" | "partial" | "ok";
    analytics_days_with_data: number;
    search_data: boolean;
    /** GA4 form_start olayı bağlı mı (formStarts satırı var mı) */
    form_start_tracking: boolean;
    traffic_basis: "ga4_top20_pages_per_day";
    leads_truncated: boolean;
    /** pages[] 200 satırla sınırlı; daha fazlası varsa true. */
    pages_truncated: boolean;
    /** Okunur Türkçe not (UI altyazısı): neden null olduğu. */
    note: string | null;
  };
  totals: {
    leads_in_period: number;
    attributed: number; // sayfaya atfedilen
    direct: number; // direct_no_source + direct_window_expired + direct_invalid_touch
    direct_no_source: number; // source_page boş
    direct_window_expired: number; // dokunuş 30 günden eski → atfedilmez
    direct_invalid_touch: number; // touch_at bozuk/gelecek tarihli → atfedilmez
    sessions: number | null;
    gsc_clicks: number | null;
    gsc_impressions: number | null;
    form_starts: number | null;
  };
  /** Genel huni (tüm sayfalar): sessions → form_start → submit. value null = veri yok. */
  funnel: { stages: { id: FunnelStageId; label: string; value: number | null }[] };
  pages: AttributionPageRow[];
  /** "En iyi dönüşen içerik": sessions ≥ min_sessions olan sayfalar, session_to_submit_rate azalan (en çok 10). */
  top_converting: AttributionPageRow[];
  min_sessions: number;
  sources: AttributionSourceRow[]; // lead kaynağı dağılımı (utm) — en çok 10 + "(other)"
  products: { product_slug: string; leads: number }[];
  by_locale: AttributionLocaleRow[];
  daily: AttributionDailyRow[]; // dönemdeki HER gün (veri yoksa sessions/gsc null, leads 0)
}

/** İstek parametreleri (hepsi opsiyonel; sınır dışı → 400). */
export interface AttributionQuery {
  days?: number; // 1–90, varsayılan 30
  locale?: string; // locale filtresi (lead.locale ve sayfa yolu locale'i)
  min_sessions?: number; // top_converting eşiği, varsayılan 100
}
