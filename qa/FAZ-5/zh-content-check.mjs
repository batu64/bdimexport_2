// FAZ_5 5.3/5.7 — /zh içerik kontrolü (deterministik, model yok): node qa/FAZ-5/zh-content-check.mjs
// Ölçütler: ≥1200 kelime (Intl.Segmenter zh — Çince kelime bölütleme) · Baidu title ≤30 / desc ≤78 karakter · SSS ≥5 ·
// 简体字 (yaygın geleneksel karakter yok) · I18N_RULES §3 zh sözlüğü (uyuşmazlık ≤3) · ≥2 iç link · linkli kaynak · ICP vaadi yok.
import fs from "node:fs";
import path from "node:path";

const ROOT = path.resolve(import.meta.dirname, "../..");
const DIR = path.join(ROOT, "content", "zh", "services");
// yaygın geleneksel karakterler (basitleştirilmiş karşılığı farklı olanlar)
const TRAD = /[們這來為與國會時開關實對業務進貨運報價個說話門問題經濟發現電腦網絡設計認證場廠驗檢關稅貿區產購費給應幣圖書買賣頁營銷權雙點擊讓從處將還線]/g;
// I18N_RULES §3: yanlış/alternatif karşılıklar (bunlar görülürse uyuşmazlık)
const WRONG = { "采购": /采买|購買|筹购/g, "验厂": /工厂审核|驗廠|工厂审计/g, "物流": /后勤/g, "清关": /通关手续|报关清关/g, "代工生产": /贴牌生产/g };
const seg = new Intl.Segmenter("zh", { granularity: "word" });

let fail = 0;
const rows = [];
for (const f of fs.readdirSync(DIR).filter((x) => x.endsWith(".md")).sort()) {
  const raw = fs.readFileSync(path.join(DIR, f), "utf8");
  const meta = raw.match(/<!-- META: title="([^"]+)" desc="([^"]+)" -->/);
  const body = raw.replace(/<!--[\s\S]*?-->/g, "").replace(/\]\([^)]+\)/g, "]");
  const text = body.replace(/^## 数据来源[\s\S]*$/m, ""); // kaynak listesi sayılmaz
  const words = [...seg.segment(text)].filter((s) => s.isWordLike).length;
  const hanzi = (text.match(/\p{Script=Han}/gu) ?? []).length;
  const faqBlock = raw.split(/^## 常见问题\s*$/m)[1]?.split(/^## /m)[0] ?? "";
  const faq = (faqBlock.match(/^### /gm) ?? []).length;
  const trad = [...new Set(raw.match(TRAD) ?? [])];
  const wrong = Object.entries(WRONG).flatMap(([k, re]) => (raw.match(re) ?? []).map((m) => `${m}→${k}`));
  const internal = (raw.match(/\]\(\/zh[^)]*\)/g) ?? []).length;
  const sources = (raw.split(/^## 数据来源\s*$/m)[1]?.match(/\]\(https:\/\/[^)]+\)/g) ?? []).length;
  const icp = /ICP|备案|中国大陆服务器|国内服务器/.test(raw);
  const r = {
    file: f, words, hanzi,
    title: meta?.[1].length ?? null, desc: meta?.[2].length ?? null, faq,
    trad: trad.join(""), wrongTerms: wrong.length, internal, sources, icp,
  };
  const ok = words >= 1200 && r.title !== null && r.title <= 30 && r.desc <= 78 && faq >= 5 && !trad.length && wrong.length <= 3 && internal >= 2 && sources >= 1 && !icp;
  if (!ok) fail++;
  rows.push({ ...r, ok });
}
console.table(rows);
// toplam sözlük uyuşmazlığı (I18N_RULES §3: > 3 = red)
const totalWrong = rows.reduce((a, r) => a + r.wrongTerms, 0);
console.log(`sözlük uyuşmazlığı toplam: ${totalWrong} (eşik ≤3) · sayfa: ${rows.length} · kırmızı: ${fail}`);
process.exit(fail || totalWrong > 3 ? 1 : 0);
