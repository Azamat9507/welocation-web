import Link from "next/link";
import { Suspense } from "react";
import { currentLocale } from "@/lib/current-locale";
import { HeaderTabs, TabList } from "./header-tabs";
import { HeartIcon, iconLinkClass, SearchIcon } from "./icons";
import { LangSwitch, LangSwitchFallback } from "./lang-switch";
import { UserMenu } from "./user-menu";

export async function SiteHeader() {
  const { lang, t } = await currentLocale();
  const tabs = [
    { href: "/", label: t.tabs.home },
    { href: "/nearby", label: t.tabs.nearby },
    { href: "/ranking", label: t.tabs.ranking },
    { href: "/guide", label: t.tabs.guide },
  ];
  return (
    <header className="border-b border-line bg-background">
      <div className="mx-auto max-w-5xl px-4">
        {/* phones: logo + icons on one row, search below; wider screens: one row */}
        <div className="flex flex-wrap items-center gap-x-6 gap-y-2 pt-3 sm:flex-nowrap sm:pt-4">
          <Link href={`/${lang}`} className="shrink-0 text-xl font-extrabold tracking-tight text-accent sm:text-2xl">
            WeLocation
          </Link>
          <form
            action={`/${lang}`}
            role="search"
            className="order-last flex h-11 w-full items-center rounded-full border-2 border-accent bg-background pr-1 pl-4 sm:order-none sm:h-12 sm:flex-1"
          >
            <input
              type="search"
              name="q"
              maxLength={50}
              placeholder={t.header.searchPlaceholder}
              aria-label={t.header.searchLabel}
              className="h-full min-w-0 flex-1 bg-transparent text-base outline-none placeholder:text-muted"
            />
            <button
              type="submit"
              aria-label={t.header.searchButton}
              className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-accent text-white sm:h-10 sm:w-10"
            >
              <SearchIcon className="h-5 w-5" />
            </button>
          </form>
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
        <div className="mt-1 sm:mt-2">
          <Suspense fallback={<TabList lang={lang} tabs={tabs} path={null} />}>
            <HeaderTabs lang={lang} tabs={tabs} />
          </Suspense>
        </div>
      </div>
    </header>
  );
}
