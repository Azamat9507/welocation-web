"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import type { Dictionary } from "@/lib/dictionaries";
import { href, type Locale } from "@/lib/i18n";

// Rounded to about 100 m before it goes into the URL
const round = (v: number) => Math.round(v * 1000) / 1000;

type Props = {
  radius?: number;
  category?: string;
  again: boolean;
  lang: Locale;
  labels: Dictionary["nearby"]["locate"];
};

export function LocateButton({ radius, category, again, lang, labels }: Props) {
  // GeolocationPositionError codes
  const messages: Record<number, string> = { 1: labels.denied, 2: labels.unavailable, 3: labels.timeout };
  const router = useRouter();
  const [locating, setLocating] = useState(false);
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const busy = locating || pending;

  function locate() {
    if (!("geolocation" in navigator)) {
      setError(labels.unsupported);
      return;
    }
    setError(null);
    setLocating(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setLocating(false);
        const p = new URLSearchParams({
          lat: String(round(pos.coords.latitude)),
          lng: String(round(pos.coords.longitude)),
        });
        if (radius) p.set("radius", String(radius));
        if (category) p.set("category", category);
        startTransition(() => router.push(href(lang, `/nearby?${p}`)));
      },
      (err) => {
        setLocating(false);
        setError(messages[err.code] ?? messages[2]);
      },
      { enableHighAccuracy: false, timeout: 10_000, maximumAge: 5 * 60_000 },
    );
  }

  return (
    <div className="min-w-0">
      <button
        type="button"
        onClick={locate}
        disabled={busy}
        className="rounded-full bg-accent px-4 py-1.5 text-sm font-semibold text-white disabled:opacity-60"
      >
        {busy ? labels.busy : again ? labels.again : labels.find}
      </button>
      {error && (
        <p role="alert" className="mt-2 text-sm text-red-700">
          {error}
        </p>
      )}
    </div>
  );
}
