"use client";
// FAZ_3 3.5 — Partner Yönetimi (başvuru onayı = flywheel kapısı). Admin-only: menü/rota kapısı 3.2, sunucu kapısı handler.ts.
// consent_logo_en SALT-OKUNUR rozet — değiştirecek hiçbir kontrol yok (yalnız partner yeniden rıza verir).
// İletişim + vergi no sunucudan MASKELİ gelir. Tüm aksiyonlar sunucuda audit'e yazılır.
import { useCallback, useEffect, useState } from "react";
import styles from "../admin.module.css";
import k from "./partners.module.css";
import { MAX_LOGO_BYTES, type AdminPartner, type ListStatus } from "./lib.ts";

const BASE = process.env.NEXT_PUBLIC_ADMIN_API_BASE ?? "/admin/api";
const TABS: { id: ListStatus; label: string }[] = [
  { id: "pending", label: "Bekleyen başvurular" }, { id: "approved", label: "Onaylı" }, { id: "rejected", label: "Reddedilen" }, { id: "all", label: "Tümü" },
];
const STATUS_TR = { pending: "Bekliyor", approved: "Onaylı", rejected: "Reddedildi" } as const;
const ERR_TR: Record<string, string> = {
  kvkk_consent_missing: "KVKK rıza kaydı yok — onaylanamaz.", not_pending: "Başvuru artık beklemede değil.", stale: "Başka bir oturumda değişti — liste yenilendi.",
  reason_required: "Gerekçe en az 3 karakter olmalı.", consent_read_only: "Logo yayın rızası admin tarafından değiştirilemez.",
  invalid_logo_type: "Yalnız PNG, JPEG veya WebP (içerik doğrulanır; SVG kabul edilmez).", logo_too_large: "Logo 1 MB'tan büyük olamaz.", admin_only: "Bu modül yalnız admin rolüne açıktır.",
};

type Draft = { sector: string; capacity: string; certs: string; export_history: string };

async function send(path: string, init: RequestInit): Promise<{ status: number; body: Record<string, unknown> | null }> {
  const r = await fetch(`${BASE}/partners${path}`, { credentials: "same-origin", ...init });
  return { status: r.status, body: (await r.json().catch(() => null)) as Record<string, unknown> | null };
}
const jsonInit = (method: string, body: object): RequestInit => ({ method, headers: { "content-type": "application/json" }, body: JSON.stringify(body) });

export default function PartnersPage() {
  const [tab, setTab] = useState<ListStatus>("pending");
  const [list, setList] = useState<AdminPartner[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const [busy, setBusy] = useState<string | null>(null);
  const [reasons, setReasons] = useState<Record<string, string>>({});
  const [editing, setEditing] = useState<Record<string, Draft>>({});

  const load = useCallback(async (t: ListStatus) => {
    const r = await send(`?status=${t}`, { method: "GET" }).catch(() => null);
    if (!r) { setError("Bağlantı hatası — partnerler alınamadı."); return; }
    if (r.status !== 200) { setError(ERR_TR[String(r.body?.error)] ?? `Partnerler alınamadı (HTTP ${r.status}).`); return; }
    setError(null);
    setList((r.body?.data as AdminPartner[]) ?? []);
  }, []);
  useEffect(() => { setList(null); void load(tab); }, [tab, load]);

  async function act(p: AdminPartner, path: string, init: RequestInit, ok: string) {
    setBusy(p.id);
    const r = await send(`/${encodeURIComponent(p.id)}${path}`, init).catch(() => null);
    setBusy(null);
    if (r?.status === 200) { setNotice(`${p.name}: ${ok} (audit'e yazıldı)`); void load(tab); return true; }
    setNotice(ERR_TR[String(r?.body?.error)] ?? `İşlem başarısız (HTTP ${r?.status ?? "ağ"}).`);
    if (r?.status === 409) void load(tab);
    return false;
  }

  const startEdit = (p: AdminPartner) => setEditing((e) => ({ ...e, [p.id]: { sector: p.sector ?? "", capacity: p.capacity ?? "", certs: p.certs.join(", "), export_history: p.export_history ?? "" } }));
  async function saveEdit(p: AdminPartner) {
    const d = editing[p.id];
    const certs = d.certs.split(",").map((s) => s.trim()).filter(Boolean);
    if (await act(p, "", jsonInit("PATCH", { sector: d.sector, capacity: d.capacity, export_history: d.export_history, certs }), "bilgiler güncellendi")) {
      setEditing((e) => { const n = { ...e }; delete n[p.id]; return n; });
    }
  }
  async function upload(p: AdminPartner, file: File | undefined) {
    if (!file) return;
    if (file.size > MAX_LOGO_BYTES) { setNotice(ERR_TR.logo_too_large); return; } // UX — asıl kontrol sunucuda
    const fd = new FormData();
    fd.set("logo", file);
    await act(p, "/logo", { method: "POST", headers: { "x-bdx-admin": "1" }, body: fd }, "logo yüklendi");
  }

  return (
    <>
      <h1 className={styles.h1}>Partner Yönetimi</h1>
      <div role="tablist" aria-label="Başvuru durumu" className={k.tabs}>
        {TABS.map((t) => (
          <button key={t.id} role="tab" aria-selected={tab === t.id} className={tab === t.id ? k.tabOn : k.tab} onClick={() => setTab(t.id)} type="button">{t.label}</button>
        ))}
      </div>
      <p className={styles.muted}>Onaylanan partnerler yabancı dil sayfalarında &quot;Verified Turkish Partner&quot; olarak listelenir. Logo yalnız partnerin logo yayın rızası varsa gösterilir — bu rıza buradan değiştirilemez.</p>
      {notice && <p role="status" className={styles.note}>{notice}</p>}
      {error && <p role="alert" className={styles.err}>{error}</p>}
      {!list && !error && <div className={styles.skel} aria-busy="true" />}
      {list && list.length === 0 && <section className={styles.card}><p className={styles.muted}>Bu sekmede kayıt yok.</p></section>}

      <div className={k.list}>
        {list?.map((p) => {
          const ed = editing[p.id];
          return (
            <article key={p.id} className={styles.card} aria-busy={busy === p.id}>
              <div className={k.head}>
                <h2 className={k.name}>{p.name}</h2>
                <span className={p.status === "approved" ? k.ok : k.warn}>{STATUS_TR[p.status]}</span>
              </div>
              <div className={k.badges}>
                <span className={p.kvkk_consent ? k.ok : k.warn}>{p.kvkk_consent ? `KVKK rızası ${p.kvkk_consent.version}` : "KVKK RIZA KAYDI YOK"}</span>
                <span className={p.consent_logo_en ? k.ok : k.warn} title="Salt-okunur: yalnız partner yeniden rıza verebilir">
                  Logo yayın rızası: {p.consent_logo_en ? "Var" : "Yok"} (salt-okunur)
                </span>
                <span className={k.ok}>{p.has_logo ? "Logo yüklü" : "Logo yok"}</span>
              </div>

              {!ed ? (
                <dl className={k.facts}>
                  <dt>Sektör</dt><dd>{p.sector ?? "—"}</dd>
                  <dt>Kapasite</dt><dd>{p.capacity ?? "—"}</dd>
                  <dt>Sertifikalar</dt><dd>{p.certs.length ? p.certs.join(", ") : "—"}</dd>
                  <dt>İhracat geçmişi</dt><dd>{p.export_history ?? "—"}</dd>
                  <dt>Vergi no</dt><dd>{p.tax_id}</dd>
                  <dt>Yetkili</dt><dd>{p.contact ? `${p.contact.name} · ${p.contact.email} · ${p.contact.phone}` : "—"}</dd>
                  <dt>Başvuru</dt><dd>{p.created_at}</dd>
                </dl>
              ) : (
                <form className={k.form} onSubmit={(e) => { e.preventDefault(); void saveEdit(p); }}>
                  {(["sector", "capacity", "certs", "export_history"] as const).map((f) => (
                    <label key={f}>
                      <span>{f === "sector" ? "Sektör" : f === "capacity" ? "Kapasite" : f === "certs" ? "Sertifikalar (virgülle)" : "İhracat geçmişi"}</span>
                      <input value={ed[f]} onChange={(e) => setEditing((x) => ({ ...x, [p.id]: { ...ed, [f]: e.target.value } }))} />
                    </label>
                  ))}
                  <div className={k.actions}>
                    <button type="submit" disabled={busy === p.id}>Kaydet</button>
                    <button type="button" onClick={() => setEditing((x) => { const n = { ...x }; delete n[p.id]; return n; })}>Vazgeç</button>
                  </div>
                </form>
              )}

              <div className={k.actions}>
                {p.status === "pending" && (
                  <button type="button" disabled={busy === p.id || !p.kvkk_consent} onClick={() => void act(p, "/approve", jsonInit("POST", {}), "onaylandı")}>Onayla</button>
                )}
                {(p.status === "pending" || p.status === "approved") && (
                  <>
                    <label className={k.reason}>
                      <span>Gerekçe</span>
                      <input value={reasons[p.id] ?? ""} onChange={(e) => setReasons((r) => ({ ...r, [p.id]: e.target.value }))} maxLength={500} />
                    </label>
                    {p.status === "pending" ? (
                      <button type="button" disabled={busy === p.id} onClick={() => void act(p, "/reject", jsonInit("POST", { reason: reasons[p.id] ?? "" }), "reddedildi")}>Reddet</button>
                    ) : (
                      <button type="button" disabled={busy === p.id} onClick={() => void act(p, "/unapprove", jsonInit("POST", { reason: reasons[p.id] ?? "" }), "onay geri alındı")}>Onayı geri al</button>
                    )}
                  </>
                )}
                {!ed && <button type="button" onClick={() => startEdit(p)}>Düzenle</button>}
                <label className={k.upload}>
                  <span>Logo yükle (PNG/JPEG/WebP, ≤ 1 MB)</span>
                  <input type="file" accept="image/png,image/jpeg,image/webp" disabled={busy === p.id} onChange={(e) => void upload(p, e.target.files?.[0])} />
                </label>
              </div>
            </article>
          );
        })}
      </div>
    </>
  );
}
