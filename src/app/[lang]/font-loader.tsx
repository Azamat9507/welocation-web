"use client";

import { useEffect } from "react";

// Pretendard's @font-face rules arrive in a stylesheet that starts as media="print", so it never holds up
// the first paint; once the page is interactive it is switched on and the text swaps to Pretendard.
// With the rules in the main CSS, every Hangul subset the first screen needs sat in front of the first paint
// (Lighthouse mobile FCP 0.9 s -> 2.3 s).
export function FontLoader() {
  useEffect(() => {
    const link = document.getElementById("pretendard") as HTMLLinkElement | null;
    if (link) link.media = "all";
  }, []);
  return null;
}
