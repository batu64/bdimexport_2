"use client";
// Şirketlere gönderilen teklif e-postalarındaki URL parametrelerini (?co= / ?firma=, ?country= / ?ulke=, ?sector= / ?urun=, ?hs= / ?gtip=, ?vol= / ?miktar=)
// istemci tarafında okur ve sayfa üstünde kişiselleştirilmiş kurumsal yönetici özeti (ABM Executive Brief) gösterir.
// Parametre yoksa hiçbir gürültü oluşturmaz; organik SEO ziyaretçisi temiz şablon sayfasını görür.

import { useEffect, useState } from "react";
import s from "./proposal.module.css";

export type PersonalizerLabels = {
  eyebrow: string;
  preparedForPrefix: string;
  sectorLabel: string;
  marketLabel: string;
  hsLabel: string;
  volumeLabel: string;
};

export default function ProposalPersonalizer({ labels }: { labels: PersonalizerLabels }) {
  const [data, setData] = useState<{
    company: string;
    country: string;
    sector: string;
    hs: string;
    vol: string;
  } | null>(null);

  useEffect(() => {
    if (typeof window === "undefined" || !window.location.search) return;
    const q = new URLSearchParams(window.location.search);
    const company = (q.get("co") ?? q.get("firma") ?? "").trim();
    const country = (q.get("country") ?? q.get("ulke") ?? "").trim();
    const sector = (q.get("sector") ?? q.get("urun") ?? "").trim();
    const hs = (q.get("hs") ?? q.get("gtip") ?? "").trim();
    const vol = (q.get("vol") ?? q.get("miktar") ?? "").trim();
    if (company || country || sector || hs || vol) {
      setData({ company, country, sector, hs, vol });
    }
  }, []);

  if (!data) return null;

  return (
    <aside className={s.banner} role="region" aria-label={labels.eyebrow}>
      <span className={s.bannerEyebrow}>{labels.eyebrow}</span>
      {data.company && (
        <h2 className={s.bannerTitle}>
          {labels.preparedForPrefix} {data.company}
        </h2>
      )}
      <div className={s.bannerMeta}>
        {data.sector && <span className={s.bannerChip}>{labels.sectorLabel}: {data.sector}</span>}
        {data.country && <span className={s.bannerChip}>{labels.marketLabel}: {data.country}</span>}
        {data.hs && <span className={s.bannerChip}>{labels.hsLabel}: {data.hs}</span>}
        {data.vol && <span className={s.bannerChip}>{labels.volumeLabel}: {data.vol}</span>}
      </div>
    </aside>
  );
}
