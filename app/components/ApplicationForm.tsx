// Step 1.6 — Başvuru Formu ŞABLONU (insan review bekliyor)
// DURUM: 🔒 [ŞART] Claude Sonnet 5.5 + İNSAN REVIEW — Sonnet Portal'dan erişilebilir; review imzası bekleniyor
// KVKK v1 onayı bekliyor (1.1) — rıza metni referansı v0.1-draft sha: 908031c6993e1c7b
// API endpoint: POST /api/v1/partners/apply — FAZ_3 3.4'te gerçek Workers kodu; bu şablon client katmanı

"use client";

import { useState } from "react";

// Proje.md §2.2 alanları BİREBİR — eksik alan = hard-red
type FormState = {
  firmaAdi: string;
  vergiNo: string;
  katalogFile: File | null;
  kapasite: string;
  sertifikalar: string[]; // CE, ISO9001, ISO14001, diğer
  ihracatGecmisi: string;
  kvkkConsent: boolean;      // Bölüm 1 rızası — zorunlu
  logoConsent: boolean;      // Bölüm 2 rızası — ayrı, opsiyonel
  turnstileToken: string;
};

const CERT_OPTIONS = ["CE", "ISO 9001", "ISO 14001", "GOTS", "OEKO-TEX", "Diğer"];

export default function ApplicationForm({ kvkkVersion }: { kvkkVersion: string }) {
  const [f, setF] = useState<FormState>({
    firmaAdi: "", vergiNo: "", katalogFile: null, kapasite: "",
    sertifikalar: [], ihracatGecmisi: "",
    kvkkConsent: false, logoConsent: false, turnstileToken: "",
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Turnstile script — widget render için (1.8)
  if (typeof window !== "undefined" && !document.querySelector('script[src*="challenges.cloudflare.com"]')) {
    const sc = document.createElement("script");
    sc.src = "https://challenges.cloudflare.com/turnstile/v0/api.js";
    sc.async = true;
    document.head.appendChild(sc);
  }
  const [submitting, setSubmitting] = useState(false);
  const [done, setDone] = useState(false);

  function validate(): boolean {
    const e: Record<string, string> = {};
    if (!f.firmaAdi.trim()) e.firmaAdi = "Firma adı zorunlu";
    if (!/^\d{10,11}$/.test(f.vergiNo.replace(/\s/g, ""))) e.vergiNo = "Vergi no 10-11 haneli olmalı";
    if (f.katalogFile && f.katalogFile.size > 25 * 1024 * 1024) e.katalogFile = "PDF 25MB altı olmalı";
    if (!f.kvkkConsent) e.kvkkConsent = "KVKK açık rızası zorunlu — form gönderilemez";
    // logoConsent ZORUNLU DEĞİL (ayrı rıza — opsiyonel)
    setErrors(e);
    return Object.keys(e).length === 0;
  }

  async function submit(ev: React.FormEvent) {
    ev.preventDefault();
    if (!validate()) return;
    setSubmitting(true);
    // TODO(FAZ_3): POST /api/v1/partners/apply — multipart (PDF) + Turnstile token server-side doğrulanır
    // Şimdilik: FAZ_1'de endpoint yok → form "hazır" durumunda, entegrasyon FAZ_3 3.4'te
    await new Promise(r => setTimeout(r, 500));
    setSubmitting(false);
    setDone(true);
  }

  if (done) {
    return (
      <div role="status" style={{ padding: "2rem", border: "1px solid #2E7D32", borderRadius: 12 }}>
        <h2>Başvurunuz alındı</h2>
        <p>Ön değerlendirme 48 saat içinde e-posta ile bildirilecek.</p>
      </div>
    );
  }

  const inputStyle = { width: "100%", padding: "10px", borderRadius: 8, border: "1px solid #E5E7EB" } as const;

  return (
    <form onSubmit={submit} noValidate style={{ maxWidth: 720, display: "grid", gap: "1rem" }}>
      {/* Firma Adı */}
      <div>
        <label htmlFor="firmaAdi">Firma Adı *</label><br />
        <input id="firmaAdi" style={inputStyle} value={f.firmaAdi}
          onChange={e => setF({ ...f, firmaAdi: e.target.value })} aria-required="true"
          aria-invalid={!!errors.firmaAdi} aria-describedby={errors.firmaAdi ? "err-firmaAdi" : undefined} />
        {errors.firmaAdi && <div id="err-firmaAdi" role="alert" style={{ color: "#C62828", fontSize: 12 }}>{errors.firmaAdi}</div>}
      </div>

      {/* Vergi No */}
      <div>
        <label htmlFor="vergiNo">Vergi No *</label><br />
        <input id="vergiNo" style={inputStyle} inputMode="numeric" value={f.vergiNo}
          onChange={e => setF({ ...f, vergiNo: e.target.value })} aria-required="true"
          aria-invalid={!!errors.vergiNo} aria-describedby={errors.vergiNo ? "err-vergiNo" : undefined} />
        {errors.vergiNo && <div id="err-vergiNo" role="alert" style={{ color: "#C62828", fontSize: 12 }}>{errors.vergiNo}</div>}
      </div>

      {/* Ürün Kataloğu PDF */}
      <div>
        <label htmlFor="katalog">Ürün Kataloğu (PDF, max 25MB)</label><br />
        <input id="katalog" type="file" accept="application/pdf" style={inputStyle}
          onChange={e => setF({ ...f, katalogFile: e.target.files?.[0] ?? null })}
          aria-describedby="katalog-note" />
        <div id="katalog-note" style={{ fontSize: 12, color: "#6B7280" }}>Katalog PDF'i R2'ye yüklenir — FAZ_3'te aktif</div>
        {errors.katalogFile && <div role="alert" style={{ color: "#C62828", fontSize: 12 }}>{errors.katalogFile}</div>}
      </div>

      {/* Kapasite */}
      <div>
        <label htmlFor="kapasite">Üretim Kapasitesi</label><br />
        <input id="kapasite" style={inputStyle} placeholder="Örn: ayda 5.000 adet"
          value={f.kapasite} onChange={e => setF({ ...f, kapasite: e.target.value })} />
      </div>

      {/* Sertifikalar */}
      <fieldset>
        <legend>Sertifikalar</legend>
        {CERT_OPTIONS.map(c => (
          <label key={c} style={{ marginRight: "1rem" }}>
            <input type="checkbox" checked={f.sertifikalar.includes(c)}
              onChange={e => setF({ ...f, sertifikalar: e.target.checked ? [...f.sertifikalar, c] : f.sertifikalar.filter(x => x !== c) })} />
            {" "}{c}
          </label>
        ))}
      </fieldset>

      {/* İhracat Geçmişi */}
      <div>
        <label htmlFor="gecmis">İhracat Geçmişi</label><br />
        <textarea id="gecmis" rows={3} style={inputStyle} placeholder="Varsa ülke/ürün/yıl bilgisi"
          value={f.ihracatGecmisi} onChange={e => setF({ ...f, ihracatGecmisi: e.target.value })} />
      </div>

      {/* KVKK Açık Rızası — ZORUNLU (Bölüm 1) */}
      <div style={{ border: "1px solid #E5E7EB", borderRadius: 8, padding: "1rem" }}>
        <label style={{ display: "flex", gap: ".5rem", alignItems: "flex-start" }}>
          <input type="checkbox" checked={f.kvkkConsent}
            onChange={e => setF({ ...f, kvkkConsent: e.target.checked })}
            aria-required="true" aria-invalid={!!errors.kvkkConsent} />
          <span>
            KVKK Aydınlatma Metni'ni okudum; kişisel verilerimin işlenmesine açık rıza veriyorum.{" "}
            <a href="/kvkk-riza" target="_blank" rel="noopener">Metni görüntüle</a> (sürüm: {kvkkVersion})
          </span>
        </label>
        {errors.kvkkConsent && <div role="alert" style={{ color: "#C62828", fontSize: 12 }}>{errors.kvkkConsent}</div>}
      </div>

      {/* Logo Yayın Rızası — AYRI checkbox, OPSİYONEL (Bölüm 2) */}
      <div style={{ border: "1px dashed #E5E7EB", borderRadius: 8, padding: "1rem" }}>
        <label style={{ display: "flex", gap: ".5rem", alignItems: "flex-start" }}>
          <input type="checkbox" checked={f.logoConsent}
            onChange={e => setF({ ...f, logoConsent: e.target.checked })} />
          <span>
            Ayrıca: firma adımın, sektörün ve logonun yabancı dil sayfalarda (İngilizce, Almanca vb.)
            "Verified Turkish Partner" olarak <strong>yayınlanmasına</strong> ayrıca rıza veriyorum.
            Bu rıza opsiyoneldir; vermesen de başvurun değerlendirilir.
          </span>
        </label>
      </div>

      {/* Turnstile — FAZ_1 1.8'de aktif (site key env'den) */}
      <div className="cf-turnstile" data-sitekey={process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY ?? "0x4AAAAAAFSsQDSM5SFySCaB"} />

      <button type="submit" disabled={submitting || !f.kvkkConsent}
        style={{ padding: "12px 24px", background: "#E8A13D", color: "#1A2B4A", border: "none", borderRadius: 8, fontWeight: 600, cursor: submitting ? "wait" : "pointer" }}>
        {submitting ? "Gönderiliyor…" : "Başvuruyu Gönder"}
      </button>
      <p style={{ fontSize: 12, color: "#6B7280" }}>
        Not: KVKK checkbox'sız submit hem client hem server tarafında engellenir (sunucu doğrulaması FAZ_3'te).
      </p>
    </form>
  );
}
