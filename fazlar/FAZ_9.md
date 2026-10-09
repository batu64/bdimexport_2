# FAZ 9 — Ölçekleme + Sürekli Maliyet Optimizasyonu (Sürekli Operasyon)
**Sürüm:** 1.0 | **Tarih:** 08.10.2026 | **Üst doküman:** ROADMAP.md'de özeti olmayan faz (v1.1 ek fazı) — bu dosya yetkili adım detayı
**Hedef:** Projenin "biten fazı" değil, **kalıcı operasyon rejimi**: token_ledger verisine dayalı kendi kendini iyileştiren maliyet optimizasyonu, ücretsiz katman sınırı yönetimi, ölçekleme tetikleyicileri ($5/mo Workers Paid geçişi, .cn uygulaması, v2 API) ve sistemin aylık sağlık ritmi.
**Süre tahmini:** Süreklilik (aylık ritim — başlangıç bloğu 1 hafta) | **Ön koşul:** FAZ 8 çıkış kriterleri + insan "devam et" ✅ · En az 4 haftalık token_ledger + analitik verisi birikimi
**Fazın karakteri:** **Veri-isyenli evrim fazı.** Yeni kod yok denecek kadar az; tüm kararlar FAZ 6 panosu + ledger + haftalık rapor verisinden çıkar. Bu faza özel yeni bir ilke: **sistem kendi maliyetini kendi ölçtüğü veriyle optimize eder; insan yalnızca tetikleyici noktalarda karar verir.**
**Faz çıkışı:** Bu fazda "çıkış" yok — **aylık operasyon döngüsü** vardır (§Aylık Ritim). Aşağıdaki adımlar ilk kurulum + kalıcı rutinlerdir.

> **Bu fazın değişmez ilkesi (ORCHESTRATOR.md §11 Kural 1'in genişletilmiş hali):**
> Optimizasyon yalnızca **kanıtlanmış veriyle** yapılır. "Daha ucuz model deneyelim" değil → "ledger'da cache-hit %X, retry %Y; bu step'in maliyeti ortalamayı Z kat aşıyor" → o zaman müdahale. Veri olmayan optimizasyon kararı = red.

---

## Step 9.1 — Maliyet Optimizasyonu Motorunun Kurulumu (ledger → aksiyon)
| Alan | Değer |
| :--- | :--- |
| Ajan / Model | orchestrator · **[ŞART]** GLM 5.3 (analiz + karar önerisi) |
| Amaç | ORCHESTRATION.md §7.3 haftalık eşik kontrollerinin otomatik aksiyon motoruna bağlanması |
| Çıktı | Haftalık otomatik analiz rutini: 1) **cache-hit < %60** → ilgili agent'ın prompt şablonu revizyon görevi açılır (prefix sabitliği kontrolü — ORCHESTRATOR.md §4.3 Kural 5) 2) **retry > %20** → ilgili agent skill dosyası revizyon görevi (kabul kriterleri belirsiz demektir) 3) **en pahalı 5 görev** → kalıp taraması: aynı tipte görev maliyeti 2 hafta üst üste ortalanın 2 katıysa → model ataması gözden geçirme görevi 4) **batch oranı < %50** → batch kuralları uygulanmayan agent'a uyarı |
| Zorunlu kurallar | Otomatik açılan her revizyon görevi orchestrator üretir ama **uygulama PR'ı insan onaylı** (agent dosyaları sistem DNA'sı — kendi kendine evrimleşemez); aksiyon tetikleri ledger'da izlenebilir |
| Kabul | Simülasyon: sahte ledger verisiyle 4 tetikleyicinin her biri doğru görevi açıyor; yanlış-pozitif testi (veri gürültüsü) geçiyor |
| Çakışma / Öncelik | Fazın omurgası; diğer step'ler buna bağlanır |

## Step 9.2 — Ücretsiz Katman Sınır İzleme + Paid Geçiş Tetikleyicileri
| Alan | Değer |
| :--- | :--- |
| Ajan / Model | api-agent · **[TAVSİYE]** Gemini Argon 4 · **Geçiş kararı: İNSAN** |
| Amaç | Proje.md/mimari.md "~$0 hedefi" ile gerçek trafiğin çatıştığı noktayı önceden görmek |
| Çıktı | Sağlık panosuna (6.6) **katman limitleri bölümü:** Workers 100k req/gün kullanımı · D1 5GB + 5M oku/gün · R2 10GB · Pages build 500/ay · KV · **her biri için %75/90 uyarı + insan bildirimi** · Workers Paid ($5/mo) geçiş tetikleyicisi tanımlı: 2 hafta üst üste %90+ → insan kararına |
| Zorunlu kurallar | Paid geçiş kararı otomatik YAPILMAZ; geçiş olursa maliyet kalemi haftalık rapora girmeye başlar (ledger'a `cost_est_usd` fiili fatura değeriyle) |
| Kabul | Limit simülasyonları uyarı üretiyor; tetikleyici eşikleri raporda belgeli |
| İnsan görevi | %90 uyarı geldiğinde: optimize et (daha agresif cache) mi öde mi — karar |

## Step 9.3 — Ölçekleme Tetikleyicileri (büyüme yolları hazır bekler)
| Alan | Değer |
| :--- | :--- |
| Ajan / Model | orchestrator hazırlar · **[ŞART]** GLM 5.3 · Tüm uygulamalar: İNSAN |
| Amaç | Büyüme geldiğinde plan yerine planın **uygulanmış hali** olsun — kararsızlık gecikmesi yaşanmasın |
| Tetikleyici dosyaları (her biri tek sayfalık uygulama planı) | **T1 — Workers Paid:** geçiş checklist + maliyet projeksiyonu güncellemesi (9.2 tetiklenince) · **T2 — .cn uygulaması:** FAZ_7 7.6 raporundaki seçilmiş senaryonun uygulama adımları (Aliyun mirror: senkron mimarisi, 301 haritası — hreflang zaten hazır mimari.md Risk 1) · tetikleyici: 7.6'daki metrikler · **T3 — API v2:** v1'de talep edilen breaking değişiklik birikirse (n8n/iş ortağı geri bildirimi) v2 tasarım görevi · **T4 — Reklam kanalı açılışı:** 6.5 altyapısı + insan bütçe kararı tetikleyicide · **T5 — Mobil app ön-feasibility:** API v1 istatistikleri + talep analizi (yalnızca değerlendirme, geliştirme değil) |
| Zorunlu kurallar | Her tetikleyicide: koşul (ölçülebilir) + uygulama adımları + maliyet tahmini + geri dönüş planı; dosyalar `fazlar/tetikleyiciler/` altında |
| Kabul | Tetikleyici dosyaları tam; her koşul Faz 6 panosundan ölçülebilir |
| İnsan görevi | Tetikleyici koşul değerlerinin onayı (hangisi ne zaman uygulanır) |

## Step 9.4 — İçerik Üretiminin Sürekli Kalite Denetimi (ölçek kirliliği önlemi)
| Alan | Değer |
| :--- | :--- |
| Ajan / Model | qa-agent · **[ŞART]** GLM 5.3 |
| Amaç | FAZ 8'de ölçeklenen üretim (günde 5–10 makale) haftalar içinde kalite kaybedebilir — **kalpazan sapması** (model gradyanı, şablon yorgunluğu) tespiti |
| Çıktı | Haftalık rastgele örnekleme denetimi: yayınlardan %10 örnek → tam kabul testi + **çapraz sayfa benzerlik taraması** (birbirine benzeyen şablon makaleler — SEO_PLAYBOOK §7 kopya içerik kuralı genişletilir: site geneli tarama) + GSC performansı düşen sayfaların içerik güncelleme görevleri |
| Zorunlu kurallar | Kalite düşüşü eğilimi (2 hafta üst üste) → üretim hızı otomatik %50 düşürülür + kök neden görevi (hız-kalite çatışmasında kalite kazanır — FAZ_8 kuralı); güncelleme görevleri keyword motoru (6.3) hattına girer |
| Kabul | Örnekleme denetimi 2 hafta koştu; benzerlik taraması site geneli raporlanıyor; ilk güncelleme döngüsü tamam |
| Not | Bu step sistemdeki **teknik borcu üretimden önce yakalar** — 200+ sayfa sonrası geri dönüş maliyeti katlanır |

## Step 9.5 — Güvenlik ve Uyum Periyodik Denetimi
| Alan | Değer |
| :--- | :--- |
| Ajan / Model | qa-agent + api-agent · Denetim: qa **[ŞART]** GLM 5.3 · Düzeltme ihtiyacında: Sonnet 5.5 [ŞART] + insan review |
| Amaç | Canlı + dış API + partner verisi taşıyan sistemin aylık ritmi (FAZ 3/7 disiplininin kalıcı hali) |
| Aylık rutin | gitleaks tam tarama · Access kullanıcı listesi revizyonu (kim admin, gerek var mı — insan gözden geçirir) · API key envanteri (hangisi aktif, kullanılmayan revoke) · KVKK/GDPR checklist (rıza metinleri sürümü, saklama süreleri, silme talebi prosedürü testi) · D1→R2 yedek doğrulaması (geri yükleme provası — yedek alınan değil **geri yüklenebilen** yedek sayılır) · secret rotasyon önerisi |
| Kabul | Aylık denetim raporu (`qa/monthly/YYYY-MM.md`) + bulguların görevlere dönüşmesi; ilk geri yükleme provası başarılı |
| İnsan görevi | Aylık Access/key revizyonu onayı + gerekirse rotasyon |

## Step 9.6 — Agent Dosyalarının Evrimi (sistemin kendini belgelemesi)
| Alan | Değer |
| :--- | :--- |
| Ajan / Model | orchestrator önerir · **[ŞART]** GLM 5.3 · **Uygulama/merge: İNSAN onaylı PR** |
| Amaç | 4+ haftalık gerçek çalışma verisi → agent tanım dosyalarının (agents/*.md) kanıt temelli güncellenmesi |
| Güncelleme kaynakları | 1) retry oranları yüksek agent'ın kabul kriterleri netleştirilir 2) scope ihlali kaydı alan agent'ın kilidi sıkılaştırılır 3) sürekli T2'ye yükselen görev tipleri → score tablosunda kalibrasyon 4) fallback gerçekten tetiklenen zincirler → AGENTS.md §1 güncellenir 5) yeni terimler → I18N_RULES sözlüğü (insan onayıyla — mevcut kural) |
| Zorunlu kurallar | Her değişiklik: ledger/qa verisine referanslı gerekçe ("kural değişikliği" değil "ölçüm kararı"); çelişki hiyerarşisi korunur (ORCHESTRATOR.md §11 > AGENTS.md §7 > agent dosyası); değişen dosyanın versiyonu artar |
| Kabul | İlk evrim turu: ≥ 5 kanıt referanslı değişiklik PR'ı insan onayıyla merge |
| Not | **Bu step canlı sistemin asıl "model eğitimi"dir** — token vermez, prosedür verir; maliyeti sıfır, etkisi bileşik |

## Step 9.7 — Aylık Ritim (kalıcı rutin — faz kapanmaz)
| Alan | Değer |
| :--- | :--- |
| Ajan / Model | orchestrator yürütür · **[ŞART]** GLM 5.3 |
| Ritim tablosu | **Haftalık (Pzt 09:00):** haftalık rapor (6.4) + 9.1 tetikleyici taraması + 9.4 örnekleme denetimi · **Aylık:** 9.5 güvenlik/uyum denetimi + katman limitleri karnesi (9.2) + tetikleyici koşul kontrolü (9.3) + 9.6 evrim turu + **insan strategi toplantısı girdisi** (1 sayfalık özet: ne çalışıyor, ne değişmeli) |
| Kurallar | Ritim dışı acil durum: kritik alert → anında insan bildirimi + hotfix akışı (FAZ 3 disiplini) · her ritim çıktısı ledger'a kayıtlı (rapor üretiminin maliyeti de ölçülür — sistemin kendisi de optimizasyona tabi) |
| Kabul | 2 tam aylık döngü koştu → bu faz "kurulu" sayılır |

## Step 9.8 — Proje Kapanış ve Devam Kararı 🚦 İNSAN KAPISI (yıllık)
| Alan | Değer |
| :--- | :--- |
| Ajan / Model | orchestrator · **[ŞART]** GLM 5.3 |
| Amaç | Yıllık (veya insanın seçeceği periyot) büyük değerlendirme: proje hedeflerine ulaşım |
| Girdi | Proje.md §10 hedefleri vs gerçekler: 200+ sayfa (mi 400 mü), partner havuzu, lead dönüşümü, toplam maliyet ($0 hedefine sapma), FAZ 8–9 operasyon metrikleri |
| Çıktı | Yıllık değerlendirme raporu + sonraki dönem önerileri (yeni faz tanımları ihtiyacı: örn. FAZ 10 — v2 API/mobil/dikey pazarlar) |
| İnsan kararı | Projenin yönü: büyüt / mevcutta optimizasyon / yeni dikey — **tamamen insanın strateji kararı** |

---

## Bu Fazın Bütçe ve Çakışma Özeti

### Model dağılımı
| Model | Step'ler | Not |
| :--- | :--- | :--- |
| **GLM 5.3 [ŞART]** | 9.1, 9.3, 9.6, 9.7, 9.8 | Analiz + öneri — fazın beyni |
| Gemini Argon 4 [TAVSİYE] | 9.2 | İzleme kodu (tek kez) |
| qa [ŞART] GLM 5.3 | 9.4, 9.5 | Sürekli denetim |
| **Sonnet 5.5 [ŞART]** | yalnızca 9.5 düzeltme ihtiyacı + revizyon PR'ları | İstisnai |
| **Opus / Qwen / görsel** | — | Kullanılmaz (Qwen: I18N sözlük önerilerinde dönebilir) |
| İnsan | Tetikleyici kararları + aylık revizyon onayı + evrim PR onayları + yıllık strateji | Ritim halinde, az ama kritik |

### Aylık operasyon maliyeti hedefi
| Kalem | Hedef |
| :--- | :--- |
| Altyapı (Cloudflare) | $0 (paid tetikleyicisi 9.2'de izlenir — aşılırsa $5/mo insan kararı) |
| AI üretim (gece kotalı) | ~$0–20/ay (hacim arttıkça ücretsiz kota döner; aşım = gece penceresi genişletme, bütçe değil) |
| Optimizasyon/rapor (GLM) | ~10–15k output/ay — sistem kendini ölçer, kendi rapor maliyeti de rapordadır |
| **İnsan zamanı (gerçek maliyet)** | Haftalık ~2–4 saat (rapor okuma + onaylar) — tasarım gereği minimum |

### Bu fazın bitişi yok, olgunluğu var
> FAZ 9 "kurulu" sayılır: 2 tam aylık döngü koştuğunda, tüm tetikleyiciler ölçülebilir olduğunda ve ilk agent evrim turu merge edildiğinde. Sonrası: sistem haftalık rapor + aylık ritimle kendi kendini taşır — **insan yalnızca tetikleyici noktaların ve stratejinin sahibidir.** Bu, proje başındaki hedefin (minimum maliyet + maksimum otomasyon + insan kontrolü) kalıcı halidir.
