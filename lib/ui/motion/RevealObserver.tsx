"use client";
// Tüm [data-reveal] öğeleri için TEK IntersectionObserver (layout başına bir kez). Rota değişiminde yeniden tarar.
// İlk ekrandaki öğelere dokunmaz (LCP/CLS etkisiz); ekran dışını "hidden" yapar, görünür olunca "shown" (CSS geçişi globals.css).
import { usePathname } from "next/navigation";
import { useEffect } from "react";

export default function RevealObserver() {
  const pathname = usePathname();
  useEffect(() => {
    if (typeof IntersectionObserver === "undefined") return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const io = new IntersectionObserver(
      (entries) => {
        for (const e of entries) {
          if (!e.isIntersecting) continue;
          (e.target as HTMLElement).dataset.reveal = "shown";
          io.unobserve(e.target);
        }
      },
      { threshold: 0.15, rootMargin: "0px 0px -5% 0px" },
    );
    const vh = window.innerHeight;
    document.querySelectorAll<HTMLElement>('[data-reveal="idle"]').forEach((el) => {
      const r = el.getBoundingClientRect();
      if (r.top < vh && r.bottom > 0) return; // ilk ekranda: olduğu gibi kalır
      el.dataset.reveal = "hidden";
      io.observe(el);
    });
    return () => io.disconnect();
  }, [pathname]);
  return null;
}
