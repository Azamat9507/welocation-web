"use client";

import Link from "next/link";
import { useCallback, useEffect, useRef, useState, useTransition } from "react";
import { shortsEmbedUrl, type Category, type Page, type Region, type ShortsItem } from "@/lib/api";
import { fill, href, type Locale } from "@/lib/i18n";
import { PlayBadge } from "../shorts-player";
import { moreShorts } from "./actions";

type Labels = {
  feed: string;
  play: string;
  openSpot: string;
  prev: string;
  next: string;
  videoTitle: string;
  source: string;
  loading: string;
};

type Props = {
  lang: Locale;
  first: Page<ShortsItem>;
  startId: number | null;
  categories: Record<Category, string>;
  regions: Record<Region, string>;
  labels: Labels;
};

// Reels-style feed: one video per screen, scroll-snap between them. Only the video on screen has a
// player (muted autoplay, which every browser allows); the rest are photos, so scrolling stays light.
// A finger on YouTube's player doesn't scroll the page on every phone, so the strip under the video and
// the arrow buttons move the feed too. On phones the feed ends above the floating AI guide button.
export function ShortsFeed({ lang, first, startId, categories, regions, labels }: Props) {
  const [items, setItems] = useState(first.items);
  const [page, setPage] = useState(first.page);
  const [active, setActive] = useState(0);
  const [loading, startLoading] = useTransition();
  const track = useRef<HTMLOListElement>(null);
  const hasMore = page + 1 < first.totalPages;

  const go = useCallback((i: number, smooth = true) => {
    const el = track.current?.children[i] as HTMLElement | undefined;
    el?.scrollIntoView({ behavior: smooth ? "smooth" : "instant", block: "start" });
  }, []);

  // the slide that is mostly on screen is the active one
  useEffect(() => {
    const root = track.current;
    if (!root) return;
    const io = new IntersectionObserver(
      (entries) => {
        for (const e of entries) {
          if (e.isIntersecting) setActive(Number((e.target as HTMLElement).dataset.index));
        }
      },
      { root, threshold: 0.6 },
    );
    Array.from(root.children).forEach((c) => io.observe(c));
    return () => io.disconnect();
  }, [items.length]);

  // a link from a spot page opens the feed at that spot's video
  useEffect(() => {
    if (startId === null) return;
    const i = first.items.findIndex((s) => s.id === startId);
    if (i > 0) go(i, false);
  }, [startId, first.items, go]);

  // fetch the next page a few videos before the end
  useEffect(() => {
    if (!hasMore || loading || active < items.length - 3) return;
    startLoading(async () => {
      const next = await moreShorts(page + 1).catch(() => null);
      if (!next) return;
      setPage(next.page);
      setItems((old) => {
        const seen = new Set(old.map((s) => s.id));
        return [...old, ...next.items.filter((s) => !seen.has(s.id))];
      });
    });
  }, [active, hasMore, items.length, loading, page]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLElement && e.target.closest("input, textarea, select")) return;
      if (e.key === "ArrowDown" || e.key === "PageDown") {
        e.preventDefault();
        go(Math.min(active + 1, items.length - 1));
      } else if (e.key === "ArrowUp" || e.key === "PageUp") {
        e.preventDefault();
        go(Math.max(active - 1, 0));
      }
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [active, items.length, go]);

  return (
    <div className="relative mx-auto max-w-md">
      <ol
        ref={track}
        aria-label={labels.feed}
        className="h-[max(18rem,calc(100svh-17rem))] snap-y snap-mandatory overflow-y-auto overscroll-contain [scrollbar-width:none] sm:h-[max(26rem,calc(100svh-10rem))] [&::-webkit-scrollbar]:hidden"
      >
        {items.map((s, i) => (
          <li key={s.id} data-index={i} className="flex h-full snap-start snap-always flex-col pb-3">
            <div className="relative min-h-0 flex-1">
              <div className="mx-auto aspect-[9/16] h-full max-w-full overflow-hidden rounded-2xl bg-black">
                {i === active ? (
                  <iframe
                    key={s.videoId}
                    src={shortsEmbedUrl(s.videoId, { autoplay: true, mute: true })}
                    title={fill(labels.videoTitle, { name: s.name })}
                    allow="autoplay; encrypted-media; picture-in-picture; fullscreen"
                    allowFullScreen
                    referrerPolicy="strict-origin-when-cross-origin"
                    className="h-full w-full"
                  />
                ) : (
                  <button
                    type="button"
                    tabIndex={-1}
                    onClick={() => go(i)}
                    aria-label={fill(labels.play, { name: s.name })}
                    className="group relative h-full w-full"
                  >
                    {s.thumbnailUrl && (
                      // eslint-disable-next-line @next/next/no-img-element -- 공공누리 photo, shown unaltered
                      <img src={s.thumbnailUrl} alt="" loading="lazy" className="h-full w-full object-cover opacity-70" />
                    )}
                    <PlayBadge />
                  </button>
                )}
              </div>
            </div>
            <div className="mt-2 flex items-center gap-3 px-1">
              <div className="min-w-0 flex-1">
                <p className="truncate text-xs text-muted">
                  {categories[s.category]} · {regions[s.region]} · {labels.source}
                </p>
                <h2 className="truncate font-bold">{s.name}</h2>
              </div>
              <Link
                href={href(lang, `/spots/${s.id}`)}
                className="shrink-0 rounded-full bg-accent px-3.5 py-2 text-sm font-semibold text-white hover:opacity-90"
              >
                {labels.openSpot}
              </Link>
            </div>
          </li>
        ))}
      </ol>

      <div className="absolute top-1/2 right-1 flex -translate-y-1/2 flex-col gap-2 sm:-right-16">
        <ArrowButton dir="up" label={labels.prev} disabled={active === 0} onClick={() => go(active - 1)} />
        <ArrowButton dir="down" label={labels.next} disabled={active >= items.length - 1} onClick={() => go(active + 1)} />
      </div>
      <p aria-live="polite" className="sr-only">
        {loading ? labels.loading : `${active + 1} / ${hasMore ? `${items.length}+` : items.length}`}
      </p>
    </div>
  );
}

function ArrowButton({ dir, label, disabled, onClick }: { dir: "up" | "down"; label: string; disabled: boolean; onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      aria-label={label}
      className="grid size-10 place-items-center rounded-full bg-black/45 text-white hover:bg-black/60 disabled:opacity-30 sm:bg-surface sm:text-foreground sm:hover:bg-accent-soft"
    >
      <svg aria-hidden="true" viewBox="0 0 24 24" className="size-5" fill="none" stroke="currentColor" strokeWidth="2.4">
        <path d={dir === "up" ? "m5 15 7-7 7 7" : "m5 9 7 7 7-7"} />
      </svg>
    </button>
  );
}
