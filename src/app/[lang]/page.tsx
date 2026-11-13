import Link from "next/link";
import { Suspense } from "react";
import {
  ACTIVITIES,
  CATEGORIES,
  REGIONS,
  TAGS,
  filterQuery,
  getSpots,
  getWeeklyRanking,
  isTourApiImage,
  parseFilter,
  type Activity,
  type Region,
  type SpotFilter,
  type SpotMap,
  type SpotSummary,
} from "@/lib/api";
import { currentLocale } from "@/lib/current-locale";
import type { Dictionary } from "@/lib/dictionaries";
import { fill, href, intlLocale, type Locale } from "@/lib/i18n";
import { getPicks } from "@/lib/picks";
import { getSpotMap } from "@/lib/spot-map";
import { HeroCarousel, type HeroSlide } from "./hero-carousel";
import { HomeCategories } from "./home-categories";
import { ChipRail } from "./home/chip-rail";
import { Collection } from "./home/collection";
import { KoreaMap } from "./home/korea-map";
import { PopularRegions } from "./home/popular-regions";
import { LATER, SectionHead } from "./home/section-head";
import { ThemeCards } from "./home/theme-cards";
import { PICKS, TopTen } from "./home/top-ten";
import { SpotCard } from "./spot-card";

export default async function Home({ searchParams }: PageProps<"/[lang]">) {
  const { t } = await currentLocale();
  return (
    // The fallback holds a screen's height: a short one let the footer show in the first paint, and the
    // streamed page then pushed it away (Lighthouse CLS 0.142 on mobile)
    <Suspense fallback={<p className="min-h-[100svh] py-8 text-center text-sm text-muted">{t.common.loading}</p>}>
      <HomeContent searchParams={searchParams} />
    </Suspense>
  );
}

async function HomeContent({ searchParams }: { searchParams: PageProps<"/[lang]">["searchParams"] }) {
  const query = await searchParams;
  const filter = parseFilter(query);
  // "/?page=1" is the full list without filters; the bare "/" is the curated home
  const listMode = !!(filter.region || filter.category || filter.activity || filter.tag || filter.q) || query.page !== undefined;
  return listMode ? <SpotList filter={filter} /> : <HomeSections />;
}

async function HomeSections() {
  const { lang, t } = await currentLocale();
  const [ranking, newest, beaches, stays, leisure, cafes, views, map, picks] = await Promise.all([
    getWeeklyRanking().catch(() => null),
    // the banner takes its fallback slides from the first of these; the rest feed "newest" after the dedupe (50 = API max)
    getSpots({ page: 1 }, 50),
    getSpots({ category: "BEACH", page: 1 }, 30).catch(() => null),
    // API builds before the STAY category answer 400; the rail just stays hidden then
    getSpots({ category: "STAY", page: 1 }, 30).catch(() => null),
    getSpots({ category: "LEISURE", page: 1 }, 30).catch(() => null),
    getSpots({ category: "CAFE", page: 1 }, 8).catch(() => null),
    getSpots({ q: "전망대", page: 1 }, 12).catch(() => null),
    getSpotMap(),
    getPicks(PICKS),
  ]);
  const ranked = ranking?.items ?? [];
  // a real top 10 once the week has ten liked spots; our picks until then, labelled as picks
  const weeklyTop = ranked.length >= 10;
  const slides = heroSlides(
    t,
    ranked.map((r) => r.spot),
    newest.items.slice(0, 12),
  );
  const h = t.home;
  // a photo from a real spot of each theme, not the first one (that one already leads its own row)
  const photoOf = (items: SpotSummary[] | undefined, skip = 4) =>
    (items ?? []).filter((s) => s.thumbnailUrl).at(skip)?.thumbnailUrl ?? (items ?? []).find((s) => s.thumbnailUrl)?.thumbnailUrl ?? null;

  // Sections lower down skip spots already shown higher up (the banner included), so no card appears twice
  const shown = new Set<number>(slides.map((sl) => sl.id));
  const take = (items: SpotSummary[] | undefined, n: number) => {
    const left = (items ?? []).filter((s) => !shown.has(s.id));
    left.slice(0, n).forEach((s) => shown.add(s.id));
    return left;
  };
  const seaSpots = take(beaches?.items, 8);
  // a collection shows only spots with a photo; a grey tile there looks broken
  const viewPhotos = take(views?.items.filter((s) => s.thumbnailUrl), 5).slice(0, 5);
  const viewCover = viewPhotos[0];
  const viewRest = viewPhotos.slice(1, 5);
  const leisureSpots = take(leisure?.items, 8);
  const staySpots = take(stays?.items, 8);
  const weeklyRail = !weeklyTop && ranked.length >= 4 ? take(ranked.map((r) => r.spot), 8) : [];
  const fresh = take(newest.items, 8).slice(0, 8);

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
            pause: t.home.pause,
            play: t.home.play,
            photoCredit: t.common.photoCredit,
          }}
        />
      )}

      <p className="mt-3 flex items-center gap-2 rounded-2xl bg-surface px-3 py-2 text-[13px] leading-snug">
        <span className="shrink-0 rounded-full bg-accent px-2 py-0.5 text-[11px] font-semibold text-white">{t.home.noticeLabel}</span>
        <span className="min-w-0">{t.home.notice}</span>
      </p>

      <HomeCategories lang={lang} t={t.home} />

      {map && map.total > 0 && <KoreaMap lang={lang} t={t} map={map} />}

      {weeklyTop ? (
        <TopTen
          lang={lang}
          t={t}
          title={h.top10Weekly}
          note={h.top10WeeklyNote}
          seeAll={href(lang, "/ranking")}
          spots={ranked.slice(0, 10).map((r) => r.spot)}
        />
      ) : (
        picks.length >= 5 && <TopTen lang={lang} t={t} title={h.top10Picks} note={h.top10PicksNote} spots={picks} />
      )}

      <ThemeCards
        title={h.themesTitle}
        note={h.themesNote}
        credit={t.common.photoCredit}
        themes={[
          { href: href(lang, "/?category=BEACH"), title: h.themeSea, line: h.themeSeaLine, imageUrl: photoOf(beaches?.items) },
          { href: href(lang, "/?category=CAFE"), title: h.themeCafe, line: h.themeCafeLine, imageUrl: photoOf(cafes?.items, 1) },
          { href: href(lang, "/?category=LEISURE"), title: h.themeLeisure, line: h.themeLeisureLine, imageUrl: photoOf(leisure?.items) },
          { href: href(lang, "/guide"), title: h.themeAi, line: h.themeAiLine, imageUrl: null, ai: true },
        ]}
      />

      {seaSpots.length >= 4 && (
        <ByKey
          t={t}
          title={h.seaViews}
          note={h.seaNote}
          spots={seaSpots}
          keyOf={(s) => s.region}
          labelOf={(k) => t.regions[k as Region]}
          chipsLabel={t.list.region}
          listHref={(k) => href(lang, `/${filterQuery({ category: "BEACH", region: (k || undefined) as Region | undefined })}`)}
          portrait
        />
      )}

      {viewCover && viewRest.length >= 2 && (
        <Collection
          heading={h.collectionHeading}
          note={h.collectionNote}
          title={h.viewTitle}
          line={h.viewLine}
          more={h.more}
          href={href(lang, `/${filterQuery({ q: "전망대" })}`)}
          cover={viewCover}
          spots={viewRest}
          credit={t.common.photoCredit}
        />
      )}

      {leisureSpots.length >= 4 && (
        <ByKey
          t={t}
          title={h.leisureTitle}
          note={h.leisureNote}
          spots={leisureSpots}
          keyOf={(s) => s.activity ?? ""}
          labelOf={(k) => t.activities[k as Activity]}
          chipsLabel={t.list.activity}
          listHref={(k) => href(lang, `/${filterQuery({ category: "LEISURE", activity: (k || undefined) as Activity | undefined })}`)}
        />
      )}

      {staySpots.length >= 4 && (
        <ByKey
          t={t}
          title={h.stays}
          note={h.staysNote}
          spots={staySpots}
          keyOf={(s) => s.region}
          labelOf={(k) => t.regions[k as Region]}
          chipsLabel={t.list.region}
          listHref={(k) => href(lang, `/${filterQuery({ category: "STAY", region: (k || undefined) as Region | undefined })}`)}
          portrait
        />
      )}

      {weeklyRail.length >= 4 && (
        <Rail t={t} title={h.weekly} note={t.ranking.basis} href={href(lang, "/ranking")} spots={weeklyRail.slice(0, 8)} />
      )}
      {fresh.length >= 4 && <Rail t={t} title={h.newest} note={h.newestNote} href={href(lang, "/?page=1")} spots={fresh} />}

      {map && <PopularRegions title={h.popularRegions} tabsLabel={t.list.region} panels={regionPanels(lang, t, map)} />}
    </>
  );
}

// The regions with the most places, each with links to its kinds of places
function regionPanels(lang: Locale, t: Dictionary, map: SpotMap) {
  return (Object.entries(map.regions) as [Region, number][])
    .sort((a, b) => b[1] - a[1])
    .slice(0, 10)
    .map(([r]) => ({
      value: r,
      label: t.regions[r],
      links: [
        { href: href(lang, `/${filterQuery({ region: r })}`), label: fill(t.home.allIn, { region: t.regions[r] }) },
        ...CATEGORIES.map((c) => ({
          href: href(lang, `/${filterQuery({ region: r, category: c })}`),
          label: `${t.regions[r]} ${t.categories[c]}`,
        })),
      ],
    }));
}

// Up to 5 of this week's most liked spots with a photo, topped up with the newest ones when fewer than 3
function heroSlides(t: Dictionary, ranked: SpotSummary[], newest: SpotSummary[]): HeroSlide[] {
  const picked = ranked
    .filter((s) => s.thumbnailUrl)
    .slice(0, 5)
    .map((s) => ({ s, badge: t.home.badgeWeekly }));
  if (picked.length < 3) {
    for (const s of newest) {
      if (picked.length >= 5) break;
      if (s.thumbnailUrl && !picked.some((p) => p.s.id === s.id)) picked.push({ s, badge: t.home.badgeNew });
    }
  }
  return picked.map(({ s, badge }) => ({
    id: s.id,
    badge,
    name: s.name,
    tagline: t.home.taglines[s.category],
    meta: `${t.categories[s.category]} · ${t.regions[s.region]}`,
    imageUrl: s.thumbnailUrl!,
    tourApiPhoto: isTourApiImage(s.thumbnailUrl!),
  }));
}

type RailProps = { t: Dictionary; title: string; note?: string; href: string; spots: SpotSummary[]; ranked?: boolean };

function Rail({ t, title, note, href, spots, ranked }: RailProps) {
  return (
    <section className={LATER}>
      <SectionHead title={title} note={note} href={href} seeAll={t.home.seeAll} />
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

type ByKeyProps = {
  t: Dictionary;
  title: string;
  note: string;
  spots: SpotSummary[];
  keyOf: (s: SpotSummary) => string;
  labelOf: (key: string) => string;
  chipsLabel: string;
  listHref: (key: string) => string;
  portrait?: boolean;
};

// A row with chips (regions, activities) taken from the fetched spots, most common first, so a chip never
// leads to an empty row; spots without a key (no activity yet) only show under "all"
function ByKey({ t, title, note, spots, keyOf, labelOf, chipsLabel, listHref, portrait }: ByKeyProps) {
  const counts = new Map<string, number>();
  for (const s of spots) {
    const k = keyOf(s);
    if (k) counts.set(k, (counts.get(k) ?? 0) + 1);
  }
  const keys = [...counts.entries()].sort((a, b) => b[1] - a[1]).slice(0, 6).map(([k]) => k);
  return (
    <div className={LATER}>
      <ChipRail
        title={title}
        note={note}
        seeAll={t.home.seeAll}
        chipsLabel={chipsLabel}
        chips={[{ value: "", label: t.list.all, href: listHref("") }, ...keys.map((k) => ({ value: k, label: labelOf(k), href: listHref(k) }))]}
        items={spots.map((s) => ({
          id: s.id,
          key: keyOf(s),
          card: <SpotCard spot={s} portrait={portrait} className="w-[40%] shrink-0 snap-start sm:w-[28%] md:w-auto" />,
        }))}
      />
      <PhotoCredit spots={spots} text={t.common.photoCredit} />
    </div>
  );
}

function PhotoCredit({ spots, text }: { spots: SpotSummary[]; text: string }) {
  if (!spots.some((s) => s.thumbnailUrl && isTourApiImage(s.thumbnailUrl))) return null;
  return <p className="mt-2 text-right text-[11px] text-muted">{text}</p>;
}

async function SpotList({ filter }: { filter: SpotFilter }) {
  const { lang, t } = await currentLocale();
  // Stays arrive with the nightly sync, and an API that predates the STAY category answers 400:
  // either way the visitor gets a plain "coming soon" note instead of the error page
  const stays = filter.category === "STAY";
  const result = stays
    ? await getSpots(filter).catch(() => ({ items: [], page: 0, size: 0, totalElements: 0, totalPages: 0 }))
    : await getSpots(filter);

  return (
    <>
      <nav aria-label={t.list.filtersLabel}>
        <CategoryTabs lang={lang} t={t} filter={filter} />
        {filter.category === "LEISURE" && <ActivityChips lang={lang} t={t} filter={filter} />}
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

      {result.items.length === 0 && stays && !filter.q && !filter.region && !filter.tag ? (
        <p className="py-10 text-center text-sm text-muted">{t.list.staysSoon}</p>
      ) : result.items.length === 0 ? (
        <p className="py-10 text-center text-sm text-muted">
          {filter.q ? t.list.noResults : t.list.noMatch}{" "}
          <Link href={`/${lang}`} className="text-accent">
            {filter.q ? t.list.startOver : t.list.clearFilters}
          </Link>
        </p>
      ) : (
        <ul className="grid grid-cols-2 gap-x-3 gap-y-5 sm:gap-x-5 md:grid-cols-3 lg:grid-cols-4">
          {result.items.map((spot) => (
            <SpotCard key={spot.id} spot={spot} swipe />
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
  const parts = [
    f.region && t.regions[f.region],
    f.tag && t.tags[f.tag],
    f.activity ? t.activities[f.activity] : f.category && t.categories[f.category],
  ];
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
        href={href(lang, `/${filterQuery({ ...filter, category: value, activity: undefined, page: 1 })}`)}
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

// Things to do by type, one scrolling row so phones stay compact
function ActivityChips({ lang, t, filter }: ListProps) {
  const chip = (value: SpotFilter["activity"], text: string) => {
    const on = filter.activity === value;
    return (
      <Link
        key={value ?? "all"}
        href={href(lang, `/${filterQuery({ ...filter, activity: value, page: 1 })}`)}
        aria-current={on ? "true" : undefined}
        className={`shrink-0 rounded-full px-3 py-1 text-sm ${on ? "bg-foreground text-surface" : "bg-surface hover:bg-sand"}`}
      >
        {text}
      </Link>
    );
  };
  return (
    <div aria-label={t.list.activity} className="-mx-4 mt-3 flex gap-1.5 overflow-x-auto px-4 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
      {chip(undefined, t.list.all)}
      {ACTIVITIES.map((a) => chip(a, t.activities[a]))}
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
