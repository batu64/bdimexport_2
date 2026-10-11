// FAZ_1 Step 1.6 — Ücretsiz İhracat Hızlandırma başvuru formu (Opus 5.5 güvenlik review, 2026-10-12)
// Gönderim: POST {NEXT_PUBLIC_API_BASE}/api/v1/partners/apply (multipart) → workers/api/src/apply.ts
// Güvenlik sunucudadır (KVKK rızası, Turnstile action+hostname+replay, zod, PDF boyut/magic); buradaki kontroller yalnız UX.
// Yapılandırma eksikse form sahte başarı GÖSTERMEZ — "şu an alınamıyor" der ve gönderimi kapatır.

"use client";

import { useEffect, useRef, useState } from "react";
import { color, fontSize, radius, space, touchMin } from "@/lib/ui/tokens";

const API_BASE = process.env.NEXT_PUBLIC_API_BASE ?? "";
const SITE_KEY = process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY ?? "";
const TURNSTILE_ACTION = "partner_apply"; // sunucu: TURNSTILE_ACTION_APPLY (default partner_apply) ile birebir
const MAX_PDF_BYTES = 25 * 1024 * 1024;   // sunucu: MAX_PDF_BYTES

// Proje.md §2.2 alanları + KVKK v1 §1.2'de beyan edilen iletişim bilgileri
type FormState = {
  firmaAdi: string;
  vergiNo: string;
  sektor: string;
  katalogFile: File | null;
  kapasite: string;
  sertifikalar: string[];
  ihracatGecmisi: string;
  contactName: string;
  contactEmail: string;
  contactPhone: string;
  kvkkConsent: boolean;  // Bölüm 1 — zorunlu
  logoConsent: boolean;  // Bölüm 2 — ayrı, opsiyonel
};

type Status = "idle" | "submitting" | "done" | "error";

const CERT_OPTIONS = ["CE", "ISO 9001", "ISO 14001", "GOTS", "OEKO-TEX", "Diğer"];

// Sunucu alan adı → formdaki alan (hata yerleştirme)
const FIELD_MAP: Record<string, keyof FormState> = {
  firmaAdi: "firmaAdi", vergiNo: "vergiNo", sektor: "sektor", kapasite: "kapasite",
  ihracatGecmisi: "ihracatGecmisi", contactName: "contactName", contactEmail: "contactEmail",
  contactPhone: "contactPhone", kvkkConsent: "kvkkConsent", kvkkVersion: "kvkkConsent",
};

declare global {
  interface Window {
    turnstile?: {
      render: (el: HTMLElement, o: Record<string, unknown>) => string;
      reset: (id?: string) => void;
    };
  }
}

const s = {
  form: { maxWidth: 720, display: "grid", gap: space.s4 },
  input: {
    width: "100%", minHeight: touchMin, padding: space.s3, borderRadius: radius,
    border: `1px solid ${color.muted}`, fontSize: fontSize.base, boxSizing: "border-box",
  },
  hint: { fontSize: fontSize.xs, color: color.muted },
  err: { fontSize: fontSize.sm, color: color.ink, fontWeight: 600, marginTop: space.s1 },
  box: { border: `1px solid ${color.muted}`, borderRadius: radius, padding: space.s4 },
  boxOptional: { border: `1px dashed ${color.muted}`, borderRadius: radius, padding: space.s4 },
  checkRow: { display: "flex", gap: space.s2, alignItems: "flex-start" },
  certLabel: { marginInlineEnd: space.s4, display: "inline-flex", gap: space.s1, minHeight: touchMin, alignItems: "center" },
  submit: {
    minHeight: touchMin, padding: `${space.s3}px ${space.s6}px`, background: color.highlight, color: color.primary,
    border: "none", borderRadius: radius, fontWeight: 600, fontSize: fontSize.base,
  },
  notice: { border: `1px solid ${color.primary}`, borderRadius: radius, padding: space.s4 },
  done: { border: `1px solid ${color.accent}`, borderRadius: radius, padding: space.s8 },
} as const;

function FieldError({ id, msg }: { id: string; msg?: string }) {
  if (!msg) return null;
  return <div id={id} role="alert" style={s.err}>Hata: {msg}</div>;
}

export default function ApplicationForm({ kvkkVersion }: { kvkkVersion: string }) {
  const configured = API_BASE !== "" && SITE_KEY !== "";
  const [f, setF] = useState<FormState>({
    firmaAdi: "", vergiNo: "", sektor: "", katalogFile: null, kapasite: "", sertifikalar: [], ihracatGecmisi: "",
    contactName: "", contactEmail: "", contactPhone: "", kvkkConsent: false, logoConsent: false,
  });
  const [errors, setErrors] = useState<Partial<Record<keyof FormState | "form", string>>>({});
  const [status, setStatus] = useState<Status>("idle");
  const [token, setToken] = useState("");
  const widgetEl = useRef<HTMLDivElement>(null);
  const widgetId = useRef<string | undefined>(undefined);

  // Turnstile: açık (explicit) render — action sunucunun beklediğiyle bağlanır; token tek kullanımlık
  useEffect(() => {
    if (!configured || !widgetEl.current) return;
    const render = () => {
      if (!window.turnstile || !widgetEl.current || widgetId.current !== undefined) return;
      widgetId.current = window.turnstile.render(widgetEl.current, {
        sitekey: SITE_KEY,
        action: TURNSTILE_ACTION,
        callback: (t: string) => setToken(t),
        "expired-callback": () => setToken(""),
        "error-callback": () => setToken(""),
      });
    };
    if (window.turnstile) { render(); return; }
    const src = "https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit";
    let sc = document.querySelector<HTMLScriptElement>(`script[src="${src}"]`);
    if (!sc) {
      sc = document.createElement("script");
      sc.src = src;
      sc.async = true;
      document.head.appendChild(sc);
    }
    sc.addEventListener("load", render);
    return () => sc?.removeEventListener("load", render);
  }, [configured]);

  const set = <K extends keyof FormState>(k: K, v: FormState[K]) => setF((p) => ({ ...p, [k]: v }));

  function validate(): boolean {
    const e: typeof errors = {};
    if (!f.firmaAdi.trim()) e.firmaAdi = "Firma adı zorunlu.";
    if (!/^\d{10,11}$/.test(f.vergiNo.replace(/\s/g, ""))) e.vergiNo = "Vergi numarası 10 veya 11 haneli olmalı.";
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(f.contactEmail.trim())) e.contactEmail = "Geçerli bir e-posta adresi girin.";
    if (f.katalogFile && f.katalogFile.size > MAX_PDF_BYTES) e.katalogFile = "PDF 25 MB'tan küçük olmalı.";
    if (f.katalogFile && f.katalogFile.type !== "application/pdf") e.katalogFile = "Yalnızca PDF yükleyebilirsiniz.";
    if (!f.kvkkConsent) e.kvkkConsent = "KVKK açık rızası olmadan başvuru gönderilemez.";
    if (!token) e.form = "Lütfen güvenlik doğrulamasını tamamlayın.";
    setErrors(e);
    return Object.keys(e).length === 0;
  }

  function resetTurnstile() {
    setToken("");
    if (window.turnstile && widgetId.current !== undefined) window.turnstile.reset(widgetId.current);
  }

  async function submit(ev: React.FormEvent) {
    ev.preventDefault();
    if (!configured || status === "submitting" || !validate()) return;
    setStatus("submitting");

    const fd = new FormData();
    const text: [string, string][] = [
      ["firmaAdi", f.firmaAdi], ["vergiNo", f.vergiNo], ["sektor", f.sektor], ["kapasite", f.kapasite],
      ["ihracatGecmisi", f.ihracatGecmisi], ["contactName", f.contactName], ["contactEmail", f.contactEmail],
      ["contactPhone", f.contactPhone],
    ];
    for (const [k, v] of text) if (v.trim()) fd.set(k, v.trim());
    for (const c of f.sertifikalar) fd.append("sertifikalar", c);
    if (f.katalogFile) fd.set("katalogFile", f.katalogFile);
    fd.set("kvkkConsent", f.kvkkConsent ? "true" : "false");
    fd.set("kvkkVersion", kvkkVersion);
    if (f.logoConsent) fd.set("logoConsent", "true");
    fd.set("turnstileToken", token);

    let res: Response;
    try {
      res = await fetch(`${API_BASE}/api/v1/partners/apply`, { method: "POST", body: fd });
    } catch {
      resetTurnstile();
      setErrors({ form: "Bağlantı kurulamadı. İnternet bağlantınızı kontrol edip tekrar deneyin." });
      setStatus("error");
      return;
    }
    if (res.ok) { setStatus("done"); return; }

    resetTurnstile(); // token sunucuda tüketildi — her denemede yenisi gerekir
    const body = (await res.json().catch(() => null)) as
      | { error?: { code?: string; details?: { field: string; message: string }[] } } | null;
    const e: typeof errors = {};
    if (res.status === 400 && body?.error?.details?.length) {
      for (const d of body.error.details) {
        const k = FIELD_MAP[d.field] ?? "form";
        e[k] = e[k] ?? "Bu alanı kontrol edin.";
      }
    } else if (res.status === 400 && body?.error?.code === "invalid_file_type") {
      e.katalogFile = "Dosya geçerli bir PDF değil.";
    } else if (res.status === 409) {
      e.vergiNo = "Bu vergi numarasıyla daha önce başvuru yapılmış. Durum için bizimle iletişime geçin.";
    } else if (res.status === 413) {
      e.katalogFile = "Dosya çok büyük; PDF 25 MB'tan küçük olmalı.";
    } else if (res.status === 403) {
      e.form = "Güvenlik doğrulaması geçilemedi. Doğrulamayı yenileyip tekrar deneyin.";
    } else if (res.status === 429) {
      e.form = "Kısa sürede çok fazla deneme yapıldı. Bir dakika sonra tekrar deneyin.";
    } else {
      e.form = "Başvuru şu an alınamadı. Lütfen birkaç dakika sonra tekrar deneyin.";
    }
    setErrors(e);
    setStatus("error");
  }

  if (status === "done") {
    return (
      <div role="status" style={s.done}>
        <h2>Başvurunuz alındı</h2>
        <p>Ön değerlendirme sonucu 48 saat içinde {f.contactEmail.trim()} adresine e-posta ile bildirilir.</p>
      </div>
    );
  }

  if (!configured) {
    return (
      <div role="status" style={s.notice}>
        <p>Çevrimiçi başvuru şu an alınamıyor. Lütfen daha sonra tekrar deneyin.</p>
      </div>
    );
  }

  const aria = (k: keyof FormState) => ({
    "aria-invalid": !!errors[k],
    "aria-describedby": errors[k] ? `err-${k}` : undefined,
  });

  return (
    <form onSubmit={submit} noValidate style={s.form} aria-busy={status === "submitting"}>
      <div>
        <label htmlFor="firmaAdi">Firma Adı *</label>
        <input id="firmaAdi" style={s.input} value={f.firmaAdi} autoComplete="organization" maxLength={200}
          onChange={(e) => set("firmaAdi", e.target.value)} aria-required="true" {...aria("firmaAdi")} />
        <FieldError id="err-firmaAdi" msg={errors.firmaAdi} />
      </div>

      <div>
        <label htmlFor="vergiNo">Vergi No *</label>
        <input id="vergiNo" style={s.input} inputMode="numeric" value={f.vergiNo} maxLength={14}
          onChange={(e) => set("vergiNo", e.target.value)} aria-required="true" {...aria("vergiNo")} />
        <FieldError id="err-vergiNo" msg={errors.vergiNo} />
      </div>

      <div>
        <label htmlFor="sektor">Sektör</label>
        <input id="sektor" style={s.input} value={f.sektor} maxLength={120} placeholder="Örn: Tekstil, Gıda, Mobilya"
          onChange={(e) => set("sektor", e.target.value)} {...aria("sektor")} />
        <FieldError id="err-sektor" msg={errors.sektor} />
      </div>

      <div>
        <label htmlFor="katalog">Ürün Kataloğu (PDF, en fazla 25 MB)</label>
        <input id="katalog" type="file" accept="application/pdf" style={s.input}
          onChange={(e) => set("katalogFile", e.target.files?.[0] ?? null)} {...aria("katalogFile")} />
        <FieldError id="err-katalogFile" msg={errors.katalogFile} />
      </div>

      <div>
        <label htmlFor="kapasite">Üretim Kapasitesi</label>
        <input id="kapasite" style={s.input} value={f.kapasite} maxLength={300} placeholder="Örn: ayda 5.000 adet"
          onChange={(e) => set("kapasite", e.target.value)} {...aria("kapasite")} />
        <FieldError id="err-kapasite" msg={errors.kapasite} />
      </div>

      <fieldset>
        <legend>Sertifikalar</legend>
        {CERT_OPTIONS.map((c) => (
          <label key={c} style={s.certLabel}>
            <input type="checkbox" checked={f.sertifikalar.includes(c)}
              onChange={(e) => set("sertifikalar", e.target.checked ? [...f.sertifikalar, c] : f.sertifikalar.filter((x) => x !== c))} />
            {c}
          </label>
        ))}
      </fieldset>

      <div>
        <label htmlFor="gecmis">İhracat Geçmişi</label>
        <textarea id="gecmis" rows={3} style={s.input} value={f.ihracatGecmisi} maxLength={2000}
          placeholder="Varsa ülke, ürün ve yıl bilgisi" onChange={(e) => set("ihracatGecmisi", e.target.value)} {...aria("ihracatGecmisi")} />
        <FieldError id="err-ihracatGecmisi" msg={errors.ihracatGecmisi} />
      </div>

      <fieldset>
        <legend>İletişim</legend>
        <div style={{ display: "grid", gap: space.s4 }}>
          <div>
            <label htmlFor="contactName">Yetkili Adı Soyadı</label>
            <input id="contactName" style={s.input} value={f.contactName} autoComplete="name" maxLength={120}
              onChange={(e) => set("contactName", e.target.value)} {...aria("contactName")} />
            <FieldError id="err-contactName" msg={errors.contactName} />
          </div>
          <div>
            <label htmlFor="contactEmail">E-posta *</label>
            <input id="contactEmail" type="email" style={s.input} value={f.contactEmail} autoComplete="email" maxLength={200}
              onChange={(e) => set("contactEmail", e.target.value)} aria-required="true" {...aria("contactEmail")} />
            <FieldError id="err-contactEmail" msg={errors.contactEmail} />
          </div>
          <div>
            <label htmlFor="contactPhone">Telefon / WhatsApp</label>
            <input id="contactPhone" type="tel" style={s.input} value={f.contactPhone} autoComplete="tel" maxLength={40}
              onChange={(e) => set("contactPhone", e.target.value)} {...aria("contactPhone")} />
            <FieldError id="err-contactPhone" msg={errors.contactPhone} />
          </div>
        </div>
      </fieldset>

      {/* KVKK açık rızası — zorunlu (Bölüm 1). Sunucu da rızasız isteği 400 ile reddeder. */}
      <div style={s.box}>
        <label style={s.checkRow}>
          <input type="checkbox" checked={f.kvkkConsent} onChange={(e) => set("kvkkConsent", e.target.checked)}
            aria-required="true" {...aria("kvkkConsent")} />
          <span>
            KVKK Aydınlatma ve Açık Rıza Metni&apos;ni okudum; kişisel verilerimin işlenmesine açık rıza veriyorum.{" "}
            <a href="/kvkk-riza" target="_blank" rel="noopener">Metni görüntüle</a> (sürüm: {kvkkVersion})
          </span>
        </label>
        <FieldError id="err-kvkkConsent" msg={errors.kvkkConsent} />
      </div>

      {/* Logo yayın rızası — ayrı checkbox, opsiyonel (Bölüm 2) */}
      <div style={s.boxOptional}>
        <label style={s.checkRow}>
          <input type="checkbox" checked={f.logoConsent} onChange={(e) => set("logoConsent", e.target.checked)} />
          <span>
            Firma adımın, sektörümün ve logomun yabancı dil sayfalarında (İngilizce, Almanca vb.)
            &quot;Verified Turkish Partner&quot; olarak <strong>yayınlanmasına</strong> ayrıca rıza veriyorum.
            Bu rıza opsiyoneldir; vermeseniz de başvurunuz değerlendirilir.
          </span>
        </label>
      </div>

      <div ref={widgetEl} />
      {errors.form && <div role="alert" style={s.err}>Hata: {errors.form}</div>}

      <button type="submit" disabled={status === "submitting" || !f.kvkkConsent}
        style={{ ...s.submit, cursor: status === "submitting" ? "wait" : "pointer" }}>
        {status === "submitting" ? "Gönderiliyor…" : "Başvuruyu Gönder"}
      </button>
      <p style={s.hint}>* işaretli alanlar zorunludur. Logo yayın rızası ayrıdır ve isteğe bağlıdır.</p>
    </form>
  );
}
