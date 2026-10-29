// SectionReveal — scroll-tetiklemeli tek seferlik belirme (opacity + kısa translateY; CSS geçişi). SUNUCU bileşeni (D9 perf):
// yalnız işaretleme üretir (data-reveal + --rd gecikmesi); davranış layout'taki TEK istemci gözlemcisinde (RevealObserver) →
// her bölüm için ayrı hydration yok (TBT ↓). VARSAYILAN GÖRÜNÜR: SSR/no-JS/yavaş hydration'da içerik hep görünür;
// gözlemci yalnız ekran DIŞINDAKİ öğeleri gizleyip görünür alana girince gösterir. prefers-reduced-motion → hiç gizlenmez.
import type { ReactNode } from "react";
import { motion as t } from "../tokens";

export default function Reveal({ children, delay = 0, index = 0, as = "div", className }: {
  children: ReactNode;
  /** saniye */
  delay?: number;
  /** grid öğeleri için stagger sırası (delay'e eklenir) */
  index?: number;
  as?: "div" | "li";
  className?: string;
}) {
  const Tag = as;
  return (
    <Tag data-reveal="idle" className={className} style={{ "--rd": `${delay + index * t.stagger}s` } as React.CSSProperties}>
      {children}
    </Tag>
  );
}
