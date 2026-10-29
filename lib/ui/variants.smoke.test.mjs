// FAZ_2 Step 2.7 — 5 varyant SMOKE testi (render + RTL mirror + kanal CTA) + hex=0 teyidi.
// Çalıştır (önce `pnpm build`; test derlenmiş out/ HTML'ini okur):
//   node --experimental-strip-types --no-warnings --test lib/ui/variants.smoke.test.mjs
// Spesifikasyon: I18N_RULES §2 (kanal matrisi) · §4 (RTL) · SEO_PLAYBOOK §3 (html lang/dir) · design/components/lang-switcher.md.
import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = fileURLToPath(new URL("../../", import.meta.url));
// OUT_DIR: alternatif statik çıktı (ör. NEXT_DIST_DIR=.next-build build). Varsayılan out/.
const OUT = process.env.OUT_DIR ? path.resolve(ROOT, process.env.OUT_DIR) : path.join(ROOT, "out");
const VARIANTS = ["ru", "fr", "nl", "es", "ar"];

// I18N_RULES §2: bölge birincil → ikincil kanal (sıra önemli)
const CHANNELS = { ru: ["telegram", "whatsapp"], fr: ["email", "whatsapp"], nl: ["email"], es: ["whatsapp"], ar: ["whatsapp"] };
const DIR = { ru: "ltr", fr: "ltr", nl: "ltr", es: "ltr", ar: "rtl" };

function html(p) {
  const f = path.join(OUT, `${p}.html`);
  assert.ok(fs.existsSync(f), `out/${p}.html yok — önce 'pnpm build' çalıştırın`);
  return fs.readFileSync(f, "utf8");
}
const exists = (href) => fs.existsSync(path.join(OUT, `${href.replace(/^\//, "")}.html`));
const visible = (h) => h.replace(/<script[\s\S]*?<\/script>/g, "");

function attrs(tag) {
  const out = {};
  for (const m of tag.matchAll(/([a-zA-Z-]+)="([^"]*)"/g)) out[m[1]] = m[2];
  return out;
}

for (const v of VARIANTS) {
  test(`smoke: /en/${v} — render, RTL/LTR, kanal CTA, dil değiştirici`, () => {
    for (const p of [`en/${v}`, `en/${v}/services/sourcing`]) {
      const h = html(p);
      const vis = visible(h);

      // --- render + html lang/dir (SEO_PLAYBOOK §3; I18N_RULES §4) ---
      const htmlAttrs = attrs(h.match(/<html[^>]*>/)[0]);
      assert.equal(htmlAttrs.lang, v, `${p}: <html lang>`);
      if (DIR[v] === "rtl") assert.equal(htmlAttrs.dir, "rtl", `${p}: <html dir> rtl olmalı`);
      else assert.equal(htmlAttrs.dir, undefined, `${p}: LTR varyantta <html dir> olmamalı`);
      const shell = attrs(vis.match(/<div lang="[^"]*" dir="[^"]*" class="variant_shell[^"]*"/)[0] + ">");
      assert.equal(shell.lang, v, `${p}: shell lang`);
      assert.equal(shell.dir, DIR[v], `${p}: shell dir`);
      assert.equal((vis.match(/<h1[ >]/g) ?? []).length, 1, `${p}: tek h1`);
      assert.ok(/<main[ >]/.test(vis) && /<footer[ >]/.test(vis), `${p}: main+footer`);
      assert.deepEqual(h.match(/<link rel="canonical" href="([^"]*)"/)?.slice(1), [`https://bdimexport.com/${p}`], `${p}: canonical kendi URL'si`);
      assert.ok(!/<html[^>]*lang="tr"/.test(h), `${p}: lang=tr kalıntısı`);
      // iç üretim notu / çift başlık sızıntısı yok (1.5'te TR'de aynı hata bulundu)
      for (const leak of ["Sayfa tipi", "FAZ_2", "iskelet", "Terminoloji"]) assert.ok(!vis.includes(leak), `${p}: dahili not sızıntısı "${leak}"`);
      assert.ok(!/<p>#\s/.test(vis), `${p}: ikinci H1 paragraf olarak sızmış`);

      // --- kanal CTA (I18N_RULES §2) ---
      const region = vis.match(/<div class="variant_cta[^"]*" role="region"[\s\S]*?<\/div>/)?.[0];
      assert.ok(region, `${p}: CTA bölgesi yok`);
      const btns = [...region.matchAll(/<a href="([^"]*)" data-channel="([a-z]+)" class="([^"]*)">([^<]+)<\/a>/g)].map((m) => ({ href: m[1], ch: m[2], cls: m[3] }));
      assert.deepEqual(btns.map((b) => b.ch), CHANNELS[v], `${p}: kanal sırası (birincil→ikincil)`);
      btns.forEach((b, i) => {
        assert.ok(b.cls.includes(i === 0 ? "btnPrimary" : "btnSecondary"), `${p}: ${b.ch} ${i === 0 ? "birincil" : "ikincil"} stil`);
        assert.equal(b.href, "#contact", `${p}: gerçek handle yokken #contact çapası (uydurma link yasak)`);
      });
      assert.ok(vis.includes('id="contact"'), `${p}: #contact bölümü (CTA hedefi) yok`);
      assert.ok(!/wa\.me|t\.me\/|mailto:|tel:/.test(vis), `${p}: uydurma kanal linki`);

      // --- dil değiştirici: yalnız VAR OLAN karşılıklar; tam bir seçili (mevcut dil) ---
      const opts = [...vis.matchAll(/<a id="[^"]*" role="option" lang="([^"]*)" hrefLang="([^"]*)" aria-selected="(true|false)" href="([^"]*)">([^<]+)<\/a>/g)];
      assert.deepEqual(opts.map((o) => o[1]), ["en", ...VARIANTS], `${p}: switcher dilleri`);
      for (const o of opts) assert.ok(exists(o[4]), `${p}: switcher hedefi 404: ${o[4]}`);
      assert.deepEqual(opts.filter((o) => o[3] === "true").map((o) => o[1]), [v], `${p}: seçili dil`);

      // --- RTL mirror: breadcrumb (D5: PageHeader) — ayraç metin oku değil SVG; yönü CSS aynalar ([dir=rtl] .sep scaleX(-1)) ---
      if (p.endsWith("sourcing")) {
        const crumb = vis.match(/<nav aria-label="[^"]*"><ol class="pageheader_crumbs[\s\S]*?<\/nav>/)?.[0];
        assert.ok(crumb, `${p}: breadcrumb (PageHeader) yok`);
        assert.ok(!/[←→]/.test(crumb), `${p}: breadcrumb'ta sabit yönlü ok karakteri olmamalı (RTL'de ters kalır)`);
        assert.ok(/<svg[^>]*aria-hidden="true"/.test(crumb), `${p}: ayraç ikon (aria-hidden) olmalı`);
      }
      if (DIR[v] === "rtl") assert.ok(vis.includes('<bdi dir="ltr">'), `${p}: RTL'de sayılar <bdi dir="ltr"> ile sarılı olmalı`);
      else assert.ok(!vis.includes("<bdi"), `${p}: LTR'de gereksiz bdi`);
    }

    // --- bölgeye özgü ton/dil (I18N_RULES §2 + §7) ---
    const home = visible(html(`en/${v}`));
    const h1 = home.match(/<h1[^>]*>([\s\S]*?)<\/h1>/)[1];
    const contact = home.match(/<section id="contact"[\s\S]*?<\/section>/)[0];
    if (v === "ru") assert.ok(/[А-Яа-я]/.test(h1));
    if (v === "ar") assert.ok(/[؀-ۿ]/.test(h1));
    if (v === "fr") assert.ok(/\bvous\b|\bvos\b|Contactez|Envoyez/i.test(contact) && !/\b(tu|toi|ton|ta)\b/i.test(contact), "fr: vous, tu yok");
    if (v === "es") assert.ok(/Contáctenos|Envíen|reciban/.test(contact) && !/vosotros|enviad|contactad/i.test(contact), "es: ustedes, vosotros yok");
    if (v === "nl") assert.ok(/e-mail/i.test(contact), "nl: doğrudan e-posta");
  });
}

test("RTL mirror: lib/ui kaynağında FİZİKSEL yön özelliği yok (yalnız mantıksal CSS)", () => {
  // D5: varyantlar ortak komponentleri kullanır → kapsam tüm lib/ui *.module.css + kabuk dosyaları + globals.css
  const ui = path.join(ROOT, "lib", "ui");
  const files = [
    ...fs.readdirSync(ui).filter((f) => f.endsWith(".module.css")),
    "VariantShell.tsx", "ChannelCta.tsx", "LangSwitcher.tsx", "VariantPageBody.tsx", "md.tsx", "Navbar.tsx", "PageHeader.tsx",
  ].map((f) => path.join(ui, f)).concat(path.join(ROOT, "app", "globals.css"));
  const physical = [
    /\b(margin|padding|border)-(left|right)\b/,
    /(^|[\s;{"'])(left|right)\s*:/m,
    /text-align\s*:\s*(left|right)\b/,
    /\bfloat\s*:/,
    /\b(ml|mr|pl|pr)-\d/, // utility sınıfı
    /\btext-(left|right)\b/,
  ];
  for (const f of files) {
    const src = fs.readFileSync(f, "utf8").replace(/\/\*[\s\S]*?\*\//g, "").replace(/\/\/.*$/gm, "");
    for (const re of physical) assert.ok(!re.test(src), `${path.basename(f)}: fiziksel yön özelliği ${re}`);
  }
  const css = fs.readFileSync(path.join(ROOT, "lib", "ui", "variant.module.css"), "utf8");
  assert.ok(/inset-inline-start|padding-inline|margin-inline|border-inline|inline-size/.test(css), "mantıksal özellikler kullanılmalı");
  // yön taşıyan ikonlar RTL'de aynalanır
  for (const [f, sel] of [["pageheader.module.css", ".sep"], ["button.module.css", ".arrow"], ["card.module.css", ".arrow"]]) {
    const src = fs.readFileSync(path.join(ROOT, "lib", "ui", f), "utf8");
    assert.ok(new RegExp(`\\[dir="rtl"\\] \\${sel}[^{]*\\{[^}]*scaleX\\(-1\\)`).test(src), `${f}: [dir=rtl] ${sel} aynalanmalı`);
  }
});

test("hex=0: app/(en*) ve lib/ui kaynağında renk literal'i yok (tokens.ts tek kaynak)", () => {
  const roots = [path.join(ROOT, "app"), path.join(ROOT, "lib", "ui")];
  const files = [];
  const walk = (d) => {
    for (const e of fs.readdirSync(d, { withFileTypes: true })) {
      const f = path.join(d, e.name);
      if (e.isDirectory()) {
        // app altında yalnız (en) ve (en-xx) grupları
        if (path.dirname(f) === path.join(ROOT, "app") && !/^\(en(-[a-z]{2})?\)$/.test(e.name)) continue;
        walk(f);
      } else if (/\.(tsx?|css|mjs)$/.test(e.name) && !/[\\/]lib[\\/]ui[\\/](tokens|theme)\.ts$/.test(f) && !/\.test\.mjs$/.test(e.name)) files.push(f); // tokens.ts + theme.ts = token kaynağı
    }
  };
  for (const r of roots) walk(r);
  assert.ok(files.length > 20, `taranan dosya sayısı beklenenden az: ${files.length}`);
  const bad = [];
  for (const f of files) {
    const src = fs.readFileSync(f, "utf8");
    for (const m of src.matchAll(/#[0-9a-fA-F]{3,8}\b|\b(rgba?|hsla?)\s*\(/g)) bad.push(`${path.relative(ROOT, f)}: ${m[0]}`);
  }
  assert.deepEqual(bad, [], `renk literal'i bulundu (token'a çevir)`);
});
