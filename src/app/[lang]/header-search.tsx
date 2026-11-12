"use client";

import { useRouter } from "next/navigation";
import { useId, useState, type FocusEvent, type FormEvent, type KeyboardEvent } from "react";
import { MAX_QUESTION } from "./guide/types";
import { useGuidePanel } from "./guide-panel/context";
import { SearchIcon } from "./icons";

type Props = {
  lang: string;
  // the list page only reads this many characters of ?q=
  searchMax: number;
  t: {
    searchPlaceholder: string;
    searchLabel: string;
    searchButton: string;
    askAi: string;
    searchFor: string;
    askAiFor: string;
  };
};

type Row = "search" | "ai";

// A question reads like a sentence; a place name or address usually doesn't
const looksLikeQuestion = (s: string) => s.split(/\s+/).length >= 3 || s.length > 12 || /[?？]$/.test(s);

// Still a plain GET form, so search works before hydration. The input takes a full AI question
// (300 chars); the normal search only sends the first searchMax characters.
export function HeaderSearch({ lang, searchMax, t }: Props) {
  const router = useRouter();
  const guide = useGuidePanel();
  const id = useId();
  const [text, setText] = useState("");
  const [expanded, setExpanded] = useState(false);
  const [active, setActive] = useState(0);

  const trimmed = text.trim();
  const rows: Row[] = looksLikeQuestion(trimmed) ? ["ai", "search"] : ["search", "ai"];
  const showList = expanded && trimmed !== "";
  const q = trimmed.slice(0, searchMax).trim();

  const search = () => {
    setExpanded(false);
    router.push(q ? `/${lang}?q=${encodeURIComponent(q)}` : `/${lang}`);
  };
  const ask = () => {
    setExpanded(false);
    if (trimmed) guide.ask(trimmed);
    else guide.open();
  };
  const pick = (row: Row) => (row === "ai" ? ask() : search());

  const onSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (showList) pick(rows[active]);
    else search();
  };

  const onKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Escape") {
      if (showList) e.preventDefault();
      setExpanded(false);
    } else if (e.key === "ArrowDown" || e.key === "ArrowUp") {
      if (trimmed === "") return;
      e.preventDefault();
      if (!showList) {
        setExpanded(true);
        setActive(0);
        return;
      }
      setActive((a) => (a + (e.key === "ArrowDown" ? 1 : rows.length - 1)) % rows.length);
    }
  };

  // Close when focus leaves the whole box (click outside, Tab away)
  const onBlur = (e: FocusEvent<HTMLFormElement>) => {
    if (!e.currentTarget.contains(e.relatedTarget as Node | null)) setExpanded(false);
  };

  const optionId = (row: Row) => `${id}-${row}`;
  const fill = (template: string, value: string) => template.replace("{q}", value);

  return (
    <form
      action={`/${lang}`}
      role="search"
      onSubmit={onSubmit}
      onBlur={onBlur}
      className="relative order-last flex h-11 w-full items-center rounded-full border-2 border-accent bg-background pr-1 pl-4 sm:order-none sm:h-12 sm:flex-1"
    >
      <input
        type="search"
        name="q"
        maxLength={MAX_QUESTION}
        value={text}
        onChange={(e) => {
          setText(e.target.value);
          setExpanded(true);
          setActive(0);
        }}
        onFocus={() => setExpanded(true)}
        onKeyDown={onKeyDown}
        placeholder={t.searchPlaceholder}
        aria-label={t.searchLabel}
        role="combobox"
        aria-autocomplete="none"
        aria-expanded={showList}
        aria-controls={`${id}-list`}
        aria-activedescendant={showList ? optionId(rows[active]) : undefined}
        autoComplete="off"
        className="h-full min-w-0 flex-1 bg-transparent text-base outline-none placeholder:text-muted"
      />
      <button
        type="button"
        onClick={ask}
        aria-label={t.askAi}
        title={t.askAi}
        className="mr-1 flex h-8 shrink-0 items-center gap-1 rounded-full bg-accent-soft px-2.5 text-sm font-semibold text-accent sm:h-9 sm:px-3"
      >
        <span aria-hidden="true">✨</span>
        <span aria-hidden="true" className="hidden sm:inline">
          AI
        </span>
      </button>
      <button
        type="submit"
        aria-label={t.searchButton}
        className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-accent text-white sm:h-10 sm:w-10"
      >
        <SearchIcon className="h-5 w-5" />
      </button>
      <ul
        id={`${id}-list`}
        role="listbox"
        aria-label={t.searchLabel}
        hidden={!showList}
        className="absolute top-full right-0 left-0 z-50 mt-1.5 overflow-hidden rounded-2xl border border-line bg-background py-1"
      >
        {rows.map((row, i) => (
          <li
            key={row}
            id={optionId(row)}
            role="option"
            aria-selected={i === active}
            // keep focus in the input so the list doesn't close before the click lands
            onMouseDown={(e) => e.preventDefault()}
            onMouseEnter={() => setActive(i)}
            onClick={() => pick(row)}
            className={`flex cursor-pointer items-center gap-2.5 px-4 py-2.5 text-sm ${i === active ? "bg-accent-soft text-accent" : ""}`}
          >
            {row === "ai" ? (
              <span aria-hidden="true" className="w-5 shrink-0 text-center">
                ✨
              </span>
            ) : (
              <SearchIcon className="h-5 w-5 shrink-0" />
            )}
            <span className="min-w-0 truncate">{row === "ai" ? fill(t.askAiFor, trimmed) : fill(t.searchFor, q)}</span>
          </li>
        ))}
      </ul>
    </form>
  );
}
