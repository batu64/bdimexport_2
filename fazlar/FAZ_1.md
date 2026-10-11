# FAZ 1 — TR Ana Site + Büyüme Hunisi (/ithalat + /ihracat + Partner Başvuru)
**Sürüm:** 1.0 | **Tarih:** 08.10.2026 | **Üst doküman:** ROADMAP.md Faz 1 (özet) — bu dosya yetkili adım detayı
**Hedef:** Türk KOBİ'lere iki dönüşüm kanalı açmak: (1) Çin'den ithalat danışmanlığı talebi, (2) "Ücretsiz İhracat Hızlandırma" başvuru hunisi — platformun büyüme motoru (Proje.md §2.2 flywheel 1. adımı).
**Süre tahmini:** 4–5 gün | **Ön koşul:** FAZ 0 çıkış kriterleri tam + insan "devam et" onayı ✅
**Faz çıkış kriteri:** §13'teki 10 madde qa-agent raporuyla doğrulanmış + İnsan Onay Kapısı geçilmiş.

> **Bu fazda 3 İNSAN ONAY noktası var:** 1.2 (KVKK rıza metni — hukuki), 1.6 (başvuru formu code review — güvenlik), 1.11 (faz çıkışı). Bu üçü pazarlık konusu değildir; her koşulda insan gerektirir.

---

## 🎛️ Claude Code Yürütme Katmanı (FAZ 1)
> **v2.0:** Eski "Ajan / Model" satırları yalnızca **scope kilidi**. **Yürütücü = Claude Code**; model tablosu aşağıdadır (AGENTS.md §7). Sıralı çalış.

| Adım | İş | Model | Not |
| :-- | :-- | :-- | :-- |
| 1.1 | KVKK rıza metni iskeleti | **Opus 5.5** ⚖️ | 👤 metin + hukuki onay |
| 1.2 | /ithalat hizmet (4) | **Haiku 5.5** | şablon içerik |
| 1.3 | /ihracat hizmet (3) | **Haiku 5.5** | şablon içerik |
| 1.4 | Çin ithalat rehber serisi (6, ≥1200) | **Sonnet 5.5** | uzun SEO (ucuz alt: Haiku 5.5) |
| 1.5 | TR frontend + sayfa bağlamları | **Sonnet 5.5** | |
| 1.6 | Başvuru formu + endpoint | **Opus 5.5** 🔒 | 👤 code review |
| 1.7 | Partner listeleme komponenti | **Haiku 5.5** | |
| 1.8 | Turnstile + rate-limit | **Sonnet 5.5** | |
| 1.9 | hreflang/sitemap enjeksiyonu | **Haiku 5.5** | ortak dosya tekeli |
| 1.10 | QA turu | **Haiku 5.5** | |
| 1.11 | çıkış + lansman ön kontrol | **Haiku 5.5** | 👤 onay + deploy |

**Sıralı yürütme:** 1.1 → 1.2 → 1.3 → 1.4 → 1.5 → 1.6 → 1.7 → 1.8 → 1.9 → 1.10 → 1.11 · *(1.6, 1.1 KVKK onayı gelmeden başlamaz)*
**Senin görevlerin (👤):** 1.1 KVKK metni doldur+onayla · 1.6 form güvenlik review · 1.11 faz çıkış onayı + deploy kararı.

---

## Step 1.1 — KVKK Rıza Metni Hazırlığı (insan girdisi toplanır) ⚖️ HUKUKİ
| Alan | Değer |
| :--- | :--- |
| Ajan / Model | **AI KATILIMI SINIRLI** — rıza metni agent'ın icadı OLAMAZ (agents/tr-export-agent.md §6.1). Agent yalnızca şablon iskeleti çıkarır; metin insan onaylıdır |
| Model | GLM 5.3 **[TAVSİYE]** (yalnızca iskelet + madde başlıkları; metin gövdesi insan/insanın hukuk danışmanına ait) |
| Amaç | Proje.md §2.2 zorunlu rızası: firma verisi işleme + **logo kullanım açık rızası** (`partners.consent_logo_en` temeli) |
| Çıktı | `content/tr/legal/kvkk-riza-v1.md` — şablon: veri sorumlusu, işlenen veriler, amaçlar, 3. taraf aktarımı (EN/DE sayfalarda yayın dahil), saklama süresi, haklar + logo rızası ayrı checkbox metni |
| Kabul | — (insan onayı = kabul kriteri). qa-agent yalnızca form'da bu dosyanın v1 referanslandığını denetler |
| Çakışma / Öncelik | **1.6'nın sert ön koşulu.** Bu onay gelmeden 1.6 dispatch edilmez; 1.2–1.5 arası paralel çalışma bu beklemeden etkilenmez |
| İnsan görevi | Şablonu doldur/onaylat → v1'i kilitle. Sonraki değişiklik v2'dir ve eski onaylı başvurular v1'e bağlı kalır |

## Step 1.2 — /ithalat Hizmet Sayfaları (4 sayfa)
| Alan | Değer |
| :--- | :--- |
| Ajan / Model | tr-import-agent · **[TAVSİYE]** GLM 5.3 (score 2–3: bilinen şablon + CONTENT_STYLE §1 ses kuralları) · Yedek: Gemini Flash (score ≤2'ye düşerse) |
| Amaç | Proje.md segment TR-İthalat: tedarik, fabrika denetimi, lojistik, gümrük hizmet sayfaları |
| Çıktı | `content/tr/ithalat/{tedarik,fabrika-denetimi,lojistik,gumruk}.md` + `app/(tr)/ithalat/*/page.tsx` (fe-agent şablon bağlamı ayrı step 1.5'te) |
| Zorunlu içerik | CONTENT_STYLE §1 kanıt zinciri (iddia→veri→sosyal kanıt→CTA); her hizmetin süreç adımları; **CTA: /ithalat/danismanlik-talebi'ne**; GTİP/vergi bilgisi YALNIZCA görev dosyasındaki resmi kaynaktan (Ticaret Bakanlığı/tr-import-agent §6.1) |
| Kabul | SEO_PLAYBOOK §7 eşikleri (≥800 kelime hizmet sayfası, meta 120–158, FAQPage schema); I18N_RULES §3 sözlük terimleri; kaynak linkli rakam kontrolü |
| Batch kuralı | 4 sayfa TEK batch'te (2 çağrı üst limiti: içerik + kontroller) |
| Çakışma | tr-export-agent ile dizin kesişmiyor (`ithalat/**` vs `ihracat/**`) → 1.3 ile paralel ✅ |

## Step 1.3 — /ihracat Hizmet + Danışmanlık Sayfaları
| Alan | Değer |
| :--- | :--- |
| Ajan / Model | tr-export-agent · **[TAVSİYE]** GLM 5.3 · Yedek: Gemini Flash |
| Amaç | Proje.md segment TR-İhracat: e-ihracat, B2B pazarlama danışmanlığı + huni girişini hazırlayan program tanıtım sayfası |
| Çıktı | `content/tr/ihracat/{e-ihracat,b2b-pazarlama,program-tanitim}.md` + page.tsx bağlamları |
| Zorunlu içerik | Program tanıtım sayfası = başvuru formunun vitrini: kimin için olduğu (KOSGEB/ihracata yeni başlayan üretici), süreç 4 adımı, **sosyal kanıt bloğu hazır olsa da "onaylı partner bekleniyor" durumuyla** (Faz 2'de doldurulur), CTA → başvuru formu |
| Kabul | CONTENT_STYLE §2–§5; SEO eşikleri; CTA metni §5 standardı ("Ücretsiz İhracat Hızlandırma Başvurusu — 48 saatte ön değerlendirme") |
| Çakışma | 1.2 ile paralel ✅ · 1.6 ile scope kesişir (ihracat dizini) → 1.6'dan ÖNCE bitmeli (kilit sırası) |

## Step 1.4 — Çin'den İthalat Rehber Serisi (SEO hacim başlangıcı)
| Alan | Değer |
| :--- | :--- |
| Ajan / Model | tr-import-agent · **[TAVSİYE]** GLM 5.3 (batch) · Üretim yedeği: Gemini Flash |
| Amaç | Proje.md §10 "1 ayda 200+ sayfa" hedefinin ilk ciddi dilimi: 6 rehber sayfa |
| Rehber listesi (görev dosyasından) | Çin'den tekstil, elektronik, makine parçası, ev&yaşam, ambalaj, mobilya ithalatı — her biri: tedarik → numune → üretim → denetim → sevkiyat → gümrük |
| Çıktı | `content/tr/ithalat/rehberler/*.md` — her rehber ≥ 1200 kelime + FAQPage + BreadcrumbList |
| Kabul | SEO_PLAYBOOK §7 (1200+, keyword H1+ilk 100 kelime+1 H2, yoğunluk <%3); kaynaksız gümrük rakamı = hard-red; iç link ≥ 2 (hizmet sayfalarına) |
| Batch kuralı | 3 rehber/çağrı × 2 çağrı (batch üst sınırı) |
| Öncelik | 1.2'den sonra (aynı agent seri kuyruk) · 1.6 ile paralel olabilir (farklı scope) |

## Step 1.5 — TR Frontend Bileşenleri ve Sayfa Bağlamları
| Alan | Değer |
| :--- | :--- |
| Ajan / Model | fe-agent · **Karar ağacı [ŞART]:** layout/komponent score 4–5 → Qwen 3.8; komplex etkileşim (form validation UI) score 6 → Gemini Argon 4 |
| Amaç | content/*.md dosyalarını render eden sayfalar + TR'ye özel bileşenler |
| Çıktı | `app/(tr)/**/page.tsx` (tüm 1.2–1.4 içerikleri), `app/(tr)/layout.tsx` (TR footer, WhatsApp birincil kanal), komponent bağlamları (design/components brief'lerine göre), generateMetadata + JSON-LD (SEO_PLAYBOOK §4) |
| Zorunlu kurallar | Design tokens dışı renk/spacing YOK (hardcoded hex = red); next-intl dictionary (gömülü literal = red); ISR/statik varsayılan; LCP < 2s; hreflang VERİSİ manifest'e → orchestrator enjekte eder |
| Kabul | qa-agent: lighthouse ≥ 90 (tr ana sayfa), 360px mobil test, schema geçerli, meta eşikleri |
| Çakışma | 1.2–1.4 bitmeden kilitlenemez (aynı dizinlere yazacak); 0.6 komponent brief'leri ön koşul |

## Step 1.6 — Başvuru Formu (Ücretsiz İhracat Hızlandırma) 🔒 GÜVENLİK-KRİTİK — FAZIN KALBİ
| Alan | Değer |
| :--- | :--- |
| Ajan / Model | tr-export-agent (form UX şartnamesi) + **api-agent · [ŞART] Claude Sonnet 5.5 + İNSAN REVIEW** (form+KVKK+upload = score 9–10; ORCHESTRATOR.md §9; ROADMAP Faz 1 tablosuyla birebir) |
| Amaç | Proje.md §2.2 flywheel'in 1. adımı: başvuru toplama |
| Form alanları (Proje.md §2.2 BİREBİR — eksik alan = hard-red) | Firma Adı · Vergi No · Ürün Kataloğu (PDF upload → R2, 25MB, mime kontrol) · Kapasite · Sertifikalar (CE, ISO) · İhracat Geçmişi · **KVKK açık rıza checkbox (1.2 metni v1)** + logo yayın rızası ayrı checkbox |
| Backend | `POST /api/v1/partners/apply`: Turnstile doğrulama · zod validasyon · rıza alanı **sunucu tarafı zorunlu** (client bypass koruması) · `partners` tablosuna `approved=false` + `consent_logo_en` kaydı · R2 key: `media/tr/katalog/{partner-id}/` |
| Çıktı | `app/(tr)/ihracat/ucretsiz-destek-basvuru/page.tsx` + form bileşeni + `workers/api` endpoint + e2e test dosyası |
| Kabul | Playwright e2e: doldur→submit→partners kaydı→admin görünürlük; rızasız submit 400; 26MB dosya 413; Turnstile'sız bot isteği 403; **insan code review kaydı merge izinde** |
| Çakışma / Öncelik | 1.2 (KVKK metni) SERT ön koşul · api-agent ile fe-agent'in scope'u kesişir → **sıra: fe-agent form UI → api-agent endpoint → qa e2e** (paralel YASAK, aynı dosyaya yazarlar) |
| Not | Bu stepte tr-export-agent YALNIZCA UX şartnamesi + rıza bağlarını üretir; kodu yazmaz (agents/tr-export-agent.md §3 kuralı) |

## Step 1.7 — Partner Listeleme Bileşeni (hazır-bekleyen)
| Alan | Değer |
| :--- | :--- |
| Ajan / Model | fe-agent · **[TAVSİYE]** Qwen 3.8 (score 3) |
| Amaç | `partners` tablosundan `approved=true` olanları render eden bileşen — Faz 2'de /en/suppliers, /de/lieferanten aynı bileşeni kullanacak (3 kez yazma yasağı) |
| Çıktı | `app/**/components/partner-grid/**` + D1 okuma sorgusu lib katmanı (api-agent sağlar) |
| Kabul | approved=false gizli; consent_logo_en=false partnerin logosu gösterilmez (yazı + sektör gösterilir — logo rızası ayrı); boş durum metni ("İlk onaylı partnerler yakında"); görsel test |
| Çakışma | lib/db katmanı api-agent'a ait (0.8 şema) — fe-agent yalnızca komponent; sorgu endpoint'i 1.6'daki API katmanından |

## Step 1.8 — Turnstile + Anti-spam Entegrasyonu
| Alan | Değer |
| :--- | :--- |
| Ajan / Model | api-agent · **[TAVSİYE]** Gemini Argon 4 (score 5–6; salt entegrasyon, auth değil) |
| Amaç | Proje.md §8: Turnstile bot koruması tüm TR formlarında |
| Çıktı | Turnstile site key env; client widget bağları; server doğrulama middleware (`/api/v1/*` public endpoint'lerinde); rate limit (KV, IP+endpoint) |
| Kabul | Turnstile'sız istek 403; token 1 kez kullanılır (replay testi); rate limit üstü 429; secret'lar env'de (gitleaks temiz) |
| Öncelik | 1.6 endpoint'inden sonra; qa e2e (1.10) öncesi tamamlanmış olmalı |

## Step 1.9 — hreflang/Sitemap Enjeksiyonu (orchestrator tekel işi)
| Alan | Değer |
| :--- | :--- |
| Ajan / Model | orchestrator · **[ŞART]** GLM 5.3 — ortak dosyalara yalnızca orchestrator yazar (ORCHESTRATOR.md §11 Kural 4; FAZ_0 §0.9 helper'ları kullanır) |
| Amaç | Bu fazın tüm TR URL'leri sitemap-tr.xml + hreflang setlerine girsin |
| Çıktı | Sitemap-tr güncel; her TR sayfasında hreflang set (şimdilik yalnızca tr + x-default — en/de/zh karşılıklar FAZ 2/5'te gelir, **şimdi yazılmaz**: SEO_PLAYBOOK §1.4 Kural 2 — 404'a hreflang yasak) |
| Kabul | qa-agent: karşılıklılık script'i + tüm sitemap URL'leri 200 |
| Not | Agent manifest'lerinden hreflang verisi toplama bunun içinde; fe-agent doğrudan yazmamış olmalı (scope denetimi) |

## Step 1.10 — Faz 1 QA Turu (tam envanter)
| Alan | Değer |
| :--- | :--- |
| Ajan / Model | qa-agent · **[ŞART]** GLM 5.3 |
| Kapsam | 1.2–1.9 çıktılarının TÜM kabul testleri tek raporda: build+lint · lighthouse · schema validator · meta eşikleri · kelime sayıları · Sie/du N/A · e2e form (3 senaryo: başarı/rızasız/büyük dosya) · Turnstile · gitleaks · scope denetimi (tüm agent'lar) · terminoloji diff (I18N_RULES §3, ≤3 uyuşmazlık) |
| Çıktı | `qa/FAZ-1/rapor.md` — test tablosu (ad, sonuç, kanıt) + toplam karar |
| Kural | Kanıtsız pass YASAK (qa-agent §4); fail'ler kaynak agent'a retry (ORCHESTRATION.md §6 zinciri); 4 denemede blocked → insan raporu |

## Step 1.11 — Faz Çıkışı + Lansman Ön Kontrolü 🚦 İNSAN ONAY KAPISI
| Alan | Değer |
| :--- | :--- |
| Ajan / Model | orchestrator · **[ŞART]** GLM 5.3 |
| Yöntem | 1.10 raporundaki çıkış kriterleri tek tek işaretlenir → sana özet sunulur |
| Faz çıkış kriterleri (ROADMAP.md Faz 1) | [ ] Form uçtan uca çalışıyor (e2e) [ ] KVKK rızası sunucu tarafı zorunlu + v1 onaylı [ ] /tr sayfaları 1200+/800+ kelime + schema [ ] Turnstile + rate limit aktif [ ] ilk gerçek başvuru alınabilir durumda (canlı smoke test) [ ] lighthouse ≥ 90 [ ] gitleaks temiz [ ] ledger'da tüm çağrılar + insan onay kayıtları (1.2, 1.6) [ ] sitemap/hreflang güncel [ ] scope ihlali 0 |
| İnsan kararı | **"devam et" → Faz 2 backlog'u kuyruğa yazılır.** Ek karar: site yayına açılır mı (Cloudflare Pages deploy) yoksa Faz 2 ile mi açılır — senin kararın (öneri: deploy şimdi, düşük trafikle gerçek form verisi toplanır) |

---

## Bu Fazın Bütçe ve Çakışma Özeti

### Model dağılımı
| Model | Step'ler | Neden |
| :--- | :--- | :--- |
| GLM 5.3 | 1.2, 1.3, 1.4, qa, orchestrator işleri | Ucuz-verimli: şablonlu içerik + denetim |
| **Claude Sonnet 5.5 [ŞART]** | 1.6 backend | Güvenlik kuralı — pazarlıksız |
| Gemini Argon 4 | 1.5 (komplex kısım), 1.8 | Backend/entegrasyon derinliği |
| Qwen 3.8 | 1.5 (komponent), 1.7 | Ucuz frontend şablon işi |
| İnsan | 1.2 metin, 1.6 review, 1.11 karar | Zorunlu 3 nokta |

### Paralelleştirme haritası
```
1.1 (insan) ──────────────────┐
1.2 ─┬─ 1.4 ──┐               │ (sert ön koşul)
1.3 ─┘        ├─ 1.5 ─ 1.6 ──┤ 1.7 ─ 1.8 ─ 1.9 ─ 1.10 ─ 1.11
              └───────────────┘
```
- **Paralel blok:** 1.2+1.3 (farklı dizinler) → sonrası 1.4
- **Seri zincir:** 1.5→1.6→1.7→1.8 (aynı dosya bölgelerine yazanlar sıralı)
- **Bağımsız:** 1.9, 1.6'dan sonra her zaman koşabilir
- **Tıkanma noktası:** 1.1 KVKK onayı gecikirse 1.6 durur ama 1.2–1.5 akmaya devam eder (kuyruk tıkanmaz kuralı)

### Tahmini token
| Kalem | Tahmin |
| :--- | :--- |
| İçerik üretimi (1.2–1.4, batch'li) | ~60–80k output |
| Kod (1.5–1.8) | ~50–70k output |
| qa + orchestrator | ~25k output |
| **Toplam** | **~135–175k output** — ücretsiz/ucuz modellerde ağırlık: Sonnet yalnızca 1.6'da |
