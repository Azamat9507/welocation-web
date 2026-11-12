import "server-only";
import type ko from "@/dictionaries/ko.json";
import type { Locale } from "./i18n";

// ko.json is the reference: a key missing from another locale's file is a type error here
export type Dictionary = typeof ko;

const dictionaries: Record<Locale, () => Promise<Dictionary>> = {
  ko: () => import("@/dictionaries/ko.json").then((m) => m.default),
  en: () => import("@/dictionaries/en.json").then((m) => m.default),
  ru: () => import("@/dictionaries/ru.json").then((m) => m.default),
  uz: () => import("@/dictionaries/uz.json").then((m) => m.default),
};

export const getDictionary = (locale: Locale) => dictionaries[locale]();
