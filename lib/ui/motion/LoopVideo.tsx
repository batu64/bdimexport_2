"use client";
// Remotion çıktısı (public/media/video/{name}.webm|mp4|-poster.webp) için dekoratif sessiz döngü.
// Poster her zaman (statik, ~10 KB). <video> yalnız mount SONRASI, ≥768px ve prefers-reduced-motion KAPALIYKEN eklenir →
// mobil + reduced-motion'da video İNDİRİLMEZ (talimat D8). lazy: görünür alana yaklaşınca (IntersectionObserver).
// Dekoratif: aria-hidden, alt="" — içerik HTML'de.
import { useEffect, useRef, useState } from "react";
import { breakpoint } from "../tokens";
import s from "./loopvideo.module.css";

const BASE = "/media/video";

export default function LoopVideo({ name, lazy = false, className }: { name: string; lazy?: boolean; className?: string }) {
  const ref = useRef<HTMLDivElement>(null);
  const [mount, setMount] = useState(false);
  const [playing, setPlaying] = useState(false);

  useEffect(() => {
    const ok = window.matchMedia(`(min-width: ${breakpoint.md}px)`).matches && !window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (!ok) return;
    if (!lazy || typeof IntersectionObserver === "undefined") { setMount(true); return; }
    const io = new IntersectionObserver(([e]) => { if (e.isIntersecting) { setMount(true); io.disconnect(); } }, { rootMargin: "200px" });
    if (ref.current) io.observe(ref.current);
    return () => io.disconnect();
  }, [lazy]);

  return (
    <div ref={ref} className={`${s.wrap} ${className ?? ""}`} aria-hidden="true">
      {/* eslint-disable-next-line @next/next/no-img-element -- static export (images.unoptimized); poster zaten optimize webp */}
      <img src={`${BASE}/${name}-poster.webp`} alt="" className={s.media} decoding="async" loading={lazy ? "lazy" : "eager"} />
      {mount && (
        <video
          className={`${s.media} ${s.video}`}
          data-playing={playing || undefined}
          autoPlay
          muted
          loop
          playsInline
          preload="auto"
          poster={`${BASE}/${name}-poster.webp`}
          onPlaying={() => setPlaying(true)}
        >
          <source src={`${BASE}/${name}.webm`} type="video/webm" />
          <source src={`${BASE}/${name}.mp4`} type="video/mp4" />
        </video>
      )}
    </div>
  );
}
