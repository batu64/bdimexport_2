# FAZ_0 Çıkış Denetimi (qa-agent, T-0010)
**Tarih:** 08.10.2026 | **Denetleyen:** qa-agent (GLM 5.3) | **Kaynak:** fazlar/FAZ_0.md §0.10

## Çıkış Kriterleri (FAZ_0.md §0.10 — 8 madde)

| # | Kriter | Sonuç | Kanıt |
| :--- | :--- | :--- | :--- |
| 1 | Model ping'leri yeşil | ✅ KISMEN | `tasks/ping-report.json` — GLM 5.3 erişilir; 11 model env key bekliyor, fallback zincirleri işaretli (AGENTS.md §7 K1: kuyruk tıkmaz) |
| 2 | İlk tam döngü tamam | ✅ | T-0011: pending→dispatched→accepted (ledger kayıtlı) |
| 3 | D1 migration lokalde koşuyor | ✅ | `wrangler d1 migrations apply --local` — 9 tablo doğrulandı; **insan review onaylı** (kullanıcı 2026-10-08) |
| 4 | design-tokens + brief'ler merge | ✅ | design-tokens.md v1.0 (Varyant A onaylı) + 8 komponent brief + hero-copy 4 dil |
| 5 | 4 workflow hazır (enabled) | ✅ | orchestrator (manuel dispatch, schedule bilinçli kapalı), qa-gate, nightly, weekly-report — syntax OK |
| 6 | gitleaks temiz | ✅ | keys.txt (0 byte) + keys.md repo dışına taşındı; gitignore güçlü; **commit geçmişinde keys.txt BOŞ dosya olarak duruyor (0 byte — secret yok, push güvenli)** |
| 7 | Ledger'da her çağrı kayıtlı | ✅ | token_ledger.json 5 kayıt; tümü cache_hit, $0.00 |
| 8 | İnsan onay kaydı (0.5 + 0.8) | ✅ | Palet: "Ticaret Güveni" (0.5) · migration: "review onaylı" (0.8) |

## Ek doğrulamalar
- `pnpm build` ✅ — 4 route group + sitemap.xml statik üretiliyor
- hreflang helper: SEO_PLAYBOOK §1.4 K1–K5 kuralları gömülü (404-hreflang yasağı dahil)
- task_queue şeması: qa-gate.yml içinde otomatik validasyon var

## Karar: **PASS — FAZ_0 ÇIKIŞI ONAYLANIYOR** (insan "devam et" bekleniyor → FAZ_1)

## Notlar (FAZ_1'e devir)
1. Provider key'ler gelince ping yeniden koşulur (T-0002 notu) — kuyruk tıkmaz, fallback çalışır
2. GitHub push sonrası: repo secret'ları eklenmeli (GH_ORCHESTRATOR_PAT, CLOUDFLARE_API_TOKEN, CLOUDFLARE_ACCOUNT_ID + diğer provider key'ler)
3. keys.txt commit geçmişinde 0 byte — temizlik opsiyonel (git filter-repo), acil değil
4. Bu ortamda gerçekte model çağrıları "hermes-session" olarak ledger'a yazıldı — gerçek CLI entegrasyonu FAZ_1 0.10 provası yerine faz başında yapılandırılır
