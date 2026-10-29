// Pazar siteleri (TR / EN / DE / ZH ana sayfaları) — navbar/footer pazar seçicisi. Etiketler kendi dilinde (lib/i18n localeConfig).
// Site seçimidir, hreflang alternatifi DEĞİL (her pazar ayrı site; alternatifler sayfa metadata'sında).
import { localeConfig, type Locale } from "../i18n";
import type { SiteLink } from "./Navbar";

const HOME: Record<Locale, string> = { tr: "/", en: "/en", de: "/de", zh: "/zh" };
const ORDER: Locale[] = ["tr", "en", "de", "zh"];

export function marketSites(current: Locale): SiteLink[] {
  return ORDER.map((l) => ({ label: localeConfig[l].label, href: HOME[l], lang: localeConfig[l].hreflang, current: l === current }));
}
