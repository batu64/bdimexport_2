# lang-switcher — Komponent Brief
**Kaynak:** design-tokens.md v2.0 (Varyant A onaylı) · `_derived-tokens.md` (UX Karar 2) · lib/hreflang.ts · **Kod:** fe-agent (Sonnet 5.5)

## Props
```ts
interface LangSwitcherProps {
  currentLocale: "tr" | "en" | "de" | "zh";
  currentPath: string;              // mevcut sayfanın locale-bağımsız yolu
  availableLocales: { code: string; hreflang: string; label: string; href: string }[];
  // availableLocales = buildAlternateSet(currentPath, ...) çıktısından — elle liste TUTULMAZ
}
```

## Yapı
Button (globe SVG + mevcut dil etiketi) + listbox: dil adları **kendi dilinde** (Türkçe / English / Deutsch / 简体中文) + EN varyantları alt bölümde (English (RU) vb.)

## Davranış
- Seçim → `href`'e navigation (mevcut sayfanın karşılığı; karşılık yoksa alternate set'te olmaz → listede görünmez — 404-hreflang yasağı UI'da da geçerli)
- **360:** navbar sheet menüsünün en altında statik liste (dropdown dar ekranda sığmaz); satır yüksekliği ≥ `touchMin`
- **768:** hamburger menü içinde statik liste (navbar.md ile aynı)
- **1280:** dropdown (nav sağ uç); EN varyantları alt bölümde
- **1920:** 1280 ile aynı; `container` sınırı içinde

## Erişilebilirlik [kritik]
- Button `aria-haspopup="listbox"` + `aria-expanded`; listbox `role="listbox"` + `aria-activedescendant`
- Klavye: ↑↓ gezinme, Enter seçim, ESC kapatma (navbar ESC handler'ına bağlanır)
- Mevcut dil: `aria-selected="true"` + checkmark
- Dil değişimi hreflang karşılığına gider — `<Link>` semantik (JS router)

## Notlar
- hreflang `x-default` listelemede gösterilmez (kullanıcı-dil kavramı değil)
- URL yapısı: tr=`/path` · diğer=`/{loc}/path` (lib/i18n ile tek kaynak)
