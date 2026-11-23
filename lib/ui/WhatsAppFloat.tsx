"use client";
// Floating WhatsApp quick-contact button for TR, EN, and DE public hubs.
import { MessageCircle } from "lucide-react";
import { clarityEvent, clarityUpgrade } from "./clarity";
import { OFFICIAL_PHONE, OFFICIAL_WHATSAPP_WA } from "./entities";
import s from "./whatsappfloat.module.css";

type Props = {
  label: string;
  ariaLabel: string;
  message?: string;
  locale: "tr" | "en" | "de" | "ar";
};

export default function WhatsAppFloat({ label, ariaLabel, message, locale }: Props) {
  const href = message
    ? `${OFFICIAL_WHATSAPP_WA}?text=${encodeURIComponent(message)}`
    : OFFICIAL_WHATSAPP_WA;

  function handleClick() {
    clarityEvent(`whatsapp_float_${locale}`);
    clarityUpgrade(`whatsapp_float_${locale}`);
    if (typeof window !== "undefined") {
      const w = window as unknown as { gtag?: (...args: unknown[]) => void };
      w.gtag?.("event", "generate_lead", {
        event_category: "contact",
        channel: "whatsapp_float",
        locale,
      });
    }
  }

  return (
    <a
      id={`cta-whatsapp-float-${locale}`}
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className={s.fab}
      aria-label={`${ariaLabel}: ${OFFICIAL_PHONE}`}
      onClick={handleClick}
    >
      <MessageCircle aria-hidden="true" className={s.icon} />
      <span className={s.label}>{label}</span>
    </a>
  );
}
