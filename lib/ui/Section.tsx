// Bölüm iskeleti + başlık bloğu (eyebrow / h2 / lead). <section aria-labelledby> — her bölüm erişilebilir landmark.
import clsx from "clsx";
import type { ReactNode } from "react";
import s from "./section.module.css";

export function Section({ id, tone = "default", className, children }: {
  id: string;
  tone?: "default" | "alt" | "brand";
  className?: string;
  children: ReactNode;
}) {
  return (
    <section aria-labelledby={`${id}-title`} className={clsx("section", tone === "alt" && "section-alt", tone === "brand" && "on-brand", className)}>
      <div className="container">{children}</div>
    </section>
  );
}

export function SectionHeader({ id, eyebrow, title, lead, align = "start", action }: {
  id: string;
  eyebrow?: string;
  title: string;
  lead?: string;
  align?: "start" | "center";
  action?: ReactNode;
}) {
  return (
    <div className={clsx(s.header, align === "center" && s.center, action && s.withAction)}>
      <div className={s.text}>
        {eyebrow && <p className="eyebrow">{eyebrow}</p>}
        <h2 id={`${id}-title`} className={s.title}>{title}</h2>
        {lead && <p className="lead">{lead}</p>}
      </div>
      {action && <div className={s.action}>{action}</div>}
    </div>
  );
}
