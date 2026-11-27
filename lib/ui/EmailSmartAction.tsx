"use client";
// Resilient Email Action Button: triggers mailto:, auto-copies email/body to clipboard,
// and reveals 1-click Gmail Web, Outlook Web, Copy Email, and optional WhatsApp fallback so no user hits a dead click.
import { useState } from "react";
import { Check, Copy, ExternalLink, Mail, MessageCircle } from "lucide-react";
import { clarityEvent, clarityUpgrade } from "./clarity";
import { buildEmailLinks, getEmailDeliveryCopy, triggerMailtoLink } from "./email-delivery";
import s from "./emailaction.module.css";

export default function EmailSmartAction({
  to,
  subject = "Bdimexport B2B Inquiry",
  body = "",
  label,
  ariaLabel,
  locale = "en",
  variant = "secondary",
  whatsappHref,
  className,
  eventName = "email_smart_action",
}: {
  to: string;
  subject?: string;
  body?: string;
  label: string;
  ariaLabel?: string;
  locale?: string;
  variant?: "primary" | "secondary" | "footer";
  whatsappHref?: string;
  className?: string;
  eventName?: string;
}) {
  const [open, setOpen] = useState(false);
  const [copiedAddr, setCopiedAddr] = useState(false);
  const links = buildEmailLinks({ to, subject, body });
  const copy = getEmailDeliveryCopy(locale);

  async function handleTrigger() {
    clarityEvent(eventName);
    clarityUpgrade(eventName);
    setOpen(true);
    try {
      await navigator.clipboard.writeText(body ? `${to}\n\n${body}` : to);
    } catch {
      // clipboard unavailable
    }
    triggerMailtoLink(links.mailto);
  }

  async function handleCopyAddress() {
    clarityEvent(`${eventName}_copy_addr`);
    try {
      await navigator.clipboard.writeText(to);
      setCopiedAddr(true);
      setTimeout(() => setCopiedAddr(false), 2400);
    } catch {
      // clipboard unavailable
    }
  }

  const triggerClass =
    variant === "footer"
      ? `${s.trigger} ${s.triggerFooter}`
      : variant === "primary"
        ? `${s.trigger} ${s.triggerPrimary}`
        : s.trigger;

  return (
    <div className={s.wrap}>
      <button
        type="button"
        className={className ? `${triggerClass} ${className}` : triggerClass}
        aria-expanded={open}
        aria-label={ariaLabel ?? `${label}: ${to}`}
        onClick={handleTrigger}
      >
        <Mail aria-hidden="true" className={s.icon} />
        <span>{label}</span>
      </button>

      {open && (
        <div
          role="status"
          aria-live="polite"
          className={variant === "footer" ? `${s.panel} ${s.panelOnBrand}` : s.panel}
        >
          <p className={s.note}>{copy.copiedNotice}</p>
          <div className={s.links}>
            <a
              href={links.gmail}
              target="_blank"
              rel="noopener noreferrer"
              className={s.chipLink}
              onClick={() => clarityEvent(`${eventName}_gmail`)}
            >
              <ExternalLink aria-hidden="true" className={s.icon} />
              <span>{copy.gmailBtn}</span>
            </a>
            <a
              href={links.outlook}
              target="_blank"
              rel="noopener noreferrer"
              className={s.chipLink}
              onClick={() => clarityEvent(`${eventName}_outlook`)}
            >
              <ExternalLink aria-hidden="true" className={s.icon} />
              <span>{copy.outlookBtn}</span>
            </a>
            <button type="button" className={s.chipLink} onClick={handleCopyAddress}>
              {copiedAddr ? <Check aria-hidden="true" className={s.icon} /> : <Copy aria-hidden="true" className={s.icon} />}
              <span>{copiedAddr ? copy.copiedAddrBtn : copy.copyAddrBtn}</span>
            </button>
            {whatsappHref && (
              <a
                href={whatsappHref}
                target="_blank"
                rel="noopener noreferrer"
                className={s.chipLink}
                onClick={() => clarityEvent(`${eventName}_wa_fallback`)}
              >
                <MessageCircle aria-hidden="true" className={s.icon} />
                <span>{copy.whatsappFallbackBtn}</span>
              </a>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
