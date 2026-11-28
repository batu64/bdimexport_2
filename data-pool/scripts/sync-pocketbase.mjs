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
  // -------------------------------------------------------------------------
  // Modül 04: AB CBAM (Sınırda Karbon Düzenleme Mekanizması)
  // -------------------------------------------------------------------------
  {
    name: "cbam_phase_schedule",
    type: "base",
    listRule: "",
    viewRule: "",
    createRule: null,
    updateRule: null,
    deleteRule: null,
    fields: [
      { name: "calendar_year", type: "number", onlyInt: true },
      { name: "regime_phase", type: "text", required: true, max: 40 },
      { name: "eu_ets_free_allocation_pct", type: "number" },
      { name: "cbam_financial_factor_pct", type: "number" },
      { name: "default_value_markup_pct", type: "number", onlyInt: true },
      { name: "de_minimis_mass_tonnes", type: "number", onlyInt: true },
      { name: "reference_ets_eur_per_tco2", type: "number" },
      { name: "note_tr", type: "text", required: true, max: 600 },
    ],
    indexes: ["CREATE UNIQUE INDEX idx_cbam_year ON cbam_phase_schedule (calendar_year)"],
  },
  {
    name: "cbam_goods",
    type: "base",
    listRule: "",
    viewRule: "",
    createRule: null,
    updateRule: null,
    deleteRule: null,
    fields: [
      { name: "cn_code", type: "text", required: true, max: 40 },
      { name: "cn_display", type: "text", required: true, max: 80 },
      { name: "sector", type: "text", required: true, max: 40 },
      { name: "cbam_covered", type: "bool" },
      { name: "ghg_gases", type: "text", required: true, max: 40 },
      { name: "de_minimis_50t_applies", type: "bool" },
      { name: "name_tr", type: "text", required: true, max: 240 },
      { name: "name_en", type: "text", required: true, max: 240 },
      { name: "eu_benchmark_tco2", type: "number" },
      { name: "tr_typical_tco2", type: "number" },
      { name: "cn_typical_tco2", type: "number" },
      { name: "eu_default_tco2", type: "number" },
      { name: "guidance_tr", type: "text", required: true, max: 800 },
    ],
    indexes: [
      "CREATE UNIQUE INDEX idx_cbam_goods_cn ON cbam_goods (cn_code)",
      "CREATE INDEX idx_cbam_goods_sector ON cbam_goods (sector, cbam_covered)",
    ],
  },
  // -------------------------------------------------------------------------
  // Modül 05: Gıda İhracatçıları İçin AB DG SANTE MRL & FDA/RASFF Sınır Radarı
  // -------------------------------------------------------------------------
  {
    name: "food_export_commodities",
    type: "base",
    listRule: "",
    viewRule: "",
    createRule: null,
    updateRule: null,
    deleteRule: null,
    fields: [
      { name: "commodity_slug", type: "text", required: true, max: 64 },
      { name: "product_code", type: "text", required: true, max: 16 },
      { name: "sante_product_id", type: "number", onlyInt: true },
      { name: "hs_prefix", type: "text", required: true, max: 40 },
      { name: "name_tr", type: "text", required: true, max: 180 },
      { name: "name_en", type: "text", required: true, max: 180 },
      { name: "sante_product_name_official", type: "text", required: true, max: 180 },
      { name: "eu_border_annex", type: "text", required: true, max: 200 },
      { name: "eu_sampling_pct", type: "number", onlyInt: true },
      { name: "contaminant_limits_tr", type: "text", required: true, max: 800 },
      { name: "exporter_action_tr", type: "text", required: true, max: 800 },
    ],
    indexes: [
      "CREATE UNIQUE INDEX idx_food_comm_slug ON food_export_commodities (commodity_slug)",
      "CREATE UNIQUE INDEX idx_food_comm_code ON food_export_commodities (product_code)",
    ],
  },
  {
    name: "eu_pesticide_mrls",
    type: "base",
    listRule: "",
    viewRule: "",
    createRule: null,
    updateRule: null,
    deleteRule: null,
    fields: [
      { name: "mrl_key", type: "text", required: true, max: 64 },
      { name: "commodity_slug", type: "text", required: true, max: 64 },
      { name: "product_code", type: "text", required: true, max: 16 },
      { name: "sante_product_id", type: "number", onlyInt: true },
      { name: "product_name_tr", type: "text", required: true, max: 180 },
      { name: "product_name_en", type: "text", required: true, max: 180 },
      { name: "sante_residue_id", type: "number", onlyInt: true },
      { name: "substance_slug", type: "text", required: true, max: 64 },
      { name: "substance_name", type: "text", required: true, max: 200 },
      { name: "eu_approval_status", type: "text", required: true, max: 80 },
      { name: "mrl_display", type: "text", required: true, max: 32 },
      { name: "mrl_mg_kg", type: "number" },
      { name: "is_loq_zero_tolerance", type: "bool" },
      { name: "regulation_number", type: "text", required: true, max: 120 },
      { name: "regulation_url", type: "text", required: true, max: 400 },
      { name: "application_date", type: "text", required: false, max: 40 },
      { name: "risk_note_tr", type: "text", required: true, max: 600 },
    ],
    indexes: [
      "CREATE UNIQUE INDEX idx_eu_mrl_key ON eu_pesticide_mrls (mrl_key)",
      "CREATE INDEX idx_eu_mrl_comm_sub ON eu_pesticide_mrls (commodity_slug, substance_slug)",
    ],
  },
  {
    name: "food_border_alerts",
    type: "base",
    listRule: "",
    viewRule: "",
    createRule: null,
    updateRule: null,
    deleteRule: null,
    fields: [
      { name: "alert_key", type: "text", required: true, max: 80 },
      { name: "source_system", type: "text", required: true, max: 64 },
      { name: "destination_market", type: "text", required: true, max: 120 },
      { name: "origin_country", type: "text", required: true, max: 80 },
      { name: "commodity_slug", type: "text", required: true, max: 64 },
      { name: "hazard_category", type: "text", required: true, max: 240 },
      { name: "severity", type: "text", required: true, max: 32 },
      { name: "typical_action", type: "text", required: true, max: 180 },
      { name: "summary_tr", type: "text", required: true, max: 800 },
      { name: "prevention_tr", type: "text", required: true, max: 800 },
    ],
    indexes: [
      "CREATE UNIQUE INDEX idx_food_alert_key ON food_border_alerts (alert_key)",
      "CREATE INDEX idx_food_alert_comm ON food_border_alerts (commodity_slug)",
    ],
  },
  // -------------------------------------------------------------------------
  // Modül 06: TAREKS (ÜGD Tebliğleri) & CE / E-Mark / ÜTS Sihirbazı (TR+EN+ZH)
  // -------------------------------------------------------------------------
  {
    name: "tareks_regulations",
    type: "base",
    listRule: "",
    viewRule: "",
    createRule: null,
    updateRule: null,
    deleteRule: null,
    fields: [
      { name: "ugd_code", type: "text", required: true, max: 32 },
      { name: "communique_no", type: "text", required: true, max: 80 },
      { name: "inspecting_authority", type: "text", required: true, max: 160 },
      { name: "eu_directives", type: "text", required: true, max: 300 },
      { name: "title_tr", type: "text", required: true, max: 240 },
      { name: "title_en", type: "text", required: true, max: 240 },
      { name: "title_zh", type: "text", required: true, max: 240 },
      { name: "mandatory_docs_tr", type: "text", required: true, max: 1000 },
      { name: "mandatory_docs_zh", type: "text", required: true, max: 1000 },
      { name: "eu_vs_non_eu_rule_tr", type: "text", required: true, max: 800 },
      { name: "exemptions_tr", type: "text", required: true, max: 800 },
    ],
    indexes: ["CREATE UNIQUE INDEX idx_tareks_reg_code ON tareks_regulations (ugd_code)"],
  },
  {
    name: "tareks_hs_mappings",
    type: "base",
    listRule: "",
    viewRule: "",
    createRule: null,
    updateRule: null,
    deleteRule: null,
    fields: [
      { name: "hs_prefix", type: "text", required: true, max: 24 },
      { name: "ugd_code", type: "text", required: true, max: 32 },
      { name: "product_tr", type: "text", required: true, max: 240 },
      { name: "product_en", type: "text", required: true, max: 240 },
      { name: "product_zh", type: "text", required: true, max: 240 },
      { name: "inspection_risk", type: "text", required: true, max: 32 },
      { name: "requires_sshyb", type: "bool" },
      { name: "standards", type: "text", required: true, max: 400 },
      { name: "factory_check_tr", type: "text", required: true, max: 1000 },
      { name: "factory_check_zh", type: "text", required: true, max: 1000 },
    ],
    indexes: [
      "CREATE UNIQUE INDEX idx_tareks_hs_prefix ON tareks_hs_mappings (hs_prefix)",
      "CREATE INDEX idx_tareks_hs_ugd ON tareks_hs_mappings (ugd_code, inspection_risk)",
    ],
  },
  // -------------------------------------------------------------------------
  // Modül 07: STA / Menşe Avantajı & Çin-Türkiye Tarife Arbitraj Radarı
  // -------------------------------------------------------------------------
  {
    name: "trade_agreements",
    type: "base",
    listRule: "",
    viewRule: "",
    createRule: null,
    updateRule: null,
    deleteRule: null,
    fields: [
      { name: "agreement_code", type: "text", required: true, max: 64 },
      { name: "partner_region", type: "text", required: true, max: 200 },
      { name: "iso_countries", type: "json", maxSize: 20000 },
      { name: "regime_type", type: "text", required: true, max: 40 },
      { name: "proof_document", type: "text", required: true, max: 200 },
      { name: "industrial_duty_pct", type: "number" },
      { name: "cumulation_system", type: "text", required: true, max: 200 },
      { name: "origin_rule_summary_tr", type: "text", required: true, max: 1000 },
      { name: "exporter_tip_tr", type: "text", required: true, max: 800 },
    ],
    indexes: ["CREATE UNIQUE INDEX idx_trade_agreement_code ON trade_agreements (agreement_code)"],
  },
  {
    name: "corridor_tariff_benchmarks",
    type: "base",
    listRule: "",
    viewRule: "",
    createRule: null,
    updateRule: null,
    deleteRule: null,
    fields: [
      { name: "benchmark_key", type: "text", required: true, max: 64 },
      { name: "commodity_code_10", type: "text", required: true, max: 16 },
      { name: "us_hts_code", type: "text", required: true, max: 24 },
      { name: "sector", type: "text", required: true, max: 40 },
      { name: "name_tr", type: "text", required: true, max: 240 },
      { name: "name_en", type: "text", required: true, max: 240 },
      { name: "eu_mfn_cn_duty_display", type: "text", required: true, max: 64 },
      { name: "eu_mfn_cn_duty_pct", type: "number" },
      { name: "eu_tr_duty_display", type: "text", required: true, max: 64 },
      { name: "eu_tr_duty_pct", type: "number" },
      { name: "eu_cn_has_antidumping", type: "bool" },
      { name: "eu_tr_has_antidumping", type: "bool" },
      { name: "uk_mfn_cn_duty_display", type: "text", required: true, max: 64 },
      { name: "uk_mfn_cn_duty_pct", type: "number" },
      { name: "uk_tr_fta_duty_display", type: "text", required: true, max: 64 },
      { name: "uk_tr_fta_duty_pct", type: "number" },
      { name: "us_mfn_tr_duty_display", type: "text", required: true, max: 64 },
      { name: "us_mfn_tr_duty_pct", type: "number" },
      { name: "us_cn_sec301_surcharge_pct", type: "number" },
      { name: "us_cn_effective_duty_pct", type: "number" },
      { name: "eu_required_doc", type: "text", required: true, max: 160 },
      { name: "uk_required_doc", type: "text", required: true, max: 160 },
      { name: "arbitrage_summary_tr", type: "text", required: true, max: 800 },
    ],
    indexes: [
      "CREATE UNIQUE INDEX idx_corridor_bench_key ON corridor_tariff_benchmarks (benchmark_key)",
      "CREATE INDEX idx_corridor_bench_code ON corridor_tariff_benchmarks (commodity_code_10, sector)",
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

const cbamSchedule = JSON.parse(readFileSync(join(ROOT, "04-eu-cbam/cbam_phase_schedule.json"), "utf8"));
const cbamGoods = JSON.parse(readFileSync(join(ROOT, "04-eu-cbam/cbam_goods.json"), "utf8"));

await syncRecords("cbam_phase_schedule", "calendar_year", cbamSchedule);
await syncRecords("cbam_goods", "cn_code", cbamGoods);

const foodCommodities = JSON.parse(readFileSync(join(ROOT, "05-food-mrl-rasff/food_export_commodities.json"), "utf8"));
const euMrls = JSON.parse(readFileSync(join(ROOT, "05-food-mrl-rasff/eu_pesticide_mrls.json"), "utf8"));
const foodAlerts = JSON.parse(readFileSync(join(ROOT, "05-food-mrl-rasff/food_border_alerts.json"), "utf8"));

await syncRecords("food_export_commodities", "commodity_slug", foodCommodities);
await syncRecords("eu_pesticide_mrls", "mrl_key", euMrls);
await syncRecords("food_border_alerts", "alert_key", foodAlerts);

const tareksRegs = JSON.parse(readFileSync(join(ROOT, "06-tareks-ce/tareks_regulations.json"), "utf8"));
const tareksHs = JSON.parse(readFileSync(join(ROOT, "06-tareks-ce/tareks_hs_mappings.json"), "utf8"));

await syncRecords("tareks_regulations", "ugd_code", tareksRegs);
await syncRecords("tareks_hs_mappings", "hs_prefix", tareksHs);

const tradeAgreements = JSON.parse(readFileSync(join(ROOT, "07-fta-tariff-corridors/trade_agreements.json"), "utf8"));
const corridorBenchmarks = JSON.parse(readFileSync(join(ROOT, "07-fta-tariff-corridors/corridor_tariff_benchmarks.json"), "utf8"));

await syncRecords("trade_agreements", "agreement_code", tradeAgreements);
await syncRecords("corridor_tariff_benchmarks", "benchmark_key", corridorBenchmarks);

console.log("\n🎉 PocketBase senkronizasyonu %100 başarıyla tamamlandı!");
