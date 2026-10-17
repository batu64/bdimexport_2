"use client";
// FAZ_3 3.8 — Ayarlar formu: kanal tercihleri · iletişim kanalları · bölge uzmanları · RSS kaynakları · webhook hedefleri · Turnstile site-key ·
// rate-limit eşikleri · rate-limit GÖRÜNÜMÜ (salt-okunur). Secret alanı YOK (Workers secret; webhook'ta yalnız secret ADI girilir).
// Sunucu doğrular (schema.ts: secret reddi dahil); UI yalnızca durum gösterir. Her kayıt audit'e düşer (store.ts → withAudit).
import { useEffect, useState } from "react";
import styles from "../admin.module.css";
import { useAdminGet } from "../_lib/api";
import {
  CHANNELS, DEFAULTS, WEBHOOK_EVENTS,
  type ChannelId, type ExpertProfile, type RssSource, type Settings, type SettingKey, type WebhookEvent, type WebhookTarget,
} from "./schema";

const BASE = process.env.NEXT_PUBLIC_ADMIN_API_BASE ?? "/api/admin";
const LOCALES = ["tr", "en", "de", "zh", "en-ru", "en-fr", "en-nl", "en-es", "en-ar"];

type Msg = { kind: "ok" | "err"; text: string } | null;
type RlView = { rows: { scope: string; id: string; count: number; window: "current" | "previous" }[]; byScope: Record<string, number>; truncated: boolean; note: string };

const newId = (prefix: string) => `${prefix}-${Math.random().toString(36).slice(2, 8)}`;

function RateLimitView() {
  const res = useAdminGet<RlView>("/settings/rate-limits");
  return (
    <section className={styles.card}>
      <h2 className={styles.cardTitle}>Rate-limit görünümü (salt-okunur)</h2>
      {res.state === "loading" && <p className={styles.muted}>Yükleniyor…</p>}
      {res.state === "error" && <p className={styles.muted}>Görünüm alınamadı ({res.message}); API bağlanınca dolar.</p>}
      {res.state === "ready" &&
        (res.data.rows.length === 0 ? (
          <p className={styles.muted}>Son dakikada kayıtlı istek yok.</p>
        ) : (
          <>
            <p className={styles.muted}>{Object.entries(res.data.byScope).map(([k, v]) => `${k}: ${v}`).join(" · ")}</p>
            <div className={styles.tableWrap}>
              <table className={styles.table}>
                <thead><tr><th>Uç / kapsam</th><th>Kimlik (maskeli)</th><th>İstek</th><th>Pencere</th></tr></thead>
                <tbody>
                  {res.data.rows.map((r, i) => (
                    <tr key={`${r.scope}-${r.id}-${r.window}-${i}`}>
                      <td>{r.scope}</td><td>{r.id}</td><td>{r.count}</td><td>{r.window === "current" ? "bu dakika" : "önceki dakika"}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <p className={styles.muted}>{res.data.note}{res.data.truncated ? " Liste kısaltıldı." : ""}</p>
          </>
        ))}
    </section>
  );
}

export default function SettingsForm({ readOnly = false }: { readOnly?: boolean }) {
  const [s, setS] = useState<Settings | null>(null);
  const [secretOk, setSecretOk] = useState(false);
  const [loadErr, setLoadErr] = useState<string | null>(null);
  const [msg, setMsg] = useState<Record<string, Msg>>({});

  useEffect(() => {
    const ctl = new AbortController();
    fetch(`${BASE}/settings`, { credentials: "same-origin", signal: ctl.signal })
      .then((r) => (r.ok ? r.json() : Promise.reject(new Error(`HTTP ${r.status}`))))
      .then((d: { settings: Settings; turnstileSecretConfigured: boolean }) => {
        setS({ ...structuredClone(DEFAULTS), ...d.settings });
        setSecretOk(d.turnstileSecretConfigured);
      })
      .catch((e: unknown) => {
        if (!ctl.signal.aborted) {
          setLoadErr(e instanceof Error ? e.message : "bilinmeyen hata");
          setS(structuredClone(DEFAULTS)); // API bağlanana dek varsayılanlarla gösterilir
        }
      });
    return () => ctl.abort();
  }, []);

  async function save<K extends SettingKey>(key: K) {
    if (!s) return;
    setMsg((m) => ({ ...m, [key]: null }));
    try {
      const r = await fetch(`${BASE}/settings`, {
        method: "PUT",
        credentials: "same-origin",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ key, value: s[key] }),
      });
      const d = (await r.json()) as { message?: string; code?: string };
      setMsg((m) => ({ ...m, [key]: r.ok ? { kind: "ok", text: "Kaydedildi (audit'e yazıldı)" } : { kind: "err", text: d.message ?? d.code ?? `HTTP ${r.status}` } }));
    } catch (e) {
      setMsg((m) => ({ ...m, [key]: { kind: "err", text: e instanceof Error ? e.message : "ağ hatası" } }));
    }
  }

  if (!s) return <p className={styles.muted}>Yükleniyor…</p>;

  const setChannels = (loc: string | "fallback", list: ChannelId[]) =>
    setS(
      loc === "fallback"
        ? { ...s, channelPrefs: { ...s.channelPrefs, fallback: list.length ? list : s.channelPrefs.fallback } }
        : (() => {
            const by = { ...s.channelPrefs.byLocale };
            if (list.length) by[loc] = list;
            else delete by[loc];
            return { ...s, channelPrefs: { ...s.channelPrefs, byLocale: by } };
          })(),
    );

  const toggle = <T,>(cur: T[], c: T) => (cur.includes(c) ? cur.filter((x) => x !== c) : [...cur, c]);

  const patchExpert = (i: number, p: Partial<ExpertProfile>) => setS({ ...s, experts: s.experts.map((e, j) => (j === i ? { ...e, ...p } : e)) });
  const patchRss = (i: number, p: Partial<RssSource>) => setS({ ...s, rssSources: s.rssSources.map((e, j) => (j === i ? { ...e, ...p } : e)) });
  const patchHook = (i: number, p: Partial<WebhookTarget>) => setS({ ...s, webhooks: s.webhooks.map((e, j) => (j === i ? { ...e, ...p } : e)) });

  const Status = ({ k }: { k: string }) =>
    msg[k] ? <p role="status" className={msg[k]!.kind === "err" ? styles.err : styles.muted}>{msg[k]!.text}</p> : null;

  return (
    <div className={styles.stack}>
      {loadErr && <p className={styles.err}>Ayarlar API'sine ulaşılamadı ({loadErr}); varsayılanlar gösteriliyor. Kayıt, API bağlanana dek başarısız olur.</p>}
      {readOnly && <p className={styles.note}>Salt-okunur rol: değişiklik yapamazsınız.</p>}

      <section className={styles.card}>
        <h2 className={styles.cardTitle}>Kanal tercihleri</h2>
        <p className={styles.muted}>Sıra = tıklama sırası; ilk seçilen birincil kanaldır. Boş bırakılan locale yedek listeyi kullanır. Numarası tanımsız kanal sitede gösterilmez.</p>
        {[...LOCALES, "fallback"].map((loc) => {
          const cur = loc === "fallback" ? s.channelPrefs.fallback : s.channelPrefs.byLocale[loc] ?? [];
          return (
            <fieldset key={loc} className={styles.fs} disabled={readOnly}>
              <legend>{loc === "fallback" ? "Yedek (tanımsız locale)" : loc}</legend>
              {CHANNELS.map((c) => (
                <label key={c} className={styles.opt}>
                  <input type="checkbox" checked={cur.includes(c)} onChange={() => setChannels(loc, toggle(cur, c))} /> {c}
                  {cur.includes(c) ? ` (${cur.indexOf(c) + 1})` : ""}
                </label>
              ))}
            </fieldset>
          );
        })}
        <button type="button" disabled={readOnly} onClick={() => save("channelPrefs")}>Kanal tercihlerini kaydet</button>
        <Status k="channelPrefs" />
      </section>

      <section className={styles.card}>
        <h2 className={styles.cardTitle}>İletişim kanalı bilgileri</h2>
        <p className={styles.muted}>Sitede herkese açık gösterilir (secret değil). Boş = tanımsız.</p>
        {(
          [
            ["whatsapp", "WhatsApp (+90…)", "tel"],
            ["telegram", "Telegram kullanıcı adı", "text"],
            ["wechat", "WeChat ID", "text"],
            ["email", "E-posta", "email"],
          ] as const
        ).map(([k, label, type]) => (
          <div key={k} className={styles.rowForm}>
            <label>
              {label}{" "}
              <input type={type} disabled={readOnly} value={s.contacts[k]} autoComplete="off" spellCheck={false} onChange={(e) => setS({ ...s, contacts: { ...s.contacts, [k]: e.target.value } })} />
            </label>
          </div>
        ))}
        <button type="button" disabled={readOnly} onClick={() => save("contacts")}>İletişim bilgilerini kaydet</button>
        <Status k="contacts" />
      </section>

      <section className={styles.card}>
        <h2 className={styles.cardTitle}>Bölge uzmanı profilleri</h2>
        <p className={styles.muted}>Foto: https adresi veya sitenin /media/ yolu (yükleme ayrı adım). En fazla 20.</p>
        {s.experts.map((e, i) => (
          <div key={e.id} className={styles.rowForm}>
            <input aria-label="İsim" placeholder="İsim" disabled={readOnly} value={e.name} onChange={(ev) => patchExpert(i, { name: ev.target.value })} />
            <select aria-label="Locale" disabled={readOnly} value={e.locale} onChange={(ev) => patchExpert(i, { locale: ev.target.value })}>
              {LOCALES.map((l) => <option key={l} value={l}>{l}</option>)}
            </select>
            <input aria-label="Foto URL" placeholder="Foto URL (opsiyonel)" disabled={readOnly} value={e.photoUrl} onChange={(ev) => patchExpert(i, { photoUrl: ev.target.value })} />
            <button type="button" disabled={readOnly} onClick={() => setS({ ...s, experts: s.experts.filter((_, j) => j !== i) })}>Sil</button>
          </div>
        ))}
        <button type="button" disabled={readOnly || s.experts.length >= 20} onClick={() => setS({ ...s, experts: [...s.experts, { id: newId("uzman"), name: "", locale: "tr", photoUrl: "" }] })}>Uzman ekle</button>{" "}
        <button type="button" disabled={readOnly} onClick={() => save("experts")}>Uzmanları kaydet</button>
        <Status k="experts" />
      </section>

      <section className={styles.card}>
        <h2 className={styles.cardTitle}>RSS kaynakları</h2>
        <p className={styles.muted}>İçerik Fabrikası (Input B) ve RSS cron'u bu listeyi okur. Yalnız https, genel alan adı; URL'de anahtar/token olamaz.</p>
        {s.rssSources.map((r, i) => (
          <div key={r.id} className={styles.rowForm}>
            <input aria-label="Kaynak adı" placeholder="Ad" disabled={readOnly} value={r.name} onChange={(ev) => patchRss(i, { name: ev.target.value })} />
            <input aria-label="Feed URL" placeholder="https://…/feed.xml" disabled={readOnly} value={r.url} spellCheck={false} onChange={(ev) => patchRss(i, { url: ev.target.value })} />
            <label><input type="checkbox" disabled={readOnly} checked={r.enabled} onChange={(ev) => patchRss(i, { enabled: ev.target.checked })} /> aktif</label>
            <button type="button" disabled={readOnly} onClick={() => setS({ ...s, rssSources: s.rssSources.filter((_, j) => j !== i) })}>Sil</button>
          </div>
        ))}
        <button type="button" disabled={readOnly || s.rssSources.length >= 50} onClick={() => setS({ ...s, rssSources: [...s.rssSources, { id: newId("rss"), name: "", url: "", enabled: true }] })}>Kaynak ekle</button>{" "}
        <button type="button" disabled={readOnly} onClick={() => save("rssSources")}>RSS kaynaklarını kaydet</button>
        <Status k="rssSources" />
      </section>

      <section className={styles.card}>
        <h2 className={styles.cardTitle}>Webhook bildirim hedefleri</h2>
        <p className={styles.muted}>
          Webhook URL'leri secret içerir → panele girilmez. Önce <code>wrangler secret put &lt;AD&gt;_WEBHOOK_URL</code> (insan adımı), sonra buraya yalnız secret'ın ADI yazılır.
        </p>
        {s.webhooks.map((w, i) => (
          <div key={w.id} className={styles.rowForm}>
            <input aria-label="Hedef adı" placeholder="Ad" disabled={readOnly} value={w.name} onChange={(ev) => patchHook(i, { name: ev.target.value })} />
            <input aria-label="Secret adı" placeholder="ANALYTICS_ALERT_WEBHOOK_URL" disabled={readOnly} value={w.envVar} spellCheck={false} onChange={(ev) => patchHook(i, { envVar: ev.target.value.toUpperCase() })} />
            {WEBHOOK_EVENTS.map((ev) => (
              <label key={ev} className={styles.opt}>
                <input type="checkbox" disabled={readOnly} checked={w.events.includes(ev)} onChange={() => patchHook(i, { events: toggle<WebhookEvent>(w.events, ev) })} /> {ev}
              </label>
            ))}
            <button type="button" disabled={readOnly} onClick={() => setS({ ...s, webhooks: s.webhooks.filter((_, j) => j !== i) })}>Sil</button>
          </div>
        ))}
        <button type="button" disabled={readOnly || s.webhooks.length >= 10} onClick={() => setS({ ...s, webhooks: [...s.webhooks, { id: newId("hook"), name: "", envVar: "", events: ["lead_new"] }] })}>Hedef ekle</button>{" "}
        <button type="button" disabled={readOnly} onClick={() => save("webhooks")}>Webhook hedeflerini kaydet</button>
        <Status k="webhooks" />
      </section>

      <section className={styles.card}>
        <h2 className={styles.cardTitle}>Turnstile</h2>
        <label>
          <input type="checkbox" disabled={readOnly} checked={s.turnstile.enabled} onChange={(e) => setS({ ...s, turnstile: { ...s.turnstile, enabled: e.target.checked } })} /> Formlarda etkin
        </label>
        <div>
          <label>
            Site key (herkese açık){" "}
            <input type="text" disabled={readOnly} value={s.turnstile.siteKey} autoComplete="off" spellCheck={false} onChange={(e) => setS({ ...s, turnstile: { ...s.turnstile, siteKey: e.target.value } })} />
          </label>
        </div>
        <p className={styles.muted}>
          Secret key: {secretOk ? "Workers secret tanımlı ✓" : "tanımlı değil ✗"} — secret panelden girilmez/gösterilmez; <code>wrangler secret put TURNSTILE_SECRET</code> (insan adımı, 3.9).
        </p>
        <button type="button" disabled={readOnly} onClick={() => save("turnstile")}>Turnstile'ı kaydet</button>
        <Status k="turnstile" />
      </section>

      <section className={styles.card}>
        <h2 className={styles.cardTitle}>Rate-limit eşikleri (istek/dk)</h2>
        {(
          [
            ["formPerMin", "Public formlar (IP başına)", 1, 120],
            ["apiPerMin", "Public API varsayılanı (anahtar başına)", 1, 6000],
            ["adminPerMin", "Admin API (kullanıcı başına)", 10, 1200],
          ] as const
        ).map(([k, label, lo, hi]) => (
          <div key={k} className={styles.rowForm}>
            <label>
              {label} ({lo}–{hi}){" "}
              <input type="number" min={lo} max={hi} step={1} disabled={readOnly} value={s.rateLimits[k]} onChange={(e) => setS({ ...s, rateLimits: { ...s.rateLimits, [k]: Number(e.target.value) } })} />
            </label>
          </div>
        ))}
        <button type="button" disabled={readOnly} onClick={() => save("rateLimits")}>Eşikleri kaydet</button>
        <Status k="rateLimits" />
      </section>

      <RateLimitView />
    </div>
  );
}
