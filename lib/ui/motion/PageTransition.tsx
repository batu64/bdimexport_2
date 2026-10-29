"use client";
// Sayfa geçişi — client-side gezinmede içerik kısa fade + hafif kayma ile girer (transform/opacity, ~250ms).
// İLK YÜKLEMEDE OYNAMAZ (LCP/CLS etkilenmez); yalnız sonraki rota değişimlerinde. reduced-motion → globals.css kapatır.
// RTL: kayma dikey (translateY) → aynalama gerekmez. Ayrıca tüm sayfa için tek RevealObserver'ı barındırır.
import { usePathname } from "next/navigation";
import { useEffect, type ReactNode } from "react";
import RevealObserver from "./RevealObserver";

let navigated = false; // modül düzeyi: ilk mount'tan sonra true

export default function PageTransition({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const animate = navigated;
  useEffect(() => { navigated = true; }, []);
  return (
    <>
      <RevealObserver />
      <div key={pathname} className={animate ? "page-enter" : undefined}>
        {children}
      </div>
    </>
  );
}
