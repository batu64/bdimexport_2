# navbar — Komponent Brief (design/components, Step 0.6)
**Kaynak:** design-tokens.md v1.0 · **Kodlayacak agent:** fe-agent (Qwen 3.8) · **Faz:** 0.6

## Props
```ts
interface NavbarProps {
  locale: "tr" | "en" | "de" | "zh";
  variant?: "default" | "transparent-hero";   // default: bg bg-color, border-bottom border
  services: { label: string; href: string }[]; // dictionary'den
}
```

## Yapı (soldan sağa)
Logo (metin: "Bdimexport" — çevrilmez, I18N_RULES §1 K3) → nav linkler (dictionary) → CTA butonu (variant=primary, dil bazlı CTA metni) → lang-switcher (dropdown, sağ uç).

## Responsive Davranış (4 breakpoint)
| BP | Davranış |
| :--- | :--- |
| 360 | logo + hamburger (sheet menü, tam ekran overlay); lang-switcher menü içinde en altta |
| 768 | logo + hamburger; CTA menü içinde |
| 1280 | tam navbar; linkler + CTA + lang-switcher görünür |
| 1920 | container 1280px ile sınırlı, genişleme boşluğa gider |

## Renk/Spacing (tokens referansı — hardcoded hex YASAK)
bg `bg` · metin `primary` · aktif link `accent` + alt çizgi 2px · CTA `highlight` dolgu (navbar CTA = sayfanın primary'si, hero CTA'sı secondary'ye düşer) · yükseklik 64px (mobil 56) · py 12px

## Erişilebilirlik
- `<nav aria-label>` locale bazlı etiket; aktif sayfa `aria-current="page"`
- Hamburger: `aria-expanded` + `aria-controls`; ESC ile kapanma; focus trap
- Lang-switcher: `<select>` yerine button+listbox (aria-activedescendant); hreflang URL'lerine `<Link>`; dil adları kendi dilinde (Türkçe/English/Deutsch/简体中文)
- Odak görünür: 2px `accent` outline, offset 2px

## Notlar
- transparent-hero: ilk ekranda bg şeffaf, scroll 80px üstüne gelince `bg` + shadow (IntersectionObserver, client component — tek client parçası)
- Sticky top-0 z-50
