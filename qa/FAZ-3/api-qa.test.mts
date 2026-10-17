// FAZ_3 3.10 QA — workers/api: API key yaşam döngüsü (bağımsız doğrulama), tier matrisi, CORS matrisi, rate limit, SQL injection fuzz.
// Gerçek worker kodu (src/index.ts) + GERÇEK SQL (node:sqlite, migration'lar) + bellek içi KV/R2. Ağ yok (Turnstile siteverify mock).
// Çalıştır (repo kökünden): pnpm --dir workers/api exec vitest run --config ../../qa/FAZ-3/vitest.api.config.mjs
import { describe, it, expect, vi, afterEach, beforeEach } from "vitest";
import { createHash } from "node:crypto";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import worker from "../../workers/api/src/index";
import { makeEnv, makeDb, makeR2, applyForm, post, PDF } from "../../workers/api/test/helpers";

type E = ReturnType<typeof makeEnv>["env"];
const BASE = "https://api.bdimexport.com";
const IP = "9.9.9.9";
const req = (path: string, init: RequestInit & { headers?: Record<string, string> } = {}) =>
  new Request(BASE + path, { ...init, headers: { "cf-connecting-ip": IP, ...(init.headers ?? {}) } });
const bearer = (k: string) => ({ authorization: `Bearer ${k}` });
const call = (r: Request, e: E) => worker.fetch(r, e);
const sha = (s: string) => createHash("sha256").update(s).digest("hex");

/** Erişilebilir (içeriği taranabilir) KV: anahtar+değer dökümü için. */
function spyKv() {
  const m = new Map<string, string>();
  const kv = {
    async get(k: string, type?: string) { const v = m.get(k) ?? null; return v && type === "json" ? JSON.parse(v) : v; },
    async put(k: string, v: string) { m.set(k, v); },
    async delete(k: string) { m.delete(k); },
  } as unknown as KVNamespace;
  return { kv, m };
}

function world(over: Partial<E> = {}) {
  const w = makeEnv(over);
  const { kv, m } = spyKv();
  (w.env as { CACHE: KVNamespace }).CACHE = kv;
  return { ...w, kvMap: m };
}

function seedKey(raw: ReturnType<typeof makeEnv>["raw"], tier: string, rate = 1000) {
  const key = "bdx_" + Buffer.from(crypto.getRandomValues(new Uint8Array(32))).toString("base64url");
  const id = (tier.slice(0, 3).toUpperCase() + crypto.randomUUID().replace(/-/g, "").toUpperCase() + "0".repeat(26)).slice(0, 26);
  raw.prepare("INSERT INTO api_keys (id,name,key_hash,tier,rate_limit) VALUES (?,?,?,?,?)").run(id, "qa-" + tier, sha(key), tier, rate);
  return { key, id };
}

// ════════════════════ 1) API key yaşam döngüsü + tier matrisi ════════════════════
describe("API key: hash-only saklama, tier matrisi, revoke→KV invalidation", () => {
  it("üretilen ham key HİÇBİR tabloda ve KV'de yok; D1'de yalnız SHA-256 hash (64 hex)", async () => {
    const { env, raw, kvMap } = world();
    const boot = seedKey(raw, "admin-internal");
    const minted: string[] = [];
    for (const tier of ["read-only", "partner"]) {
      const r = await call(req("/api/v1/keys", { method: "POST", headers: { ...bearer(boot.key), "content-type": "application/json" }, body: JSON.stringify({ name: "qa-" + tier, tier }) }), env);
      expect(r.status).toBe(201);
      minted.push(((await r.json()) as { key: string }).key);
    }
    // key'leri bir kez kullan ki cache dolsun
    for (const k of minted) await call(req("/api/v1/partners", { headers: bearer(k) }), env);
    await call(req("/api/v1/leads", { headers: bearer(boot.key) }), env);
    // TÜM tabloların TÜM satırları
    const tables = (raw.prepare("SELECT name FROM sqlite_master WHERE type='table' AND name NOT LIKE 'sqlite_%'").all() as { name: string }[]).map((t) => t.name);
    const dump = tables.map((t) => JSON.stringify(raw.prepare(`SELECT * FROM ${t}`).all())).join("\n");
    const kvDump = [...kvMap].map(([k, v]) => k + "=" + v).join("\n");
    for (const k of [...minted, boot.key]) {
      expect(dump).not.toContain(k);
      expect(kvDump).not.toContain(k);
      expect(k).toMatch(/^bdx_[A-Za-z0-9_-]{43}$/); // 256 bit rastgele
    }
    const hashes = (raw.prepare("SELECT key_hash FROM api_keys").all() as { key_hash: string }[]).map((r) => r.key_hash);
    expect(hashes.every((h) => /^[0-9a-f]{64}$/.test(h))).toBe(true);
    expect(hashes).toContain(sha(minted[0]));
    // KV'de yalnız hash-anahtarlı cache (ak:<hash>) + sayaçlar; admin-internal için ak: YOK
    expect(kvMap.has(`ak:${sha(boot.key)}`)).toBe(false);
    expect(kvMap.has(`ak:${sha(minted[0])}`)).toBe(true);
  });

  it("tier × endpoint matrisi: none/read-only/partner/admin-internal", async () => {
    const { env, raw } = world();
    const ro = seedKey(raw, "read-only"), pa = seedKey(raw, "partner"), ad = seedKey(raw, "admin-internal");
    raw.prepare("INSERT INTO partners (id,name,sector,approved,consent_logo_en,logo_r2_key,tax_id) VALUES ('P1','A','tekstil',1,0,'media/x.png','9999999999')").run();
    raw.prepare("INSERT INTO partners (id,name,sector,approved) VALUES ('P2','B','tekstil',0)").run();
    const matrix: Record<string, Record<string, number>> = {};
    const hit = async (label: string, path: string, method = "GET") => {
      matrix[label] = {};
      for (const [who, k] of [["none", null], ["read-only", ro.key], ["partner", pa.key], ["admin-internal", ad.key]] as const) {
        const r = await call(req(path, { method, headers: k ? bearer(k) : {} }), env);
        matrix[label][who] = r.status;
      }
    };
    await hit("GET /contents (public)", "/api/v1/contents");
    await hit("GET /partners", "/api/v1/partners");
    await hit("GET /leads", "/api/v1/leads");
    await hit("GET /keys", "/api/v1/keys");
    await hit("DELETE /keys/:id", `/api/v1/keys/${"X".repeat(26)}`, "DELETE");
    expect(matrix["GET /contents (public)"]).toEqual({ none: 200, "read-only": 200, partner: 200, "admin-internal": 200 });
    expect(matrix["GET /partners"]).toEqual({ none: 401, "read-only": 200, partner: 200, "admin-internal": 200 });
    expect(matrix["GET /leads"]).toEqual({ none: 401, "read-only": 403, partner: 403, "admin-internal": 200 });
    expect(matrix["GET /keys"]).toEqual({ none: 401, "read-only": 403, partner: 403, "admin-internal": 200 });
    expect(matrix["DELETE /keys/:id"]).toEqual({ none: 401, "read-only": 403, partner: 403, "admin-internal": 404 }); // 404 = yetkili ama anahtar yok
    // PII sızıntısı: read-only/partner /partners yanıtı onaysız partner, tax_id, contact, katalog, rızasız logo İÇERMEZ
    for (const k of [ro.key, pa.key]) {
      const body = await (await call(req("/api/v1/partners", { headers: bearer(k) }), env)).text();
      expect(body).not.toContain("9999999999");
      expect(body).not.toContain("media/x.png");
      expect(body).not.toContain("P2");
      expect(body).not.toMatch(/contact_json|tax_id|catalog_r2_key|kvkk_consent/);
    }
    // 4 endpoint × 4 kimlik = 20 hücre (ham matris rapora yazılır)
    console.log("TIER_MATRIX_BEGIN\n" + JSON.stringify(matrix) + "\nTIER_MATRIX_END");
  });

  it("revoke: cache'li read-only key aynı colo'da ANINDA 401 ve KV girdisi silinir; admin-internal revoke her zaman anında", async () => {
    const { env, raw, kvMap } = world();
    const ad = seedKey(raw, "admin-internal");
    const m = await call(req("/api/v1/keys", { method: "POST", headers: { ...bearer(ad.key), "content-type": "application/json" }, body: JSON.stringify({ name: "qa", tier: "read-only" }) }), env);
    const { id, key } = (await m.json()) as { id: string; key: string };
    expect((await call(req("/api/v1/partners", { headers: bearer(key) }), env)).status).toBe(200);
    expect(kvMap.has(`ak:${sha(key)}`)).toBe(true);
    expect((await call(req(`/api/v1/keys/${id}`, { method: "DELETE", headers: bearer(ad.key) }), env)).status).toBe(200);
    expect(kvMap.has(`ak:${sha(key)}`)).toBe(false);
    expect((await call(req("/api/v1/partners", { headers: bearer(key) }), env)).status).toBe(401);
    // admin-internal key revoke → bir sonraki istekte 401 (cache yok)
    const ad2 = seedKey(raw, "admin-internal");
    raw.prepare("UPDATE api_keys SET revoked=1 WHERE id=?").run(ad2.id);
    expect((await call(req("/api/v1/leads", { headers: bearer(ad2.key) }), env)).status).toBe(401);
  });

  it("brute-force freni + geçersiz biçimler: bdx_ olmayan/kısa/uzun/enjeksiyonlu key → 401, ardından IP 429", async () => {
    const { env } = world({ RL_BAD_AUTH_PER_MIN: "5" } as Partial<E>);
    const bad = ["junk", "bdx_short", "bdx_" + "A".repeat(44), "bdx_" + "!".repeat(43), "' OR '1'='1", "bdx_" + "A".repeat(43)];
    const out: number[] = [];
    for (const k of bad) out.push((await call(req("/api/v1/partners", { headers: bearer(k) }), env)).status);
    expect(out.slice(0, 5)).toEqual([401, 401, 401, 401, 401]);
    // 5 geçersiz denemeden sonra: IP bazlı rate limit devrede
    for (let i = 0; i < 6; i++) await call(req("/api/v1/partners", { headers: bearer("bdx_" + "B".repeat(43)) }), env);
    expect((await call(req("/api/v1/partners", { headers: bearer("bdx_" + "C".repeat(43)) }), env)).status).toBe(429);
  });

  // BULGU F-02 (MEDIUM): admin-internal tier "dışarıya ASLA verilemez" kuralı (fazlar/FAZ_7.md) TEKNİK OLARAK ZORLANMIYOR:
  // POST /v1/keys şeması tier=admin-internal kabul eder → ele geçirilmiş tek admin-internal key kalıcı yeni admin key üretebilir.
  // it.fails = "düzeltilene kadar BEKLENEN kırmızı": bugün 201 döndüğü için bu iddia (403) tutmuyor; düzelince test yeşile döner ve .fails'i kaldırmak gerekir.
  it.fails("F-02: admin-internal key API üzerinden admin-internal key MINT EDEMEMELİ (beklenen 403; bugün 201)", async () => {
    const { env, raw } = world();
    const ad = seedKey(raw, "admin-internal");
    const r = await call(req("/api/v1/keys", { method: "POST", headers: { ...bearer(ad.key), "content-type": "application/json" }, body: JSON.stringify({ name: "x", tier: "admin-internal" }) }), env);
    expect(r.status).toBe(403);
  });
});

// ════════════════════ 2) CORS matrisi ════════════════════
describe("CORS: yalnız bdimexport.com origin'leri", () => {
  const ALLOWED = ["https://bdimexport.com", "https://www.bdimexport.com"];
  const DENIED = [
    "http://bdimexport.com", "https://evil.com", "https://bdimexport.com.evil.com", "https://evilbdimexport.com", "https://sub.bdimexport.com",
    "https://bdimexport.com:8443", "https://BDIMEXPORT.COM", "https://bdimexport.com/", "null", "https://bdimexport.pages.dev", "https://staging.bdimexport.com", "file://", "https://bdimexport.com%2eevil.com",
  ];
  const PATHS: [string, string][] = [["GET", "/api/v1/health"], ["GET", "/api/v1/contents"], ["GET", "/api/v1/partners"], ["POST", "/api/v1/keys"], ["POST", "/api/v1/partners/apply"], ["GET", "/admin/api/me"]];

  it("izinli origin: ACAO origin'i yansıtır (* DEĞİL), credentials başlığı YOK, Vary: Origin", async () => {
    const { env } = world();
    for (const o of ALLOWED) {
      const r = await call(req("/api/v1/health", { headers: { origin: o } }), env);
      expect(r.status).toBe(200);
      expect(r.headers.get("access-control-allow-origin")).toBe(o);
      expect(r.headers.get("access-control-allow-credentials")).toBeNull();
      expect(r.headers.get("vary")).toMatch(/Origin/i);
      const pf = await call(req("/api/v1/keys", { method: "OPTIONS", headers: { origin: o, "access-control-request-method": "POST" } }), env);
      expect(pf.status).toBe(204);
      expect(pf.headers.get("access-control-allow-origin")).toBe(o);
      expect(pf.headers.get("access-control-allow-methods")).toBe("GET,POST,DELETE,OPTIONS");
    }
  });

  it(`izinsiz ${DENIED.length} origin × ${PATHS.length} yol + preflight → 403, ACAO YOK, işlem yapılmaz`, async () => {
    const { env, raw } = world();
    const before = (raw.prepare("SELECT COUNT(*) c FROM partners").get() as { c: number }).c;
    let cells = 0;
    for (const o of DENIED) {
      for (const [m, p] of PATHS) {
        const r = await call(req(p, { method: m, headers: { origin: o }, body: m === "POST" ? "{}" : undefined }), env);
        expect(r.status, `${o} ${m} ${p}`).toBe(403);
        expect(r.headers.get("access-control-allow-origin"), `${o} ${m} ${p}`).toBeNull();
        cells++;
      }
      const pf = await call(req("/api/v1/health", { method: "OPTIONS", headers: { origin: o, "access-control-request-method": "GET" } }), env);
      expect(pf.status).toBe(403);
      expect(pf.headers.get("access-control-allow-origin")).toBeNull();
      cells++;
    }
    expect((raw.prepare("SELECT COUNT(*) c FROM partners").get() as { c: number }).c).toBe(before);
    expect(cells).toBe(DENIED.length * (PATHS.length + 1));
  });

  it("Origin başlığı olmayan istek (curl / server-to-server) CORS'a takılmaz — key/Access koruması geçerli", async () => {
    const { env } = world();
    expect((await call(req("/api/v1/health"), env)).status).toBe(200);
    expect((await call(req("/api/v1/partners"), env)).status).toBe(401);
  });

  // BULGU F-04 (LOW, geçici/E2): production ALLOWED_ORIGINS'te bdimexport.pages.dev var — "yalnız bdimexport.com" hedefiyle çelişir.
  it.fails("F-04: wrangler.toml her ortamda ALLOWED_ORIGINS yalnız bdimexport.com (+staging.) host'ları (bugün production'da bdimexport.pages.dev var — geçici, E2)", () => {
    const toml = readFileSync(resolve(__dirname, "../../workers/api/wrangler.toml"), "utf8");
    const lists = [...toml.matchAll(/^ALLOWED_ORIGINS\s*=\s*"([^"]*)"/gm)].map((m) => m[1].split(","));
    expect(lists.length).toBe(3); // dev, staging, production
    for (const l of lists.slice(1)) for (const o of l) expect(new URL(o).hostname).toMatch(/(^|\.)bdimexport\.com$/);
  });
});

// ════════════════════ 3) Rate limit ════════════════════
describe("Rate limit (KV sabit pencere, 60 sn)", () => {
  it("public GET /contents: 60/dk → 61. istek 429 + retry-after; başka IP etkilenmez", async () => {
    const { env } = world();
    const codes: number[] = [];
    for (let i = 0; i < 61; i++) codes.push((await call(req("/api/v1/contents"), env)).status);
    expect(codes.slice(0, 60).every((c) => c === 200)).toBe(true);
    expect(codes[60]).toBe(429);
    const last = await call(req("/api/v1/contents"), env);
    const ra = Number(last.headers.get("retry-after"));
    expect(ra).toBeGreaterThanOrEqual(1);
    expect(ra).toBeLessThanOrEqual(60);
    expect((await last.json() as { error: { code: string } }).error.code).toBe("rate_limited");
    expect((await call(req("/api/v1/contents", { headers: { "cf-connecting-ip": "8.8.4.4" } }), env)).status).toBe(200);
  });

  it("genel IP freni: 120/dk (RL_IP_PER_MIN) → health bile 429; key bazlı limit key.rate_limit kadar", async () => {
    const { env, raw } = world();
    let first429 = 0;
    for (let i = 1; i <= 125; i++) if ((await call(req("/api/v1/health"), env)).status === 429 && !first429) first429 = i;
    expect(first429).toBe(121);
    const k = seedKey(raw, "read-only", 3);
    const codes: number[] = [];
    for (let i = 0; i < 5; i++) codes.push((await call(req("/api/v1/partners", { headers: { ...bearer(k.key), "cf-connecting-ip": "7.7.7.7" } }), env)).status);
    expect(codes).toEqual([200, 200, 200, 429, 429]);
  });

  it("geçersiz limit değişkeni (sayı değil / 0 / negatif) → varsayılana düşer, limit KAPANMAZ", async () => {
    for (const bad of ["abc", "0", "-5", ""]) {
      const { env } = world({ RL_PUBLIC_READ_PER_MIN: bad } as Partial<E>);
      const codes: number[] = [];
      for (let i = 0; i < 62; i++) codes.push((await call(req("/api/v1/contents"), env)).status);
      expect(codes.includes(429), `RL_PUBLIC_READ_PER_MIN=${JSON.stringify(bad)}`).toBe(true);
    }
  });
});

// ════════════════════ 4) SQL injection fuzz ════════════════════
const PAYLOADS = [
  "' OR '1'='1", "' OR 1=1--", "\" OR \"\"=\"", "'; DROP TABLE leads;--", "1; DELETE FROM api_keys;--", "' UNION SELECT key_hash,key_hash,key_hash,key_hash,key_hash,key_hash,key_hash,key_hash,key_hash,key_hash FROM api_keys--",
  "') OR ('1'='1", "\\", "%27%20OR%201%3D1--", "admin'--", "1 OR 1=1", "'||(SELECT name FROM sqlite_master LIMIT 1)||'", "\u0000", "💥'; --", "x' AND (SELECT COUNT(*) FROM sqlite_master)>0--", "a".repeat(500), "'; PRAGMA writable_schema=1;--", "'; UPDATE partners SET approved=1;--",
];

function snapshot(raw: ReturnType<typeof makeEnv>["raw"]) {
  const schema = raw.prepare("SELECT type,name,sql FROM sqlite_master ORDER BY name").all();
  const counts = Object.fromEntries((raw.prepare("SELECT name FROM sqlite_master WHERE type='table' AND name NOT LIKE 'sqlite_%'").all() as { name: string }[])
    .map((t) => [t.name, (raw.prepare(`SELECT COUNT(*) c FROM ${t.name}`).get() as { c: number }).c]));
  const approved = raw.prepare("SELECT id,approved FROM partners ORDER BY id").all();
  return JSON.stringify({ schema, counts, approved });
}

// HTTP başlık değeri olarak geçersiz karakterler (NUL, CR/LF, latin1 dışı) istemci/edge katmanında zaten reddedilir → o payload'lar başlık yoluna sokulamaz.
const headerReqs = (p: string): Request[] => {
  try { return [req(`/api/v1/partners`, { headers: { authorization: `Bearer ${p}` } }), req(`/api/v1/partners`, { headers: { "x-api-key": p } })]; } catch { return []; }
};

describe("SQL injection fuzz (parametrize sorgu teyidi — davranışsal)", () => {
  beforeEach(() => {
    vi.stubGlobal("fetch", async (_u: string, init: { body: URLSearchParams }) =>
      new Response(JSON.stringify({ success: true, hostname: "bdimexport.com", action: "partner_apply", _t: init.body.get("response") })));
  });
  afterEach(() => vi.unstubAllGlobals());

  it(`${PAYLOADS.length} payload × (query/path/header/body/form) — şema, satır sayıları ve onay durumu DEĞİŞMEZ; 500 YOK; veri sızmaz`, async () => {
    const { env, raw } = world({ RL_IP_PER_MIN: "100000", RL_PUBLIC_READ_PER_MIN: "100000", RL_BAD_AUTH_PER_MIN: "100000", RL_APPLY_PER_MIN: "100000" } as Partial<E>);
    const ad = seedKey(raw, "admin-internal"), ro = seedKey(raw, "read-only");
    raw.prepare("INSERT INTO partners (id,name,sector,approved) VALUES ('P1','Onaylı','tekstil',1),('P2','Onaysız','tekstil',0)").run();
    raw.prepare("INSERT INTO contents (id,slug,locale,page_type,title,body_md,status) VALUES ('C1','a','en','article','Pub','b','published'),('C2','b','en','article','Dr','b','draft')").run();
    raw.prepare("INSERT INTO leads (id,source_page,locale,payload_json) VALUES ('L1','/x','en','{}')").run();
    const before = snapshot(raw);
    const hashes = (raw.prepare("SELECT key_hash FROM api_keys").all() as { key_hash: string }[]).map((r) => r.key_hash);
    const statuses: Record<string, number> = {};
    let n = 0;
    const note = (r: Response) => { statuses[r.status] = (statuses[r.status] ?? 0) + 1; n++; return r; };
    const bodyOf = async (r: Response) => r.clone().text();
    let tax = 1000000000;

    for (const p of PAYLOADS) {
      const q = encodeURIComponent(p);
      const reqs: Request[] = [
        req(`/api/v1/contents?locale=${q}`), req(`/api/v1/contents?status=${q}`, { headers: bearer(ad.key) }), req(`/api/v1/contents?cursor=${q}`), req(`/api/v1/contents?limit=${q}`),
        req(`/api/v1/partners?cursor=${q}`, { headers: bearer(ad.key) }), req(`/api/v1/partners?approved=${q}`, { headers: bearer(ad.key) }), req(`/api/v1/partners?limit=${q}`, { headers: bearer(ro.key) }),
        req(`/api/v1/leads?status=${q}`, { headers: bearer(ad.key) }), req(`/api/v1/leads?cursor=${q}`, { headers: bearer(ad.key) }),
        req(`/api/v1/keys/${q}`, { method: "DELETE", headers: bearer(ad.key) }),
        ...headerReqs(p),
        req(`/api/v1/keys`, { method: "POST", headers: { ...bearer(ad.key), "content-type": "application/json" }, body: JSON.stringify({ name: p, tier: p }) }),
        req(`/api/v1/keys`, { method: "POST", headers: { ...bearer(ad.key), "content-type": "application/json" }, body: JSON.stringify({ name: p, tier: "read-only" }) }),
        req(`/admin/api/${q}`), req(`/api/v1/${q}`),
      ];
      for (const r of reqs) {
        const res = note(await call(r, env));
        expect(res.status, `${r.method} ${new URL(r.url).pathname}${new URL(r.url).search.slice(0, 40)}`).toBeLessThan(500);
        const text = await bodyOf(res);
        for (const h of hashes) expect(text).not.toContain(h); // UNION ile key_hash sızmamalı
        // payload'ın kendi yankısı (ör. key adı olarak literal saklanan metin) hariç tutulur; ham DB hata/şema bilgisi sızmamalı
        expect(text.split(JSON.stringify(p).slice(1, -1)).join("")).not.toMatch(/sqlite_master|SQLITE_|syntax error|SQL logic/i);
      }
      // /contents anahtarsız + enjeksiyonlu locale → yalnız published/approved ve 'tüm satırlar' DEĞİL
      const lr = await call(req(`/api/v1/contents?locale=${q}`), env);
      if (lr.status === 200) expect(((await lr.json()) as { data: unknown[] }).data.length).toBe(0);
      // apply formu: her serbest metin alanında payload; DB'ye LİTERAL yazılır, yan etki yok
      for (const field of ["firmaAdi", "kapasite", "ihracatGecmisi", "sektor", "contactName"] as const) {
        tax++;
        const fd = applyForm({ [field]: p, vergiNo: String(tax) });
        const r = note(await call(post(fd), env));
        expect(r.status, `apply ${field}`).toBeLessThan(500);
      }
    }
    // Yan etki YOK: şema + satır sayıları (apply ile eklenenler dışında) + onay durumu
    const after = JSON.parse(snapshot(raw));
    const bef = JSON.parse(before);
    expect(after.schema).toEqual(bef.schema);
    for (const t of Object.keys(bef.counts)) if (!["partners", "api_keys", "admin_actions"].includes(t)) expect(after.counts[t], t).toBe(bef.counts[t]);
    expect(after.approved.filter((r: { id: string }) => r.id === "P1" || r.id === "P2")).toEqual(bef.approved);
    expect((raw.prepare("SELECT COUNT(*) c FROM partners WHERE approved=1").get() as { c: number }).c).toBe(1); // enjeksiyonla onaylanan partner yok
    expect((raw.prepare("SELECT COUNT(*) c FROM leads").get() as { c: number }).c).toBe(1);
    expect((raw.prepare("SELECT COUNT(*) c FROM api_keys WHERE revoked=1").get() as { c: number }).c).toBe(0);
    // Enjeksiyon metni literal olarak saklandı (çalıştırılmadı): onaylanmamış başvurularda duruyor
    const stored = raw.prepare("SELECT name FROM partners WHERE name = ?").get("'; DROP TABLE leads;--") as { name: string } | undefined;
    expect(stored?.name).toBe("'; DROP TABLE leads;--");
    console.log(`SQLI_FUZZ: ${PAYLOADS.length} payload, ${n} istek, durum dağılımı ${JSON.stringify(statuses)}`);
    expect(n).toBeGreaterThan(350);
  });
});
