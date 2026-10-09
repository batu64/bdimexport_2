# KVKK Açık Rıza Metni — v1 (ONAYLI)
**DURUM:** ✅ ONAYLI — İnsan onayı: 08.10.2026 (kullanıcı). Firma: Batuhan Dağ İthalat İhracat Sanayi Ltd. · Uşak/Banaz · Marka: BDIMEXPORT. Geçici e-posta placeholder'ı sonradan düzeltilecek (kullanıcı beyanı).
**AI katkısı:** yalnızca iskelet + madde başlıkları (agents/tr-export-agent.md §6.1 — metin gövdesi insan/insanın hukuk danışmanına aittir)
**Not:** Bu metin kullanıcı onayıyla v1 olarak kilitlenmiştir. Değişiklik v2 sürümünde yapılır.

---

## Bölüm 1 — Kişisel Verilerin İşlenmesine İlişkin Aydınlatma ve Açık Rıza

### 1.1 Veri Sorumlusu
- Firma: Batuhan Dağ İthalat İhracat Sanayi Limited
- Adres: [____]
- E-posta: [____] · Web: bdimexport.com

### 1.2 İşlenen Kişisel Veriler
Başvuru formu aracılığıyla: firma adı, vergi numarası, iletişim bilgileri (ad-soyad, e-posta, telefon/WhatsApp), ürün kataloğu (PDF), üretim kapasitesi, sertifikalar (CE, ISO vb.), ihracat geçmişi beyanları.

### 1.3 İşleme Amaçları
1. Başvurunun değerlendirilmesi ve "Ücretsiz İhracat Hızlandırma" programına kabul süreci
2. Global alıcı talepleriyle eşleştirme ve yönlendirme
3. Onaylı partnerlerin /en, /de vb. yabancı dil sayfalarında tanıtımı (aşağıdaki logo rızası bölümüne tabi)
4. İletişim (başvuru sonucu, teklif, program bilgisi)

### 1.4 Hukuki Sebep
1–2. madde için: Sözleşmenin kurulması/ifası (KVKK m.5/2-c) · 3. madde için: **Açık rıza (m.5/1)** · 4. madde: Meşru menfaat + rıza

### 1.5 Aktarım
- Yurt dışına aktarım: Onaylı partner bilgileri (firma adı, sektör, logo — rıza varsa) bdimexport.com'un yabancı dil sayfalarında yayınlanır (sunucu: Cloudflare, ABD/AB)
- Alıcı talepleri doğrultusunda iletişim bilgileriniz, yalnızca sizin onayınızla ilgili alıcıyla paylaşılır
- Altyapı sağlayıcıları: Cloudflare (hosting/CDN), Resend/Brevo (FAZ_3'te aktif)

### 1.6 Saklama Süresi
Başvuru reddedilirse 1 yıl; onaylı partnerlikte: partnerlik süresince + 1 yıl (yasal zorunluluklar hariç)

### 1.7 Haklarınız (KVKK m.11)
Bilgi alma, düzeltme, silme, aktarım bilgisini isteme, rızayı geri alma haklarınız iletisim@bdimexport.com üzerinden.

---

## Bölüm 2 — Logo ve Firma Bilgisi Yayın Rızası (AYRI CHECKBOX — hukuki act farklı)

"**Firma adımın, sektörümün ve logomun bdimexport.com'un yabancı dil sayfalarında (İngilizce, Almanca vb.) 'Onaylı Türk İş Ortağı / Verified Turkish Partner' olarak yayınlanmasına** açık rıza veriyorum. Bu rızayı dilediğim zaman geri alabileceğimi; geri alma sonrası yayından kaldırılacağımı anlıyorum."

- [ ] Evet, yayın rızası veriyorum *(boş bırakılabilir — rıza yoksa yalnızca lead eşleştirmesi yapılır, site listelerinde görünmez; `partners.consent_logo_en=0`)*

---

## Form Bağlama Notları (teknik — tr-export-agent/api-agent)
- Bu metin Bölüm 1 checkbox'ı ve Bölüm 2 checkbox'ı olarak AYRI bağlanır (agents/tr-export-agent.md §3)
- Onay sonrası dosya `kvkk-riza-v1.md` olarak kilitlenir; değişiklik v2'dir
- Bu dosyanın sha256'sı form sayfasında versiyon referansı olarak gösterilir
