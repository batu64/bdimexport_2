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
| 1 | 3.1 Cloudflare Access + admin auth 🔒 | **Opus 5.5** | — + 👤 | ⏸ Access kuruldu + config bağlandı (commit `6c8a754`) — 👤 review onayı + edge testi (§8) bekliyor | Opus 5.5 · 2026-10-17 |
| 2 | 3.2 Admin iskelet + Dashboard | **Sonnet 5.5** | 3.1 | ✅* mevcut — doğrula/hizala | — |
| 3 | 3.4 /api/v1 gateway + API key 🔒 | **Opus 5.5** (read: Sonnet) | 3.1 + 👤 | ⚠️ workers/api mevcut — Opus key/auth review + 👤 key politikası | — |
| 4 | 3.3 Lead Kanban (KVKK verisi) 🔒 | **Opus 5.5** | 3.2 + 👤 | ⚠️ leads/* mevcut — Opus KVKK review | — |
| 5 | 3.5 Partner CRUD + logo onay 🔒 | **Opus 5.5** | 3.2 | ⚠️ partners/* mevcut — Opus review (flywheel kapısı) | — |
| 6 | 3.6 İçerik Fabrikası UI 🔒 | **Opus 5.5** (rss okuma: Sonnet) | 3.4 | ⚠️ content/* mevcut — Opus review + 👤 | — |
| 7 | 3.7 Analitik çekim cron + dashboard | **Sonnet 5.5** | 3.4 + 👤 | ⚠️ cron-analytics + admin/analytics COMMIT'SİZ — hizala+commit + 👤 OAuth | — |
| 8 | 3.8 Turnstile/rate-limit admin + Ayarlar | **Sonnet 5.5** | 3.5, 3.6 | ✅* settings/* mevcut — doğrula | — |
| 9 | 3.9 staging/prod + credential 🔒 | **Opus 5.5** | 3.4 + 👤 | ⏳ wrangler local-dev placeholder — ayrım + 👤 secret | — |
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
