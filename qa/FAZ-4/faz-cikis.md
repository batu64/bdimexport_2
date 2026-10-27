# FAZ 4 — Çıkış Denetimi (Step 4.10) 🚦
**Tarih:** 2026-10-27 | **Hazırlayan:** Claude Code (Opus 5.5) | **Dayanak:** `qa/FAZ-4/rapor.md` (4.9) · fazlar/FAZ_4.md Step 4.10 · FAZ_4_AJAN_PANOSU.md
**Dal:** `tasks/faz0-progress-panel` (henüz push edilmedi — upstream yok → CI `gitleaks-action` bu dalda koşmadı; yerel eşdeğer tarama temiz).

## 1. Çıkış kriterleri

| Kriter | Durum | Kanıt / not |
| :-- | :-- | :-- |
| Saatlik RSS (kod) | ✅ | cron-rss `0 * * * *` + gece bakım `0 23 * * *`; 4.1 testleri + QA e2e |
| Saatlik RSS **canlı, 48 saat kesintisiz** | ⏸ **KANITLANAMADI** | cron worker'ları staging'e deploy edilmedi; staging D1'de 0004/0005 yok (👤 — §3) |
| TTL silme (3 gün) | ✅ | 72 s tam; 71. saat tutar / 73. saat siler + audit (rapor §1 #2, mutasyon M3) |
| Trends toplama | ✅ (kod) | cron-trends `0 6 * * *`; dedup 7 gün (rapor §1 #3); canlı akış 48 s gözlemiyle birlikte |
| A/B/C makale draft → onay → yayın tam tur | ✅ (stub) | A (metin) → news_card → edge **tam tur** · B (haber) → makale → PR → merge → live **tam tur** · C (keyword) → draft (üretim girdiden bağımsız; aynı yayın kapısı). Mock içerik tasarım gereği yayınlanamaz. **Gerçek içerikle tur = E3** |
| Fallback zincirleri | ✅ (stub) | eşik tablosu + yalnız Gemini→Gemini yedeği (rapor §1 #5, M5) |
| Alert'ler | ✅ (kod) | 4.7 testleri (webhook gönderim/maske/1 saat dedupe) + 4.9 blocked → tek alert. Gerçek webhook iletimi: `PIPELINE_ALERT_WEBHOOK_URL` 👤 girilince |
| Production D1 izolasyonu | ✅ | S1 (rapor §1 #7) |
| Kota kullanımı ledger'da $0 | ✅ (trivial) | `ai_usage_daily` sayar; stub → $0. Gerçek maliyet E3 |
| Onaysız yayın negatif testi | ✅ **TEMİZ** | 17 zorlama çağrısı red; mutasyon M1–M6; 3 bağımsız katman (rapor §3) |
| gitleaks | ✅ (yerel eşdeğer) | 0 açıklanmamış (çalışma ağacı + tüm geçmiş). CI gitleaks push sonrası koşar |
| Kritik/yüksek güvenlik bulgusu | ✅ 0 | F4-01…F4-04 düşük/bilgi; F4-02 kapandı (`2848f2b`) |

## 2. Ertelenen (bloklamaz)
E3 gerçek Gemini runtime (proje sonu) · E7 `GITHUB_PUBLISH_TOKEN` (fine-grained PAT) · E8 admin API router bağlaması · E9 Baidu hesabı (FAZ 5.5, E2 sonrası) · C7 de/zh makale rotaları (FAZ 5).

## 3. Senin kararın (👤)
1. **"devam et"** → FAZ 5 (ZH + DE). İlk iş: `FAZ_5_AJAN_PANOSU.md` oluşturulur; 5.1 Impressum/Datenschutz şirket verilerini ve hukuk imzasını senden ister.
2. **Günlük üretim hız hedefi** (Gemini açılınca geçerli; kapasite bugün saatlik × `ARTICLE_MAX_JOBS_PER_RUN`=5 → en çok ~120 iş/gün, hedef bunun altında bir üst sınır olarak `AI_DAILY_LIMIT` ile de sabitlenebilir): öneri **5–10 makale/gün** başlangıç.
3. **48 s canlı RSS gözlemi** şimdi mi, sonra mı? Şimdi ise senin koşacağın komutlar (secret değil; staging):
   - `workers/api` içinde: `npx wrangler d1 migrations list bdimexport-db-staging --env staging --remote` → `npx wrangler d1 migrations apply bdimexport-db-staging --env staging --remote` (0004_publications, 0005_ai_usage; docs/deploy.md §2)
   - `npx wrangler deploy --env staging` (`workers/cron-rss` ve `workers/cron-trends` içinde)
   - Admin → Ayarlar → RSS kaynakları en az 1 gerçek feed; 48 s sonra `rss_news`/`admin_actions(ttl_purge)` sayımı.
4. Dalın main'e **squash-merge** zamanı (faz sonu kuralı) — onaylarsan push + PR açarım.
