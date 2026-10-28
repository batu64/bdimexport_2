// Süreç adımları — numaralı ikonlu zaman çizelgesi (ana sayfalar; tüm diller). Metin + ikon çağırandan.
import type { LucideIcon } from "lucide-react";
import Reveal from "./motion/Reveal";
import s from "./steps.module.css";

export default function Steps({ steps, icons }: { steps: { title: string; text: string }[]; icons: LucideIcon[] }) {
  return (
    <ol className={s.steps}>
      {steps.map((st, i) => {
        const Icon = icons[i % icons.length];
        return (
          <Reveal as="li" key={st.title} index={i} className={s.step}>
            <span className={s.stepNum} aria-hidden="true">
              <Icon className={s.stepIcon} />
            </span>
            <span className={s.stepIdx} aria-hidden="true">{String(i + 1).padStart(2, "0")}</span>
            <h3 className={s.stepTitle}>{st.title}</h3>
            <p className={s.stepText}>{st.text}</p>
          </Reveal>
        );
      })}
    </ol>
  );
}
