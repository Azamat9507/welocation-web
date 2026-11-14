"use client";

import { FOCUS_EVENT } from "./nearby-map";

// Tells the map (a separate client component) to fly to this spot and open its card
export function ShowOnMap({ id, label }: { id: number; label: string }) {
  return (
    <button
      type="button"
      onClick={() => window.dispatchEvent(new CustomEvent(FOCUS_EVENT, { detail: id }))}
      aria-label={label}
      title={label}
      className="flex size-9 shrink-0 items-center justify-center rounded-lg border border-line bg-surface text-muted hover:border-accent hover:text-accent"
    >
      <svg viewBox="0 0 24 24" aria-hidden="true" className="size-4 fill-none stroke-current stroke-2">
        <path d="M12 21s-7-6.2-7-11.5A7 7 0 0 1 19 9.5C19 14.8 12 21 12 21z" />
        <circle cx="12" cy="9.5" r="2.5" />
      </svg>
    </button>
  );
}
