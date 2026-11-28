// PocketBase Şema & Veri Havuzu Senkronizasyon Motoru (Yerel + Railway Canlı Ortam Uyumlu)
// Önce verify-all.mjs kapısını çalıştırır; hata varsa tek bir kayıt bile yazmadan durur.
import { execFileSync } from "node:child_process";
import { readFileSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const SCRIPT_DIR = dirname(fileURLToPath(import.meta.url));
const ROOT = join(SCRIPT_DIR, "..");

const PB_URL = (process.env.PB_URL || "http://127.0.0.1:8090").replace(/\/+$/, "");
const PB_ADMIN_EMAIL = process.env.PB_ADMIN_EMAIL || "dev-local@bdimexport.com";
const PB_ADMIN_PASSWORD = process.env.PB_ADMIN_PASSWORD || "LocalDevPass123456!";

// 1. Önce Veri Doğrulama Kapısını Zorunlu Koş
console.log("🔒 [Adım 1/3] Veri doğrulama kapısı (verify-all.mjs) çalıştırılıyor...");
execFileSync(process.execPath, [join(SCRIPT_DIR, "verify-all.mjs")], { stdio: "inherit" });

// 2. PocketBase Süper Kullanıcı Kimlik Doğrulaması
async function pbFetch(path, options = {}, token = "") {
  const headers = { "Content-Type": "application/json", ...(options.headers || {}) };
  if (token) headers.Authorization = token;
  const res = await fetch(`${PB_URL}${path}`, { ...options, headers });
  const text = await res.text();
  let json = null;
  try {
    json = text ? JSON.parse(text) : null;
  } catch {
    json = { raw: text };
  }
  if (!res.ok) {
    throw new Error(`PocketBase HTTP ${res.status} (${path}): ${JSON.stringify(json)}`);
  }
  return json;
}

console.log(`\n🔌 [Adım 2/3] PocketBase sunucusuna bağlanılıyor: ${PB_URL}`);
const auth = await pbFetch("/api/collections/_superusers/auth-with-password", {
  method: "POST",
  body: JSON.stringify({ identity: PB_ADMIN_EMAIL, password: PB_ADMIN_PASSWORD }),
});
const TOKEN = auth.token;

// ---------------------------------------------------------------------------
// Koleksiyon Şema Tanımları (00-core + 01-container-aql)
// Not: PocketBase'de number alanlarda 0 değeri geçerli olduğundan `required: false` bırakılır.
// ---------------------------------------------------------------------------
const COLLECTIONS = [
  {
    name: "data_sources_registry",
    type: "base",
    listRule: "",
    viewRule: "",
    createRule: null,
    updateRule: null,
    deleteRule: null,
    fields: [
      { name: "module_id", type: "text", required: true, max: 80 },
      { name: "module_order", type: "number", onlyInt: true },
      { name: "title_tr", type: "text", required: true, max: 240 },
      { name: "title_en", type: "text", required: true, max: 240 },
      { name: "authority", type: "text", required: true, max: 240 },
      { name: "update_cadence", type: "text", required: true, max: 80 },
      { name: "verification_status", type: "text", required: true, max: 40 },
      { name: "total_records", type: "number", onlyInt: true },
      { name: "files_manifest", type: "json", maxSize: 200000 },
      { name: "official_sources", type: "json", maxSize: 200000 },
      { name: "verified_at", type: "text", required: true, max: 64 },
    ],
    indexes: ["CREATE UNIQUE INDEX idx_ds_registry_module_id ON data_sources_registry (module_id)"],
  },
  {
    name: "radar_subscriptions",
    type: "base",
    // Müşteri/Lead gizliliği: Dışarıdan KİMSE listeleyemez veya okuyamaz (null = yalnız Admin).
    // Kayıt oluşturma: Yalnızca KVKK onayı verilmiş ve e-postası dolu talepler kabul edilir.
    listRule: null,
    viewRule: null,
    createRule: "consent_kvkk = true && email != '' && tool_slug != ''",
    updateRule: null,
    deleteRule: null,
    fields: [
      { name: "email", type: "email", required: true },
      { name: "company_name", type: "text", required: false, max: 180 },
      { name: "contact_name", type: "text", required: false, max: 140 },
      { name: "whatsapp_phone", type: "text", required: false, max: 40 },
      {
        name: "company_role",
        type: "select",
        maxSelect: 1,
        values: ["importer_tr", "exporter_manufacturer_tr", "foreign_buyer", "customs_broker", "other"],
      },
      { name: "tool_slug", type: "text", required: true, max: 80 },
      { name: "locale", type: "text", required: false, max: 16 },
      { name: "source_url", type: "text", required: false, max: 300 },
      { name: "watched_hs_codes", type: "json", maxSize: 50000 },
      { name: "watched_items", type: "json", maxSize: 100000 },
      { name: "trade_corridors", type: "json", maxSize: 50000 },
      { name: "shipment_volume", type: "text", required: false, max: 80 },
      {
        name: "channel_pref",
        type: "select",
        maxSelect: 1,
        values: ["email", "whatsapp", "telegram", "wechat"],
      },
      { name: "consent_kvkk", type: "bool" },
      { name: "consent_version", type: "text", required: false, max: 64 },
      {
        name: "lead_status",
        type: "select",
        maxSelect: 1,
        values: ["new", "verified", "contacted", "qualified", "unsubscribed"],
      },
    ],
    indexes: [
      "CREATE INDEX idx_radar_subs_tool ON radar_subscriptions (tool_slug)",
      "CREATE INDEX idx_radar_subs_email ON radar_subscriptions (email)",
    ],
  },
  {
    name: "containers_specs",
    type: "base",
    listRule: "",
    viewRule: "",
    createRule: null,
    updateRule: null,
    deleteRule: null,
    fields: [
      { name: "code", type: "text", required: true, max: 32 },
      { name: "category", type: "text", required: true, max: 32 },
      { name: "standard_ref", type: "text", required: true, max: 120 },
      { name: "sort_order", type: "number", onlyInt: true },
      { name: "name_tr", type: "text", required: true, max: 180 },
      { name: "name_en", type: "text", required: true, max: 180 },
      { name: "name_de", type: "text", required: true, max: 180 },
      { name: "name_zh", type: "text", required: true, max: 180 },
      { name: "internal_length_mm", type: "number", onlyInt: true },
      { name: "internal_width_mm", type: "number", onlyInt: true },
      { name: "internal_height_mm", type: "number", onlyInt: true },
      { name: "door_width_mm", type: "number", onlyInt: true },
      { name: "door_height_mm", type: "number", onlyInt: true },
      { name: "theoretical_cbm", type: "number" },
      { name: "practical_cbm_min", type: "number" },
      { name: "practical_cbm_max", type: "number" },
      { name: "tare_weight_kg", type: "number", onlyInt: true },
      { name: "max_payload_kg", type: "number", onlyInt: true },
      { name: "road_safe_payload_kg", type: "number", onlyInt: true },
      { name: "max_gross_weight_kg", type: "number", onlyInt: true },
      { name: "euro_pallets_floor_max", type: "number", onlyInt: true },
      { name: "euro_pallets_practical", type: "number", onlyInt: true },
      { name: "industrial_pallets_floor_max", type: "number", onlyInt: true },
      { name: "industrial_pallets_practical", type: "number", onlyInt: true },
      { name: "us_gma_pallets_floor_max", type: "number", onlyInt: true },
      { name: "best_for_tr", type: "text", required: false, max: 500 },
      { name: "best_for_en", type: "text", required: false, max: 500 },
    ],
    indexes: ["CREATE UNIQUE INDEX idx_containers_specs_code ON containers_specs (code)"],
  },
  {
    name: "aql_lot_codes",
    type: "base",
    listRule: "",
    viewRule: "",
    createRule: null,
    updateRule: null,
    deleteRule: null,
    fields: [
      { name: "bracket_index", type: "number", onlyInt: true },
      { name: "lot_min", type: "number", onlyInt: true },
      { name: "lot_max", type: "number", onlyInt: true },
      { name: "label", type: "text", required: true, max: 64 },
      { name: "s1", type: "text", required: true, max: 4 },
      { name: "s2", type: "text", required: true, max: 4 },
      { name: "s3", type: "text", required: true, max: 4 },
      { name: "s4", type: "text", required: true, max: 4 },
      { name: "gi", type: "text", required: true, max: 4 },
      { name: "gii", type: "text", required: true, max: 4 },
      { name: "giii", type: "text", required: true, max: 4 },
    ],
    indexes: ["CREATE UNIQUE INDEX idx_aql_lot_bracket ON aql_lot_codes (bracket_index)"],
  },
  {
    name: "aql_sampling_plans",
    type: "base",
    listRule: "",
    viewRule: "",
    createRule: null,
    updateRule: null,
    deleteRule: null,
    fields: [
      { name: "plan_key", type: "text", required: true, max: 64 },
      { name: "inspection_regime", type: "text", required: true, max: 32 },
      { name: "code_letter", type: "text", required: true, max: 4 },
      { name: "nominal_sample_size", type: "number", onlyInt: true },
      { name: "aql", type: "number" },
      { name: "aql_label", type: "text", required: true, max: 16 },
      { name: "rule_type", type: "text", required: true, max: 24 },
      { name: "effective_code_letter", type: "text", required: true, max: 4 },
      { name: "effective_sample_size", type: "number", onlyInt: true },
      { name: "accept_max", type: "number", onlyInt: true },
      { name: "reject_min", type: "number", onlyInt: true },
      { name: "standard_ref", type: "text", required: true, max: 80 },
    ],
    indexes: [
      "CREATE UNIQUE INDEX idx_aql_plan_key ON aql_sampling_plans (plan_key)",
      "CREATE INDEX idx_aql_letter_label ON aql_sampling_plans (code_letter, aql_label)",
    ],
  },
  // -------------------------------------------------------------------------
  // Modül 02: Tedarikçi Sicil (Çin USCC, Vergi Algoritmaları ve ISO 13616 IBAN)
  // -------------------------------------------------------------------------
  {
    name: "cn_uscc_regions",
    type: "base",
    listRule: "",
    viewRule: "",
    createRule: null,
    updateRule: null,
    deleteRule: null,
    fields: [
      { name: "region_code", type: "text", required: true, max: 16 },
      { name: "level", type: "text", required: true, max: 24 },
      { name: "parent_code", type: "text", required: false, max: 16 },
      { name: "name_zh", type: "text", required: true, max: 80 },
      { name: "name_en", type: "text", required: true, max: 120 },
      { name: "name_tr", type: "text", required: true, max: 120 },
      { name: "industrial_clusters_tr", type: "text", required: true, max: 600 },
      { name: "industrial_clusters_en", type: "text", required: true, max: 600 },
      { name: "trading_intermediary_risk", type: "text", required: true, max: 24 },
    ],
    indexes: ["CREATE UNIQUE INDEX idx_cn_uscc_region_code ON cn_uscc_regions (region_code)"],
  },
  {
    name: "supplier_registry_rules",
    type: "base",
    listRule: "",
    viewRule: "",
    createRule: null,
    updateRule: null,
    deleteRule: null,
    fields: [
      { name: "rule_code", type: "text", required: true, max: 40 },
      { name: "country_code", type: "text", required: true, max: 8 },
      { name: "id_type", type: "text", required: true, max: 160 },
      { name: "standard_ref", type: "text", required: true, max: 160 },
      { name: "char_length_min", type: "number", onlyInt: true },
      { name: "char_length_max", type: "number", onlyInt: true },
      { name: "pattern_regex", type: "text", required: true, max: 240 },
      { name: "checksum_algorithm", type: "text", required: true, max: 64 },
      { name: "sample_valid", type: "text", required: true, max: 64 },
      { name: "entity_nature", type: "text", required: true, max: 64 },
      { name: "fraud_flag_level", type: "text", required: true, max: 40 },
      { name: "guidance_tr", type: "text", required: true, max: 800 },
      { name: "guidance_en", type: "text", required: true, max: 800 },
    ],
    indexes: [
      "CREATE UNIQUE INDEX idx_supplier_reg_rule_code ON supplier_registry_rules (rule_code)",
      "CREATE INDEX idx_supplier_reg_country ON supplier_registry_rules (country_code)",
    ],
  },
  {
    name: "iban_country_rules",
    type: "base",
    listRule: "",
    viewRule: "",
    createRule: null,
    updateRule: null,
    deleteRule: null,
    fields: [
      { name: "country_code", type: "text", required: true, max: 8 },
      { name: "country_name_tr", type: "text", required: true, max: 120 },
      { name: "country_name_en", type: "text", required: true, max: 120 },
      { name: "uses_iban", type: "bool" },
      { name: "iban_length", type: "number", onlyInt: true },
      { name: "iban_regex", type: "text", required: false, max: 160 },
      { name: "local_routing_system", type: "text", required: true, max: 200 },
      { name: "sample_iban", type: "text", required: false, max: 64 },
      { name: "sepa_member", type: "bool" },
      { name: "fintech_offshore_watch", type: "bool" },
      { name: "compliance_note_tr", type: "text", required: true, max: 600 },
    ],
    indexes: ["CREATE UNIQUE INDEX idx_iban_country_code ON iban_country_rules (country_code)"],
  },
  // -------------------------------------------------------------------------
  // Modül 03: Kimyasal Yasak & SDS (CAS Numarası) Takipçisi
  // -------------------------------------------------------------------------
  {
    name: "chemical_regulatory_lists",
    type: "base",
    listRule: "",
    viewRule: "",
    createRule: null,
    updateRule: null,
    deleteRule: null,
    fields: [
      { name: "list_code", type: "text", required: true, max: 64 },
      { name: "jurisdiction", type: "text", required: true, max: 16 },
      { name: "authority", type: "text", required: true, max: 180 },
      { name: "title_tr", type: "text", required: true, max: 240 },
      { name: "title_en", type: "text", required: true, max: 240 },
      { name: "default_threshold", type: "text", required: true, max: 160 },
      { name: "update_schedule", type: "text", required: true, max: 160 },
      { name: "legal_consequence_tr", type: "text", required: true, max: 800 },
      { name: "official_url", type: "text", required: true, max: 300 },
    ],
    indexes: ["CREATE UNIQUE INDEX idx_chem_reg_list_code ON chemical_regulatory_lists (list_code)"],
  },
  {
    name: "regulated_chemicals",
    type: "base",
    listRule: "",
    viewRule: "",
    createRule: null,
    updateRule: null,
    deleteRule: null,
    fields: [
      { name: "cas_number", type: "text", required: true, max: 32 },
      { name: "ec_number", type: "text", required: false, max: 32 },
      { name: "name_en", type: "text", required: true, max: 240 },
      { name: "name_tr", type: "text", required: true, max: 240 },
      { name: "chem_group", type: "text", required: true, max: 64 },
      { name: "risk_status", type: "text", required: true, max: 40 },
      { name: "lists", type: "json", maxSize: 20000 },
      { name: "threshold", type: "text", required: true, max: 240 },
      { name: "sectors", type: "json", maxSize: 20000 },
      { name: "action_tr", type: "text", required: true, max: 800 },
    ],
    indexes: [
      "CREATE UNIQUE INDEX idx_reg_chem_cas ON regulated_chemicals (cas_number)",
      "CREATE INDEX idx_reg_chem_group ON regulated_chemicals (chem_group, risk_status)",
    ],
  },
];

async function ensureCollection(colDef) {
  let existing = null;
  try {
    existing = await pbFetch(`/api/collections/${colDef.name}`, { method: "GET" }, TOKEN);
  } catch {
    existing = null;
  }

  if (!existing) {
    await pbFetch("/api/collections", { method: "POST", body: JSON.stringify(colDef) }, TOKEN);
    console.log(`  ➕ Koleksiyon oluşturuldu: ${colDef.name}`);
  } else {
    // Mevcut sistem alanlarını (id, created, updated) koruyarak alanları birleştir
    const existingByName = new Map((existing.fields || []).map((f) => [f.name, f]));
    const mergedFields = [...(existing.fields || []).filter((f) => f.system)];
    for (const f of colDef.fields) {
      const prev = existingByName.get(f.name);
      mergedFields.push(prev ? { ...prev, ...f, id: prev.id } : f);
    }
    await pbFetch(
      `/api/collections/${existing.id}`,
      {
        method: "PATCH",
        body: JSON.stringify({
          listRule: colDef.listRule,
          viewRule: colDef.viewRule,
          createRule: colDef.createRule,
          updateRule: colDef.updateRule,
          deleteRule: colDef.deleteRule,
          fields: mergedFields,
          indexes: colDef.indexes,
        }),
      },
      TOKEN
    );
    console.log(`  🔄 Koleksiyon şeması güncellendi: ${colDef.name}`);
  }
}

for (const c of COLLECTIONS) {
  await ensureCollection(c);
}

// ---------------------------------------------------------------------------
// 3. İdempotent Kayıt Senkronizasyonu (Mevcut kayıtları tekil anahtarla bulup upsert eder)
// ---------------------------------------------------------------------------
async function syncRecords(collectionName, uniqueField, rows) {
  const existingList = await pbFetch(
    `/api/collections/${collectionName}/records?perPage=500&skipTotal=1`,
    { method: "GET" },
    TOKEN
  );
  const existingMap = new Map();
  for (const item of existingList.items || []) {
    existingMap.set(String(item[uniqueField]), item.id);
  }

  let created = 0;
  let updated = 0;
  for (const row of rows) {
    const keyVal = String(row[uniqueField]);
    const existingId = existingMap.get(keyVal);
    if (existingId) {
      await pbFetch(
        `/api/collections/${collectionName}/records/${existingId}`,
        { method: "PATCH", body: JSON.stringify(row) },
        TOKEN
      );
      updated++;
    } else {
      await pbFetch(
        `/api/collections/${collectionName}/records`,
        { method: "POST", body: JSON.stringify(row) },
        TOKEN
      );
      created++;
    }
  }
  console.log(`  ✅ ${collectionName}: ${created} eklendi, ${updated} güncellendi (toplam: ${rows.length})`);
}

console.log("\n📦 [Adım 3/3] Doğrulanmış veriler PocketBase'e aktarılıyor...");
const manifest = JSON.parse(readFileSync(join(ROOT, "manifest.json"), "utf8"));

const registryRows = manifest.datasets.map((d) => ({
  module_id: d.module_id,
  module_order: d.order,
  title_tr: d.title_tr,
  title_en: d.title_en,
  authority: d.authority,
  update_cadence: d.update_cadence,
  verification_status: d.verification_status,
  total_records: d.files.reduce((acc, f) => acc + f.records, 0),
  files_manifest: d.files,
  official_sources: d.official_sources,
  verified_at: d.verified_at,
}));
await syncRecords("data_sources_registry", "module_id", registryRows);

const containers = JSON.parse(readFileSync(join(ROOT, "01-container-aql/containers.json"), "utf8"));
const lotCodes = JSON.parse(readFileSync(join(ROOT, "01-container-aql/aql_lot_codes.json"), "utf8"));
const samplingPlans = JSON.parse(readFileSync(join(ROOT, "01-container-aql/aql_sampling_plans.json"), "utf8"));

await syncRecords("containers_specs", "code", containers);
await syncRecords("aql_lot_codes", "bracket_index", lotCodes);
await syncRecords("aql_sampling_plans", "plan_key", samplingPlans);

const cnRegions = JSON.parse(readFileSync(join(ROOT, "02-supplier-registry/cn_uscc_regions.json"), "utf8"));
const regRules = JSON.parse(readFileSync(join(ROOT, "02-supplier-registry/supplier_registry_rules.json"), "utf8"));
const ibanRules = JSON.parse(readFileSync(join(ROOT, "02-supplier-registry/iban_country_rules.json"), "utf8"));

await syncRecords("cn_uscc_regions", "region_code", cnRegions);
await syncRecords("supplier_registry_rules", "rule_code", regRules);
await syncRecords("iban_country_rules", "country_code", ibanRules);

const chemLists = JSON.parse(readFileSync(join(ROOT, "03-chemical-reach-cas/chemical_regulatory_lists.json"), "utf8"));
const regChemicals = JSON.parse(readFileSync(join(ROOT, "03-chemical-reach-cas/regulated_chemicals.json"), "utf8"));

await syncRecords("chemical_regulatory_lists", "list_code", chemLists);
await syncRecords("regulated_chemicals", "cas_number", regChemicals);

console.log("\n🎉 PocketBase senkronizasyonu %100 başarıyla tamamlandı!");
