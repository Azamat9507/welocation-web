// Shared by the proxy, server code and client components, so nothing here may touch the dictionaries.
export const LOCALES = ["ko", "en", "ru", "uz"] as const;
export type Locale = (typeof LOCALES)[number];
export const DEFAULT_LOCALE: Locale = "ko";
export const LOCALE_COOKIE = "wl_lang";

export function isLocale(v: unknown): v is Locale {
  return typeof v === "string" && (LOCALES as readonly string[]).includes(v);
}

// Action arguments and form fields come from the browser: anything unknown falls back to Korean
export function toLocale(v: unknown): Locale {
  return isLocale(v) ? v : DEFAULT_LOCALE;
}

// Intl tag for dates and numbers; Uzbek is written in Latin script
const INTL: Record<Locale, string> = { ko: "ko-KR", en: "en-US", ru: "ru-RU", uz: "uz-Latn" };
export const intlLocale = (lang: Locale) => INTL[lang];

// href("ko", "/spots/8") -> "/ko/spots/8", href("ko", "/?page=2") -> "/ko?page=2"
export function href(lang: Locale, path: string): string {
  if (path === "/" || path.startsWith("/?") || path.startsWith("/#")) return `/${lang}${path.slice(1)}`;
  return `/${lang}${path}`;
}

// "/ru/spots/8" -> { lang: "ru", rest: "/spots/8" }; rest is "/" for the locale's home
export function splitLocale(pathname: string): { lang: Locale | null; rest: string } {
  const m = /^\/([^/?#]+)(.*)$/.exec(pathname);
  if (m && isLocale(m[1])) return { lang: m[1], rest: m[2].startsWith("/") ? m[2] : `/${m[2]}` };
  return { lang: null, rest: pathname };
}

// "{n}곳" style templates; a missing value leaves the placeholder visible instead of printing "undefined"
export function fill(template: string, values: Record<string, string | number>): string {
  return template.replace(/\{(\w+)\}/g, (all, key: string) => (key in values ? String(values[key]) : all));
}
