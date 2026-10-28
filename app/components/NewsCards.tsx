"use client";
// FAZ_4 4.6 — edge render bloğu: yayınlanmış haber kartları (contents.page_type=news_card, status=published) D1'den,
// public GET /api/v1/contents üzerinden ÇALIŞMA ANINDA gelir (PR/build yok). API yalnız published döner (onaylı ama
// yayınlanmamış kart görünmez). Metin HTML olarak DEĞİL düz yazı olarak basılır (markdown işaretleri temizlenir).
// API tabanı yoksa (NEXT_PUBLIC_API_BASE) blok hiç görünmez — sahte içerik yok.
import { useEffect, useState } from "react";

const API = process.env.NEXT_PUBLIC_API_BASE ?? "";
const LABEL: Record<string, string> = { tr: "Güncel haberler", en: "Latest news" };

interface Card { id: string; title: string; body_md: string; published_at: string | null }

const plain = (md: string) =>
  md.replace(/<!--[\s\S]*?-->/g, "").replace(/^#+\s.*$/gm, "").replace(/\[([^\]]+)\]\([^)]+\)/g, "$1").replace(/[*_`>#|]/g, "").replace(/\s+/g, " ").trim();

import st from "./news.module.css";

export default function NewsCards({ locale, className }: { locale: string; className?: string }) {
  const [cards, setCards] = useState<Card[]>([]);
  useEffect(() => {
    if (!API) return;
    const ctl = new AbortController();
    fetch(`${API}/api/v1/contents?page_type=news_card&locale=${encodeURIComponent(locale)}&limit=10`, { signal: ctl.signal })
      .then((r) => (r.ok ? r.json() : { data: [] }))
      .then((b: { data?: Card[] }) => setCards(Array.isArray(b.data) ? b.data : []))
      .catch(() => {});
    return () => ctl.abort();
  }, [locale]);
  if (cards.length === 0) return null;
  return (
    <section aria-labelledby="news-cards" className={`${st.news} ${className ?? ""}`}>
      <h2 id="news-cards" className={st.title}>{LABEL[locale] ?? LABEL.en}</h2>
      <ul role="list" className={st.list}>
        {cards.map((c) => (
          <li key={c.id} className={st.card}>
            <strong>{c.title}</strong>
            {c.published_at && <> · <time dateTime={c.published_at.replace(" ", "T") + "Z"}>{c.published_at.slice(0, 10)}</time></>}
            <p>{plain(c.body_md).slice(0, 280)}</p>
          </li>
        ))}
      </ul>
    </section>
  );
}
