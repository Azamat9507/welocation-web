import { notFound } from "next/navigation";
import { lang } from "next/root-params";
import { getDictionary } from "./dictionaries";
import { isLocale } from "./i18n";

// The locale of the page being rendered, for server components below app/[lang] (not usable in Server Actions)
export async function currentLocale() {
  const value = await lang();
  if (!isLocale(value)) notFound();
  return { lang: value, t: await getDictionary(value) };
}
