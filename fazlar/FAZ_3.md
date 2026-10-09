# FAZ 3 — Admin Panel + D1 API + Analitik Altyapısı
**Sürüm:** 1.0 | **Tarih:** 08.10.2026 | **Üst doküman:** ROADMAP.md Faz 3 (özet) — bu dosya yetkili adım detayı
**Hedef:** Proje.md §5.1 modüllerinin tamamı: Cloudflare Access korumalı admin, Lead Kanban, Partner CRUD, AI İçerik Fabrikası arayüzü, /api/v1 gateway + analitik çekim altyapısı. İnsanın sisteme "kumanda" edebildiği faz.
**Süre tahmini:** 5–7 gün | **Ön koşul:** FAZ 2 çıkış kriterleri tam + insan "devam et" ✅ + D1 şema v1 (FAZ_0 0.8) canlı
**Fazın karakteri:** **En güvenlik-yoğun faz.** admin + auth + API key kodu = ORCHESTRATOR.md §9 kapsamı → ağırlıklı olarak **[ŞART] Claude Sonnet 5.5 + İNSAN REVIEW**. Hız burada değil doğrulukta — retry yerine ilk seferde doğru yazım hedeflenir.
**Faz çıkış kriteri:** §13'teki 12 madde qa-agent raporuyla doğrulanmış + İnsan Onay Kapısı geçilmiş.

> **Bu fazda 5 İNSAN ONAY noktası var:** 3.1 (Access kurulum doğrulaması), 3.4 (API key politikası), 3.7 (code review — en kritik), 3.9 (Cloudflare credential erişimi), 3.11 (faz çıkışı). Güvenlik fazında insan, jalonun kendisidir.

---

## Step 3.1 — Cloudflare Access + Admin Kimlik Doğrulama Katmanı 🔒
| Alan | Değer |
| :--- | :--- |
| Ajan / Model | admin-agent · **[ŞART]** Claude Sonnet 5.5 + **İNSAN ONAYI** (Access kurulumu = tüm admin'in kapısı) |
| Amaç | Proje.md §5: `bdimexport.com/admin` — Cloudflare Access (IP + Google OAuth) + ikinci katman middleware |
| Çıktı | Access application config (Cloudflare Zero Trust — insan CF hesabında yapar, agent config şablonu + policy dokümanı üretir) · `app/admin/middleware.ts` (Access JWT doğrulama + oturum katmanı) · audit log tablosu + yazım helper'ı (`admin_actions`: kim, ne, ne zaman, eski/yeni değer) |
| Kabul | Access'siz /admin isteği 401/403 (e2e); JWT imzasız/expire istek red; audit log her mutasyon aksiyonunda yazılı; **insan CF paneli testi kaydı** |
| Çakışma / Öncelik | **Fazın ilk step'i — her şey buna bağlı, paralel başlatılan başka step yok** |
| İnsan görevi | Cloudflare Zero Trust panelinde Access uygulamasını kurar (agent sadece şablon verir); Google OAuth bağlanır; 50 kullanıcı limiti içinde admin hesapları tanımlanır |

## Step 3.2 — Admin Panel İskeleti + Dashboard
| Alan | Değer |
| :--- | :--- |
| Ajan / Model | admin-agent · **[ŞART]** Claude Sonnet 5.5 (admin kodu ağaçtan muaf — AGENTS.md §3 Kural son paragraf) · Salt-okunur dashboard grafikleri: Gemini Argon 4 [TAVSİYE] (review ile) |
| Amaç | Admin route group iskeleti + Dashboard modülü (Proje.md §5.1 modül 4 iskeleti) |
| Çıktı | `app/admin/layout.tsx` (menü: Dashboard/Leads/Partners/İçerik Fabrikası/Analitik/API/Ayarlar) · Dashboard: CF Analytics + analytics_daily özeti · dark/basit UI (design-tokens admin varyantı — 0.4'te tanımlı) |
| Kabul | Menü rolü doğrulama (admin olmayan kullanıcı sadece Dashboard); dashboard verisi salt-okunur; lighthouse admin için ≥ 85 (public değil) |
| Çakışma | 3.1 middleware'i bekler; 3.3–3.6 modülleriyle scope kesişimi → modüller SIRALI (aynı admin dizini) |

## Step 3.3 — Lead Merkezi (Kanban + Tek-Tık Kanal)
| Alan | Değer |
| :--- | :--- |
| Ajan / Model | admin-agent · **[ŞART]** Claude Sonnet 5.5 + insan review (lead verisi = KVKK verisi) |
| Amaç | Proje.md §5.1 modül 1: tüm formlardan düşen lead'ler |
| Çıktı | Kanban (new/contacted/qualified/closed — drag&drop status güncelleme) · dil/kaynak/kanal filtreleri (source_page, locale, channel_pref) · **wa.me tek-tık link üreteci:** `https://wa.me/{number}?text=...` (Proje.md §5.1 birebir) + Telegram/WeChat/Email varyantları (channel_pref'e göre) · Slack/Telegram webhook bildirim ayarı (ORCHESTRATION.md §2 kaynak 2) |
| Zorunlu kurallar | Lead payload UI'da maskeleme opsiyonu (KVKK — e-posta/telefon kısmi görünüm toggle); status geçişleri audit log'a; kanal linki yalnızca channel_pref'ten gelir (agent tahmin etmez) |
| Kabul | e2e: faz 1 test lead'i Kanban'da görünür; status geçişi audit'e düşer; filtre doğru sonuç; webhook test mesajı iletildi |
| Öncelik | 3.2'den sonra; 3.6 API endpoint'inden bağımsız geliştirilir ama e2e ondan önce endpoint'i ister |

## Step 3.4 — /api/v1 Gateway + API Key Yönetimi 🔒 GATEWAY
| Alan | Değer |
| :--- | :--- |
| Ajan / Model | api-agent · **[ŞART]** Claude Sonnet 5.5 (auth/key kodu) + insan review · Salt sorgu endpoint'leri (public read): Gemini Argon 4 [TAVSİYE] |
| Amaç | Proje.md §5.1 modül 5: `api.bdimexport.com/v1/{leads,partners,contents}` + gelecek mobil/n8n entegrasyonu |
| Çıktı | `workers/api` router yapısı · endpoint'ler: POST /v1/leads (public, Turnstile+rate limit — FAZ 1 1.8 katmanı), GET/POST /v1/partners (admin auth'lu), GET /v1/contents (draft hariç public read) · API key üretim/revoke endpoint'i + hash'li saklama (D1 api_keys — 0.8 şemaya ekleme migration'ı gerekirse) · rate limit (KV, key bazlı) · CORS: yalnızca bdimexport.com origin'leri |
| Key politikası [ŞART] | Key yalnızca hash saklanır · ilk gösterim tek seferlik · scope'lu key (read-only vs full) · revoke anında geçer · key doğrulama KV cache'li (her istek D1'e gitmesin) |
| Kabul | e2e: valid key ✓ / geçersiz 401 / revoke edilmiş 401 / rate üstü 429 / CORS dışı origin red; gitleaks temiz; **insan key politikası onayı** |
| Çakışma | 3.3 ile D1 yazım kesişmez (farklı tablolar); admin-agent'ın UI'ı 3.6'da bu endpoint'lere bağlanır — sözleşme (OpenAPI parçası) önce yayınlanır |

## Step 3.5 — Partner Yönetimi Modülü (CRUD + Logo Onay)
| Alan | Değer |
| :--- | :--- |
| Ajan / Model | admin-agent · **[ŞART]** Claude Sonnet 5.5 (başvuru onay akışı = flywheel kapısı) |
| Amaç | Proje.md §5.1 modül 2: başvurular → onay → R2 logo → otomatik listeleme |
| Çıktı | Başvuru listesi (approved=false bekleyenler) · onay/red aksiyonu (audit log'lu) · R2 logo upload (mime+boyut server kontrol) · partner detay düzenleme (sectors_json, certs_json, capacity) · `consent_logo_en` görüntüleme (salt-okunur — rıza admin tarafından DEĞİŞTİRİLEMEZ, sadece partner yeniden rıza verir) |
| Kabul | e2e: FAZ 1 test başvurusu → onay → /en/suppliers bileşeninde görünür (FAZ 1 1.7 bileşeniyle uçtan uca) · red → görünmez · consent=false logo gösterilmiyor · her aksiyon audit'te |
| Öncelik | 3.2 → 3.5 sırası; 3.3 ile paralel DEĞİL (admin dizini kilidi) |

## Step 3.6 — AI İçerik Fabrikası Arayüzü (Proje.md §5.1 modül 3 — En Kritik UI)
| Alan | Değer |
| :--- | :--- |
| Ajan / Model | admin-agent UI · **[ŞART]** Claude Sonnet 5.5 + insan review · rss_news okuma sorguları: Argon 4 [TAVSİYE] |
| Amaç | Input A/B/C sekmeleri + draft onay kuyruğu — Faz 4 otomasyonunun kontrol kulesi |
| Çıktı | **Input A:** manuel metin yapıştır + "SEO/GEO Metne Dönüştür" butonu (→ ai_jobs kuyruk kaydı) · **Input B:** RSS kaynak CRUD + gelen haber listesi (TTL göstergesi: kalan saat) + seç → üret · **Input C:** keyword girişi (uzun kuyruk, volume/intent alanları) · **Draft kuyruğu:** contents(status=draft) listesi → düzenle/onayla/red · onay = status approved (yayın akışı Faz 4'te otomasyona bağlanır — bu fazda manuel) |
| Zorunlu kurallar | TTL < 24s haberler görsel uyarı; ai_jobs kuyruk kaydı her üretim isteğinde (model seçimi Faz 4'te orchestrator'da); onay tek tıkla "yayın" DEĞİL — onay → status değişimi → ayrı yayın aksiyonu (admin-agent §4.3) |
| Kabul | e2e: keyword gir → ai_jobs kaydı → (mock üretim) → draft listede → onay → approved; TTL uyarısı doğru; her aksiyon audit'te |
| Öncelik | 3.4 API sözleşmesinden sonra; **Faz 4'ün sert ön koşulu** |

## Step 3.7 — Analitik Çekim Altyapısı + analytics_daily 🔒 GATEWAY
| Alan | Değer |
| :--- | :--- |
| Ajan / Model | api-agent (cron + API client'lar) · **[TAVSİYE]** Gemini Argon 4 · GSC/GA4 OAuth setup: İNSAN | Dashboard grafikler: admin-agent · Argon 4 [TAVSİYE] |
| Amaç | Proje.md §5.1 modül 4 + mimari.md §7: GSC/GA4/Meta verileri cron ile D1'e |
| Çıktı | `workers/cron-analytics/` (günlük çekim: GSC search console API, GA4 Data API, Meta Marketing API) · analytics_daily doldurma + eksik gün backfill · admin Analitik Hub grafiği (Chart.js: lead kaynağı, en çok trafik alan SEO sayfası — Proje.md birebir) · API credential'ları Cloudflare Secrets'ta (insan girer) |
| Zorunlu kurallar | Credential'lar kodda ASLA (env/secret); çekim hatası alert'li (Webhook); API kota bilgisi (GSC/GA4 kotaları) aşım log'u |
| Kabul | Credential girildikten sonra 1 tam gün verisi D1'de; grafik render; backfill testi (dünü çek); secret scan temiz; **insan OAuth izinleri onayı** |
| Çakışma | 3.6'dan bağımsız scope (workers/cron vs admin UI) → paralel ✅ |

## Step 3.8 — Turnstile/Rate-Limit Admin Tarafı + Ayarlar Modülü
| Alan | Değer |
| :--- | :--- |
| Ajan / Model | admin-agent · **[TAVSİYE]** Gemini Argon 4 (salt config UI — auth yok) |
| Amaç | Proje.md §5.1 Ayarlar + ORCHESTRATION.md §2 admin kaynak bağlantısı |
| Çıktı | Ayarlar: bölge uzmanı profilleri (isim/foto/.locale), iletişim kanal bilgileri (WA/TG/WeChat numaraları), RSS kaynak CRUD (3.6 B sekmesiyle ortak), webhook bildirim hedefleri · admin-side rate limit görünümü (hangi IP/endpoint kaç istek) |
| Kabul | Kanal bilgisi değişimi UI bileşenlerine (FAZ 1/2) yansır (channel_pref çözümü ortak lib); ayar değişikliği audit'te |
| Öncelik | 3.5 ve 3.6'dan sonra (bağımlı bileşenler) |

## Step 3.9 — Staging + Production Ayrımı ve Credential Yönetimi 🔒
| Alan | Değer |
| :--- | :--- |
| Ajan / Model | api-agent · **[TAVSİYE]** Gemini Argon 4 · Credential girişleri: İNSAN |
| Amaç | ORCHESTRATOR.md §9 api-agent §5.4 kuralı: production D1'e doğrudan yazım yasak |
| Çıktı | Staging/production D1 binding ayrımı (wrangler.toml env'leri) · production deploy pipeline (staging test → insan tetikleme → prod) · Secret envanteri (hangi secret nerede, kim girdi — doküman, değer YOK) · haftalık D1→R2 yedek workflow'unun prod binding'e bağlanması (0.7'de yazılmıştı) |
| Kabul | Staging'de tüm e2e'ler yeşil; production'a hiçbir e2e yazmıyor (salt-okunur smoke); secret envanteri tam; yedek workflow staging'de 1 kez koştu |
| İnsan görevi | Cloudflare secret'ları girer (D1 API token, GSC/GA4 OAuth, Resend/Brevo key) |

## Step 3.10 — Faz 3 QA Turu (Güvenlik Ağırlıklı)
| Alan | Değer |
| :--- | :--- |
| Ajan / Model | qa-agent · **[ŞART]** GLM 5.3 |
| Bu fazın özel testleri (genel envanter + ek) | **Yetkilendirme matrisi:** her admin rotası × (Access'li/Access'siz × admin/non-admin) = 4'lü test · audit log bütünlüğü (her mutasyon kaydı var mı — script) · API key yaşam döngüsü (üret→kullan→revoke→401) · KVKK maskeleme toggle'ı · CORS matrisi · rate limit limit değerleri · SQL injection fuzz (endpoint input'ları) · gitleaks · secret envanter çapraz kontrol |
| Çıktı | `qa/FAZ-3/rapor.md` — güvenlik bulguları ayrı bölümde (kritik bulgu = faz çıkışı engeller) |

## Step 3.11 — Güvenlik İnsan Review Toplantısı 🚀 GÜVENLİK KAPISI
| Alan | Değer |
| :--- | :--- |
| Ajan / Model | orchestrator hazırlar (GLM 5.3 [ŞART]) · **KARAR: İNSAN** |
| Amaç | Bu fazın tüm [ŞART] review noktalarının (3.1, 3.3, 3.4, 3.6) toplu insan imzası |
| Girdi | 3.10 raporu + tüm merge izlerindeki insan onay kayıtları + secret envanteri |
| Çıktı | `qa/FAZ-3/insan-review.md` — onay/imza + varsa düzeltme görevleri (retry kuyruğu) |
| Kural | Bu imza olmadan 3.12'ye geçilemez; bu fazda "hızlı geç" istisnası YOK |

## Step 3.12 — Faz Çıkışı 🚦 İNSAN ONAY KAPISI
| Alan | Değer |
| :--- | :--- |
| Ajan / Model | orchestrator · **[ŞART]** GLM 5.3 |
| Faz çıkış kriterleri (ROADMAP.md Faz 3 + ek) | [ ] Access'siz /admin 403 [ ] Kanban + wa.me/TG tek-tık çalışıyor [ ] Partner onay → /en/suppliers uçtan uca [ ] API key yaşam döngüsü tam [ ] İçerik Fabrikası Input A/B/C + draft kuyruğu çalışır [ ] analytics_daily 1 tam gün veri [ ] audit log bütünlüğü script geçti [ ] staging e2e'leri yeşil [ ] secret envanteri tam + prod'a e2e yazmıyor [ ] gitleaks temiz [ ] 3.11 insan imzası var [ ] ledger: Sonnet kullanımı planlı oranla uyumlu |
| İnsan kararı | **"devam et" → Faz 4 (AI İçerik Fabrikası otomasyonu — bu fazda kurulan arayüzün beyni bağlanır)** |

---

## Bu Fazın Bütçe ve Çakışma Özeti

### Model dağılımı
| Model | Step'ler | Not |
| :--- | :--- | :--- |
| **Claude Sonnet 5.5 [ŞART]** | 3.1, 3.2, 3.3, 3.4 (auth kısım), 3.5, 3.6 | Fazın ağırlığı — güvenlik kuralı. Tahmini ~120–150k output |
| Gemini Argon 4 [TAVSİYE] | 3.4 (read endpoint'ler), 3.7, 3.8, 3.9 · **Gemini 3.8 Flash** | dashboard grafikleri (salt-okunur, review'lı) | Auth içermeyen her yerde |
| GLM 5.3 [ŞART] | qa, orchestrator | — |
| **Qwen 3.8 / Gemini Flash / Opus** | — | Bu fazda KULLANILMAZ (admin/auth = T1/T3 kapsamı dışı) |
| İnsan | 3.1, 3.4, 3.7, 3.9 (credential/onay) + 3.11 imza + 3.12 karar | **5 onay noktası — en insan-yoğun faz** |

### Paralelleştirme haritası
```
3.1 (Access) ── 3.2 (iskelet) ──┬─ 3.3 ── 3.5 ── 3.6 ── 3.8   (admin UI serisi — kilit)
                                └─ 3.4 (API) ──────────┘
3.7 (analitik cron) ────────────┘ (bağımsız)
3.9 (staging) ── 3.10 ── 3.11 ── 3.12
```
- **İki seri hat:** admin UI hattı (3.2→3.3→3.5→3.6→3.8 — aynı dizin kilidi) ve API hattı (3.4) paralel ilerler; 3.6'da kesişirler (arayüz endpoint'e bağlanır)
- **Bağımsız:** 3.7 (workers/cron scope), 3.9 sonlara doğru
- **Tıkanma noktası:** 3.1 Access kurulumu insan ister — gecikirse tüm faz durur (bilinçli tasarım: güvenlik fazı hızlanmaz)

### Tahmini token
| Kalem | Tahmin |
| :--- | :--- |
| Sonnet 5.5 (6 step, admin+API kod) | ~120–150k output — **bu fazın maliyet merkezi** |
| Argon 4 | ~50–60k output |
| qa + orchestrator | ~30k output |
| **Toplam** | **~200–240k output** — tüm fazların en pahalısı; gerekçe: tek seferde doğru yazılan güvenlik kodu, retry'dan ucuzdur |
