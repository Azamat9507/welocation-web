"use client";

import Link from "next/link";
import { useState } from "react";

type Panel = { value: string; label: string; links: { href: string; label: string }[] };

// Region tabs with a grid of links under each: a way around the site for people and for search engines.
// Every panel is in the HTML; the tabs only choose which one shows.
export function PopularRegions({ title, tabsLabel, panels }: { title: string; tabsLabel: string; panels: Panel[] }) {
  const [current, setCurrent] = useState(panels[0]?.value);
  return (
    <section aria-labelledby="popular-regions" className="mt-14 border-t border-line pt-8 [content-visibility:auto] [contain-intrinsic-size:auto_320px] sm:mt-16">
      <h2 id="popular-regions" className="text-lg font-bold tracking-tight sm:text-xl">
        {title}
      </h2>
      <div
        role="tablist"
        aria-label={tabsLabel}
        className="-mx-4 mt-3 flex gap-5 overflow-x-auto border-b border-line px-4 [scrollbar-width:none] md:mx-0 md:px-0 [&::-webkit-scrollbar]:hidden"
      >
        {panels.map((p) => {
          const on = p.value === current;
          return (
            <button
              key={p.value}
              type="button"
              role="tab"
              id={`region-tab-${p.value}`}
              aria-selected={on}
              aria-controls={`region-panel-${p.value}`}
              onClick={() => setCurrent(p.value)}
              className={`shrink-0 border-b-2 pb-2 text-sm ${on ? "border-foreground font-semibold" : "border-transparent text-muted hover:text-foreground"}`}
            >
              {p.label}
            </button>
          );
        })}
      </div>
      {panels.map((p) => (
        <ul
          key={p.value}
          role="tabpanel"
          id={`region-panel-${p.value}`}
          aria-labelledby={`region-tab-${p.value}`}
          hidden={p.value !== current}
          className="mt-4 grid grid-cols-2 gap-x-4 gap-y-2.5 text-sm sm:grid-cols-3 md:grid-cols-5"
        >
          {p.links.map((l) => (
            <li key={l.href} className="min-w-0 truncate">
              <Link href={l.href} className="text-muted hover:text-foreground hover:underline">
                {l.label}
              </Link>
            </li>
          ))}
        </ul>
      ))}
    </section>
  );
}
