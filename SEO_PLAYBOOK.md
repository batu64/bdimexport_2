# SEO_PLAYBOOK.md — Tüm Agentlar İçin Bağlayıcı SEO/GEO Kuralları
**Sürüm:** 1.0 | **Tarih:** 08.10.2026 | **Proje:** bdimexport.com
**Amaç:** Hreflang, canonical, schema, meta ve GEO kurallarının tek kaynağı. Proje.md §3.1 + §7 ve mimari.md §9 ile birebir uyumlu. Bu dosyaya uymayan içerik qa-agent'ta otomatik red edilir.

> **Çelişki hiyerarşisi:** ORCHESTRATOR.md §11 > bu dosya (SEO konularında) > agent dosyaları.
> **Uyarlama yetkisi:** Sadece orchestrator bu dosyayı güncelleyebilir (agent öneri PR'ı açabilir).

---

## 1. Hreflang Matrisi (Proje.md §3.1 — birebir)

**x-default: tr** (kök site Türkçe). Her sayfa, tüm dil ailesinin karşılığıyla tam set taşır.

### 1.1. Kök / TR ailesi

```html
<link rel="alternate" hreflang="tr" href="https://bdimexport.com/..." />
<link rel="alternate" hreflang="x-default" href="https://bdimexport.com/..." />  <!-- = tr -->
<link rel="alternate" hreflang="en" href="https://bdimexport.com/en/..." />
<link rel="alternate" hreflang="de" href="https://bdimexport.com/de/..." />
<link rel="alternate" hreflang="zh-CN" href="https://bdimexport.com/zh/..." />
```

### 1.2. EN global + varyant ailesi

```html
hreflang="en"      → /en/...
hreflang="en-RU"   → /en/ru/...
hreflang="en-FR"   → /en/fr/...
hreflang="en-NL"   → /en/nl/...
hreflang="en-ES"   → /en/es/...
hreflang="en-AR"   → /en/ar/...
```
EN ailesi sayfaları kendi setini taşır; TR/DE/ZH karşılığı varsa eklenir, yoksa eklenmez (eksik dil için hreflang YAZILMAZ — 404'a işaret etmek ceza sebebidir).

### 1.3. DE ailesi

```html
hreflang="de"     → /de/...        (de-DE)
hreflang="de-AT"  → /de/at/...     (varsa)
hreflang="de-CH"  → /de/ch/...     (varsa)
+ x-default: de (DE ailesi içinde)
```

### 1.4. ZH

```html
hreflang="zh-CN" → /zh/...   (basitçeştirilmiş; HK/TW versiyonu yoksa başka zh kodu YAZILMAZ)
```

**Kurallar (qa-agent otomatik test):**
1. Karşılıklılık: A sayfası B'ye hreflang veriyorsa B de A'ya verir (çift yönlü doğrulama)
2. Her hreflang URL'si 200 döner (hreflang → 404 = red)
3. hreflang değeri `content/{tr,zh,en/{ru,fr,nl,es,ar},de}` dizin yapısıyla birebir eşleşir
4. Varyantlar `/en-ru` DEĞİL `/en/ru/` alt klasörü (mimari.md kritik karar) — canonical bunu teyit eder
5. hreflang dosyalarına **yalnızca orchestrator yazar**; agent'lar veriyi manifest'te bildirir

---

## 2. Canonical

| Sayfa | Canonical |
| :--- | :--- |
| /en/ru/turkish-hazelnut... | **kendi URL'si** (translate-meta değil; hedefli yerelleştirme) |
| Sıralı/liste sayfası | kendisi; filtreli query'li URL'ler (`,sorting=price`) → temiz URL'ye canonical |
| Paginated | her sayfa kendisi (rel=prev/next kullanma; Google desteklemiyor) |
| Draft/güncellenen haber kartı | geçici; kalıcı karşılığı çıktığında 301 |

---

## 3. Meta Kuralları (qa-agent script testi)

| Alan | Kural |
| :--- | :--- |
| `<title>` | ≤ 60 karakter; hedef keyword başa yakın; marka eki ` | Bdimexport` (EN/DE) — tr'de ` | Bdimexport İhracat Danışmanlığı` gerekirse kısalt |
| `<meta description>` | 120–158 karakter; CTA fiili içerir; keyword'ü doğal geçirir |
| `<h1>` | sayfa başına 1; şablon H1'leri §5'te |
| OG/Twitter | og:title, og:description, og:image (1200×630, R2) her sayfada |
| Dil etiketi | `<html lang="tr|zh-CN|en|de">` + /en/ar'da `dir="rtl"` (I18N_RULES.md) |

---

## 4. Schema.org — Sayfa Tipline Göre Zorunluluk

Her şablona gömülü (mimari.md §9). JSON-LD formatı, geçerli olmalı (qa-agent validator).

| Sayfa tipi | Zorunlu şemalar | Not |
| :--- | :--- | :--- |
| Product SEO/GEO (/en/products/…) | **Product + FAQPage + Organization** | Product.offer: "Request Quote"; brand: Türk partner markası |
| Industry (/en/industries/…) | **Article + BreadcrumbList + Organization** | İstatistik tablosu + `ClaimReview` (rakam iddialarında) |
| Service (/en/services/…) | **Service + FAQPage + BreadcrumbList** | areaServed: hedef bölge |
| SEO makalesi (İçerik Fabrikası) | **Article + FAQPage + BreadcrumbList** + rakam varsa **ClaimReview** | — |
| Hizmet/hunisi TR (/ihracat/ucretsiz-destek-basvuru) | **Organization + FAQPage** + form sayfasında `WebPage` | — |
| Trust (/de/vertrauen) | **Organization + Review (gerçek yorum)** | uydurma yorum = hard-red |

**JSON-LD örnek iskelet (Product):**
```json
{
  "@context": "https://schema.org",
  "@type": "Product",
  "name": "Turkish Olive Oil",
  "description": "…",
  "brand": {"@type": "Brand", "name": "<Partner markası>"},
  "manufacturer": {"@type": "Organization", "name": "Bdimexport"},
  "offers": {"@type": "Offer", "availability": "https://schema.org/InStock",
             "priceSpecification": {"@type": "PriceSpecification", "priceCurrency": "USD"}}
}
```

---

## 5. Sayfa Şablonları ve H1 Kalıpları (Proje.md §3.2)

| Şablon | H1 kalıbı | Zorunlu içerik blokları |
| :--- | :--- | :--- |
| Product SEO/GEO | `{Product} Manufacturers in Turkey \| B2B Sourcing` | Sektör istatistiği (TÜİK, kaynaklı) · 3–5 partner logosu (`consent_logo_en=true`) · üretim süreci infografiği · CTA "Get Free Quotation in 24h" · FAQ ≥ 5 |
| Industry | `{Sector} Exports from Turkey: {Year} Data & Trends` | TÜİK/TİM rakam tablosu · trend grafiği · vaka çalışması · CTA |
| Trust (DACH) | `Vertrauen durch Transparenz: {konu}` | Alman müşteri yorumu · güven rozetleri · Impressum linki |
| TR İthalat rehberi | `Çin'den {Ürün} İthalatı Rehberi {Year}` | Adım adım süreç · maliyet kalemleri · risk tablosu · CTA danışmanlık formu |
| TR İhracat hunisi | `Ücretsiz İhracat Hızlandırma Programı` | Program faydaları · başvuru formu (Proje.md §2.2 alanları) · partner sosyal kanıtı |

---

## 6. GEO (Generative Engine Optimization) Kuralları — Proje.md §7

1. **`public/llms.txt`** her build'de güncellenir (orchestrator yazar): site haritası özeti + temel Q&A + şirket bilgileri — LLM'lerin (ChatGPT/Perplexity) kaynak göstermesi için
2. Her sayfada **net Q&A bloğu** (soru H3 olarak, cevap 40–80 kelime, doğrudan cümle)
3. **İstatistik tablosu** rakam içeren her sayfada; her rakam kaynağına linkli (`<td>` içinde `title="Kaynak: TÜİK 2025"` + link)
4. **ClaimReview** schema'sı her önemli iddiaya (örn. "Türkiye fındık ihracatı X milyar $")
5. Cümleler **bağımsız anlaşılabilir** olmalı (LLM chunk'ları paragraf bazlı alır); zamir zincirinden kaçın
6. Ülkeye özel sinyaller (mimari.md §9): para birimi, telefon formatı, vaka çalışması, bölge uzmanı (isim+foto), yerel kanal CTA'sı

---

## 7. İçerik Kalite Eşikleri (qa-agent otomatik)

| Metrik | Eşik |
| :--- | :--- |
| Kelime sayısı | SEO içerik/makale ≥ 1200; hizmet sayfası ≥ 800 |
| FAQ | ≥ 5 soru, her biri `FAQPage` schema'sında da var (metin ve schema birebir aynı) |
| Keyword yerleşimi | H1 + ilk 100 kelime + ≥ 1 H2; keyword stuffing (yoğunluk > %3) = red |
| Meta | title ≤ 60, desc 120–158 |
| İç bağlantı | ≥ 2 ilgili kategori/ürün sayfasına, keyword'lü anchor |
| Kopya içerik | İki locale arasında > %70 benzerlik (translate-artıkları) = red — yerelleştirme I18N_RULES.md'ye göre |
| Kaynak | Her istatistik linkli kaynak; kaynaksız rakam = hard-red |

---

## 8. Sitemap (build'de otomatik — script, agent değil)

```
/sitemaps/sitemap-index.xml
/sitemaps/sitemap-tr.xml
/sitemaps/sitemap-zh.xml
/sitemaps/sitemap-en.xml        (global)
/sitemaps/sitemap-en-ru.xml     (her varyant ayrı)
/sitemaps/sitemap-de.xml
```
- Her XML yalnızca o dilin URL'lerini taşır; `lastmod` gerçek değişim tarihi
- Yeni sayfa PR merge → build script sitemap'i yeniler (agent müdahalesi yok)
- Baidu için /zh: sitemap-zh.xml ayrıca Baidu Webmaster Tools'a submit edilir (admin rutini)

---

## 9. Dil Bazlı Özel Durumlar

| Dil/Alan | Kural |
| :--- | :--- |
| /zh | Baidu meta verification; title ≤ 30 Çince karakter; Cloudflare HK hızlandırma; ICP vaadi yok (agents/zh-agent.md) |
| /en/ar | `dir="rtl"` + layout mirror + Arapça tarih formatı (I18N_RULES.md) |
| /de | Impressum + Datenschutz linkleri footer'da; formal Sie; de-CH'de ß yasak |
| /en/ru | Telegram CTA + RUB referansı; /en/es → neutral İspanyolca |

---

## 10. Bu Playbook'u Kim Ne İçin Okur?

| Agent | İlgili bölüm |
| :--- | :--- |
| en-expert / tr-import / tr-export / de-agent / seo-geo-agent | §3–§7 tam, §9 kendi dili |
| en-l10n-agent / zh-agent | §1–§3, §6, §7, §9 kendi dili |
| fe-agent | §3 (meta alanları), §4 (JSON-LD gömme), §8 (build bilinci) |
| qa-agent | §1.4, §3, §7 testleri (envanter kaynağı) |
| orchestrator | §1.4 Kural 5, §8 (ortak dosya tekelinde sitemap) — task prompt şablonları: `prompts/task-templates.md` |

> **Prompt disiplini:** Agent'lara görev başına elle prompt YAZILMAZ — orchestrator dispatch'te `prompts/task-templates.md` şablonunu seçip task JSON alanlarıyla doldurur (şablon metni değişmez; özel koşul task `special_instructions` alanına).
