import Link from "next/link";
import { isTourApiImage, type SpotSummary } from "@/lib/api";
import type { Dictionary } from "@/lib/dictionaries";
import { href, type Locale } from "@/lib/i18n";

// Our own picks while there are too few likes for a real weekly top 10 (the home page switches to the
// ranking once it has 10 spots). Real spots with good licensed galleries, spread over regions and kinds.
export const PICKS = [359, 407, 29, 3921, 161, 550, 356, 3976, 218, 479];

type Props = { lang: Locale; t: Dictionary; title: string; note: string; seeAll?: string; spots: SpotSummary[] };

// Netflix-style row: a big outlined rank number with the photo leaning on it, scrolled sideways
export function TopTen({ lang, t, title, note, seeAll, spots }: Props) {
  return (
    <section className="mt-7">
      <div className="mb-1 flex items-baseline justify-between gap-3">
        <h2 className="text-lg font-bold tracking-tight">{title}</h2>
        {seeAll && (
          <Link href={seeAll} className="shrink-0 text-sm text-muted hover:text-foreground">
            {t.home.seeAll}
          </Link>
        )}
      </div>
      <p className="mb-3 text-xs text-muted">{note}</p>
      <ol className="-mx-4 flex snap-x snap-mandatory scroll-px-4 gap-3 overflow-x-auto px-4 pb-1 sm:gap-4 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        {spots.map((s, i) => (
          <li key={s.id} className="shrink-0 snap-start">
            <Link href={href(lang, `/spots/${s.id}`)} className="group block" aria-label={`${i + 1}. ${s.name}`}>
              <span className="flex items-end">
                {/* outlined with text-shadow: a text stroke shows the inner seams of heavy system fonts */}
                <span
                  aria-hidden="true"
                  className="relative z-0 -mr-3 text-[5.5rem] leading-[0.75] font-black tracking-[-0.06em] text-background [text-shadow:-2px_-2px_0_var(--foreground),2px_-2px_0_var(--foreground),-2px_2px_0_var(--foreground),2px_2px_0_var(--foreground),0_-2px_0_var(--foreground),0_2px_0_var(--foreground),-2px_0_0_var(--foreground),2px_0_0_var(--foreground)] sm:-mr-4 sm:text-[7.5rem]"
                >
                  {i + 1}
                </span>
                <span className="relative z-10 block aspect-[3/4] w-28 overflow-hidden rounded-xl bg-sand sm:w-36">
                  {s.thumbnailUrl && (
                    // served as-is: the 공공누리 license does not allow altering the photo
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={s.thumbnailUrl}
                      alt=""
                      loading="lazy"
                      className="h-full w-full object-cover transition-transform duration-300 motion-safe:group-hover:scale-105"
                    />
                  )}
                </span>
              </span>
              <span className="mt-1.5 ml-auto block w-28 sm:w-36">
                <span className="block truncate text-[13px] font-semibold group-hover:text-accent">{s.name}</span>
                <span className="block truncate text-[11px] text-muted">
                  {t.categories[s.category]} · {t.regions[s.region]}
                </span>
              </span>
            </Link>
          </li>
        ))}
      </ol>
      {spots.some((s) => s.thumbnailUrl && isTourApiImage(s.thumbnailUrl)) && (
        <p className="mt-2 text-right text-[11px] text-muted">{t.common.photoCredit}</p>
      )}
    </section>
  );
}
