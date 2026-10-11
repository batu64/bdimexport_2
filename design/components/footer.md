# footer — Komponent Brief
**Kaynak:** design-tokens.md v2.0 (Varyant A onaylı) · `_derived-tokens.md` · **Kod:** fe-agent (Sonnet 5.5)

## Props
```ts
interface FooterProps {
  locale: "tr" | "en" | "de" | "zh";
  contact: { whatsapp?: string; telegram?: string; wechat?: string; email: string }; // channel_pref matrisi I18N_RULES §2
}
```

## Yapı (4 kolon desktop / akordeon mobil)
1. **Marka + kısa tanım** (2 cümle, dictionary) + iletişim kanal ikonları (locale birincil kanal öne: tr→WhatsApp, en→Form, de→Email+WhatsApp, ru→Telegram, ar→WhatsApp, zh→WeChat)
2. **Site haritası:** locale'in kendi sayfa ağacı (tr: ithalat/ihracat · en: services/products/industries · de: produkte/branchen · zh: services)
3. **Dil ailesi:** 4 dil + EN varyantları (hreflang setinden otomatik — lib/hreflang.ts; **şablon elle dil listesi TUTMAZ**)
4. **Yasal:** tr: KVKK/Gizlilik · **de: Impressum + Datenschutz ZORUNLU konum** (FAZ 5.1 onaylı metinle) · en: Privacy · zh: 隐私
Alt bant: © yıl (dinamik) + Bdimexport

## Renk/Stil
bg `primary`, metin `onDarkMuted`, başlıklar `bg` `fontSize.sm`/600 uppercase, link hover `highlight`; py `space.s12` (mobil `space.s8`)

## Responsive (4 BP)
360: tek kolon akordeon (details/summary — JS'siz) · 768: 2 kolon (akordeon kalkar) · 1280: 4 kolon · 1920: `container` sınırlı, 1280 düzeniyle aynı

## Erişilebilirlik
- `<footer role="contentinfo">`; nav'lar aria-label'lı; akordeon details/summary native (keyboard bedava)
- Dış linkler (kanal): rel="noopener"; ikon linkleri aria-label'lı, min `touchMin`
- Kontrast: `onDarkMuted` ve `bg` metin üstü `primary` AA; link odağı `highlight` outline (koyu zeminde `accent` yetersiz)

## Notlar
- Dil linkleri hreflang setiyle SENKRON — sayfada olmayan dil footer'da da olmaz (404-hreflang yasağı mantığı)
- zh footer: WeChat ikonu + QR mini görüntü (FAZ 5'te QR bileşeni)
