import Link from "next/link";
import Image from "next/image";
import type { Category } from "@/lib/api";
import type { Dictionary } from "@/lib/dictionaries";
import { href, type Locale } from "@/lib/i18n";

const cat = (c: Category) => `/?category=${c}`;

export function HomeCategories({ lang, t }: { lang: Locale; t: Dictionary["home"] }) {
  // 3D icons from Microsoft Fluent Emoji (MIT), resized to 128px
  const items: { href: string; label: string; icon: string; badge?: string }[] = [
    { href: cat("CAFE"), label: t.tiles.cafe, icon: "cafe" },
    { href: cat("BEACH"), label: t.tiles.beach, icon: "sea" },
    { href: cat("LAKE"), label: t.tiles.lake, icon: "lake" },
    { href: cat("RIVER"), label: t.tiles.river, icon: "river" },
    { href: cat("VIEWPOINT"), label: t.tiles.viewpoint, icon: "viewpoint" },
    { href: cat("STAY"), label: t.tiles.stay, icon: "stay" },
    { href: cat("LEISURE"), label: t.tiles.leisure, icon: "leisure" },
    { href: "/nearby", label: t.tiles.nearby, icon: "nearby" },
    { href: "/guide", label: t.tiles.guide, icon: "guide", badge: "NEW" },
  ];
  return (
    <nav aria-label={t.tilesLabel} className="-mx-4 overflow-x-auto px-4 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
      <ul className="flex gap-3 pt-3 sm:justify-between sm:gap-2">
        {items.map((it) => (
          <li key={it.href} className="shrink-0">
            <Link
              href={href(lang, it.href)}
              className="group flex w-16 flex-col items-center gap-1.5 text-center text-xs sm:w-20 sm:text-sm"
            >
              <span className="relative flex h-14 w-14 items-center justify-center rounded-[22px] border border-line/60 bg-surface transition-transform group-hover:-translate-y-0.5 sm:h-16 sm:w-16">
                <Image src={`/icons/${it.icon}.png`} alt="" width={40} height={40} className="size-9 sm:size-10" />
                {it.badge && (
                  <span className="absolute -top-2.5 left-1/2 -translate-x-1/2 rounded-full border border-accent/30 bg-background px-1.5 text-[10px] leading-4 font-bold text-accent">
                    {it.badge}
                  </span>
                )}
              </span>
              {it.label}
            </Link>
          </li>
        ))}
      </ul>
    </nav>
  );
}
