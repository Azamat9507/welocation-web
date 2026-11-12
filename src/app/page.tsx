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
import { HeroCarousel, type HeroSlide } from "./hero-carousel";
import { HomeCategories } from "./home-categories";
import { SpotCard } from "./spot-card";

export default function Home({ searchParams }: PageProps<"/">) {
  return (
    <Suspense fallback={<p className="py-8 text-center text-sm text-muted">불러오는 중…</p>}>
      <HomeContent searchParams={searchParams} />
    </Suspense>
  );
}

async function HomeContent({ searchParams }: { searchParams: PageProps<"/">["searchParams"] }) {
  const query = await searchParams;
  const filter = parseFilter(query);
  // "/?page=1" is the full list without filters; the bare "/" is the curated home
  const listMode = !!(filter.region || filter.category || filter.tag || filter.q) || query.page !== undefined;
  return listMode ? <SpotList filter={filter} /> : <HomeSections />;
}

async function HomeSections() {
  const [ranking, newest, cafes] = await Promise.all([
    getWeeklyRanking().catch(() => null),
    getSpots({ page: 1 }, 12),
    waterCafes(),
  ]);
  const ranked = ranking?.items ?? [];
  const slides = heroSlides(
    ranked.map((r) => r.spot),
    newest.items,
  );

  return (
    <>
      {slides.length > 0 && <HeroCarousel slides={slides} />}

      <p className="mt-3 flex items-center gap-2 rounded-2xl bg-surface px-3 py-2 text-[13px] leading-snug">
        <span className="shrink-0 rounded-full bg-accent px-2 py-0.5 text-[11px] font-semibold text-white">안내</span>
        <span className="min-w-0">매일 밤 한국관광공사 데이터로 새 장소와 사진을 업데이트해요</span>
      </p>

      <HomeCategories />

      {ranked.length > 0 && (
        <Rail title="이번 주 인기" href="/ranking" spots={ranked.slice(0, 8).map((r) => r.spot)} ranked />
      )}
      {cafes.spots.length > 0 && <Rail title="바다가 보이는 카페" href={`/${cafes.query}`} spots={cafes.spots} />}
      <Rail title="새로 추가된 장소" href="/?page=1" spots={newest.items.slice(0, 8)} />
    </>
  );
}

// No cafe carries the ocean-view tag until tags are curated, so fall back to cafes in general
async function waterCafes(): Promise<{ spots: SpotSummary[]; query: string }> {
  const tagged: SpotFilter = { category: "CAFE", tag: "OCEAN_VIEW", page: 1 };
  const ocean = await getSpots(tagged, 8).catch(() => null);
  if (ocean && ocean.items.length >= 4) return { spots: ocean.items, query: filterQuery(tagged) };
  const any: SpotFilter = { category: "CAFE", page: 1 };
  const cafes = await getSpots(any, 8).catch(() => null);
  return { spots: cafes?.items ?? [], query: filterQuery(any) };
}

// Up to 5 of this week's most liked spots with a photo, topped up with the newest ones when fewer than 3
function heroSlides(ranked: SpotSummary[], newest: SpotSummary[]): HeroSlide[] {
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
    meta: `${CATEGORIES[s.category]} · ${REGIONS[s.region]}`,
    imageUrl: s.thumbnailUrl!,
    tourApiPhoto: isTourApiImage(s.thumbnailUrl!),
  }));
}

function Rail({ title, href, spots, ranked }: { title: string; href: string; spots: SpotSummary[]; ranked?: boolean }) {
  return (
    <section className="mt-7">
      <div className="mb-3 flex items-baseline justify-between">
        <h2 className="text-lg font-bold tracking-tight">{title}</h2>
        <Link href={href} className="shrink-0 text-sm text-muted hover:text-foreground">
          전체보기 ›
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
      <PhotoCredit spots={spots} />
    </section>
  );
}

function PhotoCredit({ spots }: { spots: SpotSummary[] }) {
  if (!spots.some((s) => s.thumbnailUrl && isTourApiImage(s.thumbnailUrl))) return null;
  return <p className="mt-2 text-right text-[11px] text-muted">사진 출처: 한국관광공사</p>;
}

async function SpotList({ filter }: { filter: SpotFilter }) {
  const result = await getSpots(filter);

  return (
    <>
      <nav aria-label="필터">
        <CategoryTabs filter={filter} />
        <MoreFilters filter={filter} />
      </nav>

      <div className="mt-5 mb-3 flex items-baseline justify-between">
        <h1 className="min-w-0 text-lg font-bold tracking-tight break-all">
          {heading(filter)}
          <span className="ml-2 text-sm font-normal text-muted">{result.totalElements.toLocaleString("ko-KR")}곳</span>
        </h1>
      </div>

      {result.items.length === 0 ? (
        <p className="py-10 text-center text-sm text-muted">
          {filter.q ? "검색 결과가 없어요." : "조건에 맞는 장소가 없어요."}{" "}
          <Link href="/" className="text-accent">
            {filter.q ? "처음으로" : "필터 지우기"}
          </Link>
        </p>
      ) : (
        <ul className="grid grid-cols-2 gap-x-3 gap-y-5 sm:gap-x-5 md:grid-cols-3 lg:grid-cols-4">
          {result.items.map((spot) => (
            <SpotCard key={spot.id} spot={spot} />
          ))}
        </ul>
      )}
      <PhotoCredit spots={result.items} />

      <Pagination filter={filter} totalPages={result.totalPages} />
    </>
  );
}

function heading(f: SpotFilter) {
  if (f.q) return `“${f.q}” 검색 결과`;
  const parts = [f.region && REGIONS[f.region], f.tag && TAGS[f.tag], f.category && CATEGORIES[f.category]];
  const text = parts.filter(Boolean).join(" ");
  return text || "모든 장소";
}

function CategoryTabs({ filter }: { filter: SpotFilter }) {
  const tab = (value: SpotFilter["category"], text: string) => {
    const active = filter.category === value;
    return (
      <Link
        key={value ?? "all"}
        href={`/${filterQuery({ ...filter, category: value, page: 1 })}`}
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
      {tab(undefined, "전체")}
      {(Object.entries(CATEGORIES) as [SpotFilter["category"], string][]).map(([v, t]) => tab(v, t))}
    </div>
  );
}

// Region and tag live in a native disclosure: no script needed, closed by default so phones stay compact
function MoreFilters({ filter }: { filter: SpotFilter }) {
  const active = [
    filter.region && { key: "region" as const, text: REGIONS[filter.region] },
    filter.tag && { key: "tag" as const, text: TAGS[filter.tag] },
  ].filter(Boolean) as { key: "region" | "tag"; text: string }[];

  const chip = (name: "region" | "tag", value: string | undefined, text: string) => {
    const on = filter[name] === value;
    return (
      <Link
        key={value ?? "all"}
        href={`/${filterQuery({ ...filter, [name]: value, page: 1 })}`}
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
          지역 · 분위기 <span className="text-muted group-open:rotate-180">▾</span>
        </summary>
        <div className="mt-3 space-y-3 rounded-xl bg-surface p-3">
          <div>
            <p className="mb-1.5 text-xs text-muted">지역</p>
            <div className="flex flex-wrap gap-1.5">
              {chip("region", undefined, "전체")}
              {Object.entries(REGIONS).map(([v, t]) => chip("region", v, t))}
            </div>
          </div>
          <div>
            <p className="mb-1.5 text-xs text-muted">분위기</p>
            <div className="flex flex-wrap gap-1.5">
              {chip("tag", undefined, "전체")}
              {Object.entries(TAGS).map(([v, t]) => chip("tag", v, t))}
            </div>
          </div>
        </div>
      </details>
      {active.map((a) => (
        <Link
          key={a.key}
          href={`/${filterQuery({ ...filter, [a.key]: undefined, page: 1 })}`}
          aria-label={`${a.text} 필터 지우기`}
          className="rounded-full bg-accent px-3 py-1 text-sm text-white"
        >
          {a.text} ✕
        </Link>
      ))}
    </div>
  );
}

function Pagination({ filter, totalPages }: { filter: SpotFilter; totalPages: number }) {
  if (totalPages <= 1) return null;
  const link = (page: number, text: string, enabled: boolean) =>
    enabled ? (
      <Link href={`/${filterQuery({ ...filter, page }) || "?page=1"}`} className="rounded-full bg-surface px-4 py-1.5 hover:bg-sand">
        {text}
      </Link>
    ) : (
      <span className="rounded-full px-4 py-1.5 text-muted/60">{text}</span>
    );
  return (
    <nav aria-label="페이지" className="mt-8 flex items-center justify-center gap-3 text-sm">
      {link(filter.page - 1, "← 이전", filter.page > 1)}
      <span className="text-muted">
        {filter.page} / {totalPages}
      </span>
      {link(filter.page + 1, "다음 →", filter.page < totalPages)}
    </nav>
  );
}
