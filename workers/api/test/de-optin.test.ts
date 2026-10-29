import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import worker from "../src/index";
import { makeEnv } from "./helpers";

// FAZ_5 5.6 — /de çift opt-in iskeleti (E5 stub: kuyruk, gerçek mail yok)
type Verdict = { success: boolean; hostname?: string; action?: string };
let verdict: Verdict;
beforeEach(() => {
  verdict = { success: true, hostname: "bdimexport.com", action: "de_quote" };
  vi.stubGlobal("fetch", async () => new Response(JSON.stringify(verdict)));
});
afterEach(() => vi.unstubAllGlobals());

const VERSION = "de-v0-entwurf";
const env0 = () => makeEnv({ DE_CONSENT_VERSIONS: VERSION });
type E = ReturnType<typeof makeEnv>["env"];
const call = (req: Request, env: E) => worker.fetch(req, env);
const postJson = (path: string, body: unknown, ip = "203.0.113.7") =>
  new Request(`https://api.bdimexport.com${path}`, {
    method: "POST",
    headers: { "content-type": "application/json", origin: "https://bdimexport.com", "cf-connecting-ip": ip },
    body: JSON.stringify(body),
  });
const quote = (o: Record<string, unknown> = {}) => ({
  name: "Erika Muster", company: "Muster GmbH", email: "einkauf@example.de", message: "Baumwoll-T-Shirts, 5.000 Stück, Lieferung Hamburg",
  consent: true, consentVersion: VERSION, turnstileToken: "tok-" + Math.random(), ...o,
});

async function keys(env: E, prefix: string): Promise<string[]> {
  // makeKv bellek içi Map'i kapatır; yalnız get/put/delete var → kuyruk anahtarını yanıttan bağımsız bulmak için put'u izleriz
  return (env as unknown as { __keys?: string[] }).__keys?.filter((k) => k.startsWith(prefix)) ?? [];
}
function trackPuts(env: E): E {
  const kv = env.CACHE as unknown as { put: (k: string, v: string, o?: unknown) => Promise<void> };
  const orig = kv.put.bind(kv);
  const seen: string[] = [];
  (env as unknown as { __keys: string[] }).__keys = seen;
  kv.put = async (k, v, o) => { seen.push(k); return orig(k, v, o); };
  return env;
}

describe("POST /api/v1/de/anfrage", () => {
  it("202 pending_confirmation; bekleyen kayıt sha256(token) ile, ham token yalnız mail kuyruğunda; IP saklanmaz", async () => {
    const env = trackPuts(env0().env);
    const res = await call(postJson("/api/v1/de/anfrage", quote()), env);
    expect(res.status).toBe(202);
    expect(await res.json()).toEqual({ status: "pending_confirmation" });
    const [pk] = await keys(env, "optin:");
    const [mk] = await keys(env, "mailq:");
    expect(pk).toMatch(/^optin:[0-9a-f]{64}$/);
    const pending = JSON.parse((await env.CACHE.get(pk))!);
    expect(pending.email).toBe("einkauf@example.de");
    expect(pending.consentVersion).toBe(VERSION);
    expect(JSON.stringify(pending)).not.toContain("203.0.113.7");
    const mail = JSON.parse((await env.CACHE.get(mk))!);
    expect(mail).toMatchObject({ template: "de_optin", to: "einkauf@example.de", locale: "de" });
    expect(mail.token).toMatch(/^[A-Za-z0-9_-]{43}$/);
    expect(JSON.stringify(pending)).not.toContain(mail.token);
  });

  it("rıza yok/false → 400 (önceden işaretli kutu sunucuda da zorunlu)", async () => {
    for (const consent of [false, "true", undefined]) {
      const { env } = env0();
      const res = await call(postJson("/api/v1/de/anfrage", quote({ consent })), env);
      expect(res.status).toBe(400);
    }
  });

  it("bilinmeyen rıza sürümü → 400; DE_CONSENT_VERSIONS tanımsız → fail-closed 400", async () => {
    let res = await call(postJson("/api/v1/de/anfrage", quote({ consentVersion: "v9" })), env0().env);
    expect(res.status).toBe(400);
    res = await call(postJson("/api/v1/de/anfrage", quote()), makeEnv().env);
    expect(res.status).toBe(400);
    expect(((await res.json()) as { error: { code: string } }).error.code).toBe("consent_version_unknown");
  });

  it("Turnstile action başka form (partner_apply) → 403; JSON dışı → 415", async () => {
    verdict.action = "partner_apply";
    let res = await call(postJson("/api/v1/de/anfrage", quote()), env0().env);
    expect(res.status).toBe(403);
    verdict.action = "de_quote";
    res = await call(new Request("https://api.bdimexport.com/api/v1/de/anfrage", { method: "POST", headers: { "content-type": "text/plain", origin: "https://bdimexport.com" }, body: "x" }), env0().env);
    expect(res.status).toBe(415);
  });
});

describe("POST /api/v1/de/optin/bestaetigen", () => {
  it("geçerli token → 200 confirmed; ikinci kullanım → 410 (tek kullanımlık)", async () => {
    const env = trackPuts(env0().env);
    await call(postJson("/api/v1/de/anfrage", quote()), env);
    const [mk] = await keys(env, "mailq:");
    const { token } = JSON.parse((await env.CACHE.get(mk))!);
    let res = await call(postJson("/api/v1/de/optin/bestaetigen", { token }, "203.0.113.8"), env);
    expect(res.status).toBe(200);
    expect(await res.json()).toEqual({ status: "confirmed" });
    res = await call(postJson("/api/v1/de/optin/bestaetigen", { token }, "203.0.113.8"), env);
    expect(res.status).toBe(410);
  });

  it("biçimsiz token → 400; bilinmeyen token → 410", async () => {
    const { env } = env0();
    expect((await call(postJson("/api/v1/de/optin/bestaetigen", { token: "kurz" }), env)).status).toBe(400);
    expect((await call(postJson("/api/v1/de/optin/bestaetigen", { token: "A".repeat(43) }), env)).status).toBe(410);
  });
});
