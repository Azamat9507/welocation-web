import Link from "next/link";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import { getReviews, getSpot, isTourApiImage, type Page, type Review } from "@/lib/api";
import { findMyReview, getMe, getMyState } from "@/lib/api-auth";
import { currentLocale } from "@/lib/current-locale";
import { fill, href, intlLocale } from "@/lib/i18n";
import { Rating } from "../../rating";
import { Directions } from "./directions";
import { Gallery } from "./gallery";
import { ReviewForm } from "./review-form";
import { Toggles } from "./toggles";

export default async function SpotPage({ params }: PageProps<"/[lang]/spots/[id]">) {
  const { t } = await currentLocale();
  return (
    <Suspense fallback={<p className="py-8 text-center text-sm text-muted">{t.common.loading}</p>}>
      <Spot params={params} />
    </Suspense>
  );
}

async function Spot({ params }: { params: PageProps<"/[lang]/spots/[id]">["params"] }) {
  const { lang, t } = await currentLocale();
  const { id: raw } = await params;
  const id = Number(raw);
  if (!/^\d{1,18}$/.test(raw) || !Number.isSafeInteger(id)) notFound();

  const [spot, reviews] = await Promise.all([getSpot(id), getReviews(id)]);
  if (!spot) notFound();

  return (
    <article className="mx-auto max-w-2xl">
      <Link href={`/${lang}`} className="text-sm text-muted hover:text-accent">
        {t.spot.back}
      </Link>

      {spot.images.length > 0 && (
        <Gallery
          images={spot.images}
          name={spot.name}
          credit={spot.images.some(isTourApiImage) ? t.common.photoCredit : null}
          labels={t.spot.gallery}
        />
      )}

      <p className="mt-3 text-xs text-muted">
        {t.categories[spot.category]} · {t.regions[spot.region]}
      </p>
      <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">{spot.name}</h1>
      <div className="mt-1 flex items-center gap-3">
        <Rating average={spot.averageRating} count={spot.reviewCount} labels={t.rating} />
      </div>

      {spot.tags.length > 0 && (
        <ul className="mt-2 flex flex-wrap gap-1.5">
          {spot.tags.map((tag) => (
            <li key={tag} className="rounded-full bg-accent-soft px-2 py-0.5 text-xs text-accent">
              {t.tags[tag]}
            </li>
          ))}
        </ul>
      )}

      <Directions
        name={spot.name}
        address={spot.address}
        lat={spot.latitude}
        lng={spot.longitude}
        labels={t.spot.directions}
      />

      <Suspense fallback={<div className="mt-3 h-8" />}>
        <Mine spotId={spot.id} likeCount={spot.likeCount ?? 0} />
      </Suspense>

      {spot.description && <p className="mt-3 text-sm leading-relaxed whitespace-pre-line">{spot.description}</p>}

      <section id="reviews" className="mt-6">
        <h2 className="text-lg font-bold tracking-tight">{fill(t.spot.reviews, { n: spot.reviewCount })}</h2>
        <Suspense>
          <MyReview spotId={spot.id} reviews={reviews} />
        </Suspense>
        {!reviews || reviews.items.length === 0 ? (
          <p className="mt-2 text-sm text-muted">{t.spot.noReviews}</p>
        ) : (
          <ul className="mt-2 divide-y divide-line">
            {reviews.items.map((r) => (
              <li key={r.id} className="py-2">
                <p className="text-xs text-muted">
                  <span className="text-accent">{"★".repeat(r.rating)}</span> {r.author.nickname} ·{" "}
                  {new Date(r.createdAt).toLocaleDateString(intlLocale(lang))}
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
  const { lang, t } = await currentLocale();
  const me = await getMe().catch(() => null);
  const state = me ? await getMyState(spotId) : null;
  return (
    <Toggles
      spotId={spotId}
      likeCount={likeCount}
      liked={me ? (state?.liked ?? null) : false}
      bookmarked={me ? (state?.bookmarked ?? null) : false}
      lang={lang}
      labels={{ like: t.spot.like, unlike: t.spot.unlike, bookmark: t.spot.bookmark, unbookmark: t.spot.unbookmark }}
    />
  );
}

async function MyReview({ spotId, reviews }: { spotId: number; reviews: Page<Review> | null }) {
  const { lang, t } = await currentLocale();
  const me = await getMe().catch(() => null);
  if (!me) {
    return (
      <p className="mt-2 text-sm">
        <Link href={`/${lang}/login?next=${encodeURIComponent(href(lang, `/spots/${spotId}#reviews`))}`} className="text-accent">
          {t.spot.login}
        </Link>
        <span className="text-muted">{t.spot.loginToReview}</span>
      </p>
    );
  }
  const review = await findMyReview(spotId, me, reviews?.items ?? []);
  return <ReviewForm key={review?.id ?? "new"} spotId={spotId} review={review} lang={lang} t={t.review} />;
}
