"use client";
// FAZ_3 3.6 — AI İçerik Fabrikası kontrol kulesi (Input A/B/C + draft kuyruğu + toplu onay + yayın + audit akışı)
// UI yalnızca ContentApi sözleşmesine bağlıdır: varsayılan HTTP istemcisi (handler.ts); NEXT_PUBLIC_CONTENT_MOCK="1" → bellek-içi mock.
// ONAY ≠ YAYIN: draft → approved (onay) ve approved → published (yayın) iki ayrı aksiyon/buton (ORCHESTRATOR §6).
// Renkler/aralıklar yalnız admin CSS değişkenleri (content.module.css); hex/px literal yok.
import { useCallback, useEffect, useMemo, useState } from "react";
import styles from "../admin.module.css";
import k from "./content.module.css";
import { createMockContentApi } from "./mock.ts";
import { createHttpContentApi } from "./api-client.ts";
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
} from "./types.ts";

type Tab = "A" | "B" | "C";
type Queue = "draft" | "approved" | "published";

const LOCALE_LABEL: Record<string, string> = {
  tr: "Türkçe", en: "English", de: "Deutsch", zh: "简体中文",
  "en-ru": "EN·RU", "en-fr": "EN·FR", "en-nl": "EN·NL", "en-es": "EN·ES", "en-ar": "EN·AR",
};
const QUEUE_LABEL: Record<Queue, string> = { draft: "Taslak", approved: "Onaylı (yayında değil)", published: "Yayında" };

function LocalePicker({ value, onChange }: { value: string[]; onChange: (v: string[]) => void }) {
  return (
    <fieldset className={k.fieldset}>
      <legend>Hedef diller (I18N)</legend>
      {CONTENT_LOCALES.map((l) => (
        <label key={l} className={k.check}>
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

export default function ContentFactory({
  api: apiProp,
  mockMode = process.env.NEXT_PUBLIC_CONTENT_MOCK === "1",
  allowMockProduce = mockMode,
}: { api?: ContentApi; mockMode?: boolean; allowMockProduce?: boolean }) {
  const api = useMemo(() => apiProp ?? (mockMode ? createMockContentApi() : createHttpContentApi()), [apiProp, mockMode]);
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
    try {
      const [n, j, c, a] = await Promise.all([api.listNews(), api.listJobs(), api.listDrafts(queue), api.listAudit()]);
      setNews(n); setJobs(j); setItems(c); setAudit(a);
      setSel((s) => new Set([...s].filter((id) => c.some((x) => x.id === id))));
    } catch (e) {
      setMsg({ ok: false, text: `Veri alınamadı — ${(e as Error).message}` });
    }
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
  const canSubmit = tab === "A" ? canSubmitA : tab === "B" ? canSubmitB : canSubmitC;

  return (
    <>
      <h1 className={styles.h1}>AI İçerik Fabrikası</h1>
      {mockMode && (
        <p role="note" className={k.warnNote}>
          MOCK modu — veriler bellek-içi (NEXT_PUBLIC_CONTENT_MOCK=1). Üretim isteği ai_jobs kaydı oluşturur; gerçek üretim FAZ 4&apos;te (Gemini, en sonda).
        </p>
      )}
      {msg && <p role="status" className={msg.ok ? k.okNote : k.errNote}>{msg.text}</p>}

      <section className={`${styles.card} ${k.block}`} aria-label="Girdi">
        <div role="tablist" className={k.tabs}>
          {([["A", "A · Metin yapıştır"], ["B", "B · RSS havuzu"], ["C", "C · Keyword"]] as [Tab, string][]).map(([t, l]) => (
            <button key={t} role="tab" aria-selected={tab === t} onClick={() => setTab(t)} className={tab === t ? k.btn : k.ghost}>{l}</button>
          ))}
        </div>

        {tab === "A" && (
          <div role="tabpanel">
            <label>Ham metin (güvenilmeyen girdi sayılır)
              <textarea value={text} onChange={(e) => setText(e.target.value)} rows={6} maxLength={20000} className={k.input} />
            </label>
          </div>
        )}

        {tab === "B" && (
          <div role="tabpanel">
            <p className={styles.muted}>
              Haber TTL 72 saat; kalan süresi {TTL_WARN_HOURS} saatin altındakiler uyarılı. RSS kaynak ekleme/düzenleme: kaynak tablosu
              henüz yok — FAZ 4.1 (RSS cron) ile gelecek; o zamana kadar havuz salt-okunur.
            </p>
            <table className={k.table}>
              <thead><tr><th /><th>Haber</th><th>Kaynak</th><th>Kalan TTL</th></tr></thead>
              <tbody>
                {news.map((n) => (
                  <tr key={n.id} className={n.ttl_warning ? k.ttlWarn : undefined}>
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
          <div role="tabpanel" className={k.kwGrid}>
            <label>Keyword (uzun kuyruk)
              <input value={phrase} onChange={(e) => setPhrase(e.target.value)} maxLength={200} className={k.input} />
            </label>
            <label>Intent
              <select value={intent} onChange={(e) => setIntent(e.target.value as Intent | "")} className={k.input}>
                <option value="">—</option>
                <option value="informational">informational</option>
                <option value="commercial">commercial</option>
                <option value="transactional">transactional</option>
              </select>
            </label>
            <label>Volume (elle girilen = tahmin)
              <input value={volume} inputMode="numeric" onChange={(e) => setVolume(e.target.value.replace(/\D/g, ""))} className={k.input} />
            </label>
          </div>
        )}

        <LocalePicker value={locales} onChange={setLocales} />
        <div className={k.tabs}>
          <label>Sayfa tipi{" "}
            <select value={pageType} onChange={(e) => setPageType(e.target.value as typeof pageType)} className={k.input}>
              {PAGE_TYPES.map((p) => <option key={p}>{p}</option>)}
            </select>
          </label>
          <button className={k.btn} disabled={!canSubmit} onClick={() => submit(tab)}>
            {tab === "A" ? "SEO/GEO Metne Dönüştür" : tab === "B" ? `Seçilenlerden Üret (${newsSel.size})` : "Keyword'den Üret"}
          </button>
        </div>
      </section>

      <section className={`${styles.card} ${k.block}`} aria-label="Üretim kuyruğu">
        <h2 className={styles.cardTitle}>ai_jobs kuyruğu</h2>
        <table className={k.table}>
          <thead><tr><th>ID</th><th>Girdi</th><th>Diller</th><th>Durum</th><th>Model</th><th /></tr></thead>
          <tbody>
            {jobs.map((j) => (
              <tr key={j.id}>
                <td>{j.id}</td>
                <td>{String(j.payload.input ?? "")}</td>
                <td>{Array.isArray(j.payload.locales) ? (j.payload.locales as string[]).join(", ") : ""}</td>
                <td>{j.status}{j.last_error ? ` — ${j.last_error}` : ""}</td>
                <td>{j.model ?? "— (FAZ 4)"}</td>
                <td>
                  {allowMockProduce && j.status === "pending" && (
                    <button className={k.ghost} onClick={() => run("Mock üretim", async () => { const r = await api.mockProduce(j.id); return `${r.content_ids.length} draft`; })}>
                      Mock üretimi çalıştır
                    </button>
                  )}
                </td>
              </tr>
            ))}
            {jobs.length === 0 && <tr><td colSpan={6}>Kayıt yok.</td></tr>}
          </tbody>
        </table>
      </section>

      <section className={`${styles.card} ${k.block}`} aria-label="Onay kuyruğu">
        <h2 className={styles.cardTitle}>İçerik kuyruğu</h2>
        <div role="tablist" className={k.tabs}>
          {(["draft", "approved", "published"] as Queue[]).map((q) => (
            <button key={q} role="tab" aria-selected={queue === q} className={queue === q ? k.btn : k.ghost} onClick={() => { setQueue(q); setSel(new Set()); }}>{QUEUE_LABEL[q]}</button>
          ))}
        </div>
        <p className={styles.muted}>Onay içeriği yayınlamaz: onaylanan içerik &quot;Onaylı&quot; sekmesinde bekler, yayın ayrı bir aksiyondur.</p>
        <div className={k.tabs}>
          <button className={k.ghost} onClick={() => setSel(sel.size === items.length ? new Set() : new Set(items.map((i) => i.id)))}>
            {sel.size === items.length && items.length > 0 ? "Seçimi kaldır" : "Tümünü seç"}
          </button>
          {queue === "draft" && (
            <>
              <button className={k.btn} disabled={sel.size === 0} onClick={() => bulk("approve")}>Seçilenleri onayla ({sel.size}) — yayınlamaz</button>
              <button className={k.ghost} disabled={sel.size === 0} onClick={() => bulk("reject")}>Reddet</button>
            </>
          )}
          {queue === "approved" && (
            <button className={k.btn} disabled={sel.size === 0} onClick={() => bulk("publish")}>Yayınla ({sel.size}) — ayrı aksiyon</button>
          )}
        </div>
        <table className={k.table}>
          <thead><tr><th /><th>Başlık</th><th>Dil</th><th>Tip</th><th>Model</th><th /></tr></thead>
          <tbody>
            {items.map((c) => (
              <tr key={c.id}>
                <td><input type="checkbox" aria-label={`Seç: ${c.title}`} checked={sel.has(c.id)} onChange={() => toggle(sel, c.id, setSel)} /></td>
                <td>{c.title}</td><td>{LOCALE_LABEL[c.locale] ?? c.locale}</td><td>{c.page_type}</td><td>{c.model ?? "—"}</td>
                <td>{c.status === "draft" && <button className={k.ghost} onClick={() => setEditing(c)}>Düzenle</button>}</td>
              </tr>
            ))}
            {items.length === 0 && <tr><td colSpan={6}>Bu kuyrukta içerik yok.</td></tr>}
          </tbody>
        </table>
      </section>

      {editing && (
        <section className={`${styles.card} ${k.block}`} aria-label="Düzenle">
          <h2 className={styles.cardTitle}>Düzenle — {editing.slug} ({editing.locale})</h2>
          <label>Başlık<input value={editing.title} onChange={(e) => setEditing({ ...editing, title: e.target.value })} className={k.input} /></label>
          <label>Gövde (markdown)<textarea value={editing.body_md} rows={10} onChange={(e) => setEditing({ ...editing, body_md: e.target.value })} className={k.input} /></label>
          <div className={k.tabs}>
            <button className={k.btn} onClick={() => run("Kaydet", async () => { await api.updateDraft(editing.id, { title: editing.title, body_md: editing.body_md }); setEditing(null); })}>Kaydet</button>
            <button className={k.ghost} onClick={() => setEditing(null)}>Vazgeç</button>
          </div>
        </section>
      )}

      <section className={`${styles.card} ${k.block}`} aria-label="Audit">
        <h2 className={styles.cardTitle}>Son aksiyonlar (audit)</h2>
        <ul>
          {audit.slice(0, 15).map((a) => (
            <li key={a.id}>{a.created_at} · {a.actor} · <b>{a.action}</b> · {a.entity_type}:{a.entity_id}</li>
          ))}
          {audit.length === 0 && <li>Henüz kayıt yok.</li>}
        </ul>
      </section>
    </>
  );
}
