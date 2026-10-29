// Kök layout'ların ortak <html> öznitelikleri + token CSS'i. tokens.ts → theme.ts → <style> (build-time, JS'siz).
// data-locale: zh kırmızı-altın / de sade-güven katmanlarını açar (theme.ts). EN varyantları "en" tabanını kullanır.
import { themeCss } from "./theme";
import { inter, notoArabic } from "./fonts";

export type ThemeLocale = "tr" | "en" | "de" | "zh";

export function htmlAttrs(locale: ThemeLocale, lang: string = locale, dir: "ltr" | "rtl" = "ltr") {
  const className = lang === "ar" ? `${inter.variable} ${notoArabic.variable}` : inter.variable;
  // dir yalnız RTL'de basılır (LTR varsayılan; SEO_PLAYBOOK §3 + varyant smoke testi)
  return { lang, dir: dir === "rtl" ? dir : undefined, "data-locale": locale, className } as const;
}

const css = themeCss(); // modül yüklemesinde bir kez

export default function ThemeStyle() {
  return <style id="bdx-tokens" dangerouslySetInnerHTML={{ __html: css }} />;
}
