"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { shortsEmbedUrl } from "@/lib/api";

type Props = { videoId: string; title: string; poster: string | null; playLabel: string; className?: string };

// Shows the spot's photo and a play button; YouTube's player (and its cookies) loads only after a tap
export function ShortsPlayer({ videoId, title, poster, playLabel, className = "" }: Props) {
  const [playing, setPlaying] = useState(false);
  return (
    <div className={`relative aspect-[9/16] overflow-hidden rounded-2xl bg-black ${className}`}>
      {playing ? (
        <iframe
          src={shortsEmbedUrl(videoId, { autoplay: true })}
          title={title}
          allow="autoplay; encrypted-media; picture-in-picture; fullscreen"
          allowFullScreen
          referrerPolicy="strict-origin-when-cross-origin"
          className="absolute inset-0 h-full w-full"
        />
      ) : (
        <button type="button" onClick={() => setPlaying(true)} aria-label={playLabel} className="group absolute inset-0">
          {poster && (
            // eslint-disable-next-line @next/next/no-img-element -- 공공누리 photo, shown unaltered
            <img src={poster} alt="" loading="lazy" className="h-full w-full object-cover opacity-80" />
          )}
          <PlayBadge />
        </button>
      )}
    </div>
  );
}

export function PlayBadge() {
  return (
    <span className="absolute top-1/2 left-1/2 grid size-14 -translate-x-1/2 -translate-y-1/2 place-items-center rounded-full bg-black/55 text-white group-hover:bg-accent">
      <svg aria-hidden="true" viewBox="0 0 24 24" className="ml-0.5 size-6" fill="currentColor">
        <path d="M8 5.5v13l11-6.5-11-6.5Z" />
      </svg>
    </span>
  );
}

type OverlayVideo = { videoId: string; title: string; close: string; seeAll: { href: string; label: string } };

// Full-screen player for phones. Rendered into <body> so no transformed parent can trap the fixed layer.
export function ShortsOverlay({ video, onClose }: { video: OverlayVideo; onClose: () => void }) {
  const close = useRef<HTMLButtonElement>(null);
  useEffect(() => {
    const opener = document.activeElement as HTMLElement | null;
    close.current?.focus();
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    document.addEventListener("keydown", onKey);
    document.documentElement.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.documentElement.style.overflow = "";
      opener?.focus();
    };
  }, [onClose]);

  return createPortal(
    <div role="dialog" aria-modal="true" aria-label={video.title} className="fixed inset-0 z-50 flex flex-col bg-black">
      <div className="flex shrink-0 items-center justify-between px-3 py-2">
        <Link href={video.seeAll.href} className="text-sm font-semibold text-white/90">
          {video.seeAll.label}
        </Link>
        <button
          ref={close}
          type="button"
          onClick={onClose}
          aria-label={video.close}
          className="grid size-10 place-items-center rounded-full text-white hover:bg-white/15"
        >
          <svg aria-hidden="true" viewBox="0 0 24 24" className="size-6" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
            <path d="m6 6 12 12M18 6 6 18" />
          </svg>
        </button>
      </div>
      <div className="flex min-h-0 flex-1 items-center justify-center pb-4">
        <iframe
          src={shortsEmbedUrl(video.videoId, { autoplay: true })}
          title={video.title}
          allow="autoplay; encrypted-media; picture-in-picture; fullscreen"
          allowFullScreen
          referrerPolicy="strict-origin-when-cross-origin"
          className="aspect-[9/16] h-full max-w-full"
        />
      </div>
    </div>,
    document.body,
  );
}
