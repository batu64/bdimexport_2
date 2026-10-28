// İç sayfa başlık bandı (hizmet/rehber/ürün/form/legal): görünür breadcrumb + eyebrow + H1 + özet + CTA.
// Koyu brand zemin, ana sayfa hero'sunun sade kardeşi (aynı ışık/ızgara dili, daha alçak). JSON-LD breadcrumb sayfada ayrıca basılır.
import Link from "next/link";
import { ChevronRight } from "lucide-react";
import type { ReactNode } from "react";
import s from "./pageheader.module.css";

export type Crumb = { label: string; href?: string };

export default function PageHeader({ crumbs, crumbsLabel, eyebrow, title, lead, actions, meta }: {
  crumbs: Crumb[];
  crumbsLabel: string;
  eyebrow?: string;
  title: string;
  lead?: string;
  actions?: ReactNode;
  meta?: ReactNode;
}) {
  return (
    <header className={`on-brand ${s.band}`}>
      <div className={s.bg} aria-hidden="true" />
      <div className={`container ${s.inner}`}>
        <nav aria-label={crumbsLabel}>
          <ol className={s.crumbs}>
            {crumbs.map((c, i) => (
              <li key={`${c.label}-${i}`}>
                {c.href && i < crumbs.length - 1 ? <Link href={c.href}>{c.label}</Link> : <span aria-current="page">{c.label}</span>}
                {i < crumbs.length - 1 && <ChevronRight aria-hidden="true" className={s.sep} />}
              </li>
            ))}
          </ol>
        </nav>
        {eyebrow && <p className="eyebrow">{eyebrow}</p>}
        <h1 className={s.title}>{title}</h1>
        {lead && <p className={`lead ${s.lead}`}>{lead}</p>}
        {meta && <div className={s.meta}>{meta}</div>}
        {actions && <div className={s.actions}>{actions}</div>}
      </div>
    </header>
  );
}
