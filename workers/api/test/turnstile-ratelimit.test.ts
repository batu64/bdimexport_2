// FAZ_1 Step 1.8 — Turnstile + rate-limit DOĞRULAMA testleri (apply.test.ts'in temel senaryolarını tamamlar).
// Amaç: kod yorumlarındaki iddiaları (ham token saklanmaz, replay işareti siteverify'dan önce, secret/remoteip, IP izolasyonu,
// pencere sıfırlanması, fail-closed yapılandırma) çalıştırarak kanıtlamak.
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import worker from "../src/index";
import { applyForm, makeEnv, post } from "./helpers";

type Verdict = { success: boolean; hostname?: string; action?: string };
let verdict: Verdict;
let verifyBodies: URLSearchParams[];

beforeEach(() => {
  verdict = { success: true, hostname: "bdimexport.com", action: "partner_apply" };
  verifyBodies = [];
  vi.stubGlobal("fetch", async (_u: string, init: { body: URLSearchParams }) => {
    verifyBodies.push(init.body);
    return new Response(JSON.stringify(verdict));
  });
});
afterEach(() => {
  vi.unstubAllGlobals();
  vi.useRealTimers();
});

type Put = { key: string; value: string; ttl?: number };
/** CACHE'i sarar: yazılan anahtar/değer/TTL kaydedilir (helpers.makeKv TTL'i yok sayar). */
function spyEnv(over: Parameters<typeof makeEnv>[0] = {}) {
  const made = makeEnv(over);
  const puts: Put[] = [];
  const inner = made.env.CACHE;
  made.env.CACHE = {
    get: (k: string) => inner.get(k),
    put: async (k: string, v: string, o?: { expirationTtl?: number }) => {
      puts.push({ key: k, value: v, ttl: o?.expirationTtl });
      return inner.put(k, v);
    },
    delete: (k: string) => inner.delete(k),
  } as unknown as KVNamespace;
  return { ...made, puts };
}

const call = (req: Request, env: ReturnType<typeof makeEnv>["env"]) => worker.fetch(req, env);
const errCode = async (r: Response) => ((await r.json()) as { error: { code: string } }).error.code;

describe("Turnstile — siteverify çağrısı", () => {
  it("secret env'den gider, remoteip = cf-connecting-ip, response = gelen token", async () => {
    const { env } = spyEnv();
    const res = await call(post(applyForm({ turnstileToken: "tok-A" }), { "cf-connecting-ip": "9.9.9.9" }), env);
    expect(res.status).toBe(201);
    expect(verifyBodies).toHaveLength(1);
    expect(verifyBodies[0].get("secret")).toBe("test-secret");
    expect(verifyBodies[0].get("remoteip")).toBe("9.9.9.9");
    expect(verifyBodies[0].get("response")).toBe("tok-A");
  });

  it("IP bilinmiyorsa remoteip hiç gönderilmez", async () => {
    const { env } = spyEnv();
    const req = new Request("https://api.bdimexport.com/api/v1/partners/apply", { method: "POST", body: applyForm() });
    expect((await call(req, env)).status).toBe(201);
    expect(verifyBodies[0].has("remoteip")).toBe(false);
  });

  it("secret hiçbir hata yanıtında geri yansımaz", async () => {
    const { env } = spyEnv();
    verdict = { success: false };
    const res = await call(post(applyForm()), env);
    expect(res.status).toBe(403);
    expect(await res.text()).not.toContain("test-secret");
  });

  it("2048 karakterden uzun token → 403, siteverify çağrılmaz", async () => {
    const { env } = spyEnv();
    const res = await call(post(applyForm({ turnstileToken: "x".repeat(2049) })), env);
    expect(res.status).toBe(403);
    expect(await errCode(res)).toBe("turnstile_required");
    expect(verifyBodies).toHaveLength(0);
  });
});

describe("Turnstile — tek kullanım (replay) mekaniği", () => {
  it("KV'ye HAM token yazılmaz: anahtar ts:+SHA-256(64 hex), TTL 600 sn", async () => {
    const { env, puts } = spyEnv();
    const sample = "cok-gizli-token-degeri";
    expect((await call(post(applyForm({ turnstileToken: sample })), env)).status).toBe(201);
    const ts = puts.filter((p) => p.key.startsWith("ts:"));
    expect(ts).toHaveLength(1);
    expect(ts[0].key).toMatch(/^ts:[0-9a-f]{64}$/);
    expect(ts[0].ttl).toBe(600);
    for (const p of puts) {
      expect(p.key).not.toContain(sample);
      expect(p.value).not.toContain(sample);
    }
  });

  it("doğrulaması BAŞARISIZ token da yakılır: aynı token tekrar denenirse replay (siteverify tekrar çağrılmaz)", async () => {
    const { env } = spyEnv();
    verdict = { success: false };
    const r1 = await call(post(applyForm({ turnstileToken: "t-fail" })), env);
    expect(await errCode(r1)).toBe("turnstile_failed");
    verdict = { success: true, hostname: "bdimexport.com", action: "partner_apply" };
    const r2 = await call(post(applyForm({ turnstileToken: "t-fail" })), env);
    expect(r2.status).toBe(403);
    expect(await errCode(r2)).toBe("turnstile_replay");
    expect(verifyBodies).toHaveLength(1);
  });

  it("farklı token'lar birbirini etkilemez", async () => {
    const { env } = spyEnv();
    expect((await call(post(applyForm({ turnstileToken: "a", vergiNo: "1000000001" })), env)).status).toBe(201);
    expect((await call(post(applyForm({ turnstileToken: "b", vergiNo: "1000000002" })), env)).status).toBe(201);
  });
});

describe("Turnstile — fail-closed yapılandırma", () => {
  it("TURNSTILE_HOSTNAMES boş → hiçbir hostname kabul edilmez (403)", async () => {
    const { env } = spyEnv({ TURNSTILE_HOSTNAMES: "" });
    const res = await call(post(applyForm()), env);
    expect(res.status).toBe(403);
    expect(await errCode(res)).toBe("turnstile_hostname_mismatch");
  });

  it("siteverify yanıtında hostname yoksa → 403", async () => {
    const { env } = spyEnv();
    verdict = { success: true, action: "partner_apply" };
    expect((await call(post(applyForm()), env)).status).toBe(403);
  });

  it("TURNSTILE_ACTION_APPLY env ile değiştirilebilir; eski action artık geçmez", async () => {
    const { env } = spyEnv({ TURNSTILE_ACTION_APPLY: "apply_v2" });
    expect((await call(post(applyForm()), env)).status).toBe(403); // verdict.action = partner_apply
    verdict = { success: true, hostname: "bdimexport.com", action: "apply_v2" };
    expect((await call(post(applyForm()), env)).status).toBe(201);
  });
});

describe("rate limit — mekanik", () => {
  it("limit aşıldığında siteverify çağrılmaz (Turnstile kotası korunur)", async () => {
    const { env } = spyEnv({ RL_APPLY_PER_MIN: "1" });
    expect((await call(post(applyForm({ vergiNo: "1000000001" })), env)).status).toBe(201);
    expect(verifyBodies).toHaveLength(1);
    const res = await call(post(applyForm({ vergiNo: "1000000002" })), env);
    expect(res.status).toBe(429);
    expect(await errCode(res)).toBe("rate_limited");
    expect(verifyBodies).toHaveLength(1);
  });

  it("sayaç IP bazlıdır: bir IP'nin limiti diğerini etkilemez", async () => {
    const { env } = spyEnv({ RL_APPLY_PER_MIN: "1" });
    const a = { "cf-connecting-ip": "10.0.0.1" };
    const b = { "cf-connecting-ip": "10.0.0.2" };
    expect((await call(post(applyForm({ vergiNo: "1000000001" }), a), env)).status).toBe(201);
    expect((await call(post(applyForm({ vergiNo: "1000000002" }), a), env)).status).toBe(429);
    expect((await call(post(applyForm({ vergiNo: "1000000003" }), b), env)).status).toBe(201);
  });

  it("retry-after 1–60 sn aralığında; sayaç anahtarı rl:apply:{ip}:{pencere}, TTL 120 sn", async () => {
    const { env, puts } = spyEnv({ RL_APPLY_PER_MIN: "1" });
    await call(post(applyForm({ vergiNo: "1000000001" })), env);
    const res = await call(post(applyForm({ vergiNo: "1000000002" })), env);
    const ra = Number(res.headers.get("retry-after"));
    expect(ra).toBeGreaterThanOrEqual(1);
    expect(ra).toBeLessThanOrEqual(60);
    const rl = puts.filter((p) => p.key.startsWith("rl:apply:1.2.3.4:"));
    expect(rl.length).toBeGreaterThan(0);
    expect(rl[0].ttl).toBe(120);
  });

  it("60 sn pencere dolunca sayaç sıfırlanır", async () => {
    vi.useFakeTimers({ toFake: ["Date"] });
    vi.setSystemTime(new Date("2026-10-12T10:00:10Z"));
    const { env } = spyEnv({ RL_APPLY_PER_MIN: "1" });
    expect((await call(post(applyForm({ vergiNo: "1000000001" })), env)).status).toBe(201);
    expect((await call(post(applyForm({ vergiNo: "1000000002" })), env)).status).toBe(429);
    vi.setSystemTime(new Date("2026-10-12T10:01:10Z"));
    expect((await call(post(applyForm({ vergiNo: "1000000003" })), env)).status).toBe(201);
  });

  it("geçersiz RL_APPLY_PER_MIN (sayı değil / 0) → varsayılan 5'e düşer, limit devre dışı KALMAZ", async () => {
    for (const bad of ["abc", "0", "-3"]) {
      const { env } = spyEnv({ RL_APPLY_PER_MIN: bad });
      let last = 0;
      for (let i = 0; i < 6; i++) last = (await call(post(applyForm({ vergiNo: String(1000000100 + i) })), env)).status;
      expect(last).toBe(429);
    }
  });
});
