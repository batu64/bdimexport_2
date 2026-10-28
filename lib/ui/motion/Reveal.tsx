"use client";
// SectionReveal — scroll-tetiklemeli tek seferlik belirme (opacity + kısa translateY; yalnız GPU özellikleri; CSS geçişi).
// VARSAYILAN GÖRÜNÜR: SSR/no-JS/yavaş hydration'da içerik hep görünür (LCP, SEO, erişilebilirlik).
// Hydration'da yalnız ekranın DIŞINDA kalan öğeler gizlenir, görünür alana girince belirir; zaten görünenlere dokunulmaz.
// prefers-reduced-motion → hiç gizlenmez. Framer yerine IntersectionObserver: ek paket maliyeti yok.
import { useLayoutEffect, useRef, useState, type ReactNode } from "react";
import { motion as t } from "../tokens";

type State = "idle" | "hidden" | "shown";

export default function Reveal({ children, delay = 0, index = 0, as = "div", className }: {
  children: ReactNode;
  /** saniye */
  delay?: number;
  /** grid öğeleri için stagger sırası (delay'e eklenir) */
  index?: number;
  as?: "div" | "li";
  className?: string;
}) {
  const ref = useRef<HTMLElement>(null);
  const [state, setState] = useState<State>("idle");

  useLayoutEffect(() => {
    const el = ref.current;
    if (!el || typeof IntersectionObserver === "undefined") return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const r = el.getBoundingClientRect();
    if (r.top < window.innerHeight && r.bottom > 0) return; // ilk ekranda: olduğu gibi kalır
    setState("hidden");
    const io = new IntersectionObserver(
      ([e]) => { if (e.isIntersecting) { setState("shown"); io.disconnect(); } },
      { threshold: 0.15, rootMargin: "0px 0px -5% 0px" },
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  const Tag = as;
  return (
    <Tag
      ref={ref as never}
      data-reveal={state}
      className={className}
      style={{ "--rd": `${delay + index * t.stagger}s` } as React.CSSProperties}
    >
      {children}
    </Tag>
  );
}
