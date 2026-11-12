import Link from "next/link";
import type { ReactNode } from "react";
import type { Category } from "@/lib/api";
import { CupIcon, LakeIcon, PinIcon, RiverIcon, SparkIcon, ViewpointIcon, WaveIcon } from "./icons";

const cat = (c: Category) => `/?category=${c}`;

const ITEMS: { href: string; label: string; icon: ReactNode }[] = [
  { href: cat("CAFE"), label: "카페", icon: <CupIcon /> },
  { href: cat("BEACH"), label: "바다", icon: <WaveIcon /> },
  { href: cat("LAKE"), label: "호수", icon: <LakeIcon /> },
  { href: cat("RIVER"), label: "강", icon: <RiverIcon /> },
  { href: cat("VIEWPOINT"), label: "전망대", icon: <ViewpointIcon /> },
  { href: "/nearby", label: "내 주변", icon: <PinIcon /> },
  { href: "/guide", label: "AI 가이드", icon: <SparkIcon /> },
];

export function HomeCategories() {
  return (
    <nav aria-label="카테고리" className="-mx-4 overflow-x-auto px-4 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
      <ul className="flex gap-3 sm:justify-between sm:gap-2">
        {ITEMS.map((it) => (
          <li key={it.label} className="shrink-0">
            <Link href={it.href} className="group flex w-16 flex-col items-center gap-1.5 text-xs sm:w-20 sm:text-sm">
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
