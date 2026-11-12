"use client";

import Link from "next/link";
import { useCallback, useEffect, useRef, useState } from "react";
import { href, type Locale } from "@/lib/i18n";

export type HeroSlide = {
  id: number;
  badge: string;
  name: string;
  tagline: string;
  meta: string;
  imageUrl: string;
  tourApiPhoto: boolean;
};

type Labels = { carousel: string; prev: string; next: string; pause: string; play: string; photoCredit: string };

const AUTOPLAY_MS = 5000;
// one slide's width; the track pads by the rest so the active slide sits centred and its neighbours peek
const SLIDE = "min(1180px, calc(100vw - 2rem))";
const SLIDE_MD = "min(1180px, 84vw)";

// Swiping is plain CSS scroll-snap; the script adds buttons, the counter and autoplay
export function HeroCarousel({ lang, slides, labels }: { lang: Locale; slides: HeroSlide[]; labels: Labels }) {
  const track = useRef<HTMLUListElement>(null);
  const [index, setIndex] = useState(0);
  const [playing, setPlaying] = useState(true);
  const [held, setHeld] = useState(false);

  const scrollTo = useCallback((i: number) => {
    const el = track.current;
    if (!el) return;
    const items = el.children;
    const target = items[(i + items.length) % items.length] as HTMLElement;
    el.scrollTo({ left: target.offsetLeft - (el.clientWidth - target.offsetWidth) / 2, behavior: "smooth" });
  }, []);

  // the counter follows whatever slide is centred, however it got there (swipe, button, autoplay)
  useEffect(() => {
    const el = track.current;
    if (!el) return;
    const onScroll = () => {
      const center = el.scrollLeft + el.clientWidth / 2;
      let best = 0;
      Array.from(el.children).forEach((c, i) => {
        const item = c as HTMLElement;
        const best0 = el.children[best] as HTMLElement;
        if (Math.abs(item.offsetLeft + item.offsetWidth / 2 - center) < Math.abs(best0.offsetLeft + best0.offsetWidth / 2 - center)) best = i;
      });
      setIndex(best);
    };
    el.addEventListener("scroll", onScroll, { passive: true });
    return () => el.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    if (!playing || held || slides.length < 2) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const timer = setTimeout(() => scrollTo(index + 1), AUTOPLAY_MS);
    return () => clearTimeout(timer);
  }, [playing, held, index, slides.length, scrollTo]);

  const edge = { "--slide": SLIDE, "--slide-md": SLIDE_MD } as React.CSSProperties;

  return (
    <section
      aria-label={labels.carousel}
      aria-roledescription="carousel"
      style={edge}
      // full-bleed: break out of the page column so the neighbouring slides show at the screen edges
      className="relative mx-[calc(50%-50vw)] w-screen"
      onMouseEnter={() => setHeld(true)}
      onMouseLeave={() => setHeld(false)}
      onFocus={() => setHeld(true)}
      onBlur={() => setHeld(false)}
    >
      <ul
        ref={track}
        className="flex snap-x snap-mandatory gap-3 overflow-x-auto px-[calc((100vw-var(--slide))/2)] [scrollbar-width:none] md:gap-5 md:px-[calc((100vw-var(--slide-md))/2)] [&::-webkit-scrollbar]:hidden"
      >
        {slides.map((s, i) => (
          <li
            key={s.id}
            aria-roledescription="slide"
            aria-label={`${i + 1} / ${slides.length}`}
            className="w-[var(--slide)] shrink-0 snap-center md:w-[var(--slide-md)]"
          >
            <Link
              href={href(lang, `/spots/${s.id}`)}
              tabIndex={i === index ? 0 : -1}
              className="relative block aspect-[5/4] overflow-hidden rounded-3xl bg-sand sm:aspect-[2/1] md:aspect-[3/1]"
            >
              {/* eslint-disable-next-line @next/next/no-img-element -- 공공누리 photo, shown unaltered */}
              <img src={s.imageUrl} alt="" loading={i === 0 ? "eager" : "lazy"} className="h-full w-full object-cover" />
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent md:bg-gradient-to-r md:from-black/60 md:via-black/20" />
              <div className="absolute inset-x-5 bottom-14 text-white md:inset-x-auto md:top-1/2 md:bottom-auto md:left-[8%] md:max-w-[55%] md:-translate-y-1/2">
                <span className="inline-block rounded-lg bg-white px-2.5 py-1 text-xs font-bold text-foreground md:text-sm">
                  {s.badge}
                </span>
                <p className="mt-3 text-2xl leading-tight font-extrabold tracking-tight md:mt-5 md:text-5xl md:leading-[1.15]">
                  <span className="line-clamp-1">{s.name}</span>
                  <span className="line-clamp-1">{s.tagline}</span>
                </p>
                <p className="mt-2 truncate text-sm opacity-90 md:mt-5 md:text-lg">{s.meta}</p>
              </div>
              {s.tourApiPhoto && (
                <span className="absolute top-3 right-4 text-[10px] text-white/80">{labels.photoCredit}</span>
              )}
            </Link>
          </li>
        ))}
      </ul>

      {slides.length > 1 && (
        <>
          {/* controls sit on the active slide's edges, not the screen's */}
          <button
            type="button"
            onClick={() => scrollTo(index - 1)}
            aria-label={labels.prev}
            className="absolute top-1/2 left-[calc((100vw-var(--slide-md))/2+1rem)] hidden size-12 -translate-y-1/2 place-items-center rounded-xl bg-white text-foreground shadow-md hover:bg-surface md:grid"
          >
            <Chevron dir="left" />
          </button>
          <button
            type="button"
            onClick={() => scrollTo(index + 1)}
            aria-label={labels.next}
            className="absolute top-1/2 right-[calc((100vw-var(--slide-md))/2+1rem)] hidden size-12 -translate-y-1/2 place-items-center rounded-xl bg-white text-foreground shadow-md hover:bg-surface md:grid"
          >
            <Chevron dir="right" />
          </button>
          <div className="absolute right-[calc((100vw-var(--slide))/2+0.75rem)] bottom-3 flex items-center gap-1.5 md:right-[calc((100vw-var(--slide-md))/2+1.5rem)] md:bottom-6">
            <button
              type="button"
              onClick={() => setPlaying((p) => !p)}
              aria-label={playing ? labels.pause : labels.play}
              className="grid size-8 place-items-center rounded-full bg-black/45 text-white hover:bg-black/60"
            >
              {playing ? (
                <svg aria-hidden="true" viewBox="0 0 24 24" className="size-3.5" fill="currentColor">
                  <rect x="6" y="5" width="4" height="14" rx="1" />
                  <rect x="14" y="5" width="4" height="14" rx="1" />
                </svg>
              ) : (
                <svg aria-hidden="true" viewBox="0 0 24 24" className="size-3.5" fill="currentColor">
                  <path d="M8 5.5v13l11-6.5-11-6.5Z" />
                </svg>
              )}
            </button>
            <span aria-live="polite" className="rounded-full bg-black/45 px-3 py-1 text-xs font-semibold text-white tabular-nums md:text-sm">
              {index + 1} / {slides.length}
            </span>
          </div>
        </>
      )}
    </section>
  );
}

function Chevron({ dir }: { dir: "left" | "right" }) {
  return (
    <svg aria-hidden="true" viewBox="0 0 24 24" className="size-5" fill="none" stroke="currentColor" strokeWidth="2.4">
      <path d={dir === "left" ? "m15 5-7 7 7 7" : "m9 5 7 7-7 7"} />
    </svg>
  );
}
