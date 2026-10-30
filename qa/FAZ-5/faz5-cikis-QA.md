# FAZ 5 — Çıkış QA (5.9) + Kapanış Denetimi

**Tarih:** 2026-10-30 · **Yürütücü:** Opus 4.8 (orchestrator) · **Dal:** `tasks/faz0-progress-panel`
**Kapsam:** ZH + DE içerik fazının çıkış kontrolü. 5.1 (/de hukuk) kullanıcı kararıyla **ertelendi** (C8 — lansman blokörü); 5.7 /zh kültür onayı **kullanıcı tarafından verildi** (Çince okur).

---

## 1. Deterministik geçitler (yeniden çalıştırılabilir)

| Geçit | Komut | Sonuç |
| :-- | :-- | :-- |
| Lint | `pnpm lint` | ✅ temiz |
| Build (static export) | `NEXT_DIST_DIR=.next-build pnpm build` | ✅ 88 URL (sitemap), hata 0 |
| Varyant smoke | `node lib/ui/variants.smoke.test.mjs` | ✅ 7/7 pass, 0 fail |
| Dil kalite turu (5.7) | `node qa/FAZ-5/dil-kalite.mjs` | ✅ 22 kontrol · ✅19 ⚠️3 ❌0 |
| DE içerik | `node qa/FAZ-5/de-content-check.mjs` | ✅ 6/6 · kırmızı 0 (kelime ≥1200, Sie, UWG temiz, FAQ 6) |
| ZH içerik | `node qa/FAZ-5/zh-content-check.mjs` | ✅ 5/5 · kırmızı 0 · sözlük uyuşmazlığı 0 (≤3) |
| Hardcoded hex (token dışı) | `git grep -nE "#[0-9a-fA-F]{3,6}" app/**/*.css lib/ui/**/*.css` | ✅ 0 |

> ⚠️3 (dil-kalite): §3.1 "Frachtlogistik" (B2 — koru) · de WhatsApp yok (B3 → FAZ 8) · `_yok` lang/dir (B4 → T3). B1 (hero-copy ⚠️) 5.8'de kapandı → 4'ten 3'e düştü. Kırmızı bulgu 0.

## 2. hreflang / sitemap (5.8) doğrulaması

- **9/9 ana sayfa tam karşılıklı:** `tr · x-default · zh-CN · en · de · en-RU/FR/NL/ES/AR` — x-default=tr (SEO_PLAYBOOK §1 / Proje.md:47).
- **Dangling hreflang 0** (her hreflang href'inin sitemap'te `<loc>` karşılığı var — 404-hreflang yasağı sağlandı).
- Sitemap 88 URL: /de (hub+5 Leistungen+vertrauen+anfrage) + /zh (hub+5 hizmet) eklendi; noindex liste sayfaları (ratgeber/insights) dışarıda.
- de+zh `<head>`: hreflang tam set + self-canonical render ediliyor.

## 3. İçerik özeti (bu fazda üretilen)

| Dil | Üretilen | Durum |
| :-- | :-- | :-- |
| /zh | 5 hizmet (本地销售/市场推广/公司设立/物流与清关/产品合规) + Baidu meta + WeChat davranışı + insights shell | ✅ · 👤 kültür onayı **verildi** (kullanıcı Çince okur) |
| /de | 5 Leistung (Beschaffung/Lohnfertigung/Werksprüfung/Logistik/Zollabwicklung) + vertrauen + DSGVO anfrage (çift opt-in iskelet) + ratgeber shell | ✅ içerik · ⏸ **Impressum/Datenschutz metni = C8 (ertelendi)** |

## 4. Açık / ertelenen (ERTELENEN_GOREVLER.md)

| Kayıt | Konu | Neden |
| :-- | :-- | :-- |
| **C8** 🔴⚖️ | /de Impressum + Datenschutz metni + hukuk imzası | Kullanıcı şirket verisini sonra verecek · **LANSMAN BLOKÖRÜ (FAZ 8)** — /de metin olmadan yayına/indekse alınamaz |
| C2 | KVKK rıza metni placeholder (adres/e-posta) | Gerçek veri sonra (C8 ile birlikte) |
| B3 | /de WhatsApp numarası | Gerçek numara FAZ 8 kanal ops |
| T3 | 9 `_yok` 404 lang/dir | noindex+linksiz, ihmal edilebilir |
| T4 | TİM 13,1 mlr ikincil kaynak | Lansman denetiminde birincil link |
| E9 | Baidu canlı doğrulama | custom domain (E2) sonrası |

## 5. Sonuç

**FAZ 5 içerik/kod işi TAMAM.** Kırmızı bulgu 0; build/lint/smoke/içerik geçitleri yeşil; hreflang 4 dil tam karşılıklı. Kalan tek **hukuki** iş (C8) kullanıcı kararıyla ertelendi ve **FAZ 8 lansman blokörü** olarak kayıt altında — /de bu metin girilmeden yayına alınmayacak.

**5.10 (imza):** /zh kültür ✅ (kullanıcı) · /de hukuk ⏸ (C8, FAZ 8 öncesi). **5.11 (çıkış):** ✅ onaylandı — FAZ 6'ya geçiş.
