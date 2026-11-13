import Link from "next/link";
import { isTourApiImage, type SpotSummary } from "@/lib/api";
import { LATER, SectionHead } from "./section-head";
import { SpotCard } from "../spot-card";

type Props = {
  heading: string;
  note: string;
  title: string;
  line: string;
  more: string;
  href: string;
  cover: SpotSummary;
  spots: SpotSummary[];
  credit: string;
};

// A themed collection: a large cover card on the left, a row of its spots on the right (stacked on phones)
export function Collection({ heading, note, title, line, more, href, cover, spots, credit }: Props) {
  return (
    <section className={LATER}>
      <SectionHead title={heading} note={note} />
      <div className="grid gap-3 md:grid-cols-[minmax(0,2fr)_minmax(0,3fr)] md:gap-5">
        <Link href={href} className="group relative block aspect-[16/9] overflow-hidden rounded-2xl bg-sand md:aspect-auto md:min-h-80">
          {cover.thumbnailUrl && (
            // served as-is: the 공공누리 license does not allow altering the photo
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={cover.thumbnailUrl}
              alt=""
              loading="lazy"
              className="absolute inset-0 h-full w-full object-cover transition-transform duration-500 motion-safe:group-hover:scale-105"
            />
          )}
          <span className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/75 via-black/30 to-transparent p-4 pt-16 text-white sm:p-5">
            <span className="block text-xl font-bold tracking-tight sm:text-2xl">{title}</span>
            <span className="mt-1 block text-[13px] text-white/85 sm:text-sm">{line}</span>
            <span className="mt-3 inline-block rounded-full bg-white px-3 py-1 text-xs font-semibold text-foreground">{more} ›</span>
          </span>
        </Link>
        <ul className="-mx-4 flex snap-x snap-mandatory scroll-px-4 gap-3 overflow-x-auto px-4 [scrollbar-width:none] md:mx-0 md:grid md:grid-cols-2 md:gap-4 md:px-0 [&::-webkit-scrollbar]:hidden">
          {spots.slice(0, 4).map((s) => (
            <SpotCard key={s.id} spot={s} className="w-[40%] shrink-0 snap-start sm:w-[28%] md:w-auto" />
          ))}
        </ul>
      </div>
      {[cover, ...spots].some((s) => s.thumbnailUrl && isTourApiImage(s.thumbnailUrl)) && (
        <p className="mt-2 text-right text-[11px] text-muted">{credit}</p>
      )}
    </section>
  );
}
