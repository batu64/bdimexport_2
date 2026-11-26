"use client";
// Doğrudan Fabrika Elektrik & Telekom Direği Konteyner Hesaplayıcı ve B2B Lead Hunisi (RTL Arapça + LTR İngilizce).
// İletişim tek doğruluk kaynağı: lib/ui/entities.ts (OFFICIAL_WHATSAPP_WA = +90 539 414 78 54, OFFICIAL_EMAIL = info@bdimexport.com).
import { useEffect, useId, useMemo, useRef, useState } from "react";
import { CheckCircle2, Copy, Factory, Mail, MessageCircle, ShieldCheck } from "lucide-react";
import { clarityEvent, claritySet, clarityUpgrade } from "./clarity";
import { OFFICIAL_EMAIL, OFFICIAL_PHONE, OFFICIAL_WHATSAPP_WA } from "./entities";
import s from "./utilitypole.module.css";

export type PoleSpecOption = {
  id: string;
  title: string;
  tag: string;
  meta: string;
  polesPerContainer: number;
  treatmentNote: string;
};

export type PoleVolumeOption = {
  id: string;
  label: string;
  containers: number;
};

export type PoleDestinationOption = {
  id: string;
  label: string;
  portSummary: string;
};

export type UtilityPoleFunnelCopy = {
  eyebrow: string;
  title: string;
  lead: string;
  step1Label: string;
  specs: PoleSpecOption[];
  step2Label: string;
  volumes: PoleVolumeOption[];
  incotermLabel: string;
  incoterms: string[];
  step3Label: string;
  destinations: PoleDestinationOption[];
  calcLabels: {
    estimatedLoad: string;
    polesUnit: string;
    treatmentRule: string;
    selectedPort: string;
  };
  fields: {
    companyLabel: string;
    companyPlaceholder: string;
    whatsappLabel: string;
    whatsappPlaceholder: string;
    emailLabel: string;
    emailPlaceholder: string;
    portCustomLabel: string;
    portCustomPlaceholder: string;
    notesLabel: string;
    notesPlaceholder: string;
  };
  briefHeader: string;
  slaBadge: string;
  briefLabels: {
    header: string;
    spec: string;
    volume: string;
    estimatedQty: string;
    incoterm: string;
    destination: string;
    company: string;
    whatsapp: string;
    email: string;
    notes: string;
  };
  whatsappCta: string;
  emailCta: string;
  copyCta: string;
  copiedCta: string;
  emailSubject: string;
  directFactoryGuarantee: string;
  submittedMsg: string;
};

const API_BASE = process.env.NEXT_PUBLIC_API_BASE ?? "";

export function PoleHeroVideoShowcase({
  liveBadge,
  posterAlt,
  specs,
  rfqAnchor = "#rfq",
}: {
  liveBadge: string;
  posterAlt: string;
  specs: { val: string; label: string; href?: string }[];
  rfqAnchor?: string;
}) {
  const [canPlayVideo, setCanPlayVideo] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (!reduce) setCanPlayVideo(true);
  }, []);

  return (
    <div className={s.heroShowcase}>
      <a href={rfqAnchor} className={s.heroMediaFrame} style={{ display: "block", textDecoration: "none" }}>
        {canPlayVideo ? (
          <video
            className={s.heroMediaEl}
            autoPlay
            muted
            loop
            playsInline
            preload="metadata"
            poster="/media/poles/container-loading-loop-poster.webp"
            aria-label={posterAlt}
          >
            <source src="/media/poles/container-loading-loop.mp4" type="video/mp4" />
          </video>
        ) : (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src="/media/poles/container-loading-telehandler.webp"
            alt={posterAlt}
            className={s.heroMediaEl}
            decoding="async"
          />
        )}
        <span className={s.heroLivePill}>
          <span className={s.liveDot} aria-hidden="true" />
          <span>{liveBadge}</span>
        </span>
      </a>
      <div className={s.heroSpecStrip}>
        {specs.map((item) => {
          const isPhone = item.val.includes("+90");
          const targetHref = item.href ?? (isPhone ? OFFICIAL_WHATSAPP_WA : rfqAnchor);
          return (
            <a
              key={item.val}
              href={targetHref}
              {...(isPhone ? { target: "_blank", rel: "noopener noreferrer" } : {})}
              className={`${s.heroSpecItem} ${s.heroSpecLink}`}
            >
              <span className={s.heroSpecVal}>
                <bdi dir="ltr">{item.val}</bdi>
              </span>
              <span className={s.heroSpecLbl}>{item.label}</span>
            </a>
          );
        })}
      </div>
    </div>
  );
}

export default function UtilityPoleFunnel({
  copy,
  locale,
  sourcePage,
  sectionId = "rfq",
}: {
  copy: UtilityPoleFunnelCopy;
  locale: "ar" | "en" | "fr";
  sourcePage: string;
  sectionId?: string;
}) {
  const uid = useId();
  const [specId, setSpecId] = useState(copy.specs[0]?.id ?? "9m-brown");
  const [volId, setVolId] = useState(copy.volumes[0]?.id ?? "1x40hc");
  const [incoterm, setIncoterm] = useState(copy.incoterms[0] ?? "CIF");
  const [destId, setDestId] = useState(copy.destinations[0]?.id ?? "default");
  const [customPort, setCustomPort] = useState("");
  const [company, setCompany] = useState("");
  const [whatsappPhone, setWhatsappPhone] = useState("");
  const [contactEmail, setContactEmail] = useState("");
  const [notes, setNotes] = useState("");
  const [copied, setCopied] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const formEngagedRef = useRef(false);

  useEffect(() => {
    claritySet("funnel_page", sourcePage);
    claritySet("funnel_locale", locale);
    claritySet("funnel_product", "wooden_utility_poles");
  }, [locale, sourcePage]);

  function markFormEngaged() {
    if (formEngagedRef.current) return;
    formEngagedRef.current = true;
    clarityEvent(`pole_${locale}_form_engaged`);
  }

  useEffect(() => {
    if (typeof window === "undefined") return;
    function applyUrlParams(searchStr: string) {
      if (!searchStr) return;
      const q = new URLSearchParams(searchStr);
      const qCo = q.get("co") ?? q.get("company");
      const qPort = q.get("port") ?? q.get("country") ?? q.get("dest");
      const qSpec = q.get("spec");
      if (qCo) setCompany((prev) => prev || qCo);
      if (qPort) {
        const matched = copy.destinations.find(
          (d) => d.id.toLowerCase().includes(qPort.toLowerCase()) || d.label.toLowerCase().includes(qPort.toLowerCase()),
        );
        if (matched) setDestId(matched.id);
        else setCustomPort((prev) => prev || qPort);
      }
      if (qSpec) {
        const matchedSpec = copy.specs.find((sp) => sp.id.toLowerCase().includes(qSpec.toLowerCase()));
        if (matchedSpec) setSpecId(matchedSpec.id);
      }
    }

    applyUrlParams(window.location.search);

    function handleClickCapture(e: MouseEvent) {
      const target = (e.target as HTMLElement | null)?.closest?.("a[data-pole-spec], a[data-pole-dest]") as HTMLAnchorElement | null;
      if (!target) return;
      const targetSpec = target.getAttribute("data-pole-spec");
      const targetDest = target.getAttribute("data-pole-dest");
      const targetNotes = target.getAttribute("data-pole-notes");
      if (targetSpec) {
        const matchedSpec = copy.specs.find((sp) => sp.id.toLowerCase().includes(targetSpec.toLowerCase()));
        if (matchedSpec) {
          setSpecId(matchedSpec.id);
          clarityEvent(`pole_${locale}_card_jump_${matchedSpec.id}`);
          claritySet("pole_spec", matchedSpec.id);
        }
      }
      if (targetDest) {
        const matchedDest = copy.destinations.find((d) => d.id.toLowerCase().includes(targetDest.toLowerCase()));
        if (matchedDest) {
          setDestId(matchedDest.id);
          claritySet("pole_corridor", matchedDest.id);
        }
      }
      if (targetNotes) {
        setNotes((prev) => (prev.includes(targetNotes) ? prev : prev ? `${prev} · ${targetNotes}` : targetNotes));
      }
    }

    document.addEventListener("click", handleClickCapture);
    return () => document.removeEventListener("click", handleClickCapture);
  }, [copy.destinations, copy.specs, locale]);

  const activeSpec = copy.specs.find((sp) => sp.id === specId) ?? copy.specs[0];
  const activeVol = copy.volumes.find((vl) => vl.id === volId) ?? copy.volumes[0];
  const activeDest = copy.destinations.find((d) => d.id === destId) ?? copy.destinations[0];

  const estimatedPoles = activeSpec.polesPerContainer * activeVol.containers;
  const resolvedDestination = customPort.trim()
    ? `${activeDest.label} (${customPort.trim()})`
    : `${activeDest.label} — ${activeDest.portSummary}`;

  const brief = useMemo(() => {
    const L = copy.briefLabels;
    const lines = [
      L.header,
      `• ${L.spec}: ${activeSpec.title} (${activeSpec.meta})`,
      `• ${L.volume}: ${activeVol.label}`,
      `• ${L.estimatedQty}: ~${estimatedPoles.toLocaleString("en-US")} ${copy.calcLabels.polesUnit}`,
      `• ${L.incoterm}: ${incoterm}`,
      `• ${L.destination}: ${resolvedDestination}`,
      company.trim() ? `• ${L.company}: ${company.trim()}` : null,
      whatsappPhone.trim() ? `• ${L.whatsapp}: ${whatsappPhone.trim()}` : null,
      contactEmail.trim() ? `• ${L.email}: ${contactEmail.trim()}` : null,
      notes.trim() ? `• ${L.notes}: ${notes.trim()}` : null,
    ].filter(Boolean);
    return lines.join("\n");
  }, [
    copy.briefLabels,
    copy.calcLabels.polesUnit,
    activeSpec,
    activeVol,
    estimatedPoles,
    incoterm,
    resolvedDestination,
    company,
    whatsappPhone,
    contactEmail,
    notes,
  ]);

  function fireLeadAnalytics(method: string) {
    clarityEvent(`pole_${locale}_${method}`);
    claritySet("pole_spec", activeSpec.id);
    claritySet("pole_volume", activeVol.id);
    claritySet("pole_incoterm", incoterm);
    claritySet("pole_corridor", activeDest.id);
    if (method !== "copy_pole_rfq") {
      clarityUpgrade(`pole_${locale}_${method}`);
    }
    if (typeof window !== "undefined") {
      const w = window as unknown as { gtag?: (...args: unknown[]) => void };
      w.gtag?.("event", "generate_lead", {
        method,
        product_line: "wooden_utility_poles",
        pole_spec: activeSpec.id,
        volume_tier: activeVol.id,
        destination_corridor: activeDest.id,
        incoterm,
        locale,
        source_page: sourcePage,
      });
    }
    if (API_BASE) {
      fetch(`${API_BASE}/api/v1/leads`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          source_page: sourcePage,
          locale,
          form_type: "quotation",
          channel_pref: "whatsapp",
          payload: {
            product: "Wooden Utility & Telecom Poles",
            spec: activeSpec.id,
            volume: activeVol.label,
            estimatedPoles,
            incoterm,
            destination: resolvedDestination,
            company,
            whatsappPhone,
            contactEmail,
            notes,
          },
        }),
      })
        .then(() => setSubmitted(true))
        .catch(() => undefined);
    }
  }

  async function handleCopy() {
    fireLeadAnalytics("copy_pole_rfq");
    try {
      await navigator.clipboard.writeText(brief);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    } catch {
      // clipboard unavailable
    }
  }

  const waHref = `${OFFICIAL_WHATSAPP_WA}?text=${encodeURIComponent(brief)}`;
  const mailHref = `mailto:${OFFICIAL_EMAIL}?subject=${encodeURIComponent(`${copy.emailSubject} — ${activeSpec.title}`)}&body=${encodeURIComponent(brief)}`;

  return (
    <div id={sectionId} className={s.funnelCard}>
      <div className={s.funnelHead}>
        <span className={s.funnelEyebrow}>
          <Factory aria-hidden="true" className={s.btnIcon} />
          <span>{copy.eyebrow}</span>
        </span>
        <h2 className={s.funnelTitle}>{copy.title}</h2>
        <p className={s.funnelLead}>{copy.lead}</p>
      </div>

      <div className={s.funnelStack}>
        <fieldset className={s.fieldset}>
          <legend className={s.legend}>{copy.step1Label}</legend>
          <div className={s.specCards}>
            {copy.specs.map((sp) => {
              const isSelected = specId === sp.id;
              const quickSpecBrief = [
                copy.briefLabels.header,
                `• ${copy.briefLabels.spec}: ${sp.title} (${sp.meta})`,
                `• ${copy.briefLabels.volume}: ${activeVol.label} (~${(sp.polesPerContainer * activeVol.containers).toLocaleString("en-US")} ${copy.calcLabels.polesUnit})`,
                `• ${copy.briefLabels.incoterm}: ${incoterm}`,
                `• ${copy.briefLabels.destination}: ${resolvedDestination}`,
              ].join("\n");
              const quickSpecWaHref = `${OFFICIAL_WHATSAPP_WA}?text=${encodeURIComponent(quickSpecBrief)}`;
              const quickWaLabel =
                locale === "ar"
                  ? "اطلب تسعيرة هذا المقاس فوراً عبر واتساب ←"
                  : locale === "fr"
                    ? "Devis WhatsApp immédiat pour ce format →"
                    : "Get Instant WhatsApp Quote for This Size →";
              return (
                <div key={sp.id} className={s.specCardWrap}>
                  <button
                    id={`pole-spec-${locale}-${sp.id}`}
                    type="button"
                    aria-pressed={isSelected}
                    className={s.specBtn}
                    onClick={() => {
                      setSpecId(sp.id);
                      clarityEvent(`pole_${locale}_spec_${sp.id}`);
                      claritySet("pole_spec", sp.id);
                    }}
                  >
                    <span className={s.specBtnHead}>
                      <span className={s.specBtnTitle}>{sp.title}</span>
                      <span className={s.specBtnTag}>{sp.tag}</span>
                    </span>
                    <span className={s.specBtnMeta}>{sp.meta}</span>
                  </button>
                  <a
                    id={`pole-spec-wa-direct-${locale}-${sp.id}`}
                    href={quickSpecWaHref}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={s.specQuickWaLink}
                    onClick={() => {
                      setSpecId(sp.id);
                      fireLeadAnalytics(`whatsapp_spec_card_${sp.id}`);
                    }}
                  >
                    <MessageCircle aria-hidden="true" className={s.badgeIcon} />
                    <span>{quickWaLabel}</span>
                  </a>
                </div>
              );
            })}
          </div>
        </fieldset>

        <fieldset className={s.fieldset}>
          <legend className={s.legend}>{copy.step2Label}</legend>
          <div className={s.pillRow}>
            {copy.volumes.map((vl) => (
              <button
                key={vl.id}
                id={`pole-vol-${locale}-${vl.id}`}
                type="button"
                aria-pressed={volId === vl.id}
                className={s.pill}
                onClick={() => {
                  setVolId(vl.id);
                  clarityEvent(`pole_${locale}_vol_${vl.id}`);
                  claritySet("pole_volume", vl.id);
                }}
              >
                {vl.label}
              </button>
            ))}
          </div>
        </fieldset>

        <fieldset className={s.fieldset}>
          <legend className={s.legend}>{copy.incotermLabel}</legend>
          <div className={s.pillRow}>
            {copy.incoterms.map((inc, idx) => (
              <button
                key={inc}
                id={`pole-incoterm-${locale}-${idx}`}
                type="button"
                aria-pressed={incoterm === inc}
                className={s.pill}
                onClick={() => {
                  setIncoterm(inc);
                  clarityEvent(`pole_${locale}_select_incoterm`);
                  claritySet("pole_incoterm", inc);
                }}
              >
                {inc}
              </button>
            ))}
          </div>
        </fieldset>

        <fieldset className={s.fieldset}>
          <legend className={s.legend}>{copy.step3Label}</legend>
          <div className={s.pillRow}>
            {copy.destinations.map((dest) => (
              <button
                key={dest.id}
                id={`pole-dest-${locale}-${dest.id}`}
                type="button"
                aria-pressed={destId === dest.id}
                className={s.pill}
                onClick={() => {
                  setDestId(dest.id);
                  clarityEvent(`pole_${locale}_dest_${dest.id}`);
                  claritySet("pole_corridor", dest.id);
                }}
              >
                {dest.label}
              </button>
            ))}
          </div>
        </fieldset>

        <div className={s.calcBar} role="status" aria-live="polite">
          <div className={s.calcMetric}>
            <span className={s.calcLabel}>{copy.calcLabels.estimatedLoad}</span>
            <span className={s.calcVal}>
              <bdi dir="ltr">~{estimatedPoles.toLocaleString("en-US")}</bdi> {copy.calcLabels.polesUnit}
            </span>
          </div>
          <div className={s.calcMetric}>
            <span className={s.calcLabel}>{copy.calcLabels.treatmentRule}</span>
            <span className={s.calcVal}>{activeSpec.treatmentNote}</span>
          </div>
          <div className={s.calcMetric}>
            <span className={s.calcLabel}>{copy.calcLabels.selectedPort}</span>
            <span className={s.calcVal}>{activeDest.portSummary}</span>
          </div>
        </div>

        <div className={s.inputGrid} onFocusCapture={markFormEngaged}>
          <div className={s.field}>
            <label className={s.legend} htmlFor={`${uid}-comp`}>{copy.fields.companyLabel}</label>
            <input
              id={`${uid}-comp`}
              className={s.input}
              value={company}
              onChange={(e) => setCompany(e.target.value)}
              placeholder={copy.fields.companyPlaceholder}
            />
          </div>
          <div className={s.field}>
            <label className={s.legend} htmlFor={`${uid}-wa`}>{copy.fields.whatsappLabel}</label>
            <input
              id={`${uid}-wa`}
              type="tel"
              className={`${s.input} ${s.ltrInput}`}
              value={whatsappPhone}
              onChange={(e) => setWhatsappPhone(e.target.value)}
              placeholder={copy.fields.whatsappPlaceholder}
            />
          </div>
          <div className={s.field}>
            <label className={s.legend} htmlFor={`${uid}-mail`}>{copy.fields.emailLabel}</label>
            <input
              id={`${uid}-mail`}
              type="email"
              className={`${s.input} ${s.ltrInput}`}
              value={contactEmail}
              onChange={(e) => setContactEmail(e.target.value)}
              placeholder={copy.fields.emailPlaceholder}
            />
          </div>
          <div className={s.field}>
            <label className={s.legend} htmlFor={`${uid}-port`}>{copy.fields.portCustomLabel}</label>
            <input
              id={`${uid}-port`}
              className={s.input}
              value={customPort}
              onChange={(e) => setCustomPort(e.target.value)}
              placeholder={copy.fields.portCustomPlaceholder}
            />
          </div>
          <div className={`${s.field} ${s.fieldFull}`}>
            <label className={s.legend} htmlFor={`${uid}-notes`}>{copy.fields.notesLabel}</label>
            <textarea
              id={`${uid}-notes`}
              className={s.textarea}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder={copy.fields.notesPlaceholder}
            />
          </div>
        </div>

        <div className={s.briefBox}>
          <div className={s.briefHead}>
            <span>{copy.briefHeader}</span>
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

        <div className={s.ctaActions}>
          <a
            id={`cta-pole-funnel-wa-${locale}`}
            href={waHref}
            target="_blank"
            rel="noopener noreferrer"
            className={s.waPrimaryBtn}
            onClick={() => fireLeadAnalytics("whatsapp_pole_funnel")}
          >
            <MessageCircle aria-hidden="true" className={s.btnIcon} />
            <span>{copy.whatsappCta}</span>
          </a>
          <a
            id={`cta-pole-funnel-email-${locale}`}
            href={mailHref}
            className={s.secondaryActionBtn}
            onClick={() => fireLeadAnalytics("email_pole_funnel")}
          >
            <Mail aria-hidden="true" className={s.btnIcon} />
            <span>{copy.emailCta}</span>
          </a>
          <button
            id={`cta-pole-funnel-copy-${locale}`}
            type="button"
            onClick={handleCopy}
            className={s.secondaryActionBtn}
          >
            <Copy aria-hidden="true" className={s.btnIcon} />
            <span>{copied ? copy.copiedCta : copy.copyCta}</span>
          </button>
        </div>

        <p className={s.directLineNote}>
          <ShieldCheck aria-hidden="true" className={s.badgeIcon} />
          <span>
            {copy.directFactoryGuarantee} · WhatsApp: <bdi dir="ltr">{OFFICIAL_PHONE}</bdi> · <bdi dir="ltr">{OFFICIAL_EMAIL}</bdi>
          </span>
        </p>
      </div>
    </div>
  );
}
