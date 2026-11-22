"use client";
// Şirketlere gönderilecek iş teklifi e-postaları için anında hedefli URL + e-posta metni üreteci (ABM Campaign & Proposal Link Builder).
// Statik dışa aktarımla %100 uyumlu: sunucu gerektirmez, hem uzun SEO URL'sini hem kısa yönlendirme uzantısını (/t/... ve /p/...) üretir.

import { useId, useMemo, useState } from "react";
import s from "./proposal.module.css";

export interface BuilderTemplateOption {
  id: string;
  lang: "tr" | "en" | "de" | "zh";
  label: string;
  fullBasePath: string;   // örn: /teklif/ihracat-buyume-sistemi veya /en/proposals/dual-hub-sourcing
  shortBasePath: string;  // örn: /t/ihracat-buyume-sistemi veya /p/dual-hub-sourcing
  subjectTpl: string;
  bodyTpl: string;
}

export interface ProposalBuilderCopy {
  eyebrow: string;
  title: string;
  lead: string;
  templateLabel: string;
  companyLabel: string;
  companyPlaceholder: string;
  countryLabel: string;
  countryPlaceholder: string;
  sectorLabel: string;
  sectorPlaceholder: string;
  hsLabel: string;
  hsPlaceholder: string;
  volLabel: string;
  volPlaceholder: string;
  shortUrlLabel: string;
  fullUrlLabel: string;
  copyLinkBtn: string;
  copiedBtn: string;
  copyEmailBtn: string;
  previewBtn: string;
  subjectPrefix: string;
  defaultCompany: string;
  defaultCountry: string;
  defaultSector: string;
}

const DOMAIN = "https://bdimexport.com";

export default function ProposalLinkBuilder({
  options,
  copy,
}: {
  options: BuilderTemplateOption[];
  copy: ProposalBuilderCopy;
}) {
  const uid = useId();
  const [selectedId, setSelectedId] = useState(options[0]?.id ?? "");
  const [company, setCompany] = useState("");
  const [country, setCountry] = useState("");
  const [sector, setSector] = useState("");
  const [hs, setHs] = useState("");
  const [vol, setVol] = useState("");
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  const tpl = options.find((o) => o.id === selectedId) ?? options[0];

  const queryString = useMemo(() => {
    const params = new URLSearchParams();
    const isTr = tpl?.lang === "tr";
    if (company.trim()) params.set(isTr ? "firma" : "co", company.trim());
    if (country.trim()) params.set(isTr ? "ulke" : "country", country.trim());
    if (sector.trim()) params.set(isTr ? "urun" : "sector", sector.trim());
    if (hs.trim()) params.set(isTr ? "gtip" : "hs", hs.trim());
    if (vol.trim()) params.set(isTr ? "miktar" : "vol", vol.trim());
    const str = params.toString();
    return str ? `?${str}` : "";
  }, [tpl?.lang, company, country, sector, hs, vol]);

  const fullUrl = `${DOMAIN}${tpl?.fullBasePath ?? ""}${queryString}`;
  const shortUrl = `${DOMAIN}${tpl?.shortBasePath ?? ""}${queryString}`;
  const previewHref = `${tpl?.fullBasePath ?? "/"}${queryString}`;

  const emailRendered = useMemo(() => {
    if (!tpl) return { subject: "", body: "" };
    const fill = (raw: string) =>
      raw
        .replaceAll("{{company}}", company.trim() || copy.defaultCompany)
        .replaceAll("{{country}}", country.trim() || copy.defaultCountry)
        .replaceAll("{{sector}}", sector.trim() || copy.defaultSector)
        .replaceAll("{{url}}", shortUrl);
    return {
      subject: fill(tpl.subjectTpl),
      body: fill(tpl.bodyTpl),
    };
  }, [tpl, company, country, sector, shortUrl, copy.defaultCompany, copy.defaultCountry, copy.defaultSector]);

  async function copyText(key: string, val: string) {
    try {
      await navigator.clipboard.writeText(val);
      setCopiedKey(key);
      setTimeout(() => setCopiedKey(null), 2200);
    } catch {
      // clipboard unavailable
    }
  }

  return (
    <div className={s.builder}>
      <span className="eyebrow">{copy.eyebrow}</span>
      <h2 className={s.boxTitle}>{copy.title}</h2>
      <p className={s.boxText}>{copy.lead}</p>

      <div className={s.formGrid}>
        <div className={s.field}>
          <label className={s.label} htmlFor={`${uid}-tpl`}>{copy.templateLabel}</label>
          <select id={`${uid}-tpl`} className={s.select} value={selectedId} onChange={(e) => setSelectedId(e.target.value)}>
            {options.map((o) => (
              <option key={o.id} value={o.id}>{o.label}</option>
            ))}
          </select>
        </div>
        <div className={s.field}>
          <label className={s.label} htmlFor={`${uid}-co`}>{copy.companyLabel}</label>
          <input id={`${uid}-co`} className={s.input} value={company} onChange={(e) => setCompany(e.target.value)} placeholder={copy.companyPlaceholder} />
        </div>
        <div className={s.field}>
          <label className={s.label} htmlFor={`${uid}-country`}>{copy.countryLabel}</label>
          <input id={`${uid}-country`} className={s.input} value={country} onChange={(e) => setCountry(e.target.value)} placeholder={copy.countryPlaceholder} />
        </div>
        <div className={s.field}>
          <label className={s.label} htmlFor={`${uid}-sector`}>{copy.sectorLabel}</label>
          <input id={`${uid}-sector`} className={s.input} value={sector} onChange={(e) => setSector(e.target.value)} placeholder={copy.sectorPlaceholder} />
        </div>
        <div className={s.field}>
          <label className={s.label} htmlFor={`${uid}-hs`}>{copy.hsLabel}</label>
          <input id={`${uid}-hs`} className={s.input} value={hs} onChange={(e) => setHs(e.target.value)} placeholder={copy.hsPlaceholder} />
        </div>
        <div className={s.field}>
          <label className={s.label} htmlFor={`${uid}-vol`}>{copy.volLabel}</label>
          <input id={`${uid}-vol`} className={s.input} value={vol} onChange={(e) => setVol(e.target.value)} placeholder={copy.volPlaceholder} />
        </div>
      </div>

      <div className={s.outputStack}>
        <div>
          <div className={s.label}>{copy.shortUrlLabel}</div>
          <div className={s.urlBox}>
            <code className={s.codeMono}>{shortUrl}</code>
            <button type="button" className={s.actionBtnAlt} onClick={() => copyText("short", shortUrl)}>
              {copiedKey === "short" ? copy.copiedBtn : copy.copyLinkBtn}
            </button>
          </div>
        </div>

        <div>
          <div className={s.label}>{copy.fullUrlLabel}</div>
          <div className={s.urlBox}>
            <code className={s.codeMono}>{fullUrl}</code>
            <button type="button" className={s.actionBtnAlt} onClick={() => copyText("full", fullUrl)}>
              {copiedKey === "full" ? copy.copiedBtn : copy.copyLinkBtn}
            </button>
          </div>
        </div>

        <div>
          <div className={s.label}>{copy.subjectPrefix}: {emailRendered.subject}</div>
          <pre className={s.emailPre}>{emailRendered.body}</pre>
        </div>

        <div className={s.btnRow}>
          <button
            type="button"
            className={s.actionBtn}
            onClick={() => copyText("email", `${copy.subjectPrefix}: ${emailRendered.subject}\n\n${emailRendered.body}`)}
          >
            {copiedKey === "email" ? copy.copiedBtn : copy.copyEmailBtn}
          </button>
          <a href={previewHref} className={s.actionBtnAlt}>
            {copy.previewBtn}
          </a>
        </div>
      </div>
    </div>
  );
}
