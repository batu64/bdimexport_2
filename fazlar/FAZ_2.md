# FAZ 2 — EN Global + 20 Ürün Sayfası + Varyant İskeletleri + SEO Altyapısı
**Sürüm:** 1.0 | **Tarih:** 08.10.2026 | **Üst doküman:** ROADMAP.md Faz 2 (özet) — bu dosya yetkili adım detayı
**Hedef:** Global lead jeneratörünü açmak: /en ana yapı + 20 Product SEO/GEO sayfası + /en/{ru,fr,nl,es,ar} varyant iskeletleri + tam hreflang/sitemap/llms.txt altyapısı (Proje.md §3.1).
**Süre tahmini:** 5–6 gün | **Ön koşul:** FAZ 1 çıkış kriterleri tam + insan "devam et" ✅
**Ek ön koşul (FAZ_1'den farklı):** **Onaylı partner havuzu ≥ 3** — Proje.md §3.2 şartı: Product sayfası 3–5 partner logosu olmadan yayınlanamaz (sosyal kanıt bloğu boş geçemez). Partner < 3 ise bu faz beklemeye alınır, partner toplama kampanyası (1.6 formunun aktif kullanımı) hızlandırılır.
**Faz çıkış kriteri:** §12'deki 10 madde qa-agent raporuyla doğrulanmış + İnsan Onay Kapısı geçilmiş.

> **Bu fazın karakteri:** İçerik hacmi fazı. Kod az, üretim çok → en ucuz modellerin (Gemini Flash ücretsiz kota + GLM 5.3 kontrol) en yoğun kullanıldığı faz. Opus/Sonnet çağrısı YOK — tek istisna 2.7'de kompleks varyant layout'u.

---

## Step 2.1 — /en Route İskeleti + Hizmet Sayfaları (5)
| Alan | Değer |
| :--- | :--- |
| Ajan / Model | en-expert-agent (kod) + fe-agent · **[TAVSİYE]** Gemini Argon 4 (score 5–6: i18n entegrasyonu + 5 hizmet sayfası) · Yedek: GLM 5.3 |
| Amaç | /en global hub iskeleti + Proje.md §3.1 hizmet seti |
| Çıktı | `app/(en)/layout.tsx` (EN footer, form CTA birincil) · `/en/services/{sourcing,manufacturing,inspection,logistics,customs}/page.tsx` · `content/en/global/services/*.md` · next-intl en dictionary |
| Zorunlu içerik | Hizmet sayfalarının TR karşılıklarından (FAZ 1) çevirisi DEĞİL: global alıcı niyetiyle yeniden yazım (I18N_RULES §1 Kural 1); SLA'lı cümleler (CONTENT_STYLE §1.1 en kartı: "in 24h", "within 5 days"); Service + FAQPage + BreadcrumbList schema |
| Kabul | ≥ 800 kelime/hizmet sayfası; meta eşikleri; qa lighthouse ≥ 90; hreflang verisi manifest'e (yazma yok — 2.9'da enjeksiyon) |
| Çakışma | en-l10n-agent'ın scope'u (`content/en/{ru,...}/**`) henüz YOK — 2.5'e kadar kilit çatışması imkânsız ✅ |

## Step 2.2 — Ürün Liste ve Kategori Yapısı
| Alan | Değer |
| :--- | :--- |
| Ajan / Model | en-expert-agent · **[TAVSİYE]** Gemini Argon 4 (iç sorgu mantığı) · Yedek: GLM 5.3 |
| Amaç | /en/products/{slug} mimarisi + kategori sayfaları (2.3'teki 20 ürünün kapsayıcıları) |
| Çıktı | `/en/products/page.tsx` (ana liste, D1 contents + partners bileşimi) · kategori sayfaları (textile, food, machinery, home&living, construction — 5 kategori) · Product liste şeması (ItemList) |
| Kabul | Kategori → ürün iç linkleri §7 anchor kuralına uygun; boş kategori durumu ("coming soon") yönetilebilir; ItemList schema geçerli |
| Öncelik | 2.1'den sonra, 2.3 ile paralel değil — 2.3 ürün sayfaları bu URL yapısına bağlanır |

## Step 2.3 — 20 Ürün SEO/GEO Sayfası 🎯 FAZIN ANA HACMİ
| Alan | Değer |
| :--- | :--- |
| Ajan / Model | en-expert-agent · **[TAVSİYE]** **Gemini Flash üretim (ücretsiz kota, gece batch) + GLM 5.3 kontrol pass'i** (seo-geo-agent akışının kalıcı-sayfa uyarlaması) · Üretim yedeği: Workers AI (kota biterse) · **Sonnet/Opus YOK — kural** |
| Amaç | Proje.md §3.2 şablon 1'in 20 örneği + §10 "1 ayda 200+ sayfa" hedefinin çekirdeği |
| Ürün listesi (görev dosyasında — orchestrator önceden seçer) | her kategoriye 4 ürün (örn: olive oil, hazelnut, dried figs, textile apparel, home textiles, marble, furniture, packaging...) — seçim kriteri: TÜİK ihracat hacmi + arama hacmi (keywords tablosu) |
| Zorunlu şablon (CONTENT_STYLE §2 — blok sırası değişmez) | Hero+CTA ("Get Free Quotation in 24h") → Neden Türkiye (kaynaklı) → TÜİK/TİM istatistik tablosu (son 3 yıl) → üretim süreci 5 adım → **3–5 partner logosu (consent_logo_en=true filtresi — rızasız logo = hard-red)** → kalite/denetim → SSS ≥5 → CTA |
| H1 kalıbı [ŞART] | `{Product} Manufacturers in Turkey | B2B Sourcing` (SEO_PLAYBOOK §5 birebir) |
| Batch kuralı | **10 sayfa/çağrı × 2 üretim çağrısı + 2 kontrol çağrısı = 4 çağrı üst limit** (20 ayrı çağrı = kural ihlali, ORCHESTRATION.md §4.3) |
| Kabul | 1200+ kelime her sayfa; Product+FAQPage+Organization schema geçerli; her rakam linkli kaynak; partner isimleri D1'den (agent uyduramaz — manifest'te partner ID listesi zorunlu); keyword yerleşimi §7 |
| Çakışma / Öncelik | 2.2 URL yapısını bekler · **gece dilimine schedule edilir** (02:00–06:00, ücretsiz Gemini kotası — ORCHESTRATION.md §8) |

## Step 2.4 — Industries Sayfaları (5)
| Alan | Değer |
| :--- | :--- |
| Ajan / Model | en-expert-agent · **[TAVSİYE]** Gemini Flash + GLM 5.3 kontrol |
| Amaç | Proje.md §3.2 şablon 2: sektör veri sayfaları |
| Çıktı | `/en/industries/{textile,food,machinery,home-living,construction}/page.tsx` + content — veri tablosu (son 3 yıl hacim/büyüme/pazarlar), trend analizi, vaka çalışması (anonimleştirilmiş GERÇEK proje; uydurma = hard-red) |
| Kabul | Article + ClaimReview schema (rakam iddialarında); kaynak linkleri; ≥ 1000 kelime; ürün sayfalarına iç link (her sektörün 4 ürünü) |
| Batch | 5 sayfa tek batch |

## Step 2.5 — Varyant İskeletleri /en/{ru,fr,nl,es,ar} (RTL dahil)
| Alan | Değer |
| :--- | :--- |
| Ajan / Model | en-l10n-agent · Kod: **[TAVSİYE]** Gemini Argon 4 (layout mirror + i18n entegrasyonu = score 6) · RTL özel: Qwen 3.8 destekli qa | İçerik: Qwen 3.8 (ru/ar) + Gemini Flash (fr/nl/es) |
| Amaç | 5 varyantın kod altyapısı + ana sayfa + 1 örnek hizmet sayfası yerelleştirmesi (tam çeviri FAZ 5 değil — bu fazda iskelet + kanıt sayfaları) |
| Çıktı | `app/(en)/[variant]/layout.tsx` (bölge kanal CTA bileşeni — leads.channel_pref okur) · her varyantta index + services 1'er sayfa · **/en/ar: dir="rtl" + layout mirror** (I18N_RULES §4 tam uygulanır: mantıksal Tailwind, bdi sayılar) |
| Bölge uyarlaması [ŞART] | ru→Telegram CTA + RUB referansı · ar→WhatsApp Business · fr→formal vous · nl→doğrudan ton · es→neutral (ustedes) — I18N_RULES §2 matrisi birebir |
| Kabul | qa RTL görsel testi (ar) geçer; kanal CTA matrisi doğrulanır (ru'da Telegram yoksa red); canonical kendi URL'si; hreflang VERİSİ manifest'te |
| Çakışma | en-expert-agent scope'u (`content/en/global/**`) ile kesişmez (varyant alt dizinleri ayrı) → 2.1–2.4 ile paralel ✅ |

## Step 2.6 — Görsel Üretim Turu (image-agent ilk büyük işi)
| Alan | Değer |
| :--- | :--- |
| Ajan / Model | image-agent · **[ŞART zincir]:** FLUX taslak → ChatGPT Image final · İkonlar SVG (AI yasağı) |
| Amaç | 20 ürün + 5 industry sayfasının infografik/hero görselleri |
| Üretim listesi (kota disiplini) | 5 infografik (her kategoriye 1 — üretim süreci 5 adım şeması) + 3 hero (services/industries/products ana) + kalan 20 ürün için türev/组合 = **8 master üretim** (20/ay kotanın %40'ı) |
| Zorunlu kurallar | prompts/visual-brand.md §1 SABİT prefix her çağrıda; 1 master → script crop (OG 1200×630 + hero 1920×1080); infografik etiketsiz (etiketler HTML'de — çevirilebilirlik); rakamlar görselde YOK (veri HTML tablosunda — kaynaklı) |
| Kabul | qa OCR temiz; palet uyumu; media-manifest.json (master→türev zinciri + alt text); R2 key yapısı `media/en/products/{slug}/` |
| Çakışma | İçerik agent'larından bağımsız scope → 2.3–2.5 ile paralel ✅ · Kota aşarsa: yalnızca türev/crop |

## Step 2.7 — Komplex Varyant Layout'unu Kod Katmanı (tek istisna)
| Alan | Değer |
| :--- | :--- |
| Ajan / Model | fe-agent · **[TAVSİYE]** **Claude Sonnet 5.5 (tek Sonnet/Opus noktası — score 8: 5 varyantlı state yönetimi + RTL mirror + kanal bileşeni tek kalıpta)** · Yedek: Gemini Argon 4 (score düşerse) |
| Amaç | 2.5'te iskeletlenen varyant layout'unun kompleks kısımları: kanal CTA bileşeninin locale'e göre davranışı + RTL mirror'ın tüm komponentlere uygulanması |
| Kabul | 5 varyantta smoke test; RTL mirror tüm komponentlerde; lighthouse değişmez (≥90) |
| Çakışma | 2.5 bitince açılır (aynı dosyalar); API endpoint'i YOK (salt frontend) → api-agent devrede değil |

## Step 2.8 — hreflang/Sitemap/llms.txt Enjeksiyonu (orchestrator tekel)
| Alan | Değer |
| :--- | :--- |
| Ajan / Model | orchestrator · **[ŞART]** GLM 5.3 |
| Amaç | Bu fazın tüm EN URL'leri + varyant setleri — FAZ_0 0.9 helper'ları üzerinden |
| Çıktı | sitemap-en.xml + sitemap-en-{ru,fr,nl,es,ar}.xml · /en sayfalarında tam EN ailesi hreflang seti (en + en-RU... + tr/de/zh karşılığı VARSA — yoksa yazılmaz [SEO_PLAYBOOK §1.4 Kural 2]) · llms.txt güncelleme (20 ürün + 5 sektör + hizmetler özeti) |
| Kabul | qa: karşılıklılık script + tüm URL 200 + hreflang↔dizin eşleşmesi (§1.4 Kural 3) |
| Öncelik | 2.3–2.5 manifest'leri toplanınca; 2.10 qa turundan ÖNCE tamamlanmış olmalı |

## Step 2.9 — Faz 2 QA Turu
| Alan | Değer |
| :--- | :--- |
| Ajan / Model | qa-agent · **[ŞART]** GLM 5.3 |
| Bu fazın özel testleri (genel envanter + ek) | H1 kalıbı 20 sayfada birebir eşleşme (script) · partner ID manifest ↔ D1 consent kontrolü · **RTL DOM testi** (dir + mantıksal özellik scan) · kanal CTA matrisi · batch üretim tutarlılığı (aynı kalıp, farklı içerik — kalıp kırılması = red) · hreflang 404 testi · media-manifest zinciri |
| Çıktı | `qa/FAZ-2/rapor.md` |

## Step 2.10 — Faz Çıkışı 🚦 İNSAN ONAY KAPISI
| Alan | Değer |
| :--- | :--- |
| Ajan / Model | orchestrator · **[ŞART]** GLM 5.3 |
| Faz çıkış kriterleri (ROADMAP.md Faz 2) | [ ] 20 ürün sayfası şablon testlerinden geçti [ ] 5 hizmet + 5 industry sayfası canlı [ ] 5 varyant iskeleti + RTL temiz [ ] hreflang karşılıklılık + 404 testi temiz [ ] llms.txt güncel [ ] partner logosu consent filtresi doğrulanmış [ ] görsel kota içinde (8 master) [ ] lighthouse ≥ 90 [ ] gitleaks temiz [ ] ledger: üretim ağırlıklı ücretsiz kota kullanımı doğrulandı (Gemini gece batch) |
| İnsan kararı | **"devam et" → Faz 3 (Admin Panel + API).** Ek not: Faz 3 güvenlik ağırlıklı — Sonnet 5.5 yoğun kullanılacak, token/maliyet beklentisi içine al |

---

## Bu Fazın Bütçe ve Çakışma Özeti

### Model dağılımı
| Model | Step'ler | Not |
| :--- | :--- | :--- |
| **Gemini Flash (ücretsiz kota)** | 2.3 (20 sayfa üretim), 2.4 | En büyük hacim — gece batch |
| GLM 5.3 | 2.3/2.4 kontrol, qa, orchestrator | Hacim ücretsiz, kontrol ucuz |
| Gemini Argon 4 | 2.1, 2.2, 2.5 kod | Score 5–6 backend |
| Qwen 3.8 | 2.5 (ru/ar içerik) | Dil-native |
| Claude Sonnet 5.5 | **yalnızca 2.7** | Bu fazın tek pahalı çağrısı |
| FLUX + ChatGPT Image | 2.6 | 8 master / 20 kota |
| **Opus 5** | **YOK** | Tasarım kararı Faz 0'da kapanmıştır — bu fazda tekrar tasarım çağrısı YASAK |

### Paralelleştirme haritası
```
2.1 ── 2.2 ── 2.3 ──┐
              2.4 ──┤
2.5 ── 2.7 ────────┤── 2.8 ── 2.9 ── 2.10
2.6 (bağımsız) ────┘
```
- **Paralel bloklar:** {2.1→2.2→2.3+2.4} · {2.5→2.7} · {2.6} — üç hat bağımsız scope
- **Tıkanma riski:** Partner havuzu < 3 → 2.3 durur, 2.1/2.2/2.4/2.5/2.6 akmaya devam eder
- **Kritik yolda tek pahalı adım:** 2.7 (Sonnet) — 2.5'ten sonra

### Tahmini token
| Kalem | Tahmin |
| :--- | :--- |
| Üretim (2.3+2.4, ~25 sayfa × 1400 kelime) | ~150–180k output — **çoğunlukla ücretsiz Gemini kotası** |
| Kod (2.1, 2.2, 2.5, 2.7) | ~45–60k output |
| Görsel | 8 master (kota), FLUX taslaklar dahil |
| qa + orchestrator | ~30k output |
| **Toplam (ücretli karşılığı)** | **~90–110k** — geri kalan ücretsiz kota |
