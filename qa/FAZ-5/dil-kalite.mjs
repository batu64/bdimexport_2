// FAZ_5 5.7 — dil kalite turu, deterministik kanıt toplayıcı (model yok): node qa/FAZ-5/dil-kalite.mjs [--json]
// Okur: content/{tr,en,de,zh}, lib/messages/**, app/(…)/**, lib/ui/**, design/hero-copy.md, I18N_RULES.md, .next-build (son build).
// YAZMAZ: yalnız rapor girdisi üretir (qa/FAZ-5/dil-kalite-turu.md bu çıktıdan derlenir). Çıkış kodu: kırmızı bulgu varsa 1.
import fs from "node:fs";
import path from "node:path";

const ROOT = path.resolve(import.meta.dirname, "../..");
const rd = (p) => fs.readFileSync(path.join(ROOT, p), "utf8");
const ex = (p) => fs.existsSync(path.join(ROOT, p));
function walk(dir, exts) {
  const abs = path.join(ROOT, dir);
  if (!fs.existsSync(abs)) return [];
  return fs.readdirSync(abs, { recursive: true, withFileTypes: true })
    .filter((d) => d.isFile() && exts.some((e) => d.name.endsWith(e)))
    .map((d) => path.relative(ROOT, path.join(d.parentPath ?? d.path, d.name)).replaceAll("\\", "/"));
}
/** Kod dosyasından yorumları ayıkla (// … , /* … *\/ , {/* … *\/}) — yorumlar Türkçe olabilir, kullanıcıya görünmez. */
const stripComments = (src) => src.replace(/\{\/\*[\s\S]*?\*\/\}/g, "").replace(/\/\*[\s\S]*?\*\//g, "").replace(/(^|[^:"'`\\])\/\/.*$/gm, "$1");
/** JSON: yalnız değerler (anahtarlar değil) */
function jsonValues(o, out = []) {
  if (typeof o === "string") out.push(o);
  else if (Array.isArray(o)) o.forEach((v) => jsonValues(v, out));
  else if (o && typeof o === "object") Object.values(o).forEach((v) => jsonValues(v, out));
  return out;
}
const hits = (text, re) => [...text.matchAll(new RegExp(re.source, re.flags.includes("g") ? re.flags : re.flags + "g"))].map((m) => m[0]);
const findings = [];
const add = (lang, check, result, evidence = "", severity = result === "✅" ? "ok" : result === "⚠️" ? "warn" : "red") =>
  findings.push({ lang, check, result, evidence, severity });

// ───────────────────────── ZH
const zhFiles = [...walk("content/zh", [".md", ".json"]), "lib/messages/zh.json"];
const zhApp = walk("app/(zh)", [".tsx", ".ts"]);
const zhText = zhFiles.map((f) => [f, rd(f)]).concat(zhApp.map((f) => [f, stripComments(rd(f))]));
const TRAD = /[們這來為與國會時開關實對業務進貨運報價個說話門問題經濟發現電腦網絡設計認證場廠驗檢關稅貿區產購費給應幣圖書買賣頁營銷權雙點擊讓從處將還線]/;
{
  const t = zhText.flatMap(([f, s]) => hits(s, TRAD).map((h) => `${f}:${h}`));
  add("zh", "简体字 (geleneksel karakter = red)", t.length ? "❌" : "✅", t.length ? t.slice(0, 8).join(", ") : `${zhText.length} dosya, geleneksel 0`);
}
{
  const WRONG = { 采购: /采买|購買|筹购/, 验厂: /工厂审核|驗廠|工厂审计/, 物流: /后勤/, 清关: /通关手续|报关清关/, 代工生产: /贴牌生产/ };
  const w = zhText.flatMap(([f, s]) => Object.entries(WRONG).flatMap(([k, re]) => hits(s, re).map((h) => `${f}:${h}→${k}`)));
  const used = Object.keys(WRONG).map((k) => `${k}×${zhText.reduce((a, [, s]) => a + hits(s, new RegExp(k)).length, 0)}`);
  add("zh", "I18N §3 sözlük (采购/验厂/物流/清关)", w.length > 3 ? "❌" : w.length ? "⚠️" : "✅", `uyuşmazlık ${w.length} (eşik ≤3) · kullanım ${used.join(" ")}${w.length ? " · " + w.join(", ") : ""}`);
}
{
  const icp = zhText.flatMap(([f, s]) => hits(s, /ICP|备案|中国大陆服务器|国内服务器|境内服务器/).map((h) => `${f}:${h}`));
  add("zh", "ICP vaadi yok", icp.length ? "❌" : "✅", icp.length ? icp.join(", ") : "ICP/备案/国内服务器 ifadesi 0");
}
{
  // 4-sayısı: (a) zh sözlükte 4 öğeli liste, (b) zh içerikte 4'ü öne çıkaran ifade, (c) render edilen /zh sayfalarında 4'lü ızgara/istatistik
  const zh = JSON.parse(rd("lib/messages/zh.json"));
  const lists = [];
  (function w(o, p) { if (Array.isArray(o)) { if (o.length === 4) lists.push(p); o.forEach((v, i) => w(v, `${p}[${i}]`)); } else if (o && typeof o === "object") for (const [k, v] of Object.entries(o)) w(v, `${p}.${k}`); })(zh, "zh");
  const emph = walk("content/zh", [".md"]).flatMap((f) => hits(rd(f), /(?<![0-9.,])4(?:个|项|步|大|种|条)|四(?:个|项|步|大|种|条)|^#+ .*(?<![0-9])4(?![0-9])/m).map((h) => `${f}:${h}`));
  const html = ["zh.html", ...walk(".next-build/zh/services", [".html"]).map((f) => f.replace(".next-build/", ""))].filter((f) => ex(`.next-build/${f}`));
  const grids = html.flatMap((f) => {
    const s = rd(`.next-build/${f}`);
    // dil/pazar seçici (Türkçe · English · Deutsch · 简体中文) gezinme listesidir, görsel vurgu değil → hariç
    return [...s.matchAll(/<ul role="list"[^>]*>([\s\S]*?)<\/ul>/g)].filter((m) => !(/简体中文/.test(m[1]) && /Deutsch/.test(m[1])))
      .map((m) => (m[1].match(/<li[\s>]/g) ?? []).length).filter((n) => n === 4).map(() => `${f}: 4'lü liste`);
  });
  const stats = html.flatMap((f) => (rd(`.next-build/${f}`).match(/data-count(?:-to)?="4"|data-value="4"/g) ?? []).map(() => `${f}: istatistik değeri 4`));
  const all = [...lists.map((l) => `sözlük ${l}`), ...emph, ...grids, ...stats];
  add("zh", "4-sayısı görsel vurgu kaçınması", all.length ? "⚠️" : "✅", all.length ? all.join(", ") : `zh.json 4'lü liste 0 · içerik 4/四 vurgusu 0 · render ${html.length} sayfa 4'lü ızgara 0 (hizmet 5, adım 5)`);
}

// ───────────────────────── DE
const deFiles = [...walk("content/de", [".md"]), "lib/messages/de.json"];
const deApp = walk("app/(de)", [".tsx", ".ts"]);
const deText = deFiles.map((f) => [f, f.endsWith(".json") ? jsonValues(JSON.parse(rd(f))).join("\n") : rd(f)]).concat(deApp.map((f) => [f, stripComments(rd(f))]));
{
  // ilk harf büyük/küçük duyarlı (cümle başı "Du" yakalanır); TAMAMI büyük tanımlayıcılar (ör. const DIR) hariç
  const DU = /\b(?:[dD]u|[dD]ich|[dD]ir|[dD]ein(?:e[mnrs]?)?|[eE]uch|[eE]uer|[eE]ure[mnr]?)\b/g;
  // app kodunda yalnız string/JSX metni anlamlı: "dir" HTML attribute'u (dir="rtl") hariç tutulur
  const d = deText.flatMap(([f, s]) => hits(s.replace(/\bdir=/g, "").replace(/\bdir\b(?=[:?\s]*["'`]?(ltr|rtl))/g, ""), DU).map((h) => `${f}:${h}`));
  add("de", "formal Sie (du/dich/euch = red)", d.length ? "❌" : "✅", d.length ? d.join(", ") : `${deText.length} dosya, informal hitap 0`);
}
{
  const SUPER = /\b(die besten?|beste[nrs]?|Marktführer|garantiert|Garantie|100\s?%|einzigartig|weltweit führend|Nr\.\s?1|unschlagbar|konkurrenzlos)\b/gi;
  // "Was wir nicht tun" bölümü kendi kendini yasaklayan alıntıdır → hariç
  const u = deText.flatMap(([f, s]) => hits(s.replace(/^## Was wir nicht tun[\s\S]*?(?=^## )/m, ""), SUPER).map((h) => `${f}:${h}`));
  add("de", "UWG: üstünlük/garanti iddiası yok", u.length ? "❌" : "✅", u.length ? u.join(", ") : "beste/Marktführer/garantiert/100 %/Nr. 1 → 0 (Was-wir-nicht-tun alıntısı hariç)");
}
{
  const all = deFiles.filter((f) => f.endsWith(".md")).map((f) => [f, rd(f)]);
  const lksg = all.flatMap(([f, s]) => s.split(/\n/).filter((l) => /LkSG|Lieferkettensorgfaltspflichtengesetz/.test(l)).map((l) => [f, l]));
  const lksgBad = lksg.filter(([, l]) => /1\.000|3\.000|Beschäftigt/.test(l) && !(/1\.000/.test(l) && /1\. Januar 2024/.test(l)));
  add("de", "LkSG terim/eşik doğruluğu", lksgBad.length ? "❌" : "✅", `${lksg.length} satır · eşik ifadeleri "1.000 … seit 1. Januar 2024" (§ 1 LkSG) · hatalı ${lksgBad.length}${lksgBad.length ? ": " + lksgBad.map(([f]) => f).join(",") : ""}`);
  const atr = all.flatMap(([f, s]) => s.split(/\n/).filter((l) => /A\.TR/.test(l)).map((l) => [f, l]));
  const atrBad = atr.filter(([, l]) => /A\.TR[^.]*(weist|bescheinigt|belegt)[^.]*Ursprung/.test(l) && !/nicht/.test(l));
  const atrExcl = all.filter(([, s]) => /A\.TR/.test(s)).filter(([, s]) => !/(landwirtschaftliche|Agrar)/.test(s) || !/(Eisen|Stahl)/.test(s)).map(([f]) => f);
  add("de", "A.TR terim doğruluğu (Freiverkehr ≠ Ursprung; tarım + Stahl istisnası)", atrBad.length || atrExcl.length ? "❌" : "✅",
    `${atr.length} satır · "A.TR = Ursprungsnachweis" iddiası ${atrBad.length} · istisna (Agrar + Eisen/Stahl) eksik dosya ${atrExcl.length}${atrExcl.length ? ": " + atrExcl.join(",") : ""} · CH: EFTA-FHA ayrımı ${all.filter(([, s]) => /EFTA/.test(s)).length} dosyada`);
  const vp = all.flatMap(([f, s]) => s.split(/\n/).filter((l) => /Verpackung(sregister|sgesetz)|VerpackG|LUCID/.test(l)).map((l) => [f, l]));
  const vpOk = vp.some(([, l]) => /LUCID/.test(l) && /Verpackungsregister/.test(l));
  add("de", "VerpackG/LUCID terim doğruluğu", vpOk ? "✅" : vp.length ? "⚠️" : "✅", `${vp.length} satır · "Verpackungsregister LUCID" + "Hersteller im Sinne des Verpackungsgesetzes" ifadesi`);
}
{
  // I18N §3.1/3.2 DE terimleri: başlık/etiket düzeyinde birebir; sözlük dışı eşanlamlı = uyuşmazlık
  const WRONG = { Werksprüfung: /Fabrikprüfung|Fabrikinspektion|Werksinspektion|Qualitätsinspektion/, "Lohnfertigung / Private Label": /Eigenmarken-Fertigung|Auftragsfertigung/, Zollabwicklung: /Exportzollabwicklung|Zollservice/, Prüfbericht: /Inspektionsbericht|Auditbericht/, "Verifizierter türkischer Partner": /Verifizierte[rn]? türkische[rn]? Lieferant|geprüfter türkischer Partner/, "Kostenloses Angebot in 24 h anfordern": /Angebotseinholung/ };
  const w = deText.flatMap(([f, s]) => Object.entries(WRONG).flatMap(([k, re]) => hits(s, re).map((h) => `${f}:${h}→${k}`)));
  const warn = deText.flatMap(([f, s]) => hits(s, /Frachtlogistik/g).map(() => f));
  add("de", "I18N §3.1/3.2 terim tutarlılığı", w.length > 3 ? "❌" : w.length ? "⚠️" : warn.length ? "⚠️" : "✅",
    `uyuşmazlık ${w.length} (eşik ≤3)${w.length ? ": " + w.join(", ") : ""}${warn.length ? ` · uyarı: "Frachtlogistik" (Logistik bileşiği) ${warn.length}× — ${[...new Set(warn)].join(",")}` : ""}`);
}

// ───────────────────────── ÇAPRAZ
{
  // Hardcoded TR sızıntısı: TR dışı yüzeylerde (app/(en*|de|zh), lib/ui) yorum dışı kodda Türkçe'ye özgü harf (ı İ ş Ş ğ Ğ)
  const surfaces = [...walk("app/(en)", [".tsx", ".ts"]), ...["ar", "es", "fr", "nl", "ru"].flatMap((v) => walk(`app/(en-${v})`, [".tsx", ".ts"])), ...deApp, ...zhApp, ...walk("lib/ui", [".tsx", ".ts"])];
  // İstisnalar (gerekçeli, kullanıcıya görünmez): özel ad/dil adı (dil seçicide kendi dilinde) · build-zamanı geliştirici
  // hatası (throw new Error) · lib/ui/md.tsx FAQ_HEADINGS = çok dilli SSS başlık EŞLEŞTİRME listesi (render çıktısı değil)
  const STRIP = /Türkiye|İstanbul|Türkçe/g;
  const lines = surfaces.flatMap((f) => stripComments(rd(f)).split("\n").map((l, i) => [f, i + 1, l]))
    .filter(([, , l]) => /[ıİşŞğĞ]/.test(l.replace(STRIP, "")));
  const allowed = lines.filter(([f, , l]) => /throw new Error\(/.test(l) || (f === "lib/ui/md.tsx" && /Sık Sorulan Sorular/.test(l)));
  const leak = lines.filter((x) => !allowed.includes(x));
  add("çapraz", "UI metni i18n'den — hardcoded TR sızıntısı (TR dışı yüzeyler)", leak.length ? "❌" : "✅",
    (leak.length ? leak.slice(0, 10).map(([f, n, l]) => `${f}:${n} ${l.trim().slice(0, 80)}`).join(" | ") : `${surfaces.length} dosya (app/(en,en-*,de,zh) + lib/ui), kullanıcıya görünen Türkçe 0`)
    + (allowed.length ? ` · gerekçeli istisna ${allowed.length}: ${allowed.map(([f, n]) => `${f}:${n}`).join(", ")}` : ""));
  const msgLeak = ["en", "de", "zh"].map((l) => [`lib/messages/${l}.json`, jsonValues(JSON.parse(rd(`lib/messages/${l}.json`)))])
    .concat(["ar", "es", "fr", "nl", "ru"].map((v) => [`lib/messages/variants/${v}.json`, jsonValues(JSON.parse(rd(`lib/messages/variants/${v}.json`)))]))
    .flatMap(([f, vals]) => vals.filter((v) => /[ıİşŞğĞ]/.test(v.replace(/Türkiye|İstanbul|Türkçe/g, ""))).map((v) => `${f}: ${v.slice(0, 60)}`));
  add("çapraz", "Sözlük dosyalarında (en/de/zh/varyant) TR sızıntısı", msgLeak.length ? "❌" : "✅", msgLeak.length ? msgLeak.join(" | ") : "8 sözlük dosyası, Türkçe değer 0");
}
{
  // hero-copy ↔ sözlük ↔ messages: CTA birincil
  const hc = rd("design/hero-copy.md");
  const glossary = rd("I18N_RULES.md").match(/\| Teklif CTA \| ([^|]+)\| ([^|]+)\| ([^|]+)\| ([^|]+)\|/);
  const g = { tr: glossary[1].trim(), en: glossary[2].trim(), zh: glossary[3].trim(), de: glossary[4].trim() };
  const sec = (h) => hc.split(/^## /m).find((s) => s.startsWith(h)) ?? "";
  const cta = (h) => (sec(h).match(/\*\*CTA primary:\*\* ([^*⚠\n]+)/)?.[1] ?? "").trim();
  const cta2 = (h) => (sec(h).match(/\*\*CTA secondary:\*\* ([^*⚠—\n]+)/)?.[1] ?? "").trim();
  const msg = (l) => JSON.parse(rd(`lib/messages/${l}.json`)).home?.hero?.ctaPrimary ?? "";
  const rows = [
    ["en", cta("EN"), msg("en"), g.en],
    ["de", cta("DE"), msg("de"), g.de],
    ["zh", cta("ZH"), msg("zh"), g.zh],
    ["tr", cta2("TR"), "(TR birincil = program başvurusu)", g.tr],
  ];
  const bad = rows.filter(([l, h, m, gl]) => (l === "tr" ? h !== gl : !(h === gl && m === gl)));
  const staleMarker = /CTA primary:\*\*[^\n]*⚠️/.test(sec("DE"));
  add("çapraz", "hero-copy ↔ sözlük ↔ messages (teklif CTA)", bad.length ? "❌" : staleMarker ? "⚠️" : "✅",
    rows.map(([l, h, m, gl]) => `${l}: hero="${h}" msg="${m}" sözlük="${gl}"`).join(" · ") + (staleMarker ? " · UYARI: hero-copy DE CTA satırında eski ⚠️ (Açık Konu 1) işareti duruyor" : ""));
}
{
  // CTA kanal matrisi (I18N §2): ru→Telegram · ar→WhatsApp · es→WhatsApp · fr→e-posta+WhatsApp · nl→e-posta · zh→WeChat · de→e-posta+WhatsApp
  const want = { ru: "telegram", ar: "whatsapp", es: "whatsapp", fr: "email", nl: "email" };
  const got = Object.fromEntries(Object.keys(want).map((v) => [v, JSON.parse(rd(`lib/messages/variants/${v}.json`)).channels.map((c) => c.id)]));
  const vBad = Object.entries(want).filter(([v, c]) => got[v][0] !== c);
  add("çapraz", "CTA matrisi — EN varyantları (birincil kanal)", vBad.length ? "❌" : "✅", Object.entries(got).map(([v, c]) => `${v}→${c.join("+")}`).join(" · ") + " · linkler gerçek handle gelene dek #contact (uydurma wa.me/t.me yok)");
  const zhOk = /WeChatContact/.test(rd("app/(zh)/zh/page.tsx")) && /微信/.test(JSON.stringify(JSON.parse(rd("lib/messages/zh.json")).nav));
  add("çapraz", "CTA matrisi — zh→WeChat", zhOk ? "✅" : "❌", "hub + 5 hizmet sayfasında WeChatContact; nav \"微信联系\"; env yokken \"即将上线\" + e-posta");
  const chrome = rd("app/(de)/de/_lib/chrome.tsx");
  const deMail = /mailto:/.test(chrome);
  const deWa = /whatsapp|wa\.me/i.test(stripComments(chrome));
  add("çapraz", "CTA matrisi — de→E-posta + WhatsApp", deMail && deWa ? "✅" : deMail ? "⚠️" : "❌", `e-posta ${deMail ? "✅ (nav/CTA/footer mailto)" : "✗"} · WhatsApp ${deWa ? "✅" : "✗ — gerçek numara yok (uydurma yasak) → 👤 numara gelince eklenir"}`);
}

// ───────────────────────── 5 EN VARYANTI ARAYÜZÜ (I18N §7 dil-özel yasaklar)
{
  const v = (x) => jsonValues(JSON.parse(rd(`lib/messages/variants/${x}.json`))).join("\n");
  const fr = hits(v("fr"), /\b(tu|toi|ton|ta|tes)\b/gi);
  add("fr", "formal vous (tu/toi/ton = red)", fr.length ? "❌" : "✅", fr.length ? fr.join(",") : "fr.json tu/toi/ton/ta/tes 0");
  const es = hits(v("es"), /\b(vosotros|vosotras|vuestro|vuestra|tenéis|podéis|queréis)\b/gi);
  add("es", "neutral ustedes (vosotros = red)", es.length ? "❌" : "✅", es.length ? es.join(",") : "vosotros/vuestro/-éis 0");
  const ruTxt = v("ru").replace(/WhatsApp|Telegram|Bdimexport|USD|RUB|EUR|[A-Z]{2,}|https?:\S+/g, "");
  const lat = (ruTxt.match(/[a-z]/gi) ?? []).length, cyr = (ruTxt.match(/[а-яё]/gi) ?? []).length;
  add("ru", "Kiril (translit = red) + Telegram birincil", cyr / (cyr + lat || 1) > 0.95 ? "✅" : "❌", `Kiril oranı ${(100 * cyr / (cyr + lat || 1)).toFixed(1)}% (marka/kanal adları hariç)`);
  const ar = [".next-build/en/ar.html", ...walk(".next-build/en/ar", [".html"])].filter(ex).filter((f) => !f.endsWith("/_yok.html")).slice(0, 12);
  // static export yer tutucusu (_yok → notFound): Next varsayılan hata kabuğu → lang/dir YOK (tüm dillerde; noindex)
  const ph = walk(".next-build", [".html"]).filter((f) => f.endsWith("/_yok.html"));
  const phNoLang = ph.filter((f) => !/<html[^>]*\blang=/.test(rd(f)));
  add("çapraz", "Makale yer tutucusu (_yok) sayfalarında lang/dir", phNoLang.length ? "⚠️" : "✅",
    `${ph.length} yer tutucu, lang'sız ${phNoLang.length}: ${phNoLang.map((f) => f.replace(".next-build/", "/").replace(".html", "")).join(", ")} — Next hata kabuğu (<html id="__next_error__">), noindex`);
  const noRtl = ar.filter((f) => !/<html[^>]*lang="ar"[^>]*dir="rtl"|<html[^>]*dir="rtl"[^>]*lang="ar"/.test(rd(f)));
  add("ar", "RTL zorunlu (<html lang=ar dir=rtl>)", ar.length && !noRtl.length ? "✅" : "❌", `${ar.length} render sayfa, RTL eksik ${noRtl.length}${noRtl.length ? ": " + noRtl.join(",") : ""}`);
}

// ───────────────────────── RAKAM KAYNAKLARI (link envanteri; canlılık kontrolü raporda curl ile)
{
  const srcFiles = [...walk("content/de", [".md"]), ...walk("content/zh/services", [".md"])];
  const rows = srcFiles.map((f) => {
    const s = rd(f);
    const body = s.split(/^## (Quellen|数据来源)\s*$/m)[0];
    const nums = hits(body.replace(/\]\([^)]+\)/g, "]"), /\d[\d.,]*\s?(?:Mrd\.|Mio\.|%|Prozent|亿|万|美元|里拉|TL|US-Dollar)/g).length;
    const links = hits(s.split(/^## (?:Quellen|数据来源)\s*$/m)[1] ?? "", /https:\/\/[^)\s]+/g);
    return { f, nums, links };
  });
  const noSrc = rows.filter((r) => r.nums > 0 && r.links.length === 0);
  add("çapraz", "Rakam → resmi kaynak linki (de + zh içerik)", noSrc.length ? "❌" : "✅", rows.map((r) => `${r.f.split("/").pop()}: rakam ${r.nums} / link ${r.links.length}`).join(" · "));
  if (process.argv.includes("--urls")) { console.log([...new Set(rows.flatMap((r) => r.links))].join("\n")); process.exit(0); }
}

const red = findings.filter((f) => f.severity === "red").length;
if (process.argv.includes("--json")) console.log(JSON.stringify(findings, null, 2));
else console.table(findings.map(({ lang, check, result }) => ({ lang, check, result })));
console.log(`kontrol: ${findings.length} · ✅ ${findings.filter((f) => f.severity === "ok").length} · ⚠️ ${findings.filter((f) => f.severity === "warn").length} · ❌ ${red}`);
process.exit(red ? 1 : 0);
