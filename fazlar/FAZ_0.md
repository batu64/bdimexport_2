# FAZ 0 — Foundation ve Orkestrasyon Kurulumu
**Sürüm:** 1.0 | **Tarih:** 08.10.2026 | **Üst doküman:** ROADMAP.md (özet) — bu dosya yetkili adım detayı
**Hedef:** Repo iskeleti, orkestrasyon altyapısı, tasarım sistemi, D1 şema ve orchestrator'ın İLK başarılı döngüsü.
**Süre tahmini:** 3–4 gün (agent disipliniyle) | **Ön koşul:** Yok (ilk faz)
**Faz çıkış kriteri:** §10'daki 8 madde qa-agent raporuyla doğrulanmış + İnsan Onay Kapısı geçilmiş.

> **Genel çakışma kuralı (tüm fazlar için geçerli):**
> 1. Model şart/tavsiye ayrımı: **[ŞART]** = AGENTS.md kuralı, değiştirilemez · **[TAVSİYE]** = score hesabına göre orchestrator değiştirebilir (gerekçe ledger'a yazılır)
> 2. Aynı anda iki step aktif olamaz eğer scope'ları kesişiyorsa (ORCHESTRATION.md §4.1 kilit matrisi)
> 3. Güvenlik-kritik step (insan review şartlı) başka step'in bağımlılığıysa, bağımlı step bekler — alternatif yol YOK
> 4. Bir step 2 kez fail olursa: ORCHESTRATION.md §6 retry zinciri; 4. denemede `blocked` + insana

---

## Step 0.1 — Repo İskeleti
| Alan | Değer |
| :--- | :--- |
| Ajan / Model | fe-agent · **[TAVSİYE]** Gemini Argon 4 (score 5–6: çok dosyalı ama bilinen kalıp) · Yedek: GLM 5.3 |
| Amaç | Next.js 15 App Router + route groups + workers + db dizinleri |
| Çıktı | `app/(tr)/ app/(zh)/ app/(en)/ app/(de)/ app/admin/` · `workers/api/ workers/cron-rss/ workers/cron-trends/` · `db/migrations/` · `content/{tr,zh,en/{ru,fr,nl,es,ar},de}/` · `lib/` · next-intl kurulumu · `package.json` + pnpm lock |
| Kabul | `pnpm build` boş iskelette geçer; 4 route group boş layout render ediyor; qa-agent: dizin yapısı mimari.md §8 ağacıyla birebir |
| Çakışma uyarısı | Bu step'in scope'u tüm `app/**` — diğer tüm fe-agent step'leri ondan SONRA açılır (kilit çakışması) |

## Step 0.2 — Model Ping Testi ⚡ HER ŞEYİN ÖN KOŞULU
| Alan | Değer |
| :--- | :--- |
| Ajan / Model | orchestrator · **[ŞART]** GLM 5.3 |
| Amaç | AGENTS.md §7 Kural 1: kayıt defterindeki HER model gerçek CLI/API üzerinden ping'lenir |
| Yöntem | Her model: 1 kısa test çağrısı (≤ 100 output token) → yanıt süresi + erişilebilirlik → `AGENTS.md` §1 tablosuna `✅ erişildi / ❌ fallback: X` notu |
| Çıktı | Güncellenmiş AGENTS.md + `tasks/ping-report.json` |
| Kabul | 0 model "bilinmiyor" durumda kalmaz; bulunamayan her modelin fallback zinciri işaretli |
| Çakışma / Öncelik | **Bu step tamamlanmadan HİÇBİR dispatch yapılmaz** (ORCHESTRATION.md §9 checklist 2. madde). Görsel modeller (ChatGPT Image/Ideogram/FLUX) sadece erişim+quota teyidi yapılır, test görseli üretilmez (kota harcamamak için) |

## Step 0.3 — tasks/ Kuyruk ve Muhasebe Başlatma
| Alan | Değer |
| :--- | :--- |
| Ajan / Model | orchestrator · **[ŞART]** GLM 5.3 |
| Amaç | ORCHESTRATION.md §1 dizin + şemalar canlanır |
| Çıktı | `tasks/active/ done/ blocked/` dizinleri; task_queue.json'da bu fazın 10 step'i T-0001..T-0010 olarak yazılı; token_ledger ilk kaydı (0.2'nin ping maliyetleri) |
| Kabul | Her görev dosyası şema validasyonundan geçer (scope ⊆ agent yazma kilidi kontrolü script'le) |
| Öncelik | 0.2'den sonra; 0.4 ile paralel olabilir (farklı scope) |

## Step 0.4 — design-tokens.md Taslağı
| Alan | Değer |
| :--- | :--- |
| Ajan / Model | design-agent · **[TAVSİYE]** Qwen 3.8 Max (Opus'a taslak harcatmak yasak — agents/design-agent.md §6.2) · Yedek: Gemini Flash |
| Amaç | agents/design-agent.md §3.1 akışının 1. adımı |
| Çıktı | `design/design-tokens.md`: renk paleti (TR/EN/DE baz + /zh kırmızı-altın varyant + /de güven odaklı varyant), tipografi ölçeği, spacing/grid, 4 breakpoint, komponent envanteri (navbar/hero/kart/form/footer/CTA varyantları) |
| Kabul | agents/design-agent.md §5 checklist; palet hex'li; prompts/visual-brand.md §1 paletiyle tutarlı (fark varsa: insan karar verir, ikisi de güncellenir) |
| Çakışma | 0.5 ile aynı scope → 0.4 bitmeden 0.5 dispatch EDİLMEZ |

## Step 0.5 — design-tokens Nihai Karar + Hero Copy 💰 İNSAN ONAYLI
| Alan | Değer |
| :--- | :--- |
| Ajan / Model | design-agent · **[ŞART]** Claude Opus 5 (kota 1/3 — gerekçe ledger'a) + Qwen 3.8 Max uygulama |
| Amaç | agents/design-agent.md §3.2: nihai UX kararları + hero copy |
| Girdi | 0.4 taslağı + insanın palet tercihi (buradaki onay kapısı: **palet ve tipografi seçeneklerinden biri sen seçmelisin** — orchestrator sana 3 varyant sunar) |
| Çıktı | İşaretli tokens diff + her karar için ≤ 10 satır gerekçe + hero copy (tr/en/de/zh 4 dilde taslak — zh/de final pass'i ilgili fazlarda) |
| Kabul | agents/design-agent.md §5 tam; **İNSAN ONAYI: evet — tasarım tüm projeye kalıp olacak** |
| Maliyet uyarısı | Tek Opus çağrısında 4 dilin hero'su TOPLU verilir (batch kuralı) — ayrı ayrı 4 çağrı = kural ihlali |

## Step 0.6 — Komponent Brief'leri
| Alan | Değer |
| :--- | :--- |
| Ajan / Model | design-agent · **[TAVSİYE]** Qwen 3.8 Max · Yedek: GLM 5.3 |
| Amaç | agents/design-agent.md §3.3: her komponent için fe-agent'a uygulama brief'i |
| Çıktı | `design/components/{navbar,hero,card,form,footer,cta,partner-grid}.md` — prop listesi, responsive davranış (4 breakpoint), aria notları |
| Kabul | Her brief'te 4 breakpoint + erişilebilirlik bölümü dolu; tokens'a referanslı (hardcoded değer yok) |
| Öncelik | 0.5'ten sonra (nihai tokens'a bağlı); Faz 1 fe-agent işlerinin ön koşulu |

## Step 0.7 — GitHub Actions Workflow'ları
| Alan | Değer |
| :--- | :--- |
| Ajan / Model | api-agent · **[TAVSİYE]** Gemini Argon 4 · Yedek: GLM 5.3 |
| Amaç | ORCHESTRATION.md §7 otomasyonu kurulumu |
| Çıktı | `orchestrator.yml` (15dk cron + dispatch webhook) · `qa-gate.yml` (PR'da qa envanteri + gitleaks) · `nightly.yml` (02:00 TR: TTL silme, Gemini gece batch, hafta içi D1→R2 yedek) · `weekly-report.yml` |
| Kabul | Workflow syntax valid (actionlint); secret'lar env referanslı, koda gömülü DEĞİL; dry-run tetikleme başarılı |
| Çakışma uyarısı | **Sıralama şart:** 0.2'den önce workflow aktive edilmemeli — ping'siz model adıyla döngü çalışırsa kuyruk hatalı dispatch üretir. Workflow dosyaları yazılır ama `enabled` son adımda açılır |

## Step 0.8 — D1 Şema v1 + Migration 🔒 GÜVENLİK-KRİTİK
| Alan | Değer |
| :--- | :--- |
| Ajan / Model | api-agent · **[ŞART]** Claude Sonnet 5.5 + **İNSAN REVIEW** (ORCHESTRATOR.md §9: D1/auth kodu T0/T1'e devredilemez) |
| Amaç | mimari.md §5 veri modelinin migration dosyaları |
| Çıktı | `db/migrations/0001_init.sql`: partners, leads, contents, rss_news, keywords, ai_jobs, analytics_daily + index'ler (leads.status, contents.slug+locale unique, rss_news.expires_at) |
| Kabul | `wrangler d1 migrations apply` lokal D1'de koşuyor; şema mimari.md §5 ile satır satır eşleşiyor; qa-agent: index eksik sorgu yok; **insan review kaydı merge izinde** |
| Çakışma / Öncelik | Faz 1–4'ün TÜM veri işlerinin ön koşulu. 0.7 ile paralel (scope kesişmiyor: db/ vs .github/) |

## Step 0.9 — Ortak Dosya İskeleti (orchestrator tekel)
| Alan | Değer |
| :--- | :--- |
| Ajan / Model | orchestrator · **[ŞART]** GLM 5.3 — ortak dosyalara yalnızca orchestrator yazar (ORCHESTRATOR.md §11 Kural 4) |
| Amaç | Sitemap/hreflang/llms.txt altyapısı boş da olsa yerinde dursun |
| Çıktı | `app/sitemap.ts` (dil bazlı parçalı index üreteci — SEO_PLAYBOOK §8) · hreflang helper (SEO_PLAYBOOK §1 setlerini otomatik üreten fonksiyon) · `public/llms.txt` ilk sürüm · `public/robots.txt` |
| Kabul | SEO_PLAYBOOK §1.4 kuralları fonksiyona gömülü (karşılıklılık, 404-hreflang yasak); build'de sitemap üretiliyor; /en/ar helper'ı dir="rtl" set ediyor |
| Not | Bu step AI'ın kod yazdığı step DEĞİLDİR tam olarak: helper fonksiyon fe-agent tarafından yazılır, orchestrator içerik dosyalarını (llms.txt) kendisi yazar. Çakışma: sıralı çalışır — önce fe-agent (helper), sonra orchestrator (içerik) |

## Step 0.10 — İlk Orchestrator Döngüsü Provası + Faz Çıkış Denetimi 🚦 İNSAN ONAY KAPISI
| Alan | Değer |
| :--- | :--- |
| Ajan / Model | orchestrator **[ŞART]** GLM 5.3 + qa-agent **[ŞART]** GLM 5.3 |
| Amaç | Sistemin ilk gerçek uçtan uca çalışması |
| Yöntem | 1) Geçici prova görevi: "content/tr/README.md oluştur" (zararsız) → pending→dispatched→accepted tam tur 2) token_ledger kaydı doğrulanır 3) qa-agent Faz çıkış denetimi: aşağıdaki 8 kriter |
| Faz çıkış kriterleri (ROADMAP.md Faz 0) | [ ] Model ping'leri yeşil [ ] İlk tam döngü tamam [ ] D1 migration lokalde koşuyor [ ] design-tokens + brief'ler merge [ ] 4 workflow hazır (enabled) [ ] gitleaks temiz [ ] ledger'da her çağrı kayıtlı [ ] insan onay kaydı (0.5 + 0.8) |
| İnsan onayı | **SEN: "devam et" demeden Faz 1 backlog'u kuyruğa yazılmaz** |

---

## Bu Fazın Bütçe Özeti
| Kalem | Tahmin |
| :--- | :--- |
| En pahalı step | 0.5 (Opus, 1 çağrı, batch 4 dil) |
| Ücretsiz kota kullanımı | 0.4 (Qwen 3.8 Max düşük), 0.7 (Argon 4 orta) |
| İnsan müdahalesi | 3 nokta: palet seçimi (0.5 girdisi), 0.5 onayı, 0.8 code review + 0.10 devam kararı |
| Toplam tahmini token | ~120–160k output (batch'ler sayesinde; ad-hoc olsa 300k+) |
