# form — Komponent Brief
**Kaynak:** design-tokens.md v1.0 · **Kod:** api-agent (endpoint) + fe-agent (UI) — FAZ_1 1.6'da [ŞART] Sonnet 5.5 review'lı. Bu brief UI katmanını tanımlar.

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
- Label üstte 14/500, zorunlu `*` `danger` renkte + `aria-required`
- Input: h 44px, radius 8, border `border`, focus: 2px `accent` outline offset 2
- Hata: border `danger` + alt metin 12px `danger`, `aria-describedby` + `aria-invalid`; hata anında değil submit'te (veya blur), agresif inline validasyon yok
- Placeholder: örnek içerikli ("Örn: Ahşap Mobilya — 2 konteyner/ay")

## KVKK Checkbox'ları ( kritik)
- İKİ AYRI checkbox — birleştirilemez (logo rızası ayrı hukuki act)
- Metin: consentDocVersion'dan bağlanır (agent kendi yorumunu yazamaz — tr-export-agent §6.1)
- Checkbox'sız submit: client disable + **server 400** (client bypass koruması — api-agent §3.5)
- Rıza metni linki: yeni sekme + tam metin sayfası

## Responsive (4 BP)
360: tek kolon, alanlar tam genişlik · 768: 2 kolon (ad/şirket gibi çiftler yanyana) · checkbox'lar her BP'de tam satır · 1280: container 720px ile sınırlı (form sayfası okunabilirlik) · 1920: aynı

## Erişilebilirlik
- `<form noValidate>` + sunucu doğrulama asıl; hata özeti üstte (role="alert") + alan bazlı
- Label her alanda (placeholder label DEĞİL); file input: özel buton + dosya adı görüntüleme
- Turnstile widget'ı `aria-label` ile; yükleme durumunda submit disabled + bilgi metni

## Notlar
- Submit: `POST /api/v1/partners/apply` (application) / `/api/v1/leads` (lead) — endpoint FAZ_1 1.6'da
- Loading: buton spinner + disabled; başarı: inline success panel (aynı sayfa), locale bazlı "48 saatte ön değerlendirme" metni (CONTENT_STYLE CTA kuralı)
- Form verisi console'a ASLA log'lanmaz (tr-export-agent §6.4 — KVKK)
