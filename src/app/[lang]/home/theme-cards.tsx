import Link from "next/link";
import { isTourApiImage } from "@/lib/api";
import { LATER, SectionHead } from "./section-head";

export type Theme = { href: string; title: string; line: string; imageUrl: string | null; ai?: boolean };

// Four tall cards, each a way into the site: a photo from a real spot of that theme with two lines over it
export function ThemeCards({ title, note, themes, credit }: { title: string; note: string; themes: Theme[]; credit: string }) {
  return (
    <section className={LATER}>
      <SectionHead title={title} note={note} />
      <ul className="-mx-4 flex snap-x snap-mandatory scroll-px-4 gap-3 overflow-x-auto px-4 [scrollbar-width:none] md:mx-0 md:grid md:grid-cols-4 md:gap-5 md:px-0 [&::-webkit-scrollbar]:hidden">
        {themes.map((th) => (
          <li key={th.href} className="w-[42%] shrink-0 snap-start sm:w-[30%] md:w-auto">
            <Link href={th.href} className="group relative block aspect-[3/4] overflow-hidden rounded-2xl bg-accent">
              {th.imageUrl ? (
                // served as-is: the 공공누리 license does not allow altering the photo
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={th.imageUrl}
                  alt=""
                  loading="lazy"
                  className="h-full w-full object-cover transition-transform duration-500 motion-safe:group-hover:scale-105"
                />
              ) : (
                <span aria-hidden="true" className="absolute inset-0 grid place-items-center bg-gradient-to-br from-accent to-[#0d1b2a] text-5xl">
                  ✨
                </span>
              )}
              <span className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/75 via-black/35 to-transparent p-3 pt-12 text-white sm:p-4 sm:pt-16">
                <span className="block text-base leading-snug font-bold sm:text-lg">{th.title}</span>
                <span className="mt-0.5 block text-xs leading-snug text-white/85 sm:text-[13px]">{th.line}</span>
              </span>
            </Link>
          </li>
        ))}
      </ul>
      {themes.some((th) => th.imageUrl && isTourApiImage(th.imageUrl)) && (
        <p className="mt-2 text-right text-[11px] text-muted">{credit}</p>
      )}
    </section>
  );
}
