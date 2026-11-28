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

// 1. SHA-256 (CRLF-bağımsız LF kanonik) ve Kayıt Sayısı Bütünlük Kontrolü
for (const ds of manifest.datasets) {
  console.log(`\n🔍 Doğrulanıyor: [${ds.module_id}] ${ds.title_tr}`);
  for (const f of ds.files) {
    const fp = join(ROOT, f.filename);
    assert(existsSync(fp), `Dosya mevcut olmalı: ${f.filename}`);
    if (existsSync(fp)) {
      const raw = readFileSync(fp, "utf8").replace(/\r\n/g, "\n");
      const sha = createHash("sha256").update(raw, "utf8").digest("hex");
      const parsed = JSON.parse(raw);
      assert(sha === f.sha256, `${f.filename} SHA-256 özeti manifest ile birebir eşleşmeli`);
      assert(Array.isArray(parsed) && parsed.length === f.records, `${f.filename} kayıt sayısı (${f.records}) doğrulandı`);
    }
  }
}

// ===========================================================================
// MODÜL 01 DOĞRULAMASI: ISO 668 Konteyner Geometrisi ve ISO 2859-1 AQL
// ===========================================================================
const containers = JSON.parse(readFileSync(join(ROOT, "01-container-aql/containers.json"), "utf8"));
const lotCodes = JSON.parse(readFileSync(join(ROOT, "01-container-aql/aql_lot_codes.json"), "utf8"));
const plans = JSON.parse(readFileSync(join(ROOT, "01-container-aql/aql_sampling_plans.json"), "utf8"));

assert(containers.length === 10, "10 standart konteyner/treyler tipi tanımlı olmalı");
const seenCodes = new Set();

function maxMixed2DPallets(L, W, pL, pW) {
  let best = 0;
  for (const stripW of [pW, pL]) {
    const otherW = stripW === pW ? pL : pW;
    const maxRows = Math.floor(W / stripW);
    for (let r = 0; r <= maxRows; r++) {
      const remW = W - r * stripW;
      const total = r * Math.floor(L / otherW) + Math.floor(remW / otherW) * Math.floor(L / stripW);
      if (total > best) best = total;
    }
  }
  for (const stripL of [pL, pW]) {
    const otherL = stripL === pL ? pW : pL;
    const maxCols = Math.floor(L / stripL);
    for (let c = 0; c <= maxCols; c++) {
      const remL = L - c * stripL;
      const total = c * Math.floor(W / otherL) + Math.floor(remL / otherL) * Math.floor(W / stripL);
      if (total > best) best = total;
    }
  }
  return best;
}

for (const c of containers) {
  assert(!seenCodes.has(c.code), `Tekil konteyner kodu: ${c.code}`);
  seenCodes.add(c.code);
  const calcCbm = (c.internal_length_mm * c.internal_width_mm * c.internal_height_mm) / 1e9;
  assert(Math.abs(calcCbm - c.theoretical_cbm) <= 0.25, `${c.code}: Teorik CBM iç ölçüler çarpımıyla uyumlu olmalı`);
  assert(
    c.practical_cbm_min > 0 && c.practical_cbm_min < c.practical_cbm_max && c.practical_cbm_max < c.theoretical_cbm,
    `${c.code}: Pratik CBM aralığı tutarlı olmalı`
  );
  if (c.category.startsWith("sea_")) {
    assert(c.tare_weight_kg + c.max_payload_kg === c.max_gross_weight_kg, `${c.code}: Dara + Maks Yük = Maks Brüt`);
  }
  assert(c.road_safe_payload_kg <= c.max_payload_kg, `${c.code}: Karayolu güvenli yük <= CSC yük`);
  assert(c.euro_pallets_floor_max <= maxMixed2DPallets(c.internal_length_mm, c.internal_width_mm, 1200, 800), `${c.code}: Euro palet 2D sınırı`);
  assert(c.industrial_pallets_floor_max <= maxMixed2DPallets(c.internal_length_mm, c.internal_width_mm, 1200, 1000), `${c.code}: Endüstriyel palet 2D sınırı`);
  assert(c.us_gma_pallets_floor_max <= maxMixed2DPallets(c.internal_length_mm, c.internal_width_mm, 1219, 1016), `${c.code}: ABD GMA palet 2D sınırı`);
}

const VALID_LETTERS = new Set(["A", "B", "C", "D", "E", "F", "G", "H", "J", "K", "L", "M", "N", "P", "Q", "R"]);
assert(lotCodes.length === 15, "ISO 2859-1 Tablo 1 tam 15 aralık olmalı");
for (let idx = 0; idx < lotCodes.length; idx++) {
  const r = lotCodes[idx];
  if (idx === 0) assert(r.lot_min === 2, "İlk aralık 2'den başlamalı");
  if (idx > 0) assert(r.lot_min === lotCodes[idx - 1].lot_max + 1, "Parti aralıkları kesintisiz olmalı");
  for (const col of ["s1", "s2", "s3", "s4", "gi", "gii", "giii"]) {
    assert(VALID_LETTERS.has(r[col]), `Geçerli ISO 2859-1 harfi: ${r[col]}`);
  }
}

assert(plans.length === 176, "ISO 2859-1 Tablo 2-A tam 176 hücre olmalı");
for (const p of plans) {
  assert(p.reject_min === p.accept_max + 1, `${p.plan_key}: Re = Ac + 1`);
}

// ===========================================================================
// MODÜL 02 DOĞRULAMASI: GB 32100-2015 USCC, Vergi Algoritmaları ve ISO 13616 IBAN
// ===========================================================================
if (existsSync(join(ROOT, "02-supplier-registry/cn_uscc_regions.json"))) {
  const cnRegions = JSON.parse(readFileSync(join(ROOT, "02-supplier-registry/cn_uscc_regions.json"), "utf8"));
  const regRules = JSON.parse(readFileSync(join(ROOT, "02-supplier-registry/supplier_registry_rules.json"), "utf8"));
  const ibanRules = JSON.parse(readFileSync(join(ROOT, "02-supplier-registry/iban_country_rules.json"), "utf8"));

  // 2.1 Çin İdari Bölge Kodları Kontrolü (34 eyalet + 54 üretim şehri/bölgesi = 88)
  assert(cnRegions.length === 88, `Çin bölge tablosu 88 kayıt olmalı (gerçek: ${cnRegions.length})`);
  const regionCodes = new Set();
  let provinceCount = 0;
  for (const reg of cnRegions) {
    assert(!regionCodes.has(reg.region_code), `Tekil Çin bölge kodu: ${reg.region_code}`);
    regionCodes.add(reg.region_code);
    assert(/^[0-9]{2}([0-9]{2})?([0-9]{2})?$/.test(reg.region_code), `Geçerli GB/T 2260 sayısal kod: ${reg.region_code}`);
    assert(["low", "medium", "high"].includes(reg.trading_intermediary_risk), `Geçerli aracı risk seviyesi: ${reg.region_code}`);
    if (reg.level === "province") provinceCount++;
  }
  assert(provinceCount === 34, "Çin'in 34 il/özerk bölge/belediye üst kodu eksiksiz olmalı");
  for (const r of cnRegions) {
    if (r.parent_code) {
      assert(regionCodes.has(r.parent_code), `${r.region_code} üst bölge kodu (${r.parent_code}) tabloda tanımlı olmalı`);
    }
  }

  // 2.2 GB 32100-2015 Mod-31, GİB VKN Mod-10, NVİ TCKN, Luhn, PL NIP, RU INN Doğrulayıcıları
  const USCC_ALPHABET = "0123456789ABCDEFGHJKLMNPQRTUWXY";
  const USCC_WEIGHTS = [1, 3, 9, 27, 19, 26, 16, 17, 20, 29, 25, 13, 8, 24, 10, 30, 28];

  assert(USCC_ALPHABET.length === 31, "USCC alfabesi 31 karakter olmalı");
  for (const forbidden of ["I", "O", "Z", "S", "V"]) {
    assert(!USCC_ALPHABET.includes(forbidden), `USCC alfabesi '${forbidden}' harfini içermemeli`);
  }
  for (let i = 0; i < 17; i++) {
    // (3^i) mod 31 matematiksel ağırlık kanıtı
    let powMod = 1;
    for (let k = 0; k < i; k++) powMod = (powMod * 3) % 31;
    assert(powMod === USCC_WEIGHTS[i], `GB 32100-2015 ağırlığı W[${i}]=${USCC_WEIGHTS[i]} == 3^${i} mod 31 kanıtı`);
  }

  function verifyUsccMod31(code) {
    if (typeof code !== "string" || code.length !== 18) return false;
    let sum = 0;
    for (let i = 0; i < 17; i++) {
      const idx = USCC_ALPHABET.indexOf(code[i]);
      if (idx < 0) return false;
      sum += idx * USCC_WEIGHTS[i];
    }
    const expected = USCC_ALPHABET[(31 - (sum % 31)) % 31];
    return code[17] === expected;
  }

  function verifyTrVknMod10(vkn) {
    if (!/^[0-9]{10}$/.test(vkn)) return false;
    let sum = 0;
    for (let i = 0; i < 9; i++) {
      const d = Number(vkn[i]);
      const v = (d + (9 - i)) % 10;
      let p = (v * Math.pow(2, 9 - i)) % 9;
      if (v !== 0 && p === 0) p = 9;
      sum += p;
    }
    return ((10 - (sum % 10)) % 10) === Number(vkn[9]);
  }

  function verifyTrTckn(tckn) {
    if (!/^[1-9][0-9]{10}$/.test(tckn)) return false;
    const d = tckn.split("").map(Number);
    const odd = d[0] + d[2] + d[4] + d[6] + d[8];
    const even = d[1] + d[3] + d[5] + d[7];
    const d10 = (((odd * 7) - even) % 10 + 10) % 10;
    const d11 = d.slice(0, 10).reduce((a, b) => a + b, 0) % 10;
    return d[9] === d10 && d[10] === d11;
  }

  function verifyLuhn(str) {
    let sum = 0;
    let dbl = false;
    for (let i = str.length - 1; i >= 0; i--) {
      let n = Number(str[i]);
      if (dbl) {
        n *= 2;
        if (n > 9) n -= 9;
      }
      sum += n;
      dbl = !dbl;
    }
    return sum % 10 === 0;
  }

  function verifyPlNip(val) {
    const digits = val.replace(/^PL/, "");
    if (!/^[0-9]{10}$/.test(digits)) return false;
    const w = [6, 5, 7, 2, 3, 4, 5, 6, 7];
    const sum = w.reduce((acc, weight, idx) => acc + weight * Number(digits[idx]), 0);
    return sum % 11 === Number(digits[9]);
  }

  function verifyRuInn10(val) {
    if (!/^[0-9]{10}$/.test(val)) return false;
    const w = [2, 4, 10, 3, 5, 9, 4, 6, 8];
    const sum = w.reduce((acc, weight, idx) => acc + weight * Number(val[idx]), 0);
    return ((sum % 11) % 10) === Number(val[9]);
  }

  // Gerçek halka açık şirket USCC testi: Sberbank INN (7707083893) ve USCC bozulmuş kontrol testi
  assert(!verifyUsccMod31("9144060658140293X0"), "Bozuk kontrol basamaklı USCC reddedilmeli");

  const seenRuleCodes = new Set();
  for (const r of regRules) {
    assert(!seenRuleCodes.has(r.rule_code), `Tekil sicil kural kodu: ${r.rule_code}`);
    seenRuleCodes.add(r.rule_code);
    const re = new RegExp(r.pattern_regex);
    assert(re.test(r.sample_valid), `${r.rule_code}: Örnek değer (${r.sample_valid}) regex ile eşleşmeli`);

    if (r.checksum_algorithm === "gb32100_mod31") {
      assert(verifyUsccMod31(r.sample_valid), `${r.rule_code}: Örnek USCC Mod-31 kontrolünden geçmeli`);
    } else if (r.checksum_algorithm === "tr_vkn_mod10") {
      assert(verifyTrVknMod10(r.sample_valid), `${r.rule_code}: Örnek VKN GİB Mod-10 kontrolünden geçmeli`);
    } else if (r.checksum_algorithm === "tr_tckn_mod10") {
      assert(verifyTrTckn(r.sample_valid), `${r.rule_code}: Örnek TCKN NVİ Mod-10 kontrolünden geçmeli`);
    } else if (r.checksum_algorithm === "luhn_mod10") {
      assert(verifyLuhn(r.sample_valid), `${r.rule_code}: Örnek SIRET Luhn Mod-10 kontrolünden geçmeli`);
    } else if (r.checksum_algorithm === "pl_nip_mod11") {
      assert(verifyPlNip(r.sample_valid), `${r.rule_code}: Örnek Polonya NIP Mod-11 kontrolünden geçmeli`);
    } else if (r.checksum_algorithm === "ru_inn10_mod11") {
      assert(verifyRuInn10(r.sample_valid), `${r.rule_code}: Örnek Rusya INN-10 (Sberbank) Mod-11 kontrolünden geçmeli`);
    }
  }

  // 2.3 ISO 13616 & ISO 7064 Mod 97-10 IBAN Doğrulaması (Tüm 60 ülke!)
  function verifyIbanMod97(iban) {
    const clean = iban.replace(/\s+/g, "").toUpperCase();
    if (clean.length < 15 || clean.length > 34) return false;
    const rearranged = clean.slice(4) + clean.slice(0, 4);
    let numStr = "";
    for (const ch of rearranged) {
      const code = ch.charCodeAt(0);
      if (code >= 65 && code <= 90) numStr += String(code - 55);
      else if (code >= 48 && code <= 57) numStr += ch;
      else return false;
    }
    return BigInt(numStr) % 97n === 1n;
  }

  assert(ibanRules.length === 60, `IBAN/Ödeme ülke tablosu tam 60 ülke olmalı (gerçek: ${ibanRules.length})`);
  const seenIbanCc = new Set();
  for (const ib of ibanRules) {
    assert(!seenIbanCc.has(ib.country_code), `Tekil ülke kodu: ${ib.country_code}`);
    seenIbanCc.add(ib.country_code);
    if (ib.uses_iban) {
      assert(ib.sample_iban.length === ib.iban_length, `${ib.country_code}: Örnek IBAN uzunluğu (${ib.sample_iban.length}) == ${ib.iban_length}`);
      assert(new RegExp(ib.iban_regex).test(ib.sample_iban), `${ib.country_code}: Örnek IBAN ülke BBAN regex'inden geçmeli`);
      assert(verifyIbanMod97(ib.sample_iban), `${ib.country_code}: Örnek IBAN (${ib.sample_iban}) ISO 7064 Mod-97 === 1 testinden geçmeli`);
    } else {
      assert(ib.iban_length === 0 && ib.sample_iban === "", `${ib.country_code}: Non-IBAN ülkede IBAN uzunluğu 0 olmalı`);
      assert(ib.local_routing_system.length > 5, `${ib.country_code}: Yerel SWIFT/Routing açıklaması dolu olmalı`);
    }
  }
}

// ===========================================================================
// MODÜL 03 DOĞRULAMASI: ACS CAS Numarası Mod-10 & AB EC (EINECS) Mod-11 Kanıtı
// ===========================================================================
if (existsSync(join(ROOT, "03-chemical-reach-cas/regulated_chemicals.json"))) {
  const chemLists = JSON.parse(readFileSync(join(ROOT, "03-chemical-reach-cas/chemical_regulatory_lists.json"), "utf8"));
  const chemicals = JSON.parse(readFileSync(join(ROOT, "03-chemical-reach-cas/regulated_chemicals.json"), "utf8"));

  // Resmi Amerikan Kimya Derneği (ACS) CAS Registry Number Mod-10 Checksum Algoritması
  function verifyCasMod10(cas) {
    const m = /^([0-9]{2,7})-([0-9]{2})-([0-9])$/.exec(cas);
    if (!m) return false;
    const bodyDigits = (m[1] + m[2]).split("").reverse().map(Number);
    const checkDigit = Number(m[3]);
    let sum = 0;
    for (let i = 0; i < bodyDigits.length; i++) {
      sum += bodyDigits[i] * (i + 1);
    }
    return (sum % 10) === checkDigit;
  }

  // Resmi AB EC / EINECS Numarası (XXX-XXX-X) Mod-11 Checksum Algoritması
  function verifyEcMod11(ec) {
    const m = /^([0-9]{3})-([0-9]{3})-([0-9])$/.exec(ec);
    if (!m) return false;
    const digits = (m[1] + m[2]).split("").map(Number);
    const check = Number(m[3]);
    let sum = 0;
    for (let i = 0; i < 6; i++) {
      sum += digits[i] * (i + 1);
    }
    return (sum % 11) === check;
  }

  // Negatif test: Yanlış yazılmış bir CAS numarası kesinlikle reddedilmeli
  assert(!verifyCasMod10("117-81-8"), "Negatif Test: Hatalı son basamaklı CAS (117-81-8) reddedilmeli");

  const validListCodes = new Set(chemLists.map((l) => l.list_code));
  assert(chemLists.length === 9, `9 küresel kimyasal mevzuat çerçevesi tanımlı olmalı (gerçek: ${chemLists.length})`);

  const VALID_SECTORS = new Set([
    "textile_leather",
    "plastics_rubber",
    "electronics_cables",
    "furniture_wood",
    "paints_coatings",
    "metal_surface",
    "packaging_food_contact",
    "cosmetics_detergents",
  ]);
  const VALID_STATUSES = new Set([
    "banned_restricted",
    "svhc_candidate",
    "authorisation_sunset",
    "early_warning_draft",
  ]);

  assert(chemicals.length >= 65, `En az 65 yüksek kritiklikli sanayi CAS maddesi bulunmalı (gerçek: ${chemicals.length})`);
  const seenCas = new Set();
  for (const ch of chemicals) {
    assert(!seenCas.has(ch.cas_number), `Tekil CAS numarası olmalı: ${ch.cas_number}`);
    seenCas.add(ch.cas_number);
    assert(verifyCasMod10(ch.cas_number), `${ch.name_en} [${ch.cas_number}]: Resmi ACS CAS Mod-10 kontrol basamağı doğrulaması`);
    if (ch.ec_number) {
      assert(verifyEcMod11(ch.ec_number), `${ch.name_en} [EC ${ch.ec_number}]: Resmi AB EINECS Mod-11 kontrol basamağı doğrulaması`);
    }
    assert(VALID_STATUSES.has(ch.risk_status), `${ch.cas_number}: Geçerli risk statüsü (${ch.risk_status})`);
    assert(Array.isArray(ch.lists) && ch.lists.length > 0, `${ch.cas_number}: En az 1 resmi listeye bağlı olmalı`);
    for (const lc of ch.lists) {
      assert(validListCodes.has(lc), `${ch.cas_number}: Tanımlı mevzuat kodu (${lc})`);
    }
    assert(Array.isArray(ch.sectors) && ch.sectors.length > 0, `${ch.cas_number}: En az 1 sektöre bağlı olmalı`);
    for (const sec of ch.sectors) {
      assert(VALID_SECTORS.has(sec), `${ch.cas_number}: Geçerli sanayi sektörü (${sec})`);
    }
  }
}

// ===========================================================================
// MODÜL 04 DOĞRULAMASI: AB 2023/956 CBAM Takvim Matematiği & Ek-I GTİP Tutarlılığı
// ===========================================================================
if (existsSync(join(ROOT, "04-eu-cbam/cbam_goods.json"))) {
  const schedule = JSON.parse(readFileSync(join(ROOT, "04-eu-cbam/cbam_phase_schedule.json"), "utf8"));
  const goods = JSON.parse(readFileSync(join(ROOT, "04-eu-cbam/cbam_goods.json"), "utf8"));

  assert(schedule.length === 9, `CBAM 2026-2034 takvimi tam 9 yıl olmalı (gerçek: ${schedule.length})`);
  for (let i = 0; i < schedule.length; i++) {
    const row = schedule[i];
    assert(row.calendar_year === 2026 + i, `Takvim yılı sıralı olmalı: ${row.calendar_year}`);
    assert(
      Math.abs((row.eu_ets_free_allocation_pct + row.cbam_financial_factor_pct) - 100.0) < 1e-6,
      `${row.calendar_year}: Ücretsiz tahsisat (${row.eu_ets_free_allocation_pct}%) + CBAM faktörü (${row.cbam_financial_factor_pct}%) = %100.0 olmalı`
    );
    if (i > 0) {
      assert(
        row.cbam_financial_factor_pct > schedule[i - 1].cbam_financial_factor_pct,
        `${row.calendar_year}: CBAM mali yükümlülük oranı her yıl monoton artmalı`
      );
    }
    assert([10, 20, 30].includes(row.default_value_markup_pct), `${row.calendar_year}: Resmi ceza marjı %10/%20/%30 olmalı`);
  }
  assert(schedule[0].cbam_financial_factor_pct === 2.5 && schedule[8].cbam_financial_factor_pct === 100.0, "2026=%2.5 ve 2034=%100 sınır koşulları");

  const VALID_CBAM_SECTORS = new Set(["cement", "iron_steel", "aluminium", "fertilisers", "hydrogen", "electricity"]);
  const seenCn = new Set();
  const seenSectors = new Set();

  assert(goods.length >= 35, `En az 35 CBAM GTİP/CN grubu tanımlı olmalı (gerçek: ${goods.length})`);
  for (const g of goods) {
    assert(!seenCn.has(g.cn_code), `Tekil CBAM CN anahtarı: ${g.cn_code}`);
    seenCn.add(g.cn_code);
    assert(VALID_CBAM_SECTORS.has(g.sector), `${g.cn_code}: Geçerli CBAM sektörü (${g.sector})`);
    seenSectors.add(g.sector);

    if (g.cbam_covered) {
      assert(
        g.eu_benchmark_tco2 >= 0 &&
          g.tr_typical_tco2 >= g.eu_benchmark_tco2 &&
          g.cn_typical_tco2 >= g.tr_typical_tco2 &&
          g.eu_default_tco2 >= g.cn_typical_tco2,
        `${g.cn_code}: Emisyon hiyerarşisi (AB Benchmark <= TR Tipik <= CN Tipik <= AB Cezalı Varsayılan) tutarlı olmalı`
      );
      if (g.sector === "hydrogen" || g.sector === "electricity") {
        assert(g.de_minimis_50t_applies === false, `${g.cn_code}: Hidrojen ve elektrikte 50 ton muafiyeti uygulanmamalı (EU 2025/2083)`);
      } else {
        assert(g.de_minimis_50t_applies === true, `${g.cn_code}: Katı CBAM sektörlerinde 50 ton muafiyeti aktif olmalı (EU 2025/2083)`);
      }
    } else {
      assert(
        g.eu_benchmark_tco2 === 0 && g.eu_default_tco2 === 0 && g.de_minimis_50t_applies === false,
        `${g.cn_code}: Kapsam dışı (muaf) GTİP satırlarında emisyon katsayısı 0 olmalı`
      );
    }
  }
  assert(seenSectors.size === 6, "AB 2023/956 kapsamındaki 6 sektörün tamamı temsil edilmeli");
}

if (failures > 0) {
  console.error(`\n❌ DOĞRULAMA BAŞARISIZ: ${assertions} kontrolden ${failures} tanesi hata verdi.`);
  process.exit(1);
} else {
  console.log(`\n✅ TÜM DOĞRULAMA TESTLERİ GEÇTİ! (${assertions}/${assertions} matematiksel ve yapısal kontrol %100 başarılı)`);
}
