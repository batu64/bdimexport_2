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
| 4 | 5.5 /zh Baidu SEO | `app/(zh)` meta | 5.3 | ✅ kod/meta `5c7a5f2` · 👤 canlı doğrulama = ERTELENEN **E9** (custom domain sonrası) | Opus 5.5 |
| 5 | 5.4 /de hizmet + /de/vertrauen | `content/de/services/**`, `content/de/vertrauen.md` | 5.1 | ✅ `586a6e5` 5 hizmet + Trust (Sie, ≥1200) · Impressum/Datenschutz metni 5.1 PARK | Opus 5.5 |
| 6 | 5.6 /de + /zh davranış | `app/(de)/**`, `app/(zh)/**` (+ api iskelet) | 5.3, 5.4 | ✅ `239f3f3` api · `9d7c7f7` de · `32aad52` zh — DSGVO çift opt-in (form kapalı, 🔒 review) + WeChat QR dokun-büyüt + C7 shell'leri + CTA hizalama | Opus 5.5 |
| 7 | 5.7 Dil kalite turu | `qa/**` | 5.3–5.6 | ✅ denetim — 22 kontrol: ✅18 ⚠️4 ❌0 (`qa/FAZ-5/dil-kalite-turu.md`) · ⏸ 👤 **zh kültür/marka onayı HAZIR** | Opus 5.5 |
| 8 | 5.8 hreflang/sitemap (4 dil tam) | `app/sitemap.ts`, `lib/hreflang.*` (+ 9 ana sayfa wiring) | 5.3–5.6 | ✅ `2c81d03` — tr+en+de+zh + en-XX tam karşılıklı, x-default=tr; 9/9 ana sayfa; sitemap 88 URL (/de+/zh); dangling hreflang 0; B1 `0163284` | Opus 4.8 (orchestrator) · 2026-10-30 |
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
- [2026-10-30] Opus 5.5 · Step 5.5 · ✅ — commit `5c7a5f2` (zh: app/(zh) layout + /zh metadata). `NEXT_PUBLIC_BAIDU_SITE_VERIFICATION` → `baidu-site-verification` meta YALNIZ değer biçim doğrulamasından (`^[A-Za-z0-9_-]{6,64}$`) geçerse; `applicable-device pc,mobile` + `Cache-Control no-transform/no-siteapp` (Baidu 转码 engeli); /zh hub keywords + canonical. 3 build ile doğrulandı: env yok → meta yok · `codeva-TEST123abc` → yalnız /zh'de meta · zararlı `x"><script>…` → meta yok, enjeksiyon yok. robots.txt (orchestrator) DEĞİŞMEDİ — Baiduspider Allow + sitemap-zh zaten var. Canlı doğrulama 👤 = ERTELENEN E9 (custom domain sonrası).
- [2026-10-30] Opus 5.5 · Step 5.4 · ✅ — commit `586a6e5` (de: content/de/services ×5 + content/de/vertrauen.md + app/(de)/de/leistungen/[slug] + _lib/services.tsx + hub kartları + vertrauen + de.json). Sayfalar: Beschaffung (beschaffung) · Lohnfertigung/Private Label (lohnfertigung) · Werksprüfung (werkspruefung) · Logistik (logistik) · Zollabwicklung (zollabwicklung). Çeviri değil DACH yerelleştirmesi: LkSG (§1, 1.000 çalışan eşiği 01.01.2024), Zollunion/A.TR (freier Verkehr ≠ Ursprung; tarım + Kap. 72 hariç), CH için EFTA–Türkei FHA (A.TR geçmez), VerpackG/LUCID, AT/CH bölümleri, EUSt ayrımı. KABUL (`node qa/FAZ-5/de-content-check.mjs` → 6/6 ok): kelime 1211–1256 (Quellen hariç) ≥1200 · META title 39–47 ≤60 / desc 147–159 ≤160 · FAQ 6/sayfa = FAQPage birebir · du/dich/euch 0 · UWG üstünlük/garanti 0 · I18N §3.1 terimleri (hub etiketleri sözlüğe çekildi: Eigenmarken-Fertigung→Lohnfertigung / Private Label, Exportzollabwicklung→Zollabwicklung, Frachtlogistik→Logistik) · iç link ≥3. Rakamlar linkli kaynak: TİM Oca–Ağu 2025 Almanya 13,1 mlr USD (CNN Türk), UN Comtrade 2025 (50,5 mlr; tekstil 19,47 — EN sektör sayfalarına bağlı), gesetze-im-internet LkSG §1, IHK Koblenz, SECO, Verpackungsregister. 2024 TİM Almanya değeri kaynaklar arasında tutarsız → KULLANILMADI. /de/vertrauen: noindex kalktı, canonical; "Kundenstimmen folgen in Kürze" placeholder (uydurma yorum yok); künye/şirket verisi YOK. Impressum/Datenschutz = 5.1 PARK (shell + footer link aynen). Build yeşil (111 sayfa), lint yeşil, smoke 7/7; JSON-LD Service+FAQPage+BreadcrumbList; hreflang + **sitemap-de henüz yok** → 5.8 (orchestrator). ⚠️ AÇIK: DE CTA sözlük çakışması (I18N_RULES §3.2 "Kostenlose Angebotseinholung in 24h" ↔ hero-copy/de.json "Kostenloses Angebot in 24 h anfordern") — gövde metinde CTA ifadesi kullanılmadı, butonlar mevcut haliyle; orchestrator + 👤 karar gerekli. NOT: metinler Opus taslağı — 5.7 dil kalite turu bekliyor.
- [2026-10-30] Opus 5.5 · Step 5.6 · ✅ — 3 tek-scope commit. **(api `239f3f3`)** POST /api/v1/de/anfrage: rate-limit → Turnstile (action `de_quote`; `verifyTurnstile`'a beklenen-action parametresi) → zod (`consent === true`, sürüm `DE_CONSENT_VERSIONS`'ta) → KV bekleyen kayıt `optin:sha256(token)` TTL 72 sa + `mailq:{id}` (// TODO E5 — gerçek mail YOK) → 202; POST /api/v1/de/optin/bestaetigen: tek kullanımlık → 200/410, lead (D1) yazımı TODO (🔒 şema eşlemesi). IP saklanmaz. `DE_CONSENT_VERSIONS` yalnız yerel [vars] → staging/prod fail-closed. Test 6 senaryo, workers/api 90/90. **(de `9d7c7f7`)** /de/anfrage: açık rıza kutusu ÖNCEDEN İŞARETSİZ (SSR'de `checked` yok — doğrulandı), çift opt-in notu, veri kategorileri yan kutusu `_lib/datenschutz.ts` TEK KAYNAK (form + sunucu şeması + 5.1 Datenschutz birebir — 5.1 bu listeyi beyan edecek). Form yayın kapısı `NEXT_PUBLIC_DE_FORM_ENABLED=1` (+API+Turnstile) — temiz build'de KAPALI → dürüst e-posta yolu; noindex. /de/anfrage/bestaetigen: token `#t=` fragment'te (Referer/log yok), okununca adresten silinir. /de/ratgeber + [slug] shell (boş → "folgen in Kürze" + noindex; `_yok` yer tutucu → notFound). **(zh `32aad52`)** WeChatContact/WeChatQrZoom (app/(zh) — lib/ui/WeChatCard'a dokunulmadı): QR → native `<dialog>` büyük QR (165→278 px @375) + 微信号 + 复制微信号 + 长按识别 ipucu; tarayıcıda doğrulandı: modal, odak 关闭'da, Esc + arka plan kapatır, odak QR'a döner; "点击放大二维码" yalnız pointer: coarse (masaüstü gizli); animasyon yalnız reduced-motion: no-preference; ortalama hatası (global reset margin:0) düzeltildi. /zh/insights + [slug] shell. **(CTA)** I18N_RULES §3.2 DE = "Kostenloses Angebot in 24 h anfordern"; de.json zaten bu biçimde, form düğmesi hero.ctaPrimary'den (tek kaynak); hero-copy Açık Konu 1 ✅ kapandı. KABUL: pnpm lint + tsc ✅ · temiz build 117 sayfa ✅ · smoke 7/7 · de-content-check 6/6 · zh-content-check 5/5 · hex 0 (yeni CSS yalnız token) · içerikte TR sızıntısı 0 / du-dich 0 · Baidu meta env yokken 0. content/** + sitemap/hreflang + legal shell DOKUNULMADI. AÇIK: C7 bot tarafı (render.ts routeFor — api); Ratgeber/资讯 nav linki içerik gelince; /de CTA'ları form açılana dek mailto.
- [2026-10-30] Opus 5.5 · Step 5.7 · ✅ (denetim; content/app DOKUNULMADI) — `qa/FAZ-5/dil-kalite.mjs` (22 deterministik kontrol, model yok) + `qa/FAZ-5/dil-kalite-turu.md`. Çift kontrol = deterministik script + Opus okuma/dış doğrulama (GLM AGENTS v2.0 ile kalktı) + 👤 zh onayı. ZH: 简体字 ✅ · Baidu meta ✅ · sözlük uyuşmazlığı 0 ✅ · 4-sayısı vurgusu 0 ✅ (tek 4'lü liste = dil seçici, gezinme) · ICP 0 ✅. DE: Sie ✅ · UWG 0 ✅ · LkSG/A.TR/VerpackG terim doğruluğu ✅ · §3.1 ⚠️ ("Frachtlogistik" 7× — bileşik, uyuşmazlık sayılmadı). Varyant: fr vous ✅ · es ustedes ✅ · ru Kiril %97,2 ✅ · ar RTL ✅. Çapraz: TR sızıntısı 0 (107 kod dosyası + render edilen 82 TR-dışı sayfa; görünür 19 "Türkçe" kelime = TİM/TÜİK/MERSİS/Şirket türleri gibi özel ad/orijinal terim) · CTA matrisi ru/ar/es/fr/nl/zh ✅, de WhatsApp ⚠️ (numara yok) · hero-copy↔sözlük↔messages birebir, hero-copy'de eski ⚠️ işareti ⚠️ · `_yok` yer tutucuları lang'sız ⚠️. Kaynak: 12 linkten 10'u 200; gesetze-im-internet (bu ağda DNS yok) + UNCTAD (Cloudflare doğrulaması, aşılmadı) 👤 tek tık; Comtrade 50,5/19,5 mlr `_claims.json` ile birebir; uydurma/kaynaksız rakam 0. Düzeltme önerileri B1–B5 raporda (ayrı commit, ilgili scope). Build 117 ✅ · lint ✅ · smoke 7/7 · de-check 6/6 · zh-check 5/5.

- [2026-10-30] Opus 4.8 (orchestrator) · Step 5.8 · ✅ — commit `2c81d03` (ortak dosya tekeli: lib/hreflang.ts + app/sitemap.ts + 9 ana sayfa wiring). Önce durum KIRIKTI: tr ana sayfa yalnız `tr` listeliyordu, **de ana sayfa hreflang YOKTU**, zh yalnız canonical, 5 varyant yalnız en ailesi — karşılıklılık yok. `homeAlternates(self)` eklendi: 9 ana sayfanın (tr / · en · de · zh · en/{ru,fr,nl,es,ar}) HEPSİ AYNI tam seti taşır (tr, x-default, zh-CN, en, de, en-RU/FR/NL/ES/AR), **x-default=tr** (SEO_PLAYBOOK §1:12 / Proje.md:47). İç sayfalar kendi ailesinde (farklı niyet — EN inner "TR/x-default YOK" kuralı korundu; de/zh hizmet sayfaları zaten "hreflang YAZILMAZ — ortak dosya 5.8" notuyla self-canonical bekliyordu). sitemap: /de (hub+5 Leistungen+vertrauen+anfrage) + /zh (hub+5 hizmet) eklendi (74→88 URL); ana sayfa URL'leri homeAlt xhtml:link taşır; kök `<loc>` trailing-slash kaldırıldı → hreflang tr/x-default href'i + canonical ile birebir; /de/ratgeber + /zh/insights makale yokken noindex → sitemap DIŞI. Ayrıca B1 (`0163284`): hero-copy DE CTA'daki kapanmış "Açık Konu 1" ⚠️ işareti kaldırıldı. DOĞRULAMA (`node scratchpad/check-sitemap.mjs` + render HTML): build yeşil (88 URL) · lint yeşil · **9/9 ana sayfa tam karşılıklı** · **dangling hreflang 0** (404-hreflang yok) · de+zh head hreflang+self-canonical render ediliyor. 5.7 B2 (Frachtlogistik korundu) · B3 (de WhatsApp → FAZ 8) · B4 (`_yok` lang/dir → 5.9) · B5+link (👤 tek-tık) kararları verildi.

## 5. İNSAN AKSİYONLARI (👤)
1. **5.1 (ŞİMDİ, blokör):** /de Impressum/Datenschutz için gerçek **şirket verisi** (ticaret unvanı, adres, yetkili, iletişim, vergi/sicil no) + **hukuk imzası**.
2. **5.7:** /zh kültür/marka onayı — **👤 HAZIR**: kontrol listesi `qa/FAZ-5/dil-kalite-turu.md` §6 (marka adı, hitap, kırmızı-altın bağlam, 4-sayısı, örnekler, WeChat ifadeleri, rakam sunumu). Ek: gesetze-im-internet + UNCTAD linklerine tarayıcıda tek tık kontrol (§4).
3. **5.6 🔒 review:** /de çift opt-in (workers/api/src/optin.ts + app/(de)/de/anfrage) + rıza metni taslağı (de.json `anfrage.consent`, sürüm de-v0-entwurf) — hukuk onayı; form açılışı = 5.1 yayın + E5 mail + `DE_CONSENT_VERSIONS` + `NEXT_PUBLIC_DE_FORM_ENABLED=1`.
3. **5.5:** Baidu doğrulama → ERTELENEN E9 (custom domain sonrası).
4. **5.10 / 5.11:** imza + faz çıkışı.
5. **Dal:** feature dalında; faz sonunda squash-merge.
