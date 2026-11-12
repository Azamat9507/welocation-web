"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const TABS = [
  { href: "/", label: "홈" },
  { href: "/nearby", label: "내 주변" },
  { href: "/ranking", label: "주간 인기" },
  { href: "/guide", label: "AI 가이드" },
] as const;

// path is null in the Suspense fallback, so no tab is marked active there
export function TabList({ path }: { path: string | null }) {
  return (
    <nav className="flex gap-5 overflow-x-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
      {TABS.map((t) => {
        const on = path !== null && (t.href === "/" ? path === "/" : path.startsWith(t.href));
        return (
          <Link
            key={t.href}
            href={t.href}
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

export function HeaderTabs() {
  return <TabList path={usePathname()} />;
}
