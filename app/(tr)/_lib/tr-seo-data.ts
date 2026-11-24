// TR İhracat Hedef Ülke Koridorları (/ihracat/pazarlar/[slug]) ve Hedefli İş Teklifi Şablonları (/teklif/[slug]).
// Organik SEO + GEO (AI yanıt motorları) + şirketlere gönderilen iş teklifi e-postaları için yapılandırılmış veri kaynağı.

import type { RfqTrackId } from "@/lib/ui/SmartRfq";

export interface TrExportCorridor {
  slug: string;
  countryTitle: string;
  regionBadge: string;
  metaTitle: string; // <= 60 karakter
  metaDesc: string;  // 120-158 karakter
  h1: string;
  lead: string;
  customsRegime: string;
  transitSummary: string;
  buyerPortalHref: string;
  buyerPortalLabel: string;
  complianceItems: string[];
  comparisonRows: {
    criterion: string;
    advantage: string;
    execution: string;
  }[];
  topSectors: { label: string; gtip: string; serviceHref: string }[];
  faq: { q: string; a: string }[];
}

export interface TrProposalBlueprint {
  slug: string;
  track: RfqTrackId;
  badge: string;
  metaTitle: string;
  metaDesc: string;
  h1: string;
  lead: string;
  slaText: string;
  deliverablesTitle: string;
  deliverables: { code: string; title: string; detail: string }[];
  commercialTermsTitle: string;
  commercialTerms: { label: string; value: string }[];
  whyTitle: string;
  whyPoints: string[];
  faq: { q: string; a: string }[];
  emailTemplate: {
    subject: string;
    body: string;
  };
}

export const TR_EXPORT_CORRIDORS: readonly TrExportCorridor[] = [
  {
    slug: "almanya-ihracat-pazarlama",
    countryTitle: "Almanya ve DACH Pazarı (DE · AT · CH)",
    regionBadge: "AB Gümrük Birliği · /de DACH Vitrini",
    metaTitle: "Almanya İhracat Sistemi ve Alıcı Bulma | Bdimexport",
    metaDesc: "Almanya, Avusturya ve İsviçre pazarında A.TR sıfır gümrük avantajı, LkSG/LUCID hazırlığı, Almanca B2B vitrin ve nitelikli ithalatçı eşleştirmesi.",
    h1: "Almanya, Avusturya ve İsviçre (DACH) İhracat Pazarlama ve Alıcı Bulma Sistemi",
    lead: "Türk sanayi, makine, tekstil, mobilya ve gıda üreticilerini Almanca kurumsal vitrin (/de), GTİP bazlı ithalatçı istihbaratı ve LkSG/LUCID uyum hazırlığıyla doğrudan DACH satın alma yöneticilerinin karşısına çıkarıyoruz.",
    customsRegime: "AB-Türkiye Gümrük Birliği (Sanayi ürünlerinde A.TR ile %0 gümrük; İsviçre için Türkiye-EFTA EUR.1)",
    transitSummary: "Karayolu TIR ile Münih/Stuttgart 3–4 gün, Frankfurt/Hamburg 4–5 gün; Trieste Ro-Ro + demiryolu intermodal",
    buyerPortalHref: "/de",
    buyerPortalLabel: "Alman Alıcı Vitrini (/de)",
    complianceItems: [
      "A.TR dolaşım belgesi uygunluğu (tarım ve AKÇT demir-çelik kalemleri hariç) ve İsviçre EUR.1 ayrımı",
      "Alman Tedarik Zinciri Özen Yükümlülüğü Yasası (LkSG) tedarikçi bilgi dosyası hazırlığı",
      "VerpackG kapsamında LUCID ambalaj malzeme ağırlık ve içerik bildirimi dokümantasyonu",
    ],
    comparisonRows: [
      { criterion: "Gümrük Vergisi Avantajı", advantage: "A.TR belgeli sanayi ürünlerinde %0 AB gümrük vergisi", execution: "GTİP ve menşe/serbest dolaşım ön kontrolü" },
      { criterion: "Teslimat Hızı", advantage: "Uzak Doğu'nun 35 gününe karşı 3–5 günde kapıya teslim", execution: "Parsiyel (LTL) ve komple TIR lojistik kurgusu" },
      { criterion: "Alıcı Güveni (Formal Sie)", advantage: "Alman satın almacıların aradığı teknik kanıt ve denetim dili", execution: "bdimexport.com/de üzerinde Doğrulanmış Türk İş Ortağı sergilemesi" },
    ],
    topSectors: [
      { label: "CNC İşleme, Döküm ve Makine Alt Montaj", gtip: "GTİP 8457 / 8481", serviceHref: "/ihracat/pazar-arastirmasi-musteri-bulma" },
      { label: "Hazır Giyim, Ev Tekstili ve İş Elbiseleri", gtip: "GTİP 61-63", serviceHref: "/ihracat/kuresel-pazarlama-sistemi-kurulumu" },
      { label: "İklimlendirme (HVAC), Radyatör ve Metal Yapı", gtip: "GTİP 8415 / 7308", serviceHref: "/ihracat/b2b-pazarlama" },
    ],
    faq: [
      {
        q: "Almanya'daki ithalatçılara ulaşmak için nasıl bir sistem kuruyorsunuz?",
        a: "Önce ürününüzün 6 ve 8 haneli GTİP kodundan Almanya, Avusturya ve İsviçre'deki gerçek ithalatçı profilini çıkarıyor; ardından firmanızı Almanca kurumsal vitrinimiz (/de) ve hedefli Almanca teklif sayfaları üzerinden doğrudan satın alma müdürlerine sunuyoruz.",
      },
      {
        q: "A.TR belgesi her üründe sıfır gümrük sağlar mı?",
        a: "A.TR belgesi AB-Türkiye Gümrük Birliği kapsamındaki sanayi ürünlerinde serbest dolaşım esasıyla %0 gümrük vergisi sağlar; temel tarım ürünleri ile AKÇT demir-çelik listesi ayrı tercihli menşe kurallarına tabidir. İsviçre sevkiyatlarında ise Türkiye-EFTA anlaşması kapsamında EUR.1 kullanılır.",
      },
      {
        q: "Küçük ve orta ölçekli üreticiler Ücretsiz İhracat Hızlandırma Programına başvurabilir mi?",
        a: "Evet. Üretim kapasitesi, kalite standardı ve ihracat disiplini doğrulanan Türk üreticiler ücretsiz ön değerlendirme ile sisteme dahil edilir ve küresel alıcı sayfalarımızda sergilenir.",
      },
      {
        q: "Alman alıcı fabrika denetimi isterse süreci kim yönetiyor?",
        a: "Bdimexport saha mühendisleri fabrikanızda ISO 2859-1 AQL kalite kontrolü ve konteyner/TIR yükleme nezareti gerçekleştirip Almanca/İngilizce teknik rapor sunarak alıcının güven engelini ortadan kaldırır.",
      },
      {
        q: "Süreci başlatmak ne kadar sürer?",
        a: "Akıllı RFQ veya Ücretsiz İhracat Başvuru formu üzerinden ilettiğiniz bilgiler 24–48 saat içinde değerlendirilerek yazılı yol haritası paylaşılır.",
      },
    ],
  },
  {
    slug: "abd-ihracat-ve-sirketlesme",
    countryTitle: "Amerika Birleşik Devletleri (ABD)",
    regionBadge: "BDIMEXPORT LLC (Wyoming · D-U-N-S® #14-977-6743) · Section 301 Fırsatı",
    metaTitle: "ABD İhracat, Müşteri Bulma ve Pazar Girişi | Bdimexport",
    metaDesc: "Çin'e uygulanan Section 301 ek vergilerine karşı Türk üreticiler için ABD alıcı bulma, HTS maliyet analizi ve BDIMEXPORT LLC kurumsal güvencesi.",
    h1: "ABD Pazarına İhracat, Alıcı Eşleştirme ve Kurumsal Ticaret Köprüsü",
    lead: "ABD'li ithalatçıların Çin'e uygulanan Section 301 ek gümrük vergilerinden çıkıp alternatif tedarikçi aradığı bu dönemde, ABD'de kayıtlı tüzel kişiliğimiz BDIMEXPORT LLC (Wyoming) güvencesiyle Türk üreticileri Amerikan alıcılarla buluşturuyoruz.",
    customsRegime: "ABD MFN Normal Gümrük Tarifesi (Çin menşeli ürünlerdeki %7,5–%25+ Section 301 ek vergisine karşı maliyet avantajı)",
    transitSummary: "Mersin, İzmir ve Ambarlı çıkışlı direkt konteyner hatlarıyla ABD Doğu Yakası (NY/NJ, Savannah) 16–22 gün",
    buyerPortalHref: "/en/markets/united-states",
    buyerPortalLabel: "ABD Alıcı Koridoru (/en/markets/united-states)",
    complianceItems: [
      "10 haneli ABD HTS gümrük vergisi ve Çin Section 301 karşılaştırmalı fiyatlandırma tablosu",
      "Gıda üreticileri için FDA tesis kaydı ve FSVP ithalatçı doğrulama dosya hazırlığı",
      "Mobilya, tekstil ve sanayi ürünlerinde CPSIA, UL/ETL ve ISPM-15 ahşap ambalaj kontrolü",
    ],
    comparisonRows: [
      { criterion: "Gümrük Vergisi Makası", advantage: "Birçok GTİP'te Çin'e kıyasla %7,5–%25 tarife avantajı", execution: "ABD'li alıcıya hazır HTS karşılaştırma teklifi sunumu" },
      { criterion: "Kurumsal Muhataplık", advantage: "Amerikan alıcılar ABD şirketiyle çalışmayı tercih eder", execution: "BDIMEXPORT LLC (Sheridan, WY) + BD Sanayi (TR) çift merkez yapısı" },
      { criterion: "Deniz Transit Süresi", advantage: "Doğu Yakası limanlarına 16–22 günde hızlı konteyner erişimi", execution: "FOB/CIF/DDP teklif ve yükleme nezareti" },
    ],
    topSectors: [
      { label: "Otel & Proje Mobilyası (Hospitality FF&E)", gtip: "GTİP 9403", serviceHref: "/ihracat/pazar-arastirmasi-musteri-bulma" },
      { label: "Mermer, Traverten ve Doğal Taş", gtip: "GTİP 6802", serviceHref: "/ticari-istihbarat" },
      { label: "Ev Tekstili, Havlu, Halı ve Özel Markalı Gıda", gtip: "GTİP 6302 / 5702 / 1509", serviceHref: "/ihracat/e-ihracat" },
    ],
    faq: [
      {
        q: "ABD'li ithalatçılar neden Türk üreticilere yöneliyor?",
        a: "ABD'nin Çin menşeli binlerce sanayi, mobilya, yapı malzemesi ve tekstil kalemine uyguladığı Section 301 ek gümrük vergileri nedeniyle Amerikan satın almacılar daha öngörülebilir vergi oranı ve 16–22 günlük Doğu Yakası termin süresi sunan Türkiye'yi stratejik alternatif olarak seçmektedir.",
      },
      {
        q: "BDIMEXPORT LLC Türk ihracatçıya nasıl bir avantaj sağlar?",
        a: "Wyoming, ABD'de tescilli BDIMEXPORT LLC yapımız Amerikan şirketlerine yerel kurumsal güven verirken, Türkiye'deki BD Sanayi ekibimiz üretim doğrulama ve konteyner yükleme denetimini sahada yürütür.",
      },
      {
        q: "Ürünümüzün ABD gümrük vergisini nasıl öğrenebiliriz?",
        a: "Ticari İstihbarat birimimiz ürününüzün 10 haneli ABD HTS karşılığını, MFN vergi oranını ve rakip ülkelerin ödediği tarifeleri 48–72 saat içinde raporlar.",
      },
      {
        q: "ABD'ye numune ve ilk parti sevkiyatlarında destek veriyor musunuz?",
        a: "Evet. Konsolide numune gönderimi, LCL parsiyel veya 20GP/40HQ konteyner lojistiği ve gümrük dokümantasyonu uçtan uca planlanır.",
      },
      {
        q: "Hangi firmalar programa başvurabilir?",
        a: "Standart kalitede üretim yapan, İngilizce katalog/fiyat disiplinine geçmek isteyen tüm imalatçılarımız başvurabilir.",
      },
    ],
  },
  {
    slug: "ingiltere-ihracat-rehberi",
    countryTitle: "Birleşik Krallık (İngiltere)",
    regionBadge: "TR-UK STA %0 Gümrük · 5–7 Gün Karayolu",
    metaTitle: "İngiltere İhracat ve Müşteri Bulma | Bdimexport",
    metaDesc: "Türkiye-Birleşik Krallık Serbest Ticaret Anlaşması ile sıfır gümrük, UKCA/Crib 5 uyumu, 5-7 gün TIR teslimatı ve İngiliz B2B alıcı eşleştirmesi.",
    h1: "Birleşik Krallık (İngiltere) İhracat, STA Menşe ve B2B Alıcı Sistemi",
    lead: "Brexit sonrasında yürürlüğe giren Türkiye-Birleşik Krallık STA sayesinde sanayi ürünlerinde sıfır gümrük avantajını koruyan Türk üreticileri, İngiliz perakende zincirleri ve proje müteahhitleriyle eşleştiriyoruz.",
    customsRegime: "Türkiye-Birleşik Krallık STA (Fatura/Menşe Beyanı ile sanayi ürünlerinde %0 tercihli gümrük vergisi)",
    transitSummary: "Karayolu TIR ile 5–7 gün; Felixstowe / Southampton / London Gateway kısa mesafe denizyolu 10–14 gün",
    buyerPortalHref: "/en/markets/united-kingdom",
    buyerPortalLabel: "UK Alıcı Koridoru (/en/markets/united-kingdom)",
    complianceItems: [
      "TR-UK STA Menşe Beyanı metin ve kümülasyon kontrolü",
      "İngiltere otel/konut mobilyalarında BS 5852 (Crib 5) yanmazlık test koordinasyonu",
      "UKCA / CE teknik dosya ve BRCGS / SEDEX perakende denetim hazırlığı",
    ],
    comparisonRows: [
      { criterion: "Gümrük Vergisi", advantage: "Menşe beyanlı sanayi ürünlerinde %0 gümrük vergisi", execution: "İhracat faturası ve menşe beyanı ön denetimi" },
      { criterion: "Stok Devir Hızı", advantage: "5–7 günde haftalık TIR sevkiyatıyla düşük stok maliyeti", execution: "Parsiyel ve komple İngiltere lojistik entegrasyonu" },
      { criterion: "Hedefli Satış", advantage: "İngiliz ithalatçılara özel /en/markets/united-kingdom vitrini", execution: "Hedefli e-posta teklif sayfalarıyla doğrudan RFQ toplama" },
    ],
    topSectors: [
      { label: "Özel Markalı Hazır Giyim ve Triko", gtip: "GTİP 61-62", serviceHref: "/ihracat/b2b-pazarlama" },
      { label: "Crib-5 Uyumlu Otel & Restoran Mobilyası", gtip: "GTİP 9403", serviceHref: "/ihracat/pazar-arastirmasi-musteri-bulma" },
      { label: "Seramik Sağlık Gereçleri, Mutfak Eşyası ve Kuru Gıda", gtip: "GTİP 6910 / 7323 / 08", serviceHref: "/ihracat/kuresel-pazarlama-sistemi-kurulumu" },
    ],
    faq: [
      {
        q: "İngiltere'ye ihracatta A.TR belgesi geçerli mi?",
        a: "Hayır. Brexit sonrasında İngiltere sevkiyatlarında A.TR yerine Türkiye-Birleşik Krallık Serbest Ticaret Anlaşması kapsamındaki Menşe Beyanı (Origin Declaration) kullanılır ve menşe kuralını sağlayan sanayi ürünleri %0 gümrükle girer.",
      },
      {
        q: "İngiliz mobilya ve tekstil alıcıları hangi testleri şart koşuyor?",
        a: "Birleşik Krallık'ta döşemeli mobilya ve yatak kumaşlarında BS 5852 (özellikle ticari projelerde Crib 5) yanmazlık standardı zorunludur. Denetim ekibimiz seri üretimden mühürlü numune alarak akredite laboratuvar sürecini doğrular.",
      },
      {
        q: "İngiltere'deki alıcılara özel teklif sayfası gönderebiliyor muyuz?",
        a: "Evet. /en/proposals/dual-hub-sourcing ve /en/markets/united-kingdom altyapımız üzerinden İngiliz firmalara şirket adına kişiselleştirilmiş teklif bağlantıları iletebilirsiniz.",
      },
      {
        q: "Parsiyel (LTL) ihracat mümkün mü?",
        a: "Evet. Haftalık düzenli İngiltere parsiyel TIR çıkışları sayesinde tam tır dolmadan palet bazlı ihracat yapılabilmektedir.",
      },
      {
        q: "Başvuru sonrası süreç nasıl işler?",
        a: "Ücretsiz İhracat Hızlandırma formunu veya Akıllı RFQ talebinizi ilettiğinizde 48 saat içinde İngiltere pazar uygunluk ve aksiyon planınız paylaşılır.",
      },
    ],
  },
  {
    slug: "bae-dubai-ihracat",
    countryTitle: "Birleşik Arap Emirlikleri (Dubai & Abu Dabi)",
    regionBadge: "TR-BAE CEPA Anlaşması · /en/ar Arapça Vitrin",
    metaTitle: "BAE Dubai İhracat ve Proje Satışı | Bdimexport",
    metaDesc: "Türkiye-BAE Kapsamlı Ekonomik Ortaklık Anlaşması (CEPA) gümrük indirimleri, Dubai otel/inşaat FF&E projeleri ve Arapça RTL alıcı vitrini.",
    h1: "BAE (Dubai & Abu Dabi) CEPA İhracat ve Otel/İnşaat Proje Satış Sistemi",
    lead: "Türkiye-BAE Kapsamlı Ekonomik Ortaklık Anlaşması (CEPA) ile gümrük vergilerinin %80'den fazla tarife satırında indiği Dubai ve Körfez pazarında, Türk yapı, mobilya, gıda ve makine üreticilerini proje satın almacılarıyla buluşturuyoruz.",
    customsRegime: "Türkiye-BAE CEPA Tercihli Menşe Şahadetnamesi ile gümrük indirimi / muafiyeti",
    transitSummary: "Mersin/İzmir → Jebel Ali denizyolu 8–14 gün; karayolu/Ro-Ro multimodal koridoru",
    buyerPortalHref: "/en/ar",
    buyerPortalLabel: "Arapça MENA Vitrini (/en/ar)",
    complianceItems: [
      "TR-BAE CEPA Tercihli Menşe Şahadetnamesi ve ticari fatura tasdik kontrolü",
      "BAE MoIAT (ECAS/EQM) ürün uygunluk ve gıda ürünlerinde Helal + Arapça etiket doğrulaması",
      "Otel ve rezidans projeleri için BOQ (metraj/şartname) bazlı numune ve yükleme denetimi",
    ],
    comparisonRows: [
      { criterion: "Gümrük Avantajı", advantage: "CEPA kapsamındaki binlerce kalemde sıfır/indirimli tarife", execution: "GTİP bazlı CEPA vergi avantajı analizi" },
      { criterion: "Dil ve Kültür Uyumu", advantage: " hem İngilizce (/en/markets/united-arab-emirates) hem RTL Arapça (/en/ar) vitrin", execution: "WhatsApp Business ve kurumsal e-posta ile hızlı teklif dönüşümü" },
      { criterion: "Re-Export Merkezi", advantage: "Jebel Ali üzerinden tüm Körfez ve Doğu Afrika'ya erişim", execution: "Distribütör ve proje müteahhidi doğrulaması" },
    ],
    topSectors: [
      { label: "5 Yıldızlı Otel Mobilyası, Ahşap İşleri ve Halı", gtip: "GTİP 9403 / 5702", serviceHref: "/ihracat/pazar-arastirmasi-musteri-bulma" },
      { label: "Doğal Taş, Mermer, Seramik ve Vitrifiye", gtip: "GTİP 6802 / 6907", serviceHref: "/ihracat/kuresel-pazarlama-sistemi-kurulumu" },
      { label: "Zeytinyağı, Kuruyemiş ve Gurme Gıda Ürünleri", gtip: "GTİP 1509 / 0802", serviceHref: "/ihracat/e-ihracat" },
    ],
    faq: [
      {
        q: "Türkiye-BAE CEPA anlaşması ihracatçımıza ne kazandırıyor?",
        a: "CEPA anlaşması, tercihli menşe belgesi düzenlenen Türk menşeli binlerce sanayi, yapı, tekstil ve gıda ürününde standart %5 Körfez gümrük vergisini sıfırlamakta veya kademeli olarak düşürmektedir.",
      },
      {
        q: "Dubai'deki inşaat ve otel projelerine nasıl teklif veriliyor?",
        a: "Proje satın alma ekipleri genellikle birden fazla kalemi (taş, mobilya, tekstil, aydınlatma) tek kalite kontrol çatısı altında ister. Bdimexport hem üretim doğrulaması hem saha denetimi sağlayarak firmanızın proje onayını hızlandırır.",
      },
      {
        q: "Arapça tanıtım altyapınız mevcut mu?",
        a: "Evet. Sağdan sola (RTL) tam uyumlu Arapça kurumsal vitrinimiz (/en/ar) MENA bölgesindeki karar vericilere kendi dillerinde güven sunmaktadır.",
      },
      {
        q: "Gıda ihracatında etiket kontrolü yapıyor musunuz?",
        a: "Evet. Sevkiyat öncesinde Arapça/İngilizce içerik beyanı, üretim/son tüketim tarihi baskısı ve akredite Helal belgesi sahada kontrol edilir.",
      },
      {
        q: "Nasıl başlayabiliriz?",
        a: "Akıllı RFQ veya Ücretsiz İhracat Başvurusu üzerinden ürün grubunuzu ileterek 24–48 saat içinde değerlendirme alabilirsiniz.",
      },
    ],
  },
  {
    slug: "suudi-arabistan-saber-ihracat",
    countryTitle: "Suudi Arabistan (Vision 2030 Projeleri)",
    regionBadge: "SABER / SASO Uyumlu · 6–10 Gün Kızıldeniz Hattı",
    metaTitle: "Suudi Arabistan SABER ve İhracat Sistemi | Bdimexport",
    metaDesc: "Suudi Arabistan Vision 2030 inşaat, altyapı ve otel projelerine ihracat, SABER (PCoC/SCoC) ve kalıcı menşe markalaması saha kontrolü.",
    h1: "Suudi Arabistan İhracat, SABER Uyum ve Mega-Proje Tedarik Sistemi",
    lead: "Riyad, Cidde ve Dammam merkezli dev inşaat ve konaklama projelerine ihracat yapmak isteyen Türk üreticileri; limanda bekleme riskini sıfırlayan SABER/SASO ön denetimi ve doğrudan alıcı istihbaratıyla hazırlıyoruz.",
    customsRegime: "Körfez İşbirliği Konseyi Tarifesi + Zorunlu SABER (PCoC & SCoC) / SFDA Kaydı",
    transitSummary: "Mersin / İskenderun / İzmir → Cidde İslam Limanı 6–10 gün denizyolu",
    buyerPortalHref: "/en/markets/saudi-arabia",
    buyerPortalLabel: "Suudi Alıcı Koridoru (/en/markets/saudi-arabia)",
    complianceItems: [
      "SABER platformunda Ürün Uygunluk (PCoC) ve Sevkiyat Uygunluk (SCoC) sertifika hazırlığı",
      "Silinmez/çıkarılamaz 'Made in Türkiye' menşe kazıma/dikim/baskı saha denetimi",
      "Elektrikli cihazlarda 220V/60Hz frekans, BS 1363 fiş tipi ve SASO enerji etiketi kontrolü",
    ],
    comparisonRows: [
      { criterion: "Lojistik Yakınlık", advantage: "Cidde Limanı'na 6–10 günde teslimat (Uzak Doğu'nun üçte biri süre)", execution: "Acil şantiye terminlerine uygun hızlı konteyner planlaması" },
      { criterion: "Gümrük Reddi Önleme", advantage: "Menşe etiketi eksikliği kaynaklı gümrük cezalarının önlenmesi", execution: "Konteyner kapanmadan fotoğraflı SABER/menşe saha kontrolü" },
      { criterion: "Alıcı Erişimi", advantage: "İngilizce ve Arapça (/en/ar) kurumsal ihale sunumu", execution: "Hedefli proje teklif sayfalarıyla karar vericiye ulaşım" },
    ],
    topSectors: [
      { label: "Mermer, Doğal Taş, Seramik ve Yapı Kimyasalları", gtip: "GTİP 6802 / 6907", serviceHref: "/ihracat/pazar-arastirmasi-musteri-bulma" },
      { label: "Çelik Konstrüksiyon, Pompa/Vana ve 60Hz HVAC", gtip: "GTİP 7308 / 8481 / 8415", serviceHref: "/ihracat/kuresel-pazarlama-sistemi-kurulumu" },
      { label: "Proje Mobilyası ve Kapı/Ahşap Sistemleri", gtip: "GTİP 9403 / 4418", serviceHref: "/ihracat/b2b-pazarlama" },
    ],
    faq: [
      {
        q: "Suudi Arabistan gümrüğünde en sık yaşanan sorun nedir ve nasıl önlenir?",
        a: "Suudi gümrükleri yalnızca yapıştırma etiketli ürünleri veya SABER SCoC belgesiyle uyumsuz kolileri geri çevirebilmektedir. Müfettişlerimiz yükleme öncesinde kalıcı 'Made in Türkiye' markalamasını, 60Hz elektrik değerlerini ve koli listesini sahada denetler.",
      },
      {
        q: "Mersin ve İzmir'den Cidde'ye konteyner kaç günde ulaşır?",
        a: "Kızıldeniz hattı üzerinden Cidde İslam Limanı'na transit süre ortalama 6 ila 10 gündür; bu hız Türk yapı ve mobilya üreticilerine şantiye projelerinde büyük rekabet gücü sağlar.",
      },
      {
        q: "Suudi alıcıların güvenilirliğini araştırıyor musunuz?",
        a: "Evet. Ticari İstihbarat birimimiz karşı tarafın ticaret sicilini (CR), ithalat geçmişini ve ödeme yapısını sözleşme öncesinde inceler.",
      },
      {
        q: "SABER belgesini kim alır?",
        a: "SABER kaydı Suudi ithalatçının hesabı üzerinden açılır; ancak test raporları, teknik dosya ve fabrika denetim kanıtları ihracatçı tarafından sağlanır. Ekibimiz teknik hazırlığı baştan sona koordine eder.",
      },
      {
        q: "Programa katılım ücretli mi?",
        a: "Ücretsiz İhracat Hızlandırma Programı ön değerlendirmesi ve küresel vitrin listelemesi ücretsizdir; özel pazar istihbaratı veya kurulum paketleri baştan şeffaf tekliflendirilir.",
      },
    ],
  },
  {
    slug: "fransa-hollanda-benelux-ihracat",
    countryTitle: "Fransa, Hollanda ve Benelux",
    regionBadge: "A.TR %0 Gümrük · /en/fr & /en/nl Vitrinleri",
    metaTitle: "Fransa ve Hollanda İhracat Sistemi | Bdimexport",
    metaDesc: "Fransa, Hollanda ve Belçika pazarına A.TR sıfır gümrükle özel markalı (Private Label) ihracat, Fransızca/Hollandaca vitrin ve 4-6 gün teslimat.",
    h1: "Fransa, Hollanda ve Benelux Özel Markalı (Private Label) İhracat Sistemi",
    lead: "Avrupa'nın en yüksek satın alma gücüne sahip perakende ve e-ticaret dağıtım merkezleri olan Fransa ve Benelux ülkelerine, kendi dillerinde (/en/fr ve /en/nl) kurumsal B2B vitrin ve 4–6 günlük lojistikle açılın.",
    customsRegime: "AB-Türkiye Gümrük Birliği (A.TR ile sanayi ürünlerinde %0 gümrük)",
    transitSummary: "Marsilya/Sète Ro-Ro veya karayolu TIR ile Fransa & Rotterdam/Venlo 4–6 gün",
    buyerPortalHref: "/en/fr",
    buyerPortalLabel: "Fransızca (/en/fr) & Hollandaca (/en/nl)",
    complianceItems: [
      "Fransa AGEC yasası (Triman geri dönüşüm sembolü) ambalaj kontrolü",
      "AB REACH, OEKO-TEX, GOTS ve gıda temas (LFGB/DGCCRF) sertifika doğrulaması",
      "Hollanda otomatik 3PL depoları için EPAL Euro-palet (80×120 cm) ve GS1 barkod denetimi",
    ],
    comparisonRows: [
      { criterion: "Yerel Dil Güveni", advantage: "Fransız alıcıya 'vous' tonunda Fransızca, Hollandalı alıcıya doğrudan Felemenkçe sunum", execution: "/en/fr ve /en/nl yerel alt-hub entegrasyonu" },
      { criterion: "Perakende Çevikliği", advantage: "Düşük MOQ ve 5 günde sezon içi yeniden sipariş (re-order)", execution: "Özel markalı üretim ve numune konsolidasyonu" },
      { criterion: "3PL Depo Uyumu", advantage: "Rotterdam ve Lyon lojistik depolarında sıfır palet reddi", execution: "Yükleme anında palet yüksekliği ve nem ölçümü" },
    ],
    topSectors: [
      { label: "Özel Markalı Moda, Triko ve Ev Tekstili", gtip: "GTİP 61-63", serviceHref: "/ihracat/b2b-pazarlama" },
      { label: "Ev-Yaşam, Mutfak Eşyası ve Bahçe Mobilyası", gtip: "GTİP 7323 / 9403", serviceHref: "/ihracat/e-ihracat" },
      { label: "Kuru Meyve, Fındık ve Akdeniz Gıda Ürünleri", gtip: "GTİP 08 / 1509", serviceHref: "/ihracat/pazar-arastirmasi-musteri-bulma" },
    ],
    faq: [
      {
        q: "Fransız ve Hollandalı alıcılar tedarikçi seçerken neye dikkat eder?",
        a: "Fransız alıcılar resmi kurumsal iletişime, Triman ambalaj kurallarına ve sosyal uygunluk belgelerine; Hollandalı alıcılar ise net birim fiyata, EPAL palet standardına ve dakik teslimata odaklanır.",
      },
      {
        q: "Fransızca ve Hollandaca sayfalarınız arama motorlarında indeksleniyor mu?",
        a: "Evet. /en/fr ve /en/nl alt merkezlerimiz doğru ISO dil etiketleri (lang='fr', lang='nl') ve bağımsız canonical yapılarıyla yerel aramalarda ve AI motorlarında doğrudan görünür.",
      },
      {
        q: "Küçük partilerle Benelux pazarına giriş yapılabilir mi?",
        a: "Evet. Düzenli parsiyel TIR hatları sayesinde 2–5 paletlik deneme siparişleriyle zincir mağaza ve e-ticaret toptancılarına düşük riskli giriş yapılabilir.",
      },
      {
        q: "Üretici doğrulama rozeti nasıl alınır?",
        a: "Ücretsiz İhracat Hızlandırma başvurunuz sonrasında vergi levhası, kapasite raporu ve ihracat/kalite belgeleriniz incelenerek Onaylı Türk İş Ortağı statüsü tanımlanır.",
      },
      {
        q: "Teklif sürecini nasıl başlatabiliriz?",
        a: "Sayfa sonundaki Akıllı RFQ modülünden ürün ve hedef ülkenizi seçerek 24 saatte yazılı geri dönüş alabilirsiniz.",
      },
    ],
  },
  {
    slug: "polonya-romanya-dogu-avrupa-ihracat",
    countryTitle: "Polonya ve Romanya (Orta & Doğu Avrupa)",
    regionBadge: "24–96 Saat Karayolu · /en/pl & /en/ro Vitrinleri",
    metaTitle: "Polonya ve Romanya İhracat Sistemi | Bdimexport",
    metaDesc: "Polonya ve Romanya inşaat, sanayi, tekstil ve gıda pazarına 1-4 günde karayolu ihracatı, A.TR sıfır gümrük ve Lehçe/Rumence B2B vitrin.",
    h1: "Polonya ve Romanya Hızlı Karayolu İhracat ve Sanayi Eşleştirme Sistemi",
    lead: "Avrupa Birliği'nin en hızlı büyüyen üretim ve altyapı şantiyeleri olan Polonya ve Romanya'ya, 24 ila 96 saatlik karayolu yakınlığı ve Lehçe (/en/pl) + Rumence (/en/ro) yerel vitrinlerle ihracat yapın.",
    customsRegime: "AB-Türkiye Gümrük Birliği (A.TR ile sanayi ürünlerinde %0 gümrük)",
    transitSummary: "Bükreş/Köstence 24–48 saat · Varşova/Wrocław/Łódź 3–4 gün direkt TIR",
    buyerPortalHref: "/en/pl",
    buyerPortalLabel: "Lehçe (/en/pl) & Rumence (/en/ro)",
    complianceItems: [
      "AB Yapı Malzemeleri Yönetmeliği (CPR) Performans Beyanı (DoP) ve CE kontrolü",
      "Çelik, boru ve vanalarda EN 10204 3.1 malzeme test sertifikası doğrulaması",
      "TIR dorse yükleme, spanzet sabitleme ve gümrük mühür nezareti",
    ],
    comparisonRows: [
      { criterion: "Lojistik Hız", advantage: "Romanya 1–2 gün, Polonya 3–4 gün kapıdan kapıya teslimat", execution: "Yüksek navlunlu denizyoluna gerek kalmadan esnek TIR sevkiyatı" },
      { criterion: "Mavi Okyanus SEO/GEO", advantage: "Lehçe ve Rumence B2B aramalarda düşük rekabet, yüksek dönüşüm", execution: "/en/pl ve /en/ro yerelleştirilmiş alıcı sayfaları" },
      { criterion: "Sanayi Entegrasyonu", advantage: "Orta Avrupa fabrikalarına yarı mamul, döküm, çelik ve tekstil tedariği", execution: "Doğrudan fabrika satın almacılarına hedefli teklif iletimi" },
    ],
    topSectors: [
      { label: "Yapı Çeliği, Profil, Seramik ve HVAC Sistemleri", gtip: "GTİP 73 / 69 / 8415", serviceHref: "/ihracat/pazar-arastirmasi-musteri-bulma" },
      { label: "Tarım Makineleri ve Endüstriyel Yedek Parça", gtip: "GTİP 8432 / 8481", serviceHref: "/ihracat/kuresel-pazarlama-sistemi-kurulumu" },
      { label: "Ev Tekstili, Halı, Mobilya ve Paketli Gıda", gtip: "GTİP 63 / 9403 / 1902", serviceHref: "/ihracat/b2b-pazarlama" },
    ],
    faq: [
      {
        q: "Polonya ve Romanya neden Türk KOBİ'leri için en hızlı ihracat pazarlarıdır?",
        a: "Hem A.TR ile %0 sanayi gümrüğü uygulanması hem de İstanbul/Marmara çıkışlı bir TIR'ın Bükreş'e 24–36 saatte, Varşova'ya 3–4 günde ulaşması sayesinde Türk üreticiler yerel tedarikçi hızında rekabet edebilir.",
      },
      {
        q: "Lehçe ve Rumence alıcı vitrinleriniz nasıl çalışıyor?",
        a: "/en/pl ve /en/ro sayfalarımız Polonyalı ve Romanyalı ithalatçılara kendi ana dillerinde tedarik ve konteyner/TIR denetimi süreçlerini anlatır ve gelen talepleri doğrudan havuzumuza aktarır.",
      },
      {
        q: "İnşaat malzemelerinde hangi belgeler aranıyor?",
        a: "AB genelinde yapı malzemeleri için CE işareti ve CPR kapsamında Performans Beyanı (Declaration of Performance), metal ürünlerde ise EN 10204 3.1 sertifikası talep edilmektedir.",
      },
      {
        q: "Müşteri bulma çalışmasını tek ülke için başlatabilir miyiz?",
        a: "Evet. GTİP kodunuza göre yalnızca Polonya veya yalnızca Romanya ithalatçı listesi ve hedefli teklif kampanyası kurgulanabilir.",
      },
      {
        q: "İlk adım nedir?",
        a: "Akıllı RFQ üzerinden ürün ve GTİP bilginizi bırakmanız yeterlidir; 24 saatte kapsam yanıtı iletilir.",
      },
    ],
  },
  {
    slug: "balkanlar-arnavutluk-italya-ihracat",
    countryTitle: "İtalya, Arnavutluk ve Balkanlar",
    regionBadge: "48–72 Saat Koridoru · /en/it & /en/sq Vitrinleri",
    metaTitle: "İtalya ve Balkanlar İhracat Sistemi | Bdimexport",
    metaDesc: "Trieste Ro-Ro ile 48-72 saatte İtalya'ya fason/OEM ihracat; Arnavutluk ve Kosova inşaat/toptan pazarına hızlı karayolu satışı.",
    h1: "İtalya Endüstriyel OEM ve Balkanlar (Arnavutluk / Kosova) Hızlı İhracat Hattı",
    lead: "Adriyatik ve Balkan koridorunda İtalyan markalar için fason/yarı-mamul üretim fırsatlarını ve Arnavutluk/Kosova'nın büyüyen inşaat-turizm projelerini çift dilli (/en/it ve /en/sq) altyapımızla yakalayın.",
    customsRegime: "İtalya: AB A.TR %0 sanayi gümrüğü · Arnavutluk & Kosova: Türkiye Serbest Ticaret Anlaşmaları",
    transitSummary: "Çeşme/Yalova → Trieste Ro-Ro 48–60 saat · İstanbul → Tiran/Dıraç/Priştine 48–72 saat TIR",
    buyerPortalHref: "/en/it",
    buyerPortalLabel: "İtalyanca (/en/it) & Arnavutça (/en/sq)",
    complianceItems: [
      "İtalya için AB A.TR, REACH tekstil/deri testleri ve hassas CNC/mermer tolerans kontrolü",
      "Arnavutluk ve Kosova için STA EUR.1 tercihli menşe belgesi kontrolü",
      "Sevkiyat öncesi kalite, mermer A-sehpa sabitleme ve araç mühür denetimi",
    ],
    comparisonRows: [
      { criterion: "İtalya OEM Entegrasyonu", advantage: "Kuzey İtalya fabrikalarına 3–4 günde yarı mamul ve tekstil teslimi", execution: "/en/it üzerinden İtalyan satın almacılara doğrudan erişim" },
      { criterion: "Balkan İnşaat & Turizm", advantage: "Arnavutluk kıyı turizmi ve konut projelerinde yüksek Türk ürünü talebi", execution: "/en/sq Arnavutça vitrin ile yerel müteahhit ağlarına erişim" },
      { criterion: "Düşük Navlun & Hız", advantage: "48–72 saatlik kapı teslimi ile nakit akışı hızı", execution: "Parsiyel ve komple araç yükleme denetimi" },
    ],
    topSectors: [
      { label: "Denim, Dokuma Kumaş ve İtalyan Markalara OEM Giyim", gtip: "GTİP 5209 / 61-62", serviceHref: "/ihracat/b2b-pazarlama" },
      { label: "Mermer, Seramik, Otel Mobilyası ve Yapı Malzemeleri", gtip: "GTİP 6802 / 9403", serviceHref: "/ihracat/pazar-arastirmasi-musteri-bulma" },
      { label: "Makine Alt Parçaları, Tarım Ekipmanı ve Gıda", gtip: "GTİP 84 / 0802", serviceHref: "/ihracat/kuresel-pazarlama-sistemi-kurulumu" },
    ],
    faq: [
      {
        q: "Arnavutça (/en/sq) ve İtalyanca (/en/it) sayfalar neden asimetrik avantaj sağlar?",
        a: "İngilizce arama yapmayan yerel Balkan müteahhitleri ve İtalyan KOBİ satın almacıları kendi dillerinde arama yaptığında neredeyse sıfır kurumsal rakiple karşılaşır; yerelleştirilmiş vitrinlerimiz bu talebi doğrudan yakalar.",
      },
      {
        q: "Arnavutluk ve Kosova'ya ihracatta gümrük vergisi var mı?",
        a: "Türkiye'nin Arnavutluk ve Kosova ile yürürlükte olan Serbest Ticaret Anlaşmaları kapsamında EUR.1 dolaşım belgesi düzenlenen sanayi ürünlerinde tercihli sıfır gümrük avantajı uygulanır.",
      },
      {
        q: "İtalyan firmalara fason (Private Label) üretim için nasıl teklif verilir?",
        a: "Üretim parkurunuz, kalite belgeleriniz ve termin kapasiteniz doğrulandıktan sonra İtalyanca vitrin ve hedefli B2B teklif bağlantılarıyla ilgili sektör alıcılarına sunulur.",
      },
      {
        q: "Mermer ve hassas ürünlerde yükleme kontrolü yapılıyor mu?",
        a: "Evet. Damar takibi, yüzey cilası, nem oranı ve A-sehpa sabitleme güvenliği saha ekibimizce fotoğraflanarak raporlanır.",
      },
      {
        q: "Nasıl başvurulur?",
        a: "Akıllı RFQ veya Ücretsiz İhracat Hızlandırma formunu doldurarak 24–48 saat içinde sürecinizi başlatabilirsiniz.",
      },
    ],
  },
] as const;

export const TR_PROPOSALS: readonly TrProposalBlueprint[] = [
  {
    slug: "ihracat-buyume-sistemi",
    track: "marketing",
    badge: "KURUMSAL İŞ TEKLİFİ · İHRACAT BÜYÜME VE ALICI SİSTEMİ",
    metaTitle: "İhracat Büyüme ve Alıcı Bulma Teklifi | Bdimexport",
    metaDesc: "Türk üreticiler için 14 dilde SEO/GEO görünürlük, GTİP bazlı yabancı alıcı tespiti, hedefli teklif sayfaları ve uçtan uca ihracat sistemi kurulum teklifi.",
    h1: "Türk Üreticiler İçin Küresel İhracat Pazarlama ve Nitelikli Alıcı Bulma Teklifi",
    lead: "Fuar ve aracı beklemek yerine; fabrikanızın ürünlerini 14 dilde arama ve yapay zeka (GEO) motorlarında ilk sayfaya taşıyan, GTİP verisiyle gerçek ithalatçıları tespit eden ve şirketlere özel teklif sayfalarıyla RFQ toplayan anahtar teslim büyüme mimarisi.",
    slaText: "24 Saatte Ön Analiz · 14 Dilde Vitrin & Hedefli B2B Alıcı Hunisi",
    deliverablesTitle: "Teklif Kapsamındaki Teslimat Kalemleri",
    deliverables: [
      { code: "IHR-01", title: "GTİP / HS Bazlı Hedef Ülke ve Aktif İthalatçı İstihbaratı", detail: "Ürününüzü dünyada en yüksek marjla ithal eden ülkelerin, gümrük avantajlarının (A.TR, UK-STA, CEPA, ABD MFN) ve gerçek alıcı profillerinin çıkarılması." },
      { code: "IHR-02", title: "Çok Dilli SEO + GEO (AI Arama) Vitrini ve Partner Konumlandırma", detail: "İngilizce, Almanca, Arapça, Fransızca, Rusça, Lehçe, İtalyanca dahil 14 dilde ürün ve kurumsal güven sergilemesi." },
      { code: "IHR-03", title: "Şirketlere Özel Hedefli İş Teklifi Sayfaları ve RFQ Eşleştirme", detail: "Yabancı satın alma müdürlerine gönderilen e-postalarda karşı firmanın adıyla açılan yüksek dönüşümlü teklif sayfaları ve doğrudan talep yönlendirmesi." },
    ],
    commercialTermsTitle: "Çalışma Modeli ve Kurumsal Güvence",
    commercialTerms: [
      { label: "Ön Değerlendirme", value: "Ücretsiz kapasite ve hedef pazar uygunluk analizi (24–48 saat)" },
      { label: "Kurumsal Altyapı", value: "BD Sanayi İthalat İhracat Şirketi (TR) + BDIMEXPORT LLC (ABD · D-U-N-S® #14-977-6743 · SAP Ariba® BNO-100000188010374)" },
      { label: "Ücretlendirme Şeffaflığı", value: "Ücretsiz Hızlandırma Programı veya kapsamı baştan yazılı sistem kurulum paketi" },
      { label: "Veri ve Marka Kontrolü", value: "KVKK uyumlu; logo ve katalog yayını tamamen yazılı onayınıza bağlıdır" },
    ],
    whyTitle: "Neden Klasik Ajans Değil, Asimetrik Ticaret Mimarisi?",
    whyPoints: [
      "Yalnızca reklam tıklaması değil; gümrük rejimi, lojistik koridor ve saha kalite kontrolüyle desteklenen gerçek B2B ticaret altyapısı.",
      "Google AI Overviews, ChatGPT Search ve Perplexity gibi yapay zeka yanıt motorlarına özel yapılandırılmış veri (GEO) mimarisi.",
      "ABD ve Avrupa'daki alıcılara yerel tüzel kişilik ve 24–48 saat saha denetimi güveni sunarak ilk sipariş engelini aşma.",
    ],
    faq: [
      {
        q: "Halihazırda ihracat ekibimiz yoksa da bu sistemle başlayabilir miyiz?",
        a: "Evet. Sistemimiz hem mevcut dış ticaret ekibinize nitelikli yabancı alıcı (RFQ) beslemek hem de dış ticaret departmanı olmayan üreticilere uçtan uca ihracat sistemi kurmak üzere iki modülde çalışır.",
      },
      {
        q: "Hangi ülkelerden talep toplayabiliyoruz?",
        a: "ABD, Almanya/DACH, İngiltere, Fransa, Hollanda, İtalya, İspanya, Polonya, Romanya, Kuzey Avrupa, Balkanlar, BAE ve Suudi Arabistan başta olmak üzere 20'den fazla hedef pazarda aktif koridor yapımız mevcuttur.",
      },
      {
        q: "Bu teklifi firmamıza özel kapsamla netleştirmek için ne yapmalıyız?",
        a: "Aşağıdaki Akıllı RFQ modülünden ürün grubunuzu ve hedef ülkelerinizi seçerek göndermeniz yeterlidir; ekibimiz 24 saat içinde yazılı kapsamla dönüş yapar.",
      },
    ],
    emailTemplate: {
      subject: "{{company}} İçin Küresel İhracat Sistemi ve Yurt Dışı Alıcı Teklifi ({{sector}})",
      body: "Sayın {{company}} Yönetimi,\n\n{{sector}} ürün grubunuzun {{country}} başta olmak üzere küresel pazarlarda doğrudan ithalatçılarla buluşması için firmanıza özel hazırladığımız İhracat Büyüme ve Alıcı Bulma teklif sayfasını aşağıda inceleyebilirsiniz:\n\n{{url}}\n\nÖne çıkan başlıklar:\n• GTİP bazlı gerçek ithalatçı istihbaratı ve tarife avantajı analizi\n• 14 dilde SEO & Yapay Zeka (GEO) aramalarında kurumsal görünürlük\n• BDIMEXPORT LLC (ABD) ve BD Sanayi (TR) altyapısıyla yabancı alıcı güveni\n\nSayfa üzerinden ürün ve hedef pazar notlarınızı ileterek 24 saat içinde ücretsiz ön analizi başlatabilirsiniz.\n\nSaygılarımızla,\nBdimexport İhracat Sistemleri Masası",
    },
  },
  {
    slug: "konteyner-yukleme-denetimi",
    track: "inspection",
    badge: "KURUMSAL İŞ TEKLİFİ · 24–48 SAAT SAHA DENETİMİ",
    metaTitle: "Konteyner Yükleme ve Fabrika Denetim Teklifi | Bdimexport",
    metaDesc: "Çin ve Türkiye genelinde kendi bulduğunuz üreticiler dahil 24-48 saatte bağımsız konteyner yükleme nezareti, AQL kalite testi ve fotoğraflı denetim raporu.",
    h1: "Çin ve Türkiye Fabrikalarında Bağımsız Konteyner Yükleme & Kalite Denetimi Teklifi",
    lead: "Üreticiyi kendiniz bulmuş olsanız bile bakiye ödemesini (%70) göndermeden önce Çin veya Türkiye'deki fabrikaya 24–48 saat içinde bağımsız müfettiş gönderiyor; ürünü, kolileri ve konteyner mührünü sahada doğruluyoruz.",
    slaText: "24–48 Saatte Müfettiş Görevlendirme · Canlı WhatsApp Fotoğrafları · 48 Saatte PDF Rapor",
    deliverablesTitle: "7 Noktalı Saha Denetim Kapsamı",
    deliverables: [
      { code: "DNT-01", title: "ISO 2859-1 (AQL) Ürün Kalite, Ölçü ve Fonksiyon Testi", detail: "Rastgele açılan kolilerde işçilik, ölçü, gramaj, etiket, barkod ve çalışma testlerinin şartnamenize göre kontrolü." },
      { code: "DNT-02", title: "Boş Konteyner Fiziksel Uygunluk ve Nem Testi", detail: "Işık sızdırmazlık, taban nem ölçümü (<%18), koku, delik ve korozyon kontrolü ile taşıma hasarlarının önlenmesi." },
      { code: "DNT-03", title: "%100 Koli Sayımı, İstif Güvenliği ve Mühürleme Kanıtı", detail: "Yükleme boyunca tam adet sayımı, kırılma/ezilme önleyici istif kontrolü ve seri numaralı konteyner mührünün (bolt seal) kilitlenip fotoğraflanması." },
    ],
    commercialTermsTitle: "Bağımsız ve Sabit Ücretli Hizmet Şartları",
    commercialTerms: [
      { label: "Tedarikçi Bağımsızlığı", value: "Kendi tedarikçinizden verdiğiniz tekil siparişlerde dahi kullanılabilir" },
      { label: "Ücret Modeli", value: "Mal bedelinden bağımsız, sabit adam/gün denetim ücreti" },
      { label: "Saha Kapsamı", value: "Çin'in tüm üretim eyaletleri + Türkiye'nin tüm sanayi illeri" },
      { label: "Çıkar Çatışması İlkesi", value: "Üreticiden hiçbir komisyon veya hediye kabul edilmez; rapor yalnız alıcıya sunulur" },
    ],
    whyTitle: "Neden Bakiye Ödemesinden Önce Saha Denetimi Şarttır?",
    whyPoints: [
      "Eksik koli, yanlış model, nemli palet kaynaklı küflenme ve son dakika kalite düşüşlerini konteyner kapanmadan yakalar.",
      " Çin'e uçak bileti, vize ve konaklama maliyetinin çok küçük bir kısmına 48 saat içinde profesyonel mühendis gözü sağlar.",
      "Anlık WhatsApp yükleme fotoğrafları sayesinde sevkiyatı masanızdan canlı takip edersiniz.",
    ],
    faq: [
      {
        q: "Tedarikçiyi kendimiz Alibaba veya fuardan bulduk; sadece yükleme denetimi alabilir miyiz?",
        a: "Evet. Bu hizmet tam olarak kendi tedarikçisiyle çalışan ancak sevkiyat kalitesini ve konteyner yüklemesini şansa bırakmak istemeyen ithalatçılar için tekil olarak sunulmaktadır.",
      },
      {
        q: "Denetimde kusurlu ürün çıkarsa ne oluyor?",
        a: "Müfettişimiz fabrikadayken anlık fotoğraflarla sizi bilgilendirir; böylece bakiye ödemesini durdurup üreticiden düzeltme veya değişim talep etme gücünü elinizde tutarsınız.",
      },
      {
        q: "Denetim rezervasyonunu kaç gün önceden yapmalıyız?",
        a: "Yükleme tarihinden 2–4 gün önce bildirmeniz idealdir; acil yüklemelerde 24–48 saat içinde saha planlaması yapılabilmektedir.",
      },
    ],
    emailTemplate: {
      subject: "{{company}} İçin Çin & Türkiye Konteyner Yükleme ve Kalite Denetimi Teklifi",
      body: "Sayın {{company}} İthalat ve Satın Alma Ekibi,\n\n{{sector}} ithalat ve sevkiyatlarınızda bakiye ödemesi öncesinde riskleri sıfırlamak amacıyla hazırladığımız 24–48 Saat Bağımsız Konteyner Yükleme & Fabrika Denetimi teklifimizi inceleyebilirsiniz:\n\n{{url}}\n\nKapsam özeti:\n• Kendi bulduğunuz üreticilerde dahi 24–48 saatte sahada mühendis denetimi\n• ISO 2859-1 AQL kalite kontrolü + %100 koli sayımı + mühürleme kanıtı\n• Sabit şeffaf denetim ücreti, anlık fotoğraflar ve 48 saatte resmi PDF rapor\n\nSaygılarımızla,\nBdimexport Saha Denetim Masası",
    },
  },
  {
    slug: "cin-turkiye-tedarik-istihbarat",
    track: "intelligence",
    badge: "KURUMSAL İŞ TEKLİFİ · TEDARİK VE TİCARİ İSTİHBARAT",
    metaTitle: "Çin Tedarik ve Ticari İstihbarat Teklifi | Bdimexport",
    metaDesc: "Çin'den ithalatta gerçek üretici doğrulama, aracı eleme, GTİP gümrük/TAREKS maliyet simülasyonu ve 72 saatte şirket istihbarat raporu teklifi.",
    h1: "Doğrulanmış Üretici Tespiti, Kapıya Teslim Maliyet ve Ticari İstihbarat Teklifi",
    lead: "Para göndermeden önce karşı firmanın gerçek fabrika olup olmadığını resmi sicilden doğrulayan, aracı komisyonlarını eleyen ve GTİP bazında tüm gümrük/ilave vergi/TAREKS maliyetini kuruşu kuruşuna hesaplayan uçtan uca tedarik teklifi.",
    slaText: "24 Saatte Kapsam · 48–72 Saatte Sicil & Maliyet İstihbarat Raporu",
    deliverablesTitle: "3 Katmanlı Tedarik ve İstihbarat Teslimatı",
    deliverables: [
      { code: "IST-01", title: "Fabrika Resmi Sicil, Kapasite ve Banka Hesabı Doğrulaması", detail: "Çin USCC ticaret sicili, üretim lisansı, dava kayıtları ve proforma faturadaki banka lehtar uyumunun kontrol edilerek sahte/aracı firmaların elenmesi." },
      { code: "IST-02", title: "GTİP Bazlı Gümrük, İlave Vergi, Gözetim ve TAREKS Hesabı", detail: "Sipariş verilmeden önce gümrük vergisi, İGV, anti-damping, gözetim belgesi ve navlun dahil gerçek kapıya teslim birim maliyet tablosu." },
      { code: "IST-03", title: "Doğrudan Üretici Kısa Listesi ve Numune Konsolidasyonu", detail: "3–5 gerçek fabrikadan karşılaştırmalı FOB/CIF fiyat alınması ve numunelerin tek pakette toplanarak sunulması." },
    ],
    commercialTermsTitle: "Ticari Şartlar ve Süreç Güvencesi",
    commercialTerms: [
      { label: "Tekil Rapor Seçeneği", value: "Yalnızca mevcut tedarikçinizi doğrulamak için 72 saatlik rapor olarak alınabilir" },
      { label: "Uçtan Uca Tedarik", value: "Fabrika seçiminden gümrükleme ve deponuza teslime kadar tam yönetim" },
      { label: "Gizlilik", value: "Tedarikçi listeleriniz ve ürün projeleriniz gizlilik taahhüdü altındadır" },
      { label: "Saha Entegrasyonu", value: "İstihbarat sonrası dilerseniz fiziki fabrika ve yükleme denetimiyle birleştirilir" },
    ],
    whyTitle: "İthalatçılar Neden Sipariş Öncesi İstihbarat Alıyor?",
    whyPoints: [
      "Kendini fabrika gibi tanıtan dış ticaret aracılarına %12–%25 fazladan komisyon ödemeyi önler.",
      "Gümrükte sürpriz gözetim, anti-damping veya TAREKS engeliyle karşılaşma riskini siparişten önce ortadan kaldırır.",
      "İlk kez çalışılacak tedarikçiye kapora göndermeden önce resmi sicil kanıtı sunar.",
    ],
    faq: [
      {
        q: "Bulduğumuz Çinli firmanın gerçek üretici olup olmadığını kaç günde doğruluyorsunuz?",
        a: "Firmanın Çince unvanı veya proforma faturasını iletmeniz halinde 48 ila 72 saat içinde resmi faaliyet kapsamını, sermaye yapısını, üretim yetkisini ve hukuki risk kayıtlarını raporluyoruz.",
      },
      {
        q: "GTİP ve gümrük maliyet hesabı neden siparişten önce yapılmalı?",
        a: "Bazı ürün gruplarında gözetim uygulaması, ilave gümrük vergisi veya TAREKS denetimi birim maliyeti tamamen değiştirebilir; sipariş öncesi simülasyon kötü sürprizleri engeller.",
      },
      {
        q: "Teklifi nasıl başlatabiliriz?",
        a: "Aşağıdaki Akıllı RFQ formundan ürün bilginizi ve ihtiyacınızı seçerek 24 saatte yazılı teklif alabilirsiniz.",
      },
    ],
    emailTemplate: {
      subject: "{{company}} İçin Doğrulanmış Üretici Tedarik ve GTİP Maliyet İstihbaratı Teklifi",
      body: "Sayın {{company}} Yönetimi,\n\n{{sector}} grubundaki ithalat ve tedarik süreçlerinizde aracı maliyetlerini elemek ve gümrük/kalite risklerini sipariş öncesinde netleştirmek adına hazırladığımız kurumsal teklif sayfasını aşağıda inceleyebilirsiniz:\n\n{{url}}\n\nKapsam:\n• 48–72 saatte üretici resmi sicil ve gerçek fabrika doğrulaması\n• GTİP bazlı gümrük, gözetim, TAREKS ve navlun dahil kapıya teslim maliyet tablosu\n• Doğrudan üretici fiyat kıyaslaması ve konteyner yükleme nezareti\n\nSaygılarımızla,\nBdimexport Tedarik & Ticari İstihbarat Masası",
    },
  },
  {
    slug: "abd-avrupa-pazar-girisi",
    track: "marketing",
    badge: "KURUMSAL İŞ TEKLİFİ · ABD & AVRUPA DİJİTAL İHRACAT",
    metaTitle: "ABD ve Avrupa Pazar Giriş Teklifi | Bdimexport",
    metaDesc: "Markalar ve imalatçılar için ABD (BDIMEXPORT LLC) ve Avrupa pazarlarına çok dilli B2B/e-ihracat giriş, yerel güven ve saha operasyon teklifi.",
    h1: "ABD ve Avrupa Pazarlarına Çok Dilli B2B & Dijital İhracat Giriş Teklifi",
    lead: "Üretim gücü yüksek Türk markaları için ABD ve Avrupa pazarlarında yerel kurumsal güven, ülke bazlı hedef sayfalar ve doğrudan B2B/toptan alıcı kazanımı sağlayan anahtar teslim pazar giriş programı.",
    slaText: "24 Saatte Pazar Uygunluk Görüşmesi · Ülke Bazlı B2B Huni Kurulumu",
    deliverablesTitle: "Pazar Giriş Paketi Teslimatları",
    deliverables: [
      { code: "PZR-01", title: "Hedef Ülke Tarife, Sertifika ve Rakip Fiyat Konumlandırması", detail: "ABD, İngiltere, Almanya ve AB koridorlarında ürününüzün fiyat bandı, sertifika gereksinimi ve dağıtım kanalı haritası." },
      { code: "PZR-02", title: "Hedefli Ülke/Dil Teklif Sayfaları ve Outbound Alıcı Erişimi", detail: "Hedef ülkedeki distribütör, zincir mağaza ve proje alıcılarına kendi dillerinde kişiselleştirilmiş teklif sunumu." },
      { code: "PZR-03", title: "Lojistik, Gümrük ve Yükleme Kalite Güvence Entegrasyonu", detail: "İlk ihracat siparişlerinizde yabancı alıcının güvenini pekiştiren bağımsız yükleme raporu ve kapıya teslim navlun kurgusu." },
    ],
    commercialTermsTitle: "Program Çerçevesi",
    commercialTerms: [
      { label: "Hedef Bölgeler", value: "ABD, Birleşik Krallık, Almanya/DACH, Benelux, Fransa, Kuzey & Doğu Avrupa" },
      { label: "Kurumsal Destek", value: "BDIMEXPORT LLC (Wyoming, ABD · D-U-N-S® #14-977-6743 · SAP Ariba® BNO-100000188010374) + BD Sanayi (Türkiye)" },
      { label: "Başlangıç", value: "Ücretsiz ön analiz + 30/60/90 günlük ölçülebilir aksiyon takvimi" },
      { label: "Raporlama", value: "Şeffaf alıcı geri bildirimleri ve RFQ dönüşüm takibi" },
    ],
    whyTitle: "Neden ABD ve Avrupa'ya Yapılandırılmış Giriş?",
    whyPoints: [
      "Rastgele soğuk mesajlar yerine karşı şirketin adıyla açılan kurumsal teklif sayfası dönüşüm oranını katlar.",
      "ABD ve Avrupa alıcılarının en büyük çekincesi olan kalite ve termin riskini Bdimexport saha denetimiyle çözer.",
      "Tek elden hem pazar istihbaratı hem dijital görünürlük hem fiili ihracat operasyonu sunar.",
    ],
    faq: [
      {
        q: "Bu paket kimler için uygundur?",
        a: "Kendi markasıyla veya özel markalı (Private Label / OEM) üretim kapasitesiyle ABD, İngiltere ve Avrupa Birliği'nde düzenli B2B distribütör/alıcı ağı kurmak isteyen üreticiler için tasarlanmıştır.",
      },
      {
        q: "İlk görüşmede ne sunuyorsunuz?",
        a: "Ürününüzün GTİP kodu üzerinden hedef ülkelerdeki gümrük avantajını ve öncelikli 3 ihracat koridorunu içeren ücretsiz ön değerlendirme sunuyoruz.",
      },
      {
        q: "Nasıl başvurabiliriz?",
        a: "Aşağıdaki Akıllı RFQ modülünü doldurarak 24 saat içinde uzman ekibimizden yanıt alabilirsiniz.",
      },
    ],
    emailTemplate: {
      subject: "{{company}} İçin ABD ve Avrupa Pazarı B2B İhracat Giriş Teklifi ({{sector}})",
      body: "Sayın {{company}} Yönetimi,\n\n{{sector}} ürünlerinizin {{country}} pazarlarında doğrudan distribütör ve kurumsal alıcılarla buluşması için hazırladığımız Pazar Giriş ve B2B Büyüme teklifini aşağıda inceleyebilirsiniz:\n\n{{url}}\n\nÖzet kapsam:\n• Hedef ülke gümrük/fiyat konumlandırması ve alıcı tespiti\n• Karşı firmaya özel kişiselleştirilmiş çok dilli teklif sayfaları\n• BDIMEXPORT LLC (ABD) + BD Sanayi (TR) operasyon güvencesi\n\nSaygılarımızla,\nBdimexport Küresel Büyüme Masası",
    },
  },
] as const;

export function getTrCorridorBySlug(slug: string): TrExportCorridor | undefined {
  return TR_EXPORT_CORRIDORS.find((c) => c.slug === slug);
}

export function getTrProposalBySlug(slug: string): TrProposalBlueprint | undefined {
  return TR_PROPOSALS.find((p) => p.slug === slug);
}
