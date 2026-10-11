# ROADMAP.md — Faz Planı ve Görev Backlog'u
**Sürüm:** 1.1 | **Tarih:** 08.10.2026 | **Proje:** bdimexport.com
**Amaç:** Proje.md §9 (4 hafta) + mimari.md §10 (Faz 0–7) planlarını orchestrator'ın kuyruğa yazacağı somut görevlere bağlar. Bu dosya = backlog kaynağı (ORCHESTRATION.md §2 tablo 1. satır). Orchestrator her faz başında ilgili bölümü görev dosyalarına böler.

> **⚠️ v2.0:** Yürütücü = **Claude Code** (çok-ajanlı/çok-sağlayıcılı model kaldırıldı). Her faz/adımın modeli **AGENTS.md §7** + her FAZ dosyasının başındaki "Claude Code Yürütme Katmanı" tablosundadır. Bu dosyadaki "Model" sütunları (GLM/Qwen/Gemini/Sonnet…) **tarihseldir** — geçerli değil.
>
> **v1.1:** Faz 0–7 burada özet olarak kalır; **yetkili adım detayı `fazlar/FAZ_0.md … FAZ_9.md` dosyalarıdır** (10 faz: 0–7 + Faz 8 Lansman/Partner Büyütme + Faz 9 Ölçekleme/Sürekli Optimizasyon). Çelişki halinde FAZ dosyası kazanır; bu dosya yalnızca üst plan ve metrik kaynağıdır. Her faz sonu İnsan Onay Kapısı: FAZ dosyasındaki çıkış kriterleri qa-agent raporu + kullanıcının "devam et" talimatı olmadan sonraki faz kuyruğa yazılmaz.

> **Zamanlamayı değil sırayı tanımlar:** Proje.md 4 haftalık tempo hedefidir; kuyruk akışı ORCHESTRATION.md §4.3 sıralama kurallarıyla (depends_on + kilit matrisi) yönetilir.
> **Faz kapama kriteri:** Her fazın "Çıkış kriteri" maddeleri qa-agent tarafından doğrulanmadan sonraki fazın backlog'u kuyruğa yazılmaz.

---

## Faz 0 — Foundation ve Orkestrasyon Kurulumu

**Kapsam:** Repo, tüm orkestrasyon dosyaları, model doğrulama, tasarım sistemi başlangıcı.
**Modeller:** GLM 5.3 (orkestrasyon), Qwen 3.8 Max (taslak) + Opus 5 (tasarım kararı, 1 çağrı).

| Görev (önerilen task ID bloğu: T-0001..) | Agent | Model | depends_on |
| :--- | :--- | :--- | :--- |
| Repo iskeleti: Next.js 15 route groups (tr)(zh)(en)(de) + next-intl + workers/api + db/migrations | fe-agent | Gemini Argon 4 (score 5–6) | — |
| AGENTS.md §7 Kural 1 model ping testi + kayıt defteri güncelleme | orchestrator | GLM 5.3 | — |
| tasks/ dizin yapısı + ilk kuyruk (bu dosya) | orchestrator | GLM 5.3 | — |
| design-tokens.md taslağı | design-agent | Qwen 3.8 Max | — |
| design-tokens nihai UX kararları + hero copy (insan palet onayı ile) | design-agent | Claude Opus 5 (1/3 kota) | tokens taslağı |
| Komponent brief'leri (navbar/hero/kart/form/footer/CTA) | design-agent | Qwen 3.8 Max | tokens nihai |
| GitHub Actions workflow'ları (orchestrator/qa-gate/nightly) | api-agent | Gemini Argon 4 | repo iskeleti |
| D1 şema v1 (partners, leads, contents, rss_news, keywords, ai_jobs, analytics_daily) + migration | api-agent | Claude Sonnet 5.5 (score 7+) → insan review | repo iskeleti |

**Çıkış kriteri:** Model ping'leri yeşil; ilk tam döngü pending→dispatched→accepted; D1 şema migration'ı lokalde koşuyor; design-tokens + komponent brief'leri merge.

## Faz 1 — TR Ana Site + Büyüme Hunisi

**Kapsam:** /ithalat + /ihracat sayfaları, partner başvuru formu (Proje.md §2.2).
**Modeller:** GLM 5.3 (içerik), Sonnet 5.5 (form/güvenlik), Gemini Flash (basit sayfalar).

| Görev | Agent | Model | depends_on |
| :--- | :--- | :--- | :--- |
| /ithalat hizmet sayfaları (tedarik/denetim/lojistik/gümrük) | tr-import-agent | GLM 5.3 | Faz 0 |
| Çin'den ithalat rehber serisi (batch 3) | tr-import-agent | GLM 5.3 | hizmet sayfaları |
| /ihracat hizmet + e-ihracat danışmanlığı sayfaları | tr-export-agent | GLM 5.3 | Faz 0 |
| **Başvuru formu** (Proje.md §2.2 alanları, Turnstile, R2 PDF upload, KVKK checkbox) | tr-export-agent | **Claude Sonnet 5.5 + insan review** | KVKK rıza metni (insan) |
| Partner listeleme bileşeni (D1'den, approved=true) | fe-agent | §3 ağacı | form |
| e2e: başvuru → partners kaydı → admin görünürlük | qa-agent | GLM 5.3 | form + admin iskeleti |

**Çıkış kriteri:** Form uçtan uca çalışıyor; KVKK rızası sunucu tarafı zorunlu; /tr sayfaları 1200+ kelime + schema; ilk gerçek partner başvurusu alınabilir durumda.

## Faz 2 — EN Global + SEO Altyapısı

**Kapsam:** /en iskeleti + 20 ürün sayfası + 5 varyant iskeleti + hreflang/sitemap.
**Modeller:** Gemini Flash (içerik hacmi), Argon 4 (kod), GLM 5.3 (kontrol).

| Görev | Agent | Model | depends_on |
| :--- | :--- | :--- | :--- |
| /en route iskeleti + services sayfaları (5) | en-expert-agent | Gemini Argon 4 | Faz 0 |
| **20 ürün SEO sayfası** (batch 10×2; partner logosu consent filtreli) | en-expert-agent | Gemini Flash üretim + GLM 5.3 kontrol | partner havuzu ≥ 3 onaylı |
| Industries sayfaları (TÜİK verileri görev dosyasından) | en-expert-agent | Gemini Flash | — |
| Varyant iskeletleri /en/{ru,fr,nl,es,ar} + RTL layout | en-l10n-agent | §3 ağacı + Qwen 3.8 (ar) | /en iskelet |
| hreflang/sitemap injection (agent verilerinden) | orchestrator | GLM 5.3 | tüm /en sayfaları |
| llms.txt ilk sürüm | orchestrator | GLM 5.3 | /en sayfaları |

**Çıkış kriteri:** 20 ürün sayfası şablon testlerinden geçiyor; hreflang karşılıklılık + 404 testi temiz; varyant kanal CTA'ları matrisine uyuyor.

## Faz 3 — Admin Panel + API

**Kapsam:** Proje.md §5.1 modülleri. **Modeller:** Sonnet 5.5 (tümü — güvenlik) + insan review.

| Görev | Agent | Model | depends_on |
| :--- | :--- | :--- | :--- |
| Cloudflare Access kurulumu + admin middleware + audit log | admin-agent | Sonnet 5.5 + insan review | Faz 0 |
| Lead Kanban + wa.me/Telegram tek-tık | admin-agent | Sonnet 5.5 | D1 şema |
| Partner CRUD + R2 logo onay akışı | admin-agent | Sonnet 5.5 | Access |
| /api/v1 (leads, partners, contents) + API key + rate limit | api-agent | Sonnet 5.5 (auth) + Argon 4 (sorgular) | D1 şema |
| Analitik Hub (GSC/GA4/Meta çekim cron + Chart.js) | admin-agent | Sonnet 5.5 + Gemini Flash (çekim script'i) | API |

**Çıkış kriteri:** Access'siz /admin 403; tüm modüller e2e; API key hash'li; insan onay kayıtları merge izlerinde.

## Faz 4 — AI İçerik Fabrikası (Tam Otomasyon)

**Kapsam:** Proje.md §5.1 modül 3. **Modeller:** T0/T1 ağırlıklı — en ucuz faz.

| Görev | Agent | Model | depends_on |
| :--- | :--- | :--- | :--- |
| RSS cron script (saatlik fetch + 3 gün TTL) | rss-trends-agent | script (Workers) | Faz 3 admin |
| Trends RSS toplama (geo=TR/RU/DE) | rss-trends-agent | script | RSS cron |
| Batch özet/etiketleme pipeline | rss-trends-agent | Flash-Lite → Workers AI fallback | RSS cron |
| Makale üretim akışı (Input A/B/C → draft) | seo-geo-agent | Gemini Flash + GLM 5.3 kontrol | admin Input UI |
| Draft → onay → yayın akışı (kalıcı: PR, geçici: D1) | orchestrator | GLM 5.3 | admin onay UI |

**Çıkış kriteri:** Saatlik RSS aktif; TTL silme doğrulanmış; ilk makale draft→insan onayı→yayın tam tur; kotasız model kullanımı ledger'da izlenebilir.

## Faz 5 — ZH + DE Tam Yerelleştirme

| Görev | Agent | Model | depends_on |
| :--- | :--- | :--- | :--- |
| /zh izole site (hizmet sayfaları, Baidu meta, WeChat QR) | zh-agent | **Qwen 3.8** | design-tokens zh varyantı |
| /zh kod katmanı (kırmızı-altın layout) | zh-agent/fe-agent | §3 ağacı | zh içerik |
| /de hizmet sayfaları + /de/vertrauen | de-agent | Gemini Flash taslak → **Sonnet 5.5 final** | Faz 2 |
| Impressum + Datenschutz (insan hukuk review'ı) | de-agent | Sonnet 5.5 → **insan** | şirket verileri (insan) |
| Sie/du + RTL + Baidu testleri | qa-agent | GLM 5.3 | her iki site |

**Çıkış kriteri:** /zh Baidu meta tam; /de hukuk onaylı; tüm dil testleri temiz; hreflang setleri güncellendi.

## Faz 6 — Analitik ve Raporlama Otomasyonu

| Görev | Agent | Model |
| :--- | :--- | :--- |
| analytics_daily dolduran cron'lar + dashboard grafikleri | admin-agent | Gemini Flash + Sonnet 5.5 review |
| Keyword motoru (uzun kuyruk → ai_jobs → makale) | seo-geo-agent | Gemini Flash + GLM 5.3 |
| Haftalık insan raporu workflow'u | orchestrator | GLM 5.3 |

## Faz 7 — Public API + Ölçekleme Değerlendirmesi

| Görev | Agent | Model |
| :--- | :--- | :--- |
| api.bdimexport.com v1 stabilizasyon + dış dokümantasyon | api-agent | Argon 4 + insan onayı |
| .cn/Aliyun mirror değerlendirme raporu (301 planı) | orchestrator | GLM 5.3 → insan karar |

---

## Başarı Metrikleri (Proje.md §10 ile hizalı)

| Metrik | Hedef | Kaynak |
| :--- | :--- | :--- |
| SEO sayfası sayısı | 200+ (1 ay hedefi, Proje.md §10) | contents tablosu |
| Onaylı partner havuzu | Faz 2 öncesi ≥ 3, Faz 4 öncesi ≥ 10 | partners |
| Lead dönüşümü | En az 1 kaynak sayfa başına haftalık lead | leads.source_page |
| Token ekonomisi | Cache-hit ≥ %60; retry ≤ %20 (ORCHESTRATION.md §7.3) | token_ledger |
| Maliyet | 50k ziyaretçi + 50k lead/ay'a kadar ~$0 | Cloudflare panel + ledger |
