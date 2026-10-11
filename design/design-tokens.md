# Bdimexport Design Tokens — v2.1 NİHAİ (Step 0.5)
**Durum:** ✅ ONAYLI — Palet: **Varyant A "Ticaret Güveni"** (👤 insan seçimi, 11.10.2026). Bu dosya **tüm projenin görsel kalıbıdır**; değişiklik yalnızca insan onaylı yeni sürümle.
**Scope / model:** `design/**` · Opus 5.5 (AGENTS.md §7, adım 0.5) · **Önceki:** v2.0 taslak (`2e0c0be`, 3 varyant) → bu sürüm. Elenen B/C varyantları git geçmişinde (`2e0c0be` §1.2–§1.3); bu dosyada arşivlenmez.
**Kod karşılığı:** `lib/ui/tokens.ts` + CSS değişkenleri `--c-<rol>` (mevcut adlandırma). Komponentlerde hardcoded hex/px **yasak**; yalnızca token.

---

## 0. Tokens Diff (v2.0 taslak → v2.1 nihai)

| # | Değişiklik | Önce | Sonra | Kod etkisi |
| :-- | :-- | :-- | :-- | :-- |
| D1 | Palet seçimi | A / B / C | **A** onaylı; B, C kaldırıldı | Yok (`tokens.ts` zaten A) |
| D2 | `warning` değeri | `#C77700` | **`#A15F00`** | `tokens.ts`'te yok → eklenecek (fe) |
| D3 | Yeni: `accent-on-dark` | — | **`#5FD3CF`** | eklenecek (fe) |
| D4 | Yeni: `border-strong` | — | **`#8A8478`** | eklenecek (fe) |
| D5 | Yeni: `on-dark` / `on-dark-muted` | hero.md'de serbest "`bg`/80" | **`bg`** / **`bg` @ %80** adlandırıldı | eklenecek (fe) |
| D6 | Yeni: `focus-ring` (açık/koyu) | — | **`accent`** / **`highlight`** | eklenecek (fe) |
| D7 | Kural: CTA metni | örtük | **highlight üstünde metin daima `primary`; beyaz YASAK** | Mevcut kod uyumlu |
| D8 | Kural: /zh kırmızısı | zemin belirtilmemiş | **yalnızca açık zemin**; koyu `primary` üstünde altın | — |
| D9 | §1.2–§1.3, §2 B/C sütunları, §7 seçim planı, §8 karar | taslak | silindi (karar verildi) | — |

Tipografi (§3), spacing/grid (§4), breakpoint (§5), komponent envanteri (§6) **taslaktan değişmeden** nihaileşti.

---

## 1. Renk — Varyant A "Ticaret Güveni" ✅

### 1.1 Temel roller
| Rol (`--c-*`) | Hex | Kullanım |
| :-- | :-- | :-- |
| `primary` | `#1A2B4A` | Header, başlıklar, koyu hero zemini, secondary CTA kontur/metin, CTA metni |
| `accent` | `#0E7C7B` | Linkler, ikonlar, vurgu (yalnızca açık zeminde) |
| `highlight` | `#E8A13D` | Primary CTA dolgu (sayfa başına max 1), rozet |
| `bg` | `#FAF8F5` | Sayfa zemini |
| `surface` | `#FFFFFF` | Kart, form alanı |
| `border` | `#E5E1DA` | **Dekoratif** ayırıcı (bilgi taşımayan çizgi) |
| `border-strong` | `#8A8478` | **Input/checkbox kenarlığı**, bilgi taşıyan sınır |
| `ink` | `#1F2937` | Gövde metni |
| `muted` | `#6B7280` | İkincil metin |
| `success` / `warning` / `danger` | `#2E7D32` / `#A15F00` / `#C62828` | Form durumları (metin + ikon) |

### 1.2 Koyu zemin rolleri (hero `home`/`campaign`, footer)
| Rol | Değer | Kullanım |
| :-- | :-- | :-- |
| `on-dark` | = `bg` | `primary` zemin üstünde başlık/gövde |
| `on-dark-muted` | `bg` @ %80 opaklık | Hero alt başlığı |
| `accent-on-dark` | `#5FD3CF` | `primary` zemin üstünde link/ikon |
| `focus-ring` | açık zeminde `accent`, koyu zeminde `highlight`; 2px kalınlık + 2px offset | Klavye odağı (tüm etkileşimli öğeler) |

### 1.3 Kontrast kanıtı (WCAG 2.2, hesaplanmış — relatif luminans formülü)
| Çift | Oran | Eşik | Durum |
| :-- | :-- | :-- | :-- |
| ink / bg · ink / surface | 13.85 · 14.68 | 4.5 | ✅ |
| primary / bg | 13.31 | 4.5 | ✅ |
| accent / bg · accent / surface | 4.73 · 5.01 | 4.5 | ✅ |
| muted / bg · muted / surface | 4.56 · 4.83 | 4.5 | ✅ |
| primary metin / highlight dolgu (CTA) | 6.45 | 4.5 | ✅ |
| on-dark / primary · on-dark-muted / primary | 13.31 · 9.04 | 4.5 | ✅ |
| accent-on-dark / primary | 7.86 | 4.5 | ✅ |
| success · warning · danger / surface | 5.13 · 5.06 · 5.62 | 4.5 | ✅ |
| success · warning · danger / bg | 4.84 · 4.77 · 5.30 | 4.5 | ✅ |
| border-strong / surface (non-text) | 3.72 | 3.0 | ✅ |
| focus: accent / bg · highlight / primary (non-text) | 4.73 · 6.45 | 3.0 | ✅ |
| **Yasak çiftler** | beyaz/highlight **2.19** · accent/primary **2.81** · eski warning/surface **3.46** · border/surface **1.30** (input için) | — | ❌ kullanılmaz |

---

## 2. Locale Varyantları (A üzerine)

### 2.1 /zh — kırmızı-altın
`primary`, `bg`, `surface`, `ink`, `muted` A'dan gelir; yalnızca accent/highlight swap edilir.
| Rol | Hex | Kontrast |
| :-- | :-- | :-- |
| `accent` (kırmızı) | `#B91C1C` | bg 6.10 · surface 6.47 ✅ — **koyu primary üstünde 2.18 ❌ → kullanılmaz** |
| `highlight` (altın) | `#D4A017` | primary metin 5.94 ✅ (CTA) |
| `accent-on-dark` | = altın `#D4A017` | primary üstünde 5.94 ✅ |

Kurallar: hero **simetrik merkez**; sayısal güven (rakam öne); **4-sayısı gruplaması yasak** (3 veya 5–6 kart); ICP vaadi yok.

### 2.2 /de — güven odaklı, sade
| Rol | Hex | Kontrast |
| :-- | :-- | :-- |
| `highlight` (muted) | `#C98A2B` | primary metin 4.81 ✅ |
| `trust-badge-bg` / `trust-badge-ink` | `#E6F2F1` / `#0B6665` | 5.91 ✅ |

Kurallar: highlight yalnızca primary CTA'da (rozet/vurgu dolgusu yok); rozet + kanıt metni öne; formal Sie; Impressum/Datenschutz footer'da; oyuncu/duygusal görsel yok.

### 2.3 /en/ar
Renk değişmez; `dir="rtl"` + mantıksal CSS (margin-inline vb.) ile ayna layout. Font: Noto Sans Arabic.

---

## 3. Tipografi
| Token | Değer |
| :-- | :-- |
| font-sans | Inter (latin) · Noto Sans SC (zh) · Noto Sans Arabic (ar) · fallback `system-ui, sans-serif` |
| Ölçek (px / rem @16) | 12 `.75` · 14 `.875` · 16 `1` · 18 `1.125` · 20 `1.25` · 24 `1.5` · 30 `1.875` · 36 `2.25` · 48 `3` · 60 `3.75` |
| Rol eşlemesi (mobil → masaüstü) | H1 36→60 · H2 30→48 · H3 24→36 · H4 20→24 · gövde 16 · küçük 14 · caption 12 |
| Weight | 400 gövde · 500 etiket · 600 başlık (700 yalnızca stat rakamı) |
| Line-height | başlık 1.2 · gövde 1.6 · caption 1.4 |
| Okuma ölçüsü | `72ch` |

## 4. Spacing & Grid
- Spacing ölçeği (4px taban): **4 / 8 / 12 / 16 / 24 / 32 / 48 / 64 / 96** px
- Container: max-width **1280px**; yan boşluk 16px (360) / 24px (768+)
- Grid: **12 kolon**, gap 24px (360'ta 4 kolon/gap 16, 768'de 8 kolon/gap 24)
- Radius: 8px (kart/CTA/input) · 999px (rozet) · Dokunma alanı min **44×44px**
- Elevation: 0 (düz) · 1 `0 1px 3px` · 2 `0 4px 12px` (renk: ink %8–12 alfa)

## 5. Breakpoint'ler
| Ad | Min genişlik | Kolon | Davranış |
| :-- | :-- | :-- | :-- |
| **xs / mobil** | 360 | 4 | tek sütun, hamburger navbar, dil seçici menü içinde |
| **md / tablet** | 768 | 8 | 2 sütun kartlar, navbar yatay (kısaltılmış) |
| **lg / desktop** | 1280 | 12 | hero 2 kolon (metin 5/12, görsel 7/12), tam navbar |
| **xl / geniş** | 1920 | 12 | container 1280'de sabit; partner-grid 4 kolon (/zh hariç — §2.1) |

Mobile-first (min-width sorguları).

## 6. Komponent Envanteri (8)
| # | Komponent | Varyantlar | Not |
| :-- | :-- | :-- | :-- |
| 1 | navbar | default · transparent-hero | dil seçici zorunlu; sticky; mobil hamburger |
| 2 | hero | home · product · campaign (+ zh simetrik) | metin + görsel; altında güven bandı |
| 3 | card | service · product · partner | partner kartında `consent_logo_en` kontrolü |
| 4 | form | lead · application | KVKK checkbox + Turnstile slot; kenarlık `border-strong` |
| 5 | footer | tr · en · de (+Impressum) · zh | koyu zemin → §1.2 rolleri |
| 6 | cta | primary · secondary · inline | highlight dolgu + primary metin; sayfa başına max 1 primary |
| 7 | partner-grid | grid-3 · grid-4 (1920) | `approved=true` filtresi; boş durum metni |
| 8 | lang-switcher | dropdown · inline | hreflang seti ile senkron |

---

## 7. Karar Gerekçeleri (her biri ≤ 10 satır)

**K1 — Varyant A seçimi.**
İnsan seçimi (11.10.2026). Lacivert + teal TR/EN/DE'de nötr, kurumsal-güvenli; /zh kırmızısıyla ve /de sade tonuyla en net ayrışan baz.
Kod (`tokens.ts`) ve görsel prefix (`visual-brand.md` §1) zaten A → sıfır geçiş maliyeti, görsel tutarlılık riski yok.
B'deki surface AA ihlali ve C'deki /zh akrabalığı riskleri bu seçimle ortadan kalktı.

**K2 — `warning` `#C77700` → `#A15F00`.**
Eski değer metin olarak AA'yı geçmiyordu (surface 3.46, bg 3.27). Form hata/uyarı mesajları metindir → 4.5 şart.
`#A15F00` aynı amber ailesinde (ton korunur), surface 5.06 / bg 4.77. `highlight` ile karışmaz: daha koyu ve yalnızca durum metninde.

**K3 — `accent-on-dark` eklendi.**
Hero `home` ve footer `primary` zeminli; teal link orada 2.81 → okunmaz. Teal'in açık tonu `#5FD3CF` marka rengini korur, 7.86 verir.
Kural: koyu zeminde `accent` kullanılmaz, `accent-on-dark` kullanılır.

**K4 — `border-strong` ayrımı.**
`border` (1.30) ayırıcı çizgi için yeterli ama input sınırı bilgi taşır → WCAG 1.4.11 non-text 3:1 şart.
Ayrı token sayesinde dekoratif çizgiler hafif kalır, form alanları erişilebilir olur (`#8A8478`, 3.72 — sıcak gri, bg tonuyla uyumlu).

**K5 — `on-dark` / `on-dark-muted` adlandırıldı.**
hero.md'deki "`bg`/80" serbest ifadeydi; fe tarafında farklı yorumlanma riski vardı. Token adı tek yorum sağlar.
%80 opaklık 9.04 verir (AA rahat); daha düşük opaklık gerekirse %72'ye kadar AA korunur (7.64) — altına inilmez.

**K6 — `focus-ring` iki bağlamlı.**
Klavye kullanıcısı için görünür odak şart (WCAG 2.4.7/2.4.11). Tek renk her iki zeminde çalışmıyor: amber açık zeminde 2.2'de kalır.
Açık zeminde `accent` (4.73), koyu zeminde `highlight` (6.45); 2px + 2px offset.

**K7 — CTA metni daima `primary`.**
Beyaz metin amber üstünde 2.19 → okunmaz. `primary` 6.45 (A), /de 4.81, /zh 5.94 → tüm locale'lerde AA.
Tek kural, tüm CTA varyantlarında tutarlılık; cta.md ve hero.md zaten bu çifti kullanıyor (kod değişikliği gerekmez).

**K8 — /zh kırmızısı yalnızca açık zeminde.**
`#B91C1C` koyu `primary` üstünde 2.18. /zh hero simetrik ve rakam vurgulu; koyu zeminde vurgu rengi altın (5.94).
Böylece kırmızı-altın kimliği korunur, erişilebilirlik bozulmaz.

---

## 8. Uygulama Takibi (bu adımda YAPILMAZ — scope dışı)
| İş | Scope / rol | Adım |
| :-- | :-- | :-- |
| D2–D6 yeni token'ları `lib/ui/tokens.ts` + CSS değişkenlerine eklemek | `fe` (`lib/ui/**`) | ayrı adım/commit (Sonnet 5.5) |
| hero.md "`bg`/80" → `on-dark-muted`; form.md kenarlık → `border-strong`; footer.md koyu rolleri | `design/components/**` (0.6 kapsamı) | 0.6 revizyonu |
| `prompts/visual-brand.md` | değişiklik **gerekmez** (A ile birebir) | — |
