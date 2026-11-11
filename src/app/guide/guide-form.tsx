"use client";

import Link from "next/link";
import { useActionState } from "react";
import { CATEGORIES, REGIONS } from "@/lib/api";
import { Rating } from "../rating";
import { askGuide } from "./actions";
import { MAX_QUESTION, type GuidePick, type GuideResponse, type GuideState } from "./types";

export function GuideForm() {
  const [state, action, pending] = useActionState<GuideState, FormData>(askGuide, {});

  return (
    <>
      <form action={action} className="mt-3 space-y-2">
        <label htmlFor="question" className="sr-only">
          질문
        </label>
        <textarea
          id="question"
          name="question"
          required
          rows={3}
          maxLength={MAX_QUESTION}
          defaultValue={state.question}
          // a new question after an answer keeps what was typed, not the first value
          key={state.question ?? ""}
          placeholder="부산에서 바다 보이는 조용한 카페 추천해 줘"
          className="block w-full resize-y rounded-md border border-line bg-surface px-3 py-2 text-base focus:border-accent focus:outline-none"
        />
        <div className="flex items-center gap-3">
          <p className="min-w-0 flex-1 text-xs text-muted">{MAX_QUESTION}자까지 · 하루 질문 수에 제한이 있어요</p>
          <button
            disabled={pending}
            className="shrink-0 rounded-md bg-accent px-4 py-2 text-sm font-semibold text-white disabled:opacity-60"
          >
            {pending ? "찾는 중…" : "물어보기"}
          </button>
        </div>
      </form>

      <div aria-live="polite" className="mt-4">
        {pending ? (
          <p className="text-sm text-muted">장소를 찾고 있어요. 30초쯤 걸릴 수 있어요.</p>
        ) : state.login ? (
          <p role="alert" className="text-sm">
            로그인이 필요해요.{" "}
            <Link href="/login?next=%2Fguide" className="font-semibold text-accent">
              로그인하고 다시 물어보기
            </Link>
          </p>
        ) : state.error ? (
          <p role="alert" className="text-sm text-red-700">
            {state.error}
          </p>
        ) : state.result ? (
          <Answer result={state.result} />
        ) : null}
      </div>
    </>
  );
}

// The model's words are rendered as React text only: never as HTML or markdown
function Answer({ result }: { result: GuideResponse }) {
  return (
    <div className="space-y-4">
      {result.answer && <p className="whitespace-pre-line text-sm leading-relaxed">{result.answer}</p>}

      {result.route && (
        <div>
          <h2 className="text-sm font-semibold">추천 동선</h2>
          <ol className="mt-1 space-y-1 text-sm">
            {result.route.map((stop) => (
              <li key={stop.spot.id} className="flex min-w-0 items-baseline gap-2">
                <span className="shrink-0 font-semibold text-accent">{stop.order}</span>
                <Link href={`/spots/${stop.spot.id}`} className="min-w-0 truncate hover:text-accent">
                  {stop.spot.name}
                </Link>
                {stop.metersFromPrevious !== null && (
                  <span className="shrink-0 text-xs text-muted">이전 장소에서 {distance(stop.metersFromPrevious)}</span>
                )}
              </li>
            ))}
          </ol>
          <p className="mt-1 text-xs text-muted">거리는 직선거리예요.</p>
        </div>
      )}

      {result.spots.length === 0 ? (
        <p className="text-sm text-muted">조건에 맞는 장소를 찾지 못했어요. 지역이나 종류를 바꿔서 물어봐 주세요.</p>
      ) : (
        <ul className="grid grid-cols-1 gap-2 sm:grid-cols-2">
          {result.spots.map((pick) => (
            <PickCard key={pick.spot.id} pick={pick} />
          ))}
        </ul>
      )}
    </div>
  );
}

function PickCard({ pick: { spot, reason } }: { pick: GuidePick }) {
  return (
    <li className="min-w-0">
      <Link
        href={`/spots/${spot.id}`}
        className="flex h-full gap-3 rounded-lg border border-line bg-surface p-2 hover:border-accent"
      >
        <div className="h-20 w-20 shrink-0 overflow-hidden rounded-md bg-accent-soft">
          {spot.thumbnailUrl && (
            // served as-is: the 공공누리 license does not allow altering the photo
            // eslint-disable-next-line @next/next/no-img-element
            <img src={spot.thumbnailUrl} alt="" loading="lazy" className="h-full w-full object-cover" />
          )}
        </div>
        <div className="min-w-0">
          <p className="text-xs text-muted">
            {CATEGORIES[spot.category] ?? spot.category} · {REGIONS[spot.region] ?? spot.region}
          </p>
          <h3 className="truncate font-semibold">{spot.name}</h3>
          {reason && <p className="line-clamp-2 text-sm">{reason}</p>}
          <Rating average={spot.averageRating} count={spot.reviewCount} />
        </div>
      </Link>
    </li>
  );
}

function distance(meters: number) {
  return meters < 1000 ? `${meters}m` : `${(meters / 1000).toFixed(1)}km`;
}
