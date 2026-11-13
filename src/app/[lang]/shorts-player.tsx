"use client";

import { useState } from "react";
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
