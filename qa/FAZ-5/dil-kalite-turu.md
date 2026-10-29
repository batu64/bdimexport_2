# FAZ 5 · Step 5.7 — Dil Kalite Turu (çift kontrol)

**Tarih:** 30.10.2026 · **Yürütücü:** Opus 5.5 · **Dal/HEAD:** `tasks/faz0-progress-panel` @ `6e3825f` · **Scope:** `qa/**` (yalnız rapor + script)
**Kapsam:** tr + en + de + zh + 5 EN varyant arayüzü (ru, fr, nl, es, ar)
**Sonuç:** 22 kontrol → **✅ 18 · ⚠️ 4 · ❌ 0**. Kırmızı bulgu yok; 4 uyarı aşağıda ayrı commit önerisiyle. **👤 zh kültür/marka onayı için hazır** (§6).

> Bu bir **denetim** adımıdır: `content/**` ve `app/**` değiştirilmedi. Düzeltme gerektiren her bulgu §5'te, ilgili scope'a **ayrı commit** önerisi olarak yazıldı.

---

## 1. Yöntem — "çift kontrol"

`fazlar/FAZ_5.md` 5.7 çapraz kontrolü GLM 5.3 ile tarif ediyor; AGENTS.md v2.0 çok-sağlayıcılı yürütmeyi kaldırdığı için çift kontrol şu iki bağımsız kanaldan oluşur:

| Kanal | Ne | Kanıt |
| :-- | :-- | :-- |
| 1 · Deterministik | `node qa/FAZ-5/dil-kalite.mjs` (22 kontrol, model çağırmaz) + `de-content-check.mjs` (6 sayfa) + `zh-content-check.mjs` (5 sayfa) + render edilmiş HTML taraması + `git grep` | Bu raporun tabloları; komutlar yeniden çalıştırılabilir |
| 2 · Okuma + dış doğrulama | Opus: DE/ZH metinlerin terim ve iddia bazında okunması; 12 kaynak linkinin canlılık kontrolü (curl + tarayıcı); UN Comtrade rakamlarının `_claims.json` ile çapraz hesabı | §3, §4 |
| 3 · İnsan (👤) | zh kültür/marka onayı — kültürel nüans modelden sorulamaz | §6 kontrol listesi |

Girdiler: `content/{de,zh}/**`, `lib/messages/{tr,en,de,zh}.json` + `variants/*.json`, `app/(en|en-*|de|zh)/**`, `lib/ui/**`, `design/hero-copy.md`, `I18N_RULES.md`, temiz build çıktısı `.next-build` (117 sayfa).

---

## 2. Dil × kontrol × sonuç

| Dil | Kontrol | Sonuç | Kanıt (özet) |
| :-- | :-- | :-- | :-- |
| zh | 简体字 (geleneksel = red) | ✅ | 17 dosya (content/zh + zh.json + app/(zh)), geleneksel karakter 0 |
| zh | Baidu meta (title ≤30 / desc ≤78) | ✅ | zh-content-check: title 17–19, desc 60–67 (5/5) |
| zh | I18N §3 sözlük (采购/验厂/物流/清关) | ✅ | uyuşmazlık 0 (eşik ≤3) · kullanım 采购×7 验厂×5 物流×24 清关×37 代工生产×1 |
| zh | 4-sayısı görsel vurgu kaçınması | ✅ | zh.json 4'lü liste 0 · içerikte 4个/四项 vb. vurgu 0 · render 6 sayfada 4'lü ızgara 0 (hizmet 5, adım 5). Tek 4'lü liste dil/pazar seçici (Türkçe·English·Deutsch·简体中文) — gezinme, vurgu değil |
| zh | ICP vaadi yok | ✅ | ICP / 备案 / 国内服务器 / 境内服务器 → 0 |
| zh | ≥1200 kelime, SSS ≥5 | ✅ | 1233–1348 kelime (Intl.Segmenter zh), SSS 6/sayfa = FAQPage |
| de | formal Sie (du/dich/euch = red) | ✅ | 24 dosya (content/de + de.json + app/(de)), informal hitap 0 |
| de | UWG: üstünlük/garanti yok | ✅ | beste / Marktführer / garantiert / 100 % / Nr. 1 → 0 ("Was wir nicht tun" öz-yasak alıntısı hariç) |
| de | LkSG terim/eşik | ✅ | 5 satır; hepsi "mindestens 1.000 Beschäftigte … seit 1. Januar 2024" (§ 1 LkSG); hukuki değerlendirmenin müşteride kaldığı açıkça yazılı |
| de | A.TR terim doğruluğu | ✅ | 24 satır; "A.TR = Ursprungsnachweis" iddiası 0 (aksine "Freiverkehr, nicht Ursprung" açık); tarım + Eisen/Stahl istisnası A.TR geçen her dosyada; CH için EFTA–Türkei FHA ayrımı 3 dosyada |
| de | VerpackG/LUCID | ✅ | "Verpackungsregister LUCID" + "Hersteller im Sinne des Verpackungsgesetzes" — sorumluluk Inverkehrbringer'de |
| de | I18N §3.1/3.2 terim tutarlılığı | ⚠️ | uyuşmazlık 0 · uyarı: "Frachtlogistik" (Logistik bileşiği) 7× → **B2** |
| de | ≥1200 kelime, SSS ≥5, kaynak | ✅ | de-content-check 6/6: 1211–1256 kelime, FAQ 6, link ≥1 |
| fr | formal vous (tu = red) | ✅ | fr.json tu/toi/ton/ta/tes 0 |
| es | neutral ustedes (vosotros = red) | ✅ | vosotros/vuestro/-éis 0 |
| ru | Kiril (translit = red) | ✅ | Kiril oranı %97,2 (marka/kanal adları hariç) |
| ar | RTL zorunlu | ✅ | `<html lang="ar" dir="rtl">` render edilen ar sayfalarında eksiksiz |
| çapraz | Hardcoded TR sızıntısı (TR dışı yüzeyler) | ✅ | 107 kod dosyası, kullanıcıya görünen Türkçe 0 (§3.1) |
| çapraz | Sözlük dosyalarında TR sızıntısı | ✅ | en/de/zh + 5 varyant JSON değerlerinde Türkçe 0 |
| çapraz | hero-copy ↔ sözlük ↔ messages (teklif CTA) | ⚠️ | en/de/zh üçü birebir; DE satırında eski ⚠️ işareti kalmış → **B1** |
| çapraz | CTA matrisi — EN varyantları | ✅ | ru→Telegram(+WhatsApp) · ar→WhatsApp · es→WhatsApp · fr→e-posta+WhatsApp · nl→e-posta; linkler gerçek handle gelene dek `#contact` (uydurma wa.me/t.me yok) |
| çapraz | CTA matrisi — zh→WeChat | ✅ | hub + 5 hizmet sayfasında WeChatContact; nav "微信联系"; env yokken "即将上线" + e-posta |
| çapraz | CTA matrisi — de→E-posta + WhatsApp | ⚠️ | e-posta ✅ · WhatsApp ✗ — gerçek numara yok (uydurma yasak) → **B3** |
| çapraz | Makale yer tutucusu (`_yok`) lang/dir | ⚠️ | 9 yer tutucu Next hata kabuğuyla (`<html id="__next_error__">`, lang yok) export ediliyor; noindex → **B4** |
| çapraz | Rakam → resmi kaynak | ✅ | 11 içerik sayfasında rakamlı her sayfada linkli kaynak; 12 link → §4 |

---

## 3. Bulgu kanıtları

### 3.1 Hardcoded TR sızıntısı — `git grep` + render kanıtı
- **Kod (yorum dışı):** `git grep -n -P "[ıİşŞğĞ]" -- "app/(de)" "app/(zh)" "app/(en)" "app/(en-*)" lib/ui` → kalan satırlar yalnız: satır sonu yorumları, `catalog.test.mjs` test adları (kullanıcıya görünmez), build-zamanı geliştirici hatası `throw new Error(...)` (`app/(en)/en/products/_lib/catalog.ts:45-46`) ve `lib/ui/md.tsx:24` FAQ_HEADINGS (çok dilli SSS başlığı **eşleştirme** listesi; render çıktısı değil). Script bu 3 satırı gerekçeli istisna olarak listeler.
- **Render (görünür metin):** `.next-build` içindeki 82 TR-dışı sayfanın görünür metninde Türkçe'ye özgü harf içeren 19 kelime — **hepsi özel ad / resmi kurum kısaltması / parantez içi orijinal hukuki terim:** TİM, TÜİK, Limited Şirket, Anonim Şirket, Şube, İrtibat Bürosu, MERSİS (zh şirket kurulumu sayfasında Çince açıklamanın yanında orijinal terim — doğru uygulama). Dil seçicideki "Türkçe" dil adı kendi dilinde yazılır (kasıtlı). **Sızıntı: 0.**

### 3.2 DE terim okuması (kanal 2)
- **Sie tutarlılığı:** hizmet sayfaları, vertrauen, anfrage formu, onay sayfası, Ratgeber boş durumu — tamamı Sie; emir kipleri "Senden Sie / Nennen Sie" biçiminde.
- **Kanıt tonu:** rakamlı her iddianın yanında kaynak; süre taahhütleri (24 h Angebot, 5 Arbeitstage Auswahlliste, 48 h Prüfbericht) EN sayfalarındaki SLA'larla aynı; yorum/künye uydurması yok ("Kundenstimmen folgen in Kürze").
- **Hukuki sınır cümleleri doğru yerde:** LkSG değerlendirmesi müşteride, CE uygunluğu Hersteller/Inverkehrbringer'de, bağlayıcı tarife bilgisi için "verbindliche Zolltarifauskunft" yönlendirmesi, EUSt'nin gümrük muafiyetinden ayrı olduğu.
- **Rıza metni (5.6, `de.json anfrage.consent`)** dil olarak Sie ve doğru (Widerruf mit Wirkung für die Zukunft); **hukuki onayı 5.1/5.10'da** — bu tur dil kontrolüdür, hukuk onayı değildir.

### 3.3 ZH okuma notları (kanal 2 — insan onayına girdi)
- Marka adı "Bdimexport" çevrilmemiş (I18N §1.3 ✓). "本地团队 / 本地合作伙伴" (yerel ayak) vurgusu hub + 5 sayfada tutarlı.
- 7/24 iddiası yok; SLA "24小时内回复" (abartısız sayısal güven ✓).
- Hizmet kartı sayısı 5 (4'lü gruplama yasağı nedeniyle talimattaki "4–5" → 5 seçildi).
- Metinler Opus taslağıdır; anadil okuması yapılmadı → §6.

### 3.4 UN Comtrade rakam çapraz hesabı
`content/en/global/industries/_claims.json` 2025 toplamları: textile 19.472,0 · food 4.840,5 · machinery 8.728,6 · construction 9.935,1 · home-living 7.561,3 → **toplam 50.537,5 M USD**. DE metinleri: "rund 50,5 Mrd. US-Dollar" (beschaffung) ve "rund 19,5 Mrd. US-Dollar" (lohnfertigung, Textil) → **birebir tutarlı**.

---

## 4. Kaynak link canlılığı (30.10.2026)

| Kaynak | Kullanan | Durum |
| :-- | :-- | :-- |
| CNN Türk — TİM, Almanya'ya ihracat Oca–Ağu 2025 (13,1 mlr USD) | de: beschaffung, lohnfertigung, logistik | 200 · ⚠️ ikincil kaynak (sayfa tarih alanı tutarsız) → **B5** |
| UN Comtrade (comtradeplus.un.org) | de: beschaffung, lohnfertigung | 200 |
| gesetze-im-internet.de — LkSG § 1 | de: beschaffung, werkspruefung | ⚠️ bu ağdan **DNS çözülemedi** (curl 000, tarayıcı ERR_NAME_NOT_RESOLVED); URL resmi kalıpta, içerik 5.4'te arama özetiyle teyit edildi → 👤 tek tık kontrol |
| IHK Koblenz — Zollunion EU–Türkei, A.TR | de: 4 sayfa | 200 |
| SECO — Freihandelsabkommen EFTA–Türkei | de: beschaffung, logistik, zollabwicklung | 200 |
| Verpackungsregister (LUCID) | de: lohnfertigung | 200 |
| TÜİK ADNKS 2024 | zh: bendi-xiaoshou | 200 |
| Ticaret Bakanlığı — Pazara Giriş Rehberi (Mayıs 2026, PDF) | zh | 200 |
| Ticaret Bakanlığı — e-ticaret raporu 06.05.2025 | zh | 200 |
| mevzuat.gov.tr — 4875 sayılı Kanun | zh: gongsi-sheli | 200 |
| UNCTAD Investment Policy Hub | zh: gongsi-sheli (ikincil, 4875'in yanında) | ⚠️ 403 / Cloudflare doğrulama sayfası — **aşılmadı**; iddianın birincil kaynağı mevzuat.gov.tr 200 → 👤 tek tık kontrol |
| Resmî Gazete 25.11.2023 (Karar 7887, asgari sermaye) | zh: gongsi-sheli | 200 |

Uydurma rakam: **0**. Kaynaksız rakam: **0**.

---

## 5. Düzeltme önerileri (bu adımda UYGULANMADI — ayrı commit, ilgili scope)

| # | Bulgu | Önerilen düzeltme | Scope / sahip | Öncelik |
| :-- | :-- | :-- | :-- | :-- |
| B1 | `design/hero-copy.md` DE "CTA primary" satırında eski "⚠️ *(bkz. Açık Konu 1)*" işareti duruyor (Açık Konu 1 5.6'da kapandı) | İşareti kaldır | design / orchestrator — 1 satır | Düşük |
| B2 | DE'de "Frachtlogistik" 7× (logistik sayfası H1/META + 5 sayfada iç link metni); sözlük terimi "Logistik" | **Öneri: koru** — bileşik sözlük terimini içeriyor, eşanlamlı değil (uyuşmazlık sayılmadı). Sözlük birebir istenirse: H1/META "Logistik aus der Türkei" + iç link metinleri | content/de (5.4 kilidi açılırsa) — orchestrator + 👤 karar | Düşük |
| B3 | DE kanal matrisi: WhatsApp yok | Gerçek WhatsApp Business numarası gelince `app/(de)/de/_lib/chrome.tsx` + footer'a ekle (env ile; uydurma numara yasak) | de (app) — 👤 numara | Orta (FAZ 8 kanal ops ile) |
| B4 | 9 makale yer tutucusu (`/…/_yok`) Next hata kabuğuyla, `lang`/`dir` olmadan export ediliyor (noindex; ar'da RTL'siz) | Her route group'a `not-found.tsx` (grup layout'u içinde lang/dir'li 404) **veya** yer tutucuyu export dışı bırakan çözüm | fe (`lib/ui/insights` + route group'lar) | Düşük (noindex, link verilmiyor) |
| B5 | TİM 13,1 mlr USD verisi ikincil kaynaktan (CNN Türk) | TİM'in kendi bülten/sayfası linki eklenince ikincil linki ikinci sıraya al | content/de — 5.9 öncesi | Düşük |
| — | gesetze-im-internet / UNCTAD otomatik doğrulanamadı | 👤 tarayıcıda tek tık; sorun varsa content/de/zh'de link değişimi | 👤 | Düşük |

---

## 6. 👤 zh kültür/marka onayı — HAZIR

Okunacak sayfalar (build: `node scripts/serve-static.mjs .next-build 3100`): `/zh` · `/zh/services/{bendi-xiaoshou, shichang-tuiguang, gongsi-sheli, wuliu-qingguan, chanpin-renzheng}` · `/zh/insights` (boş durum).

Onay kontrol listesi (anadil Çince okur idealdir; yoksa makine çeviriyle çapraz okuma):
- [ ] Marka sunumu: "Bdimexport" Latin kalsın mı, yoksa Çince marka adı (音译/意译) istenir mi?
- [ ] Hitap ve kurum sesi (您 / 我们的土耳其本地团队) doğal mı; "yerel ayak" vurgusu abartısız mı?
- [ ] Kırmızı-altın palet bağlamı: kırmızı yalnız açık zeminde (design-tokens K8), altın vurgu ölçülü — kültürel olarak uygun mu?
- [ ] 4 sayısı: içerik/ızgara/istatistiklerde vurgu yok (otomatik ✅) — görsellerde ek kaçınma isteği var mı?
- [ ] Örnekler ve senaryolar (经销商, 批发市场, 清关 süreçleri) Çinli firma gözünden inandırıcı mı?
- [ ] WeChat akışı: "扫码联系 / 复制微信号 / 点击放大二维码" ifadeleri doğal mı?
- [ ] Rakam sunumu (8566万人, 5万/25万土耳其里拉) Çince okura doğru biçimde mi?

Onay sonrası: `FAZ_5_AJAN_PANOSU.md` §5'e imza + tarih; düzeltme gerekirse content/zh'ye ayrı commit.

---

## 7. Build / lint durumu

| Kontrol | Sonuç |
| :-- | :-- |
| `pnpm lint` | ✅ temiz |
| `NEXT_DIST_DIR=.next-build pnpm build` (env'siz, temiz) | ✅ 117 sayfa |
| `lib/ui/variants.smoke.test.mjs` | ✅ 7/7 |
| `qa/FAZ-5/de-content-check.mjs` | ✅ 6/6 |
| `qa/FAZ-5/zh-content-check.mjs` | ✅ 5/5 · sözlük uyuşmazlığı 0 |
| `qa/FAZ-5/dil-kalite.mjs` | ✅ 22 kontrol · ❌ 0 (çıkış kodu 0) |

Yeniden üretmek için: `node qa/FAZ-5/dil-kalite.mjs` (tablo) · `--json` (kanıt metinleri) · `--urls` (kaynak link listesi).
