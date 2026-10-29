# FAZ 5 — Ajan Görev Panosu ve Koordinasyon (ZH + DE)
**Proje:** bdimexport.com | **Sürüm:** 1.0 | **Tarih:** 30.10.2026 | **Yürütücü:** **Opus 5.5** (tüm adımlar — 27.10 kararı)
**Hedef:** İki izole kültür sitesinin **içeriğini** doldur: `/zh` (Çinli firmalar, Baidu+WeChat) ve `/de` (DACH, Impressum/Datenschutz + formal Sie). Tasarım/shell **D6'da hazır** → bu faz **içerik + hukuk + davranış + QA.**

> Yetkili detay: `fazlar/FAZ_5.md` · kurallar: `OPUS_GOREV_TALIMATI.md` §3 · `AGENTS.md`. Tasarım: D6 shell'leri (DE sakin-güven, ZH kırmızı-altın + WeChat QR) MEVCUT — yeni stil değil, **içerik bu stilli shell'e dolar.**
> Ön koşul: FAZ 4 kapandı ✅. content/de ve content/zh şu an **boş** → bu faz yazacak. Feature dalı, faz sonunda main'e squash-merge.

---

## 0. PROTOKOL (özet)
- "git bunu oku" → oku, sıradaki adımı belirle. "talimatı uygula" → §2'de ⏳/⚠️, bağımlılığı ✅, sıradaki adımı yap.
- Her adım: §2/§4 güncelle + tek-scope commit (`git status`/`diff --cached` kontrol). Düz "yaptım" yok.
- İnsan kapısı (👤) → DUR, hazırla, kullanıcıya sor, onay/girdi bekle. Sırayı atlama.
- **Semboller:** ⏳ todo · 🔄 running · ✅ done · ⛔ blocked · ⏸ insan bekliyor · 🔒⚖️ hukuki · 👤 insan

## 1. DEĞİŞMEZ KURALLAR
1. **Hukuk metni (5.1) = veri insandan, imza insandan** (uydurma alan = hard-red). Pazarlıksız.
2. **Dil kalitesi:** zh 简体字 (geleneksel=red); de **formal Sie** (du/dich/euch=red). Terminoloji I18N_RULES §3.
3. **İçerik çeviri DEĞİL** (I18N §1): /zh kendi niyetiyle (lokal ayak, WeChat), /de DACH yerelleştirmesi.
4. **Rakamlar kaynaklı** (TÜİK/TİM; uydurma=red). ICP vaadi /zh'de YASAK (Cloudflare HK).
5. **Stil D6'da** → yeni hex/komponent yazma; mevcut shell + prose tipografisini kullan.
6. **Ortak dosya tekeli** (sitemap/hreflang) → yalnız 5.8.

---

## 2. DURUM TABLOSU (CANLI)

| Sıra | Adım | Scope | Bağımlılık | Durum | Son güncelleyen |
| :-- | :-- | :-- | :-- | :-- | :-- |
| 1 | 5.1 /de Impressum + Datenschutz 🔒⚖️ | `content/de/legal/**`, `app/(de)` legal page | 👤 veri | ⏸ **👤 ŞİRKET VERİSİ + HUKUK İMZASI bekliyor** | — |
| 2 | 5.2 /zh kimlik + iskelet | `content/zh/**` (kimlik), `app/(zh)` | D6 shell ✅ | ⚠️ shell D6'da ✅ → içerik 5.3'le | — |
| 3 | 5.3 /zh hizmet sayfaları | `content/zh/services/**` | 5.2 | ✅ `869dfd4` — 5 sayfa (4'lü gruplama yasağı → 5), 1233–1348 kelime, Baidu meta, 6 SSS/sayfa, sözlük uyuşmazlığı 0, kaynaklı rakam; D6 kabuğuna bağlı · 👤 zh kültür onayı 5.7'de | Opus 5.5 · 2026-10-30 |
| 4 | 5.5 /zh Baidu SEO | `app/(zh)` meta | 5.3 | ⏳ meta hazır · 👤 doğrulama = ERTELENEN **E9** (custom domain sonrası) | — |
| 5 | 5.4 /de hizmet + /de/vertrauen | `content/de/services/**`, `content/de/.../vertrauen` | 5.1 | ⏳ de içerik (5 hizmet + Trust, Sie, ≥1200) | — |
| 6 | 5.6 /de + /zh davranış | `app/(de)/**`, `app/(zh)/**` | 5.3, 5.4 | ⏳ de GDPR double opt-in form + zh WeChat davranış (+ C7: de/zh makale rotaları) | — |
| 7 | 5.7 Dil kalite turu | `qa/**` | 5.3–5.6 | ⏳ · 👤 **zh kültür/marka onayı** | — |
| 8 | 5.8 hreflang/sitemap (4 dil tam) | `app/sitemap.ts`, `lib/hreflang.*` | 5.3–5.6 | ⏳ tr+en+de+zh tam karşılıklı (FAZ 2'de ertelenen tamamlanır) | — |
| 9 | 5.9 QA (dil+hukuk+görsel) | `qa/**` | 1–8 ✅ | ⏳ | — |
| 10 | 5.10 Hukuk/kültür imza 🚀 | `qa/**` | 5.9 + 👤 | ⏸ 👤 imza | — |
| 11 | 5.11 Faz çıkışı 🚦 | `qa/**` | 5.10 + 👤 | ⏸ 👤 onay | — |

**Sıralı yürütme:** 5.1 → 5.3 → 5.5 → 5.4 → 5.6 → 5.7 → 5.8 → 5.9 → 5.10 → 5.11 · *(5.1 veri gelene kadar bloklu; bu sırada 5.3 /zh hattı başlayabilir — veri gerektirmez)*
**Not:** zh ve de hatları scope olarak ayrı → biri bloklanırsa diğeri akar.

---

## 3. ADIM TALİMATLARI (özet — tam detay `fazlar/FAZ_5.md`)

### 5.1 /de Impressum + Datenschutz 🔒⚖️ · 👤
```
Scope: content/de/legal/{impressum,datenschutz}.md + page bağlamları
ÖN KOŞUL: şirket verisi insandan (ticaret unvanı, adres, yetkili temsilci, iletişim, vergi/sicil no, veri sorumlusu). GELMEDEN BAŞLAMA.
- §5 TMG Impressum + DSGVO Datenschutzerklärung; footer linkleri tüm /de'de; form veri kategorileriyle tutarlı.
Kabul: Sie; veri kategorileri gerçek formlarla eşleşir; İNSAN HUKUK İMZASI (merge önşartı). Tek commit.
```
### 5.3 /zh hizmet sayfaları (veri gerektirmez — ÖNCE başlanabilir)
```
Scope: content/zh/services/**
- 4–5 hizmet (lokal satış/pazarlama/şirket kurulumu/lojistik köprü); ≥1200 kelime; 简体字; Baidu meta (title ≤30, desc ≤78 Çince karakter); "yerel ayak" vurgusu; FAQPage.
Kabul: sözlük zh (采购/验厂/物流); kontrol ≤3 uyuşmazlık; kaynaklı rakam. Tek commit.
```
### 5.4 /de hizmet + vertrauen
```
Scope: content/de/services/**, content/de/.../vertrauen
- 5 hizmet DACH yerelleştirmesi (çeviri değil) + /de/vertrauen (gerçek yorum/künye — uydurma=red); formal Sie; ≥1200; Service+FAQPage.
Kabul: Sie regex temiz; kaynaklı. Tek commit.
```
### 5.6 davranış · 5.8 hreflang · 5.9 QA · 5.7/5.10/5.11 (detay FAZ_5.md)

---

## 4. ÇALIŞMA GÜNLÜĞÜ (append-only)
- [2026-10-30] Pano kurulumu — FAZ 4 kapandı. D6 tasarım shell'leri (de/zh) hazır; content/de + content/zh BOŞ → bu faz içerik. 5.1 /de hukuk 👤 veri bekliyor; 5.3 /zh hattı veri gerektirmeden başlayabilir. Baidu (5.5) doğrulaması E9'a (custom domain sonrası) ertelendi.
- [2026-10-30] Opus 5.5 · Step 5.3 · ✅ — commit `869dfd4` (zh: content/zh/services ×5 + manifest.json + app/(zh)/zh/services/[slug] + hub kartları + zh.json). Sayfalar: 本地销售 (bendi-xiaoshou) · 市场推广 (shichang-tuiguang) · 公司设立 (gongsi-sheli) · 物流与清关 (wuliu-qingguan) · 产品合规 (chanpin-renzheng). Talimat 4–5 dedi; zh'de 4'lü gruplama yasak (design-tokens §2.1) → 5. KABUL (`node qa/FAZ-5/zh-content-check.mjs` → 5/5 ok): kelime 1233–1348 (Intl.Segmenter zh; Han 1995–2206) ≥1200 · Baidu title 17–19 ≤30 / desc 60–67 ≤78 · SSS 6/sayfa = FAQPage birebir · 简体字 (geleneksel 0) · I18N §3 sözlük uyuşmazlığı 0 (≤3) · iç link ≥4 · ICP vaadi yok. Rakamlar linkli resmi kaynak: TÜİK ADNKS 2024 (85.664.944; İstanbul 15.701.602), Ticaret Bakanlığı Çin Pazara Giriş Rehberi 05/2026 (2024 Çin'den ithalat ≈44,9 mlr USD), Ticaret Bakanlığı e-ticaret raporu 06.05.2025 (>3 trilyon TL; perakende 1,619 trilyon; 1,85 mlr işlem), RG 25.11.2023/32380 Karar 7887 (Ltd 50.000 / A.Ş. 250.000 TL), 4875 sayılı Kanun. "Sayısal güven (proje/yıl)" şirket verisi verilmediği için YAZILMADI (uydurma=red) — 👤 gerçek rakam gelirse eklenir. "%100 yabancı sahiplik" doğrulanamadığı için kullanılmadı. 7/24 iddiası yerine SLA (24 saatte yanıt). Build yeşil (106 sayfa); sitemap-zh 5 URL'yi içerikten kendiliğinden aldı (ortak dosya değişmedi); JSON-LD Service+FAQPage+BreadcrumbList; hreflang 5.8'de. NOT: hizmet metinleri Opus taslağı — 5.7 kültür/marka onayı (👤) bekliyor.

## 5. İNSAN AKSİYONLARI (👤)
1. **5.1 (ŞİMDİ, blokör):** /de Impressum/Datenschutz için gerçek **şirket verisi** (ticaret unvanı, adres, yetkili, iletişim, vergi/sicil no) + **hukuk imzası**.
2. **5.7:** /zh kültür/marka onayı.
3. **5.5:** Baidu doğrulama → ERTELENEN E9 (custom domain sonrası).
4. **5.10 / 5.11:** imza + faz çıkışı.
5. **Dal:** feature dalında; faz sonunda squash-merge.
