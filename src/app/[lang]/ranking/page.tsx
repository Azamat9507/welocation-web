import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";
import {
  getWeeklyRanking,
  isTourApiImage,
  isoWeekRange,
  type RankedSpot,
} from "@/lib/api";
import { currentLocale } from "@/lib/current-locale";
import type { Dictionary } from "@/lib/dictionaries";
import { fill, href, intlLocale, type Locale } from "@/lib/i18n";
import { Rating } from "../rating";

export async function generateMetadata(): Promise<Metadata> {
  const { t } = await currentLocale();
  return { title: t.ranking.metaTitle, description: t.ranking.metaDescription };
}

export default async function RankingPage() {
  const { t } = await currentLocale();
  return (
    <section className="mx-auto max-w-2xl">
      <h1 className="text-xl font-bold">{t.ranking.title}</h1>
      <Suspense fallback={<p className="py-8 text-center text-sm text-muted">{t.common.loading}</p>}>
        <Ranking />
      </Suspense>
    </section>
  );
}

async function Ranking() {
  const { lang, t } = await currentLocale();
  const ranking = await getWeeklyRanking();
  const range = isoWeekRange(ranking.week);
  // the week's dates are UTC midnights, so they are formatted in UTC
  const day = (d: Date) => d.toLocaleDateString(intlLocale(lang), { month: "long", day: "numeric", timeZone: "UTC" });

  return (
    <>
      <p className="mt-0.5 text-sm text-muted">
        {range ? `${day(range.start)} ~ ${day(range.end)}` : ranking.week} · {t.ranking.basis}
      </p>

      {ranking.items.length === 0 ? (
        <div className="py-10 text-center">
          <p className="text-sm text-muted">{t.ranking.empty}</p>
          <Link href={`/${lang}`} className="mt-2 inline-block text-sm text-accent">
            {t.common.browseSpots}
          </Link>
        </div>
      ) : (
        <>
          <ol className="mt-3 space-y-2">
            {ranking.items.map((item) => (
              <RankRow key={item.spot.id} lang={lang} t={t} item={item} />
            ))}
          </ol>
          {ranking.items.some((i) => i.spot.thumbnailUrl && isTourApiImage(i.spot.thumbnailUrl)) && (
            <p className="mt-2 text-right text-xs text-muted">{t.common.photoCredit}</p>
          )}
        </>
      )}
    </>
  );
}

function RankRow({ lang, t, item }: { lang: Locale; t: Dictionary; item: RankedSpot }) {
  const { rank, weeklyLikes, spot } = item;
  return (
    <li className="min-w-0">
      <Link
        href={href(lang, `/spots/${spot.id}`)}
        className="flex items-center gap-3 rounded-lg border border-line bg-surface p-2 hover:border-accent"
      >
        <span className={`w-6 shrink-0 text-center text-lg font-bold ${rank <= 3 ? "text-accent" : "text-muted"}`}>
          <span aria-hidden="true">{rank}</span>
          <span className="sr-only">{fill(t.ranking.rank, { n: rank })}</span>
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
            {t.categories[spot.category]} · {t.regions[spot.region]}
          </p>
          <h2 className="truncate font-semibold">{spot.name}</h2>
          <Rating average={spot.averageRating} count={spot.reviewCount} labels={t.rating} />
        </div>
        <span className="shrink-0 text-sm text-accent">
          <span aria-hidden="true">♥ </span>
          <span className="sr-only">{t.ranking.weeklyLikes} </span>
          {weeklyLikes}
        </span>
      </Link>
    </li>
  );
}
