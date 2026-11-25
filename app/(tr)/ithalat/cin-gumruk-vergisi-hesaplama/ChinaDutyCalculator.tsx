"use client";
// Interactive China-to-Turkiye Customs Duty, IGV, Surveillance (Gozetim) & Landed Cost Simulator.
import { useId, useMemo, useState } from "react";
import Link from "next/link";
import { Calculator, MessageCircle } from "lucide-react";
import { clarityEvent, clarityUpgrade } from "@/lib/ui/clarity";
import { OFFICIAL_WHATSAPP_WA } from "@/lib/ui/entities";
import s from "./chinaduty.module.css";

type Preset = {
  id: string;
  label: string;
  fob: number;
  freight: number;
  weightKg: number;
  gvPct: number;
  igvPct: number;
  gozetimUsdPerKg: number;
  kdvPct: number;
};

const PRESETS: Preset[] = [
  { id: "tekstil", label: "Tekstil & Konfeksiyon Örneği", fob: 18000, freight: 2400, weightKg: 2200, gvPct: 12, igvPct: 30, gozetimUsdPerKg: 14, kdvPct: 10 },
  { id: "makine", label: "Endüstriyel Makine & Parça", fob: 32000, freight: 2600, weightKg: 4500, gvPct: 2.7, igvPct: 10, gozetimUsdPerKg: 0, kdvPct: 20 },
  { id: "elektronik", label: "Elektronik & Aydınlatma", fob: 22000, freight: 2300, weightKg: 1800, gvPct: 4.5, igvPct: 20, gozetimUsdPerKg: 16, kdvPct: 20 },
  { id: "mobilya-ev", label: "Mobilya & Ev-Yaşam Ürünleri", fob: 15000, freight: 2800, weightKg: 3500, gvPct: 5.6, igvPct: 25, gozetimUsdPerKg: 7, kdvPct: 20 },
];

const fmtUsd = (n: number) =>
  new Intl.NumberFormat("tr-TR", { style: "currency", currency: "USD", maximumFractionDigits: 0 }).format(
    Number.isFinite(n) ? n : 0,
  );

export default function ChinaDutyCalculator() {
  const uid = useId();
  const [presetId, setPresetId] = useState<string>("makine");
  const [fob, setFob] = useState<number>(32000);
  const [freight, setFreight] = useState<number>(2600);
  const [insurance, setInsurance] = useState<number>(120);
  const [weightKg, setWeightKg] = useState<number>(4500);
  const [gvPct, setGvPct] = useState<number>(2.7);
  const [igvPct, setIgvPct] = useState<number>(10);
  const [dampingPct, setDampingPct] = useState<number>(0);
  const [gozetimPerKg, setGozetimPerKg] = useState<number>(0);
  const [localPortUsd, setLocalPortUsd] = useState<number>(850);
  const [kdvPct, setKdvPct] = useState<number>(20);

  function applyPreset(p: Preset) {
    setPresetId(p.id);
    setFob(p.fob);
    setFreight(p.freight);
    setInsurance(Math.round((p.fob + p.freight) * 0.004));
    setWeightKg(p.weightKg);
    setGvPct(p.gvPct);
    setIgvPct(p.igvPct);
    setDampingPct(0);
    setGozetimPerKg(p.gozetimUsdPerKg);
    setKdvPct(p.kdvPct);
    clarityEvent(`calc_tr_preset_${p.id}`);
  }

  const calc = useMemo(() => {
    const cif = Math.max(0, fob) + Math.max(0, freight) + Math.max(0, insurance);
    const gozetimTotal = Math.max(0, weightKg) * Math.max(0, gozetimPerKg);
    const customsBase = Math.max(cif, gozetimTotal);
    const gozetimDiff = Math.max(0, gozetimTotal - cif);

    const gv = customsBase * (Math.max(0, gvPct) / 100);
    const igv = customsBase * (Math.max(0, igvPct) / 100);
    const damping = cif * (Math.max(0, dampingPct) / 100);
    const totalDuties = gv + igv + damping;

    const kdvBase = customsBase + totalDuties + Math.max(0, localPortUsd);
    const kdv = kdvBase * (Math.max(0, kdvPct) / 100);

    // 2023/2026 KDV Kanunu Md. 30/d uyarisi: gozetim farkina isabet eden vergi/KDV kismi indirim konusu yapilamaz
    const nonDeductibleKdvApprox =
      gozetimDiff > 0 ? (gozetimDiff * (1 + (Math.max(0, gvPct) + Math.max(0, igvPct)) / 100)) * (Math.max(0, kdvPct) / 100) : 0;

    const landedExKdv = cif + totalDuties + Math.max(0, localPortUsd);
    const landedIncKdv = landedExKdv + kdv;
    const taxMultiplier = fob > 0 ? ((landedExKdv - fob) / fob) * 100 : 0;

    return {
      cif,
      gozetimTotal,
      customsBase,
      gozetimDiff,
      gv,
      igv,
      damping,
      totalDuties,
      kdvBase,
      kdv,
      nonDeductibleKdvApprox,
      landedExKdv,
      landedIncKdv,
      taxMultiplier,
    };
  }, [fob, freight, insurance, weightKg, gvPct, igvPct, dampingPct, gozetimPerKg, localPortUsd, kdvPct]);

  const waText = [
    "[Çin İthalat Vergisi & Maliyet Simülasyonu — bdimexport.com]",
    `• FOB Ürün Bedeli: ${fmtUsd(fob)} | CIF: ${fmtUsd(calc.cif)}`,
    `• Brüt Ağırlık: ${weightKg} kg | Gözetim Kıymeti: ${gozetimPerKg > 0 ? `${gozetimPerKg} $/kg` : "Yok"}`,
    `• Oranlar: GV %${gvPct} · İGV %${igvPct} · Anti-Damping %${dampingPct} · KDV %${kdvPct}`,
    `• Tahmini Gümrük Vergileri Toplamı (KDV Hariç): ${fmtUsd(calc.totalDuties)}`,
    `• Tahmini Depo Teslim Maliyet (KDV Hariç): ${fmtUsd(calc.landedExKdv)} | KDV Dahil Nakit Çıkışı: ${fmtUsd(calc.landedIncKdv)}`,
    "GTİP kodumuzun teyidi, TAREKS kontrolü ve fabrika/konteyner denetimli net teklif rica ederiz.",
  ].join("\n");

  return (
    <div className={s.card} id="hesaplayici">
      <div>
        <p className={s.kpiLabel}>Hızlı Sektör Şablonları (Örnek Oranlar)</p>
        <div className={s.presets} role="group" aria-label="Sektör şablonları">
          {PRESETS.map((p) => (
            <button
              key={p.id}
              type="button"
              className={s.presetBtn}
              aria-pressed={presetId === p.id}
              onClick={() => applyPreset(p)}
            >
              {p.label}
            </button>
          ))}
        </div>
      </div>

      <div className={s.grid}>
        <div className={s.field}>
          <label className={s.label} htmlFor={`${uid}-fob`}>FOB Ürün Bedeli (USD)</label>
          <input id={`${uid}-fob`} type="number" min={0} step={500} className={s.input} value={fob} onChange={(e) => { setPresetId("custom"); setFob(Number(e.target.value)); }} />
          <span className={s.hint}>Çin limanı teslim fatura tutarı</span>
        </div>
        <div className={s.field}>
          <label className={s.label} htmlFor={`${uid}-fr`}>Navlun / Konteyner Taşıma (USD)</label>
          <input id={`${uid}-fr`} type="number" min={0} step={100} className={s.input} value={freight} onChange={(e) => { setPresetId("custom"); setFreight(Number(e.target.value)); }} />
          <span className={s.hint}>Deniz / demiryolu / hava taşıma bedeli</span>
        </div>
        <div className={s.field}>
          <label className={s.label} htmlFor={`${uid}-ins`}>Nakliyat Sigortası (USD)</label>
          <input id={`${uid}-ins`} type="number" min={0} step={20} className={s.input} value={insurance} onChange={(e) => { setPresetId("custom"); setInsurance(Number(e.target.value)); }} />
          <span className={s.hint}>Sigorta poliçesi yoksa emsal %0,3–%1</span>
        </div>
        <div className={s.field}>
          <label className={s.label} htmlFor={`${uid}-kg`}>Toplam Brüt Ağırlık (kg)</label>
          <input id={`${uid}-kg`} type="number" min={0} step={100} className={s.input} value={weightKg} onChange={(e) => { setPresetId("custom"); setWeightKg(Number(e.target.value)); }} />
          <span className={s.hint}>Gözetim tebliği kontrolü için brüt kg</span>
        </div>
        <div className={s.field}>
          <label className={s.label} htmlFor={`${uid}-goz`}>Gözetim Birim Kıymeti ($/kg)</label>
          <input id={`${uid}-goz`} type="number" min={0} step={0.5} className={s.input} value={gozetimPerKg} onChange={(e) => { setPresetId("custom"); setGozetimPerKg(Number(e.target.value)); }} />
          <span className={s.hint}>Tebliğde gözetim yoksa 0 bırakın</span>
        </div>
        <div className={s.field}>
          <label className={s.label} htmlFor={`${uid}-gv`}>Gümrük Vergisi — GV (%)</label>
          <input id={`${uid}-gv`} type="number" min={0} max={100} step={0.1} className={s.input} value={gvPct} onChange={(e) => { setPresetId("custom"); setGvPct(Number(e.target.value)); }} />
          <span className={s.hint}>GTİP üçüncü ülke GV oranı</span>
        </div>
        <div className={s.field}>
          <label className={s.label} htmlFor={`${uid}-igv`}>İlave Gümrük Vergisi — İGV (%)</label>
          <input id={`${uid}-igv`} type="number" min={0} max={100} step={0.5} className={s.input} value={igvPct} onChange={(e) => { setPresetId("custom"); setIgvPct(Number(e.target.value)); }} />
          <span className={s.hint}>Çin menşeli üründe İGV oranı</span>
        </div>
        <div className={s.field}>
          <label className={s.label} htmlFor={`${uid}-dmp`}>Anti-Damping Vergisi (%)</label>
          <input id={`${uid}-dmp`} type="number" min={0} max={200} step={1} className={s.input} value={dampingPct} onChange={(e) => { setPresetId("custom"); setDampingPct(Number(e.target.value)); }} />
          <span className={s.hint}>Varsa CIF üzerinden anti-damping</span>
        </div>
        <div className={s.field}>
          <label className={s.label} htmlFor={`${uid}-loc`}>Liman, Ordino, Ardiye &amp; Müşavirlik ($)</label>
          <input id={`${uid}-loc`} type="number" min={0} step={50} className={s.input} value={localPortUsd} onChange={(e) => { setPresetId("custom"); setLocalPortUsd(Number(e.target.value)); }} />
          <span className={s.hint}>Tahmini yurt içi liman ve gümrük gideri</span>
        </div>
        <div className={s.field}>
          <label className={s.label} htmlFor={`${uid}-kdv`}>İthalat KDV Oranı (%)</label>
          <select id={`${uid}-kdv`} className={s.input} value={kdvPct} onChange={(e) => setKdvPct(Number(e.target.value))}>
            <option value={20}>%20 (Genel Oran)</option>
            <option value={10}>%10 (Tekstil / İndirimli Kalemler)</option>
            <option value={1}>%1 (Özel Liste)</option>
          </select>
          <span className={s.hint}>KDV matrahı üzerinden hesaplanır</span>
        </div>
      </div>

      <div className={s.results} role="region" aria-live="polite" aria-label="Hesaplama Sonuçları">
        <div className={s.kpiRow}>
          <div className={s.kpi}>
            <span className={s.kpiLabel}>CIF Kıymeti (Gümrük Giriş)</span>
            <span className={s.kpiVal}>{fmtUsd(calc.cif)}</span>
            <span className={s.hint}>Esas Matrah: {fmtUsd(calc.customsBase)}</span>
          </div>
          <div className={s.kpi}>
            <span className={s.kpiLabel}>Toplam Gümrük Vergileri</span>
            <span className={s.kpiVal}>{fmtUsd(calc.totalDuties)}</span>
            <span className={s.hint}>GV: {fmtUsd(calc.gv)} · İGV: {fmtUsd(calc.igv)}{calc.damping > 0 ? ` · AD: ${fmtUsd(calc.damping)}` : ""}</span>
          </div>
          <div className={s.kpi}>
            <span className={s.kpiLabel}>Depo Teslim Maliyet (KDV Hariç)</span>
            <span className={s.kpiVal}>{fmtUsd(calc.landedExKdv)}</span>
            <span className={s.hint}>FOB üzerine +%{calc.taxMultiplier.toFixed(1)} ek yük</span>
          </div>
          <div className={s.kpi}>
            <span className={s.kpiLabel}>Gümrükte Toplam Nakit Çıkışı (KDV Dahil)</span>
            <span className={s.kpiVal}>{fmtUsd(calc.landedIncKdv)}</span>
            <span className={s.hint}>Gümrük KDV: {fmtUsd(calc.kdv)}</span>
          </div>
        </div>

        {calc.gozetimDiff > 0 && (
          <div className={s.alert}>
            <strong>Gözetim Uygulaması ve İndirilemeyecek KDV Uyarısı:</strong> Girdiğiniz gözetim kıymeti ({fmtUsd(calc.gozetimTotal)}), gerçek CIF tutarını ({fmtUsd(calc.cif)}) <strong>{fmtUsd(calc.gozetimDiff)}</strong> aşıyor. Yürürlükteki KDV mevzuatı uyarınca gözetim farkına isabet eden yaklaşık <strong>{fmtUsd(calc.nonDeductibleKdvApprox)}</strong> tutarındaki KDV indirim konusu yapılamaz ve doğrudan ürün maliyetinize eklenir.
          </div>
        )}

        <div className={s.actions}>
          <a
            href={`${OFFICIAL_WHATSAPP_WA}?text=${encodeURIComponent(waText)}`}
            target="_blank"
            rel="noopener noreferrer"
            className={s.waBtn}
            onClick={() => {
              clarityEvent("calc_tr_whatsapp_lead");
              clarityUpgrade("calc_tr_wa_lead");
            }}
          >
            <MessageCircle aria-hidden="true" size={18} />
            <span>Bu Hesaplamayı WhatsApp&apos;tan Gönder &amp; Net GTİP Raporu İste</span>
          </a>
          <Link
            href="/rfq"
            className={s.rfqLink}
            onClick={() => clarityEvent("calc_tr_rfq_click")}
          >
            <Calculator aria-hidden="true" size={18} />
            <span>Yazılı Tedarik &amp; Maliyet Teklifi Al (24s)</span>
          </Link>
        </div>
      </div>
    </div>
  );
}
