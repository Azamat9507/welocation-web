import Link from "next/link";
import { Suspense } from "react";
import {
  CATEGORIES,
  REGIONS,
  TAGS,
  filterQuery,
  getSpots,
  getWeeklyRanking,
  isTourApiImage,
  parseFilter,
  type SpotFilter,
  type SpotSummary,
} from "@/lib/api";
import { currentLocale } from "@/lib/current-locale";
import type { Dictionary } from "@/lib/dictionaries";
import { fill, href, intlLocale, type Locale } from "@/lib/i18n";
import { HeroCarousel, type HeroSlide } from "./hero-carousel";
import { HomeCategories } from "./home-categories";
import { SpotCard } from "./spot-card";

export default async function Home({ searchParams }: PageProps<"/[lang]">) {
  const { t } = await currentLocale();
  return (
    <Suspense fallback={<p className="py-8 text-center text-sm text-muted">{t.common.loading}</p>}>
      <HomeContent searchParams={searchParams} />
    </Suspense>
  );
}

async function HomeContent({ searchParams }: { searchParams: PageProps<"/[lang]">["searchParams"] }) {
  const query = await searchParams;
  const filter = parseFilter(query);
  // "/?page=1" is the full list without filters; the bare "/" is the curated home
  const listMode = !!(filter.region || filter.category || filter.tag || filter.q) || query.page !== undefined;
  return listMode ? <SpotList filter={filter} /> : <HomeSections />;
}

async function HomeSections() {
  const { lang, t } = await currentLocale();
  const [ranking, newest, cafes] = await Promise.all([
    getWeeklyRanking().catch(() => null),
    getSpots({ page: 1 }, 12),
    waterCafes(t),
  ]);
  const ranked = ranking?.items ?? [];
  const slides = heroSlides(
    t,
    ranked.map((r) => r.spot),
    newest.items,
  );

  return (
    <>
      {slides.length > 0 && (
        <HeroCarousel
          lang={lang}
          slides={slides}
          labels={{
            carousel: t.home.carouselLabel,
            prev: t.home.prevSlide,
            next: t.home.nextSlide,
            photoCredit: t.common.photoCredit,
          }}
        />
      )}

      <p className="mt-3 flex items-center gap-2 rounded-2xl bg-surface px-3 py-2 text-[13px] leading-snug">
        <span className="shrink-0 rounded-full bg-accent px-2 py-0.5 text-[11px] font-semibold text-white">{t.home.noticeLabel}</span>
        <span className="min-w-0">{t.home.notice}</span>
      </p>

      <HomeCategories lang={lang} t={t.home} />

      {ranked.length >= 4 && (
        <Rail
          t={t}
          title={t.home.weekly}
          href={href(lang, "/ranking")}
          spots={ranked.slice(0, 8).map((r) => r.spot)}
          ranked
        />
      )}
      {cafes.spots.length > 0 && (
        <Rail t={t} title={cafes.title} href={href(lang, `/${cafes.query}`)} spots={cafes.spots} />
      )}
      <Rail t={t} title={t.home.newest} href={href(lang, "/?page=1")} spots={newest.items.slice(0, 8)} />
    </>
  );
}

// No cafe carries the ocean-view tag until tags are curated; until then show beaches, so the title stays true
// and the rail is not a copy of the newest list (which is mostly cafes)
async function waterCafes(t: Dictionary): Promise<{ title: string; spots: SpotSummary[]; query: string }> {
  const tagged: SpotFilter = { category: "CAFE", tag: "OCEAN_VIEW", page: 1 };
  const ocean = await getSpots(tagged, 8).catch(() => null);
  if (ocean && ocean.items.length >= 4) {
    return { title: t.home.oceanCafes, spots: ocean.items, query: filterQuery(tagged) };
  }
  const beach: SpotFilter = { category: "BEACH", page: 1 };
  const beaches = await getSpots(beach, 8).catch(() => null);
  return { title: t.home.seaViews, spots: beaches?.items ?? [], query: filterQuery(beach) };
}

// Up to 5 of this week's most liked spots with a photo, topped up with the newest ones when fewer than 3
function heroSlides(t: Dictionary, ranked: SpotSummary[], newest: SpotSummary[]): HeroSlide[] {
  const picked = ranked.filter((s) => s.thumbnailUrl).slice(0, 5);
  if (picked.length < 3) {
    for (const s of newest) {
      if (picked.length >= 5) break;
      if (s.thumbnailUrl && !picked.some((p) => p.id === s.id)) picked.push(s);
    }
  }
  return picked.map((s) => ({
    id: s.id,
    name: s.name,
    meta: `${t.categories[s.category]} · ${t.regions[s.region]}`,
    imageUrl: s.thumbnailUrl!,
    tourApiPhoto: isTourApiImage(s.thumbnailUrl!),
  }));
}

type RailProps = { t: Dictionary; title: string; href: string; spots: SpotSummary[]; ranked?: boolean };

function Rail({ t, title, href, spots, ranked }: RailProps) {
  return (
    <section className="mt-7">
      <div className="mb-3 flex items-baseline justify-between">
        <h2 className="text-lg font-bold tracking-tight">{title}</h2>
        <Link href={href} className="shrink-0 text-sm text-muted hover:text-foreground">
          {t.home.seeAll}
        </Link>
      </div>
      <ul className="-mx-4 flex snap-x snap-mandatory scroll-px-4 gap-3 overflow-x-auto px-4 [scrollbar-width:none] md:mx-0 md:grid md:grid-cols-4 md:gap-5 md:overflow-visible md:px-0 [&::-webkit-scrollbar]:hidden">
        {spots.map((spot, i) => (
          <SpotCard
            key={spot.id}
            spot={spot}
            rank={ranked ? i + 1 : undefined}
            className={`w-[40%] shrink-0 snap-start sm:w-[28%] md:w-auto ${i >= 4 ? "md:hidden" : ""}`}
          />
        ))}
      </ul>
      <PhotoCredit spots={spots} text={t.common.photoCredit} />
    </section>
  );
}

function PhotoCredit({ spots, text }: { spots: SpotSummary[]; text: string }) {
  if (!spots.some((s) => s.thumbnailUrl && isTourApiImage(s.thumbnailUrl))) return null;
  return <p className="mt-2 text-right text-[11px] text-muted">{text}</p>;
}

async function SpotList({ filter }: { filter: SpotFilter }) {
  const { lang, t } = await currentLocale();
  const result = await getSpots(filter);

  return (
    <>
      <nav aria-label={t.list.filtersLabel}>
        <CategoryTabs lang={lang} t={t} filter={filter} />
        <MoreFilters lang={lang} t={t} filter={filter} />
      </nav>

      <div className="mt-5 mb-3 flex items-baseline justify-between">
        <h1 className="min-w-0 text-lg font-bold tracking-tight break-all">
          {heading(t, filter)}
          <span className="ml-2 text-sm font-normal text-muted">
            {fill(t.list.count, { n: result.totalElements.toLocaleString(intlLocale(lang)) })}
          </span>
        </h1>
      </div>

      {result.items.length === 0 ? (
        <p className="py-10 text-center text-sm text-muted">
          {filter.q ? t.list.noResults : t.list.noMatch}{" "}
          <Link href={`/${lang}`} className="text-accent">
            {filter.q ? t.list.startOver : t.list.clearFilters}
          </Link>
        </p>
      ) : (
        <ul className="grid grid-cols-2 gap-x-3 gap-y-5 sm:gap-x-5 md:grid-cols-3 lg:grid-cols-4">
          {result.items.map((spot) => (
            <SpotCard key={spot.id} spot={spot} />
          ))}
        </ul>
      )}
      <PhotoCredit spots={result.items} text={t.common.photoCredit} />

      <Pagination lang={lang} t={t} filter={filter} totalPages={result.totalPages} />
    </>
  );
}

function heading(t: Dictionary, f: SpotFilter) {
  if (f.q) return fill(t.list.searchHeading, { q: f.q });
  const parts = [f.region && t.regions[f.region], f.tag && t.tags[f.tag], f.category && t.categories[f.category]];
  const text = parts.filter(Boolean).join(" ");
  return text || t.list.allSpots;
}

type ListProps = { lang: Locale; t: Dictionary; filter: SpotFilter };

function CategoryTabs({ lang, t, filter }: ListProps) {
  const tab = (value: SpotFilter["category"], text: string) => {
    const active = filter.category === value;
    return (
      <Link
        key={value ?? "all"}
        href={href(lang, `/${filterQuery({ ...filter, category: value, page: 1 })}`)}
        aria-current={active ? "true" : undefined}
        className={`shrink-0 border-b-2 pb-1.5 text-[15px] ${
          active ? "border-foreground font-semibold" : "border-transparent text-muted hover:text-foreground"
        }`}
      >
        {text}
      </Link>
    );
  };
  return (
    <div className="-mx-4 flex min-w-0 gap-5 overflow-x-auto border-b border-line px-4">
      {tab(undefined, t.list.all)}
      {CATEGORIES.map((c) => tab(c, t.categories[c]))}
    </div>
  );
}

// Region and tag live in a native disclosure: no script needed, closed by default so phones stay compact
function MoreFilters({ lang, t, filter }: ListProps) {
  const active = [
    filter.region && { key: "region" as const, text: t.regions[filter.region] },
    filter.tag && { key: "tag" as const, text: t.tags[filter.tag] },
  ].filter(Boolean) as { key: "region" | "tag"; text: string }[];

  const chip = (name: "region" | "tag", value: string | undefined, text: string) => {
    const on = filter[name] === value;
    return (
      <Link
        key={value ?? "all"}
        href={href(lang, `/${filterQuery({ ...filter, [name]: value, page: 1 })}`)}
        aria-current={on ? "true" : undefined}
        className={`rounded-full px-3 py-1 text-sm ${on ? "bg-foreground text-surface" : "bg-surface hover:bg-sand"}`}
      >
        {text}
      </Link>
    );
  };

  return (
    <div className="mt-3 flex min-w-0 flex-wrap items-center gap-2">
      <details className="group w-full">
        <summary className="inline-flex cursor-pointer list-none items-center gap-1 rounded-full border border-line bg-surface px-3 py-1 text-sm select-none">
          {t.list.moreFilters} <span className="text-muted group-open:rotate-180">▾</span>
        </summary>
        <div className="mt-3 space-y-3 rounded-xl bg-surface p-3">
          <div>
            <p className="mb-1.5 text-xs text-muted">{t.list.region}</p>
            <div className="flex flex-wrap gap-1.5">
              {chip("region", undefined, t.list.all)}
              {REGIONS.map((r) => chip("region", r, t.regions[r]))}
            </div>
          </div>
          <div>
            <p className="mb-1.5 text-xs text-muted">{t.list.mood}</p>
            <div className="flex flex-wrap gap-1.5">
              {chip("tag", undefined, t.list.all)}
              {TAGS.map((g) => chip("tag", g, t.tags[g]))}
            </div>
          </div>
        </div>
      </details>
      {active.map((a) => (
        <Link
          key={a.key}
          href={href(lang, `/${filterQuery({ ...filter, [a.key]: undefined, page: 1 })}`)}
          aria-label={fill(t.list.removeFilter, { name: a.text })}
          className="rounded-full bg-accent px-3 py-1 text-sm text-white"
        >
          {a.text} ✕
        </Link>
      ))}
    </div>
  );
}

function Pagination({ lang, t, filter, totalPages }: ListProps & { totalPages: number }) {
  if (totalPages <= 1) return null;
  const link = (page: number, text: string, enabled: boolean) =>
    enabled ? (
      <Link href={href(lang, `/${filterQuery({ ...filter, page }) || "?page=1"}`)} className="rounded-full bg-surface px-4 py-1.5 hover:bg-sand">
        {text}
      </Link>
    ) : (
      <span className="rounded-full px-4 py-1.5 text-muted/60">{text}</span>
    );
  return (
    <nav aria-label={t.list.pagesLabel} className="mt-8 flex items-center justify-center gap-3 text-sm">
      {link(filter.page - 1, t.list.prev, filter.page > 1)}
      <span className="text-muted">
        {filter.page} / {totalPages}
      </span>
      {link(filter.page + 1, t.list.next, filter.page < totalPages)}
    </nav>
  );
}
