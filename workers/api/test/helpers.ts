// Test yardımcıları: node:sqlite ile GERÇEK SQL (migrations 0001+0002 uygulanır), bellek içi KV/R2.
import { DatabaseSync } from "node:sqlite";
import { readFileSync, readdirSync } from "node:fs";
import { resolve } from "node:path";
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

export function makeDb(): { d1: D1Database; raw: DatabaseSync } {
  const raw = new DatabaseSync(":memory:");
  const dir = resolve(__dirname, "../../../db/migrations");
  // TÜM migration'lar dosya adı sırasıyla (wrangler ile aynı sıra) — yeni migration testlere otomatik girer
  for (const f of readdirSync(dir).filter((x) => x.endsWith(".sql")).sort()) raw.exec(readFileSync(resolve(dir, f), "utf8"));
  // D1 batch = tek transaction (biri düşerse hepsi geri alınır); her statement için meta.changes
  const batch = async (sts: Stmt[]) => {
    raw.exec("BEGIN");
    try { const out = sts.map((s) => s.runSync()); raw.exec("COMMIT"); return out; }
    catch (e) { raw.exec("ROLLBACK"); throw e; }
  };
  return { d1: { prepare: (s: string) => new Stmt(raw, s), batch } as unknown as D1Database, raw };
}

export function makeKv(): KVNamespace {
  const m = new Map<string, string>();
  return {
    async get(k: string, type?: string) { const v = m.get(k) ?? null; return v && type === "json" ? JSON.parse(v) : v; },
    async put(k: string, v: string) { m.set(k, v); },
    async delete(k: string) { m.delete(k); },
  } as unknown as KVNamespace;
}

export function makeR2() {
  const objs = new Map<string, { size: number; ct?: string }>();
  const bucket = {
    async put(k: string, v: Uint8Array, o?: { httpMetadata?: { contentType?: string } }) { objs.set(k, { size: v.byteLength, ct: o?.httpMetadata?.contentType }); },
    async delete(k: string) { objs.delete(k); },
  } as unknown as R2Bucket;
  return { bucket, objs };
}

export function makeEnv(over: Partial<Env> = {}) {
  const { d1, raw } = makeDb();
  const r2 = makeR2();
  const env: Env = {
    DB: d1, MEDIA: r2.bucket, CACHE: makeKv(),
    TURNSTILE_SECRET: "test-secret",
    ALLOWED_ORIGINS: "https://bdimexport.com,https://www.bdimexport.com",
    TURNSTILE_HOSTNAMES: "bdimexport.com,www.bdimexport.com",
    KVKK_VERSIONS: "v1 (47ac2ef0a5b43264)",
    RL_APPLY_PER_MIN: "5",
    ...over,
  };
  return { env, raw, r2 };
}

export const PDF = (n: number) => {
  const b = new Uint8Array(n);
  b.set(new TextEncoder().encode("%PDF-1.7\n"));
  return b;
};

export function applyForm(o: Record<string, string | null> = {}, file?: { bytes: Uint8Array; type?: string }): FormData {
  const base: Record<string, string> = {
    firmaAdi: "Test Tekstil A.Ş.", vergiNo: "1234567890", kapasite: "5000 adet/ay", ihracatGecmisi: "DE 2024",
    contactEmail: "ihracat@example.com",
    kvkkConsent: "true", kvkkVersion: "v1 (47ac2ef0a5b43264)", turnstileToken: "tok-" + Math.random(),
  };
  const fd = new FormData();
  for (const [k, v] of Object.entries({ ...base, ...o })) if (v !== null) fd.set(k, v);
  fd.append("sertifikalar", "CE");
  fd.append("sertifikalar", "ISO 9001");
  if (file) fd.set("katalogFile", new File([file.bytes], "k.pdf", { type: file.type ?? "application/pdf" }));
  return fd;
}

export function post(fd: FormData, headers: Record<string, string> = {}) {
  return new Request("https://api.bdimexport.com/api/v1/partners/apply", {
    method: "POST", body: fd, headers: { "cf-connecting-ip": "1.2.3.4", ...headers },
  });
}
