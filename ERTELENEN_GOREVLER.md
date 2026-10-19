# ERTELENEN GÖREVLER — Proje Sonu Kontrol Listesi
**Proje:** bdimexport.com | **Amaç:** Projenin ilerleyişini **doğrudan etkilemeyen**, en sonda tek seferde yapılabilecek adımlar burada toplanır. Bir işi ertelediğimizde buraya not düşülür; **proje sonunda bu liste tek tek gözden geçirilir.**

> Kural: Bir adım bir fazın çıkışını bloklamıyorsa ve en sonda yapılabilecekse → buraya. Her kayıt: **konu · faz · neden ertelendi · ne zaman · durum.**

---

## 🔴 Güvenlik (ertelenebilir ama uzatma)

| # | Konu | Neden | Ne zaman | Durum |
| :-- | :-- | :-- | :-- | :-- |
| S1 | **İfşa olan Cloudflare API token + R2 Secret Access Key rotasyonu** | Sohbette ekran görüntüsüyle ifşa oldu (2026-10-17) | **En kısa sürede** (güvenlik) | ⏳ bekliyor |

---

## 🟡 Altyapı / Entegrasyon (proje sonu)

| # | Konu | Faz | Neden ertelendi | Ne zaman |
| :-- | :-- | :-- | :-- | :-- |
| E1 | **Cloudflare Access — Google login (edge auth)** | 3.1/3.9 | Google login akışında `ERR_CONNECTION_RESET`; routing+deploy+statik admin SAĞLAM, reset sadece login handshake'te. Admin backend henüz Pages'e bağlı değil → kullanılmıyor, ilerlemeyi engellemiyor. | Proje sonu — muhtemelen **custom domain (bdimexport.com)** bağlanınca + Google IdP test |
| E2 | **Custom domain bdimexport.com → Pages bağlama** | 3.9/8 | Şimdilik `bdimexport.pages.dev` yeterli; Access de custom domainde temiz çalışır | Lansman öncesi (FAZ 8) |
| E3 | **Runtime AI = Gemini** (içerik fabrikası 4.5, RSS özet 4.4, keyword 6.3, görsel 2.6) | 2.6/4/6 | AGENTS.md §9 tasarım kararı: tüm geliştirme Claude Code ile, Gemini en sonda tek seferde | **Proje sonu** (AGENTS.md §9) |
| E4 | **GSC/GA4/Meta OAuth** (analitik canlı veri) | 3.7 | Trafik + GSC/GA4 property yok → anlamlı veri çekilemez | FAZ 6 (analitik fazı) |
| E5 | **Mail provider (Resend/Brevo) secret + entegrasyon** | 3.9/8 | E-posta gönderimi (partner davet/lead bildirim) FAZ 8'de başlar | FAZ 8 |
| E6 | **R2 `bdimexport-backups`: private teyit + 90 gün lifecycle** | 3.9 | Dashboard işi, kolay | Yakında (kısa) |

---

## 🟢 İçerik / Uyum (ilgili faza)

| # | Konu | Faz | Neden ertelendi | Ne zaman |
| :-- | :-- | :-- | :-- | :-- |
| C1 | **/v1/leads endpoint** (public, PII) | 3.4 | EN/DE GDPR rıza metni + çağıran form hazır değil | FAZ 5 (Datenschutz) civarı |
| C2 | **KVKK rıza metni placeholder'ları** (adres / e-posta) | 1.1 | Gerçek şirket verisi insan tarafından sonra girilecek | Form canlıya alınmadan önce (FAZ 8 öncesi) |
| C3 | **Lead saklama süresi (365 gün) kesinleştirme + otomatik silme cron** | 3.3/4 | KVKK metnindeki saklama süresiyle eşitlenecek | FAZ 4 bakım cron'u |
| C4 ✅ | ~~**RSS kaynak CRUD kalıcı depolama**~~ (4.1: `settings.rssSources` + cron-rss, 2026-10-19) | 3.6 | İçerik fabrikası arayüzü mock; gerçek depolama FAZ 4 hattında | FAZ 4.1 |
| C5 | **Lighthouse canlı ölçüm (≥90)** | 2/8 | Canlı URL + gerçek ortam gerek | FAZ 8.1 lansman denetimi (canlı URL / PageSpeed) |
| C6 | **/en/{ru,fr,nl,es,ar} varyant tam içeriği** (şu an iskelet) | 2.5 | Tasarım gereği FAZ 2 iskelet; tam çeviri FAZ 5 | FAZ 5 |

---

## ⚪ Temizlik (opsiyonel)

| # | Konu | Neden | Ne zaman |
| :-- | :-- | :-- | :-- |
| T1 | Stray `bdimexport` D1 (`d0a18e47…`) + `bdimexport` R2 bucket silme | Erken denemeden kalma; config kullanmıyor | Karışıklık olmasın diye uygun bir zamanda |
| T2 | `.tmp_board.py`, `tsconfig.tsbuildinfo` → `.gitignore` | Geçici/artefakt | Repo hijyeni |

---

## Kullanım
- Yeni bir erteleme çıktığında: uygun bölüme bir satır ekle (konu · faz · neden · ne zaman).
- **Proje sonunda:** bu listeyi yukarıdan aşağı gez; S (güvenlik) → E (altyapı) → C (içerik) → T (temizlik) sırasıyla kapat.
- Bir madde yapıldığında satırın başına ✅ koy veya sil.

_Son güncelleme: 2026-10-17 — Google login (E1) ertelendi; birikmiş ertelemeler toplandı._
