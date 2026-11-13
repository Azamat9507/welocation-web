"use client";

import { useActionState, useTransition, useState } from "react";
import type { Locale } from "@/lib/i18n";
import { removeShorts, saveShorts, type ShortsFormState } from "./actions";

type Labels = { urlLabel: string; urlPlaceholder: string; save: string; remove: string; saved: string };

export function ShortsForm({ spotId, current, lang, labels }: { spotId: number; current: string | null; lang: Locale; labels: Labels }) {
  const [state, action, pending] = useActionState<ShortsFormState, FormData>(saveShorts.bind(null, spotId), {});
  const [removing, startRemove] = useTransition();
  const [removeError, setRemoveError] = useState<string>();
  const value = state.url ?? (current ? `https://youtube.com/shorts/${current}` : "");
  const error = state.error ?? removeError;

  return (
    <form action={action} className="mt-2 flex flex-wrap items-center gap-2">
      <input type="hidden" name="lang" value={lang} />
      <input
        key={value}
        name="url"
        type="text"
        inputMode="url"
        defaultValue={value}
        aria-label={labels.urlLabel}
        placeholder={labels.urlPlaceholder}
        maxLength={200}
        required
        className="min-w-0 flex-1 rounded-lg border border-line bg-background px-2.5 py-1.5 text-sm"
      />
      <button disabled={pending} className="rounded-lg bg-accent px-3 py-1.5 text-sm font-semibold text-white disabled:opacity-50">
        {labels.save}
      </button>
      {current && (
        <button
          type="button"
          disabled={removing}
          onClick={() =>
            startRemove(async () => {
              const r = await removeShorts(spotId, lang);
              setRemoveError(r.error);
            })
          }
          className="rounded-lg border border-line px-3 py-1.5 text-sm text-muted hover:text-red-700 disabled:opacity-50"
        >
          {labels.remove}
        </button>
      )}
      {error && (
        <p role="alert" className="w-full text-xs text-red-700">
          {error}
        </p>
      )}
      {state.ok && !error && (
        <p role="status" className="w-full text-xs text-accent">
          {labels.saved}
        </p>
      )}
    </form>
  );
}
