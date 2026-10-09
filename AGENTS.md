# AGENTS.md — Agent Kadrosu ve Model Kayıt Defteri
**Proje:** bdimexport.com | **Sürüm:** 1.0 | **Tarih:** 08.10.2026
**Amaç:** Tüm agent'ların ve modellerin TEK DOĞRULUK KAYNAĞI. Orchestrator (GLM 5.3) her dağıtım öncesi bu dosyadaki kayıt defterini okur.

> **Çelişki çözümü:** Süreç kuralları çelişirse `ORCHESTRATOR.md` §11 (değişmez kurallar), **model/agent ataması çelişirse bu dosya** kazanır.
> **Model adları notu:** Aşağıdaki model kimlikleri proje planındaki hedef modellerdir. Faz 0'da her CLI/config'de gerçek model ID'si ping testiyle doğrulanır (§7 Kural 1); bulunamayan model otomatik fallback'ine düşer ve `token_ledger`'a "model_missing" notu düşer.

---

## 1. Model Kayıt Defteri

| Model | Katman | Birincil Görev | Fallback Zinciri |
| :--- | :--- | :--- | :--- |
| **GLM 5.3** | T1 · Orkestra | **Orkestratör**: görev sınıflandırma, yönlendirme, PR review, standart kodlama | Gemini Argon 4 → Gemini Flash |
| **Claude Opus 5** | T3 · Tasarım | **Tasarım lideri**: tasarım sistemi, hero copy, mimari UX kararları — *minimum token, brief-first (§4)* | Qwen 3.8 Max |
| **Qwen 3.8 Max** | T2 · Tasarım/İçerik | Tasarım ikinci göz; zh/ru/ar yüksek kalite içerik; Opus 5'in %100 token'ına ~%30'uyla kaliteli alternatif | GLM 5.3 |
| **Claude Sonnet 5.5** | T2 · Kod | **Kompleks kodlama** (score 7–10): güvenlik-kritik, admin, auth, karmaşık debug | Gemini Argon 4 |
| **Gemini Argon 4** | T2 · Kod | **Kompleks kodlama**: backend, Workers API, D1 migration, cron mantığı | Claude Sonnet 5.5 |
| **Gemini 3.8 Flash** | T1 | Salt-okunur admin dashboard, düşük riskli UI işleri (Claude Sonnet 5.5 review'lı) | Gemini Flash |
| **Qwen 3.8** | T1 · Kod/İçerik | Orta zorluk kod (score 3–4) + zh/ru/ar içerik + çeviri | Gemini Flash |
| **Gemini Flash** | T1 | SEO/GEO metin üretimi, basit-orta kod, script yazımı | Qwen 3.8 |
| **Gemini Flash-Lite** | T0 | RSS özetleme, etiketleme, çeviri taslağı, lint/format, mekanik işler | Workers AI |
| **Workers AI** | T0 | Yedek/fallback: sınıflandırma, özet, basit dönüşüm | — |
| **ChatGPT Image (gpt-image)** | Görsel · T2 | **En kaliteli görsel**: hero, OG image, infografik final | Ideogram → FLUX |
| **Ideogram** | Görsel · T1 | Metin içeren görseller (logo, maskot, banner) | FLUX |
| **FLUX** | Görsel · T0 | Hızlı/ucuz taslak görsel, varyasyon, arka plan temizleme | — |

---

## 2. Agent Kadrosu (Kayıt)

| Agent ID | Sorumluluk + Scope (dosya kilidi) | Birincil Model | Yedek | Tanım Dosyası |
| :--- | :--- | :--- | :--- | :--- |
| `orchestrator` | Dağıtım, karar, review — **kod yazmaz** | GLM 5.3 | Gemini Flash | `ORCHESTRATOR.md` |
| `design-agent` | Tasarım sistemi, hero copy, UX brief — scope: `design/**`, layout dosyaları | Claude Opus 5 (karar) + Qwen 3.8 Max (uygulama brief'i) | — | `agents/design-agent.md` |
| `image-agent` | Tüm görsel üretim: OG, hero, infografik, ürün görseli — scope: `public/media/**` | ChatGPT Image | Ideogram → FLUX | `agents/image-agent.md` |
| `fe-agent` | Frontend kodlama (`app/(tr)(zh)(en)(de)` route groups) — model **score'a göre** §3 | §3 karar ağacı | — | `agents/fe-agent.md` |
| `api-agent` | Workers API, D1 migration, cron — score ≥7 veya güvenlik → Claude Sonnet 5.5 + insan review | §3 karar ağacı | — | `agents/api-agent.md` |
| `zh-agent` | `/zh` tüm içerik, Baidu SEO, WeChat UX — scope: `content/zh/**`, `app/(zh)/**` | Qwen 3.8 | Gemini Argon 4 | `agents/zh-agent.md` |
| `tr-import-agent` | `/ithalat` sayfaları, Çin tedarik rehberleri | GLM 5.3 | Claude Sonnet 5.5 | `agents/tr-import-agent.md` |
| `tr-export-agent` | `/ihracat`, ücretsiz destek hunisi, form UX | GLM 5.3 | Claude Sonnet 5.5 | `agents/tr-export-agent.md` |
| `en-expert-agent` | `/en` yapı, ürün/industri sayfaları — kod: Claude Sonnet 5.5, içerik: Gemini Flash | Karma (§3) | — | `agents/en-expert-agent.md` |
| `en-l10n-agent` | `/en/ru fr nl es ar` yerelleştirme, hreflang verisi | Qwen 3.8 (ru/ar) · Gemini Flash (fr/nl/es) | GLM 5.3 | `agents/en-l10n-agent.md` |
| `de-agent` | `/de` DACH, Impressum/DSGVO, formal Sie | Claude Sonnet 5.5 | Qwen 3.8 (de) | `agents/de-agent.md` |
| `admin-agent` | Admin panel (Access korumalı), Lead Kanban, İçerik Fabrikası UI, audit log | Claude Sonnet 5.5 + insan review | Gemini 3.8 Flash (salt-okunur dashboard) | `agents/admin-agent.md` |
| `seo-geo-agent` | SEO/GEO metin, schema, llms.txt — üretim: Gemini Flash, kontrol: GLM 5.3 | Gemini Flash | — | `agents/seo-geo-agent.md` |
| `rss-trends-agent` | RSS ingestion, 3-gün TTL, Trends RSS çekimi | Gemini Flash-Lite | Workers AI | `agents/rss-trends-agent.md` |
| `qa-agent` | Build/lint/link testi, OCR ile görsel yazı kontrolü, kabul testleri | GLM 5.3 | Gemini Flash | `agents/qa-agent.md` |

---

## 3. Kodlama Modeli Karar Ağacı (Gemini / Claude / Qwen Üçlüsü)

Orchestrator her kod görevini `ORCHESTRATOR.md` §4.1'deki score ile puanlar, sonra:

```
IF score <= 2  (şablon uygulama, basit sayfa, copy-paste varyant)
    → Gemini Flash            # en ucuz, en az token
IF score in [3..4]  (standart komponent, form, liste sayfası)
    → Qwen 3.8                # ucuz + kaliteli
IF score in [5..6]  (backend mantık, API endpoint, D1 sorgusu, i18n entegrasyonu)
    → Gemini Argon 4          # teknik derinlik
IF score in [7..8]  (karmaşık state, performans, migration, debug)
    → Claude Sonnet 5.5
IF score in [9..10] VEYA güvenlik/ödeme/auth/admin
    → Claude Sonnet 5.5 + ZORUNLU insan review (Opus 5 yalnızca onaylı mimari istisnada)
```

**Kısıtlar:** Tek görevde model değişimi en fazla 1 kez (retry zinciri hariç). Kodlama üçlüsünden hiçbiri tek başına **auth, admin, ödeme, KVKK/GDPR** kodu yazamaz — bu dosyalar her koşulda Claude + insan ikilisine bağlıdır (ORCHESTRATOR.md §9).

---

## 4. Tasarım Modeli Kuralı — Minimum Token (Brief-First)

Tasarım en pahalı token tüketen iştir; kural: **bir kez karar verilir, sonsuza kadar kopyalanır.**

1. `design-agent` önce `design/design-tokens.md` üretir: renk paleti, tipografi, spacing, komponent envanteri (buton/kart/form/navbar varyantları). Bu metin dokümanını **Qwen 3.8 Max** taslaklar, **Claude Opus 5** yalnızca nihai UX kararını + hero copy'yi verir.
2. Opus 5 sprint (1 hafta) başına **max 3 çağrı** — her çağrı log gerekçesi ister (ORCHESTRATOR.md §4.3 Kural 6).
3. Komponent kodlaması tasarım token'larına dayanır ve **ucuz kod modeline** (§3 ağacı) devredilir. Her yeni sayfa için tekrar tasarım-modeli çağrısı **yasaktır** — token'ın %90'ı burada israf olur.
4. Tasarım çıktısı kabul şekli: tokens diff + ekran görüntüsü/komponent listesi. "Tasarladım" düz metni red edilir.
5. DACH (/de) ve /zh için renk/UX varyasyon kararı tek Opus çağrısında toplu verilir (zh: kırmızı/altın palet — Proje.md).

---

## 5. Görsel Üretim Pipeline (image-agent)

**Maliyet merdiveni — her görsel en alt basamaktan başlar:**

1. **SVG/ikon seti** → ücretsiz, her çözünürlükte keskin; ikonlar/şemalar için AI görsel üretimi yasak
2. **Mevcut master'ın türevi** → crop/renk varyasyonu (script ile, agent çağrısı yok)
3. **FLUX taslak** → kompozisyon onayı için ucuz önizleme
4. **ChatGPT Image final** → yalnızca hero, OG image, ana infografikler

**Zorunlu kurallar:**
- **Marka tutarlılığı:** `prompts/visual-brand.md` (palet, kompozisyon, ışık, stil) her image prompt'una sabit prefix olarak girilir — hem tutarlılık hem prompt-cache tasarrufu
- **Tek master → çok türev:** her konsept için 1 master üret, boyut türevlerini script ile crop'la (OG 1200×630, hero 1920×1080, infografik 1080×1350, ürün 800×800) — her boyut için yeniden üretim yasak
- **Görsel içi metin minimal:** görsel üzerine yazı gerekiyorsa Ideogram; üretilen görselde yazım hatası = otomatik red (qa-agent OCR kontrolü)
- **SEO:** her görsel anlamlı dosya adı (`turkish-olive-oil-export.webp`) + keyword'lü alt text; WebP/AVIF dönüşümü script ile (agent değil)
- **Veri doğruluğu:** infografiklerdeki ihracat rakamları TÜİK/tim.org.tr kaynaklı olmalı; agent veri uyduramaz — kaynak yoksa rakamsız şema
- **Bütçe:** haftalık görsel üretim kotası orchestrator tarafından izlenir; kota dolunca yalnızca türev/crop
- **Upload:** R2'ye `media/{locale}/{kategori}/{slug}/` yapısıyla; key adı contents.slug ile eşleşir

---

## 6. Faz Bazlı Model Atama Matrisi (mimari.md §10 ile eşleşir)

| Faz | İş | Model(ler) | Not |
| :--- | :--- | :--- | :--- |
| 0 | Orkestrasyon dosyaları + agent tanımları | GLM 5.3 (+ Qwen 3.8 Max taslak) | Tek seferlik, en yüksek token'lık görev |
| 0 | Model ping testi + config doğrulama | GLM 5.3 | §7 Kural 1 |
| 1 | TR site + tasarım sistemi | design: Opus 5 (1 çağrı) + Qwen 3.8 Max; kod: §3 ağacı | |
| 1 | Partner formu + KVKK akışı | Claude Sonnet 5.5 (güvenlik) | İnsan review şart |
| 2 | EN iskelet + hreflang/sitemap | Kod: Gemini Argon 4; içerik: Gemini Flash | hreflang enjeksiyonu script (agent değil) |
| 3 | Admin + D1 + API | Claude Sonnet 5.5 + Gemini Argon 4 | Auth/admin = insan review şart |
| 4 | RSS + İçerik Fabrikası | Gemini Flash-Lite/Flash + GLM 5.3 kontrol | Tam otomatik, en ucuz faz |
| 5 | ZH + DE | zh: Qwen 3.8 · de: Claude Sonnet 5.5 · görseller: image-agent | |
| 6 | Analitik + raporlar | Gemini Flash (çekim) + GLM 5.3 (yorum) | Haftalık insan raporu |
| 7 | Public API + .cn planı | Gemini Argon 4 + insan onayı | |

---

## 7. Değişmez Kurallar (Bu Dosyaya Özel)

1. **Model doğrulama:** Faz 0'da kayıt defterindeki her model CLI'da ping'lenir; olmayan model fallback'e düşer, kayıt güncellenir — hiçbir görev "model bulunamadı" ile kuyrukta tıkanmaz.
2. **Kayıt defteri dışı model çağrısı yasaktır** — orchestrator `token_ledger`'a yazılmayan çağrıyı red eder.
3. **Token minimum üçlüsü:** context minimalizasyonu + batch çağrı + prompt-cache prefix sabitliği (ayrıntı ORCHESTRATOR.md §4.3) — tüm agentlar için bağlayıcı.
4. **Güvenlik kodu istisnası değiştirilemez:** auth/admin/ödeme/KVKK kodu §3 ağacının en üst basamağına + insan review'a kilitlidir; model değişikliği bu satırı etkilemez.
5. **Görsel üretimi ücretli API'dir** (token ledger'a token değil, görsel adedi + tahmini $ yazılır); kotayı orchestrator izler.
6. **Agent skill dosyası şablonu** (`agents/<id>.md`): `scope:` (yazılabilir dizinler) · `models:` (birincil/yedek) · `budget:` (görev başına token üst sınırı) · `acceptance:` (kabul testleri) · `examples:` (1 iyi çıktı örneği). Scope beyanı olmayan agent orchestrator tarafından dispatch edilmez.
7. **Çift çeviri kontrolü:** zh/ru/ar içerik Qwen 3.8 üretir → GLM 5.3 kontrol eder → yalnızca /en ve /de final yayını öncesi Claude Sonnet 5.5 kalite pass'i yapar (maliyet buradan kaçınılmaz).

---

## 8. Açık Konular (Faz 0'da kapatılacak)

- [ ] Her modelin gerçek CLI kimliği/config girişi doğrulanacak (§7 Kural 1 ping testi)
- [ ] ChatGPT Image / Ideogram / FLUX API erişimi ve kotaları teyit edilecek
- [ ] `design/design-tokens.md` marka paleti nihai kararı (insan onayı) — Opus 5 ilk çağrısının girdisi
- [ ] Görsel haftalık kota sayısı (öneri: 20 master/ay başlangıç)
