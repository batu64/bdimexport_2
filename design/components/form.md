# form — Komponent Brief
**Kaynak:** design-tokens.md v2.0 (Varyant A onaylı) · `_derived-tokens.md` · **Kod:** api-agent (endpoint, Opus 5.5 🔒 + insan review — AGENTS.md §7 adım 1.6) + fe-agent (UI, Sonnet 5.5). Bu brief UI katmanını tanımlar.

## Props
```ts
interface FormProps {
  variant: "lead" | "application";       // lead: kısa (ad/email/mesaj) · application: partner başvurusu
  locale: "tr" | "en" | "de" | "zh";
  consentDocVersion: string;             // content/tr/legal/kvkk-riza-v{N} referansı — sabit metin
  turnstileSiteKey: string;              // env — koda gömülmez
}
```

## Alan Setleri
**lead:** Ad* · Firma · Email* · WhatsApp/Telefon · Mesaj
**application (Proje.md §2.2 birebir — eksik alan = hard-red):** Firma Adı* · Vergi No* · Ürün Kataloğu (PDF, 25MB max, mime check) · Kapasite · Sertifikalar (CE, ISO — multi-select) · İhracat Geçmişi · **KVKK açık rıza checkbox*** · **Logo yayın rızası checkbox (ayrı!)** · Turnstile widget

## Alan Stili
- Label üstte `fontSize.sm`/500, zorunlu `*` `danger` renkte + `aria-required`
- Input: h `touchMin`, `radius`, border `border`, focus: `accent` outline (kalınlık/ofset `space.s1`)
- Hata: border `danger` + alt metin `fontSize.xs` `danger`, `aria-describedby` + `aria-invalid`; hata anında değil submit'te (veya blur), agresif inline validasyon yok
- Placeholder: örnek içerikli ("Örn: Ahşap Mobilya — 2 konteyner/ay")

## KVKK Checkbox'ları ( kritik)
- İKİ AYRI checkbox — birleştirilemez (logo rızası ayrı hukuki act)
- Metin: consentDocVersion'dan bağlanır (agent kendi yorumunu yazamaz — tr-export-agent §6.1)
- Checkbox'sız submit: client disable + **server 400** (client bypass koruması — api-agent §3.5)
- Rıza metni linki: yeni sekme + tam metin sayfası

## Responsive (4 BP)
360: tek kolon, alanlar tam genişlik · 768: 2 kolon (ad/şirket gibi çiftler yanyana) · checkbox'lar her BP'de tam satır · 1280: `formMaxW` ile sınırlı (form sayfası okunabilirlik) · 1920: aynı, ortalanmış

## Erişilebilirlik
- `<form noValidate>` + sunucu doğrulama asıl; hata özeti üstte (role="alert") + alan bazlı
- Label her alanda (placeholder label DEĞİL); file input: özel buton + dosya adı görüntüleme
- Turnstile widget'ı `aria-label` ile; yükleme durumunda submit disabled + bilgi metni
- Hata rengi tek başına anlam taşımaz: ikon + metin; hata özetine odak taşınır; `danger` üstü `surface` AA
- Tüm alan/checkbox/butonlar min `touchMin`; checkbox etiketi tıklanabilir (label `for`)

## Notlar
- Submit: `POST /api/v1/partners/apply` (application) / `/api/v1/leads` (lead) — endpoint FAZ_1 1.6'da
- Loading: buton spinner + disabled; başarı: inline success panel (aynı sayfa), locale bazlı "48 saatte ön değerlendirme" metni (CONTENT_STYLE CTA kuralı)
- Form verisi console'a ASLA log'lanmaz (tr-export-agent §6.4 — KVKK)
