"use client";

import { useState, useTransition } from "react";
import { setBookmark, setLike } from "../../actions";

type Props = { spotId: number; likeCount: number; liked: boolean | null; bookmarked: boolean | null };

// liked/bookmarked are null when the API cannot tell us yet; then the first press decides
export function Toggles({ spotId, likeCount, liked, bookmarked }: Props) {
  const [like, setLikeState] = useState({ on: liked, count: likeCount });
  const [mark, setMark] = useState(bookmarked);
  const [error, setError] = useState<string>();
  const [pending, start] = useTransition();

  const btn = (on: boolean | null) =>
    `rounded-full border px-3 py-1 text-sm disabled:opacity-60 ${
      on ? "border-accent bg-accent text-white" : "border-line bg-white text-foreground hover:border-accent"
    }`;

  return (
    <div className="mt-3">
      <div className="flex flex-wrap gap-2">
        <button
          type="button"
          disabled={pending}
          aria-pressed={like.on ?? undefined}
          className={btn(like.on)}
          onClick={() =>
            start(async () => {
              const r = await setLike(spotId, !like.on);
              setError(r.error);
              setLikeState({ on: r.on, count: r.count ?? like.count });
            })
          }
        >
          ♥ {like.on ? "좋아요 취소" : "좋아요"} {like.count}
        </button>
        <button
          type="button"
          disabled={pending}
          aria-pressed={mark ?? undefined}
          className={btn(mark)}
          onClick={() =>
            start(async () => {
              const r = await setBookmark(spotId, !mark);
              setError(r.error);
              setMark(r.on);
            })
          }
        >
          {mark ? "북마크 해제" : "북마크"}
        </button>
      </div>
      {error && (
        <p role="alert" className="mt-1 text-sm text-red-700">
          {error}
        </p>
      )}
    </div>
  );
}
