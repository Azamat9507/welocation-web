import Link from "next/link";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import { getReviews, getSpot, isTourApiImage, isVideoId, type Page, type Review } from "@/lib/api";
import { findMyReview, getMe, getMyState } from "@/lib/api-auth";
import { currentLocale } from "@/lib/current-locale";
import type { Dictionary } from "@/lib/dictionaries";
import { fill, href, intlLocale } from "@/lib/i18n";
import { Rating } from "../../rating";
import { ShortsPlayer } from "../../shorts-player";
import { Directions } from "./directions";
import { Gallery, type GalleryVideo } from "./gallery";
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
  const video: GalleryVideo | null = isVideoId(spot.shortsVideoId)
    ? {
        videoId: spot.shortsVideoId,
        title: fill(t.shorts.videoTitle, { name: spot.name }),
        play: fill(t.shorts.play, { name: spot.name }),
        close: t.shorts.close,
        thumb: t.shorts.thumb,
        seeAll: { href: href(lang, `/shorts?start=${spot.id}`), label: t.shorts.seeAll },
      }
    : null;

  return (
    <article className="mx-auto max-w-2xl">
      <Link href={`/${lang}`} className="text-sm text-muted hover:text-accent">
        {t.spot.back}
      </Link>

      {spot.images.length > 0 && (
        // with a video, the row breaks out of the text column on wide screens so the photos keep their size
        <div
          className={
            video ? "md:relative md:left-1/2 md:flex md:w-[min(56rem,calc(100vw-2rem))] md:-translate-x-1/2 md:gap-3" : undefined
          }
        >
          <div className="min-w-0 md:flex-1">
            <Gallery
              images={spot.images}
              name={spot.name}
              credit={spot.images.some(isTourApiImage) ? t.common.photoCredit : null}
              labels={t.spot.gallery}
              video={video ?? undefined}
            />
          </div>
          {video && (
            // same height as the main photo (sm:h-[28rem]): 9:16 at 15.75rem wide
            <div className="mt-2 hidden w-[15.75rem] shrink-0 md:block">
              <ShortsPlayer videoId={video.videoId} title={video.title} poster={spot.images[0]} playLabel={video.play} />
              <Link href={video.seeAll.href} className="mt-1 block text-right text-xs text-accent">
                {video.seeAll.label}
              </Link>
            </div>
          )}
        </div>
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

      {spot.category === "STAY" && <PriceLinks name={spot.name} address={spot.address} t={t.spot} />}

      {video && spot.images.length === 0 && (
        <section className="mt-4">
          <div className="flex items-baseline justify-between gap-3">
            <h2 className="text-sm font-semibold">{t.shorts.heading}</h2>
            <Link href={href(lang, `/shorts?start=${spot.id}`)} className="text-xs text-accent">
              {t.shorts.seeAll}
            </Link>
          </div>
          <ShortsPlayer videoId={video.videoId} title={video.title} poster={null} playLabel={video.play} className="mt-2 w-44 sm:w-56" />
          <p className="mt-1 text-[11px] text-muted">{t.shorts.source}</p>
        </section>
      )}

      <Suspense>
        <AdminLink spotId={spot.id} name={spot.name} />
      </Suspense>

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

// No prices or booking here: we have no price data, so the visitor is sent to a search for this place
function PriceLinks({ name, address, t }: { name: string; address: string; t: Dictionary["spot"] }) {
  // name plus province and city, e.g. "OO호텔 강원특별자치도 강릉시": enough to pick the right place, short enough to match
  const q = encodeURIComponent(`${name} ${address.split(/\s+/).slice(0, 2).join(" ")}`.trim());
  const links = [
    { label: t.naverSearch, href: `https://search.naver.com/search.naver?query=${q}` },
    { label: t.googleSearch, href: `https://www.google.com/search?q=${q}` },
  ];
  return (
    <section className="mt-2 rounded-xl bg-surface p-3">
      <h2 className="text-sm font-semibold">{t.checkPrice}</h2>
      <div className="mt-2 grid grid-cols-2 gap-1.5">
        {links.map((l) => (
          <a
            key={l.label}
            href={l.href}
            target="_blank"
            rel="noopener noreferrer"
            className="rounded-lg border border-line px-2 py-2 text-center text-xs font-medium hover:border-accent hover:text-accent"
          >
            {l.label}
          </a>
        ))}
      </div>
      <p className="mt-2 text-xs text-muted">{t.priceNote}</p>
    </section>
  );
}

// admins get a shortcut to attach a video to this spot; everyone else sees nothing
async function AdminLink({ spotId, name }: { spotId: number; name: string }) {
  const { lang, t } = await currentLocale();
  const me = await getMe().catch(() => null);
  if (!me?.admin) return null;
  return (
    <Link
      href={href(lang, `/admin/shorts?q=${encodeURIComponent(name.slice(0, 50))}#spot-${spotId}`)}
      className="mt-3 inline-block text-xs text-accent"
    >
      {t.admin.manage}
    </Link>
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
