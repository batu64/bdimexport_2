"use client";
// FAZ_3 3.3 — Lead Merkezi (Kanban). Admin-only: menü/rota kapısı 3.2 (_lib/nav.ts), sunucu kapısı handler.ts (viewer → 403).
// KVKK: liste MASKELİ gelir (sunucu). "Göster" → POST reveal (audit'e yazılır) → ham iletişim + kanal linki yalnız o kartta,
// yalnız bellekte; sayfa yenilenince yine maskeli. Kanal linki YALNIZ channel_pref'ten (channel.ts).
import { Fragment, useCallback, useEffect, useMemo, useState } from "react";
import styles from "../admin.module.css";
import k from "./leads.module.css";
import { STATUSES, STATUS_LABEL, type LeadStatus, type MaskedLead, type RevealedContact } from "./lib.ts";
import type { ChannelAction } from "./channel.ts";

const BASE = process.env.NEXT_PUBLIC_ADMIN_API_BASE ?? "/admin/api";
const CHANNEL_LABEL: Record<string, string> = { whatsapp: "WhatsApp", telegram: "Telegram", wechat: "WeChat", email: "E-posta" };
const FIELD_LABEL: Record<keyof RevealedContact, string> = { name: "Ad", email: "E-posta", phone: "Telefon", whatsapp: "WhatsApp", telegram: "Telegram", wechat: "WeChat" };

type Revealed = { contact: RevealedContact; channel: ChannelAction | null };
type Filters = { locale: string; source_page: string; channel_pref: string };

async function post<T>(path: string, body: object): Promise<{ status: number; data: T | null }> {
  const r = await fetch(`${BASE}${path}`, {
    method: "POST", credentials: "same-origin",
    headers: { "content-type": "application/json" }, body: JSON.stringify(body),
  });
  return { status: r.status, data: (await r.json().catch(() => null)) as T | null };
}

export default function LeadsPage() {
  const [leads, setLeads] = useState<MaskedLead[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const [filters, setFilters] = useState<Filters>({ locale: "", source_page: "", channel_pref: "" });
  const [options, setOptions] = useState<{ locale: string[]; source_page: string[]; channel_pref: string[] }>({ locale: [], source_page: [], channel_pref: [] });
  const [revealed, setRevealed] = useState<Record<string, Revealed>>({});
  const [dragId, setDragId] = useState<string | null>(null);
  const [busy, setBusy] = useState<string | null>(null);

  const load = useCallback(async (f: Filters) => {
    const q = new URLSearchParams(Object.entries(f).filter(([, v]) => v));
    try {
      const r = await fetch(`${BASE}/leads${q.size ? `?${q}` : ""}`, { credentials: "same-origin" });
      if (r.status === 403) { setError("Bu modül yalnız admin rolüne açıktır."); return; }
      if (!r.ok) { setError(`Lead'ler alınamadı (HTTP ${r.status}).`); return; }
      const body = (await r.json()) as { data: MaskedLead[]; truncated: boolean };
      setLeads(body.data);
      setError(null);
      if (body.truncated) setNotice("İlk 500 kayıt gösteriliyor — filtre kullanın.");
      if (!Object.values(f).some(Boolean)) {
        const uniq = (key: "locale" | "source_page" | "channel_pref") =>
          [...new Set(body.data.map((l) => l[key]).filter((v): v is string => !!v))].sort();
        setOptions({ locale: uniq("locale"), source_page: uniq("source_page"), channel_pref: uniq("channel_pref") });
      }
    } catch {
      setError("Bağlantı hatası — lead'ler alınamadı.");
    }
  }, []);

  useEffect(() => { void load(filters); }, [filters, load]);

  const columns = useMemo(() => {
    const by: Record<LeadStatus, MaskedLead[]> = { new: [], contacted: [], qualified: [], closed: [] };
    for (const l of leads ?? []) by[l.status]?.push(l);
    return by;
  }, [leads]);

  async function move(lead: MaskedLead, to: LeadStatus) {
    if (lead.status === to || busy) return;
    setBusy(lead.id);
    const r = await post<{ error?: string; current?: LeadStatus }>(`/leads/${encodeURIComponent(lead.id)}/status`, { from: lead.status, to });
    setBusy(null);
    if (r.status === 200) {
      setLeads((ls) => ls?.map((l) => (l.id === lead.id ? { ...l, status: to } : l)) ?? ls);
      setNotice(`${lead.company ?? lead.id}: ${STATUS_LABEL[lead.status]} → ${STATUS_LABEL[to]} (audit'e yazıldı)`);
    } else if (r.status === 409) {
      setNotice("Bu lead başka bir oturumda güncellenmiş — liste yenilendi.");
      void load(filters);
    } else {
      setNotice(`Durum değiştirilemedi (HTTP ${r.status}).`);
    }
  }

  async function reveal(lead: MaskedLead) {
    setBusy(lead.id);
    const r = await post<Revealed>(`/leads/${encodeURIComponent(lead.id)}/reveal`, {});
    setBusy(null);
    if (r.status === 200 && r.data) setRevealed((x) => ({ ...x, [lead.id]: r.data! }));
    else setNotice(`İletişim bilgisi açılamadı (HTTP ${r.status}).`);
  }
  const hide = (id: string) => setRevealed((x) => { const n = { ...x }; delete n[id]; return n; });

  const copy = (v: string) => { void navigator.clipboard?.writeText(v); setNotice("WeChat ID kopyalandı."); };

  return (
    <>
      <h1 className={styles.h1}>Lead Merkezi</h1>

      <form className={k.filters} onSubmit={(e) => e.preventDefault()} aria-label="Lead filtreleri">
        {(["locale", "source_page", "channel_pref"] as const).map((key) => (
          <label key={key} className={k.filter}>
            <span>{key === "locale" ? "Dil" : key === "source_page" ? "Kaynak sayfa" : "Kanal"}</span>
            <select value={filters[key]} onChange={(e) => setFilters((f) => ({ ...f, [key]: e.target.value }))}>
              <option value="">Tümü</option>
              {options[key].map((v) => <option key={v} value={v}>{key === "channel_pref" ? CHANNEL_LABEL[v] ?? v : v}</option>)}
            </select>
          </label>
        ))}
      </form>

      <p className={styles.muted}>İletişim bilgileri KVKK gereği maskelidir. &quot;Göster&quot; işlemi kim/ne zaman bilgisiyle audit log&apos;a yazılır.</p>
      {notice && <p role="status" className={styles.note}>{notice}</p>}
      {error && <p role="alert" className={styles.err}>{error}</p>}
      {!leads && !error && <div className={styles.skel} aria-busy="true" />}

      {leads && (
        <div className={k.board}>
          {STATUSES.map((st) => (
            <section
              key={st}
              aria-label={`${STATUS_LABEL[st]} sütunu`}
              className={`${k.col} ${dragId ? k.dropReady : ""}`}
              onDragOver={(e) => e.preventDefault()}
              onDrop={(e) => {
                e.preventDefault();
                const lead = leads.find((l) => l.id === e.dataTransfer.getData("text/plain"));
                setDragId(null);
                if (lead) void move(lead, st);
              }}
            >
              <h2 className={styles.cardTitle}>{STATUS_LABEL[st]} · {columns[st].length}</h2>
              {columns[st].length === 0 && <p className={styles.muted}>Kayıt yok</p>}
              {columns[st].map((l) => {
                const rv = revealed[l.id];
                return (
                  <article
                    key={l.id}
                    className={k.lead}
                    draggable={busy !== l.id}
                    onDragStart={(e) => { e.dataTransfer.setData("text/plain", l.id); setDragId(l.id); }}
                    onDragEnd={() => setDragId(null)}
                    aria-busy={busy === l.id}
                  >
                    <strong>{l.company ?? "Firma belirtilmemiş"}</strong>
                    {l.product && <div className={styles.muted}>{l.product}</div>}
                    <div className={k.meta}>{l.locale} · {l.source_page} · {l.form_type}</div>
                    <div className={k.badges}>
                      <span className={l.consent.ok ? k.ok : k.warn}>{l.consent.text}</span>
                      <span className={l.retention.level === "ok" ? k.ok : k.warn}>{l.retention.text}</span>
                      <span className={k.ok}>{l.channel_pref ? CHANNEL_LABEL[l.channel_pref] ?? l.channel_pref : "Kanal yok"}</span>
                    </div>

                    {!rv ? (
                      <dl className={k.contact}>
                        <dt>Ad</dt><dd>{l.masked.name}</dd>
                        <dt>E-posta</dt><dd>{l.masked.email}</dd>
                        {l.masked.whatsapp !== "—" && <><dt>WhatsApp</dt><dd>{l.masked.whatsapp}</dd></>}
                        {l.masked.telegram !== "—" && <><dt>Telegram</dt><dd>{l.masked.telegram}</dd></>}
                        {l.masked.wechat !== "—" && <><dt>WeChat</dt><dd>{l.masked.wechat}</dd></>}
                      </dl>
                    ) : (
                      <dl className={k.contact}>
                        {(["name", "email", "phone", "whatsapp", "telegram", "wechat"] as const).map((f) =>
                          rv.contact[f] ? <Fragment key={f}><dt>{FIELD_LABEL[f]}</dt><dd>{rv.contact[f]}</dd></Fragment> : null)}
                      </dl>
                    )}

                    <div className={k.actions}>
                      {!rv ? (
                        <button type="button" onClick={() => void reveal(l)} disabled={busy === l.id}>Göster (audit&apos;li)</button>
                      ) : (
                        <>
                          <button type="button" onClick={() => hide(l.id)}>Gizle</button>
                          {rv.channel?.href && (
                            <a href={rv.channel.href} target="_blank" rel="noopener noreferrer">{rv.channel.label} ile yaz</a>
                          )}
                          {rv.channel && !rv.channel.href && rv.channel.copyValue && (
                            <button type="button" onClick={() => copy(rv.channel!.copyValue!)}>WeChat ID kopyala</button>
                          )}
                          {!rv.channel && <span className={styles.muted}>Tercih edilen kanal için geçerli iletişim bilgisi yok</span>}
                        </>
                      )}
                      <label className={k.move}>
                        <span>Taşı</span>
                        <select value={l.status} disabled={busy === l.id} onChange={(e) => void move(l, e.target.value as LeadStatus)}>
                          {STATUSES.map((s) => <option key={s} value={s}>{STATUS_LABEL[s]}</option>)}
                        </select>
                      </label>
                    </div>
                  </article>
                );
              })}
            </section>
          ))}
        </div>
      )}
    </>
  );
}
