# Bdimexport Design Tokens — v1.0 (Taslak v0.1 → Nihai)
**Durum:** ✅ ONAYLI — Palet: **Varyant A "Ticaret Güveni"** (insan seçimi) + nihai UX kararları (Step 0.5)
**Akış:** v0.1 taslak (Qwen 3.8 Max) → insan seçim → nihai kararlar (bu sürüm) → Opus 5 kalite pass'i notu ↓
**Uygulama brief'i kaynağı:** agents/design-agent.md §3.3 — Step 0.6 brief'leri bu dosyadan doğar

> **UX KARARLARI (Step 0.5 — nihai, gerekçeli):**
> 1. **Hero düzeni:** sol başlık/sağ görsel (rule-of-thirds) — tr/en/de aynı kalıp; /zh'de simetrik merkez (visual-brand §3)
> 2. **Dil seçici:** navbar sağında dropdown (4+5 varyant sığması için); hreflang setiyle senkron (lib/hreflang.ts)
> 3. **CTA hiyerarşisi:** primary = highlight (amber) dolgu + primary metin; secondary = navy kontur. Amber sayfa başına max 1 primary — dikkat ekonomisi
> 4. **Güven sinyali bandı:** hero altında "Verified Turkish Partner" rozet şeridi (tr'de "Onaylı Türk İş Ortağı") — flywheel'in UI karşılığı
> 5. **/de:** highlight kullanımı %50 azaltılır, rozetler + kanıt metni öne alınır (DACH belirsizlik toleransı düşük)
> 6. **zh varyant:** accent swap kırmızı `#B91C1C` + altın `#D4A017`; sayısal güven vurgusu; 4-sayısı gruplaması yasak
> 7. **Tipografi karar:** Inter + Noto Sans SC tek aile; başlıklarda 600 (700 değil — B2B ciddiyet + okunabilirlik)
> 8. **Karar gerekçeleri Opus 5 pass'inde** teyit edilecek (FAZ_1 ilk sprintte kota 2/3; gerekçe log'una bakılır)

## 1. Renk Paleti — ✅ SEÇİM: Varyant A "Ticaret Güveni"
| Rol | Hex | Kullanım |
| :--- | :--- | :--- |
| primary | `#1A2B4A` (deep navy) | Header, başlıklar, CTA dolgu |
| accent | `#0E7C7B` (teal) | Linkler, ikonlar, vurgu |
| highlight | `#E8A13D` (warm amber) | Primary CTA dolgusu (sayfa başına max 1), rozetler |
| bg | `#FAF8F5` (off-white) | Sayfa arka planı |
| success / warning / danger | `#2E7D32` / `#C77700` / `#C62828` | Form durumları |
| ink / muted | `#1F2937` / `#6B7280` | Gövde metni / ikincil metin |

*(Reddedilen alternatifler — arşiv: B "Endüstriyel" `#0F172A/#2563EB/#F59E0B/#FFF`; C "Anadolu Sıcak" `#3E2723/#C0392B/#D4A017/#FDF6EC`)*

## 2. Tipografi
| Token | Değer |
| :--- | :--- |
| font-sans | Inter (latin) + Noto Sans SC (zh) + Noto Sans Arabic (ar, FAZ 2) — system-ui fallback |
| scale | 12/14/16/18/20/24/30/36/48/60 px (1.25 ratio, taban 16) |
| weight | 400 / 500 / 600 / 700 |
| lh | başlık 1.2 · gövde 1.6 |

## 3. Spacing & Grid
- scale: 4/8/12/16/24/32/48/64/96 px (4px taban)
- container: max-w 1280px, px 16 (mobil) / 24 (md+)
- grid: 12 kolon, gap 24

## 4. Breakpoints (4 — FAZ_0 kabul şartı)
`360` mobil kompakt · `768` tablet · `1280` desktop · `1920` geniş ekran

## 5. Komponent Envanteri (Step 0.6 brief'leri bunlardan doğar)
| Komponent | Varyantlar | Not |
| :--- | :--- | :--- |
| navbar | default / transparent-hero | dil seçici zorunlu (4 dil) |
| hero | home / product / campaign | solda başlık + sağda görsel |
| card | service / product / partner | partner kartında consent kontrolü |
| form | lead / application | KVKK checkbox + Turnstile slot |
| footer | tr / en / de (+Impressum) / zh | dil ailesi linkleri |
| cta | primary / secondary / inline | "Fiil + SLA" metin kuralı (CONTENT_STYLE §5) |
| partner-grid | grid-3 / grid-4 | approved=true filtresi (FAZ 1.7) |
| lang-switcher | dropdown / inline | hreflang alternates ile senkron |

## 6. Locale Varyantları (Step 0.5 UX kararlarıyla sabitlendi — bkz. baştaki karar bloğu)
| Locale | Ayar |
| :--- | :--- |
| tr/en | **Varyant A** (onaylı) |
| **zh** | kırmızı `#B91C1C` + altın `#D4A017` accent swap (Proje.md kırmızı/altın); 4-sayısı görsellerde kaçınılır |
| **de** | soğuk-sade: highlight kullanımı azaltılır, kanıt rozetleri öne çıkar |
| ar (FAZ 2) | Ayna layout; renk aynı |
