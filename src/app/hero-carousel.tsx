"use client";

import Link from "next/link";
import { useRef } from "react";

export type HeroSlide = {
  id: number;
  name: string;
  meta: string;
  imageUrl: string;
  tourApiPhoto: boolean;
};

// Swiping is plain CSS scroll-snap; the script only drives the desktop buttons
export function HeroCarousel({ slides }: { slides: HeroSlide[] }) {
  const track = useRef<HTMLUListElement>(null);

  const go = (step: number) => {
    const el = track.current;
    if (!el) return;
    const items = Array.from(el.children) as HTMLElement[];
    const center = el.scrollLeft + el.clientWidth / 2;
    const current = items.reduce(
      (best, item, i) =>
        Math.abs(item.offsetLeft + item.offsetWidth / 2 - center) <
        Math.abs(items[best].offsetLeft + items[best].offsetWidth / 2 - center)
          ? i
          : best,
      0,
    );
    const next = items[(current + step + items.length) % items.length];
    el.scrollTo({ left: next.offsetLeft - (el.clientWidth - next.offsetWidth) / 2, behavior: "smooth" });
  };

  return (
    <section aria-label="추천 장소" aria-roledescription="carousel" className="relative">
      <ul
        ref={track}
        className="relative -mx-4 flex snap-x snap-mandatory gap-3 overflow-x-auto px-4 [scrollbar-width:none] md:mx-0 md:px-[6%] [&::-webkit-scrollbar]:hidden"
      >
        {slides.map((s, i) => (
          <li
            key={s.id}
            aria-roledescription="slide"
            aria-label={`${i + 1} / ${slides.length}`}
            className="w-full shrink-0 snap-center md:w-[88%]"
          >
            <Link
              href={`/spots/${s.id}`}
              className="relative block aspect-[4/3] overflow-hidden rounded-3xl bg-sand md:aspect-[16/7]"
            >
              {/* eslint-disable-next-line @next/next/no-img-element -- 공공누리 photo, shown unaltered */}
              <img
                src={s.imageUrl}
                alt=""
                loading={i === 0 ? "eager" : "lazy"}
                className="h-full w-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-tr from-black/70 via-black/15 to-transparent" />
              <div className="absolute right-20 bottom-4 left-5 min-w-0 text-white md:bottom-7 md:left-8">
                <p className="line-clamp-2 text-2xl leading-tight font-bold tracking-tight md:text-4xl">{s.name}</p>
                <p className="mt-1 truncate text-sm opacity-90 md:text-base">{s.meta}</p>
              </div>
              <span className="absolute right-4 bottom-4 rounded-full bg-black/45 px-2.5 py-0.5 text-xs text-white tabular-nums md:right-6 md:bottom-7">
                {i + 1} / {slides.length}
              </span>
              {s.tourApiPhoto && (
                <span className="absolute top-3 right-4 text-[10px] text-white/80">사진 출처: 한국관광공사</span>
              )}
            </Link>
          </li>
        ))}
      </ul>
      {slides.length > 1 && (
        <>
          <button
            type="button"
            onClick={() => go(-1)}
            aria-label="이전 장소"
            className="absolute top-1/2 left-2 hidden size-10 -translate-y-1/2 place-items-center rounded-full bg-white text-xl text-foreground ring-1 ring-black/10 hover:bg-sand md:grid"
          >
            ‹
          </button>
          <button
            type="button"
            onClick={() => go(1)}
            aria-label="다음 장소"
            className="absolute top-1/2 right-2 hidden size-10 -translate-y-1/2 place-items-center rounded-full bg-white text-xl text-foreground ring-1 ring-black/10 hover:bg-sand md:grid"
          >
            ›
          </button>
        </>
      )}
    </section>
  );
}
