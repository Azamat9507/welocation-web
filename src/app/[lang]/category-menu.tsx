"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useId, useRef, useState } from "react";
import { href, type Locale } from "@/lib/i18n";

type Item = { href: string; label: string };
export type MenuColumn = { title: string; items: Item[] };
type Labels = { open: string; close: string };

// "전체 카테고리": opens on click (not hover). Wide screens get a panel under the header, phones a full-screen sheet.
export function CategoryMenu({ lang, columns, labels }: { lang: Locale; columns: MenuColumn[]; labels: Labels }) {
  const path = usePathname();
  // the path the menu was opened on: following a link changes the path, so the new page opens with the menu shut
  const [openOn, setOpenOn] = useState<string | null>(null);
  const open = openOn === path;
  const setOpen = (v: boolean | ((o: boolean) => boolean)) =>
    setOpenOn((typeof v === "function" ? v(open) : v) ? path : null);
  const button = useRef<HTMLButtonElement>(null);
  const panel = useRef<HTMLDivElement>(null);
  const id = useId();

  useEffect(() => {
    if (!open) return;
    const el = panel.current;
    el?.querySelector<HTMLElement>("a, button")?.focus();
    const close = () => {
      setOpenOn(null);
      button.current?.focus();
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") return close();
      if (e.key !== "Tab" || !el) return;
      // keep Tab inside the menu while it is open
      const items = Array.from(el.querySelectorAll<HTMLElement>("a, button"));
      const first = items[0];
      const last = items[items.length - 1];
      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault();
        first.focus();
      }
    };
    const onDown = (e: PointerEvent) => {
      const t = e.target as Node;
      if (!el?.contains(t) && !button.current?.contains(t)) setOpenOn(null);
    };
    document.addEventListener("keydown", onKey);
    document.addEventListener("pointerdown", onDown);
    // the phone sheet covers the page; stop the page scrolling behind it
    const small = window.matchMedia("(max-width: 639px)").matches;
    if (small) document.documentElement.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.removeEventListener("pointerdown", onDown);
      document.documentElement.style.overflow = "";
    };
  }, [open]);

  return (
    <>
      <button
        ref={button}
        type="button"
        aria-expanded={open}
        aria-controls={id}
        onClick={() => setOpen((o) => !o)}
        className={`flex shrink-0 items-center gap-1.5 py-2.5 text-[15px] font-semibold ${open ? "text-accent" : "text-foreground hover:text-accent"}`}
      >
        <svg aria-hidden="true" viewBox="0 0 24 24" className="size-[18px]" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
          {open ? <path d="m6 6 12 12M18 6 6 18" /> : <path d="M4 6h16M4 12h16M4 18h16" />}
        </svg>
        {labels.open}
      </button>

      {open && (
        <div
          ref={panel}
          id={id}
          role="dialog"
          aria-modal="true"
          aria-label={labels.open}
          className="fixed inset-0 z-50 overflow-y-auto bg-background sm:absolute sm:inset-x-0 sm:top-full sm:bottom-auto sm:max-h-[70vh] sm:border-b sm:border-line sm:shadow-lg"
        >
          <div className="mx-auto max-w-5xl px-4 pt-3 pb-5 sm:pt-5 sm:pb-7">
            <div className="flex items-center justify-between sm:hidden">
              <p className="text-base font-bold">{labels.open}</p>
              <button
                type="button"
                onClick={() => {
                  setOpen(false);
                  button.current?.focus();
                }}
                aria-label={labels.close}
                className="grid size-9 place-items-center rounded-full hover:bg-surface"
              >
                <svg aria-hidden="true" viewBox="0 0 24 24" className="size-5" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                  <path d="m6 6 12 12M18 6 6 18" />
                </svg>
              </button>
            </div>
            <div className="mt-2 grid gap-x-8 gap-y-4 sm:mt-0 sm:grid-cols-[1fr_2fr_1fr_1fr]">
              {columns.map((c) => (
                <section key={c.title}>
                  <h2 className="border-b border-line pb-1.5 text-xs font-bold text-muted sm:text-sm">{c.title}</h2>
                  <ul className={`mt-1.5 grid gap-x-3 ${c.items.length > 8 ? "grid-cols-3 sm:grid-cols-3" : "grid-cols-3 sm:grid-cols-1"}`}>
                    {c.items.map((i) => (
                      <li key={i.href}>
                        <Link
                          href={href(lang, i.href)}
                          onClick={() => setOpen(false)}
                          className="block rounded-md py-1.5 text-sm leading-snug text-foreground hover:text-accent"
                        >
                          {i.label}
                        </Link>
                      </li>
                    ))}
                  </ul>
                </section>
              ))}
            </div>
          </div>
        </div>
      )}
    </>
  );
}

// static stand-in while the path is read (usePathname needs a Suspense boundary under Cache Components)
export function CategoryMenuFallback({ label }: { label: string }) {
  return (
    <button type="button" aria-expanded={false} className="flex shrink-0 items-center gap-1.5 py-2.5 text-[15px] font-semibold text-foreground">
      <svg aria-hidden="true" viewBox="0 0 24 24" className="size-[18px]" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
        <path d="M4 6h16M4 12h16M4 18h16" />
      </svg>
      {label}
    </button>
  );
}
