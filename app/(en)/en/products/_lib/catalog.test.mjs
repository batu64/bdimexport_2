// FAZ_2 Step 2.2 test — node --experimental-strip-types --test "app/(en)/en/products/_lib/catalog.test.mjs"
import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { composeCatalog, loadCategories, loadPartners, partnersForCategory, PRODUCTS_ROOT } from "./catalog.ts";

function tmpRoot(files = {}) {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), "bdim-products-"));
  fs.copyFileSync(path.join(PRODUCTS_ROOT, "_categories.json"), path.join(dir, "_categories.json"));
  for (const [name, body] of Object.entries(files)) fs.writeFileSync(path.join(dir, name), body);
  return dir;
}

test("gerçek katalog: 5 kategori × 4 ürün = 20 benzersiz slug, 'category' yok", () => {
  const cats = loadCategories();
  assert.deepEqual(cats.map((c) => c.slug), ["textile", "food", "machinery", "construction", "home-living"]);
  assert.ok(cats.every((c) => c.products.length === 4));
  const slugs = cats.flatMap((c) => c.products.map((p) => p.slug));
  assert.equal(new Set(slugs).size, 20);
  assert.ok(!slugs.includes("category"));
});

test("anchor kuralı: her ürünün keyword'ü var ve H1 kalıbına ('... in Turkey') uyuyor", () => {
  for (const p of loadCategories().flatMap((c) => c.products)) {
    assert.match(p.keyword, /manufacturers in Turkey$/, p.slug);
    assert.ok(!/click here|buraya tıklayın/i.test(p.keyword));
  }
});

test("ürün sayfası yokken: hepsi coming soon, href YOK, kategori noindex", () => {
  const root = tmpRoot();
  const cats = composeCatalog(root);
  for (const c of cats) {
    assert.equal(c.liveCount, 0);
    assert.equal(c.indexable, false);
    assert.ok(c.products.every((p) => !p.live && p.href === null));
  }
});

test("2.3 bir ürün dosyası ekleyince yalnız o ürün live olur; kategori indekslenebilir olur", () => {
  const root = tmpRoot({ "olive-oil.md": "# x", "_notes.md": "# yok sayılır" });
  const food = composeCatalog(root).find((c) => c.slug === "food");
  const oil = food.products.find((p) => p.slug === "olive-oil");
  assert.equal(oil.live, true);
  assert.equal(oil.href, "/en/products/olive-oil");
  assert.equal(food.liveCount, 1);
  assert.equal(food.indexable, true);
  assert.equal(composeCatalog(root).find((c) => c.slug === "textile").indexable, false);
});

test("katalogda olmayan .md dosyası hiçbir kategoriyi etkilemez", () => {
  const root = tmpRoot({ "baska-urun.md": "# x" });
  assert.ok(composeCatalog(root).every((c) => c.liveCount === 0));
});

test("partnerler: dosya yoksa boş; onaysız hiç görünmez; rızasız logo ASLA taşınmaz", () => {
  assert.deepEqual(loadPartners(tmpRoot()), []);
  const raw = [
    { id: "p1", name: "A Ltd", sector: "food", approved: 1, consent_logo_en: 1, logo_url: "https://cdn.example/a.webp" },
    { id: "p2", name: "B Ltd", sector: "food", approved: 1, consent_logo_en: 0, logo_url: "https://cdn.example/b.webp" },
    { id: "p3", name: "C Ltd", sector: "food", approved: 0, consent_logo_en: 1, logo_url: "https://cdn.example/c.webp" },
    { id: "p4", name: "D Ltd", sector: "Textile & Apparel", approved: true, consent_logo_en: true, logo_url: "https://cdn.example/d.webp" },
    { id: "p5", name: "E Ltd", sector: null, approved: 1, consent_logo_en: 1, logo_url: "https://cdn.example/e.webp" },
  ];
  const food = partnersForCategory(raw, { slug: "food", name: "Food & Agriculture" });
  assert.deepEqual(food.map((p) => p.id), ["p1", "p2"]);
  assert.equal(food[0].logoUrl, "https://cdn.example/a.webp");
  assert.equal(food[1].logoUrl, null); // rıza yok → logo yok, ad var
  assert.ok(!JSON.stringify(food).includes("b.webp"));
  const textile = partnersForCategory(raw, { slug: "textile", name: "Textile & Apparel" });
  assert.deepEqual(textile.map((p) => p.id), ["p4"]); // ad ile eşleşme
});

test("bozuk katalog reddedilir: 'category' slug'ı ve yinelenen slug", () => {
  const bad = (mut) => {
    const root = tmpRoot();
    const j = JSON.parse(fs.readFileSync(path.join(root, "_categories.json"), "utf-8"));
    mut(j);
    fs.writeFileSync(path.join(root, "_categories.json"), JSON.stringify(j));
    return root;
  };
  assert.throws(() => loadCategories(bad((j) => (j.categories[0].products[0].slug = "category"))), /category/);
  assert.throws(() => loadCategories(bad((j) => (j.categories[1].products[0].slug = j.categories[0].products[1].slug))), /yinelenen/);
});
