"use client";

import { useEffect, useState } from "react";

// Shows after a screen and a half of scrolling; sits above the floating AI guide button so they never overlap
export function BackToTop({ label }: { label: string }) {
  const [shown, setShown] = useState(false);
  useEffect(() => {
    const check = () => setShown(window.scrollY > window.innerHeight * 1.5);
    check();
    window.addEventListener("scroll", check, { passive: true });
    return () => window.removeEventListener("scroll", check);
  }, []);
  return (
    <button
      type="button"
      aria-label={label}
      title={label}
      aria-hidden={!shown}
      tabIndex={shown ? 0 : -1}
      onClick={() =>
        window.scrollTo({ top: 0, behavior: window.matchMedia("(prefers-reduced-motion: reduce)").matches ? "auto" : "smooth" })
      }
      className={`fixed right-4 bottom-[calc(max(1rem,env(safe-area-inset-bottom))+3.5rem)] z-30 grid size-10 place-items-center rounded-full border border-line bg-background text-foreground shadow-md transition-opacity hover:border-accent sm:right-6 sm:bottom-[5.25rem] ${
        shown ? "opacity-100" : "pointer-events-none opacity-0"
      }`}
    >
      <svg aria-hidden="true" viewBox="0 0 24 24" className="size-5" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M12 19V5M5 12l7-7 7 7" />
      </svg>
    </button>
  );
}
