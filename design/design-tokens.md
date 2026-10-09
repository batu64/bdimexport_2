# Bdimexport Design Tokens — Taslak v0.1 (Qwen 3.8 Max Brief-First Akışı, Step 0.4)
**Durum:** ⚠️ İNSAN ONAYI BEKLİYOR (FAZ_0 Step 0.5 — Opus 5 nihai karar + senin palet seçimin)
**Kaynak kurallar:** agents/design-agent.md §3.1 · prompts/visual-brand.md §1 (palet tutarlılığı)

## 1. Renk Paleti — 3 Varyant Seçeneği (Step 0.5'te BİRİ seçilecek)

### Varyant A — "Ticaret Güveni" (önerilen; visual-brand.md ile birebir)
| Rol | Hex | Kullanım |
| :--- | :--- | :--- |
| primary | `#1A2B4A` (deep navy) | Header, başlıklar, CTA dolgu |
| accent | `#0E7C7B` (teal) | Linkler, ikonlar, vurgu |
| highlight | `#E8A13D` (warm amber) | CTA vurgusu, rozetler |
| bg | `#FAF8F5` (off-white) | Sayfa arka planı |
| success / warning / danger | `#2E7D32` / `#C77700` / `#C62828` | Form durumları |
| ink / muted | `#1F2937` / `#6B7280` | Gövde metni / ikincil metin |

### Varyant B — "Endüstriyel"
primary `#0F172A` · accent `#2563EB` · highlight `#F59E0B` · bg `#FFFFFF` — daha soğuk, teknoloji havası
### Varyant C — "Anadolu Sıcak"
primary `#3E2723` · accent `#C0392B` · highlight `#D4A017` · bg `#FDF6EC` — sıcak, yerel üretici havası (ithalat hunisinde daha samimi)

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

## 6. Locale Varyantları (tek Opus çağrısında toplu karar bekliyor)
| Locale | Ayar |
| :--- | :--- |
| tr/en | Varyant A/B/C (insan seçimi) |
| **zh** | kırmızı `#B91C1C` + altın `#D4A017` accent swap (Proje.md kırmızı/altın); 4-sayısı görsellerde kaçınılır |
| **de** | soğuk-sade: highlight kullanımı azaltılır, kanıt rozetleri öne çıkar |
| ar (FAZ 2) | Ayna layout; renk aynı |
