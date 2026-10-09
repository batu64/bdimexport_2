# FAZ_1 QA Turu Raporu (Step 1.10)
**Tarih:** 08.10.2026 | **Denetleyen:** qa-agent (GLM 5.3 / Portal) | **Detay:** qa/FAZ-1/rapor.json

## Sonuç: 12/15 PASS — 3 madde insan adımı bekliyor (fail DEĞİL, pending)

## Geçen testler (12)

| Test | Kanıt |
| :--- | :--- |
| Build | pnpm build geçti — 49 sayfa prerender (terminal doğrulaması) |
| Kelime eşikleri 13/13 | min 813 (eşik 800) · rehberler 1208–1328 (eşik 1200) |
| Meta desc 120–158 | 13/13 |
| FAQ ≥ 5 | 13/13 |
| İç link ≥ 2 | retry sonrası 13/13 (gumruk/e-ihracat/b2b/program'a ikinci link eklendi) |
| Turnstile entegrasyonu | site key env + script yükleme; secret kodda YOK (~/.bdimexport-secrets/turnstile.md) |
| Secret scan | git grep — bulgu yok |
| Sitemap FAZ_1 URL | 13 URL enjekte |
| Form alanları §2.2 | 8/8 birebir |
| KVKK + logo ayrı checkbox | iki ayrı rıza alanı |
| hreflang K1–K5 | helper gömülü (404-yasağı dahil) |
| PartnerGrid consent filtresi | consent=false → logo render edilmez |

## İnsan adımı bekleyenler (3)

1. **KVKK v1 onayı** — `content/tr/legal/kvkk-riza-v0.1-draft.md` içindeki [TAMAMLA] alanları (firma adı/adres/e-posta) + hukuki onay → v1 kilit. **FAZ_1 çıkışının tek engeli bu.**
2. **Form insan review** — `app/components/ApplicationForm.tsx` incelenmesi (T-0016)
3. **e2e form submit (gerçek)** — endpoint FAZ_3'te; FAZ_1'de UI-only kabul edildi (ortam notu: gerçek e2e FAZ_3 3.4'te Playwright ile koşulur)

## Retry geçmişi (şeffaf kayıt)

İlk üretimde kelime eşikleri aşılamamıştı → 3 retry turu (içerik genişletme + meta desc düzeltme + iç link ekleme) → tüm testler geçti. Kayıtlar task_queue.json attempts alanında.

## Karar

Teknik adımlar tamam; FAZ_1 çıkışı **yalnızca 2 insan onayına** bağlı (KVKK v1 + form review). Onaylar gelince 1.11 çıkış kapısı açılır: deploy kararı (öneri: erken deploy) + FAZ_2'ye geçiş.
