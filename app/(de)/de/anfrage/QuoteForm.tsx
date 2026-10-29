// /de Angebotsanfrage formu — FAZ_5 5.6 DSGVO çift opt-in (🔒 insan review). Gönderim: POST {API_BASE}/api/v1/de/anfrage (JSON)
// → workers/api/src/optin.ts. Rıza kutusu ÖNCEDEN İŞARETLİ DEĞİL (Art. 7 DSGVO; EuGH Planet49); sunucu da consent === true ister.
// Güvenlik sunucudadır (Turnstile action+hostname+replay, zod, sürüm beyaz listesi); buradaki kontroller yalnız UX. Metin de.json'dan.
"use client";

import { useEffect, useRef, useState } from "react";
import { AlertCircle, Loader2, MailCheck, ShieldCheck } from "lucide-react";
import st from "@/app/components/form.module.css";
import dict from "@/lib/messages/de.json";
import { DE_CONSENT_VERSION } from "../_lib/datenschutz";

const API_BASE = process.env.NEXT_PUBLIC_API_BASE ?? "";
const SITE_KEY = process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY ?? "";
const TURNSTILE_ACTION = "de_quote"; // sunucu: TURNSTILE_ACTION_DE_QUOTE (default de_quote) ile birebir

type Fields = { name: string; company: string; email: string; phone: string; message: string };
type Key = keyof Fields | "consent" | "form";
const t = dict.anfrage;

function FieldError({ id, msg }: { id: string; msg?: string }) {
  if (!msg) return null;
  return <div id={id} role="alert" className={st.err}><AlertCircle aria-hidden="true" className={st.errIcon} />{t.errors.prefix}: {msg}</div>;
}

export default function QuoteForm() {
  const [f, setF] = useState<Fields>({ name: "", company: "", email: "", phone: "", message: "" });
  const [consent, setConsent] = useState(false); // önceden işaretli DEĞİL
  const [errors, setErrors] = useState<Partial<Record<Key, string>>>({});
  const [status, setStatus] = useState<"idle" | "submitting" | "pending" | "error">("idle");
  const [token, setToken] = useState("");
  const widgetEl = useRef<HTMLDivElement>(null);
  const widgetId = useRef<string | undefined>(undefined);

  // Turnstile: açık (explicit) render — action sunucunun beklediğiyle bağlı; token tek kullanımlık
  useEffect(() => {
    if (!widgetEl.current) return;
    const render = () => {
      if (!window.turnstile || !widgetEl.current || widgetId.current !== undefined) return;
      widgetId.current = window.turnstile.render(widgetEl.current, {
        sitekey: SITE_KEY,
        action: TURNSTILE_ACTION,
        language: "de",
        callback: (v: string) => setToken(v),
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
  }, []);

  const set = (k: keyof Fields, v: string) => setF((p) => ({ ...p, [k]: v }));

  function validate(): boolean {
    const e: typeof errors = {};
    if (!f.name.trim()) e.name = t.errors.name;
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(f.email.trim())) e.email = t.errors.email;
    if (f.message.trim().length < 10) e.message = t.errors.message;
    if (!consent) e.consent = t.errors.consent;
    if (!token) e.form = t.errors.turnstile;
    setErrors(e);
    return Object.keys(e).length === 0;
  }

  function resetTurnstile() {
    setToken("");
    if (window.turnstile && widgetId.current !== undefined) window.turnstile.reset(widgetId.current);
  }

  async function submit(ev: React.FormEvent) {
    ev.preventDefault();
    if (status === "submitting" || !validate()) return;
    setStatus("submitting");
    const body: Record<string, unknown> = {
      name: f.name.trim(), email: f.email.trim(), message: f.message.trim(),
      consent, consentVersion: DE_CONSENT_VERSION, turnstileToken: token,
    };
    if (f.company.trim()) body.company = f.company.trim();
    if (f.phone.trim()) body.phone = f.phone.trim();

    let res: Response;
    try {
      res = await fetch(`${API_BASE}/api/v1/de/anfrage`, { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify(body) });
    } catch {
      resetTurnstile();
      setErrors({ form: t.errors.network });
      setStatus("error");
      return;
    }
    if (res.status === 202) { setStatus("pending"); return; }

    resetTurnstile(); // token sunucuda tüketildi
    const j = (await res.json().catch(() => null)) as { error?: { details?: { field: string }[] } } | null;
    const e: typeof errors = {};
    if (res.status === 400 && j?.error?.details?.length) {
      for (const d of j.error.details) {
        const k = (["name", "email", "message", "consent"] as const).find((x) => x === d.field);
        if (k) e[k] = t.errors[k];
        else e.form = t.errors.generic;
      }
    } else if (res.status === 403) e.form = t.errors.forbidden;
    else if (res.status === 429) e.form = t.errors.rate;
    else e.form = t.errors.generic;
    setErrors(e);
    setStatus("error");
  }

  if (status === "pending") {
    return (
      <div role="status" className={st.done}>
        <MailCheck aria-hidden="true" className={st.doneIcon} />
        <h2>{t.pendingTitle}</h2>
        <p>{t.pendingText}</p>
      </div>
    );
  }

  const aria = (k: Key) => ({ "aria-invalid": !!errors[k], "aria-describedby": errors[k] ? `err-${k}` : undefined });
  const req = <span className="visually-hidden"> ({t.required})</span>;
  const opt = <span className={st.hint}> ({t.optional})</span>;

  return (
    <form onSubmit={submit} noValidate className={st.form} aria-busy={status === "submitting"}>
      <div className={st.pair}>
        <div className={st.field}>
          <label className={st.label} htmlFor="name">{t.fields.name} *{req}</label>
          <input id="name" className={st.input} value={f.name} autoComplete="name" maxLength={120}
            onChange={(e) => set("name", e.target.value)} aria-required="true" {...aria("name")} />
          <FieldError id="err-name" msg={errors.name} />
        </div>
        <div className={st.field}>
          <label className={st.label} htmlFor="company">{t.fields.company}{opt}</label>
          <input id="company" className={st.input} value={f.company} autoComplete="organization" maxLength={200}
            onChange={(e) => set("company", e.target.value)} />
        </div>
        <div className={st.field}>
          <label className={st.label} htmlFor="email">{t.fields.email} *{req}</label>
          <input id="email" type="email" className={st.input} value={f.email} autoComplete="email" maxLength={200}
            onChange={(e) => set("email", e.target.value)} aria-required="true" {...aria("email")} />
          <FieldError id="err-email" msg={errors.email} />
        </div>
        <div className={st.field}>
          <label className={st.label} htmlFor="phone">{t.fields.phone}{opt}</label>
          <input id="phone" type="tel" className={st.input} value={f.phone} autoComplete="tel" maxLength={40}
            onChange={(e) => set("phone", e.target.value)} />
        </div>
      </div>
      <div className={st.field}>
        <label className={st.label} htmlFor="message">{t.fields.message} *{req}</label>
        <textarea id="message" rows={5} className={st.input} value={f.message} maxLength={4000} placeholder={t.fields.messageHint}
          onChange={(e) => set("message", e.target.value)} aria-required="true" {...aria("message")} />
        <FieldError id="err-message" msg={errors.message} />
      </div>

      {/* Einwilligung — zorunlu, ÖNCEDEN İŞARETSİZ. Sunucu da rızasız / bilinmeyen sürümlü isteği 400 ile reddeder. */}
      <div className={st.consent}>
        <label className={st.checkRow}>
          <input type="checkbox" checked={consent} onChange={(e) => setConsent(e.target.checked)} aria-required="true" {...aria("consent")} />
          <span>
            {t.consent}{" "}
            <a href="/de/datenschutz" target="_blank" rel="noopener">{t.consentMore}</a> ({t.consentVersion}: {DE_CONSENT_VERSION})
          </span>
        </label>
        <FieldError id="err-consent" msg={errors.consent} />
      </div>
      <p className={st.hint}>{t.optinNote}</p>

      <div ref={widgetEl} className={st.turnstile} />
      {errors.form && <div role="alert" className={`${st.err} ${st.formErr}`}><AlertCircle aria-hidden="true" className={st.errIcon} />{t.errors.prefix}: {errors.form}</div>}
      <button type="submit" disabled={status === "submitting"} className={st.submit} data-busy={status === "submitting" || undefined}>
        {status === "submitting" ? <Loader2 aria-hidden="true" className={st.spin} /> : <ShieldCheck aria-hidden="true" className={st.submitIcon} />}
        {status === "submitting" ? t.submitting : dict.home.hero.ctaPrimary}
      </button>
      <p className={st.hint}>* {t.required}</p>
    </form>
  );
}
