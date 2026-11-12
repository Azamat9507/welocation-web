"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useLayoutEffect, useRef, type FormEvent, type KeyboardEvent, type ReactNode } from "react";
import { fill, href, splitLocale, type Locale } from "@/lib/i18n";
import { MAX_QUESTION, type GuidePick, type GuideResponse } from "../guide/types";
import { useGuideChat, type GuideLabels, type Message } from "./provider";

type Props = {
  // the panel has a close button; the full-width guide page does not
  onClose?: () => void;
  onLeave?: () => void;
};

export function Conversation({ onClose, onLeave }: Props) {
  const { lang, labels, messages, pending, draft, setDraft, send, reset } = useGuideChat();
  const t = labels.panel;
  const path = usePathname();
  const rest = splitLocale(path).rest;
  const loginHref =
    rest === "/login" || rest === "/signup" ? `/${lang}/login` : `/${lang}/login?next=${encodeURIComponent(path)}`;

  const listRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    const list = listRef.current;
    if (list) list.scrollTop = list.scrollHeight;
  }, [messages.length, pending]);

  // grows with the text up to the CSS max-height (three lines), then scrolls
  useLayoutEffect(() => {
    const el = inputRef.current;
    if (!el) return;
    el.style.height = "auto";
    el.style.height = `${el.scrollHeight}px`;
  }, [draft]);

  function submit(e?: FormEvent) {
    e?.preventDefault();
    if (!pending) send(draft);
  }

  function onKeyDown(e: KeyboardEvent<HTMLTextAreaElement>) {
    // isComposing: Enter that finishes a Korean syllable must not send the half-typed question
    if (e.key === "Enter" && !e.shiftKey && !e.nativeEvent.isComposing) {
      e.preventDefault();
      submit();
    }
  }

  const iconButton =
    "flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-lg text-muted hover:bg-surface hover:text-foreground disabled:opacity-40";

  return (
    <>
      <div className="flex items-center gap-3 border-b border-line px-4 py-3">
        <Avatar />
        <div className="min-w-0 flex-1">
          <p className="font-semibold leading-tight">{t.title}</p>
          <p className="mt-0.5 flex items-center gap-1.5 text-xs text-muted">
            <span aria-hidden="true" className="h-2 w-2 shrink-0 rounded-full bg-emerald-500" />
            <span className="truncate">{t.subtitle}</span>
          </p>
        </div>
        <button
          type="button"
          onClick={reset}
          disabled={pending || messages.length === 0}
          aria-label={t.reset}
          title={t.reset}
          className={iconButton}
        >
          <span aria-hidden="true">↻</span>
        </button>
        {onClose && (
          <button type="button" onClick={onClose} aria-label={t.close} title={t.close} className={iconButton}>
            <span aria-hidden="true">✕</span>
          </button>
        )}
      </div>

      <div ref={listRef} aria-live="polite" className="min-h-0 flex-1 space-y-4 overflow-y-auto px-4 py-4">
        {messages.length === 0 && (
          <GuideRow>
            <p>{t.welcome}</p>
            <p className="mt-1 text-xs text-muted">{t.independent}</p>
          </GuideRow>
        )}
        {messages.map((m) => (
          <MessageView key={m.id} message={m} lang={lang} labels={labels} loginHref={loginHref} onLeave={onLeave} />
        ))}
        {pending && (
          <GuideRow>
            <p className="animate-pulse font-medium">{t.thinking}</p>
            <p className="mt-0.5 text-xs text-muted">{labels.form.waiting}</p>
          </GuideRow>
        )}
      </div>

      <form onSubmit={submit} className="border-t border-line p-3">
        <div className="flex items-end gap-2 rounded-2xl border border-line bg-surface py-1.5 pr-1.5 pl-3 focus-within:border-accent">
          <label htmlFor="guide-question" className="sr-only">
            {labels.form.questionLabel}
          </label>
          <textarea
            ref={inputRef}
            id="guide-question"
            rows={1}
            maxLength={MAX_QUESTION}
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            onKeyDown={onKeyDown}
            placeholder={labels.form.placeholder}
            className="block max-h-[5.5rem] min-w-0 flex-1 resize-none bg-transparent py-1.5 text-base leading-6 outline-none placeholder:text-muted sm:max-h-[4.75rem] sm:text-sm sm:leading-5"
          />
          <button
            type="submit"
            disabled={pending || !draft.trim()}
            aria-label={t.send}
            title={t.send}
            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-accent text-lg font-bold text-white disabled:opacity-40"
          >
            <span aria-hidden="true">↑</span>
          </button>
        </div>
        <p className="mt-1.5 px-1 text-[11px] text-muted">{fill(labels.form.limits, { n: MAX_QUESTION })}</p>
      </form>
    </>
  );
}

function Avatar({ small = false }: { small?: boolean }) {
  return (
    <span
      aria-hidden="true"
      className={`flex shrink-0 items-center justify-center rounded-full bg-accent-soft ${small ? "h-7 w-7 text-sm" : "h-9 w-9"}`}
    >
      ✨
    </span>
  );
}

function GuideRow({ children }: { children: ReactNode }) {
  return (
    <div className="flex gap-2">
      <Avatar small />
      <div className="min-w-0 flex-1 pt-0.5 text-sm leading-relaxed">{children}</div>
    </div>
  );
}

type ViewProps = { lang: Locale; labels: GuideLabels; onLeave?: () => void };

function MessageView({ message, loginHref, ...rest }: ViewProps & { message: Message; loginHref: string }) {
  if (message.from === "user") {
    return (
      <p className="ml-auto w-fit max-w-[85%] rounded-2xl rounded-br-md bg-foreground px-3.5 py-2 text-sm whitespace-pre-line break-words text-white">
        {message.text}
      </p>
    );
  }
  const { reply } = message;
  const t = rest.labels.form;
  return (
    <GuideRow>
      {reply.login ? (
        <p>
          {t.loginNeeded}{" "}
          <Link href={loginHref} onClick={rest.onLeave} className="font-semibold text-accent">
            {t.loginAndAsk}
          </Link>
        </p>
      ) : reply.error ? (
        <p className="text-muted">{reply.error}</p>
      ) : reply.result ? (
        <Answer result={reply.result} {...rest} />
      ) : null}
    </GuideRow>
  );
}

// The model's words are rendered as React text only: never as HTML or markdown
function Answer({ result, lang, labels, onLeave }: ViewProps & { result: GuideResponse }) {
  const t = labels.form;
  const hasDistance = result.route?.some((s) => s.metersFromPrevious !== null);
  return (
    <div className="space-y-3">
      {result.answer && <p className="whitespace-pre-line">{result.answer}</p>}

      {result.route && (
        <div>
          <p className="text-xs font-semibold">{t.route}</p>
          <ol className="mt-1 flex flex-wrap items-center gap-x-1.5 gap-y-1">
            {result.route.map((stop, i) => (
              <li key={stop.spot.id} className="flex max-w-full min-w-0 items-center gap-1.5">
                {i > 0 && (
                  <span aria-hidden="true" className="text-muted">
                    →
                  </span>
                )}
                <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-accent text-[11px] font-semibold text-white">
                  {stop.order}
                </span>
                <Link
                  href={href(lang, `/spots/${stop.spot.id}`)}
                  onClick={onLeave}
                  className="min-w-0 truncate hover:text-accent"
                >
                  {stop.spot.name}
                </Link>
                {stop.metersFromPrevious !== null && (
                  <span className="shrink-0 text-xs text-muted" title={fill(t.fromPrevious, { d: distance(stop.metersFromPrevious) })}>
                    {distance(stop.metersFromPrevious)}
                  </span>
                )}
              </li>
            ))}
          </ol>
          {hasDistance && <p className="mt-1 text-xs text-muted">{t.straightLine}</p>}
        </div>
      )}

      {result.spots.length === 0 ? (
        <p className="text-muted">{t.noPicks}</p>
      ) : (
        <ul className="space-y-2">
          {result.spots.map((pick) => (
            <PickCard key={pick.spot.id} pick={pick} lang={lang} labels={labels} onLeave={onLeave} />
          ))}
        </ul>
      )}
    </div>
  );
}

function PickCard({ pick: { spot, reason }, lang, labels, onLeave }: ViewProps & { pick: GuidePick }) {
  return (
    <li>
      <Link
        href={href(lang, `/spots/${spot.id}`)}
        onClick={onLeave}
        className="flex items-center gap-3 rounded-2xl border border-line bg-background p-2 hover:border-accent"
      >
        <div className="h-14 w-14 shrink-0 overflow-hidden rounded-xl bg-accent-soft">
          {spot.thumbnailUrl && (
            // served as-is: the 공공누리 license does not allow altering the photo
            // eslint-disable-next-line @next/next/no-img-element
            <img src={spot.thumbnailUrl} alt="" loading="lazy" className="h-full w-full object-cover" />
          )}
        </div>
        <div className="min-w-0 flex-1">
          <p className="truncate text-xs text-muted">
            {labels.categories[spot.category] ?? spot.category} · {labels.regions[spot.region] ?? spot.region}
          </p>
          <p className="truncate text-sm font-semibold">{spot.name}</p>
          {reason && <p className="line-clamp-2 text-xs text-muted">{reason}</p>}
        </div>
        <span aria-hidden="true" className="shrink-0 pr-1 text-muted">
          →
        </span>
      </Link>
    </li>
  );
}

function distance(meters: number) {
  return meters < 1000 ? `${meters}m` : `${(meters / 1000).toFixed(1)}km`;
}
