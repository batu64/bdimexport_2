# Deploy Rehberi — staging → 👤 tetik → production (FAZ_3 3.9)

**Sürüm:** 1.0 · 2026-10-17 · Opus 5.5 · **Uygulayan:** İNSAN (Cloudflare hesabı sahibi). Agent komutları ve config'i hazırladı; panele/hesaba girmez.
**Config:** `workers/api/wrangler.toml` (`[env.staging]` / `[env.production]` — remote ortamların TEK kaynağı) · kök `wrangler.toml` yalnız yerel.
**Secret listesi:** `docs/secret-envanteri.md` · **Access:** `docs/access-setup.md`

> **Değişmez kurallar**
> 1. Secret **DEĞERİ** hiçbir dosyaya, commit'e, sohbete, log'a yazılmaz → `wrangler secret put` interaktif sorar.
> 2. **Production D1'e e2e/test yazımı YASAK.** Prod'da yalnız **salt-okunur smoke** (§6). Yazan testler staging'de.
> 3. Prod deploy'u **insan tetikler** (§6). Env'siz `wrangler deploy` bilinçli olarak başarısız olur (üst seviye `local-dev`).
> 4. Migration yalnız ileri yönlü: `--local` → `--env staging --remote` → (👤) `--env production --remote`.

Tüm komutlar **`workers/api` dizininden** çalıştırılır: `cd workers/api`

---

## 0. Ortamlar

| | Yerel | Staging | Production |
| :-- | :-- | :-- | :-- |
| Worker adı | `wrangler dev` | `bdimexport-api-staging` | `bdimexport-api` |
| D1 | `local-dev` | `bdimexport-db-staging` | `bdimexport-db` |
| KV `CACHE` | `local-dev` | `REPLACE_ME_STAGING_KV_ID` | `REPLACE_ME_PROD_KV_ID` |
| R2 `MEDIA` | yerel | `bdimexport-media-staging` | `bdimexport-media` |
| Access AUD | — | boş (admin API 403 — bilinçli) | `a75b…2fea` |
| Mock içerik üretimi | — | açık (`CONTENT_MOCK_PRODUCE=1`) | **kapalı** |
| Test yazımı | serbest | serbest | **YASAK** |

---

## 1. Ön koşul (bir kez)

```
cd workers/api
npx wrangler login          # tarayıcıda Cloudflare hesabınla onayla
npx wrangler whoami         # doğru hesap mı?
```

## 2. D1 veritabanlarını oluştur ve ID'leri yaz

```
npx wrangler d1 create bdimexport-db-staging
npx wrangler d1 create bdimexport-db
```
Her komut `database_id = "xxxxxxxx-xxxx-…"` basar. `workers/api/wrangler.toml` içinde:
- `[[env.staging.d1_databases]]` → `REPLACE_ME_STAGING_D1_ID` yerine staging ID'si
- `[[env.production.d1_databases]]` → `REPLACE_ME_PROD_D1_ID` yerine prod ID'si

ID gizli değildir (erişim için API token gerekir) → bu değişikliği commit'leyebilirsin ya da agent'a "ID'leri girdim" de, commit'i agent atar.

**Migration'ları uygula** (önce staging, kontrol et, sonra prod):
```
npx wrangler d1 migrations list  bdimexport-db-staging --env staging --remote
npx wrangler d1 migrations apply bdimexport-db-staging --env staging --remote
npx wrangler d1 migrations apply bdimexport-db --env production --remote      # 👤 staging temizse
```
Beklenen sıra: `0001_init` → `0002_admin_audit_integrity` → `0002_partners_apply` → `0003_settings` (hepsi ✅).
⚠️ İlk remote apply'dan sonra bu dosyalar **dondurulur** — sonraki her şema değişikliği yeni migration olur. (İki dosyanın aynı `0002` numarasını taşıması wrangler'da alfabetik sırayla sorunsuz çalışır; yeniden numaralandırma istenirse bu adımdan ÖNCE yapılmalı.)

## 3. KV namespace'leri

```
npx wrangler kv namespace create CACHE --env staging
npx wrangler kv namespace create CACHE --env production
```
Çıktıdaki `id = "…"` → `REPLACE_ME_STAGING_KV_ID` / `REPLACE_ME_PROD_KV_ID` yerine.

## 4. R2 bucket'ları

```
npx wrangler r2 bucket create bdimexport-media-staging
npx wrangler r2 bucket create bdimexport-media           # zaten varsa atla
npx wrangler r2 bucket create bdimexport-backups         # ÖZEL — yedekler (§7)
```
Panel: **R2 → bdimexport-backups → Settings**: Public access **KAPALI** · **Object lifecycle rules → Add rule**: prefix `d1/`, "Delete objects after **90** days".

## 5. Secret'lar (değer wrangler'a interaktif yazılır)

**Zorunlu:**
```
npx wrangler secret put TURNSTILE_SECRET --env staging
npx wrangler secret put TURNSTILE_SECRET --env production
npx wrangler secret put ADMIN_EMAILS     --env production     # virgülle, boşluksuz; Access policy ile AYNI liste
npx wrangler secret put ADMIN_EMAILS     --env staging        # staging Access app'i kurulana dek etkisiz (AUD boş)
```
- `TURNSTILE_SECRET`: Cloudflare → **Turnstile** → site (bdimexport) → **Settings → Secret Key**. Site'nin **Hostname management** listesinde `bdimexport.pages.dev`, `bdimexport.com`, `www.bdimexport.com` olsun (worker `TURNSTILE_HOSTNAMES` ile aynı).
- Kontrol: `npx wrangler secret list --env production` (yalnız adları listeler).

**Opsiyonel / ertelenebilir** (şimdi girme — özellik kodu FAZ 6 / sonrası):
- Mail (`RESEND_API_KEY` / `BREVO_API_KEY`) — kodda henüz referans yok.
- GSC/GA4/Meta (`GOOGLE_PRIVATE_KEY`, `META_ACCESS_TOKEN` …) — `workers/cron-analytics`, FAZ 6 (`docs/analytics-setup.md`).
- `CF_API_TOKEN` (analitik, yalnız okuma) — FAZ 6.

## 6. Deploy pipeline (staging test → 👤 tetik → prod)

**6.1 Yerel kapı (her deploy öncesi):**
```
npx vitest run && npx tsc --noEmit                       # workers/api
npx wrangler deploy --dry-run --env production --outdir /tmp/bdx-dry   # binding'leri gör, yayınlamaz
```
**6.2 Staging:**
```
npx wrangler deploy --env staging
```
Staging'de serbest test (yazma dahil): başvuru formu (Turnstile test anahtarlarıyla), API key yaşam döngüsü, İçerik Fabrikası mock üretimi.

**6.3 👤 Tetik — production:** staging temiz + insan onayı → 
```
npx wrangler deploy --env production
```
**6.4 Production smoke — YALNIZ OKUMA** (`<prod>` = deploy çıktısındaki URL, örn. `https://bdimexport-api.<subdomain>.workers.dev`):
```
curl -s  <prod>/api/v1/health                        # {"ok":true}
curl -s  "<prod>/api/v1/contents?limit=1"            # 200, draft içermez
curl -si <prod>/api/v1/partners | head -1             # 401 (key yok)
curl -si <prod>/admin/api/me | head -1                # 401 no_access_token (workers.dev'de Access yok — beklenen)
curl -si -H "Origin: https://evil.example" <prod>/api/v1/health | head -1   # 403 origin_not_allowed
```
POST/PUT/DELETE **gönderme**. Başvuru formunun gerçek gönderim testi staging'de yapılır.

**6.5 Geri alma:**
```
npx wrangler deployments list --env production
npx wrangler rollback --env production                         # önceki sürüme
npx wrangler d1 time-travel restore bdimexport-db --env production --timestamp <ISO>   # veri geri dönüşü (son çare)
```

## 7. Haftalık D1 → R2 yedeği (production)

Betik: `scripts/d1-backup.sh` — yalnız **okur** (export), gzip'ler, `bdimexport-backups/d1/production/…sql.gz` olarak yükler. Varsayılan DRY-RUN.
```
bash ../../scripts/d1-backup.sh            # ne yapacağını gösterir
bash ../../scripts/d1-backup.sh --apply    # CLOUDFLARE_API_TOKEN + CLOUDFLARE_ACCOUNT_ID env'de olmalı
```
**Zamanlama (GitHub Actions):** `.github/workflows/nightly.yml` FAZ 0.7 scope'unda ve şu an devre dışı; bu adımda değiştirilmedi. Etkinleştirirken aşağıdaki işi ekle (pazartesi 02:00 TR):
```yaml
# .github/workflows/d1-backup.yml (öneri — 0.7/CI adımında eklenecek)
name: D1 weekly backup
on:
  schedule: [{ cron: "0 23 * * 0" }]   # Pazar 23:00 UTC = Pazartesi 02:00 TR
  workflow_dispatch:
permissions: { contents: read }
jobs:
  backup:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: pnpm/action-setup@v4
      - uses: actions/setup-node@v4
        with: { node-version: 22 }
      - run: pnpm install --frozen-lockfile
        working-directory: workers/api
      - run: bash scripts/d1-backup.sh --apply
        env:
          CLOUDFLARE_API_TOKEN: ${{ secrets.CLOUDFLARE_API_TOKEN }}
          CLOUDFLARE_ACCOUNT_ID: ${{ secrets.CLOUDFLARE_ACCOUNT_ID }}
```
Doğrulama: R2 → bdimexport-backups → `d1/production/` altında dosya + boyutu > 0. Ayda bir: yedeği **staging**'e geri yükleyip (`wrangler d1 execute bdimexport-db-staging --env staging --remote --file …`) okunabildiğini dene — **prod'a değil**.

## 8. Pages (site + /admin arayüzü) ve Access doğrulaması (3.1 devri)

**8.1 Pages önizlemelerini Access arkasına al:** dash → **Workers & Pages → bdimexport (Pages) → Settings → General → Access policy → Enable access policy**. Bu `*.bdimexport.pages.dev` önizleme deploy'larını korur. (Üretim `bdimexport.pages.dev/admin` zaten Access app'inde — docs/access-setup.md §4.3.)

**8.2 Build ortam değişkenleri:** Pages → **Settings → Environment variables → Production**:
| Ad | Değer |
| :-- | :-- |
| `NEXT_PUBLIC_API_BASE` | §6.3 deploy çıktısındaki prod worker URL'i |
| `NEXT_PUBLIC_TURNSTILE_SITE_KEY` | Turnstile site key (public) |
| `NEXT_PUBLIC_ADMIN_API_BASE` | `/admin/api` |
`NEXT_PUBLIC_CONTENT_MOCK` production'da **tanımlanmaz**.

**8.3 Deploy:** Pages → **Deployments → Retry deployment** (veya main'e push sonrası otomatik). Build komutu `pnpm build`, çıktı dizini `out`.

**8.4 Gizli pencere edge testi** (docs/access-setup.md §8 tablosunu doldur):
1. `https://bdimexport.pages.dev/admin` → Google girişi (içerik değil)
2. İzinli hesap → /admin açılır; izinsiz hesap → "You don't have access"
3. `https://bdimexport.pages.dev/admin/leads` (yeni gizli pencere) → yine giriş
4. Bir önizleme URL'i `https://<hash>.bdimexport.pages.dev/admin` → giriş
5. Agent'a "edge testi geçti" de → agent `curl -sI` ile 302'yi doğrular ve 3.1'i kapatır.

**8.5 ⚠️ Bilinen sınır — /admin/api yönlendirmesi:** Admin arayüzü API'yi aynı origin'de `/admin/api/*` olarak çağırır. `pages.dev` alan adında Workers route tanımlanamaz → arayüz şu an veri **alamaz** ("Veri alınamadı" — fail-safe). Çözüm (ayrı api adımı, bu rehberin dışında):
- (a) Pages Functions proxy: `functions/admin/api/[[path]].ts` → service binding ile `bdimexport-api` worker'ına; veya
- (b) custom domain bağlanınca Workers route `bdimexport.com/admin/api/*` → `bdimexport-api` (docs/access-setup.md §12).
Ayrıca leads/partners/content handler'ları henüz worker router'ına bağlı değil (şu an yalnız `/me` + `/dashboard/summary`).

## 9. Kayıt (insan doldurur)

| # | Adım | Tarih | Sonuç |
| :-- | :-- | :-- | :-- |
| 1 | §2 D1 staging + prod oluşturuldu, ID'ler wrangler.toml'da | | |
| 2 | §2 migration staging ✅ / prod ✅ | | |
| 3 | §3 KV staging + prod | | |
| 4 | §4 R2 media + backups (+ lifecycle 90 gün) | | |
| 5 | §5 TURNSTILE_SECRET + ADMIN_EMAILS (`secret list` ile kontrol) | | |
| 6 | §6.2 staging deploy + test | | |
| 7 | §6.3 👤 prod deploy + §6.4 smoke | | |
| 8 | §7 ilk yedek `--apply` + R2'de dosya | | |
| 9 | §8.1 Pages Access policy toggle | | |
| 10 | §8.2–8.4 Pages env + deploy + edge testi | | |
