// Uzun içerik düzeni: prose (okuma ölçüsü 72ch) + 1280+'da yapışkan yan sütun ("Bu sayfada" içindekiler + CTA kartı).
// Mobilde yan sütun içerikten SONRA gelir (okuma akışı bozulmaz). İçindekiler sunucuda md başlıklarından üretilir.
import type { ReactNode } from "react";
import { ArrowRight } from "lucide-react";
import Button from "./Button";
import s from "./article.module.css";

export type TocItem = { id: string; text: string };

export default function ArticleLayout({ children, toc, tocLabel, aside }: {
  children: ReactNode;
  toc?: TocItem[];
  tocLabel?: string;
  aside?: ReactNode;
}) {
  return (
    <div className={`container ${s.grid}`}>
      <div className={s.main}>{children}</div>
      <aside className={s.aside}>
        <div className={s.sticky}>
          {toc && toc.length > 1 && (
            <nav aria-label={tocLabel} className={s.toc}>
              <p className={s.asideTitle}>{tocLabel}</p>
              <ol role="list">
                {toc.map((h) => (
                  <li key={h.id}><a href={`#${h.id}`}>{h.text}</a></li>
                ))}
              </ol>
            </nav>
          )}
          {aside}
        </div>
      </aside>
    </div>
  );
}

/** Yan sütun CTA kartı (koyu, tek aksiyon) */
export function AsideCta({ title, text, cta, secondary }: {
  title: string;
  text: string;
  cta: { label: string; href: string };
  secondary?: { label: string; href: string };
}) {
  return (
    <div className={`on-brand ${s.ctaCard}`}>
      <p className={s.ctaTitle}>{title}</p>
      <p className={s.ctaText}>{text}</p>
      <Button href={cta.href} variant="primary" arrow>{cta.label}</Button>
      {secondary && (
        <a className={s.ctaLink} href={secondary.href}>
          <span>{secondary.label}</span>
          <ArrowRight aria-hidden="true" className={s.ctaArrow} />
        </a>
      )}
    </div>
  );
}
