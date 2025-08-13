import type { Locale } from "../i18n/config";

const dictionaries = {
  it: () => import("../dictionaries/it.json").then(m => m.default),
  en: () => import("../dictionaries/en.json").then(m => m.default),
  fr: () => import("../dictionaries/fr.json").then(m => m.default),
  nl: () => import("../dictionaries/nl.json").then(m => m.default),
} as const;

export async function getDictionary(locale: Locale) {
  const loader = dictionaries[locale] ?? dictionaries.it;
  return loader();
}
