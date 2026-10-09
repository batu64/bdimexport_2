# lang-switcher — Komponent Brief
**Kaynak:** design-tokens.md v1.0 (UX Karar 2) · lib/hreflang.ts · **Kod:** fe-agent (Qwen 3.8)

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
- 360: navbar sheet menüsünün en altında statik liste (dropdown dar ekranda sığmaz)
- 768+: dropdown (nav sağ uç)

## Erişilebilirlik [kritik]
- Button `aria-haspopup="listbox"` + `aria-expanded`; listbox `role="listbox"` + `aria-activedescendant`
- Klavye: ↑↓ gezinme, Enter seçim, ESC kapatma (navbar ESC handler'ına bağlanır)
- Mevcut dil: `aria-selected="true"` + checkmark
- Dil değişimi hreflang karşılığına gider — `<Link>` semantik (JS router)

## Notlar
- hreflang `x-default` listelemede gösterilmez (kullanıcı-dil kavramı değil)
- URL yapısı: tr=`/path` · diğer=`/{loc}/path` (lib/i18n ile tek kaynak)
