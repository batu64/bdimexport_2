# Bdimexport Doğrulanmış Veri Havuzu (`data-pool/`)

Bu dizin, `bdimexport.com` üzerindeki interaktif dış ticaret araçlarının **Git ile versiyonlanan, SHA-256 bütünlük kontrolünden geçmiş ve otomatik doğrulama testlerine (`verify-all.mjs`) tabi tutulan** ana veri havuzudur.

> **Kapsam Notu:** Küresel 12 haneli canlı bağlayıcı gümrük beyannamesi hesaplayıcısı (#9) hata/istisna riski nedeniyle kapsam dışı bırakılmıştır. Veri havuzu en kolay doğrulanabilenden en zora doğru **8 modülden** oluşur.

## Veritabanı Sıralaması ve Durum Tablosu (1 → 8)

| Modül Kodu | Veritabanı Adı | Resmi Veri Kaynağı | PocketBase Koleksiyonları | Durum |
| :--- | :--- | :--- | :--- | :--- |
| **`00-core`** | Veri Kaynağı Kayıt Defteri & Nitelikli Alarm/Lead Havuzu | Bdimexport İç Şema (KVKK Uyumlu) | `data_sources_registry`, `radar_subscriptions` | ✅ Hazır |
| **`01-container-aql`** | Konteyner / Avrupa TIR Doluluk & ISO 2859-1 AQL Numune | ISO 668, AB 96/53/EC, ISO 2859-1:1999 (Tablo 1 & 2-A) | `containers_specs`, `aql_lot_codes`, `aql_sampling_plans` | ✅ Doğrulandı |
| **`02-supplier-registry`** | Tedarikçi Sicil (Çin USCC, TR VKN, ISO 13616 IBAN) Kuralları | GB 32100-2015, Çin İdari Bölge Kodları, ISO 13616 | `cn_uscc_regions`, `supplier_registry_rules`, `iban_country_rules` | ✅ Doğrulandı |
| **`03-chemical-reach-cas`** | Kimyasal Yasak & SDS CAS Numarası Takipçisi | ECHA SVHC Aday Listesi, REACH Ek-17, RoHS, CA Prop 65 | `chemical_regulatory_lists`, `regulated_chemicals` | ✅ Doğrulandı |
| **`04-eu-cbam`** | AB CBAM (Sınırda Karbon) GTİP & Emisyon Katsayıları | AB Tüzüğü 2023/956 Ek-I + 2025/2083 + JRC Katsayıları | `cbam_phase_schedule`, `cbam_goods` | ✅ Doğrulandı |
| **`05-food-mrl-rasff`** | AB Pestisit MRL Limitleri & ABD FDA Sınır Reddi | AB DG SANTE Data Lake v3.0 JSON API + AB 2019/1793 + openFDA | `food_export_commodities`, `eu_pesticide_mrls`, `food_border_alerts` | ✅ Doğrulandı |
| **`06-tareks-ce`** | TAREKS (ÜGD Tebliğleri) & CE Belge Sihirbazı (TR + ZH) | T.C. Ticaret Bakanlığı ÜGD Tebliğleri (1..25) + TSE/BTK/TİTCK | `tareks_regulations`, `tareks_hs_mappings` | ✅ Doğrulandı |
| **`07-fta-tariff-corridors`** | STA / Menşe Avantajı & Çin-Türkiye Arbitraj Radarı | Canlı UK & XI (AB TARIC) API v2 + USITC HTS + TR STA Matrisi | `trade_agreements`, `corridor_tariff_benchmarks` | ✅ Doğrulandı |
| **`08-gtip-gazette-alerts`** | GTİP Resmi Gazete / EUR-Lex / ABD Değişiklik Alarm Motoru | Resmi Gazete, EUR-Lex RSS, US Federal Register API | `regulatory_alerts` (Admin Onay Kapılı) | ⏳ Sıradaki (Adım 8) |
