// Otomatik Veri Havuzu Doğrulama Kapısı (Data Integrity & Mathematical Verification Gate)
// Hiçbir veri bu doğrulama kapısından %100 geçmeden PocketBase'e aktarılamaz.
import { createHash } from "node:crypto";
import { readFileSync, existsSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const manifestPath = join(ROOT, "manifest.json");

let failures = 0;
let assertions = 0;

function assert(condition, message) {
  assertions++;
  if (!condition) {
    failures++;
    console.error(`  ❌ HATA: ${message}`);
  }
}

if (!existsSync(manifestPath)) {
  console.error("❌ manifest.json bulunamadı!");
  process.exit(1);
}

const manifest = JSON.parse(readFileSync(manifestPath, "utf8"));
assert(
  Array.isArray(manifest.excluded_modules) &&
    manifest.excluded_modules.includes("09-global-12digit-live-binding-duty-calculator"),
  "Kapsam dışı bırakılan #9 modülü manifest'te açıkça kilitlenmiş olmalı"
);

// 1. SHA-256 ve Kayıt Sayısı Bütünlük Kontrolü (Tüm aktif modüller için)
for (const ds of manifest.datasets) {
  console.log(`\n🔍 Doğrulanıyor: [${ds.module_id}] ${ds.title_tr}`);
  for (const f of ds.files) {
    const fp = join(ROOT, f.filename);
    assert(existsSync(fp), `Dosya mevcut olmalı: ${f.filename}`);
    if (existsSync(fp)) {
      const raw = readFileSync(fp, "utf8");
      const sha = createHash("sha256").update(raw, "utf8").digest("hex");
      const parsed = JSON.parse(raw);
      assert(sha === f.sha256, `${f.filename} SHA-256 özeti manifest ile birebir eşleşmeli`);
      assert(Array.isArray(parsed) && parsed.length === f.records, `${f.filename} kayıt sayısı (${f.records}) doğrulandı`);
    }
  }
}

// 2. Modül 01: ISO 668 Konteyner Geometrisi ve ISO 2859-1 AQL Matematiksel Kanıtları
const containers = JSON.parse(readFileSync(join(ROOT, "01-container-aql/containers.json"), "utf8"));
const lotCodes = JSON.parse(readFileSync(join(ROOT, "01-container-aql/aql_lot_codes.json"), "utf8"));
const plans = JSON.parse(readFileSync(join(ROOT, "01-container-aql/aql_sampling_plans.json"), "utf8"));

assert(containers.length === 10, "10 standart konteyner/treyler tipi tanımlı olmalı");
const seenCodes = new Set();

// 2D zemin yerleşim doğrulayıcı: A x B mm boyutundaki paletten L x W mm dikdörtgene maksimum kaç adet sığar?
function maxMixed2DPallets(L, W, pL, pW) {
  let best = 0;
  // Şerit bazlı (2 yönlü pinwheel / iki duvarlı) kombinasyonların üst sınırı:
  // Yön 1: K adet şerit L boyunca pL, kalan uzunlukta pW; Yön 2: W boyunca bölme
  for (let stripW of [pW, pL]) {
    const otherW = stripW === pW ? pL : pW;
    const maxRows = Math.floor(W / stripW);
    for (let r = 0; r <= maxRows; r++) {
      const usedW = r * stripW;
      const remW = W - usedW;
      const countMain = r * Math.floor(L / otherW);
      const countRem = Math.floor(remW / otherW) * Math.floor(L / stripW);
      if (countMain + countRem > best) best = countMain + countRem;
    }
  }
  for (let stripL of [pL, pW]) {
    const otherL = stripL === pL ? pW : pL;
    const maxCols = Math.floor(L / stripL);
    for (let c = 0; c <= maxCols; c++) {
      const usedL = c * stripL;
      const remL = L - usedL;
      const countMain = c * Math.floor(W / otherL);
      const countRem = Math.floor(remL / otherL) * Math.floor(W / stripL);
      if (countMain + countRem > best) best = countMain + countRem;
    }
  }
  return best;
}

for (const c of containers) {
  assert(!seenCodes.has(c.code), `Tekil konteyner kodu: ${c.code}`);
  seenCodes.add(c.code);

  const calcCbm = (c.internal_length_mm * c.internal_width_mm * c.internal_height_mm) / 1e9;
  assert(
    Math.abs(calcCbm - c.theoretical_cbm) <= 0.25,
    `${c.code}: Teorik CBM (${c.theoretical_cbm}) iç ölçüler çarpımıyla (${calcCbm.toFixed(2)}) uyumlu olmalı`
  );
  assert(
    c.practical_cbm_min > 0 &&
      c.practical_cbm_min < c.practical_cbm_max &&
      c.practical_cbm_max < c.theoretical_cbm,
    `${c.code}: Pratik yüklenebilir CBM aralığı (min < max < teorik) tutarlı olmalı`
  );
  if (c.category.startsWith("sea_")) {
    assert(
      c.tare_weight_kg + c.max_payload_kg === c.max_gross_weight_kg,
      `${c.code}: Dara (${c.tare_weight_kg}) + Maks Yük (${c.max_payload_kg}) = Maks Brüt (${c.max_gross_weight_kg}) olmalı`
    );
  }
  assert(
    c.road_safe_payload_kg <= c.max_payload_kg,
    `${c.code}: Karayolu güvenli yük limiti (${c.road_safe_payload_kg}) CSC limitini aşmamalı`
  );

  // Palet geometrik sığma testi (hiçbir palet sayısı fiziksel 2D tavanı aşamaz!)
  const maxEuroGeom = maxMixed2DPallets(c.internal_length_mm, c.internal_width_mm, 1200, 800);
  const maxIndGeom = maxMixed2DPallets(c.internal_length_mm, c.internal_width_mm, 1200, 1000);
  const maxUsGeom = maxMixed2DPallets(c.internal_length_mm, c.internal_width_mm, 1219, 1016);

  assert(
    c.euro_pallets_floor_max <= maxEuroGeom && c.euro_pallets_practical <= c.euro_pallets_floor_max,
    `${c.code}: Euro palet sayısı (${c.euro_pallets_floor_max}) geometrik üst sınırı (${maxEuroGeom}) aşamaz`
  );
  assert(
    c.industrial_pallets_floor_max <= maxIndGeom && c.industrial_pallets_practical <= c.industrial_pallets_floor_max,
    `${c.code}: Endüstriyel 100x120 palet sayısı (${c.industrial_pallets_floor_max}) geometrik üst sınırı (${maxIndGeom}) aşamaz`
  );
  assert(
    c.us_gma_pallets_floor_max <= maxUsGeom,
    `${c.code}: ABD GMA palet sayısı (${c.us_gma_pallets_floor_max}) geometrik üst sınırı (${maxUsGeom}) aşamaz`
  );
}

// ISO 2859-1 Tablo 1 kesintisiz aralık ve geçerli harf kontrolü
const VALID_LETTERS = new Set(["A", "B", "C", "D", "E", "F", "G", "H", "J", "K", "L", "M", "N", "P", "Q", "R"]);
assert(lotCodes.length === 15, "ISO 2859-1 Tablo 1 tam 15 parti büyüklüğü aralığına sahip olmalı");
for (let idx = 0; idx < lotCodes.length; idx++) {
  const r = lotCodes[idx];
  if (idx === 0) assert(r.lot_min === 2, "İlk aralık 2'den başlamalı");
  if (idx > 0) {
    assert(
      r.lot_min === lotCodes[idx - 1].lot_max + 1,
      `Parti büyüklüğü aralıklarında boşluk olmamalı (${lotCodes[idx - 1].lot_max} -> ${r.lot_min})`
    );
  }
  for (const col of ["s1", "s2", "s3", "s4", "gi", "gii", "giii"]) {
    assert(VALID_LETTERS.has(r[col]), `Tablo 1 [${r.label}] ${col}=${r[col]} geçerli bir ISO 2859-1 harfi olmalı (I ve O hariç)`);
  }
}

// ISO 2859-1 Tablo 2-A referans doğrulama noktaları (Uluslararası Kalite Kontrol Benchmark'ları)
assert(plans.length === 176, "ISO 2859-1 Tablo 2-A (16 harf x 11 AQL) tam 176 hücre olmalı");
const planMap = new Map(plans.map((p) => [p.plan_key, p]));

for (const p of plans) {
  assert(p.reject_min === p.accept_max + 1, `${p.plan_key}: Normal tek katlı muayenede Re = Ac + 1 olmalı`);
  assert(VALID_LETTERS.has(p.code_letter) && VALID_LETTERS.has(p.effective_code_letter), `${p.plan_key}: Kod harfleri geçerli olmalı`);
  if (p.rule_type === "arrow_down") {
    assert(p.effective_sample_size > p.nominal_sample_size, `${p.plan_key}: Aşağı ok (↓) daha büyük numune boyutu seçmeli`);
  } else if (p.rule_type === "arrow_up") {
    assert(p.effective_sample_size < p.nominal_sample_size, `${p.plan_key}: Yukarı ok (↑) daha küçük numune boyutu seçmeli`);
  } else {
    assert(p.effective_sample_size === p.nominal_sample_size, `${p.plan_key}: Doğrudan planda efektif numune = nominal numune olmalı`);
  }
}

// Bilinen kesin ISO 2859-1 Tablo 2-A altın test noktaları:
const goldenChecks = [
  { key: "normal_L_1.0",  effN: 200, ac: 5,  re: 6,  rule: "direct" },
  { key: "normal_L_1.5",  effN: 200, ac: 7,  re: 8,  rule: "direct" },
  { key: "normal_L_2.5",  effN: 200, ac: 10, re: 11, rule: "direct" },
  { key: "normal_L_4.0",  effN: 200, ac: 14, re: 15, rule: "direct" },
  { key: "normal_K_1.0",  effN: 125, ac: 3,  re: 4,  rule: "direct" },
  { key: "normal_K_2.5",  effN: 125, ac: 7,  re: 8,  rule: "direct" },
  { key: "normal_K_4.0",  effN: 125, ac: 10, re: 11, rule: "direct" },
  { key: "normal_F_1.0",  effN: 13,  ac: 0,  re: 1,  rule: "arrow_up" },   // F(20) @ 1.0 -> ↑ E(13) Ac=0 Re=1
  { key: "normal_G_1.0",  effN: 50,  ac: 1,  re: 2,  rule: "arrow_down" }, // G(32) @ 1.0 -> ↓ H(50) Ac=1 Re=2
  { key: "normal_A_0.65", effN: 20,  ac: 0,  re: 1,  rule: "arrow_down" }, // A(2) @ 0.65 -> ↓ F(20) Ac=0 Re=1
  { key: "normal_M_6.5",  effN: 200, ac: 21, re: 22, rule: "arrow_up" },   // M(315) @ 6.5 -> ↑ L(200) Ac=21 Re=22
];

for (const g of goldenChecks) {
  const cell = planMap.get(g.key);
  assert(
    cell &&
      cell.effective_sample_size === g.effN &&
      cell.accept_max === g.ac &&
      cell.reject_min === g.re &&
      cell.rule_type === g.rule,
    `ISO 2859-1 Altın Test [${g.key}] beklenen=(n=${g.effN}, ${g.ac}/${g.re}, ${g.rule}) gerçek=${JSON.stringify(cell)}`
  );
}

if (failures > 0) {
  console.error(`\n❌ DOĞRULAMA BAŞARISIZ: ${assertions} kontrolden ${failures} tanesi hata verdi.`);
  process.exit(1);
} else {
  console.log(`\n✅ TÜM DOĞRULAMA TESTLERİ GEÇTİ! (${assertions}/${assertions} matematiksel ve yapısal kontrol %100 başarılı)`);
}
