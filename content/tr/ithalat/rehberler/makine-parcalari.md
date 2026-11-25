# Çin'den Makine Parçası İthalatı Rehberi
**Sayfa tipi:** TR İthalat rehberi · **Hedef keyword:** çin'den makine parçası ithalatı
**Durum:** FAZ_1 Step 1.4 · Batch 1/2 · Model: GLM 5.3 (Portal) · Agent: tr-import-agent

<!-- META: title="Çin'den Makine Parçası İthalatı: Çizimden Teslimata" (51 kar) desc="Teknik çizim, tolerans ve malzeme standardı ile tedarikçi seçimi, FAI numune doğrulama, %100 kritik ölçüm ve denetimli üretim süreci." (127 kar) -->

# Çin'den Makine Parçası İthalatı Rehberi

Makine parçası ithalatı, diğer gruplardan temelde farklıdır: hata toleransı **milimetrelerin binde biriyle** ölçülür ve bir kötü parti, müşteri makinelerini durdurur. Bu rehber, teknik çizimden teslimata ölçülebilir bir süreç kurar.

## 1. Teknik Çizim: Tek Gerçek Kaynak (hafta 1)

Sözlü tanım bu alanda çalışmaz; her parça için teknik çizim (2D + varsa 3D) olmazsa olmazdır:

- **Ölçü ve toleranslar:** Kritik boyutlar ± kaç mm (veya µm) — ISO 2768 genel tolerans veya özel tolerans
- **Malzeme standardı:** Çelik kalitesi (örn. S235, 42CrMo4), alüminyum alaşım, sıcaklık/dayanım gereksinimi
- **Yüzey işlemi:** Boya, kaplama (çinko/nikel), taşlama hassasiyeti
- **Ölçüm planı:** Hangi boyutlar ölçülecek, hangi cihazla (kumpas/mikrometre/CMM)

Çizim ne kadar ölçülebilirse, tedarikçiyle tartışma o kadar az olur. Çizim hazırlığı mühendis desteği gerektiriyorsa ilk adım budur.

## 2. Tedarikçi Seçimi: Kapasite Doğrulaması (hafta 1–3)

Makine parçası tedarikçilerinde "yapabiliriz" cümlesi CNC parkı, ölçüm laboratuvarı (kalite kontrol donanımı — CMM var mı?) ve referans parçalarla doğrulanır:

- Üretim tipi uyumu: döküm / işleme (CNC torna-frez) / sac şekillendirme / ekstrüzyon — her teknik farklı fabrika kümesidir
- Malzeme sertifikası (mill test certificate) verme alışkanlığı
- Benzer parça referansları (müşteri sektörü: otomotiv daha disiplinli, tarım makinesi daha esnek)

Kısa liste ve müzakere süreci [tedarik hizmeti](/ithalat/tedarik) kapsamındadır.

## 3. Numune (First Article) Doğrulama (hafta 3–6)

FAI (First Article Inspection) bu alanda numune değil, **doğrulama** olarak anılır: numune, çizimdeki TÜM ölçülere karşı raporlanır (balloon report). Kabul ölçütü:

- Kritik boyutlar: tolerans içinde, ölçüm raporlu
- Malzeme: sertifikalı, gerekirse spektrometre doğrulaması
- İşlev testi (montaj denemesi): parça gerçek üniteye takılıp çalışır

FAI geçmeden seri üretim başlamaz — bu cümle sözleşmeye yazılır.

## 4. Seri Üretim ve Denetim (hafta 6–12)

Seri üretimde standart süzgeç: başlangıç kontrolü (ilk 10–20 parça CMM), ara kontrol (%20–50'de) ve sevkiyat öncesi son kontrol. AQL yerine **kritik boyut %100 ölçüm** yaklaşımı yüksek hassasiyetli parçalarda önerilir. [Fabrika denetimi](/ithalat/fabrika-denetimi) makine parçasında teknik rapor formatıyla verilir (ölçüm tabloları + sertifikalar).

## 5. Sevkiyat ve Gümrük

Makine parçalarında ambalaj kritiktir: hassas yüzeyler koruma (VCI/koruyucu film), ağır parçalarda paletleme. Deniz yolu yaygındır; acil yedek parça hava yolu. Gümrükte makine/parça GTİP ayrımı (tam makine mu yok parça mı) vergiyi değiştirir; montaj kiti (CKD/SKD) tanımları da kontrol edilir — [gümrük hizmeti](/ithalat/gumruk).

## Maliyet Kalemleri

Parça fiyatı + kalıp/fixture (yeni üretimde büyük kalem!) + FAI/test + denetim + navlun + sigorta + gümrük + varış. Kalıp maliyeti parça sayısına amortisman edilir; düşük adetle kalıplı üretim ekonomik olmayabilir — döküm/işleme alternatifi analiz edilir.

## Riskler ve Panzehirleri

| Risk | Belirti | Panzehir |
| :--- | :--- | :--- |
| Tolerans dışı parti | Montajda uymama | FAI zorunluluğu + %100 kritik ölçüm |
| Malzeme sapması | Erken yıpranma | Mill cert + spektrometre doğrulama |
| Kalıp maliyeti şoku | Teklif sonrası ek fatura | Kalıp maliyeti baştan teklifin parçası |
| Yüzey işlem farkı | Korozyon/görünüş | Kaplama standardı çizimde |

## Üretim Tipleri: Döküm, İşleme, Sac — Üç Ayrı Dünya

| Tip | Tipik süreç | Numune süresi | MOQ eğilimi |
| :--- | :--- | :--- | :--- |
| CNC işleme | Torna/freze, tolerans ±0.01–0.05mm | 1–3 hafta | Düşük (onlarca) |
| Döküm (dökme demir/alüminyum) | Kalıp + döküm + işleme | 4–8 hafta (kalıp) | Yüksek (kalıp amortismanı) |
| Sac şekillendirme | Lazer/kıvırma/pres | 2–4 hafta | Orta |

Kalıplı süreçlerde kalıp maliyeti baştan netleştirilmeli ve **kalıp mülkiyeti** sözleşmede sizde kalmalıdır — aksi halde tedarikçi değişikliği, kalıbı da alır.

## Malzeme Sertifikasyonu: Hangi Belge Ne Söyler?

- **Mill Test Certificate (MTC):** Döküm/parti bazlı kimyasal+mekanik değerler — temel belge
- **Spektrometre analizi:** Bağımsız doğrulama — sertifikaya güven değil, ölçüme güven
- **Sertlik/çekme testi:** Uygulama kritikse laboratuvar raporu
- **Isıl işlem raporu:** Sertleştirilmiş parçalarda süre/sıcaklık kaydı

Belge seti, parça uygulamasının kritikliğine göre ölçeklenir: dekoratif braket için MTC yeter; yük taşıyan aks parçası için tam set.

## Montaj Testi: Kâğıt Üstünde Geçen Parça Gerçekte Geçer mi?

FAI raporu tüm ölçüleri gösterir; ancak gerçek test, parçanın gerçek üniteye takılmasıdır (fit test): montaj sırasında zorlanma, sızdırmazlık, çalışma sesi. Bu test, ölçüm planının kaçırdığı sistemik sapmaları yakalar — her FAI turuna eklenmesi önerilir.

## Yedek Parça Sürekliliği: Üretici İlişkisini Kurumsallaştırmak

Yedek parça ithalatı, tek seferlik alım değildir — yıllarca devam eden bir akıştır. Kurumsallaşma maddeleri: parça kodu kataloğu (sizin numaralandırmanız), yıllık talep tahmini paylaşımı, stok taahhüdü (üreticinin kritik parçaları tutması), alternatif 2. kaynak geliştirme (kritik parçalarda tek tedarikçi bağımlılığı riski). Bu yapı kurulunca ithalat, reaktif alımdan planlı tedarik zincirine dönüşür.

## Sipariş Öncesi Kontrol Listesi (makine parçası)

- [ ] Teknik çizim revizyon numarası sabitlendi (v1.0 — sonraki revizyonlar ayrı takip)
- [ ] Kritik boyutlar ve toleranslar işaretli
- [ ] Malzeme standardı + sertifikasyon şartı yazılı
- [ ] Yüzey işlemi tanımlı
- [ ] FAI rapor formatı kabul edildi (balloon ölçüm)
- [ ] Kalıp maliyeti ve mülkiyeti netleşti
- [ ] %100 kritik ölçüm kuralı (gerekiyorsa) sözleşmede
- [ ] Ambalaj/koruma standardı yazılı

Bu liste, tedarikçiyle ilk teknik toplantının gündemini oluşturur; eksik madde = sonradan pazarlık kaybı.

## Ölçüm Cihazı Gerçekliği: Tedarikçi QC Parkını Sormak

Tedarikçinin ölçüm yeteneği, sizin tolerans talebinizin üst sınırıdır: CMM (koordinat ölçüm makinesi) yoksa ±0.02mm tolerans "söz verilen" değil "umarım olan" değerdir. Teknik ziyarette/denetimde bakılacaklar: CMM veya profilojektör varlığı, kalibrasyon sertifikaları, QC personel sayısı, ölçüm rapor formatı. Ölçüm parkı zayıf fabrikaya hassas parça verilmez — fiyat ne kadar iyi olursa olsun.

## Döküm vs İşleme Maliyet Eşiği: Adet Kararı

Aynı parça için iki yol: CNC işleme (kalıpsız, birim pahalı, düşük adet) veya döküm+işleme (kalıplı, birim ucuz, yüksek adet). Eşik tipik olarak kalıp maliyetinin (÷) iki yol arası birim fiyat farkına bölünmesiyle bulunur: örnek — kalıp $2.000, işleme birim farkı $2 ise eşik 1.000 adet. Altında CNC, üstünde döküm ekonomiktir. Bu hesap, "kalıp yapalım mı" sorusunun duygusal değil sayısal cevabıdır; 2. kaynak tedarikçi değişkeniyle (kalıp taşınabilirliği) birlikte değerlendirilir.

## Revizyon Yönetimi: Çizim Değiştiğinde Ne Olur?

Teknik çizim sipariş sürecinde değişebilir. Değişiklik kontrolsüz yapılırsa tedarikçide iki farklı revizyonla üretim yapılabilir. Bunu önlemek için şu kuralları uygulayın:

- Her çizimin revizyon numarası vardır ve sipariş belgesinde aynı numara yazılır
- Değişiklik yazılı bildirilir; tedarikçi alındı onayı verir
- Eski revizyonla üretilmiş stokun akıbeti (hurda, işleme, kabul) önceden kararlaştırılır
- Önemli revizyonda yeni bir FAI (ilk parça doğrulaması) istenir
- Fiyat ve teslim süresi etkisi değişiklikle birlikte yazılır

Bu disiplin olmadan "hangi çizime göre ürettiniz" tartışması zararı sizin üzerinize bırakır.

## Giriş Kontrolü: Türkiye'de İkinci Göz

Çin'deki FAI raporu önemlidir, ancak parça Türkiye'ye vardığında kontrolü tekrarlamak gerekir. Taşıma sırasında yüzey zarar görmüş veya parti karışmış olabilir.

1. Kritik boyutlardan örnek alıp kendi ölçümünüzle FAI raporuna karşılaştırın
2. Malzeme belgesi ile parça üzerindeki işaretleme eşleşiyor mu bakın
3. Korozyon, çizik ve kaplama bütünlüğünü kontrol edin
4. Uygunsuzluğu fotoğraf ve ölçümle, sözleşmedeki süre içinde bildirin

Rapor ile gerçek ölçü arasında fark çıkarsa durum tedarikçiye belgeyle bildirilir. Kayıtsız itiraz çoğu zaman sonuç vermez.

## Teknik İletişim: Mühendislik Dilinde Yanlış Anlamayı Önlemek

Makine parçasında küçük bir yanlış anlama, ölçü hatasına dönüşür. Kayıpları azaltmak için:

- Ölçü birimini (mm) ve ondalık gösterimini çizimde açıkça belirtin
- Çizim notlarını İngilizce yazın ve teknik terimleri tedarikçiyle birlikte netleştirin
- Kritik toleransları renkli işaretleyin
- Her önemli kararı fotoğraf veya çizim eşliğinde yazılı teyit edin
- İlk üretim döneminde kısa bir haftalık durum raporu isteyin

Sözlü anlaşma burada işe yaramaz; yazılı olmayan her şey tedarikçinin yorumuna kalır.

## İlk Siparişte Pilot Parti

Kritik parçalarda ilk siparişi küçük bir pilot parti olarak verin. Pilot parti, tedarikçinin ölçüm disiplinini, teslim takvimine uyumunu ve iletişim kalitesini düşük riskle gösterir. Sonuç iyiyse seri üretim siparişi verilir. Pilot, ek maliyet gibi görünse de hatalı bir seri partinin maliyetinden çok daha küçüktür.

## Kimliklendirme ve Paketleme: Parça Karışmasını Önleyin

Benzer görünen parçalar kolayca karışır. Her parçaya veya poşete parça kodu, revizyon numarası ve parti numarası etiketleyin. Farklı kodları ayrı poşet ve bölmeli kolilerde gönderin. Paketleme listesi etiketlerle birebir eşleşsin. Aynı kodun iki farklı revizyonunu asla aynı kolide göndermeyin.

## İlk Adım

Çiziminiz (veya örnek parça fotoğrafları) ile [danışmanlık talebi — Danışmanlık Ücretleri ve Teklif](/ithalat/danismanlik-ucretleri) bırakın; üretim tipi, kalıp ihtiyacı ve tedarik edilebilirlik 24 saatte döner.

## Sık Sorulan Sorular

### Çizimim yok, sadece örnek parça var — olur mu?
Tersine mühendislik ile ölçüm+çizim üretilebilir; hassasiyet arttıkça maliyeti ve riski artar, çizimli başlamak tavsiye edilir.

### En düşük adet ne kadar?
İşleme parçalarda onlarca; kalıplı/döküm parçalarda yüzlerce-binlerce — kalıp amortismanı belirleyicidir.

### Malzeme sertifikası neden önemli?
Mekanik özellikler (dayanım, sertlik) malzemeye bağlıdır; sertifikasız parça "görünüşte aynı, ömürde farklı" demektir.

### Parça testi Türkiye'de yapılabilir mi?
Evet; FAI raporu Çin'de yapılsa da giriş kontrolü Türkiye'de tekrarlanmalıdır.

### Yedek parça tedariki süreklilik ister — tedarikçi kalıcı kalır mı?
Sözleşme + kalıp mülkiyeti sizde olursa tedarikçi değiştirilebilir; kalıp fabrikada kalırsa bağımlılık doğar.

### Orijinal üreticiden mi almalıyım, yan sanayiden mi?
Uygulamanın kritikliği belirler; güvenlik/kritik uygulamalarda orijinal veya sertifikalı ikinci kaynak tercih edilir.
