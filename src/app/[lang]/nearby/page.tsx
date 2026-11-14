import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";
import {
  CATEGORIES,
  NEARBY_RADII,
  formatDistance,
  getNearby,
  isTourApiImage,
  nearbyQuery,
  parseNearby,
  type NearbyFilter,
  type NearbySpot,
} from "@/lib/api";
import { currentLocale } from "@/lib/current-locale";
import type { Dictionary } from "@/lib/dictionaries";
import { fill, href, type Locale } from "@/lib/i18n";
import { LocateButton } from "./locate-button";
import { NearbyMap } from "./nearby-map";
import { ShowOnMap } from "./show-on-map";

export async function generateMetadata(): Promise<Metadata> {
  const { t } = await currentLocale();
  return { title: t.nearby.metaTitle, description: t.nearby.metaDescription };
}

export default async function NearbyPage({ searchParams }: PageProps<"/[lang]/nearby">) {
  const { t } = await currentLocale();
  return (
    <section className="mx-auto max-w-2xl lg:max-w-6xl">
      <h1 className="text-xl font-bold">{t.nearby.title}</h1>
      {/* a screen tall while loading, so the footer is not on screen first and then pushed away by the results */}
      <Suspense fallback={<p className="min-h-[100svh] py-8 text-center text-sm text-muted">{t.common.loading}</p>}>
        <Nearby searchParams={searchParams} />
      </Suspense>
    </section>
  );
}

async function Nearby({ searchParams }: { searchParams: PageProps<"/[lang]/nearby">["searchParams"] }) {
  const { lang, t } = await currentLocale();
  const q = await searchParams;
  const here = (f: NearbyFilter) => href(lang, `/nearby${nearbyQuery(f)}`);
  const filter = parseNearby(q);
  const rejectedPoint = !filter.point && (q.lat !== undefined || q.lng !== undefined);

  return (
    <>
      <p className="mt-0.5 text-sm text-muted">
        {t.nearby.privacy}
      </p>

      <div className="mt-3">
        <LocateButton
          radius={filter.radius}
          category={filter.category}
          again={filter.point !== null}
          lang={lang}
          labels={t.nearby.locate}
        />
      </div>

      <nav aria-label={t.list.filtersLabel} className="mt-3 space-y-2">
        <ChipRow
          label={t.nearby.radius}
          items={NEARBY_RADII.map((r) => ({
            text: `${r}km`,
            active: filter.radius === r,
            href: here({ ...filter, radius: r }),
          }))}
        />
        <ChipRow
          label={t.nearby.kind}
          items={[
            { text: t.nearby.all, active: !filter.category, href: here({ ...filter, category: undefined }) },
            ...CATEGORIES.map((c) => ({
              text: t.categories[c],
              active: filter.category === c,
              href: here({ ...filter, category: c }),
            })),
          ]}
        />
      </nav>

      {filter.point ? (
        <Results lang={lang} t={t} filter={filter} point={filter.point} />
      ) : (
        <div className="py-10 text-center text-sm text-muted">
          {rejectedPoint ? (
            <p>{t.nearby.outsideKorea}</p>
          ) : (
            <p>{t.nearby.hint}</p>
          )}
          <Link href={`/${lang}`} className="mt-2 inline-block text-accent">
            {t.nearby.browseAll}
          </Link>
        </div>
      )}
    </>
  );
}

type ResultsProps = { lang: Locale; t: Dictionary; filter: NearbyFilter; point: { lat: number; lng: number } };

async function Results({ lang, t, filter, point }: ResultsProps) {
  const here = (f: NearbyFilter) => href(lang, `/nearby${nearbyQuery(f)}`);
  const spots = await getNearby(point, filter.radius, filter.category);
  const bigger = NEARBY_RADII.find((r) => r > filter.radius);

  if (spots.length === 0) {
    return (
      <div className="py-10 text-center text-sm">
        <p className="text-muted">
          {filter.category
            ? fill(t.nearby.noneOfKind, { r: filter.radius, kind: t.categories[filter.category] })
            : fill(t.nearby.none, { r: filter.radius })}
        </p>
        {bigger && (
          <Link href={here({ ...filter, radius: bigger })} className="mt-2 inline-block text-accent">
            {fill(t.nearby.widen, { r: bigger })}
          </Link>
        )}
        {!bigger && filter.category && (
          <Link
            href={here({ ...filter, category: undefined })}
            className="mt-2 inline-block text-accent"
          >
            {t.nearby.allKinds}
          </Link>
        )}
      </div>
    );
  }

  return (
    // phone: the map on top, the list below; wide screens: the list left, the map right and staying in view
    <div className="mt-4 flex flex-col gap-3 lg:grid lg:grid-cols-[minmax(0,1fr)_minmax(0,1.25fr)] lg:items-start lg:gap-6">
      <div className="lg:sticky lg:top-20 lg:order-2">
        <NearbyMap
          center={point}
          radiusKm={filter.radius}
          category={filter.category}
          spots={spots.map((s) => ({
            id: s.id,
            name: s.name,
            category: s.category,
            lat: s.latitude,
            lng: s.longitude,
            distance: formatDistance(s.distanceMeters),
            url: href(lang, `/spots/${s.id}`),
          }))}
          lang={lang}
          labels={t.nearby.map}
        />
      </div>
      <div className="min-w-0 lg:order-1">
        <p className="mb-2 text-sm text-muted">
          {fill(t.nearby.summary, { r: filter.radius, n: spots.length })}
          {spots.length >= 50 ? t.nearby.max : ""}
        </p>
        <ul className="space-y-2">
          {spots.map((spot) => (
            <NearbyRow key={spot.id} lang={lang} t={t} spot={spot} />
          ))}
        </ul>
        {spots.some((s) => s.thumbnailUrl && isTourApiImage(s.thumbnailUrl)) && (
          <p className="mt-2 text-right text-xs text-muted">{t.common.photoCredit}</p>
        )}
      </div>
    </div>
  );
}

function NearbyRow({ lang, t, spot }: { lang: Locale; t: Dictionary; spot: NearbySpot }) {
  return (
    // id and data-map-active: a marker click on the map lights this row up
    <li id={`spot-${spot.id}`} className="group flex min-w-0 scroll-mt-24 items-center gap-2">
      <Link
        href={href(lang, `/spots/${spot.id}`)}
        className="flex min-w-0 flex-1 items-center gap-3 rounded-lg border border-line bg-surface p-2 hover:border-accent group-data-[map-active]:border-accent group-data-[map-active]:bg-accent-soft"
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
            {t.categories[spot.category]} · {t.regions[spot.region]}
          </p>
          <h2 className="truncate font-semibold">{spot.name}</h2>
          <p className="truncate text-sm text-muted">{spot.address}</p>
        </div>
        <span className="shrink-0 text-sm font-semibold text-accent">
          <span className="sr-only">{t.nearby.distance} </span>
          {formatDistance(spot.distanceMeters)}
        </span>
      </Link>
      <ShowOnMap id={spot.id} label={t.nearby.map.showOnMap} />
    </li>
  );
}

function ChipRow({ label, items }: { label: string; items: { text: string; active: boolean; href: string }[] }) {
  return (
    <div className="flex min-w-0 items-center gap-2">
      <span className="w-12 shrink-0 text-xs text-muted">{label}</span>
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
