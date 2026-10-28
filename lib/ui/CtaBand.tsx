// Kapanış CTA bandı (cta.md "içerik sonu" konumu) — tüm dillerde ortak; metin/link çağıran sayfadan (sözlük).
import Button from "./Button";
import Reveal from "./motion/Reveal";
import s from "./ctaband.module.css";

export default function CtaBand({ id = "cta", title, lead, primary, secondary }: {
  id?: string;
  title: string;
  lead?: string;
  primary: { label: string; href: string };
  secondary?: { label: string; href: string };
}) {
  return (
    <section aria-labelledby={`${id}-title`} className={`on-brand ${s.band}`}>
      <div className={s.bg} aria-hidden="true" />
      <div className={`container ${s.inner}`}>
        <Reveal>
          <h2 id={`${id}-title`} className={s.title}>{title}</h2>
          {lead && <p className={`lead ${s.lead}`}>{lead}</p>}
        </Reveal>
        <Reveal index={1} className={s.actions}>
          <Button href={primary.href} variant="primary" size="lg" arrow>{primary.label}</Button>
          {secondary && <Button href={secondary.href} variant="secondary" tone="brand" size="lg">{secondary.label}</Button>}
        </Reveal>
      </div>
    </section>
  );
}
