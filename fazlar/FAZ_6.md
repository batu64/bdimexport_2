# FAZ 6 — Analitik + Raporlama Otomasyonu + Keyword Motoru
**Sürüm:** 1.0 | **Tarih:** 08.10.2026 | **Üst doküman:** ROADMAP.md Faz 6 (özet) — bu dosya yetkili adım detayı
**Hedef:** Proje.md §5.1 modül 4'ün tam hali: GSC/GA4/Meta verilerinin günlük otomatik çekimi, dönüşüm ölçümü (hangi SEO sayfası lead getiriyor), keyword motorunun (uzun kuyruk → ai_jobs → makale) tam devreye girmesi ve haftalık insan raporu. Faz 4'ün üretim motoru bu fazda **ölçülebilir ve hedefli** hale gelir.
**Süre tahmini:** 3–4 gün | **Ön koşul:** FAZ 5 çıkış kriterleri + insan "devam et" ✅ · Faz 3'ün 3.7 analitik çekim altyapısı (credential'lar girilmiş, 1 tam gün veri akıyor) · en az 2 haftalık canlı trafik/lead verisi birikimi (anlamlı rapor için)
**Fazın karakteri:** **Ölçüm ve karar fazı.** Kod az, entegrasyon + analiz çok. Opus/Sonnet YOK; analiz karmaşıklığı orta (score 4–6) → Argon 4 + GLM 5.3 + Flash üçlüsü yeterli. İlk kez sistem kendi performans verisini kendine girdi yapar (kendini iyileştiren döngü başlar).
**Faz çıkış kriteri:** §10'daki 9 madde qa-agent raporuyla doğrulanmış + İnsan Onay Kapısı geçilmiş.

> **Kritik veri mahremiyeti kuralı (bu fazda öne çıkar):** GA4/GSC verileri kişisel veri içermez (agregat); ama lead verisiyle JOIN edildiğinde (hangi sayfa hangi lead'i getirdi) KVKK kapsamı başlar. JOIN yalnızca `source_page`/`product_slug` üzerinden **anonim** yapılır — kullanıcı kimliği eşleştirilmez (ORCHESTRATOR.md §9 + admin-agent §6.3 ruhuna uygun).

---

## 🎛️ Claude Code Yürütme Katmanı (FAZ 6)
> **v2.0:** Eski "Ajan / Model" satırları yalnızca **scope kilidi**. **Yürütücü = Claude Code**; model tablosu aşağıdadır (AGENTS.md §7). Sıralı çalış.

| Adım | İş | Model | Not |
| :-- | :-- | :-- | :-- |
| 6.1 | Dönüşüm atıf modeli (JOIN/SQL) | **Sonnet 5.5** | |
| 6.2 | Dashboard tamamlama | **Sonnet 5.5** | salt-okunur |
| 6.3 | Keyword motoru | kod **Sonnet 5.5** · runtime analiz **Gemini** 🟡 | ayar en sonda |
| 6.4 | Haftalık rapor üretimi | **Haiku 5.5** | |
| 6.5 | Meta API entegrasyonu | **Sonnet 5.5** | |
| 6.6 | Sistem sağlık panosu | **Sonnet 5.5** | |
| 6.7 | QA | **Haiku 5.5** | |
| 6.8 | faz çıkışı | **Haiku 5.5** | 👤 onay + tercihler |

**Sıralı yürütme:** 6.1 → 6.2 → 6.3 → 6.5 → 6.6 → 6.4 → 6.7 → 6.8
**Senin görevlerin (👤):** 6.8 faz çıkışı + reklam bütçesi/haftalık rapor tercihleri. · *6.3 runtime keyword analizi Gemini — ayar en sonda, şimdilik stub.*

---

## Step 6.1 — Dönüşüm Atıf Modeli (source_page → lead eşlemesi)
| Alan | Değer |
| :--- | :--- |
| Ajan / Model | api-agent · **[TAVSİYE]** Gemini Argon 4 (score 5–6: JOIN mantığı + SQL) · Yedek: GLM 5.3 |
| Amaç | Proje.md §5.1 Dashboard sorusunun cevabı: "lead kaynağı, en çok trafik alan SEO sayfası" — hangi sayfa hangi lead'i getiriyor |
| Çıktı | `workers/api` attribution endpoint'i: leads.source_page + utm parametreleri → analytics_daily JOIN → `attribution_daily` görüntüsü (view veya hesaplanan sorgu — yeni tablo gerekirse migration expand/contract disipliniyle, api-agent §6.6) · sayfa bazlı dönüşüm oranı metrikleri (sayfa görüntüleme → form start → submit) |
| Zorunlu kurallar | Anonim JOIN (yukarıdaki kural); atıf penceresi tanımlı (son tıklama, 30 gün — basit ve savunulabilir); source_page boş lead'ler "direct" bucket'ına |
| Kabul | Test: bilinen sayfadan gelen test lead'i doğru sayfaya atfedilir; 30 gün pencere dışı atfedilmez; dashboard'da sayfa sıralaması görünür |
| Çakışma / Öncelik | Fazın ilk step'i — 6.2 ve 6.4 buna bağlanır; 3.7 cron altyapısı canlı olmalı |

## Step 6.2 — Analitik Hub Dashboard'unun Tamamlanması
| Alan | Değer |
| :--- | :--- |
| Ajan / Model | admin-agent UI · **[TAVSİYE]** Gemini Argon 4 (salt-okunur dashboard — admin-agent §1 yedek kuralı, review'lı) |
| Amaç | Proje.md §5.1 modül 4 eksiksiz: Chart.js dashboard |
| Çıktı | Grafikler: günlük trafik (GSC gösterim/tıklama + GA4 oturum) · **lead kaynağı dağılımı** (attribution 6.1'den) · en iyi performans gösteren içerik (sayfa başına dönüşüm — Proje.md §5.1 birebir) · locale kırılımı (tr/en/de/zh ayrı trend) · keyword motoru çıktı takibi (kaç makale → trafik getirdi) |
| Zorunlu kurallar | Salt-okunur (admin-agent §2); grafik verileri analytics_daily'den (canlı API çağrısı yok — cron D1'e yazar, dashboard okur); 90 gün görünüm + dil filtresi |
| Kabul | Grafikler gerçek veriyle render; filtreler çalışıyor; lighthouse admin ≥ 85; boş veri durumları zarif |
| Çakışma | 6.1 veri sözleşmesini bekler; 6.3/6.4 ile paralel ✅ (farklı scope) |

## Step 6.3 — Keyword Motoru (uzun kuyruk → hedef sayfa kararı)
| Alan | Değer |
| :--- | :--- |
| Ajan / Model | seo-geo-agent + orchestrator · **[TAVSİYE]** Gemini Flash (keyword analizi + öneri üretimi) + **GLM 5.3 [ŞART]** (hedef sayfa/locale KARARI — Proje.md §5.1 "Agent Kararı" bu fazda tam otomatikleşir) |
| Amaç | Proje.md §5.1 Input C'nin tam otomasyonu: admin uzun kuyruk girer (veya GSC'den otomatik beslenir) → keyword analiz → hedef sayfa+locale+intent kararı → ai_jobs |
| Çıktı | `keywords` tablosu iş akışı: admin girişi + **GSC otomatik beslemesi** (gösterim alan ama tıklaması düşük sorgular = fırsat sinyali) → Flash analiz (volume/intent/locale önerisi) → GLM karar (hangi sayfa yeni mi, mevcut sayfa güncelleme mi) → ai_jobs (Faz 4 4.5 hattına) · mevcut sayfa "içerik güncelleme" görevi da üretir (sadece yeni sayfa değil) |
| Zorunlu kurallar | Keyword verisi admin girdisi + GSC dışı kaynaktan gelmez (volume uydurma yasak — keyword tablosunda `volume` alanı yalnızca gerçek API/GSC verisiyle dolar; tahmin varsa "tahmin" işaretli); GLM kararı gerekçeli (locale öneri satırı her kayıtta) |
| Kabul | 10 test keyword'ü → ai_jobs akışı; fırsat sinyali sorgusu tanımlı mantıkla çalışıyor; her ai_jobs kaydında gerekçe alanı |
| Çakışma | Faz 4 üretim hattını KULLANIR (yeni kod hattı değil, akış entegrasyonu); 6.1 GSC verisini bekler |

## Step 6.4 — Haftalık İnsan Raporu (otomatik üretim)
| Alan | Değer |
| :--- | :--- |
| Ajan / Model | orchestrator · **[ŞART]** GLM 5.3 (rapor = yorum + karar önerisi — ucuz modelde analiz kalitesi yeterli) |
| Amaç | ORCHESTRATION.md §7.3 haftalık raporunun iş metni hali: pazartesi 09:00 (TR) sana otomatik sunulur |
| Çıktı | `reports/weekly/YYYY-WW.md` şablonu: 1) Trafik + lead özeti (6.2 verilerinden) 2) En iyi/kötü performanslı 5 sayfa + neden (attribution) 3) Keyword motoru üretimi: kaç makale, kaçı trafik getirdi 4) **Token/maliyet raporu** (ORCHESTRATION.md §7.3: en pahalı 5 görev, cache-hit oranı, retry oranı — eşik kontrolü) 5) Faz/roadmap durumu 6) **Karar önerileri** (GLM: "bu sayfa güncellenmeli / bu keyword için makale üret / kota ayarı") — karar insanın |
| Zorunlu kurallar | Rapora giden her veri D1'den (canlı API çağrısı yok — maliyet disiplini); karar önerileri "öneri" başlıklı (otomatik uygulama YASAK — ORCHESTRATOR.md §3 insana çıkış kuralları); rapor üretim maliyeti de raporda |
| Kabul | 1 haftalık gerçek veriyle örnek rapor üretildi ve sana sunuldu; eşik kontrolleri (cache < %60 → prompt şablonu düzeltme görevi otomatik açılıyor — ORCHESTRATION.md §7.3 kuralı) |
| Öncelik | 6.1–6.3 verilerini bekler; ilk rapor faz çıkışının parçası |

## Step 6.5 — Meta Marketing API Entegrasyonu (reklam kanalı ölçümü)
| Alan | Değer |
| :--- | :--- |
| Ajan / Model | api-agent · **[TAVSİYE]** Gemini Argon 4 |
| Amaç | Proje.md §5.1: Meta dönüşüm verileri analytics_daily'de eksik kalmışsa tamamlanır (3.7'de altyapı vardı; reklam bütçesi başlatıldıysa kampanya verisi) |
| Çıktı | Meta campaign → lead eşlemesi (utm/source) · kampanya bazlı CAC metni (dashboard'a küçük blok) |
| Kabul | Test kampanyası verisi dashboard'da; reklam yoksa "entegre ama pasif" durumu belgeli |
| Not | Reklam bütçesi kararı tamamen insanın — bu step yalnızca ölçüm altyapısı; bütçe yoksa step atlanabilir (orchestrator not düşer) |

## Step 6.6 — Sistem Sağlık Panosu (SRE-benzeri)
| Alan | Değer |
| :--- | :--- |
| Ajan / Model | api-agent · **[TAVSİYE]** Gemini Argon 4 |
| Amaç | Otomasyon hattının (Faz 4) + cron'ların sağlık görünürlüğü — "sessiz hata" nihai çözüm |
| Çıktı | Admin'e Health bölümü: son RSS fetch zamanı/sayısı, TTL silme log'u, ai_jobs kuyruk derinliği (pending > 50 uyarı), son başarılı üretim zamanı, D1 kullanım %, Workers hata oranı, fallback tetiklenme sayıları |
| Zorunlu kurallar | Tüm metrikler mevcut log'larından Derlenir (yeni altyapı yok — maliyet disiplini); eşik aşımları webhook alert (3.3 altyapısı) |
| Kabul | Kontrollü hata simülasyonları panoda görünür (ölü kaynak, kuyruk durgunluğu); alert tetikleniyor |
| Çakışma | 6.2 ile paralel ✅ |

## Step 6.7 — Faz 6 QA Turu
| Alan | Değer |
| :--- | :--- |
| Ajan / Model | qa-agent · **[ŞART]** GLM 5.3 |
| Bu fazın özel testleri | Attribution doğruluğu (kontrol lead'leriyle) · 30-gün pencere sınırı · anonim JOIN denetimi (kişisel veri sızıntısı yok — KVKK kritik) · dashboard filtreleri · keyword akışı uçtan uca (girdi → ai_jobs → Faz 4 üretimi) · haftalık rapor gerçek veriyle · sağlık panosu simülasyonları · gitleaks |
| Çıktı | `qa/FAZ-6/rapor.md` |

## Step 6.8 — Faz Çıkışı 🚦 İNSAN ONAY KAPISI
| Alan | Değer |
| :--- | :--- |
| Ajan / Model | orchestrator · **[ŞART]** GLM 5.3 |
| Faz çıkış kriterleri (ROADMAP.md Faz 6 + ek) | [ ] Attribution modeli doğrulanmış (test lead'leriyle) [ ] Dashboard tam grafik seti + filtreler [ ] Keyword motoru uçtan uca çalışıyor (≥ 1 makale GSC fırsat sorgusundan üretilmiş) [ ] İlk haftalık rapor üretilmiş ve sunulmuş [ ] Eşik kontrolleri görev açıyor (cache/retry) [ ] Sağlık panosu + alertler canlı [ ] Anonim JOIN denetimi temiz [ ] gitleaks temiz [ ] ledger: fazın tamamı ücretsiz/ucuz modellerde |
| İnsan kararı | **"devam et" → Faz 7 (Public API stabilizasyon + .cn değerlendirmesi)** · Ek kararlar: (1) Reklam bütçesi başlatılsın mı (6.5 pasif mi kalacak), (2) haftalık rapor ekranı: chat'te mi dosya mı tercih |

---

## Bu Fazın Bütçe ve Çakışma Özeti

### Model dağılımı
| Model | Step'ler | Not |
| :--- | :--- | :--- |
| Gemini Argon 4 [TAVSİYE] | 6.1, 6.2, 6.5, 6.6 | Ölçüm/entegrasyon kodu |
| Gemini Flash [TAVSİYE] | 6.3 analiz | Ücretsiz kota |
| **GLM 5.3 [ŞART]** | 6.3 karar, 6.4 rapor, qa, orchestrator | Karar + yorum + denetim |
| **Sonnet / Opus / Qwen / görsel** | — | **Kullanılmaz** |
| İnsan | 6.8 karar (+ reklam bütçesi tercihi) | Tek onay kapısı + rapor okuma |

### Paralelleştirme haritası
```
6.1 ──┬─ 6.2 ─────┐
      ├─ 6.3 ─────┤
      └─ 6.4 ─────┼─ 6.7 ── 6.8
6.5 ──────────────┤
6.6 ──────────────┘
```
- 6.1 tek omurga; ondan sonra 4 hat paralel; 6.4 ilk rapor üretimi çıkışın parçası
- **Tıkanma riski düşük** — faz 2+ haftalık gerçek veri birikimi gerektirir; bu süre içinde Faz 4 hattı üretmeye devam eder (paralel gerçek yaşam)

### Tahmini token
| Kalem | Tahmin |
| :--- | :--- |
| Kod (Argon 4) | ~35–45k output |
| Keyword analiz (Flash) | ~$0 (kota) |
| Karar + rapor + qa (GLM) | ~30k output |
| **Toplam** | **~70–80k output — en hafif kod fazı** |
