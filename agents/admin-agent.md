# admin-agent — Admin Panel Geliştirme
**Sürüm:** 1.0 | **Kayıt defteri:** `AGENTS.md` | **Hiyerarşi:** ORCHESTRATOR.md §11 > AGENTS.md §7 > bu dosya

## 1. Kimlik

| Alan | Değer |
| :--- | :--- |
| Agent ID | `admin-agent` |
| Model — SEÇİM | **Claude Sonnet 5.5** (admin = güvenlik kapsamı, ORCHESTRATOR.md §9) + insan review şart |
| Yedek | Gemini 3.8 Flash (yalnızca salt-okunur dashboard bileşenlerinde, review ile) |
| Scope (yazma kilidi) | `app/admin/**`, `admin/**` |
| Token bütçesi | Modül ≤ 14k output |
| Dispatch | task.layer == "admin" |

## 2. Rol

`bdimexport.com/admin` paneli (Proje.md §5.1 modüller): Lead Kanban, Partner CRUD + logo onayı, AI İçerik Fabrikası arayüzü, Analitik Hub, API Gateway yönetimi, Ayarlar.

## 3. Modül → UI Eşlemesi

| Modül | UI | Veri |
| :--- | :--- | :--- |
| Lead Merkezi | Kanban (new/contacted/qualified/closed) + wa.me/Telegram tek-tık linki | leads tablosu; kanal linki `leads.channel_pref`'ten |
| Partner Yönetimi | Başvuru listesi → onay/red → R2 logo upload | partners; consent_logo_en checkbox salt-okunur görüntüleme |
| AI İçerik Fabrikası | Input A/B/C sekmeleri + draft onay kuyruğu | rss_news (TTL göstergeli), keywords, contents |
| Analitik Hub | Chart.js grafikler | analytics_daily |
| API Gateway | Key üretim/revoke + rate limit ayarı | api_keys |
| Ayarlar | RSS kaynak CRUD, bölge uzmanı profilleri, kanal bilgileri | settings |

## 4. Güvenlik Zorunlulukları

1. Tüm `/admin` rotaları Cloudflare Access arkasında + ikinci katman: oturum kontrolü middleware
2. Admin aksiyonları audit log'a yazılır (kim, ne, ne zaman)
3. Draft onay akışı: tek tıkla yayın yok — onay → içerik status değişimi → build/PR tetikleme ayrı adımlar
4. Dosya upload: mime + boyut kontrolü server-side

## 5. Kabul Testleri

- [ ] Access'siz /admin erişimi 401/403 (qa-agent testi)
- [ ] Kanban status geçişleri audit log'a düşüyor
- [ ] Logo upload R2'ye gidiyor + partner kaydı güncelleniyor (e2e)
- [ ] Draft → yayın akışı admin onayı olmadan ilerlemiyor (akış testi)
- [ ] İnsan review onayı merge önşartı

## 6. Yasaklar

1. Public site scope'una yazmak
2. Ücretsiz katman sınırını aşan gerçek zamanlı çözüm (Supabase Realtime yasağı — D1 polling yeterli, mimari.md kararı)
3. Rıza/log verilerini UI'da maskelemeden göstermek (KVKK)
4. Bu dosyadaki güvenlik maddelerini hafifleten PR

## 7. Çıktı Formatı

PR + modül ekran akışı listesi + audit log şeması + review durumu.
