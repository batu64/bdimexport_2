# Cloudflare Access Kurulum Rehberi — /admin (FAZ_3 Step 3.1)

**Sürüm:** 2.1 · 2026-10-17 · Opus 5.5 — kurulum yapıldı, config bağlandı (v2.0: 2026-10-16 review)
**Uygulayan:** İNSAN (Cloudflare + Google hesabı sahibi). Agent yalnızca bu rehberi ve şablonu üretir; panele giriş yapmaz.
**İlgili dosyalar:** `app/admin/middleware.ts` (JWT doğrulama) · `app/admin/audit.ts` (audit) · `app/admin/access.config.template.json` (panel şablonu) · `db/migrations/0002_admin_audit_integrity.sql`

> **Kural:** Bu rehberde geçen hiçbir **değeri** (Client Secret, e-posta listesi, AUD) sohbete, repoya veya commit mesajına yazma. Yalnızca §8'deki test tablosunu doldurup "kurulum tamam" de; doğrulamayı agent `curl` ile yapar.

---

## ✅ Mevcut kurulum durumu (2026-10-17)

| Öğe | Değer / durum |
| :-- | :-- |
| Zero Trust team domain | `bdimexport.cloudflareaccess.com` (JWKS canlı: 2 RS256 anahtar — `…/cdn-cgi/access/certs`) |
| Access app | `bdimexport-admin` · self-hosted · **edge gate aktif** (👤 kuruldu) |
| App domain (geçici) | `bdimexport.pages.dev/admin` — custom domain bağlanınca §12 |
| AUD tag | `a75b6ebb930d4c5b56b63e811bb7ca719ae2a78b916d7239477290ffda542fea` |
| Admin allowlist | 1 e-posta — **değer repoda yok** (kişisel veri; §7) |
| Viewer allowlist | boş |
| Guard config | `workers/api/wrangler.toml` `[vars]`: `ACCESS_TEAM_DOMAIN`, `ACCESS_AUD` bağlı · `ADMIN_EMAILS` → secret (§7) |
| Admin API Worker | henüz yok — `/admin/api/*` bağlama + guard kullanımı FAZ 3.4 / 3.9 |
| Canlı edge testi | 👤 §8 tablosu (insan) |

---

## 0. Güvenlik modeli — neyi koruyoruz, nasıl?

| Katman | Nerede | Ne yapar |
| :-- | :-- | :-- |
| **1. Cloudflare Access** (edge) | Cloudflare, isteğin sitene ulaşmasından ÖNCE | Google ile giriş + izinli e-posta politikası. Geçemeyen tarayıcı Google girişine yönlendirilir, siteye hiç ulaşamaz. |
| **2. Uygulama** (`middleware.ts`) | Admin API (Worker, FAZ 3.9) | Access'in eklediği `Cf-Access-Jwt-Assertion` imzalı token'ını doğrular (RS256 imza, `iss`, `aud`, `exp`, `nbf`) + e-posta allowlist + viewer salt-okunur. Token yok → **401**; geçersiz → **403**. Yapılandırma eksikse de **403** (fail-closed). |

İki katman birbirinin yedeğidir: Access yanlış yapılandırılsa da API veriyi vermez; API'ye Access'i atlayarak (ör. `workers.dev`) gidilse de imzalı token olmadığı için 401 döner.

**Mevcut mimari gerçeği (önemli):** Site `output: "export"` ile **statik** üretilir ve **Cloudflare Pages** sunar. `/admin` sayfaları da statik HTML'dir (veri içermez; veriyi admin API'den çeker). Admin API Worker'ı henüz deploy edilmedi (FAZ 3.9). Bu yüzden:
- Bugün Access, `/admin` **arayüzünü** korur.
- Admin API deploy edildiğinde **aynı Access uygulamasının altındaki** `/admin/api/*` yoluna bağlanmalıdır (§7).
- `bdimexport.pages.dev` alan adı `bdimexport.com` için kurulan Access uygulamasının **dışında kalır** → §4.3'te ayrıca kapatıyoruz.

---

## 1. Ön koşullar (kontrol listesi)

- [ ] `bdimexport.com` Cloudflare'de aktif zone; DNS kaydı **Proxied (turuncu bulut)**. Gri bulut = Access çalışmaz.
- [ ] Pages projesinde `bdimexport.com` custom domain olarak bağlı.
- [ ] Admin olacak kişilerin **Google hesabı e-postaları** (Gmail veya Workspace). Her hesapta **2 adımlı doğrulama AÇIK**.
- [ ] Google Cloud Console erişimi (aynı veya ayrı bir Google hesabı olabilir).

---

## 2. Zero Trust team domain (bir kez)

1. `dash.cloudflare.com` → sol menü **Zero Trust**.
2. İlk girişte **team name** istenir. Öneri: `bdimexport`. Team domain şu olur: `bdimexport.cloudflareaccess.com`.
   - Zaten kurulduysa: **Zero Trust → Settings → Custom Pages** (veya **Settings → General**) sayfasında **Team domain** yazar.
3. Plan: **Free** (50 kullanıcıya kadar ücretsiz; kart bilgisi istenebilir, ücret çekilmez).

📋 **Not al →** `ACCESS_TEAM_DOMAIN` = `<team>.cloudflareaccess.com` (şemasız, `https://` YOK).

---

## 3. Google OAuth (iki taraf)

### 3.1 Google Cloud Console tarafı
Konsol arayüzünde menü adları "APIs & Services" veya "Google Auth Platform" olarak görünebilir; adımlar aynıdır.

1. `console.cloud.google.com` → üstten **proje seç → New Project** → ad: `bdimexport-access` → **Create**.
2. **OAuth consent screen** (Google Auth Platform → **Branding / Audience**):
   - User type: **External** (Workspace kullanıyorsan ve yalnız kendi alan adın girecekse **Internal** seç — daha güvenli).
   - App name: `Bdimexport Admin` · User support email: kendi e-postan · Developer contact: kendi e-postan.
   - Scopes: ek scope **ekleme** (varsayılan `openid`, `email`, `profile` yeterli).
   - External seçtiysen **Audience → Test users**: admin e-postalarını ekle. (Uygulama "Testing" durumunda yalnız test kullanıcıları girebilir — bu bizim için istenen kısıtlamadır; "Publish" yapmana gerek yok.)
3. **Credentials** (Google Auth Platform → **Clients**) → **Create credentials → OAuth client ID**:
   - Application type: **Web application** · Name: `cloudflare-access`
   - **Authorized JavaScript origins:** `https://<team>.cloudflareaccess.com`
   - **Authorized redirect URIs:** `https://<team>.cloudflareaccess.com/cdn-cgi/access/callback`
   - **Create** → açılan pencerede **Client ID** ve **Client secret** görünür.

🔐 **Client secret'ı** yalnız bir sonraki adımda Cloudflare'e yapıştır. Sohbete/repoya/not dosyasına yazma. Kaybedersen Google'da yenisini oluşturursun.

### 3.2 Cloudflare tarafı
1. **Zero Trust → Settings → Authentication → Login methods → Add new → Google**.
2. **App ID** = Google'daki Client ID · **Client secret** = Google'daki Client secret.
3. **Save** → listede Google'ın yanındaki **Test** → "Your connection works!" görmelisin.
   - Hata `redirect_uri_mismatch` → §3.1 adım 3'teki redirect URI'yi harfi harfine kontrol et (team domain + `/cdn-cgi/access/callback`).
4. **One-time PIN** login methodu listede varsa: Access uygulamasında **kullanılmayacak** (§4.2'de yalnız Google seçilir). İstersen tamamen kaldırabilirsin.

---

## 4. Access Application

### 4.1 Uygulamayı oluştur
**Zero Trust → Access → Applications → Add an application → Self-hosted**

| Alan | Girilecek değer |
| :-- | :-- |
| Application name | `bdimexport-admin` |
| Session Duration | `8 hours` (§6) |
| **Public hostname 1** | Subdomain: *(boş)* · Domain: `bdimexport.com` · Path: `admin` |
| **Public hostname 2** | Subdomain: *(boş)* · Domain: `bdimexport.com` · Path: `admin/*` |
| **Public hostname 3** *(staging varsa — 3.9)* | Subdomain: `staging` · Domain: `bdimexport.com` · Path: `admin*` |

"Add public hostname" ile satır eklenir. `admin` ve `admin/*` ikisini de gir: biri `/admin` sayfasını, diğeri `/admin/leads`, `/admin/api/...` gibi tüm alt yolları kapsar.

### 4.2 Kimlik ve davranış ayarları
| Alan | Değer |
| :-- | :-- |
| Identity providers | Yalnız **Google** işaretli (One-time PIN işaretsiz) |
| Instant Auth (tek IdP'ye otomatik yönlendir) | **AÇIK** |
| App Launcher'da göster | **KAPALI** |
| Cookie: HTTP Only | **AÇIK** |
| Cookie: SameSite | **Lax** |
| Cookie: Binding Cookie | **AÇIK** |
| CORS ayarları | Dokunma (boş) |
| "Return 401 response for service auth policies" | KAPALI (service token kullanmıyoruz) |

### 4.3 `pages.dev` açığını kapat (ZORUNLU)
`bdimexport.com/admin` için kurulan uygulama `bdimexport.pages.dev/admin`'i **korumaz**. İkisini birden yap:

1. Aynı Access uygulamasına iki public hostname daha ekle:
   - Domain: `bdimexport.pages.dev` · Path: `admin`
   - Domain: `bdimexport.pages.dev` · Path: `admin/*`
   (Panel `pages.dev` alan adını kabul etmezse dur ve agent'a bildir — alternatif: §4.3 adım 2 + Bulk Redirect ile `bdimexport.pages.dev` → `bdimexport.com` 301.)
2. **Workers & Pages → bdimexport (Pages projesi) → Settings → General → Access policy → Enable access policy**. Bu, `*.bdimexport.pages.dev` **önizleme** deploy'larını Access arkasına alır.

### 4.4 AUD tag'i al
Uygulamayı kaydet → **Applications** listesinde `bdimexport-admin` → **Configure → Overview** (veya **Basic information**) → **Application Audience (AUD) Tag** → kopyala.

📋 **Not al →** `ACCESS_AUD` = 64 karakterlik onaltılık değer.

---

## 5. Access Policy

Uygulamanın **Policies** adımında (veya **Access → Policies** altında oluşturup uygulamaya bağla):

### Policy 1 — `allow-admins`
| Alan | Değer |
| :-- | :-- |
| Action | **Allow** |
| Session duration | **Same as application session timeout** (8h) |
| **Include** → Selector: **Emails** | Her admin e-postası ayrı değer olarak (ör. `ad.soyad@gmail.com`). Domain kuralı (`Emails ending in`) **kullanma** — o alan adındaki herkesi açar. |
| **Require** → Selector: **Login Methods** | **Google** |
| *(İsteğe bağlı)* **Require** → Selector: **IP ranges** | Sabit ofis/ev IP'n varsa `<IP>/32`. Dinamik IP'de kendini kilitlersin — emin değilsen **ekleme**. Şablondaki `ip` satırı bu seçeneğe karşılık gelir; kullanmıyorsan şablonda yok say. |

Include = **kim** girebilir; Require = **ek zorunlu koşul** (hepsi sağlanmalı).

### Policy 2 — `deny-everyone-else` *(güvenlik kemeri)*
| Action | **Block** · Include → **Everyone** |
| :-- | :-- |

Access zaten eşleşmeyeni reddeder; bu politika yanlışlıkla geniş bir Allow eklenirse diye açık bir son kuraldır. Sıra: `allow-admins` (1) → `deny-everyone-else` (2).

**Save application.**

---

## 6. Oturum (session) katmanı

| Ayar | Nerede | Değer | Neden |
| :-- | :-- | :-- | :-- |
| Uygulama oturumu | Access app → Session Duration | **8 saat** | İş günü boyunca tekrar giriş yok; gece otomatik düşer |
| Global oturum | Zero Trust → Settings → Authentication → **Global session timeout** | **24 saat** (veya boş = varsayılan) | Tüm Access uygulamaları için üst sınır |
| Çıkış | Tarayıcıda `https://bdimexport.com/cdn-cgi/access/logout` | — | Oturumu anında bitirir |
| Acil durum | Access app → **Revoke existing tokens** | — | Laptop kaybı vb.: herkesin oturumunu düşürür |
| Admin çıkarma | Policy 1'den e-postayı sil **ve** §7'deki `ADMIN_EMAILS`'ten sil → **Revoke existing tokens** | — | İki katmanda da erişimi keser |

Uygulama kendi oturumunu tutmaz; her API isteğinde Access JWT'sini yeniden doğrular ve süresi (`exp`, 30 sn tolerans) dolmuşsa 403 verir. Yani oturum süresi tek yerden — Access'ten — yönetilir.

---

## 7. Uygulamanın beklediği değerler (admin API Worker — FAZ 3.9)

`app/admin/middleware.ts` şu 4 değişkeni okur. Herhangi biri boşsa tüm admin API **403** döner (fail-closed).

**Bağlama kararı (2026-10-17):**
- `ACCESS_TEAM_DOMAIN`, `ACCESS_AUD` → **public config**, `workers/api/wrangler.toml` `[vars]`'ta gerçek değerle. Gerekçe: JWT doğrulamasının girdisidir; bilinmesi erişim sağlamaz (imzalı token yalnız Access'ten gelir; JWKS zaten herkese açık). Staging `[env.staging.vars]`'ta AUD **bilerek boş** → staging admin API fail-closed (kendi Access app'i yok).
- `ADMIN_EMAILS`, `VIEWER_EMAILS` → **repoya girmez**, prod'da **Worker secret**. Gerekçe: (1) gerçek kişisel e-posta = KVKK kapsamında kişisel veri; repo ileride public/paylaşımlı olursa geri alınamaz (git geçmişi); (2) admin hesabını hedef olarak ifşa eder (phishing); (3) secret değiştirmek kod commit'i gerektirmez. Yerel geliştirme: `workers/api/.dev.vars` (`workers/api/.gitignore`'da). Secret girilmezse guard herkesi `403 not_allowlisted` ile reddeder — güvenli varsayılan.

| Değişken | Değer | Nereden kopyalanır | Hassasiyet |
| :-- | :-- | :-- | :-- |
| `ACCESS_TEAM_DOMAIN` | `<team>.cloudflareaccess.com` | §2 | Gizli değil |
| `ACCESS_AUD` | 64 hane AUD tag | §4.4 | Gizli değil (ama repoya yazılmaz) |
| `ADMIN_EMAILS` | `a@x.com,b@y.com` — virgülle, boşluksuz | Policy 1 ile **aynı liste** | Kişisel veri → Secret olarak gir |
| `VIEWER_EMAILS` | Yalnız Dashboard görecekler (boş olabilir) | — | Kişisel veri → Secret olarak gir |

**Komutlar** (değer komut satırına yazılmaz; wrangler interaktif sorar):
```
cd workers/api
npx wrangler secret put ADMIN_EMAILS              # prod
npx wrangler secret put ADMIN_EMAILS --env staging
# yerel: workers/api/.dev.vars dosyasına  ADMIN_EMAILS=ad@ornek.com  (commit'lenmez)
```

**Panelden girmek istersen:** Admin API Worker'ı FAZ 3.9'da oluşturulduğunda → **Workers & Pages → (admin API worker) → Settings → Variables and Secrets → Add**:
- `ACCESS_TEAM_DOMAIN`, `ACCESS_AUD` → Type: **Text**
- `ADMIN_EMAILS`, `VIEWER_EMAILS` → Type: **Secret**

O zamana kadar bu dört değeri **parola yöneticinde** sakla. Ayrıca aynı worker için:
- **Settings → Domains & Routes:** route `bdimexport.com/admin/api/*` (Access uygulamasının kapsadığı yol).
- **`workers.dev` ve Preview URLs: KAPALI** — Access'in dışında kalan bir giriş kapısı bırakma. (Kapatılmasa da token olmadığı için 401 döner; kapatmak saldırı yüzeyini sıfırlar.)

Allowlist ile Policy 1'in **aynı** e-postaları içermesi gerekir: Access'ten geçip allowlist'te olmayan kişi `not_allowlisted` (403) alır; allowlist'te olup Access'te olmayan kişi zaten siteye ulaşamaz.

---

## 8. İNSAN KURULUM + TEST KAYDI (bu tablo dolmadan 3.1 ✅ olmaz)

Kurulumdan sonra **gizli/özel pencerede** test et. Sonuç sütununu doldur; değer (e-posta, AUD) yazma.

| # | Test | Beklenen | Sonuç (✔/✘) |
| :-- | :-- | :-- | :-- |
| 1 | `https://bdimexport.com/admin` | Google giriş ekranı (Cloudflare Access üzerinden) | |
| 2 | İzinli Google hesabıyla giriş | `/admin` açılır | |
| 3 | İzinsiz bir Google hesabıyla giriş | Access "You don't have access" ekranı | |
| 4 | `https://bdimexport.com/admin/leads` (alt yol), yeni gizli pencere | Yine Google giriş ekranı | |
| 5 | `https://bdimexport.pages.dev/admin` | Google giriş ekranı (**içerik değil**) | |
| 6 | Bir Pages önizleme URL'si `https://<hash>.bdimexport.pages.dev/admin` | Google giriş ekranı | |
| 7 | `https://bdimexport.com/cdn-cgi/access/logout` sonra `/admin` | Tekrar giriş ister | |
| 8 | Zero Trust → **Logs → Access** | Test 2 (allow) ve 3 (block) kayıtları görünür | |

**Kayıt:** Test eden: ______ · Tarih: ______ · Sonuç: GEÇTİ / KALDI
Doldurunca agent'a "kurulum tamam" de.

---

## 9. Agent'ın canlı doğrulaması (kurulumdan sonra)

Agent şu kontrolleri `curl` ile çalıştırır ve sonucu FAZ_3 panosuna kaydeder:

| Kontrol | Beklenen |
| :-- | :-- |
| `curl -sI https://bdimexport.com/admin` | `302`, `location:` → `https://<team>.cloudflareaccess.com/...` (asla `200`) |
| `curl -sI https://bdimexport.com/admin/leads` | Aynı `302` |
| `curl -sI https://bdimexport.pages.dev/admin` | Aynı `302` |
| `curl -s https://<team>.cloudflareaccess.com/cdn-cgi/access/certs` | JSON `keys[]` (RS256 anahtarları) — middleware'in imza doğruladığı kaynak |
| `curl -sI https://bdimexport.com/` | `200` (public site Access'e takılmıyor) |
| Admin API deploy edildikten sonra (3.9): token'sız istek | `401 no_access_token`; sahte/expire token `403` |

---

## 10. Otomatik testler (agent, her değişiklikte)

```
node --experimental-strip-types --test app/admin/e2e/access.test.mjs
```
14 test: Access'siz 401 · imzasız / `alg:none` / HS256 / yanlış anahtar / kurcalanmış / expire / yanlış `aud`/`iss` → 403 · allowlist · viewer salt-okunur · fail-closed (yapılandırma eksik, JWKS erişilemez) · audit atomik batch + redaction.

3.1 review'ında ayrıca doğrulandı: koşullu mutasyon 0 satır etkilerse audit yazılmaz (yarış), rastgele `kid` seli JWKS'e en fazla 1 zorla yenileme/dk yaptırır, 8 KB üstü token işlenmeden reddedilir.

---

## 11. Sorun giderme

| Belirti | Olası neden | Çözüm |
| :-- | :-- | :-- |
| `/admin` giriş istemeden açılıyor | DNS kaydı gri bulut / hostname yanlış | DNS'te Proxied yap; §4.1 hostname'leri kontrol et |
| `pages.dev/admin` açılıyor | §4.3 yapılmadı | §4.3 adım 1 + 2 |
| Google `redirect_uri_mismatch` | Redirect URI yazımı | §3.1 adım 3 |
| Google "Access blocked: app not verified / not a test user" | Consent screen Testing modunda, kullanıcı listede yok | §3.1 adım 2 → Test users'a ekle |
| Girişten sonra API `403 bad_aud` | `ACCESS_AUD` yanlış uygulamadan kopyalandı | §4.4'ten tekrar kopyala |
| API `403 not_allowlisted` | E-posta Policy'de var, `ADMIN_EMAILS`'te yok (veya büyük/küçük harf / boşluk) | §7 listesini düzelt (virgülle, boşluksuz) |
| API `403 misconfigured` | Worker'da değişken eksik | §7 dört değişkeni gir |
| IP değişti, girilemiyor | Policy'de IP Require var | Cloudflare panelinden IP'yi güncelle veya Require'ı kaldır |

---

## 12. Custom domain'e geçiş (`bdimexport.com` bağlanınca)

Sıra önemli: önce korumayı genişlet, sonra trafiği taşı — arada korumasız an olmasın.

1. **DNS:** `bdimexport.com` Pages projesine custom domain olarak bağlı ve **Proxied** (§1).
2. **Access app'e hostname ekle** (AUD **değişmez** — aynı app'e ekleme yapıyoruz, yeni app YOK):
   Zero Trust → Access → Applications → `bdimexport-admin` → **Configure → Public hostnames → Add**
   - `bdimexport.com` · path `admin`
   - `bdimexport.com` · path `admin/*`
   `bdimexport.pages.dev/admin` satırlarını **silme** (pages.dev açık kalırsa korumasız ikinci kapı olur — §4.3).
3. **Google OAuth:** değişiklik **gerekmez** — redirect URI team domain'e bağlı (`<team>.cloudflareaccess.com/cdn-cgi/access/callback`), site domain'ine değil.
4. **pages.dev → custom domain yönlendirmesi (önerilir):** Cloudflare → **Rules → Redirect Rules / Bulk Redirects**: `bdimexport.pages.dev/*` → `https://bdimexport.com/$1` **301**. Access hostname'leri yine kalsın (savunma derinliği).
5. **Kod tarafı (agent):** `ALLOWED_ORIGINS` / `TURNSTILE_HOSTNAMES` prod değerleri (3.9) + admin API route `bdimexport.com/admin/api/*`.
6. **Doğrula:** §8 testleri 1–5'i `bdimexport.com` için tekrarla + §9 `curl` kontrolleri.
7. Script ile yapacaksan: `ACCESS_APP_DOMAINS="bdimexport.com/admin,bdimexport.com/admin/*,bdimexport.pages.dev/admin,bdimexport.pages.dev/admin/*" node scripts/setup-access.mjs` (önce dry-run, §13).

---

## 13. Ops: `scripts/setup-access.mjs` ile yeniden kurma / hizalama

Paneldeki app + policy'leri bu rehberdeki desired state'e (§4–§6) **idempotent** hizalar. Felaket kurtarma veya domain ekleme için.

```
# env'i terminal oturumunda ver (dosyaya/commit'e YAZMA):
#   CLOUDFLARE_API_TOKEN   izin: Account › Access: Apps and Policies › Edit
#                          + Access: Organizations, Identity Providers, and Groups › Read
#   CLOUDFLARE_ACCOUNT_ID  dash.cloudflare.com → sağ panel "Account ID"
#   ADMIN_EMAILS           virgülle (allowlist ile AYNI liste)
#   ACCESS_AUD             (ops.) wrangler.toml'daki değer — uyuşmazlık kontrolü
node scripts/setup-access.mjs            # DRY-RUN: yalnız okur, farkları listeler
node scripts/setup-access.mjs --apply    # farkları uygular
```

Davranış:
- Var olan app **asla silinmez/yeniden yaratılmaz** (yeni app = yeni AUD = guard 403). Yalnız `PUT` ile hizalanır.
- App yoksa `--apply` oluşturur ve **yeni AUD'u yazdırır** → `wrangler.toml` `[vars] ACCESS_AUD` güncellenmeli.
- `ACCESS_AUD` verilirse ve app'inkiyle uyuşmazsa uyarır, çıkış kodu `2`.
- Beklenmeyen ek policy'leri silmez, uyarır. Token hiçbir çıktıya yazılmaz; e-postalar maskelenir.
- ⚠️ Cloudflare API alan adları (`destinations`, app-scoped policies) canlı hesapta **henüz denenmedi** — ilk kullanımda mutlaka önce dry-run; panelde elle yapılan kurulumla farkları "GÜNCELLE" olarak görebilirsin (API'nin ek alanları). Hata olursa çıktıyı agent'a ver.

