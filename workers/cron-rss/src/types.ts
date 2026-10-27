// workers/cron-rss — ortak tipler. Secret YOK: bu worker yalnız D1 okur/yazar ve herkese açık RSS adreslerini çeker.
export interface Env {
  DB: D1Database;

  // vars (opsiyonel; wrangler.toml [vars] — hepsi sayısal, secret değil)
  RSS_FETCH_TIMEOUT_MS?: string; // tek deneme zaman aşımı (default 10000)
  RSS_MAX_ITEMS_PER_FEED?: string; // feed başına işlenecek en fazla öğe (default 50)
  RSS_MAX_BYTES?: string; // feed gövdesi üst sınırı (default 2 MB)
  RSS_RETRY_DELAY_MS?: string; // yeniden deneme öncesi bekleme (default 500)
  RSS_CONCURRENCY?: string; // aynı anda çekilen kaynak sayısı (default 3)

  // FAZ_4 4.4 — batch özet/etiket (runtime AI = Gemini, STUB — ERTELENEN E3)
  ENRICH_MODE?: string; // "off" (varsayılan) | "mock" | "gemini"
  ENRICH_BATCH_SIZE?: string; // çağrı başına haber (default 20, en çok 20)
  ENRICH_MAX_PER_RUN?: string; // çalışma başına en çok haber (default 100)
  ENRICH_MAX_ATTEMPTS?: string; // doğrulaması başarısız öğe için en çok deneme (default 3)
  // PLACEHOLDER'lar — DEĞER KODDA/REPODA YOK. E3'te (proje sonu, AGENTS §9) `wrangler secret put GEMINI_API_KEY --env <env>` + GEMINI_MODEL var'ı.
  // FAZ_4 4.5 — ai_jobs consumer (makale üretimi; runtime AI = Gemini STUB, E3)
  ARTICLE_MODE?: string; // "off" (varsayılan) | "mock" | "gemini"
  ARTICLE_MAX_JOBS_PER_RUN?: string; // çalışma başına en çok iş (default 5)
  GEMINI_API_KEY?: string; // SECRET (Workers secret)
  GEMINI_MODEL?: string; // var (model adı E3'te sabitlenir)

  // FAZ_4 4.7 — hata izleme / kota (runtime AI yalnız Gemini — fallback AYNI sağlayıcının hızlı/ucuz varyantı)
  GEMINI_FALLBACK_MODEL?: string; // var — kota eşiğinde geçilecek Gemini varyantı (E3'te sabitlenir); yoksa fallback yok
  AI_DAILY_LIMIT?: string; // var — ana model günlük çağrı limiti (yoksa yalnız sağlayıcının 429'u kotayı belirler)
  AI_FALLBACK_DAILY_LIMIT?: string; // var — yedek model günlük limiti
  AI_QUOTA_WARN_RATIO?: string; // var — ana modelden yedeğe geçiş eşiği (varsayılan 0.8)
  PIPELINE_ALERT_WEBHOOK_URL?: string; // SECRET — Slack/Discord webhook (yoksa alert yalnız log + audit)
}

/** settings.rssSources öğesi (app/admin/settings/schema.ts RssSource ile aynı sözleşme). */
export interface SourceDef {
  id: string;
  name: string;
  url: string;
  enabled: boolean;
}

export interface FeedItem {
  title: string;
  url: string;
}

export type SourceErrorCode =
  | "timeout"
  | "network"
  | "http_4xx"
  | "http_5xx"
  | "too_large"
  | "bad_redirect"
  | "parse_failed"
  | "db_error";

export interface SourceResult {
  id: string;
  name: string;
  host: string;
  status: "ok" | "error";
  fetched: number; // feed'den çıkan geçerli öğe
  inserted: number; // D1'e yeni yazılan
  duplicates: number; // url zaten vardı (dedup)
  skipped_items: number; // geçersiz öğe (link/başlık yok, şema dışı URL…)
  attempts: number;
  error?: SourceErrorCode;
}

export interface RunSummary {
  started_at: string;
  sources_total: number; // enabled + geçerli
  sources_invalid: number; // settings'te şema dışı → atlandı
  sources_ok: number;
  sources_failed: number;
  inserted: number;
  results: SourceResult[];
}
