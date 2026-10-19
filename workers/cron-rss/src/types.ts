// workers/cron-rss — ortak tipler. Secret YOK: bu worker yalnız D1 okur/yazar ve herkese açık RSS adreslerini çeker.
export interface Env {
  DB: D1Database;

  // vars (opsiyonel; wrangler.toml [vars] — hepsi sayısal, secret değil)
  RSS_FETCH_TIMEOUT_MS?: string; // tek deneme zaman aşımı (default 10000)
  RSS_MAX_ITEMS_PER_FEED?: string; // feed başına işlenecek en fazla öğe (default 50)
  RSS_MAX_BYTES?: string; // feed gövdesi üst sınırı (default 2 MB)
  RSS_RETRY_DELAY_MS?: string; // yeniden deneme öncesi bekleme (default 500)
  RSS_CONCURRENCY?: string; // aynı anda çekilen kaynak sayısı (default 3)
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
