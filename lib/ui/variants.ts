// EN varyant yapılandırması — I18N_RULES §2 (kanal matrisi) + §4 (RTL). Tek kaynak: 5 varyant layout'u bu veriden çizilir.
// Gerçek kanal handle'ları FAZ_8'de leads.channel_pref'ten bağlanır; o zamana dek #contact çapası (uydurma link YASAK).
import { enVariants, type EnVariant } from "../i18n";
import ru from "../messages/variants/ru.json";
import fr from "../messages/variants/fr.json";
import nl from "../messages/variants/nl.json";
import es from "../messages/variants/es.json";
import ar from "../messages/variants/ar.json";

export type Channel = "telegram" | "whatsapp" | "email";


/** Arayüz metinleri lib/messages/variants/{v}.json sözlüklerinde (D5); burada yalnız yapı (dil, yön, kanal kimlikleri). */
type Messages = typeof ru;
export interface VariantConfig extends Omit<Messages, "channels"> {
  lang: string;
  dir: "ltr" | "rtl";
  /** [birincil, (ikincil)] — matris I18N_RULES §2; metin sözlükten */
  channels: { id: Channel; text: string }[];
}

const build = (lang: string, dir: "ltr" | "rtl", m: Messages): VariantConfig => ({ ...m, lang, dir, channels: m.channels as VariantConfig["channels"] });

export const VARIANTS: Record<EnVariant, VariantConfig> = {
  ru: build("ru", "ltr", ru),
  fr: build("fr", "ltr", fr),
  nl: build("nl", "ltr", nl),
  es: build("es", "ltr", es),
  ar: build("ar", "rtl", ar),
};

/** Sayfa tipi → mevcut karşılıklar. Olmayan karşılık listeye GİRMEZ (404-hreflang yasağı UI'da da — lang-switcher.md). */
export type VariantPage = "home" | "sourcing";

export interface SwitcherItem { code: string; hreflang: string; label: string; href: string; lang: string }

export function switcherItems(page: VariantPage): SwitcherItem[] {
  const items: SwitcherItem[] = [];
  // İngilizce karşılık: home → /en, sourcing → /en/services/sourcing (Step 2.1 ✅ mevcut). Karşılık VAR ise listelenir;
  // her switcher hedefinin out/'ta bulunduğunu lib/ui/variants.smoke.test.mjs doğrular (404'a link yok).
  items.push(
    page === "home"
      ? { code: "en", hreflang: "en", label: "English", href: "/en", lang: "en" }
      : { code: "en", hreflang: "en", label: "English", href: "/en/services/sourcing", lang: "en" },
  );
  for (const v of enVariants) {
    const path = page === "home" ? `/en/${v}` : `/en/${v}/services/sourcing`;
    items.push({ code: v, hreflang: v, label: VARIANTS[v].label, href: path, lang: VARIANTS[v].lang });
  }
  return items;
}
