# FAZ 0 — Ajan Görev Panosu ve Koordinasyon
**Proje:** bdimexport.com | **Sürüm:** 1.0 | **Yürütücü:** Claude Code (Opus 5.5 / Sonnet 5.5 / Haiku 5.5 ajanları)
**Amaç:** Tüm ajanların ORTAK okuduğu tek pano. Görev sırası, her adımın talimatı, canlı durum ve ajanlar arası devir (handoff) burada. Bu dosya FAZ 0 için `tasks/PROGRESS.md`'nin (eski, devre dışı) yerini alır.

> Yetkili kaynaklar: `AGENTS.md` (§4 scope, §5 sıra, §7 model), `fazlar/FAZ_0.md` (adım detayı), `mimari.md`, `SEO_PLAYBOOK.md`. Çelişki → AGENTS.md kazanır.

---

## 0. PROTOKOL — bu panoyu nasıl kullanırsın (HER AJAN OKUR)

- **"git bunu oku" dendiğinde:** Bu dosyayı baştan sona oku. §2 Durum Tablosu'na bak. Kendi modelini (Opus/Sonnet/Haiku) ve §2'de sana atanmış **sıradaki** adımı belirle. Henüz uygulama yapma, hazır olduğunu bildir.
- **"talimatı uygula" dendiğinde:** §2'de **durumu ⏳ olan, tüm bağımlılıkları ✅ olan, sana ait sıradaki** adımı al → §3'teki o adımın talimatını uygula.
- **Başlamadan önce (zorunlu):** Adımın bağımlılıkları §2'de ✅ değilse **BAŞLAMA**. §4 günlüğüne `BEKLEMEDE: <adım>, bağımlılık <X> henüz ✅ değil` yaz ve insana bildir.
- **Çalışırken:** adımın durumunu §2'de 🔄 yap, "Son güncelleyen" sütununa modelini + saat yaz.
- **Bitince (zorunlu):** §2'de durumu ✅ yap **ve** §4 günlüğüne kayıt düş: ne yaptın, hangi dosyalar değişti, kabul testi sonucu (kanıt), eksik/şüphe var mı. Düz "yaptım" yasak.
- **Sorun / çakışma / sıra bozulması:** durumu ⛔ yap, §4'e nedeni yaz, insana haber ver, **DEVAM ETME.** Başka ajanın scope'una girme.
- **İnsan bekleyen adım:** durumu ⏸ yap, §5'teki insan aksiyonunu hatırlat, onay gelmeden ilerleme.

**Durum sembolleri:** ⏳ todo · 🔄 running · ✅ done · ⛔ blocked · ⏸ insan bekliyor

---

## 1. DEĞİŞMEZ KURALLAR (ortak — her adımda geçerli)

1. **Tek scope / tek commit:** Yalnızca sana verilen scope dizinlerine yaz; başka rolün dizinine/adımına dokunma.
2. **Oku-hizala-ezme:** Mevcut dosyaları önce oku; varsa spec'e hizala / eksiği tamamla, iyi olanı sıfırdan ezme.
3. **Hardcoded yasak:** renk/hex ve secret koda gömülmez → design tokens + env.
4. **Raporlama:** Bitince §2 + §4 güncellenir (dosya listesi + kabul testi + commit önerisi).
5. **Ortak dosya tekeli:** `app/sitemap.ts`, hreflang helper, `public/llms.txt`, `public/robots.txt` → yalnızca Step 0.9 bunlara yazar.
6. **Güvenlik kilidi:** D1 şema (0.8) = Opus + insan review, pazarlıksız.

---

## 2. DURUM TABLOSU (CANLI — her ajan kendi adımını günceller)

> ⚠️ **Bu tur = DOĞRULAMA/HİZALAMA.** FAZ 0 çıktılarının çoğu önceki (eski model) çalışmadan repoda MEVCUT. Palet **Varyant A** insan onaylı (0.5 kapısı GEÇİLDİ). Bu turda ajanlar sıfırdan üretmez; mevcut dosyayı okur, v2.0 spec'ine uyuyor mu doğrular, sapmayı düzeltir. `✅*` = mevcut, dokunulursa doğrula.

| Sıra | Adım | Model | Bağımlılık | Durum | Son güncelleyen |
| :-- | :-- | :-- | :-- | :-- | :-- |
| 1 | 0.1 Repo iskeleti | **Sonnet 5.5** | — | ✅* mevcut | önceki çalışma |
| — | 0.2 Model ping | — | — | ⛔ ATLANDI | v2.0 (Gemini en sonda) |
| 2 | 0.3 tasks/ panosu (hafif) | **Haiku 5.5** | 0.1 | ✅* mevcut — v2.0 güncelle | önceki |
| 3 | 0.4 design-tokens taslağı | **Sonnet 5.5** | — | ✅* mevcut | önceki |
| 4 | 0.5 nihai tokens + hero copy | **Opus 5.5** | 0.4 + 👤 palet | ✅ palet Varyant A onaylı | insan |
| 5 | 0.6 komponent brief'leri | **Sonnet 5.5** | 0.5 | ✅* mevcut (8 brief) | önceki |
| 6 | 0.7 CI workflow | **Sonnet 5.5** | 0.1 | ✅ build.yml + qa-gate.yml; orchestrator.yml kaldırıldı; nightly/weekly devre dışı — commit `9921128` | Sonnet 5.5 · 2026-10-11 |
| 7 | 0.9 sitemap/hreflang + llms/robots | **Haiku 5.5** | 0.1 | ✅* mevcut — doğrula | önceki |
| 8 | 0.8 D1 şema + migration 🔒 | **Opus 5.5** | 0.1 + 👤 review | ✅ 0001 v1.1 — 👤 review onaylı (2026-10-11) | Opus 5.5 · 2026-10-11 |
| 9 | 0.10 çıkış denetimi | **Haiku 5.5** | 1–8 hepsi ✅ + 👤 | ✅ 8/8 MET (kriter 5 interim, kriter 7 altyapı — qa/FAZ-0/rapor.md) | Haiku 5.5 · 2026-10-12 |

**Bu turda açık işler (sıra):** ~~0.7 hizala~~ ✅ → 0.8 review → 0.10 çıkış. Diğerleri mevcut; yalnız dokunulursa doğrula.
**Orijinal sıra (sıfırdan kurulumda):** 0.1 → 0.3 → 0.4 → 0.5 → 0.6 → 0.7 → 0.9 → 0.8 → 0.10

---

## 3. ADIM TALİMATLARI (sırayla)

### Step 0.1 — Repo İskeleti · [SONNET 5.5]
```
Scope: app/**, lib/**, workers/**, db/migrations/, content/**, package.json, tsconfig.json, .gitignore
Görev: Next.js 15 App Router iskeletini doğrula/tamamla:
- route groups: app/(tr) app/(zh) app/(en) app/(de) + app/admin — her grup boş layout render etsin
- workers/api/ + workers/cron-rss/ + workers/cron-trends/ dizinleri (boş iskelet)
- db/migrations/ ; content/{tr,zh,en/{ru,fr,nl,es,ar},de}/ ; lib/ ; next-intl kurulumu ; package.json + pnpm-lock
Kabul: `pnpm build` iskelette geçer; 4 route group boş layout render; dizin yapısı mimari.md §8 ile birebir.
```

### Step 0.3 — tasks/ Panosu (hafif) · [HAIKU 5.5]
```
Scope: tasks/**
Not: v2.0'da ağır kuyruk/dispatch kaldırıldı — bu adım hafif.
Görev: tasks/PROGRESS.md'yi FAZ 0 adımları + Claude modelleriyle (AGENTS.md §7) güncelle; tasks/active|done|blocked boş dizinleri dursun. Eski task_queue.json / token_ledger.json'a DOKUNMA.
Kabul: PROGRESS.md FAZ 0'ın 9 adımını (0.2 atlandı) ve modellerini doğru listeliyor.
```

### Step 0.4 — design-tokens Taslağı · [SONNET 5.5]
```
Scope: design/**
Görev: design/design-tokens.md taslağı — insanın 0.5'te seçeceği 3 PALET VARYANTI:
- renk paleti (TR/EN/DE baz + /zh kırmızı-altın + /de güven varyantı), tipografi ölçeği, spacing/grid, 4 breakpoint
- komponent envanteri (navbar/hero/kart/form/footer/cta/partner-grid)
prompts/visual-brand.md ile tutarlı.
Kabul: paletler hex'li; 4 breakpoint; komponent envanteri sayılı; 3 seçenek net ayrışıyor.
```

### Step 0.5 — Nihai Tokens + Hero Copy · [OPUS 5.5] · 👤 ÖNCE İNSAN SEÇER
```
Scope: design/design-tokens.md, design/hero-copy.md
ÖNCE: 0.4'teki 3 palet varyantını insana özetle; seçim gelmeden nihaileştirme (durumu ⏸ yap).
Görev (seçim sonrası): seçilen paleti nihaileştir (tokens diff, her karar ≤10 satır gerekçe) + hero copy'yi tr/en/de/zh 4 dilde TEK batch'te yaz (design/hero-copy.md).
Kabul: insan palet seçimi alındı; 4 dil hero tek çağrıda; nihai tokens tüm projeye kalıp.
```

### Step 0.6 — Komponent Brief'leri · [SONNET 5.5]
```
Scope: design/components/**
Ön koşul: 0.5 ✅ (nihai tokens).
Görev: design/components/{navbar,hero,card,form,footer,cta,partner-grid}.md — her biri: prop listesi, 4 breakpoint responsive, aria/erişilebilirlik. Tokens referanslı, hardcoded yok.
Kabul: her brief'te 4 breakpoint + a11y dolu; tokens'a bağlı.
```

### Step 0.7 — CI Workflow'ları · [SONNET 5.5]
```
Scope: .github/workflows/**
Görev: build.yml (pnpm install + build) + qa-gate.yml (PR'da build + gitleaks + lint/şema). v2.0'da orchestrator-cron workflow'u YOK — yazma.
Kabul: actionlint valid; secret'lar env referanslı (koda gömülü değil).
```

### Step 0.9 — Sitemap/hreflang + llms/robots · [HAIKU 5.5]
```
Scope: app/sitemap.ts, lib/hreflang.*, public/llms.txt, public/robots.txt (ortak dosya tekeli)
Görev: doğrula/tamamla — app/sitemap.ts (dil bazlı parçalı index, SEO_PLAYBOOK §8) + hreflang helper (SEO_PLAYBOOK §1: karşılıklılık + 404-hreflang yasağı; /en/ar → dir="rtl") + public/llms.txt ilk sürüm + public/robots.txt.
Kabul: build'de sitemap üretiliyor; §1.4 kuralları helper'a gömülü.
```

### Step 0.8 — D1 Şema + Migration · [OPUS 5.5] 🔒 · 👤 İNSAN REVIEW
```
Scope: db/migrations/**
Görev: db/migrations/0001_init.sql'i mimari.md §5 ile SATIR SATIR doğrula/tamamla:
tablolar: partners, leads, contents, rss_news, keywords, ai_jobs, analytics_daily
index'ler: leads.status ; contents(slug,locale) UNIQUE ; rss_news.expires_at
Kabul: `wrangler d1 migrations apply` lokalde koşuyor; eksik index yok.
Bitince: İNSAN REVIEW için tablo-tablo şema özeti + kararlar çıkar; durumu ⏸ yap, onay bekle.
```

### Step 0.10 — Faz Çıkış Denetimi · [HAIKU 5.5] · 👤 "devam et"
```
Scope: qa/**
Ön koşul: §2'de 1–8 adımların hepsi ✅.
Görev: qa/FAZ-0/rapor.md — 8 çıkış kriterini KANITLA: [build yeşil] [tokens+brief merge] [0001 migration lokalde koşuyor] [build.yml+qa-gate.yml hazır] [gitleaks temiz] [hero 4 dil] [hreflang helper+sitemap] [insan onayları 0.5+0.8].
Kural: kanıtsız pass yasak; her madde dosya/çıktı referanslı. Bitince durumu ⏸ → insan "devam et" → FAZ 1.
```

---

## 4. ÇALIŞMA GÜNLÜĞÜ (append-only — her ajan bitince yazar)

> Format: `- [TARİH SAAT] <Model> · Step <no> · <durum> — ne yapıldı; dosyalar: ...; kabul: ...; eksik/şüphe: ...`

- [2026-10-11] Pano senkronizasyonu (insan+Claude) — Repo denetimi: FAZ 0 çıktılarının çoğu önceki (eski model) çalışmadan MEVCUT bulundu. design-tokens.md "Varyant A onaylı", hero-copy.md + 8 komponent brief'i, .github/workflows/*, app/sitemap.ts, lib/hreflang.ts, public/llms.txt+robots.txt, db/migrations/0001_init.sql, qa/FAZ-0/rapor.md hepsi var. Bu tur = doğrulama/hizalama. AÇIK: 0.7 (orchestrator.yml v2.0'a aykırı — kaldır) · 0.8 (yeni-model Opus review) · 0.10 (yeniden doğrula + devam).
- [2026-10-11] Sonnet 5.5 · Step 0.7 · ✅ — build.yml YENİ (workflow_dispatch + workflow_call; pnpm 12 install --frozen-lockfile + build, secret yok); qa-gate.yml YENİDEN YAZILDI (PR+push main: build[build.yml'i çağırır] + gitleaks + actionlint + d1-schema); orchestrator.yml `git rm` (v2.0). Eski task_queue.json şema kontrolü qa-gate'ten çıkarıldı. Dosyalar: .github/workflows/{build,qa-gate}.yml, orchestrator.yml silindi. Kabul: 4 workflow YAML parse OK; secret taraması: gömülü secret yok, yalnızca `secrets.*` referansı; d1-schema adımı yerelde çalıştırıldı → 4 migration uygulandı, 10 tablo, exit 0; negatif test (0001 yok) → 'missing tables' exit 1. EKSİK/ŞÜPHE: (1) actionlint yerelde ÇALIŞTIRILMADI (kurulu değil); CI'da qa-gate `workflow-lint` işi koşturur — ilk PR'da doğrulanmalı. (2) `pnpm build` yerelde 0.1'de yeşildi, workflow olarak GitHub'da henüz koşmadı. (3) Lint adımı YOK: repoda eslint config yok, `next lint` CI'da interaktif takılır; config eklemek scope dışı. (4) nightly.yml ve weekly-report.yml dokunulmadı (0.7 talimatı kapsamında değil) ama v1 kalıntısı: weekly `GLM_API_KEY` + tasks/token_ledger.json okuyor; nightly 'Gemini gece batch' placeholder. İnsan kararı: silinsin mi / v2.0'a mı çevrilsin?
- [2026-10-11] Opus 5.5 · Step 0.5 · ✅ — (pano öncesi yapıldı, kayıt için) design-tokens v2.1 nihai (Varyant A, 👤 seçim) + hero-copy v2.1 tr/en/de/zh tek batch; commit `f3fd238`. Açık: DE sözlük CTA çakışması (I18N_RULES §3.2, orchestrator PR), sayısal güven verisi 👤, başvuru SLA'sı 👤. Takip: yeni token'lar `lib/ui/tokens.ts`'e (fe) + brief'lerde token adları (0.6 revizyonu).
- [2026-10-11] Opus 5.5 · Step 0.8 · ⏸ (👤 review bekliyor) — `db/migrations/0001_init.sql` mimari.md §5 ile satır satır denetlendi ve v1.1'e hizalandı (yerinde düzeltme; remote D1 yok: tüm wrangler.toml `database_id=local-dev`/`REPLACE_ME`). Değişiklikler: (1) `keywords.priority` EKLENDİ — mimari §5'te var, şemada yoktu + `idx_keywords_queue(status, priority DESC, created_at)`; (2) mükerrer `idx_contents_slug` KALDIRILDI (UNIQUE autoindex aynı işi görüyor); (3) CHECK'ler: partners.approved/consent_logo_en, api_keys.revoked, keywords.volume_estimated ∈{0,1}; leads.form_type, leads.channel_pref, contents.page_type (= admin PAGE_TYPES), keywords.intent enum; ai_jobs.retries ≥ 0; (4) `leads.partner_id … ON DELETE SET NULL` (partner KVKK silmesinde lead korunur); (5) leads KVKK/GDPR rıza kanıtı: `consent_version`, `consent_at`, `double_optin_at` (nullable — 1.6'da doldurulur). Dosyalar: db/migrations/0001_init.sql. KABUL: `wrangler d1 migrations apply bdimexport-db --local` (boş persist dizini) → 4/4 ✅; mimari §5 kolon eşleşmesi 7/7 tablo OK (tek isim farkı ai_jobs.payload→payload_json, kod bunu kullanıyor); EXPLAIN QUERY PLAN: leads.status, contents(slug,locale) UNIQUE, rss_news.expires_at, keywords kuyruğu, ai_jobs.status, partners.approved → 6/6 INDEX kullanıyor; negatif kısıt testleri 14/14 red; ON DELETE SET NULL doğrulandı; workers/api vitest 36/36 (önce 36/36); app/admin analytics 2/2; qa-gate d1-schema betiği birebir → 10 tablo OK. EKSİK/ŞÜPHE: (a) `app/admin/content/e2e/content.test.mjs` ÇALIŞMIYOR — `service.ts` uzantısız `../audit` import'u (ERR_MODULE_NOT_FOUND); orijinal 0001 ile de aynı hata → şemadan bağımsız, `e1c2cf0` kaynaklı; admin scope'u, 0.8'de dokunulmadı. Servisin keywords/contents/ai_jobs INSERT'leri yeni CHECK'lerle elle karşılaştırıldı: uyumlu. (b) `0002_admin_audit_integrity.sql` ve `0002_partners_apply.sql` AYNI numarayı taşıyor (FAZ_3 çıktıları, git'te izlenmiyor) — wrangler alfabetik sırayla ikisini de uyguluyor ama kırılgan; yeniden numaralandırma FAZ_3 adımı + remote ilk apply'dan ÖNCE yapılmalı. (c) mimari §4'teki `token_ledger` tablosu v2.0'da gereksiz (çok-sağlayıcı muhasebe kalktı) → oluşturulmadı. (d) Yerel `.wrangler/state` eski 0001 ile uygulanmışsa drift olur → `--persist-to` temiz dizinle yeniden uygula. 👤 REVIEW: tablo-tablo özet sohbette; onay sonrası 0001 remote ilk apply ile DONDURULUR (sonraki her değişiklik yeni migration).
- [2026-10-11] Opus 5.5 · Step 0.8 · ✅ — 👤 İNSAN REVIEW ONAYLI (sohbette "review onaylı"): 3 karar kabul edildi — leads rıza kanıt kolonları, partner_id ON DELETE SET NULL, 0001 yerinde düzeltme (remote ilk apply sonrası dondurulur). Açık takipler: 0002 numara çakışması (FAZ_3, remote apply öncesi), content e2e `../audit` import hatası (admin scope).
- [2026-10-11] Opus 5.5 · KAYIT DÜZELTMESİ (👤 karar: B — geçmişe dokunma) — `eeac7e3` (0.8) commit'ine 0.7'nin önceden stage'de bekleyen `.github/workflows/orchestrator.yml` silmesi (−55 satır) karışmıştır. Bu silme **Step 0.7'ye aittir** (bkz. 0.7 kaydı: `git rm`, v2.0 gereği); içerik doğru, yalnızca commit sınırı yanlış. Push yok → kozmetik. Paralel oturumlar aynı çalışma ağacında olduğu için `reset --soft` uygulanmadı. Temizlik: 0.10'da `main`'e squash-merge ile kendiliğinden giderilir. **Dal kararı (👤):** FAZ 0 dalı = `tasks/faz0-progress-panel`; faz ortasında `main` ilerletilmez; 0.10 sonunda squash-merge. Ders (tüm ajanlar): commit öncesi `git diff --cached --name-status` ile stage'i kontrol et — yalnızca kendi scope'unun dosyaları olmalı.
- [2026-10-11] Sonnet 5.5 · Step 0.7 · ✅ KAPANIŞ (commit `9921128`, dal `tasks/faz0-progress-panel`, yalnız `.github/workflows/**`) — Dosyalar: build.yml (yeni), qa-gate.yml (yeniden yazıldı), nightly.yml + weekly-report.yml (devre dışı). KARAR nightly/weekly: SİLİNMEDİ, **devre dışı bırakıldı** — `schedule` tetikleyicisi yorum satırına alındı (yalnız elle `workflow_dispatch` kaldı), başlıkta 'FAZ 4/6'da aktifleşecek' notu; iskelet FAZ 4.2/3.9 ve 6.4 için korunuyor. Not: orchestrator.yml silmesi `eeac7e3` içinde (yukarıdaki KAYIT DÜZELTMESİ). Kabul kanıtı: `pnpm build` exit 0, 70 HTML sayfa (≥49); 4 workflow YAML parse OK; gömülü secret yok (yalnız `${{ secrets.* }}`); d1-schema adımı yerelde pozitif (4 migration, 10 tablo) + negatif (eksik tablo → exit 1) test; commit öncesi `git diff --cached` yalnız 4 workflow dosyası. EKSİK/ŞÜPHE: actionlint yerelde çalıştırılamadı (kurulu değil) — qa-gate `workflow-lint` işi ilk PR'da doğrulayacak; lint adımı yok (eslint config yok, `next lint` CI'da interaktif); weekly-report.yml'de v1 kalıntısı (`GLM_API_KEY`, token_ledger) 6.4'te temizlenecek.
- [2026-10-12] Haiku 5.5 · Step 0.10 · ✅ — Kullanıcı kararı: gitleaks binary indirilmedi (kriter 5 = interim: `git grep` 0 eşleşme + CI gitleaks-action ilk PR'da enforce); 0.9 yeniden açılmadı (kriter 7 = altyapı MET, tam popülasyon FAZ 1.9/2.8/5.8'e devredildi); hardcoded hex fe adımı açılmadı → FAZ 1.6/1.7/2.4/3'e devredilen 93 satır `qa/FAZ-0/rapor.md` bölümünde listelendi. `pnpm build` 2026-10-12 EXIT=0, 70 HTML. Dosya: `qa/FAZ-0/rapor.md`. Sonuç: 8/8 MET (2 etiketli).
- [2026-10-11] Haiku 5.5 · Step 0.10 · ⏸ (insan bekliyor) — 8 kriter v2.0'a göre yeniden denetlendi; dosya: `qa/FAZ-0/rapor.md`. Sonuç: 6/8 kanıtlı PASS (1 pnpm build EXIT=0 + 70 HTML; 2 tokens v2.1 + 8 brief; 3 wrangler d1 migrations temiz persist 4/4; 4 build.yml+qa-gate.yml, orchestrator.yml yok, nightly/weekly schedule yorumda; 6 hero 4 dil; 8 insan kaydı). 5 gitleaks DOĞRULANAMADI (yerelde kurulu değil; CI gitleaks-action ilk PR'da). 7 KISMİ (helper ✅, sitemap.xml 18 URL ama yalnız TR; SEO_PLAYBOOK §8 sitemap-index yok; hreflang `<link>` yalnız 5/70 sayfada). Ek bulgu: `app/components/ApplicationForm.tsx` hardcoded hex (kural 3) — fe scope, düzeltilmedi. Kapı AÇIK; "devam et" verilmedi. Eksik/şüphe: kriter 5 ve 7 kararları insanda.

---

## 5. İNSAN AKSİYON NOKTALARI (👤 — senin görevlerin)

1. **0.5 öncesi:** 3 palet varyantından birini seç.
2. **0.8 sonrası:** D1 şema özetini review et → "review onaylı".
3. **0.10 sonrası:** rapor 8/8 ise "devam et" → FAZ 1.
