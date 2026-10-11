# Türetilmiş Layout Token'ları (komponent brief'leri için)
**Kaynak:** design-tokens.md v2.0 (Varyant A onaylı) · **Durum:** brief'lerin kullandığı adlandırılmış değerler. Brief'lerde px/hex literal YASAK; yalnızca bu dosyadaki veya design-tokens'taki adlar kullanılır.
**Not:** `design-tokens.md` ve `lib/ui/tokens.ts` bu scope'un dışındadır; aşağıdaki adlar oraya **eklenmeli** (orchestrator/fe adımı). Temel ölçek adları: `space.s1..s24` (4/8/12/16/24/32/48/64/96), `fontSize` ölçeği, `radius` (8), `touchMin` (44), `container` (1280), `prose` (72ch).

| Token | Değer | Not |
| :-- | :-- | :-- |
| `navH` | `space.s16` | masaüstü navbar yüksekliği (64) |
| `navHMobile` | `space.s12 + space.s2` | mobil navbar yüksekliği (56) |
| `heroMinH.xs / md / lg` | 480 / 560 / 640 | hero min-yükseklik (lg = 1280 ve üstü) |
| `heroImgH.xs / md` | 240 / 320 | tek kolon hero görseli |
| `formMaxW` | 720 | form sayfası okunabilirlik sınırı (1280+) |
| `onDarkMuted` | `bg` %80 opaklık | koyu zeminde ikincil metin (hero alt yazı, footer metni) |
| `motionFast` | 150ms | hover geçişi |
| `border` | `#E5E1DA` | Varyant A (design-tokens v2.0 §1.1); `lib/ui/tokens.ts`'e eklenecek |
| `surface` | `#FFFFFF` | kart/form alanı zemini |
| `elevation.1 / .2` | design-tokens §4 | kart hover = `.2` |
| `type.H1..H4 / body / small / caption` | design-tokens §3 rol eşlemesi | başlık/gövde boyutları rol adıyla |
