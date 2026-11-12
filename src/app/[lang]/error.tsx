"use client";

import { useErrorStrings } from "./error-strings";

export default function Error({ reset }: { error: Error; reset: () => void }) {
  const t = useErrorStrings();
  return (
    <div className="py-12 text-center">
      <p className="font-semibold">{t.message}</p>
      <button onClick={reset} className="mt-2 text-sm text-accent">
        {t.retry}
      </button>
    </div>
  );
}
