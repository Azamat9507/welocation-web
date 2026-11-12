"use client";

import { useRef, useState } from "react";
import { fill } from "@/lib/i18n";

// Swipe on phones, arrows on desktop. Photos are shown whole and unaltered (공공누리 Type3 allows no changes), letterboxed on sand.
type Labels = { photo: string; prev: string; next: string; show: string };

// credit is the source line to show, or null when no photo needs one
export function Gallery({ images, name, credit, labels }: { images: string[]; name: string; credit: string | null; labels: Labels }) {
  const strip = useRef<HTMLUListElement>(null);
  const [index, setIndex] = useState(0);
  const many = images.length > 1;

  const go = (i: number) => {
    const el = strip.current;
    if (!el) return;
    const next = Math.max(0, Math.min(images.length - 1, i));
    el.scrollTo({ left: next * el.clientWidth, behavior: "smooth" });
  };

  return (
    <figure className="mt-2">
      <div className="relative">
        <ul
          ref={strip}
          onScroll={(e) => setIndex(Math.round(e.currentTarget.scrollLeft / e.currentTarget.clientWidth))}
          className="flex snap-x snap-mandatory overflow-x-auto rounded-2xl [scrollbar-width:none]"
        >
          {images.map((src, i) => (
            <li key={src} className="w-full shrink-0 snap-center">
              {/* eslint-disable-next-line @next/next/no-img-element -- 공공누리 photo, shown unaltered */}
              <img
                src={src}
                alt={many ? fill(labels.photo, { name, n: i + 1 }) : name}
                loading={i === 0 ? "eager" : "lazy"}
                className="h-64 w-full bg-sand object-contain sm:h-[28rem]"
              />
            </li>
          ))}
        </ul>
        {many && (
          <>
            <span className="absolute right-3 bottom-3 rounded-full bg-black/55 px-2 py-0.5 text-xs text-white">
              {index + 1} / {images.length}
            </span>
            <button
              type="button"
              aria-label={labels.prev}
              onClick={() => go(index - 1)}
              disabled={index === 0}
              className="absolute top-1/2 left-2 hidden h-9 w-9 -translate-y-1/2 rounded-full bg-surface/90 text-lg disabled:opacity-0 sm:block"
            >
              ‹
            </button>
            <button
              type="button"
              aria-label={labels.next}
              onClick={() => go(index + 1)}
              disabled={index === images.length - 1}
              className="absolute top-1/2 right-2 hidden h-9 w-9 -translate-y-1/2 rounded-full bg-surface/90 text-lg disabled:opacity-0 sm:block"
            >
              ›
            </button>
          </>
        )}
      </div>
      {many && (
        <ul className="mt-2 flex gap-1.5 overflow-x-auto [scrollbar-width:none]">
          {images.map((src, i) => (
            <li key={src} className="shrink-0">
              <button
                type="button"
                aria-label={fill(labels.show, { n: i + 1 })}
                onClick={() => go(i)}
                className={`block overflow-hidden rounded-md ring-2 ${i === index ? "ring-accent" : "ring-transparent"}`}
              >
                {/* eslint-disable-next-line @next/next/no-img-element -- thumbnail of the same photo */}
                <img src={src} alt="" loading="lazy" className="h-14 w-20 object-cover" />
              </button>
            </li>
          ))}
        </ul>
      )}
      {credit && <figcaption className="mt-1 text-right text-xs text-muted">{credit}</figcaption>}
    </figure>
  );
}
