// Veritabanı #1 Üretici: ISO 668 Konteyner / AB 96/53/EC TIR Ölçüleri + ISO 2859-1:1999 AQL Tablo 1 ve Tablo 2-A
import { createHash } from "node:crypto";
import { mkdirSync, readFileSync, writeFileSync, existsSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const OUT_DIR = join(ROOT, "01-container-aql");
mkdirSync(OUT_DIR, { recursive: true });

// ---------------------------------------------------------------------------
// 1A. ISO 668:2020 & AB 96/53/EC Konteyner ve Karayolu Treyler Standartları
// Not: Palet kapasiteleri (Euro 800x1200mm, Endüstriyel/UK 1000x1200mm, ABD GMA 1016x1219mm)
// gerçek iç taban geometrisine (2D dikdörtgen yerleşim) göre doğrulanmıştır.
// ---------------------------------------------------------------------------
const containers = [
  {
    code: "20dc",
    category: "sea_dry",
    standard_ref: "ISO 668:2020 (1CC)",
    sort_order: 1,
    name_tr: "20' Standart Kuru Yük Konteyneri (20' DC)",
    name_en: "20' Standard Dry Container (20' DC)",
    name_de: "20' Standard-Container (20' DC)",
    name_zh: "20英尺标准干货集装箱 (20' GP)",
    internal_length_mm: 5898,
    internal_width_mm: 2352,
    internal_height_mm: 2393,
    door_width_mm: 2340,
    door_height_mm: 2280,
    theoretical_cbm: 33.2,
    practical_cbm_min: 27.0,
    practical_cbm_max: 29.0,
    tare_weight_kg: 2230,
    max_payload_kg: 28250,
    road_safe_payload_kg: 22000,
    max_gross_weight_kg: 30480,
    euro_pallets_floor_max: 11,
    euro_pallets_practical: 11,
    industrial_pallets_floor_max: 9,
    industrial_pallets_practical: 9,
    us_gma_pallets_floor_max: 9,
    best_for_tr: "Ağır yoğunluklu yükler: mermer, metal bağlantı elemanları, makine parçaları, kimyasal bidonlar, gıda kavanozları.",
    best_for_en: "High-density cargo: natural stone, steel fasteners, machinery parts, chemical drums, canned/jarred food.",
  },
  {
    code: "40dc",
    category: "sea_dry",
    standard_ref: "ISO 668:2020 (1AA)",
    sort_order: 2,
    name_tr: "40' Standart Kuru Yük Konteyneri (40' DC)",
    name_en: "40' Standard Dry Container (40' DC)",
    name_de: "40' Standard-Container (40' DC)",
    name_zh: "40英尺标准干货集装箱 (40' GP)",
    internal_length_mm: 12032,
    internal_width_mm: 2352,
    internal_height_mm: 2393,
    door_width_mm: 2340,
    door_height_mm: 2280,
    theoretical_cbm: 67.7,
    practical_cbm_min: 55.0,
    practical_cbm_max: 59.0,
    tare_weight_kg: 3750,
    max_payload_kg: 26730,
    road_safe_payload_kg: 22000,
    max_gross_weight_kg: 30480,
    euro_pallets_floor_max: 25,
    euro_pallets_practical: 24,
    industrial_pallets_floor_max: 22,
    industrial_pallets_practical: 20,
    us_gma_pallets_floor_max: 20,
    best_for_tr: "Orta yoğunluklu standart paletli/kolili sanayi ürünleri, otomotiv yedek parça, ambalajlı kuru gıda.",
    best_for_en: "Medium-density palletized or carton industrial goods, automotive parts, packaged dry food.",
  },
  {
    code: "40hc",
    category: "sea_dry",
    standard_ref: "ISO 668:2020 (1AAA)",
    sort_order: 3,
    name_tr: "40' High Cube Konteyner (40' HC — Yüksek Tavan)",
    name_en: "40' High Cube Container (40' HC)",
    name_de: "40' High-Cube-Container (40' HC)",
    name_zh: "40英尺高柜集装箱 (40' HQ / HC)",
    internal_length_mm: 12032,
    internal_width_mm: 2352,
    internal_height_mm: 2698,
    door_width_mm: 2340,
    door_height_mm: 2585,
    theoretical_cbm: 76.4,
    practical_cbm_min: 64.0,
    practical_cbm_max: 68.5,
    tare_weight_kg: 3940,
    max_payload_kg: 28560,
    road_safe_payload_kg: 22000,
    max_gross_weight_kg: 32500,
    euro_pallets_floor_max: 25,
    euro_pallets_practical: 24,
    industrial_pallets_floor_max: 22,
    industrial_pallets_practical: 21,
    us_gma_pallets_floor_max: 20,
    best_for_tr: "Hacimli yükler: tekstil, mobilya, otel FF&E, 7m-12m emprenyeli ahşap elektrik direkleri (140 adet 9m direk), plastik ürünler.",
    best_for_en: "Voluminous cargo: textiles, hospitality FF&E, 7m-12m wooden utility poles (140x 9m poles), plastics, home goods.",
  },
  {
    code: "45hcpw",
    category: "sea_dry",
    standard_ref: "ISO 668:2020 (1EEE Pallet-Wide)",
    sort_order: 4,
    name_tr: "45' High Cube Pallet-Wide Konteyner (45' HCPW)",
    name_en: "45' High Cube Pallet-Wide Container (45' HCPW)",
    name_de: "45' High-Cube Pallet-Wide Container",
    name_zh: "45英尺加宽高柜集装箱 (45' HCPW)",
    internal_length_mm: 13556,
    internal_width_mm: 2444,
    internal_height_mm: 2698,
    door_width_mm: 2416,
    door_height_mm: 2585,
    theoretical_cbm: 89.4,
    practical_cbm_min: 76.0,
    practical_cbm_max: 81.0,
    tare_weight_kg: 4820,
    max_payload_kg: 27680,
    road_safe_payload_kg: 22000,
    max_gross_weight_kg: 32500,
    euro_pallets_floor_max: 33,
    euro_pallets_practical: 33,
    industrial_pallets_floor_max: 26,
    industrial_pallets_practical: 26,
    us_gma_pallets_floor_max: 24,
    best_for_tr: "Avrupa kısa deniz (Short-Sea) hatlarında Euro palet kaybı olmadan TIR kapasitesine yakın yükleme.",
    best_for_en: "European short-sea corridors maximizing Euro-pallet floor count (33 EPAL) comparable to road trailers.",
  },
  {
    code: "20rf",
    category: "sea_reefer",
    standard_ref: "ISO 1496-2 (1CC Reefer)",
    sort_order: 5,
    name_tr: "20' Soğutuculu Konteyner (20' Reefer)",
    name_en: "20' Refrigerated Container (20' Reefer)",
    name_de: "20' Kühlcontainer (20' Reefer)",
    name_zh: "20英尺冷藏集装箱 (20' RF)",
    internal_length_mm: 5444,
    internal_width_mm: 2294,
    internal_height_mm: 2272,
    door_width_mm: 2290,
    door_height_mm: 2260,
    theoretical_cbm: 28.4,
    practical_cbm_min: 23.0,
    practical_cbm_max: 25.0,
    tare_weight_kg: 3080,
    max_payload_kg: 27400,
    road_safe_payload_kg: 21500,
    max_gross_weight_kg: 30480,
    euro_pallets_floor_max: 10,
    euro_pallets_practical: 10,
    industrial_pallets_floor_max: 8,
    industrial_pallets_practical: 8,
    us_gma_pallets_floor_max: 8,
    best_for_tr: "Isı kontrollü (-25°C / +25°C) ağır gıda, süt ürünleri, dondurulmuş ürün, ısıya duyarlı kimyasal ve ilaç.",
    best_for_en: "Temperature-controlled (-25°C to +25°C) dense foodstuffs, dairy, frozen goods, heat-sensitive chemicals.",
  },
  {
    code: "40hcrf",
    category: "sea_reefer",
    standard_ref: "ISO 1496-2 (1AAA High Cube Reefer)",
    sort_order: 6,
    name_tr: "40' High Cube Soğutuculu Konteyner (40' HC Reefer)",
    name_en: "40' High Cube Refrigerated Container (40' HC Reefer)",
    name_de: "40' High-Cube-Kühlcontainer (40' HCRF)",
    name_zh: "40英尺高柜冷藏集装箱 (40' RH)",
    internal_length_mm: 11583,
    internal_width_mm: 2294,
    internal_height_mm: 2554,
    door_width_mm: 2290,
    door_height_mm: 2535,
    theoretical_cbm: 67.9,
    practical_cbm_min: 55.0,
    practical_cbm_max: 60.0,
    tare_weight_kg: 4480,
    max_payload_kg: 29520,
    road_safe_payload_kg: 21000,
    max_gross_weight_kg: 34000,
    euro_pallets_floor_max: 23,
    euro_pallets_practical: 23,
    industrial_pallets_floor_max: 20,
    industrial_pallets_practical: 19,
    us_gma_pallets_floor_max: 18,
    best_for_tr: "Yaş meyve-sebze, taze incir/nar/üzüm, çikolata, zeytinyağı ve nem/ısı kontrollü hassas gıda ihracatı.",
    best_for_en: "Fresh produce, figs, pomegranates, confectionery, premium olive oil, and humidity-sensitive agro exports.",
  },
  {
    code: "20ot",
    category: "sea_special",
    standard_ref: "ISO 1496-1 (1CC Open Top)",
    sort_order: 7,
    name_tr: "20' Üstü Açık Konteyner (20' Open Top)",
    name_en: "20' Open Top Container (20' OT)",
    name_de: "20' Open-Top-Container (20' OT)",
    name_zh: "20英尺开顶集装箱 (20' OT)",
    internal_length_mm: 5898,
    internal_width_mm: 2352,
    internal_height_mm: 2348,
    door_width_mm: 2340,
    door_height_mm: 2280,
    theoretical_cbm: 32.6,
    practical_cbm_min: 26.5,
    practical_cbm_max: 28.5,
    tare_weight_kg: 2350,
    max_payload_kg: 28130,
    road_safe_payload_kg: 22000,
    max_gross_weight_kg: 30480,
    euro_pallets_floor_max: 11,
    euro_pallets_practical: 11,
    industrial_pallets_floor_max: 9,
    industrial_pallets_practical: 9,
    us_gma_pallets_floor_max: 9,
    best_for_tr: "Üstten vinçle yüklenen ağır CNC makineler, mermer blok/plaka kasaları, çelik rulolar.",
    best_for_en: "Top-crane loaded heavy CNC machinery, marble blocks/slabs, steel coils, and over-height industrial units.",
  },
  {
    code: "40ot",
    category: "sea_special",
    standard_ref: "ISO 1496-1 (1AA Open Top)",
    sort_order: 8,
    name_tr: "40' Üstü Açık Konteyner (40' Open Top)",
    name_en: "40' Open Top Container (40' OT)",
    name_de: "40' Open-Top-Container (40' OT)",
    name_zh: "40英尺开顶集装箱 (40' OT)",
    internal_length_mm: 12032,
    internal_width_mm: 2352,
    internal_height_mm: 2348,
    door_width_mm: 2340,
    door_height_mm: 2280,
    theoretical_cbm: 66.4,
    practical_cbm_min: 54.0,
    practical_cbm_max: 58.0,
    tare_weight_kg: 3850,
    max_payload_kg: 26630,
    road_safe_payload_kg: 22000,
    max_gross_weight_kg: 30480,
    euro_pallets_floor_max: 25,
    euro_pallets_practical: 24,
    industrial_pallets_floor_max: 22,
    industrial_pallets_practical: 20,
    us_gma_pallets_floor_max: 20,
    best_for_tr: "Uzun endüstriyel üretim hatları, çelik boru/konstrüksiyon, vinçle yüklenen büyük proje kargoları.",
    best_for_en: "Long industrial production lines, structural steel/pipes, crane-loaded project cargo.",
  },
  {
    code: "eu_tir_1360",
    category: "road_trailer",
    standard_ref: "EU Directive 96/53/EC (13.60m Curtainsider)",
    sort_order: 9,
    name_tr: "13.60m Avrupa Standart Tenteli TIR (Optima Treyler)",
    name_en: "13.60m European Standard Curtainsider Truck (TIR)",
    name_de: "13,60m Standard-Planensattelzug (Tautliner)",
    name_zh: "13.6米欧洲标准篷布半挂卡车 (TIR)",
    internal_length_mm: 13620,
    internal_width_mm: 2480,
    internal_height_mm: 2700,
    door_width_mm: 2480,
    door_height_mm: 2680,
    theoretical_cbm: 91.2,
    practical_cbm_min: 78.0,
    practical_cbm_max: 84.0,
    tare_weight_kg: 7200,
    max_payload_kg: 24000,
    road_safe_payload_kg: 22500,
    max_gross_weight_kg: 40000,
    euro_pallets_floor_max: 34,
    euro_pallets_practical: 33,
    industrial_pallets_floor_max: 26,
    industrial_pallets_practical: 26,
    us_gma_pallets_floor_max: 24,
    best_for_tr: "Türkiye ↔ Almanya/Fransa/Benelux/İngiltere/Polonya 3–7 gün kapıdan kapıya A.TR karayolu ihracatı.",
    best_for_en: "Türkiye ↔ EU/UK 3–7 day door-to-door overland TIR freight (33–34 Euro pallets, side & rear loading).",
  },
  {
    code: "eu_mega_1360",
    category: "road_trailer",
    standard_ref: "EU Directive 96/53/EC (13.60m Mega Trailer 3.0m)",
    sort_order: 10,
    name_tr: "13.60m Avrupa Mega Treyler TIR (3.00m İç Yükseklik — 100 m³)",
    name_en: "13.60m European Mega Trailer (3.00m Internal Height — 100 m³)",
    name_de: "13,60m Megatrailer (3,00m Innenhöhe — 100 m³)",
    name_zh: "13.6米欧洲超高大容量卡车 (100立方米 Mega TIR)",
    internal_length_mm: 13620,
    internal_width_mm: 2480,
    internal_height_mm: 3000,
    door_width_mm: 2480,
    door_height_mm: 2980,
    theoretical_cbm: 101.3,
    practical_cbm_min: 88.0,
    practical_cbm_max: 94.0,
    tare_weight_kg: 7500,
    max_payload_kg: 24000,
    road_safe_payload_kg: 22000,
    max_gross_weight_kg: 40000,
    euro_pallets_floor_max: 34,
    euro_pallets_practical: 33,
    industrial_pallets_floor_max: 26,
    industrial_pallets_practical: 26,
    us_gma_pallets_floor_max: 24,
    best_for_tr: "Otomotiv kasa/istiflenebilir palet, tekstil askılı/kolili yükler, beyaz eşya ve yüksek hacimli Avrupa sevkiyatları.",
    best_for_en: "Double-stacked automotive cages, high-cube apparel/home textiles, white goods, high-volume EU road freight.",
  },
];

// ---------------------------------------------------------------------------
// 1B. ISO 2859-1:1999 (ANSI/ASQ Z1.4) Tablo 1 — Parti Büyüklüğü (Lot Size) Kod Harfleri
// Not: Standart 'I' ve 'O' harflerini rakamlarla karışmaması için resmi olarak atlar.
// ---------------------------------------------------------------------------
const aqlLotCodes = [
  { bracket_index: 1,  lot_min: 2,      lot_max: 8,        label: "2 – 8",           s1: "A", s2: "A", s3: "A", s4: "A", gi: "A", gii: "A", giii: "B" },
  { bracket_index: 2,  lot_min: 9,      lot_max: 15,       label: "9 – 15",          s1: "A", s2: "A", s3: "A", s4: "A", gi: "A", gii: "B", giii: "C" },
  { bracket_index: 3,  lot_min: 16,     lot_max: 25,       label: "16 – 25",         s1: "A", s2: "A", s3: "B", s4: "B", gi: "B", gii: "C", giii: "D" },
  { bracket_index: 4,  lot_min: 26,     lot_max: 50,       label: "26 – 50",         s1: "A", s2: "B", s3: "B", s4: "C", gi: "C", gii: "D", giii: "E" },
  { bracket_index: 5,  lot_min: 51,     lot_max: 90,       label: "51 – 90",         s1: "B", s2: "B", s3: "C", s4: "C", gi: "C", gii: "E", giii: "F" },
  { bracket_index: 6,  lot_min: 91,     lot_max: 150,      label: "91 – 150",        s1: "B", s2: "B", s3: "C", s4: "D", gi: "D", gii: "F", giii: "G" },
  { bracket_index: 7,  lot_min: 151,    lot_max: 280,      label: "151 – 280",       s1: "B", s2: "C", s3: "D", s4: "E", gi: "E", gii: "G", giii: "H" },
  { bracket_index: 8,  lot_min: 281,    lot_max: 500,      label: "281 – 500",       s1: "B", s2: "C", s3: "D", s4: "E", gi: "F", gii: "H", giii: "J" },
  { bracket_index: 9,  lot_min: 501,    lot_max: 1200,     label: "501 – 1.200",     s1: "C", s2: "C", s3: "E", s4: "F", gi: "G", gii: "J", giii: "K" },
  { bracket_index: 10, lot_min: 1201,   lot_max: 3200,     label: "1.201 – 3.200",   s1: "C", s2: "D", s3: "E", s4: "G", gi: "H", gii: "K", giii: "L" },
  { bracket_index: 11, lot_min: 3201,   lot_max: 10000,    label: "3.201 – 10.000",  s1: "C", s2: "D", s3: "F", s4: "G", gi: "J", gii: "L", giii: "M" },
  { bracket_index: 12, lot_min: 10001,  lot_max: 35000,    label: "10.001 – 35.000", s1: "C", s2: "D", s3: "F", s4: "H", gi: "K", gii: "M", giii: "N" },
  { bracket_index: 13, lot_min: 35001,  lot_max: 150000,   label: "35.001 – 150.000",s1: "D", s2: "E", s3: "G", s4: "J", gi: "L", gii: "N", giii: "P" },
  { bracket_index: 14, lot_min: 150001, lot_max: 500000,   label: "150.001 – 500.000",s1:"D", s2: "E", s3: "G", s4: "J", gi: "M", gii: "P", giii: "Q" },
  { bracket_index: 15, lot_min: 500001, lot_max: 999999999,label: "500.001+",        s1: "D", s2: "E", s3: "H", s4: "K", gi: "N", gii: "Q", giii: "R" },
];

// ---------------------------------------------------------------------------
// 1C. ISO 2859-1:1999 Tablo 2-A — Normal Muayene Tek Katlı Numune Alma Planları
// R5 Renard diyagonal değişmezlik yasası (k = i + j):
//   k < 10  => ↓ (ilk uygun plan k = 10 satırındadır: Ac=0, Re=1)
//   k = 10  => Ac=0, Re=1
//   k = 11  => ↑ (üst satır k = 10: Ac=0, Re=1)
//   k = 12  => ↓ (alt satır k = 13: Ac=1, Re=2)
//   k = 13..20 => Ac = [1, 2, 3, 5, 7, 10, 14, 21], Re = Ac + 1
//   k > 20  => ↑ (bu sütundaki k = 20 satırı: Ac=21, Re=22)
// ---------------------------------------------------------------------------
const CODE_ROWS = [
  { letter: "A", sample_size: 2 },
  { letter: "B", sample_size: 3 },
  { letter: "C", sample_size: 5 },
  { letter: "D", sample_size: 8 },
  { letter: "E", sample_size: 13 },
  { letter: "F", sample_size: 20 },
  { letter: "G", sample_size: 32 },
  { letter: "H", sample_size: 50 },
  { letter: "J", sample_size: 80 },
  { letter: "K", sample_size: 125 },
  { letter: "L", sample_size: 200 },
  { letter: "M", sample_size: 315 },
  { letter: "N", sample_size: 500 },
  { letter: "P", sample_size: 800 },
  { letter: "Q", sample_size: 1250 },
  { letter: "R", sample_size: 2000 },
];

const AQL_COLS = ["0.065", "0.10", "0.15", "0.25", "0.40", "0.65", "1.0", "1.5", "2.5", "4.0", "6.5"];
const DIRECT_AC_BY_K = {
  10: 0,
  13: 1,
  14: 2,
  15: 3,
  16: 5,
  17: 7,
  18: 10,
  19: 14,
  20: 21,
};

const aqlSamplingPlans = [];
for (let i = 0; i < CODE_ROWS.length; i++) {
  const row = CODE_ROWS[i];
  for (let j = 0; j < AQL_COLS.length; j++) {
    const aqlStr = AQL_COLS[j];
    const k = i + j;
    let ruleType = "direct";
    let effIdx = i;
    let ac = 0;

    if (k < 10) {
      ruleType = "arrow_down";
      effIdx = 10 - j; // AQL 0.065 (j=0) -> L (i=10, n=200); AQL 6.5 (j=10) -> A (i=0, n=2)
      ac = 0;
    } else if (k === 11) {
      ruleType = "arrow_up";
      effIdx = i - 1; // k = 10
      ac = 0;
    } else if (k === 12) {
      ruleType = "arrow_down";
      effIdx = i + 1; // k = 13
      ac = 1;
    } else if (k > 20) {
      ruleType = "arrow_up";
      effIdx = 20 - j; // k = 20
      ac = 21;
    } else {
      ruleType = "direct";
      effIdx = i;
      ac = DIRECT_AC_BY_K[k];
    }

    const effRow = CODE_ROWS[effIdx];
    aqlSamplingPlans.push({
      plan_key: `normal_${row.letter}_${aqlStr}`,
      inspection_regime: "normal",
      code_letter: row.letter,
      nominal_sample_size: row.sample_size,
      aql: Number(aqlStr),
      aql_label: aqlStr,
      rule_type: ruleType,
      effective_code_letter: effRow.letter,
      effective_sample_size: effRow.sample_size,
      accept_max: ac,
      reject_min: ac + 1,
      standard_ref: "ISO 2859-1:1999 Table 2-A",
    });
  }
}

function writeJsonWithHash(filename, data) {
  const fullPath = join(OUT_DIR, filename);
  const content = JSON.stringify(data, null, 2) + "\n";
  writeFileSync(fullPath, content, "utf8");
  const sha256 = createHash("sha256").update(content, "utf8").digest("hex");
  return { filename: `01-container-aql/${filename}`, records: data.length, sha256 };
}

const f1 = writeJsonWithHash("containers.json", containers);
const f2 = writeJsonWithHash("aql_lot_codes.json", aqlLotCodes);
const f3 = writeJsonWithHash("aql_sampling_plans.json", aqlSamplingPlans);

const manifestPath = join(ROOT, "manifest.json");
const existingManifest = existsSync(manifestPath)
  ? JSON.parse(readFileSync(manifestPath, "utf8"))
  : { schema_version: "1.0.0", excluded_modules: ["09-global-12digit-live-binding-duty-calculator"], datasets: [] };

const datasetEntry = {
  module_id: "01-container-aql",
  order: 1,
  title_tr: "Konteyner / TIR Doluluk (ISO 668) & ISO 2859-1 AQL Numune Veritabanı",
  title_en: "ISO 668 Container / EU Road Trailer Specs & ISO 2859-1 AQL Sampling Plans",
  authority: "ISO (International Organization for Standardization) & EU Directive 96/53/EC",
  official_sources: [
    "ISO 668:2020 Series 1 freight containers — Classification, dimensions and ratings",
    "ISO 1496-1 / ISO 1496-2 Thermal & Open-Top freight containers",
    "Council Directive 96/53/EC (European 13.60m road vehicles)",
    "ISO 2859-1:1999 / ANSI/ASQ Z1.4 Sampling procedures for inspection by attributes (Table 1 & Table 2-A)",
  ],
  update_cadence: "static_iso_standard",
  verification_status: "verified",
  verified_at: new Date().toISOString(),
  collections: ["containers_specs", "aql_lot_codes", "aql_sampling_plans"],
  files: [f1, f2, f3],
};

const filtered = (existingManifest.datasets || []).filter((d) => d.module_id !== "01-container-aql");
filtered.push(datasetEntry);
filtered.sort((a, b) => a.order - b.order);

const nextManifest = {
  schema_version: "1.0.0",
  updated_at: new Date().toISOString(),
  excluded_modules: ["09-global-12digit-live-binding-duty-calculator"],
  datasets: filtered,
};

writeFileSync(manifestPath, JSON.stringify(nextManifest, null, 2) + "\n", "utf8");
console.log(`[OK] 01-container-aql üretildi: containers=${f1.records}, lot_codes=${f2.records}, sampling_plans=${f3.records}`);
