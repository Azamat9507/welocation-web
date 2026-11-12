import Link from "next/link";
import type { ReactNode } from "react";
import type { Category } from "@/lib/api";
import type { Dictionary } from "@/lib/dictionaries";
import { href, type Locale } from "@/lib/i18n";
import { CupIcon, LakeIcon, PinIcon, RiverIcon, SparkIcon, ViewpointIcon, WaveIcon } from "./icons";

const cat = (c: Category) => `/?category=${c}`;

export function HomeCategories({ lang, t }: { lang: Locale; t: Dictionary["home"] }) {
  const items: { href: string; label: string; icon: ReactNode }[] = [
    { href: cat("CAFE"), label: t.tiles.cafe, icon: <CupIcon /> },
    { href: cat("BEACH"), label: t.tiles.beach, icon: <WaveIcon /> },
    { href: cat("LAKE"), label: t.tiles.lake, icon: <LakeIcon /> },
    { href: cat("RIVER"), label: t.tiles.river, icon: <RiverIcon /> },
    { href: cat("VIEWPOINT"), label: t.tiles.viewpoint, icon: <ViewpointIcon /> },
    { href: "/nearby", label: t.tiles.nearby, icon: <PinIcon /> },
    { href: "/guide", label: t.tiles.guide, icon: <SparkIcon /> },
  ];
  return (
    <nav aria-label={t.tilesLabel} className="-mx-4 overflow-x-auto px-4 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
      <ul className="flex gap-3 sm:justify-between sm:gap-2">
        {items.map((it) => (
          <li key={it.href} className="shrink-0">
            <Link
              href={href(lang, it.href)}
              className="group flex w-16 flex-col items-center gap-1.5 text-center text-xs sm:w-20 sm:text-sm"
            >
              <span className="flex h-14 w-14 items-center justify-center rounded-2xl bg-accent-soft text-accent transition-colors group-hover:bg-accent group-hover:text-white sm:h-16 sm:w-16">
                {it.icon}
              </span>
              {it.label}
            </Link>
          </li>
        ))}
      </ul>
    </nav>
  );
}
