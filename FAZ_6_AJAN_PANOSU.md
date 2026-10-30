# FAZ 6 — Ajan Görev Panosu ve Koordinasyon (Analitik + Raporlama + Keyword Motoru)
**Proje:** bdimexport.com | **Sürüm:** 1.0 | **Tarih:** 2026-10-30 | **Yürütücü:** **Opus 5.5** (tüm adımlar — 27.10 kararı)
**Hedef:** Proje.md §5.1 modül 4'ün tam hali: dönüşüm atıfı (hangi SEO sayfası lead getiriyor), analitik dashboard tamamlama, keyword motoru (uzun kuyruk → ai_jobs), haftalık rapor, sistem sağlık panosu. "Ölçüm ve karar fazı" — **kod az, entegrasyon + analiz çok.**

> Yetkili detay: `fazlar/FAZ_6.md` · kurallar: `AGENTS.md` §7 · `ORCHESTRATOR.md` §9 (mahremiyet). FAZ 5 ✅ kapandı (`qa/FAZ-5/faz5-cikis-QA.md`).
> **Mevcut altyapı (FAZ 3.7):** `workers/cron-analytics` (google/meta/cloudflare sync + alert), `app/admin/analytics` (handler + AnalyticsChart + page), `app/admin/Dashboard.tsx`, D1 migration 0001–0005. FAZ 6 bunların ÜZERİNE kurar.

---

## 0. PROTOKOL (özet)
- "git bunu oku" → oku, sıradaki adımı belirle. "talimatı uygula" → §2'de sıradaki ⏳ adımı yap.
- Her adım: §2/§4 güncelle + **tek-scope commit** (`git status`/`diff --cached` kontrol). Düz "yaptım" yok.
- İnsan kapısı (👤) → DUR, hazırla, kullanıcıya sor, onay/girdi bekle.
- **Semboller:** ⏳ todo · 🔄 running · ✅ done · ⛔ blocked · ⏸ insan/erteleme bekliyor · 🟡 runtime Gemini (E3)

## 1. DEĞİŞMEZ KURALLAR
1. **Canlı veri ERTELENMİŞ (E4):** GSC/GA4/Meta OAuth credential'ları yok → gerçek trafik/dönüşüm verisi akmıyor. Kod **stub/mock veri** ile çalışır; şema + sorgu + dashboard hazır, canlı bağlama E4'te (FAZ 8 civarı). **Uydurma metrik YAZILMAZ** — boş/stub durumları zarifçe gösterilir ("veri bekleniyor"), sahte sayı değil.
2. **Anonim JOIN (KVKK, pazarlıksız):** lead × analytics JOIN **yalnız** `source_page`/`product_slug`/utm üzerinden; kullanıcı kimliği eşleştirilmez. Atıf penceresi: son tıklama, 30 gün; `source_page` boş → "direct".
3. **Keyword `volume` yalnız gerçek kaynaktan** (GSC/API); tahmin varsa "tahmin" işaretli. Uydurma hacim yasak.
4. **Runtime AI = Gemini (E3, en sonda):** 6.3 keyword analizi runtime çağrısı **stub**; kodu Claude yazar, model çağrısı E3'te bağlanır.
5. **Dashboard salt-okunur** (admin §2): grafikler D1'den (`analytics_daily` vb.) okur; sayfada canlı API çağrısı YOK (cron D1'e yazar).
6. **Migration expand/contract** disiplini (yeni tablo/view gerekirse); admin backend henüz canlı değil (E8) → kod + test, canlı yönlendirme ertelenmiş.
7. **Static export:** dashboard admin grubunda (Access E1 arkasında, ertelenmiş); build read-only, runtime yok.

---

## 2. DURUM TABLOSU (CANLI)

| Sıra | Adım | Scope | Bağımlılık | Durum | Son güncelleyen |
| :-- | :-- | :-- | :-- | :-- | :-- |
| 1 | 6.1 Dönüşüm atıf modeli (JOIN/SQL) | `workers/api/**`, `db/migrations/**` | 3.7 cron ✅ (veri E4 stub) | ✅ KOD + TEST (commit `2d75b5d`; api 120/120, tsc 0, lint 0, sqli/secret taraması temiz). Migration 0006 expand-only (4 view) — **remote apply 👤** (staging önce). Sözleşme: `workers/api/src/attribution-contract.ts` (`attribution.v1`) → 6.2 bunu okur | Opus 5.5 · 2026-10-30 |
| 2 | 6.2 Analitik dashboard tamamlama | `app/admin/**` (api hariç) | 6.1 veri sözleşmesi | ✅ (commit `63c28a5`) — attribution.v1 üzerinde Chart.js; 90/30/7 gün + dil filtresi; boş veri zarif ("veri bekleniyor", sahte sayı yok); Lighthouse admin perf 96–100 · a11y 100 | Opus 5.5 · 2026-10-30 |
| 3 | 6.3 Keyword motoru (uzun kuyruk → ai_jobs) | `workers/api/**`, `db/migrations/**`, `app/admin/**` | 6.1 (GSC verisi) · FAZ 4 ai_jobs hattı | ⏳ 🟡 (runtime Gemini = E3 stub) | — |
| 4 | 6.5 Meta API entegrasyonu | `workers/cron-analytics/**` | 3.7 | ⏳ (OAuth = E4 stub) | — |
| 5 | 6.6 Sistem sağlık panosu | `app/admin/**`, `workers/**` | 6.2 | ⏳ | — |
| 6 | 6.4 Haftalık rapor üretimi | `workers/**`, `app/admin/**` | 6.1, 6.2 | ⏳ | — |
| 7 | 6.7 QA | `qa/**` | 1–6 ✅ | ⏳ | — |
| 8 | 6.8 Faz çıkışı 🚦 | `qa/**` | 6.7 + 👤 | ⏸ 👤 onay + reklam bütçesi/rapor tercihi | — |

**Sıralı yürütme:** 6.1 → 6.2 → 6.3 → 6.5 → 6.6 → 6.4 → 6.7 → 6.8
**Not:** 6.2 ve 6.3/6.4 farklı scope → sıralı ama bağımsız; 6.1 veri sözleşmesi hepsinin önkoşulu.

---

## 3. ADIM TALİMATLARI (özet — tam detay `fazlar/FAZ_6.md`)

### 6.1 Dönüşüm atıf modeli (fazın ilk adımı)
```
Scope: workers/api/** + db/migrations/** (yeni tablo/view gerekirse 0006, expand/contract)
- leads.source_page + utm → analytics_daily JOIN → attribution (view veya hesaplanan sorgu).
- Sayfa bazlı dönüşüm hunisi: görüntüleme → form start → submit; sayfa sıralaması.
- ANONİM JOIN (yalnız source_page/slug/utm; kimlik yok); 30 gün son-tıklama penceresi; boş → "direct".
- Canlı veri yok (E4) → stub fixture ile test; şema + sorgu gerçek, veri mock.
Kabul: test lead'i doğru sayfaya atfedilir; 30 gün dışı atfedilmez; dashboard sözleşmesi (6.2) tanımlı. Tek commit.
```
### 6.2 Dashboard tamamlama (salt-okunur)
```
Scope: app/admin/** (api hariç) — Dashboard.tsx + analytics/*
- Chart.js: günlük trafik (GSC gösterim/tıklama + GA4 oturum) · lead kaynağı dağılımı (6.1) · en iyi dönüşen içerik · locale kırılımı (tr/en/de/zh) · keyword çıktı takibi.
- D1'den okur (canlı API yok); 90 gün + dil filtresi; boş-veri zarif ("veri bekleniyor"); admin Lighthouse ≥85.
Kabul: grafikler stub/gerçek veriyle render; filtreler çalışır. Tek commit.
```
### 6.3 Keyword motoru 🟡 · 6.5 Meta · 6.6 Sağlık · 6.4 Rapor · 6.7/6.8 (detay FAZ_6.md)
- **6.3:** `keywords` tablosu akışı: admin girişi + GSC fırsat sinyali (gösterim var, tıklama düşük) → analiz (Gemini E3 **stub**) → hedef sayfa/locale/intent kararı (gerekçeli) → ai_jobs (FAZ 4 hattı). `volume` yalnız gerçek kaynak.
- **6.5:** Meta (Facebook/IG) reklam/erişim metrikleri cron'a (OAuth E4 stub).
- **6.6:** Sistem sağlık panosu: cron son çalışma, kota, hata oranı, worker durumu.
- **6.4:** Haftalık rapor üretimi (D1 → özet; dağıtım E5 mail stub).
- **6.7:** QA (deterministik geçitler + mahremiyet/anonim JOIN denetimi). **6.8:** 👤 faz çıkışı + tercihler.

---

## 4. ÇALIŞMA GÜNLÜĞÜ (append-only)
- [2026-10-30] Pano kurulumu — FAZ 5 kapandı (`ee48755`). FAZ 6 "ölçüm fazı": kod+şema+dashboard kurulur, canlı veri E4 (GSC/GA4/Meta OAuth) + keyword runtime E3 (Gemini) ERTELENMİŞ → stub ile çalışılır. İlk adım 6.1 (atıf modeli).
- [2026-10-30] Opus 5.5 · Step 6.1 · ✅ KOD + TEST (commit `2d75b5d`) — `db/migrations/0006_attribution_views.sql` (YENİ), `workers/api/src/{attribution.ts, attribution-contract.ts}` (YENİ), `admin.ts` (+1 rota), `test/attribution.test.ts` (30 test). app/admin'e DOKUNULMADI (6.2). MİMARİ: leads + analytics_daily → 4 VIEW (expand-only): `attribution_leads_v` (YALNIZ created_at, locale, form_type, source_page, utm_source/medium/campaign, touch_at — id/payload/partner/kanal/rıza YOK), `attribution_page_traffic_v` (GA4 topPages), `attribution_page_search_v` (GSC topPages), `attribution_page_formstart_v` (GA4 formStarts). Atıf sorgu anında hesaplanır (yeni tablo/materyalizasyon yok). Rota: `GET /admin/api/analytics/attribution?days=1..90&locale=&min_sessions=` — Access guard + ADMIN-ONLY (lead-türevi; 3.7 kuralı), yalnız GET, no-store. MODEL: son tıklama, 30 gün. lead.source_page = son tıklamayla gelinen sayfa; utm_json.touch_at = tıklama zamanı (yoksa tıklama = lead anı). source_page boş/'direct' → direct/no_source; touch_at > 30 gün → ATFEDİLMEZ (direct/window_expired; tam 30g atfedilir, +1sn atfedilmez); touch_at bozuk/gelecek → direct/invalid_touch. Sayfa anahtarı normalize (host/sorgu/hash/slash/küçük harf) → GA4 path, GSC tam URL, lead source_page aynı sayfada birleşir. UTM değerleri kullanıcı-kontrollü → dar karakter kümesi, aksi '(other)'. HUNİ: sessions (GA4) → form_start (GA4 olayı) → submit (atıflı lead); sıralama submits↓, sessions↓, page; top_converting yalnız sessions≥min_sessions (varsayılan 100). Ek: kaynak dağılımı (top10+other), ürün-slug, locale kırılımı, günlük seri. 6.2 VERİ SÖZLEŞMESİ (alan adları DONDURULDU, `attribution.v1`): contract, generated_at, period{from,to,days,attribution_window_days,model}, data_status{traffic none|partial|ok, analytics_days_with_data, search_data, form_start_tracking, traffic_basis, leads_truncated, pages_truncated, note}, totals{leads_in_period, attributed, direct, direct_no_source, direct_window_expired, direct_invalid_touch, sessions, gsc_clicks, gsc_impressions, form_starts}, funnel.stages[{id,label,value}], pages[{rank,page,locale,product_slug,sessions,gsc_clicks,gsc_impressions,form_starts,submits,session_to_submit_rate,session_to_start_rate,start_to_submit_rate,days_with_traffic}], top_converting[], min_sessions, sources[{source,medium,leads,share}], products[{product_slug,leads}], by_locale[{locale,leads,sessions}], daily[{day,sessions,gsc_clicks,gsc_impressions,leads}]. KURAL: bilinmeyen = null (0 değil) → UI 'veri bekleniyor'; data_status.note okunur açıklama. Tipler `import type` ile alınabilir. KABUL: (1) test lead'i doğru sayfaya atfedilir (olive-oil 3 submit, /ithalat 1; URL varyantları tek sayfa; sayfalara dağılan = atfedilen); (2) 30 gün dışı atfedilmez (56 gün eski dokunuş → direct/window_expired, sayfaya yazılmadı; sınır testi); (3) ANONİM JOIN: görünüm kolonları tam 8 (PRAGMA); id/payload_json/partner_id/channel_pref/consent_* seçimi 'no such column' HATASI; çalışan SQL metinleri gözlemlendi → `leads` tablosu/PII kolonu yok; yanıtta PII metni ve e-posta/telefon/ad/mesaj/lead-id anahtarı YOK; payload/partner değişse çıktı birebir aynı; kaynakta FROM leads yok; (4) migration expand/contract: yalnız CREATE VIEW, tablo/kolon/index/trigger BİREBİR aynı, leads verisi değişmedi, idempotent, geri alınabilir (DROP VIEW), eski sorgular önce/sonra aynı; (5) uydurma metrik yok: analytics boşken trafik/oran/form_start null + data_status none + not; bozuk JSON sorguyu patlatmaz — fixture testi 'malformed JSON' hatasını yakaladı (metin-öğeli dizi), view'lar json_type/p.type korumasıyla düzeltildi (0006 henüz uygulanmadığından yerinde düzeltme meşru); (6) endpoint: anon 401, viewer 403, admin 200 + anahtarlar birebir, parametre doğrulaması 400, POST/PUT/DELETE/PATCH 404. workers/api 120/120, tsc 0, `pnpm lint` 0/0, qa sqli-static-scan gerekçesiz 0, secret-scan 0, QA api paketi yeşil. BAĞIMLILIK/EKSİK (6.1 DIŞI): (a) lead YAZICISI yok: /v1/leads POST (ERTELENEN C1) yazılırken leads.utm_json'a `sanitizeTouch()` çıktısı ve source_page'e son-tıklama yolu yazılmalı. (b) İSTEMCİ (fe scope): 30 gün ömürlü son-tıklama kaydı + GA4 `form_start` olayı yok → o huni aşaması null. (c) cron (3.7/6.5): ga4_json.formStarts yazılmıyor; topPages günlük EN ÇOK 20 sayfa ve üst-düzey sessions bu 20'nin TOPLAMI (düşük) → `traffic_basis='ga4_top20_pages_per_day'` ile işaretli; E4'te 6.5'te ele alınmalı. (d) yalnız analytics_daily.locale='all' okunur. (e) 0006 remote apply 👤: staging `wrangler d1 migrations apply bdimexport-db-staging --env staging --remote`, sonra prod; ilk remote apply'dan sonra dosya DONDURULUR (değişiklik = 0007). (f) router/Pages bağlama + UI ADMIN_API_BASE farkı (F-06) 6.2'de canlıda doğrulanmalı. (g) GSC SORGU-bazlı veri (keyword fırsatı) bu sözleşmede YOK → 6.3.
- [2026-10-30] Opus 5.5 · Step 6.2 · ✅ (commit `63c28a5`; yalnız `app/admin/**` — workers/api + 6.1 DOKUNULMADI). VERİ: `GET /analytics/attribution` (attribution.v1 — alan adları `workers/api/src/attribution-contract.ts`'ten `import type`; D1 analytics_daily + 0006 view'ları; sayfada canlı GSC/GA4/Meta çağrısı YOK) + `/analytics/summary` (yalnız Meta harcaması). GRAFİKLER (`analytics/page.tsx` + genel `analytics/Chart.tsx`, eski AnalyticsChart kaldırıldı): KPI (oturum/GSC/lead+atfedilen/doğrudan/form_start) · günlük trafik (GA4 oturum + GSC tıklama, gösterim y2; null = BOŞLUK, 0 değil) · lead kaynağı halka (utm source/medium + pay; doğrudan kırılımı no_source/window_expired/invalid_touch) · huni (null aşama "veri bekleniyor") · en iyi dönüşen içerik (top_converting, oturum→lead yatay çubuk; min_sessions eşiği) + atıflı lead sayfaları tablosu · dil kırılımı (tr/en/de/zh AYRI trend: sözleşmenin locale filtresiyle 4 ayrı istek; >31 gün haftalık kova, tümü-null kova null; by_locale tablosu) · keyword çıktı takibi PLACEHOLDER (6.3) · Meta harcama (6.5/E4). FİLTRE: 90/30/7 gün (varsayılan 90) + dil (tümü/tr/en/de/zh) → sözleşme parametreleri `days`/`locale`; `#days=&locale=` hash ile paylaşılabilir (static export). Dashboard.tsx: admin rolünde 30 gün trafik/lead trendi (uç admin-only → viewer'da istek ATILMAZ; `useAdminGet(null)`). BOŞ VERİ: gerçek `computeAttribution` boş D1 çıktısı (traffic none, tüm trafik null) ile doğrulandı — her bölüm "veri bekleniyor"/"kayıt yok" + `data_status.note`; sahte sayı 0. QA fixture (sentetik, yalnız yerel render testi — commit EDİLMEDİ) ile grafikler + filtre (DE/30 gün) doğrulandı. `view.ts` saf mantık + `view.test.mjs` 7 test; tüm admin test paketleri yeşil (89 test). LIGHTHOUSE (boş + fixture × masaüstü/mobil × /admin, /admin/analytics): perf 96–100 · a11y 100 · bp 96 (yerel mock favicon 404) · seo 54 = kasıtlı noindex (admin). Düzeltilen: mobilde `.main` flex taşması (içerik beyaz body'ye taşıyordu → kontrast), menü 1→7 öğe satır kaydırma + iskelet yükseklikleri (CLS 0.6 → ≈0), 5 grafik ilk anda çiziliyordu (TBT 570 ms → görünür alana gelince çiz, 130 ms). pnpm lint ✅ · tsc ✅ · build 117 ✅. AÇIK (6.2 DIŞI): canlı veri E4; admin router/Pages bağlama E8 + `NEXT_PUBLIC_ADMIN_API_BASE` (F-06) canlıda doğrulanmalı; dil trendinde oturum serisi top-20 sayfa kapsamlı (traffic_basis); keyword bölümü 6.3'te dolacak.

## 5. İNSAN AKSİYONLARI (👤)
1. **E4 (canlı veri):** GSC/GA4/Meta OAuth credential'ları — gerçek property + trafik olunca (FAZ 8 civarı). FAZ 6 kodu o ana dek stub ile hazır bekler.
2. **6.8 faz çıkışı:** reklam bütçesi kararı + haftalık rapor tercihi (format/sıklık/alıcı).
3. **E3 (keyword runtime):** Gemini ayarı en sonda (AGENTS.md §9).
