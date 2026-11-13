"use client";

import { Fragment, useState, type ReactNode } from "react";
import { SectionHead } from "./section-head";

type Chip = { value: string; label: string; href: string };
type Props = {
  title: string;
  note?: string;
  seeAll: string;
  chipsLabel: string;
  // the first chip is "all" with an empty value
  chips: Chip[];
  // cards are rendered on the server; this component only picks which ones to show (by region, activity, ...)
  items: { id: number; key: string; card: ReactNode }[];
  className?: string;
};

// A home section whose chips filter the cards in place; "see all" follows the chosen chip
export function ChipRail({ title, note, seeAll, chipsLabel, chips, items, className = "" }: Props) {
  const [value, setValue] = useState("");
  const active = chips.find((c) => c.value === value) ?? chips[0];
  const shown = items.filter((it) => !value || it.key === value).slice(0, 8);

  return (
    <section className={className}>
      <SectionHead title={title} note={note} href={active.href} seeAll={seeAll} />
      {chips.length > 2 && (
        <div
          role="group"
          aria-label={chipsLabel}
          className="-mx-4 mb-3 flex gap-2 overflow-x-auto px-4 [scrollbar-width:none] md:mx-0 md:px-0 [&::-webkit-scrollbar]:hidden"
        >
          {chips.map((c) => {
            const on = c.value === value;
            return (
              <button
                key={c.value || "all"}
                type="button"
                aria-pressed={on}
                onClick={() => setValue(c.value)}
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
