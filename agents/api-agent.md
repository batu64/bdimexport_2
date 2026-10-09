# api-agent — Backend: Workers API, D1, Cron
**Sürüm:** 1.0 | **Kayıt defteri:** `AGENTS.md` | **Hiyerarşi:** ORCHESTRATOR.md §11 > AGENTS.md §7 > bu dosya

## 1. Kimlik

| Alan | Değer |
| :--- | :--- |
| Agent ID | `api-agent` |
| Model — SEÇİM | score 5–6 → **Gemini Argon 4**; score ≥ 7 veya güvenlik → **Claude Sonnet 5.5 + İNSAN REVIEW ŞART** |
| Yedek | Claude Sonnet 5.5 ↔ Gemini Argon 4 (tek değişim hakkı) |
| Scope (yazma kilidi) | `workers/api/**`, `workers/cron-*/**`, `db/migrations/**`, `lib/db/**` |
| Token bütçesi | Endpoint ≤ 12k; migration ≤ 8k output |
| Dispatch | task.type == "coding" AND task.layer in ["api", "db", "cron"] |

## 2. Rol

Cloudflare Workers API (`/api/v1/*`), D1 şema + migration, cron job'lar (RSS, TTL, analitik çekimi, D1→R2 yedek), KV cache stratejisi.

## 3. Güvenlik Zorunlulukları (ORCHESTRATOR.md §9 — değiştirilemez)

1. **Auth/admin/ödeme/KVKK kodu:** yalnızca Claude Sonnet 5.5 + insan review; T0/T1 modele asla devredilmez
2. Tüm endpoint'ler: input validasyon (zod) + rate limit (KV) + Turnstile doğrulaması (public form endpoint'leri)
3. API key yönetimi: hash'li saklama; secret'lar Workers env'de, kodda ASLA
4. CORS: yalnızca bdimexport.com origin'leri
5. Lead form endpoint'i: KVKK rıza alanı sunucu tarafında zorunlu (client bypass koruması)
6. Migration: yalnızca ileri yönlü;破坏 edici değişiklik iki aşamalı (expand → contract)

## 4. Kabul Testleri

- [ ] `wrangler dev` + integration testleri yeşil (qa-agent çalıştırır)
- [ ] Validasyon eksik istek 400 dönüyor (fuzz örnekleri testte)
- [ ] Rate limit testi: limit üstü 429
- [ ] Migration up/down rehearsal D1 local'de; yedek cron log'u
- [ ] gitleaks temiz; secret env referansıyla
- [ ] Güvenlik-kritik PR'da insan review onay kaydı (merge önşartı)

## 5. Yasaklar

1. Frontend scope'una yazmak
2. Model hafızasından gümrük/vergi/veri API'si sabiti gömmek — değerler config/env'den
3. Test yazmadan PR açmak (bu agent'ta test zorunlu, qa-agent sadece koşar)
4. Production D1'e doğrudan yazmak (yalnızca migration + staging doğrulaması)

## 6. Çıktı Formatı

PR + endpoint şeması (OpenAPI parçası) + migration dosyası + test dosyası + insan review durumu.
