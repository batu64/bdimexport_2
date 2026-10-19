// Feed çekme: tek deneme zaman aşımı (AbortController, gövde okuma dahil) + 1 yeniden deneme + gövde boyut sınırı.
// Yeniden denenir: zaman aşımı, ağ hatası, HTTP 5xx/429. Denenmez: 4xx (kalıcı), gövde çok büyük, geçersiz yönlendirme.
import type { SourceErrorCode } from "./types";
import { publicHttpsUrl } from "../../../app/admin/settings/schema.ts";

export class FeedFetchError extends Error {
  constructor(public code: SourceErrorCode, public attempts: number) {
    super(code);
  }
}

export interface FetchOpts {
  timeoutMs: number;
  maxBytes: number;
  retries: number; // ek deneme sayısı (1)
  retryDelayMs: number;
}

const HEADERS = {
  accept: "application/rss+xml, application/atom+xml, application/xml;q=0.9, text/xml;q=0.8, */*;q=0.5",
  "user-agent": "bdimexport-rss/1.0 (+https://bdimexport.com)",
};

async function readCapped(res: Response, max: number): Promise<string> {
  const cl = Number(res.headers.get("content-length") ?? "0");
  if (cl > max) throw new FeedFetchError("too_large", 0);
  if (!res.body) return "";
  const reader = res.body.getReader();
  const parts: Uint8Array[] = [];
  let total = 0;
  for (;;) {
    const { done, value } = await reader.read();
    if (done) break;
    total += value.byteLength;
    if (total > max) {
      await reader.cancel().catch(() => {});
      throw new FeedFetchError("too_large", 0);
    }
    parts.push(value);
  }
  const all = new Uint8Array(total);
  let o = 0;
  for (const p of parts) {
    all.set(p, o);
    o += p.byteLength;
  }
  return new TextDecoder("utf-8").decode(all);
}

async function attempt(url: string, o: FetchOpts): Promise<string> {
  const ctl = new AbortController();
  const timer = setTimeout(() => ctl.abort(), o.timeoutMs);
  try {
    const res = await fetch(url, { headers: HEADERS, signal: ctl.signal, redirect: "follow" });
    // Yönlendirme sonrası nihai adres de genel https olmalı (kaynak doğrulaması yönlendirmeyle aşılamaz)
    if (res.url) {
      try {
        publicHttpsUrl(res.url, "redirect");
      } catch {
        await res.body?.cancel().catch(() => {});
        throw new FeedFetchError("bad_redirect", 0);
      }
    }
    if (res.status === 429 || res.status >= 500) {
      await res.body?.cancel().catch(() => {});
      throw new FeedFetchError("http_5xx", 0);
    }
    if (!res.ok) {
      await res.body?.cancel().catch(() => {});
      throw new FeedFetchError("http_4xx", 0);
    }
    return await readCapped(res, o.maxBytes);
  } catch (e) {
    if (e instanceof FeedFetchError) throw e;
    throw new FeedFetchError(ctl.signal.aborted ? "timeout" : "network", 0);
  } finally {
    clearTimeout(timer);
  }
}

const RETRYABLE = new Set<SourceErrorCode>(["timeout", "network", "http_5xx"]);

export async function fetchFeedText(url: string, o: FetchOpts): Promise<{ text: string; attempts: number }> {
  let last: FeedFetchError | null = null;
  for (let n = 1; n <= 1 + o.retries; n++) {
    try {
      return { text: await attempt(url, o), attempts: n };
    } catch (e) {
      last = e as FeedFetchError;
      last.attempts = n;
      if (!RETRYABLE.has(last.code) || n > o.retries) throw last;
      if (o.retryDelayMs > 0) await new Promise((r) => setTimeout(r, o.retryDelayMs));
    }
  }
  throw last ?? new FeedFetchError("network", 1);
}
