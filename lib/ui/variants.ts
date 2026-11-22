// EN varyant yapılandırması — 10 dil (ru, fr, nl, es, ar + fi, sq, pl, ro, it).
// Kanal linkleri smoke test kuralı gereği #contact çapasıdır; gerçek telefon/e-posta bağlantısı yalnızca ana pazar sitelerindedir.
import { enVariants, type EnVariant } from "../i18n";
import ru from "../messages/variants/ru.json";
import fr from "../messages/variants/fr.json";
import nl from "../messages/variants/nl.json";
import es from "../messages/variants/es.json";
import ar from "../messages/variants/ar.json";
import fi from "../messages/variants/fi.json";
import sq from "../messages/variants/sq.json";
import pl from "../messages/variants/pl.json";
import ro from "../messages/variants/ro.json";
import it from "../messages/variants/it.json";

export type Channel = "telegram" | "whatsapp" | "email";

type Messages = typeof ru;
export interface VariantConfig extends Omit<Messages, "channels"> {
  lang: string;
  dir: "ltr" | "rtl";
  channels: { id: Channel; text: string }[];
}

const build = (lang: string, dir: "ltr" | "rtl", m: Messages): VariantConfig => ({
  ...m,
  lang,
  dir,
  channels: m.channels as VariantConfig["channels"],
});

export const VARIANTS: Record<EnVariant, VariantConfig> = {
  ru: build("ru", "ltr", ru),
  fr: build("fr", "ltr", fr),
  nl: build("nl", "ltr", nl),
  es: build("es", "ltr", es),
  ar: build("ar", "rtl", ar),
  fi: build("fi", "ltr", fi),
  sq: build("sq", "ltr", sq),
  pl: build("pl", "ltr", pl),
  ro: build("ro", "ltr", ro),
  it: build("it", "ltr", it),
};

export type VariantPage = "home" | "sourcing" | "inspection";

export interface SwitcherItem {
  code: string;
  hreflang: string;
  label: string;
  href: string;
  lang: string;
}

export function switcherItems(page: VariantPage): SwitcherItem[] {
  const items: SwitcherItem[] = [];
  const enHref =
    page === "home"
      ? "/en"
      : page === "sourcing"
      ? "/en/services/sourcing"
      : "/en/services/inspection";
  items.push({ code: "en", hreflang: "en", label: "English", href: enHref, lang: "en" });
  for (const v of enVariants) {
    const path =
      page === "home"
        ? `/en/${v}`
        : page === "sourcing"
        ? `/en/${v}/services/sourcing`
        : `/en/${v}/services/inspection`;
    items.push({ code: v, hreflang: v, label: VARIANTS[v].label, href: path, lang: VARIANTS[v].lang });
  }
  return items;
}
