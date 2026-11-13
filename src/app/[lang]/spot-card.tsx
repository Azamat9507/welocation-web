import Link from "next/link";
import type { SpotSummary } from "@/lib/api";
import { currentLocale } from "@/lib/current-locale";
import { CardPhotos } from "./card-photos";

type Props = { spot: SpotSummary; rank?: number; className?: string; swipe?: boolean; portrait?: boolean };

// swipe: the card sits in a grid, so a sideways swipe can flip its photos (in a scrolling row it would fight the row)
// portrait: a 3:4 photo instead of a square, for sections that set a different rhythm
export async function SpotCard({ spot, rank, className = "", swipe = false, portrait = false }: Props) {
  const { lang, t } = await currentLocale();
  const photos = spot.photos?.length ? spot.photos : spot.thumbnailUrl ? [spot.thumbnailUrl] : [];
  return (
    <li className={`min-w-0 ${className}`}>
      <Link href={`/${lang}/spots/${spot.id}`} className="group block">
        <div className={`relative overflow-hidden rounded-2xl bg-sand ${portrait ? "aspect-[3/4]" : "aspect-square"}`}>
          {photos.length > 0 ? (
            <CardPhotos photos={photos} swipe={swipe} />
          ) : (
            <span className="absolute inset-0 grid place-items-center text-sm text-muted">
              {t.categories[spot.category]}
            </span>
          )}
          {rank !== undefined && (
            <span className="absolute top-0 left-0 grid h-7 min-w-7 place-items-center rounded-br-xl bg-foreground/85 px-1.5 text-sm font-bold text-white">
              {rank}
            </span>
          )}
        </div>
        <p className="mt-2 text-xs text-muted">
          {spot.activity ? t.activities[spot.activity] : t.categories[spot.category]} · {t.regions[spot.region]}
        </p>
        <h3 className="truncate text-[15px] font-semibold tracking-tight group-hover:text-accent">{spot.name}</h3>
        {(spot.averageRating !== null || !!spot.likeCount) && (
          <p className="truncate text-xs text-muted">
            {spot.averageRating !== null && (
              <span className="font-medium text-foreground">★ {spot.averageRating.toFixed(1)}</span>
            )}
            {spot.averageRating !== null && !!spot.likeCount && " · "}
            {!!spot.likeCount && <>♥ {spot.likeCount}</>}
          </p>
        )}
      </Link>
    </li>
  );
}
