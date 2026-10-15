// /en/products katalog mantığı — FAZ_2 Step 2.2. SAF modül (JSX yok, `@/` alias yok): `node --test` ile doğrudan test edilir.
//
// Veri modeli (mimari.md §4 hibrit yayın):
//  - KALICI SEO sayfaları (ürün) = git → build. Bir ürün "live" ⇔ content/en/global/products/{slug}.md MEVCUT (Step 2.3 üretir).
//    Dosya yoksa "coming soon": link VERİLMEZ (404'a link yasağı). 2.3 dosyaları ekledikçe liste kendiliğinden güncellenir.
//  - GEÇİCİ öğe (partner listesi) = D1. Site static export olduğundan build-time D1 erişimi yok ve GET /api/v1/partners anahtar ister;
//    bu yüzden D1'den alınmış bir DIŞA AKTARIM okunur: _partners.json (YOKSA boş liste). Agent partner UYDURMAZ.
import fs from "node:fs";
import path from "node:path";

export interface Product {
  slug: string;
  name: string;
  /** H1 kalıbından gelen anahtar ifade ("{Product} manufacturers in Turkey"); kategori→ürün bağlantı metni BUDUR (CONTENT_STYLE §5). */
  keyword: string;
  blurb: string;
}
export interface Category {
  slug: string;
  name: string;
  industry: string;
  intro: string;
  products: Product[];
}
export interface ProductView extends Product {
  live: boolean;
  /** live değilse null → link üretilmez */
  href: string | null;
}
export interface CategoryView extends Omit<Category, "products"> {
  products: ProductView[];
  liveCount: number;
  /** İçerik inceliği koruması: yayımlanmış ürünü olmayan kategori noindex (ilk ürün yayımlanınca otomatik indekslenir). */
  indexable: boolean;
}

export const PRODUCTS_ROOT = path.join(process.cwd(), "content", "en", "global", "products");

export function loadCategories(root: string = PRODUCTS_ROOT): Category[] {
  const raw = JSON.parse(fs.readFileSync(path.join(root, "_categories.json"), "utf-8")) as { categories: Category[] };
  const seen = new Set<string>();
  for (const c of raw.categories) {
    if (!c.slug || !c.name || !Array.isArray(c.products)) throw new Error(`geçersiz kategori: ${JSON.stringify(c.slug)}`);
    for (const p of c.products) {
      if (p.slug === "category") throw new Error("'category' ürün slug'ı olamaz (rota çakışması)");
      if (seen.has(p.slug)) throw new Error(`yinelenen ürün slug'ı: ${p.slug}`);
      seen.add(p.slug);
    }
  }
  return raw.categories;
}

export function liveProductSlugs(root: string = PRODUCTS_ROOT): Set<string> {
  if (!fs.existsSync(root)) return new Set();
  return new Set(
    fs
      .readdirSync(root)
      .filter((f) => f.endsWith(".md") && !f.startsWith("_"))
      .map((f) => f.slice(0, -3)),
  );
}

export function composeCatalog(root: string = PRODUCTS_ROOT): CategoryView[] {
  const live = liveProductSlugs(root);
  return loadCategories(root).map((c) => {
    const products = c.products.map((p) => ({ ...p, live: live.has(p.slug), href: live.has(p.slug) ? `/en/products/${p.slug}` : null }));
    const liveCount = products.filter((p) => p.live).length;
    return { ...c, products, liveCount, indexable: liveCount > 0 };
  });
}

// ---- Partnerler (D1 dışa aktarımı) ----
/** D1 `partners` satırından beklenen alt küme (workers/api/src/read.ts şemasıyla uyumlu). */
export interface RawPartner {
  id: string;
  name: string;
  sector?: string | null;
  approved?: number | boolean;
  consent_logo_en?: number | boolean;
  logo_url?: string | null;
}
export interface PublicPartner {
  id: string;
  name: string;
  /** consent_logo_en=false ise HER ZAMAN null (KVKK; rızasız logo = hard-red) */
  logoUrl: string | null;
}

export function loadPartners(root: string = PRODUCTS_ROOT): RawPartner[] {
  const f = path.join(root, "_partners.json");
  if (!fs.existsSync(f)) return [];
  const data = JSON.parse(fs.readFileSync(f, "utf-8"));
  return Array.isArray(data) ? (data as RawPartner[]) : [];
}

const norm = (s: string) => s.trim().toLowerCase();

/** Yalnız ONAYLI partnerler; sektör kategori slug'ı veya adıyla eşleşir. Logo yalnız consent_logo_en=true ise taşınır. */
export function partnersForCategory(partners: RawPartner[], category: Pick<Category, "slug" | "name">): PublicPartner[] {
  return partners
    .filter((p) => !!p.approved && !!p.sector && [norm(category.slug), norm(category.name)].includes(norm(p.sector)))
    .map((p) => ({ id: p.id, name: p.name, logoUrl: p.consent_logo_en && p.logo_url ? p.logo_url : null }));
}
