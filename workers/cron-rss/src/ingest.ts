// RSS ingest (FAZ_4 4.1): kaynaklar (settings.rssSources) → fetch (timeout + 1 retry) → parse → D1 rss_news (url UNIQUE dedup).
// DETERMİNİSTİK: AI/model çağrısı YOK (AGENTS §8, FAZ_4 kural 2). TTL silme BURADA DEĞİL (4.2) — expires_at yalnız yazılır.
// Hata izolasyonu: her kaynak kendi try/catch'inde; biri düşerse diğerleri akar, çalışma asla toplu çökmez.
import type { Env, RunSummary, SourceDef, SourceErrorCode, SourceResult } from "./types";
import { FeedFetchError, fetchFeedText, type FetchOpts } from "./fetch";
import { FeedParseError, parseFeed } from "./parse";
import { loadSources } from "./sources";
import { ulid } from "../../../app/admin/audit.ts";

export const TTL_HOURS = 72;
const CHUNK = 50; // D1 batch parça boyutu

const int = (v: string | undefined, def: number, min = 0) => {
  const n = Number(v);
  return Number.isFinite(n) && n >= min && v !== undefined && v !== "" ? Math.floor(n) : def;
};

/** D1 `datetime('now')` biçimi (UTC, "YYYY-MM-DD HH:MM:SS") — admin servisinin TTL karşılaştırmasıyla aynı. */
export const sqlTime = (ms: number) => new Date(ms).toISOString().slice(0, 19).replace("T", " ");

const hostOf = (u: string) => {
  try {
    return new URL(u).host;
  } catch {
    return "?";
  }
};

async function ingestSource(env: Env, src: SourceDef, nowMs: number, o: FetchOpts, maxItems: number): Promise<SourceResult> {
  const base: SourceResult = { id: src.id, name: src.name, host: hostOf(src.url), status: "ok", fetched: 0, inserted: 0, duplicates: 0, skipped_items: 0, attempts: 0 };
  const fail = (error: SourceErrorCode, attempts = base.attempts): SourceResult => ({ ...base, status: "error", error, attempts });
  try {
    const { text, attempts } = await fetchFeedText(src.url, o);
    base.attempts = attempts;
    let parsed;
    try {
      parsed = parseFeed(text, src.url, maxItems);
    } catch (e) {
      if (e instanceof FeedParseError) return fail("parse_failed");
      throw e;
    }
    base.fetched = parsed.items.length;
    base.skipped_items = parsed.skipped;

    const fetchedAt = sqlTime(nowMs);
    const expiresAt = sqlTime(nowMs + TTL_HOURS * 3600_000);
    for (let i = 0; i < parsed.items.length; i += CHUNK) {
      const stmts = parsed.items.slice(i, i + CHUNK).map((it) =>
        env.DB.prepare("INSERT INTO rss_news (id, source, title, url, fetched_at, expires_at) VALUES (?, ?, ?, ?, ?, ?) ON CONFLICT(url) DO NOTHING").bind(
          ulid(nowMs),
          src.name,
          it.title,
          it.url,
          fetchedAt,
          expiresAt,
        ),
      );
      const res = await env.DB.batch(stmts);
      for (const r of res) {
        if ((r.meta?.changes ?? 0) > 0) base.inserted++;
        else base.duplicates++;
      }
    }
    return base;
  } catch (e) {
    if (e instanceof FeedFetchError) return fail(e.code, e.attempts);
    console.error(JSON.stringify({ evt: "rss_source_unexpected", source_id: src.id, err: e instanceof Error ? e.message.slice(0, 160) : "?" }));
    return fail("db_error");
  }
}

export async function runIngest(env: Env, now = new Date()): Promise<RunSummary> {
  const o: FetchOpts = {
    timeoutMs: int(env.RSS_FETCH_TIMEOUT_MS, 10_000, 1),
    maxBytes: int(env.RSS_MAX_BYTES, 2 * 1024 * 1024, 1),
    retries: 1,
    retryDelayMs: int(env.RSS_RETRY_DELAY_MS, 500),
  };
  const maxItems = int(env.RSS_MAX_ITEMS_PER_FEED, 50, 1);
  const concurrency = int(env.RSS_CONCURRENCY, 3, 1);

  const { sources, invalid } = await loadSources(env.DB);
  const results: SourceResult[] = new Array(sources.length);
  let next = 0;
  // basit havuz: aynı anda `concurrency` kaynak; her işçi bağımsız (ingestSource asla fırlatmaz)
  await Promise.all(
    Array.from({ length: Math.min(concurrency, sources.length) }, async () => {
      for (;;) {
        const i = next++;
        if (i >= sources.length) return;
        results[i] = await ingestSource(env, sources[i], now.getTime(), o, maxItems);
        const r = results[i];
        const line = JSON.stringify({ evt: "rss_source", ...r });
        if (r.status === "ok") console.log(line);
        else console.error(line); // ölü kaynak → log (4.7 izleme/alarm bunu tüketecek)
      }
    }),
  );

  const summary: RunSummary = {
    started_at: now.toISOString(),
    sources_total: sources.length,
    sources_invalid: invalid,
    sources_ok: results.filter((r) => r.status === "ok").length,
    sources_failed: results.filter((r) => r.status === "error").length,
    inserted: results.reduce((a, r) => a + r.inserted, 0),
    results,
  };
  console.log(JSON.stringify({ evt: "rss_run", ...summary, results: undefined }));
  return summary;
}
