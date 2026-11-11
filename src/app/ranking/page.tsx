import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";
import {
  CATEGORIES,
  REGIONS,
  getWeeklyRanking,
  isTourApiImage,
  isoWeekRange,
  type RankedSpot,
} from "@/lib/api";
import { Rating } from "../rating";

export const metadata: Metadata = {
  title: "이번 주 인기 장소 · 위로케이션",
  description: "이번 주 좋아요를 가장 많이 받은 장소 10곳.",
};

export default function RankingPage() {
  return (
    <section className="mx-auto max-w-2xl">
      <h1 className="text-xl font-bold">이번 주 인기 장소</h1>
      <Suspense fallback={<p className="py-8 text-center text-sm text-muted">불러오는 중…</p>}>
        <Ranking />
      </Suspense>
    </section>
  );
}

async function Ranking() {
  const ranking = await getWeeklyRanking();
  const range = isoWeekRange(ranking.week);
  const day = (d: Date) => `${d.getUTCMonth() + 1}월 ${d.getUTCDate()}일`;

  return (
    <>
      <p className="mt-0.5 text-sm text-muted">
        {range ? `${day(range.start)} ~ ${day(range.end)}` : ranking.week} · 월요일 0시부터 받은 좋아요 순
      </p>

      {ranking.items.length === 0 ? (
        <div className="py-10 text-center">
          <p className="text-sm text-muted">이번 주에는 아직 좋아요를 받은 장소가 없어요.</p>
          <Link href="/" className="mt-2 inline-block text-sm text-accent">
            장소 둘러보기
          </Link>
        </div>
      ) : (
        <>
          <ol className="mt-3 space-y-2">
            {ranking.items.map((item) => (
              <RankRow key={item.spot.id} item={item} />
            ))}
          </ol>
          {ranking.items.some((i) => i.spot.thumbnailUrl && isTourApiImage(i.spot.thumbnailUrl)) && (
            <p className="mt-2 text-right text-xs text-muted">사진 출처: 한국관광공사</p>
          )}
        </>
      )}
    </>
  );
}

function RankRow({ item }: { item: RankedSpot }) {
  const { rank, weeklyLikes, spot } = item;
  return (
    <li className="min-w-0">
      <Link
        href={`/spots/${spot.id}`}
        className="flex items-center gap-3 rounded-lg border border-line bg-white p-2 hover:border-accent"
      >
        <span className={`w-6 shrink-0 text-center text-lg font-bold ${rank <= 3 ? "text-accent" : "text-muted"}`}>
          {rank}
          <span className="sr-only">위</span>
        </span>
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
          <Rating average={spot.averageRating} count={spot.reviewCount} />
        </div>
        <span className="shrink-0 text-sm text-accent">
          <span aria-hidden="true">♥ </span>
          <span className="sr-only">이번 주 좋아요 </span>
          {weeklyLikes}
        </span>
      </Link>
    </li>
  );
}
