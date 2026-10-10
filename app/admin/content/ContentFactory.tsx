"use client";
// FAZ_3 3.6 — AI İçerik Fabrikası kontrol kulesi (Input A/B/C + draft kuyruğu + toplu onay + yayın + audit akışı)
// UI yalnızca ContentApi sözleşmesine bağlıdır. Şimdilik bellek-içi mock; Workers/D1 bağlanınca `api` prop'u değişir (Step 3.9).
import { useCallback, useEffect, useMemo, useState } from "react";
import { createMockContentApi } from "./mock";
import {
  CONTENT_LOCALES,
  PAGE_TYPES,
  TTL_WARN_HOURS,
  type AuditItem,
  type ContentApi,
  type ContentItem,
  type Intent,
  type JobItem,
  type NewsItem,
} from "./types";

type Tab = "A" | "B" | "C";
type Queue = "draft" | "approved" | "published";

const LOCALE_LABEL: Record<string, string> = {
  tr: "Türkçe", en: "English", de: "Deutsch", zh: "简体中文",
  "en-ru": "EN·RU", "en-fr": "EN·FR", "en-nl": "EN·NL", "en-es": "EN·ES", "en-ar": "EN·AR",
};

const box: React.CSSProperties = { border: "1px solid #d1d5db", borderRadius: 8, padding: 16, marginBottom: 16, background: "#fff" };
const btn: React.CSSProperties = { minHeight: 44, padding: "0 16px", borderRadius: 8, border: "1px solid #1A2B4A", background: "#1A2B4A", color: "#fff", cursor: "pointer" };
const btnGhost: React.CSSProperties = { ...btn, background: "#fff", color: "#1A2B4A" };
const input: React.CSSProperties = { width: "100%", minHeight: 44, padding: 8, borderRadius: 8, border: "1px solid #d1d5db", boxSizing: "border-box" };

function LocalePicker({ value, onChange }: { value: string[]; onChange: (v: string[]) => void }) {
  return (
    <fieldset style={{ border: 0, padding: 0, margin: "12px 0" }}>
      <legend>Hedef diller (I18N)</legend>
      {CONTENT_LOCALES.map((l) => (
        <label key={l} style={{ marginRight: 12, whiteSpace: "nowrap" }}>
          <input
            type="checkbox"
            checked={value.includes(l)}
            onChange={(e) => onChange(e.target.checked ? [...value, l] : value.filter((x) => x !== l))}
          />{" "}
          {LOCALE_LABEL[l]}
        </label>
      ))}
    </fieldset>
  );
}

export default function ContentFactory({ api: apiProp, mockMode = true }: { api?: ContentApi; mockMode?: boolean }) {
  const api = useMemo(() => apiProp ?? createMockContentApi(), [apiProp]);
  const [tab, setTab] = useState<Tab>("A");
  const [queue, setQueue] = useState<Queue>("draft");
  const [news, setNews] = useState<NewsItem[]>([]);
  const [jobs, setJobs] = useState<JobItem[]>([]);
  const [items, setItems] = useState<ContentItem[]>([]);
  const [audit, setAudit] = useState<AuditItem[]>([]);
  const [sel, setSel] = useState<Set<string>>(new Set());
  const [newsSel, setNewsSel] = useState<Set<string>>(new Set());
  const [locales, setLocales] = useState<string[]>(["tr"]);
  const [pageType, setPageType] = useState<(typeof PAGE_TYPES)[number]>("article");
  const [text, setText] = useState("");
  const [phrase, setPhrase] = useState("");
  const [intent, setIntent] = useState<Intent | "">("");
  const [volume, setVolume] = useState("");
  const [editing, setEditing] = useState<ContentItem | null>(null);
  const [msg, setMsg] = useState<{ ok: boolean; text: string } | null>(null);

  const refresh = useCallback(async () => {
    const [n, j, c, a] = await Promise.all([api.listNews(), api.listJobs(), api.listDrafts(queue), api.listAudit()]);
    setNews(n); setJobs(j); setItems(c); setAudit(a);
    setSel((s) => new Set([...s].filter((id) => c.some((x) => x.id === id))));
  }, [api, queue]);

  useEffect(() => { void refresh(); }, [refresh]);

  async function run(label: string, fn: () => Promise<string | void>) {
    try {
      const r = await fn();
      setMsg({ ok: true, text: r ? `${label}: ${r}` : `${label}: tamam` });
    } catch (e) {
      setMsg({ ok: false, text: `${label}: hata — ${(e as Error).message}` });
    }
    await refresh();
  }

  const submit = (kind: Tab) =>
    run("Üretim isteği", async () => {
      if (kind === "A") await api.submitJob({ input: "A", text, locales, page_type: pageType });
      else if (kind === "B") await api.submitJob({ input: "B", news_ids: [...newsSel], locales, page_type: pageType });
      else
        await api.submitJob({
          input: "C", phrase, locales, page_type: pageType,
          intent: intent || undefined,
          volume: volume.trim() === "" ? null : Number(volume),
          volume_estimated: volume.trim() !== "",
        });
      if (kind === "A") setText("");
      if (kind === "B") setNewsSel(new Set());
      if (kind === "C") { setPhrase(""); setVolume(""); }
      return "ai_jobs kuyruğuna eklendi (pending)";
    });

  const bulk = (action: "approve" | "reject" | "publish") =>
    run(action === "approve" ? "Onay" : action === "publish" ? "Yayın" : "Red", async () => {
      const ids = [...sel];
      let r;
      if (action === "reject") {
        const reason = window.prompt("Red gerekçesi (zorunlu):") ?? "";
        r = await api.reject(ids, reason);
      } else r = await api[action](ids);
      setSel(new Set());
      return `${r.changed.length} işlendi${r.skipped.length ? `, ${r.skipped.length} atlandı (${r.skipped.map((s) => s.reason).join(", ")})` : ""}`;
    });

  const toggle = (set: Set<string>, id: string, fn: (s: Set<string>) => void) => {
    const n = new Set(set);
    if (n.has(id)) n.delete(id); else n.add(id);
    fn(n);
  };

  const canSubmitA = text.trim().length > 0 && locales.length > 0;
  const canSubmitB = newsSel.size > 0 && locales.length > 0;
  const canSubmitC = phrase.trim().length >= 3 && locales.length > 0;

  return (
    <main style={{ maxWidth: 1280, margin: "0 auto", padding: 24 }}>
      <h1>AI İçerik Fabrikası</h1>
      {mockMode && (
        <p role="note" style={{ background: "#fef3c7", padding: 8, borderRadius: 8 }}>
          MOCK modu — veriler bellek-içi; D1/Workers bağlantısı Step 3.9&apos;da. Üretim isteği ai_jobs kaydı oluşturur; model seçimi Faz 4&apos;te orchestrator&apos;da.
        </p>
      )}
      {msg && (
        <p role="status" style={{ background: msg.ok ? "#d1fae5" : "#fee2e2", padding: 8, borderRadius: 8 }}>{msg.text}</p>
      )}

      <section style={box} aria-label="Girdi">
        <div role="tablist" style={{ display: "flex", gap: 8, marginBottom: 12 }}>
          {([["A", "A · Metin yapıştır"], ["B", "B · RSS havuzu"], ["C", "C · Keyword"]] as [Tab, string][]).map(([k, l]) => (
            <button key={k} role="tab" aria-selected={tab === k} onClick={() => setTab(k)} style={tab === k ? btn : btnGhost}>{l}</button>
          ))}
        </div>

        {tab === "A" && (
          <div role="tabpanel">
            <label>Ham metin (güvenilmeyen girdi sayılır)
              <textarea value={text} onChange={(e) => setText(e.target.value)} rows={6} maxLength={20000} style={{ ...input, minHeight: 120 }} />
            </label>
          </div>
        )}

        {tab === "B" && (
          <div role="tabpanel">
            <p>RSS kaynak CRUD → Ayarlar modülü (3.8, ortak). Haber TTL 72s; &lt;{TTL_WARN_HOURS}s olanlar uyarılı.</p>
            <table style={{ width: "100%", borderCollapse: "collapse" }}>
              <thead><tr><th /><th align="left">Haber</th><th align="left">Kaynak</th><th align="left">Kalan TTL</th></tr></thead>
              <tbody>
                {news.map((n) => (
                  <tr key={n.id} style={{ background: n.ttl_warning ? "#fef3c7" : undefined }}>
                    <td><input type="checkbox" aria-label={`Seç: ${n.title}`} checked={newsSel.has(n.id)} onChange={() => toggle(newsSel, n.id, setNewsSel)} /></td>
                    <td>{n.title}</td>
                    <td>{n.source}</td>
                    <td data-testid={`ttl-${n.id}`}>{n.ttl_warning ? "⚠ " : ""}{n.hours_left} sa{n.ttl_warning ? " — yakında silinecek" : ""}</td>
                  </tr>
                ))}
                {news.length === 0 && <tr><td colSpan={4}>Havuz boş.</td></tr>}
              </tbody>
            </table>
          </div>
        )}

        {tab === "C" && (
          <div role="tabpanel" style={{ display: "grid", gap: 8, gridTemplateColumns: "2fr 1fr 1fr" }}>
            <label>Keyword (uzun kuyruk)
              <input value={phrase} onChange={(e) => setPhrase(e.target.value)} maxLength={200} style={input} />
            </label>
            <label>Intent
              <select value={intent} onChange={(e) => setIntent(e.target.value as Intent | "")} style={input}>
                <option value="">—</option>
                <option value="informational">informational</option>
                <option value="commercial">commercial</option>
                <option value="transactional">transactional</option>
              </select>
            </label>
            <label>Volume (elle girilen = tahmin)
              <input value={volume} inputMode="numeric" onChange={(e) => setVolume(e.target.value.replace(/\D/g, ""))} style={input} />
            </label>
          </div>
        )}

        <LocalePicker value={locales} onChange={setLocales} />
        <label>Sayfa tipi{" "}
          <select value={pageType} onChange={(e) => setPageType(e.target.value as typeof pageType)}>
            {PAGE_TYPES.map((p) => <option key={p}>{p}</option>)}
          </select>
        </label>{" "}
        <button
          style={{ ...btn, opacity: (tab === "A" ? canSubmitA : tab === "B" ? canSubmitB : canSubmitC) ? 1 : 0.5 }}
          disabled={!(tab === "A" ? canSubmitA : tab === "B" ? canSubmitB : canSubmitC)}
          onClick={() => submit(tab)}
        >
          {tab === "A" ? "SEO/GEO Metne Dönüştür" : tab === "B" ? `Seçilenlerden Üret (${newsSel.size})` : "Keyword'den Üret"}
        </button>
      </section>

      <section style={box} aria-label="Üretim kuyruğu">
        <h2>ai_jobs kuyruğu</h2>
        <table style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead><tr><th align="left">ID</th><th align="left">Girdi</th><th align="left">Diller</th><th align="left">Durum</th><th /></tr></thead>
          <tbody>
            {jobs.map((j) => (
              <tr key={j.id}>
                <td>{j.id}</td>
                <td>{String(j.payload.input ?? "")}</td>
                <td>{Array.isArray(j.payload.locales) ? (j.payload.locales as string[]).join(", ") : ""}</td>
                <td>{j.status}{j.last_error ? ` — ${j.last_error}` : ""}</td>
                <td>
                  {mockMode && j.status === "pending" && (
                    <button style={btnGhost} onClick={() => run("Mock üretim", async () => { const r = await api.mockProduce(j.id); return `${r.content_ids.length} draft`; })}>
                      Mock üretimi çalıştır
                    </button>
                  )}
                </td>
              </tr>
            ))}
            {jobs.length === 0 && <tr><td colSpan={5}>Kayıt yok.</td></tr>}
          </tbody>
        </table>
      </section>

      <section style={box} aria-label="Onay kuyruğu">
        <h2>İçerik kuyruğu</h2>
        <div role="tablist" style={{ display: "flex", gap: 8, marginBottom: 12 }}>
          {(["draft", "approved", "published"] as Queue[]).map((q) => (
            <button key={q} role="tab" aria-selected={queue === q} style={queue === q ? btn : btnGhost} onClick={() => { setQueue(q); setSel(new Set()); }}>{q}</button>
          ))}
        </div>
        <div style={{ display: "flex", gap: 8, marginBottom: 12 }}>
          <button style={btnGhost} onClick={() => setSel(sel.size === items.length ? new Set() : new Set(items.map((i) => i.id)))}>
            {sel.size === items.length && items.length > 0 ? "Seçimi kaldır" : "Tümünü seç"}
          </button>
          {queue === "draft" && (
            <>
              <button style={btn} disabled={sel.size === 0} onClick={() => bulk("approve")}>Seçilenleri onayla ({sel.size})</button>
              <button style={btnGhost} disabled={sel.size === 0} onClick={() => bulk("reject")}>Reddet</button>
            </>
          )}
          {queue === "approved" && (
            <button style={btn} disabled={sel.size === 0} onClick={() => bulk("publish")}>Yayınla ({sel.size}) — ayrı aksiyon</button>
          )}
        </div>
        <table style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead><tr><th /><th align="left">Başlık</th><th align="left">Dil</th><th align="left">Tip</th><th align="left">Model</th><th /></tr></thead>
          <tbody>
            {items.map((c) => (
              <tr key={c.id}>
                <td><input type="checkbox" aria-label={`Seç: ${c.title}`} checked={sel.has(c.id)} onChange={() => toggle(sel, c.id, setSel)} /></td>
                <td>{c.title}</td><td>{LOCALE_LABEL[c.locale] ?? c.locale}</td><td>{c.page_type}</td><td>{c.model ?? "—"}</td>
                <td>{c.status === "draft" && <button style={btnGhost} onClick={() => setEditing(c)}>Düzenle</button>}</td>
              </tr>
            ))}
            {items.length === 0 && <tr><td colSpan={6}>Bu kuyrukta içerik yok.</td></tr>}
          </tbody>
        </table>
      </section>

      {editing && (
        <section style={box} aria-label="Düzenle">
          <h2>Düzenle — {editing.slug} ({editing.locale})</h2>
          <label>Başlık<input value={editing.title} onChange={(e) => setEditing({ ...editing, title: e.target.value })} style={input} /></label>
          <label>Gövde (markdown)<textarea value={editing.body_md} rows={10} onChange={(e) => setEditing({ ...editing, body_md: e.target.value })} style={{ ...input, minHeight: 200 }} /></label>
          <button style={btn} onClick={() => run("Kaydet", async () => { await api.updateDraft(editing.id, { title: editing.title, body_md: editing.body_md }); setEditing(null); })}>Kaydet</button>{" "}
          <button style={btnGhost} onClick={() => setEditing(null)}>Vazgeç</button>
        </section>
      )}

      <section style={box} aria-label="Audit">
        <h2>Son aksiyonlar (audit)</h2>
        <ul>
          {audit.slice(0, 15).map((a) => (
            <li key={a.id}>{a.created_at} · {a.actor} · <b>{a.action}</b> · {a.entity_type}:{a.entity_id}</li>
          ))}
          {audit.length === 0 && <li>Henüz kayıt yok.</li>}
        </ul>
      </section>
    </main>
  );
}
