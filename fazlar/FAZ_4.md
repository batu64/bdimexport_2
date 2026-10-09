# FAZ 4 — AI İçerik Fabrikası Otomasyonu (RSS → Üretim → Onay → Yayın)
**Sürüm:** 1.0 | **Tarih:** 08.10.2026 | **Üst doküman:** ROADMAP.md Faz 4 (özet) — bu dosya yetkili adım detayı
**Hedef:** Proje.md §5.1 modül 3'ün otomatik hali: RSS/Trends toplama → üretim → draft → insan onayı → yayın tam hattı. Proje.md §10'un "1 ayda 200+ sayfa" motoru bu fazda çalışmaya başlar.
**Süre tahmini:** 4–5 gün | **Ön koşul:** FAZ 3 çıkış kriterleri + insan "devam et" ✅ · Özellikle: 3.6 İçerik Fabrikası arayüzü + 3.4 /api/v1 + staging ayrımı (3.9) canlı.
**Fazın karakteri:** **En ucuz faz.** Hacim işi T0/T1 (Gemini Flash-Lite/Flash + Workers AI ücretsiz kota) ağırlıklı; yazılan kod az ama otomasyon hattı kritik — hata izleme ve fallback bu fazın kalitesi demektir.
**Faz çıkış kriteri:** §11'deki 10 madde qa-agent raporuyla doğrulanmış + İnsan Onay Kapısı geçilmiş.

> **Değişmez yayın kuralı (tüm faz boyunca geçerli):** Hiçbir AI metni `status: draft` dışına **insan onayı olmadan** geçmez (ORCHESTRATOR.md §11 Kural 5; mimari.md §6). Bu fazın amacı onayı **kaldırmak değil, hızlandırmaktır** — admin tek ekrandan günde 10–20 draft onaylayabilecek hale gelir.

---

## Step 4.1 — RSS Toplama Cron Script'i (saatlik)
| Alan | Değer |
| :--- | :--- |
| Ajan / Model | rss-trends-agent · **[TAVSİYE]** Gemini Argon 4 (cron script yazımı, score 5) · Yedek: GLM 5.3 |
| Amaç | mimari.md §6 hattının 1. adımı: `workers/cron-rss` saatlik fetch |
| Çıktı | Admin tanımlı RSS kaynaklarını çeken script (3.6 B sekmesinden) · parse → D1 `rss_news` yazımı (source, title, url, fetched_at, expires_at=fetched+72h) · duplicate url dedup · kaynak hatası izolasyonu (1 kaynak düşerse diğerleri akmaya devam) |
| Zorunlu kurallar | Script'te agent çağrısı YOK (deterministik iş — ORCHESTRATOR.md §4.3 Kural 8); TTL silme bu step'te DEĞİL (4.2); fetch timeout + retry (kaynak başına 1) |
| Kabul | Integration test: 3 test kaynağı → D1'de kayıt; aynı feed 2 kez → dedup; ölü kaynak → log + diğerleri etkilenmez |
| Çakışma / Öncelik | Fazın ilk step'i; 4.3 ile paralel DEĞİL (aynı workers dizini ailesi — sıralı) |

## Step 4.2 — TTL Silme + D1 Bakım Cron'u (gece)
| Alan | Değer |
| :--- | :--- |
| Ajan / Model | rss-trends-agent · **[TAVSİYE]** Gemini Argon 4 |
| Amaç | 3 gün TTL: `DELETE WHERE expires_at < NOW()` (Proje.md §5.1 birebir) + expired ai_jobs temizliği |
| Çıktı | `workers/cron-rss` gece job'ı (nightly.yml'den tetiklenir) · silme sayısı log'u · D1 boyut raporu (haftalık) |
| Kabul | Yaş testi: 71 saatlik kayıt durur, 73 saatlik silinir; silme audit log'lu; production D1'e doğrudan bağlantı YOK (3.9 binding disiplini) |
| Öncelik | 4.1'den sonra (aynı worker); gece dilimine schedule |

## Step 4.3 — Google Trends Toplama (RSS yaklaşımı)
| Alan | Değer |
| :--- | :--- |
| Ajan / Model | rss-trends-agent · **[TAVSİYE]** Gemini Argon 4 |
| Amaç | Resmi API yok (mimari.md §6): günlük trending RSS (geo=TR/RU/DE) + keyword tablosu entegrasyonu |
| Çıktı | `workers/cron-trends` günlük script · trends kayıtları ayrı etiketle D1'e (admin listede "Trends" kaynağı olarak görünür) · tekrar eden trend dedup (7 gün penceresi) |
| Kabul | 3 geo parametresiyle test çekimi; dedup çalışıyor; admin B sekmesinde görünür |
| Öncelik | 4.1 pattern'ini yeniden kullanır; 4.2 ile paralel olabilir (farklı worker dosyası) |

## Step 4.4 — Batch Özet/Etiketleme Pipeline'ı (AI katmanı)
| Alan | Değer |
| :--- | :--- |
| Ajan / Model | rss-trends-agent · **[TAVSİYE]** **Gemini Flash-Lite (birincil, ücretsiz kota) → Workers AI (fallback, kota bitince)** — agents/rss-trends-agent.md §1 zinciri [ŞART sıra] |
| Amaç | Yeni rss_news kayıtlarının AI özeti + etiketi: `{sector, product_candidate, locale_suggestion[], urgency}` (sabit JSON şema) |
| Çıktı | Batch job: 20 haber/çağrı (ORCHESTRATION batch kuralı) · gece toplu koşu + saatlik yeni-gelen küçük batch · **prompt injection temizliği:** ham RSS metni prompt'a girmez — script önce kontrol karakter/uzunluk temizler, özet çıktısı ham metin İÇERMEZ (agents/rss-trends-agent.md §5.3) |
| Kabul | Etiket şeması JSON valid (100 kayıt testi); injection testi (RSS içinde yönerge metni → çıktıda yönerge YOK); Flash-Lite→Workers AI fallback tetikleme testi; batch maliyeti ledger'da $0'a yakın |
| Çakışma | 4.1–4.3'ten sonra (veri hazır olmalı); 4.5 ile paralel DEĞİL (aynı agent seri kuyruğu) |

## Step 4.5 — Makale Üretim Akışı (ai_jobs → draft)
| Alan | Değer |
| :--- | :--- |
| Ajan / Model | seo-geo-agent · **[TAVSİYE]** **Gemini Flash üretim (ücretsiz gece kota) + GLM 5.3 kontrol pass'i** [ŞART kontrol adımı] (agents/seo-geo-agent.md §1) |
| Amaç | Proje.md §5.1 Agent Kararı: Input A/B/C → hedef locale kararı → 1200+ kelimelik GEO makale → `contents(status: draft)` |
| Çıktı | ai_jobs consumer (Workers): kuyruktan alır → input tipine göre akış: **A** (manuel metin) / **B** (seçili haberler — özet etiketlerden) / **C** (keyword) · locale önerisi + gerekçe (Proje.md örn: "hazelnut+germany" → /de + /en) · makale + FAQ + schema önerisi · GLM kontrol pass'i (SEO_PLAYBOOK §7 eşikleri) → draft kaydı |
| Zorunlu kurallar | Çıktı HER ZAMAN draft (yayın linki yok); rakamlar yalnızca görev verisindeki kaynaklardan (kaynaksız = hard-red); RSS metni aynen kopyalanamaz (plagiarism — yeniden yazım); içerik kaydında `model` alanı dolu (muhasebe) |
| Kabul | 3 tip (A/B/C) × 1'er makale test üretimi; GLM kontrol raporu; draft listede görünür (3.6 UI); locale önerisi gerekçeli |
| Batch / Öncelik | 3 makale/çağrı batch · 4.4'ten sonra; gece dilimi tercihi |

## Step 4.6 — Onay → Yayın Otomasyonu (hibrit yayın hattı)
| Alan | Değer |
| :--- | :--- |
| Ajan / Model | orchestrator · **[ŞART]** GLM 5.3 (yayın kararı mekanizması ortak dosyalara dokunur) |
| Amaç | mimari.md §6 hibrit strateji: **kalıcı → Git PR; geçici → D1 edge render** |
| Çıktı | Admin "onayla" aksiyonu sonrası içerik tipine göre: **kalıcı** (ürün/sektör makalesi) → otomatik Git PR (content/** + metadata) → admin merge → build; **geçici** (haber kartı) → contents(status=approved) → edge render bloğu · sitemap/llms.txt güncelleme orchestrator eliyle (her iki yolda) |
| Zorunlu kurallar | PR açma yetkisi orchestrator bot'unda (admin UI sadece tetikler); merge insanın ya da admin paneldeki yetkili akışta; "approved" ≠ "published" — iki ayrı status (admin-agent §4.3 kuralı) |
| Kabul | e2e: draft → onay → kalıcı makale PR'ı açılır → merge → build → sayfa canlı + sitemap'te; geçici haber kartı → anında edge'de; iki yol ayrı log |
| Çakışma | 4.5 draft üretimini bekler; 4.7 ile paralel DEĞİL (ortak dosyalar) |

## Step 4.7 — Hata İzleme, Fallback ve Kota Yönetimi
| Alan | Değer |
| :--- | :--- |
| Ajan / Model | api-agent · **[TAVSİYE]** Gemini Argon 4 |
| Amaç | Otomasyon hattı gece insan görmezken çalışır — sessiz hata = sessiz içerik kaybı |
| Çıktı | ai_jobs retry mantığı (max 2, ORCHESTRATION.md §6 zinciri) · üretim hatası → Webhook alert (Slack/Telegram — 3.3'teki webhook altyapısı) · Gemini kota izleme (günlük kota %80 uyarı → Workers AI'ya otomatik düş) · hat günü raporu (nightly log) |
| Kabul | Kontrollü hata testleri: kota tükenme simülasyonu → fallback; kalıcı hata → alert iletildi → ai_jobs blocked; alert spam önleme (aynı hata 1 saatte 1 bildirim) |
| Öncelik | 4.5 ve 4.6'dan sonra; canlı kullanım öncesi tamamlanmış olmalı |

## Step 4.8 — Baidu Hazırlığı (zh Sitemap submit akışı)
| Alan | Değer |
| :--- | :--- |
| Ajan / Model | orchestrator · **[ŞART]** GLM 5.3 (ortak dosya) · Baidu hesap işlemleri: İNSAN |
| Amaç | Proje.md §7: Baidu için hazırlık (Faz 5 zh sitesi gelmeden altyapı hazır) |
| Çıktı | sitemap-zh.xml placeholder (zh URL'leri Faz 5'te dolar) · Baidu Webmaster Tools submit rutini dokümanı + admin rutin adımı · Baidu meta verification şablonu (app/(zh) layout'a hazır yer) |
| Kabul | sitemap index'te sitemap-zh kayıtlı (boş valid); rutin dokümanı admin Ayarlar'a not edildi |
| İnsan görevi | Baidu Webmaster hesabı + site doğrulama (Faz 5'te aktif kullanılacak) |

## Step 4.9 — Faz 4 QA Turu (Otomasyon Güvenilirliği)
| Alan | Değer |
| :--- | :--- |
| Ajan / Model | qa-agent · **[ŞART]** GLM 5.3 |
| Bu fazın özel testleri | Tam hat e2e (haber → özet → üretim → draft → onay → yayın, her iki yol) · TTL doğruluk (3 gün pencere) · dedup (RSS + Trends) · injection temizliği · fallback zincirleri (Flash-Lite→Workers AI, Flash→Workers AI) · kota uyarı eşikleri · retry/blocked davranışı · production D1 izolasyonu (3.9 kuralı) · **"onaysız yayın" negatif testi:** draft'ı doğrudan yayınlamaya zorlayan her yol kapalı mı |
| Çıktı | `qa/FAZ-4/rapor.md` |

## Step 4.10 — Faz Çıkışı 🚦 İNSAN ONAY KAPISI
| Alan | Değer |
| :--- | :--- |
| Ajan / Model | orchestrator · **[ŞART]** GLM 5.3 |
| Faz çıkış kriterleri (ROADMAP.md Faz 4) | [ ] Saatlik RSS aktif (canlı kaynaklarla 48s kesintisiz) [ ] TTL silme doğrulandı [ ] Trends toplama çalışıyor [ ] İlk makale draft→insan onayı→yayın TAM TUR (gerçek içerikle) [ ] fallback zincirleri test edildi [ ] alert'ler iletildi [ ] production D1 izolasyonu korundu [ ] kota kullanımı ledger'da ağırlıklı $0 [ ] onaysız yayın negatif testi temiz [ ] gitleaks temiz |
| İnsan kararı | **"devam et" → Faz 5 (ZH + DE tam yerelleştirme — Qwen 3.8 ve Sonnet 5.5'in dil fazı)** · Ek karar: üretim hız hedefi — günde kaç draft/makale hedeflenecek (öneri: 5–10 makale/gün başlangıç, kalite stabilize olunca artış) |

---

## Bu Fazın Bütçe ve Çakışma Özeti

### Model dağılımı
| Model | Step'ler | Not |
| :--- | :--- | :--- |
| **Gemini Flash-Lite / Workers AI** | 4.4 özet/etiket | ~$0 — fazın ana hacmi |
| **Gemini Flash** | 4.5 makale üretimi | Ücretsiz gece kotası |
| **GLM 5.3 [ŞART]** | 4.5 kontrol, 4.6, 4.8, qa, orchestrator | Kontrol + yayın mekanizması |
| Gemini Argon 4 [TAVSİYE] | 4.1, 4.2, 4.3, 4.7 | Cron/worker script'leri |
| **Sonnet 5.5 / Opus / Qwen / görsel modeller** | — | **Bu fazda kullanılmaz** (kod az, içerik T0/T1) |

### Paralelleştirme haritası
```
4.1 ── 4.2 ──────────┐
  └─── 4.3 ──────────┤
        4.4 ── 4.5 ──┴─ 4.6 ── 4.7 ── 4.9 ── 4.10
4.8 (bağımsız, küçük) ──────────────┘
```
- **Seri omurga:** 4.1 → 4.4 → 4.5 → 4.6 (veri hattı sırası); 4.2/4.3 ara paralel; 4.8 her zaman koşabilir
- **Tıkanma riski:** ücretsiz kota tükenirse 4.4/4.5 Workers AI'ya düşer — hız düşer ama durmaz

### Tahmini token
| Kalem | Tahmin |
| :--- | :--- |
| Özet/etiket (Flash-Lite/Workers AI) | ~$0 (ücretsiz kota) |
| Makale üretimi (Flash, gece) | ~$0–düşük |
| Script kodu (Argon 4) | ~40–50k output |
| GLM kontrol + qa + orchestrator | ~35k output |
| **Toplam (ücretli karşılığı)** | **~80–90k — tüm fazların en ucuzu** (ağırlık ücretsiz kotada) |
