import { cookies } from "next/headers";

export type Locale = "id" | "en";

export const LOCALES: Locale[] = ["id", "en"];
export const DEFAULT_LOCALE: Locale = "id";
export const LOCALE_COOKIE = "locale";

// A field can be a plain string (single language, back-compat) or a
// per-locale object like { id: "...", en: "..." }.
export type Localized<T = string> = T | Partial<Record<Locale, T>>;

/** Pick the right language out of a Localized value, with graceful fallback. */
export function resolve<T>(value: Localized<T> | undefined, locale: Locale): T | undefined {
  if (value && typeof value === "object" && !Array.isArray(value)) {
    const obj = value as Partial<Record<Locale, T>>;
    return obj[locale] ?? obj[DEFAULT_LOCALE] ?? (Object.values(obj)[0] as T | undefined);
  }
  return value as T | undefined;
}

/** Read the active locale from the cookie (server components / route handlers). */
export async function getLocale(): Promise<Locale> {
  const store = await cookies();
  const value = store.get(LOCALE_COOKIE)?.value;
  return LOCALES.includes(value as Locale) ? (value as Locale) : DEFAULT_LOCALE;
}

/** Static UI strings (labels, buttons) keyed by locale. */
export const ui = {
  id: {
    nav: { home: "Beranda", about: "Tentang", skills: "Keahlian", portfolio: "Portofolio", contact: "Kontak" },
    home: { projects: "Proyek", experience: "Pengalaman", design: "Desain", techStack: "Tech Stack", currently: "Saat ini", featured: "Karya Unggulan", getInTouch: "Hubungi saya" },
  },
  en: {
    nav: { home: "Home", about: "About", skills: "Skills", portfolio: "Portfolio", contact: "Contact" },
    home: { projects: "Projects", experience: "Experience", design: "Design", techStack: "Tech stack", currently: "Currently", featured: "Featured work", getInTouch: "Get in touch" },
  },
} as const;

export function getUi(locale: Locale) {
  return ui[locale] ?? ui[DEFAULT_LOCALE];
}
