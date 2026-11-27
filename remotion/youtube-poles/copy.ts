// Video metinleri — EN (global/ihracat) + TR. Tedarikçi markası geçmez; tüm iletişim bdimexport'a yönlenir.
// Teknik veriler: ürünler/DİREKLERLE İLGİLİ BİLGİLER (tornalı direk notları + emprenye şartnamesi).

export type Lang = "en" | "tr";

export type AppScene = {
  img: string;
  inset: string;
  kicker: string;
  title: string;
  specs: string[];
};

export type Copy = {
  introTag: string;
  introTitle: string;
  introSub: string;
  hookKicker: string;
  hookLines: string[];
  rangeKicker: string;
  rangeTitle: string;
  rangeTurned: string;
  rangeTurnedSub: string;
  rangeUtility: string;
  rangeUtilitySub: string;
  diaLabel: string;
  appsKicker: string;
  apps: AppScene[];
  treatKicker: string;
  treatTitle: string;
  treatSteps: { n: string; t: string; v: string }[];
  treatStats: { v: string; l: string }[];
  finishKicker: string;
  finishTitle: string;
  green: string;
  greenSub: string;
  brown: string;
  brownSub: string;
  finishChips: string[];
  exportKicker: string;
  exportTitle: string;
  exportCount: string;
  exportCountSub: string;
  exportSpecs: { v: string; l: string }[];
  whyKicker: string;
  whyTitle: string;
  why: { t: string; d: string }[];
  ctaTitle: string;
  ctaSub: string;
  ctaButton: string;
};

const en: Copy = {
  introTag: "EXPORT SUPPLY FROM TÜRKİYE",
  introTitle: "Impregnated Round Wooden Poles",
  introSub: "Vineyard · Orchard · Fencing · Landscaping · Utility",
  hookKicker: "VACUUM-PRESSURE TREATED PINE",
  hookLines: ["Built to stand.", "In soil, sun and rain."],
  rangeKicker: "PRODUCT RANGE",
  rangeTitle: "One supplier. Every diameter you need.",
  rangeTurned: "Ø5 – Ø20 cm",
  rangeTurnedSub: "Round turned poles · lengths up to 6 m",
  rangeUtility: "7 · 9 · 12 m",
  rangeUtilitySub: "Utility & telegraph poles",
  diaLabel: "Diameter",
  appsKicker: "APPLICATION",
  apps: [
    {
      img: "vine-head-q12.jpg",
      inset: "vineyard-sea.jpg",
      kicker: "Vineyards",
      title: "Trellis posts for vineyards",
      specs: ["Head posts Ø12 cm", "Line posts Ø8 – Ø10 cm", "Lengths 200 · 220 · 250 cm", "50 cm set into the ground"],
    },
    {
      img: "vine-stakes.jpg",
      inset: "vine-q10.jpg",
      kicker: "New planting",
      title: "Square stakes for young vines",
      specs: ["2.5 × 2.5 cm stakes", "Lengths 1 – 1.5 m", "40 – 50 cm driven into soil", "Green impregnated"],
    },
    {
      img: "orchard-net.jpg",
      inset: "orchard-pole.jpg",
      kicker: "Orchards",
      title: "Hail-net systems for fruit orchards",
      specs: ["Head posts Ø12 cm", "Intermediate posts Ø10 cm", "Lengths 4 · 4.5 · 5 m", "6 m on request"],
    },
    {
      img: "sapling-orchard.jpg",
      inset: "q6-green.jpg",
      kicker: "Nurseries & orchards",
      title: "Sapling support stakes",
      specs: ["Ø5 – Ø6 cm", "Lengths 1.5 – 2 m", "Walnut & pistachio orchards", "Pointed or flat ends"],
    },
    {
      img: "fence-stacks.jpg",
      inset: "q8-green.jpg",
      kicker: "Fencing",
      title: "Fence & wire-mesh posts",
      specs: ["Ø8 cm standard", "Ø10 – Ø12 cm heavy duty", "Brace posts with 45° cut end", "Length to match your fence height"],
    },
    {
      img: "q10x200.jpg",
      inset: "q6-green.jpg",
      kicker: "Landscaping & forestry",
      title: "Tree stakes & plantation guards",
      specs: ["Ø10 × 300 cm tree stakes", "Ø6 cm guards · half-round option", "Ø8 × 150 cm plantation fencing", "Ideal for municipal tenders"],
    },
    {
      img: "q18-raw.jpg",
      inset: "q14-treated.jpg",
      kicker: "Restoration & structures",
      title: "Heavy-diameter structural poles",
      specs: ["Ø14 · Ø16 · Ø18 cm", "Brown finish preferred", "Untreated or impregnated", "Longer sizes from pole stock"],
    },
    {
      img: "brown-9m.jpg",
      inset: "brown-poles.jpg",
      kicker: "Utility networks",
      title: "Wooden utility & telegraph poles",
      specs: ["7 · 9 · 12 m lengths", "Brown: up to 9 m", "Green: all lengths", "Export favourite: brown 9 m"],
    },
  ],
  treatKicker: "QUALITY PROCESS",
  treatTitle: "Vacuum-pressure impregnation",
  treatSteps: [
    { n: "01", t: "Initial vacuum", v: "≥ 60 min · 63.5 cmHg" },
    { n: "02", t: "Cylinder flooded", v: "Full preservative fill" },
    { n: "03", t: "Pressure phase", v: "≥ 10.5 kg/cm²" },
    { n: "04", t: "Final vacuum", v: "15 min" },
  ],
  treatStats: [
    { v: "3.5%", l: "Solution ratio" },
    { v: "≥ 20 mm", l: "Penetration · 75% of sapwood" },
    { v: "≤ 25%", l: "Moisture before treatment" },
    { v: "≤ 30 °C", l: "Solution temperature" },
  ],
  finishKicker: "OPTIONS",
  finishTitle: "Your colour. Your size. Your tip.",
  green: "Green impregnated",
  greenSub: "Recommended for vineyards & in-ground use",
  brown: "Brown impregnated",
  brownSub: "Preferred for export & utility poles",
  finishChips: ["Pointed or flat ends", "Custom lengths", "Strapped bundles"],
  exportKicker: "EXPORT LOGISTICS",
  exportTitle: "Loaded, strapped and shipped.",
  exportCount: "140",
  exportCountSub: "9 m utility poles per container",
  exportSpecs: [
    { v: "Ø12 – 14 cm", l: "Top diameter" },
    { v: "Ø22 – 23 cm", l: "Butt diameter" },
  ],
  whyKicker: "WHY BDIMEXPORT",
  whyTitle: "Your export partner for wooden poles",
  why: [
    { t: "Factory-direct sourcing", d: "Large ready stock in Türkiye" },
    { t: "Made to your spec", d: "Diameter, length, colour, tip" },
    { t: "Export documentation", d: "Packing lists, invoices, certificates" },
    { t: "Worldwide delivery", d: "Container loads to your port" },
  ],
  ctaTitle: "Request your quote today",
  ctaSub: "Tell us the diameter, length and quantity — we handle the rest.",
  ctaButton: "Get a quote",
};

const tr: Copy = {
  introTag: "TÜRKİYE'DEN İHRACAT TEDARİĞİ",
  introTitle: "Emprenyeli Yuvarlak Ahşap Direkler",
  introSub: "Bağ · Meyve Bahçesi · Çit · Peyzaj · Tel Direk",
  hookKicker: "VAKUM-BASINÇ EMPRENYELİ ÇAM",
  hookLines: ["Yıllarca ayakta.", "Toprakta, güneşte, yağmurda."],
  rangeKicker: "ÜRÜN GAMI",
  rangeTitle: "Tek tedarikçi. İhtiyacınız olan her çap.",
  rangeTurned: "Ø5 – Ø20 cm",
  rangeTurnedSub: "Yuvarlak tornalı direkler · 6 m'ye kadar",
  rangeUtility: "7 · 9 · 12 m",
  rangeUtilitySub: "Tel (elektrik/telefon) direkleri",
  diaLabel: "Çap",
  appsKicker: "KULLANIM ALANI",
  apps: [
    {
      img: "vine-head-q12.jpg",
      inset: "vineyard-sea.jpg",
      kicker: "Bağcılık",
      title: "Bağ telleme direkleri",
      specs: ["Baş direk Ø12 cm", "Ara direk Ø8 – Ø10 cm", "Boy 200 · 220 · 250 cm", "50 cm toprak altında"],
    },
    {
      img: "vine-stakes.jpg",
      inset: "vine-q10.jpg",
      kicker: "Yeni dikim",
      title: "Genç asma için herek",
      specs: ["2,5 × 2,5 cm herek", "Boy 1 – 1,5 m", "40 – 50 cm toprağa çakılır", "Yeşil emprenyeli"],
    },
    {
      img: "orchard-net.jpg",
      inset: "orchard-pole.jpg",
      kicker: "Meyve bahçeleri",
      title: "Dolu filesi sistemleri",
      specs: ["Baş direk Ø12 cm", "Ara direk Ø10 cm", "Boy 4 · 4,5 · 5 m", "İsteğe göre 6 m"],
    },
    {
      img: "sapling-orchard.jpg",
      inset: "q6-green.jpg",
      kicker: "Fidanlık & bahçe",
      title: "Fidan destek direkleri",
      specs: ["Ø5 – Ø6 cm", "Boy 1,5 – 2 m", "Ceviz & fıstık bahçeleri", "Sivri veya düz uç"],
    },
    {
      img: "fence-stacks.jpg",
      inset: "q8-green.jpg",
      kicker: "Çit & tel örgü",
      title: "Bahçe çevirme direkleri",
      specs: ["Standart Ø8 cm", "Sağlam istenirse Ø10 – Ø12 cm", "45° kesimli payanda", "Boy tel yüksekliğine göre"],
    },
    {
      img: "q10x200.jpg",
      inset: "q6-green.jpg",
      kicker: "Peyzaj & orman",
      title: "Ağaç destek ve ihata direkleri",
      specs: ["Ø10 × 300 cm ağaç destek", "Ø6 cm çevirme · yarım yuvarlak", "Ø8 × 150 cm ihata direği", "Belediye ve kurum ihaleleri"],
    },
    {
      img: "q18-raw.jpg",
      inset: "q14-treated.jpg",
      kicker: "Restorasyon & yapı",
      title: "Kalın çaplı yapı direkleri",
      specs: ["Ø14 · Ø16 · Ø18 cm", "Kahverengi emprenye tercih edilir", "Emprenyeli veya emprenyesiz", "Uzun boylar tel direk stoğundan"],
    },
    {
      img: "brown-9m.jpg",
      inset: "brown-poles.jpg",
      kicker: "Enerji & iletişim hatları",
      title: "Ahşap tel direkleri",
      specs: ["7 · 9 · 12 m boylar", "Kahverengi: 9 m'ye kadar", "Yeşil: tüm boylar", "İhracatın favorisi: kahve 9 m"],
    },
  ],
  treatKicker: "KALİTE SÜRECİ",
  treatTitle: "Vakum-basınç emprenye",
  treatSteps: [
    { n: "01", t: "İlk vakum", v: "≥ 60 dk · 63,5 cmHg" },
    { n: "02", t: "Kazan doldurma", v: "Tam emprenye çözeltisi" },
    { n: "03", t: "Basınç", v: "≥ 10,5 kg/cm²" },
    { n: "04", t: "Son vakum", v: "15 dk" },
  ],
  treatStats: [
    { v: "%3,5", l: "Karışım oranı" },
    { v: "≥ 20 mm", l: "Nüfuz · diri odunun %75'i" },
    { v: "≤ %25", l: "İşlem öncesi rutubet" },
    { v: "≤ 30 °C", l: "Çözelti sıcaklığı" },
  ],
  finishKicker: "SEÇENEKLER",
  finishTitle: "Renk, ölçü ve uç — size göre.",
  green: "Yeşil emprenye",
  greenSub: "Bağ ve toprak altı kullanım için önerilir",
  brown: "Kahverengi emprenye",
  brownSub: "İhracat ve tel direklerde tercih edilir",
  finishChips: ["Sivri veya düz uç", "Özel boy", "Çemberli paketler"],
  exportKicker: "İHRACAT LOJİSTİĞİ",
  exportTitle: "Yüklenir, çemberlenir, gönderilir.",
  exportCount: "140",
  exportCountSub: "adet 9 m tel direk / konteyner",
  exportSpecs: [
    { v: "Ø12 – 14 cm", l: "Uç çapı" },
    { v: "Ø22 – 23 cm", l: "Dip çapı" },
  ],
  whyKicker: "NEDEN BDIMEXPORT",
  whyTitle: "Ahşap direkte ihracat ortağınız",
  why: [
    { t: "Üreticiden doğrudan", d: "Türkiye'de geniş hazır stok" },
    { t: "Size özel üretim", d: "Çap, boy, renk, uç tipi" },
    { t: "İhracat evrakı", d: "Çeki listesi, fatura, sertifika" },
    { t: "Dünyaya teslimat", d: "Limanınıza konteyner sevkiyat" },
  ],
  ctaTitle: "Hemen teklif isteyin",
  ctaSub: "Çap, boy ve adet bilgisini iletin — gerisini biz halledelim.",
  ctaButton: "Teklif al",
};

export const COPY: Record<Lang, Copy> = { en, tr };

export const CONTACT = {
  web: "bdimexport.com",
  mail: "info@bdimexport.com",
  phone: "+90 539 414 78 54",
};
