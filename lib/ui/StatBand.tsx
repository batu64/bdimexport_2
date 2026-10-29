// StatBand — hero altına binen metrik kartı. Yalnız DOĞRULANABİLİR değerler (SLA taahhüdü / içerikten sayım);
// uydurma şirket rakamı YOK (hero-copy G7). Sayaç süsleme: SSR çıktısı gerçek sayı.
import CountUp from "./motion/CountUp";
import s from "./statband.module.css";

export type Stat = { value: number; unit?: string; label: string; decimals?: number; prefix?: string };

export default function StatBand({ items, label, locale }: { items: Stat[]; label: string; locale: string }) {
  return (
    <div className={`container ${s.wrap}`}>
      <dl className={s.band} aria-label={label} style={{ "--cols": items.length } as React.CSSProperties}>
        {items.map((it) => (
          <div key={it.label} className={s.item}>
            <dt className={s.label}>{it.label}</dt>
            <dd className={s.value}>
              {it.prefix && <span className={s.unit}>{it.prefix}</span>}
              <CountUp value={it.value} locale={locale} decimals={it.decimals} className={s.num} />
              {it.unit && <span className={s.unit}>{it.unit}</span>}
            </dd>
          </div>
        ))}
      </dl>
    </div>
  );
}
