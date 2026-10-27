# Secret Envanteri — bdimexport.com (FAZ_3 3.9)

**Sürüm:** 1.0 · 2026-10-17 · Opus 5.5 · Kaynak: koddaki `env.*` okumaları (`workers/api/src/types.ts`, `workers/cron-analytics/src/types.ts`, `app/admin/**/handler.ts`) + `.github/workflows/*`
**Kural:** Bu dosyada hiçbir **DEĞER** yoktur ve olmayacaktır. Yalnız ad · nerede · kim girer · ne zaman gerekli. Değerler: Cloudflare (Workers Secret / Pages env), GitHub Secrets, yerelde gitignore'lu dosyalar ve parola yöneticisi.
**Girme komutu:** `wrangler secret put <AD> --env <staging|production>` (wrangler değeri interaktif sorar → komut satırına / shell geçmişine yazılmaz).

Durum: 🔴 zorunlu (yoksa özellik kapalı/403) · 🟡 opsiyonel/ertelenebilir · ⚪ public config (secret değil, envanterde bütünlük için)

---

## 1. `workers/api` (bdimexport-api / bdimexport-api-staging)

| Ad | Tür | Ortam | Kim girer | Durum | Yoksa ne olur |
| :-- | :-- | :-- | :-- | :-- | :-- |
| `TURNSTILE_SECRET` | Workers Secret | staging, production | 👤 insan (Cloudflare → Turnstile → site → Secret Key) | 🔴 | Başvuru formu fail-closed **403** (`turnstile_unverifiable`) |
| `ADMIN_EMAILS` | Workers Secret (kişisel veri) | staging, production | 👤 insan | 🔴 | `/admin/api/*` herkese **403** `not_allowlisted` |
| `VIEWER_EMAILS` | Workers Secret (kişisel veri) | staging, production | 👤 insan | 🟡 | Viewer rolü yok (yalnız admin) |
| `ACCESS_TEAM_DOMAIN` | var (wrangler.toml) | staging, production | agent (girildi) | ⚪ | 403 `misconfigured` |
| `ACCESS_AUD` | var (wrangler.toml) | production (staging bilinçli boş) | agent (girildi) | ⚪ | 403 `misconfigured` |
| `ALLOWED_ORIGINS`, `TURNSTILE_HOSTNAMES`, `KVKK_VERSIONS`, `RL_*`, `KEY_CACHE_TTL_S` | var | her env | agent | ⚪ | — |
| `CONTENT_MOCK_PRODUCE` | var | **yalnız staging** (`"1"`) | agent | ⚪ | prod'da tanımlanmaz → mock üretim ucu 404 |
| `GITHUB_PUBLISH_TOKEN` | Workers Secret | staging, production | 👤 insan (GitHub → Settings → Developer settings → **Fine-grained token**: yalnız `batu64/bdimexport`, izin **Contents: Read and write** + **Pull requests: Read and write**, süre ≤ 90 gün) | 🟡 (yoksa DRY-RUN) | FAZ_4 4.6 yayın botu PR açamaz → "Yayına hazırla" yalnız PR planı kaydeder (`publications.state=dry_run`) |
| `GITHUB_REPO`, `GITHUB_BASE_BRANCH` | var (wrangler.toml) | staging, production | agent | ⚪ | base dal = Pages production dalı (👤 doğrula) |

Yerel geliştirme: aynı adlar `workers/api/.dev.vars` (gitignore'lu: `workers/api/.gitignore`).

## 2. `workers/cron-analytics` (FAZ_3 3.7 — canlı OAuth FAZ 6'ya ertelendi)

| Ad | Tür | Kim girer | Durum | Not |
| :-- | :-- | :-- | :-- | :-- |
| `CF_API_TOKEN` | Workers Secret | 👤 | 🟡 | İzin: Account Analytics › Read (yalnız okuma). **Deploy token'ı ile AYNI OLMASIN** |
| `CF_ACCOUNT_ID`, `CF_PAGES_PROJECT` | var | agent/👤 | ⚪ | |
| `GOOGLE_SERVICE_ACCOUNT_EMAIL` | var | 👤 | 🟡 | GSC/GA4 — FAZ 6 |
| `GOOGLE_PRIVATE_KEY` | Workers Secret (PEM) | 👤 | 🟡 | Servis hesabı anahtarı — FAZ 6; yalnız okuma rolü |
| `GSC_SITE_URL` | var | 👤 | 🟡 | |
| `META_ACCESS_TOKEN` | Workers Secret | 👤 | 🟡 | Meta Marketing API — FAZ 6.5 |
| `META_AD_ACCOUNT_ID` | var | 👤 | 🟡 | |
| `SYNC_TOKEN` | Workers Secret | 👤 (rastgele üret: `openssl rand -base64 32`) | 🟡 | Elle tetikleme ucunun korunması |
| `ANALYTICS_ALERT_WEBHOOK_URL` | Workers Secret | 👤 | 🟡 | Slack/Discord URL'i secret'tır — **ayarlar paneline yazılmaz** (0003 + schema.ts reddeder); panelde yalnız ADI tutulur |

⚠️ `workers/cron-analytics/wrangler.toml`'da henüz `[env.production]` YOK (bu adımın scope'u dışında; FAZ 6 credential adımında eklenecek).

## 3. Cloudflare Pages (bdimexport projesi) — build env (hepsi PUBLIC, build'e gömülür)

| Ad | Değer kaynağı | Durum | Not |
| :-- | :-- | :-- | :-- |
| `NEXT_PUBLIC_API_BASE` | api worker URL'i (`https://bdimexport-api.<subdomain>.workers.dev` → sonra `https://api.bdimexport.com`) | 🔴 | Yoksa başvuru formu "şu an alınamıyor" (1.6) |
| `NEXT_PUBLIC_TURNSTILE_SITE_KEY` | Turnstile site key (public) | 🔴 | Yoksa form kapalı |
| `NEXT_PUBLIC_ADMIN_API_BASE` | `/admin/api` | 🔴 | `_lib/api.ts` + `SettingsForm` varsayılanı hâlâ `/api/admin` (yanlış) → **bu env girilmeli** |
| `NEXT_PUBLIC_CONTENT_MOCK` | yalnız önizleme/staging'de `1` | ⚪ | prod'da **tanımlama** |

`NEXT_PUBLIC_*` değişkenlerine asla secret koyma — tarayıcı paketine girer.

## 4. GitHub Actions (repo → Settings → Secrets and variables → Actions)

| Ad | Kullanan | İzin (en az yetki) | Durum |
| :-- | :-- | :-- | :-- |
| `CLOUDFLARE_API_TOKEN` | deploy + `scripts/d1-backup.sh` (yedek workflow'u) | Workers Scripts › Edit · D1 › Edit · Workers R2 Storage › Edit · (Pages › Edit gerekirse) | 🔴 (yedek/CI deploy için) |
| `CLOUDFLARE_ACCOUNT_ID` | aynı | — | 🔴 |
| `GITHUB_TOKEN` | gitleaks-action | otomatik | ⚪ |

## 5. Ops / tek seferlik (yalnız insanın terminal oturumunda; hiçbir yere kaydedilmez)

| Ad | Kullanan | İzin | Not |
| :-- | :-- | :-- | :-- |
| `CLOUDFLARE_API_TOKEN` (ayrı token) | `scripts/setup-access.mjs` | Access: Apps and Policies › Edit + Access: Organizations, IdP, Groups › Read | Deploy token'ından AYRI; işi bitince panelden iptal et |
| Google OAuth Client Secret | Zero Trust → Login methods → Google | — | Cloudflare'de saklanır; repo/sohbet YOK (docs/access-setup.md §3) |
| bootstrap admin API key | `workers/api/scripts/new-key.mjs` | — | Ham key bir kez stderr'e basılır → parola yöneticisi; D1'de yalnız hash |

## 6. Ertelenen / henüz kodda olmayan

| Ad | Ne zaman |
| :-- | :-- |
| `RESEND_API_KEY` / `BREVO_API_KEY` (mail) | Bildirim e-postası kodu yazılınca — kodda referans YOK (🟡 ertelendi) |
| `GEMINI_API_KEY` (secret) + `GEMINI_MODEL` (var) | Kodda **referanslı** (workers/cron-rss — 4.4/4.5, `TODO(E3)` stub); DEĞER projenin EN SONUNDA (AGENTS.md §9, ERTELENEN E3). `ENRICH_MODE`/`ARTICLE_MODE` = `off`/`mock` (secret değil) |

## 7. Hijyen kuralları
1. Her token tek amaçlı ve en az yetkili; deploy · analitik · Access-ops token'ları **ayrı**.
2. Rotasyon: personel değişimi / sızıntı şüphesinde hemen; aksi halde 6 ayda bir (FAZ 9.5 periyodik denetim).
3. Sızıntı şüphesi: Cloudflare/GitHub'da iptal → yeni değer `wrangler secret put` → deploy → `gitleaks` geçmiş taraması.
4. Bu dosyaya yeni secret eklemeden kod birleştirilmez (qa-gate: envanter çapraz kontrolü 3.10'da).
