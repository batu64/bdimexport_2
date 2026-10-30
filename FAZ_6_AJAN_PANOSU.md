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
| 1 | 6.1 Dönüşüm atıf modeli (JOIN/SQL) | `workers/api/**`, `db/migrations/**` | 3.7 cron ✅ (veri E4 stub) | ⏳ **SIRADAKİ** | — |
| 2 | 6.2 Analitik dashboard tamamlama | `app/admin/**` (api hariç) | 6.1 veri sözleşmesi | ⏳ | — |
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

## 5. İNSAN AKSİYONLARI (👤)
1. **E4 (canlı veri):** GSC/GA4/Meta OAuth credential'ları — gerçek property + trafik olunca (FAZ 8 civarı). FAZ 6 kodu o ana dek stub ile hazır bekler.
2. **6.8 faz çıkışı:** reklam bütçesi kararı + haftalık rapor tercihi (format/sıklık/alıcı).
3. **E3 (keyword runtime):** Gemini ayarı en sonda (AGENTS.md §9).
