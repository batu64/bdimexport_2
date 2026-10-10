# PROGRESS.md — Otomatik faz panosu
**Canlı üretici:** orchestrator-loop cron (her 15 dk). Son elle tohumlama: 2026-10-10 04:10 TR

| Faz | Step | Durum | Kart | Ajan | İş |
| :-- | :-- | :-- | :-- | :-- | :-- |
| F2 | 2.1 | 🔄 running | t_68f7e23d | api-agent | 2.1 — /en route iskeleti + 5 hizmet sayfasi |
| F2 | 2.10 | ⏸ blocked | t_5f29dd5a | orchestrator | 2.10 — Faz çıkışı + EN lansman ön kontrolü (İNSAN ONAY KAP |
| F2 | 2.2 | ⏳ todo | t_beacc262 | api-agent | 2.2 — /en/products liste + 5 kategori yapisi |
| F2 | 2.3 | ⏳ todo | t_ac2481f2 | seo-geo-agent | 2.3 — 20 urun SEO/GEO sayfasi (BATCH: 10+10) |
| F2 | 2.4 | ✅ done | t_c6ddc2d1 | seo-geo-agent | 2.4 — /en/industries sayfaları (5) |
| F2 | 2.5 | ✅ done | t_db4a5d85 | en-l10n-agent | 2.5 — varyant iskeletleri /en/{ru,fr,nl,es,ar} (RTL dahil) |
| F2 | 2.6 | ⏳ ready | t_25da6f51 | image-agent | 2.6 — görsel üretim turu (image-agent ilk büyük işi) |
| F2 | 2.7 | ✅ done | t_d9d2ac19 | fe-agent | 2.7 — komplex varyant layout kod katmanı (tek istisna) |
| F2 | 2.8 | ⏳ todo | t_50f093ff | orchestrator | 2.8 — hreflang/sitemap/llms.txt enjeksiyonu (orchestrator  |
| F2 | 2.9 | ⏳ todo | t_783a98bb | qa-agent | 2.9 — Faz 2 QA turu (tam envanter) |
| F3 | 3.1 | ⏸ blocked | t_ebd25a8d | admin-agent | 3.1 — Cloudflare Access + admin auth katmanı 🔒 |
| F3 | 3.10 | ⏳ todo | t_aaa817e5 | qa-agent | 3.10 — Faz 3 QA turu (güvenlik ağırlıklı) |
| F3 | 3.11 | ⏸ blocked | t_7acf8fb1 | orchestrator | 3.11 — Güvenlik insan review toplantısı (KARAR: İNSAN) |
| F3 | 3.12 | ⏸ blocked | t_06ba6b22 | orchestrator | 3.12 — Faz çıkışı (standing onaylı — FAZ_4 otomatik tohuml |
| F3 | 3.2 | ⏳ todo | t_9349307d | admin-agent | 3.2 — Admin panel iskeleti + Dashboard |
| F3 | 3.3 | ⏳ todo | t_3c674877 | admin-agent | 3.3 — Lead Merkezi (Kanban + tek-tık kanal) |
| F3 | 3.4 | 🔄 running | t_a61f5281 | api-agent | 3.4 — /api/v1 gateway + form POST endpoint'i 🔒 |
| F3 | 3.5 | ⏳ todo | t_2f04b07f | admin-agent | 3.5 — Partner yönetimi (CRUD + logo onayı) |
| F3 | 3.6 | ⏳ todo | t_ffd40105 | admin-agent | 3.6 — AI İçerik Fabrikası arayüzü (kontrol kulesi) |
| F3 | 3.7 | 🔄 running | t_0ae7049c | api-agent | 3.7 — Analitik çekim altyapısı + analytics_daily |
| F3 | 3.8 | ⏳ todo | t_61de7751 | admin-agent | 3.8 — Turnstile/rate-limit admin tarafı + ayarlar |
| F3 | 3.9 | ⏳ todo | t_01113302 | api-agent | 3.9 — Staging/production ayrımı + credential yönetimi 🔒 |

## Bekleyen insan aksiyonları
- **t_7acf8fb1 (3.11 Güvenlik review toplantısı)** — FAZ_3 QA bitince gelecek; ONAY + unblock bekler
- **t_5f29dd5a (2.10 / F2 çıkışı)** — standing 'devam et' yetkili: parent'lar done olunca cron otomatik unblock+complete eder
- **3.7 analytics OAuth** — GSC/GA4 credential'ları hazır olduğunda: `hermes kanban comment <kart> 'OAuth hazır'` + unblock

_Not: bu dosyayı yalnızca orchestrator cron günceller; kart id'leri `hermes kanban show <id>` ile açılır._
