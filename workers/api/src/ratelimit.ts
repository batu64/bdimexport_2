import { HttpError } from "./types";

/**
 * KV tabanlı sabit pencere (60 sn). NOT: KV eventual-consistent ve read-modify-write atomik değil →
 * yoğun paralel isteklerde limit birkaç istek aşılabilir (best-effort). Sert garanti gerekirse
 * Workers Rate Limiting binding / Durable Object'e geçilir (docs/openapi/README.md "Bilinen sınırlar").
 */
export async function rateLimit(kv: KVNamespace, scope: string, id: string, limit: number): Promise<void> {
  const win = Math.floor(Date.now() / 60_000);
  const key = `rl:${scope}:${id}:${win}`;
  const cur = Number((await kv.get(key)) ?? "0");
  if (cur >= limit) {
    throw new HttpError(429, "rate_limited", "Çok fazla istek", undefined, {
      "retry-after": String(60 - Math.floor((Date.now() / 1000) % 60)),
    });
  }
  await kv.put(key, String(cur + 1), { expirationTtl: 120 });
}
