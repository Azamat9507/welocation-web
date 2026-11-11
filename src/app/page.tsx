import Link from "next/link";
import { Suspense } from "react";
import {
  CATEGORIES,
  REGIONS,
  TAGS,
  filterQuery,
  getSpots,
  parseFilter,
  type SpotFilter,
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
  const result = await getSpots(filter);

  return (
    <>
      <nav aria-label="필터" className="space-y-2">
        <ChipRow label="종류" options={CATEGORIES} name="category" filter={filter} />
        <ChipRow label="지역" options={REGIONS} name="region" filter={filter} />
        <ChipRow label="태그" options={TAGS} name="tag" filter={filter} />
      </nav>

      <p className="mt-4 mb-2 text-sm text-muted">{result.totalElements.toLocaleString("ko-KR")}곳</p>

      {result.items.length === 0 ? (
        <p className="py-8 text-center text-sm text-muted">조건에 맞는 장소가 없어요.</p>
      ) : (
        <ul className="grid grid-cols-1 gap-2 sm:grid-cols-2 sm:gap-4 lg:grid-cols-3">
          {result.items.map((spot) => (
            <SpotCard key={spot.id} spot={spot} />
          ))}
        </ul>
      )}

      <Pagination filter={filter} totalPages={result.totalPages} />
    </>
  );
}

function ChipRow<K extends "category" | "region" | "tag">({
  label,
  options,
  name,
  filter,
}: {
  label: string;
  options: Record<string, string>;
  name: K;
  filter: SpotFilter;
}) {
  const current = filter[name];
  const chip = (value: string | undefined, text: string) => {
    const active = current === value;
    return (
      <Link
        key={value ?? "all"}
        href={`/${filterQuery({ ...filter, [name]: value, page: 1 })}`}
        aria-current={active ? "true" : undefined}
        className={`shrink-0 rounded-full border px-3 py-1 text-sm ${
          active ? "border-accent bg-accent text-white" : "border-line bg-white hover:border-accent"
        }`}
      >
        {text}
      </Link>
    );
  };
  return (
    <div className="flex min-w-0 items-center gap-2">
      <span className="w-8 shrink-0 text-xs text-muted">{label}</span>
      <div className="-mr-4 flex min-w-0 flex-1 gap-1.5 overflow-x-auto pr-4 pb-1">
        {chip(undefined, "전체")}
        {Object.entries(options).map(([value, text]) => chip(value, text))}
      </div>
    </div>
  );
}

function Pagination({ filter, totalPages }: { filter: SpotFilter; totalPages: number }) {
  if (totalPages <= 1) return null;
  const link = (page: number, text: string, enabled: boolean) =>
    enabled ? (
      <Link href={`/${filterQuery({ ...filter, page })}`} className="rounded border border-line bg-white px-3 py-1">
        {text}
      </Link>
    ) : (
      <span className="rounded border border-line px-3 py-1 text-muted">{text}</span>
    );
  return (
    <nav aria-label="페이지" className="mt-4 flex items-center justify-center gap-3 text-sm">
      {link(filter.page - 1, "이전", filter.page > 1)}
      <span className="text-muted">
        {filter.page} / {totalPages}
      </span>
      {link(filter.page + 1, "다음", filter.page < totalPages)}
    </nav>
  );
}
