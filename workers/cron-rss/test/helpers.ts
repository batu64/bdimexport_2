// Test yardımcıları: node:sqlite ile GERÇEK SQL (repodaki migration'lar 0001–0003), D1 benzeri prepare/bind/first/all/run/batch.
// batch = tek transaction (D1 semantiği); her statement için meta.changes.
import { DatabaseSync } from "node:sqlite";
import { readFileSync, readdirSync } from "node:fs";
import { resolve } from "node:path";
import { vi } from "vitest";
import type { Env } from "../src/types";

class Stmt {
  private args: unknown[] = [];
  constructor(private db: DatabaseSync, private sql: string) {}
  bind(...a: unknown[]) { this.args = a; return this; }
  async first<T>() { return (this.db.prepare(this.sql).get(...(this.args as never[])) as T) ?? null; }
  async all<T>() { return { results: this.db.prepare(this.sql).all(...(this.args as never[])) as T[] }; }
  async run() { return this.runSync(); }
  runSync() { const r = this.db.prepare(this.sql).run(...(this.args as never[])); return { success: true, meta: { changes: Number(r.changes) } }; }
}

export function makeEnv(over: Partial<Env> = {}) {
  const raw = new DatabaseSync(":memory:");
  const dir = resolve(__dirname, "../../../db/migrations");
  for (const f of readdirSync(dir).filter((x) => x.endsWith(".sql")).sort()) raw.exec(readFileSync(resolve(dir, f), "utf8")); // tüm migration'lar (wrangler sırası)
  const batch = async (sts: Stmt[]) => {
    raw.exec("BEGIN");
    try { const out = sts.map((s) => s.runSync()); raw.exec("COMMIT"); return out; }
    catch (e) { raw.exec("ROLLBACK"); throw e; }
  };
  const DB = { prepare: (s: string) => new Stmt(raw, s), batch } as unknown as D1Database;
  const env: Env = { DB, RSS_RETRY_DELAY_MS: "0", RSS_FETCH_TIMEOUT_MS: "2000", ...over };
  return { env, raw };
}

export type Src = { id: string; name: string; url: string; enabled: boolean };
export const setSources = (raw: DatabaseSync, list: unknown) =>
  raw.prepare("INSERT OR REPLACE INTO settings (key, value_json, updated_by) VALUES ('rssSources', ?, 'test')").run(JSON.stringify(list));

export const rss2 = (items: { title: string; link: string }[]) =>
  `<?xml version="1.0"?><rss version="2.0"><channel><title>T</title>${items.map((i) => `<item><title>${i.title}</title><link>${i.link}</link></item>`).join("")}</channel></rss>`;

export const atom = (entries: { title: string; href: string }[]) =>
  `<?xml version="1.0"?><feed xmlns="http://www.w3.org/2005/Atom"><title>A</title>${entries.map((e) => `<entry><title>${e.title}</title><link rel="alternate" href="${e.href}"/></entry>`).join("")}</feed>`;

type Handler = (url: string, init: RequestInit | undefined, call: number) => Response | Promise<Response>;

/** global fetch mock'u: URL → davranış. Çağrı sayacı + sıralı çağrı kaydı. */
export function mockFeeds(routes: Record<string, Handler | string>) {
  const calls: Record<string, number> = {};
  const log: string[] = [];
  vi.stubGlobal("fetch", async (input: string | URL, init?: RequestInit) => {
    const url = String(input);
    calls[url] = (calls[url] ?? 0) + 1;
    log.push(url);
    const r = routes[url];
    if (r === undefined) throw new TypeError("fetch failed: bilinmeyen test URL " + url);
    if (typeof r === "string") return new Response(r, { status: 200, headers: { "content-type": "application/rss+xml" } });
    return r(url, init, calls[url]);
  });
  return { calls, log };
}

/** abort sinyali gelene kadar asılı kalan yanıt (zaman aşımı testi). */
export const hang: Handler = (_u, init) =>
  new Promise((_res, rej) => init?.signal?.addEventListener("abort", () => rej(new DOMException("aborted", "AbortError"))));
