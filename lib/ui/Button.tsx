// cta.md — primary (highlight dolgu + primary metin, sayfa başına ≤2 konum) · secondary (kontur) · ghost (inline link + ok).
// tone="brand": koyu zemin üstü (secondary kontur on-brand, odak highlight). Gezinme = <Link>/<a>; role="button" YOK.
import Link from "next/link";
import clsx from "clsx";
import { ArrowRight } from "lucide-react";
import type { ReactNode } from "react";
import s from "./button.module.css";

export type ButtonProps = {
  href: string;
  variant?: "primary" | "secondary" | "ghost";
  tone?: "light" | "brand";
  size?: "md" | "lg";
  arrow?: boolean;
  className?: string;
  ariaLabel?: string;
  id?: string;
  clarityEvent?: string;
  clarityUpgrade?: string;
  children: ReactNode;
};

export default function Button({
  href,
  variant = "primary",
  tone = "light",
  size = "md",
  arrow,
  className,
  ariaLabel,
  id,
  clarityEvent,
  clarityUpgrade,
  children,
}: ButtonProps) {
  const cls = clsx(s.btn, s[variant], tone === "brand" && s.onBrand, size === "lg" && s.lg, className);
  const body = (
    <>
      <span>{children}</span>
      {(arrow ?? variant === "ghost") && <ArrowRight aria-hidden="true" className={s.arrow} />}
    </>
  );
  // mailto/harici: düz <a> (Next Link iç rota içindir)
  if (/^(mailto:|tel:|https?:)/.test(href)) {
    const ext = /^https?:/.test(href);
    return (
      <a
        id={id}
        href={href}
        className={cls}
        aria-label={ariaLabel}
        target={ext ? "_blank" : undefined}
        rel={ext ? "noopener noreferrer" : undefined}
        data-clarity-event={clarityEvent}
        data-clarity-upgrade={clarityUpgrade}
      >
        {body}
      </a>
    );
  }
  return (
    <Link
      id={id}
      href={href}
      className={cls}
      aria-label={ariaLabel}
      data-clarity-event={clarityEvent}
      data-clarity-upgrade={clarityUpgrade}
    >
      {body}
    </Link>
  );
}
