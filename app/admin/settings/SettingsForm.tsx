"use client";
// FAZ_3 3.8 — Ayarlar formu: kanal tercihleri · Turnstile site-key · rate-limit eşikleri.
// Secret alanı YOK (Workers secret). Sunucu doğrular (schema.ts); UI yalnızca durum gösterir. Her kayıt audit'e düşer (handler).
import { useEffect, useState } from "react";
import styles from "../admin.module.css";
import { CHANNELS, DEFAULTS, type ChannelId, type Settings, type SettingKey } from "./schema";

const BASE = process.env.NEXT_PUBLIC_ADMIN_API_BASE ?? "/api/admin";
const LOCALES = ["tr", "en", "de", "zh", "en-ru", "en-fr", "en-nl", "en-es", "en-ar"];

type Msg = { kind: "ok" | "err"; text: string } | null;

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
        setS(d.settings);
        setSecretOk(d.turnstileSecretConfigured);
      })
      .catch((e: unknown) => {
        if (!ctl.signal.aborted) {
          setLoadErr(e instanceof Error ? e.message : "bilinmeyen hata");
          setS(structuredClone(DEFAULTS)); // API bağlanana dek (3.9) varsayılanlarla gösterilir
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

  const toggle = (cur: ChannelId[], c: ChannelId) => (cur.includes(c) ? cur.filter((x) => x !== c) : [...cur, c]);

  const Status = ({ k }: { k: string }) =>
    msg[k] ? <p role="status" className={msg[k]!.kind === "err" ? styles.err : styles.muted}>{msg[k]!.text}</p> : null;

  return (
    <>
      {loadErr && <p className={styles.err}>Ayarlar API'sine ulaşılamadı ({loadErr}); varsayılanlar gösteriliyor. Kayıt, API bağlanana dek (3.9) başarısız olur.</p>}
      {readOnly && <p className={styles.note}>Salt-okunur rol: değişiklik yapamazsınız.</p>}

      <section className={styles.card}>
        <h2 className={styles.cardTitle}>Kanal tercihleri</h2>
        <p className={styles.muted}>Sıra = tıklama sırası; ilk seçilen birincil kanaldır. Boş bırakılan locale yedek listeyi kullanır.</p>
        {[...LOCALES, "fallback"].map((loc) => {
          const cur = loc === "fallback" ? s.channelPrefs.fallback : s.channelPrefs.byLocale[loc] ?? [];
          return (
            <fieldset key={loc} style={{ border: 0, padding: 0, margin: "8px 0" }} disabled={readOnly}>
              <legend>{loc === "fallback" ? "Yedek (tanımsız locale)" : loc}</legend>
              {CHANNELS.map((c) => (
                <label key={c} style={{ marginRight: 12 }}>
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
          <div key={k}>
            <label>
              {label} ({lo}–{hi}){" "}
              <input type="number" min={lo} max={hi} step={1} disabled={readOnly} value={s.rateLimits[k]} onChange={(e) => setS({ ...s, rateLimits: { ...s.rateLimits, [k]: Number(e.target.value) } })} />
            </label>
          </div>
        ))}
        <button type="button" disabled={readOnly} onClick={() => save("rateLimits")}>Eşikleri kaydet</button>
        <Status k="rateLimits" />
      </section>
    </>
  );
}
