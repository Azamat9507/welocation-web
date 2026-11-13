import Link from "next/link";
import { Suspense } from "react";
import { CATEGORIES, REGIONS, SEARCH_MAX_LENGTH, TAGS, filterQuery } from "@/lib/api";
import { currentLocale } from "@/lib/current-locale";
import { CategoryMenu, CategoryMenuFallback, type MenuColumn } from "./category-menu";
import { HeaderSearch } from "./header-search";
import { HeaderTabs, TabList } from "./header-tabs";
import { HeartIcon, iconLinkClass } from "./icons";
import { LangSwitch, LangSwitchFallback } from "./lang-switch";
import { UserMenu } from "./user-menu";

export async function SiteHeader() {
  const { lang, t } = await currentLocale();
  const tabs = [
    { href: "/", label: t.tabs.home },
    { href: "/nearby", label: t.tabs.nearby },
    { href: "/ranking", label: t.tabs.ranking },
    { href: "/shorts", label: t.tabs.shorts },
    { href: "/guide", label: t.tabs.guide },
  ];
  const menu: MenuColumn[] = [
    { title: t.header.menuKinds, items: CATEGORIES.map((c) => ({ href: `/${filterQuery({ category: c })}`, label: t.categories[c] })) },
    { title: t.header.menuRegions, items: REGIONS.map((r) => ({ href: `/${filterQuery({ region: r })}`, label: t.regions[r] })) },
    { title: t.header.menuThemes, items: TAGS.map((g) => ({ href: `/${filterQuery({ tag: g })}`, label: t.tags[g] })) },
    { title: t.header.menuServices, items: tabs.slice(1) },
  ];
  return (
    <header className="relative border-b border-line bg-background">
      <div className="mx-auto max-w-5xl px-4">
        {/* phones: logo + icons on one row, search below; wider screens: one row */}
        <div className="flex flex-wrap items-center gap-x-6 gap-y-2 pt-3 sm:flex-nowrap sm:pt-4">
          <Link href={`/${lang}`} className="shrink-0 text-xl font-extrabold tracking-tight text-accent sm:text-2xl">
            WeLocation
          </Link>
          <HeaderSearch
            lang={lang}
            searchMax={SEARCH_MAX_LENGTH}
            t={{
              searchPlaceholder: t.header.searchPlaceholder,
              searchLabel: t.header.searchLabel,
              searchButton: t.header.searchButton,
              askAi: t.header.askAi,
              searchFor: t.header.searchFor,
              askAiFor: t.header.askAiFor,
            }}
          />
          <div className="ml-auto flex shrink-0 items-center gap-1.5 sm:ml-0">
            <Suspense fallback={<LangSwitchFallback lang={lang} label={t.header.language} />}>
              <LangSwitch lang={lang} label={t.header.language} />
            </Suspense>
            <Link href={`/${lang}/me/bookmarks`} className={iconLinkClass}>
              <HeartIcon />
              {t.header.bookmarks}
            </Link>
            <Suspense fallback={<span className="block w-11" />}>
              <UserMenu />
            </Suspense>
          </div>
        </div>
        <div className="mt-1 flex items-center gap-4 sm:mt-2 sm:gap-5">
          <Suspense fallback={<CategoryMenuFallback label={t.header.allCategories} />}>
            <CategoryMenu lang={lang} columns={menu} labels={{ open: t.header.allCategories, close: t.header.menuClose }} />
          </Suspense>
          <span aria-hidden="true" className="h-4 w-px shrink-0 bg-line" />
          <Suspense fallback={<TabList lang={lang} tabs={tabs} path={null} />}>
            <HeaderTabs lang={lang} tabs={tabs} />
          </Suspense>
        </div>
      </div>
    </header>
  );
}
