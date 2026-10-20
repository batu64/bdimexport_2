// FAZ_4 4.3 — günlük Google Trends toplama (geo=TR/RU/DE).
// 4.1 pattern'i yeniden kullanılır: fetch (timeout + 1 retry) · parse · D1 yazımı · kaynak başına hata izolasyonu.
// DETERMİNİSTİK: AI/model çağrısı YOK.
// Etiket: rss_news.source = "Trends <GEO>" (admin B sekmesinde ayrı kaynak olarak görünür; RSS kaynakları "RSS …" değil,
//   yalnız tags_json.kind="trends" ile de işaretlenir).
// Dedup (7 gün): keywords tablosu 7 gün penceresinde tutulur (rss_news 72 saatte TTL ile silindiği için orada dedup yapılmaz).
import { fetchFeedText, FeedFetchError, type FetchOpts } from "../../cron-rss/src/fetch";
import { parseFeed, FeedParseError } from "../../cron-rss/src/parse";
import { ulid } from "../../../app/admin/audit.ts";

export const GEOS = ["TR", "RU", "DE"] as const;
export type Geo = (typeof GEOS)[number];

/** geo → keyword locale (keywords.locale serbest metin; sitedeki dil kodlarıyla aynı) */
export const GEO_LOCALE: Record<Geo, string> = { TR: "tr", RU: "ru", DE: "de" };
export const TRENDS_DEDUP_DAYS = 7;
export const TRENDS_TTL_HOURS = 72;
export const TRENDS_CRON = "0 6 * * *";

export const trendsUrl = (geo: Geo) => `https://trends.google.com/trending/rss?geo=${geo}`;
export const sourceLabel = (geo: Geo) => `Trends ${geo}`;
/** Dedup anahtarı: büyük/küçük harf + boşluk duyarsız (Trends başlıkları değişken biçimli gelir). */
export const normPhrase = (s: string) =>
  s.normalize("NFC").trim().replace(/\s+/g, " ").toLowerCase().replace(/̇/g, ""); // "İ" → "i̇" (birleşik nokta) düşürülür

const sqlTime = (ms: number) => new Date(ms).toISOString().slice(0, 19).replace("T", " ");

export interface Env {
  DB: D1Database;
  RSS_FETCH_TIMEOUT_MS?: string;
  RSS_RETRY_DELAY_MS?: string;
  RSS_MAX_ITEMS_PER_FEED?: string;
}

export interface GeoResult {
  geo: Geo;
  status: "ok" | "error";
  fetched: number;
  inserted: number;
  duplicates: number;
  error?: string;
}

export interface TrendsSummary {
  started_at: string;
  results: GeoResult[];
}

const int = (v: string | undefined, def: number) => {
  const n = Number(v);
  return v !== undefined && v !== "" && Number.isFinite(n) && n >= 1 ? Math.floor(n) : def;
};

/** 7 gün içinde aynı (phrase, locale) keyword'ü var mı? */
async function seenRecently(d1: D1Database, phrase: string, locale: string, nowMs: number): Promise<boolean> {
  const since = sqlTime(nowMs - TRENDS_DEDUP_DAYS * 86_400_000);
  const row = await d1
    .prepare("SELECT 1 AS x FROM keywords WHERE phrase = ? AND locale = ? AND created_at >= ? LIMIT 1")
    .bind(phrase, locale, since)
    .first<{ x: number }>();
  return row !== null;
}

/** Tek geo: fetch → parse → (dedup) → rss_news + keywords. Hata yalnız bu geo'yu düşürür. */
async function ingestGeo(env: Env, geo: Geo, nowMs: number, o: FetchOpts, maxItems: number): Promise<GeoResult> {
  const base: GeoResult = { geo, status: "ok", fetched: 0, inserted: 0, duplicates: 0 };
  try {
    const { text } = await fetchFeedText(trendsUrl(geo), o);
    const { items } = parseFeed(text, trendsUrl(geo), maxItems);
    base.fetched = items.length;
    const locale = GEO_LOCALE[geo];
    const fetchedAt = sqlTime(nowMs);
    const expiresAt = sqlTime(nowMs + TRENDS_TTL_HOURS * 3_600_000);
    for (const it of items) {
      const phrase = normPhrase(it.title);
      if (!phrase) continue;
      if (await seenRecently(env.DB, phrase, locale, nowMs)) {
        base.duplicates++;
        continue;
      }
      // rss_news: admin B sekmesinde "Trends <GEO>" kaynağı; url UNIQUE → aynı link çakışırsa sessizce atlanır
      await env.DB.prepare(
        "INSERT INTO rss_news (id, source, title, url, summary, tags_json, fetched_at, expires_at) VALUES (?, ?, ?, ?, NULL, ?, ?, ?) ON CONFLICT(url) DO NOTHING",
      )
        .bind(ulid(nowMs), sourceLabel(geo), it.title, it.url, JSON.stringify({ kind: "trends", geo, locale }), fetchedAt, expiresAt)
        .run();
      // keywords: 7 gün dedup penceresinin kaynağı (intent NULL — Trends niyet bilgisi vermez; status queued)
      await env.DB.prepare(
        "INSERT INTO keywords (id, phrase, locale, intent, priority, status, created_at) VALUES (?, ?, ?, NULL, 0, 'queued', ?)",
      )
        .bind("trend-" + ulid(nowMs), phrase, locale, fetchedAt)
        .run();
      base.inserted++;
    }
    return base;
  } catch (e) {
    const code = e instanceof FeedFetchError ? e.code : e instanceof FeedParseError ? "parse_failed" : "error";
    return { ...base, status: "error", error: String(code) };
  }
}

/** Üç geo'yu sırayla çeker; biri düşerse diğerleri akar (4.1 hata izolasyonu). */
export async function runTrends(env: Env, now = new Date()): Promise<TrendsSummary> {
  const o: FetchOpts = {
    timeoutMs: int(env.RSS_FETCH_TIMEOUT_MS, 10_000),
    maxBytes: 2 * 1024 * 1024,
    retries: 1,
    retryDelayMs: int(env.RSS_RETRY_DELAY_MS, 500),
  };
  const maxItems = int(env.RSS_MAX_ITEMS_PER_FEED, 50);
  const results: GeoResult[] = [];
  for (const geo of GEOS) results.push(await ingestGeo(env, geo, now.getTime(), o, maxItems));
  const summary: TrendsSummary = { started_at: now.toISOString(), results };
  for (const r of results) console.log(JSON.stringify({ event: "trends_geo", at: summary.started_at, ...r }));
  return summary;
}
