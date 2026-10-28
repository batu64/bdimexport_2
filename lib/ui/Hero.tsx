// hero.md (variant home) — koyu brand zemin, 55/45 iki kolon (1280+), tek kolon (≤768). Navbar şeffaf olarak üstüne biner.
// Giriş: CSS stagger (JS beklemez → LCP/FOUC yok). H1 ANİMASYONSUZ: ilk boyamada okunur (LCP adayı).
// Arka plan: token renkli gradient ağ + ızgara (CSS, yalnız transform animasyonu); D8'de Remotion loop videosu eklenir.
import { Check } from "lucide-react";
import type { ReactNode } from "react";
import Button from "./Button";
import s from "./hero.module.css";

export type HeroProps = {
  id?: string;
  eyebrow?: string;
  title: string;
  subtitle: string;
  primary: { label: string; href: string };
  secondary?: { label: string; href: string };
  trust?: string[];
  trustLabel?: string;
  visual?: ReactNode;
};

export default function Hero({ id = "hero", eyebrow, title, subtitle, primary, secondary, trust = [], trustLabel, visual }: HeroProps) {
  return (
    <section aria-labelledby={`${id}-title`} className={`on-brand ${s.hero}`}>
      <div className={s.bg} aria-hidden="true">
        <span className={s.glowA} />
        <span className={s.glowB} />
        <span className={s.grid} />
      </div>
      <div className={`container ${s.inner} ${visual ? "" : s.single}`}>
        <div className={s.copy}>
          {eyebrow && (
            <p className={`${s.eyebrow} ${s.enter}`} style={{ "--d": 0 } as React.CSSProperties}>
              <span className={s.dot} aria-hidden="true" />
              {eyebrow}
            </p>
          )}
          <h1 id={`${id}-title`} className={s.title}>{title}</h1>
          <p className={`${s.sub} ${s.enter}`} style={{ "--d": 1 } as React.CSSProperties}>{subtitle}</p>
          <div className={`${s.ctas} ${s.enter}`} style={{ "--d": 2 } as React.CSSProperties}>
            <Button href={primary.href} variant="primary" size="lg" arrow>{primary.label}</Button>
            {secondary && <Button href={secondary.href} variant="secondary" tone="brand" size="lg">{secondary.label}</Button>}
          </div>
          {trust.length > 0 && (
            <ul role="list" aria-label={trustLabel} className={`${s.trust} ${s.enter}`} style={{ "--d": 3 } as React.CSSProperties}>
              {trust.map((t) => (
                <li key={t}>
                  <Check aria-hidden="true" className={s.check} />
                  <span>{t}</span>
                </li>
              ))}
            </ul>
          )}
        </div>
        {visual && <div className={`${s.visual} ${s.enter}`} style={{ "--d": 2 } as React.CSSProperties}>{visual}</div>}
      </div>
    </section>
  );
}
