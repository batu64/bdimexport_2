# FAZ_4 QA Raporu (Step 4.9) — otomasyon güvenilirliği
**Tarih:** 2026-10-27 | **Denetleyen:** Claude Code (Opus 5.5 — 27.10 kararı) | **Kaynak:** FAZ_4_AJAN_PANOSU.md §3 Step 4.9 · fazlar/FAZ_4.md Step 4.9
**Ön koşul:** 4.1–4.8 kod ✅ (4.8 Baidu hesabı ertelendi → E9).
**Kural:** kanıtsız pass yok. Her satır yeniden koşulabilir bir komuta ya da `qa/FAZ-4/evidence/` altındaki çıktıya bağlıdır.
**Runtime AI notu:** gerçek Gemini çağrıları **STUB** (ERTELENEN E3). Aşağıdaki "model" geçen her test mock/stub modelle koşar → **gerçek Gemini davranışı (çıktı kalitesi, 429 biçimi, gecikme) runtime E3'te doğrulanacak.**
**Kapsam notu:** geliştiricinin kendi testleri yalnız regresyon olarak koşuldu; aşağıdaki sonuçlar QA'nın **bağımsız** yazdığı paketlerden gelir (gerçek kod + gerçek migration'larla gerçek SQL + sahte ağ/GitHub).

---

## 0. ÖZET

| Soru | Cevap |
| :-- | :-- |
| **Kritik bulgu var mı?** | **HAYIR — 0 kritik, 0 yüksek, 0 orta.** |
| Düşük / Bilgi | F4-01 … F4-04 (4 madde; hiçbiri çıkışı engellemez) |
| Onaysız yayın negatif testi | **TEMİZ** — bilinen 17 zorlama çağrısının hepsi reddedildi; mutasyonla kanıtlı (§3) |
| Sonuç sayımı | `node qa/FAZ-4/run-all.mjs` → **TOPLAM 194 · geçti 194 · KIRMIZI 0** (`evidence/run-all.txt`) |
| FAZ-3 güvenlik regresyonu | `node qa/FAZ-3/run-all.mjs` → **209 · geçti 205 · KIRMIZI 0 · bilinen bulgu 4** (F-02 artık kalıcı yeşil kapı; `evidence/regression-faz3-run-all.txt`) |
| Secret taraması | **0 açıklanmamış bulgu** (`evidence/secret-scan.txt`; gitleaks ikilisi bu makinede yok → eşdeğer kural seti, CI'daki gitleaks-action asıl kapı) |
| Beklenmeyen kırmızı | **0** |

*(194 = 179 dev testi [api 84 · cron-rss 73 · cron-trends 8 · cron-analytics 14] + 13 QA FAZ-4 testi + 2 betik [statik kontroller 13/13 iddia · FAZ-3 run-all].)*

---

## 1. KABUL MATRİSİ (Step 4.9 test listesi → kanıt)

| # | İstenen test | Sonuç | Bağımsız QA testi / kontrol | Kanıt |
| :-- | :-- | :-- | :-- | :-- |
| 1 | **Tam hat e2e** (haber→özet→üretim→draft→onay→yayın), **her iki yol** | ✅ 3/3 | `pipeline-e2e.test.mts`: (a) mock taslak HİÇBİR yoldan yayına çıkamaz (güvenlik kemeri) · (b) KALICI: RSS → özet → Input B → stub-gemini taslak → onay (public'te YOK) → PR (`content/en/global/insights/`) → merge olmadan "yayınlandı" RED (`pr_not_merged`) → merge → `live` + public'te VAR; audit sırası `create_draft → approve_content → publish_pr_opened → publish_content` · (c) GEÇİCİ: Input A news_card → onay → edge → `?page_type=news_card` anında, PR yok, `publications.kind=edge` | `evidence/qa-suite.txt` |
| 2 | **TTL doğruluğu (3 gün)** | ✅ | `expires_at − fetched_at = 72 s` (tam); bakım 71. saatte TUTAR, 73. saatte SİLER + `ttl_purge` audit | `qa-suite.txt` · mutasyon M3 |
| 3 | **Dedup (RSS + Trends)** | ✅ 2/2 | RSS: aynı feed ×2 + `utm_*`'li aynı URL + iki kaynakta aynı URL → **tek satır** · Trends: aynı gün 2. çekim yeni kayıt üretmez, 8 gün sonra yeniden kayıt (7 gün penceresi) | `qa-suite.txt` |
| 4 | **Injection temizliği** | ✅ | EN + TR yönerge başlığı → karantina (2), modele giden veride yönerge metni **YOK**, özet yalnız temiz haberde | `qa-suite.txt` |
| 5 | **Fallback zincirleri + kota eşikleri** | ✅ | limit 10 · oran 0.8 tablosu: `0,7 → ana · 8,9 → yedek · yedek dolu → DURDUR · ana tükendi → yedek · yedek tanımsız + ana tükendi → DURDUR` (yalnız Gemini → Gemini yedeği; AGENTS §3) | `qa-suite.txt` · mutasyon M5 |
| 6 | **Retry / blocked** | ✅ | sürekli 500 → `pending, pending, blocked, blocked` (MAX_RETRIES=3), taslak 0, `ai_job_blocked:*` alert audit'i **1** (dedupe) | `qa-suite.txt` · mutasyon M6 |
| 7 | **Prod D1 izolasyonu** | ✅ | S1: cron-rss / cron-trends / cron-analytics `wrangler.toml`'da `[env.production]` YOK, prod D1 id YOK (yalnız `local-dev` + staging) · 41 test/QA dosyası + 5 `package.json`'da prod uzak yazım / prod D1 id **0** | `evidence/static-checks.txt` |
| 8 | **Onaysız yayın negatif testi** | ✅ TEMİZ | §3 | `negative-publish.test.mts` · `evidence/negative-controls.txt` |
| — | Ek: yayın kapısının kaynak düzeyi | ✅ | S2a–e: `contents → 'published'` yazan **tek** yer `publish.ts` (2 UPDATE, ikisi de `status='approved' AND publications.state='live'` koşullu); dinamik status UPDATE yalnız `draft→approved` çağrısında; public GET yalnız `published` · S3: cron worker'ları (31 dosya) `contents`'e yalnız `'draft'` yazar, approved/published literali 0 | `static-checks.txt` |
| — | Ek: runtime AI = yalnız Gemini | ✅ | S4: Gemini dışı sağlayıcı/SDK/binding (OpenAI, Anthropic, Workers AI `@cf/`/`[ai]`, Qwen/GLM uçları, …) kod satırı **0** · S5: `TODO(E3)` işaretleri + anahtarsız Gemini → `ModelNotConfigured` (sessiz başarı yok) | `static-checks.txt` |
| — | Ek: secret | ✅ | çalışma ağacı + tüm git geçmişi, 0 açıklanmamış | `secret-scan.txt` |

---

## 2. GERÇEK GEMINI — "RUNTIME E3'TE DOĞRULANACAK"

Aşağıdakiler bu turda **doğrulanamaz** (kod hazır, stub ile test edildi; değer/anahtar yok — AGENTS §9). E3 sırasında koşulacak liste:

| Konu | Bugün kanıtlanan | E3'te doğrulanacak |
| :-- | :-- | :-- |
| 4.4 özet/etiket | mock model ile şema doğrulama, karantina, deneme sayacı | gerçek `generateContent` yanıt biçimi, JSON şema uyumu oranı |
| 4.5 makale üretimi | stub-gemini ile draft + kontrol pass'i (SEO_PLAYBOOK §7) | çıktı kalitesi, hard-red oranı, uzunluk |
| 4.7 kota | 429 → `QuotaExceeded` yolu (enjekte hata ile) | sağlayıcının gerçek 429/RESOURCE_EXHAUSTED biçimi `TODO(E3)` eşlemesi, gerçek günlük limit değerleri |
| 4.7 fallback | eşik tablosu (§1 #5) | `GEMINI_FALLBACK_MODEL` gerçek adı + davranışı |
| Maliyet | `ai_usage_daily` çağrı/başarısızlık sayımı | ledger'da gerçek $ (bugün stub → $0) |

---

## 3. ONAYSIZ YAYIN NEGATİF TESTİ (ayrıntı)

**İddia:** hiçbir AI metni insan onayı olmadan `draft` dışına çıkmaz; onay da yayın değildir (makale PR + merge ister).

**Denenen yollar (`negative-publish.test.mts`, 4 test):**

| Durum | Yol | Sonuç |
| :-- | :-- | :-- |
| draft | servis `publish` / `preparePublication` / `markPublished` | changed `[]` · `not_approved` · `not_approved` |
| draft | çekirdek `publishEdge` / `preparePublication` / `markPublished` — **her koşulda "merge edildi" diyen sahte GitHub ile** | hepsi `ok:false` |
| draft | admin HTTP: `POST /drafts/publish`, `/drafts/:id/prepare-pr`, `/drafts/:id/mark-published` (geçerli Access JWT ile) | red |
| draft | admin HTTP `PATCH` `{status:published}`, `{status:approved}`, `{published_at}`, `{title, status}` | dördü de `field_read_only` |
| approved | public `GET /v1/contents` (+ anahtarsız `?status=approved`) | **boş** |
| approved | makale `markPublished` PR'sız · `publish` (edge) | `no_open_pr` · `pr_required` |
| tüketici | önceden `published`/`approved` satırlar varken 3 iş × 2 dil üretim | eski satırlar değişmez, 6 yeni satırın hepsi `draft` |

Son durum (`draft` kalır, `publications` 0 satır) **sert** assert; hata kodları `expect.soft` (bilgi) — böylece bir katman bozulduğunda asıl iddianın hâlâ tutup tutmadığı ayrıca görülür.

**Mutasyon (negatif kontrol) — testler gerçekten yakalıyor mu?** Kod geçici bozuldu → QA paketi koştu → `git checkout` ile HEAD'e döndü (her biri "HEAD ile birebir" doğrulandı; `evidence/negative-controls.txt`):

| # | Mutasyon | Yakalayan | Sonuç |
| :-- | :-- | :-- | :-- |
| M1 | public API `approved`'ı da listeler (4.6 öncesi gerçek hata) | 4 test | ✅ yakalandı |
| M2a | edge: yalnız SQL koşulu kaldırıldı | — (13/13) | ✅ **beklenen** — JS ön-kontrol tek başına tutuyor |
| M2b | edge/PR: yalnız JS ön-kontrol kaldırıldı | 2 test, yalnız **hata kodu** (`stale`/`no_open_pr`) | ✅ SQL koşulu tek başına tutuyor: içerik `draft`, publications 0 |
| M2c | iki katman birden kaldırıldı | 2 test + **`publications` 2 sahte `live` satırı** (sert assert) | ✅ yakalandı; `contents` UPDATE'indeki 3. koşul durumu yine `draft` tuttu |
| M3 | TTL 72 → 70 saat | 1 test | ✅ |
| M4 | tüketici `'approved'` yazar | 7 test | ✅ |
| M5 | kota eşiği `<` → `<=` | 1 test | ✅ |
| M6 | retry tükenince `blocked` yerine `failed` (4.7 öncesi) | 1 test | ✅ |
| — | mutasyonsuz | — | 13/13 |

**Sonuç:** yayın kapısı **üç bağımsız katman** (JS ön-kontrol · `publications` INSERT koşulu · `contents` UPDATE koşulu) — herhangi ikisi bozulsa bile içerik `draft`'tan çıkmıyor.

---

## 4. BULGULAR

Şiddet: Kritik = çıkışı engeller · Yüksek = imza öncesi kapat · Orta = FAZ 7'den önce · Düşük/Bilgi = izle.

| # | Şiddet | Bulgu | Kanıt | Öneri / sahip |
| :-- | :-- | :-- | :-- | :-- |
| F4-01 | Bilgi | `app/admin/content/service.ts` `bulkTransition` içindeki `to === "published"` dalı **ölü kod** (tek çağıran `approve`: draft→approved). Bugün zararsız; ileride biri `bulkTransition(…,"published")` çağırırsa PR/edge kapısını atlar. | `static-checks.txt` S2c (dalın çağrılmadığını her koşuda doğrular — regresyon kapısı) | admin scope: dalı kaldır (sonraki admin adımı / FAZ 9.5). S2c kırmızıya dönerse yakalanır. |
| F4-02 | Düşük | cron-rss/cron-trends **ayar** değişkenleri `docs/secret-envanteri.md`'de yok: `RSS_FETCH_TIMEOUT_MS, RSS_MAX_ITEMS_PER_FEED, RSS_MAX_BYTES, RSS_RETRY_DELAY_MS, RSS_CONCURRENCY, ENRICH_BATCH_SIZE, ENRICH_MAX_PER_RUN, ENRICH_MAX_ATTEMPTS, ARTICLE_MAX_JOBS_PER_RUN` (secret değil, hepsi varsayılanlı). FAZ-3 env-crosscheck cron-rss'i taramadığı için görünmüyordu; 4.9'da kapsam genişletildi. | `evidence/env-crosscheck.txt` | docs: envantere tek satır (`RSS_*`, `ENRICH_*`, `ARTICLE_MAX_JOBS_PER_RUN` = var, agent, ⚪). Ayrı docs commit'i (qa scope dışı). F-05'in 3 kalemi (FAZ-3) hâlâ açık. |
| F4-03 | Bilgi | FAZ-3 QA paketinde **beklenti kayması** (FAZ 4'ün bilinçli değişiklikleri yüzünden 3 kırmızı): (a) CONTENT audit testi makalenin doğrudan yayınlanmasını bekliyordu — 4.6'dan beri `pr_required` · (b) F-02 düzeldiği (6fe34c2) hâlde `it.fails` duruyordu · (c) QA D1 yardımcısı sabit migration listesi (0004/0005 yok) · (d) SQLi taramasında 2 yeni enterpolasyonun gerekçesi yoktu (okundu: `publish.ts` `COLS` sabit; `read.ts` page_type 5'li beyaz liste + bind). | bu commit'te düzeltildi; `regression-faz3-run-all.txt` KIRMIZI 0 | QA (bu adım). Gerçek kod hatası değil. |
| F4-04 | Bilgi | Pano 4.10 kriteri "**canlı kaynaklarla 48 saat kesintisiz** saatlik RSS" ve "ilk makale TAM TUR **gerçek içerikle**" bu turda kanıtlanamaz: cron worker'ları staging'e deploy edilmedi, staging'de 0004/0005 migration'ları uygulanmadı (👤), gerçek içerik = Gemini (E3). | — | 4.10'da 👤 karar: staging deploy + 48 s gözlem şimdi mi, E3 ile mi? |

**FAZ-3'ten açık kalan (değişmedi):** F-01 (token rotasyonu — operasyon), F-03 (seedMockDraftForJob audit atomikliği), F-04 (prod ALLOWED_ORIGINS pages.dev — E2), F-05 (3 envanter kaydı).
**Ertelenen (bloklamaz):** E3 Gemini runtime · E7 `GITHUB_PUBLISH_TOKEN` · E8 admin API router bağlaması · E9 Baidu hesabı · C7 de/zh makale rotaları.

---

## 5. NASIL YENİDEN KOŞULUR

```bash
node qa/FAZ-4/run-all.mjs                                                   # hepsi + sayım tablosu
pnpm --dir workers/cron-rss exec vitest run --config ../../qa/FAZ-4/vitest.config.mjs   # yalnız FAZ-4 QA testleri
node qa/FAZ-4/static-checks.mjs                                             # S1–S5
node qa/FAZ-3/run-all.mjs                                                   # FAZ-3 güvenlik regresyonu
```
Mutasyon kontrolleri betiği oturum scratchpad'inde koşuldu (kodu geçici değiştirdiği için repoya konmadı); adımlar ve çıktı `evidence/negative-controls.txt` başlığında.

## 6. DOSYALAR

`qa/FAZ-4/`: `vitest.config.mjs` · `pipeline-e2e.test.mts` (3) · `negative-publish.test.mts` (4) · `automation-qa.test.mts` (6) · `static-checks.mjs` (13 iddia) · `run-all.mjs` · `rapor.md` · `evidence/{run-all, qa-suite, static-checks, negative-controls, regression-workers, regression-faz3-run-all, secret-scan, env-crosscheck}.txt`
`qa/FAZ-3/` (regresyon bakımı, F4-03): `audit-behavior.test.mjs` · `api-qa.test.mts` · `lib/d1.mjs` · `sqli-static-scan.mjs` · `env-crosscheck.mjs` · `run-all.mjs`
