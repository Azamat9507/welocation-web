import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";
import {
  CATEGORIES,
  NEARBY_RADII,
  REGIONS,
  formatDistance,
  getNearby,
  isTourApiImage,
  nearbyQuery,
  parseNearby,
  type NearbyFilter,
  type NearbySpot,
} from "@/lib/api";
import { LocateButton } from "./locate-button";

export const metadata: Metadata = {
  title: "내 주변 장소 · WeLocation",
  description: "지금 있는 곳에서 가까운 카페, 해변, 호수, 전망대를 거리순으로 보여 드려요.",
};

export default function NearbyPage({ searchParams }: PageProps<"/nearby">) {
  return (
    <section className="mx-auto max-w-2xl">
      <h1 className="text-xl font-bold">내 주변 장소</h1>
      <Suspense fallback={<p className="py-8 text-center text-sm text-muted">불러오는 중…</p>}>
        <Nearby searchParams={searchParams} />
      </Suspense>
    </section>
  );
}

async function Nearby({ searchParams }: { searchParams: PageProps<"/nearby">["searchParams"] }) {
  const q = await searchParams;
  const filter = parseNearby(q);
  const rejectedPoint = !filter.point && (q.lat !== undefined || q.lng !== undefined);

  return (
    <>
      <p className="mt-0.5 text-sm text-muted">
        위치는 이번 검색에만 쓰고 저장하지 않아요. 주소창에는 약 100m 단위로 줄인 좌표만 남아요.
      </p>

      <div className="mt-3">
        <LocateButton
          radius={filter.radius}
          category={filter.category}
          again={filter.point !== null}
        />
      </div>

      <nav aria-label="필터" className="mt-3 space-y-2">
        <ChipRow
          label="반경"
          items={NEARBY_RADII.map((r) => ({
            text: `${r}km`,
            active: filter.radius === r,
            href: `/nearby${nearbyQuery({ ...filter, radius: r })}`,
          }))}
        />
        <ChipRow
          label="종류"
          items={[
            { text: "전체", active: !filter.category, href: `/nearby${nearbyQuery({ ...filter, category: undefined })}` },
            ...Object.entries(CATEGORIES).map(([value, text]) => ({
              text,
              active: filter.category === value,
              href: `/nearby${nearbyQuery({ ...filter, category: value as keyof typeof CATEGORIES })}`,
            })),
          ]}
        />
      </nav>

      {filter.point ? (
        <Results filter={filter} point={filter.point} />
      ) : (
        <div className="py-10 text-center text-sm text-muted">
          {rejectedPoint ? (
            <p>이 위치는 찾을 수 없어요. 위로케이션은 한국 안의 장소만 보여 드려요.</p>
          ) : (
            <p>&lsquo;내 주변 찾기&rsquo;를 누르면 가까운 장소를 거리순으로 보여 드려요.</p>
          )}
          <Link href="/" className="mt-2 inline-block text-accent">
            전체 장소 둘러보기
          </Link>
        </div>
      )}
    </>
  );
}

async function Results({ filter, point }: { filter: NearbyFilter; point: { lat: number; lng: number } }) {
  const spots = await getNearby(point, filter.radius, filter.category);
  const bigger = NEARBY_RADII.find((r) => r > filter.radius);

  if (spots.length === 0) {
    return (
      <div className="py-10 text-center text-sm">
        <p className="text-muted">
          반경 {filter.radius}km 안에 {filter.category ? `${CATEGORIES[filter.category]} ` : ""}장소가 없어요.
        </p>
        {bigger && (
          <Link href={`/nearby${nearbyQuery({ ...filter, radius: bigger })}`} className="mt-2 inline-block text-accent">
            {bigger}km로 넓혀서 찾기
          </Link>
        )}
        {!bigger && filter.category && (
          <Link
            href={`/nearby${nearbyQuery({ ...filter, category: undefined })}`}
            className="mt-2 inline-block text-accent"
          >
            모든 종류 보기
          </Link>
        )}
      </div>
    );
  }

  return (
    <>
      <p className="mt-4 mb-2 text-sm text-muted">
        반경 {filter.radius}km · 가까운 순 {spots.length}곳{spots.length >= 50 ? " (최대 50곳)" : ""}
      </p>
      <ul className="space-y-2">
        {spots.map((spot) => (
          <NearbyRow key={spot.id} spot={spot} />
        ))}
      </ul>
      {spots.some((s) => s.thumbnailUrl && isTourApiImage(s.thumbnailUrl)) && (
        <p className="mt-2 text-right text-xs text-muted">사진 출처: 한국관광공사</p>
      )}
    </>
  );
}

function NearbyRow({ spot }: { spot: NearbySpot }) {
  return (
    <li className="min-w-0">
      <Link
        href={`/spots/${spot.id}`}
        className="flex items-center gap-3 rounded-lg border border-line bg-surface p-2 hover:border-accent"
      >
        <div className="h-14 w-14 shrink-0 overflow-hidden rounded-md bg-accent-soft">
          {spot.thumbnailUrl && (
            // served as-is: the 공공누리 license does not allow altering the photo
            // eslint-disable-next-line @next/next/no-img-element
            <img src={spot.thumbnailUrl} alt="" loading="lazy" className="h-full w-full object-cover" />
          )}
        </div>
        <div className="min-w-0 flex-1">
          <p className="text-xs text-muted">
            {CATEGORIES[spot.category]} · {REGIONS[spot.region]}
          </p>
          <h2 className="truncate font-semibold">{spot.name}</h2>
          <p className="truncate text-sm text-muted">{spot.address}</p>
        </div>
        <span className="shrink-0 text-sm font-semibold text-accent">
          <span className="sr-only">거리 </span>
          {formatDistance(spot.distanceMeters)}
        </span>
      </Link>
    </li>
  );
}

function ChipRow({ label, items }: { label: string; items: { text: string; active: boolean; href: string }[] }) {
  return (
    <div className="flex min-w-0 items-center gap-2">
      <span className="w-8 shrink-0 text-xs text-muted">{label}</span>
      <div className="-mr-4 flex min-w-0 flex-1 gap-1.5 overflow-x-auto pr-4 pb-1">
        {items.map((item) => (
          <Link
            key={item.text}
            href={item.href}
            aria-current={item.active ? "true" : undefined}
            className={`shrink-0 rounded-full border px-3 py-1 text-sm ${
              item.active ? "border-accent bg-accent text-white" : "border-line bg-surface hover:border-accent"
            }`}
          >
            {item.text}
          </Link>
        ))}
      </div>
    </div>
  );
}
