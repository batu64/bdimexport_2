# FAZ_3 QA Raporu (Step 3.10) — güvenlik ağırlıklı
**Tarih:** 2026-10-18 | **Denetleyen:** Claude Code (Sonnet 5.5) | **Kaynak:** FAZ_3_AJAN_PANOSU.md §3 Step 3.10
**Ön koşul:** 3.1–3.9 kod ✅ (3.9: staging kuruldu; production go-live + Access canlı testi ertelendi → ERTELENEN_GOREVLER E1/E2 → §C, bloklamaz).
**Kural:** kanıtsız pass yok. Her satır ya yeniden koşulabilir bir komuta ya da `qa/FAZ-3/evidence/` altındaki çıktıya bağlıdır.
**Kapsam notu:** QA, geliştiricinin kendi testlerini yalnız regresyon olarak koştu; aşağıdaki sonuçların çoğu QA'nın **bağımsız** yazdığı paketlerden gelir (gerçek handler + gerçek JWT + gerçek SQL).

---

## 0. ÖZET

| Soru | Cevap |
| :-- | :-- |
| **Kritik bulgu var mı?** | **HAYIR — 0 kritik.** Çıkışı doğrudan engelleyen güvenlik bulgusu yok. |
| Yüksek | **1** — F-01 (ifşa olan Cloudflare token + R2 anahtarı hâlâ rotasyonsuz; kod değil, operasyon; sizin ertelemeniz) → **3.11 imzasından önce kapatılması önerilir** |
| Orta | 1 — F-02 (admin-internal key API'den üretilebiliyor) |
| Düşük / Bilgi | F-03 … F-09 (7 madde) |
| Sonuç sayımı | **160 dev testi (regresyon) 160/160 ✅ · 25 QA testi: 22 geçti + 3 bilinen bulguyu belgeleyen todo/expected-fail (kırmızı 0) · 4 tarama (2 temiz, 2 bilinen bulgu üretiyor) · staging smoke 13/13 ✅** |
| Beklenmeyen kırmızı | **0** |

`node qa/FAZ-3/run-all.mjs --smoke` → `TOPLAM: 190 · geçti 185 · KIRMIZI 0 · bilinen bulgu 5` (`evidence/run-all.txt`).
*(190 = 160 dev + 25 QA test + 5 betik [4 tarama + smoke]; smoke kendi içinde 13 kontrol, QA matris testi 77 hücre, SQLi fuzz 374 istek, CORS 91 hücre.)*

---

## A. GÜVENLİK BULGULARI (ayrı bölüm)

Şiddet: **Kritik** = çıkışı engeller · Yüksek = imza öncesi kapat · Orta = FAZ 7'den önce kapat · Düşük/Bilgi = izle.

| # | Şiddet | Bulgu | Kanıt | Öneri / sahip |
| :-- | :-- | :-- | :-- | :-- |
| **F-01** | **Yüksek** (operasyonel; kodda değil) | Sohbette ifşa olan **Cloudflare API token + R2 Secret Access Key** hâlâ geçerli (ERTELENEN **S1**). Ayrıca yerelde ignore'lu `keys.md` (373 bayt) var — git'te izlenmiyor/geçmişte yok (✔), ama diske düz metin gizli dosya. | `ERTELENEN_GOREVLER.md` S1 ⏳; `evidence/secret-scan.txt` (keys.md IGNORE, izlenmiyor; içerik OKUNMADI) | 👤 Token + R2 anahtarını **rotasyona al** (panelden iptal → yeni değer → `wrangler secret put`), 3.11 imzasından önce. `keys.md` parola yöneticisine taşınsın / senkron (OneDrive vb.) dışında kalsın. |
| **F-02** | **Orta** | **`admin-internal` tier'ının "dışarıya ASLA verilemez" kuralı (fazlar/FAZ_7.md) teknik olarak zorlanmıyor:** `POST /v1/keys` şeması `tier=admin-internal` kabul ediyor → ele geçirilmiş **tek** admin-internal key kalıcı yeni admin key üretebilir; kural OpenAPI'de de yazılı değil. | `api-qa.test.mts` › `it.fails("F-02 …")` (bugün 201 dönüyor); `workers/api/src/keys.ts:createSchema` | admin-internal üretimini yalnız bootstrap script (`scripts/new-key.mjs`) veya Access'li admin yoluna kısıtla; `POST /v1/keys` tier'ı `read-only|partner` ile sınırla; kuralı `docs/openapi/v1.yaml`'a yaz. **Not:** 3.4 key politikası insan onaylıydı — bu kararın bilinçli olup olmadığını teyit edin. Sahip: api adımı / FAZ 7.2. |
| **F-03** | Düşük (yalnız staging/dev) | **mock-produce audit atomik değil:** `seedMockDraftForJob` (`ai_jobs`+`contents`) ayrı `db.batch`, audit (`writeAudit`) ayrı batch → audit düşerse mutasyon kalır. Prod'da uç 404 (`CONTENT_MOCK_PRODUCE` tanımsız). | `audit-scan.mjs` → 2 KAPSAMSIZ (`service.ts:236,243`); `audit-behavior.test.mjs` › `todo F-03` gerçek SQL'de reprodüksiyon (draft kalıyor) | Mock'u `withAudit` içine al ya da mock'u FAZ 4'te gerçek üretimle değiştir. |
| **F-04** | Düşük (geçici, E2) | Production `ALLOWED_ORIGINS` / `TURNSTILE_HOSTNAMES` içinde `bdimexport.pages.dev` var → "yalnız bdimexport.com origin'leri" hedefiyle çelişir (custom domain gelene kadar bilinçli geçici). | `api-qa.test.mts` › `it.fails("F-04 …")`; `workers/api/wrangler.toml` (prod vars) | E2 (custom domain) ile **aynı anda** pages.dev'i sil. FAZ 8 lansman kontrol listesine ekli. |
| **F-05** | Düşük (doküman) | Secret envanteri 3 ad eksik: `TURNSTILE_ACTION_APPLY` (var, public, varsayılanlı), `GA4_PROPERTY_ID` (cron-analytics, var), `GLM_API_KEY` (v1 kalıntısı; yalnız **devre dışı** `weekly-report.yml`'de, FAZ 6.4'te yeniden yazılacak). Hayalet kayıt yok. | `evidence/env-crosscheck.txt` | Envantere 2 satır ekle; `GLM_API_KEY` GitHub Secrets'ta tanımlıysa **sil** (sağlayıcı v2.0'da kaldırıldı). Sahip: orchestrator/docs. |
| **F-06** | Bilgi (boşluk, güvenlik değil) | **Admin router eksik bağlı:** worker `routeAdmin` yalnız `/me` ve `/dashboard/summary` sunuyor. leads / partners / content / settings / analytics / rate-limits **handler'ları yazılı ve test edilmiş ama hiçbir route'a bağlı değil** → bu uçlar canlıda yok. Ayrıca UI `NEXT_PUBLIC_ADMIN_API_BASE` varsayılanı `/api/admin`, worker öneki `/admin/api` → env girilmezse UI hep 404 alır (envanter §3 bunu uyarıyor). | `workers/api/src/admin.ts` (yalnız 2 rota); `app/admin/_lib/api.ts:5`, `app/admin/settings/SettingsForm.tsx` | Tek "api router bağlama" adımı (3.3/3.5/3.6/3.8'in panoda zaten "takip" diye geçen işi). Bağlanınca **bu rapordaki matris router seviyesinde yeniden koşulmalı** (aşağıda §B-1 not). |
| **F-07** | Bilgi (derinlik) | `audit.ts redact()` hassas-anahtar regex'i (`pass|secret|token|api key|authorization`) ayarlar şemasının secret reddinden dar (`private|credential|bearer|signing|webhook_url` yok). Bugün erişilebilir bir sızıntı yolu yok (ayarlar secret'ı zaten reddediyor; lead audit'e değer yazılmıyor). | `app/admin/audit.ts`, `settings/schema.ts` | `SENSITIVE_KEYS`'i şemadaki `SECRET_KEY_RE` ile hizala. |
| **F-08** | Bilgi (belgeli sınır) | KV sabit-pencere rate limit **atomik değil** (yoğun paralelde birkaç istek aşılabilir); read-only/partner key revoke'u **diğer colo'larda ≤60 sn** gecikebilir (admin-internal cache'siz → anında). İkisi de kodda ve onaylı politikada belgeli. | `api-qa.test.mts` rate-limit paketi; `admin-keys.test.ts` "BİLİNEN SINIR" | Sert garanti gerekirse Durable Object / Workers Rate Limiting binding (FAZ 7). |
| **F-09** | Bilgi | **`gitleaks` ikilisi bu makinede yok** → yerel tarama eşdeğer kural setiyle yapıldı (§B-6). Asıl kapı CI: `qa-gate.yml` `gitleaks-action@v2`, `fetch-depth: 0` (tam geçmiş). CI'da `ACCESS_AUD` (public, 64 hex) ve `KVKK_V1_SHA256` yanlış-pozitif verebilir. | `evidence/secret-scan.txt` | CI'da kırmızı çıkarsa `.gitleaks.toml` allowlist'ine bu iki **public** değeri ekle. |

**Bulunmayan (denendi, temiz):** SQL injection (0 etkili payload) · ham key/hash sızıntısı · CORS bypass (13 origin) · yetkisiz admin erişimi (77 hücre) · audit'siz mutasyon (1 istisna: F-03) · secret kodda/geçmişte (0) · PII'nin audit'e/listeye sızması · KVKK rızasız partner onayı · consent_logo_en'in admin tarafından değişmesi · draft→published atlaması.

---

## B. TEST SONUÇLARI (talimat başlıklarına göre)

### B-1. Yetkilendirme — guard + admin rota rol matrisi ✅
- **Guard birim testleri (dev, regresyon):** `app/admin/e2e/access.test.mjs` **14/14** — Access'siz 401; çöp/imzasız/`alg:none`/HS256/yanlış anahtar/kurcalı payload/expire/yanlış aud-iss → 403; allowlist dışı 403; viewer yalnız GET; yapılandırma eksik/JWKS erişilemez → 403 (**fail-closed**). `workers/api/test/admin-keys.test.ts` guard grubu (5 test) aynı sözleşmeyi worker katmanında doğruluyor.
- **QA matrisi (bağımsız):** `qa/FAZ-3/authz-matrix.test.mjs` — 11 admin handler rotası × 7 kimlik = **77 hücre, 77/77 ✅**. Gerçek RS256 JWT + gerçek guard. Kanıt kuralı: reddedilen kimlikte **DB/KV probe sayacı 0** (guard her zaman veriden önce); admin hücrelerinde handler gerçekten DB'ye ulaşıyor.

| Rota | anon | çöp token | expire JWT | yanlış aud | allowlist dışı | viewer | admin |
|---|---|---|---|---|---|---|---|
| leads GET liste | 401 | 403 | 403 | 403 | 403 | 403 | ✅ izin |
| leads POST status | 401 | 403 | 403 | 403 | 403 | 403 | ✅ izin |
| leads POST reveal (PII) | 401 | 403 | 403 | 403 | 403 | 403 | ✅ izin |
| partners GET liste | 401 | 403 | 403 | 403 | 403 | 403 | ✅ izin |
| partners POST approve | 401 | 403 | 403 | 403 | 403 | 403 | ✅ izin |
| content GET drafts | 401 | 403 | 403 | 403 | 403 | 403 | ✅ izin |
| content POST drafts/approve | 401 | 403 | 403 | 403 | 403 | 403 | ✅ izin |
| settings GET | 401 | 403 | 403 | 403 | 403 | 403 | ✅ izin |
| settings PUT | 401 | 403 | 403 | 403 | 403 | 403 | ✅ izin |
| analytics GET | 401 | 403 | 403 | 403 | 403 | 403 | ✅ izin |
| rate-limit görünümü GET | 401 | 403 | 403 | 403 | 403 | 403 | ✅ izin |

  Ek: `ACCESS_AUD` / `ADMIN_EMAILS+VIEWER_EMAILS` / `ACCESS_TEAM_DOMAIN` boşken **admin bile 403** (11 rota × 3 bozuk yapılandırma = 33 hücre, DB'ye dokunulmadı).
- **Worker router (`/admin/api/me`, `/dashboard/summary`):** 3.4'ün `admin-keys.test.ts`'i (token yok → 401 ve **olmayan yol da 401** = rota keşfi yok; viewer mutasyon 403) + staging smoke (§B-7) ✅.
- ⚠️ **Sınır (F-06):** matris **handler seviyesinde**. Worker router'a bağlanmayan uçlar için "Access edge → router → handler" zinciri henüz test edilemez; bağlanınca matris router üzerinden tekrar koşulmalı.
- **Viewer politikası:** tüm admin **modül** uçları viewer'a kapalı (yalnız Dashboard özetini `/dashboard/summary` okur — 3.2 kuralıyla birebir; UI tarafı `nav.test.mjs` 7/7).

### B-2. Audit bütünlüğü ✅ (1 bilinen bulgu: F-03)
**Kod taraması** (`audit-scan.mjs`, `evidence/audit-scan.txt`): repodaki **19 D1 yazma noktası** → 15 `withAudit/writeAudit` kapsamlı · 2 gerekçeli istisna (public başvuru formu `apply.ts`; sistem cron'u `sync.ts`) · **2 kapsamsız = F-03** (staging mock).

**Davranış kanıtı** (`audit-behavior.test.mjs`, gerçek handler + gerçek SQL, migration 0001–0003): **9/9 ✅ + 1 todo (F-03)**

| Aksiyon | Kanıt |
| :-- | :-- |
| lead status geçişi | `lead_status_change` satırı: actor = admin e-postası, eski/yeni `{status}`; **bayat `from` → 409 + audit satırı YOK** |
| maske açma (PII reveal) | `lead_pii_reveal` satırı yazılır; **audit'te PII DEĞERİ yok** (e-posta/telefon aranıp bulunmadı, yalnız alan adları); liste yanıtı ham e-posta/telefon **içermiyor**; viewer 403 + iz yok |
| **audit düşerse** | `admin_actions`'a INSERT'i reddeden tetikleyici ile: reveal **veri DÖNMÜYOR**, status geçişi **geri alınıyor** (mutasyon+audit atomik) |
| partner onay/red | `approve_partner` / `reject_partner` (gerekçe zorunlu, audit'te); KVKK rızasız onay **422 + iz yok**; çift onay **409 + ikinci iz yok** |
| `consent_logo_en` | PATCH ile **değişmiyor** (400, değer ve audit değişmez); `approved` de PATCH'ten set edilemiyor; viewer onaylayamaz |
| içerik | draft→published **doğrudan olmuyor**; approve + publish ayrı ve ikisi de audit'li (**onay ≠ yayın**) |
| ayarlar | `update_setting` (eski/yeni); secret içeren 4 farklı istek **422 + ayar/audit yok**; viewer 403 |
| key create / revoke | `create_key` / `revoke_key` atomik, actor `api_key:<id>`, ham key/hash audit'te yok, **çift revoke → tek audit**, audit yazılamazsa key de oluşmaz (`admin-keys.test.ts`, regresyon ✅) |
| append-only | `admin_actions` UPDATE ve DELETE → `append-only` hatası (tetikleyici) |
| CSRF | lead/partner/content mutasyonları `application/x-www-form-urlencoded` ile **415**, mutasyon ve audit yok |

### B-3. API key yaşam döngüsü ✅
`api-qa.test.mts` (vitest, QA) + `workers/api/test/{keys-read,admin-keys}.test.ts` (dev, 66/66 regresyon):
- **Hash-only:** 3 key üretildi; **tüm tabloların tüm satırları** ve **tüm KV dökümü** tarandı → ham key **hiçbir yerde yok**; `key_hash` hepsi 64-hex SHA-256; key biçimi `bdx_`+43 karakter (256 bit).
- **Timing-safe karşılaştırma:** kasıtlı olarak *karşılaştırma yok* — ham key hiç karşılaştırılmaz, SHA-256'sının **D1 indeks araması** yapılır (zamanlama önimaj bilgisi vermez; `auth.ts` gerekçesi). Statik tarama: `workers/api/src/*.ts` + `middleware.ts` içinde secret/token/hash/key üzerinde `===`/`==` **yok**; JWT imzası `crypto.subtle.verify` (sabit zamanlı); `cron-analytics` `/sync` token'ı sabit-zamanlı XOR döngüsüyle.
- **Revoke → KV invalidation:** cache'li read-only key revoke sonrası **KV `ak:<hash>` girdisi siliniyor + anında 401**; admin-internal revoke her colo'da anında (cache yok).
- **admin-internal asla cache'lenmez:** admin key kullanıldıktan sonra KV'de `ak:` girdisi **yok**; enjekte edilmiş cache girdisine güvenilmiyor (dev testi).
- **Tier matrisi (4 uç × 4 kimlik = 16 hücre, hepsi beklenen):**

| Uç | anahtarsız | read-only | partner | admin-internal |
|---|---|---|---|---|
| GET /contents (public) | 200 | 200 | 200 | 200 |
| GET /partners | 401 | 200 (PII yok) | 200 (PII yok) | 200 (tüm alanlar) |
| GET /leads | 401 | 403 | 403 | 200 |
| GET /keys | 401 | 403 | 403 | 200 |
| DELETE /keys/:id | 401 | 403 | 403 | 404 (yetkili, kayıt yok) |

  read-only/partner `/partners` yanıtında onaysız partner, `tax_id`, iletişim, katalog, rızasız logo **yok** (içerik taraması).
- **Brute-force freni:** biçim dışı 6 key (kısa/uzun/yanlış karakter/`' OR '1'='1`) → 401; eşik sonrası IP **429**.
- ⚠️ **"admin-internal dış API'ye verilemez" kuralı → F-02 (Orta):** kural dokümanda var, **kodda zorlanmıyor**.

### B-4. CORS matrisi · rate limit · SQL injection ✅
- **CORS (QA, 91 hücre):** izinli 2 origin → ACAO origin'i **yansıtır (`*` değil)**, `allow-credentials` **yok**, `Vary: Origin`, preflight 204. **Izinsiz 13 origin** (http, evil.com, `bdimexport.com.evil.com`, `evilbdimexport.com`, alt alan adı, `:8443`, büyük harf, sondaki `/`, `null`, pages.dev, staging, `file://`, `%2e` hilesi) × 6 yol + preflight → hepsi **403, ACAO yok, DB değişmedi**. Origin başlıksız (curl) CORS'a takılmaz, key/Access koruması geçerli. *(Production `ALLOWED_ORIGINS`'te pages.dev → F-04.)*
- **Rate limit:** public `GET /contents` **60/dk → 61. istek 429** (`retry-after` 1–60 sn, hata kodu `rate_limited`), başka IP etkilenmez · genel IP freni **121. istek 429** · key bazlı limit (`rate_limit=3` → 200,200,200,429,429) · geçersiz/0/negatif/boş limit değişkeni → varsayılana düşer, **limit kapanmaz** (4 durum). Dev: apply 5/dk, bad-auth 20/dk, 60 sn pencere sıfırlama (`turnstile-ratelimit.test.ts`, regresyon ✅).
- **SQL injection fuzz (davranışsal):** **18 payload** (`' OR '1'='1`, `'; DROP TABLE leads;--`, UNION key_hash, NUL, emoji, 500 karakter, `PRAGMA writable_schema`, `UPDATE partners SET approved=1`, …) × **query / path / header / JSON gövde / form** → **374 istek, 0 adet 5xx** (durumlar: 200:78, 201:102, 400:108, 401:50, 404:36). Sonra: **şema birebir aynı**, tablo satır sayıları aynı (apply ile eklenenler hariç), **hiçbir partner enjeksiyonla onaylanmadı**, **hiçbir key revoke olmadı**, yanıtlarda **`key_hash` / `sqlite_master` / ham DB hatası yok**; enjeksiyon metni apply formunda **literal saklandı, çalıştırılmadı**.
- **Parametrize sorgu teyidi (statik, `sqli-static-scan.mjs`):** SQL içeren **17 şablon dizesi, 22 `${}` noktası → 22/22 sabit / beyaz liste / `?` yer tutucu**, gerekçesiz **0** (tablo: §E). Bind edilmeyen kullanıcı girdisi yok; `+` ile SQL birleştirme 0.

### B-5. Ayarlar secret reddi ✅ (3.8 kabulünün QA doğrulaması)
7 ayar anahtarının **hepsinde** secret alanı (`TURNSTILE_SECRET`, `apiKey`, `url`…) → 422/ValidationError, ayar ve audit yazılmıyor (dev `settings.ext.test.mjs` 15/15 + QA `audit-behavior` #7). GET yanıtı secret **değerini** dönmüyor (yalnız "tanımlı mı" bayrağı).

### B-6. Secret taraması + envanter çapraz kontrol ✅ (F-05, F-09)
- **Tarama** (`secret-scan.mjs`, `evidence/secret-scan.txt`; gitleaks eşdeğeri 16 kural): **çalışma ağacı 340 dosya / 37.427 satır + tüm geçmiş 88 commit (tüm dallar) / 39.480 eklenen satır → açıklanmamış bulgu 0.** 7 gerekçeli istisna grubu (public `ACCESS_AUD`, yayımlı KVKK sürüm özeti, kasıtlı sahte test değerleri) — hepsi çıktıda sayılı ve gerekçeli. Yerel ignore'lu gizli dosyalar (`keys.md`, `keys.txt`, `.env.local`) **izlenmiyor**, içerikleri **okunmadı**.
- **Çapraz kontrol** (`env-crosscheck.mjs`): kod **36 değişken adı** okuyor, envanter 32 ad içeriyor → **hayalet kayıt 0**; **eksik kayıt 3** (F-05). Ertelenen adların (`GEMINI_API_KEY`, `RESEND_API_KEY`, `BREVO_API_KEY`) kodda gerçekten **referansı yok** (envanterin iddiası doğru). Secret hijyeni: `NEXT_PUBLIC_*` altında secret yok (taramada `NEXT_PUBLIC_` değerleri yalnız URL/site-key).
- ⚠️ gitleaks ikilisi yok → **CI'daki `gitleaks-action` ayrıca yeşil olmalı** (F-09).

### B-7. Staging salt-okuma smoke ✅ **13/13** (bu oturumdan koşuldu — ağ erişimi vardı)
Hedef `https://bdimexport-api-staging.banazcepte.workers.dev`; **yalnız GET/OPTIONS**, ~13 istek. Sonuç (`evidence/staging-smoke.txt`): health 200 + `nosniff` · `/contents` anahtarsız 200 ve **draft yok** · `/partners` `/leads` `/keys` anahtarsız **401**, geçersiz key 401 · `/admin/api/me` JWT'siz **401**, sahte JWT **403** (fail-closed), `/dashboard/summary` JWT'siz 401 · CORS izinsiz origin **403 ve ACAO yok**, izinli staging origin preflight **204 + ACAO yansıyor** · bilinmeyen rota **404, yığın izi yok**.
Yeniden koşmak: `node qa/FAZ-3/staging-smoke.mjs` (`STAGING_URL=…` ile başka hedef; yazma yok).
**Sınır:** staging'in **Access app'i/AUD'u yok** (bilinçli boş → admin API fail-closed) → **geçerli Access JWT ile staging admin e2e yapılamaz**; admin akışları yalnız handler/birim düzeyinde kanıtlı (§B-1, §B-2).

---

## C. FAZ 8'E DEVREDİLEN CANLI DOĞRULAMALAR (bloklamaz; "canlıda FAZ 8")

| # | Doğrulama | Neden şimdi yapılamıyor | Kaynak | Ne zaman |
| :-- | :-- | :-- | :-- | :-- |
| C-1 | **Gerçek Access JWT ile canlı admin girişi** (gizli pencere → Google login → `/admin` ve `/admin/api/me` → 200) | Google login `ERR_CONNECTION_RESET` (E1); staging'de Access app yok | E1 | custom domain + Google IdP sonrası (FAZ 8) |
| C-2 | **Custom domain bdimexport.com → Pages** + Access'i yeni domaine taşıma + **CORS/Turnstile'dan `bdimexport.pages.dev`'i silme (F-04)** | Domain bağlı değil | E2 | FAZ 8 lansman öncesi |
| C-3 | **Production go-live:** prod secret'lar (`TURNSTILE_SECRET`, `ADMIN_EMAILS`, `VIEWER_EMAILS`), prod worker deploy, **prod'a salt-okunur smoke** (`staging-smoke.mjs` aynı set; yazma yok), prod D1/R2 izolasyon teyidi | Prod go-live ertelendi | 3.9 → E1/E2 | FAZ 8.2 |
| C-4 | **Router bağlama sonrası** matrisin worker üzerinden + staging'de gerçek JWT ile yeniden koşumu (F-06) | Uçlar henüz bağlı değil | pano takip notu | api adımı sonrası |
| C-5 | **Analitik: 1 gün gerçek veri** (GSC/GA4/Meta credential + `analytics_daily`'de 1 satır) | Trafik/property yok | E4 | FAZ 6 |
| C-6 | **Mail provider** (Resend/Brevo) secret + bildirim e-postası | Kod henüz yok | E5 | FAZ 8 |
| C-7 | **R2 `bdimexport-backups`:** private teyidi + 90 gün lifecycle | Dashboard işi | E6 | yakında |
| C-8 | **Lead saklama süresi (365 gün) + otomatik silme cron** | KVKK metniyle eşitlenecek | C3 | FAZ 4 |
| C-9 | **KVKK rıza metni placeholder'ları** (adres/e-posta) | Gerçek şirket verisi | C2 | form canlıya çıkmadan (FAZ 8 öncesi) |
| C-10 | **Lighthouse ≥90 canlı ölçüm** | Canlı URL gerekir | C5 | FAZ 8.1 |
| C-11 | **Partner onay → `/en/suppliers`'ta görünür uçtan uca** (3.5 kabulü, 3.12 kriteri) | Onay ucu router'a bağlı değil + public partner listesi statik export (`_partners.json`) — D1→site yayın hattı yok | F-06 + FAZ 4 | router + yayın hattı sonrası |

---

## D. AÇIK KOD İŞLERİ (QA'nın bulduğu; faz çıkışından önce karar gerekir)
1. **F-06 router bağlama** — tek api adımı; bağlanmadan 3.12 kriterlerinden *[Kanban+kanal tek-tık]*, *[Partner onay uçtan uca]*, *[İçerik Fabrikası A/B/C+draft]* canlıda kanıtlanamaz (handler seviyesi kanıtlı).
2. **F-02** admin-internal üretim kısıtı (karar + küçük kod).
3. **F-03, F-05, F-07** küçük temizlik.
4. `docs/openapi/` (v1.yaml + README) hâlâ **commit'siz** (`git status`: `??`). `0003_settings.sql` commit'li (`b0e9c37`) ✔ — önceki panodaki "commit'siz" notu artık geçersiz.

---

## E. EK — SQL enterpolasyon sınıflandırması (`sqli-static-scan.mjs` çıktısının özeti)
| Dosya | Enterpole parça | Neden güvenli |
| :-- | :-- | :-- |
| `leads/handler.ts` | `COLS`, `LIST_LIMIT`, `where…` | sabit kolon listesi / sayısal sabit / yalnız `status = ?` + `k = ?` (k ∈ sabit 3'lü dizi); değerler `.bind()` |
| `partners/handler.ts` | `PARTNER_COLS`, `REJECTED_EXPR`, `where`, `LIST_LIMIT` | modül sabitleri; `where` 4 sabit dizeden biri, `status` `LIST_STATUSES` beyaz listesinden |
| `partners/handler.ts` (PATCH) | `set.join` / `${col} = ?` | `col` yalnız `EDITABLE = [sector, certs, capacity, export_history]`; `FORBIDDEN`/bilinmeyen alan 400 (testli) |
| `content/service.ts` | `set`, `inList(ids)` | `set` 2 sabit dizeden biri; `inList` yalnız `?,?,?` üretir, id'ler bind + `ID_RE` |
| `workers/api/src/read.ts` | `cols`, `statuses.map(()=>"?")`, `AND locale = ?`, `AND id > ?`, `where` | tier'a göre 2 sabit kolon listesi; yalnız yer tutucu; değerler bind |
| `audit.ts` | `AUDIT_COLS` | sabit INSERT başlığı |

---

## F. 3.12 ÇIKIŞ KRİTERLERİ — QA KANIT EŞLEMESİ (bilgi; işaretleme 3.12'nin)
| Kriter | QA durumu |
| :-- | :-- |
| Access'siz /admin 403 | ✅ kod (77 hücre + staging smoke 401/403) · canlı edge testi → C-1 |
| Kanban + kanal tek-tık | ✅ handler/lib (`leads.test.mjs` 12/12 + audit-behavior) · canlıda router gerekir (F-06) |
| Partner onay → /en/suppliers uçtan uca | ◐ onay/red/rıza/audit ✅ · "sitede görünür" hattı yok → C-11 |
| API key yaşam döngüsü | ✅ üret→kullan→limit→revoke→401 + hash-only + tier (B-3) |
| İçerik Fabrikası A/B/C + draft | ✅ handler/servis (`content*.test.mjs` 14/14 + onay≠yayın) · canlıda router gerekir |
| Analytics 1 gün veri | ⏳ ertelendi → C-5 (kod + boş-durum ✅) |
| Audit bütünlüğü | ✅ (F-03 staging-only istisna) |
| Staging e2e | ◐ salt-okunur smoke 13/13 ✅ · Access'li admin e2e staging'de mümkün değil (AUD yok) |
| Secret envanteri + prod izolasyonu | ◐ envanter çapraz kontrol: hayalet 0, eksik 3 (F-05) · prod izolasyonu config düzeyinde ayrık (ayrı D1/KV/R2 id'leri, `CONTENT_MOCK_PRODUCE` prod'da yok) — canlı teyit C-3 |
| gitleaks | ✅ yerel eşdeğer tarama 0 bulgu · CI gitleaks ayrıca yeşil olmalı (F-09) |
| 3.11 imza | 👤 (F-01 öncesi önerilir) |

---

## G. NASIL YENİDEN KOŞULUR
```bash
node qa/FAZ-3/run-all.mjs --smoke        # tüm paketler + sayım tablosu (smoke ağ ister)
node --experimental-strip-types --test qa/FAZ-3/authz-matrix.test.mjs qa/FAZ-3/audit-behavior.test.mjs
pnpm --dir workers/api exec vitest run --config ../../qa/FAZ-3/vitest.api.config.mjs
node qa/FAZ-3/audit-scan.mjs ; node qa/FAZ-3/sqli-static-scan.mjs ; node qa/FAZ-3/secret-scan.mjs ; node qa/FAZ-3/env-crosscheck.mjs
node qa/FAZ-3/staging-smoke.mjs
```
Beklenen çıkış kodları bugün: `audit-scan` **1** (F-03), `env-crosscheck` **1** (F-05), diğerleri **0**. Bulgular kapatılınca bu ikisi 0'a, `it.fails` testleri (F-02/F-04) ve `todo` (F-03) normal teste çevrilir.
Kanıt dosyaları: `qa/FAZ-3/evidence/` (`run-all.txt`, `audit-scan.txt`, `sqli-static-scan.txt`, `secret-scan.txt`, `env-crosscheck.txt`, `staging-smoke.txt`, `authz-matrix.md`, `node-qa-tap.txt`).
