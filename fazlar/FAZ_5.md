# FAZ 5 — ZH + DE Tam Yerelleştirme
**Sürüm:** 1.0 | **Tarih:** 08.10.2026 | **Üst doküman:** ROADMAP.md Faz 5 (özet) — bu dosya yetkili adım detayı
**Hedef:** İki "izole kültür" sitesinin tam hali: `/zh` (Çinli firmalar — bağımsız site mantığı, Baidu + WeChat) ve `/de` (DACH — %100 yerelleştirme, Impressum/Datenschutz + formal Sie). Proje.md §2.1 segment ZH ve DE.
**Süre tahmini:** 5–6 gün | **Ön koşul:** FAZ 4 çıkış kriterleri + insan "devam et" ✅ · design-tokens zh/de varyant kararları (FAZ_0 0.5) · Baidu hesap doğrulaması (FAZ_4 4.8'de insan tarafı yapılmış olmalı)
**Fazın karakteri:** **Dil kalitesi fazı.** İki çok farklı uzmanlık: /zh = Qwen 3.8'in ana sahası (zh-native içerik + kültür), /de = Sonnet 5.5'in hassas alanı (hukuki metin + Sie hitabı). İki site bağımsız scope → **tam paralel** ilerleyebilir (bu proje içi nadir bir lüks).
**Faz çıkış kriteri:** §12'deki 11 madde qa-agent raporuyla doğrulanmış + İnsan Onay Kapısı geçilmiş.

> **Bu fazda 4 İNSAN ONAY noktası var:** 5.1 (Impressum + Datenschutz — hukuki imza), 5.7 (zh marka tercümesi + kültür kontrol), 5.9'un Baidu doğrulama girişi, 5.11 (faz çıkışı). Hukuk metni bu fazın en sert kapısıdır — agent üretse bile imza insandadır.

---

## 🎛️ Claude Code Yürütme Katmanı (FAZ 5 — ZH + DE)
> **v2.0:** Eski "Ajan / Model" satırları yalnızca **scope kilidi**. **Yürütücü = Claude Code**; model tablosu aşağıdadır (AGENTS.md §7). zh içeriğinde ucuz seçenek Haiku 5.5 (kalite gerekince Sonnet), de hukuk metni için Opus 5.5. Tek yürütücü → iki hat (zh/de) **sıralı** yapılır (eş zamanlı değil).

| Adım | İş | Model | Not |
| :-- | :-- | :-- | :-- |
| 5.1 | /de Impressum + Datenschutz | **Opus 5.5** 🔒⚖️ | 👤 veri + hukuk imzası |
| 5.2 | /zh iskelet + kimlik | kod **Sonnet 5.5** · içerik **Haiku 5.5 (ucuz)/Sonnet 5.5** | |
| 5.3 | /zh hizmet sayfaları | **Haiku 5.5 (ucuz)/Sonnet 5.5** · kontrol **Haiku** | |
| 5.4 | /de hizmet sayfaları | **Sonnet 5.5** (taslak: Haiku 5.5) | |
| 5.5 | /zh Baidu SEO | **Haiku 5.5** | 👤 doğrulama kodu |
| 5.6 | /de + /zh kod bağlamları | **Sonnet 5.5** | |
| 5.7 | dil kalite turu | **Sonnet 5.5** | 👤 zh kültür onayı |
| 5.8 | hreflang/sitemap enjeksiyonu | **Haiku 5.5** | ortak dosya |
| 5.9 | QA | **Haiku 5.5** | |
| 5.10 | hukuk/kültür imza | **Haiku 5.5** (hazırlık) | 👤 imza |
| 5.11 | faz çıkışı | **Haiku 5.5** | 👤 onay |

**Sıralı yürütme:** 5.1 → 5.2 → 5.3 → 5.5 → 5.4 → 5.6 → 5.7 → 5.8 → 5.9 → 5.10 → 5.11
**Senin görevlerin (👤):** 5.1 şirket verileri + hukuk imzası · 5.5 Baidu doğrulama kodu · 5.7 zh kültür/marka onayı · 5.10 imza · 5.11 faz çıkışı.

---

## ZH HATTI (Qwen 3.8 ağırlıklı)

## Step 5.1 — /de Impressum + Datenschutz 🔒⚖️ HUKUKİ — FAZIN EN SERT KAPISI
| Alan | Değer |
| :--- | :--- |
| Ajan / Model | de-agent · **[ŞART]** Claude Sonnet 5.5 (hukuki metin = agents/de-agent.md §1 birincil model zorunluluğu) · İnsan review: **zorunlu + imzalı** |
| Amaç | DACH yasal zorunlulukları: §5 TMG Impressum + DSGVO Datenschutzerklärung (Proje.md §8; agents/de-agent.md §3.1) |
| Girdi [ŞART] | Şirket verileri **görev dosyasından insan tarafından verilir** (ticaret unvanı, adres, temsilci, iletişim — uydurma alan = hard-red, agents/de-agent.md §5.2) |
| Çıktı | `content/de/legal/impressum.md` + `datenschutz.md` + page.tsx bağlamları · footer linkleri (tüm /de sayfalarında zorunlu konum) · DSGVO form uyum notları (double opt-in işaretleri) |
| Kabul | İnsan hukuk review'ı imzası (merge önşartı — otomatik yayın asla); Sie hitabı; veri işleme kategorileri gerçek formlarla eşleşiyor (FAZ 1/2 formları); çerez/analytics bölümü gerçek kurulumla uyumlu |
| Çakışma / Öncelik | **Fazın ilk step'lerinden; 5.4–5.6 tüm /de sayfaları footer'a bu linkleri bekler** · zh hattıyla (5.5+) paralel ✅ |
| İnsan görevi | Şirket verilerini görev dosyasına girer + hukuk danışmanı/kendisi imzalar. **"Hızlı geç" istisnası YOK** |

## Step 5.2 — /zh İzole Site İskeleti + Kurumsal Kimlik Uyarlaması
| Alan | Değer |
| :--- | :--- |
| Ajan / Model | zh-agent + fe-agent · Kod: **[TAVSİYE]** Gemini Argon 4 (score 5: yeni route group layout) · İçerik/UX kararları: **Qwen 3.8 [ŞART dil-native]** |
| Amaç | Proje.md: /zh "bağımsız bir Çin sitesi gibi izole" — global hub'dan çeviri değil, kendi niyetiyle site |
| Çıktı | `app/(zh)/layout.tsx` (kırmızı-altın palet — design-tokens zh varyantı; bağımsız navigasyon) · `content/zh/` hizmet sayfaları iskeleti (lokal satış/pazarlama/şirket kurulumu hizmetleri) · **WeChat QR bileşeni** (tüm sayfalarda — I18N_RULES §2 zh satırı) · zh dictionary (next-intl) |
| Zorunlu kurallar | 简体字 only (geleneksel = red — agents/zh-agent.md §5.1); ICP vaadi içeren cümle YASAK (Cloudflare HK ifadesi kullanılır — agents/zh-agent.md §6.3); telefon/iletişim Çin standardı (+86 algısı, WeChat ID alanı) |
| Kabul | WeChat QR bileşeni tüm şablonlarda; palet uyumu (qa görsel); bağımsız nav (global menüden kopuk); hreflang verisi manifest'e |
| Çakışma | de hattı scope'u ayrı → tam paralel ✅ |

## Step 5.3 — /zh Hizmet Sayfaları (Qwen 3.8 ana içerik üretimi)
| Alan | Değer |
| :--- | :--- |
| Ajan / Model | zh-agent · **[ŞART]** **Qwen 3.8** (zh-native — AGENTS.md §2.2 dil eşleşmesi kuralı) · Kontrol: GLM 5.3 (terminoloji diff) |
| Amaç | Çinli firmalara TR'de hizmet satışı: lokal satış kanalları, pazarlama temsil, şirket kurulumu, lojistik köprü |
| Çıktı | `content/zh/services/*.md` 4–5 sayfa + Baidu meta (title ≤ 30 Çince karakter, desc ≤ 78 — agents/zh-agent.md §3 Baidu satırı) |
| Zorunlu içerik | "Yerel ayak" vurgusu (I18N_RULES §5 zh: lokal ekip, WeChat 7/24); sayısal güven (proje/yıl sayıları — görev verisinden); Batı hype'ı YASAK |
| Kabul | 1200+ kelime; I18N_RULES §3 sözlük zh satırları (采购/验厂/物流 birebir); GLM kontrol ≤ 3 uyuşmazlık; FAQPage schema |
| Batch kuralı | Tüm sayfalar ≤ 2 çağrı |

## Step 5.4 — /de Hizmet Sayfaları (Gemini taslak → Sonnet final)
| Alan | Değer |
| :--- | :--- |
| Ajan / Model | de-agent · **[ŞART zincir]:** Gemini Flash (uzun metin taslağı — ücretsiz kota) → **Claude Sonnet 5.5 final pass** (agents/de-agent.md §1 iki-kademeli zorunluluk) · Kontrol: GLM 5.3 |
| Amaç | Proje.md segment DE: /en ile aynı hizmet setinin DACH yerelleştirmesi — düz çeviri değil (I18N_RULES §1 Kural 1) |
| Çıktı | `content/de/services/*.md` 5 sayfa (sourcing/manufacturing/inspection/logistics/customs DE karşılıkları) + `/de/vertrauen` Trust sayfası (CONTENT_STYLE §4: gerçek yorumlar, güven rozetleri — uydurma yorum = hard-red) |
| Zorunlu kurallar | **Formal Sie** (qa regex: du/dich/euch = otomatik red); her iddianın arkasında kanıt referansı (I18N_RULES §5 de: humor yok); de-CH sayfa varsa ß yasak |
| Kabul | Sie testi; 1200+ kelime; Service+FAQPage schema; kaynaklı rakamlar; Trust sayfası gerçek yorum/künye ile |
| Çakışma | zh hattı paralel ✅ · 5.1 footer linki ön koşul |

## Step 5.5 — /zh Baidu SEO Katmanı + Doğrulama
| Alan | Değer |
| :--- | :--- |
| Ajan / Model | zh-agent · **[ŞART]** Qwen 3.8 (meta metinleri) · Doğrulama girişi: İNSAN (Baidu hesabı) |
| Amaç | Proje.md §7: Baidu meta verification + zh sitemap doldurma |
| Çıktı | Baidu verification meta (4.8 şablonu doldurulur — insan verification kodu girer) · sitemap-zh.xml gerçek URL'lerle (4.8 placeholder'ı devre dışı) · robots.txt zh düzenlemesi |
| Kabul | Baidu Webmaster'da site doğrulandı (insan panel testi); sitemap submit edildi; tüm zh URL'leri 200 |
| Öncelik | 5.2–5.3 sayfaları canlı olduktan sonra |

## Step 5.6 — /de + /zh Kod Bağlamları ve Frontend
| Alan | Değer |
| :--- | :--- |
| Ajan / Model | fe-agent (de hat) + zh-agent/fe-agent (zh hat) · Kod: §3 karar ağacı [ŞART]: layout/komponent Qwen 3.8; komplex kısım (zh WeChat entegrasyon davranışı, de double opt-in form katmanı) score 6–7 → Gemini Argon 4 |
| Amaç | Her iki sitenin sayfa render'ları + özel bileşenler |
| Çıktı | `app/(de)/**` + `app/(zh)/**` page.tsx'leri · de: GDPR form katmanı (double opt-in checkbox'lar) · zh: WeChat QR davranışı (mobil: QR aç/kopyala) · generateMetadata + JSON-LD her iki dilde |
| Kabul | Design tokens dışı stil YOK; lighthouse ≥ 90 her iki sitede; dictionary dışı literal yok; hreflang verisi manifest'e |
| Çakışma | İki hat ayrı dizin → paralel ✅ · kendi içerik step'lerinden sonra açılır |

## Step 5.7 — Dil Kalite Turu (çift kontrol) 💰 KISMEN İNSAN
| Alan | Değer |
| :--- | :--- |
| Ajan / Model | **Kontrol zinciri [ŞART]:** zh: Qwen 3.8 (öz-denetim) → **GLM 5.3 (çapraz kontrol)** · de: Sonnet 5.5 (final pass zaten yapıldı) → GLM 5.3 (çapraz) · **İnsan: zh marka/kültür onayı** (marka tercümesi, örnek vurgular — kültürel nüans agent'tan sorulamaz) |
| Amaç | AGENTS.md §7 Kural 7: zh/ru/ar üretim → GLM kontrol → sadece /en ve /de final yayını öncesi Sonnet pass. Bu faza özel ek: her iki dilde insan gözü |
| Çıktı | `qa/FAZ-5/dil-kalite.md`: terminoloji diff raporları (I18N_RULES §3), kültür kontrol listesi (zh: kırmızı-altın doğru bağlam, 4-sayısı kaçınma görsellerde; de: Sie tutarlılık, kanıt tonu), insan notları |
| Kabul | GLM çapraz kontrol her dilde temiz; insan zh onayı imzalı |
| İnsan görevi | /zh içerik okuma (anadili Çince olan biri varsa ideal — yoksa makine çeviri ile çapraz okuma) + onay |

## Step 5.8 — hreflang/Sitemap Enjeksiyonu (orchestrator tekel)
| Alan | Değer |
| :--- | :--- |
| Ajan / Model | orchestrator · **[ŞART]** GLM 5.3 |
| Amaç | Proje.md §3.1 hreflang stratejisi tamamlanıyor: tr + en + de + zh setleri artık karşılıklı |
| Çıktı | sitemap-de.xml + sitemap-zh.xml · TR/EN sayfalarındaki hreflang setlerine **artık var olan** de/zh karşılıkları EKLENİR (SEO_PLAYBOOK §1.4: karşılıklılık — önce yoktu, yazılmamıştı; şimdi eklenir) · x-default kontrolleri |
| Kabul | qa: tam karşılıklılık matrisi (tr↔en↔de↔zh) + tüm URL'ler 200 + 404-hreflang sıfır |
| Not | Bu step FAZ 2'de kasıtlı ertelenen işin tamamlanmasıdır — hreflang artık 4 dil ailesinde tam |

## Step 5.9 — Faz 5 QA Turu (Dil + Hukuk + Görsel)
| Alan | Değer |
| :--- | :--- |
| Ajan / Model | qa-agent · **[ŞART]** GLM 5.3 |
| Bu fazın özel testleri | Sie/du regex (tüm /de) · 简体字 kontrol (tüm /zh) · RTL N/A (ar bu fazda değil — FAZ 2'de yapıldı) · Baidu meta uzunlukları · Impressum/Datenschutz link konumu (footer her /de sayfasında) · palet varyant görsel testleri (zh kırmızı-altın / de sade) · WeChat QR varlık scan · hukuk metni ↔ gerçek form kategorileri çapraz kontrol · tam hreflang matrisi |
| Çıktı | `qa/FAZ-5/rapor.md` |

## Step 5.10 — İnsan Hukuk/Kültür İmza Toplantısı 🚀 KAPISI
| Alan | Değer |
| :--- | :--- |
| Ajan / Model | orchestrator hazırlar (GLM 5.3 [ŞART]) · **KARAR: İNSAN** |
| Girdi | 5.1 hukuk metinleri (imzalı mı), 5.7 dil kalite raporu + insan notları, 5.9 raporu |
| Çıktı | `qa/FAZ-5/insan-imza.md` — /de hukuk imzası + /zh kültür onayı + varsa düzeltme görevleri |
| Kural | İmza olmadan 5.11'e geçilmez |

## Step 5.11 — Faz Çıkışı 🚦 İNSAN ONAY KAPISI
| Alan | Değer |
| :--- | :--- |
| Ajan / Model | orchestrator · **[ŞART]** GLM 5.3 |
| Faz çıkış kriterleri (ROADMAP.md Faz 5) | [ ] /zh Baidu meta tam + site doğrulandı + sitemap submit [ ] /de hukuk onaylı (Impressum/Datenschutz imzalı) [ ] Sie/du + 简体字 testleri temiz [ ] WeChat QR tüm zh şablonlarında [ ] Trust sayfası gerçek yorumlarla [ ] hreflang 4 dil ailesinde tam karşılıklı [ ] lighthouse ≥ 90 iki sitede [ ] ICP vaadi cümlesi sıfır [ ] gitleaks temiz [ ] 5.10 imzaları var [ ] ledger: Qwen zh kullanımı + Sonnet de final pass oranları planla uyumlu |
| İnsan kararı | **"devam et" → Faz 6 (Analitik + raporlama otomasyonu)** |

---

## Bu Fazın Bütçe ve Çakışma Özeti

### Model dağılımı
| Model | Step'ler | Not |
| :--- | :--- | :--- |
| **Qwen 3.8 [ŞART]** | 5.2 (zh içerik), 5.3, 5.5, 5.6 (zh komponent) | Dil fazının yıldızı — zh-native |
| **Claude Sonnet 5.5 [ŞART]** | 5.1 (hukuk), 5.4 final pass | Hukuki metin + DACH ton |
| Gemini Flash | 5.4 taslak | Ücretsiz kota — taslak katmanı |
| Gemini Argon 4 [TAVSİYE] | 5.2, 5.6 kod kısımları | Route group + form katmanı |
| **GLM 5.3 [ŞART]** | 5.3/5.4 kontrol, 5.7 çapraz, 5.8, qa, orchestrator | Çapraz dil denetimi |
| **Opus 5** | **YOK** | (Faz 0 kuralı — tasarım kararı kapalı) |
| İnsan | 5.1 hukuk imza, 5.5 Baidu girişi, 5.7 zh kültür onayı, 5.10 toplu imza, 5.11 karar | 5 nokta |

### Paralelleştirme haritası — iki bağımsız hat
```
DE HATTI:  5.1 (hukuk, insan) ── 5.4 ──┐
                                        ├─ 5.6 ─┐
ZH HATTI:  5.2 ── 5.3 ── 5.5 ──┐       │        ├─ 5.7 ── 5.8 ── 5.9 ── 5.10 ── 5.11
                               └─ 5.6 ─┘────────┘
```
- **Tam paralel lüksü:** de ve zh hatları scope olarak hiç kesişmez → proje içi en verimli paralel faz
- **Tıkanma noktası:** 5.1 hukuk imzası gecikirse DE hattı durur, ZH hattı akmaya devam eder (tersi de geçerli)
- 5.6 iki hattın kesişim adımı: fe-agent sırayla iki dizine girer

### Tahmini token
| Kalem | Tahmin |
| :--- | :--- |
| zh içerik (Qwen, batch'li) | ~50–60k output |
| de içerik (Flash taslak $0 + Sonnet final) | ~60–70k output (Sonnet kısmı ~35–40k) |
| Kod (Argon 4 + Qwen komponent) | ~40–50k output |
| Kontrol/qa/orchestrator (GLM) | ~30k output |
| **Toplam** | **~180–210k output** — ama dağılım verimli: en pahalı model yalnızca zorunlu yerde |
