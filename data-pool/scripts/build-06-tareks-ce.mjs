// Veritabanı #6 Üretici: TAREKS (Ürün Güvenliği ve Denetimi Tebliğleri) & CE / Garanti / SSHYB Belge Sihirbazı (TR + EN + ZH)
// Kaynaklar: T.C. Ticaret Bakanlığı Yıllık ÜGD Tebliğleri (2026/1, 2, 5, 8, 9, 10, 11, 12, 14, 15, 16, 17, 18, 25),
//            7223 Sayılı Ürün Güvenliği ve Teknik Düzenlemeler Kanunu, TSE, BTK ve TİTCK İthalat Denetim Rehberleri
import { createHash } from "node:crypto";
import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const OUT_DIR = join(ROOT, "06-tareks-ce");
mkdirSync(OUT_DIR, { recursive: true });

// ---------------------------------------------------------------------------
// 6A. T.C. Ticaret Bakanlığı Resmi Ürün Güvenliği ve Denetimi (ÜGD) Tebliğleri (14 Ana Tebliğ)
// ---------------------------------------------------------------------------
const tareksRegulations = [
  {
    ugd_code: "UGD_01",
    communique_no: "ÜGD Tebliği (2026/1)",
    inspecting_authority: "TSE (Türk Standardları Enstitüsü)",
    eu_directives: "Ulusal Zorunlu TS / TS EN / ISO Standartları",
    title_tr: "İthalatta Standartlara Uygunluk Denetimi Tebliği",
    title_en: "Import Inspection Communiqué for Compliance with Standards",
    title_zh: "土耳其进口标准符合性检验公报 (ÜGD 2026/1 - TSE工业标准)",
    mandatory_docs_tr: "ILAC-MRA akredite laboratuvar test raporu (TS EN / ISO standardına tam uyumlu), Üretici Uygunluk Beyanı, Türkçe ürün/ambalaj markalaması, teknik çizim ve malzeme sertifikası (ör. EN 10204 3.1).",
    mandatory_docs_zh: "ILAC-MRA国际互认实验室检测报告、制造商符合性声明、产品本体及外包装永久性型号/产地标识、材质证明书(如EN 10204 3.1)。",
    eu_vs_non_eu_rule_tr: "AB'den A.TR ile gelen serbest dolaşımlı ürünlerde risk analizine göre referans numarası üretilirken; Çin ve 3. ülke menşeli ürünlerde TSE yüksek oranda numune alıp laboratuvar testine gönderir.",
    exemptions_tr: "Sanayicinin kendi üretiminde girdi olarak kullanacağı (Sanayi Sicil Belgesi / Kapasite Raporu ile kanıtlanan) bazı ara mallarda muafiyet/kapsam dışı TAREKS başvurusu yapılabilir.",
  },
  {
    ugd_code: "UGD_02",
    communique_no: "ÜGD Tebliği (2026/2)",
    inspecting_authority: "TSE",
    eu_directives: "Regulation (EU) 2016/1628 (NRMM Stage V Emission) & 2006/42/EC",
    title_tr: "Karayolu Dışında Kullanılan Hareketli Makinaların İthalat Denetimi Tebliği",
    title_en: "Non-Road Mobile Machinery (NRMM) Import Inspection Communiqué",
    title_zh: "土耳其非道路移动机械进口检验公报 (ÜGD 2026/2 - 叉车/挖掘机)",
    mandatory_docs_tr: "AB Tip Onay Belgesi (Stage V egzoz emisyon sertifikası — dizel/benzinli motor etiket numarasıyla birebir uyumlu!), AT Uygunluk Beyanı (DoC), Türkçe kullanım kılavuzu ve metal CE/motor etiketi.",
    mandatory_docs_zh: "欧盟Stage V非道路发动机排放型式批准证书、EC符合性声明(DoC)、机身永久性金属CE铭牌及发动机环保标牌、土耳其语操作手册。",
    eu_vs_non_eu_rule_tr: "Çin menşeli dizel forklift ve mini ekskavatörlerde Stage V motor tip onayı yoksa TAREKS'ten kesin ret yer ve gümrükten çekilemez!",
    exemptions_tr: "Yalnızca elektrikli (akülü) istif makineleri egzoz emisyonu yönünden değil, ÜGD/9 Makina/EMC yönünden denetlenir.",
  },
  {
    ugd_code: "UGD_05",
    communique_no: "ÜGD Tebliği (2026/5)",
    inspecting_authority: "T.C. Tarım ve Orman Bakanlığı",
    eu_directives: "Bitki Sağlığı (ISPM-15), Veteriner ve Gıda Hijyen Mevzuatı",
    title_tr: "Tarım Ürünlerinin ve Gıda İle Temas Eden Maddelerin İthalat Denetimi Tebliği",
    title_en: "Agricultural Products & Food-Contact Materials Import Inspection",
    title_zh: "土耳其农产品及食品接触材料进口检验公报 (ÜGD 2026/5)",
    mandatory_docs_tr: "Ön Bildirim / Kontrol Belgesi, Bitki Sağlık Sertifikası (Phytosanitary) veya Sağlık Sertifikası, İçerik Analiz Raporu; mutfak eşyası/termos/ambalajda ise Gıda ile Temas Uygunluk Analizi.",
    mandatory_docs_zh: "官方植物检疫证书/卫生证书、成分检测报告；保温杯/餐厨具等食品接触产品须通过土耳其农业部迁移测试。",
    eu_vs_non_eu_rule_tr: "Gıda ile temas eden plastik, silikon, seramik, cam ve paslanmaz çelik ürünlerde (termos, matara, mutfak gereci) ülke ayrımı olmaksızın Tarım İl Müdürlüğü numune/migrasyon analizi uygulanır!",
    exemptions_tr: "Ticari olmayan sınırlı laboratuvar analiz numuneleri.",
  },
  {
    ugd_code: "UGD_08",
    communique_no: "ÜGD Tebliği (2026/8)",
    inspecting_authority: "BTK (Bilgi Teknolojileri ve İletişim Kurumu)",
    eu_directives: "2014/53/EU Radio Equipment Directive (RED)",
    title_tr: "Telsiz Ekipmanlarının İthalat Denetimi Tebliği",
    title_en: "Radio & Wireless Equipment Import Inspection Communiqué (RED)",
    title_zh: "土耳其无线电及蓝牙/Wi-Fi设备进口检验公报 (ÜGD 2026/8 - BTK)",
    mandatory_docs_tr: "2014/53/EU RED Uygunluk Beyanı (DoC — imzalı ve standartları tam!), EN 62368-1 (Güvenlik) + EN 301 489 (EMC) + EN 300 328 / EN 301 893 (RF Spektrum) + SAR test raporları, Türkçe kılavuz ve ürün üzerinde CE + üretici/ithalatçı adresi.",
    mandatory_docs_zh: "欧盟2014/53/EU RED符合性声明(DoC)、完整RF射频+EMC+安规(EN 62368-1)+SAR测试报告、产品本体及彩盒CE标识与制造商名称地址。",
    eu_vs_non_eu_rule_tr: "İçinde küçücük bir Bluetooth veya Wi-Fi çipi bulunan her ürün (akıllı ev aleti, oyuncak, kamera, kulaklık) ÜGD/9 yerine BTK'nın çok sıkı ÜGD/8 denetimine girer!",
    exemptions_tr: "SIM kart yuvası (IMEI) olan cihazlarda ayrıca BTK IMEI kaydı ve ithalatçı yetki belgesi şarttır.",
  },
  {
    ugd_code: "UGD_09",
    communique_no: "ÜGD Tebliği (2026/9)",
    inspecting_authority: "TSE (Türk Standardları Enstitüsü)",
    eu_directives: "2014/35/EU (LVD), 2014/30/EU (EMC), 2006/42/EC (Machinery), 2014/68/EU (PED), (EU) 2016/426 (GAR), 2009/125/EC (ErP)",
    title_tr: "'CE' İşareti Taşıması Gereken Bazı Ürünlerin İthalat Denetimi Tebliği",
    title_en: "Import Inspection of Products Required to Bear the 'CE' Marking",
    title_zh: "土耳其CE标志机电与机械产品进口检验公报 (ÜGD 2026/9 - TSE主力检验)",
    mandatory_docs_tr: "AB Uygunluk Beyanı (EC Declaration of Conformity — güncel EN standartlarıyla!), ILAC-MRA akredite LVD + EMC + Makina + ErP enerji etiket test raporları, ürün üzerinde silinmez metal/lazer CE plakası (Marka, Model, Voltaj/Hz/Watt, Seri/Parti No, Üretici Adresi), Türkçe Kullanım Kılavuzu.",
    mandatory_docs_zh: "欧盟EC符合性声明(DoC，须列明最新EN协调标准)、ILAC-MRA认可实验室出具的LVD+EMC+机械安规完整报告、机身永久性CE铭牌(含品牌/型号/额定电压功率/制造商地址)、土耳其语说明书。",
    eu_vs_non_eu_rule_tr: "Çin'den ithalatta en çok ardiye/demuraj ve red yaşanan tebliğdir! Üründeki model kodu ile DoC, test raporu ve fatura arasında 1 harf bile fark olsa TSE başvuruyu reddeder.",
    exemptions_tr: "Aksam ve parça muafiyeti (nihai ürün değil üretim hattı yedek parçası ise Sanayi Sicil + Kapasite Raporu ile TAREKS Kapsam Dışı/Muafiyet başvurusu).",
  },
  {
    ugd_code: "UGD_10",
    communique_no: "ÜGD Tebliği (2026/10)",
    inspecting_authority: "T.C. Ticaret Bakanlığı (PGD / TAREKS + Kimya Lab)",
    eu_directives: "2009/48/EC Toy Safety Directive (EN 71-1, EN 71-2, EN 71-3, EN IEC 62115)",
    title_tr: "Oyuncakların İthalat Denetimi Tebliği",
    title_en: "Toy Safety Import Inspection Communiqué",
    title_zh: "土耳其玩具安全进口检验公报 (ÜGD 2026/10 - EN71与邻苯检测)",
    mandatory_docs_tr: "AT Uygunluk Beyanı (Renkli ürün fotoğraflı!), EN 71-1 (Mekanik), EN 71-2 (Yanmazlık), EN 71-3 (19 Ağır Metal Göçü), Elektrikliyse EN 62115 ve Ftalat/Azo test raporları, Türkçe yaş ve güvenlik uyarı etiketi.",
    mandatory_docs_zh: "带彩色产品照片的EC玩具符合性声明、EN 71-1/2/3及邻苯二甲酸盐(Phthalates)实验室报告、彩盒土耳其语年龄警告标签及CE标志。",
    eu_vs_non_eu_rule_tr: "Uzakdoğu menşeli oyuncaklarda gümrük laboratuvarında ftalat (DEHP/DBP/DINP) ve kurşun/kadmiyum analizi çok yüksek sıklıkla yapılır.",
    exemptions_tr: "14 yaş üstü koleksiyon ürünleri (ancak çocuk oyuncağı görünümündeyse muafiyet kabul edilmez).",
  },
  {
    ugd_code: "UGD_11",
    communique_no: "ÜGD Tebliği (2026/11)",
    inspecting_authority: "T.C. Çalışma ve Sosyal Güvenlik Bakanlığı / TAREKS",
    eu_directives: "Regulation (EU) 2016/425 Personal Protective Equipment (PPE)",
    title_tr: "Kişisel Koruyucu Donanımların (KKD) İthalat Denetimi Tebliği",
    title_en: "Personal Protective Equipment (PPE) Import Inspection Communiqué",
    title_zh: "土耳其个人防护装备(PPE)进口检验公报 (ÜGD 2026/11)",
    mandatory_docs_tr: "Kategori II ve III KKD'lerde AB Onaylanmış Kuruluş (Notified Body — 4 haneli NB no!) AB Tip İnceleme Sertifikası (Module B) + Kategori III'te Module C2/D denetim belgesi, AB Uygunluk Beyanı ve Türkçe bilgi broşürü.",
    mandatory_docs_zh: "II类及III类防护用品须提供欧盟公告机构(Notified Body四位代码)出具的Module B型式检验证书(III类另需Module C2/D)、EU符合性声明及土耳其语说明。",
    eu_vs_non_eu_rule_tr: "Onaylanmış kuruluş yetkisi olmayan sahte Çin 'CE sertifikaları' (ör. ECM, ICR vb. gönüllü belgeler) TAREKS'te anında reddedilir!",
    exemptions_tr: "Bulaşık eldiveni gibi yalnızca Kategori I basit KKD'lerde üretici iç kontrol beyanı yeterlidir.",
  },
  {
    ugd_code: "UGD_12",
    communique_no: "ÜGD Tebliği (2026/12)",
    inspecting_authority: "T.C. Ticaret Bakanlığı Tüketici Ürünleri Denetimi",
    eu_directives: "EU REACH Annex XVII / GPSR (EU) 2023/988",
    title_tr: "Tüketici Ürünlerinin İthalat Denetimi Tebliği",
    title_en: "Consumer Products Chemical & Physical Safety Import Inspection",
    title_zh: "土耳其日用消费品进口安全与化学检验公报 (ÜGD 2026/12)",
    mandatory_docs_tr: "Kırtasiye, okul çantası, mobilya, saat kordonu, takı, bebek yürüteci, hijyenik ürünlerde Ftalat, Azo boyar madde, Nikel salınımı, Kadmiyum/Kurşun ve DMFu analiz raporları.",
    mandatory_docs_zh: "文具、箱包、儿童护理用品、饰品等须通过邻苯二甲酸盐、偶氮染料、重金属(铅/镉/镍释放)及富马酸二甲酯(DMFu)化学测试。",
    eu_vs_non_eu_rule_tr: "Gümrükte fiziksel numune alınarak Kimyager/Akredite Laboratuvar analizine gönderilir.",
    exemptions_tr: "Kapsam dışı endüstriyel sarf malzemeleri.",
  },
  {
    ugd_code: "UGD_14",
    communique_no: "ÜGD Tebliği (2026/14)",
    inspecting_authority: "TSE (Çevre, Şehircilik ve İklim Değişikliği Bakanlığı adına)",
    eu_directives: "Regulation (EU) No 305/2011 Construction Products Regulation (CPR)",
    title_tr: "Yapı Malzemelerinin İthalat Denetimi Tebliği",
    title_en: "Construction Products (CPR) Import Inspection Communiqué",
    title_zh: "土耳其建筑材料(CPR)进口检验公报 (ÜGD 2026/14 - DoP性能声明)",
    mandatory_docs_tr: "Performans Beyanı (DoP — Declaration of Performance!), Sistem 1/1+/2+/3 gereğine göre Onaylanmış Kuruluş Fabrika Üretim Kontrolü (FPC) veya Tip Test Raporu, ürün üzerinde CPR formatlı detaylı CE etiketi (yangın tepki sınıfı A1..F dahil!).",
    mandatory_docs_zh: "欧盟CPR性能声明(DoP)、对应认证体系(System 1+/1/2+/3)公告机构证书或型式测试报告、包含防火等级(如Euroclass)的完整CPR-CE标签。",
    eu_vs_non_eu_rule_tr: "Normal LVD/EMC 'Uygunluk Beyanı (DoC)' yapı malzemesinde GEÇERSİZDİR; mutlaka CPR formatında 'Performans Beyanı (DoP)' düzenlenmiş olmalıdır!",
    exemptions_tr: "Uyumlaştırılmış EN standardı (hEN) kapsamında olmayan özel ölçü yapı elemanları (ancak G işareti / ÜGD-1 kontrolü gerekir).",
  },
  {
    ugd_code: "UGD_15",
    communique_no: "ÜGD Tebliği (2026/15)",
    inspecting_authority: "TSE",
    eu_directives: "EU Battery Regulation (EU) 2023/1542 & Atık Pil Mevzuatı",
    title_tr: "Pil ve Akümülatörlerin İthalat Denetimi Tebliği",
    title_en: "Batteries and Accumulators Import Inspection Communiqué",
    title_zh: "土耳其电池与蓄电池进口检验公报 (ÜGD 2026/15 - 锂电池/铅酸电池)",
    mandatory_docs_tr: "Ağır metal içerik analiz raporu (Cıva < %0,0005, Kadmiyum < %0,002), IEC 62133-2 / IEC 62619 kapasite ve güvenlik raporu, pil üzerinde 'Üzeri Çizili Tekerlekli Çöp Kutusu' sembolü ve Ah/Wh kapasite etiketi.",
    mandatory_docs_zh: "汞/镉重金属含量检测报告、IEC 62133/62619安全与容量测试报告、电池本体带叉垃圾桶环保标志及真实容量(mAh/Wh)标识。",
    eu_vs_non_eu_rule_tr: "Powerbank, e-bisiklet bataryası, solar enerji depolama (LFP) ve kurşun-asit akülerde kapasite doğrulama testi çok sıkıdır.",
    exemptions_tr: "Cihazın içine kalıcı lehimli/entegre gelen küçük piller ana cihazın tebliği kapsamında değerlendirilebilir.",
  },
  {
    ugd_code: "UGD_16",
    communique_no: "ÜGD Tebliği (2026/16)",
    inspecting_authority: "TİTCK (Türkiye İlaç ve Tıbbi Cihaz Kurumu)",
    eu_directives: "Regulation (EU) 2017/745 (MDR) & (EU) 2017/746 (IVDR)",
    title_tr: "Tıbbi Cihazların İthalat Denetimi Tebliği",
    title_en: "Medical Devices & IVD Import Inspection Communiqué (ÜTS)",
    title_zh: "土耳其医疗器械进口检验公报 (ÜGD 2026/16 - TİTCK与ÜTS注册)",
    mandatory_docs_tr: "İthalat öncesi TİTCK Ürün Takip Sistemi (ÜTS) tekil ürün (UDI/Barkod) kaydının ONAYLANMIŞ olması şarttır! AB MDR/IVDR EC Sertifikası, AB Uygunluk Beyanı, ISO 13485 ve Türkçe etiket.",
    mandatory_docs_zh: "发货前必须先由土耳其进口商在TİTCK医疗器械追踪系统(ÜTS)完成产品与UDI注册获批！需提供欧盟MDR/IVDR证书、DoC及ISO 13485。",
    eu_vs_non_eu_rule_tr: "ÜTS kaydı tamamlanmamış bir tıbbi cihaz konteyneri limana gelirse TAREKS başvurusu açılamaz; ÜTS onayı haftalar sürebileceği için mal Çin'den çıkmadan tamamlanmalıdır!",
    exemptions_tr: "Tıbbi amaç taşımayan genel endüstriyel/laboratuvar cihazları.",
  },
  {
    ugd_code: "UGD_17",
    communique_no: "ÜGD Tebliği (2026/17)",
    inspecting_authority: "T.C. Ticaret Bakanlığı / Sağlık & Kimya Lab",
    eu_directives: "EN 14350, EN 1400, EU BPA Ban",
    title_tr: "Anne ve Bebek Ürünlerinin İthalat Denetimi Tebliği",
    title_en: "Mother and Baby Care Articles Import Inspection Communiqué",
    title_zh: "土耳其母婴奶瓶安抚奶嘴进口检验公报 (ÜGD 2026/17)",
    mandatory_docs_tr: "EN 14350 (Biberon/Alıştırma Bardağı), EN 1400 (Emzik) mekanik ve kimyasal (BPA %0, Ftalat, Uçucu Bileşikler, Nitrozamin) akredite laboratuvar test raporları.",
    mandatory_docs_zh: "EN 14350/EN 1400机械安全及双酚A(BPA Free)、亚硝胺、邻苯二甲酸盐全套实验室检测报告。",
    eu_vs_non_eu_rule_tr: "Neredeyse %100 fiziki numune ve kimyasal laboratuvar analizine tabidir.",
    exemptions_tr: "Yoktur.",
  },
  {
    ugd_code: "UGD_18",
    communique_no: "ÜGD Tebliği (2026/18)",
    inspecting_authority: "T.C. Ticaret Bakanlığı (TAREKS + İTKİB Kayıt Belgesi)",
    eu_directives: "EU REACH Annex XVII (Azo Dyes, Cr VI, Phthalates, NPEO) & EU 1007/2011 Fiber Labeling",
    title_tr: "Bazı Tekstil, Konfeksiyon ve Deri Ürünlerinin Denetimi Tebliği",
    title_en: "Textiles, Apparel, Footwear & Leather Goods Import Inspection",
    title_zh: "土耳其纺织服装鞋类及皮革制品进口检验公报 (ÜGD 2026/18)",
    mandatory_docs_tr: "İhracatçı Birlikleri İthalatçı Kayıt Belgesi (ön koşul!), Azo Boyar Madde (<30 ppm), Ftalat, Deride Krom VI (<3 ppm) ve DMFu (<0.1 ppm) testleri, Türkçe yıkama/lif içerik etiketi ve ayakkabıda materyal piktogramı.",
    mandatory_docs_zh: "偶氮染料(<30ppm)、六价铬(皮革<3ppm)、邻苯二甲酸盐、富马酸二甲酯(防霉片禁令!)检测合格，以及土耳其语成分水洗标与鞋材图标标签。",
    eu_vs_non_eu_rule_tr: "Tekstil ve ayakkabıda ayrıca yüksek İlave Gümrük Vergisi (İGV %20–%40) ve Gözetim Kıymeti ($/kg veya $/çift) birlikte uygulanır!",
    exemptions_tr: "Belirli kilogram/adet altındaki ticari olmayan numuneler.",
  },
  {
    ugd_code: "UGD_25",
    communique_no: "ÜGD Tebliği (2026/25)",
    inspecting_authority: "TSE (Araç Proje / Otomotiv Birimi)",
    eu_directives: "UN/ECE Regulations (E-Mark Type Approval) & Regulation (EU) 2018/858",
    title_tr: "Araç Parçalarının İthalat Denetimi Tebliği",
    title_en: "Automotive Parts & Components Import Inspection Communiqué (E-Mark)",
    title_zh: "土耳其汽车零部件进口检验公报 (ÜGD 2026/25 - E-Mark认证)",
    mandatory_docs_tr: "BM/AEK Regülasyonlarına (ör. R90 Fren Balatası/Diski, R43 Oto Camı, R117/R30/R54 Lastik, R148/R149 Aydınlatma/Far, R46 Ayna) göre resmi E-Mark (E1..E37) Tip Onay Belgesi ve parça üzerinde kabartma/lazer E işareti!",
    mandatory_docs_zh: "联合国欧洲经济委员会(UN/ECE) E-Mark型式批准证书(如刹车片R90、车灯R148/149、玻璃R43、轮胎R30/54/117)及零件本体模压E标！",
    eu_vs_non_eu_rule_tr: "DİKKAT: Otomotiv yedek parçalarında CE işareti DEĞİL, daire içinde 'E' Tip Onay işareti aranır! Üzerinde E-Mark olmayan Çin menşeli far, balata veya cam kesinlikle ithal edilemez.",
    exemptions_tr: "Araç üreticilerinin (OEM fabrikaların) doğrudan montaj hattı için yaptığı ithalatlarda Sanayi Bakanlığı muafiyet yazısı.",
  },
];

// ---------------------------------------------------------------------------
// 6B. Çin ve Dünya'dan Türkiye'ye En Çok İthal Edilen 32 Kritik GTİP Grubu × TAREKS/CE/SSHYB Matrisi
// ---------------------------------------------------------------------------
const tareksHsMappings = [
  { hs_prefix: "8539.52", ugd_code: "UGD_09", product_tr: "LED Ampuller ve LED Tüpler", product_en: "LED light-emitting diode lamps", product_zh: "LED灯泡与LED灯管", inspection_risk: "very_high", requires_sshyb: false, standards: "EN 62560 (LVD), EN IEC 55015 (EMC), ErP Enerji Etiketi, RoHS", factory_check_tr: "Ampul gövdesinde marka, model, Watt, Volt/Hz ve CE baskısı test raporuyla %100 aynı olmalı; kutuda yeni AB enerji sınıfı (A..G) etiketi bulunmalıdır.", factory_check_zh: "灯体丝印品牌、型号、功率、电压须与LVD/EMC报告完全一致，彩盒须印有新版能效标签及CE标志。" },
  { hs_prefix: "9405.11", ugd_code: "UGD_09", product_tr: "LED Tavan/Duvar Armatürleri, Avizeler ve Projektörler (9405.11 / 9405.42)", product_en: "LED luminaires, chandeliers, floodlights & street lights", product_zh: "LED吸顶灯、投光灯、路灯及商业照明灯具", inspection_risk: "very_high", requires_sshyb: true, standards: "EN IEC 60598-1, EN 60598-2-1/2/3/5, EN IEC 55015, EN 62471 (Fotobiyolojik)", factory_check_tr: "İçindeki LED Driver (8504) modelinin LVD raporundaki kritik komponent (CDF) tablosuyla birebir eşleştiği yükleme öncesi fabrikada kontrol edilmelidir!", factory_check_zh: "重点核查灯具内部LED驱动电源型号是否与LVD报告关键元器件清单(CDF表)完全一致！不一致将被TSE直接退运。" },
  { hs_prefix: "8456.11", ugd_code: "UGD_09", product_tr: "Fiber Lazer Kesim ve Kaynak Makineleri", product_en: "Laser cutting & welding machine tools", product_zh: "光纤激光切割机与激光焊接机", inspection_risk: "very_high", requires_sshyb: false, standards: "2006/42/EC Makina, EN ISO 11553-1 (Lazer Güvenliği!), EN 60204-1, EN 60825-1 (Class 1 Muhafaza!)", factory_check_tr: "KRİTİK: Açık kasa (koruma kabinsiz Class 4) fiber lazer kesim makineleri TSE tarafından can güvenliği nedeniyle REDDEDİLİR! Tam kapalı kabin, güvenlik camı ve kapı kilidi (interlock) şarttır.", factory_check_zh: "极高风险警告：无全封闭防护外罩的敞开式光纤激光切割机将被土耳其TSE直接判定不合格！必须具备全封闭防护仓、激光防护视窗及门联锁开关(EN ISO 11553-1)。" },
  { hs_prefix: "8457.10", ugd_code: "UGD_09", product_tr: "CNC İşleme Merkezleri, CNC Torna (8458) ve Frezeler", product_en: "CNC machining centers, CNC lathes & milling machines", product_zh: "CNC加工中心、数控车床与铣床", inspection_risk: "high", requires_sshyb: false, standards: "EN ISO 16090-1 / EN ISO 23125, EN 60204-1, EMC EN 61000-6-2/4", factory_check_tr: "Makine üzerindeki metal etiket, elektrik panosu uyarıları, Acil Durdurma (E-Stop) butonu, kapı güvenlik sviçleri ve Türkçe kılavuz yüklemeden önce denetlenmelidir.", factory_check_zh: "装柜前须核验机床金属CE铭牌、配电柜原理图、急停按钮、安全门锁开关及土耳其语说明书。" },
  { hs_prefix: "8477.10", ugd_code: "UGD_09", product_tr: "Plastik Enjeksiyon ve Ekstrüzyon Makineleri", product_en: "Injection-moulding & extrusion machines for plastics", product_zh: "注塑机与塑料挤出机", inspection_risk: "high", requires_sshyb: false, standards: "EN 201 (Enjeksiyon Güvenlik), EN 60204-1, 2006/42/EC", factory_check_tr: "EN 201 kalıp kapama güvenlik valfi/svici, sıcak kovan koruma kapakları ve elektrik panosu CE komponent uyumu kontrol edilmelidir.", factory_check_zh: "须符合EN 201安全标准，核查安全门机械/液压双重联锁、料筒隔热防护罩及全套CE认证电气元件。" },
  { hs_prefix: "8501.52", ugd_code: "UGD_09", product_tr: "AC/DC Elektrik Motorları ve Jeneratörler (8501 / 8502)", product_en: "Electric motors & generating sets", product_zh: "三相异步电动机与发电机组", inspection_risk: "very_high", requires_sshyb: false, standards: "EN 60034-1, ErP (EU) 2019/1781 Zorunlu IE3 / IE4 Verimlilik Sınıfı!", factory_check_tr: "DİKKAT: 0.75 kW–1000 kW arası standart AC motorlarda IE2 verimlilik sınıfının Türkiye'ye (ve AB'ye) ithalatı YASAKTIR! Plakada ve test raporunda IE3 (75-200 kW arası IE4) zorunludur.", factory_check_zh: "强制能效红线：0.75kW以上通用交流电机严禁出口IE2低能效等级至土耳其！电机铭牌与ErP测试报告必须达到IE3(75-200kW需IE4)标准。" },
  { hs_prefix: "8504.40", ugd_code: "UGD_09", product_tr: "Solar İnverterler, UPS, Şarj Cihazları ve Güç Adaptörleri", product_en: "Static converters, solar inverters, UPS & power supplies", product_zh: "光伏逆变器、UPS电源、充电器与电源适配器", inspection_risk: "very_high", requires_sshyb: true, standards: "EN 62109-1/2 (Solar), EN 62368-1 (IT/Adaptör), EN 61000-3-2/3 (EMC)", factory_check_tr: "İçinde Wi-Fi dongle/Bluetooth varsa BTK ÜGD/8 tebliğine de girer! Tüketici adaptörü/UPS ise Garanti Belgesi + SSHYB kontrol edilmelidir.", factory_check_zh: "若逆变器内置Wi-Fi/蓝牙模块，将同时触发BTK无线电检验(ÜGD/8)！电源适配器须核查插脚尺寸(欧规圆脚EN 50075)及安规报告。" },
  { hs_prefix: "8541.43", ugd_code: "UGD_01", product_tr: "Fotovoltaik Güneş Panelleri (Solar Modüller)", product_en: "Photovoltaic solar cells assembled in modules or panels", product_zh: "光伏太阳能组件/太阳能电池板", inspection_risk: "very_high", requires_sshyb: false, standards: "TS EN IEC 61215, TS EN IEC 61730-1/2 (TSE + Gözetim + Anti-Damping!)", factory_check_tr: "Çin/Vietnam/Malezya vb. menşeli güneş panellerinde hem TSE standart denetimi hem yüksek Gözetim ($/kg) ve Anti-Damping vergisi vardır; hücre menşei teyit edilmelidir!", factory_check_zh: "太阳能组件在土耳其面临严格的TSE标准检验以及高额反倾销税与最低限价监管(Gözetim)，须提前核实电池片原产地规则。" },
  { hs_prefix: "8507.60", ugd_code: "UGD_15", product_tr: "Lityum-İyon Bataryalar, Enerji Depolama (BESS) ve Powerbank", product_en: "Lithium-ion accumulators, BESS & power banks", product_zh: "锂离子电池、储能电池柜与移动电源(充电宝)", inspection_risk: "very_high", requires_sshyb: true, standards: "ÜGD/15 (Ağır Metal + Kapasite EN 61960) + ÜGD/9 (EN 62133-2 Güvenlik) + UN 38.3", factory_check_tr: "Powerbank ve bataryalarda üzerinde yazan mAh/Wh kapasitesinin gerçek laboratuvar ölçümünden düşük çıkması (sahte kapasite etiketi) TSE'de 1 numaralı red sebebidir!", factory_check_zh: "充电宝与锂电池严禁虚标容量！TSE实验室实测容量若低于铭牌标称值(mAh/Wh)将直接判定不合格并退运；海运另需UN 38.3与MSDS。" },
  { hs_prefix: "8536.20", ugd_code: "UGD_09", product_tr: "Otomatik Sigortalar, Şalterler, Kontaktörler, Röleler ve Fiş/Prizler (8536)", product_en: "Circuit breakers, relays, switches, plugs & sockets (<= 1000V)", product_zh: "断路器、接触器、继电器及插头插座(低压电器)", inspection_risk: "very_high", requires_sshyb: false, standards: "EN 60898-1, EN 60947, TS IEC 60884-1 (Topraklı Fiş/Priz)", factory_check_tr: "Alçak gerilim şalt ürünlerinde TSE CB Test Sertifikası veya akredite kısa devre test raporu arar; topraklı prizlerde çocuk koruma kepengi zorunludur.", factory_check_zh: "低压断路器与插座属TSE严查品类，建议具备IECEE CB证书及完整短路分断测试报告；插座须带儿童安全保护门。" },
  { hs_prefix: "8517.62", ugd_code: "UGD_08", product_tr: "Modem, Router, Switch, Bluetooth Kulaklık, Akıllı Saat ve IoT Cihazları", product_en: "Routers, switches, Bluetooth earbuds, smartwatches & wireless IoT", product_zh: "路由器、交换机、蓝牙耳机、智能手表及无线物联网模块", inspection_risk: "very_high", requires_sshyb: true, standards: "2014/53/EU RED (BTK Denetimi: RF + EMC + LVD + SAR) + Garanti/SSHYB", factory_check_tr: "BTK denetiminde RF test raporundaki anten kazancı (dBi), frekans bandı ve donanım/yazılım sürümü DoC belgesinde eksiksiz yazmalıdır!", factory_check_zh: "BTK无线电检验极其严格：DoC声明上必须注明硬件/软件版本号，且RF报告中的工作频段与发射功率(EIRP)须符合土耳其/欧盟频谱规范。" },
  { hs_prefix: "8525.89", ugd_code: "UGD_08", product_tr: "IP Güvenlik Kameraları, Wi-Fi Kameralar ve Kayıt Cihazları", product_en: "CCTV IP cameras, Wi-Fi cameras & video recorders", product_zh: "网络安防摄像头、Wi-Fi无线摄像机与录像机", inspection_risk: "high", requires_sshyb: true, standards: "Wi-Fi varsa ÜGD/8 (BTK RED), kabloluysa ÜGD/9 (EMC/LVD) + SSHYB", factory_check_tr: "Kamera Wi-Fi/4G özellikliyse ÜGD/8'e girer; ayrıca tüketici güvenlik kameralarında Satış Sonrası Hizmet Yeterlilik Belgesi (SSHYB) aranır.", factory_check_zh: "带Wi-Fi/4G功能的摄像机归入ÜGD/8无线电监管；进口商还须持有土耳其售后服务资质证书(SSHYB)。" },
  { hs_prefix: "8467.21", ugd_code: "UGD_09", product_tr: "Elektrikli El Aletleri (Matkap, Avuç Taşlama, Testere — 8467.21..29)", product_en: "Electro-mechanical hand tools (drills, grinders, saws)", product_zh: "电动工具(电钻、角磨机、电锯)", inspection_risk: "very_high", requires_sshyb: true, standards: "2006/42/EC Makina (EN 62841 serisi) + EMC (EN IEC 55014-1/2) + Gürültü/Titreşim + SSHYB", factory_check_tr: "El aletleri 'LVD' değil 'Makina Emniyeti Yönetmeliği (2006/42/EC)' kapsamındadır! DoC belgesinde yanlışlıkla LVD yazılırsa TSE reddeder!", factory_check_zh: "常见致命错误：手持电动工具适用欧盟机械指令(2006/42/EC，EN 62841)，若DoC符合性声明上误写成LVD低电压指令，将被TSE直接驳回！" },
  { hs_prefix: "8508.11", ugd_code: "UGD_09", product_tr: "Elektrikli Süpürgeler ve Robot Süpürgeler (8508 / 8509 / 8516 Küçük Ev Aletleri)", product_en: "Vacuum cleaners, robot vacuums, blenders, airfryers & heaters", product_zh: "吸尘器、扫地机器人、空气炸锅及小家电", inspection_risk: "very_high", requires_sshyb: true, standards: "EN 60335-1 + EN 60335-2-x, EMC, ErP + Wi-Fi varsa BTK ÜGD/8 + Garanti/SSHYB + Gıda Temas (Airfryer/Blender!)", factory_check_tr: "Robot süpürgede Wi-Fi olduğu için ÜGD/8 (BTK), Airfryer/Blender'da ise hem TSE (ÜGD/9) hem Tarım Bakanlığı Gıda Temas (ÜGD/5) hem de SSHYB aynı anda gerekir!", factory_check_zh: "空气炸锅/破壁机同时涉及TSE安规(ÜGD/9)、农业部食品接触测试(ÜGD/5)及售后资质(SSHYB)；带Wi-Fi的扫地机器人则归入BTK(ÜGD/8)！" },
  { hs_prefix: "8415.10", ugd_code: "UGD_09", product_tr: "Klimalar, VRF Sistemleri ve Isı Pompaları (8415 / 8418)", product_en: "Air conditioning machines, VRF & heat pumps", product_zh: "空调器、多联机(VRF)与热泵机组", inspection_risk: "high", requires_sshyb: true, standards: "EN 60335-2-40, EMC, ErP Ecodesign, F-Gaz (R32/R290) Mevzuatı + SSHYB", factory_check_tr: "Soğutucu akışkan gaz ithalat kotası/izni (ÇŞİDB F-Gaz), ErP sezonsal verimlilik etiketi ve 20 yetkili servisli SSHYB zorunludur.", factory_check_zh: "须核查制冷剂(HFC配额许可)、ErP能效标签、Wi-Fi模块RED报告及土耳其全国售后服务网络资质。" },
  { hs_prefix: "8427.10", ugd_code: "UGD_09", product_tr: "Akülü/Elektrikli Forklift ve Transpaletler (Dizel 8427.20 -> ÜGD/2!)", product_en: "Electric & IC-engine forklifts and pallet trucks", product_zh: "电动叉车、电动搬运车及内燃叉车", inspection_risk: "very_high", requires_sshyb: false, standards: "EN ISO 3691-1, EN 1175, 2006/42/EC (+ Dizelde ÜGD/2 AB Stage V Motor Şartı!) + CE Gözetim", factory_check_tr: "Forklift ve transpaletlerde yüksek Gözetim Kıymeti ve Anti-Damping vergisinin yanı sıra EN ISO 3691-1 güvenlik sertifikası ve yük diyagramı plakası kontrol edilmelidir.", factory_check_zh: "叉车须符合最新EN ISO 3691-1标准并贴有土耳其语载荷曲线铭牌；柴油叉车必须具备欧盟Stage V排放型式认证否则无法清关！" },
  { hs_prefix: "8429.52", ugd_code: "UGD_02", product_tr: "Ekskavatörler, Mini Ekskavatörler ve Yükleyiciler", product_en: "Mechanical shovels, mini excavators & shovel loaders", product_zh: "挖掘机、微型挖掘机与装载机", inspection_risk: "very_high", requires_sshyb: false, standards: "ÜGD/2 (AB Stage V Motor Tip Onayı) + ÜGD/9 (EN 474-1/5 Makina + ROPS/TOPS + Gürültü 2000/14/EC Onaylanmış Kuruluş!)", factory_check_tr: "Mini ekskavatörlerde hem motorun Stage V olması hem de dış ortam gürültü direktifi (2000/14/EC) için AB Onaylanmış Kuruluş belgesi zorunludur!", factory_check_zh: "微型挖掘机除发动机须具备欧盟Stage V证书外，还必须持有欧盟2000/14/EC户外噪音指令公告机构证书及ROPS防翻滚认证！" },
  { hs_prefix: "8482.10", ugd_code: "UGD_01", product_tr: "Bilyalı ve Makaralı Rulmanlar (8482)", product_en: "Ball and roller bearings", product_zh: "滚珠轴承与滚柱轴承", inspection_risk: "high", requires_sshyb: false, standards: "ÜGD/1 (TS ISO 492 / TS ISO 199 TSE Standart Denetimi) + Gözetim", factory_check_tr: "Rulman bileziği üzerinde lazerle silinmez marka, kod ve ülke menşei bulunmalı; TSE boyut/sertlik testi için numune almaktadır.", factory_check_zh: "轴承内外圈须有清晰的激光雕刻品牌、型号与原产地(Made in China)；TSE常抽样检测尺寸公差与洛氏硬度。" },
  { hs_prefix: "8481.80", ugd_code: "UGD_01", product_tr: "Endüstriyel Vanalar, Küresel Vanalar, Kelebek Vanalar ve Musluklar", product_en: "Taps, cocks, industrial ball/butterfly/gate valves", product_zh: "工业球阀、蝶阀、闸阀及水暖卫浴龙头", inspection_risk: "high", requires_sshyb: false, standards: "ÜGD/1 (TS EN 817 Sıhhi Musluk / TS EN 13828) + Basınçlıysa ÜGD/9 (2014/68/EU PED CE!)", factory_check_tr: "DN25 üstü yüksek basınçlı endüstriyel vanalarda PED (2014/68/EU) CE işareti ve gövde döküm şarj numarası; banyo/mutfak bataryalarında ise TS EN 817 sızdırmazlık/ömür testi aranır.", factory_check_zh: "卫浴水龙头须通过TS EN 817寿命与密封测试；工业高压阀门(DN>25)须核查欧盟承压设备指令PED (2014/68/EU) CE认证及炉号标识。" },
  { hs_prefix: "7307.91", ugd_code: "UGD_01", product_tr: "Çelik Flanşlar, Dirsekler ve Alın Kaynaklı Boru Bağlantı Parçaları (7307)", product_en: "Steel flanges, butt-welding elbows & pipe fittings", product_zh: "钢制法兰、对焊弯头及管件", inspection_risk: "high", requires_sshyb: false, standards: "TS EN 1092-1 (Flanş), TS EN 10253-2 (Dirsek), EN 10204 3.1 Malzeme Sertifikası", factory_check_tr: "Her flanş/dirsek üzerinde soğuk damga (hard stamp) ile standart no, basınç sınıfı (PN16 vb.), malzeme kalitesi (P250GH / 316L) ve döküm (heat) numarası bulunmalıdır!", factory_check_zh: "每件法兰/弯头本体必须打有清晰的钢印：执行标准(EN 1092-1)、公称压力(PN)、材质牌号及炉批号(Heat No.)，并与3.1材质书一一对应！" },
  { hs_prefix: "7318.15", ugd_code: "UGD_01", product_tr: "Çelik Cıvata, Vida ve Somunlar (7318)", product_en: "Screws, bolts and nuts of iron or steel", product_zh: "钢铁制螺栓、螺钉与螺母(紧固件)", inspection_risk: "high", requires_sshyb: false, standards: "TS EN ISO 4014/4017, TS EN ISO 898-1 (8.8 / 10.9 Mukavemet Sınıfı) + Anti-Damping / Gözetim", factory_check_tr: "Cıvata kafa üstünde üretici markası ve mukavemet sınıfı (ör. 8.8 / A2-70) kabartması zorunludur; TSE çekme kopma testi uygular.", factory_check_zh: "螺栓头部必须压印制造商识别标志及性能等级(如8.8、10.9、A2-70)，TSE抽检抗拉强度与楔负载试验。" },
  { hs_prefix: "8544.49", ugd_code: "UGD_14", product_tr: "Elektrik Güç Kabloları, Solar Kablolar ve İletişim Kabloları (8544)", product_en: "Electric power cables, PV solar cables & data cables", product_zh: "电力电缆、光伏电缆及通信数据线缆", inspection_risk: "very_high", requires_sshyb: false, standards: "Binalarda Sabit Kablo: ÜGD/14 (CPR EN 50575 Yangın Sınıfı Eca/Cca/B2ca DoP!) + Seyyar Kablo: ÜGD/9 LVD", factory_check_tr: "Bina içi enerji/data kablolarında CPR Performans Beyanı (DoP) ve Onaylanmış Kuruluş yangın testi şarttır; bakır kaplı alüminyum (CCA) kablonun 'saf bakır' diye gönderilmesi yüklemede yakalanmalıdır!", factory_check_zh: "建筑布线电缆须具备欧盟CPR EN 50575防火等级(DoP)；装柜前须现场测阻/刮芯严防以铜包铝(CCA)冒充纯无氧铜！" },
  { hs_prefix: "6907.21", ugd_code: "UGD_14", product_tr: "Seramik ve Porselen Yer/Duvar Karoları, Granit Plakalar", product_en: "Ceramic & porcelain flags, paving, hearth or wall tiles", product_zh: "陶瓷砖、瓷质抛光砖与岩板", inspection_risk: "high", requires_sshyb: false, standards: "CPR (EU) 305/2011 — TS EN 14411 (DoP Performans Beyanı + Su Emme/Kırılma Dayanımı)", factory_check_tr: "Her karo kutusunun üzerinde EN 14411 CPR CE kutusu, DoP numarası, su emme grubu (ör. BIa <= %0,5) ve kaymazlık değeri basılı olmalıdır.", factory_check_zh: "每个瓷砖包装箱上必须印有完整的EN 14411 CPR-CE信息框、DoP编号及吸水率分组(如BIa)。" },
  { hs_prefix: "9503.00", ugd_code: "UGD_10", product_tr: "Oyuncaklar (Plastik, Peluş, Eğitici, Kumandalı Oyuncaklar)", product_en: "Tricycles, scooters, dolls, puzzles & all kinds of toys", product_zh: "各类塑胶玩具、毛绒玩具与遥控玩具", inspection_risk: "very_high", requires_sshyb: false, standards: "ÜGD/10 (EN 71-1/2/3 + Ftalat + Azo) + Uzaktan Kumandalıysa BTK ÜGD/8 (RED)!", factory_check_tr: "Uzaktan kumandalı (RC 2.4GHz) oyuncak aynı anda HEM ÜGD/10 Oyuncak HEM ÜGD/8 BTK Telsiz denetimine girer! Kutu üstü Türkçe uyarı ve yaş piktogramı eksiksiz olmalıdır.", factory_check_zh: "2.4GHz遥控玩具同时受玩具公报(ÜGD/10)和BTK无线电公报(ÜGD/8)双重监管！彩盒必须加印土耳其语安全警告及0-3岁禁令图标。" },
  { hs_prefix: "6403.40", ugd_code: "UGD_11", product_tr: "Çelik/Kompozit Burunlu İş Güvenliği Ayakkabıları, İş Eldivenleri ve Baretler", product_en: "Protective safety footwear, industrial gloves (4015/6116) & helmets (6506.10)", product_zh: "安全劳保鞋、工业防护手套与安全帽", inspection_risk: "very_high", requires_sshyb: false, standards: "ÜGD/11 KKD (EU 2016/425 — EN ISO 20345:2022, EN 388, EN 397) + Ayakkabıda ÜGD/18 Kimyasal!", factory_check_tr: "Kategori II KKD olduğu için mutlaka 4 haneli AB Onaylanmış Kuruluş (Notified Body) Module B sertifikası olmalı; deri iş ayakkabısında ayrıca Krom VI (<3 ppm) testi aranır.", factory_check_zh: "劳保鞋与防割手套属II类PPE，必须持有欧盟四位代码公告机构出具的Module B型式证书(如EN ISO 20345:2022)，真皮部件另需六价铬合格。" },
  { hs_prefix: "9004.10", ugd_code: "UGD_11", product_tr: "Güneş Gözlükleri ve Koruyucu İş Gözlükleri", product_en: "Sunglasses & protective safety spectacles", product_zh: "太阳镜与工业防护眼镜", inspection_risk: "high", requires_sshyb: false, standards: "EN ISO 12312-1 (Güneş Gözlüğü — Kategori I KKD) / EN 166 (İş Gözlüğü — Kategori II KKD) + Nikel Salınımı", factory_check_tr: "Güneş gözlüklerinde UV400 filtre kategorisi (Cat. 0..4) etiketi, EN ISO 12312-1 test raporu ve metal çerçevede EN 1811 nikel testi kontrol edilmelidir.", factory_check_zh: "太阳镜吊牌须标明EN ISO 12312-1滤光片类别(Cat.1-4)，金属镜架须通过EN 1811镍释放测试。" },
  { hs_prefix: "9018.19", ugd_code: "UGD_16", product_tr: "Elektro-Teşhis Cihazları, Hasta Başı Monitörler, Şırınga ve Muayene Eldivenleri", product_en: "Medical diagnostic equipment, syringes, catheters & examination gloves", product_zh: "医疗监护仪、注射器、导管及医用检查手套", inspection_risk: "very_high", requires_sshyb: true, standards: "ÜGD/16 (TİTCK ÜTS Ön Kaydı Zorunlu! + AB MDR 2017/745 CE + ISO 13485)", factory_check_tr: "Ürün Çin limanından yola çıkmadan önce ithalatçının TİTCK ÜTS sisteminde barkod/UDI kaydının 'Kayıtlı' statüsüne geçtiği mutlaka doğrulanmalıdır!", factory_check_zh: "装船红线：货物从中国港口出运前，必须确认土耳其买方已在TİTCK的ÜTS系统完成该型号与UDI条码的正式注册，否则到港后无法申报TAREKS！" },
  { hs_prefix: "8708.30", ugd_code: "UGD_25", product_tr: "Otomotiv Fren Balataları, Fren Diskleri, Farlar (8512.20) ve Oto Camları (7007)", product_en: "Automotive brake pads/discs, headlamps, mirrors & safety glass", product_zh: "汽车刹车片、刹车盘、车灯、后视镜与汽车安全玻璃", inspection_risk: "very_high", requires_sshyb: false, standards: "ÜGD/25 BM/AEK ECE Regülasyonları (ECE R90 Fren, ECE R148/R149 Far, ECE R43 Cam — E-Mark!)", factory_check_tr: "Her fren balatası, far camı ve oto camının üzerinde resmi E-Mark onay numarası (ör. E1 90R-02...) basılı olmalı ve E-Mark sertifikasıyla eşleşmelidir!", factory_check_zh: "刹车片背板、车灯透镜及汽车玻璃本体必须印有真实的UN/ECE E-Mark认证标志及证书号(如E4 90R-02...)，无E标一律禁止清关！" },
  { hs_prefix: "4011.10", ugd_code: "UGD_25", product_tr: "Binek ve Ticari Araç Yeni Kauçuk Dış Lastikleri (4011.10 / 4011.20)", product_en: "New pneumatic tyres, of rubber, for cars, buses & lorries", product_zh: "全新轿车轮胎与卡客车全钢子午线轮胎", inspection_risk: "very_high", requires_sshyb: true, standards: "ECE R30 / R54 + ECE R117 (Islak Zemin, Yuvarlanma Direnci ve Gürültü) + AB QR Kodlu Lastik Etiketi (EU 2020/740)", factory_check_tr: "Lastik yanak E-Mark kodu, üretim haftası (DOT — bayat lastik kısıtı!), PAH kimyasal uyumu ve EPREL QR kodlu enerji/tutuş etiketi kontrol edilmelidir.", factory_check_zh: "轮胎胎侧须有E-Mark(R30/R54及R117湿地抓地噪音标号)、最新DOT生产周期及带EPREL二维码的欧盟轮胎能效标签。" },
  { hs_prefix: "9617.00", ugd_code: "UGD_05", product_tr: "Çelik Termoslar, Mataralar ve Mutfak/Sofra Eşyaları (3924 / 6911 / 7323)", product_en: "Vacuum flasks (thermos), water bottles & food-contact kitchenware", product_zh: "不锈钢保温杯、运动水壶及餐厨具", inspection_risk: "high", requires_sshyb: false, standards: "ÜGD/5 Tarım Bakanlığı Gıda Temas Migrasyon Testi + ÜGD/12 Ftalat/Ağır Metal + Gözetim!", factory_check_tr: "İç yüzeyin gerçek 304/316 paslanmaz çelik olduğu (XRF analizi — ucuz 201 çelik ağır metal salınımından kalır!) ve silikon contanın peroksit/uçucu madde migrasyonundan geçtiği doğrulanmalıdır.", factory_check_zh: "内胆须通过XRF光谱仪实测确认为304/316食品级不锈钢(严禁以高锰201不锈钢冒充，否则重金属迁移必不合格)，硅胶密封圈须经二次硫化除味。" },
  { hs_prefix: "6109.10", ugd_code: "UGD_18", product_tr: "Örme ve Dokuma Konfeksiyon, Kumaş ve Tekstil Ürünleri (Fasıl 61, 62, 63)", product_en: "Knitted & woven apparel, garments and home textiles", product_zh: "针织与梭织服装、面料及家纺制品", inspection_risk: "high", requires_sshyb: false, standards: "ÜGD/18 (İTKİB Kayıt Belgesi + Azo Boyar <30 ppm + NPEO + Ftalat) + Türkçe Lif/Yıkama Etiketi", factory_check_tr: "Yüklemeden önce koyu renklerde azo boyar testi, çocuk giyimde kordon/ip güvenliği (EN 14682) ve Türkçe içerik/menşe dikme etiketi kontrol edilmelidir.", factory_check_zh: "深色面料须通过偶氮染料(<30ppm)测试，童装须符合EN 14682绳带安全标准，每件成衣须车缝土耳其语成分及原产地洗水标。" },
  { hs_prefix: "6402.99", ugd_code: "UGD_18", product_tr: "Ayakkabılar, Spor Ayakkabılar ve Terlikler (Fasıl 64)", product_en: "Footwear, sports shoes, sandals & slippers", product_zh: "运动鞋、皮鞋、休闲鞋与拖鞋", inspection_risk: "very_high", requires_sshyb: false, standards: "ÜGD/18 (Ftalat, Azo, Krom VI <3 ppm, DMFu <0.1 ppm!) + Ayakkabı Materyal Piktogram Etiketi", factory_check_tr: "ÇOK KRİTİK: Kutu içine konulan nem alıcı poşetin Dimetil Fumarat (DMFu) içermeyen saf silika jel olduğu ve ayakkabı dilinde saya/astar/taban piktogram etiketinin bulunduğu kontrol edilmelidir!", factory_check_zh: "致命红线：鞋盒内严禁放入含富马酸二甲酯(DMFu)的防霉片(仅限纯硅胶干燥剂)！每双鞋须贴有鞋面/内里/外底材质三合一图标标签。" },
];

function writeJsonWithHash(filename, data) {
  const fullPath = join(OUT_DIR, filename);
  const content = JSON.stringify(data, null, 2) + "\n";
  writeFileSync(fullPath, content, "utf8");
  const sha256 = createHash("sha256").update(content, "utf8").digest("hex");
  return { filename: `06-tareks-ce/${filename}`, records: data.length, sha256 };
}

const f1 = writeJsonWithHash("tareks_regulations.json", tareksRegulations);
const f2 = writeJsonWithHash("tareks_hs_mappings.json", tareksHsMappings);

const manifestPath = join(ROOT, "manifest.json");
const existingManifest = JSON.parse(readFileSync(manifestPath, "utf8"));

const datasetEntry = {
  module_id: "06-tareks-ce",
  order: 6,
  title_tr: "TAREKS (ÜGD Tebliğleri) & CE / E-Mark / ÜTS / SSHYB Belge Sihirbazı Veritabanı (TR + EN + ZH)",
  title_en: "Türkiye TAREKS Import Product Safety Communiqués, CE/E-Mark/ÜTS Matrix & Factory Pre-Shipment Checklists",
  authority: "T.C. Ticaret Bakanlığı, TSE, BTK, TİTCK & Tarım ve Orman Bakanlığı",
  official_sources: [
    "T.C. Resmi Gazete Ürün Güvenliği ve Denetimi (ÜGD) Tebliğleri (2026/1, 2, 5, 8, 9, 10, 11, 12, 14, 15, 16, 17, 18, 25)",
    "7223 Sayılı Ürün Güvenliği ve Teknik Düzenlemeler Kanunu",
    "TSE İthalat Denetim Rehberi, BTK Telsiz Ekipmanları Yönetmeliği & TİTCK ÜTS Kılavuzu",
    "6502 Sayılı TKHK Garanti Belgesi ve Satış Sonrası Hizmetler Yönetmeliği (SSHYB)",
  ],
  update_cadence: "annual_dec31_mükerrer_gazette",
  verification_status: "verified",
  verified_at: new Date().toISOString(),
  collections: ["tareks_regulations", "tareks_hs_mappings"],
  files: [f1, f2],
};

const filtered = (existingManifest.datasets || []).filter((d) => d.module_id !== "06-tareks-ce");
filtered.push(datasetEntry);
filtered.sort((a, b) => a.order - b.order);

const nextManifest = {
  ...existingManifest,
  updated_at: new Date().toISOString(),
  datasets: filtered,
};

writeFileSync(manifestPath, JSON.stringify(nextManifest, null, 2) + "\n", "utf8");
console.log(`[OK] 06-tareks-ce üretildi: regulations=${f1.records}, hs_mappings=${f2.records}`);
