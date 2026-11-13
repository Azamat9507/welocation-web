"use client";

import { useEffect, useRef, useState } from "react";

const STEP_MS = 1100;

// A card's photo that flips through the spot's first gallery photos: on hover with a mouse, by swipe on a
// phone (swipe only where the card is not already inside a sideways-scrolling row). Only the first photo
// loads with the page; the rest start loading when the visitor reaches for the card.
export function CardPhotos({ photos, swipe }: { photos: string[]; swipe: boolean }) {
  const box = useRef<HTMLDivElement>(null);
  const timer = useRef<number | undefined>(undefined);
  const [armed, setArmed] = useState(false);
  const [index, setIndex] = useState(0);
  const many = photos.length > 1;

  useEffect(() => () => window.clearInterval(timer.current), []);

  const go = (i: number) => {
    const el = box.current;
    if (!el) return;
    const smooth = !window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    el.scrollTo({ left: i * el.clientWidth, behavior: smooth ? "smooth" : "auto" });
  };

  const start = (e: React.PointerEvent) => {
    if (!many) return;
    setArmed(true);
    if (e.pointerType !== "mouse") return;
    window.clearInterval(timer.current);
    let i = 0;
    timer.current = window.setInterval(() => {
      i = (i + 1) % photos.length;
      go(i);
    }, STEP_MS);
  };
  const stop = () => {
    window.clearInterval(timer.current);
    timer.current = undefined;
    go(0);
  };

  return (
    <div
      onPointerEnter={start}
      onPointerLeave={stop}
      onTouchStart={() => many && setArmed(true)}
      className="relative h-full w-full"
    >
      <div
        ref={box}
        onScroll={(e) => {
          const el = e.currentTarget;
          setIndex(Math.round(el.scrollLeft / Math.max(1, el.clientWidth)));
        }}
        className={`flex h-full w-full snap-x snap-mandatory [scrollbar-width:none] [&::-webkit-scrollbar]:hidden ${
          swipe ? "overflow-x-auto" : "overflow-hidden"
        }`}
      >
        {photos.map((url, i) => (
          <div key={url} className="h-full w-full shrink-0 snap-start overflow-hidden">
            {(i === 0 || armed) && (
              // served as-is: the 공공누리 license does not allow altering the photo
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={url}
                alt=""
                loading="lazy"
                draggable={false}
                className="h-full w-full object-cover transition-transform duration-500 motion-safe:group-hover:scale-105"
              />
            )}
          </div>
        ))}
      </div>
      {many && (
        <span aria-hidden="true" className="pointer-events-none absolute inset-x-0 bottom-1.5 flex justify-center gap-1">
          {photos.map((url, i) => (
            <span key={url} className={`size-1.5 rounded-full ${i === index ? "bg-white" : "bg-white/50"}`} />
          ))}
        </span>
      )}
    </div>
  );
}
