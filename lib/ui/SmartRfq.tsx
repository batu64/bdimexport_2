"use client";
// Akıllı RFQ, Konteyner Denetimi ve Ticari İstihbarat Konfigüratörü.
// Static export uyumlu: API_BASE ayarlıysa D1 /api/v1/leads endpoint'ine de kaydeder; her zaman yapılandırılmış RFQ özeti +
// WhatsApp / E-posta / Pano kopyalama ile 0-sürtünmeli lead dönüşümü sağlar.
import { useId, useMemo, useState } from "react";
import { BarChart3, CheckCircle2, ClipboardCheck, Copy, Mail, MessageCircle, PackageSearch, Rocket, Send } from "lucide-react";
import { OFFICIAL_WHATSAPP_WA } from "./entities";
import s from "./smartrfq.module.css";

export type RfqTrackId = "sourcing" | "inspection" | "intelligence" | "marketing";

export type SmartRfqCopy = {
  eyebrow: string;
  title: string;
  lead: string;
  step1Label: string;
  tracks: { id: RfqTrackId; title: string; desc: string }[];
  step2Label: string;
  origins: { id: string; label: string }[];
  volumesLabel: string;
  volumes: string[];
  fields: {
    productLabel: string;
    productPlaceholder: string;
    hsLabel: string;
    hsPlaceholder: string;
    companyLabel: string;
    companyPlaceholder: string;
    targetMarketLabel: string;
    targetMarketPlaceholder: string;
    emailLabel: string;
    emailPlaceholder: string;
    notesLabel: string;
    notesPlaceholder: string;
  };
  summaryTitle: string;
  slaBadge: string;
  copyBtn: string;
  copiedBtn: string;
  whatsappBtn: string;
  emailBtn: string;
  submitBtn: string;
  submittedMsg: string;
  emailSubject: string;
};

const TRACK_ICON = {
  sourcing: PackageSearch,
  inspection: ClipboardCheck,
  intelligence: BarChart3,
  marketing: Rocket,
};

const API_BASE = process.env.NEXT_PUBLIC_API_BASE ?? "";

export default function SmartRfq({
  copy,
  locale,
  email,
  initialTrack = "sourcing",
  sourcePage = "/rfq",
}: {
  copy: SmartRfqCopy;
  locale: string;
  email: string;
  initialTrack?: RfqTrackId;
  sourcePage?: string;
}) {
  const uid = useId();
  const [track, setTrack] = useState<RfqTrackId>(initialTrack);
  const [origin, setOrigin] = useState(copy.origins[0]?.id ?? "dual");
  const [volume, setVolume] = useState(copy.volumes[0] ?? "1x 20GP");
  const [product, setProduct] = useState("");
  const [hsCode, setHsCode] = useState("");
  const [company, setCompany] = useState("");
  const [targetMarket, setTargetMarket] = useState("");
  const [contactEmail, setContactEmail] = useState("");
  const [notes, setNotes] = useState("");
  const [copied, setCopied] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const selectedTrack = copy.tracks.find((t) => t.id === track) ?? copy.tracks[0];
  const selectedOrigin = copy.origins.find((o) => o.id === origin) ?? copy.origins[0];

  const brief = useMemo(() => {
    const lines = [
      `[BDIMEXPORT RFQ · ${selectedTrack.title}]`,
      `• Origin Hub: ${selectedOrigin?.label ?? origin}`,
      `• Volume / Scope: ${volume}`,
      product.trim() ? `• Product / Service: ${product.trim()}` : null,
      hsCode.trim() ? `• HS / GTIP Code: ${hsCode.trim()}` : null,
      targetMarket.trim() ? `• Destination / Target Market: ${targetMarket.trim()}` : null,
      company.trim() ? `• Company: ${company.trim()}` : null,
      contactEmail.trim() ? `• Contact Email: ${contactEmail.trim()}` : null,
      notes.trim() ? `• Technical Notes: ${notes.trim()}` : null,
    ].filter(Boolean);
    return lines.join("\n");
  }, [selectedTrack.title, selectedOrigin, origin, volume, product, hsCode, targetMarket, company, contactEmail, notes]);

  async function handleCopy() {
    try {
      await navigator.clipboard.writeText(brief);
      setCopied(true);
      setTimeout(() => setCopied(false), 2400);
    } catch {
      // clipboard blocked
    }
  }

  async function handleApiSubmit() {
    if (!API_BASE) {
      await handleCopy();
      return;
    }
    try {
      await fetch(`${API_BASE}/api/v1/leads`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          source_page: sourcePage,
          locale,
          form_type: "quotation",
          channel_pref: "whatsapp",
          payload: { track, origin, volume, product, hsCode, company, targetMarket, contactEmail, notes },
        }),
      });
      setSubmitted(true);
    } catch {
      await handleCopy();
    }
  }

  const waHref = `${OFFICIAL_WHATSAPP_WA}?text=${encodeURIComponent(brief)}`;
  const mailHref = `mailto:${email}?subject=${encodeURIComponent(`${copy.emailSubject}: ${selectedTrack.title}`)}&body=${encodeURIComponent(brief)}`;

  return (
    <div id="smart-rfq" className={s.card}>
      <div className={s.header}>
        <span className={s.eyebrow}>{copy.eyebrow}</span>
        <h2 id="smart-rfq-title" className={s.title}>{copy.title}</h2>
        <p className={s.lead}>{copy.lead}</p>
      </div>

      <div className={s.stepGrid}>
        <fieldset className={s.group}>
          <legend className={s.label}>{copy.step1Label}</legend>
          <div className={s.tracks}>
            {copy.tracks.map((t) => {
              const Icon = TRACK_ICON[t.id];
              return (
                <button
                  key={t.id}
                  type="button"
                  aria-pressed={track === t.id}
                  className={s.trackBtn}
                  onClick={() => setTrack(t.id)}
                >
                  <span className={s.trackTitle}>
                    <Icon aria-hidden="true" className={s.trackIcon} />
                    <span>{t.title}</span>
                  </span>
                  <span className={s.trackDesc}>{t.desc}</span>
                </button>
              );
            })}
          </div>
        </fieldset>

        <fieldset className={s.group}>
          <legend className={s.label}>{copy.step2Label}</legend>
          <div className={s.pills}>
            {copy.origins.map((o) => (
              <button
                key={o.id}
                type="button"
                aria-pressed={origin === o.id}
                className={s.pill}
                onClick={() => setOrigin(o.id)}
              >
                {o.label}
              </button>
            ))}
          </div>
        </fieldset>

        <fieldset className={s.group}>
          <legend className={s.label}>{copy.volumesLabel}</legend>
          <div className={s.pills}>
            {copy.volumes.map((v) => (
              <button
                key={v}
                type="button"
                aria-pressed={volume === v}
                className={s.pill}
                onClick={() => setVolume(v)}
              >
                {v}
              </button>
            ))}
          </div>
        </fieldset>

        <div className={s.fields}>
          <div className={s.field}>
            <label className={s.label} htmlFor={`${uid}-prod`}>{copy.fields.productLabel}</label>
            <input id={`${uid}-prod`} className={s.input} value={product} onChange={(e) => setProduct(e.target.value)} placeholder={copy.fields.productPlaceholder} />
          </div>
          <div className={s.field}>
            <label className={s.label} htmlFor={`${uid}-hs`}>{copy.fields.hsLabel}</label>
            <input id={`${uid}-hs`} className={s.input} value={hsCode} onChange={(e) => setHsCode(e.target.value)} placeholder={copy.fields.hsPlaceholder} />
          </div>
          <div className={s.field}>
            <label className={s.label} htmlFor={`${uid}-comp`}>{copy.fields.companyLabel}</label>
            <input id={`${uid}-comp`} className={s.input} value={company} onChange={(e) => setCompany(e.target.value)} placeholder={copy.fields.companyPlaceholder} />
          </div>
          <div className={s.field}>
            <label className={s.label} htmlFor={`${uid}-mkt`}>{copy.fields.targetMarketLabel}</label>
            <input id={`${uid}-mkt`} className={s.input} value={targetMarket} onChange={(e) => setTargetMarket(e.target.value)} placeholder={copy.fields.targetMarketPlaceholder} />
          </div>
          <div className={`${s.field} ${s.fieldFull}`}>
            <label className={s.label} htmlFor={`${uid}-mail`}>{copy.fields.emailLabel}</label>
            <input id={`${uid}-mail`} type="email" className={s.input} value={contactEmail} onChange={(e) => setContactEmail(e.target.value)} placeholder={copy.fields.emailPlaceholder} />
          </div>
          <div className={`${s.field} ${s.fieldFull}`}>
            <label className={s.label} htmlFor={`${uid}-notes`}>{copy.fields.notesLabel}</label>
            <textarea id={`${uid}-notes`} className={s.textarea} value={notes} onChange={(e) => setNotes(e.target.value)} placeholder={copy.fields.notesPlaceholder} />
          </div>
        </div>

        <div className={s.summary}>
          <div className={s.summaryHead}>
            <span>{copy.summaryTitle}</span>
            <span>{copy.slaBadge}</span>
          </div>
          <pre className={s.briefPre}>{brief}</pre>
        </div>

        {submitted && (
          <div role="status" className={s.statusOk}>
            <CheckCircle2 aria-hidden="true" className={s.btnIcon} />
            <span>{copy.submittedMsg}</span>
          </div>
        )}

        <div className={s.actions}>
          <a href={waHref} target="_blank" rel="noopener noreferrer" className={s.btnPrimary}>
            <MessageCircle aria-hidden="true" className={s.btnIcon} />
            <span>{copy.whatsappBtn}</span>
          </a>
          <a href={mailHref} className={s.btnSecondary}>
            <Mail aria-hidden="true" className={s.btnIcon} />
            <span>{copy.emailBtn}</span>
          </a>
          <button type="button" onClick={handleCopy} className={s.btnSecondary}>
            <Copy aria-hidden="true" className={s.btnIcon} />
            <span>{copied ? copy.copiedBtn : copy.copyBtn}</span>
          </button>
          {API_BASE && (
            <button type="button" onClick={handleApiSubmit} className={s.btnSecondary}>
              <Send aria-hidden="true" className={s.btnIcon} />
              <span>{copy.submitBtn}</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
