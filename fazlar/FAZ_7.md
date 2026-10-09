# FAZ 7 — Public API Stabilizasyonu + Dış Dokümantasyon + .cn Değerlendirmesi
**Sürüm:** 1.0 | **Tarih:** 08.10.2026 | **Üst doküman:** ROADMAP.md Faz 7 (özet) — bu dosya yetkili adım detayı
**Hedef:** Proje.md §5.1 modül 5 + mimari.md Faz 7: `api.bdimexport.com` dış erişime güvenli açılış, API dokümantasyonu, n8n/mobil hazırlığı ve .cn/Aliyun geçiş değerlendirme raporu. Faz 8 lansmanının teknik ön hazırlığıdır (bu yüzden 8'den önce koşulacak şekilde taslaklandı).
**Süre tahmini:** 3–4 gün | **Ön koşul:** FAZ 6 çıkış kriterleri + insan "devam et" ✅ · Faz 3'ün 3.4 API gateway + key yönetimi canlı · Faz 4 otomasyon hattı stabil
**Fazın karakteri:** **Sertleştirme fazı.** Yeni büyük özellik yok; mevcut API'nin dış dünyaya güvenli açılışı, sözleşmesinin sabitlenmesi (breaking change yasağı başlar) ve ölçekleme kararının veriye bağlanması. Auth kodu olduğu için Sonnet 5.5 + insan review ağırlıklı (Faz 3 disiplini geçici olarak döner).
**Faz çıkış kriteri:** §10'daki 9 madde qa-agent raporuyla doğrulanmış + İnsan Onay Kapısı geçilmiş.

> **Sözleşme dondurma kuralı (bu fazda başlar, geri dönmez):** FAZ_7 çıkışıyla `/api/v1/*` şeması **v1 sözleşmesi** olarak dondurulur. Bundan sonra breaking change = yeni sürüm (`/api/v2`), v1 en az 6 ay geriye uyumlu tutulur (dış tüketiciler: n8n, mobil app, iş ortakları). Bu kural api-agent dosyasına orchestrator tarafından işlenir.

---

## Step 7.1 — API Sürümleme ve Sözleşme Dondurma
| Alan | Değer |
| :--- | :--- |
| Ajan / Model | api-agent · **[ŞART]** Claude Sonnet 5.5 (sözleşme + auth ilgilisi) + insan review |
| Amaç | /api/v1'in resmi sözleşmesinin sabitlenmesi |
| Çıktı | OpenAPI 3.1 spec (`docs/api/openapi-v1.yaml`): tüm endpoint'ler, şemalar, hata formatları (RFC 9457 problem+json), rate limit header'ları · sürümleme politikası dokümanı (semver, deprecation süreci, 6 ay uyumluluk) · `/api/v1/health` endpoint'i (sağlık panosu 6.6'ya bağlanır) |
| Zorunlu kurallar | Spec = kod ile birebir (qa spec-conformance testi kodları spec'ten üretir); error response formatı tek tip; breaking change tespiti otomatik (oasdiff CI'da) |
| Kabul | Spec build'e gömülü ve canlı servisle diff'siz; oasdiff CI adımı eklendi; **insan sözleşme onayı** (dış ticari tüketicilere açılacak — imza gerektirir) |
| Çakışma / Öncelik | Fazın ilk step'i; 7.2–7.4 buna bağlı |

## Step 7.2 — Dış Erişim Güvenliği Sertleştirmesi
| Alan | Değer |
| :--- | :--- |
| Ajan / Model | api-agent · **[ŞART]** Claude Sonnet 5.5 + insan review (auth katmanı) |
| Amaç | İç kullanımdan dış erişime geçişte güvenlik sıkılaştırma (Faz 3 içten dışa) |
| Çıktı | API key tier sistemi: `read-only` (public data) / `partner` (lead callback) / `admin-internal` (yalnızca kendi paneli — dışarıya ASLA verilemez) · key başına rate limit + günlük kota · anormal kullanım tespiti (ani trafik sıçraması → webhook alert 3.3 altyapısı) · IP allowlist opsiyonu (partner key'lerde) · `/v1/*` WAF kuralı (Cloudflare — insan panelde aktive eder) |
| Zorunlu kurallar | admin-internal tier dış API'ye ASLA verilemez (dokümante edilir); lead yazma endpoint'i yalnızca partner tier + Turnstile referansı; secret'lar env |
| Kabul | Tier matrisi testleri (her tier × her endpoint = beklenti); WAF kuralı test; alert tetikleme; **insan güvenlik review imzası** |
| Çakışma | 7.1 spec'ini bekler (tier'lar spec'e işlenir) |

## Step 7.3 — API Dokümantasyon Sitesi
| Alan | Değer |
| :--- | :--- |
| Ajan / Model | en-expert-agent (içerik) + fe-agent (sayfa) · **[TAVSİYE]** Gemini Flash (docs metinleri) + Qwen 3.8 (docs sayfa kodu, score 3–4) |
| Amaç | Dış tüketicinin (n8n kullanıcıları, gelecekteki mobil dev) self-servis dokümantasyonu |
| Çıktı | `docs.bdimexport.com` (veya /docs yolu — insan kararı): spec'ten üretilen interaktif referans (Scalar/Swagger UI — statik, D1'e dokunmaz) · quickstart (key alma → ilk istek 5 dakikada) · endpoint rehberleri (leads/partners/contents) + webhook event referansı · rate limit/deprecation politikası sayfası |
| Zorunlu kurallar | Docs EN (dış kitle); örnek request/response'lar spec'ten üretilir (elle yazılan örnek = spec'ten sapma riski = red); key alma süreci admin panel üzerinden (dokümante edilir) |
| Kabul | Örnek'ler spec-conformance testi; quickstart'ın uçtan uca takibi başarılı (qa yeni key alıp ilk isteği yapar); lighthouse ≥ 90 |
| Çakışma | 7.1–7.2'den sonra; public site scope'undan ayrı (docs dizini) — Faz 8 lansmanına paralel girebilir |

## Step 7.4 — n8n / Entegrasyon Hazırlığı
| Alan | Değer |
| :--- | :--- |
| Ajan / Model | api-agent · **[TAVSİYE]** Gemini Argon 4 |
| Amaç | Proje.md §5.1: "gelecekte mobil app veya n8n entegrasyonu için" — hazır olmak |
| Çıktı | n8n sample workflow'ları (lead → Google Sheets / Telegram bildirim; keyword → API'ye toplu girme) · webhook imzalama (HMAC) — dış sistemlere event gönderimi güvenli hale getirilir · önerilen entegrasyon reçeteleri dokümanı |
| Kabul | Sample workflow'lar gerçek test key'iyle koşuyor; webhook imza doğrulama testi; reçete dokümanı docs sitesinde |
| Not | Mobil app GELİŞTİRİLMİYOR — yalnızca API'nin mobil-ready olduğunu garanti eden sözleşme + CORS kararları belgelenir (yapılmayan işi "yaptık" göstermemek için açık not) |

## Step 7.5 — Performans ve Dayanıklılık Testi (dış erişim yükü)
| Alan | Değer |
| :--- | :--- |
| Ajan / Model | qa-agent koşar + api-agent düzeltir · Test: qa [ŞART] GLM 5.3 · Düzeltme: Argon 4 [TAVSİYE] |
| Amaç | Dış tüketiciler için SLO belirleme ve kanıtlama |
| Yöntem | Yük testi (staging — production ASLA, 3.9 kuralı): beklenen 10x trafik simülasyonu · hedef SLO: p95 < 300ms (okuma), < 800ms (yazma), hata oranı < 0.1% · Cloudflare cache stratejisi kontrolü (KV + edge cache — ücretsiz katman limitleriyle uyum) · rate limit davranışı yük altında |
| Çıktı | Yük testi raporu + SLO dokümanı (docs sitesinde) + darboğaz düzeltmeleri |
| Kabul | SLO'lar kanıtlı; rate limit yük altında adil (throttling dağıtımı doğru); ücretsiz katman limitleri aşılmıyor (100k Worker req/gün simülasyon kontrolü) |

## Step 7.6 — .cn / Aliyun Geçiş Değerlendirme Raporu
| Alan | Değer |
| :--- | :--- |
| Ajan / Model | orchestrator · **[ŞART]** GLM 5.3 (veri toplama + analiz + karar matrisi) · **KARAR: İNSAN** |
| Amaç | mimari.md Faz 7 + Risk 1: .cn domain + ICP lisansı + Aliyun mirror planının veriye dayalı değerlendirilmesi |
| Girdi verileri (toplanır) | /zh sayfalarının Çin'den gerçek erişim performansı (test ölçümleri — ücretsiz Çin ekran görüntü/test araçları ile cron ölçüm, 2 haftalık veri) · Baidu endeks durumu (5.5'ten) · Çinli firma trafiği gerçekçiliği (analytics: /zh oturumları nereden) · ICP lisans süreci maliyeti/zamanı (insan araştırması — Çin'de temsilci/ticaret kaydı şartları) · Cloudflare HK cache performansı mevcut hali |
| Çıktı | `reports/cn-degerlendirme.md`: karar matrisi — **Senaryo A:** statüko (Cloudflare HK + agresif cache — hreflang zaten hazır, migration 301 ile sorunsuz) · **Senaryo B:** Aliyun mirror (maliyet, ICP zorunluluğu, iki ortam senkronizasyon yükü) · **Senaryo C:** erteleme kriterleri (hangi tetikleyici olursa B'ye geçilir — örn. /zh oturum medyanı > X saniye veya Baidu trafiği > Y) | Öneri + tetikleyici metrikler |
| Zorunlu kurallar | Karar asla otomatik uygulanmaz (301 migration = geri dönüşü zor); tetikleyici metrikler Faz 6 panosuna bağlanır (otomatik izleme) |
| Kabul | 2 haftalık gerçek ölçüm verisiyle rapor; tetikleyiciler ölçülebilir tanımlı; **insan karar kaydı** (şimdilik hangi senaryo, ne zaman tekrar değerlendirilir) |
| Öncelik | Ölçüm erken başlar (Faz 6'dan itibaren cron ölçüm), rapor bu faza yetişir |

## Step 7.7 — Faz 7 QA Turu
| Alan | Değer |
| :--- | :--- |
| Ajan / Model | qa-agent · **[ŞART]** GLM 5.3 |
| Bu fazın özel testleri | Spec-conformance (canlı API ↔ openapi spec diff = 0) · tier matrisi · oasdiff CI (breaking change tespiti) · webhook HMAC · yük testi SLO kanıtı · docs örnek geçerliliği · secret scan · production izolasyonu (yük testi prod'a dokunmamış) |
| Çıktı | `qa/FAZ-7/rapor.md` |

## Step 7.8 — Faz Çıkışı 🚦 İNSAN ONAY KAPISI
| Alan | Değer |
| :--- | :--- |
| Ajan / Model | orchestrator · **[ŞART]** GLM 5.3 |
| Faz çıkış kriterleri (ROADMAP.md Faz 7 + ek) | [ ] v1 sözleşmesi dondurulmuş + insan onaylı [ ] oasdiff CI aktif [ ] Tier sistemi + WAF + insan güvenlik imzası [ ] Docs sitesi canlı (quickstart doğrulanmış) [ ] n8n sample'lar çalışıyor + webhook HMAC [ ] SLO'lar kanıtlı (staging yük testi) [ ] .cn değerlendirme raporu + insan karar kaydı [ ] production izolasyonu korundu [ ] gitleaks temiz |
| İnsan kararları | **"devam et" → FAZ 8 (Lansman + Partner Büyütme)** · (1) .cn senaryo seçimi (A/B/C), (2) docs URL kararı (/docs vs subdomain), (3) ilk dış API partner'ine key verilecek mi (tier kurallarıyla) |

---

## Bu Fazın Bütçe ve Çakışma Özeti

### Model dağılımı
| Model | Step'ler | Not |
| :--- | :--- | :--- |
| **Claude Sonnet 5.5 [ŞART]** | 7.1, 7.2 | Sözleşme + auth sertleştirme — Faz 3 disiplini geçici döner |
| Gemini Argon 4 [TAVSİYE] | 7.4, 7.5 düzeltmeler | Entegrasyon/yük düzeltmeleri |
| Gemini Flash + Qwen 3.8 [TAVSİYE] | 7.3 docs | Ücretsiz kota |
| **GLM 5.3 [ŞART]** | 7.6 rapor, qa, orchestrator | Karar matrisi + denetim |
| Opus / görsel | — | Kullanılmaz |
| İnsan | 7.1 sözleşme onayı, 7.2 güvenlik imzası + WAF, 7.6 .cn kararı, 7.8 devam kararı | 4 nokta |

### Paralelleştirme haritası
```
7.1 ── 7.2 ──┬─ 7.3 ──┐
             └─ 7.4 ──┼─ 7.5 ── 7.7 ── 7.8
7.6 (ölçüm erken başlar, rapor burada) ┘
```
- 7.6'nın **ölçüm kısmı Faz 6'dan itibaren arka planda koşar** (2 haftalık veri); rapor yazımı bu fazda
- 7.3 docs dış kitleye açık olacak tek çıktı — lansman (FAZ 8) öncesi hazır olması yeterli

### Tahmini token
| Kalem | Tahmin |
| :--- | :--- |
| Sonnet (7.1–7.2) | ~40–50k output |
| Argon 4 + Flash + Qwen | ~30–35k output |
| GLM (rapor+qa) | ~20k output |
| **Toplam** | **~90–105k output — kısa ve kontrollü faz** |
