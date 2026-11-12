"use client";

import Link from "next/link";
import { Fragment, useState, type ReactNode } from "react";

type Chip = { value: string; label: string; href: string };
type Props = {
  title: string;
  seeAll: string;
  chipsLabel: string;
  // the first chip is "all" with an empty value
  chips: Chip[];
  // cards are rendered on the server; this component only picks which ones to show
  items: { id: number; region: string; card: ReactNode }[];
};

export function StaysRail({ title, seeAll, chipsLabel, chips, items }: Props) {
  const [region, setRegion] = useState("");
  const active = chips.find((c) => c.value === region) ?? chips[0];
  const shown = items.filter((it) => !region || it.region === region).slice(0, 8);

  return (
    <section className="mt-7">
      <div className="mb-3 flex items-baseline justify-between gap-3">
        <h2 className="min-w-0 text-lg font-bold tracking-tight">{title}</h2>
        <Link href={active.href} className="shrink-0 text-sm text-muted hover:text-foreground">
          {seeAll}
        </Link>
      </div>
      {chips.length > 2 && (
        <div
          role="group"
          aria-label={chipsLabel}
          className="-mx-4 mb-3 flex gap-2 overflow-x-auto px-4 [scrollbar-width:none] md:mx-0 md:px-0 [&::-webkit-scrollbar]:hidden"
        >
          {chips.map((c) => {
            const on = c.value === region;
            return (
              <button
                key={c.value || "all"}
                type="button"
                aria-pressed={on}
                onClick={() => setRegion(c.value)}
                className={`shrink-0 rounded-full px-3.5 py-1.5 text-sm ${
                  on ? "bg-foreground font-semibold text-surface" : "bg-surface hover:bg-sand"
                }`}
              >
                {c.label}
              </button>
            );
          })}
        </div>
      )}
      <ul className="-mx-4 flex snap-x snap-mandatory scroll-px-4 gap-3 overflow-x-auto px-4 [scrollbar-width:none] md:mx-0 md:grid md:grid-cols-4 md:gap-5 md:overflow-visible md:px-0 [&::-webkit-scrollbar]:hidden md:[&>li:nth-child(n+5)]:hidden">
        {shown.map((it) => (
          <Fragment key={it.id}>{it.card}</Fragment>
        ))}
      </ul>
    </section>
  );
}
