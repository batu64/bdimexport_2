"use client";
// next-intl kurulumu — plugin'siz, static export uyumlu (middleware/headers yok).
// "use client": sunucu tarafında plugin/request config aranmaz (plugin'siz kurulum).
// Her route group layout'u locale'i sabitler: <IntlProvider locale="tr">. x-default: tr.
import { NextIntlClientProvider } from "next-intl";
import type { Locale } from "./i18n";
import tr from "./messages/tr.json";
import en from "./messages/en.json";
import de from "./messages/de.json";
import zh from "./messages/zh.json";

export const messages = { tr, en, de, zh } satisfies Record<Locale, Record<string, unknown>>;

export function IntlProvider({ locale, children }: { locale: Locale; children: React.ReactNode }) {
  return (
    <NextIntlClientProvider locale={locale} messages={messages[locale]}>
      {children}
    </NextIntlClientProvider>
  );
}
