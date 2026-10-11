# AGENTS.md — Claude Code Yürütme Modeli ve Model Haritası
**Proje:** bdimexport.com | **Sürüm:** 2.0 | **Tarih:** 11.10.2026
**Amaç:** TEK DOĞRULUK KAYNAĞI. Her fazda ve her adımda **hangi Claude modeliyle** çalışılacağını, hangi işin harici AI (Gemini) gerektirdiğini ve insanın ne zaman devreye gireceğini tanımlar.

> **v2.0 — Köklü değişiklik:** Önceki çok-sağlayıcılı (GLM / Qwen / Gemini / çok-ajanlı) orkestrasyon **kaldırıldı**. Artık tüm fazlar ve tüm adımlar **tek yürütücüyle: Claude Code** ile yapılır. Model seçimi (Haiku / Sonnet / Opus) adım adım bu dosyada önceden belirlenmiştir. Harici/çalışma-zamanı AI gerektiğinde **yalnızca Gemini** kullanılır ve ayarı **en sona** bırakılır.
>
> **Çelişki çözümü:** Model/adım ataması çelişirse **bu dosya kazanır.** Değişmez güvenlik kuralları için §8. Faz adım detayı için `fazlar/FAZ_*.md` (her dosyanın başındaki "Claude Code Yürütme Katmanı" tablosu bu dosyayla birebir aynıdır).

---

## 1. Claude Code Model Paleti — SENİN HAZIRDA BEKLETECEĞİN LİSTE

Aşağıdaki modelleri Claude Code'da seçip hazır tut. Her adımın yanında bu dört isimden biri yazar; adım başladığında ilgili modele geç.

| # | Model | Model ID | Rol | Ne zaman kullanılır | Maliyet |
| :-- | :-- | :-- | :-- | :-- | :-- |
| 1 | **Haiku 5.5** | `claude-haiku-5-5` | **En ucuz / en hızlı** | Mekanik işler, şablon sayfa, deterministik enjeksiyon (sitemap/hreflang/llms), QA koşumu, rapor derleme, basit config | $ (en düşük) |
| 2 | **Sonnet 5.5** | `claude-sonnet-5-5` | **Güçlü kodlama** | Komponent, form UI, Workers/D1/cron/API kod, i18n, analitik entegrasyon, orta–yüksek karmaşık kod, kapsamlı içerik | $$ |
| 3 | **Opus 5.5** | `claude-opus-5-5` | **En yeni / en iyi — tasarım + güvenlik** | Tasarım sistemi kararı, hero copy, mimari karar, API sözleşmesi, **auth/admin/ödeme/KVKK-GDPR kodu**, hukuki metin, karmaşık debug | $$$ (sınırlı) |

> **3 model — hepsi bu kadar:** Haiku + Sonnet + Opus tüm fazları karşılar; dördüncü model yoktur. **İçerik işinde ucuz seçenek = Haiku 5.5** (şablon/kısa metin), **kalite gerekince Sonnet 5.5** (uzun SEO makale, hassas çok dilli metin). İçerik adımlarının yanında `(ucuz: Haiku 5.5)` işareti bu alt seçeneği gösterir.

---

## 2. Model Seçim Politikası (karar kuralı)

Bir adımın modeli zaten §7 tablosunda sabittir. Kural, yeni/ara görevler çıkarsa uygulanır:

```
Mekanik / şablon / deterministik (eski score ≤2)        → Haiku 5.5
Standart kod + orta içerik (eski score 3–6)             → Sonnet 5.5
Karmaşık kod / state / debug / mimari (eski score 7–8)  → Sonnet 5.5 (çok ağırsa Opus 5.5)
Tasarım sistemi / hero / mimari karar                   → Opus 5.5
Güvenlik: auth / admin / ödeme / KVKK-GDPR / hukuki      → Opus 5.5 + ZORUNLU insan review
İçerik (SEO makale, çok dilli prose): kısa/şablon        → Haiku 5.5 · uzun/hassas → Sonnet 5.5
```

**Kurallar:**
1. **Ucuz-önce:** Bir iş alt basamakta yapılabiliyorsa üst modele çıkma. Yükseltme gerekçe ister (kalite başarısızlığı), indirme serbest.
2. **Tek adım = tek model:** Bir adımda model değiştirme (retry hariç). Model değiştirmek bağlam yeniden kurar, token pahalanır.
3. **Güvenlik basamağı değişmez:** auth/admin/ödeme/KVKK kodu her koşulda Opus 5.5 + insan review (§8 Kural 4).

---

## 3. Harici / Çalışma-Zamanı AI = Gemini (ayarı EN SONDA)

Claude Code = **geliştirme zamanı** yürütücüsü (kodu, içeriği, tasarımı ben yazarım). Uygulamanın **çalışma zamanında** kendi AI çağrısı gerektiren yerler Claude değil **Gemini** kullanır:

| Nerede | Ne | Model | Ne zaman ayarlanır |
| :-- | :-- | :-- | :-- |
| İçerik Fabrikası (FAZ 4.5) | ai_jobs → makale üretimi (runtime) | **Yeni Gemini metin modeli** | EN SONDA |
| RSS özet/etiketleme (FAZ 4.4) | Haber özeti + sınıflandırma (runtime) | **Yeni Gemini (hızlı/ucuz varyant)** | EN SONDA |
| Keyword motoru (FAZ 6.3) | Keyword analiz/öneri (runtime) | **Yeni Gemini metin modeli** | EN SONDA |
| Görsel üretim (FAZ 2.6 + sonrası) | Hero/OG/infografik üretimi | **Yeni Gemini görsel modeli** (`gemini-*-image`) | EN SONDA |

**Kurallar:**
- Bu özelliklerin **kodunu** (worker, kuyruk tüketici, manifest, crop script) **Claude Code yazar** (Sonnet/Haiku — §7'de işaretli). Yalnızca **runtime'da çağrılan model** Gemini'dir.
- Gemini API anahtarları, model adları ve endpoint ayarı **projenin en sonunda** tek seferde yapılır (§9). O ana kadar bu çağrılar **mock/stub** ile geçilir; kod hazır, anahtar boş bekler.
- Başka hiçbir harici sağlayıcı kullanılmaz (GLM/Qwen/OpenAI/FLUX vb. tümü kaldırıldı).

---

## 4. Agent = Scope Kilidi (artık yürütücü değil, sınır)

Çok-ajanlı yürütme kalktı. Agent tanımları yalnızca **yazılabilir dizin sınırı (scope kilidi)** olarak yaşar. Claude Code bir adımı yaparken **o adımın agent-scope'unu üstlenir** ve **başka bir agent'ın scope'una veya adımına o adımda dokunmaz.**

| Scope (rol) | Yazılabilir dizinler (kilit) | Varsayılan model |
| :-- | :-- | :-- |
| `fe` | `app/(tr\|en\|de\|zh)/**` (ortak dosyalar hariç), `app/components/**`, `lib/ui/**` | Sonnet 5.5 (basit: Haiku) |
| `api` | `workers/**`, `db/migrations/**`, `app/admin/api/**` | Sonnet 5.5 (auth/key: Opus 5.5) |
| `admin` | `app/admin/**` (api hariç) | Opus 5.5 (salt-okunur UI: Sonnet) |
| `tr-import` | `content/tr/ithalat/**` | Haiku 5.5 (uzun rehber: Sonnet) |
| `tr-export` | `content/tr/ihracat/**`, `content/tr/legal/**` | Haiku 5.5 (uzun rehber: Sonnet) |
| `en-expert` | `content/en/global/**`, `app/(en)/en/*` (varyant hariç) | Sonnet 5.5 (kısa: Haiku) |
| `en-l10n` | `content/en/{ru,fr,nl,es,ar}/**`, `app/(en)/en/{ru,fr,nl,es,ar}/**` | Haiku 5.5 (ucuz) / Sonnet 5.5 (kalite) |
| `zh` | `content/zh/**`, `app/(zh)/**` | Haiku 5.5 (ucuz) / Sonnet 5.5 (kalite) |
| `de` | `content/de/**`, `app/(de)/**` | Sonnet 5.5 (hukuk: Opus 5.5) |
| `seo-geo` | `content/**/seo/**`, `public/llms.txt` (orchestrator ile) | Sonnet 5.5 (kısa: Haiku) |
| `image` | `public/media/**` | Gemini görsel (EN SONDA) + Haiku (script) |
| `orchestrator` (ortak dosya tekeli) | `app/sitemap.ts`, `lib/hreflang.*`, `public/robots.txt`, `public/llms.txt`, `tasks/**`, `reports/**` | Haiku 5.5 |
| `qa` | `qa/**` | Haiku 5.5 (güvenlik QA: Sonnet) |

**Kurallar:**
1. **Tek scope / tek commit:** Bir adımın çıktısı yalnızca o scope'un dizinlerine yazar. İki rolün dizinine aynı commit'te yazma **yasak** — ayrı adım, ayrı commit.
2. **Ortak dosya tekeli:** `sitemap.ts`, hreflang haritası, `robots.txt`, `llms.txt` gibi ortak dosyalara yalnızca `orchestrator` rolü yazar; başka rol adımında bunlara dokunamaz.
3. Scope kilidi, tek yürütücüde bile çakışmayı ve karışık commit'i önler.

---

## 5. Sıralı Yürütme (çakışma önleme)

Tek yürütücü (Claude Code) olduğundan **eş zamanlı agent çalışması yoktur → her şey sıralıdır.** Eski faz dosyalarındaki "paralel" ifadeleri artık **önerilen sıra** olarak okunur.

**Çakışma önleme kuralları:**
1. Scope'ları kesişen adımlar **asla aynı anda** yapılmaz; her faz dosyasının başındaki "Sıralı yürütme" satırındaki sıraya uyulur.
2. Aynı dizine yazan adımlar (örn. admin UI serisi 3.2→3.3→3.5→3.6→3.8) **kesin sıralı**; biri bitip commit edilmeden diğeri başlamaz.
3. Ortak dosyalar (sitemap/hreflang/llms) her zaman ilgili içerik adımlarından **sonra**, tek elden güncellenir.
4. Bağımlılığı olan adım (`depends_on`) öncülü bitmeden başlamaz; güvenlik-kritik adım bir bağımlılıksa, bağımlı adım insan review tamamlanana kadar bekler (alternatif yol yok).

---

## 6. İnsan Onay / Görev Noktaları (konsolide)

Her adımın başında veya sonunda **senin yapman gerekenler** bildirilir. Zorunlu insan noktaları:

| Faz | Adım | Senin görevin |
| :-- | :-- | :-- |
| 0 | 0.5 | **Palet/tipografi seçimi** (3 varyanttan biri) + tasarım onayı |
| 0 | 0.8 | D1 şema **insan review** (güvenlik) |
| 0 | 0.10 | Faz 0 çıkış **"devam et"** onayı |
| 1 | 1.1 | **KVKK rıza metni** doldurma + hukuki onay (v1 kilit) |
| 1 | 1.6 | Başvuru formu **code review** (güvenlik) |
| 1 | 1.11 | Faz 1 çıkış onayı + deploy kararı |
| 2 | 2.10 | Faz 2 çıkış onayı |
| 3 | 3.1 | **Cloudflare Access kurulumu** (Zero Trust panel) + Google OAuth |
| 3 | 3.4 | API key politikası onayı |
| 3 | 3.7 | **GSC/GA4/Meta OAuth** credential girişi |
| 3 | 3.9 | Cloudflare **secret** girişleri (D1 token, mail key) |
| 3 | 3.11 | **Güvenlik insan review imzası** |
| 3 | 3.12 | Faz 3 çıkış onayı |
| 4 | 4.8 | Baidu Webmaster hesabı/doğrulama |
| 4 | 4.10 | Faz 4 çıkış onayı + üretim hız hedefi |
| 5 | 5.1 | /de **Impressum/Datenschutz** şirket verileri + **hukuk imzası** |
| 5 | 5.5 | Baidu doğrulama kodu girişi |
| 5 | 5.7 | /zh kültür/marka onayı |
| 5 | 5.10 / 5.11 | Hukuk+kültür imzası + faz çıkış onayı |
| 6 | 6.8 | Faz 6 çıkış + reklam bütçesi/rapor tercihi |
| 7 | 7.1 / 7.2 | API sözleşme onayı + güvenlik imzası + WAF aktivasyonu |
| 7 | 7.6 / 7.8 | .cn senaryo kararı + faz çıkışı |
| 8 | 8.2 | **Lansman tetikleme** + DNS/domain son kontrol |
| 8 | 8.3 / 8.5 | Hedef kurum listesi + İYS kaydı + kanal hesapları (WeChat vb.) |
| 8 | 8.6 / 8.9 | Partner onay + lead eşleştirme kararları + faz çıkışı |
| 9 | sürekli | Tetikleyici kararları, aylık Access/key revizyonu, evrim PR onayları, yıllık strateji |
| **SON** | §9 | **Gemini API anahtarları + model adları** girişi (runtime AI açılır) |

---

## 7. TAM MODEL HARİTASI — Faz × Adım → Model

> 🔒 = güvenlik/insan review zorunlu · 👤 = insan görevi · 🟡 = runtime'da Gemini (ayar en sonda) · (ucuz: Haiku) = daha ucuz istersen Sonnet yerine Haiku 5.5

### FAZ 0 — Foundation
| Adım | İş | Model | Not |
| :-- | :-- | :-- | :-- |
| 0.1 | Repo iskeleti (route groups + workers + db) | **Sonnet 5.5** | |
| 0.2 | ~~Model ping~~ → Claude Code'da gereksiz | **ATLANDI** | Yerine §9 Gemini testi en sonda |
| 0.3 | tasks/ kuyruk + muhasebe iskeleti | **Haiku 5.5** | Opsiyonel/hafif |
| 0.4 | design-tokens taslağı | **Sonnet 5.5** | |
| 0.5 | design-tokens nihai + hero copy | **Opus 5.5** | 👤 palet seçimi |
| 0.6 | komponent brief'leri | **Sonnet 5.5** | |
| 0.7 | CI workflow (build + qa-gate + gitleaks) | **Sonnet 5.5** | orchestrator-cron workflow'u kaldırıldı |
| 0.8 | D1 şema v1 + migration | **Opus 5.5** 🔒 | 👤 review |
| 0.9 | sitemap/hreflang helper + llms/robots | **Haiku 5.5** | helper kod Sonnet'e devredilebilir |
| 0.10 | çıkış denetimi | **Haiku 5.5** | 👤 "devam et" |

### FAZ 1 — TR Site + Huni
| Adım | İş | Model | Not |
| :-- | :-- | :-- | :-- |
| 1.1 | KVKK rıza metni iskeleti | **Opus 5.5** ⚖️ | 👤 metin + onay |
| 1.2 | /ithalat hizmet sayfaları (4) | **Haiku 5.5** | şablon içerik |
| 1.3 | /ihracat hizmet sayfaları (3) | **Haiku 5.5** | şablon içerik |
| 1.4 | Çin ithalat rehber serisi (6, ≥1200 kelime) | **Sonnet 5.5** | uzun SEO (ucuz alt: Haiku 5.5) |
| 1.5 | TR frontend + sayfa bağlamları | **Sonnet 5.5** | |
| 1.6 | Başvuru formu + endpoint | **Opus 5.5** 🔒 | 👤 code review |
| 1.7 | Partner listeleme komponenti | **Haiku 5.5** | |
| 1.8 | Turnstile + rate-limit | **Sonnet 5.5** | |
| 1.9 | hreflang/sitemap enjeksiyonu | **Haiku 5.5** | ortak dosya tekeli |
| 1.10 | QA turu | **Haiku 5.5** | |
| 1.11 | çıkış + lansman ön kontrol | **Haiku 5.5** | 👤 onay + deploy |

### FAZ 2 — EN Global + Hacim
| Adım | İş | Model | Not |
| :-- | :-- | :-- | :-- |
| 2.1 | /en route + 5 hizmet | **Sonnet 5.5** | |
| 2.2 | ürün liste + kategori yapısı | **Sonnet 5.5** | |
| 2.3 | 20 ürün SEO/GEO sayfası (ilk üretim) | **Sonnet 5.5** | (ucuz alt: Haiku 5.5) · süreklisi FAZ 4'te 🟡 |
| 2.4 | industries (5) | **Sonnet 5.5** | (ucuz alt: Haiku 5.5) |
| 2.5 | varyant iskeletleri /en/{ru,fr,nl,es,ar} + RTL | kod **Sonnet 5.5** · içerik **Haiku 5.5 (ucuz)/Sonnet 5.5** | |
| 2.6 | görsel üretim turu | **Gemini görsel** 🟡 + **Haiku 5.5** (crop/manifest script) | ayar en sonda |
| 2.7 | komplex varyant layout (score 8) | **Opus 5.5** | tek karmaşık FE noktası |
| 2.8 | hreflang/sitemap/llms enjeksiyonu | **Haiku 5.5** | ortak dosya tekeli |
| 2.9 | QA turu | **Haiku 5.5** | |
| 2.10 | faz çıkışı | **Haiku 5.5** | 👤 onay |

### FAZ 3 — Admin + API (güvenlik ağırlıklı)
| Adım | İş | Model | Not |
| :-- | :-- | :-- | :-- |
| 3.1 | Cloudflare Access + admin auth | **Opus 5.5** 🔒 | 👤 Access kurulumu |
| 3.2 | Admin iskelet + Dashboard | **Sonnet 5.5** | salt-okunur dashboard |
| 3.3 | Lead Kanban (KVKK verisi) | **Opus 5.5** 🔒 | 👤 review |
| 3.4 | /api/v1 gateway + API key | **Opus 5.5** 🔒 (read endpoint: Sonnet) | 👤 key politikası |
| 3.5 | Partner CRUD + logo onay | **Opus 5.5** 🔒 | flywheel kapısı |
| 3.6 | İçerik Fabrikası UI | **Opus 5.5** 🔒 (rss okuma: Sonnet) | 👤 review |
| 3.7 | Analitik çekim cron + dashboard | **Sonnet 5.5** | 👤 OAuth |
| 3.8 | Turnstile/rate-limit admin + Ayarlar | **Sonnet 5.5** | config UI |
| 3.9 | staging/prod ayrımı + credential | **Opus 5.5** 🔒 | 👤 secret girişi |
| 3.10 | QA (güvenlik ağırlıklı) | **Sonnet 5.5** | |
| 3.11 | güvenlik insan review | **Haiku 5.5** (hazırlık) | 👤 imza |
| 3.12 | faz çıkışı | **Haiku 5.5** | 👤 onay |

### FAZ 4 — İçerik Fabrikası Otomasyonu (kod Claude, runtime Gemini)
| Adım | İş | Model | Not |
| :-- | :-- | :-- | :-- |
| 4.1 | RSS cron script | **Sonnet 5.5** | worker kodu |
| 4.2 | TTL silme + bakım cron | **Haiku 5.5** | basit SQL cron |
| 4.3 | Trends toplama | **Haiku 5.5** | pattern tekrarı |
| 4.4 | Batch özet/etiketleme pipeline | kod **Sonnet 5.5** · runtime özet **Gemini** 🟡 | ayar en sonda |
| 4.5 | Makale üretim akışı (ai_jobs→draft) | kod **Sonnet 5.5** · runtime üretim **Gemini** 🟡 | ayar en sonda |
| 4.6 | Onay→yayın otomasyonu (PR/edge) | **Sonnet 5.5** | ortak dosya |
| 4.7 | Hata izleme/fallback/kota | **Sonnet 5.5** | |
| 4.8 | Baidu hazırlık (sitemap placeholder) | **Haiku 5.5** | 👤 Baidu hesabı |
| 4.9 | QA | **Haiku 5.5** | |
| 4.10 | faz çıkışı | **Haiku 5.5** | 👤 onay + hız hedefi |

### FAZ 5 — ZH + DE
| Adım | İş | Model | Not |
| :-- | :-- | :-- | :-- |
| 5.1 | /de Impressum + Datenschutz | **Opus 5.5** 🔒⚖️ | 👤 veri + hukuk imzası |
| 5.2 | /zh iskelet + kimlik | kod **Sonnet 5.5** · içerik **Haiku 5.5 (ucuz)/Sonnet 5.5** | |
| 5.3 | /zh hizmet sayfaları | **Haiku 5.5 (ucuz)/Sonnet 5.5** · kontrol **Haiku** | |
| 5.4 | /de hizmet sayfaları | **Sonnet 5.5** (taslak: Haiku 5.5) | |
| 5.5 | /zh Baidu SEO | **Haiku 5.5** | 👤 doğrulama kodu |
| 5.6 | /de + /zh kod bağlamları | **Sonnet 5.5** | |
| 5.7 | dil kalite turu (çift kontrol) | **Sonnet 5.5** | 👤 zh kültür onayı |
| 5.8 | hreflang/sitemap enjeksiyonu | **Haiku 5.5** | ortak dosya |
| 5.9 | QA | **Haiku 5.5** | |
| 5.10 | hukuk/kültür imza | **Haiku 5.5** (hazırlık) | 👤 imza |
| 5.11 | faz çıkışı | **Haiku 5.5** | 👤 onay |

### FAZ 6 — Analitik + Raporlama
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

### FAZ 7 — Public API Sertleştirme
| Adım | İş | Model | Not |
| :-- | :-- | :-- | :-- |
| 7.1 | API sürümleme + sözleşme dondurma | **Opus 5.5** 🔒 | 👤 sözleşme onayı |
| 7.2 | Dış erişim güvenlik sertleştirme | **Opus 5.5** 🔒 | 👤 imza + WAF |
| 7.3 | API docs sitesi | içerik **Haiku 5.5** · sayfa kod **Sonnet 5.5** | |
| 7.4 | n8n / entegrasyon hazırlığı | **Sonnet 5.5** | |
| 7.5 | Performans/yük testi | test **Haiku 5.5** · düzeltme **Sonnet 5.5** | |
| 7.6 | .cn değerlendirme raporu | **Sonnet 5.5** | 👤 karar |
| 7.7 | QA | **Haiku 5.5** | |
| 7.8 | faz çıkışı | **Haiku 5.5** | 👤 onay |

### FAZ 8 — Lansman + Büyüme
| Adım | İş | Model | Not |
| :-- | :-- | :-- | :-- |
| 8.1 | Lansman denetimi (regresyon) | **Sonnet 5.5** | |
| 8.2 | Lansman | **Haiku 5.5** (koordinasyon) | 👤 tetikleme + DNS |
| 8.3 | Partner kampanyası materyal | **Haiku 5.5 (ucuz)/Sonnet 5.5** | 👤 hedef liste + İYS |
| 8.4 | İçerik ölçekleme | runtime **Gemini** 🟡 (FAZ 4 hattı) | ayar en sonda |
| 8.5 | Kanal operasyonları (çok dilli) | **Haiku 5.5 (ucuz)/Sonnet 5.5** | 👤 kanal hesapları |
| 8.6 | İlk partner yayına alma | **Haiku 5.5** | 👤 onay + eşleştirme |
| 8.7 | Büyüme deneyleri A/B | **Haiku 5.5** | 👤 karar |
| 8.8 | Operasyonel QA | **Haiku 5.5** | |
| 8.9 | faz çıkışı | **Haiku 5.5** | 👤 onay |

### FAZ 9 — Ölçekleme + Sürekli Optimizasyon
| Adım | İş | Model | Not |
| :-- | :-- | :-- | :-- |
| 9.1 | Maliyet optimizasyon motoru | **Sonnet 5.5** | analiz |
| 9.2 | Katman sınır izleme | **Sonnet 5.5** | 👤 geçiş kararı |
| 9.3 | Ölçekleme tetikleyicileri | **Sonnet 5.5** | 👤 uygulama |
| 9.4 | İçerik kalite denetimi | **Haiku 5.5** | |
| 9.5 | Güvenlik/uyum periyodik denetim | QA **Haiku 5.5** · düzeltme **Opus 5.5** 🔒 | 👤 revizyon |
| 9.6 | Agent/kural dosyaları evrimi | **Sonnet 5.5** | 👤 PR onayı |
| 9.7 | Aylık ritim | **Haiku 5.5** | |
| 9.8 | Yıllık değerlendirme | **Sonnet 5.5** | 👤 strateji |

---

## 8. Değişmez Kurallar

1. **Tek yürütücü:** Tüm işler Claude Code ile yapılır; çok-ajanlı/çok-sağlayıcılı yürütme yoktur.
2. **Model haritası dışına çıkılmaz:** Bir adım §7'deki modelle yapılır; değişiklik gerekirse önce bu dosya güncellenir, sonra iş yapılır.
3. **Tek scope / tek commit:** Bir adım yalnızca kendi agent-scope dizinlerine yazar; başka rolün işini aynı adımda yapmaz (§4).
4. **Güvenlik kilidi (pazarlıksız):** auth / admin / ödeme / KVKK-GDPR / hukuki metin = **Opus 5.5 + insan review**. Hiçbir koşulda daha düşük modele indirilemez.
5. **Sıralı yürütme:** Scope'u kesişen adımlar sıralı yapılır; ortak dosyalara yalnızca orchestrator-rolü yazar (§5).
6. **Runtime AI = yalnızca Gemini**, ayarı en sonda (§3, §9). O ana kadar stub/mock.
7. **İnsan noktaları atlanmaz:** §6'daki her 👤 noktasında iş durur, sana bildirilir, onay/girdi beklenir.
8. **Deterministik iş AI'dan geçmez:** sitemap/hreflang/RSS parse/TTL silme = script (Haiku ile yazılır ama çalışması deterministiktir, model çağırmaz).

---

## 9. EN SONDA Yapılacak Ayarlar (Gemini entegrasyonu)

Tüm fazların kodu runtime AI çağrılarını **stub** ile hazır bekletir. Proje sonunda tek seferde:

1. **Gemini API anahtarı** al (Google AI Studio / Vertex) → GitHub Secrets + Cloudflare Secrets'a gir (👤).
2. **Model adlarını sabitle:** metin üretimi için yeni Gemini metin modeli, hızlı özet için hızlı varyant, görsel için `gemini-*-image`. Adlar burada güncellenir.
3. **Stub'ları gerçek çağrıyla değiştir:** FAZ 4.4, 4.5, 6.3 (metin) + 2.6 (görsel) runtime çağrıları.
4. **Prompt injection taraması + kota/fallback testi** (FAZ 4.7 altyapısı) çalıştırılır.
5. Maliyet izleme ledger'a bağlanır (FAZ 9.2).

> Bu adıma kadar hiçbir harici AI anahtarı gerekmez — tüm geliştirme Claude Code aboneliğiyle yürür.
