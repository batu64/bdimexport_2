# cron-rss (FAZ_4 4.1)

Saatlik RSS toplama. **Deterministik — AI çağrısı yok**, secret yok. TTL silme/bakım 4.2'nin işi (bu worker satır silmez).

- **Kaynaklar:** `settings` tablosu, anahtar `rssSources` (JSON). Admin panelinden yazılır (Ayarlar → RSS kaynakları; 3.6 Input B ile ortak) — ERTELENEN C4. Worker yalnız okur; her öğe tekrar doğrulanır (https + genel alan adı; iç adres/IP/kimlik bilgisi/secret-sorgu reddedilir).
- **Akış:** kaynak → fetch (10 sn zaman aşımı + 1 yeniden deneme; 5xx/429/ağ/zaman aşımı denenir, 4xx denenmez) → parse (RSS2/RDF/Atom) → `rss_news` (`url` UNIQUE → `ON CONFLICT DO NOTHING`; `expires_at = fetched_at + 72s`).
- **İzolasyon:** her kaynak bağımsız; biri düşerse hata kodu loglanır (`rss_source` satırı, `error` alanı), diğerleri akar.
- **Hata kodları:** `timeout | network | http_4xx | http_5xx | too_large | bad_redirect | parse_failed | db_error`.

```bash
pnpm install && pnpm test          # 14 entegrasyon testi (gerçek SQL, ağ yok)
pnpm typecheck
npx wrangler deploy --env staging --dry-run   # paketleme + binding doğrulaması (yükleme yok)
```

## Staging'e alma (👤 — ayrı onay)
```bash
npx wrangler deploy --env staging                       # cron: her saat başı (UTC)
# Staging D1'e test kaynağı (settings.rssSources) yazmak için admin paneli ya da:
npx wrangler d1 execute bdimexport-db-staging --env staging --remote --command \
  "INSERT OR REPLACE INTO settings (key,value_json,updated_by) VALUES ('rssSources','[{\"id\":\"test-feed\",\"name\":\"Test Feed\",\"url\":\"https://…/feed.xml\",\"enabled\":true}]','ops')"
# Elle tetik: Cloudflare paneli → Workers → bdimexport-cron-rss-staging → Triggers → Cron → "Trigger"
npx wrangler tail bdimexport-cron-rss-staging --env staging   # rss_source / rss_run log satırları
npx wrangler d1 execute bdimexport-db-staging --env staging --remote --command "SELECT source,title,expires_at FROM rss_news ORDER BY fetched_at DESC LIMIT 10"
```
Production: **yok** (go-live ertelendi — E1/E2, FAZ 8). Prod D1'e doğrudan yazım yasak (FAZ 3.9 disiplini).

## 4.4 — Batch özet/etiket (Gemini STUB, E3)
Saatlik cron: önce ingest, sonra `runEnrich` (yeni `rss_news` → `summary` + `tags_json {sector, product_candidate, locale_suggestion[], urgency}`; batch 20).
- **`ENRICH_MODE`**: `off` (kod varsayılanı, hiçbir şey yapmaz) · `mock` (yerel/staging; özetler `[MOCK]` ile başlar) · `gemini` (**gerçek çağrı henüz YOK** — `GeminiModel.enrich` TODO(E3); anahtar/model yoksa ya da çağrı yazılmadıysa o çalışma **hiçbir şey yazmaz**).
- **Placeholder'lar:** `GEMINI_API_KEY` (Workers secret) + `GEMINI_MODEL` (var) — E3'te (proje sonu, AGENTS §9) `wrangler secret put GEMINI_API_KEY --env <env>`. Repoda DEĞER yok.
- **Prompt injection savunması (katmanlı):** (1) `sanitize.ts`: görünmez/bidi/"tag" karakterleri silinir, NFKC, ayraç karakterleri atılır, 200 karakter; (2) yönerge benzeri başlık (EN/TR/DE/RU/ZH kalıpları + sohbet şablonu belirteçleri) **karantina** → prompt'a hiç girmez, özet üretilmez; (3) sabit sistem talimatı + veri yalnız JSON (`prompt.ts`); (4) **çıktı doğrulaması** (`schema.ts`): sıkı şema, kapalı sözlükler, özette yönerge/URL/HTML/şablon karakteri yok — geçmeyen öğe yazılmaz (3 denemede bırakılır); (5) çıktı yayına gitmez, yalnız admin havuzuna (insan onayı). **Sınır:** regex listesi her saldırıyı yakalamaz; savunma derinliğiyle birlikte çalışır.
- Model hatası → fail-closed (yazma yok, çalışma durur; öğeler sonraki saatte tekrar aday). Mevcut `tags_json` (örn. `kind=trends`, 4.3) korunur.
