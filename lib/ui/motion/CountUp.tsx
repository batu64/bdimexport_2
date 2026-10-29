"use client";
// StatBand sayacı — görünür olunca 0 → değer. SSR/no-JS/SEO çıktısı GERÇEK değerdir (sayaç yalnız süsleme);
// tabular-nums ile genişlik sabit (CLS yok). reduced-motion → sayaç çalışmaz, değer olduğu gibi kalır.
// D7: Framer yerine IntersectionObserver + requestAnimationFrame (~24 KB daha az JS; ana sayfa ilk yükü ≈ içerik sayfası).
import { useEffect, useRef } from "react";
import { motion as t } from "../tokens";

/** tokens.motion.easeOut eğrisine yakın expo ease-out */
const easeOut = (x: number) => (x >= 1 ? 1 : 1 - Math.pow(2, -10 * x));

export default function CountUp({ value, locale = "tr", decimals = 0, className }: { value: number; locale?: string; decimals?: number; className?: string }) {
  const ref = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el || typeof IntersectionObserver === "undefined") return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const fmt = new Intl.NumberFormat(locale, { minimumFractionDigits: decimals, maximumFractionDigits: decimals });
    const duration = t.slow * 3;
    let raf = 0;
    const run = () => {
      const start = performance.now();
      const tick = (now: number) => {
        const p = Math.min(1, (now - start) / duration);
        const v = value * easeOut(p);
        el.textContent = fmt.format(decimals ? v : Math.round(v));
        if (p < 1) raf = requestAnimationFrame(tick);
      };
      raf = requestAnimationFrame(tick);
    };
    const io = new IntersectionObserver(([e]) => { if (e.isIntersecting) { io.disconnect(); run(); } }, { threshold: 0.6 });
    io.observe(el);
    return () => { io.disconnect(); cancelAnimationFrame(raf); };
  }, [value, locale, decimals]);

  return (
    <span ref={ref} className={className}>
      {new Intl.NumberFormat(locale, { minimumFractionDigits: decimals, maximumFractionDigits: decimals }).format(value)}
    </span>
  );
}
