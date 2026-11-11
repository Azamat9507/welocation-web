"use client";

export default function Error({ reset }: { error: Error; reset: () => void }) {
  return (
    <div className="py-12 text-center">
      <p className="font-semibold">지금은 장소 정보를 불러올 수 없어요.</p>
      <button onClick={reset} className="mt-2 text-sm text-accent">
        다시 시도
      </button>
    </div>
  );
}
