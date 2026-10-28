// card.md — service/guide kartı. Başlık link (keyword'lü; tüm kart tıklanabilir DEĞİL — a11y), hover: lift + elevation + kenar ışıltısı.
// Hareket CSS (transform/box-shadow); reduced-motion'da kapalı (globals.css).
import Link from "next/link";
import clsx from "clsx";
import { ArrowRight } from "lucide-react";
import type { ReactNode } from "react";
import s from "./card.module.css";

export default function Card({ title, href, description, icon, eyebrow, more, children, className, headingLevel = 3 }: {
  title: string;
  href: string;
  description?: string;
  icon?: ReactNode;
  eyebrow?: string;
  more?: string;
  children?: ReactNode;
  className?: string;
  headingLevel?: 2 | 3;
}) {
  const H = headingLevel === 2 ? "h2" : "h3";
  return (
    <article className={clsx(s.card, className)}>
      {icon && <div className={s.icon} aria-hidden="true">{icon}</div>}
      {eyebrow && <p className={s.eyebrow}>{eyebrow}</p>}
      <H className={s.title}>
        <Link href={href} className={s.titleLink}>{title}</Link>
      </H>
      {description && <p className={s.desc}>{description}</p>}
      {children}
      {more && (
        <p className={s.more} aria-hidden="true">
          <span>{more}</span>
          <ArrowRight className={s.arrow} />
        </p>
      )}
    </article>
  );
}
