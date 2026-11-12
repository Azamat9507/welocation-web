import Link from "next/link";
import { CATEGORIES, REGIONS, type SpotSummary } from "@/lib/api";

export function SpotCard({ spot, rank, className = "" }: { spot: SpotSummary; rank?: number; className?: string }) {
  return (
    <li className={`min-w-0 ${className}`}>
      <Link href={`/spots/${spot.id}`} className="group block">
        <div className="relative aspect-square overflow-hidden rounded-2xl bg-sand">
          {spot.thumbnailUrl ? (
            // served as-is: the 공공누리 license does not allow altering the photo
            // eslint-disable-next-line @next/next/no-img-element
            <img src={spot.thumbnailUrl} alt="" loading="lazy" className="h-full w-full object-cover" />
          ) : (
            <span className="absolute inset-0 grid place-items-center text-sm text-muted">
              {CATEGORIES[spot.category]}
            </span>
          )}
          {rank !== undefined && (
            <span className="absolute top-0 left-0 grid h-7 min-w-7 place-items-center rounded-br-xl bg-foreground/85 px-1.5 text-sm font-bold text-white">
              {rank}
            </span>
          )}
        </div>
        <p className="mt-2 text-xs text-muted">
          {CATEGORIES[spot.category]} · {REGIONS[spot.region]}
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
