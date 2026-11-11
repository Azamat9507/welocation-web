import Link from "next/link";
import { CATEGORIES, REGIONS, type SpotSummary } from "@/lib/api";
import { Rating } from "./rating";

export function SpotCard({ spot }: { spot: SpotSummary }) {
  return (
    <li className="min-w-0">
      <Link
        href={`/spots/${spot.id}`}
        className="flex gap-3 rounded-lg border border-line bg-white p-2 hover:border-accent sm:flex-col sm:p-0"
      >
        <div className="h-20 w-24 shrink-0 overflow-hidden rounded-md bg-accent-soft sm:h-40 sm:w-full sm:rounded-b-none">
          {spot.thumbnailUrl && (
            // served as-is: the 공공누리 license does not allow altering the photo
            // eslint-disable-next-line @next/next/no-img-element
            <img src={spot.thumbnailUrl} alt="" loading="lazy" className="h-full w-full object-cover" />
          )}
        </div>
        <div className="min-w-0 sm:px-3 sm:pb-3">
          <p className="text-xs text-muted">
            {CATEGORIES[spot.category]} · {REGIONS[spot.region]}
          </p>
          <h2 className="truncate font-semibold">{spot.name}</h2>
          <p className="truncate text-sm text-muted">{spot.address}</p>
          <Rating average={spot.averageRating} count={spot.reviewCount} />
        </div>
      </Link>
    </li>
  );
}
