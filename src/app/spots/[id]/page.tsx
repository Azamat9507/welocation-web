import Link from "next/link";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import { CATEGORIES, REGIONS, TAGS, getReviews, getSpot, isTourApiImage, type Page, type Review } from "@/lib/api";
import { findMyReview, getMe, getMyState } from "@/lib/api-auth";
import { Rating } from "../../rating";
import { Directions } from "./directions";
import { Gallery } from "./gallery";
import { ReviewForm } from "./review-form";
import { Toggles } from "./toggles";

export default function SpotPage({ params }: PageProps<"/spots/[id]">) {
  return (
    <Suspense fallback={<p className="py-8 text-center text-sm text-muted">불러오는 중…</p>}>
      <Spot params={params} />
    </Suspense>
  );
}

async function Spot({ params }: { params: PageProps<"/spots/[id]">["params"] }) {
  const { id: raw } = await params;
  const id = Number(raw);
  if (!/^\d{1,18}$/.test(raw) || !Number.isSafeInteger(id)) notFound();

  const [spot, reviews] = await Promise.all([getSpot(id), getReviews(id)]);
  if (!spot) notFound();

  return (
    <article className="mx-auto max-w-2xl">
      <Link href="/" className="text-sm text-muted hover:text-accent">
        ← 목록
      </Link>

      {spot.images.length > 0 && (
        <Gallery images={spot.images} name={spot.name} credit={spot.images.some(isTourApiImage)} />
      )}

      <p className="mt-3 text-xs text-muted">
        {CATEGORIES[spot.category]} · {REGIONS[spot.region]}
      </p>
      <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">{spot.name}</h1>
      <div className="mt-1 flex items-center gap-3">
        <Rating average={spot.averageRating} count={spot.reviewCount} />
      </div>

      {spot.tags.length > 0 && (
        <ul className="mt-2 flex flex-wrap gap-1.5">
          {spot.tags.map((t) => (
            <li key={t} className="rounded-full bg-accent-soft px-2 py-0.5 text-xs text-accent">
              {TAGS[t]}
            </li>
          ))}
        </ul>
      )}

      <Directions name={spot.name} address={spot.address} lat={spot.latitude} lng={spot.longitude} />

      <Suspense fallback={<div className="mt-3 h-8" />}>
        <Mine spotId={spot.id} likeCount={spot.likeCount ?? 0} />
      </Suspense>

      {spot.description && <p className="mt-3 text-sm leading-relaxed whitespace-pre-line">{spot.description}</p>}

      <section id="reviews" className="mt-6">
        <h2 className="text-lg font-bold tracking-tight">리뷰 {spot.reviewCount}</h2>
        <Suspense>
          <MyReview spotId={spot.id} reviews={reviews} />
        </Suspense>
        {!reviews || reviews.items.length === 0 ? (
          <p className="mt-2 text-sm text-muted">첫 리뷰를 기다리고 있어요.</p>
        ) : (
          <ul className="mt-2 divide-y divide-line">
            {reviews.items.map((r) => (
              <li key={r.id} className="py-2">
                <p className="text-xs text-muted">
                  <span className="text-accent">{"★".repeat(r.rating)}</span> {r.author.nickname} ·{" "}
                  {new Date(r.createdAt).toLocaleDateString("ko-KR")}
                </p>
                <p className="text-sm whitespace-pre-line">{r.content}</p>
              </li>
            ))}
          </ul>
        )}
      </section>
    </article>
  );
}

// Reads the session cookie, so it streams in after the public part of the page
async function Mine({ spotId, likeCount }: { spotId: number; likeCount: number }) {
  const me = await getMe().catch(() => null);
  const state = me ? await getMyState(spotId) : null;
  return (
    <Toggles
      spotId={spotId}
      likeCount={likeCount}
      liked={me ? (state?.liked ?? null) : false}
      bookmarked={me ? (state?.bookmarked ?? null) : false}
    />
  );
}

async function MyReview({ spotId, reviews }: { spotId: number; reviews: Page<Review> | null }) {
  const me = await getMe().catch(() => null);
  if (!me) {
    return (
      <p className="mt-2 text-sm">
        <Link href={`/login?next=${encodeURIComponent(`/spots/${spotId}#reviews`)}`} className="text-accent">
          로그인
        </Link>
        <span className="text-muted">하고 리뷰를 남겨 보세요.</span>
      </p>
    );
  }
  const review = await findMyReview(spotId, me, reviews?.items ?? []);
  return <ReviewForm key={review?.id ?? "new"} spotId={spotId} review={review} />;
}
