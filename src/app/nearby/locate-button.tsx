"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";

// Rounded to about 100 m before it goes into the URL
const round = (v: number) => Math.round(v * 1000) / 1000;

const MESSAGES: Record<number, string> = {
  1: "위치 권한이 거부됐어요. 브라우저 설정에서 위치 접근을 허용해 주세요.",
  2: "지금은 위치를 확인할 수 없어요. 잠시 후 다시 시도해 주세요.",
  3: "위치 확인 시간이 초과됐어요. 다시 시도해 주세요.",
};

export function LocateButton({ radius, category, again }: { radius?: number; category?: string; again: boolean }) {
  const router = useRouter();
  const [locating, setLocating] = useState(false);
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const busy = locating || pending;

  function locate() {
    if (!("geolocation" in navigator)) {
      setError("이 브라우저는 위치 찾기를 지원하지 않아요.");
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
        startTransition(() => router.push(`/nearby?${p}`));
      },
      (err) => {
        setLocating(false);
        setError(MESSAGES[err.code] ?? MESSAGES[2]);
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
        {busy ? "위치 확인 중…" : again ? "현재 위치로 다시 찾기" : "내 주변 찾기"}
      </button>
      {error && (
        <p role="alert" className="mt-2 text-sm text-red-700">
          {error}
        </p>
      )}
    </div>
  );
}
