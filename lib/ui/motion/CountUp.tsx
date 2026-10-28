"use client";
// StatBand sayacı — görünür olunca 0 → değer. SSR/no-JS/SEO çıktısı GERÇEK değerdir (sayaç yalnız süsleme);
// tabular-nums ile genişlik sabit (CLS yok). reduced-motion → sayaç çalışmaz, değer olduğu gibi kalır.
import { animate, useInView, useReducedMotion } from "framer-motion";
import { useEffect, useRef } from "react";
import { motion as t } from "../tokens";

export default function CountUp({ value, locale = "tr", decimals = 0, className }: { value: number; locale?: string; decimals?: number; className?: string }) {
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true, amount: 0.6 });
  const reduce = useReducedMotion();
  const fmt = new Intl.NumberFormat(locale, { minimumFractionDigits: decimals, maximumFractionDigits: decimals });

  useEffect(() => {
    if (!inView || reduce || !ref.current) return;
    const el = ref.current;
    const ctrl = animate(0, value, {
      duration: (t.slow * 3) / 1000,
      ease: t.easeOut,
      onUpdate: (v) => { el.textContent = fmt.format(decimals ? v : Math.round(v)); },
    });
    return () => ctrl.stop();
    // fmt her render'da yeni nesne; değer/locale değişmedikçe yeniden çalıştırmaya gerek yok
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [inView, reduce, value, decimals]);

  return <span ref={ref} className={className}>{fmt.format(value)}</span>;
}
