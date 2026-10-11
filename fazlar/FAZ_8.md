# FAZ 8 — Lansman + Partner Havuzu Büyütme + Büyüme Operasyonu
**Sürüm:** 1.0 | **Tarih:** 08.10.2026 | **Üst doküman:** ROADMAP.md'de özeti olmayan faz (v1.1 ek fazı) — bu dosya yetkili adım detayı
**Hedef:** Teknik altyapı (Faz 0–7) tam; bu faz **iş/operasyon fazı**: site tam lansman, partner havuzunun sistematik büyütülmesi (Proje.md §10: "En kritik başarı faktörü: Türk partner havuzunu hızla doldurmak"), içerik üretiminin ölçeklenmesi ve kanal bazlı büyüme aksiyonları.
**Süre tahmini:** Süreklilik içi 2–3 haftalık operasyon bloğu | **Ön koşul:** FAZ 0–7 çıkış kriterleri tam + insan "devam et" ✅
**Fazın karakteri:** **Teknikten operasyona geçiş.** Kod minimum, ağırlık: gerçek partner başvuruları, içerik hacmi ve kanal operasyonu. Agent'lar burada "yazılım üreticisi" değil "büyüme operatörü"dür. Ölçüm Faz 6 altyapısından gelir; her aksiyon ölçülür.
**Faz çıkış kriteri:** §11'deki 9 madde qa-agent/orchestrator doğrulaması + İnsan Onay Kapısı.

> **Kültür değişimi notu:** Bu fazdan itibaren kuyruğun büyük kısmı sürekli akar (faz kapama yok — üretim hattı durmaz). "Faz çıkışı" = operasyon hedeflerinin ölçülüp bir sonraki operasyon fazına geçilmesidir.

---

## 🎛️ Claude Code Yürütme Katmanı (FAZ 8 — lansman + büyüme)
> **v2.0:** Eski "Ajan / Model" satırları yalnızca **scope kilidi**. **Yürütücü = Claude Code**; model tablosu aşağıdadır (AGENTS.md §7). Bu faz operasyon ağırlıklı → **insan katılımı en yoğun**. Sıralı çalış.

| Adım | İş | Model | Not |
| :-- | :-- | :-- | :-- |
| 8.1 | Lansman denetimi (regresyon) | **Sonnet 5.5** | |
| 8.2 | Lansman | **Haiku 5.5** (koordinasyon) | 👤 tetikleme + DNS |
| 8.3 | Partner kampanyası materyal | **Haiku 5.5 (ucuz)/Sonnet 5.5** | 👤 hedef liste + İYS |
| 8.4 | İçerik ölçekleme | runtime **Gemini** 🟡 (FAZ 4 hattı) | ayar en sonda |
| 8.5 | Kanal operasyonları (çok dilli) | **Haiku 5.5 (ucuz)/Sonnet 5.5** | 👤 kanal hesapları |
| 8.6 | İlk partner yayına alma | **Haiku 5.5** | 👤 onay + eşleştirme |
| 8.7 | Büyüme deneyleri A/B | **Haiku 5.5** | 👤 karar |
| 8.8 | Operasyonel QA | **Haiku 5.5** | |
| 8.9 | faz çıkışı | **Haiku 5.5** | 👤 onay |

**Sıralı yürütme:** 8.1 → 8.2 → 8.3 → 8.5 → 8.6 → 8.4 → 8.7 → 8.8 → 8.9
**Senin görevlerin (👤):** 8.2 lansman tetikleme + DNS · 8.3 hedef kurum listesi + İYS kaydı · 8.5 kanal hesapları (WeChat vb.) · 8.6 partner onay + lead eşleştirme · 8.9 faz çıkışı.

---

## Step 8.1 — Lansman Denetimi (canlıya çıkış öncesi son tur)
| Alan | Değer |
| :--- | :--- |
| Ajan / Model | qa-agent · **[ŞART]** GLM 5.3 |
| Amaç | Tüm dillerin canlı lansman öncesi uçtan uca denetimi |
| Kapsam | Tüm fazların çıkış kriterleri tek seferde yeniden koşulur (regresyon): 4 dil ailesi sayfaları · formlar (tr başvuru + en quotation + de double opt-in) · hreflang tam matris · sitemap'ler · llms.txt · lighthouse ≥ 90 tüm ana sayfalar · Access/admin · API gateway · gitleaks · production D1 izolasyonu |
| Çıktı | `qa/FAZ-8/lansman-denetimi.md` — bloklayıcı bulgu varsa lansman ERTELENİR (hız kararı insanın değil, denetimin) |
| Kural | Bloklayıcı bulgu = önce düzelt, sonra lansman. "Canlıda düzeltilir" yaklaşımı bu projede yasak (B2B güven = teknik kusursuzluk) |

## Step 8.2 — Lansman 🚀 İNSAN KARARI
| Alan | Değer |
| :--- | :--- |
| Ajan / Model | orchestrator koordinasyon (GLM 5.3 [ŞART]) · **LANSMAN KARARI: İNSAN** |
| Amaç | bdimexport.com tam kapsamlı canlıya alma |
| Yöntem | Cloudflare Pages production deploy (insan tetikler) · DNS kontrolü · Search Console tüm dil mülklerinde URL submission · Bing Webmaster · Baidu (zh — Faz 5 doğrulaması kullanılır) · Analytics canlı doğrulama (GA4 gerçek zamanlı hit) |
| Çıktı | Lansman checklist tam + ilk canlı gün raporu (trafik, hata oranı, ilk organik hit) |
| İnsan görevi | Deploy tetikleme + domain/DNS son kontroller + lansman zamanı tercihi (öneri: salı–çarşamba, hafta ortası) |

## Step 8.3 — Partner Havuzu Büyütme Kampanyası 🎯 PROJENİN EN KRİTİK İŞİ
| Alan | Değer |
| :--- | :--- |
| Ajan / Model | tr-export-agent · **[TAVSİYE]** GLM 5.3 (kampanya materyalleri) + seo-geo-agent (kampanya sayfası) |
| Amaç | Proje.md §10: "En kritik başarı faktörü: Türk partner havuzunu hızla doldurmak" — Faz 2'de koşullanan (partner ≥ 3) tam serbest kalması |
| Çıktı | Kampanya materyalleri: /ihracat/ucretsiz-destek kampanya sayfası güncellemesi (sosyal kanıt artık dolu — ilk partnerler sergilenir) · endüstri odası/ dernek hedef listesi (TİM üyesi ihracatçı birlikleri, KOSGEB bölge müdürlükleri — görev dosyasından insan sağlar) · **e-posta davet şablonu** (Resend/Brevo — FAZ_3 3.9 credential) · WhatsApp bülten şablonu · LinkedIn post kalıpları (4 dilde değil — TR hedefli) |
| Zorunlu kurallar | E-posta kampanyası: yalnızca izinli listeye (KVKK — ticari e-posta İYS kaydı şart); agent soğuk e-posta listesi UYDURAMAZ; hedef kurum listesi insanın iş ağından |
| Kabul | Kampanya sayfası canlı + ilk davet gönderimi insan onaylı listeye; başvuru formundan günlük yeni başvuru akışı ölçülüyor |
| İnsan görevi | Hedef kurum listesi + kişisel ağ davetleri + İYS kaydı |

## Step 8.4 — İçerik Üretim Ölçeklendirme (200+ sayfa hedefine ivme)
| Alan | Değer |
| :--- | :--- |
| Ajan / Model | seo-geo-agent + en-expert-agent + locale agent'lar · **[TAVSİYE]** Faz 4 hattı aynen: Flash üretim ($0 gece) + GLM kontrol |
| Amaç | Proje.md §10 "1 ayda 200+ SEO sayfası" hedefinin tam yakalanması |
| Üretim planı (günlük rutin) | Günde 5–10 makale (keyword motoru 6.3'ten hedefli) + haftada 10–15 yeni ürün sayfası varyantı + mevcut sayfalara GSC verisiyle güncelleme · varyant büyütme: /en/{ru,fr,nl,es,ar} her hafta 2–3 tam sayfa (Qwen ru/ar + Flash fr/nl/es) |
| Zorunlu kurallar | Kalite eşikleri sabit (1200+ kelime, FAQ, schema) — hız artarken eşik DÜŞMEZ (hız-kalite çatışmasında kalite kazanır — ORCHESTRATOR.md §11 Kural 1 ruhu); insan onay kapasıtması günde 10–20 draft (3.6 UI); onay bekleyen > 50 ise üretim yavaşlatılır (insan darboğazı) |
| Kabul | Haftalık: üretim/onay/yayın oranı raporu (6.4'ten); yayınlardan GSC'de ilk gösterimler başlıyor |
| Çakışma | Faz 4 hattı zaten çalışıyor — bu step "hızı artır + hedefle", yeni kod YOK |

## Step 8.5 — Kanal Operasyonları (bölge bazlı erişim)
| Alan | Değer |
| :--- | :--- |
| Ajan / Model | en-l10n-agent + zh-agent · **[TAVSİYE]** Qwen 3.8 (ru/ar/zh kanal metinleri) + Gemini Flash (fr/nl/es) |
| Amaç | Proje.md/mimari.md kanal stratejisi: RU→Telegram, CN→WeChat, DACH→WhatsApp/Email, MENA→WhatsApp |
| Çıktı | Telegram kanalı açılış içerikleri (ru) + haftalık post kalıpları · WeChat resmi hesap içerik hazırlığı (insan hesap açar — Çin'de kayıt süreci insan işidir) · WhatsApp Business katalog + hızlı yanıt şablonları (ar/tr/de) · tüm kanal linkleri channel_pref widget'larına bağlanır (zaten Faz 2 altyapısı) |
| Zorunlu kurallar | Kanal içerikleri locale dilinde + yerel format; spam/çok mesaj yasak (kanal güveni); her kanal linki ölçülebilir (utm) |
| Kabul | Kanal başına ilk içerik seti insan onaylı yayında; attribution'da kanal kaynaklı ilk trafik |
| İnsan görevi | WeChat resmi hesap başvurusu + kanal hesaplarının sahipliği |

## Step 8.6 — İlk Onaylı Partnerlerin Yayına Alınması (flywheel 2–4. adımlar tamamlanır)
| Alan | Değer |
| :--- | :--- |
| Ajan / Model | admin-agent (UI zaten var) + orchestrator · **[TAVSİYE]** GLM 5.3 · Agent işi minimal — akış testi |
| Amaç | Proje.md §2.2 flywheel döngüsünün İLK GERÇEK TURU: başvuru → onay → EN/DE listeleme → lead eşleşmesi |
| Yöntem | İlk 3–10 gerçek başvuruyu admin panelde işle (insan karar) → onaylılar /en/suppliers + /de/lieferanten + ürün sayfalarına düşer (consent_logo_en kontrolü) → gelen global lead'leri uygun partnerlere yönlendir (Proje.md §2.2 adım 5) → yönlendirme sonucu takibi |
| Zorunlu kural | Partner onay kararı + lead eşleştirme kararı = İNSAN (ticari ilişki kurma — agent otomatik eşleştirmez, sadece öneri sıralar) |
| Kabul | İlk partner EN sayfalarında görünür; ilk lead-partner yönlendirmesi yapıldı ve kayıt altında (audit) |
| Not | Bu adım agent otomasyonu DEĞİL — sistemin insanla birlikte ilk gerçek iş turu; ölçülmesi Faz 6 altyapısıyla |

## Step 8.7 — Büyüme Deneyleri (A/B ölçümlü)
| Alan | Değer |
| :--- | :--- |
| Ajan / Model | seo-geo-agent öneri + orchestrator karar · **[TAVSİYE]** GLM 5.3 |
| Amaç | Veriye dayalı büyüme: hangi başlık/CTA/içerik yapısı dönüştürüyor |
| Deney seti (aynı anda max 2) | CTA metni A/B ("Get Free Quotation in 24h" vs alternatif — CONTENT_STYLE §5 A/B kuralı: orchestrator kararıyla) · Product sayfa H2 yapısı varyantı · kampanya e-posta konu satırı A/B |
| Zorunlu kurallar | Aynı anda > 2 deney YASAK (ölçüm kirliliği); deney süresi min 2 hafta/veri anlamlılık eşiği; kazanan varyant CONTENT_STYLE/SEO_PLAYBOOK şablonuna orchestrator işler (insan onayıyla) |
| Kabul | İlk deneyin ölçüm altyapısı (6.1 attribution) doğru kırılım gösteriyor |
| Not | Faz 4 üretim hattıyla paralel; kod değişikliği minimum (metin/metadata düzeyi) |

## Step 8.8 — Operasyonel QA + Rapor Devri
| Alan | Değer |
| :--- | :--- |
| Ajan / Model | qa-agent [ŞART] GLM 5.3 + orchestrator [ŞART] GLM 5.3 |
| Kapsam | 8.1 regresyon setinin haftalık tekrarı (lansman sonrası canlı değişikliklerin güvenliği) · üretim hattı kalite eşiklerinin hiçbir aşılmaması · KVKK/GDPR form akışlarının canlıda uçtan uca · haftalık rapor (6.4) artık operasyon metriklerini de içerir (partner havuzu büyümesi, kanal trafiği, deney sonuçları) |
| Çıktı | `qa/FAZ-8/rapor.md` + ilk operasyonel haftalık rapor |

## Step 8.9 — Faz Çıkışı 🚦 İNSAN ONAY KAPISI
| Alan | Değer |
| :--- | :--- |
| Ajan / Model | orchestrator · **[ŞART]** GLM 5.3 |
| Faz çıkış kriterleri | [ ] Lansman denetimi bloklayıcısız [ ] Site 4 dil ailesiyle canlı [ ] Partner havuzu: hedef sayıya ulaşıldı (insan hedefi — öneri: ilk ay ≥ 10 onaylı) [ ] İlk flywheel turu tamam (başvuru→onay→listeleme→lead→yönlendirme) [ ] Üretim: günde 5–10 makale istikrarlı + onay kuyruğu tıkanmıyor [ ] En az 2 kanal aktif (ölçülebilir) [ ] İlk A/B deney ölçümde [ ] Haftalık rapor operasyon metrikleriyle [ ] gitleaks + regresyon temiz |
| İnsan kararı | **"devam et" → FAZ 9 (Ölçekleme + Sürekli Optimizasyon)** · Ek kararlar: (1) .cn geçiş zamanı (FAZ 7 değerlendirme raporu girdisiyle), (2) üretim hızı artışı, (3) reklam bütçesi başlangıcı (6.5 altyapısı hazır bekliyor) |

---

## Bu Fazın Bütçe ve Çakışma Özeti

### Model dağılımı
| Model | Step'ler | Not |
| :--- | :--- | :--- |
| **GLM 5.3 [ŞART]** | 8.1, 8.2 koordinasyon, 8.3 materyal, 8.6/8.7 karar+öneri, qa, orchestrator | Operasyon beyni |
| Gemini Flash / Qwen 3.8 | 8.4 üretim, 8.5 kanal içerikleri | Ücretsiz kota ağırlıklı |
| Argon 4 | — (yalnızca küçük endpoint düzeltmeleri gerekirse) | Kod neredeyse yok |
| **Sonnet / Opus / görsel** | — | Yalnızca ihtiyaç halinde: yeni ürün sayfalarının görselleri (kota disipliniyle) |
| **İnsan (bu fazın ana "modeli")** | 8.2 lansman, 8.3 kurum listesi+İYS, 8.6 partner onay/lead eşleştirme, kanal hesapları, 8.9 karar | **Bu fazda en yoğun insan katılım** |

### Paralelleştirme haritası
```
8.1 ── 8.2 (lansman, insan) ──┬─ 8.3 (partner kampanyası) ──┐
                              ├─ 8.4 (üretim, sürekli) ─────┤
                              ├─ 8.5 (kanallar) ────────────┤
                              └─ 8.6 (ilk flywheel turu) ───┼─ 8.7 ── 8.8 ── 8.9
                                                            ┘
```
- 8.3–8.7 sürekli/paralel operasyon hatları; 8.6 diğerlerinin çıktılarını tüketir
- Kuyruk modeli değişir: **faz kapalı beklemek yok, sürekli akış + haftalık ölçüm**

### Tahmini token
| Kalem | Tahmin |
| :--- | :--- |
| Kampanya materyalleri + karar/rapor (GLM) | ~40k output |
| İçerik üretimi (Flash/Qwen, gece kota) | ~$0–düşük (hacim yüksek, maliyet düşük) |
| qa + regresyon | ~15k/output hafta |
| **Toplam (ücretli karşılığı)** | **~60–70k / operasyon bloğu — hafif; insan katılımı ağır** |
