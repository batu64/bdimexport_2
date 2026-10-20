// FAZ_4 4.1 kabul testleri — GERÇEK SQL (0001–0003) üzerinde entegrasyon; ağ yok (fetch mock).
// (1) 3 kaynak → D1 · (2) aynı feed 2x → dedup · (3) ölü kaynak → log, diğerleri akar · + zaman aşımı/retry/SSRF/ayrıştırma/TTL-silme-yok/AI-yok.
import { describe, it, expect, afterEach, vi } from "vitest";
import { readFileSync, readdirSync } from "node:fs";
import { resolve } from "node:path";
import { runIngest } from "../src/ingest";
import { parseFeed, normalizeUrl } from "../src/parse";
import { atom, hang, makeEnv, mockFeeds, rss2, setSources } from "./helpers";

const A = "https://feeds.example.com/a.xml";
const B = "https://feeds.example.org/b.atom";
const C = "https://news.example.net/c/rss";
const D = "https://dead.example.io/d.xml";
const src = (id: string, name: string, url: string, enabled = true) => ({ id, name, url, enabled });

afterEach(() => vi.unstubAllGlobals());
const rows = (raw: ReturnType<typeof makeEnv>["raw"]) =>
  raw.prepare("SELECT source, title, url, fetched_at, expires_at FROM rss_news ORDER BY url").all() as { source: string; title: string; url: string; fetched_at: string; expires_at: string }[];
const logs = () => {
  const out: string[] = [];
  const err: string[] = [];
  vi.spyOn(console, "log").mockImplementation((s) => void out.push(String(s)));
  vi.spyOn(console, "error").mockImplementation((s) => void err.push(String(s)));
  return { out, err };
};

describe("kabul 1 — 3 test kaynağı → D1", () => {
  it("RSS2 + Atom + CDATA/entity feed'leri rss_news'e yazılır; source = admin kaynak adı; expires_at = fetched_at + 72s; devre dışı kaynak çekilmez", async () => {
    const { env, raw } = makeEnv();
    setSources(raw, [src("kaynak-a", "Kaynak A", A), src("kaynak-b", "Kaynak B", B), src("kaynak-c", "Kaynak C", C), src("kapali", "Kapalı", D, false)]);
    const net = mockFeeds({
      [A]: rss2([{ title: "Zeytinyağı ihracatı arttı", link: "https://a.example.com/1" }, { title: "Mobilya &amp; dekor", link: "https://a.example.com/2" }]),
      [B]: atom([{ title: "Atom haber", href: "https://b.example.org/x" }]),
      [C]: rss2([{ title: "<![CDATA[Tekstil <b>trendi</b>]]>", link: "https://c.example.net/t?id=7" }]),
      [D]: "kapalı kaynak çekilmemeli",
    });
    const t0 = new Date("2026-10-19T12:00:00Z");
    const res = await runIngest(env, t0);
    expect(res.sources_total).toBe(3);
    expect(res.sources_ok).toBe(3);
    expect(res.inserted).toBe(4);
    expect(net.calls[D]).toBeUndefined(); // enabled=false → hiç istek yok
    const r = rows(raw);
    expect(r.map((x) => [x.source, x.title])).toEqual([
      ["Kaynak A", "Zeytinyağı ihracatı arttı"],
      ["Kaynak A", "Mobilya & dekor"], // entity çözüldü
      ["Kaynak B", "Atom haber"],
      ["Kaynak C", "Tekstil trendi"], // CDATA + etiket temizlendi
    ].sort((a, b) => (r.find((x) => x.title === a[1])!.url < r.find((x) => x.title === b[1])!.url ? -1 : 1)));
    for (const x of r) {
      expect(x.fetched_at).toBe("2026-10-19 12:00:00");
      expect(x.expires_at).toBe("2026-10-22 12:00:00"); // +72s tam
    }
  });

  it("settings'te rssSources yok → no-op (istek yok, hata yok)", async () => {
    const { env } = makeEnv();
    const net = mockFeeds({});
    const res = await runIngest(env);
    expect(res).toMatchObject({ sources_total: 0, inserted: 0, sources_failed: 0 });
    expect(net.log).toEqual([]);
  });
});

describe("kabul 2 — aynı feed iki kez → dedup", () => {
  it("2. çalışmada 0 yeni satır, duplicates sayılır; izleme parametreli aynı URL ve kaynaklar-arası aynı URL de tekrar yazılmaz", async () => {
    const { env, raw } = makeEnv();
    setSources(raw, [src("a1", "Kaynak A", A), src("b1", "Kaynak B", B)]);
    mockFeeds({
      [A]: rss2([{ title: "Haber 1", link: "https://x.example.com/1?utm_source=rss&utm_medium=feed" }, { title: "Haber 2", link: "https://x.example.com/2#yorumlar" }]),
      [B]: atom([{ title: "Haber 1 (başka kaynak)", href: "https://x.example.com/1" }]),
    });
    const first = await runIngest(env, new Date("2026-10-19T10:00:00Z"));
    expect(first.inserted).toBe(2); // 3 öğe: B'deki /1, A'daki utm'li /1 ile aynı URL → 2 benzersiz
    expect(first.results.find((r) => r.id === "b1")).toMatchObject({ inserted: 0, duplicates: 1 });
    const second = await runIngest(env, new Date("2026-10-19T11:00:00Z"));
    expect(second.inserted).toBe(0);
    expect(second.results.reduce((a, r) => a + r.duplicates, 0)).toBe(3);
    expect(rows(raw)).toHaveLength(2);
    // ilk kaydın zamanı korunur (üzerine yazılmaz → TTL uzamaz)
    expect(rows(raw)[0].fetched_at).toBe("2026-10-19 10:00:00");
  });

  it("feed içi tekrar eden öğe tek satır olur", async () => {
    const { env, raw } = makeEnv();
    setSources(raw, [src("a1", "Kaynak A", A)]);
    mockFeeds({ [A]: rss2([{ title: "Aynı", link: "https://x.example.com/9" }, { title: "Aynı (tekrar)", link: "https://x.example.com/9" }]) });
    await runIngest(env);
    expect(rows(raw)).toHaveLength(1);
  });
});

describe("kabul 3 — ölü kaynak → log, diğerleri akar", () => {
  it("5xx / ağ hatası / 404 / bozuk XML / zaman aşımı: her biri hata kodu + log; sağlam kaynaklar yazılır", async () => {
    const { env, raw } = makeEnv({ RSS_FETCH_TIMEOUT_MS: "40" });
    const urls = { ok1: A, ok2: C, e5xx: "https://e5xx.example.com/f", net: "https://net.example.com/f", e404: "https://e404.example.com/f", bad: "https://bad.example.com/f", slow: "https://slow.example.com/f" };
    setSources(raw, [
      src("ok1", "Sağlam 1", urls.ok1), src("e5xx", "5xx", urls.e5xx), src("net", "Ağ", urls.net), src("e404", "404", urls.e404),
      src("bad", "Bozuk", urls.bad), src("slow", "Yavaş", urls.slow), src("ok2", "Sağlam 2", urls.ok2),
    ]);
    const net = mockFeeds({
      [urls.ok1]: rss2([{ title: "Sağlam haber 1", link: "https://ok.example.com/1" }]),
      [urls.ok2]: rss2([{ title: "Sağlam haber 2", link: "https://ok.example.com/2" }]),
      [urls.e5xx]: () => new Response("boom", { status: 503 }),
      [urls.net]: () => { throw new TypeError("fetch failed"); },
      [urls.e404]: () => new Response("yok", { status: 404 }),
      [urls.bad]: "<html><body>Bu bir feed değil</body></html>",
      [urls.slow]: hang,
    });
    const l = logs();
    const res = await runIngest(env);
    const by = Object.fromEntries(res.results.map((r) => [r.id, r]));
    expect(by.ok1).toMatchObject({ status: "ok", inserted: 1 });
    expect(by.ok2).toMatchObject({ status: "ok", inserted: 1 });
    expect(by.e5xx).toMatchObject({ status: "error", error: "http_5xx", attempts: 2 }); // 1 yeniden deneme
    expect(by.net).toMatchObject({ status: "error", error: "network", attempts: 2 });
    expect(by.slow).toMatchObject({ status: "error", error: "timeout", attempts: 2 });
    expect(by.e404).toMatchObject({ status: "error", error: "http_4xx", attempts: 1 }); // kalıcı hata yeniden denenmez
    expect(by.bad).toMatchObject({ status: "error", error: "parse_failed" });
    expect(res).toMatchObject({ sources_total: 7, sources_ok: 2, sources_failed: 5, inserted: 2 });
    // çağrı sayıları: 5xx/ağ/zaman aşımı 2, 404 1
    expect([net.calls[urls.e5xx], net.calls[urls.net], net.calls[urls.slow], net.calls[urls.e404]]).toEqual([2, 2, 2, 1]);
    expect(rows(raw).map((r) => r.source).sort()).toEqual(["Sağlam 1", "Sağlam 2"]);
    // log: her ölü kaynak için console.error satırı (hata kodu ile), sağlamlar için console.log
    const errLines = l.err.map((s) => JSON.parse(s));
    expect(errLines.filter((e) => e.evt === "rss_source").map((e) => e.error).sort()).toEqual(["http_4xx", "http_5xx", "network", "parse_failed", "timeout"]);
    expect(l.out.filter((s) => s.includes('"evt":"rss_source"')).length).toBe(2);
  });

  it("zaman aşımı gerçekten keser: asılı kaynak ~timeout×2 sürede biter, çalışmayı kilitlemez", async () => {
    const { env, raw } = makeEnv({ RSS_FETCH_TIMEOUT_MS: "60" });
    setSources(raw, [src("slow", "Yavaş", D), src("ok", "Sağlam", A)]);
    mockFeeds({ [D]: hang, [A]: rss2([{ title: "x y", link: "https://ok.example.com/1" }]) });
    logs();
    const t = Date.now();
    const res = await runIngest(env);
    expect(Date.now() - t).toBeLessThan(1500);
    expect(res.results.find((r) => r.id === "ok")?.status).toBe("ok");
  });

  it("D1 yazma hatası bir kaynağı düşürür, diğerlerini DEĞİL (db_error izole)", async () => {
    const { env, raw } = makeEnv();
    setSources(raw, [src("a1", "Kaynak A", A), src("c1", "Kaynak C", C)]);
    mockFeeds({ [A]: rss2([{ title: "A haber", link: "https://x.example.com/a" }]), [C]: rss2([{ title: "C haber", link: "https://x.example.com/c" }]) });
    // yalnız "A" kaynağının satırlarını reddeden tetikleyici
    raw.exec("CREATE TRIGGER qa_fail BEFORE INSERT ON rss_news WHEN NEW.source = 'Kaynak A' BEGIN SELECT RAISE(ABORT,'qa: disk'); END");
    logs();
    const res = await runIngest(env);
    expect(res.results.find((r) => r.id === "a1")).toMatchObject({ status: "error", error: "db_error" });
    expect(res.results.find((r) => r.id === "c1")).toMatchObject({ status: "ok", inserted: 1 });
  });

  it("gövde boyut sınırı aşılırsa too_large (yeniden denenmez), diğerleri akar", async () => {
    const { env, raw } = makeEnv({ RSS_MAX_BYTES: "2000" });
    setSources(raw, [src("big", "Büyük", D), src("ok", "Sağlam", A)]);
    const net = mockFeeds({ [D]: "<rss><channel>" + "x".repeat(50_000) + "</channel></rss>", [A]: rss2([{ title: "x y", link: "https://ok.example.com/1" }]) });
    logs();
    const res = await runIngest(env);
    expect(res.results.find((r) => r.id === "big")).toMatchObject({ status: "error", error: "too_large", attempts: 1 });
    expect(net.calls[D]).toBe(1);
    expect(res.results.find((r) => r.id === "ok")?.status).toBe("ok");
  });
});

describe("güvenlik / sözleşme", () => {
  it("SSRF: D1'e elle yazılmış http://, IP, localhost, iç ad, kimlik bilgili ve secret-sorgulu kaynaklar ASLA çekilmez; geçerli kaynak akar", async () => {
    const { env, raw } = makeEnv();
    setSources(raw, [
      src("p1", "http", "http://feeds.example.com/x"), src("p2", "ip", "https://127.0.0.1/f"), src("p3", "meta", "https://169.254.169.254/latest"),
      src("p4", "local", "https://localhost/f"), src("p5", "iç", "https://metadata.internal/f"), src("p6", "cred", "https://u:p@feeds.example.com/f"),
      src("p7", "tok", "https://feeds.example.com/f?token=abc"), src("p8", "port", "https://feeds.example.com:8443/f"), { id: "p9", name: "bozuk" }, "çöp",
      src("ok", "Sağlam", A),
    ]);
    const net = mockFeeds({ [A]: rss2([{ title: "Tek geçerli", link: "https://ok.example.com/1" }]) });
    logs();
    const res = await runIngest(env);
    expect(res.sources_invalid).toBe(10);
    expect(net.log).toEqual([A]); // tek dış istek: geçerli kaynak
    expect(res.inserted).toBe(1);
  });

  it("yönlendirme sonrası nihai URL genel https değilse (iç adres) reddedilir", async () => {
    const { env, raw } = makeEnv();
    setSources(raw, [src("rd", "Yönlendirmeli", A), src("ok", "Sağlam", C)]);
    mockFeeds({
      [A]: () => Object.defineProperty(new Response(rss2([{ title: "x y", link: "https://x.example.com/1" }])), "url", { value: "https://10.0.0.5/feed" }),
      [C]: rss2([{ title: "Tamam", link: "https://x.example.com/2" }]),
    });
    logs();
    const res = await runIngest(env);
    expect(res.results.find((r) => r.id === "rd")).toMatchObject({ status: "error", error: "bad_redirect", attempts: 1 });
    expect(rows(raw)).toHaveLength(1);
  });

  it("geçersiz öğeler atlanır (javascript:/data:, başlıksız, linksiz, kimlik bilgili URL); göreli link feed adresine göre çözülür", () => {
    const xml = `<rss><channel>
      <item><title>js</title><link>javascript:alert(1)</link></item>
      <item><title>data</title><link>data:text/html,x</link></item>
      <item><link>https://x.example.com/basliksiz</link></item>
      <item><title>linksiz</title></item>
      <item><title>kimlik</title><link>https://u:p@x.example.com/a</link></item>
      <item><title>göreli</title><link>/haber/5?utm_campaign=z</link></item>
      <item><title>guid</title><guid isPermaLink="true">https://x.example.com/guid</guid></item>
    </channel></rss>`;
    const r = parseFeed(xml, "https://feeds.example.com/a.xml", 50);
    expect(r.items).toEqual([
      { title: "göreli", url: "https://feeds.example.com/haber/5" },
      { title: "guid", url: "https://x.example.com/guid" },
    ]);
    expect(r.skipped).toBe(5);
    expect(normalizeUrl("https://X.example.com/a?b=1&utm_source=z&fbclid=1#frag", "https://x.example.com")).toBe("https://x.example.com/a?b=1");
  });

  it("öğe sınırı: feed başına RSS_MAX_ITEMS_PER_FEED", async () => {
    const { env, raw } = makeEnv({ RSS_MAX_ITEMS_PER_FEED: "3" });
    setSources(raw, [src("aa", "Kaynak A", A)]);
    mockFeeds({ [A]: rss2(Array.from({ length: 10 }, (_, i) => ({ title: "Haber " + i, link: "https://x.example.com/" + i }))) });
    await runIngest(env);
    expect(rows(raw)).toHaveLength(3);
  });

  it("TTL silme BU worker'da YOK: süresi dolmuş satır çalışmadan sonra yerinde durur (4.2'nin işi)", async () => {
    const { env, raw } = makeEnv();
    raw.prepare("INSERT INTO rss_news (id, source, title, url, fetched_at, expires_at) VALUES ('old','S','eski','https://old.example.com/1','2020-01-01 00:00:00','2020-01-04 00:00:00')").run();
    setSources(raw, [src("aa", "Kaynak A", A)]);
    mockFeeds({ [A]: rss2([{ title: "Yeni haber", link: "https://x.example.com/new" }]) });
    await runIngest(env);
    expect(rows(raw).map((r) => r.url)).toContain("https://old.example.com/1");
    expect(readdirSync(resolve(__dirname, "../src")).join()).not.toMatch(/ttl|cleanup|prune/i);
    expect(readFileSync(resolve(__dirname, "../src/ingest.ts"), "utf8")).not.toMatch(/DELETE\s+FROM/i);
  });

  it("AI çağrısı YOK (ingest yolu): deterministik dosyalarda model/LLM/secret referansı yok ve enrich modüllerini içe aktarmaz; fetch yalnız fetch.ts'te", () => {
    const dir = resolve(__dirname, "../src");
    // 4.4 enrich-ailesi (model/prompt/schema/sanitize/enrich) AYRI modüllerdir; ingest/bakım/çekme yolu onlara bağımlı OLMAMALI
    const deterministic = ["fetch.ts", "ingest.ts", "maintenance.ts", "parse.ts", "sources.ts"];
    for (const f of deterministic) {
      const code = readFileSync(resolve(dir, f), "utf8").split("\n").filter((l) => !l.trim().startsWith("//")).join("\n");
      expect(code, f).not.toMatch(/gemini|openai|anthropic|claude|generativelanguage|api[_-]?key|secret|authorization/i);
      expect(code, f).not.toMatch(/from "\.\/(enrich|model|prompt|schema|sanitize)"/);
    }
    const callers = readdirSync(dir).filter((f) => /\bfetch\(/.test(readFileSync(resolve(dir, f), "utf8").replace(/\/\/.*$/gm, "")) && f !== "index.ts");
    expect(callers).toEqual(["fetch.ts"]);
  });
});
