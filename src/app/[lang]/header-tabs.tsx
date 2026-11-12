"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { href, splitLocale, type Locale } from "@/lib/i18n";

type Tab = { href: string; label: string };
type Props = { lang: Locale; tabs: Tab[] };

// path is null in the Suspense fallback, so no tab is marked active there
export function TabList({ lang, tabs, path }: Props & { path: string | null }) {
  const rest = path === null ? null : splitLocale(path).rest;
  return (
    <nav className="flex gap-5 overflow-x-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
      {tabs.map((t) => {
        const on = rest !== null && (t.href === "/" ? rest === "/" : rest.startsWith(t.href));
        return (
          <Link
            key={t.href}
            href={href(lang, t.href)}
            aria-current={on ? "page" : undefined}
            className={`shrink-0 border-b-2 py-2.5 text-[15px] ${
              on ? "border-accent font-bold text-accent" : "border-transparent text-muted hover:text-foreground"
            }`}
          >
            {t.label}
          </Link>
        );
      })}
    </nav>
  );
}

export function HeaderTabs(props: Props) {
  return <TabList {...props} path={usePathname()} />;
}
