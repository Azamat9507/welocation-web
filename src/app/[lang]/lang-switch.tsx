"use client";

import { usePathname, useSearchParams } from "next/navigation";
import { useEffect, useRef } from "react";
import { LOCALE_COOKIE, LOCALES, splitLocale, type Locale } from "@/lib/i18n";

type Props = { lang: Locale; label: string };

// The proxy reads this cookie, so a later visit to a bare URL keeps the chosen language
function remember(l: Locale) {
  document.cookie = `${LOCALE_COOKIE}=${l}; path=/; max-age=31536000; samesite=lax${location.protocol === "https:" ? "; secure" : ""}`;
}

const NAMES: Record<Locale, string> = { ko: "한국어", en: "English", ru: "Русский", uz: "O'zbekcha" };

// Plain <a>: each locale has its own root layout, so switching is a full page load anyway
function Switch({ lang, label, target }: Props & { target: (l: Locale) => string }) {
  const ref = useRef<HTMLDetailsElement>(null);
  // <details> stays open on its own; close it on a click elsewhere or Escape, like a normal menu
  useEffect(() => {
    const close = (e: Event) => {
      const el = ref.current;
      if (!el?.open) return;
      if (e instanceof KeyboardEvent ? e.key === "Escape" : !el.contains(e.target as Node)) el.open = false;
    };
    document.addEventListener("click", close);
    document.addEventListener("keydown", close);
    return () => {
      document.removeEventListener("click", close);
      document.removeEventListener("keydown", close);
    };
  }, []);

  return (
    <details ref={ref} className="group relative">
      <summary
        aria-label={label}
        className="flex h-9 cursor-pointer list-none items-center gap-1 rounded-full border border-line px-2.5 text-xs font-semibold hover:border-accent group-open:border-accent [&::-webkit-details-marker]:hidden"
      >
        <svg aria-hidden="true" viewBox="0 0 24 24" className="size-4 text-muted" fill="none" stroke="currentColor" strokeWidth="1.8">
          <circle cx="12" cy="12" r="9" />
          <path d="M3 12h18M12 3c2.5 2.6 3.8 5.6 3.8 9s-1.3 6.4-3.8 9c-2.5-2.6-3.8-5.6-3.8-9S9.5 5.6 12 3Z" />
        </svg>
        {lang.toUpperCase()}
        <svg aria-hidden="true" viewBox="0 0 24 24" className="size-3.5 text-muted transition-transform group-open:rotate-180" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="m6 9 6 6 6-6" />
        </svg>
      </summary>
      <ul className="absolute right-0 z-20 mt-2 w-40 rounded-2xl border border-line bg-background p-1.5 text-sm shadow-lg">
        {LOCALES.map((l) => (
          <li key={l}>
            {l === lang ? (
              <span aria-current="true" lang={l} className="flex items-center justify-between rounded-xl bg-surface px-3 py-2 font-semibold">
                {NAMES[l]}
                <svg aria-hidden="true" viewBox="0 0 24 24" className="size-4 text-accent" fill="none" stroke="currentColor" strokeWidth="2.2">
                  <path d="m5 12 5 5 9-10" />
                </svg>
              </span>
            ) : (
              <a
                href={target(l)}
                hrefLang={l}
                lang={l}
                onClick={() => remember(l)}
                className="flex rounded-xl px-3 py-2 hover:bg-surface"
              >
                {NAMES[l]}
              </a>
            )}
          </li>
        ))}
      </ul>
    </details>
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
