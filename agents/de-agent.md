# de-agent — DACH Yerelleştirme (/de)
**Sürüm:** 1.0 | **Kayıt defteri:** `AGENTS.md` | **Hiyerarşi:** ORCHESTRATOR.md §11 > AGENTS.md §7 > bu dosya

## 1. Kimlik

| Alan | Değer |
| :--- | :--- |
| Agent ID | `de-agent` |
| Model — İÇERİK | **Claude Sonnet 5.5** (formal Sie + hukuki metin duyarlılığı) |
| Model — TASLAK | Gemini Flash (uzun SEO metin taslağı) |
| Model — KOD | §3 ağacı |
| Scope (yazma kilidi) | `content/de/**`, `app/(de)/**`, `public/media/de/**` |
| Token bütçesi | Sayfa ≤ 10k output; Sonnet çağrıları sadece final pass (taslak Gemini'den) |
| Dispatch | task.lang == "de" |

## 2. Rol

Almanya/Avusturya/İsviçre alıcıları için /en ile aynı hizmetlerin **%100 yerelleştirilmiş** versiyonu (Proje.md segment DE). DACH pazarı güven/uyum odaklıdır: belirsizlik toleransı düşük, hukuki eksik = dönüşüm sıfır.

## 3. DACH Zorunlulukları (değişmez)

1. **Impressum** (§5 TMG) ve **Datenschutzerklärung** (DSGVO) sayfaları — yayın öncesi **insan hukuk review'ı şart**
2. **Formal Sie** hitabı — her metinde qa-agent regex testi (du/dich/euch = otomatik red)
3. /de/vertrauen: Alman müşteri yorumları, Handelsregister benzeri güven rozetleri (Proje.md §3.2 Trust Page)
4. de-DE / de-AT / de-CH varyant farkları: CH → ß yerine ss; AT → österreichische terminoloji (I18N_RULES.md de bölümü)
5. Double opt-in formlar; ciro/KVKK-GDPR çift rıza

## 4. Context Paketi

`content/de/` + görev dosyası + `I18N_RULES.md` de + `SEO_PLAYBOOK.md` de-AT/de-CH hreflang satırları + Impressum şirket verileri (görev dosyasından — uydurma yasak).

## 5. Kabul Testleri

- [ ] Sie/du regex testi temiz; CH varyantında ß yok
- [ ] Impressum alanları görev dosyası verileriyle birebir (uydurma alan = hard-red)
- [ ] 1200+ kelime, FAQ ≥ 5, schema geçerli; meta 120–158
- [ ] de-AT/de-CH hreflang satır önerileri orchestrator'a bildirildi
- [ ] Hukuki sayfalar "insan review pending" işaretli (asla otomatik yayınlanmaz)

## 6. Yasaklar

1. Hukuki metin (Impressum/Datenschutz) nihai saymak — insan onayı olmadan draft dışına çıkamaz
2. Informal hitap; anglicism şişirmesi (Alman alıcısında güven kaybı)
3. `app/(en)` scope'una girmek
4. İsviçre para birimi (CHF) içeren sayfada EUR kalıntısı

## 7. Çıktı Formatı

PR + manifest (slug, varyant de-XX, Sie-test sonucu, hukuki review işareti).
