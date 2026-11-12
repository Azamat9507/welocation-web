import Link from "next/link";
import { Suspense } from "react";
import { HeaderTabs, TabList } from "./header-tabs";
import { HeartIcon, iconLinkClass, SearchIcon } from "./icons";
import { UserMenu } from "./user-menu";

export function SiteHeader() {
  return (
    <header className="border-b border-line bg-background">
      <div className="mx-auto max-w-5xl px-4">
        {/* phones: logo + icons on one row, search below; wider screens: one row */}
        <div className="flex flex-wrap items-center gap-x-6 gap-y-2 pt-3 sm:flex-nowrap sm:pt-4">
          <Link href="/" className="shrink-0 text-xl font-extrabold tracking-tight text-accent sm:text-2xl">
            WeLocation
          </Link>
          <form
            action="/"
            role="search"
            className="order-last flex h-11 w-full items-center rounded-full border-2 border-accent bg-background pr-1 pl-4 sm:order-none sm:h-12 sm:flex-1"
          >
            <input
              type="search"
              name="q"
              maxLength={50}
              placeholder="어디로 위로받으러 갈까요?"
              aria-label="장소 검색"
              className="h-full min-w-0 flex-1 bg-transparent text-base outline-none placeholder:text-muted"
            />
            <button
              type="submit"
              aria-label="검색"
              className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-accent text-white sm:h-10 sm:w-10"
            >
              <SearchIcon className="h-5 w-5" />
            </button>
          </form>
          <div className="ml-auto flex shrink-0 items-center gap-1 sm:ml-0">
            <Link href="/me/bookmarks" className={iconLinkClass}>
              <HeartIcon />찜
            </Link>
            <Suspense fallback={<span className="block w-11" />}>
              <UserMenu />
            </Suspense>
          </div>
        </div>
        <div className="mt-1 sm:mt-2">
          <Suspense fallback={<TabList path={null} />}>
            <HeaderTabs />
          </Suspense>
        </div>
      </div>
    </header>
  );
}
