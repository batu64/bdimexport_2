"use client";
// Doğrudan Fabrika Elektrik & Telekom Direği Konteyner Hesaplayıcı ve B2B Lead Hunisi (RTL Arapça + LTR İngilizce).
// İletişim tek doğruluk kaynağı: lib/ui/entities.ts (OFFICIAL_WHATSAPP_WA = +90 539 414 78 54, OFFICIAL_EMAIL = info@bdimexport.com).
import { useEffect, useId, useMemo, useRef, useState } from "react";
import { Calculator, CheckCircle2, Copy, Factory, FileDown, FileSpreadsheet, Mail, MessageCircle, Printer, ShieldCheck, Video } from "lucide-react";
import { clarityEvent, claritySet, clarityUpgrade } from "./clarity";
import { CORPORATE_ENTITIES, OFFICIAL_EMAIL, OFFICIAL_PHONE, OFFICIAL_WHATSAPP_WA, SAP_ARIBA_ID, US_DUNS_NUMBER } from "./entities";
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

export function PoleConversionBar({
  locale,
  sourcePage,
  rfqAnchor = "#rfq",
  contextLabel,
}: {
  locale: "ar" | "en" | "fr";
  sourcePage: string;
  rfqAnchor?: string;
  contextLabel?: string;
}) {
  const ctx = contextLabel ? ` (${contextLabel})` : "";
  const copy =
    locale === "ar"
      ? {
          eyebrow: "تأكيد مباشر من المصنع — بدون وسطاء",
          videoTitle: "مكالمة فيديو مباشرة من ساحة المصنع (3 دقائق)",
          videoSub: "شاهد أسطوانات الأوتوكلاف ومخزون أعمدة 9م البنية مباشرة عبر واتساب قبل التعاقد.",
          videoCta: "احجز جولة فيديو واتساب الآن",
          videoWa: `السلام عليكم، نرغب في مكالمة فيديو مباشرة لمدة 3 دقائق من ساحة مصنعكم لمشاهدة أعمدة الكهرباء الخشبية وخط الأوتوكلاف${ctx}.`,
          boqTitle: "هل لديك جدول كميات عطاء (BOQ / Excel / PDF)؟",
          boqSub: "أرسل ملف العطاء مباشرة لمهندس التصدير لاستلام تسعيرة CIF/FOB خلال 24 ساعة.",
          boqCta: "أرسل جدول الكميات عبر واتساب",
          boqWa: `السلام عليكم، لدينا جدول كميات (BOQ) لمشروع أعمدة كهرباء/اتصالات خشبية${ctx} ونرغب في إرسال الملف لتسعيره خلال 24 ساعة.`,
          pdfTitle: "الكتالوج الفني الرسمي وشهادة الأوتوكلاف (PDF)",
          pdfSub: "وثيقة معتمدة جاهزة لإرفاقها في ملفات عطاءات GECOL و JEPCO و Sonelgaz.",
          pdfCta: "تحميل الكتالوج الفني (PDF)",
          pdfHref: "/docs/bdimexport-wooden-electric-poles-datasheet-ar.pdf",
        }
      : locale === "fr"
        ? {
            eyebrow: "Preuve Usine Directe — Zéro Courtier",
            videoTitle: "Appel Vidéo WhatsApp en Direct du Parc Usine (3 min)",
            videoSub: "Inspectez nos cylindres d'autoclave et nos stocks 9 m bruns en direct avant commande.",
            videoCta: "Lancer une visite vidéo usine",
            videoWa: `Bonjour Bureau Usine bdimexport, nous souhaitons planifier un appel vidéo WhatsApp de 3 minutes depuis votre parc usine pour voir les poteaux bois et l'autoclave${ctx}.`,
            boqTitle: "Bordereau d'Appel d'Offres (DQE / BOQ Excel ou PDF) ?",
            boqSub: "Transférez votre fichier directement à notre ingénieur export pour un chiffrage CIF sous 24 h.",
            boqCta: "Envoyer mon DQE / BOQ sur WhatsApp",
            boqWa: `Bonjour Bureau Usine bdimexport, nous avons un bordereau de quantités (DQE/BOQ) de poteaux électriques en bois${ctx} à chiffrer sous 24 h.`,
            pdfTitle: "Fiche Technique Officielle & Protocole Autoclave (PDF)",
            pdfSub: "Dossier prêt pour vos soumissions SENELEC, CIE, ENEO, ONEE ou Sonelgaz.",
            pdfCta: "Télécharger la fiche technique (PDF)",
            pdfHref: "/docs/bdimexport-wooden-electric-poles-datasheet-fr.pdf",
          }
        : {
            eyebrow: "Anti-Broker Factory Verification — Zero Middlemen",
            videoTitle: "Book a 3-Min Live WhatsApp Video Call From Our Plant Yard",
            videoSub: "See our autoclave cylinders, seasoned pine stock & 40' HC loading live before issuing a PO.",
            videoCta: "Request Live Plant Video Call",
            videoWa: `Hello Bdimexport Factory Desk, we would like a 3-minute live WhatsApp video walk-through of your timber yard and autoclave plant${ctx}.`,
            boqTitle: "Have a Multi-Length Tender BOQ (Excel / PDF)?",
            boqSub: "Forward your tender schedule straight to our export engineer for a 24h CIF/FOB proforma.",
            boqCta: "Send Tender BOQ on WhatsApp",
            boqWa: `Hello Bdimexport Factory Desk, we have a wooden electric/utility pole Tender BOQ${ctx} and want to share the file for 24h factory-direct pricing.`,
            pdfTitle: "Official Factory Technical Datasheet & Autoclave Spec (PDF)",
            pdfSub: "Print-ready engineering dossier for SENELEC, EDM, ECG, KPLC, TANESCO & World Bank tenders.",
            pdfCta: "Download Technical Datasheet (PDF)",
            pdfHref: "/docs/bdimexport-wooden-electric-poles-datasheet-en.pdf",
          };

  return (
    <div className={s.croStrip} data-source-page={sourcePage}>
      <div className={s.croCard}>
        <div className={s.croCardTop}>
          <span className={s.croBadge}>
            <Video aria-hidden="true" className={s.badgeIcon} />
            <span>{copy.eyebrow}</span>
          </span>
          <h3 className={s.croTitle}>{copy.videoTitle}</h3>
          <p className={s.croSub}>{copy.videoSub}</p>
        </div>
        <a
          id={`cta-pole-live-video-${locale}`}
          href={`${OFFICIAL_WHATSAPP_WA}?text=${encodeURIComponent(copy.videoWa)}`}
          target="_blank"
          rel="noopener noreferrer"
          className={s.croActionPrimary}
          data-clarity-event={`pole_${locale}_live_video_call`}
          data-clarity-upgrade={`pole_${locale}_live_video_lead`}
        >
          <Video aria-hidden="true" className={s.btnIcon} />
          <span>{copy.videoCta}</span>
        </a>
      </div>

      <div className={s.croCard}>
        <div className={s.croCardTop}>
          <span className={s.croBadge}>
            <FileSpreadsheet aria-hidden="true" className={s.badgeIcon} />
            <span>BOQ / DQE · 24h SLA</span>
          </span>
          <h3 className={s.croTitle}>{copy.boqTitle}</h3>
          <p className={s.croSub}>{copy.boqSub}</p>
        </div>
        <a
          id={`cta-pole-boq-fasttrack-${locale}`}
          href={`${OFFICIAL_WHATSAPP_WA}?text=${encodeURIComponent(copy.boqWa)}`}
          target="_blank"
          rel="noopener noreferrer"
          className={s.croActionSecondary}
          data-clarity-event={`pole_${locale}_boq_fasttrack`}
          data-clarity-upgrade={`pole_${locale}_boq_lead`}
        >
          <MessageCircle aria-hidden="true" className={s.btnIcon} />
          <span>{copy.boqCta}</span>
        </a>
      </div>

      <div className={s.croCard}>
        <div className={s.croCardTop}>
          <span className={s.croBadge}>
            <FileDown aria-hidden="true" className={s.badgeIcon} />
            <span>EN 14229 · BS 1990 · NF C 67-100</span>
          </span>
          <h3 className={s.croTitle}>{copy.pdfTitle}</h3>
          <p className={s.croSub}>{copy.pdfSub}</p>
        </div>
        <div className={s.tableCtaCell}>
          <a
            id={`cta-pole-pdf-datasheet-${locale}`}
            href={copy.pdfHref}
            target="_blank"
            rel="noopener noreferrer"
            className={s.croActionSecondary}
            data-clarity-event={`pole_${locale}_download_datasheet_pdf`}
          >
            <FileDown aria-hidden="true" className={s.btnIcon} />
            <span>{copy.pdfCta}</span>
          </a>
          <a href={rfqAnchor} className={s.tableCalcLink} data-clarity-event={`pole_${locale}_jump_calc_from_cro`}>
            <Calculator aria-hidden="true" className={s.badgeIcon} />
            <span>{locale === "ar" ? "حاسبة الحاويات" : locale === "fr" ? "Calculateur" : "Calculator"}</span>
          </a>
        </div>
      </div>
    </div>
  );
}

export function PoleStickyMobileBar({
  locale,
  rfqAnchor = "#rfq",
  waMessage,
}: {
  locale: "ar" | "en" | "fr";
  rfqAnchor?: string;
  waMessage: string;
}) {
  const calcLabel = locale === "ar" ? "حاسبة الحاويات" : locale === "fr" ? "Calculer 40' HC" : "Container Calc";
  const waLabel = locale === "ar" ? "واتساب المصنع" : locale === "fr" ? "WhatsApp Usine" : "Factory WhatsApp";
  return (
    <div className={s.mobileStickyBar} role="region" aria-label={waLabel}>
      <a href={rfqAnchor} className={s.mobileStickyCalc} data-clarity-event={`pole_${locale}_sticky_calc`}>
        <Calculator aria-hidden="true" className={s.badgeIcon} />
        <span>{calcLabel}</span>
      </a>
      <a
        href={`${OFFICIAL_WHATSAPP_WA}?text=${encodeURIComponent(waMessage)}`}
        target="_blank"
        rel="noopener noreferrer"
        className={s.mobileStickyWa}
        data-clarity-event={`pole_${locale}_sticky_wa`}
        data-clarity-upgrade={`pole_${locale}_sticky_wa_lead`}
      >
        <MessageCircle aria-hidden="true" className={s.badgeIcon} />
        <span>{waLabel}</span>
      </a>
    </div>
  );
}

export default function UtilityPoleFunnel({
  copy,
  locale,
  sourcePage,
  sectionId = "rfq",
  defaultSpecId,
  defaultDestId,
}: {
  copy: UtilityPoleFunnelCopy;
  locale: "ar" | "en" | "fr";
  sourcePage: string;
  sectionId?: string;
  defaultSpecId?: string;
  defaultDestId?: string;
}) {
  const uid = useId();
  const [specId, setSpecId] = useState(defaultSpecId ?? copy.specs[0]?.id ?? "9m-brown");
  const [volId, setVolId] = useState(copy.volumes[0]?.id ?? "1x40hc");
  const [incoterm, setIncoterm] = useState(copy.incoterms[0] ?? "CIF");
  const [destId, setDestId] = useState(defaultDestId ?? copy.destinations[0]?.id ?? "default");
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

  // Gösterge bütçe planlama aralığı (FOB / CIF konteyner bazlı — kesin fiyat değil, 24s proforma kilitli planlama rehberi)
  const budgetRange = useMemo(() => {
    const id = activeSpec.id.toLowerCase();
    const baseUnitLow = id.includes("10m") || id.includes("12m") ? 148 : id.includes("7m") || id.includes("8m") ? 72 : 98;
    const baseUnitHigh = id.includes("10m") || id.includes("12m") ? 195 : id.includes("7m") || id.includes("8m") ? 96 : 128;
    const volDiscount = activeVol.containers >= 20 ? 0.91 : activeVol.containers >= 8 ? 0.94 : activeVol.containers >= 3 ? 0.97 : 1;
    const isCif = incoterm.toUpperCase().includes("CIF") || incoterm.toUpperCase().includes("CFR");
    const freightPerCtrLow = isCif ? 2400 : 0;
    const freightPerCtrHigh = isCif ? 4600 : 0;
    const totalLow = Math.round((estimatedPoles * baseUnitLow * volDiscount + activeVol.containers * freightPerCtrLow) / 100) * 100;
    const totalHigh = Math.round((estimatedPoles * baseUnitHigh * volDiscount + activeVol.containers * freightPerCtrHigh) / 100) * 100;
    const unitLow = Math.round(totalLow / Math.max(estimatedPoles, 1));
    const unitHigh = Math.round(totalHigh / Math.max(estimatedPoles, 1));
    return { totalLow, totalHigh, unitLow, unitHigh };
  }, [activeSpec.id, activeVol.containers, estimatedPoles, incoterm]);

  function handlePrintProforma() {
    fireLeadAnalytics("print_pole_proforma_pdf");
    if (typeof window === "undefined") return;
    const isRtl = locale === "ar";
    const docTitle =
      locale === "ar"
        ? "ملخص المواصفة الفنية وطلب الفاتورة المبدئية — bdimexport"
        : locale === "fr"
          ? "Dossier Technique & Pré-Proforma Usine — bdimexport"
          : "Factory Technical Specification & Pre-Proforma Summary — bdimexport";
    const w = window.open("", "_blank", "noopener,noreferrer,width=900,height=780");
    if (!w) return;
    const esc = (v: string) => v.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
    w.document.write(`<!doctype html>
<html lang="${locale}" dir="${isRtl ? "rtl" : "ltr"}">
<head>
<meta charset="utf-8" />
<title>${esc(docTitle)}</title>
<style>
  body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Arial, sans-serif; color: #111827; margin: 32px; line-height: 1.55; }
  .head { border-bottom: 3px solid #0b2545; padding-bottom: 14px; margin-bottom: 20px; display: flex; justify-content: space-between; gap: 16px; }
  .brand { font-size: 22px; font-weight: 800; color: #0b2545; }
  .meta { font-size: 12px; color: #4b5563; }
  h1 { font-size: 18px; margin: 0 0 12px; color: #0b2545; }
  table { width: 100%; border-collapse: collapse; margin: 16px 0; font-size: 13px; }
  th, td { border: 1px solid #d1d5db; padding: 8px 10px; text-align: ${isRtl ? "right" : "left"}; }
  th { background: #f3f4f6; font-weight: 700; width: 34%; }
  .box { background: #f8fafc; border: 1px solid #cbd5e1; border-radius: 6px; padding: 14px; margin: 16px 0; font-size: 13px; }
  .foot { margin-top: 28px; padding-top: 12px; border-top: 1px solid #d1d5db; font-size: 11px; color: #4b5563; }
  @media print { body { margin: 16px; } }
</style>
</head>
<body>
  <div class="head">
    <div>
      <div class="brand">bdimexport</div>
      <div class="meta">${esc(CORPORATE_ENTITIES[0].name)} (Türkiye) · ${esc(CORPORATE_ENTITIES[1].name)} (USA)</div>
    </div>
    <div class="meta">D-U-N-S® #: ${esc(US_DUNS_NUMBER)}<br/>SAP Ariba®: ${esc(SAP_ARIBA_ID)}<br/>WhatsApp: ${esc(OFFICIAL_PHONE)}</div>
  </div>
  <h1>${esc(docTitle)}</h1>
  <table>
    <tr><th>${esc(copy.briefLabels.spec)}</th><td>${esc(activeSpec.title)} (${esc(activeSpec.meta)})</td></tr>
    <tr><th>${esc(copy.briefLabels.volume)}</th><td>${esc(activeVol.label)}</td></tr>
    <tr><th>${esc(copy.briefLabels.estimatedQty)}</th><td>~${estimatedPoles.toLocaleString("en-US")} ${esc(copy.calcLabels.polesUnit)}</td></tr>
    <tr><th>${esc(copy.briefLabels.incoterm)}</th><td>${esc(incoterm)}</td></tr>
    <tr><th>${esc(copy.briefLabels.destination)}</th><td>${esc(resolvedDestination)}</td></tr>
    <tr><th>Indicative Planning Band (USD)</th><td>$${budgetRange.unitLow} – $${budgetRange.unitHigh} / pole · Est. Container Lot: $${budgetRange.totalLow.toLocaleString("en-US")} – $${budgetRange.totalHigh.toLocaleString("en-US")} (Subject to 24h Formal Proforma)</td></tr>
    ${company.trim() ? `<tr><th>${esc(copy.briefLabels.company)}</th><td>${esc(company.trim())}</td></tr>` : ""}
    ${notes.trim() ? `<tr><th>${esc(copy.briefLabels.notes)}</th><td>${esc(notes.trim())}</td></tr>` : ""}
  </table>
  <div class="box">
    <strong>Factory Autoclave Protocol (EN 14229 · BS 1990-1 · SANS 754 · NF C 67-100 · Use Class 4):</strong><br/>
    Pre-seasoning moisture ≤ 25% · Initial vacuum 60 min @ 63.5 cmHg · Hydraulic pressure ≥ 10.5 kg/cm² · 3.5% solution (350 L/m³ = 16 kg/m³ dry salt retention) · ≥ 75% sapwood penetration · 15 min final vacuum · Chalk-numbered tally photos &amp; Phytosanitary / Origin / SGS-BV readiness.
  </div>
  <div class="foot">
    Official Direct Factory Desk: ${esc(OFFICIAL_PHONE)} (${esc(OFFICIAL_WHATSAPP_WA)}) · ${esc(OFFICIAL_EMAIL)} · https://bdimexport.com${esc(sourcePage)}
  </div>
  <script>window.onload = function () { window.print(); };</script>
</body>
</html>`);
    w.document.close();
  }

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
          <div className={s.calcMetric}>
            <span className={s.calcLabel}>
              {locale === "ar"
                ? "نطاق الميزانية الاسترشادي (USD)"
                : locale === "fr"
                  ? "Budget indicatif usine (USD)"
                  : "Indicative Budget Band (USD)"}
            </span>
            <span className={s.calcVal}>
              <bdi dir="ltr">
                ${budgetRange.unitLow}–${budgetRange.unitHigh}/pc
              </bdi>
            </span>
            <span className={s.calcSubNote}>
              <bdi dir="ltr">
                Est. ${budgetRange.totalLow.toLocaleString("en-US")}–${budgetRange.totalHigh.toLocaleString("en-US")}
              </bdi>{" "}
              {locale === "ar" ? "(تأكيد نهائي خلال 24 ساعة)" : locale === "fr" ? "(proforma fixe sous 24 h)" : "(lock exact rate in 24h)"}
            </span>
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
          <button
            id={`cta-pole-funnel-print-pdf-${locale}`}
            type="button"
            onClick={handlePrintProforma}
            className={s.secondaryActionBtn}
          >
            <Printer aria-hidden="true" className={s.btnIcon} />
            <span>
              {locale === "ar"
                ? "طباعة / حفظ ملخص العرض (PDF)"
                : locale === "fr"
                  ? "Imprimer / PDF Pré-Proforma"
                  : "Print / Save Spec Proforma (PDF)"}
            </span>
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
