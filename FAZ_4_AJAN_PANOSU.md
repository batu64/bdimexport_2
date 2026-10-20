# FAZ 4 — Ajan Görev Panosu ve Koordinasyon
**Proje:** bdimexport.com | **Sürüm:** 1.0 | **Yürütücü:** Claude Code (Sonnet 5.5 / Haiku 5.5 · Opus bu fazda yok)
**Hedef:** İçerik Fabrikası otomasyonu — RSS/Trends toplama → batch özet/etiket → makale üretim (ai_jobs→draft) → insan onayı → yayın. Proje.md §10 "1 ayda 200+ sayfa" motoru.
**Karakter:** **En ucuz faz.** Kod az-orta (Sonnet worker + Haiku), **runtime AI = Gemini (stub, en sonda — E3)**. Değer: hata izleme + fallback + onaysız-yayın yasağı.

> Yetkili kaynaklar: `AGENTS.md` (§3 runtime AI, §4 scope, §7 model), `fazlar/FAZ_4.md`, `ORCHESTRATOR.md` §11 (yayın kuralı), `mimari.md` §6.
> Ön koşul: FAZ 3 kapandı ✅ (3.6 İçerik Fabrikası UI + 3.4 /api/v1 + staging). Feature dalı, faz sonunda main'e squash-merge.

---

## 0. PROTOKOL (HER AJAN OKUR)
- **"git bunu oku":** Baştan sona oku. §2'ye bak, modelini + sıradaki adımını belirle. Hazır olduğunu bildir.
- **"talimatı uygula":** §2'de ⏳/⚠️, bağımlılığı ✅, sana ait **sıradaki** adımı al → §3 talimatı.
- **Başlamadan:** bağımlılık ✅ değilse BAŞLAMA → §4 `BEKLEMEDE` + insana. **Sırayı atlama.**
- **Runtime AI (🟡):** Gemini çağrıları **STUB/mock** ile yaz (AGENTS.md §3, E3). Gerçek anahtar en sonda; kod hazır bekler. Stub'ı net TODO + env placeholder ile işaretle.
- **Bitince:** §2 güncelle + §4 günlüğü + tek commit (tek scope; commit öncesi `git status`/`git diff --cached`).
- **Sorun/çakışma:** ⛔ + §4 + insana + DEVAM ETME.

**Semboller:** ⏳ todo · 🔄 running · ✅ done · ⛔ blocked · ⏸ insan bekliyor · 🟡 runtime Gemini stub (E3) · 👤 insan

---

## 1. DEĞİŞMEZ KURALLAR
1. **Onaysız yayın YASAK:** Hiçbir AI metni `status: draft` dışına **insan onayı olmadan** geçmez (ORCHESTRATOR §11 Kural 5). Bu fazın amacı onayı KALDIRMAK değil HIZLANDIRMAK.
2. **Deterministik iş AI'dan geçmez:** RSS parse, TTL silme, dedup = script (AGENTS §8). Agent/model çağrısı yok.
3. **Runtime AI = Gemini, stub (E3).** 4.4/4.5'in Gemini çağrıları mock; kod yazılır.
4. **Prompt injection:** ham RSS metni prompt'a girmez — script önce temizler; özet çıktısı ham yönerge içermez.
5. **Tek scope / tek commit.** Ortak dosyalara (sitemap/llms) yalnız orchestrator (4.6/4.8).
6. **Prod D1'e doğrudan yazım yok** (staging'de test; FAZ 3.9 disiplini).

---

## 2. DURUM TABLOSU (CANLI)

| Sıra | Adım | Model | Bağımlılık | Durum | Son güncelleyen |
| :-- | :-- | :-- | :-- | :-- | :-- |
| 1 | 4.1 RSS toplama cron (saatlik) | **Sonnet 5.5** | — | ✅ KOD (14/14 entegrasyon, tsc temiz, `wrangler deploy --env staging --dry-run` OK). **Staging'e gerçek deploy + canlı koşu = 👤 onay bekliyor** (README §Staging). C4 KAPANDI (depolama = `settings.rssSources`, migration gerekmedi) | Sonnet 5.5 · 2026-10-19 |
| 2 | 4.2 TTL silme + bakım cron (gece) | **Haiku 5.5** | 4.1 | ✅ KOD + TEST (commit "FAZ_4 4.2: TTL silme + bakım + lead retention (C3)"): rss_news TTL (71s durur / 73s silinir), ai_jobs (done/failed/blocked >30g), leads retention 365g (C3 ✅), her silme audit'li (boş kesimde audit yok), haftalık D1 satır raporu (TR Pazartesi). Testler: cron-rss 23/23 (14 ingest + 9 bakım), tsc 0. Staging deploy 👤 | Haiku 5.5 · 2026-10-20 |
| 3 | 4.3 Trends toplama (RSS) | **Haiku 5.5** | 4.1 | ✅ KOD + TEST: günlük 06:00 UTC, geo TR/RU/DE (`rss_news.source` = "Trends <GEO>", tags_json.kind=trends); dedup 7 gün (keywords); admin B sorgusunda görünür; cron-trends 8/8, tsc 0. Staging deploy 👤 | Haiku 5.5 · 2026-10-20 |
| 4 | 4.4 Batch özet/etiketleme | kod **Sonnet 5.5** · runtime **Gemini** 🟡 | 4.1–4.3 | ⏳ kod + stub | — |
| 5 | 4.5 Makale üretim (ai_jobs→draft) | kod **Sonnet 5.5** · runtime **Gemini** 🟡 | 4.4 | ⏳ kod + stub | — |
| 6 | 4.6 Onay→yayın otomasyonu (PR/edge) | **Sonnet 5.5** | 4.5 | ⏳ ortak dosya | — |
| 7 | 4.7 Hata izleme/fallback/kota | **Sonnet 5.5** | 4.5, 4.6 | ⏳ | — |
| 8 | 4.8 Baidu hazırlık (sitemap placeholder) | **Haiku 5.5** | — | ⏳ · 👤 Baidu hesabı (ertelenebilir) | — |
| 9 | 4.9 QA (otomasyon güvenilirliği) | **Haiku 5.5** | 1–8 ✅ | ⏳ | — |
| 10 | 4.10 faz çıkışı 🚦 | **Haiku 5.5** | 4.9 + 👤 | ⏸ onay + hız hedefi | — |

**Sıralı yürütme:** 4.1 → 4.2 → 4.3 → 4.4 → 4.5 → 4.6 → 4.7 → 4.8 → 4.9 → 4.10
**Not:** 4.1/4.2/4.4 aynı worker ailesi (cron-rss) → sıralı. 4.3 ayrı (cron-trends). 4.8 bağımsız (ortak dosya, orchestrator).

---

## 3. ADIM TALİMATLARI

### Step 4.1 — RSS Toplama Cron · [SONNET 5.5]
```
Scope: workers/cron-rss/**, db/migrations (rss_sources gerekirse)
Görev: workers/cron-rss saatlik fetch — admin tanımlı RSS kaynakları (3.6 B sekmesi → RSS kaynak DEPOLAMA: rss_sources tablosu/settings anahtarı, bu adımda ekle — ERTELENEN C4 kapatılır) → parse → D1 rss_news (source,title,url,fetched_at,expires_at=+72h) → url dedup → kaynak hatası izolasyonu (1 kaynak düşerse diğerleri akar). Script'te AI çağrısı YOK (deterministik). TTL silme bu adımda DEĞİL (4.2). fetch timeout + 1 retry.
Kabul: integration test (3 test kaynağı → D1 kayıt; aynı feed 2x → dedup; ölü kaynak → log, diğerleri etkilenmez). staging'de koşar.
Tek commit: "FAZ_4 4.1: RSS cron fetch + rss_sources depolama (C4)".
```

### Step 4.2 — TTL Silme + Bakım Cron · [HAIKU 5.5]
```
Scope: workers/cron-rss/** (gece job)
Görev: 3 gün TTL: DELETE WHERE expires_at < NOW() + expired ai_jobs temizliği; silme sayısı log; haftalık D1 boyut raporu. (+ ERTELENEN C3: lead retention — RETENTION_DAYS=365 ile leads temizliği, KVKK metniyle eşit; bu adımda ekle, 365 varsayım.)
Kabul: yaş testi (71s durur, 73s silinir); silme audit'li; prod D1'e doğrudan bağlantı yok.
Tek commit: "FAZ_4 4.2: TTL silme + bakım + lead retention (C3)".
```

### Step 4.3 — Trends Toplama · [HAIKU 5.5]
```
Scope: workers/cron-trends/**
Görev: günlük trending RSS (geo=TR/RU/DE) + keyword tablosu entegrasyonu; trends ayrı etiketle D1'e (admin'de "Trends" kaynağı); 7 gün pencere dedup. 4.1 pattern'ini tekrar kullan.
Kabul: 3 geo test çekimi; dedup; admin B sekmesinde görünür.
Tek commit: "FAZ_4 4.3: Trends toplama (geo TR/RU/DE)".
```

### Step 4.4 — Batch Özet/Etiketleme · [SONNET kod · GEMINI 🟡 stub]
```
Scope: workers/cron-rss/** (veya pipeline worker)
Görev: yeni rss_news → AI özet + etiket {sector, product_candidate, locale_suggestion[], urgency} (sabit JSON şema). Batch 20 haber/çağrı. RUNTIME çağrı = Gemini → STUB (E3): kod hazır, çağrı mock JSON döner, env placeholder + TODO. Prompt injection temizliği: ham RSS prompt'a girmez (script temizler), özet ham yönerge içermez.
Kabul: etiket şeması JSON valid (mock 100 kayıt); injection testi (RSS içi yönerge → çıktıda yok); batch kod hazır.
Tek commit: "FAZ_4 4.4: batch özet/etiketleme pipeline (Gemini stub, E3)".
```

### Step 4.5 — Makale Üretim (ai_jobs→draft) · [SONNET kod · GEMINI 🟡 stub]
```
Scope: workers/** (ai_jobs consumer) + content servisi
Görev: ai_jobs consumer → input tipine göre (A manuel / B haber-özet / C keyword) → locale önerisi + gerekçe → makale+FAQ+schema → GLM yerine KONTROL pass'i (SEO_PLAYBOOK §7 eşikleri, deterministik kontrol) → contents(status=draft). RUNTIME üretim = Gemini → STUB (E3). Çıktı HER ZAMAN draft; rakamlar yalnız görev verisinden; RSS metni kopyalanamaz; content kaydında model alanı dolu.
Kabul: 3 tip (A/B/C) × 1 mock makale → draft listede (3.6 UI); locale önerisi gerekçeli; onaysız yayın yolu yok.
Tek commit: "FAZ_4 4.5: ai_jobs→draft üretim akışı (Gemini stub, E3)".
```

### Step 4.6 — Onay→Yayın Otomasyonu · [SONNET 5.5] · ortak dosya
```
Scope: workers/** + app/sitemap.ts + public/llms.txt (orchestrator tekeli)
Görev: admin "onayla" → içerik tipine göre: kalıcı (ürün/sektör) → otomatik Git PR (content/** + metadata) → admin merge → build; geçici (haber kartı) → contents(status=approved) → edge render. sitemap/llms güncelleme orchestrator eliyle. "approved" ≠ "published" (iki ayrı status). PR açma yetkisi bot'ta; merge insan/yetkili akış.
Kabul: e2e: draft → onay → kalıcı PR açılır → merge → sayfa+sitemap; geçici → edge; iki yol ayrı log.
Tek commit: "FAZ_4 4.6: onay→yayın (PR/edge hibrit)".
```

### Step 4.7 — Hata İzleme / Fallback / Kota · [SONNET 5.5]
```
Scope: workers/api/** (veya ortak lib)
Görev: ai_jobs retry (max 2, ORCHESTRATION §6); üretim hatası → Webhook alert (3.3 altyapısı); Gemini kota izleme (%80 uyarı → fallback); hat günü raporu (nightly log); alert spam önleme (aynı hata 1s'de 1).
Kabul: kota tükenme simülasyonu → fallback; kalıcı hata → alert + ai_jobs blocked; spam önleme.
Tek commit: "FAZ_4 4.7: hata izleme + fallback + kota".
```

### Step 4.8 — Baidu Hazırlık · [HAIKU 5.5] · 👤 (ertelenebilir)
```
Scope: app/sitemap.ts (sitemap-zh placeholder) + docs
Görev: sitemap-zh.xml placeholder (zh FAZ 5'te dolar) + Baidu submit rutini dokümanı + verification şablonu yeri (app/(zh) layout).
👤 İNSAN: Baidu Webmaster hesabı + doğrulama — ERTELENEBİLİR (FAZ 5'te aktif kullanılacak). Hesap yoksa ERTELENEN'e ekle, kod placeholder'ı bırak.
Kabul: sitemap index'te sitemap-zh (boş valid); rutin dokümanı.
```

### Step 4.9 — QA (Otomasyon Güvenilirliği) · [HAIKU 5.5]
```
Scope: qa/** (qa/FAZ-4/rapor.md)
Testler: tam hat e2e (haber→özet→üretim→draft→onay→yayın, mock üretimle her iki yol); TTL doğruluk (3 gün); dedup (RSS+Trends); injection temizliği; fallback zincirleri; kota eşikleri; retry/blocked; prod D1 izolasyonu; **onaysız yayın negatif testi** (draft'ı zorla yayınlama yolu kapalı mı).
Çıktı: qa/FAZ-4/rapor.md. Kanıtsız pass yasak. Not: gerçek Gemini çağrıları stub → "runtime E3'te doğrulanacak" işaretle.
```

### Step 4.10 — Faz Çıkışı · [HAIKU 5.5] 🚦 · 👤
```
Scope: qa/**
Görev: çıkış kriterleri → insana özet: [saatlik RSS kod ✅] [TTL doğrulandı] [Trends] [A/B/C mock makale draft→onay→yayın tam tur] [fallback] [alert] [prod izolasyonu] [onaysız yayın negatif temiz] [gitleaks]. ERTELENEN: gerçek Gemini runtime (E3), Baidu hesabı (varsa).
👤: "devam et" → FAZ 5 + günlük üretim hız hedefi (öneri 5–10 makale/gün, Gemini açılınca).
```

---

## 4. ÇALIŞMA GÜNLÜĞÜ (append-only)
> Format: `- [TARİH] <Model> · Step <no> · <durum> — ne; dosyalar; kabul; commit <hash>; eksik`

- [2026-10-19] Pano kurulumu — FAZ 3 kapandı. FAZ 4 çoğunlukla YENİ kod (cron-rss/cron-trends boş iskelet). İçerik Fabrikası UI (3.6) var → backend bağlanacak. Runtime AI = Gemini STUB (E3). Bu fazda kapanacak ertelemeler: C4 (RSS kaynak depolama → 4.1), C3 (lead retention → 4.2).
- [2026-10-20] Haiku 5.5 · Step 4.3 · ✅ KOD + TEST — Dosyalar: `workers/cron-trends/` (YENİ): `src/trends.ts` (geo TR/RU/DE çekim, 4.1 `fetchFeedText`/`parseFeed` yeniden kullanıldı — cross-worker import), `src/index.ts` (cron 06:00 UTC, yalnız trends cron'u), `wrangler.toml` (top + staging; production yok), `package.json`/`tsconfig.json`/`vitest.config.ts`/`pnpm-lock.yaml`, `test/trends.test.ts` (8 test). KABUL: 3 geo test çekimi ✅ (her URL 1 kez; TR 2 · RU 1 · DE 1 kayıt); dedup ✅ (aynı gün: 0 yeni, duplicates = fetched; 8 gün sonra yeniden kayıt); hata izolasyonu ✅ (RU 500 → yalnız RU düşer); admin B görünürlük ✅ (`app/admin/content/service.ts` listeleme sorgusunun birebir SQL'i ile 4 trend kaydı, source "Trends TR/RU/DE"); tsc EXIT=0; cron-trends vitest 8/8. TASARIM NOTLARI: (a) rss_news 72 saat TTL'li olduğundan 7 gün dedup `keywords` tablosunda (keyword kaydı silinmiyor); (b) Türkçe "İ" normalizasyonu (NFC + birleşik nokta düşürme) — "MOBİLYA"="mobilya"; (c) keyword `intent` NULL (Trends niyet vermez), `status` queued — keyword motoru 6.3 bu satırları işleyebilir (kuyruğa girer, ayrı karar). EKSİK/ŞÜPHE: (1) Google Trends RSS biçimi canlı doğrulanmadı (ağ yok; test mock XML) — staging'de ilk çekimde doğrulanmalı; (2) keyword satırları 6.3 kuyruğuna girdiğinden, 6.3 öncesi `keywords` tablosunda trend satırları birikir — 👤 karar (tutulsun mu, kuyruktan ayrı mı işaretlensin); (3) `pnpm install` onay-builds uyarısıyla exit 1 (node_modules oluştu, testler geçti).
- [2026-10-20] Haiku 5.5 · Step 4.2 · ✅ KOD + TEST — Dosyalar: `workers/cron-rss/src/maintenance.ts` (yeni), `src/index.ts` (cron yönlendirme: 23:00 UTC → bakım, saatlik → ingest), `wrangler.toml` (top + staging crons), `test/maintenance.test.ts` (yeni, 9 test). KABUL: cron-rss vitest 23/23 (gerçek SQLite, 0001–0003); tsc EXIT=0. Yaş testi: 71s durur ✅ / 73s silinir ✅ (`ttl_purge` audit). Lead retention: 364g durur ✅ / 366g silinir ✅ (`lead_retention_purge` audit, PII audit'te YOK ✅). ai_jobs: yalnız done/failed/blocked >30g (pending/running korunur ✅). Audit-yok-silme-yok: kesimde satır yoksa audit yok ✅. Haftalık rapor: TR Pazartesi gecesi (satır sayısı, boyut proxy). C3 ✅ (ERTELENEN). VARSAYIMLAR (👤 karar): (a) ai_jobs için `AI_JOB_RETENTION_DAYS=30` — tabloda expires_at yok; (b) lead 365g — KVKK metniyle eşitlenecek; (c) rapor boyut değil satır sayısı (D1 SQL'den bayt boyutu yok). Prod: wrangler'da production env YOK (bilinçli; prod D1'e bağlantı yok). Staging deploy 👤.
- [2026-10-19] Sonnet 5.5 · Step 4.1 · ✅ KOD (staging deploy 👤) — `workers/cron-rss/` sıfırdan: `src/{index,ingest,fetch,parse,sources,types}.ts`, `wrangler.toml` (saatlik cron; yalnız yerel+staging — prod env YOK), `test/`, README, package.json. KARAR (C4): RSS kaynak depolama = mevcut `settings` tablosu, anahtar `rssSources` (3.8'de şema+UI+admin yazma+audit hazırdı; 3.6 Input B ile ORTAK) → YENİ MİGRATION GEREKMEDİ; worker yalnız OKUR ve her öğeyi (https + genel alan adı; IP/iç adres/kimlik bilgisi/secret-sorgu/özel port red) yeniden doğrular (D1 elle bozulsa bile SSRF yok). AKIŞ: fetch (AbortController 10 sn, gövde okuma dahil; 5xx/429/ağ/zaman aşımı → 1 yeniden deneme, 4xx/too_large/bad_redirect denenmez; gövde ≤2 MB; yönlendirme sonrası nihai URL de genel https olmalı) → parse (RSS2/RDF/Atom, bağımlılıksız; CDATA/entity/etiket temiz; javascript:/data:/kimlik bilgili URL atlanır; utm_/fbclid/fragment atılır) → `INSERT … ON CONFLICT(url) DO NOTHING` (url UNIQUE dedup; expires_at = fetched_at + 72s, D1 `datetime` biçimi — admin TTL karşılaştırmasıyla aynı). Her kaynak ayrı try/catch + havuz (3 eşzamanlı): biri düşerse hata kodu `rss_source` log satırında, diğerleri akar. AI çağrısı YOK, TTL silme YOK (4.2). KABUL (workers/cron-rss, gerçek SQL 0001–0003, ağ mock): 14/14 — (1) 3 kaynak (RSS2+Atom+CDATA) → D1, source=admin adı, expires=+72s tam, devre dışı kaynak çekilmez; (2) aynı feed 2x → 0 yeni satır + duplicates sayılır, utm'li/fragment'li/kaynaklar-arası aynı URL dedup, ilk fetched_at korunur; (3) ölü kaynaklar (503, ağ, 404, bozuk XML, zaman aşımı) → doğru hata kodu + attempts (5xx/ağ/timeout=2, 404=1) + console.error log, sağlam 2 kaynak yazıldı; + D1 yazma hatası izolasyonu, too_large, SSRF (10 geçersiz kaynak, tek dış istek), bad_redirect, geçersiz öğe ayıklama, öğe sınırı, 'TTL silme yok' ve 'AI/secret referansı yok' statik kontrolleri. tsc --noEmit temiz; `wrangler deploy --env staging --dry-run` paketledi (15.7 KiB, DB=bdimexport-db-staging bağlandı). STAGING: gerçek deploy + staging D1'e test kaynağı yazma + cron tetikleme bilerek YAPILMADI (kalıcı bulut değişikliği; wrangler oturumu açık olsa da 3.9 disiplini: deploy 👤). Komutlar workers/cron-rss/README.md. NOT/EKSİK: (a) admin UI Input B metni hâlâ 'kaynak tablosu henüz yok — FAZ 4.1 ile gelecek' (app/admin/content/ContentFactory.tsx:163, admin scope) → güncellenmeli. (b) kaynak başına sağlık/son-başarı durumu D1'de TUTULMUYOR (yalnız log) — 4.7 izleme/alarm için `rss_source_status` tablosu gerekirse orada eklenir. (c) `pnpm install` yine 'ignored build scripts' (esbuild, workerd) uyarısı verdi — bilinen CI riski; wrangler dry-run yine de çalıştı. (d) prod: `settings` tablosu (0003) prod D1'de go-live'a kadar yok — cron-rss prod env'i bu yüzden eklenmedi. (e) ERTELENEN C4 ✅ işaretlendi.

---

## 5. İNSAN AKSİYON NOKTALARI (👤)
1. **4.8 Baidu Webmaster hesabı** — ertelenebilir (FAZ 5'te aktif). Hesap yoksa ERTELENEN'e eklenir.
2. **4.10:** "devam et" → FAZ 5 + günlük üretim hız hedefi.
3. **Runtime Gemini (E3):** bu fazda stub; gerçek anahtar proje sonunda (AGENTS §9).
4. **Dal:** FAZ 4 feature dalında; faz sonunda main'e squash-merge.
