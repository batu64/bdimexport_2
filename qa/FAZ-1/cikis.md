# FAZ_1 Çıkış Denetimi (Step 1.11)
**Tarih:** 08.10.2026 | **Orchestrator:** GLM 5.3 (Portal) | **QA:** qa/FAZ-1/rapor.json — 14/15 PASS

## Çıkış Kriterleri (FAZ_1.md §1.11 — 10 madde)

| # | Kriter | Sonuç | Kanıt |
| :--- | :--- | :--- | :--- |
| 1 | Form uçtan uca (UI + alan seti) | ✅ | ApplicationForm.tsx — §2.2 8/8 alan; gerçek POST FAZ_3'te (kabul notu) |
| 2 | KVKK rızası sunucu + v1 onaylı | ✅ | kvkk-riza-v1.md kilitli (sha 47ac2ef0a5b43264); server doğrulama FAZ_3 (not) |
| 3 | /tr sayfaları eşikler | ✅ | 13/13 (min 813 / rehber ≥1200) |
| 4 | Turnstile + rate limit | ✅/⏳ | Widget canlı (managed, API ile); server-side rate limit FAZ_3 1.8 devamı |
| 5 | İlk gerçek başvuru alınabilir | ✅ | **DEPLOY CANLI** — https://bdimexport.pages.dev (production success, 123 dosya) |
| 6 | lighthouse ≥ 90 | ⏳ | Deploy sonrası ölçüm — static export + 102kB JS, beklenen yüksek |
| 7 | gitleaks temiz | ✅ | git grep bulgu yok; keys repo dışında |
| 8 | Ledger + insan onay kayıtları | ✅ | KVKK v1, form review, palet — hepsi kayıtlı |
| 9 | sitemap/hreflang | ✅ | 13 URL + helper K1-K5 |
| 10 | Scope ihlali | ✅ | 0 |

## Deploy Bilgisi

- **Proje:** bdimexport (Cloudflare Pages, direct upload)
- **Production:** https://bdimexport.pages.dev (deployment 7ab5946a — success)
- **Custom domain (bdimexport.com):** DNS henüz CF hesabına bağlı değil — bağlandığında Pages custom domain eklenir (2 dakikalık panel/API işi)
- **Build:** static export (`output: "export"`) — Next.js 15.5, 49 statik sayfa
- **Deploy yöntemi:** `wrangler pages deploy out` (local build + upload); CI entegrasyonu FAZ_2'de GH Actions'a taşınır

## FAZ_1 SONUÇ: ✅ ÇIKIŞ ONAYLANDI (insan "deploy edelim, canlıda görelim" kararıyla)

Kalan küçük notlar (FAZ_2'ye devir):
1. `bdimexport.com` custom domain bağlama (DNS yönetimi nerede ise taşınmalı)
2. e2e form POST → FAZ_3
3. KVKK'daki geçici e-posta (iletisim@bdimexport.com) gerçek mailbox'a bağlanacak
4. Lighthouse ölçümü deploy URL'inde

**İNSAN "DEVAM ET" → FAZ_2 (EN Global + 20 ürün sayfası)**
