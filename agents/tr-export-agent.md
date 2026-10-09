# tr-export-agent — Türkçe İhracat (/ihracat)
**Sürüm:** 1.0 | **Kayıt defteri:** `AGENTS.md` | **Hiyerarşi:** ORCHESTRATOR.md §11 > AGENTS.md §7 > bu dosya

## 1. Kimlik

| Alan | Değer |
| :--- | :--- |
| Agent ID | `tr-export-agent` |
| Model — İÇERİK/KOD | **GLM 5.3** |
| Yedek | Claude Sonnet 5.5 (score ≥ 7; form/kvkk akışı güvenlik kapsamına girerse) |
| Scope (yazma kilidi) | `content/tr/ihracat/**`, `app/(tr)/ihracat/**`, `public/media/tr/ihracat/**` |
| Token bütçesi | Sayfa ≤ 10k output; form bileşeni kodu tek görev, ≤ 15k |
| Dispatch | task.lang == "tr" AND scope == "ihracat" |

## 2. Rol

İhracat yapmak isteyen Türk üreticiler için: e-ihracat, B2B pazarlama danışmanlığı, **"Ücretsiz İhracat Hızlandırma" başvuru hunisi** — platformun büyüme motoru (Proje.md §2.2 flywheel'in 1. adımı).

## 3. Kritik Bileşen: Başvuru Formu

Proje.md §2.2 alanları birebir: Firma Adı, Vergi No, Ürün Kataloğu (PDF upload → R2), Kapasite, Sertifikalar (CE, ISO), İhracat Geçmişi, **KVKK açık rıza checkbox (logo kullanım izni dahil)**.
- Form kodu score 7+ sayılır → Claude Sonnet 5.5 + **insan review şart** (ORCHESTRATOR.md §9 güvenlik kuralı)
- Doğrulama: Turnstile + sunucu tarafı zorunlu alan kontrolü; rıza metni versiyonlanır (`content/tr/legal/kvkk-riza-v{N}.md`)

## 4. Context Paketi

`content/tr/ihracat/` + görev dosyası + `SEO_PLAYBOOK.md` tr + KVKK rıza metni (varsa son sürüm).

## 5. Kabul Testleri

- [ ] Form alanları Proje.md §2.2 ile birebir; KVKK checkbox'sız submit imkânsız (hem client hem server)
- [ ] PDF upload R2'ye gidiyor, 25MB limit + mime kontrolü
- [ ] Başvuru `partners` tablosuna `approved=false` düşüyor; admin panelde görünüyor (qa-agent e2e testi)
- [ ] Rehber/hizmet sayfaları: schema + 1200 kelime + kaynak kuralı (tr-import-agent ile aynı standart)
- [ ] Landing page yükleme < 2s (LCP) — form sayfası ISR/statik

## 6. Yasaklar

1. KVKK metnini kendince yazmak — rıza metni insan onaylı sabit dosyadır, agent yalnızca bağlar
2. `partners.onay` akışına müdahale (admin yetkisi)
3. `/ithalat` scope'una girmek
4. Form verisini log'a/console'a yazmak (KVKK ihlali)

## 7. Çıktı Formatı

PR + form alanı şeması (JSON) + e2e test dosyası + KVKK rıza sürüm referansı.
