// FAZ_4 4.5 — locale ÖNERİSİ + GEREKÇE (DETERMİNİSTİK; model yok). Konu/haber metnindeki pazar sinyallerinden ve 4.4 haber etiketlerinden türetilir.
// Örn. "hazelnut + germany" → /de (DACH sinyali: 'germany') + /en (global taban). Öneri DANIŞMA niteliğindedir: taslaklar yöneticinin SEÇTİĞİ locale'ler için
// üretilir (3.6 UI'da locale seçimi zorunlu); öneri + gerekçe iş sonucuna ve audit'e yazılır, yönetici karşılaştırıp yeni iş açabilir.
import { LOCALES } from "./schema";

export interface LocaleSuggestion {
  locales: string[];
  reasons: string[]; // ilk öğe özet ("ürün + pazar → /de + /en"), sonrakiler locale başına gerekçe
}

// [locale, etiket, terimler]. Terimler küçük harf; sözcük başında eşleşir (\b yok: TR ekleri için önek).
const MARKETS: { locale: string; label: string; terms: string[] }[] = [
  { locale: "de", label: "DACH pazarı", terms: ["germany", "german", "deutschland", "almanya", "dach", "austria", "österreich", "avusturya", "switzerland", "swiss", "isviçre", "schweiz"] },
  { locale: "en-ru", label: "Rusça/BDT pazarı", terms: ["russia", "russian", "rusya", "ukraine", "ukrayna", "cis", "kazakhstan", "kazakistan", "belarus", "россия"] },
  { locale: "en-fr", label: "Fransızca pazar", terms: ["france", "french", "fransa", "maghreb", "morocco", "fas ", "algeria", "cezayir", "tunisia", "tunus"] },
  { locale: "en-nl", label: "Benelüks pazarı", terms: ["netherlands", "dutch", "hollanda", "benelux", "belgium", "belçika", "rotterdam"] },
  { locale: "en-es", label: "İspanyolca pazar", terms: ["spain", "spanish", "ispanya", "latin america", "latin amerika", "mexico", "meksika", "argentina", "arjantin", "colombia", "kolombiya", "chile", "şili"] },
  { locale: "en-ar", label: "Körfez/Arap pazarı", terms: ["arab", "arap", "gulf", "körfez", "uae", "emirates", "saudi", "suudi", "ksa", "egypt", "mısır", "iraq", "irak", "kuwait", "kuveyt", "qatar", "katar", "jordan", "ürdün"] },
  { locale: "zh", label: "Çin pazarı", terms: ["china", "chinese", "çin ", "çinli", "shanghai", "shenzhen", "alibaba", "中国"] },
  { locale: "tr", label: "Türkiye pazarı/yerel KOBİ", terms: ["ithalat", "ihracat", "kobi", "türk firma", "gümrük müşavir", "turkish importer", "çin'den", "çinden", "ithalatçı", "ihracatçı"] },
];

const PRODUCTS: [string, string][] = [
  ["hazelnut", "hazelnut"], ["fındık", "hazelnut"], ["olive", "olive oil"], ["zeytin", "olive oil"], ["textile", "textile"], ["tekstil", "textile"],
  ["apparel", "apparel"], ["konfeksiyon", "apparel"], ["furniture", "furniture"], ["mobilya", "furniture"], ["ceramic", "ceramic tile"], ["seramik", "ceramic tile"],
  ["machinery", "machinery"], ["makine", "machinery"], ["cement", "cement"], ["çimento", "cement"], ["steel", "steel"], ["çelik", "steel"], ["marble", "marble"], ["mermer", "marble"],
];

const esc = (s: string) => s.replace(/[.*+?^${}()|[\]\\]/g, (c) => String.fromCharCode(92) + c);
// sözcük başı sınırı: 'için' içindeki 'çin ' gibi sözcük-ortası eşleşmeler sayılmaz (Unicode harf öncesi yok)
const hasTerm = (text: string, term: string) => new RegExp("(?<![\\p{L}])" + esc(term), "u").test(text);

const norm = (s: string) => s.normalize("NFKC").toLowerCase().replace(/\s+/g, " ");

export function suggestLocales(text: string, tagLocales: string[] = [], tagSector?: string | null): LocaleSuggestion {
  const t = " " + norm(text) + " ";
  const hits = new Map<string, string[]>();
  for (const m of MARKETS) {
    const found = m.terms.filter((term) => hasTerm(t, term));
    if (found.length) hits.set(m.locale, found.map((x) => x.trim()));
  }
  const product = PRODUCTS.find(([k]) => hasTerm(t, k))?.[1] ?? (tagSector && tagSector !== "other" ? tagSector.replace("-", " ") : null);

  const marketLocales = [...hits.keys()].filter((l) => l !== "tr").sort((a, b) => (hits.get(b)?.length ?? 0) - (hits.get(a)?.length ?? 0));
  const out: string[] = [];
  const reasons: string[] = [];
  for (const l of marketLocales) {
    const m = MARKETS.find((x) => x.locale === l)!;
    out.push(l);
    reasons.push(`/${l}: ${m.label} sinyali ('${hits.get(l)!.slice(0, 2).join("', '")}')`);
  }
  if (hits.has("tr") && marketLocales.length === 0) {
    out.push("tr");
    reasons.push(`/tr: yerel KOBİ/ithalat-ihracat sinyali ('${hits.get("tr")!.slice(0, 2).join("', '")}')`);
  }
  // 4.4 etiketleri (haber → locale_suggestion): metin sinyali yoksa ve ek bilgi olarak
  for (const l of tagLocales) {
    if (!(LOCALES as readonly string[]).includes(l) || out.includes(l) || out.length >= 3) continue;
    out.push(l);
    reasons.push(`/${l}: haber etiketi (4.4) önerdi`);
  }
  // global taban: yalnız-tr olmayan her durumda /en
  if (!(out.length === 1 && out[0] === "tr") && !out.includes("en")) {
    out.push("en");
    reasons.push(out.length === 1 ? "/en: belirgin pazar sinyali yok → global İngilizce taban" : "/en: global taban (tüm B2B alıcı pazarlarını kapsar)");
  }
  const locales = out.slice(0, 4);
  const market = marketLocales.length ? hits.get(marketLocales[0])![0] : null;
  const head = `${[product, market].filter(Boolean).join(" + ") || "konu"} → ${locales.map((l) => "/" + l).join(" + ")}`;
  return { locales, reasons: [head, ...reasons] };
}
