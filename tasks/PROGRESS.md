# PROGRESS.md — Faz Panosu

**Yürütücü:** Claude Code (tek yürütücü, AGENTS.md v2.0). Bu pano elle güncellenir; otomatik cron üretimi kaldırıldı.
**Model kaynağı:** AGENTS.md §7 (FAZ 0 tablosu).
**Son güncelleme:** 2026-10-11

## FAZ 0 — Foundation

| Step | İş | Model | Durum | Not |
| :-- | :-- | :-- | :-- | :-- |
| 0.1 | Repo iskeleti (route groups + workers + db) | Sonnet 5.5 | ⏳ todo | Sıra 1 |
| 0.2 | ~~Model ping~~ | — | ⛔ atlandı | Claude Code'da gereksiz; Gemini testi en sonda (AGENTS.md §9) |
| 0.3 | tasks/ kuyruk + muhasebe iskeleti | Haiku 5.5 | ⏳ todo | Sıra 2 · hafif pano |
| 0.4 | design-tokens taslağı | Sonnet 5.5 | ⏳ todo | Sıra 3 |
| 0.5 | design-tokens nihai + hero copy | Opus 5.5 | ⏳ todo | Sıra 4 · 👤 palet/tipografi seçimi + onay |
| 0.6 | komponent brief'leri | Sonnet 5.5 | ⏳ todo | Sıra 5 |
| 0.7 | CI workflow (build + qa-gate + gitleaks) | Sonnet 5.5 | ⏳ todo | Sıra 6 |
| 0.8 | D1 şema v1 + migration | Opus 5.5 🔒 | ⏳ todo | Sıra 8 · 👤 güvenlik review |
| 0.9 | sitemap/hreflang helper + llms/robots | Haiku 5.5 | ⏳ todo | Sıra 7 · ortak dosya |
| 0.10 | Faz çıkış denetimi | Haiku 5.5 | ⏳ todo | Sıra 9 · 👤 "devam et" onayı |

**Sıralı yürütme:** 0.1 → 0.3 → 0.4 → 0.5 → 0.6 → 0.7 → 0.9 → 0.8 → 0.10

**Durum notu:** Adım durumları bu panoda doğrulanmadan yazıldı (`⏳ todo`). Repo'da bazı Faz 0 çıktıları zaten bulunabilir; her adım başlamadan mevcut dosyalar kontrol edilip durum güncellenecek.

**Açık insan aksiyonları (FAZ 0):** 0.5 palet/tipografi seçimi · 0.8 şema güvenlik review · 0.10 "devam et" onayı.

## Tarihsel pano (v1 — orkestrator cron, 2026-10-10)

> Bu bölüm eski panonun kaydıdır; v2.0 ile cron üretimi kaldırıldığı için artık güncellenmez. Kart ID'leri (`t_*`) ve `hermes` komutları yalnızca tarihsel referanstır.

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

**Eski insan aksiyonları:** t_7acf8fb1 (3.11 güvenlik review) · t_5f29dd5a (2.10 çıkış onayı) · 3.7 analytics OAuth (GSC/GA4 credential).
