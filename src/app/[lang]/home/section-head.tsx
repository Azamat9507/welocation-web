import Link from "next/link";

type Props = { title: string; note?: string; href?: string; seeAll?: string; id?: string };

// One heading style for every home section: a bold title, a short grey line on what the list is, and "see all"
export function SectionHead({ title, note, href, seeAll, id }: Props) {
  return (
    <div className="mb-3 flex items-end justify-between gap-3 sm:mb-4">
      <div className="min-w-0">
        <h2 id={id} className="text-xl font-bold tracking-tight sm:text-2xl">
          {title}
        </h2>
        {note && <p className="mt-0.5 text-[13px] text-muted sm:text-sm">{note}</p>}
      </div>
      {href && seeAll && (
        <Link href={href} className="shrink-0 pb-0.5 text-sm text-muted hover:text-foreground">
          {seeAll}
        </Link>
      )}
    </div>
  );
}

// the same gap between all home sections
export const SECTION = "mt-12 sm:mt-14";

// For sections well below the first screen: the browser skips laying them out until they come near, so their
// photos (TourAPI originals, often 300 KB each, which we may not resize) don't all download with the page.
// "auto 640px" keeps the remembered height once a section has been shown, so scrolling back doesn't jump.
export const LATER = `${SECTION} [content-visibility:auto] [contain-intrinsic-size:auto_640px]`;
