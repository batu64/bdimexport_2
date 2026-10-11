# Bdimexport Design Tokens — v2.0 TASLAK (Step 0.4 — 3 palet varyantı)
**Durum:** 🟡 TASLAK — **İNSAN SEÇİMİ BEKLİYOR (Step 0.5)**. Aşağıdaki 3 varyanttan biri seçilir; seçilene kadar `lib/ui/tokens.ts` ve `prompts/visual-brand.md` **dokunulmaz** (ikisi şu an Varyant A hex'leriyle birebir).
**Scope / model:** `design/**` · Sonnet 5.5 (AGENTS.md §7, adım 0.4) · **Sonraki:** 0.5 — Opus 5.5 seçilen varyantı nihailer + hero copy.
**Önceki sürüm:** v1.0 (Varyant A onaylı) bu taslakla **geçersiz kılındı**; git geçmişinde `bbb8578`. Varyant A = v1.0 paletiyle aynı → geri dönüş maliyeti sıfır.

> **Ortak kural (3 varyant için de geçerli):** yapı, tipografi, spacing, breakpoint ve komponent envanteri **varyanttan bağımsız**dır (§2–§6). Varyantlar yalnızca **renk (§1) ve ton** farkıdır. Komponentlerde hardcoded hex/px yasak; yalnızca token.

---

## 0. Üç Seçeneğin Özeti (karar tablosu)

| | **A — Ticaret Güveni** | **B — Endüstriyel** | **C — Anadolu Sıcak** |
| :-- | :-- | :-- | :-- |
| Karakter | Kurumsal, dengeli, sıcak-profesyonel | Soğuk, teknik, SaaS/fabrika hissi | Sıcak, el yapımı, kökenli (Türk üretici hikâyesi) |
| Ana renk | Lacivert `#1A2B4A` | Koyu slate `#0F172A` | Koyu kahve `#3E2723` |
| Accent | Teal `#0E7C7B` | Mavi `#2563EB` | Kiremit kırmızı `#C0392B` |
| Highlight (CTA) | Amber `#E8A13D` | Turuncu-amber `#F59E0B` | Altın `#D4A017` |
| Zemin | Kırık beyaz `#FAF8F5` | Saf beyaz `#FFFFFF` | Krem `#FDF6EC` |
| En güçlü olduğu yer | TR/EN/DE üçünde nötr; /de güveni | EN global B2B alıcı, admin/panel | TR üretici + flywheel hikâyesi |
| Risk | Üçü içinde en "ortalama" | Genel/jenerik SaaS görünüm riski; Çin kırmızısıyla bağı zayıf | /zh kırmızı-altın ile **yakın akraba** → /zh ayrışması düşük; /de'de sıcaklık fazla |
| Görsel uyum | `visual-brand.md` §1 ile **birebir** (değişiklik yok) | `visual-brand.md` §1 hex'leri değişir → image-agent prefix güncelleme + insan onayı | Aynı: prefix güncelleme gerekir |
| Kod etkisi | **Yok** (`lib/ui/tokens.ts` zaten A) | `tokens.ts` 6 değer + admin/varyant CSS yeniden doğrulanır | `tokens.ts` 6 değer + aynı |
| Tavsiye | ✅ **Varsayılan öneri** (en düşük maliyet, 3 dilde nötr) | Global EN odağı ağır basarsa | TR üretici toplama kampanyası ağır basarsa |

---

## 1. Renk Paletleri

### 1.1 Varyant A — "Ticaret Güveni"  *(v1.0 onaylı palet; kodda aktif)*
| Rol | Hex | Kullanım |
| :-- | :-- | :-- |
| primary | `#1A2B4A` | Header, başlıklar, secondary CTA kontur/metin |
| accent | `#0E7C7B` | Linkler, ikonlar, vurgu |
| highlight | `#E8A13D` | Primary CTA dolgu (sayfa başına max 1), rozetler |
| bg | `#FAF8F5` | Sayfa zemini |
| surface | `#FFFFFF` | Kart, form alanı |
| border | `#E5E1DA` | Ayırıcı, input kenarlık |
| ink / muted | `#1F2937` / `#6B7280` | Gövde / ikincil metin |
| success / warning / danger | `#2E7D32` / `#C77700` / `#C62828` | Form durumları |

### 1.2 Varyant B — "Endüstriyel"
| Rol | Hex | Kullanım |
| :-- | :-- | :-- |
| primary | `#0F172A` | Header, başlıklar |
| accent | `#2563EB` | Linkler, ikonlar, vurgu |
| highlight | `#F59E0B` | Primary CTA dolgu (sayfa başına max 1), rozetler |
| bg | `#FFFFFF` | Sayfa zemini |
| surface | `#F1F5F9` | Kart, bölüm zemini |
| border | `#CBD5E1` | Ayırıcı, input kenarlık |
| ink / muted | `#1E293B` / `#64748B` | Gövde / ikincil metin |
| success / warning / danger | `#15803D` / `#B45309` / `#B91C1C` | Form durumları |

### 1.3 Varyant C — "Anadolu Sıcak"
| Rol | Hex | Kullanım |
| :-- | :-- | :-- |
| primary | `#3E2723` | Header, başlıklar |
| accent | `#C0392B` | Linkler, ikonlar, vurgu |
| highlight | `#D4A017` | Primary CTA dolgu (sayfa başına max 1), rozetler |
| bg | `#FDF6EC` | Sayfa zemini |
| surface | `#FFFFFF` | Kart, form alanı |
| border | `#E8D9C3` | Ayırıcı, input kenarlık |
| ink / muted | `#2B1B17` / `#7A6A62` | Gövde / ikincil metin |
| success / warning / danger | `#2E7D32` / `#B26A00` / `#A61B1B` | Form durumları |

### 1.4 Kontrast kanıtı (WCAG, hesaplanmış)
| Çift | A | B | C | Eşik |
| :-- | :-- | :-- | :-- | :-- |
| ink / bg | 13.8 | 14.6 | 15.4 | ≥ 4.5 ✅ |
| primary / bg | 13.3 | 17.9 | 12.9 | ≥ 4.5 ✅ |
| accent / bg (link) | 4.7 | 5.2 | 5.1 | ≥ 4.5 ✅ |
| muted / bg | 4.6 | 4.8 | 4.8 | ≥ 4.5 ✅ |
| primary metin / highlight dolgu (CTA) | 6.4 | 8.3 | 5.8 | ≥ 4.5 ✅ |

---

## 2. Locale Varyantları (her palet için)

### 2.1 /zh — kırmızı-altın (Proje.md; visual-brand §3). primary + bg paletten gelir, yalnızca accent/highlight swap edilir
| | A | B | C |
| :-- | :-- | :-- | :-- |
| accent (kırmızı) | `#B91C1C` | `#B91C1C` | `#A61B1B` *(C zaten kırmızı; ayrışmak için daha koyu)* |
| highlight (altın) | `#D4A017` | `#D4A017` | `#C99700` |
| Kontrast (accent/bg · primary/altın) | 6.1 · 5.9 | 6.5 · 7.5 | 7.0 · 5.2 |

Kurallar (3 varyant ortak): hero **simetrik merkez**; sayısal güven vurgusu (rakam öne); **4-sayısı gruplaması yasak** (4 kart yerine 3 veya 5–6); ICP vaadi yok. *Not: C'de /tr ile /zh arasında accent farkı küçüktür (`#C0392B` ↔ `#A61B1B`) — /zh'nin "izole site" hissi zayıflar.*

### 2.2 /de — güven odaklı, sade
| | A | B | C |
| :-- | :-- | :-- | :-- |
| highlight (muted) | `#C98A2B` | `#D9930D` | `#CFA024` |
| trust-badge zemin | `#E6F2F1` | `#E7EFFD` | `#F3E7E4` |
| trust-badge metin | `#0B6665` | `#1D4ED8` | `#8E2A20` |

Rozet metin/zemin kontrastı: A 5.9 · B 5.8 · C 6.9 (≥ 4.5). Kurallar (ortak): highlight kullanımı **%50 azaltılır** (CTA dışında yok); rozet + kanıt metni (belge, checkmark) öne; formal Sie; Impressum/Datenschutz footer'da; oyuncu/duygusal görsel yok.

### 2.3 /en/ar (FAZ 2)
Renk değişmez; `dir="rtl"` + mantıksal CSS (margin-inline vb.) ile ayna layout. Font: Noto Sans Arabic.

---

## 3. Tipografi (3 varyant ortak)
| Token | Değer |
| :-- | :-- |
| font-sans | Inter (latin) · Noto Sans SC (zh) · Noto Sans Arabic (ar) · fallback `system-ui, sans-serif` |
| Ölçek (px / rem @16) | 12 `.75` · 14 `.875` · 16 `1` · 18 `1.125` · 20 `1.25` · 24 `1.5` · 30 `1.875` · 36 `2.25` · 48 `3` · 60 `3.75` |
| Rol eşlemesi (mobil → masaüstü) | H1 36→60 · H2 30→48 · H3 24→36 · H4 20→24 · gövde 16 · küçük 14 · caption 12 |
| Weight | 400 gövde · 500 etiket · 600 başlık (B2B ciddiyet; 700 yalnızca stat rakamı) |
| Line-height | başlık 1.2 · gövde 1.6 · caption 1.4 |
| Okuma ölçüsü | `72ch` (makale/rehber gövdesi) |

## 4. Spacing & Grid (ortak)
- Spacing ölçeği (4px taban): **4 / 8 / 12 / 16 / 24 / 32 / 48 / 64 / 96** px
- Container: max-width **1280px**; yan boşluk 16px (360) / 24px (768+)
- Grid: **12 kolon**, gap 24px (360'ta 4 kolon/gap 16, 768'de 8 kolon/gap 24)
- Radius: 8px (kart/CTA/input) · 999px (rozet) · Dokunma alanı min **44×44px**
- Elevation: 3 seviye — 0 (düz) · 1 `0 1px 3px` · 2 `0 4px 12px` (renk: ink %8–12 alfa)

## 5. Breakpoint'ler (4 — kabul şartı)
| Ad | Min genişlik | Kolon | Davranış |
| :-- | :-- | :-- | :-- |
| **xs / mobil** | 360 | 4 | tek sütun, hamburger navbar, dil seçici menü içinde |
| **md / tablet** | 768 | 8 | 2 sütun kartlar, navbar yatay (kısaltılmış) |
| **lg / desktop** | 1280 | 12 | hero 2 kolon (sol 5/12 başlık, sağ 7/12 görsel), tam navbar |
| **xl / geniş** | 1920 | 12 | container 1280'de sabit, yanlar boş; partner-grid 4 kolon |

Mobile-first (min-width sorguları). Her komponent briefi bu 4 genişlikte davranışını tanımlar (`design/components/*.md`).

## 6. Komponent Envanteri (8 komponent — sayılı)
| # | Komponent | Varyantlar | Not |
| :-- | :-- | :-- | :-- |
| 1 | navbar | default · transparent-hero | dil seçici zorunlu; sticky; mobil hamburger |
| 2 | hero | home · product · campaign (+ zh simetrik) | sol başlık/sağ görsel; altında güven bandı |
| 3 | card | service · product · partner | partner kartında `consent_logo_en` kontrolü |
| 4 | form | lead · application | KVKK checkbox + Turnstile slot; hata durumları success/warning/danger |
| 5 | footer | tr · en · de (+Impressum) · zh | dil ailesi linkleri |
| 6 | cta | primary · secondary · inline | highlight dolgu, sayfa başına max 1 primary; "Fiil + SLA" metni |
| 7 | partner-grid | grid-3 · grid-4 (1920) | `approved=true` filtresi; boş durum metni |
| 8 | lang-switcher | dropdown · inline | hreflang seti ile senkron |

*(Brief'ler mevcut: `design/components/` altında 8 dosya. Seçim sonrası hex referansları token adına bağlı kaldığı için brief değişmez; yalnızca Varyant B/C seçilirse §1 değişir.)*

---

## 7. Seçim Sonrası Uygulama Planı (0.5 sonrası, bu adımda YAPILMAZ)
1. Seçilen varyantın §1 + §2 sütunu "ONAYLI" olarak işaretlenir, diğer iki varyant arşive taşınır.
2. A dışı seçilirse: `lib/ui/tokens.ts` (6 hex), `prompts/visual-brand.md` §1 prefix (orchestrator + insan onayı), `app/admin/layout.tsx` ve varyant CSS'lerinin görsel doğrulaması ayrı adımlarda.
3. `design/hero-copy.md` ve `design/components/*.md` token adlarıyla yazıldığı için etkilenmez.

## 8. Senin Kararın (👤 Step 0.5)
Tek cümleyle yanıtla: **"A"**, **"B"** veya **"C"** (isteğe bağlı: /zh veya /de sütunu için itiraz).
