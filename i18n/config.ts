export const locales = ["it", "en", "fr", "nl"] as const;
export type Locale = typeof locales[number];
export const defaultLocale: Locale = "it";

export function isLocale(input: string | null | undefined): input is Locale {
  return !!input && (locales as readonly string[]).includes(input);
}
