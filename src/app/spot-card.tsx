import Link from "next/link";
import { CATEGORIES, REGIONS, type SpotSummary } from "@/lib/api";

export function SpotCard({ spot }: { spot: SpotSummary }) {
  return (
    <li className="min-w-0">
      <Link href={`/spots/${spot.id}`} className="group block">
        <div className="relative aspect-[4/5] overflow-hidden rounded-xl bg-sand">
          {spot.thumbnailUrl ? (
            // served as-is: the 공공누리 license does not allow altering the photo
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={spot.thumbnailUrl}
              alt=""
              loading="lazy"
              className="h-full w-full object-cover"
            />
          ) : (
            <span className="absolute inset-0 grid place-items-center text-sm text-muted">
              {CATEGORIES[spot.category]}
            </span>
          )}
          <span className="absolute top-2 left-2 rounded-full bg-surface/90 px-2 py-0.5 text-[11px] font-medium">
            {CATEGORIES[spot.category]}
          </span>
        </div>
        <h2 className="mt-2 truncate text-[15px] font-semibold tracking-tight group-hover:text-accent">{spot.name}</h2>
        <p className="truncate text-xs text-muted">
          {REGIONS[spot.region]}
          {spot.averageRating !== null && (
            <>
              {" · "}
              <span className="text-foreground">★ {spot.averageRating.toFixed(1)}</span>
            </>
          )}
          {!!spot.likeCount && <> · ♥ {spot.likeCount}</>}
        </p>
      </Link>
    </li>
  );
}
