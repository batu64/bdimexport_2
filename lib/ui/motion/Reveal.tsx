"use client";
// SectionReveal — scroll-tetiklemeli tek seferlik belirme (opacity + kısa translateY; yalnız GPU özellikleri).
// LazyMotion + domAnimation: tam framer paketi yerine küçük özellik seti.
// prefers-reduced-motion + JS'siz: globals.css / <noscript> [data-reveal]'i CSS ile görünür kılar — JS dallanması yok
// (sunucu reduce'u bilemez; dallanma hydration uyuşmazlığı doğururdu). İçerik animasyona bağlı DEĞİL.
import { LazyMotion, domAnimation, m } from "framer-motion";
import type { ReactNode } from "react";
import { motion as t } from "../tokens";

export default function Reveal({ children, delay = 0, index, as = "div", className }: {
  children: ReactNode;
  delay?: number;
  /** grid öğeleri için stagger sırası (delay'e eklenir) */
  index?: number;
  as?: "div" | "li";
  className?: string;
}) {
  const M = as === "li" ? m.li : m.div;
  return (
    <LazyMotion features={domAnimation} strict>
      <M
        data-reveal=""
        className={className}
        initial={{ opacity: 0, y: t.distance }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, amount: 0.2 }}
        transition={{ duration: t.slow / 1000, ease: t.easeOut, delay: delay + (index ?? 0) * t.stagger }}
      >
        {children}
      </M>
    </LazyMotion>
  );
}
