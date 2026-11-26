# bdimexport.com — Google Verileriyle Zenginleştirilmiş Anahtar Kelime, Dizin ve SEO Eylem Planı

**Son Güncelleme:** 25 Kasım 2026 · **Kapsam:** Google Search Console API (Canlı Performans + 169/169 URL Denetimi), Çok Pazarlı Google Autocomplete (266 Anahtar Kelime), Canlı DNS/TLS ve Statik HTML Denetimi

---

## 1. Yönetici Özeti: `site:` Yanılsaması ve Google'ın Gerçek Verisi

Önceki dış gözlemde `site:bdimexport.com` aramasının tarayıcıda sıfır sonuç vermesi nedeniyle sitenin Google dizinine hiç girmediği varsayılmıştı. **25 Kasım 2026'da doğrudan Google Search Console API ve URL Inspection (URL Denetimi) API üzerinden 169 sayfanın tamamı sorgulandığında tablo tamamen farklıdır:**

1. **Site Google dizinindedir (%66,9 dizinlenme):** İncelenen **169 URL'nin 113'ü** Google veritabanında **`Gönderildi ve dizine eklendi` (`PASS`)** durumundadır. Yeni alan adlarında (kayıt: 16 Ekim 2026, 40 günlük) ilk tarama dalgasından sonraki ilk günlerde `site:` operatörü ve Sitemaps toplu sayaç ekranı gecikmeli güncellenir; kesin kaynak URL Inspection API'dir.
2. **Sıfır kalite reddi (%100 kabul oranı):** Googlebot'un fiilen taradığı hiçbir sayfa *"Tarandı - şu anda dizine eklenmiş değil"* (`Crawled - currently not indexed`) durumuna düşmemiştir (**0 sayfa**). Kalan **56 sayfanın** dizinde olmamasının tek nedeni Googlebot'un bu adreslere henüz sıra getirmemiş olmasıdır (**45'i** *Google tarafından bilinmiyor*, **11'i** *Keşfedildi - şu anda dizine eklenmiş değil*).
3. **İlk organik gösterimler ve tıklama başladı (ivmeli artış):** Google Search Console'da ilk organik gösterim **22 Kasım'da (1)** başlamış, **23 Kasım'da 12 gösterim + 1 tıklamaya**, **24 Kasım'da 28 gösterime** çıkmıştır (toplam **41 gösterim, 18 ülke, ortalama sıra 15,7**).
4. **En hızlı yükselen sürpriz yıldızlar:**
   - **Arapça Elektrik Direği Hunisi (`/en/ar/wooden-utility-poles`):** Yayına alındıktan sonraki ilk 48 saatte **11 organik gösterim ve 5,0 ortalama sıra (1. sayfa!)** yakaladı. Gösterimler tam hedeflenen ülkelerden geldi: **Libya (sıra 8,0), Mısır (9,6), Cezayir (7,0), Lübnan (3,0), Ürdün (6,0), Suudi Arabistan (4,0)**. Google bu sayfada `Ürün snippet'leri` ve `Satıcı girişleri` zengin sonuçlarını aktif olarak algıladı.
   - **İngilizce Elektrik Direği Hunisi (`/en/wooden-utility-poles`):** **3,0 ortalama sırayla** (Gana sıra 3,0) ilk sayfadan giriş yaptı.
   - **Almanca Hizmetler (`/de`):** `"werksprüfung"` sorgusunda **8,0 ortalama sıra (3 gösterim)**, `/de/leistungen/lohnfertigung` sayfasında **4,0 sıra**, `/de/leistungen/zollabwicklung` sayfasında **8,3 sıra** elde edildi (Almanya ort. sıra 7,8 · İsviçre 6,0 · Avusturya 8,0).
   - **ABD Merkezi (`/en/us`):** **8,0 ortalama sıradan %50 tıklama oranıyla (2 gösterim, 1 tıklama)** sitenin ilk organik tıklamasını aldı.
5. **Asıl darboğaz (56 taranmamış ticari sayfa + tarama bütçesi israfı):** Googlebot, içeriksiz 11 boş makale sayfasını (`/makaleler`, `/en/insights` ve 9 dil varyantı) tarayıp dizine eklerken; **`/ihracat` ana merkezi, `/ithalat/tedarik`, `/ithalat/fabrika-denetimi`, `/de/leistungen/beschaffung` ve `/en/products/apparel` dahil 17 ürün sayfasına** henüz hiç uğramamıştır.

### Klasördeki Güncel Veri Dosyaları
- **`anahtar-kelime-bosluklari.csv`** (**266 anahtar kelime** — önceki 182 kelime korundu, 12 ülke/dil pazarında canlı Google Autocomplete sorgularıyla **84 yeni yüksek niyetli B2B kelime** ve her satır için **25.11.2026 Google Search Console canlı dizin/gösterim durumu sütunu** eklendi).
- **`google-search-console-169-url-dizin-ve-performans.csv`** (**169 URL'nin tamamı** — Google dizin kararı, son Googlebot tarama zamanı, algılanan Schema zengin sonuçları, GSC gösterim/tıklama/sıra verisi, gelen iç bağlantı sayısı, kelime sayısı ve sayfa bazlı aksiyon reçetesi).

---

## 2. Google Search Console Canlı Performans ve Dizin Röntgeni (25 Kasım 2026)

### 2.1 Günlük Organik Büyüme Eğrisi (`searchAnalytics/query` · `dataState: all`)

| Tarih | Gösterim | Tıklama | TO (CTR) | Ortalama Sıra | Not |
| :--- | ---: | ---: | ---: | ---: | :--- |
| 21 Kasım 2026 | 0 | 0 | %0,0 | — | İlk tarama öncesi |
| 22 Kasım 2026 | 1 | 0 | %0,0 | 2,0 | İlk Googlebot tarama dalgası (22:35 UTC) |
| 23 Kasım 2026 | 12 | 1 | %8,3 | 6,0 | `/en/us` ilk organik tıklamayı aldı |
| 24 Kasım 2026* | 28 | 0 | %0,0 | 20,3 | Günlük gösterim 2,3 katına çıktı (*kesinleşmemiş taze veri*) |
| **Toplam** | **41** | **1** | **%2,44** | **15,66** | **18 ülke · 17 benzersiz sayfa** |

### 2.2 Google'da Gösterim Alan Tüm Sayfalar (17 Sayfa)

| Sayfa | Gösterim | Tıklama | Ort. Sıra | Google Zengin Sonuç Algısı | Teşhis |
| :--- | ---: | ---: | ---: | :--- | :--- |
| `/en/ar/wooden-utility-poles` | **11** | 0 | **5,0** | Ürün snippet'i, Satıcı girişi, Breadcrumb | **En güçlü erken sinyal.** MENA'da 1. sayfada; başlık/açıklamada fiyat/konteyner adedi vurgusuyla ilk tıklamaya çevrilmeli |
| `/en/industries/textile` | 4 | 0 | 12,3 | Breadcrumb | 2. sayfa sınırında (`apparel` ürün sayfasına iç link köprüsü kurulmalı) |
| `/de/leistungen/werkspruefung` | 3 | 0 | **8,0** | Breadcrumb | `"werksprüfung"` kelimesinde Almanya/Avusturya'da doğrudan 1. sayfa |
| `/de/leistungen/zollabwicklung` | 3 | 0 | **8,3** | Breadcrumb | Gümrük & A.TR aramalarında 1. sayfa; ayrı A.TR rehberiyle büyütülmeli |
| `/en/services/customs` | 3 | 0 | 50,0 | Breadcrumb | `"exporter's declaration turkey"` sorgusunda 68. sıradan sinyal alıyor |
| `/en/us` | 2 | **1** | **8,0** | Breadcrumb | İlk organik tıklama (%50 TO); D-U-N-S & SAP Ariba güven sinyali aktif |
| `/en/wooden-utility-poles` | 2 | 0 | **3,0** | Ürün snippet'i, Satıcı girişi, Breadcrumb | Afrika (Gana vb.) aramalarında ilk 3'te |
| `/en/services/logistics` | 2 | 0 | **8,5** | Breadcrumb | İlk 10 içinde |
| `/en/us/turkey-sourcing-agent-for-us-companies` | 2 | 0 | 35,0 | Breadcrumb | ABD ana ticari sayfası; iç link ve dış referansla ilk 10'a taşınmalı |
| `/en/services/manufacturing` | 2 | 0 | 84,0 | Breadcrumb | `"private label turkey"` (78) ve `"private label manufacturers turkey"` (90) sorgularında tetiklendi |
| `/` | 1 | 0 | **2,0** | — | Ana sayfa dizinde |
| `/en/services/container-loading` | 1 | 0 | **1,0** | Breadcrumb | Niş konteyner denetim sorgusunda 1. sıra |
| `/de/leistungen/lohnfertigung` | 1 | 0 | **4,0** | Breadcrumb | Almanca fason üretim / private label 1. sayfa |
| `/en/it/insights` | 1 | 0 | **4,0** | — | **İsraf uyarısı:** Boş makale sayfası Google sonuçlarında çıkıyor! |
| `/en/fr` | 1 | 0 | 10,0 | — | Fransızca ana merkez ilk 10 sınırında |
| `/en/industries/machinery` | 1 | 0 | 10,0 | Breadcrumb | Makine ihracat verisi ilk 10 sınırında |
| `/en/insights` | 1 | 0 | 31,0 | — | **İsraf uyarısı:** Boş makale sayfası gösterim alıyor (`noindex` şart) |

### 2.3 Ülke ve Cihaz Kırılımı (Google Search Console)

- **MENA & Afrika (26 gösterim — toplamın %63'ü, tamamı 1. sayfada!):** Mısır (5 gösterim, sıra 9,6), Libya (3 gösterim, sıra 8,0), Cezayir (3 gösterim, sıra 7,0), Lübnan (3 gösterim, sıra 3,0), Gana (2 gösterim, sıra 3,0), Ürdün (1 gösterim, sıra 6,0), Suudi Arabistan (1 gösterim, sıra 4,0), Suriye (1 gösterim, sıra 1,0).
- **DACH Bölgesi (7 gösterim — tamamı 1. sayfada!):** Almanya (5 gösterim, sıra 7,8), İsviçre (1 gösterim, sıra 6,0), Avusturya (1 gösterim, sıra 8,0).
- **Diğer Pazarlar:** Türkiye (7 gösterim, 1 tıklama, sıra 36,3), ABD (2 gösterim, sıra 46,0), Hindistan (2 gösterim, sıra 12,0), Arjantin (1 gösterim, sıra 4,0), Ermenistan (1 gösterim, sıra 1,0), Brezilya (1 gösterim, sıra 31,0), Singapur (1 gösterim, sıra 64,0).
- **Cihaz Dağılımı:** Masaüstü **23 gösterim / 1 tıklama** (ort. sıra 17,4 — B2B satın almacı davranışı), Mobil **17 gösterim** (ort. sıra 13,6), Tablet **1 gösterim** (sıra 11,0).

### 2.4 169 URL Google Dizin Kapsama Tablosu (URL Inspection API)

| Site Bölümü | Toplam URL | Dizinde (`PASS`) | Keşfedildi (Bekliyor) | Google Bilmiyor (0 Tarama) | Dizin Oranı | Temel Sorun / Gözlem |
| :--- | ---: | ---: | ---: | ---: | ---: | :--- |
| **EN Ana & Hizmetler (`EN-Core`)** | 19 | 19 | 0 | 0 | **%100** | Üst menü ve alt bilgiden güçlü iç bağlantı alıyor |
| **9 Dil Varyantı (`AR, FR, RU, ES, NL, PL, RO, IT, FI`)** | 37 | 37 | 0 | 0 | **%100** | Dil değiştirici sayesinde hızlı tarandı (ancak 9 boş `insights` sayfası da dizine girdi) |
| **Çince (`/zh`)** | 7 | 7 | 0 | 0 | **%100** | Tamamı dizinde |
| **TR Genel (`/`, `/rfq`, `/ticari-istihbarat`, `/kvkk-riza`, `/makaleler`)** | 5 | 5 | 0 | 0 | **%100** | `/makaleler` boş olduğu halde dizinde |
| **Almanca (`/de`)** | 9 | 6 | 1 | 2 | **%67** | **Kritik:** `/de/leistungen/beschaffung` ve `logistik` henüz taranmadı! |
| **TR İthalat (`/ithalat/*`)** | 14 | 9 | 2 | 3 | **%64** | **Kritik:** `/ithalat/tedarik`, `fabrika-denetimi`, `lojistik`, `rehberler` ve `rehberler/tekstil` dizinde değil! |
| **EN B2B Teklifler (`/en/proposals/*`)** | 6 | 4 | 0 | 2 | **%67** | Ana hizmet sayfalarıyla kelime yamyamlığı yaratıyor |
| **EN ABD Merkezi (`/en/us/*`)** | 8 | 4 | 1 | 3 | **%50** | Yalnızca 1 iç link alan 4 alt sayfa taranmadı (`inbound=1`) |
| **EN Ürünler (`/en/products/*`)** | 26 | 9 | 3 | 14 | **%35** | **`apparel`, `olive-oil`, `hospitality-furniture`, `ceramics`, `denim` dahil 17 sayfa dizinde değil!** |
| **TR İhracat (`/ihracat/*`)** | 16 | 5 | 2 | 9 | **%31** | **`/ihracat` ana sayfası, `e-ihracat`, `b2b-pazarlama`, `pazar-arastirmasi-musteri-bulma` dizinde değil!** |
| **EN Ülke Koridorları (`/en/markets/*`)** | 13 | 3 | 2 | 8 | **%23** | Yalnızca 1–2 iç link alıyorlar (`united-states`, `germany`, `uk` dizinde değil) |
| **TR Teklif & Arnavutça (`TR-Teklif`, `EN-SQ`)** | 9 | 5 | 0 | 4 | **%56** | Teklif sayfaları satış şablonu niteliğinde |
| **TOPLAM** | **169** | **113** | **11** | **45** | **%66,9** | **Taranıp reddedilen = 0 · Darboğaz tamamen tarama önceliği** |

> **Zengin Sonuç (Schema.org) Google Tespiti:** Dizindeki 113 sayfanın **54'ünde** `İçerik haritaları` (`BreadcrumbList`), **11 ürün ve direk sayfasında** ise hem `Ürün snippet'leri` (`Product`) hem `Satıcı girişleri` (`Merchant listings`) Google tarafından hatasız doğrulandı. Google, Ağustos 2023 güncellemesinden beri `FAQPage` zengin kutularını ticari sitelerde arama sonuçlarında gizlemektedir; ancak mevcut SSS şemaları Google AI Overviews, ChatGPT ve Perplexity (GEO) yanıtları için doğrudan kaynak olmaya devam ettiği için korunmalıdır.

---

## 3. Doğrulanmış Teknik SEO Sorunları (Canlı Sunucu + Statik HTML Kanıtları)

Canlı sunucu, DNS/TLS ve `out/` statik derlemesi üzerinde yapılan tam taramada doğrulanan **9 somut teknik engel**:

| # | Sorun | Doğrulanmış Kanıt (25 Kasım 2026) | Çözüm |
| :--- | :--- | :--- | :--- |
| **1** | **`www` SSL Sertifika Hatası** | `www.bdimexport.com` CNAME ile `bdimexport.com` (`199.36.158.100`) adresine bakıyor. `http://www.bdimexport.com/` → `301 https://www.bdimexport.com/` yönleniyor; ancak Firebase TLS sertifikasında `www` tanımlı olmadığı için **`ERR_TLS_CERT_ALTNAME_INVALID`** hatasıyla çöküyor. | Firebase Console → Hosting → Custom Domains ekranından `www.bdimexport.com` alan adını ekleyip `bdimexport.com` adresine **301 Redirect** olarak tanımla (2 dakikalık işlem). |
| **2** | **11 Kırık İç Bağlantı (`404`)** | • **10 Türkçe ithalat/rehber sayfası** (`tedarik`, `fabrika-denetimi`, `gumruk`, `lojistik` + 6 rehber) var olmayan **`/ithalat/danismanlik-talebi`** adresine link veriyor (`404`).<br>• **`/en/markets/netherlands`** var olmayan **`/en/products/home-living`** adresine link veriyor (doğrusu: `/en/products/category/home-living`). | Kırık Türkçe CTA linklerini `/rfq` (veya yeni `/ithalat/danismanlik-talebi` sayfasına), Hollanda linkini `/en/products/category/home-living` adresine bağla. |
| **3** | **Boş Makale Sayfaları Dizinde** | `/makaleler`, `/en/insights`, `/de/ratgeber`, `/zh/insights` ve 10 EN dil varyantındaki `/en/{dil}/insights` (**toplam 14 boş indeks**; 11'i zaten Google dizinine girmiş, 2'si arama sonuçlarında gösterim harcıyor!). | İlk gerçek makaleler yayınlanana kadar tüm boş makale indekslerini `sitemap`'ten çıkar ve `<meta name="robots" content="noindex, follow">` ekle. |
| **4** | **Site Haritası Tutarsızlıkları** | • **`/ithalat/rehberler`** yayında ve indekslenebilir olduğu halde `sitemap-tr.xml` / `sitemap.xml` içinde **yok** (Google'da *bilinmiyor*).<br>• **`/de/anfrage`** sayfasında `noindex` etiketi var ama `sitemap-de.xml` ve `sitemap.xml` içinde **yer alıyor** (çelişkili sinyal). | `/ithalat/rehberler` adresini haritaya ekle; `/de/anfrage` adresini haritadan çıkar. |
| **5** | **Zayıf İç Bağlantı (Yetim Koridorlar)** | Sitemap'teki **32 sayfa yalnızca 1 veya 2 iç bağlantı** alıyor (`/en/markets/*`, `/en/us/*`, `/ihracat/pazarlar/*`, `/en/proposals/*`, `/teklif/*`). Google URL Denetimi'nde bu 32 sayfanın **22'si henüz hiç taranmamış**! | Ana hizmet (`/en/services/*`, `/ithalat/*`, `/ihracat/*`) ve ürün sayfalarının altına ilgili 3–4 hedef ülke/ABD küme sayfasını bağlayan *"İlgili Pazar & Gümrük Rehberleri"* modülü ekle. |
| **6** | **Hreflang Hizmet Eşleşmesi Eksik** | 14 dil ana sayfası birbirine bağlı; ancak eşdeğer hizmet sayfaları (`/ithalat/tedarik` ↔ `/en/services/sourcing` ↔ `/de/leistungen/beschaffung` veya `/ithalat/fabrika-denetimi` ↔ `/en/services/inspection` ↔ `/de/leistungen/werkspruefung`) karşılıklı `hreflang` taşımıyor. | Eşdeğer ticari niyetli hizmet çiftleri arasında karşılıklı `hreflang` haritası tanımla (özellikle DACH ve TR'de doğru dil sürümünün çıkmasını hızlandırır). |
| **7** | **21 Uzun `<title>` (>60 Karakter)** | 21 sayfanın başlığı SERP'te kesiliyor; özellikle çeviri denetim sayfaları (`/en/ro/services/inspection` 82 kr, `/en/es/services/inspection` 79 kr, `/en/fi` 78 kr, `/en/sq` 78 kr, `/en/pl` 76 kr). | Tüm başlıkları **52–60 karakter** aralığına çek; alıcının aradığı birincil kelimeyi ilk 35 karaktere yerleştir. |
| **8** | **25 Ürün `<h1>` Başlığında Marka/Şablon Eki** | 20 ürün ve 5 kategori sayfasında `<h1>` etiketi `Apparel Manufacturers in Turkey \| B2B Sourcing` biçiminde `<title>` kopyası taşıyor. | `<h1>` içindeki `\| B2B Sourcing` ekini kaldırıp doğal alıcı başlığına çevir (`Verified Clothing & Apparel Manufacturers in Turkey`). |
| **9** | **Anahtar Kelime Yamyamlığı & Benzer Gövdeler** | • ABD tedarikte 4 sayfa (`/en/us`, `/en/us/turkey-sourcing-agent-…`, `/en/markets/united-states`, `/en/proposals/us-procurement-partner`), konteyner denetiminde 3 sayfa yarışıyor.<br>• Ülke sayfalarında 5 kelimelik kalıp tekrarı EN'de %39, TR'de %41; `"Smart RFQ"` 189 kez, `"Dual-Hub"` 164 kez geçiyor. | ABM teklif sayfalarını (`/en/proposals/*`, `/teklif/*`, `/de/angebot/*`, `/zh/fangan/*`) `noindex, follow` yap; her kümeye tek kanonik şampiyon sayfa ata; iç jargonu alıcı diliyle değiştir. |

### Kurumsal Güven Varlıklarının (D-U-N-S® & SAP Ariba®) SEO ve TO (CTR) Kaldıracı
Sitede artık doğrulanmış **Dun & Bradstreet `D-U-N-S® #: 14-977-6743`** ve **SAP Business Network / SAP Ariba `BNO-100000188010374`** kayıtları yayındadır. Rakip küçük ajansların (`turkeysourcingagency.com`, `sareteks.com`, `cin-ithalat.com`, `turkeypartner.com`) hiçbirinde bu iki kurumsal kayıt birlikte yer almamaktadır.
- **SERP Tıklama Oranı (CTR) Etkisi:** ABD (`/en/us/*`), Almanya (`/de/*`) ve Elektrik Direği (`/en/wooden-utility-poles`, `/en/ar/wooden-utility-poles`) sayfalarının **meta açıklamalarına (description)** `"US LLC · D-U-N-S & SAP Ariba Verified"` / `"SAP Ariba & D-U-N-S verifiziert"` ibaresi eklendiğinde, ilk sayfada gösterim alan ama henüz tıklanmayan B2B sorgularında tıklama oranı doğrudan yükselir.
- **Dış Otorite (Backlink / Entity) Etkisi:** SAP Ariba açık şirket profilinde ve D&B dizininde `https://bdimexport.com` bağlantısının aktif olması + LinkedIn şirket sayfası, Europages ve WLW (`wlw.de`) profillerinde aynı `BDIMEXPORT LLC` / `D-U-N-S` bilgisinin yer alması Google'ın marka varlık grafiğini (`Knowledge Graph`) doğrular ve marka aramasında (`bdimexport`) 1. sırayı kilitler.

---

## 4. Rakip Analizi ve Google Autocomplete Varlık Sinyalleri

Google'da 19 hedef sorguda çıkan rakipler büyük holdingler değil, niş içerik üreten küçük sitelerdir:

| Pazar | Rakip Siteler | Site Haritası URL | Rakipte Olup Bizde Eksik Olan Trafik Konuları |
| :--- | :--- | :---: | :--- |
| **TR · Çin İthalatı** | `cin-ithalat.com` (46), `cindenburaya.com` (29), `cindenurungetirme.com` (20) | 20–46 | Danışmanlık ücretleri, Kanton Fuarı rehberi, Yiwu, MOQ pazarlığı, CE + GTİP + TAREKS, makine ithalat maliyeti |
| **TR · Vergi & Hesaplama** | `mingsourcing.com` | 3.775 (164 TR) | Landed cost / gümrük vergisi hesaplayıcı, Alibaba & 1688 rehberleri, dış ticaret sözlüğü |
| **TR · İhracat** | `uyadisticaret.com` (1.503), `bmdisticaret.com` (124) | 124–1.503 | CBAM, mikro ihracat, CIF hesaplama, devlet ihracat destekleri, ihracat departmanı kurma |
| **EN · Türkiye Tedarik** | `turkeysourcingagency.com` (350), `turkishsourcing.com` (342), `getfromtr.net` (184), `fromturk.net` (649) | 184–649 | Tedarikçi doğrulama rehberi, ABD/UK/AB ithalat vergisi rehberleri, şehir bazlı üretim (Denizli, Gaziantep, İnegöl, Bursa), kozmetik/ambalaj/otomotiv |
| **EN · Giyim (Niş)** | `sareteks.com` | **23** | Yalnızca 23 URL ile `"clothing manufacturers in turkey low moq"` sorgusunda 1. sayfada! |
| **DE · Çin & Türkiye** | `ag-frisch.com` (418), `thecustomscompany.de` (59), `turkeypartner.com` (**12**) | 12–418 | **Google Autocomplete kanıtı:** Almancada `"china import agentur"` yazıldığında Google'ın ilk otomatik tamamlaması doğrudan rakip `frisch international consulting` oluyor! `thecustomscompany.de` ise A.TR, CBAM ve Çin gümrük rehberleriyle trafiği topluyor. |

---

## 5. Genişletilmiş Anahtar Kelime Boşluk Analizi (266 Kelime · Google Autocomplete + GSC)

12 pazar ve dil ayarında canlı Google Autocomplete (`suggestqueries.google.com`) sorgularıyla veri seti **182 kelimeden 266 kelimeye** çıkarılmış ve her kelime hedef sayfanın Google Search Console dizin/performans durumuyla eşleştirilmiştir (`anahtar-kelime-bosluklari.csv`):

| Öncelik Sınıfı | Kelime Adedi | Açıklama |
| :--- | ---: | :--- |
| **A Önceliği (Satışa En Yakın)** | **79** | Doğrudan ticari teklif, denetim, direk konteyner satışı veya gümrük/maliyet kararı üreten yüksek dönüşümlü kelimeler |
| **B Önceliği (Kapsam Genişleten)** | **101** | Sektörel ürün alt kırılımları, mevzuat (CBAM, TAREKS, SABER), ülke koridorları ve fuar/lojistik sorguları |
| **C Önceliği (Bilgi / Destekleyici)** | **21** | Üst huni bilgi sorguları ve ikincil pazar varyantları |
| **Koru (Mevcut Hedefli)** | **52** | Başlık/H1'de hedeflenen; dizin ve sıralaması korunup güçlendirilecek kelimeler |
| **Öncelik Dışı** | **13** | Bireysel/perakende veya kapsam dışı sorgular (`1688`, `yiwu market`, `wholesale clothing`, `araba ithalatı`) — sayfa açılmamalı |
| **TOPLAM** | **266** | **97 Yok · 116 Kısmi · 53 Hedefli** |

### Google Verisiyle Keşfedilen 6 Yüksek Getirili Fırsat Kümesi

#### Küme 1 — Ahşap Elektrik ve Telekom Direkleri (EN / AR / FR / PT / TR) — *En Hızlı Nakit Akışı Hunisi*
GSC verisi, elektrik direği sayfalarının yayına girdikten 48 saat sonra MENA ve Afrika'da 1. sayfadan gösterim aldığını kanıtladı. Canlı Google Autocomplete taraması bu kümede devasa ek fırsatlar ortaya çıkardı:
- **Arapça (`أعمدة كهرباء` — 10 öneri, Yüksek):** Google'ın otomatik tamamladığı gerçek sorgu **`أعمدة كهرباء خشبية للبيع ليبيا`** (*Libya'da satılık ahşap elektrik direkleri*)! `/en/ar/wooden-utility-poles` başlık ve alt başlıklarında `"للبيع في ليبيا والأردن"` kalıbı güçlendirilmeli.
- **İngilizce (`wooden electricity poles` [16], `wood utility poles` [15], `wooden telecom poles` [15], `treated wood poles` [12], `cca treated poles` [9]):** Sayfada `"utility poles"` güçlü ama Afrika/İngiliz Milletler Topluluğu alıcıları `"wooden electricity poles"` ve `"CCA / Tanalith E treated wood poles"` da yazıyor; alt başlıklarla yakalanmalı.
- **Fransızca Batı Afrika / Senegal Boşluğu (`poteau bois` [10], `poteau électrique en bois` [9 — `à vendre`, `prix`]):** Sitede `/en/fr` var ancak **Fransızca elektrik direği sayfası YOK**! Senegal (Senelec), Fildişi Sahili, Kamerun ve Fas doğrudan Fransızca arıyor. **`/en/fr/poteaux-electriques-bois`** sayfası açıldığında rekabet neredeyse sıfır.
- **Portekizce Mozambik / Angola Boşluğu (`postes de madeira tratada` [9]):** Mozambik (EDM) odağı için 1 sayfalık teknik özet/teklif iniş sayfası değerlendirilebilir.

#### Küme 2 — Almanca + Çin Çift Merkez Boşluğu (`/de`) — *En Büyük Hizmet Boşluğu*
`/de` sayfaları yalnızca Türkiye'yi anlatıyor (`"werksprüfung"` şimdiden 8. sırada!); oysa Alman KOBİ'lerin asıl hacmi Çin tedarik ve kalite kontrolünde:
- `import aus china` (**15 öneri**), `sourcing agent china` (**15 öneri**), `import aus china zoll` (**14 öneri**), `importkosten china` (**13 öneri**), `ware aus china importieren` (**3 öneri**), `china import agentur` (**2 öneri** — rakip Frisch tek başına çıkıyor), `qualitätskontrolle china` & `vorversandkontrolle china`.
- Almanca Türkiye tarafında ise **`textilproduktion türkei` (5 öneri: `preise`, `finden`, `bedingungen`)**, **`zoll türkei deutschland` (9 öneri)** ve **`a.tr warenverkehrsbescheinigung` (8 öneri)** doğrudan hazır alıcı trafiğidir.

#### Küme 3 — Tekil Konteyner Yükleme Nezareti ve 3. Taraf Denetim (EN / TR / DE / AR)
QIMA ve SGS genel `"factory inspection"` kelimesini tutuyor; ancak Google Autocomplete alıcıların **işlem bazlı dar terimler** aradığını gösteriyor:
- **EN:** `third party inspection china` (**7 öneri**), `pre shipment inspection china` (**6 öneri**), `factory audit services` (**6 öneri**), `container loading inspection china` (**1 öneri**). (Üstelik `/en/services/container-loading` şimdiden GSC'de 1. sıradan ilk gösterimini aldı!)
- **TR:** `konteyner yükleme nezareti`, `çinde ürün kontrolü`, `çin şirket doğrulama` — mevcut sayfalarda bu tam ifadeler H2/SSS içine işlenmeli.

#### Küme 4 — ABD / İngiltere Gümrük Vergisi, A.TR ve "Low MOQ" Giyim Kümesi (`EN`)
- **Vergi & Maliyet:** `tariff on turkey` (**17 öneri**), `section 301 tariffs` (**15 öneri**), `landed cost calculator` (**15 öneri**), `import from turkey to usa` (**9 öneri**: `fees`, `tax`, `duties`), `import from turkey to uk` (**9 öneri**), `atr certificate turkey` (**5 öneri**).
- **Üretim & Kategori:** `low moq clothing manufacturer` (**10 öneri**), `turkish clothing manufacturers` (**9 öneri**), `clothing manufacturers in turkey` (**8 öneri**), `clothing manufacturers in turkey low moq` (**5 öneri**), `turkish olive oil exporters` (**5 öneri**), `marble manufacturers in turkey` (**4 öneri**), `workwear manufacturers turkey` (**3 öneri**), `hotel textile manufacturers turkey` (**3 öneri**).
- **Kritik GSC Bulgusu:** `/en/products/apparel`, `/en/products/olive-oil` ve `/en/products/hospitality-furniture` sayfaları henüz Google tarafından **hiç taranmamış (`URL Google tarafından bilinmiyor`)**!

#### Küme 5 — Türkçe Gerçek Alıcı Dili ve Mevzuat Hesaplayıcı Kümesi (`TR`)
- Site kurumsal `"tedarik"` dili kullanıyor; Google Autocomplete ise alıcının **`çinden ürün getirmek` (15 öneri)**, **`çinden mal getirmek` (9 öneri)**, **`gözetim uygulaması` (22 öneri)**, **`ilave gümrük vergisi` (16 öneri)**, **`anti damping vergisi` (15 öneri)**, **`tareks nedir` (15 öneri)**, **`çin gümrük vergisi hesaplama` (4 öneri)** ve **`ihracat danışmanlığı` (9 öneri: Ankara, İzmir, e-ihracat)** yazdığını kanıtlıyor.

#### Küme 6 — Çinli İhracatçılar İçin Türkiye Operasyon Kümesi (`/zh`) ve Arapça / Fransızca Derinleştirme
- `/zh` sayfalarının **7/7'si Google dizininde** (ve Baidu hazırlığı mevcut). `土耳其 清关` (**7 öneri**), `土耳其进口` (**4 öneri: `土耳其进口关税`**), `土耳其展会` (**2 öneri: `2026`**) kelimeleri için gümrük vergisi & fuar saha ziyareti rehberi eklenebilir.
- **Arapça:** `شركات الشحن من تركيا` (**10 öneri**: Fas, Mısır, **Libya**!), `استيراد من تركيا` (**15 öneri**), `شهادة سابر` (**15 öneri** — Suudi SABER), `استيراد ملابس من تركيا` (**9 öneri**).
- **Fransızca:** `fournisseur turquie` (**15 öneri**), `importer de turquie` (**10 öneri**), `usine textile turquie` (**9 öneri**).

---

## 6. Google Verisine Dayalı Uygulama Yol Haritası

### Aşama 1 — 1. Hafta: Teknik Engelleri Sıfırlama ve Gerçek Dizin İstekleri

1. **`www.bdimexport.com` TLS ve 301 Yönlendirmesini Düzelt (10 dk):**
   - Firebase Hosting panelinden `www.bdimexport.com` özel alan adını ekleyip `https://bdimexport.com` adresine 301 yönlendir.
2. **11 Kırık İç Bağlantıyı (`404`) ve Harita Hatalarını Temizle:**
   - 10 Türkçe ithalat/rehber sayfasındaki `/ithalat/danismanlik-talebi` kırık linklerini `/rfq` (veya yeni ücret/talep sayfasına) yönlendir.
   - `/en/markets/netherlands` içindeki `/en/products/home-living` linkini `/en/products/category/home-living` olarak düzelt.
   - `/ithalat/rehberler` sayfasını `sitemap.ts` içine ekle; `/de/anfrage` (`noindex`) sayfasını haritadan çıkar.
3. ** Tarama Bütçesi Sızıntısını Kapat (`noindex` + Harita Temizliği):**
   - İçeriği boş olan **14 makale indeks sayfasını** (`/makaleler`, `/en/insights`, `/de/ratgeber`, `/zh/insights` ve 10 dildeki `/en/{dil}/insights`) içerik girilene kadar `sitemap`'ten çıkar ve `noindex, follow` yap.
   - Satış görüşmesi için tasarlanan ABM teklif şablonlarını (`/en/proposals/*`, `/teklif/*`, `/de/angebot/*`, `/zh/fangan/*`) ana hizmet sayfalarıyla yarışmamaları için `noindex, follow` yap.
4. **Google Search Console Manuel "Dizine Eklenmesini İste" Listesi (Gerçekten Dizinde Olmayan En Değerli 20 Ticari URL):**
   > *Not: Önceki raporda önerilen `/`, `/ithalat`, `/en`, `/en/us`, `/de`, `/en/services/sourcing`, `/en/services/inspection` sayfaları **zaten Google dizinindedir**; günlük ~10 URL'lik manuel istek kotasını onlara harcamayın. Doğrudan aşağıdaki **dizinde olmayan** ticari sayfalara sırayla gönderin:*
   - **1. Gün (En Yüksek Gelir Potansiyelli 10 Hizmet & Ürün Sayfası):**
     1. `https://bdimexport.com/de/leistungen/beschaffung` *(Almanca ana tedarik sayfası — 0 tarama)*
     2. `https://bdimexport.com/de/leistungen/logistik` *(Almanca lojistik — 0 tarama)*
     3. `https://bdimexport.com/ithalat/tedarik` *(TR Çin tedarik — 0 tarama)*
     4. `https://bdimexport.com/ithalat/fabrika-denetimi` *(TR fabrika denetimi — keşfedildi, bekliyor)*
     5. `https://bdimexport.com/ithalat/lojistik` *(TR lojistik — keşfedildi, bekliyor)*
     6. `https://bdimexport.com/ihracat` *(TR ihracat ana merkezi — 0 tarama)*
     7. `https://bdimexport.com/ihracat/pazar-arastirmasi-musteri-bulma` *(TR müşteri bulma — 0 tarama)*
     8. `https://bdimexport.com/en/products/apparel` *(EN giyim üreticileri — 1.609 kelime, 0 tarama)*
     9. `https://bdimexport.com/en/us/pre-shipment-and-container-loading-inspection` *(ABD denetim — 0 tarama)*
     10. `https://bdimexport.com/en/us/customs-hts-landed-cost-and-supplier-verification` *(ABD vergi/landed cost — bekliyor)*
   - **2. Gün (İkinci 10 Kritik Ürün & Koridor Sayfası):**
     11. `https://bdimexport.com/ihracat/e-ihracat`
     12. `https://bdimexport.com/ihracat/b2b-pazarlama`
     13. `https://bdimexport.com/ihracat/ucretsiz-destek-basvuru`
     14. `https://bdimexport.com/ithalat/rehberler/tekstil`
     15. `https://bdimexport.com/en/products/hospitality-furniture`
     16. `https://bdimexport.com/en/products/olive-oil`
     17. `https://bdimexport.com/en/products/ceramics`
     18. `https://bdimexport.com/en/products/denim`
     19. `https://bdimexport.com/en/markets/united-states`
     20. `https://bdimexport.com/en/markets/united-kingdom`
5. **İlk 5 Doğrulanmış Kurumsal Dış Bağlantı (Entity Backlink):**
   - SAP Ariba açık tedarikçi profili (`BNO-100000188010374`) üzerinde `https://bdimexport.com` bağlantısının aktif kontrolü, LinkedIn Şirket Sayfası, Europages, WLW (`wlw.de`) ve Google Business Profile (Uşak TR + Sheridan US kurumsal tutarlılık).

---

### Aşama 2 — 2. Hafta: Yalnızca Başlık, H1 ve Meta Açıklama Revizyonuyla Kapanan Boşluklar

Yeni sayfa yazmadan, mevcut güçlü sayfaların `<title>` (≤60 kr), `<h1>` (`| B2B Sourcing` temizliği) ve `<meta description>` (D-U-N-S / SAP Ariba / 24–48s kanıtı) etiketlerini alıcı diliyle güncelleme tablosu:

| Sayfa | Yeni `<title>` (≤60 Karakter) | Hedeflenen Alıcı Kelimesi & CTR Kancası |
| :--- | :--- | :--- |
| `/en/ar/wooden-utility-poles` | `أعمدة كهرباء خشبية للبيع (ليبيا والأردن) \| مصنع مباشر` | GSC'de 5. sırada (11 gösterim): `"للبيع ليبيا"` Google önerisini doğrudan başlığa taşır |
| `/en/wooden-utility-poles` | `Wooden Utility & Electricity Poles Manufacturer \| Africa` | GSC'de 3. sırada: `"electricity poles"` (16 öneri) + `"utility poles"` (14 öneri) birleşir |
| `/ithalat` | `Çin'den İthalat Danışmanlığı: Ürün Getirme ve Gümrük` | `"çinden ithalat danışmanlık"` + `"ürün getirme"` birleşimi (52 kr) |
| `/ithalat/tedarik` | `Çin'den Ürün Getirmek: Tedarikçi Bulma ve Numune` | `"çinden ürün getirmek"` (15 öneri) + `"tedarikçi bulma"` (48 kr) |
| `/ithalat/fabrika-denetimi` | `Çin'de Fabrika Denetimi, Ürün ve Kalite Kontrol (48s)` | `"çin fabrika denetimi"` + `"çinde ürün kontrolü"` + 48s rapor vaadi (53 kr) |
| `/ithalat/konteyner-yukleme-denetimi` | `Konteyner Yükleme Nezareti ve Denetimi (Çin & Türkiye)` | `"konteyner yükleme nezareti"` + `"denetimi"` ikilisini birlikte yakalar (54 kr) |
| `/ithalat/lojistik` | `Çin–Türkiye Konteyner ve Parsiyel Taşıma Fiyatları` | `"çin türkiye konteyner fiyatları"` (5 öneri) + `"parsiyel taşıma"` (50 kr) |
| `/ihracat` | `İhracat Danışmanlığı ve Yurt Dışı Müşteri Bulma` | `"ihracat danışmanlığı"` (9 öneri) + `"müşteri bulma"` (47 kr) |
| `/en/products/apparel` | `Clothing Manufacturers in Turkey: Private Label & Low MOQ` | `"clothing"` + `"private label"` + `"low moq"` (10 öneri) *(yalnız gerçek MOQ eşiği belirtilerek)* (57 kr) |
| `/en/products/hospitality-furniture` | `Hotel & Hospitality Furniture Manufacturers in Turkey` | `"hotel furniture manufacturers turkey"` sorgusunu yakalar (53 kr) |
| `/en/products/marble` | `Turkish Marble & Travertine Suppliers \| Direct Quarries` | `"marble"` + `"travertine suppliers"` + ocak doğrulama (55 kr) |
| `/en/products/home-textiles` | `Turkish Towel, Bathrobe & Hotel Textile Manufacturers` | `"towel"`, `"bathrobe"` ve `"hotel textile"` (3 öneri) tek başlıkta (53 kr) |
| `/en/services/china-sourcing` | `China Sourcing Agent & Factory Inspection (+ Turkey)` | `"partner"` yerine yüksek hacimli `"china sourcing agent"` (15 öneri) (52 kr) |
| `/de/leistungen/werkspruefung` | `Werksprüfung & Containerkontrolle Türkei (48h Bericht)` | GSC'de 8. sıradaki `"werksprüfung"` sayfasının tıklama oranını (CTR) artırır (54 kr) |
| `/de/leistungen/zollabwicklung` | `Import aus der Türkei: Zoll, A.TR & Ausfuhrabwicklung` | GSC'de 8,3 sıradaki sayfayı yüksek talepli `"import aus der türkei"` (10 öneri) ile eşler (53 kr) |

*Ayrıca 9 dil varyantındaki 60 karakteri aşan 21 denetim/ana sayfa başlığı 55–58 karaktere kısaltılacaktır.*

---

### Aşama 3 — 3–8. Hafta: Yüksek Dönüşümlü Yeni Sayfa ve Araç Planı (Öncelik Sırasıyla)

Dizine girmemiş sayfa yığını oluşturmamak için haftada **en fazla 2–3 yüksek kanıtlı sayfa** yayına alınmalıdır:

| Sıra | Yeni URL | Hedeflenen Birincil Küme (Google Öneri Sinyali) | Sayfa Türü & Fark Yaratan Kanıt |
| ---: | :--- | :--- | :--- |
| **1** | `/en/fr/poteaux-electriques-bois` | `poteau électrique en bois` (9), `poteau bois` (10), Batı Afrika / Senegal (Senelec) | **Fransızca Direk Lead Hunisi** — Fabrika yükleme videoları, EN 14229 tablosu, Dakar CIF konteyner hesabı |
| **2** | `/de/leistungen/china-einkauf` | `einkaufsagentur china`, `sourcing agent china` (15), `china import agentur` (2) | **Almanca Çin Tedarik Hizmeti** — Çift merkez (Çin + Türkiye) karşılaştırma tablosu, SAP Ariba & D-U-N-S güven rozeti |
| **3** | `/de/leistungen/qualitaetskontrolle-china` | `qualitätskontrolle china`, `vorversandkontrolle china`, `containerbeladungskontrolle` | **Almanca Çin Kalite Kontrol & Yükleme Denetimi** — 24–48 saat fotoğraflı ISO 2859-1 AQL rapor örneği |
| **4** | `/ithalat/cin-gumruk-vergisi-hesaplama` | `çin gümrük vergisi hesaplama` (4), `ilave gümrük vergisi` (16), `gözetim uygulaması` (22) | **İnteraktif İthalat Vergisi & Maliyet Hesaplayıcı** — CIF + GV + İGV + Gözetim + KDV simülasyonu → RFQ dönüşümü |
| **5** | `/de/ratgeber/import-tuerkei-zoll-atr` | `import aus der türkei` (10), `zoll türkei deutschland` (9), `a.tr warenverkehrsbescheinigung` (8) | **Almanca Gümrük & A.TR Rehberi** — Gümrük Birliği muafiyeti, gıda/tarım istisnaları, menşe şahadetnamesi farkı |
| **6** | `/en/guides/import-from-turkey-to-usa-tariffs` | `tariff on turkey` (17), `import from turkey to usa` (9), `section 301 tariffs` (15) | **ABD İthalat Vergisi & Çin vs Türkiye Karşılaştırma Rehberi** — HTS kod örnekleri + `/en/us` bağlantısı |
| **7** | `/en/guides/import-duty-from-turkey-to-uk` | `import from turkey to uk` (9), `import duty from turkey to uk` (3) | **İngiltere–Türkiye STA & ATR/Menşe Rehberi** — UK Global Tariff hesaplama örnekleri |
| **8** | `/de/produkte/textilproduktion-tuerkei` | `textilproduktion türkei` (5), `kleidung produzieren lassen türkei` (1), `textilhersteller türkei` | **Almanca Tekstil & Private Label Üretim Sayfası** — MOQ aralıkları, Öko-Tex/GOTS, numune takvimi |
| **9** | `/ithalat/danismanlik-ucretleri` | `çin ithalat danışmanlık ücretleri`, `çinden ithalat yapan firmalar` | **Şeffaf Hizmet & Denetim Ücret Modeli Sayfası** — Hem 10 sayfadaki kırık linki kalıcı çözer hem en sıcak alıcıyı yakalar |
| **10** | `/ihracat/ihracat-danismanligi` | `ihracat danışmanlığı` (9 — Ankara, İzmir, İstanbul sanayi bölgeleri) | **B2B İhracat Danışmanlığı & Saha Operasyon Hizmeti** — Ücretsiz programa ve ticari istihbarata huni bağlantısı |
| **11** | `/en/guides/how-to-verify-turkish-suppliers` | `how to verify turkish suppliers`, `turkish manufacturers directory` | **Tedarikçi Doğrulama Rehberi** — Ticaret sicili, kapasite raporu, vergi levhası ve 48s yerinde denetim kontrol listesi |
| **12** | `/de/ratgeber/import-aus-china-zoll-kosten` | `import aus china` (15), `import aus china zoll` (14), `importkosten china` (13) | **Almanca Çin İthalat Gümrük, EORI & Antidumping Rehberi** — Doğrudan `/de/leistungen/china-einkauf` hunisine bağlanır |
| **13** | `/en/products/cosmetics` & `/en/products/packaging` | `packaging manufacturers turkey` (3), `cosmetics manufacturer turkey` (2) | **Yeni İngilizce Ürün Merkezleri** — Ambalaj ve private label kozmetik üreticileri |
| **14** | `/de/produkte/moebel-naturstein-tuerkei` | `möbel aus türkei importieren`, `marmor aus der türkei importieren` | **Almanca Mobilya, Otel FF&E ve Mermer Tedarik Sayfası** |
| **15** | `/ithalat/kanton-fuari-rehberi` & `/ihracat/cbam-ve-destekler` | `kanton fuarı` (15), `cbam` (15), `mikro ihracat` (17), `e ihracat destekleri` (12) | **Mevsimsel Fuar & İhracat Mevzuat Rehberleri** — Boş `/makaleler` merkezini gerçek içerikle doldurup yeniden açar |

---

## 7. Ölçüm ve 30 / 60 / 90 Günlük Google Search Console Hedefleri

Tüm ilerleme dış tahmin araçlarıyla değil, doğrudan **Google Search Console API** üzerinden aşağıdaki baz çizgisine karşı takip edilecektir:

| Metrik (Kaynak: Google Search Console) | Baz Çizgisi (25 Kasım 2026) | 30. Gün Hedefi (25 Aralık 2026) | 60. Gün Hedefi (25 Ocak 2027) | 90. Gün Hedefi (25 Şubat 2027) |
| :--- | :--- | :--- | :--- | :--- |
| **Google Dizindeki Temiz Sayfa Sayısı** | **113 / 169** *(11'i boş makale)* | **145+ / 155** *(boş sayfalar çıkarılmış)* | **165+ / 170** *(yeni A-öncelikli sayfalar dahil)* | **180+ / 185** *(>%95 temiz dizin oranı)* |
| **Taranmamış ("Bilinmiyor") Ticari Sayfa** | **45 sayfa** | **< 10 sayfa** | **0 sayfa** | **0 sayfa** |
| **28 Günlük Organik Gösterim** | **41** *(ilk 3 gün)* | **600 – 1.200** | **2.500 – 5.000** | **7.500 – 15.000** |
| **28 Günlük Nitelikli B2B Organik Tıklama** | **1** | **20 – 40** | **80 – 160** | **250 – 500** |
| **`"bdimexport"` Marka Araması Sırası** | Gösterim yok *(yeni alan adı)* | **1. Sıra** *(D&B, Ariba, LinkedIn sinyaliyle)* | **1. Sıra + Site Bağlantıları (Sitelinks)** | **1. Sıra + Marka Aramaları** |
| **1. Sayfada (İlk 10) Gösterim Alan Ticari Küme** | **4 küme** *(AR/EN Direk, DE Denetim/Gümrük, US Hub)* | **10+ küme** | **20+ küme** | **35+ küme** |

---

## 8. Yöntem ve Veri Kaynakları

1. **Google Search Console Performans Verisi (`webmasters/v3/searchAnalytics/query`):** `https://bdimexport.com/` mülkü üzerinde `dataState: "all"` parametresiyle 1 Eylül – 25 Kasım 2026 aralığında tarih, sorgu, sayfa, sorgu+sayfa, ülke, cihaz ve arama görünümü kırılımları çekildi.
2. **Google URL Denetimi Verisi (`searchconsole.googleapis.com/v1/urlInspection/index:inspect`):** `out/sitemap.xml` içindeki 168 canlı URL + harita dışı `/ithalat/rehberler` olmak üzere **169 URL'nin tamamı** tek tek Google üretim dizininden sorgulandı (`google-search-console-169-url-dizin-ve-performans.csv`).
3. **Google Autocomplete Talep Sinyali (`suggestqueries.google.com`):** 12 ülke/dil parametresinde (`tr/TR`, `en/US`, `en/GB`, `en/ZA`, `en/KE`, `de/DE`, `ar/SA`, `ar/EG`, `fr/FR`, `fr/SN`, `pt/PT`, `zh-CN/CN`, `pl/PL`) hem kök sorgu hem boşluklu tamamlama sorgulanarak **266 B2B anahtar kelime** derlendi (`anahtar-kelime-bosluklari.csv`). Öneri sayısı arama hacmi tahmini değil, Google'ın o kökte gerçek kullanıcı aramalarından ürettiği tamamlama çeşitliliğidir (`≥10` Yüksek, `3–9` Orta, `0–2` Düşük).
4. **Canlı Altyapı ve Statik Derleme Denetimi:** `bdimexport.com` ve `www.bdimexport.com` DNS (`A`/`CNAME`) + HTTP/TLS el sıkışması test edildi; `out/` dizinindeki tüm statik HTML çıktılarında `<title>`, `<h1>`, `<meta name="robots">`, `canonical`, `hreflang`, gövde kelime sayısı ve iç bağlantı grafiği doğrulandı.

---

## 9. 26 Kasım 2026 — Uygulanan Kod, İçerik ve 6 Yüksek Getirili Fırsat Kümesi Özeti

Bu rapordaki teknik bulgular ve **Bölüm 5 — Google Verisiyle Keşfedilen 6 Yüksek Getirili Fırsat Kümesi** doğrultusunda aşağıdaki geliştirmeler site koduna işlenmiştir:

1. **Teknik SEO Hatalarının Kapatılması:**
   - **11 kırık iç bağlantı (`404` → `0`):** 10 Türkçe ithalat ve rehber sayfasındaki kırık `/ithalat/danismanlik-talebi` bağlantıları güncellendi; ayrıca eski/kayıtlı bağlantılar için `/ithalat/danismanlik-talebi` üzerinde `200 OK` dönüşüm sayfası (`noindex, follow`) açıldı. `/en/markets/netherlands` içindeki kırık `/en/products/home-living` bağlantısı `/en/products/kitchenware` ile düzeltildi.
   - **Site haritası & `noindex` temizliği:** Boş olan 10 dil varyantı `insights` sayfası (`listInsights === 0`), `/de/anfrage` ve tüm satış teklif şablonları (`/en/proposals/*`, `/teklif/*`, `/de/angebot/*`, `/zh/fangan/*`) `noindex, follow` yapılarak 7 XML site haritasından çıkarıldı; `/ithalat/rehberler` ve yeni ticari sayfalar haritalara eklendi.
   - **Başlık (`≤60 kr`) ve Ürün `<h1>` Temizliği:** 60 karakteri aşan 21 sayfa başlığının tamamı 60 karakter altına çekildi; 20 ürün ve 5 kategori sayfasındaki `| B2B Sourcing` H1 ekleri temizlendi.
   - **Karşılıklı Çapraz-Dil `hreflang` ve İç Bağlantı Ağı:** TR, EN (+10 varyant), DE ve ZH eşdeğer hizmet ve rehber merkezleri arasında tam karşılıklı BCP-47 `hreflang` tanımlandı; dizindeki hizmet sayfalarından ürün, ülke koridoru ve ABD alt sayfalarına doğrudan iç bağlantı blokları eklendi.

2. **6 Yüksek Getirili Fırsat Kümesinin Tam Uygulaması:**
   - **Küme 1 (Ahşap Elektrik & Telekom Direkleri — EN / AR / FR / PT):**
     - **Yeni Fransızca Batı Afrika & Senegal Hunisi:** `/en/fr/wooden-utility-poles` (kısa yönlendirmeler: `/fr/poles`, `/senegal/poles`, `/en/fr/poteaux-electriques-bois`) yayına alındı; EN ↔ AR ↔ FR üçlü karşılıklı `hreflang` kuruldu.
     - `/en/ar/wooden-utility-poles` başlığı Google Autocomplete sorgusu olan `"أعمدة كهرباء خشبية للبيع (ليبيا والأردن)"` ile güçlendirildi; `/en/wooden-utility-poles` sayfasına `"wooden electricity poles"`, `"CCA / EN 14229 treated wood poles"` ve Mozambik/Angola için Portekizce `"postes de madeira tratada"` teknik bloğu eklendi.
   - **Küme 2 (Almanca + Çin Çift Merkez & Tekstil / Gümrük — `/de`):**
     - 3 yeni Almanca hizmet sayfası yayına alındı: `/de/leistungen/china-einkauf`, `/de/leistungen/qualitaetskontrolle-china`, `/de/leistungen/textilproduktion-tuerkei`.
     - `/de/ratgeber` altında 2 kaynaklı uzman rehber yayına alınarak boş durumdan çıkarıldı: `/de/ratgeber/import-tuerkei-zoll-atr` ve `/de/ratgeber/import-aus-china-zoll-kosten`.
   - **Küme 3 (Tekil Konteyner Yükleme Nezareti & 3. Taraf Denetim):**
     - `/en/services/container-loading`, `/ithalat/konteyner-yukleme-denetimi`, `/ithalat/fabrika-denetimi`, `/de/leistungen/werkspruefung` ve 10 dildeki `inspection` sayfaları 3. taraf denetim ve konteyner yükleme nezareti kelimeleriyle güncellendi.
   - **Küme 4 (ABD / İngiltere Gümrük Vergisi, A.TR, Low MOQ Giyim & Tedarikçi Doğrulama — `EN`):**
     - `/en/products/apparel` (gerçekçi stok kumaş Low MOQ, activewear/workwear), `hospitality-furniture`, `marble`, `home-textiles` ve `olive-oil` güncellendi.
     - `/en/insights` altında 3 amiral gemisi rehber yayına alındı: `/en/insights/import-from-turkey-to-usa-tariffs`, `/en/insights/import-duty-from-turkey-to-uk-atr`, `/en/insights/how-to-verify-turkish-suppliers`.
   - **Küme 5 (Türkçe Alıcı Dili, Vergi Hesaplayıcı, Ücretler & İhracat Danışmanlığı — `TR`):**
     - İnteraktif `/ithalat/cin-gumruk-vergisi-hesaplama` (CIF + GV + İGV + Gözetim + İndirilemeyecek KDV simülatörü) yayına alındı ve TR üst menüsüne eklendi.
     - `/ithalat/danismanlik-ucretleri` ve `/ihracat/ihracat-danismanligi` hizmet sayfaları ile `/makaleler/kanton-fuari-ve-cinden-mal-getirme-rehberi` ve `/makaleler/cbam-mikro-ihracat-ve-devlet-destekleri-rehberi` rehberleri yayına alındı.
   - **Küme 6 (Çinli İhracatçılar `/zh` + Arapça SABER/Şحن + Fransızca Usine Textile):**
     - `/zh/insights/tuerqi-chukou-qingguan-zhinan` yayına alındı; `/en/ar/services/sourcing` (`شهادة سابر`, `شركات الشحن من تركيا`, `استيراد ملابس من تركيا`) ve `/en/fr/services/sourcing` (`fournisseur turquie`, `importer de turquie`, `usine textile turquie`) derinleştirildi.
