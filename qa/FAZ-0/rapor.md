# FAZ 0 Çıkış Denetimi — v2.0 (0.10)
**Tarih:** 2026-10-12 | **Denetleyen:** Claude Code (Haiku 5.5, AGENTS.md §7 adım 0.10) | **Kaynak:** FAZ_0_AJAN_PANOSU.md §3 Step 0.10
**Ön koşul (§2, 1–8):** ✅ hepsi işaretli (0.1 ✅\*, 0.3 ✅\*, 0.4 ✅\*, 0.5 ✅, 0.6 ✅\*, 0.7 ✅, 0.8 ✅, 0.9 ✅\*). `✅*` = mevcut ve bu turda yeniden kontrol edildi.

**Sonuç: 8/8 MET** — iki kriter kayıtlı kullanıcı kararıyla "interim" / "altyapı" olarak işaretlendi (aşağıda açıkça etiketli). Çıkış kapısı: "devam et" onayına hazır.

---

## Çıkış kriterleri (8)

| # | Kriter | Sonuç | Kanıt (komut / dosya) |
| :-- | :-- | :-- | :-- |
| 1 | pnpm build yeşil | ✅ MET | `pnpm build` (2026-10-12) → **EXIT=0**; `out/` altında **70 HTML**; `out/sitemap.xml` 18 `<url>`; route'lar: `(tr) (zh) (en) (de) admin` |
| 2 | design-tokens v2.1 + 8 brief merge | ✅ MET | `design/design-tokens.md` başlığı "v2.1 NİHAİ — Varyant A"; `design/components/` içinde navbar, hero, card, form, footer, cta, partner-grid, lang-switcher (8) + `_derived-tokens.md`. Commit `f3fd238` (0.5), `9c4c453` (0.6) |
| 3 | 0001 migration lokalde koşuyor | ✅ MET | Temiz persist dizinine `wrangler d1 migrations apply bdimexport-db --local --persist-to <tmp>` → 4/4 ✅ (`0001_init.sql`, `0002_admin_audit_integrity.sql`, `0002_partners_apply.sql`, `0003_settings.sql`). **Not:** iki dosya `0002` numarasını paylaşıyor (FAZ_3 çıktısı); remote apply öncesi yeniden numaralandırılmalı (0.8 kaydı). |
| 4 | build.yml + qa-gate.yml hazır, orchestrator-cron yok | ✅ MET | `.github/workflows/`: `build.yml`, `qa-gate.yml`, `nightly.yml`, `weekly-report.yml`. `orchestrator.yml` **yok**. nightly/weekly `schedule` satırları yorumda (`#   - cron:`) → devre dışı. qa-gate: build + gitleaks-action + actionlint + d1-schema. Secret: yalnız `${{ secrets.GITHUB_TOKEN }}`. |
| 5 | gitleaks temiz | ✅ MET (interim) | **Kullanıcı kararı (2026-10-12):** binary indirme yok; gerçek secret yok. Kanıt: `git grep -nIE` (AKIA, private key, `sk_live_`, `ghp_`, `xox[baprs]-`, `AIza`) tüm takipli dosyalarda **0 eşleşme**. CI: `qa-gate.yml` → `gitleaks/gitleaks-action@v2` ilk PR'da enforce. **Not:** gitleaks binary'si yerelde çalıştırılmadı; CI koşusu henüz yok — ilk PR'da doğrulanacak. |
| 6 | hero copy 4 dil | ✅ MET (tr/en nihai · de/zh taslak) | `design/hero-copy.md`: TR, EN, DE, ZH bölümleri mevcut, tek batch (Opus, `f3fd238`). DE ve ZH "TASLAK" — nihai pass FAZ 5'te; DE CTA terim çakışması açık (orchestrator/insan kararı). |
| 7 | hreflang helper + sitemap üretiliyor | ✅ MET (altyapı) | **Kullanıcı kararı (2026-10-12):** 0.9 yeniden açılmadı. Helper: `lib/hreflang.ts` K1 (karşılıklılık), K2 (404'a hreflang yok), K3 (dizin eşleşmesi) gömülü. Sitemap: `app/sitemap.ts` → build'de `out/sitemap.xml` (18 `<url>`, yalnız TR). **Tam popülasyon FAZ 1.9 / 2.8 / 5.8'e devredildi:** dil-bazlı `sitemap-index`, sayfa başı karşılıklı hreflang (şu an 5/70 sayfada `<link hreflang>`). |
| 8 | İnsan onayları (0.5 + 0.8) | ✅ MET (kayıt temelli) | 0.5: `design/design-tokens.md` → "👤 insan seçimi, 11.10.2026", Varyant A. 0.8: `FAZ_0_AJAN_PANOSU.md` §4 → "👤 İNSAN REVIEW ONAYLI" (commit `eeac7e3`/`e6a5b7d`). Onayın kendisi sohbette verildi; bu denetim yalnızca kaydı doğrulayabilir. |

---

## FAZ 1 / 2 / 3'e devredilen bulgular

Kural 3 (hardcoded renk/hex yasak) ihlali. FAZ 0 kapsamı dışı; düzeltme ilgili fazın adımında yapılacak. Tarama: `grep -rnE '#[0-9A-Fa-f]{6}\b|#[0-9A-Fa-f]{3}\b' app lib/ui` (tokens hariç), 2026-10-12.

| Faz / adım | Dosya | Satırlar | Adet |
| :-- | :-- | :-- | :-- |
| **FAZ 1.6** (başvuru formu) | `app/components/ApplicationForm.tsx` | 67, 74, 84, 93, 102, 103, 133, 143, 147, 163, 166 | 11 satır |
| **FAZ 1.7** (partner listesi) | `app/components/PartnerGrid.tsx` | 38, 42, 47, 52, 54 | 5 satır |
| **FAZ 3** (admin) | `app/admin/content/ContentFactory.tsx` | 26, 27, 28, 29, 129, 134, 159 | 7 satır |
| **FAZ 3** (admin) | `app/admin/analytics/page.tsx` | 79 (`var(--a-accent, #3b82f6)` — fallback hex) | 1 satır |
| **FAZ 2.4** (industries) ⚠️ | `app/(en)/industries/page.tsx` | 53, 56, 57, 59, 65, 67, 70, 78, 87, 110, 111, 125, 137, 146, 158, 170, 171, 175, 191, 192, 209, 213, 221, 231, 244, 245 | 26 satır |
| **FAZ 2.4** (industries) ⚠️ | `app/(en)/industries/[slug]/page.tsx` | 512, 522, 523, 525, 531, 533, 537, 540, 548, 557, 578, 582, 586, 599, 600, 601, 614, 624, 630, 639, 640, 654, 660, 675, 676, 689, 695, 704, 721, 722, 731, 737, 748, 749, 751, 767, 771, 779, 789, 810, 811, 827, 828 | 43 satır |

**⚠️ Not:** `app/(en)/industries/` dizini kullanıcının listesinde yoktu. FAZ 2.4 (industries) kapsamında olduğu için buraya eklendi. Atama yanlışsa söyle, yeniden sınıflandırırım. Toplam: **93 satır**, dört faz / üç dosya grubu.

---

## Açık kalemler (kapıyı engellemez, takip edilecek)

1. **[Kriter 5] CI ilk koşusu:** gitleaks-action ilk PR'da doğrulanacak.
2. **[Kriter 7] Tam sitemap / hreflang:** FAZ 1.9 / 2.8 / 5.8.
3. **[Kriter 3] 0002 numara çakışması:** remote ilk apply öncesi (0.8 kaydı).
4. **[Kriter 6] DE CTA terim çakışması:** I18N_RULES §3.2 vs cta.md — orchestrator + insan kararı, FAZ 5.4 öncesi.
5. **Nightly/weekly v1 kalıntısı:** `weekly-report.yml` içinde `GLM_API_KEY` / `token_ledger.json` (FAZ 6.4'te temizlenecek).

---

## Karar

**8/8 MET (2 kriter etiketli).** 0.10 ✅ olarak işaretlendi; "devam et" onayı kullanıcıdan bekleniyor.

---

<details>
<summary>Tarihsel: v1 denetimi (08.10.2026, GLM 5.3 qa-agent, T-0010) — geçersiz</summary>

Eski denetim 8/8 PASS vermişti (orchestrator/GLM döngüsü, task_queue ve token_ledger tabanlı). v2.0 ile bu kanıt zinciri (ping, ledger, T-0011 döngüsü) kaldırıldığı için bu raporun yerine geçmez. Eski iddialardan yalnızca dosya-düzeyi olanlar yukarıda yeniden doğrulandı.

</details>
