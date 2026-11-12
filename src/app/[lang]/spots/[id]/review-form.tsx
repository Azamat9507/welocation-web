"use client";

import { useActionState, useState, useTransition } from "react";
import type { Dictionary } from "@/lib/dictionaries";
import type { Locale } from "@/lib/i18n";
import { deleteReview, saveReview, type FormState } from "../../actions";

type MyReview = { id: number; rating: number; content: string };
type Props = { spotId: number; review?: MyReview; lang: Locale; t: Dictionary["review"] };

export function ReviewForm({ spotId, review, lang, t }: Props) {
  // a new number per edit session remounts the form, so old errors and typed text never come back
  const [session, setSession] = useState<number | null>(review ? null : 0);
  const [delError, setDelError] = useState<string>();
  const [deleting, startDelete] = useTransition();

  if (review && session === null) {
    return (
      <div className="mt-2 flex flex-wrap gap-3 text-sm">
        <button type="button" onClick={() => setSession(Date.now())} className="text-accent">
          {t.editMine}
        </button>
        <button
          type="button"
          disabled={deleting}
          className="text-muted hover:text-red-700"
          onClick={() =>
            startDelete(async () => {
              const r = await deleteReview(spotId, review.id, lang);
              setDelError(r.error);
            })
          }
        >
          {deleting ? t.deleting : t.delete}
        </button>
        {delError && (
          <span role="alert" className="text-red-700">
            {delError}
          </span>
        )}
      </div>
    );
  }

  return (
    <EditForm
      key={session ?? 0}
      spotId={spotId}
      review={review}
      lang={lang}
      t={t}
      onDone={review ? () => setSession(null) : undefined}
    />
  );
}

function EditForm({ spotId, review, lang, t, onDone }: Props & { onDone?: () => void }) {
  const [state, action, pending] = useActionState<FormState, FormData>(async (prev, form) => {
    const r = await saveReview(spotId, review?.id ?? null, prev, form);
    if (!r.error) onDone?.();
    return r;
  }, {});
  const v = state.values ?? {};
  const rating = v.rating ?? String(review?.rating ?? "");

  return (
    <form action={action} className="mt-2 space-y-2 rounded-lg border border-line bg-surface p-3">
      <input type="hidden" name="lang" value={lang} />
      <fieldset className="flex items-center gap-1">
        <legend className="sr-only">{t.ratingLegend}</legend>
        {[1, 2, 3, 4, 5].map((n) => (
          <label key={n} className="cursor-pointer">
            <input
              type="radio"
              name="rating"
              value={n}
              defaultChecked={rating === String(n)}
              required
              className="peer sr-only"
            />
            <span className="rounded px-1.5 py-0.5 text-sm text-muted peer-checked:bg-accent peer-checked:text-white peer-focus-visible:outline">
              {n}★
            </span>
          </label>
        ))}
      </fieldset>
      <textarea
        name="content"
        required
        maxLength={1000}
        rows={3}
        defaultValue={v.content ?? review?.content}
        placeholder={t.placeholder}
        className="w-full rounded-md border border-line px-3 py-2 text-base focus:border-accent focus:outline-none"
      />
      {state.error && (
        <p role="alert" className="text-sm text-red-700">
          {state.error}
        </p>
      )}
      <div className="flex gap-3">
        <button
          disabled={pending}
          className="rounded-md bg-accent px-3 py-1.5 text-sm font-semibold text-white disabled:opacity-60"
        >
          {pending ? t.saving : review ? t.saveEdit : t.submit}
        </button>
        {onDone && (
          <button type="button" onClick={onDone} className="text-sm text-muted">
            {t.cancel}
          </button>
        )}
      </div>
    </form>
  );
}
