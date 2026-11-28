// Veritabanı #2 Üretici: Tedarikçi Sicil, Vergi & Ödeme Dolandırıcılığı Ön-Tarama Kuralları
// Kaynaklar: Çin GB 32100-2015 (18 Hane USCC) + GB/T 2260 İdari Kodlar, GİB VKN Mod-10, AB VIES, ISO 13616 IBAN Registry (SWIFT)
import { createHash } from "node:crypto";
import { mkdirSync, readFileSync, writeFileSync, existsSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const OUT_DIR = join(ROOT, "02-supplier-registry");
mkdirSync(OUT_DIR, { recursive: true });

// ---------------------------------------------------------------------------
// Yardımcı: ISO 7064 Mod 97-10 ile herhangi bir ülke + BBAN gövdesi için %100 geçerli
// kontrol basamaklı (Check Digits) örnek IBAN üretici
// ---------------------------------------------------------------------------
function makeValidIban(countryCode, bban) {
  const cleanBban = bban.replace(/\s+/g, "").toUpperCase();
  const rearranged = cleanBban + countryCode.toUpperCase() + "00";
  let numericStr = "";
  for (const ch of rearranged) {
    const code = ch.charCodeAt(0);
    if (code >= 65 && code <= 90) {
      numericStr += String(code - 55); // A=10 .. Z=35
    } else {
      numericStr += ch;
    }
  }
  const mod = Number(BigInt(numericStr) % 97n);
  const check = String(98 - mod).padStart(2, "0");
  return `${countryCode.toUpperCase()}${check}${cleanBban}`;
}

// Yardımcı: GB 32100-2015 Mod-31 ile 17 haneli gövdeden 18. kontrol karakterini hesaplar
const USCC_ALPHABET = "0123456789ABCDEFGHJKLMNPQRTUWXY";
const USCC_WEIGHTS = [1, 3, 9, 27, 19, 26, 16, 17, 20, 29, 25, 13, 8, 24, 10, 30, 28];
function makeValidUscc(prefix17) {
  let sum = 0;
  for (let i = 0; i < 17; i++) {
    const idx = USCC_ALPHABET.indexOf(prefix17[i]);
    if (idx < 0) throw new Error(`Invalid USCC char at ${i}: ${prefix17[i]}`);
    sum += idx * USCC_WEIGHTS[i];
  }
  const rem = (31 - (sum % 31)) % 31;
  return prefix17 + USCC_ALPHABET[rem];
}

// Yardımcı: GİB VKN Mod-10 ile 9 haneli gövdeden 10. kontrol basamağını hesaplar
function makeValidTrVkn(digits9) {
  let sum = 0;
  for (let i = 0; i < 9; i++) {
    const d = Number(digits9[i]);
    const v = (d + (9 - i)) % 10;
    let p = (v * Math.pow(2, 9 - i)) % 9;
    if (v !== 0 && p === 0) p = 9;
    sum += p;
  }
  const check = (10 - (sum % 10)) % 10;
  return digits9 + String(check);
}

// ---------------------------------------------------------------------------
// 2A. Çin GB/T 2260 Eyalet (34 İl) + Kritik İhracat / Sanayi Şehirleri (50 Merkez) = 84 Kayıt
// USCC'nin 3-8. haneleri (ör. 91[4406]...) firmanın gerçek tescil yerini ele verir.
// ---------------------------------------------------------------------------
const cnUsccRegions = [
  // 34 Eyalet / Doğrudan Yönetilen Belediye / Özerk Bölge (2 haneli üst kodlar)
  { region_code: "11", level: "province", parent_code: "", name_zh: "北京市", name_en: "Beijing Municipality", name_tr: "Pekin Belediyesi", industrial_clusters_tr: "Merkez ofisler, devlet dış ticaret kurumları, yüksek teknoloji Ar-Ge", industrial_clusters_en: "State trading HQs, high-tech R&D, electronics", trading_intermediary_risk: "high" },
  { region_code: "12", level: "province", parent_code: "", name_zh: "天津市", name_en: "Tianjin Municipality", name_tr: "Tianjin Belediyesi", industrial_clusters_tr: "Kuzey Çin ana limanı, çelik boru, bisiklet, kimya, makine", industrial_clusters_en: "Northern port hub, steel pipes, bicycles, chemicals, machinery", trading_intermediary_risk: "medium" },
  { region_code: "13", level: "province", parent_code: "", name_zh: "河北省", name_en: "Hebei Province", name_tr: "Hebei Eyaleti", industrial_clusters_tr: "Demir-çelik, tel örgü, boru bağlantı elemanları, vana, tekstil, deri", industrial_clusters_en: "Iron & steel, wire mesh, pipe fittings, valves, leather", trading_intermediary_risk: "low" },
  { region_code: "14", level: "province", parent_code: "", name_zh: "山西省", name_en: "Shanxi Province", name_tr: "Shanxi Eyaleti", industrial_clusters_tr: "Kömür kimyası, döküm, flanş, ağır metalurji, cam eşya", industrial_clusters_en: "Coal chemicals, forged flanges, heavy metallurgy, glassware", trading_intermediary_risk: "low" },
  { region_code: "15", level: "province", parent_code: "", name_zh: "内蒙古自治区", name_en: "Inner Mongolia", name_tr: "İç Moğolistan Özerk Bölgesi", industrial_clusters_tr: "Nadir toprak elementleri, kaşmir/yün, ferrosilikon, PVC hammaddesi", industrial_clusters_en: "Rare earths, cashmere/wool, ferrosilicon, PVC resin", trading_intermediary_risk: "low" },
  { region_code: "21", level: "province", parent_code: "", name_zh: "辽宁省", name_en: "Liaoning Province", name_tr: "Liaoning Eyaleti", industrial_clusters_tr: "Ağır makine, CNC takım tezgahları, rulman, gemi yan sanayi, kimya", industrial_clusters_en: "Heavy machinery, CNC machine tools, bearings, marine equipment", trading_intermediary_risk: "low" },
  { region_code: "22", level: "province", parent_code: "", name_zh: "吉林省", name_en: "Jilin Province", name_tr: "Jilin Eyaleti", industrial_clusters_tr: "Otomotiv yan sanayi, vagon, ahşap/kontrplak, tarım ürünleri", industrial_clusters_en: "Automotive parts, rail equipment, plywood/timber, agro products", trading_intermediary_risk: "low" },
  { region_code: "23", level: "province", parent_code: "", name_zh: "黑龙江省", name_en: "Heilongjiang Province", name_tr: "Heilongjiang Eyaleti", industrial_clusters_tr: "Kereste, tarım makineleri, petrokimya, tahıl işleme", industrial_clusters_en: "Timber, agricultural machinery, petrochemicals", trading_intermediary_risk: "low" },
  { region_code: "31", level: "province", parent_code: "", name_zh: "上海市", name_en: "Shanghai Municipality", name_tr: "Şanghay Belediyesi", industrial_clusters_tr: "Uluslararası dış ticaret şirketleri (aracı yoğun!), otomotiv, yarı iletken, ilaç", industrial_clusters_en: "International trading companies (high intermediary density), automotive, pharma", trading_intermediary_risk: "high" },
  { region_code: "32", level: "province", parent_code: "", name_zh: "江苏省", name_en: "Jiangsu Province", name_tr: "Jiangsu Eyaleti", industrial_clusters_tr: "Güneş paneli, CNC makine, tekstil/ev tekstili, elektronik, kimya, çelik", industrial_clusters_en: "Solar PV, CNC machinery, home textiles, electronics, chemicals, specialty steel", trading_intermediary_risk: "low" },
  { region_code: "33", level: "province", parent_code: "", name_zh: "浙江省", name_en: "Zhejiang Province", name_tr: "Zhejiang Eyaleti", industrial_clusters_tr: "Hırdavat, küçük ev aletleri, elektrik şalt, tekstil, vana, tüketim malları", industrial_clusters_en: "Hardware, small appliances, low-voltage electricals, textiles, consumer goods", trading_intermediary_risk: "medium" },
  { region_code: "34", level: "province", parent_code: "", name_zh: "安徽省", name_en: "Anhui Province", name_tr: "Anhui Eyaleti", industrial_clusters_tr: "Beyaz eşya, elektrikli araç (EV), güneş camı, forklift, ambalaj", industrial_clusters_en: "White goods, EVs & batteries, forklifts, solar glass, packaging", trading_intermediary_risk: "low" },
  { region_code: "35", level: "province", parent_code: "", name_zh: "福建省", name_en: "Fujian Province", name_tr: "Fujian Eyaleti", industrial_clusters_tr: "Ayakkabı, spor giyim, sıhhi tesisat/batarya, doğal taş/granit, lityum batarya", industrial_clusters_en: "Footwear, sportswear, sanitaryware, stone/granite, lithium batteries", trading_intermediary_risk: "medium" },
  { region_code: "36", level: "province", parent_code: "", name_zh: "江西省", name_en: "Jiangxi Province", name_tr: "Jiangxi Eyaleti", industrial_clusters_tr: "Bakır işleme, seramik (Jingdezhen), mobilya (Ganzhou), nadir toprak, güneş enerjisi", industrial_clusters_en: "Copper processing, ceramics, solid-wood furniture, solar components", trading_intermediary_risk: "low" },
  { region_code: "37", level: "province", parent_code: "", name_zh: "山东省", name_en: "Shandong Province", name_tr: "Shandong Eyaleti", industrial_clusters_tr: "Lastik, tarım/iş makineleri, kontrplak/MDF, kimya, cam, gıda işleme", industrial_clusters_en: "Tires, construction/agro machinery, plywood/MDF, chemicals, glass, food", trading_intermediary_risk: "low" },
  { region_code: "41", level: "province", parent_code: "", name_zh: "河南省", name_en: "Henan Province", name_tr: "Henan Eyaleti", industrial_clusters_tr: "Alüminyum levha/folyo, vinç/kaldırma ekipmanı, refrakter, kablo, gıda", industrial_clusters_en: "Aluminum sheet/foil, overhead cranes, refractories, cables", trading_intermediary_risk: "low" },
  { region_code: "42", level: "province", parent_code: "", name_zh: "湖北省", name_en: "Hubei Province", name_tr: "Hubei Eyaleti", industrial_clusters_tr: "Fiber optik/lazer ekipmanı, otomotiv, nonwoven medikal tekstil, fosfor kimyası", industrial_clusters_en: "Fiber optics/laser machines, automotive, nonwoven medical disposables", trading_intermediary_risk: "low" },
  { region_code: "43", level: "province", parent_code: "", name_zh: "湖南省", name_en: "Hunan Province", name_tr: "Hunan Eyaleti", industrial_clusters_tr: "Ağır iş makineleri (beton pompası/ekskavatör), demiryolu, seramik, çakmak", industrial_clusters_en: "Heavy construction machinery, rail transit, ceramics", trading_intermediary_risk: "low" },
  { region_code: "44", level: "province", parent_code: "", name_zh: "广东省", name_en: "Guangdong Province", name_tr: "Guangdong Eyaleti", industrial_clusters_tr: "Tüketici elektroniği, LED aydınlatma, mobilya, seramik, plastik/kalıp, oyuncak", industrial_clusters_en: "Consumer electronics, LED lighting, furniture, ceramics, injection molds, toys", trading_intermediary_risk: "medium" },
  { region_code: "45", level: "province", parent_code: "", name_zh: "广西壮族自治区", name_en: "Guangxi Region", name_tr: "Guangxi Özerk Bölgesi", industrial_clusters_tr: "Okaliptüs kontrplak, alümina, otomotiv, şeker ve tropikal gıda", industrial_clusters_en: "Eucalyptus plywood, alumina, commercial vehicles, agro", trading_intermediary_risk: "low" },
  { region_code: "46", level: "province", parent_code: "", name_zh: "海南省", name_en: "Hainan Province", name_tr: "Hainan Serbest Ticaret Limanı", industrial_clusters_tr: "Serbest ticaret limanı aracı şirketleri (üretim az, ticaret ofisi yoğun!)", industrial_clusters_en: "Free Trade Port holding/trading entities (low heavy manufacturing)", trading_intermediary_risk: "high" },
  { region_code: "50", level: "province", parent_code: "", name_zh: "重庆市", name_en: "Chongqing Municipality", name_tr: "Chongqing Belediyesi", industrial_clusters_tr: "Dizüstü bilgisayar/elektronik, motosiklet, jeneratör, otomotiv", industrial_clusters_en: "Laptops/electronics OEM, motorcycles, gasoline generators, automotive", trading_intermediary_risk: "low" },
  { region_code: "51", level: "province", parent_code: "", name_zh: "四川省", name_en: "Sichuan Province", name_tr: "Sichuan Eyaleti", industrial_clusters_tr: "Titanyum/vanadyum, lityum kimyasalları, elektronik, ayakkabı, gıda bileşenleri", industrial_clusters_en: "Titanium, lithium chemicals, electronics, footwear", trading_intermediary_risk: "low" },
  { region_code: "52", level: "province", parent_code: "", name_zh: "贵州省", name_en: "Guizhou Province", name_tr: "Guizhou Eyaleti", industrial_clusters_tr: "Fosfat gübre ve kimyasalları, batarya anot malzemeleri, alüminyum", industrial_clusters_en: "Phosphate chemicals, battery materials, aluminum", trading_intermediary_risk: "low" },
  { region_code: "53", level: "province", parent_code: "", name_zh: "云南省", name_en: "Yunnan Province", name_tr: "Yunnan Eyaleti", industrial_clusters_tr: "Bakır/kalay/çinko metalurji, fosfor, yeşil silikon, kahve/baharat", industrial_clusters_en: "Non-ferrous metals (tin/copper/zinc), green silicon, spices", trading_intermediary_risk: "low" },
  { region_code: "54", level: "province", parent_code: "", name_zh: "西藏自治区", name_en: "Tibet Region", name_tr: "Tibet Özerk Bölgesi", industrial_clusters_tr: "Ağır sanayi ihracatı neredeyse yoktur; buradan fabrika iddiası yüksek şüphelidir", industrial_clusters_en: "Minimal industrial export manufacturing; verify factory claim carefully", trading_intermediary_risk: "high" },
  { region_code: "61", level: "province", parent_code: "", name_zh: "陕西省", name_en: "Shaanxi Province", name_tr: "Shaanxi Eyaleti", industrial_clusters_tr: "Titanyum alaşımları (Baoji), ağır kamyon, güneş paneli, havacılık parçaları", industrial_clusters_en: "Titanium alloys (Baoji), heavy trucks, solar wafers, industrial instruments", trading_intermediary_risk: "low" },
  { region_code: "62", level: "province", parent_code: "", name_zh: "甘肃省", name_en: "Gansu Province", name_tr: "Gansu Eyaleti", industrial_clusters_tr: "Nikel/kobalt metalurji, petrokimya, tohum ve kuru tarım ürünleri", industrial_clusters_en: "Nickel/cobalt metallurgy, petrochemicals", trading_intermediary_risk: "low" },
  { region_code: "63", level: "province", parent_code: "", name_zh: "青海省", name_en: "Qinghai Province", name_tr: "Qinghai Eyaleti", industrial_clusters_tr: "Lityum karbonat, potasyum tuzları, polisilikon", industrial_clusters_en: "Lithium carbonate, potash, polysilicon", trading_intermediary_risk: "low" },
  { region_code: "64", level: "province", parent_code: "", name_zh: "宁夏回族自治区", name_en: "Ningxia Region", name_tr: "Ningxia Özerk Bölgesi", industrial_clusters_tr: "Aktif karbon, dicyandiamide, ferrosilikon, kaşmir", industrial_clusters_en: "Activated carbon, ferroalloys, chemical intermediates", trading_intermediary_risk: "low" },
  { region_code: "65", level: "province", parent_code: "", name_zh: "新疆维吾尔自治区", name_en: "Xinjiang Region", name_tr: "Sincan Uygur Özerk Bölgesi", industrial_clusters_tr: "ABD/AB tedarik zincirinde UFLPA ve zorla çalıştırma gümrük alıkoyma riski!", industrial_clusters_en: "CRITICAL COMPLIANCE ALERT: US UFLPA & EU forced-labor customs detention risk!", trading_intermediary_risk: "high" },
  { region_code: "71", level: "province", parent_code: "", name_zh: "台湾省", name_en: "Taiwan", name_tr: "Tayvan (Ayrı Sicil Sistemi)", industrial_clusters_tr: "Tayvan kendi 8 haneli GUI vergi numarasını kullanır", industrial_clusters_en: "Uses 8-digit Taiwan GUI number rather than Mainland USCC", trading_intermediary_risk: "medium" },
  { region_code: "81", level: "province", parent_code: "", name_zh: "香港特别行政区", name_en: "Hong Kong SAR", name_tr: "Hong Kong ÖİB (Offshore Ticaret)", industrial_clusters_tr: "Hong Kong BRN (8 hane) kullanır; anakara fabrikalarının offshore fatura merkezidir", industrial_clusters_en: "Uses 8-digit HK BRN; common offshore invoicing entity for Mainland exporters", trading_intermediary_risk: "high" },
  { region_code: "82", level: "province", parent_code: "", name_zh: "澳门特别行政区", name_en: "Macau SAR", name_tr: "Makao ÖİB", industrial_clusters_tr: "Ticaret ve hizmet ofisleri; sanayi üretimi çok sınırlıdır", industrial_clusters_en: "Commercial/trading services; minimal industrial manufacturing", trading_intermediary_risk: "high" },

  // 50 Kritik Üretim & İhracat Şehri / Bölgesi (4 ve 6 haneli kodlar)
  { region_code: "4401", level: "city", parent_code: "44", name_zh: "广州市", name_en: "Guangzhou", name_tr: "Guangzhou (Kanton)", industrial_clusters_tr: "Konfeksiyon, kozmetik, deri/çanta, oto yedek parça + dış ticaret acenteleri", industrial_clusters_en: "Apparel, cosmetics, leather goods, auto parts & export trading houses", trading_intermediary_risk: "medium" },
  { region_code: "4403", level: "city", parent_code: "44", name_zh: "深圳市", name_en: "Shenzhen", name_tr: "Shenzhen", industrial_clusters_tr: "Elektronik, PCB, batarya, medikal cihaz + Huaqiangbei aracı ticaret şirketleri", industrial_clusters_en: "Electronics, PCBs, energy storage, medical devices & trading exporters", trading_intermediary_risk: "medium" },
  { region_code: "4404", level: "city", parent_code: "44", name_zh: "珠海市", name_en: "Zhuhai", name_tr: "Zhuhai", industrial_clusters_tr: "Yazıcı sarf malzemeleri, klima, tıbbi cihazlar, yat/kompozit", industrial_clusters_en: "Printer consumables, HVAC, medical devices", trading_intermediary_risk: "low" },
  { region_code: "4405", level: "city", parent_code: "44", name_zh: "汕头市", name_en: "Shantou", name_tr: "Shantou (Chenghai)", industrial_clusters_tr: "Dünya plastik oyuncak üretimi merkezi (Chenghai), iç giyim, ambalaj makineleri", industrial_clusters_en: "Global plastic toys hub (Chenghai), knitwear/lingerie, packaging machinery", trading_intermediary_risk: "low" },
  { region_code: "4406", level: "city", parent_code: "44", name_zh: "佛山市", name_en: "Foshan", name_tr: "Foshan", industrial_clusters_tr: "Mobilya (Shunde/Lecong), seramik karo, alüminyum profil, paslanmaz çelik", industrial_clusters_en: "Furniture (Shunde), ceramic tiles, aluminum extrusions, stainless steel", trading_intermediary_risk: "low" },
  { region_code: "4407", level: "city", parent_code: "44", name_zh: "江门市", name_en: "Jiangmen", name_tr: "Jiangmen", industrial_clusters_tr: "Paslanmaz çelik mutfak eşyası, sıhhi tesisat armatürü, motosiklet, LED", industrial_clusters_en: "Stainless kitchenware, plumbing faucets, motorcycles, LED", trading_intermediary_risk: "low" },
  { region_code: "4412", level: "city", parent_code: "44", name_zh: "肇庆市", name_en: "Zhaoqing", name_tr: "Zhaoqing (Gaoyao)", industrial_clusters_tr: "Kapı/pencere aksesuarları, menteşe, alüminyum döküm parça", industrial_clusters_en: "Architectural door/window hardware, hinges, die-casting", trading_intermediary_risk: "low" },
  { region_code: "4413", level: "city", parent_code: "44", name_zh: "惠州市", name_en: "Huizhou", name_tr: "Huizhou", industrial_clusters_tr: "Lityum batarya, ekran/elektronik montaj, ayakkabı, petrokimya", industrial_clusters_en: "Lithium batteries, display/electronics OEM, footwear", trading_intermediary_risk: "low" },
  { region_code: "4419", level: "city", parent_code: "44", name_zh: "东莞市", name_en: "Dongguan", name_tr: "Dongguan", industrial_clusters_tr: "Hassas enjeksiyon kalıp, CNC işleme, elektronik aksesuar, mobilya, tekstil", industrial_clusters_en: "Precision injection molding, CNC machining, consumer electronics OEM, furniture", trading_intermediary_risk: "low" },
  { region_code: "4420", level: "city", parent_code: "44", name_zh: "中山市", name_en: "中山 (Zhongshan / Guzhen)", name_tr: "Zhongshan (Guzhen)", industrial_clusters_tr: "Dünya aydınlatma başkenti (Guzhen), kilit/donanım (Xiaolan), küçük ev aletleri", industrial_clusters_en: "Global lighting hub (Guzhen), locks/hardware (Xiaolan), home appliances", trading_intermediary_risk: "low" },
  { region_code: "4451", level: "city", parent_code: "44", name_zh: "潮州市", name_en: "Chaozhou", name_tr: "Chaozhou", industrial_clusters_tr: "Seramik klozet/lavabo (vitrifiye), porselen sofra takımı, paslanmaz eşya", industrial_clusters_en: "Sanitaryware ceramics, porcelain tableware, stainless cookware", trading_intermediary_risk: "low" },
  { region_code: "4452", level: "city", parent_code: "44", name_zh: "揭阳市", name_en: "Jieyang", name_tr: "Jieyang", industrial_clusters_tr: "Çatal-kaşık-bıçak takımı, çekmece rayı/menteşe, plastik ev gereçleri", industrial_clusters_en: "Stainless cutlery, drawer slides/hinges, plastic housewares", trading_intermediary_risk: "low" },

  { region_code: "3301", level: "city", parent_code: "33", name_zh: "杭州市", name_en: "Hangzhou", name_tr: "Hangzhou", industrial_clusters_tr: "Güvenlik kamerası/IoT, e-ticaret tedarik şirketleri, tekstil, asansör parçaları", industrial_clusters_en: "CCTV/IoT hardware, e-commerce sourcing firms, textiles", trading_intermediary_risk: "medium" },
  { region_code: "3302", level: "city", parent_code: "33", name_zh: "宁波市", name_en: "Ningbo", name_tr: "Ningbo", industrial_clusters_tr: "Küçük ev aletleri (Cixi), enjeksiyon makineleri, bağlantı elemanları, kırtasiye + büyük dış ticaret firmaları", industrial_clusters_en: "Home appliances (Cixi), plastic machinery, fasteners, stationery & major trading firms", trading_intermediary_risk: "medium" },
  { region_code: "3303", level: "city", parent_code: "33", name_zh: "温州市", name_en: "Wenzhou", name_tr: "Wenzhou (Yueqing)", industrial_clusters_tr: "Alçak gerilim elektrik/şalt (Yueqing), endüstriyel vana/pompa, ayakkabı, gözlük", industrial_clusters_en: "Low-voltage switchgear (Yueqing), industrial valves/pumps, footwear, eyewear", trading_intermediary_risk: "low" },
  { region_code: "3304", level: "city", parent_code: "33", name_zh: "嘉兴市", name_en: "Jiaxing", name_tr: "Jiaxing (Haining/Tongxiang)", industrial_clusters_tr: "Kazak/örme tekstil, deri, bağlantı elemanı (Haiyan), entegre tavan, fotovoltaik", industrial_clusters_en: "Knitwear, fasteners (Haiyan), synthetic leather, solar modules", trading_intermediary_risk: "low" },
  { region_code: "3305", level: "city", parent_code: "33", name_zh: "湖州市", name_en: "Huzhou (Anji)", name_tr: "Huzhou (Anji)", industrial_clusters_tr: "Ofis ve oyuncu koltukları (Anji dünya merkezi!), bambu/WPC zemin kaplama, akü", industrial_clusters_en: "Office & gaming chairs hub (Anji), WPC/bamboo flooring, batteries", trading_intermediary_risk: "low" },
  { region_code: "3306", level: "city", parent_code: "33", name_zh: "绍兴市", name_en: "Shaoxing (Keqiao)", name_tr: "Shaoxing (Keqiao)", industrial_clusters_tr: "Dünyanın en büyük kumaş/tekstil boya-baskı merkezi (Keqiao), çorap (Zhuji), bakır boru", industrial_clusters_en: "Global textile fabric & dyeing hub (Keqiao), hosiery (Zhuji), HVAC brass valves", trading_intermediary_risk: "low" },
  { region_code: "3307", level: "city", parent_code: "33", name_zh: "金华市", name_en: "Jinhua (Yongkang)", name_tr: "Jinhua (Yongkang)", industrial_clusters_tr: "Elektrikli el aletleri, çelik kapı, termos/matara (Yongkang), küçük emtia", industrial_clusters_en: "Power tools, security doors, insulated drinkware (Yongkang)", trading_intermediary_risk: "medium" },
  { region_code: "330782", level: "district", parent_code: "3307", name_zh: "义乌市", name_en: "Yiwu City", name_tr: "Yiwu (Küçük Emtia Ticaret Merkezi)", industrial_clusters_tr: "DİKKAT: %85+ aracı ticaret şirketi (Trading Co.) bölgesidir! Ağır sanayi/makine fabrikası iddiası mutlaka yerinde doğrulanmalı!", industrial_clusters_en: "HIGH INTERMEDIARY ALERT: >85% trading companies & market agents; verify any heavy-factory claim on-site!", trading_intermediary_risk: "high" },
  { region_code: "3310", level: "city", parent_code: "33", name_zh: "台州市", name_en: "Taizhou (Zhejiang)", name_tr: "Taizhou (Huangyan/Yuhuan)", industrial_clusters_tr: "Plastik kalıp ve ev eşyası (Huangyan), su pompası, pirinç vana/oto parça (Yuhuan)", industrial_clusters_en: "Plastic molds (Huangyan), water pumps (Wenling), brass valves & auto parts (Yuhuan)", trading_intermediary_risk: "low" },

  { region_code: "3201", level: "city", parent_code: "32", name_zh: "南京市", name_en: "Nanjing", name_tr: "Nanjing", industrial_clusters_tr: "Şebeke/güç elektroniği, petrokimya, otomotiv, yazılım ve dış ticaret grupları", industrial_clusters_en: "Power grid equipment, petrochemicals, automotive", trading_intermediary_risk: "medium" },
  { region_code: "3202", level: "city", parent_code: "32", name_zh: "无锡市", name_en: "Wuxi", name_tr: "Wuxi", industrial_clusters_tr: "Paslanmaz çelik merkezi, elektrikli scooter, tekstil makineleri, yarı iletken", industrial_clusters_en: "Stainless steel trading/processing hub, e-scooters, textile machinery", trading_intermediary_risk: "low" },
  { region_code: "3203", level: "city", parent_code: "32", name_zh: "徐州市", name_en: "Xuzhou", name_tr: "Xuzhou", industrial_clusters_tr: "Ağır iş makineleri (XCMG), cam şişe/kavanoz, güneş enerjisi, çelik yapı", industrial_clusters_en: "Heavy construction machinery, glass bottles/jars, steel space-frames", trading_intermediary_risk: "low" },
  { region_code: "3204", level: "city", parent_code: "32", name_zh: "常州市", name_en: "Changzhou", name_tr: "Changzhou", industrial_clusters_tr: "Laminat parke, güneş paneli/batarya, dizel motor, tarım makineleri, step motor", industrial_clusters_en: "Laminate flooring, EV batteries/solar, diesel engines, stepper motors", trading_intermediary_risk: "low" },
  { region_code: "3205", level: "city", parent_code: "32", name_zh: "苏州市", name_en: "Suzhou (Kunshan/Zhangjiagang)", name_tr: "Suzhou", industrial_clusters_tr: "Hassas elektronik/otomasyon, asansör, temiz oda ekipmanı, ipek/fonksiyonel kumaş, plastik geri dönüşüm makinesi (Zhangjiagang)", industrial_clusters_en: "Precision automation, elevators, cleanroom gear, functional textiles, plastic extrusion machinery (Zhangjiagang)", trading_intermediary_risk: "low" },
  { region_code: "3206", level: "city", parent_code: "32", name_zh: "南通市", name_en: "Nantong", name_tr: "Nantong", industrial_clusters_tr: "Ev tekstili (nevresim/otel tekstili), fitness/dambıl ekipmanı, denizcilik/vinç", industrial_clusters_en: "Home & hotel textiles hub, gym/fitness weights, marine offshore equipment", trading_intermediary_risk: "low" },
  { region_code: "3210", level: "city", parent_code: "32", name_zh: "扬州市", name_en: "Yangzhou", name_tr: "Yangzhou", industrial_clusters_tr: "Otel buklet malzemeleri/diş fırçası, güneşli sokak direkleri, peluş oyuncak", industrial_clusters_en: "Hotel amenities/toothbrushes, solar street light poles, plush toys", trading_intermediary_risk: "low" },
  { region_code: "3211", level: "city", parent_code: "32", name_zh: "镇江市", name_en: "Zhenjiang (Danyang)", name_tr: "Zhenjiang (Danyang)", industrial_clusters_tr: "Optik gözlük camı (Danyang dünya merkezi), matkap ucu/kesici takım, oto far/tampon", industrial_clusters_en: "Optical lenses (Danyang), HSS drill bits/saw blades, aftermarket auto body parts", trading_intermediary_risk: "low" },
  { region_code: "3212", level: "city", parent_code: "32", name_zh: "泰州市", name_en: "Taizhou (Jiangsu)", name_tr: "Taizhou (Xinghua)", industrial_clusters_tr: "Paslanmaz çelik halat/profil (Xinghua), ilaç/medikal, jeneratör", industrial_clusters_en: "Stainless steel wire/profiles (Xinghua), pharma, generators", trading_intermediary_risk: "low" },

  { region_code: "3701", level: "city", parent_code: "37", name_zh: "济南市", name_en: "Jinan", name_tr: "Jinan", industrial_clusters_tr: "Fiber lazer kesim/CNC router makineleri (dikkat: montaj atölyesi vs gerçek fabrika ayrımı kritik!), ağır kamyon", industrial_clusters_en: "Fiber laser cutters & CNC routers (high assembly-workshop variance — audit recommended!), heavy trucks", trading_intermediary_risk: "medium" },
  { region_code: "3702", level: "city", parent_code: "37", name_zh: "青岛市", name_en: "Qingdao", name_tr: "Qingdao", industrial_clusters_tr: "Beyaz eşya, lastik, kauçuk konveyör bant, deniz ürünleri/gıda, tekstil makineleri", industrial_clusters_en: "White goods, tires/rubber belts, agro/seafood processing, textile machinery", trading_intermediary_risk: "medium" },
  { region_code: "3703", level: "city", parent_code: "37", name_zh: "淄博市", name_en: "Zibo", name_tr: "Zibo", industrial_clusters_tr: "Endüstriyel seramik, cam kavanoz/şişe, kimyasal hammaddeler, refrakter", industrial_clusters_en: "Industrial ceramics, glassware, chemical intermediates, refractories", trading_intermediary_risk: "low" },
  { region_code: "3705", level: "city", parent_code: "37", name_zh: "东营市", name_en: "Dongying", name_tr: "Dongying", industrial_clusters_tr: "Kamyon/binek oto lastiği (Guangrao), petrol sondaj ekipmanı, fren balatası", industrial_clusters_en: "radial truck/PCR tires hub (Guangrao), oilfield drilling equipment, brake pads", trading_intermediary_risk: "low" },
  { region_code: "3706", level: "city", parent_code: "37", name_zh: "烟台市", name_en: "Yantai", name_tr: "Yantai", industrial_clusters_tr: "Poliüretan/MDI kimya, fren diski, soğutma sistemleri, elma/gıda işleme", industrial_clusters_en: "Polyurethane chemicals, brake rotors, industrial refrigeration, food", trading_intermediary_risk: "low" },
  { region_code: "3707", level: "city", parent_code: "37", name_zh: "潍坊市", name_en: "Weifang", name_tr: "Weifang", industrial_clusters_tr: "Dizel motor/traktör, tarım serası, PVC hortum, tekstil, kimyasal tuz/brom", industrial_clusters_en: "Diesel engines, tractors, PVC hoses, bromine chemicals, textiles", trading_intermediary_risk: "low" },
  { region_code: "3708", level: "city", parent_code: "37", name_zh: "济宁市", name_en: "Jining", name_tr: "Jining", industrial_clusters_tr: "Mini ekskavatör/yol silindiri, sarımsak/tarım ihracatı (Jinxiang)", industrial_clusters_en: "Mini excavators/road rollers, garlic export hub (Jinxiang)", trading_intermediary_risk: "low" },
  { region_code: "3713", level: "city", parent_code: "37", name_zh: "临沂市", name_en: "Linyi", name_tr: "Linyi", industrial_clusters_tr: "Kontrplak (film kaplı kalıplık plywood), WPC duvar paneli, el arabası/nalburiye", industrial_clusters_en: "Film-faced plywood & MDF hub, WPC wall panels, wheelbarrows/hardware", trading_intermediary_risk: "low" },
  { region_code: "3715", level: "city", parent_code: "37", name_zh: "聊城市", name_en: "Liaocheng (Linqing)", name_tr: "Liaocheng (Linqing)", industrial_clusters_tr: "Rulman (Linqing), dikişsiz çelik boru, otoyol korkuluğu", industrial_clusters_en: "Bearings (Linqing), seamless steel pipes, highway guardrails", trading_intermediary_risk: "low" },

  { region_code: "3501", level: "city", parent_code: "35", name_zh: "福州市", name_en: "Fuzhou", name_tr: "Fuzhou", industrial_clusters_tr: "Dantel/sentetik kumaş (Changle), otomotiv camı, elektrik motoru/jeneratör", industrial_clusters_en: "Warp-knitted lace/synthetics, automotive glass, electric motors", trading_intermediary_risk: "medium" },
  { region_code: "3502", level: "city", parent_code: "35", name_zh: "厦门市", name_en: "Xiamen", name_tr: "Xiamen", industrial_clusters_tr: "Güneş montaj konstrüksiyonu, LED, taş ihracat acenteleri, banyo aksesuarları", industrial_clusters_en: "Solar mounting racking, stone trading houses, sanitary fittings, electronics", trading_intermediary_risk: "medium" },
  { region_code: "3505", level: "city", parent_code: "35", name_zh: "泉州市", name_en: "Quanzhou (Jinjiang/Nan'an)", name_tr: "Quanzhou", industrial_clusters_tr: "Spor ayakkabı (Jinjiang), taş/mermer işleme ve musluk/vana (Nan'an), telsiz", industrial_clusters_en: "Athletic footwear (Jinjiang), stone processing & faucets (Nan'an), walkie-talkies", trading_intermediary_risk: "low" },
  { region_code: "3506", level: "city", parent_code: "35", name_zh: "漳州市", name_en: "Zhangzhou", name_tr: "Zhangzhou", industrial_clusters_tr: "Duvar saati, konserve gıda, metal borulu mobilya, elektronik tartı", industrial_clusters_en: "Clocks/watches, canned foods, metal-tube furniture", trading_intermediary_risk: "low" },

  { region_code: "1301", level: "city", parent_code: "13", name_zh: "石家庄市", name_en: "Shijiazhuang", name_tr: "Shijiazhuang", industrial_clusters_tr: "İlaç/vitamin hammaddesi, çamur pompası, tekstil, kimyasal HPMC/selüloz eter", industrial_clusters_en: "APIs/vitamins, slurry pumps, HPMC construction chemicals, textiles", trading_intermediary_risk: "low" },
  { region_code: "1302", level: "city", parent_code: "13", name_zh: "唐山市", name_en: "Tangshan", name_tr: "Tangshan", industrial_clusters_tr: "Çin çelik üretiminin kalbi (profil, sac, kütük), vitrifiye seramik", industrial_clusters_en: "China's primary steel mill hub (HRC, beams, billets), sanitaryware", trading_intermediary_risk: "low" },
  { region_code: "1304", level: "city", parent_code: "13", name_zh: "邯郸市", name_en: "Handan (Yongnian)", name_tr: "Handan (Yongnian)", industrial_clusters_tr: "Standart cıvata/somun/saplama bağlantı elemanları merkezi (Yongnian)", industrial_clusters_en: "High-volume carbon-steel fasteners hub (Yongnian bolts/nuts/threaded rods)", trading_intermediary_risk: "low" },
  { region_code: "1306", level: "city", parent_code: "13", name_zh: "保定市", name_en: "Baoding", name_tr: "Baoding", industrial_clusters_tr: "Transformatör/güç ekipmanı, çanta/bavul (Baigou), havlu tekstili (Gaoyang)", industrial_clusters_en: "Power transformers, luggage/bags (Baigou), cotton towels (Gaoyang)", trading_intermediary_risk: "low" },
  { region_code: "1309", level: "city", parent_code: "13", name_zh: "沧州市", name_en: "Cangzhou", name_tr: "Cangzhou", industrial_clusters_tr: "Çelik dirsek/flanş/boru ek parçaları, kozmetik ambalaj şişeleri", industrial_clusters_en: "Butt-weld pipe fittings, forged flanges, cosmetic packaging", trading_intermediary_risk: "low" },
  { region_code: "1311", level: "city", parent_code: "13", name_zh: "衡水市", name_en: "Hengshui (Anping)", name_tr: "Hengshui (Anping)", industrial_clusters_tr: "Dünya paslanmaz/galvaniz tel örgü ve filtre merkezi (Anping), kauçuk hidrolik hortum", industrial_clusters_en: "Global wire mesh & filtration hub (Anping), high-pressure hydraulic hoses", trading_intermediary_risk: "low" },

  { region_code: "310115", level: "district", parent_code: "31", name_zh: "上海市浦东新区", name_en: "Shanghai Pudong New Area (FTZ)", name_tr: "Şanghay Pudong Serbest Bölge", industrial_clusters_tr: "DİKKAT: Serbest bölge sanal ofis / dış ticaret şirketi yoğunluğu çok yüksektir; gerçek üretim genelde Jiangsu/Zhejiang'dadır", industrial_clusters_en: "FTZ registered office alert: Very high ratio of trading/shell offices; actual plant is usually in Jiangsu/Zhejiang", trading_intermediary_risk: "high" },
  { region_code: "120116", level: "district", parent_code: "12", name_zh: "天津市滨海新区", name_en: "Tianjin Binhai New Area (FTZ)", name_tr: "Tianjin Binhai Serbest Bölge", industrial_clusters_tr: "Liman lojistik, paralel ithalat/ihracat şirketleri, kimya ve havacılık sanayi", industrial_clusters_en: "Port FTZ trading companies, petrochemicals, offshore equipment", trading_intermediary_risk: "medium" },
  { region_code: "3401", level: "city", parent_code: "34", name_zh: "合肥市", name_en: "Hefei", name_tr: "Hefei", industrial_clusters_tr: "Beyaz eşya, güneş inverteri, renk ayırma (optik sorter) makineleri, EV", industrial_clusters_en: "Home appliances, solar inverters, optical color sorters, EVs", trading_intermediary_risk: "low" },
  { region_code: "3607", level: "city", parent_code: "36", name_zh: "赣州市", name_en: "Ganzhou (Nankang)", name_tr: "Ganzhou (Nankang)", industrial_clusters_tr: "Masif ahşap mobilya merkezi (Nankang), nadir toprak mıknatıslar, tungsten", industrial_clusters_en: "Solid-wood furniture hub (Nankang), NdFeB magnets, tungsten", trading_intermediary_risk: "low" },
  { region_code: "2102", level: "city", parent_code: "21", name_zh: "大连市", name_en: "Dalian", name_tr: "Dalian", industrial_clusters_tr: "CNC işleme merkezi, rulman (Wafangdian), soğuk zincir deniz ürünleri, döküm", industrial_clusters_en: "CNC machine tools, heavy bearings (Wafangdian),铸造 castings", trading_intermediary_risk: "low" },
];

// ---------------------------------------------------------------------------
// 2B. Küresel Tedarikçi Sicil & Vergi Numarası Doğrulama Kuralları (25 Standart)
// ---------------------------------------------------------------------------
const sampleUscc91 = makeValidUscc("9144060658140293X");
const sampleUscc92 = makeValidUscc("92330782MA28D1234");
const sampleTrVkn  = makeValidTrVkn("123456789");

const supplierRegistryRules = [
  {
    rule_code: "CN_USCC_91",
    country_code: "CN",
    id_type: "USCC (统一社会信用代码 — Kurumsal Şirket 91)",
    standard_ref: "GB 32100-2015 + GB 11714-1997",
    char_length_min: 18,
    char_length_max: 18,
    pattern_regex: "^91[0-9]{6}[0-9A-HJ-NPQRTUWXY]{9}[0-9A-HJ-NPQRTUWXY]$",
    checksum_algorithm: "gb32100_mod31",
    sample_valid: sampleUscc91,
    entity_nature: "corporate_enterprise",
    fraud_flag_level: "normal",
    guidance_tr: "SAMR (Piyasa Düzenleme İdaresi) siciline kayıtlı tüzel kişilikli şirket (Ltd./Co., Ltd.). 3-8. haneler tescil il/ilçesini gösterir; ancak şirketin fabrika mı yoksa ticaret şirketi (Trading Co.) mi olduğu İşletme Kapsamı (经营范围) kontrolüyle kesinleşir.",
    guidance_en: "SAMR-registered corporate enterprise (Ltd./Co., Ltd.). Digits 3-8 reveal registered city; check Business Scope (经营范围) to distinguish real manufacturer vs. trading company.",
  },
  {
    rule_code: "CN_USCC_92",
    country_code: "CN",
    id_type: "USCC (个体工商户 — Şahıs İşletmesi / Küçük Atölye 92)",
    standard_ref: "GB 32100-2015",
    char_length_min: 18,
    char_length_max: 18,
    pattern_regex: "^92[0-9]{6}[0-9A-HJ-NPQRTUWXY]{9}[0-9A-HJ-NPQRTUWXY]$",
    checksum_algorithm: "gb32100_mod31",
    sample_valid: sampleUscc92,
    entity_nature: "sole_proprietor_workshop",
    fraud_flag_level: "high_warning",
    guidance_tr: "KIRMIZI BAYRAK: '92' ile başlayan kod tüzel şirket DEĞİL, bireysel esnaf/küçük atölye kaydıdır! Kendisini büyük ISO sertifikalı fabrika olarak tanıtan bir tedarikçi 92 kodu veriyorsa yüksek risklidir.",
    guidance_en: "RED FLAG: Prefix '92' denotes an Individual Household Workshop (个体工商户), NOT a limited liability factory! High risk if supplier claims large factory capacity or direct export license.",
  },
  {
    rule_code: "CN_USCC_93",
    country_code: "CN",
    id_type: "USCC (农民专业合作社 — Tarım Kooperatifi 93)",
    standard_ref: "GB 32100-2015",
    char_length_min: 18,
    char_length_max: 18,
    pattern_regex: "^93[0-9]{6}[0-9A-HJ-NPQRTUWXY]{9}[0-9A-HJ-NPQRTUWXY]$",
    checksum_algorithm: "gb32100_mod31",
    sample_valid: makeValidUscc("93370828678123456"),
    entity_nature: "agricultural_cooperative",
    fraud_flag_level: "medium_warning",
    guidance_tr: "Çiftçi/tarım uzmanlık kooperatifi kaydıdır. Sanayi ürünü tedarikçisi için olağandışıdır; tarım ürününde ise gümrük ihracat yetkisi (GACC kaydı) ayrıca doğrulanmalıdır.",
    guidance_en: "Farmers' specialized cooperative. Unusual for industrial goods; for agricultural exports, verify GACC customs registration.",
  },
  {
    rule_code: "CN_USCC_OTHER",
    country_code: "CN",
    id_type: "USCC (11/51/Y — Kamu Kurumu veya STK/Dernek)",
    standard_ref: "GB 32100-2015",
    char_length_min: 18,
    char_length_max: 18,
    pattern_regex: "^(11|12|51|52|53|Y1)[0-9]{6}[0-9A-HJ-NPQRTUWXY]{9}[0-9A-HJ-NPQRTUWXY]$",
    checksum_algorithm: "gb32100_mod31",
    sample_valid: makeValidUscc("51110000500012345"),
    entity_nature: "non_commercial_org",
    fraud_flag_level: "critical",
    guidance_tr: "KRİTİK UYARI: Ticari üretici/ihracatçı değildir (51=Dernek/Vakıf, 11=Kamu kurumu). Ticari mal satışı proforma faturasında bu kod yer alamaz!",
    guidance_en: "CRITICAL ALERT: Non-commercial entity (51=NGO/Association, 11=Public Institution). Cannot legally act as commercial export manufacturer.",
  },
  {
    rule_code: "TR_VKN",
    country_code: "TR",
    id_type: "T.C. Vergi Kimlik Numarası (Tüzel Şirket VKN)",
    standard_ref: "T.C. Gelir İdaresi Başkanlığı (GİB) Mod-10",
    char_length_min: 10,
    char_length_max: 10,
    pattern_regex: "^[0-9]{10}$",
    checksum_algorithm: "tr_vkn_mod10",
    sample_valid: sampleTrVkn,
    entity_nature: "corporate_enterprise",
    fraud_flag_level: "normal",
    guidance_tr: "10 haneli Türk Vergi Kimlik Numarası (A.Ş. / Ltd. Şti. / Kolektif / Kooperatif). GİB Mod-10 sağlama basamağı ve MERSİS / Ticaret Sicil Gazetesi ile eşleştirilir.",
    guidance_en: "10-digit Turkish Corporate Tax ID (VKN) verified via official GİB Mod-10 check digit; cross-check against MERSİS Trade Registry.",
  },
  {
    rule_code: "TR_TCKN_SOLE",
    country_code: "TR",
    id_type: "T.C. Kimlik Numarası (Şahıs İşletmesi Vergi No)",
    standard_ref: "NVİ Mod-10/Mod-11 Çift Kontrol Basamağı",
    char_length_min: 11,
    char_length_max: 11,
    pattern_regex: "^[1-9][0-9]{9}[02468]$",
    checksum_algorithm: "tr_tckn_mod10",
    sample_valid: "10000000146",
    entity_nature: "sole_proprietor_workshop",
    fraud_flag_level: "medium_warning",
    guidance_tr: "Türkiye'de şahıs şirketleri faturalarında 11 haneli TCKN kullanır (ör. BD Sanayi gibi köklü şahıs işletmeleri yasal ihracatçı olabilir; ancak anonim/limited fabrika iddiası varsa Ticaret Odası ve Kapasite Raporu teyit edilmelidir).",
    guidance_en: "11-digit Turkish Individual Tax ID used by registered sole proprietorships; verify Chamber of Commerce & Industrial Capacity Report (Kapasite Raporu).",
  },
  {
    rule_code: "US_EIN",
    country_code: "US",
    id_type: "US Employer Identification Number (IRS EIN / W-9)",
    standard_ref: "IRS Publication 1635",
    char_length_min: 9,
    char_length_max: 10,
    pattern_regex: "^(0[1-6]|1[0-6]|2[0-7]|3[0-9]|4[0-8]|5[0-9]|6[0-8]|7[1-7]|8[0-8]|9[0-5]|9[8-9])-?[0-9]{7}$",
    checksum_algorithm: "irs_ein_prefix",
    sample_valid: "30-1234567",
    entity_nature: "corporate_enterprise",
    fraud_flag_level: "normal",
    guidance_tr: "ABD federal vergi numarası (9 rakam, XX-XXXXXXX). İlk iki hane resmi IRS vergi dairesi kampüs kodunu doğrular (00, 07, 08, 09, 17, 18, 19, 28, 29, 49, 69, 70, 78, 79, 89 geçersizdir!).",
    guidance_en: "US Federal IRS Employer Identification Number; first two digits must match an active IRS campus prefix (invalid prefixes like 00, 07-09, 69-70, 78-79, 89 indicate a fabricated EIN).",
  },
  {
    rule_code: "US_DUNS",
    country_code: "US",
    id_type: "Dun & Bradstreet D-U-N-S® Number",
    standard_ref: "D&B Global Corporate Identifier (ISO 6523 ICD 0060)",
    char_length_min: 9,
    char_length_max: 11,
    pattern_regex: "^[0-9]{2}-?[0-9]{3}-?[0-9]{4}$",
    checksum_algorithm: "format_only",
    sample_valid: "14-977-6743",
    entity_nature: "corporate_enterprise",
    fraud_flag_level: "normal",
    guidance_tr: "9 haneli küresel D&B ticari sicil doğrulama numarası (SAP Ariba, ABD kamu ve kurumsal satınalma standart referansı).",
    guidance_en: "9-digit Dun & Bradstreet global corporate verification identifier used across Fortune 500 & SAP Ariba procurement.",
  },
  {
    rule_code: "DE_USTID",
    country_code: "DE",
    id_type: "Almanya USt-IdNr. (AB VIES KDV No)",
    standard_ref: "EU VIES / ISO 7064 Mod 11,10",
    char_length_min: 11,
    char_length_max: 11,
    pattern_regex: "^DE[0-9]{9}$",
    checksum_algorithm: "regex_vies",
    sample_valid: "DE123456788",
    entity_nature: "corporate_enterprise",
    fraud_flag_level: "normal",
    guidance_tr: "Almanya sınır ötesi AB KDV numarası (DE + 9 rakam). Ayrıca Alman şirket sözleşmelerinde yerel mahkeme Handelsregister numarası (HRB / HRA) bulunması zorunludur.",
    guidance_en: "German EU VAT ID (DE + 9 digits); always verify alongside local Amtsgericht Handelsregister number (HRB/HRA) in Impressum.",
  },
  {
    rule_code: "GB_VAT",
    country_code: "GB",
    id_type: "İngiltere (UK) VAT Registration Number",
    standard_ref: "HMRC VAT Format",
    char_length_min: 11,
    char_length_max: 14,
    pattern_regex: "^GB([0-9]{9}|[0-9]{12}|GD[0-9]{3}|HA[0-9]{3})$",
    checksum_algorithm: "regex_vies",
    sample_valid: "GB123456789",
    entity_nature: "corporate_enterprise",
    fraud_flag_level: "normal",
    guidance_tr: "İngiltere HMRC KDV numarası (GB + 9 veya 12 rakam). İngiltere Companies House 8 haneli şirket sicil numarasıyla (CRN) birlikte kontrol edilmelidir.",
    guidance_en: "UK HMRC VAT number; cross-check against open 8-character UK Companies House Registration Number (CRN).",
  },
  {
    rule_code: "GB_CRN",
    country_code: "GB",
    id_type: "UK Companies House Registration Number (CRN)",
    standard_ref: "UK Companies Act 2006",
    char_length_min: 8,
    char_length_max: 8,
    pattern_regex: "^([0-9]{8}|(SC|NI|OC|SO|NC)[0-9]{6})$",
    checksum_algorithm: "format_only",
    sample_valid: "12345678",
    entity_nature: "corporate_enterprise",
    fraud_flag_level: "normal",
    guidance_tr: "İngiltere 8 haneli şirket sicil numarası. Dikkat: İngiltere'de 50 GBP'ye 24 saatte paravan şirket (dormant £1 capital Ltd) açılabildiği için ödenmiş sermaye ve aktif hesap geçmişi incelenmelidir!",
    guidance_en: "8-character UK Companies House ID. Note: £1 dormant UK shell companies are cheap to incorporate—always inspect filing history & active net assets.",
  },
  {
    rule_code: "FR_SIRET",
    country_code: "FR",
    id_type: "Fransa SIRET Sicil Numarası (14 Hane)",
    standard_ref: "INSEE Luhn Mod-10",
    char_length_min: 14,
    char_length_max: 14,
    pattern_regex: "^[0-9]{14}$",
    checksum_algorithm: "luhn_mod10",
    sample_valid: "73282932000074",
    entity_nature: "corporate_enterprise",
    fraud_flag_level: "normal",
    guidance_tr: "Fransa INSEE işletme/tesis sicil numarası (ilk 9 hanesi SIREN şirket kodu, son 5 hanesi NIC tesis kodudur; Luhn Mod-10 algoritmasına tabidir).",
    guidance_en: "14-digit French INSEE establishment identifier (9-digit SIREN + 5-digit NIC), validated via Luhn Mod-10.",
  },
  {
    rule_code: "NL_BTW",
    country_code: "NL",
    id_type: "Hollanda BTW-identificatienummer (AB KDV No)",
    standard_ref: "Belastingdienst / EU VIES",
    char_length_min: 14,
    char_length_max: 14,
    pattern_regex: "^NL[0-9]{9}B[0-9]{2}$",
    checksum_algorithm: "regex_vies",
    sample_valid: "NL123456782B01",
    entity_nature: "corporate_enterprise",
    fraud_flag_level: "normal",
    guidance_tr: "Hollanda KDV numarası (NL + 9 rakam + B + 2 rakam). Ayrıca 8 haneli KvK (Ticaret Odası) numarası ile doğrulanır.",
    guidance_en: "Dutch VAT number (NL + 9 digits + B01..B99); pair with 8-digit KvK Chamber of Commerce number.",
  },
  {
    rule_code: "IT_PIVA",
    country_code: "IT",
    id_type: "İtalya Partita IVA (11 Hane)",
    standard_ref: "Agenzia delle Entrate Luhn Mod-10",
    char_length_min: 11,
    char_length_max: 13,
    pattern_regex: "^(IT)?[0-9]{11}$",
    checksum_algorithm: "regex_vies",
    sample_valid: "IT00743110157",
    entity_nature: "corporate_enterprise",
    fraud_flag_level: "normal",
    guidance_tr: "İtalya 11 haneli şirket vergi numarası (son basamak kontrol hanesidir, 8-10. haneler il vergi dairesi kodunu gösterir).",
    guidance_en: "Italian 11-digit corporate VAT/tax ID; digits 8-10 encode the provincial tax office.",
  },
  {
    rule_code: "ES_NIF",
    country_code: "ES",
    id_type: "İspanya NIF / CIF (AB KDV No)",
    standard_ref: "AEAT Spain",
    char_length_min: 9,
    char_length_max: 11,
    pattern_regex: "^(ES)?[A-Z0-9][0-9]{7}[A-Z0-9]$",
    checksum_algorithm: "regex_vies",
    sample_valid: "ESA12345674",
    entity_nature: "corporate_enterprise",
    fraud_flag_level: "normal",
    guidance_tr: "İspanya tüzel kişilik vergi numarası (A=Anonim Şirket S.A., B=Limited Şirket S.L.).",
    guidance_en: "Spanish corporate tax ID (letter A = S.A. corporation, letter B = S.L. limited liability company).",
  },
  {
    rule_code: "PL_NIP",
    country_code: "PL",
    id_type: "Polonya NIP (10 Hane Vergi No)",
    standard_ref: "Polish Ministry of Finance Mod-11 (6,5,7,2,3,4,5,6,7)",
    char_length_min: 10,
    char_length_max: 12,
    pattern_regex: "^(PL)?[0-9]{10}$",
    checksum_algorithm: "pl_nip_mod11",
    sample_valid: "PL5260250995",
    entity_nature: "corporate_enterprise",
    fraud_flag_level: "normal",
    guidance_tr: "Polonya 10 haneli vergi kimlik numarası; 10. hane (6,5,7,2,3,4,5,6,7) ağırlıklı Mod-11 kontrol basamağıdır.",
    guidance_en: "Polish 10-digit NIP tax ID with strict weighted Mod-11 check digit.",
  },
  {
    rule_code: "RO_CUI",
    country_code: "RO",
    id_type: "Romanya CUI / CIF",
    standard_ref: "ANAF Romania",
    char_length_min: 4,
    char_length_max: 12,
    pattern_regex: "^(RO)?[1-9][0-9]{1,9}$",
    checksum_algorithm: "regex_vies",
    sample_valid: "RO18547290",
    entity_nature: "corporate_enterprise",
    fraud_flag_level: "normal",
    guidance_tr: "Romanya şirket vergi kodu (KDV mükellefi ise başında RO bulunur; 2-10 rakam uzunluğundadır).",
    guidance_en: "Romanian Unique Registration Code (CUI), prefixed with RO when VAT-registered.",
  },
  {
    rule_code: "AE_TRN",
    country_code: "AE",
    id_type: "BAE (Dubai/Abu Dabi) Tax Registration Number (TRN)",
    standard_ref: "UAE Federal Tax Authority (FTA)",
    char_length_min: 15,
    char_length_max: 15,
    pattern_regex: "^100[0-9]{12}$",
    checksum_algorithm: "regex_vies",
    sample_valid: "100234567890003",
    entity_nature: "corporate_enterprise",
    fraud_flag_level: "normal",
    guidance_tr: "Birleşik Arap Emirlikleri 15 haneli KDV numarası ('100' ile başlar). Ayrıca DED veya Free Zone ticaret lisans numarası ve bitiş tarihi kontrol edilmelidir.",
    guidance_en: "15-digit UAE FTA Tax Registration Number starting with '100'; always verify DED/Free-Zone Trade License expiry date.",
  },
  {
    rule_code: "SA_VAT",
    country_code: "SA",
    id_type: "Suudi Arabistan ZATCA VAT Number (15 Hane)",
    standard_ref: "ZATCA KSA",
    char_length_min: 15,
    char_length_max: 15,
    pattern_regex: "^3[0-9]{13}3$",
    checksum_algorithm: "regex_vies",
    sample_valid: "300123456700003",
    entity_nature: "corporate_enterprise",
    fraud_flag_level: "normal",
    guidance_tr: "Suudi Arabistan ZATCA 15 haneli KDV numarası ('3' ile başlar ve '3' ile biter; grup KDV dışındaki standart kayıtlarda sonu '00003' olur). Ayrıca 10 haneli CR (Ticaret Sicil — '700' birleşik no) teyit edilmelidir.",
    guidance_en: "15-digit Saudi ZATCA VAT ID starting and ending with '3'; cross-verify 10-digit Commercial Registration (CR / Unified 700 number).",
  },
  {
    rule_code: "HK_BRN",
    country_code: "HK",
    id_type: "Hong Kong Business Registration Number (BRN)",
    standard_ref: "HK Inland Revenue Department (8 Digits)",
    char_length_min: 8,
    char_length_max: 8,
    pattern_regex: "^[0-9]{8}$",
    checksum_algorithm: "format_only",
    sample_valid: "12345678",
    entity_nature: "offshore_trading_entity",
    fraud_flag_level: "medium_warning",
    guidance_tr: "Hong Kong 8 haneli işletme kayıt numarası. DİKKAT: Çin anakarasındaki bir fabrikanın yerine Hong Kong şirketine ödeme isteniyorsa, iki şirket arasındaki resmi İhracat Acentelik Sözleşmesi ve ortaklık bağı doğrulanmadan ödeme yapılmamalıdır!",
    guidance_en: "8-digit Hong Kong BRN. CAUTION: Hong Kong Limited entities are frequently offshore billing vehicles—never wire deposit to an HK company for a Mainland factory order without verifying ownership or a stamped Export Agency Agreement.",
  },
  {
    rule_code: "RU_INN_LEGAL",
    country_code: "RU",
    id_type: "Rusya Tüzel Şirket Vergi No (ИНН — 10 Hane)",
    standard_ref: "FNS Russia Mod-11",
    char_length_min: 10,
    char_length_max: 10,
    pattern_regex: "^[0-9]{10}$",
    checksum_algorithm: "ru_inn10_mod11",
    sample_valid: "7707083893",
    entity_nature: "corporate_enterprise",
    fraud_flag_level: "normal",
    guidance_tr: "Rusya 10 haneli tüzel şirket vergi numarası (OOO / AO). İlk 4 hane vergi dairesini, 10. hane resmi ağırlıklı Mod-11 kontrol basamağını gösterir. (12 haneli INN ise şahıs işletmesidir - ИП).",
    guidance_en: "10-digit Russian corporate tax ID (INN for OOO/AO) with Mod-11 check digit (12-digit INN denotes an individual entrepreneur).",
  },
  {
    rule_code: "MA_ICE",
    country_code: "MA",
    id_type: "Fas Ortak İşletme Kimliği (ICE — 15 Hane)",
    standard_ref: "OMPIC Morocco ICE",
    char_length_min: 15,
    char_length_max: 15,
    pattern_regex: "^[0-9]{15}$",
    checksum_algorithm: "format_only",
    sample_valid: "001524628000089",
    entity_nature: "corporate_enterprise",
    fraud_flag_level: "normal",
    guidance_tr: "Fas gümrük ve ticari faturalarında zorunlu 15 haneli ICE (Identifiant Commun de l'Entreprise) numarası (9 hane şirket + 4 hane şube + 2 hane kontrol).",
    guidance_en: "Mandatory 15-digit Moroccan ICE identifier required on commercial invoices and customs declarations.",
  },
];

// ---------------------------------------------------------------------------
// 2C. Küresel Ödeme & Banka Ülke Kuralları (ISO 13616 IBAN + SWIFT/Non-IBAN 60 Ülke)
// 40 Resmi IBAN Ülkesi (Mod-97 doğrulanmış örnek IBAN ile) + 20 Non-IBAN Ticaret Ülkesi
// ---------------------------------------------------------------------------
const rawIbanCountries = [
  { cc: "TR", name_tr: "Türkiye", name_en: "Türkiye", len: 26, bbanRe: "[0-9]{5}[0-9A-Z]{17}", sampleBban: "0006100519786457841326", sepa: false, fintechWatch: false, note_tr: "5 haneli TCMB banka kodu + 1 rezerv + 16 haneli hesap no." },
  { cc: "DE", name_tr: "Almanya", name_en: "Germany", len: 22, bbanRe: "[0-9]{18}", sampleBban: "370400440532013000", sepa: true, fintechWatch: false, note_tr: "8 hane BLZ banka kodu + 10 hane hesap no (SEPA)." },
  { cc: "GB", name_tr: "Birleşik Krallık (İngiltere)", name_en: "United Kingdom", len: 22, bbanRe: "[A-Z]{4}[0-9]{14}", sampleBban: "NWBK60161331926819", sepa: true, fintechWatch: true, note_tr: "Dikkat: Çinli/Asyalı tedarikçi GB sanal EMI (Wise/WorldFirst/Payoneer) IBAN'ı veriyorsa lehtar ünvanı sözleşmeyle birebir aynı olmalıdır!" },
  { cc: "FR", name_tr: "Fransa", name_en: "France", len: 27, bbanRe: "[0-9]{10}[0-9A-Z]{11}[0-9]{2}", sampleBban: "20041010050500013M02606", sepa: true, fintechWatch: false, note_tr: "5 hane banka + 5 hane şube + 11 hane hesap + 2 hane RIB anahtarı." },
  { cc: "NL", name_tr: "Hollanda", name_en: "Netherlands", len: 18, bbanRe: "[A-Z]{4}[0-9]{10}", sampleBban: "ABNA0417164300", sepa: true, fintechWatch: false, note_tr: "4 harf BIC banka kodu + 10 haneli hesap numarası." },
  { cc: "IT", name_tr: "İtalya", name_en: "Italy", len: 27, bbanRe: "[A-Z][0-9]{10}[0-9A-Z]{12}", sampleBban: "X0542811101000000123456", sepa: true, fintechWatch: false, note_tr: "1 CIN karakteri + 5 ABI + 5 CAB + 12 hesap kodu." },
  { cc: "ES", name_tr: "İspanya", name_en: "Spain", len: 24, bbanRe: "[0-9]{20}", sampleBban: "21000418450200051332", sepa: true, fintechWatch: false, note_tr: "4 banka + 4 şube + 2 kontrol + 10 hesap rakamı." },
  { cc: "PL", name_tr: "Polonya", name_en: "Poland", len: 28, bbanRe: "[0-9]{24}", sampleBban: "109010140000071219812874", sepa: true, fintechWatch: false, note_tr: "8 hane banka/şube yönlendirme + 16 hane hesap numarası." },
  { cc: "RO", name_tr: "Romanya", name_en: "Romania", len: 24, bbanRe: "[A-Z]{4}[0-9A-Z]{16}", sampleBban: "AAAA1B31007593840000", sepa: true, fintechWatch: false, note_tr: "4 harf banka kodu + 16 karakter hesap kodu." },
  { cc: "FI", name_tr: "Finlandiya", name_en: "Finland", len: 18, bbanRe: "[0-9]{14}", sampleBban: "12345600000785", sepa: true, fintechWatch: false, note_tr: "14 rakamlı kuzey Avrupa SEPA hesap formatı." },
  { cc: "AL", name_tr: "Arnavutluk", name_en: "Albania", len: 28, bbanRe: "[0-9]{8}[0-9A-Z]{16}", sampleBban: "212110090000000235698741", sepa: false, fintechWatch: false, note_tr: "8 rakam banka/şube + 16 karakter hesap numarası." },
  { cc: "CH", name_tr: "İsviçre", name_en: "Switzerland", len: 21, bbanRe: "[0-9]{5}[0-9A-Z]{12}", sampleBban: "00762011623852957", sepa: true, fintechWatch: false, note_tr: "5 haneli BC/IID banka kodu + 12 karakter hesap no." },
  { cc: "AT", name_tr: "Avusturya", name_en: "Austria", len: 20, bbanRe: "[0-9]{16}", sampleBban: "1904300234573201", sepa: true, fintechWatch: false, note_tr: "5 hane banka kodu + 11 hane hesap numarası." },
  { cc: "BE", name_tr: "Belçika", name_en: "Belgium", len: 16, bbanRe: "[0-9]{12}", sampleBban: "539007547034", sepa: true, fintechWatch: true, note_tr: "Dikkat: Wise Europe (Brüksel) BE IBAN'ları sıklıkla 3. ülke satıcıları tarafından kullanılır; lehtar adını mutlaka doğrulayın." },
  { cc: "LT", name_tr: "Litvanya", name_en: "Lithuania", len: 20, bbanRe: "[0-9]{16}", sampleBban: "7044060000123456", sepa: true, fintechWatch: true, note_tr: "YÜKSEK DİKKAT: Revolut / Paysera gibi Avrupa EMI fintech hesapları LT ile başlar. Çin/Türkiye/Afrika fabrikası LT IBAN veriyorsa BEC (e-posta araya girme) dolandırıcılığına karşı sesli/görüntülü teyit şarttır!" },
  { cc: "LU", name_tr: "Lüksemburg", name_en: "Luxembourg", len: 20, bbanRe: "[0-9]{3}[0-9A-Z]{13}", sampleBban: "0019400644750000", sepa: true, fintechWatch: true, note_tr: "Banking Circle / J.P. Morgan / Amazon / Payoneer sanal tahsilat IBAN'larında sık görülür; tedarikçi lehtar ünvanını kontrol edin." },
  { cc: "IE", name_tr: "İrlanda", name_en: "Ireland", len: 22, bbanRe: "[A-Z]{4}[0-9]{14}", sampleBban: "AIBK93115212345678", sepa: true, fintechWatch: true, note_tr: "4 harf BIC + 6 hane Sort Code + 8 hane hesap (Stripe/Citi sanal IBAN'larında yaygındır)." },
  { cc: "SE", name_tr: "İsveç", name_en: "Sweden", len: 24, bbanRe: "[0-9]{20}", sampleBban: "50000000058398257466", sepa: true, fintechWatch: false, note_tr: "3 hane banka kodu + 17 hane hesap numarası." },
  { cc: "DK", name_tr: "Danimarka", name_en: "Denmark", len: 18, bbanRe: "[0-9]{14}", sampleBban: "00400440116243", sepa: true, fintechWatch: false, note_tr: "4 hane kayıt kodu + 10 hane hesap numarası." },
  { cc: "NO", name_tr: "Norveç", name_en: "Norway", len: 15, bbanRe: "[0-9]{11}", sampleBban: "86011117947", sepa: true, fintechWatch: false, note_tr: "En kısa IBAN formatı (15 karakter)." },
  { cc: "CZ", name_tr: "Çekya", name_en: "Czechia", len: 24, bbanRe: "[0-9]{20}", sampleBban: "08000000192000145399", sepa: true, fintechWatch: false, note_tr: "4 hane banka + 16 hane hesap numarası." },
  { cc: "HU", name_tr: "Macaristan", name_en: "Hungary", len: 28, bbanRe: "[0-9]{24}", sampleBban: "117730161111101800000000", sepa: true, fintechWatch: false, note_tr: "24 rakamlı BBAN gövdesi." },
  { cc: "BG", name_tr: "Bulgaristan", name_en: "Bulgaria", len: 22, bbanRe: "[A-Z]{4}[0-9]{6}[0-9A-Z]{8}", sampleBban: "BNBG96611020345678", sepa: true, fintechWatch: false, note_tr: "4 harf banka BIC + 4 şube + 2 hesap tipi + 8 hesap kodu." },
  { cc: "GR", name_tr: "Yunanistan", name_en: "Greece", len: 27, bbanRe: "[0-9]{7}[0-9A-Z]{16}", sampleBban: "01101250000000012300695", sepa: true, fintechWatch: false, note_tr: "3 banka + 4 şube + 16 hesap karakteri." },
  { cc: "PT", name_tr: "Portekiz", name_en: "Portugal", len: 25, bbanRe: "[0-9]{21}", sampleBban: "000201231234567890154", sepa: true, fintechWatch: false, note_tr: "4 banka + 4 şube + 11 hesap + 2 kontrol rakamı." },
  { cc: "EE", name_tr: "Estonya", name_en: "Estonia", len: 20, bbanRe: "[0-9]{16}", sampleBban: "2200221020145685", sepa: true, fintechWatch: true, note_tr: "e-Residency sanal şirket ve fintech hesaplarında sık kullanılır." },
  { cc: "LV", name_tr: "Letonya", name_en: "Latvia", len: 21, bbanRe: "[A-Z]{4}[0-9A-Z]{13}", sampleBban: "HABA0551000354921", sepa: true, fintechWatch: false, note_tr: "4 harf BIC + 13 karakter hesap kodu." },
  { cc: "CY", name_tr: "Kıbrıs (Güney)", name_en: "Cyprus", len: 28, bbanRe: "[0-9]{8}[0-9A-Z]{16}", sampleBban: "002001280000001200527600", sepa: true, fintechWatch: true, note_tr: "Uluslararası holding/aracı faturalama şirketlerinde yaygındır." },
  { cc: "MT", name_tr: "Malta", name_en: "Malta", len: 31, bbanRe: "[A-Z]{4}[0-9]{5}[0-9A-Z]{18}", sampleBban: "MALT011000012345MTLCAST001S", sepa: true, fintechWatch: true, note_tr: "31 karakterli SEPA IBAN formatı." },
  { cc: "AE", name_tr: "Birleşik Arap Emirlikleri", name_en: "United Arab Emirates", len: 23, bbanRe: "[0-9]{19}", sampleBban: "0331234567890123456", sepa: false, fintechWatch: true, note_tr: "Dubai/BAE serbest bölge aracı şirket tahsilatlarında üretici bağlantısı mutlaka doğrulanmalıdır." },
  { cc: "SA", name_tr: "Suudi Arabistan", name_en: "Saudi Arabia", len: 24, bbanRe: "[0-9]{2}[0-9A-Z]{18}", sampleBban: "80000000608010167519", sepa: false, fintechWatch: false, note_tr: "2 rakam SAMA banka kodu + 18 karakter hesap numarası." },
  { cc: "QA", name_tr: "Katar", name_en: "Qatar", len: 29, bbanRe: "[A-Z]{4}[0-9A-Z]{21}", sampleBban: "DOHB00001234567890ABCDEFG", sepa: false, fintechWatch: false, note_tr: "4 harf banka kodu + 21 karakter hesap no." },
  { cc: "KW", name_tr: "Kuveyt", name_en: "Kuwait", len: 30, bbanRe: "[A-Z]{4}[0-9A-Z]{22}", sampleBban: "CBKU0000000000001234560101", sepa: false, fintechWatch: false, note_tr: "4 harf banka kodu + 22 karakter hesap no." },
  { cc: "BH", name_tr: "Bahreyn", name_en: "Bahrain", len: 22, bbanRe: "[A-Z]{4}[0-9A-Z]{14}", sampleBban: "BMAG00001299123456", sepa: false, fintechWatch: false, note_tr: "4 harf banka kodu + 14 karakter hesap no." },
  { cc: "JO", name_tr: "Ürdün", name_en: "Jordan", len: 30, bbanRe: "[A-Z]{4}[0-9]{4}[0-9A-Z]{18}", sampleBban: "CBJO0010000000000131000302", sepa: false, fintechWatch: false, note_tr: "Ürdün Merkez Bankası zorunlu 30 karakter IBAN (JEPCO/EDCO ihale ve akreditif ödemelerinde standart)." },
  { cc: "EG", name_tr: "Mısır", name_en: "Egypt", len: 29, bbanRe: "[0-9]{25}", sampleBban: "0003000012345678901234567", sepa: false, fintechWatch: false, note_tr: "Mısır 29 haneli resmi IBAN (ACID gümrük kaydıyla lehtar banka eşleşmesi zorunludur!)." },
  { cc: "TN", name_tr: "Tunus", name_en: "Tunisia", len: 24, bbanRe: "[0-9]{20}", sampleBban: "10006035183598478831", sepa: false, fintechWatch: false, note_tr: "Tunus 24 haneli IBAN (20 haneli yerel RIB numarasından türetilir)." },
  { cc: "LY", name_tr: "Libya", name_en: "Libya", len: 25, bbanRe: "[0-9]{21}", sampleBban: "021004000001234567890", sepa: false, fintechWatch: false, note_tr: "Libya Merkez Bankası (CBL) 25 haneli IBAN (GECOL ve Misrata/Trablus akreditif işlemlerinde kullanılır)." },
  { cc: "IQ", name_tr: "Irak", name_en: "Iraq", len: 23, bbanRe: "[A-Z]{4}[0-9]{15}", sampleBban: "TABI001000123456789", sepa: false, fintechWatch: false, note_tr: "Irak Merkez Bankası (CBI) 23 karakterli IBAN (4 harf banka BIC + 3 şube + 12 hesap)." },
  { cc: "PK", name_tr: "Pakistan", name_en: "Pakistan", len: 24, bbanRe: "[A-Z]{4}[0-9A-Z]{16}", sampleBban: "SCBL0000001123456702", sepa: false, fintechWatch: false, note_tr: "4 harf banka kodu + 16 karakter hesap numarası." },
];

const nonIbanTradeCountries = [
  { cc: "CN", name_tr: "Çin Halk Cumhuriyeti", name_en: "China (Mainland)", local_system: "SWIFT/BIC + CNAPS (12 Hane) + Banka Hesap No", fintechWatch: false, note_tr: "ÖNEMLİ: Çin anakarasında IBAN YOKTUR! Proforma faturada 'CN...' ile başlayan sözde bir IBAN görürseniz %100 sahtedir. Resmi Çin şirket hesabı 8/11 haneli SWIFT kodu (ör. BKCHCNBJ...) ve şirket tam ünvanıyla açılır." },
  { cc: "HK", name_tr: "Hong Kong ÖİB", name_en: "Hong Kong SAR", local_system: "SWIFT/BIC + 3 Hane Bank Code + Hesap No (IBAN Yok)", fintechWatch: true, note_tr: "Hong Kong IBAN kullanmaz. Çinli tedarikçilerin en sık kullandığı offshore USD tahsilat merkezidir; anakara fabrikasıyla resmi ortaklık veya İhracat Acentelik Sözleşmesi aranmalıdır." },
  { cc: "US", name_tr: "Amerika Birleşik Devletleri", name_en: "United States", local_system: "SWIFT/BIC + 9 Hane ABA Routing Number + Account No (IBAN Yok)", fintechWatch: false, note_tr: "ABD bankaları IBAN kullanmaz; ACH/Fedwire için 9 haneli ABA Routing Number ve uluslararası T/T için SWIFT kodu kullanılır." },
  { cc: "SG", name_tr: "Singapur", name_en: "Singapore", local_system: "SWIFT/BIC + Bank/Branch Code + Account No (IBAN Yok)", fintechWatch: true, note_tr: "Asya emtia ve elektronik ticaretinde sık kullanılan offshore finans merkezidir; IBAN kullanılmaz." },
  { cc: "IN", name_tr: "Hindistan", name_en: "India", local_system: "SWIFT/BIC + 11 Karakter IFSC Kodu + Hesap No (IBAN Yok)", fintechWatch: false, note_tr: "Hindistan IBAN kullanmaz; şube doğrulaması 11 karakterli resmi IFSC kodu (4 harf + 0 + 6 karakter) ile yapılır." },
  { cc: "VN", name_tr: "Vietnam", name_en: "Vietnam", local_system: "SWIFT/BIC + Yerel Banka Hesap No (IBAN Yok)", fintechWatch: false, note_tr: "Vietnam IBAN kullanmaz; tekstil, mobilya ve ahşap tedarikinde SWIFT + şirket hesabı kullanılır." },
  { cc: "KR", name_tr: "Güney Kore", name_en: "South Korea", local_system: "SWIFT/BIC + Hesap No (IBAN Yok)", fintechWatch: false, note_tr: "Güney Kore IBAN kullanmaz; Türkiye-Güney Kore STA kapsamında fatura beyanı ve SWIFT kullanılır." },
  { cc: "JP", name_tr: "Japonya", name_en: "Japan", local_system: "SWIFT/BIC + Zengin 4 Hane Banka / 3 Hane Şube Kodu (IBAN Yok)", fintechWatch: false, note_tr: "Japonya IBAN kullanmaz." },
  { cc: "CA", name_tr: "Kanada", name_en: "Canada", local_system: "SWIFT/BIC + 9 Hane Transit/Institution No (IBAN Yok)", fintechWatch: false, note_tr: "Kanada IBAN kullanmaz; 0 + 3 hane kurum + 5 hane şube kodu kullanılır." },
  { cc: "AU", name_tr: "Avustralya", name_en: "Australia", local_system: "SWIFT/BIC + 6 Hane BSB Kodu + Hesap No (IBAN Yok)", fintechWatch: false, note_tr: "Avustralya IBAN kullanmaz; 6 haneli BSB şube kodu zorunludur." },
  { cc: "MA", name_tr: "Fas", name_en: "Morocco", local_system: "SWIFT/BIC + 24 Haneli RIB (Relevé d'Identité Bancaire)", fintechWatch: false, note_tr: "Fas resmi ISO 13616 sicilinde kayıtlı değildir; bankalar SWIFT + 24 haneli yerel RIB numarası kullanır." },
  { cc: "DZ", name_tr: "Cezayir", name_en: "Algeria", local_system: "SWIFT/BIC + 20 Haneli RIB (Zorunlu Akreditif / Vesaik Mukabili)", fintechWatch: false, note_tr: "Cezayir dış ticaret mevzuatı peşin T/T transferine izin vermez; ödemeler Cezayir bankası üzerinden Akreditif (L/C) veya Vesaik Mukabili (CAD) yapılır." },
  { cc: "SN", name_tr: "Senegal", name_en: "Senegal", local_system: "SWIFT/BIC + UEMOA 24 Karakterli RIB (SN Koduyla)", fintechWatch: false, note_tr: "Batı Afrika Para Birliği (BCEAO/UEMOA) 24 karakterli RIB formatı kullanılır (ISO IBAN değil, SWIFT + RIB)." },
  { cc: "CI", name_tr: "Fildişi Sahili", name_en: "Côte d'Ivoire", local_system: "SWIFT/BIC + UEMOA 24 Karakterli RIB (CI Koduyla)", fintechWatch: false, note_tr: "Batı Afrika BCEAO 24 karakterli RIB + SWIFT sistemi kullanılır." },
  { cc: "NG", name_tr: "Nijerya", name_en: "Nigeria", local_system: "SWIFT/BIC + 10 Haneli NUBAN + Form M Zorunluluğu", fintechWatch: false, note_tr: "Nijerya'ya ihracatta yükleme öncesi alıcının bankasından onaylı Form M numarası alınmadan mal yüklenmemelidir." },
  { cc: "KE", name_tr: "Kenya", name_en: "Kenya", local_system: "SWIFT/BIC + Banka Hesap No (IBAN Yok — PVoC Zorunlu)", fintechWatch: false, note_tr: "Kenya IBAN kullanmaz; SWIFT ile çalışır ve yükleme öncesi KEBS PVoC uygunluk belgesi zorunludur." },
  { cc: "GH", name_tr: "Gana", name_en: "Ghana", local_system: "SWIFT/BIC + Hesap No (IBAN Yok)", fintechWatch: false, note_tr: "Gana IBAN kullanmaz; SWIFT ve akreditif (L/C) ile çalışır." },
  { cc: "TZ", name_tr: "Tanzanya", name_en: "Tanzania", local_system: "SWIFT/BIC + Hesap No (IBAN Yok — TBS PVoC)", fintechWatch: false, note_tr: "Tanzanya IBAN kullanmaz; SWIFT ile çalışır." },
  { cc: "MZ", name_tr: "Mozambik", name_en: "Mozambique", local_system: "SWIFT/BIC + 25 Haneli NIB/ Yerel Kod (ISO IBAN Sicil Dışı)", fintechWatch: false, note_tr: "Mozambik uluslararası ödemelerde SWIFT + 21/25 haneli NIB kullanır." },
  { cc: "RU", name_tr: "Rusya Federasyonu", name_en: "Russia", local_system: "9 Hane BIK + 20 Hane Hesap No (Yaptırım & Muhabir Banka Teyidi Şart!)", fintechWatch: true, note_tr: "Rusya IBAN kullanmaz. Uluslararası yaptırım listeleri (OFAC/EU) ve muhabir banka kanalı işlem öncesi mutlaka kontrol edilmelidir." },
];

const ibanCountryRules = [
  ...rawIbanCountries.map((r) => {
    const sampleIban = makeValidIban(r.cc, r.sampleBban);
    return {
      country_code: r.cc,
      country_name_tr: r.name_tr,
      country_name_en: r.name_en,
      uses_iban: true,
      iban_length: r.len,
      iban_regex: `^${r.cc}[0-9]{2}${r.bbanRe}$`,
      local_routing_system: "ISO 13616 IBAN + SWIFT/BIC",
      sample_iban: sampleIban,
      sepa_member: r.sepa,
      fintech_offshore_watch: r.fintechWatch,
      compliance_note_tr: r.note_tr,
    };
  }),
  ...nonIbanTradeCountries.map((r) => ({
    country_code: r.cc,
    country_name_tr: r.name_tr,
    country_name_en: r.name_en,
    uses_iban: false,
    iban_length: 0,
    iban_regex: "",
    local_routing_system: r.local_system,
    sample_iban: "",
    sepa_member: false,
    fintech_offshore_watch: r.fintechWatch,
    compliance_note_tr: r.note_tr,
  })),
];

function writeJsonWithHash(filename, data) {
  const fullPath = join(OUT_DIR, filename);
  const content = JSON.stringify(data, null, 2) + "\n";
  writeFileSync(fullPath, content, "utf8");
  const sha256 = createHash("sha256").update(content, "utf8").digest("hex");
  return { filename: `02-supplier-registry/${filename}`, records: data.length, sha256 };
}

const f1 = writeJsonWithHash("cn_uscc_regions.json", cnUsccRegions);
const f2 = writeJsonWithHash("supplier_registry_rules.json", supplierRegistryRules);
const f3 = writeJsonWithHash("iban_country_rules.json", ibanCountryRules);

const manifestPath = join(ROOT, "manifest.json");
const existingManifest = JSON.parse(readFileSync(manifestPath, "utf8"));

const datasetEntry = {
  module_id: "02-supplier-registry",
  order: 2,
  title_tr: "Tedarikçi Sicil (Çin USCC, TR VKN, AB VIES) & ISO 13616 IBAN Ödeme Doğrulama Veritabanı",
  title_en: "Supplier Corporate Registry (China USCC, Tax IDs) & ISO 13616 IBAN Anti-Fraud Rules",
  authority: "SAMR China (GB 32100-2015 & GB/T 2260), T.C. GİB, EU VIES & SWIFT ISO 13616 Registry",
  official_sources: [
    "GB 32100-2015 Unified Social Credit Identifier Coding Rule (Mod-31)",
    "GB/T 2260 Administrative Division Codes of the People's Republic of China",
    "T.C. Gelir İdaresi Başkanlığı VKN Mod-10 & NVİ TCKN Algoritması",
    "SWIFT Official ISO 13616 IBAN Registry & ISO 7064 Mod 97-10",
  ],
  update_cadence: "annual_standard_review",
  verification_status: "verified",
  verified_at: new Date().toISOString(),
  collections: ["cn_uscc_regions", "supplier_registry_rules", "iban_country_rules"],
  files: [f1, f2, f3],
};

const filtered = (existingManifest.datasets || []).filter((d) => d.module_id !== "02-supplier-registry");
filtered.push(datasetEntry);
filtered.sort((a, b) => a.order - b.order);

const nextManifest = {
  ...existingManifest,
  updated_at: new Date().toISOString(),
  datasets: filtered,
};

writeFileSync(manifestPath, JSON.stringify(nextManifest, null, 2) + "\n", "utf8");
console.log(
  `[OK] 02-supplier-registry üretildi: cn_regions=${f1.records}, registry_rules=${f2.records}, iban_countries=${f3.records}`
);
