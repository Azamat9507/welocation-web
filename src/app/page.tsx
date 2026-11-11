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
import { SpotCard } from "./spot-card";

export default function Home({ searchParams }: PageProps<"/">) {
  return (
    <Suspense fallback={<p className="py-8 text-center text-sm text-muted">불러오는 중…</p>}>
      <SpotList searchParams={searchParams} />
    </Suspense>
  );
}

async function SpotList({ searchParams }: { searchParams: PageProps<"/">["searchParams"] }) {
  const filter = parseFilter(await searchParams);
  const unfiltered = !filter.region && !filter.category && !filter.tag && filter.page === 1;
  const [result, featured] = await Promise.all([getSpots(filter), unfiltered ? pickFeatured() : null]);
  const hero = featured ?? null;

  return (
    <>
      {hero && <Hero spot={hero} />}

      <nav aria-label="필터" className={hero ? "mt-6" : ""}>
        <CategoryTabs filter={filter} />
        <MoreFilters filter={filter} />
      </nav>

      <div className="mt-5 mb-3 flex items-baseline justify-between">
        <h1 className="text-lg font-bold tracking-tight">
          {heading(filter)}
          <span className="ml-2 text-sm font-normal text-muted">{result.totalElements.toLocaleString("ko-KR")}곳</span>
        </h1>
      </div>

      {result.items.length === 0 ? (
        <p className="py-10 text-center text-sm text-muted">
          조건에 맞는 장소가 없어요.{" "}
          <Link href="/" className="text-accent">
            필터 지우기
          </Link>
        </p>
      ) : (
        <ul className="grid grid-cols-2 gap-x-3 gap-y-5 sm:gap-x-5 md:grid-cols-3 lg:grid-cols-4">
          {result.items.map((spot) => (
            <SpotCard key={spot.id} spot={spot} />
          ))}
        </ul>
      )}

      <Pagination filter={filter} totalPages={result.totalPages} />
    </>
  );
}

// This week's most liked spot with a photo; if nobody liked anything yet, a newest spot with a photo
async function pickFeatured(): Promise<SpotSummary | null> {
  const ranked = await getWeeklyRanking().catch(() => null);
  const top = ranked?.items.find((r) => r.spot.thumbnailUrl)?.spot;
  if (top) return top;
  const page = await getSpots({ category: "BEACH", page: 1 }).catch(() => null);
  return page?.items.find((s) => s.thumbnailUrl) ?? null;
}

function Hero({ spot }: { spot: SpotSummary }) {
  return (
    <Link href={`/spots/${spot.id}`} className="group relative block overflow-hidden rounded-2xl bg-sand">
      {/* eslint-disable-next-line @next/next/no-img-element -- 공공누리 photo, shown unaltered */}
      <img src={spot.thumbnailUrl!} alt="" className="h-48 w-full object-cover sm:h-72" />
      <div className="absolute inset-0 bg-gradient-to-t from-black/65 via-black/10 to-transparent" />
      <div className="absolute right-4 bottom-3 left-4 min-w-0 text-white">
        <p className="text-xs font-medium tracking-wide opacity-90">오늘의 위로</p>
        <p className="truncate text-xl font-bold tracking-tight sm:text-3xl">{spot.name}</p>
        <p className="truncate text-xs opacity-90 sm:text-sm">
          {REGIONS[spot.region]} · {CATEGORIES[spot.category]}
        </p>
      </div>
      {isTourApiImage(spot.thumbnailUrl!) && (
        <span className="absolute top-2 right-3 text-[10px] text-white/80">사진 출처: 한국관광공사</span>
      )}
    </Link>
  );
}

function heading(f: SpotFilter) {
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
      <Link href={`/${filterQuery({ ...filter, page })}`} className="rounded-full bg-surface px-4 py-1.5 hover:bg-sand">
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
