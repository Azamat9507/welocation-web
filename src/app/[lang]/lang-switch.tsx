"use client";

import { usePathname, useSearchParams } from "next/navigation";
import { LOCALE_COOKIE, LOCALES, splitLocale, type Locale } from "@/lib/i18n";

type Props = { lang: Locale; label: string };

// The proxy reads this cookie, so a later visit to a bare URL keeps the chosen language
function remember(l: Locale) {
  document.cookie = `${LOCALE_COOKIE}=${l}; path=/; max-age=31536000; samesite=lax${location.protocol === "https:" ? "; secure" : ""}`;
}

// Plain <a>: each locale has its own root layout, so switching is a full page load anyway
function Switch({ lang, label, target }: Props & { target: (l: Locale) => string }) {
  const item = (l: Locale) =>
    l === lang ? (
      <span aria-current="true" className="font-bold text-accent">
        {l.toUpperCase()}
      </span>
    ) : (
      <a href={target(l)} hrefLang={l} lang={l} onClick={() => remember(l)} className="text-muted hover:text-foreground">
        {l.toUpperCase()}
      </a>
    );
  return (
    <>
      <nav aria-label={label} className="mr-2 hidden items-center gap-1.5 text-xs sm:flex">
        {LOCALES.map((l, i) => (
          <span key={l} className="flex items-center gap-1.5">
            {i > 0 && <span aria-hidden="true" className="text-line">·</span>}
            {item(l)}
          </span>
        ))}
      </nav>
      <details className="relative sm:hidden">
        <summary
          aria-label={label}
          className="flex h-11 cursor-pointer list-none items-center px-1.5 text-xs font-semibold [&::-webkit-details-marker]:hidden"
        >
          {lang.toUpperCase()} <span className="ml-0.5 text-muted">▾</span>
        </summary>
        <ul className="absolute right-0 z-20 mt-1 w-16 rounded-xl border border-line bg-background py-1 text-center text-sm shadow-sm">
          {LOCALES.map((l) => (
            <li key={l} className="py-1.5">
              {item(l)}
            </li>
          ))}
        </ul>
      </details>
    </>
  );
}

export function LangSwitch(props: Props) {
  const path = usePathname();
  const search = useSearchParams().toString();
  const rest = splitLocale(path).rest;
  const target = (l: Locale) => `/${l}${rest === "/" ? "" : rest}${search ? `?${search}` : ""}`;
  return <Switch {...props} target={target} />;
}

// Shown until the current path is known: each language's home
export function LangSwitchFallback(props: Props) {
  return <Switch {...props} target={(l) => `/${l}`} />;
}
