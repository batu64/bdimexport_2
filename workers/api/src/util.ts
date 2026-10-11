import { HttpError } from "./types";

const CROCKFORD = "0123456789ABCDEFGHJKMNPQRSTVWXYZ";

export function ulid(now = Date.now()): string {
  let t = now;
  let ts = "";
  for (let i = 0; i < 10; i++) {
    ts = CROCKFORD[t % 32] + ts;
    t = Math.floor(t / 32);
  }
  const rnd = crypto.getRandomValues(new Uint8Array(16));
  let r = "";
  for (const b of rnd) r += CROCKFORD[b % 32];
  return ts + r;
}

export async function sha256Hex(input: string | ArrayBuffer): Promise<string> {
  const data = typeof input === "string" ? new TextEncoder().encode(input) : input;
  const d = await crypto.subtle.digest("SHA-256", data);
  return [...new Uint8Array(d)].map((b) => b.toString(16).padStart(2, "0")).join("");
}

export function json(body: unknown, status = 200, headers: Record<string, string> = {}): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { "content-type": "application/json; charset=utf-8", "cache-control": "no-store", ...headers },
  });
}

export function intVar(v: string | undefined, def: number): number {
  const n = Number(v);
  return Number.isFinite(n) && n > 0 ? Math.floor(n) : def;
}

export function clientIp(req: Request): string {
  return req.headers.get("cf-connecting-ip") ?? "unknown";
}

/** Gövdeyi en fazla `max` bayt okur; aşarsa 413. Content-Length'siz (chunked) istekleri de kapsar. */
export async function readBodyLimited(req: Request, max: number): Promise<Uint8Array> {
  const cl = req.headers.get("content-length");
  if (cl && Number(cl) > max) throw new HttpError(413, "payload_too_large", "İstek gövdesi çok büyük");
  if (!req.body) return new Uint8Array(0);
  const reader = req.body.getReader();
  const chunks: Uint8Array[] = [];
  let total = 0;
  for (;;) {
    const { done, value } = await reader.read();
    if (done) break;
    total += value.byteLength;
    if (total > max) {
      await reader.cancel().catch(() => {});
      throw new HttpError(413, "payload_too_large", "İstek gövdesi çok büyük");
    }
    chunks.push(value);
  }
  const out = new Uint8Array(total);
  let off = 0;
  for (const c of chunks) {
    out.set(c, off);
    off += c.byteLength;
  }
  return out;
}
