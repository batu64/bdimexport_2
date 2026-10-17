# FAZ 3 — Ajan Görev Panosu ve Koordinasyon
**Proje:** bdimexport.com | **Sürüm:** 1.0 | **Yürütücü:** Claude Code (Opus 5.5 / Sonnet 5.5 / Haiku 5.5)
**Hedef:** Admin paneli (Cloudflare Access korumalı) + /api/v1 gateway + D1 CRUD + analitik çekim altyapısı. İnsanın sisteme "kumanda" ettiği faz.
**Karakter:** **EN GÜVENLİK-YOĞUN FAZ.** auth/admin/API-key/KVKK kodu = AGENTS.md §8 Kural 4 → **Opus 5.5 + ZORUNLU insan review**. Hız değil doğruluk; ilk seferde doğru.

> Yetkili kaynaklar: `AGENTS.md` (§4 scope, §5 sıra, §7 model, §8 güvenlik kilidi), `fazlar/FAZ_3.md`, `ORCHESTRATOR.md` §9, `mimari.md` §5/§7. Çelişki → AGENTS.md.
> Ön koşul: FAZ 2 kapandı ✅ · D1 şema v1 (0.8) canlı. Feature dalı, faz sonunda main'e squash-merge.

---

## 0. PROTOKOL (HER AJAN OKUR)

- **"git bunu oku":** Baştan sona oku. §2'ye bak, modelini + sıradaki adımını belirle. Uygulama yapma, hazır olduğunu bildir.
- **"talimatı uygula":** §2'de durumu ⏳/⚠️, bağımlılıkları ✅, sana ait **sıradaki** adımı al → §3'teki talimatı uygula.
- **Başlamadan:** bağımlılık ✅ değilse BAŞLAMA; §4'e `BEKLEMEDE` yaz, insana bildir. **Sırayı ASLA atlama.**
- **Güvenlik adımı (🔒):** Opus 5.5 ile yap; bitince İNSAN REVIEW için özet çıkar, durumu ⏸ yap, onay gelmeden sonraki bağımlı adıma geçme. Bu fazda "hızlı geç" istisnası YOK.
- **İnsan-altyapı kapısı (👤):** Cloudflare Access / OAuth / secret girişleri **insan işi** — kod hazır olsa bile bu adımlar insan tamamlamadan "canlı" sayılmaz. Kod tarafını bitir, insan tarafını ⏸ işaretle + §5'te hatırlat.
- **Bitince:** §2 durumu güncelle + §4 günlüğü (ne, dosyalar, kabul kanıtı, eksik) + commit (tek scope). Commit öncesi `git status`/`git diff --cached`.
- **Sorun/çakışma:** ⛔ + §4 + insana haber + DEVAM ETME.

**Semboller:** ⏳ todo · ⚠️ mevcut/review+hizala · 🔄 running · ✅ done · ⛔ blocked · ⏸ insan/review bekliyor · 🔒 güvenlik (Opus+review) · 👤 insan-altyapı · `✅*` mevcut (dokunulursa doğrula)

> ⚠️ **Bu tur = GÜVENLİK REVIEW + HİZALAMA + İNSAN ALTYAPISI.** Admin paneli, workers/api ve cron-analytics kodu önceki sistemden MEVCUT. Bu fazda: (1) Opus güvenlik kodunu yeni-model altında **review** eder + hizalar, (2) **commit'siz** `workers/cron-analytics/` + `app/admin/analytics/handler.ts` commit'lenir, (3) **insan-altyapı kapıları** (Access, OAuth, secret) senin tarafından tamamlanır.

---

## 1. DEĞİŞMEZ KURALLAR

1. **Güvenlik kilidi (pazarlıksız):** auth/admin/API-key/KVKK kodu = **Opus 5.5 + insan review**. Haiku/Sonnet'e indirilemez (salt-okunur dashboard + config UI hariç).
2. **Tek scope / tek commit.** admin UI (`app/admin/**` api hariç) ile api (`workers/**`, `app/admin/api/**`) AYRI.
3. **Secret kodda ASLA:** env/Cloudflare Secrets. gitleaks temiz şart.
4. **Admin UI serisi aynı dizine yazar (3.2→3.3→3.5→3.6→3.8) → KESİN SIRALI**, biri commit'lenmeden diğeri başlamaz.
5. **Oku-hizala-ezme** + commit öncesi index kontrolü.
6. **Prod izolasyonu:** production D1'e doğrudan yazım yasak (3.9); e2e'ler staging'de.

---

## 2. DURUM TABLOSU (CANLI)

| Sıra | Adım | Model | Bağımlılık | Durum | Son güncelleyen |
| :-- | :-- | :-- | :-- | :-- | :-- |
| 1 | 3.1 Cloudflare Access + admin auth 🔒 | **Opus 5.5** | — + 👤 | ✅ KOD (guard review + config bağlı, commit `6c8a754`; 👤 B kararıyla kabul). CANLI edge testi + Pages "Enable Access policy" toggle + /admin deploy → **3.9'a devredildi** | insan · 2026-10-17 |
| 2 | 3.2 Admin iskelet + Dashboard | **Sonnet 5.5** | 3.1 | ✅ doğrulandı+hizalandı (menü rol kapısı `_lib/nav.ts` + 7 test; hex=0; dashboard salt-okunur). Bağımlı: GET /me + /dashboard/summary servisi **3.4**'te (şimdilik hata→viewer) | Sonnet 5.5 · 2026-10-17 |
| 3 | 3.4 /api/v1 gateway + API key 🔒 | **Opus 5.5** (read: Sonnet) | 3.1 + 👤 | ✅ 👤 İNSAN REVIEW ONAYLI (2026-10-17) — kod `bfb5335`; /me + /dashboard/summary hazır (3.2 bağımlılığı karşılandı) · takipte: /v1/leads | Opus 5.5 · 2026-10-17 |
| 4 | 3.3 Lead Kanban (KVKK verisi) 🔒 | **Opus 5.5** | 3.2 + 👤 | ✅ 👤 İNSAN REVIEW ONAYLI (2026-10-17) — kod `3bb0483` · açık: lead saklama süresi (365 gün varsayım) 👤 karar · router bağlama api adımında | Opus 5.5 · 2026-10-17 |
| 5 | 3.5 Partner CRUD + logo onay 🔒 | **Opus 5.5** | 3.2 | ✅ 👤 İNSAN REVIEW ONAYLI ("devam et", 2026-10-17) — kod `90c2514` · router bağlama api adımında | insan · 2026-10-17 |
| 6 | 3.6 İçerik Fabrikası UI 🔒 | **Opus 5.5** (rss okuma: Sonnet) | 3.4 | ✅ 👤 İNSAN REVIEW ONAYLI (2026-10-17) — kod `27e54d1` · açık: RSS kaynak CRUD depolaması (👤 karar; öneri FAZ 4.1) · router bağlama api adımında | Opus 5.5 · 2026-10-17 |
| 7 | 3.7 Analitik çekim cron + dashboard | **Sonnet 5.5** | 3.4 + 👤 | ✅ KOD (commit'lendi, credential stub). **CANLI OAUTH ERTELENDİ → 3.9/FAZ 6** (GSC/GA4/Meta credential + 1 gün veri doğrulaması; docs/analytics-setup.md §4) | Sonnet 5.5 · 2026-10-17 |
| 8 | 3.8 Turnstile/rate-limit admin + Ayarlar | **Sonnet 5.5** | 3.5, 3.6 | ✅ KOD (genişletildi + doğrulandı; secret reddi 7/7 anahtarda). AÇIK: public kanal bileşeni bağlama (lib/ui ChannelCta = fe + public okuma ucu = api) · router bağlama (api adımı) · `0003_settings.sql` commit'siz/👤 şema review | Sonnet 5.5 · 2026-10-17 |
| 9 | 3.9 staging/prod + credential 🔒 | **Opus 5.5** | 3.4 + 👤 | ⏳ wrangler local-dev placeholder — ayrım + 👤 secret · **+ 3.1'den devir:** Pages "Enable Access policy" toggle + /admin deploy + canlı edge testi (gizli pencere → Google login) | — |
| 10 | 3.10 QA (güvenlik ağırlıklı) | **Sonnet 5.5** | 1–9 ✅ | ⏳ qa/FAZ-3 yok | — |
| 11 | 3.11 güvenlik insan review 🚀 | **Haiku** (hazırlık) | 3.10 + 👤 | ⏸ 👤 imza | — |
| 12 | 3.12 faz çıkışı 🚦 | **Haiku 5.5** | 3.11 + 👤 | ⏸ 👤 onay | — |

**Sıralı yürütme:** 3.1 → 3.2 → 3.4 → 3.3 → 3.5 → 3.6 → 3.7 → 3.8 → 3.9 → 3.10 → 3.11 → 3.12
**Not:** admin UI serisi (3.2/3.3/3.5/3.6/3.8) aynı `app/admin/**` dizini → kesin sıralı. 3.4/3.7/3.9 workers (ayrı dizin) ama sıra korunur (tek yürütücü). Her 🔒 adım insan review olmadan bağımlısını açmaz.

---

## 3. ADIM TALİMATLARI

### Step 3.1 — Cloudflare Access + Admin Auth · [OPUS 5.5] 🔒 · 👤
```
Scope: app/admin/middleware.ts, app/admin/audit.ts (Access JWT + oturum + audit)
Durum: middleware.ts + audit.ts MEVCUT. Opus yeni-model GÜVENLİK REVIEW yapar + hizalar.
Review: Access JWT doğrulama (imza/expire), oturum katmanı, audit log her mutasyonda (kim/ne/ne zaman/eski-yeni), Access'siz /admin → 401/403.
👤 İNSAN: Cloudflare Zero Trust panelinde Access uygulaması kurar (agent yalnız config şablonu + docs/access-setup.md verir) + Google OAuth + admin hesapları.
Kabul: Access'siz 401/403 (e2e); imzasız/expire JWT red; audit bütünlüğü. İNSAN REVIEW + Access panel testi kaydı.
Bitince: review özeti → ⏸ insan onayı (sonra 3.2/3.4 açılır).
```

### Step 3.2 — Admin İskelet + Dashboard · [SONNET 5.5] · ✅* doğrula
```
Scope: app/admin/** (api hariç; layout, AdminShell, Dashboard, page)
Durum: layout/AdminShell/Dashboard MEVCUT. Doğrula/hizala (salt-okunur dashboard).
Kabul: menü rol doğrulama; dashboard salt-okunur (analytics_daily özeti); hardcoded hex=0; build+lint yeşil.
```

### Step 3.4 — /api/v1 Gateway + API Key · [OPUS 5.5] 🔒 (read: Sonnet) · 👤
```
Scope: workers/api/** (index, auth, keys, read, cors, ratelimit), db/migrations (api_keys gerekirse)
Durum: workers/api MEVCUT (keys.ts, auth.ts, read.ts...). Opus key/auth GÜVENLİK REVIEW.
Review: key yalnız HASH saklanır; ilk gösterim tek sefer; scope'lu key (read-only vs full); revoke anında; KV cache'li doğrulama; CORS yalnız bdimexport.com; POST /v1/leads public (Turnstile+rate limit); GET/POST /v1/partners admin-auth; GET /v1/contents draft hariç.
👤 İNSAN: key politikası onayı.
Kabul: valid key✓ / geçersiz 401 / revoke 401 / rate 429 / CORS dışı red; gitleaks temiz. İNSAN REVIEW kaydı.
Read-only sorgu endpoint'leri Sonnet'e devredilebilir; auth/key ÇEKİRDEĞİ Opus.
```

### Step 3.3 — Lead Kanban (KVKK verisi) · [OPUS 5.5] 🔒 · 👤
```
Scope: app/admin/leads/** (page, lib, channel, fixtures)
Durum: leads/* MEVCUT. Opus KVKK/güvenlik review (lead = kişisel veri).
Review: Kanban (new/contacted/qualified/closed) status geçişi audit'e; dil/kaynak/kanal filtresi; wa.me/Telegram/WeChat/Email tek-tık (channel_pref'ten — agent tahmin etmez); KVKK maskeleme toggle (e-posta/telefon kısmi).
Kabul: status geçişi audit'e; maskeleme çalışır; kanal linki yalnız channel_pref'ten. İNSAN REVIEW.
```

### Step 3.5 — Partner CRUD + Logo Onay · [OPUS 5.5] 🔒
```
Scope: app/admin/partners/**
Durum: partners/page.tsx MEVCUT. Opus review (başvuru onayı = flywheel kapısı).
Review: başvuru listesi (approved=false); onay/red (audit'li); R2 logo upload (mime+boyut server kontrol); consent_logo_en SALT-OKUNUR (admin değiştiremez, partner yeniden rıza verir).
Kabul: onay → /en/suppliers'da görünür (FAZ 1 1.7 bileşeni); red → görünmez; consent=false logo gizli; audit. İNSAN REVIEW.
```

### Step 3.6 — İçerik Fabrikası UI · [OPUS 5.5] 🔒 (rss okuma: Sonnet) · 👤
```
Scope: app/admin/content/**, app/admin/content-factory/**
Durum: content/* + content-factory MEVCUT. Opus review (Faz 4 otomasyonunun kontrol kulesi).
Review: Input A (metin yapıştır→ai_jobs), Input B (RSS kaynak CRUD + TTL göstergesi + seç→üret), Input C (keyword); Draft kuyruğu (status=draft → düzenle/onayla/red); onay ≠ yayın (iki ayrı status).
👤 İNSAN: review.
Kabul: keyword→ai_jobs→(mock)→draft→approved; TTL uyarısı; her aksiyon audit. İNSAN REVIEW.
Not: runtime AI üretimi FAZ 4 + Gemini (en sonda) — burada mock/stub.
```

### Step 3.7 — Analitik Çekim Cron + Dashboard · [SONNET 5.5] · 👤 OAuth
```
Scope: workers/cron-analytics/**, app/admin/analytics/**
Durum: cron-analytics/* + admin/analytics/handler.ts MEVCUT ama COMMIT'SİZ → hizala + COMMIT.
Görev: GSC/GA4/Meta günlük çekim → analytics_daily + backfill; admin Analitik grafik (Chart.js: lead kaynağı, en çok trafik sayfa); credential Cloudflare Secrets.
👤 İNSAN: GSC/GA4/Meta OAuth credential girişi.
Kabul: credential sonrası 1 gün veri D1'de; grafik render; backfill; secret scan temiz. İNSAN OAuth onayı.
Tek commit: "FAZ_3 3.7: analitik çekim + dashboard (cron-analytics + admin/analytics)".
```

### Step 3.8 — Turnstile/Rate-Limit Admin + Ayarlar · [SONNET 5.5] · ✅* doğrula
```
Scope: app/admin/settings/**
Durum: settings/* MEVCUT (SettingsForm, handler, schema, store, channels). Doğrula/hizala (config UI, auth yok).
Kabul: kanal bilgisi değişimi FAZ 1/2 bileşenlerine yansır (channel_pref ortak lib); secret ayarlara YAZILAMAZ (schema reddi); ayar değişikliği audit.
```

### Step 3.9 — Staging/Prod + Credential · [OPUS 5.5] 🔒 · 👤
```
Scope: wrangler.toml (env'ler), deploy pipeline, docs/secret-envanteri
Durum: wrangler.toml local-dev placeholder. Opus staging/prod ayrımı.
Görev: staging/production D1 binding ayrımı (wrangler env); prod deploy pipeline (staging test → 👤 tetik → prod); secret envanteri (nerede/kim — DEĞER yok); haftalık D1→R2 yedek prod binding.
👤 İNSAN: Cloudflare secret girişleri (D1 token, GSC/GA4 OAuth, Resend/Brevo key).
Kabul: staging e2e yeşil; prod'a e2e yazmıyor (salt-okunur smoke); secret envanteri tam.
```

### Step 3.10 — QA (Güvenlik Ağırlıklı) · [SONNET 5.5]
```
Scope: qa/** (qa/FAZ-3/rapor.md)
Ön koşul: 1–9 ✅.
Testler: yetkilendirme matrisi (her admin rotası × Access'li/siz × admin/non-admin) · audit bütünlüğü (her mutasyon) · API key yaşam döngüsü (üret→kullan→revoke→401) · KVKK maskeleme · CORS matrisi · rate limit · SQL injection fuzz · gitleaks · secret envanter çapraz kontrol.
Çıktı: qa/FAZ-3/rapor.md — güvenlik bulguları ayrı bölüm (kritik bulgu = çıkışı engeller). Kanıtsız pass yasak.
```

### Step 3.11 — Güvenlik İnsan Review · [HAIKU hazırlık] 🚀 · 👤
```
Scope: qa/** (qa/FAZ-3/insan-review.md hazırlık)
Görev: tüm 🔒 review noktalarını (3.1/3.3/3.4/3.5/3.6/3.9) + 3.10 raporu + secret envanteri topla → insan imzası için özet.
👤 İNSAN: toplu güvenlik imzası. İmza olmadan 3.12 YOK.
```

### Step 3.12 — Faz Çıkışı · [HAIKU 5.5] 🚦 · 👤
```
Scope: qa/**
Görev: çıkış kriterleri işaretle → insana özet: [Access'siz /admin 403] [Kanban+kanal tek-tık] [Partner onay→/en/suppliers uçtan uca] [API key yaşam döngüsü] [İçerik Fabrikası A/B/C+draft] [analytics 1 gün veri] [audit bütünlüğü] [staging e2e] [secret envanteri + prod izolasyonu] [gitleaks] [3.11 imza].
👤: "devam et" → FAZ 4.
```

---

## 4. ÇALIŞMA GÜNLÜĞÜ (append-only)

> Format: `- [TARİH] <Model> · Step <no> · <durum> — ne; dosyalar; kabul; commit <hash>; eksik`

- [2026-10-16] Pano kurulumu — FAZ 2 kapandı (2.9 10/10, 2.10 👤 onaylı). Repo denetimi: admin paneli + workers/api + cron-analytics MEVCUT. COMMİT'SİZ: workers/cron-analytics/, app/admin/analytics/handler.ts + analytics.test.mjs → 3.7'de commit. AÇIK: Opus güvenlik review'ları (3.1/3.3/3.4/3.5/3.6/3.9) + insan-altyapı kapıları (Access, key politikası, OAuth, secret, güvenlik imzası).
- [2026-10-16] Karar — İnsan-altyapı yolu: **SEÇENEK B ONAYLANDI** (insan). Kod review + canlı altyapı (Cloudflare Access/OAuth/secret) BİRLİKTE açılır. Her 🔒/👤 adımda: agent önce kod review + adım-adım kurulum rehberi üretir → insan Cloudflare/Google panelinde uygular → agent canlı doğrular.
- [2026-10-16] Opus 5.5 · Step 3.1 · ⏸ (👤 Access kurulumu + canlı doğrulama) — GÜVENLİK REVIEW (seçenek B). commit `8c761ce` (3 dosya; stage kontrol edildi). SAĞLAM: JWT alg RS256 sabit (none/HS256 red), kid zorunlu, JWKS imza, iss=https://<team>, aud, exp/nbf (30 sn tolerans), email+sub zorunlu, allowlist 2. katman, viewer salt-okunur, her hata fail-closed 403, token yok 401; audit atomik batch + redaction + 0002 append-only trigger. BULGU+DÜZELTME: (1) audit sahte kayıt — `WHERE status=?` yarışında 0 satır değişse de audit yazılıyordu → `INSERT … SELECT … WHERE changes() > 0`, withAudit boolean döner; (2) rastgele kid seli her istekte JWKS zorla çekiyordu (50 istek → 51 fetch) → zorla yenileme ≤1/dk; (3) token boyutu sınırsız → 8 KB. REHBER: docs/access-setup.md v2.0 (Zero Trust app, Google OAuth iki taraf, policy, session, middleware env tablosu, test kaydı, sorun giderme). Eski rehberdeki yanlış ('/admin Workers'ta servis edilir') düzeltildi: /admin Pages statik; **bdimexport.pages.dev/admin + önizleme URL'leri bdimexport.com Access app'inin DIŞINDA** → §4.3 zorunlu adım. KABUL: access.test 14/14 (önce 14/14); ek doğrulama (scratchpad, gerçek SQLite+migrations) 8/8 — orijinal kodla 6/8 FAIL (negatif kontrol: yarışta audit yazıldı, JWKS 51 fetch); pnpm build 0; analytics.test 2/2. EKSİK/ŞÜPHE: (a) **guardAdminRequest yalnız analytics+settings handler'ında**; content/service.ts ve leads/lib.ts'i çağıran bir admin API giriş noktası YOK (worker deploy edilmemiş) → 3.9'da tek router + varsayılan-red guard ŞART; (b) çağıranlar withAudit'in false dönüşünü henüz kullanmıyor (content bulk 'changed' raporluyor) → 3.3 (leads) / 3.6 (content) review'ında; (c) content.test.mjs + settings.test.mjs ÇALIŞMIYOR — uzantısız import (`../audit`, `./schema`), orijinal kodla da aynı, admin scope; (d) e2e test dosyasına yeni testler eklenmedi (app/admin/e2e scope dışı) → 3.10'da; (e) `access.config.template.json` IP require içeriyor, rehberde isteğe bağlı — şablon scope dışı; (f) canlı Access e2e (Access'siz /admin 302/403) 👤 kurulum sonrası.
- [2026-10-17] Opus 5.5 · Step 3.1 · ⏸ (👤 review onayı + edge testi) — 👤 Access KURULDU (app bdimexport-admin, domain geçici bdimexport.pages.dev/admin, team bdimexport.cloudflareaccess.com). commit `6c8a754` (5 dosya; stage kontrol edildi). CONFIG: wrangler.toml [vars] ACCESS_TEAM_DOMAIN + ACCESS_AUD (public); staging AUD boş = fail-closed; ADMIN_EMAILS/VIEWER_EMAILS repoda YOK → `wrangler secret put` / workers/api/.dev.vars (kişisel veri + repo görünürlük riski + phishing hedefi). .env.example: yalnız adlar + public config; v1 kalıntısı (GLM/Qwen, gömülü sitekey) kaldırıldı. GUARD RE-REVIEW: JWKS anahtar tipi kontrolü eklendi (RSA/RS256/sig → değilse bad_key); kid seli ≤1/dk, 8 KB sınır, aud/iss/exp(+30sn)/nbf, allowlist, fail-closed korunuyor. audit.ts değişmedi (yarış düzeltmesi 8c761ce yeniden doğrulandı). KABUL: guard GERÇEK config ile 12/12 — geçerli OK, token yok 401, bad_aud, bad_iss, expired (exp+31) / skew içi OK (exp+29), bad_signature, not_allowlisted, ADMIN_EMAILS boş → 403, staging AUD boş → misconfigured, bad_key, CANLI JWKS (gerçek kid + sahte imza) → 403; access.test 14/14; audit/JWKS 8/8; setup-access mock 7/7 (dry-run yazmaz, idempotent, app silinmez/AUD korunur, AUD uyuşmazlığı, token log'da yok); workers/api vitest 52/52; pnpm build 0; gerçek e-posta + token kalıbı taraması 0. SCRIPT: scripts/setup-access.mjs canlı Cloudflare API'ye KARŞI ÇALIŞTIRILMADI (token yok; alan adları `destinations` + app-scoped policies doğrulanmadı) → ilk kullanım dry-run. AÇIK: (a) 👤 edge testi §8 (Access'siz pages.dev/admin → 302/403) + önizleme URL'leri (§4.3 adım 2); (b) 👤 `wrangler secret put ADMIN_EMAILS` admin API worker'ı oluşunca (3.9); (c) /admin→Worker bağlama + workers/api admin endpoint'lerinin guard kullanması = 3.4/3.9 (burada yapılmadı); (d) docs §4.1 tablo bdimexport.com hostname'lerini anlatıyor, şu an aktif olan pages.dev — durum tablosu + §12 bunu açıklıyor.
- [2026-10-17] Sonnet 5.5 · Step 3.2 · ✅ — layout/AdminShell/Dashboard/page doğrulandı, hizalandı. DEĞİŞEN: `_lib/nav.ts` (YENİ, saf kural: NAV 7 öğe, effectiveRole default-deny, visibleNav, isBlocked, isActive), `_lib/nav.test.mjs` (YENİ, 7 test), `AdminShell.tsx` (kural nav.ts'ten; DÜZELTİLDİ: önceki `n.href === path` tam eşleşme idi → /admin/leads/42 ve menüde olmayan /admin/content viewer'a AÇIKTI, artık Dashboard dışı her yol admin-only; rol yüklenirken 'yetkiniz yok' yerine 'doğrulanıyor'; hata→viewer + 'rol doğrulanamadı' notu). DOKUNULMADI: layout.tsx, Dashboard.tsx, page.tsx (zaten hizalı). KABUL: viewer yalnız Dashboard (7/7 test: viewer menü=1, bozuk/yok rol→viewer, alt yol+bilinmeyen yol kapalı); dashboard salt-okunur (yalnız useAdminGet GET; POST/PUT/PATCH/DELETE/form/button grep=0; boş durum kartları mevcut); hex=0 (layout/AdminShell/Dashboard/page/css/nav grep=0, renkler tokens→CSS değişkeni); lint 0 hata, build exit 0. EKSİK/NOT: (1) UI rol kapısı güvenlik sınırı DEĞİL — sınır 3.1 guard'ı (viewer mutasyon→403) ve 3.4 API'si; sayfa kabukları static export olduğu için viewer'a JS paketi olarak iner, veri değil. (2) GET /api/admin/me ve /dashboard/summary workers'ta HENÜZ YOK (repo grep=0) → 3.4 teslim etmeli; sözleşme: Me{email,role}, DashboardSummary (api.ts), sorgular queries.ts; /me guard'ın AdminIdentity.role değerini dönmeli. O zamana dek Dashboard 'Veri alınamadı' ve rol=viewer görünür (beklenen, fail-safe). (3) Pano commit'ine insanın önceden yaptığı 3.1/3.9 satır düzenlemeleri de girdi.
- [2026-10-17] Opus 5.5 · Step 3.4 · ⏸ (👤 insan review) — 👤 key politikası ONAYLI (hash-only, tek-sefer gösterim, tier, anında revoke, KV cache, CORS yalnız bdimexport.com, key başına rate limit, süresiz+revoke). commit `bfb5335` (9 dosya; stage kontrol edildi). SAĞLAM: 256-bit rastgele key + SHA-256 hash (yavaş hash gereksiz); ham key karşılaştırılmaz, hash index araması → timing-safe compare gereksiz; tek-sefer gösterim (liste ham key/hash dönmez); tier kontrolü; key başına + bad-auth IP freni 429; CORS tam eşleşme allowlist, credentials yok. BULGU+DÜZELTME: (1) revoke KV yayılımı nedeniyle diğer colo'larda ≤60 sn geçerli kalıyordu → admin-internal artık HİÇ cache'lenmez (her istek D1 = her yerde anında), enjekte admin cache girdisi yok sayılır; read-only/partner ≤60 sn bilinen sınır (testle belgelendi); (2) create/revoke ile audit ayrı yazılıyordu (biri düşerse iz yok) → withAudit tek batch, audit düşerse key oluşmaz, çift revoke tek audit; (3) /admin/api/* router YOKTU → her istek önce 3.1 guard, sonra rota (kimliksiz olmayan yol da 401). YENİ: GET /admin/api/me {email, role} · GET /admin/api/dashboard/summary (sayılar, PII yok, queries.ts sözleşmesi). KABUL: vitest 66/66 (+14 yeni); eski auth/keys ile 2 test FAIL (negatif kontrol; 'admin revoke anında' testi tek-KV ortamında eski kodla da geçer — colo farkını cache-enjeksiyon testi gösterir); tsc 0; wrangler --dry-run bundle (app/admin import'ları dahil) OK; secret taraması 0. KARAR GEREKEN (👤): (a) POST /v1/leads public YOK — OpenAPI'de yok, çağıran form yok, EN/DE GDPR rıza metni yok → bu adımda YAZILMADI; ayrı 🔒 adım önerisi; (b) key başına rate limit 'onaylı değer' sayı olarak verilmedi → varsayılan 60 req/dk (1–10.000); (c) politika 'read-only/full' — kodda 3 tier (read-only/partner/admin-internal), full=admin-internal, partner gelecekteki partner erişimi için. AÇIK: (d) admin UI istemcisi varsayılanı `/api/admin` ama Access + worker `/admin/api` → admin scope'unda düzeltilmeli (api.ts, SettingsForm.tsx) veya build env `NEXT_PUBLIC_ADMIN_API_BASE=/admin/api`; (e) prod [vars] ALLOWED_ORIGINS hâlâ localhost → 3.9 prod env'i bdimexport.com; (f) /admin/api'nin pages.dev'den worker'a bağlanması (Pages Functions proxy veya route) 3.9; (g) analytics/settings handler'ları router'a bağlanmadı (3.7/3.8); (h) 0002 numara çakışması 3.9. OLAY: test sırasında yanlışlıkla `git stash` çalıştırıldı (tüm izlenen değişiklikler ~1 sn stash'e gitti, FAZ_0 panosu + qa/FAZ-0/rapor.md dahil) → hemen `git stash pop`, çakışmasız, 8 dosya diff birebir geri geldi, testler 66/66. Kayıp yok.
- [2026-10-17] Opus 5.5 · Step 3.4 · ✅ — 👤 İNSAN REVIEW ONAYLI (sohbette "review onaylı"). KARARLAR: (1) POST /v1/leads bu adımda YAZILMADI → ayrı 🔒 adım olarak ERTELENDİ (EN/DE GDPR rıza metni hazır olunca, ~FAZ 5); (2) key başına rate limit **60 req/dk** ONAYLI (kodda varsayılan, aralık 1–10.000); (3) 3 tier ONAYLI: read-only · partner (RESERVED) · admin-internal (="full") — **admin-internal dış API tüketicisine ASLA verilmez (FAZ 7.2'de zorlanacak)**. DOĞRULAMA (kapanış, kod değişmedi — `git diff bfb5335` boş): vitest 66/66, admin-keys 14/14 (guard 401/403, /me admin+viewer, summary sözleşmesi = app/admin/_lib/api.ts DashboardSummary birebir, PII yok, cache/revoke/audit, e2e yaşam döngüsü, CORS); tsc 0. İNSAN REVIEW KAYDI: hash SHA-256 (256-bit key) · timing-safe: ham key karşılaştırılmaz, hash index araması · KV invalidation: revoke'ta cache silinir + admin-internal hiç cache'lenmez (≤60 sn colo gecikmesi yalnız read-only/partner) · CORS: tam eşleşme allowlist, credentials yok · admin guard: /admin/api/* her istek 3.1 guardAdminRequest ÖNCE. Bu adımda yalnız pano commit'lendi.
- **TAKİPTE: POST /v1/leads (PII, GDPR rıza bekliyor)** — public lead intake; Opus 5.5 🔒 + insan review; ön koşul: EN/DE GDPR rıza metni (FAZ 5) + KVKK_VERSIONS'a sürümleri; tasarım: Turnstile (ayrı action) + IP rate limit + sunucu-tarafı rıza zorunlu + leads.consent_version/consent_at/double_optin_at (0001 v1.1'de hazır) + OpenAPI'ye eklenmesi.
- [2026-10-17] Opus 5.5 · Step 3.3 · ⏸ (👤 insan review) — commit `3bb0483` (7 dosya, yalnız app/admin/leads/**; stage kontrol edildi). BULGU: page.tsx YER TUTUCUYDU (Kanban hiç yoktu); maskeleme yalnız istemci fonksiyonuydu (ham veri tarayıcıya gidecekti); lead endpoint'i yoktu; wa.me yerel numaradan link üretiyordu ('0555…' → wa.me/0555… yanlış ülke); mailto '?cc=' enjeksiyonuna açıktı; rıza payload.consent'ten okunuyordu (0001 v1.1 kolonları değil); lib .ts uzantısız import (node testi çalışmazdı). YAPILAN: Kanban (4 sütun, HTML5 drag&drop + erişilebilir 'Taşı' seçici); sunucu filtreleri; handler.ts /admin/api/leads* — guard + ADMIN-ONLY (viewer 403, maskeli liste dahil), liste SUNUCUDA maskeli, reveal = audit ÖNCE (lead_pii_reveal, yalnız alan adları; audit düşerse veri yok), status {from,to} withAudit (bayat/yarış 409, audit yok), POST yalnız JSON (CSRF); kanal linki yalnız channel_pref + yalnız reveal yanıtında; wa.me E.164; mailto katı. KABUL: leads.test 12/12 (yetki 401/403, maskeli listede 9 PII değerinden 0'ı, filtre 4 boyut + SQLi etkisiz, status audit kim/eski→yeni, 409 bayat, yarış tek audit, 415 CSRF, reveal audit+değer yok, audit düşerse veri dönmez, kanal yalnız pref, wa.me §5.1 birebir + yerel numara null, mailto enjeksiyonu null); nav: viewer /admin/leads + alt yol engelli; access 14/14, nav 7/7, analytics 2/2; eslint 0; pnpm build 0; hex=0; out/'ta fixture/PII yok. Webhook bildirimi: modülde YOK (N/A). EKSİK/ŞÜPHE: (a) handleLeads workers/api router'ına BAĞLANMADI (api scope — 3.4 router'a /admin/api/leads* ekleme ayrı küçük api adımı veya 3.9); o zamana dek UI 'alınamadı' gösterir; (b) UI tarayıcıda canlı denenmedi (API bağlı değil); (c) RETENTION_DAYS=365 lead saklama süresi 👤 ONAY ister (kvkk-riza-v1 §1.6 yalnız başvuru süresini söyler); (d) saklama süresi dolan lead'leri silen iş yok (FAZ 4.2 TTL cron'una eklenmeli); (e) leads/page.tsx kendi BASE'ini '/admin/api' kullanıyor — _lib/api.ts + SettingsForm hâlâ '/api/admin' (admin scope düzeltmesi bekliyor).
- [2026-10-17] Opus 5.5 · Step 3.3 · ✅ — 👤 İNSAN REVIEW ONAYLI (sohbette "review onaylı"); kod `3bb0483` (değişmedi). AÇIK KALAN (onayın KAPSAMADIĞI): **lead saklama süresi** — kodda RETENTION_DAYS=365 yalnız rozet/uyarı varsayımı, 👤 karar verilmedi (kvkk-riza-v1 §1.6 yalnız başvuru süresini tanımlar); süre dolan lead'leri silen iş YOK → FAZ 4.2 TTL cron'una eklenecek (karar sonrası). Takip: handleLeads'in workers/api router'ına bağlanması (api scope); admin istemci BASE '/api/admin' → '/admin/api' (admin scope).
- [2026-10-17] Opus 5.5 · Step 3.5 · ⏸ (👤 insan review) — commit `90c2514` (5 dosya, yalnız app/admin/partners/**; stage kontrol edildi). BULGU: page.tsx YER TUTUCUYDU (onay akışı yoktu); şemada 'rejected' durumu ve 'sectors_json' kolonu YOK (sector TEXT var); PartnerGrid hiçbir sayfada kullanılmıyor, /en/suppliers sayfası YOK; public partner listesi API key istiyor (read.ts). YAPILAN: handler.ts /admin/api/partners* — guard + admin-only; liste/detay maskeli (iletişim, vergi no); approve (KVKK rızası şart → 422) / reject (gerekçe şart; yalnız approved=0) / unapprove (gerekçe) koşullu UPDATE + withAudit (yarış → 409, audit yok); PATCH yalnız sector/certs/capacity/export_history (+ audit eski/yeni); consent_logo_en'e yazan yol YOK, PATCH'te gelirse 400 consent_read_only; logo: 1 MB (chunked dahil) + magic bytes PNG/JPEG/WebP, beyan≠içerik red, SVG red, sürümlü R2 anahtarı, hata → yeni obje silinir, x-bdx-admin CSRF başlığı. Red durumu audit'ten türetilir (son karar reject_partner). KABUL: partners.test 10/10; FLYWHEEL E2E (scratchpad vitest, commit'siz — workers apply endpoint → handlePartners onay → GET /api/v1/partners read-only key → PartnerGrid renderToStaticMarkup) 3/3: onay → kart görünür (ad/sektör/Verified), red → görünmez, consent=false → <img> yok + ad/sektör var, consent=true → tek <img>; nav viewer /admin/partners engelli; access 14/14, nav 7/7, leads 12/12, analytics 2/2, workers 66/66; eslint 0; build 0; hex=0; out/admin'de PII yok. EKSİK/ŞÜPHE: (a) **/en/suppliers + /de/lieferanten sayfaları YOK** ve PartnerGrid hiçbir sayfaya bağlı değil (fe / en-expert scope) — e2e bileşen düzeyinde kanıtlandı; static export'ta veri build-time (read-only key, secret) veya runtime fetch gerekir → karar 👤; (b) handlePartners workers/api router'ına BAĞLANMADI (api scope); (c) kalıcı `rejected_at`/`reject_reason` kolonu için migration önerisi (api scope) — şimdilik audit'ten türetiliyor; (d) logo public URL tabanı (R2 public domain / media.bdimexport.com) tanımlı değil (3.9); (e) başvuru PDF kataloğunun admin'den görüntülenmesi yok; (f) reddedilen başvuru 1 yıl sonra silinmeli (kvkk-riza-v1 §1.6) → FAZ 4.2 TTL cron'u.
- [2026-10-17] Opus 5.5 · Step 3.6 · ⏸ (👤 insan review) — commit `27e54d1` (9 dosya, yalnız app/admin/content/** + content-factory/**; stage kontrol edildi). SAĞLAM (önceden): onay≠yayın doğru (approve: draft→approved, publish: approved→published ayrı), her yazma withAudit, Input A/B/C doğrulamaları, elle volume = volume_estimated=1, ai_jobs.model NULL (FAZ 4), mock prod D1'de kapalı. BULGU+DÜZELTME: (1) UI HER ZAMAN bellek-içi mock'tu, sunucu handler'ı yoktu (admin-only kontrolü de) → handler.ts + api-client.ts, mock yalnız NEXT_PUBLIC_CONTENT_MOCK=1; (2) yarışta onay/yayın/red 'işlendi' raporluyordu (withAudit dönüşü kullanılmıyordu) → 'stale', updateDraft 409; (3) RSS TTL listesi D1 datetime('now'), kalan saat now() kullanıyordu (iki saat) → tek kaynak; (4) e2e testi uzantısız import yüzünden 1.6'dan beri HİÇ ÇALIŞMIYORDU → .ts import, 7/7; (5) hex ×6 + inline px → CSS modülü; (6) menü /admin/content-factory YER TUTUCUYA gidiyordu, fabrika /admin/content'teydi → menü hedefi fabrikayı gösterir; (7) jobs tablosunda model sütunu yoktu → eklendi; (8) PATCH status/model alanıyla onay/yayın atlatılamaz (400); mock üretim ucu prod'da 404. KABUL: handler.test 7/7 + content.test 7/7 — e2e keyword→ai_jobs(model NULL)→mock→draft→onay=approved (published 0, published_at NULL)→ayrı yayın→published; taslak doğrudan yayınlanamaz; audit sırası create_ai_job→mock_produce→approve×2→publish; TTL 23.9 sa uyarılı / 24 sa uyarısız / dolmuş listede yok; yarış stale + audit yok; viewer 403; CSRF 415. nav: viewer /admin/content-factory + /admin/content engelli; access/nav/leads/partners/analytics yeşil; eslint 0; build 0; hex=0. KARAR GEREKEN (👤): **RSS kaynak CRUD** — şemada kaynak deposu YOK (rss_sources tablosu veya settings anahtarı); migration api scope'unda → FAZ 4.1 (RSS cron) ile birlikte öneriliyor; şimdilik UI'da 'havuz salt-okunur' notu. EKSİK/ŞÜPHE: (a) handleContent workers/api router'ına BAĞLANMADI (api scope; leads + partners + content üçü birlikte bağlanmalı); (b) mock_produce audit'i seedMockDraftForJob batch'inden ayrı yazılıyor (yalnız staging mock'u; prod'da kapalı); (c) içerik onay/yayın UI'ı tarayıcıda canlı denenmedi (API bağlı değil); (d) 'publish' yalnız status değiştirir — PR/build tetikleme FAZ 4.6.
- [2026-10-17] Opus 5.5 · Step 3.6 · ✅ — 👤 İNSAN REVIEW ONAYLI (sohbette "review onayl[ı]"); kod `27e54d1` (değişmedi). AÇIK KALAN (onayın KAPSAMADIĞI): **RSS kaynak CRUD depolaması** — rss_sources tablosu / settings anahtarı yok, migration api scope'u; öneri FAZ 4.1 ile birlikte, 👤 karar verilmedi. TAKİP: handleLeads + handlePartners + handleContent'in workers/api router'ına tek api adımında bağlanması (o zamana dek 3 sayfa canlıda veri göstermez).
- [2026-10-17] Sonnet 5.5 · Step 3.7 · ✅ KOD (canlı OAuth ertelendi) — commit'siz workers/cron-analytics + admin/analytics/handler.ts hizalandı ve COMMİT'LENDİ. DÜZELTİLEN AÇIKLAR: (1) worker `/sync` anonim tetiklenebiliyordu → artık POST + Bearer SYNC_TOKEN (Secret, sabit-zamanlı karşılaştırma; tanımsızsa KAPALI/403); backfill.mjs SYNC_TOKEN env ister. (2) credential yokken/tüm kaynaklar boşken satır null ile yazılıp MEVCUT veriyi eziyordu → artık yazılmaz (skipped: no_credentials / no_data + alarm). (3) handler viewer'a da açıktı → admin-only (viewer 403). (4) page.tsx'te hardcoded hex/rgba ve inline stil vardı → CSS sınıfları + tokens; Chart.js yoktu → eklendi. YENİ: eksik gün otomatik backfill (cron: dün + son 7 günde olmayan günler, çalışmada en çok 3); `findMissingDays/syncWithBackfill/configuredSources`; `AnalyticsChart.tsx` (chart.js, tokens renkleri, lazy import); boş durum 'Veri OAuth bağlanınca'. chart.js ^4.5.1 → package.json + pnpm-lock. KABUL: worker vitest 14/14 + tsc temiz; admin analytics testi 3/3 (viewer 403, boş diziler); root lint 0 hata; build yeşil; hex/rgba grep=0; secret taraması (regex, gitleaks binary yok) temiz; TARAYICI: boş veri → 'Veri OAuth bağlanınca' kartları render, dolu veri → 2 Chart.js canvas (lead kaynağı + top sayfa) render, viewer → 'yetkiniz yok'. CANLI OAUTH ERTELENDİ (kodda `TODO(3.9/FAZ 6)` + docs/analytics-setup.md §4): GSC/GA4/Meta credential girişi + 1 gün D1 verisi doğrulaması trafik/property hazır olunca. NOT/EKSİK: (a) `/api/admin/analytics/summary` ve `/me` router'a bağlama 3.4'te (handler hazır, test ediliyor). (b) wrangler.toml `database_id` placeholder'ları 3.9. (c) Scope dışı ama zorunlu: root package.json + pnpm-lock (chart.js) ve app/admin/admin.module.css (analitik sınıfları). (d) pnpm add 'ignored build scripts' uyarısı (önceki açık CI riski, chart.js build script'i yok). (e) Meta/CF istemcilerinde `any` kullanımı sürüyor (tsc geçer).
- [2026-10-17] Sonnet 5.5 · Step 3.8 · ✅ KOD — settings/* doğrulandı + istenen kapsama genişletildi. BULGULAR: (1) `settings.test.mjs` ÇALIŞMIYORDU (uzantısız import → ERR_MODULE_NOT_FOUND; 3.8 kabul testi hiç koşmamıştı) → import'lar `.ts`'e çekildi, 5/5 geçti. (2) secret reddi YALNIZ Turnstile anahtarında, alan adıyla vardı; diğer anahtarlarda fazladan alanlar sessizce atılıyordu → GENEL `assertNoSecrets` (alan adı + değer biçimi: PEM/JWT/Slack-Discord webhook/GitHub/AWS/Google/Stripe/Meta/uzun hex; her derinlik) store.updateSetting'te TÜM anahtarlar için doğrulayıcıdan önce. (3) handler GET viewer'a açıktı → admin-only. EKLENEN ayar anahtarları (schema+store+UI): `contacts` (WA E.164/TG/WeChat/e-posta; boş=tanımsız, uydurma yok), `experts` (isim/locale/foto: https veya /media/, javascript:/data:/http/IP/localhost/'..' red), `rssSources` (3.6 Input B ile ORTAK depo; https+genel alan adı, SSRF/iç adres/kimlik bilgisi/secret-sorgu red), `webhooks` (URL secret içerir → panele GİRMEZ; yalnız Workers secret ADI `*_WEBHOOK_URL` + olay listesi; url/secret alanı red). `ratelimit-view.ts` (YENİ): salt-okunur, admin-only, KV `rl:*` mevcut+önceki pencere, IP MASKELİ (KVKK), yazma/silme yok. channels.ts: `channelHref/reachableChannels/publicChannelConfig` (yalnız ayardan link; boş kanal düşer; webhook/rss/turnstile/rateLimits public projeksiyona sızmaz). KABUL: secret-yazma reddi ÇALIŞIR — her 7 anahtarda secret alanı → 422/ValidationError, ayar+audit yazılmaz (test), GET yanıtında secret değeri yok (yalnız varlık bayrağı); ayar audit'e (update_setting, eski/yeni, atomik withAudit) — contacts+rssSources testi; yeni testler `settings.ext.test.mjs` 15 + eski 5 + nav 7 + access e2e = 41/41; lint 0 hata; build yeşil; hex/rgba=0. KANAL DEĞİŞİMİ: ortak lib hazır ve testli (ayar değişince `reachableChannels` anında yeni link verir) AMA public bileşene BAĞLI DEĞİL — `lib/ui/ChannelCta.tsx` hâlâ statik `VARIANTS` + `#contact` kullanıyor (static export → ayar runtime'da okunmalı). Gerekenler: (a) public okuma ucu (`publicChannelConfig` projeksiyonu; workers/api scope), (b) ChannelCta'nın bunu okuması (fe scope, lib/ui). Bu adımda scope dışı → YAPILMADI; ayrı adım önerilir. AÇIK/👤: (i) `db/migrations/0003_settings.sql` COMMİT'SİZ ve 'İNSAN REVIEW BEKLİYOR' etiketli (api scope) — settings canlıda bu tabloya bağlı; commit/uygulama 3.9. (ii) `/settings`, `/settings/rate-limits` ve 3.2'nin /me router'a bağlanması api adımında. (iii) RSS depolaması: 3.6'daki açık 👤 kararın ('rss_sources tablosu / settings anahtarı') pratik cevabı olarak `settings.rssSources` seçildi — insan onayı/ itirazı bekler; FAZ 4.1 cron bu anahtarı okumalı. (iv) Turnstile site-key ile secret aynı biçimde → değer biçiminden ayırt edilemez; yalnız alan adı koruması var. (v) Foto yükleme (R2) yok, yalnız URL.

---

## 5. İNSAN AKSİYON NOKTALARI (👤 — bu faz en insan-yoğun)

1. **3.1:** Cloudflare Zero Trust'ta Access uygulaması kurulumu + Google OAuth + admin hesapları. *(Kod review'u Opus yapar; panel kurulumu senin.)*
2. **3.4:** API key politikası onayı.
3. **3.6:** İçerik Fabrikası UI güvenlik review onayı.
4. **3.7:** GSC/GA4/Meta OAuth credential girişi (Cloudflare Secrets).
5. **3.9:** Cloudflare secret girişleri (D1 token, mail key).
6. **3.1/3.3/3.5 + 3.11:** Opus güvenlik review özetlerini onayla → 3.11 toplu imza.
7. **3.12:** "devam et" → FAZ 4.
8. **Dal:** FAZ 3 feature dalında; faz sonunda main'e squash-merge.

> **Not:** Cloudflare Access/OAuth/secret gibi insan-altyapı kapıları hazır değilse, Opus kod review'ları + commit'ler yine ilerler; yalnız "canlı" doğrulama (e2e Access, gerçek OAuth verisi) o kapı tamamlanınca yapılır. Hangi kapıları şimdi açacağını söyle.
